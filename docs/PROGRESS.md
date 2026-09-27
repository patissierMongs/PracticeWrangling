# 진행 기록

[English](PROGRESS.en.md) | **한국어**

이 문서의 상태는 2026-09-27에 코드를 직접 읽고 `npm start`를 실행해 확인한 결과다. 기존 문서의 설명은 코드로 확인한 경우에만 반영했다.

## 최종 목표

grep, sed, awk, bash 파이프라인으로 로그와 데이터를 다루는 실력을 문제 풀이로 기르는 한국어 PBL(Problem-Based Learning) 워크북을 만든다. 구성 요소는 두 가지다.

1. **워크북**: 8개 파트(정규식, 파이프라인, 실시간 모니터링, 성능, 데이터 검증, AWK, 보안, 자동화)에 걸친 89개 문제, 실습 데이터, 참조 솔루션, 성능 측정 도구 ([docs/REQUEST.md](REQUEST.md), [pbl-workspace/README.md](../pbl-workspace/README.md))
2. **AI(Artificial Intelligence) 튜터 CLI(Command-Line Interface)**: 문제 선택, 셸에서 명령 시험과 제출, Google Gemini를 이용한 힌트, 채점, 질문 답변, 학습 추천, 진도 기록

## 현재 구현 상태

상태 표기: 구현됨 / 부분 구현 / 미구현

### CLI 기능

| 기능 | 상태 | 확인한 코드 위치 | 비고 |
|---|---|---|---|
| 메인 메뉴 | 구현됨 | `src/cli.js` `showMainMenu()` (51행) | 실행해서 확인 |
| 파트, 문제 목록 | 구현됨 | `src/cli.js` `getAvailableParts()` (705행), `getProblemsFromPart()` (731행) | `parts/*/README.md` 제목과 `problem-*.md` 파일을 읽음 |
| 문제 설명 페이지 넘김 | 구현됨 | `src/cli.js` `displayProblemDescription()` (870행) | 15줄 단위 |
| 인터랙티브 셸 (`submit`, `problem`, `help`, `history`, `clear`, `exit`) | 구현됨 | `src/cli.js` `interactiveShell()` (268행), `executeCommand()` (405행) | 명령당 15초 제한, 실행해서 확인 |
| 제출한 솔루션 실행 | 구현됨 | `src/cli.js` `executeSolution()` (546행) | 임시 스크립트 `temp_solution.sh`로 실행, 30초 제한 |
| 기본 채점 (API(Application Programming Interface) 키 없음) | 구현됨 | `src/cli.js` `evaluateSolution()` (489~517행) | 정상 종료면 70점(C), 아니면 30점(F). 출력 내용은 비교하지 않음 |
| Gemini 채점 | 구현됨 | `src/services/gemini-api.js` `evaluateSolution()` (67행) | 응답 문자열에서 "전체 점수", "등급"을 정규식으로 추출. 이 환경에는 API 키가 없어 실제 호출은 확인하지 못함 |
| 힌트 | 구현됨 | `src/services/gemini-api.js` `getHint()` (27행), `src/cli.js` `getHint()` (231행) | API 키 필요, 실제 호출 미확인 |
| AI 튜터 질문 | 구현됨 | `src/services/gemini-api.js` `askQuestion()` (207행), `src/cli.js` `askTutor()` (660행) | API 키 필요, 실제 호출 미확인 |
| 맞춤 추천 | 구현됨 | `src/services/gemini-api.js` `analyzeProgress()` (146행), `src/services/progress-tracker.js` `generateRecommendations()` (245행) | Gemini 호출이 실패하면 규칙 기반 추천을 보여줌. 키가 없으면 메뉴 진입 자체를 막음 |
| 진도 기록, 통계, 주간 활동, 배지 | 구현됨 | `src/services/progress-tracker.js` `recordAttempt()` (61행), `updateStats()` (104행), `getWeeklyStats()` (229행), `calculateBadges()` (318행) | 제출 후 진도 화면에 반영되는 것을 실행해서 확인 |
| 진도 파일 초기화 | 부분 구현 | `src/services/progress-tracker.js` 생성자 (11행), `initializeProgressDir()` (24행) | 생성자에서 비동기 초기화를 기다리지 않아 첫 실행에서 `stats.json` ENOENT 오류가 남. 두 번째 실행부터 정상 |
| `progress` 하위 명령 | 부분 구현 | `src/cli.js` 955행 | 진도 파일이 이미 있어야 동작. 파일이 없으면 위와 같은 오류로 종료 |
| `usage` 하위 명령 | 구현됨 | `src/cli.js` 969행, `src/config/tutor-config.js` `estimateMonthlyUsage()` | 비용은 항상 0으로 표시 |
| 이전 시도 보기 | 미구현 | `src/cli.js` 220행 | `showProblemHistory()`를 호출하지만 메서드가 정의되어 있지 않음 |
| 설정 메뉴 | 미구현 | `src/cli.js` `showSettings()` (814행) | "아직 구현 중" 메시지만 출력 |
| 진도 초기화 | 부분 구현 | `src/services/progress-tracker.js` `resetProgress()` (344행) | 함수만 있고 메뉴나 명령에 연결되지 않음 |
| API 사용량 통계 | 부분 구현 | `src/services/gemini-api.js` `getUsageStats()` (256행), `recordSession()` (270행) | 어디에서도 호출하지 않음 |
| `TUTOR_WORKSPACE`, `TUTOR_LANGUAGE` 환경변수 | 미구현 | `src/cli.js` 22행 | 이전 README에 적혀 있었으나 코드는 항상 `현재 디렉터리/pbl-workspace`를 사용 |
| `.env` 파일 읽기 | 미구현 | (없음) | dotenv 등을 쓰지 않음 |
| 로컬 답안 실행 스크립트 | 구현됨 | `scripts/test-local.sh` | 답안 스크립트를 실행하고 출력과 시간을 보여줌. 정답 비교는 없음 |
| 자동 테스트 | 미구현 | `package.json` `test:unit` | jest는 설치되지만 테스트 파일이 없음 |

