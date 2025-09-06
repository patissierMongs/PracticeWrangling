/**
 * AI Tutor Configuration
 * Gemini 2.5 Pro API 설정 및 튜터 개인화 옵션
 */
 
const TUTOR_CONFIG = {
  // Gemini API 설정
  api: {
    model: 'gemini-2.5-pro',  // 최신 모델 사용
    maxTokens: 2048,
    temperature: 0.7,
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH', 
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  },

  // 튜터 개성 설정
  personality: {
    name: '데이터 랭글링 분석가',
    tone: 'analytical',
    language: 'korean',
    expertise: 'command_line_data_processing',
    encouragement_level: 'minimal',
    communication_style: 'direct',
    feedback_style: 'factual'
  },

  // 점수 시스템 설정
  scoring: {
    categories: {
      accuracy: { weight: 0.4, max: 100 },
      performance: { weight: 0.3, max: 100 },
      code_quality: { weight: 0.2, max: 100 },
      edge_cases: { weight: 0.1, max: 100 }
    },
    grades: {
      A: { min: 90, message: '효율적. 전문가 수준.' },
      B: { min: 80, message: '적절함. 실무 적용 가능.' },
      C: { min: 70, message: '기본 구현. 최적화 부족.' },
      D: { min: 60, message: '개선 필요. 재검토 요구.' },
      F: { min: 0, message: '불충분. 재작업 필요.' }
    }
  },

  // 학습 추적 설정
  progress: {
    historyFile: '.tutor-history.json',
    maxAttempts: 5,
    saveSolutions: true,
    trackTiming: true
  },

  // 피드백 설정
  feedback: {
    includeHints: false,
    showAlternatives: true,
    explainOptimizations: true,
    suggestNextSteps: false,
    verbosity: 'minimal',
    localTestingRequired: true
  }
};

// 비용 예측 함수
const estimateTokenCost = (inputTokens, outputTokens) => {
  // Gemini 2.5 Pro 무료 티어에서는 비용이 발생하지 않음
  return {
    inputCost: 0,
    outputCost: 0,
    totalCost: 0,
    tier: 'free'
  };
};

// 월간 사용량 예측
const estimateMonthlyUsage = (problemsPerDay, avgTokensPerProblem = 3000) => {
  const monthlyProblems = problemsPerDay * 30;
  const monthlyTokens = monthlyProblems * avgTokensPerProblem;
  
  return {
    problems: monthlyProblems,
    tokens: monthlyTokens,
    cost: 0, // 무료 티어
    tier: 'free',
    recommendation: monthlyTokens > 1000000 ? 
      '월 100만 토큰을 초과할 경우 유료 플랜 고려 필요' : 
      '무료 티어로 충분히 사용 가능'
  };
};

module.exports = {
  TUTOR_CONFIG,
  estimateTokenCost,
  estimateMonthlyUsage
};
