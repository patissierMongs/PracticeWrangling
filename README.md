# PracticeWrangling

grep, sed, awk 같은 명령줄 도구로 데이터 다루는 법을 문제를 풀며 익히는 한국어 CLI(Command-Line Interface) 학습 도구입니다.

[English](README.en.md) | **한국어**

![실행 흐름](docs/images/demo.gif)

위 화면은 이 저장소에서 `npm start`를 실제로 실행해 캡처했습니다. `GEMINI_API_KEY` 없이 실행했기 때문에 평가는 기본 채점으로 표시됩니다.

| 메인 메뉴 | 문제 목록 |
|---|---|
| ![메인 메뉴](docs/images/main-menu.png) | ![문제 목록](docs/images/problem-list.png) |

| 인터랙티브 셸 | 평가 결과 | 학습 진도 |
|---|---|---|
| ![인터랙티브 셸](docs/images/interactive-shell.png) | ![평가 결과](docs/images/evaluation.png) | ![학습 진도](docs/images/progress.png) |

## 주요 기능

- **문제 풀기**: `pbl-workspace/parts/` 아래의 문제 파일(Markdown)을 파트별로 골라 읽습니다. 긴 문제 설명은 페이지 단위로 넘겨 봅니다.
- **인터랙티브 셸**: `shell>` 프롬프트에서 bash 명령을 바로 실행합니다. 명령은 `pbl-workspace/` 디렉터리에서 실행되며 15초가 지나면 중단됩니다. 성공한 명령은 기록되고 `submit`으로 한꺼번에 제출합니다.
  - 셸 전용 명령: `submit`, `problem`, `help`, `history`, `clear`, `exit`
- **평가**
  - `GEMINI_API_KEY`가 있으면 Google Gemini(`gemini-2.5-pro`)가 정확성, 성능, 코드 품질, 예외 상황 처리를 채점하고 피드백을 줍니다.
  - 키가 없으면 제출한 명령이 정상 종료했는지만 보고 70점(C) 또는 30점(F)을 줍니다.
- **AI(Artificial Intelligence) 튜터 질문과 맞춤 추천**: 메뉴에서 자유 질문을 하거나 지금까지의 기록을 바탕으로 학습 추천을 받습니다. `GEMINI_API_KEY`가 필요합니다.
- **진도 기록**: 시도 이력, 평균 점수, 파트별 점수, 이번 주 활동, 배지를 `pbl-workspace/.tutor-progress/`에 JSON(JavaScript Object Notation) 파일로 저장합니다.
- **보조 명령**: `progress`(진도 요약), `usage`(월간 토큰 사용량 예측)
- **실습 자료**: CSV(Comma-Separated Values), JSON, XML(eXtensible Markup Language) 형식의 가상 데이터, 설정 파일 예시, 정규식과 파이프라인 참고 문서, 성능 측정 스크립트(`pbl-workspace/performance/benchmark.sh`)

현재 들어 있는 문제는 5개 파트, 8개입니다. 화면에 보이는 "89문제"는 계획된 전체 수이며 아직 모두 작성되지 않았습니다. 자세한 상태는 [진행 기록](docs/PROGRESS.md)에 정리했습니다.

## 사용 방법

### 1. 설치

Node.js와 npm(Node Package Manager), bash가 필요합니다. Node.js 22에서 실행을 확인했습니다.

```bash
git clone https://github.com/patissierMongs/PracticeWrangling.git
cd PracticeWrangling
npm install
```

### 2. Gemini 키 설정 (선택)

AI 튜터 기능을 쓰려면 Google AI Studio에서 발급한 API(Application Programming Interface) 키를 환경변수로 지정합니다. 코드는 `.env` 파일을 읽지 않으므로 셸에서 직접 설정해야 합니다.

```bash
export GEMINI_API_KEY="your-api-key"
```

키가 없어도 문제 풀기, 인터랙티브 셸, 기본 채점, 진도 기록은 동작합니다.

### 3. 실행

저장소 루트에서 실행해야 합니다. 프로그램은 현재 디렉터리 아래의 `pbl-workspace/`를 찾습니다.

```bash
npm start
```

처음 실행할 때 `stats.json`을 찾지 못한다는 오류가 나면 한 번 더 실행하면 됩니다. 진도 파일을 만드는 작업이 끝나기 전에 읽기를 시도하는 문제가 있습니다.

### 4. 기본 사용 순서

1. 메인 메뉴에서 **📚 문제 풀기**를 고릅니다.
2. 파트와 문제를 고르고 **✏️ 솔루션 작성**을 누릅니다.
3. 문제 설명을 넘겨 본 뒤 `shell>` 프롬프트에서 명령을 시험합니다.
   ```text
   shell> cut -d, -f2,7,8 data/users.csv | head -4
   shell> awk -F, 'NR>1 {print $7}' data/users.csv | sort | uniq -c | sort -rn
   ```
4. `history`로 기록된 명령을 확인하고 `submit`으로 제출합니다.
5. 평가 결과를 본 뒤 다시 시도하거나 다른 문제로 넘어갑니다.
6. **📊 진도 확인**에서 누적 기록을 봅니다.

### 5. 그 밖의 명령

```bash
node src/cli.js --help      # 명령 목록
node src/cli.js progress    # 진도 요약 (진도 파일이 있어야 함)
node src/cli.js usage       # 월간 토큰 사용량 예측
npm run test:local -- 01 <답안파일.sh>   # 답안 스크립트를 로컬에서 실행
```

`pbl-workspace/logs/` 디렉터리는 `.gitignore`에 포함되어 저장소에 없습니다. `logs/web_access.log` 같은 로그 파일을 쓰는 문제는 파일을 따로 준비해야 합니다. `data/` 아래 파일은 바로 쓸 수 있습니다.

## 기술 스택

| 구분 | 내용 |
|---|---|
| 언어 | JavaScript(Node.js, CommonJS), Bash |
| CLI | commander ^12.0.0, inquirer ^8.2.6, chalk ^4.1.2, ora ^5.4.1 |
| AI | @google/generative-ai ^0.21.0 (모델 `gemini-2.5-pro`) |
| 파일 처리 | fs-extra ^11.2.0 |
| 개발 도구 | nodemon ^3.1.0, jest ^29.7.0 (테스트 파일은 아직 없음) |

`package.json`에는 yaml, marked, marked-terminal도 의존성으로 적혀 있지만 현재 코드에서 불러오지 않습니다.

## 문서

- [진행 기록](docs/PROGRESS.md): 최종 목표, 기능별 구현 상태, 작업 이력
- [설치 가이드](docs/SETUP.md): 설치와 문제 해결
- [워크북 요청서](docs/REQUEST.md): 문제 구성에 대한 최초 요구사항
- [워크북 안내](pbl-workspace/README.md), [시작하기](pbl-workspace/GETTING_STARTED.md)

## 라이선스

`package.json`에 MIT 라이선스로 표기되어 있습니다. 별도의 LICENSE 파일은 없습니다.
