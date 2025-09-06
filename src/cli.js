#!/usr/bin/env node

/**
 * 인터랙티브 데이터 랭글링 튜터 CLI
 * Gemini 2.5 Pro 기반 AI 튜터 통합
 */

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

const GeminiTutorService = require('./services/gemini-api');
const ProgressTracker = require('./services/progress-tracker');
const { TUTOR_CONFIG, estimateMonthlyUsage } = require('./config/tutor-config');

class InteractiveTutor {
  constructor() {
    this.workspaceDir = path.join(process.cwd(), 'pbl-workspace');
    this.progressTracker = new ProgressTracker(this.workspaceDir);
    this.geminiService = null;
    this.currentProblem = null;
    
    this.initializeAPI();
  }

  async initializeAPI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log(chalk.yellow('\n⚠️  GEMINI_API_KEY 환경변수가 설정되지 않았습니다.'));
      console.log(chalk.cyan('다음 명령으로 API 키를 설정하세요:'));
      console.log(chalk.white('export GEMINI_API_KEY="your-api-key"'));
      console.log(chalk.gray('\n무료 API 키는 https://ai.google.dev/gemini-api 에서 발급받을 수 있습니다.\n'));
      return;
    }
    
    try {
      this.geminiService = new GeminiTutorService(apiKey);
      console.log(chalk.green('✅ Gemini AI 튜터가 준비되었습니다!'));
    } catch (error) {
      console.log(chalk.red('❌ API 키 인증에 실패했습니다:'), error.message);
    }
  }

  /**
   * 메인 메뉴 표시
   */
  async showMainMenu() {
    console.clear();
    console.log(chalk.bold.blue('\n🎓 데이터 랭글링 마스터 - AI 튜터'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const progress = await this.progressTracker.getProgress();
    console.log(chalk.cyan(`📊 진행률: ${progress.progressPercentage}% (${progress.completedProblems}/${progress.totalProblems}문제)`));
    console.log(chalk.yellow(`⭐ 평균 점수: ${progress.averageScore}점`));
    
    if (progress.recentScores.length > 0) {
      const trend = progress.trend === 'improving' ? '📈 상승' : 
                   progress.trend === 'declining' ? '📉 하락' : '➖ 안정';
      console.log(chalk.magenta(`${trend} 트렌드`));
    }
    
    const choices = [
      { name: '📚 문제 풀기', value: 'solve' },
      { name: '📊 진도 확인', value: 'progress' },
      { name: '💡 AI 튜터에게 질문하기', value: 'ask' },
      { name: '🎯 맞춤 추천 받기', value: 'recommend' },
      { name: '⚙️  설정', value: 'settings' },
      { name: '❓ 도움말', value: 'help' },
      { name: '🚪 종료', value: 'exit' }
    ];

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: '무엇을 하시겠습니까?',
      choices
    }]);

    switch (action) {
      case 'solve':
        await this.selectProblem();
        break;
      case 'progress':
        await this.showProgress();
        break;
      case 'ask':
        await this.askTutor();
        break;
      case 'recommend':
        await this.showRecommendations();
        break;
      case 'settings':
        await this.showSettings();
        break;
      case 'help':
        await this.showHelp();
        break;
      case 'exit':
        console.log(chalk.green('\n👋 학습을 마칩니다. 좋은 하루 되세요!'));
        process.exit(0);
    }
  }

  /**
   * 문제 선택 메뉴
   */
  async selectProblem() {
    const parts = await this.getAvailableParts();
    
    const { selectedPart } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedPart',
      message: '어떤 파트를 공부하시겠습니까?',
      choices: [
        ...parts.map(part => ({ name: part.name, value: part.path })),
        { name: '🔙 메인 메뉴로', value: 'back' }
      ]
    }]);

    if (selectedPart === 'back') {
      await this.showMainMenu();
      return;
    }

    await this.selectProblemFromPart(selectedPart);
  }

  /**
   * 특정 파트의 문제 선택
   */
  async selectProblemFromPart(partPath) {
    const problems = await this.getProblemsFromPart(partPath);
    
    const choices = [];
    for (const problem of problems) {
      const history = await this.progressTracker.getProblemHistory(problem.id);
      let status = '';
      
      if (history) {
        if (history.bestScore >= 70) {
          status = chalk.green('✅');
        } else {
          status = chalk.yellow(`🔄 ${history.totalAttempts}회`);
        }
      } else {
        status = chalk.gray('⏳');
      }
      
      choices.push({
        name: `${status} ${problem.title}`,
        value: problem
      });
    }
    
    choices.push({ name: '🔙 파트 선택으로', value: 'back' });

    const { selectedProblem } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedProblem',
      message: '풀고 싶은 문제를 선택하세요:',
      choices
    }]);

    if (selectedProblem === 'back') {
      await this.selectProblem();
      return;
    }

    await this.solveProblem(selectedProblem);
  }

  /**
   * 문제 해결 인터페이스
   */
  async solveProblem(problem) {
    this.currentProblem = problem;
    console.clear();
    
    console.log(chalk.bold.blue(`\n📋 ${problem.title}`));
    console.log(chalk.gray('─'.repeat(50)));
    
    // 문제 설명 표시
    console.log(chalk.white(problem.description));
    
    // 이전 시도 이력 표시
    const history = await this.progressTracker.getProblemHistory(problem.id);
    if (history) {
      console.log(chalk.cyan(`\n📈 이전 기록: 최고 점수 ${history.bestScore}점 (${history.totalAttempts}회 시도)`));
      if (history.improvement > 0) {
        console.log(chalk.green(`👍 지난번보다 ${history.improvement}점 향상!`));
      }
    }

    const choices = [
      { name: '💡 힌트 받기', value: 'hint' },
      { name: '✏️  솔루션 작성', value: 'solve' },
      { name: '📊 이전 시도 보기', value: 'history' },
      { name: '🔙 문제 목록으로', value: 'back' }
    ];

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: '어떻게 진행하시겠습니까?',
      choices
    }]);

    switch (action) {
      case 'hint':
        await this.getHint(problem);
        break;
      case 'solve':
        await this.submitSolution(problem);
        break;
      case 'history':
        await this.showProblemHistory(problem);
        break;
      case 'back':
        await this.selectProblemFromPart(problem.partPath);
        break;
    }
  }

  /**
   * 힌트 요청
   */
  async getHint(problem) {
    if (!this.geminiService) {
      console.log(chalk.red('\n❌ AI 튜터를 사용하려면 GEMINI_API_KEY를 설정해주세요.'));
      await this.waitForKeyPress();
      await this.solveProblem(problem);
      return;
    }

    const spinner = ora('AI 튜터가 힌트를 준비 중입니다...').start();
    
    const userData = await this.progressTracker.getProgress();
    const result = await this.geminiService.getHint(problem.description, userData.userData);
    
    spinner.stop();
    
    if (result.success) {
      console.log(chalk.yellow('\n💡 AI 튜터의 힌트:'));
      console.log(chalk.white(result.hint));
      console.log(chalk.gray(`\n(토큰 사용량: ${result.tokensUsed})`));
    } else {
      console.log(chalk.red('\n❌ 힌트를 가져오는데 실패했습니다:'), result.error);
    }
    
    await this.waitForKeyPress();
    await this.solveProblem(problem);
  }

  /**
   * 솔루션 제출
   */
  async submitSolution(problem) {
    await this.interactiveShell(problem);
  }

  /**
   * 인터랙티브 셸 모드
   */
  async interactiveShell(problem) {
    console.clear();
    console.log(chalk.bold.blue(`\n💻 인터랙티브 셸 - ${problem.title}`));
    console.log(chalk.gray('─'.repeat(50)));
    
    // 문제 설명 표시
    await this.displayProblemDescription(problem);
    
    console.log(chalk.white('\n셸에서 명령어를 테스트해보세요.'));
    console.log(chalk.gray('테스트 데이터 경로: ' + this.getTestDataPath(problem)));
    console.log(chalk.gray('작업 디렉토리: ' + this.workspaceDir));
    
    // Cheatsheet 표시
    this.displayCheatsheet();
    console.log(chalk.yellow('─'.repeat(50)));
    
    const commandHistory = [];
    let currentSolution = '';
    
    while (true) {
      const { command } = await inquirer.prompt([{
        type: 'input',
        name: 'command',
        message: chalk.green('shell>'),
        prefix: ''
      }]);
      
      if (command.trim() === '') continue;
      
      // submit 명령어 처리
      if (command.trim().toLowerCase() === 'submit') {
        if (commandHistory.length === 0) {
          console.log(chalk.red('❌ 실행한 명령어가 없습니다.'));
          continue;
        }
        
        const { confirmSubmit } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirmSubmit',
          message: `${commandHistory.length}개의 명령어를 솔루션으로 제출하시겠습니까?`,
          default: false
        }]);
        
        if (confirmSubmit) {
          currentSolution = commandHistory.join('\n');
          console.log(chalk.green('\n✅ 솔루션이 제출되었습니다!'));
          await this.evaluateSolution(problem, currentSolution);
          return;
        }
        continue;
      }
      
      // exit 명령어 처리
      if (command.trim().toLowerCase() === 'exit') {
        const { saveWork } = await inquirer.prompt([{
          type: 'confirm',
          name: 'saveWork',
          message: '작업 내용을 저장하고 나가시겠습니까?',
          default: false
        }]);
        
        if (saveWork && commandHistory.length > 0) {
          currentSolution = commandHistory.join('\n');
          await this.evaluateSolution(problem, currentSolution);
          return;
        } else {
          await this.solveProblem(problem);
          return;
        }
      }
      
      // help 명령어 처리
      if (command.trim().toLowerCase() === 'help') {
        this.displayCheatsheet();
        continue;
      }
      
      // problem 명령어 처리 (문제 재표시)
      if (command.trim().toLowerCase() === 'problem') {
        await this.displayProblemDescription(problem);
        continue;
      }
      
      // history 명령어 처리
      if (command.trim().toLowerCase() === 'history') {
        if (commandHistory.length === 0) {
          console.log(chalk.gray('실행한 명령어가 없습니다.'));
        } else {
          console.log(chalk.cyan('\n실행한 명령어 목록:'));
          commandHistory.forEach((cmd, index) => {
            console.log(chalk.white(`${index + 1}. ${cmd}`));
          });
        }
        continue;
      }
      
      // clear 명령어 처리
      if (command.trim().toLowerCase() === 'clear') {
        const { confirmClear } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirmClear',
          message: '명령어 히스토리를 초기화하시겠습니까?',
          default: false
        }]);
        
        if (confirmClear) {
          commandHistory.length = 0;
          console.log(chalk.green('✅ 명령어 히스토리가 초기화되었습니다.'));
        }
        continue;
      }
      
      // 일반 bash 명령어 실행
      try {
        const result = await this.executeCommand(command, problem);
        
        if (result.success) {
          if (result.output) {
            console.log(result.output);
          }
          commandHistory.push(command);
        } else {
          console.log(chalk.red('❌ 명령어 실행 실패:'));
          if (result.error) {
            console.log(chalk.red(result.error));
          }
        }
        
      } catch (error) {
        console.log(chalk.red('❌ 명령어 실행 중 오류:'), error.message);
      }
    }
  }

  /**
   * 단일 명령어 실행
   */
  async executeCommand(command, problem) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const child = spawn('bash', ['-c', command], {
        cwd: this.workspaceDir,
        timeout: 15000 // 15초 제한
      });
      
      let output = '';
      let error = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      child.on('close', (code) => {
        const executionTime = Date.now() - startTime;
        
        resolve({
          success: code === 0,
          output: output.trim(),
          error: error.trim(),
          executionTime,
          exitCode: code
        });
      });
      
      child.on('error', (err) => {
        const executionTime = Date.now() - startTime;
        
        resolve({
          success: false,
          output: '',
          error: err.message,
          executionTime,
          exitCode: -1
        });
      });
    });
  }

  /**
   * 솔루션 평가 및 피드백
   */
  async evaluateSolution(problem, solution) {
    console.log(chalk.cyan('\n🔄 솔루션을 실행하고 평가 중입니다...'));
    
    // 솔루션 실행
    const executionResult = await this.executeSolution(solution, problem);
    
    // AI 튜터 평가 (API 키가 있는 경우)
    let feedback = null;
    if (this.geminiService) {
      const spinner = ora('AI 튜터가 평가 중입니다...').start();
      feedback = await this.geminiService.evaluateSolution(problem, solution, executionResult);
      spinner.stop();
    }
    
    // 결과 표시
    console.clear();
    console.log(chalk.bold.blue(`\n📊 ${problem.title} - 평가 결과`));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (feedback && feedback.success) {
      console.log(feedback.feedback);
      
      // 진도에 기록
      await this.progressTracker.recordAttempt({
        problemId: problem.id,
        problemTitle: problem.title,
        category: problem.category,
        userSolution: solution,
        score: feedback.score,
        grade: feedback.grade,
        executionTime: executionResult.executionTime,
        feedback: feedback.feedback,
        tokensUsed: feedback.tokensUsed
      });
      
    } else {
      // AI 피드백 없이 기본 평가
      const basicScore = executionResult.success ? 70 : 30;
      const basicGrade = basicScore >= 70 ? 'C' : 'F';
      
      console.log(chalk.yellow('\n📊 기본 평가:'));
      console.log(`실행 결과: ${executionResult.success ? '✅ 성공' : '❌ 실패'}`);
      console.log(`점수: ${basicScore}/100 (등급: ${basicGrade})`);
      
      if (executionResult.output) {
        console.log(chalk.gray('\n출력:'));
        console.log(executionResult.output);
      }
      
      if (executionResult.error) {
        console.log(chalk.red('\n에러:'));
        console.log(executionResult.error);
      }
      
      await this.progressTracker.recordAttempt({
        problemId: problem.id,
        problemTitle: problem.title,
        category: problem.category,
        userSolution: solution,
        score: basicScore,
        grade: basicGrade,
        executionTime: executionResult.executionTime
      });
    }
    
    const { nextAction } = await inquirer.prompt([{
      type: 'list',
      name: 'nextAction',
      message: '다음으로 무엇을 하시겠습니까?',
      choices: [
        { name: '🔄 다시 시도', value: 'retry' },
        { name: '📚 다른 문제 풀기', value: 'next' },
        { name: '🏠 메인 메뉴', value: 'main' }
      ]
    }]);
    
    switch (nextAction) {
      case 'retry':
        await this.solveProblem(problem);
        break;
      case 'next':
        await this.selectProblem();
        break;
      case 'main':
        await this.showMainMenu();
        break;
    }
  }

  /**
   * 솔루션 실행
   */
  async executeSolution(solution, problem) {
    const startTime = Date.now();
    
    try {
      // 임시 스크립트 파일 생성
      const scriptPath = path.join(this.workspaceDir, 'temp_solution.sh');
      await fs.writeFile(scriptPath, `#!/bin/bash\n${solution}`);
      await fs.chmod(scriptPath, '755');
      
      // 테스트 데이터 경로 설정
      const testDataPath = this.getTestDataPath(problem);
      
      return new Promise((resolve) => {
        const child = spawn('bash', [scriptPath, testDataPath], {
          cwd: this.workspaceDir,
          timeout: 30000 // 30초 제한
        });
        
        let output = '';
        let error = '';
        
        child.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          error += data.toString();
        });
        
        child.on('close', (code) => {
          const executionTime = Date.now() - startTime;
          
          // 임시 파일 정리
          fs.remove(scriptPath).catch(() => {});
          
          resolve({
            success: code === 0,
            output: output.trim(),
            error: error.trim(),
            executionTime,
            exitCode: code
          });
        });
        
        child.on('error', (err) => {
          const executionTime = Date.now() - startTime;
          fs.remove(scriptPath).catch(() => {});
          
          resolve({
            success: false,
            output: '',
            error: err.message,
            executionTime,
            exitCode: -1
          });
        });
      });
      
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        executionTime: Date.now() - startTime,
        exitCode: -1
      };
    }
  }

  /**
   * 진도 표시
   */
  async showProgress() {
    const progress = await this.progressTracker.getProgress();
    
    console.clear();
    console.log(chalk.bold.blue('\n📊 학습 진도'));
    console.log(chalk.gray('─'.repeat(50)));
    
    console.log(chalk.cyan(`전체 진도: ${progress.progressPercentage}% (${progress.completedProblems}/${progress.totalProblems})`));
    console.log(chalk.yellow(`평균 점수: ${progress.averageScore}점`));
    console.log(chalk.green(`최고 점수: ${progress.bestScore}점`));
    console.log(chalk.magenta(`총 시도 횟수: ${progress.totalAttempts}회`));
    
    // 카테고리별 통계
    if (progress.categoryStats && Object.keys(progress.categoryStats).length > 0) {
      console.log(chalk.bold('\n📈 카테고리별 성과:'));
      Object.entries(progress.categoryStats).forEach(([category, stats]) => {
        console.log(`  ${category}: 평균 ${stats.averageScore}점 (${stats.count}회 시도)`);
      });
    }
    
    // 주간 통계
    console.log(chalk.bold('\n📅 이번 주 활동:'));
    console.log(`  시도한 문제: ${progress.weeklyStats.attemptsThisWeek}개`);
    console.log(`  완료한 문제: ${progress.weeklyStats.problemsSolvedThisWeek}개`);
    console.log(`  이번 주 평균: ${progress.weeklyStats.averageScoreThisWeek}점`);
    
    // 배지
    const badges = await this.progressTracker.getLeaderboardData();
    if (badges.badges.length > 0) {
      console.log(chalk.bold('\n🏆 획득 배지:'));
      badges.badges.forEach(badge => {
        console.log(`  🎖️  ${badge}`);
      });
    }
    
    await this.waitForKeyPress();
    await this.showMainMenu();
  }

  /**
   * AI 튜터 질문
   */
  async askTutor() {
    if (!this.geminiService) {
      console.log(chalk.red('\n❌ AI 튜터를 사용하려면 GEMINI_API_KEY를 설정해주세요.'));
      await this.waitForKeyPress();
      await this.showMainMenu();
      return;
    }

    const { question } = await inquirer.prompt([{
      type: 'input',
      name: 'question',
      message: 'AI 튜터에게 무엇을 물어보시겠습니까?'
    }]);

    if (!question.trim()) {
      await this.showMainMenu();
      return;
    }

    const spinner = ora('AI 튜터가 답변을 준비 중입니다...').start();
    
    const context = {
      currentProblem: this.currentProblem?.title,
      userLevel: (await this.progressTracker.getProgress()).userData.level
    };
    
    const result = await this.geminiService.askQuestion(question, context);
    spinner.stop();
    
    console.clear();
    console.log(chalk.bold.blue('\n🤖 AI 튜터의 답변'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (result.success) {
      console.log(chalk.white(result.answer));
      console.log(chalk.gray(`\n(토큰 사용량: ${result.tokensUsed})`));
    } else {
      console.log(chalk.red('답변을 가져오는데 실패했습니다:'), result.error);
    }
    
    await this.waitForKeyPress();
    await this.showMainMenu();
  }

  // 유틸리티 메서드들
  async getAvailableParts() {
    const partsDir = path.join(this.workspaceDir, 'parts');
    const parts = [];
    
    try {
      const items = await fs.readdir(partsDir);
      for (const item of items) {
        const itemPath = path.join(partsDir, item);
        const stat = await fs.stat(itemPath);
        if (stat.isDirectory()) {
          const readmePath = path.join(itemPath, 'README.md');
          if (await fs.pathExists(readmePath)) {
            const content = await fs.readFile(readmePath, 'utf8');
            const titleMatch = content.match(/^#\s+(.+)/m);
            const title = titleMatch ? titleMatch[1] : item;
            parts.push({ name: title, path: itemPath, id: item });
          }
        }
      }
    } catch (error) {
      console.error('파트를 읽는데 실패했습니다:', error);
    }
    
    return parts;
  }

  async getProblemsFromPart(partPath) {
    const problems = [];
    
    try {
      const files = await fs.readdir(partPath);
      for (const file of files) {
        if (file.startsWith('problem-') && file.endsWith('.md')) {
          const problemPath = path.join(partPath, file);
          const content = await fs.readFile(problemPath, 'utf8');
          
          const titleMatch = content.match(/^#\s+(.+)/m);
          const title = titleMatch ? titleMatch[1] : file;
          
          problems.push({
            id: `${path.basename(partPath)}-${file}`,
            title: title,
            description: content,
            file: file,
            partPath: partPath,
            category: path.basename(partPath)
          });
        }
      }
    } catch (error) {
      console.error('문제를 읽는데 실패했습니다:', error);
    }
    
    return problems.sort((a, b) => a.file.localeCompare(b.file));
  }

  getTestDataPath(problem) {
    // 문제에 따른 적절한 테스트 데이터 경로 반환
    const category = problem.category;
    
    if (category.includes('regex')) {
      return path.join(this.workspaceDir, 'logs/web_access.log');
    } else if (category.includes('pipelines')) {
      return path.join(this.workspaceDir, 'data/users.csv');
    } else if (category.includes('awk')) {
      return path.join(this.workspaceDir, 'data/transactions.json');
    } else if (category.includes('security')) {
      return path.join(this.workspaceDir, 'logs/audit.log');
    }
    
    return path.join(this.workspaceDir, 'logs/application.log');
  }

  async showRecommendations() {
    if (!this.geminiService) {
      console.log(chalk.red('\n❌ 맞춤 추천을 받으려면 GEMINI_API_KEY를 설정해주세요.'));
      await this.waitForKeyPress();
      await this.showMainMenu();
      return;
    }

    const spinner = ora('학습 상황을 분석하고 추천사항을 준비 중입니다...').start();
    const progress = await this.progressTracker.getProgress();
    const analysis = await this.geminiService.analyzeProgress(progress);
    spinner.stop();

    console.clear();
    console.log(chalk.bold.blue('\n🎯 맞춤형 학습 추천'));
    console.log(chalk.gray('─'.repeat(50)));

    if (analysis.success) {
      console.log(chalk.white(analysis.analysis));
    } else {
      console.log(chalk.red('추천사항을 가져오는데 실패했습니다.'));
      
      // 기본 추천사항 표시
      if (progress.recommendations.length > 0) {
        console.log(chalk.yellow('\n💡 기본 추천사항:'));
        progress.recommendations.forEach(rec => {
          console.log(`\n${rec.message}`);
          console.log(chalk.gray(`→ ${rec.action}`));
        });
      }
    }

    await this.waitForKeyPress();
    await this.showMainMenu();
  }

  async showSettings() {
    // 설정 메뉴 구현
    console.log(chalk.yellow('\n⚙️  설정 메뉴는 아직 구현 중입니다.'));
    await this.waitForKeyPress();
    await this.showMainMenu();
  }

  async showHelp() {
    console.clear();
    console.log(chalk.bold.blue('\n❓ 도움말'));
    console.log(chalk.gray('─'.repeat(50)));
    
    console.log(chalk.white(`
🎓 데이터 랭글링 마스터 AI 튜터 사용법:

📚 문제 풀기:
  • 89개의 실습 문제 중 선택
  • AI 튜터의 힌트 받기
  • 자동 평가 및 피드백

📊 진도 확인:
  • 전체적인 학습 진도 파악
  • 카테고리별 성과 분석
  • 획득 배지 확인

💡 AI 튜터:
  • 자유로운 질문 가능
  • 맞춤형 학습 계획 수립
  • 실시간 피드백 제공

🔧 환경 설정:
  1. GEMINI_API_KEY 환경변수 설정 필요
  2. 무료 API: https://ai.google.dev/gemini-api
  3. 월 무료 한도: 무제한 (현재)

📞 지원:
  • 문제가 있으면 GitHub Issues 활용
  • 한국어 완전 지원
  • 실무 중심의 학습 내용
`));
    
    await this.waitForKeyPress();
    await this.showMainMenu();
  }

  async waitForKeyPress() {
    await inquirer.prompt([{
      type: 'input',
      name: 'continue',
      message: chalk.gray('계속하려면 엔터를 누르세요...')
    }]);
  }

  /**
   * 문제 설명 표시 (페이지네이션 포함)
   */
  async displayProblemDescription(problem) {
    const lines = problem.description.split('\n');
    const maxLines = 15; // 한 페이지당 최대 라인 수
    
    if (lines.length <= maxLines) {
      console.log(chalk.white('\n📋 문제 설명:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(problem.description);
      return;
    }
    
    // 페이지네이션 필요
    let currentPage = 0;
    const totalPages = Math.ceil(lines.length / maxLines);
    
    while (true) {
      console.clear();
      console.log(chalk.bold.blue(`\n📋 ${problem.title} (페이지 ${currentPage + 1}/${totalPages})`));
      console.log(chalk.gray('─'.repeat(50)));
      
      const startLine = currentPage * maxLines;
      const endLine = Math.min(startLine + maxLines, lines.length);
      const pageContent = lines.slice(startLine, endLine).join('\n');
      
      console.log(pageContent);
      
      if (totalPages > 1) {
        console.log(chalk.yellow(`\n[페이지 ${currentPage + 1}/${totalPages}]`));
        
        const choices = [];
        if (currentPage > 0) choices.push({ name: '← 이전 페이지', value: 'prev' });
        if (currentPage < totalPages - 1) choices.push({ name: '다음 페이지 →', value: 'next' });
        choices.push({ name: '✅ 문제 이해했음', value: 'done' });
        
        const { action } = await inquirer.prompt([{
          type: 'list',
          name: 'action',
          message: '선택하세요:',
          choices
        }]);
        
        if (action === 'prev') {
          currentPage--;
        } else if (action === 'next') {
          currentPage++;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  /**
   * Cheatsheet 표시
   */
  displayCheatsheet() {
    console.log(chalk.cyan('\n💡 사용 가능한 명령어:'));
    console.log(chalk.white('  submit   - 현재 작업 내역을 솔루션으로 제출'));
    console.log(chalk.white('  problem  - 문제 설명 다시 보기'));
    console.log(chalk.white('  help     - 이 도움말 표시'));
    console.log(chalk.white('  history  - 실행한 명령어 목록 보기'));
    console.log(chalk.white('  clear    - 명령어 히스토리 초기화'));
    console.log(chalk.white('  exit     - 셸 모드 종료'));
    console.log(chalk.gray('  + 모든 bash 명령어 사용 가능'));
  }
}

// CLI 명령어 설정
const program = new Command();

program
  .name('tutor')
  .description('인터랙티브 데이터 랭글링 AI 튜터')
  .version('1.0.0');

program
  .command('start')
  .description('AI 튜터 시작')
  .action(async () => {
    const tutor = new InteractiveTutor();
    await tutor.showMainMenu();
  });

program
  .command('progress')
  .description('학습 진도 확인')
  .action(async () => {
    const tracker = new ProgressTracker();
    const progress = await tracker.getProgress();
    
    console.log(chalk.bold.blue('\n📊 학습 진도 요약'));
    console.log(chalk.gray('─'.repeat(30)));
    console.log(`진행률: ${progress.progressPercentage}%`);
    console.log(`평균 점수: ${progress.averageScore}점`);
    console.log(`완료 문제: ${progress.completedProblems}/${progress.totalProblems}`);
  });

program
  .command('usage')
  .description('API 사용량 예측')
  .action(() => {
    console.log(chalk.bold.blue('\n💰 Gemini API 사용량 예측'));
    console.log(chalk.gray('─'.repeat(30)));
    
    const scenarios = [
      { name: '가벼운 사용 (하루 3문제)', daily: 3 },
      { name: '보통 사용 (하루 10문제)', daily: 10 },
      { name: '집중 학습 (하루 20문제)', daily: 20 }
    ];
    
    scenarios.forEach(scenario => {
      const estimate = estimateMonthlyUsage(scenario.daily);
      console.log(`\n${scenario.name}:`);
      console.log(`  월 예상 토큰: ${estimate.tokens.toLocaleString()}`);
      console.log(`  월 비용: ${chalk.green('무료')}`);
      console.log(`  권장사항: ${estimate.recommendation}`);
    });
    
    console.log(chalk.yellow('\n⚠️  현재 Gemini 2.5 Pro는 무료 티어에서 무제한 사용 가능합니다.'));
  });

// 기본 명령어 (인수 없이 실행 시)
if (process.argv.length === 2) {
  const tutor = new InteractiveTutor();
  tutor.showMainMenu().catch(console.error);
} else {
  program.parse();
}

module.exports = InteractiveTutor;