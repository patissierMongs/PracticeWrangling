# 🎓 커맨드라인 데이터 랭글링 마스터 - AI 튜터 통합

> **Gemini 2.5 Pro 기반 인터랙티브 학습 시스템**  
> 89개의 실습 문제 + AI 튜터 + 개인화된 학습 추적

한국 사용자를 위해 특별히 설계된 **AI 기반 인터랙티브 데이터 랭글링 워크북**입니다. 기존의 정적인 학습 자료에서 벗어나, 실시간 피드백과 맞춤형 지도를 제공하는 차세대 학습 플랫폼입니다.

## 🚀 주요 기능

### 🤖 AI 튜터 (Gemini 2.5 Pro)
- **실시간 질문 응답**: 언제든지 궁금한 점을 물어보세요
- **맞춤형 힌트**: 학습자 수준에 맞는 단계별 가이드
- **자동 평가 시스템**: 4가지 기준으로 종합적인 피드백
- **한국어 완전 지원**: 자연스러운 한국어 소통

### 📊 스마트 진도 추적
- **개인화된 학습 분석**: 강점/약점 영역 자동 분석  
- **점수 기반 평가**: 정확성, 성능, 코드품질, 엣지케이스 처리
- **학습 이력 관리**: 모든 시도와 개선사항 기록
- **성취 배지 시스템**: 달성 목표에 따른 동기부여

### 💡 인터랙티브 학습 경험
- **CLI 기반 인터페이스**: 실제 개발 환경과 동일
- **즉시 실행 & 피드백**: 코드 작성 즉시 결과 확인
- **단계별 문제 해결**: 힌트 → 작성 → 평가 → 개선
- **재시도 시스템**: 무제한 재도전으로 완벽 학습

---

## 📦 설치 및 시작

### 1. 프로젝트 설정

```bash
# 저장소 클론
git clone <repository-url>
cd WranglingMaster-Korean-copy

# 의존성 설치
npm install

# 실행 권한 부여
chmod +x src/cli.js
```

### 2. Gemini API 키 설정

```bash
# 무료 API 키 발급: https://ai.google.dev/gemini-api
export GEMINI_API_KEY="your-gemini-api-key"

# 영구 설정 (선택사항)
echo 'export GEMINI_API_KEY="your-api-key"' >> ~/.bashrc
source ~/.bashrc
```

### 3. AI 튜터 시작

```bash
# 인터랙티브 모드로 시작
npm start
# 또는
node src/cli.js

# 직접 명령어
./src/cli.js start
```

---

## 💰 API 비용 예측 (무료!)

### 🎉 **Gemini 2.5 Pro 무료 혜택**

현재 **Gemini 2.5 Pro는 완전 무료**로 제공됩니다! 

```bash
# 사용량 예측 확인
npm run usage
```

### 📊 월간 사용량 시나리오

| 사용 패턴 | 일일 문제 | 월 토큰 예상 | 비용 | 상태 |
|-----------|-----------|--------------|------|------|
| **가벼운 학습** | 3문제 | ~270K 토큰 | **무료** ✅ | 추천 |
| **보통 학습** | 10문제 | ~900K 토큰 | **무료** ✅ | 적정 |
| **집중 학습** | 20문제 | ~1.8M 토큰 | **무료** ✅ | 가능 |
| **전문가 코스** | 30문제+ | ~2.7M+ 토큰 | **무료** ✅ | 무제한 |

### 💡 비용 최적화 팁

- **힌트 사용 조절**: 먼저 스스로 고민해본 후 힌트 요청
- **피드백 활용**: AI 평가를 통한 체계적 개선
- **진도 추적**: 불필요한 중복 학습 방지
- **질문 효율화**: 구체적이고 명확한 질문으로 토큰 절약

---

## 🎯 학습 가이드

### 🚀 첫 시작 추천 코스

1. **환경 설정 확인**
   ```bash
   # 필수 도구 점검
   which grep sed awk sort uniq cut
   ```

