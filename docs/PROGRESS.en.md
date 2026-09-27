# Progress Record

**English** | [한국어](PROGRESS.md)

The status below was checked on 2026-09-27 by reading the code and running `npm start`. Claims from older docs are included only where the code confirms them.

## Final goal

Build a Korean PBL (Problem-Based Learning) workbook that teaches log and data processing with grep, sed, awk and bash pipelines. It has two parts.

1. **Workbook**: 89 problems across 8 parts (regex, pipelines, real-time monitoring, performance, data validation, AWK, security, automation), practice data, reference solutions and benchmark tooling ([docs/REQUEST.md](REQUEST.md), [pbl-workspace/README.md](../pbl-workspace/README.md))
2. **AI (Artificial Intelligence) tutor CLI (Command-Line Interface)**: pick problems, try and submit commands in a shell, get hints, scoring, answers and study recommendations from Google Gemini, and track progress

## Current implementation status

Status values: Implemented / Partial / Not started

### CLI features

| Feature | Status | Code location | Notes |
|---|---|---|---|
| Main menu | Implemented | `src/cli.js` `showMainMenu()` (line 51) | Verified by running |
| Part and problem lists | Implemented | `src/cli.js` `getAvailableParts()` (705), `getProblemsFromPart()` (731) | Reads `parts/*/README.md` titles and `problem-*.md` files |
| Paged problem description | Implemented | `src/cli.js` `displayProblemDescription()` (870) | 15 lines per page |
| Interactive shell (`submit`, `problem`, `help`, `history`, `clear`, `exit`) | Implemented | `src/cli.js` `interactiveShell()` (268), `executeCommand()` (405) | 15 s limit per command, verified by running |
| Running the submitted solution | Implemented | `src/cli.js` `executeSolution()` (546) | Runs a temporary `temp_solution.sh`, 30 s limit |
| Basic scoring (no API (Application Programming Interface) key) | Implemented | `src/cli.js` `evaluateSolution()` (lines 489-517) | 70 (C) on exit code 0, else 30 (F). Output is not compared |
| Gemini scoring | Implemented | `src/services/gemini-api.js` `evaluateSolution()` (67) | Extracts "전체 점수" and "등급" from the reply with a regex. No API key here, so the live call was not verified |
| Hints | Implemented | `src/services/gemini-api.js` `getHint()` (27), `src/cli.js` `getHint()` (231) | Needs API key, live call not verified |
| Ask the AI tutor | Implemented | `src/services/gemini-api.js` `askQuestion()` (207), `src/cli.js` `askTutor()` (660) | Needs API key, live call not verified |
| Recommendations | Implemented | `src/services/gemini-api.js` `analyzeProgress()` (146), `src/services/progress-tracker.js` `generateRecommendations()` (245) | Falls back to rule-based tips if the Gemini call fails; without a key the menu entry is blocked |
| Progress history, stats, weekly activity, badges | Implemented | `src/services/progress-tracker.js` `recordAttempt()` (61), `updateStats()` (104), `getWeeklyStats()` (229), `calculateBadges()` (318) | Verified that a submission shows up in the progress screen |
| Progress file initialization | Partial | `src/services/progress-tracker.js` constructor (11), `initializeProgressDir()` (24) | Async init is not awaited, so the first run fails with `stats.json` ENOENT. Works from the second run |
| `progress` subcommand | Partial | `src/cli.js` line 955 | Works only if progress files already exist; otherwise exits with the same error |
| `usage` subcommand | Implemented | `src/cli.js` line 969, `src/config/tutor-config.js` `estimateMonthlyUsage()` | Cost is always shown as 0 |
| View previous attempts | Not started | `src/cli.js` line 220 | Calls `showProblemHistory()`, which is not defined |
| Settings menu | Not started | `src/cli.js` `showSettings()` (814) | Prints a "still in progress" message only |
| Reset progress | Partial | `src/services/progress-tracker.js` `resetProgress()` (344) | Function exists but is not wired to any menu or command |
| API usage stats | Partial | `src/services/gemini-api.js` `getUsageStats()` (256), `recordSession()` (270) | Never called |
| `TUTOR_WORKSPACE`, `TUTOR_LANGUAGE` env vars | Not started | `src/cli.js` line 22 | Mentioned in the old README; code always uses `<cwd>/pbl-workspace` |
| Reading `.env` | Not started | (none) | No dotenv or similar |
| Local solution runner | Implemented | `scripts/test-local.sh` | Runs a solution and prints output and time; no answer comparison |
| Automated tests | Not started | `package.json` `test:unit` | jest is installed but there are no test files |

### Workbook content

| Item | Status | Location | Notes |
|---|---|---|---|
| Problem files | Partial | `pbl-workspace/parts/` | 8 of the planned 89: Part 1 (#1, 2, 4, 13), Part 2 (#20), Part 4 (#46), Part 6 (#60), Part 7 (#70). No folders for Parts 3, 5, 8 |
| Reference solutions | Partial | `pbl-workspace/solutions/part1-regex/solution-01.sh` | 1 file |
| Practice data | Partial | `pbl-workspace/data/` | `users.csv` (12,000 rows), `transactions.json`, `inventory.xml`, `corrupted_data.txt` exist. `binary_mixed.dat` from the request is missing. All synthetic |
| Log files | Not started | `pbl-workspace/logs/` | Excluded by `logs/` and `*.log` in `.gitignore`. Part 1 and Part 7 problems and the default test data paths point to these files |
| Sample config files | Partial | `pbl-workspace/configs/` | `nginx.conf`, `database.ini` exist. `.env` is git-ignored |
| Reference docs | Implemented | `pbl-workspace/resources/` | Regex cheatsheet, pipeline patterns, performance guide |
| Benchmark script | Implemented | `pbl-workspace/performance/benchmark.sh` | Not run here because the log files are missing |

## Work history

Commit times stored in `git log` (+09:00) are shown in KST (Korea Standard Time, Asia/Seoul).

| Date (KST) | Commit | Summary |
|---|---|---|
| 2025-09-03 02:05 | `85042ec` | First commit: workbook request (`REQUEST.md`), 8 problems and part READMEs under `pbl-workspace/`, practice data, sample configs, reference docs, benchmark script, 1 reference solution |
| 2025-09-06 23:48 | `e9909cd` | Added the AI tutor CLI (`src/cli.js`, Gemini service, progress tracker, config), interactive shell mode, `package.json`, `scripts/test-local.sh`, README and setup guide; revised workbook docs in Korean |
| 2026-09-27 | (this work) | Moved detail docs to `docs/`, split README into Korean/English with screenshots, added this progress record |
