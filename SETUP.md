# 🚀 AI 튜터 설치 및 설정 가이드

## 📋 사전 요구사항

### 시스템 요구사항
- **Node.js**: 16.0 이상
- **npm**: 7.0 이상  
- **bash**: 4.0 이상
- **기본 CLI 도구**: grep, sed, awk, sort, uniq, cut

### 권장 도구 (선택사항)
- **GNU parallel**: 병렬 처리 성능 최적화
- **ripgrep (rg)**: 빠른 텍스트 검색
- **jq**: JSON 데이터 처리

## 📦 설치 과정

### 1단계: 프로젝트 다운로드

```bash
# Git 저장소 클론
git clone <repository-url>
cd WranglingMaster-Korean-copy

# 또는 ZIP 다운로드 후 압축 해제
```

### 2단계: 의존성 설치

```bash
# npm 패키지 설치
npm install

# 실행 권한 부여
chmod +x src/cli.js

# 설치 확인
npm run test || echo "테스트가 아직 구현되지 않았습니다"
```

### 3단계: Gemini API 키 발급 및 설정

#### API 키 발급
1. https://ai.google.dev/gemini-api 방문
2. "Get API Key" 클릭
3. Google 계정으로 로그인
4. API 키 복사 (예: `AIzaSy...`)

#### 환경변수 설정

**Linux/macOS:**
```bash
# 임시 설정 (현재 터미널 세션만)
export GEMINI_API_KEY="your-actual-api-key-here"

# 영구 설정 (권장)
echo 'export GEMINI_API_KEY="your-actual-api-key-here"' >> ~/.bashrc
source ~/.bashrc

# zsh 사용자의 경우
echo 'export GEMINI_API_KEY="your-actual-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

**Windows (PowerShell):**
```powershell
# 임시 설정
$env:GEMINI_API_KEY="your-actual-api-key-here"

# 영구 설정
[Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "your-actual-api-key-here", "User")
```

#### .env 파일 사용 (선택사항)
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집 (.env.example 참조)
nano .env
```

## 🧪 설치 확인

### 기본 기능 테스트

```bash
# 1. Node.js 환경 확인
node --version  # v16.0+ 이상
npm --version   # v7.0+ 이상

# 2. 필수 CLI 도구 확인
which grep sed awk sort uniq cut

# 3. API 키 설정 확인
echo $GEMINI_API_KEY  # API 키가 출력되어야 함

# 4. AI 튜터 시작 테스트
npm start  # 또는 node src/cli.js
```

### 첫 실행 체크리스트

AI 튜터를 처음 실행할 때 다음을 확인하세요:

✅ **"✅ Gemini AI 튜터가 준비되었습니다!"** 메시지가 표시됨  
✅ **진행률 정보**가 올바르게 표시됨 (0%에서 시작)  
✅ **메뉴가 정상적으로 표시**됨  
✅ **"AI 튜터에게 질문하기"** 기능이 작동함

## 🛠️ 문제 해결

### 자주 발생하는 문제

#### 1. API 키 인증 실패
```
❌ API 키 인증에 실패했습니다: Invalid API key
```

**해결 방법:**
- API 키가 올바르게 설정되었는지 확인: `echo $GEMINI_API_KEY`
- API 키에 따옴표가 포함되지 않았는지 확인
- Google AI Studio에서 API 키가 활성화되었는지 확인

#### 2. 모듈을 찾을 수 없음
```
Error: Cannot find module '@google/generative-ai'
```

**해결 방법:**
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 3. 권한 거부 오류
```
Permission denied: ./src/cli.js
```

**해결 방법:**
```bash
chmod +x src/cli.js
```

#### 4. 포트 충돌 (해당사항 없음)
현재 버전은 CLI 기반이므로 포트 충돌 문제는 없습니다.

#### 5. 프로그레스 디렉토리 권한 문제
```bash
# 워크스페이스 디렉토리 권한 확인
ls -la pbl-workspace/
chmod -R 755 pbl-workspace/
```

### 성능 최적화

#### SSD 사용 환경
```bash
# 빠른 I/O를 위한 임시 디렉토리 설정
export TUTOR_WORKSPACE="/tmp/pbl-workspace"
cp -r pbl-workspace /tmp/
```

#### 메모리 제한 환경
```bash
# Node.js 메모리 제한 설정 (예: 512MB)
node --max-old-space-size=512 src/cli.js
```

## 🔧 고급 설정

### 개발 환경 설정

```bash
# 개발 모드 실행 (nodemon 사용)
npm run dev

# 디버그 모드
DEBUG=tutor:* npm start

# 테스트 실행 (구현 후)
npm test
```

### 사용자 정의 설정

워크스페이스 위치 변경:
```bash
export TUTOR_WORKSPACE="/path/to/your/workspace"
mkdir -p "$TUTOR_WORKSPACE"
cp -r pbl-workspace/* "$TUTOR_WORKSPACE/"
```

언어 설정 (향후 다국어 지원):
```bash
export TUTOR_LANGUAGE="english"  # 현재는 korean만 지원
```

## 📊 사용량 모니터링

### API 사용량 확인
```bash
# 예상 사용량 계산
npm run usage

# 실시간 사용량 (AI 튜터 실행 중)
# → "진도 확인" → API 통계 섹션 확인
```

### 로그 확인
```bash
# 학습 진도 로그
cat pbl-workspace/.tutor-progress/history.json | jq '.'

# 통계 요약
cat pbl-workspace/.tutor-progress/stats.json | jq '.'
```

## 🚀 다음 단계

설치가 완료되면:

1. **첫 문제 도전**: `npm start` → "문제 풀기" → Part 1
2. **AI 튜터 체험**: "AI 튜터에게 질문하기"로 대화 시작  
3. **진도 추적**: 몇 개 문제를 푼 후 "진도 확인"으로 분석 확인
4. **커뮤니티 참여**: GitHub 토론에서 학습 경험 공유

## 🆘 추가 지원

문제가 계속 발생하면:

- **GitHub Issues**: 버그 리포트 및 기술 지원
- **Discussion**: 사용자 커뮤니티 질문
- **AI 튜터**: 설치 후 직접 질문 가능

---

**🎉 설치 완료! 이제 AI 튜터와 함께 데이터 랭글링 마스터 여정을 시작하세요!**