2. **AI 튜터와 첫 만남**
   ```bash
   npm start
   # "AI 튜터에게 질문하기" 선택
   # "데이터 랭글링이 뭔가요?" 같은 기본 질문으로 시작
   ```

3. **첫 번째 문제 도전**
   - Part 1: 정규식 기초 (문제 1-3)
   - 힌트 → 작성 → 평가 → 개선 사이클 경험

### 📚 학습 단계별 로드맵

#### **🔰 입문자 (0-20문제)**
```
• 기본 개념 학습: resources/ 폴더 치트시트 읽기
• 정규식 기초: Part 1 문제 1-5
• 간단한 파이프라인: Part 2 문제 16-20  
• AWK 기초: Part 6 문제 58-60
```

#### **⭐ 중급자 (21-50문제)**
```
• 고급 정규식: Part 1 문제 6-15
• 복잡한 파이프라인: Part 2 문제 21-30
• 성능 기초: Part 4 문제 46-50
• AWK 활용: Part 6 문제 61-65
```

#### **🚀 고급자 (51-89문제)**
```
• 성능 최적화: Part 4 전체
• 보안 포렌식: Part 7 전체
• 통합 프로젝트: Part 8 전체
• 완벽한 마스터리: 모든 문제 A등급 달성
```

### 🎯 점수 시스템 이해

| 등급 | 점수 범위 | 의미 | AI 튜터 피드백 |
|------|-----------|------|----------------|
| **A** | 90-100점 | 전문가 수준 | 고급 최적화 기법 제안 |
| **B** | 80-89점 | 실무 활용 가능 | 성능 개선 포인트 제시 |  
| **C** | 70-79점 | 기본기 확보 | 안정성 향상 방안 제공 |
| **D** | 60-69점 | 개선 필요 | 기초 개념 재학습 권장 |
| **F** | 0-59점 | 재시도 필요 | 단계별 힌트와 예제 제공 |

---

## 🛠️ AI 튜터 활용법

### 💡 효과적인 질문 방법

#### ✅ **좋은 질문 예시**
```
"정규식에서 그리디와 논그리디의 차이점을 실제 예제로 설명해주세요"
"Part 2-15 문제에서 파이프라인 성능을 향상시키려면 어떻게 해야 하나요?"
"AWK에서 연관 배열을 사용하는 실제 시나리오를 알려주세요"
```

#### ❌ **피해야 할 질문**
```
"답을 알려주세요" (직접적인 답 요구)
"이거 뭔가요?" (너무 모호한 질문)
"잘 안돼요" (구체적인 상황 설명 없음)
```

### 🎯 맞춤형 학습 전략

AI 튜터는 다음 정보를 기반으로 개인화된 조언을 제공합니다:

- **현재 실력 수준**: 평균 점수와 완료 문제 수
- **강약점 분석**: 카테고리별 성과 분석
- **학습 패턴**: 문제 해결 소요 시간과 시도 횟수
- **진도 상황**: 최근 학습 트렌드와 개선 방향

---

## 📊 진도 추적 시스템

### 🏆 성취 시스템

#### 📈 **진도 배지**
- **문제해결 입문자** - 10문제 완료
- **데이터 랭글러** - 30문제 완료  
- **커맨드라인 마스터** - 60문제 완료
- **완전정복자** - 89문제 모두 완료

#### ⭐ **실력 배지**  
- **완벽주의자** - 90점 이상 달성
- **우수한 학습자** - 평균 80점 이상
- **카테고리 전문가** - 특정 영역 85점 이상

### 📱 학습 분석 대시보드

```bash
# 상세 진도 확인
npm run progress

# 맞춤형 학습 추천
npm start -> "맞춤 추천 받기"
```

**제공되는 분석 정보:**
- 📊 전체 진행률 및 평균 점수  
- 📈 카테고리별 성과 비교
- 🎯 약점 영역과 개선 방안
- 📅 학습 활동 패턴 분석
- 🏆 달성 목표와 다음 단계 제안