### 워크북 콘텐츠

| 항목 | 상태 | 위치 | 비고 |
|---|---|---|---|
| 문제 파일 | 부분 구현 | `pbl-workspace/parts/` | 계획 89개 중 8개. Part 1(1, 2, 4, 13번), Part 2(20번), Part 4(46번), Part 6(60번), Part 7(70번). Part 3, 5, 8은 폴더가 없음 |
| 참조 솔루션 | 부분 구현 | `pbl-workspace/solutions/part1-regex/solution-01.sh` | 1개 |
| 실습 데이터 | 부분 구현 | `pbl-workspace/data/` | `users.csv`(12,000행), `transactions.json`, `inventory.xml`, `corrupted_data.txt`는 있음. 요청서의 `binary_mixed.dat`은 없음. 모두 가상 데이터 |
| 로그 파일 | 미구현 | `pbl-workspace/logs/` | `.gitignore`의 `logs/`, `*.log` 때문에 저장소에 없음. Part 1, Part 7 문제와 기본 테스트 데이터 경로가 이 파일을 가리킴 |
| 설정 파일 예시 | 부분 구현 | `pbl-workspace/configs/` | `nginx.conf`, `database.ini`는 있음. `.env`는 `.gitignore` 대상이라 없음 |
| 참고 문서 | 구현됨 | `pbl-workspace/resources/` | 정규식 치트시트, 파이프라인 패턴, 성능 가이드 |
| 성능 측정 스크립트 | 구현됨 | `pbl-workspace/performance/benchmark.sh` | 이 환경에서는 로그 파일이 없어 실행하지 않음 |

## 작업 이력

`git log`에 저장된 커밋 시각(+09:00)을 KST(Korea Standard Time, Asia/Seoul)로 적었다.

| 날짜 (KST) | 커밋 | 내용 |
|---|---|---|
| 2025-09-03 02:05 | `85042ec` | 첫 커밋. 워크북 요청서(`REQUEST.md`), `pbl-workspace/` 문제 8개와 파트별 README, 실습 데이터, 설정 파일 예시, 참고 문서, 성능 측정 스크립트, 참조 솔루션 1개 |
| 2025-09-06 23:48 | `e9909cd` | AI 튜터 CLI 추가(`src/cli.js`, Gemini 서비스, 진도 추적, 설정), 인터랙티브 셸 모드, `package.json`, `scripts/test-local.sh`, README와 설치 가이드 작성, 워크북 문서 한국어 정리 |
| 2026-09-27 | (이번 작업) | 상세 문서를 `docs/`로 이동, README 한국어/영어 분리와 화면 캡처 추가, 이 진행 기록 작성 |
