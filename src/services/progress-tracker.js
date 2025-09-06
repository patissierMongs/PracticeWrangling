/**
 * 학습 진도 추적 및 기록 관리 시스템
 * 사용자의 학습 이력, 점수, 개선 사항을 체계적으로 관리
 */

const fs = require('fs-extra');
const path = require('path');
const { TUTOR_CONFIG } = require('../config/tutor-config');

class ProgressTracker {
  constructor(workspaceDir = './pbl-workspace') {
    this.workspaceDir = workspaceDir;
    this.progressDir = path.join(workspaceDir, '.tutor-progress');
    this.historyFile = path.join(this.progressDir, 'history.json');
    this.statsFile = path.join(this.progressDir, 'stats.json');
    this.userDataFile = path.join(this.progressDir, 'user-data.json');
    
    this.initializeProgressDir();
  }

  /**
   * 진도 추적 디렉토리 초기화
   */
  async initializeProgressDir() {
    await fs.ensureDir(this.progressDir);
    
    // 기본 파일들이 없으면 생성
    if (!await fs.pathExists(this.historyFile)) {
      await fs.writeJson(this.historyFile, { attempts: [] });
    }
    
    if (!await fs.pathExists(this.statsFile)) {
      await fs.writeJson(this.statsFile, {
        totalProblems: 89,
        completedProblems: 0,
        averageScore: 0,
        bestScore: 0,
        categoryStats: {},
        createdAt: new Date().toISOString()
      });
    }
    
    if (!await fs.pathExists(this.userDataFile)) {
      await fs.writeJson(this.userDataFile, {
        level: 'beginner',
        preferences: {
          language: 'korean',
          feedbackDetail: 'detailed',
          encouragementLevel: 'moderate'
        },
        weakAreas: [],
        strongAreas: [],
        goals: []
      });
    }
  }

  /**
   * 문제 시도 기록
   */
  async recordAttempt(attemptData) {
    const history = await fs.readJson(this.historyFile);
    
    const attempt = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      problemId: attemptData.problemId,
      problemTitle: attemptData.problemTitle,
      category: attemptData.category,
      userSolution: attemptData.userSolution,
      score: attemptData.score || 0,
      grade: attemptData.grade || 'F',
      executionTime: attemptData.executionTime,
      feedback: attemptData.feedback,
      hints_used: attemptData.hintsUsed || 0,
      attempt_number: this.getAttemptNumber(history.attempts, attemptData.problemId),
      improvements: attemptData.improvements || [],
      tokensUsed: attemptData.tokensUsed || 0
    };

    history.attempts.push(attempt);
    
    // 최근 1000개 시도만 보관
    if (history.attempts.length > 1000) {
      history.attempts = history.attempts.slice(-1000);
    }
    
    await fs.writeJson(this.historyFile, history);
    await this.updateStats(attempt);
    