---

## 🔧 고급 설정

### 환경 변수

#### 🔐 필수 환경변수

```bash
# Gemini API 키 (필수)
export GEMINI_API_KEY="your-actual-gemini-api-key"

# 데이터베이스 비밀번호들 (프로덕션 환경)
export DB_PROD_PASSWORD="your-production-db-password"
export DB_READ_PASSWORD="your-read-only-db-password"
export DB_STAGING_PASSWORD="your-staging-db-password"
export DB_DEV_PASSWORD="your-development-db-password"

# 캐시 및 세션 비밀번호
export REDIS_CACHE_PASSWORD="your-redis-cache-password"
export REDIS_SESSION_PASSWORD="your-redis-session-password"
export REDIS_QUEUE_PASSWORD="your-redis-queue-password"

# 기타 서비스 비밀번호
export DB_ANALYTICS_PASSWORD="your-analytics-db-password"
export DB_REPORT_PASSWORD="your-report-db-password"
export DB_BACKUP_PASSWORD="your-backup-db-password"
export BACKUP_ENCRYPTION_KEY="your-backup-encryption-key"
export ELASTIC_PASSWORD="your-elasticsearch-password"
export METRICS_PASSWORD="your-metrics-db-password"
export DB_ROOT_PASSWORD="your-root-password"
export DB_TEST_PASSWORD="your-test-db-password"
export DB_REPLICA_PASSWORD="your-replica-db-password"
export DB_SHARD1_PASSWORD="your-shard1-db-password"
export DB_SHARD2_PASSWORD="your-shard2-db-password"
export DB_MONITOR_PASSWORD="your-monitor-db-password"
export DB_ARCHIVE_PASSWORD="your-archive-db-password"
```

#### 📝 환경변수 설정 방법

**Linux/macOS:**
```bash
# 현재 세션에만 적용
export GEMINI_API_KEY="your-api-key"

# 영구 설정 (bash)
echo 'export GEMINI_API_KEY="your-api-key"' >> ~/.bashrc
source ~/.bashrc

# 영구 설정 (zsh)
echo 'export GEMINI_API_KEY="your-api-key"' >> ~/.zshrc
source ~/.zshrc
```

**Windows:**
```powershell
# PowerShell (현재 세션)
$env:GEMINI_API_KEY="your-api-key"

# 영구 설정
[Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "your-api-key", "User")
```

#### ⚙️ 선택적 환경변수

```bash
# 튜터 설정 (선택사항)
export TUTOR_LANGUAGE="korean"           # 기본값: korean
export TUTOR_FEEDBACK_LEVEL="detailed"   # 기본값: detailed  
export TUTOR_WORKSPACE="/path/to/workspace"  # 기본값: ./pbl-workspace
```

#### 🔒 보안 중요사항

⚠️ **절대 Git에 커밋하지 마세요:**
- 실제 비밀번호나 API 키를 코드에 하드코딩하지 마세요
- `.env` 파일을 사용하는 경우 반드시 `.gitignore`에 추가하세요
- 환경변수로만 민감한 정보를 관리하세요

✅ **권장 보안 관행:**
```bash
# .env 파일 예시 (절대 Git에 커밋 금지!)
GEMINI_API_KEY=your-actual-api-key
DB_PROD_PASSWORD=super-secure-password

# .gitignore에 추가
echo ".env" >> .gitignore
echo "*.env" >> .gitignore
```

### 워크스페이스 구조

```
pbl-workspace/
├── .tutor-progress/          # 학습 진도 데이터 (자동 생성)
│   ├── history.json         # 모든 시도 기록
│   ├── stats.json          # 통계 및 성과 데이터  
│   └── user-data.json      # 개인화 설정
├── parts/                  # 문제 카테고리별 폴더
├── logs/                   # 실습용 로그 파일
├── data/                   # CSV, JSON 샘플 데이터
└── scripts/                # 사용자 솔루션 저장소
```

