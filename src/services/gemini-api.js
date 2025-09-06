/**
 * Gemini 2.5 Pro API 통합 서비스
 * 한국어 최적화된 데이터 랭글링 튜터
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { TUTOR_CONFIG } = require('../config/tutor-config');

class GeminiTutorService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 환경변수가 필요합니다. .env 파일을 확인해주세요.');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: TUTOR_CONFIG.api.model,
      safetySettings: TUTOR_CONFIG.api.safetySettings
    });
    
    this.sessionHistory = [];
  }

  /**
   * 문제 해결 전 힌트 제공
   */
  async getHint(problemDescription, userData = {}) {
    const prompt = `
당신은 경험 많은 데이터 랭글링 튜터입니다. 한국어로 응답하세요.

문제: ${problemDescription}

사용자 정보:
- 현재 레벨: ${userData.level || '초급'}
- 이전 점수 평균: ${userData.averageScore || 'N/A'}
- 어려워하는 부분: ${userData.weakAreas?.join(', ') || '파악 중'}

이 문제를 해결하는데 도움이 되는 힌트를 제공해주세요:
1. 어떤 명령어들을 사용해야 하는지
2. 접근 방법의 순서
3. 주의해야 할 함정들
4. 성능 최적화 팁 (해당 시)

힌트는 답을 직접 주지 말고, 스스로 생각할 수 있도록 안내해주세요.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return {
        success: true,
        hint: response.text(),
        tokensUsed: this.estimateTokens(prompt + response.text())
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        hint: '힌트를 가져오는데 문제가 발생했습니다. 다시 시도해주세요.'
      };
    }
  }

  /**
   * 사용자 솔루션 평가 및 피드백
   */
  async evaluateSolution(problemData, userSolution, executionResult) {
    const prompt = `
당신은 전문적인 데이터 랭글링 튜터입니다. 한국어로 응답하세요.

# 문제 정보
제목: ${problemData.title}
설명: ${problemData.description}
예상 출력: ${problemData.expectedOutput}

# 사용자 솔루션
\`\`\`bash
${userSolution}
\`\`\`

# 실행 결과
출력: ${executionResult.output}
실행 시간: ${executionResult.executionTime}ms
메모리 사용량: ${executionResult.memoryUsage}MB
오류: ${executionResult.error || '없음'}

# 평가 기준
1. 정확성 (40%): 올바른 결과를 생성하는가?
2. 성능 (30%): 효율적으로 실행되는가?
3. 코드 품질 (20%): 읽기 쉽고 유지보수 가능한가?
4. 엣지케이스 처리 (10%): 예외 상황을 고려했는가?

다음 형식으로 응답해주세요:

## 📊 점수
- 정확성: X/100
- 성능: X/100  
- 코드 품질: X/100
- 엣지케이스: X/100
- **전체 점수: X/100 (등급: X)**

## 👍 잘한 점
- 구체적으로 칭찬할 점들

## 🔧 개선할 점
- 구체적인 개선 방향

## 💡 최적화 제안
- 더 나은 접근 방법이나 명령어

## 📚 학습 자료
- 관련 개념 설명이나 추천 자료

## 🎯 다음 도전
- 비슷한 유형의 다음 문제 추천
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const feedback = response.text();
      
      // 점수 추출 (간단한 정규식 사용)
      const scoreMatch = feedback.match(/전체 점수:\s*(\d+)/);
      const gradeMatch = feedback.match(/등급:\s*([A-F])/);
      
      return {
        success: true,
        feedback,
        score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
        grade: gradeMatch ? gradeMatch[1] : 'F',
        tokensUsed: this.estimateTokens(prompt + feedback)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        feedback: '평가를 진행하는데 문제가 발생했습니다. 다시 시도해주세요.'
      };
    }
  }

  /**
   * 학습 상황 분석 및 맞춤형 추천
   */
  async analyzeProgress(progressData) {
    const prompt = `
당신은 개인화된 학습 분석 전문가입니다. 한국어로 응답하세요.

# 학습자 진행 상황
총 시도한 문제 수: ${progressData.totalAttempts}
완료한 문제 수: ${progressData.completedProblems}
평균 점수: ${progressData.averageScore}
최고 점수: ${progressData.bestScore}
최근 5개 점수: ${progressData.recentScores?.join(', ') || 'N/A'}

# 카테고리별 성과
${Object.entries(progressData.categoryScores || {}).map(([category, score]) => 
  `- ${category}: ${score}점`
).join('\n')}

# 시간 패턴  
평균 소요 시간: ${progressData.averageTime}분
가장 오래 걸린 유형: ${progressData.slowestCategory}

이 데이터를 바탕으로 다음을 분석해주세요:

## 📈 학습 진도 분석
- 전반적인 실력 수준
- 강점과 약점 영역

## 🎯 맞춤형 학습 계획
- 집중해야 할 영역
- 권장 학습 순서
- 목표 점수 설정

## ⚡ 효율성 개선
- 시간 단축 방법
- 학습 효과 극대화 팁

## 🏆 동기부여
- 현재 수준에 대한 격려
- 다음 마일스톤 제시
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      
      return {
        success: true,
        analysis: response.text(),
        tokensUsed: this.estimateTokens(prompt + response.text())
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        analysis: '학습 분석을 진행하는데 문제가 발생했습니다.'
      };
    }
  }

  /**
   * 대화형 질문 응답
   */
  async askQuestion(question, context = {}) {
    const prompt = `
당신은 친근하고 전문적인 데이터 랭글링 튜터입니다. 한국어로 응답하세요.

현재 맥락:
- 현재 작업 중인 문제: ${context.currentProblem || '없음'}
- 사용자 레벨: ${context.userLevel || '파악 중'}

사용자 질문: ${question}

다음 지침을 따라 응답해주세요:
1. 명확하고 이해하기 쉽게 설명
2. 구체적인 예시 제공 (가능한 경우)
3. 실무에서 어떻게 활용되는지 언급
4. 추가 학습을 위한 팁 제공
5. 친근하고 격려하는 톤 유지

응답은 마크다운 형식을 사용하고, 코드 예시는 적절한 구문 강조를 사용하세요.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      
      return {
        success: true,
        answer: response.text(),
        tokensUsed: this.estimateTokens(prompt + response.text())
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        answer: '죄송합니다. 질문에 답변하는데 문제가 발생했습니다.'
      };
    }
  }

  /**
   * 토큰 사용량 추정 (대략적)
   */
  estimateTokens(text) {
    // 대략적인 토큰 계산 (한국어의 경우 영어보다 더 많은 토큰 사용)
    return Math.ceil(text.length / 3);
  }

  /**
   * API 사용량 통계
   */
  getUsageStats() {
    return {
      sessionsToday: this.sessionHistory.filter(s => 
        new Date(s.timestamp).toDateString() === new Date().toDateString()
      ).length,
      totalTokensUsed: this.sessionHistory.reduce((sum, s) => sum + s.tokensUsed, 0),
      averageTokensPerSession: this.sessionHistory.length > 0 ? 
        this.sessionHistory.reduce((sum, s) => sum + s.tokensUsed, 0) / this.sessionHistory.length : 0
    };
  }

  /**
   * 세션 기록 추가
   */
  recordSession(sessionData) {
    this.sessionHistory.push({
      ...sessionData,
      timestamp: new Date().toISOString()
    });

    // 최근 100개 세션만 유지
    if (this.sessionHistory.length > 100) {
      this.sessionHistory = this.sessionHistory.slice(-100);
    }
  }
}

module.exports = GeminiTutorService;