    return attempt;
  }

  /**
   * 특정 문제의 시도 횟수 계산
   */
  getAttemptNumber(attempts, problemId) {
    return attempts.filter(a => a.problemId === problemId).length + 1;
  }

  /**
   * 통계 업데이트
   */
  async updateStats(newAttempt) {
    const stats = await fs.readJson(this.statsFile);
    const history = await fs.readJson(this.historyFile);
    
    // 완료된 문제 계산 (점수 70 이상)
    const completedProblems = new Set(
      history.attempts
        .filter(a => a.score >= 70)
        .map(a => a.problemId)
    ).size;
    
    // 평균 점수 계산
    const totalScore = history.attempts.reduce((sum, a) => sum + a.score, 0);
    const averageScore = history.attempts.length > 0 ? 
      Math.round(totalScore / history.attempts.length) : 0;
    
    // 최고 점수
    const bestScore = Math.max(...history.attempts.map(a => a.score), 0);
    
    // 카테고리별 통계
    const categoryStats = {};
    const categoryAttempts = {};
    
    history.attempts.forEach(attempt => {
      if (!categoryStats[attempt.category]) {
        categoryStats[attempt.category] = { totalScore: 0, count: 0, bestScore: 0 };
      }
      categoryStats[attempt.category].totalScore += attempt.score;
      categoryStats[attempt.category].count += 1;
      categoryStats[attempt.category].bestScore = Math.max(
        categoryStats[attempt.category].bestScore, 
        attempt.score
      );
    });
    
    // 카테고리별 평균 점수 계산
    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].averageScore = Math.round(
        categoryStats[category].totalScore / categoryStats[category].count
      );
    });
    
    stats.completedProblems = completedProblems;
    stats.averageScore = averageScore;
    stats.bestScore = bestScore;
    stats.categoryStats = categoryStats;
    stats.lastUpdated = new Date().toISOString();
    stats.totalAttempts = history.attempts.length;
    
    await fs.writeJson(this.statsFile, stats);
  }

  /**
   * 학습 진도 조회
   */
  async getProgress() {
    const [stats, history, userData] = await Promise.all([
      fs.readJson(this.statsFile),
      fs.readJson(this.historyFile),
      fs.readJson(this.userDataFile)
    ]);
    
    const recentAttempts = history.attempts.slice(-10);
    const recentScores = recentAttempts.map(a => a.score);
    
    return {
      ...stats,
      recentScores,
      recentAttempts,
      userData,
      progressPercentage: Math.round((stats.completedProblems / stats.totalProblems) * 100),
      trend: this.calculateTrend(recentScores),
      weeklyStats: this.getWeeklyStats(history.attempts),
      recommendations: this.generateRecommendations(stats, userData)
    };
  }

  /**
   * 특정 문제의 이력 조회
   */
  async getProblemHistory(problemId) {
    const history = await fs.readJson(this.historyFile);
    const problemAttempts = history.attempts
      .filter(a => a.problemId === problemId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (problemAttempts.length === 0) {
      return null;
    }
    
    const bestAttempt = problemAttempts.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return {
      totalAttempts: problemAttempts.length,
      bestScore: bestAttempt.score,
      bestGrade: bestAttempt.grade,
      firstAttempt: problemAttempts[0],
      lastAttempt: problemAttempts[problemAttempts.length - 1],
      allAttempts: problemAttempts,
      improvement: problemAttempts.length > 1 ? 
        problemAttempts[problemAttempts.length - 1].score - problemAttempts[0].score : 0
    };
  }

  /**
   * 성과 트렌드 계산
   */
  calculateTrend(scores) {
    if (scores.length < 2) return 'insufficient_data';
    
    const recentAvg = scores.slice(-3).reduce((sum, score) => sum + score, 0) / Math.min(3, scores.length);
    const olderAvg = scores.slice(0, -3).reduce((sum, score) => sum + score, 0) / Math.max(1, scores.length - 3);
    
    const improvement = recentAvg - olderAvg;
    
    if (improvement > 10) return 'improving';
    if (improvement < -10) return 'declining';
    return 'stable';
  }

  /**
   * 주간 통계
   */
  getWeeklyStats(attempts) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyAttempts = attempts.filter(a => new Date(a.timestamp) > oneWeekAgo);
    
    return {
      attemptsThisWeek: weeklyAttempts.length,
      averageScoreThisWeek: weeklyAttempts.length > 0 ? 
        Math.round(weeklyAttempts.reduce((sum, a) => sum + a.score, 0) / weeklyAttempts.length) : 0,
      problemsSolvedThisWeek: new Set(weeklyAttempts.filter(a => a.score >= 70).map(a => a.problemId)).size,
      totalTimeThisWeek: weeklyAttempts.reduce((sum, a) => sum + (a.executionTime || 0), 0)
    };
  }

  /**
   * 개인화된 추천사항 생성
   */
  generateRecommendations(stats, userData) {
    const recommendations = [];
    
    // 완료율 기반 추천
    const completionRate = (stats.completedProblems / stats.totalProblems) * 100;
    if (completionRate < 20) {
      recommendations.push({
        type: 'beginner_focus',
        message: '기초 문제부터 차근차근 시작해보세요.',
        action: 'part1-regex 섹션의 처음 5문제를 완료해보세요.'
      });
    } else if (completionRate < 50) {
      recommendations.push({
        type: 'intermediate_challenge',
        message: '중급 문제로 실력을 늘려보세요.',
        action: 'part2-pipelines 또는 part6-awk 문제를 시도해보세요.'
      });
    }
    
    // 카테고리별 약점 분석
    if (stats.categoryStats) {
      const weakestCategory = Object.entries(stats.categoryStats)
        .sort((a, b) => a[1].averageScore - b[1].averageScore)[0];
      
      if (weakestCategory && weakestCategory[1].averageScore < 70) {
        recommendations.push({
          type: 'improve_weakness',
          message: `${weakestCategory[0]} 영역 연습이 필요합니다.`,
          action: `${weakestCategory[0]} 카테고리의 기초 문제부터 다시 시도해보세요.`
        });
      }
    }
    
    // 평균 점수 기반 추천
    if (stats.averageScore < 60) {
      recommendations.push({
        type: 'study_resources',
        message: '기본 개념 학습이 필요합니다.',
        action: 'resources/ 폴더의 치트 시트를 먼저 공부해보세요.'
      });
    }
    
    return recommendations;
  }

  /**
   * 사용자 데이터 업데이트
   */
  async updateUserData(updates) {
    const userData = await fs.readJson(this.userDataFile);
    const updatedData = { ...userData, ...updates };
    await fs.writeJson(this.userDataFile, updatedData);
    return updatedData;
  }

  /**
   * 리더보드 데이터 (익명화)
   */
  async getLeaderboardData() {
    const stats = await fs.readJson(this.statsFile);
    
    return {
      rank: 'N/A', // 다중 사용자 환경에서 구현 필요
      totalScore: stats.averageScore,
      completedProblems: stats.completedProblems,
      totalProblems: stats.totalProblems,
      badges: this.calculateBadges(stats)
    };
  }

  /**
   * 달성 배지 계산
   */
  calculateBadges(stats) {
    const badges = [];
    
    if (stats.completedProblems >= 10) badges.push('문제해결 입문자');
    if (stats.completedProblems >= 30) badges.push('데이터 랭글러');
    if (stats.completedProblems >= 60) badges.push('커맨드라인 마스터');
    if (stats.completedProblems >= 89) badges.push('완전정복자');
    
    if (stats.bestScore >= 90) badges.push('완벽주의자');
    if (stats.averageScore >= 80) badges.push('우수한 학습자');
    
    // 카테고리별 특성화 배지
    if (stats.categoryStats) {
      Object.entries(stats.categoryStats).forEach(([category, data]) => {
        if (data.averageScore >= 85) {
          badges.push(`${category} 전문가`);
        }
      });
    }
    
    return badges;
  }

  /**
   * 진도 초기화 (사용자 요청시)
   */
  async resetProgress(confirmationCode) {
    if (confirmationCode !== 'RESET_MY_PROGRESS') {
      throw new Error('올바른 확인 코드를 입력해주세요.');
    }
    
    await fs.remove(this.progressDir);
    await this.initializeProgressDir();
    
    return { success: true, message: '학습 진도가 초기화되었습니다.' };
  }
}

module.exports = ProgressTracker;