---

## 🎓 문제 카테고리 상세

### Part 1: 고급 정규식 패턴 (15문제)
- **IPv4/IPv6 유효성 검사** - 네트워크 주소 패턴 매칭
- **RFC 호환 이메일 추출** - 복잡한 이메일 형식 처리  
- **중첩 괄호 파싱** - 재귀적 패턴 이해
- **신용카드 번호 마스킹** - 보안 데이터 처리
- **타임스탬프 정규화** - 다양한 시간 형식 통일

### Part 2: 다단계 파이프라인 처리 (15문제)  
- **4-6단계 복합 명령어** - 실무 수준의 데이터 처리
- **프로세스 치환 마스터** - 고급 bash 기법
- **실시간 로그 분석** - 스트리밍 데이터 처리
- **다중 파일 병합** - 복잡한 데이터 통합
- **오류 복구 파이프라인** - 안정성 확보 방법

### Part 4: 성능 최적화 (12문제)
- **대용량 파일 처리** - 500MB+ 데이터 30초 내 처리
- **메모리 효율 최적화** - 스트림 기반 처리 기법  
- **병렬 처리 활용** - GNU parallel 마스터
- **알고리즘 비교 분석** - 성능 벤치마킹
- **실시간 모니터링** - 시스템 리소스 관리

### Part 6: 고급 AWK 프로그래밍 (12문제)
- **연관 배열 활용** - 복잡한 데이터 구조 구현
- **사용자 정의 함수** - 재사용 가능한 코드 작성
- **상태 머신 구현** - 복잡한 파싱 로직
- **보고서 생성 엔진** - 전문적인 출력 형식
- **다중 파일 처리** - FNR/NR 패턴 마스터

### Part 7: 보안 및 포렌식 (8문제)
- **브루트포스 탐지** - 공격 패턴 인식
- **이벤트 상관관계** - 다중 소스 분석  
- **IoC 추출** - 침해지표 자동 수집
- **이상행위 탐지** - 통계 기반 분석
- **로그 위생화** - 개인정보 보호 처리

---

## 🤝 커뮤니티 & 지원

### 💬 도움받기
- **GitHub Issues**: 버그 리포트 및 기능 요청
- **Discussion**: 학습 팁과 경험 공유  
- **AI 튜터 질문**: 24시간 언제든지 실시간 도움

### 🎯 기여하기
- **새로운 문제 추가**: 실무 경험 기반 문제 제안
- **솔루션 개선**: 더 효율적인 접근법 공유
- **번역 및 문서화**: 한국어 품질 향상
- **성능 최적화**: 벤치마크 개선 및 새로운 기법

### 📈 로드맵
- **다중 사용자 지원**: 팀 단위 학습 관리
- **웹 인터페이스**: 브라우저 기반 학습 환경  
- **고급 분석**: 머신러닝 기반 학습 패턴 분석
- **인증 시스템**: 공식 인증서 발급 프로그램

---

## 🏃‍♂️ 빠른 시작

```bash
# 1. 환경 설정
export GEMINI_API_KEY="your-api-key"

# 2. AI 튜터 시작  
npm start

# 3. 첫 문제 도전
# → "문제 풀기" → "Part 1: 정규식" → "문제 1" 선택

# 4. AI 튜터와 대화
# → "AI 튜터에게 질문하기" → "데이터 랭글링 학습 방법을 알려주세요"
```

**🎉 지금 시작해보세요! 89개의 실전 문제와 AI 튜터가 함께하는 데이터 랭글링 마스터 여정이 기다리고 있습니다!**

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 🙏 크레딧

- **Gemini 2.5 Pro API**: Google AI의 무료 API 제공
- **한국어 지원**: 한국 개발자 커뮤니티를 위한 특별 최적화
- **실무 기반**: 현업 DevOps, 보안 분석가, 데이터 엔지니어의 실제 경험 반영