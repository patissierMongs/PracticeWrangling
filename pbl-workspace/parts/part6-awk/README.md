# Part 6: 고급 AWK 프로그래밍
## 12개의 전문가 AWK 프로그래밍 챌린지

이 섹션은 프로그래밍 언어로서 AWK의 전체 잠재력을 탐구하며, 연관 배열, 사용자 정의 함수, 상태 머신, 다중 파일 처리와 같은 고급 기능을 다룹니다. 문제들은 데이터 처리와 리포트 생성에서 AWK의 고유한 강점을 강조합니다.

### 학습 목표
- AWK의 연관 배열과 데이터 구조 마스터하기
- 사용자 정의 함수와 복잡한 로직 구현하기
- FNR/NR을 사용한 다중 파일 처리 처리하기
- 복잡한 형식 파싱을 위한 상태 머신 구축하기
- 전문가 수준의 리포트 엔진 만들기
- 다른 도구들과 AWK 성능 비교하기
- 현대 데이터 처리에서 AWK의 역할 이해하기

### 다룹되는 고급 AWK 기능
- **연관 배열:** 복잡한 데이터 집계 및 룩업
- **내장 함수:** 문자열, 수학, I/O 함수
- **사용자 정의 함수:** 사용자 정의 재사용 가능한 코드 블록
- **패턴-액션 프로그래밍:** 고급 패턴 매칭
- **다중 파일 처리:** FNR vs NR, FILENAME 변수
- **상태 머신:** 구조화된 텍스트 형식 파싱
- **리포트 생성:** 전문가 수준의 형식화된 출력

---

## 문제 인덱스

| # | 문제 | 난이도 | 중점 영역 | 사용된 파일 |
|---|---------|----------|----------|-------------|
| 58 | 다중 파일 데이터 집계 | ★★★ | FNR/NR, 배열 | logs/*.log |
| 59 | 사용자 정의 함수 라이브러리 | ★★★ | 함수, 모듈화 | Multiple files |
| 60 | 상태 머신 로그 파서 | ★★★★ | 상태 머신 | logs/application.log |
| 61 | 고급 리포트 엔진 | ★★★★ | 포매팅, 출력 | All data files |
| 62 | 연관 배열 마스터리 | ★★★ | 복잡한 데이터 구조 | data/*.csv |
| 63 | 실시간 AWK 대시보드 | ★★★★ | 지속적 처리 | logs/realtime.log |
| 64 | 복잡한 조인 연산 | ★★★ | 다중 파일 상관관계 | data/*.csv |
| 65 | AWK vs Python 성능 | ★★★ | 벤치마크 | Large datasets |
| 66 | 설정 파서 | ★★★★ | 구조화된 파싱 | configs/*.conf |
| 67 | 데이터 변환 엔진 | ★★★★ | 형식 변환 | Multiple formats |
| 68 | 통계 분석 스위트 | ★★★★ | 수학 함수 | data/*.csv |
| 69 | AWK 웹 로그 분석기 | ★★★★★ | 완전한 애플리케이션 | logs/web_access.log |

**난이도 범례:**
- ★★★ = 고급 (복잡한 배열, 함수)
- ★★★★ = 전문가 (상태 머신, 복잡한 로직)
- ★★★★★ = 마스터 (완전한 애플리케이션)

## 고급 AWK 프로그래밍 패턴

### 1. 데이터 처리를 위한 연관 배열
```awk
# 다차원 배열
user_activity[user][date][action] = count

# 배열의 배열 패턴
split(line, fields, ",")
for (i = 1; i <= length(fields); i++) {
    data[NR][i] = fields[i]
}

# 정렬된 배열 처리 (GNU AWK)
PROCINFO["sorted_in"] = "@ind_str_asc"
for (key in array) {
    # 정렬된 순서로 처리
}
```

### 2. 사용자 정의 함수 예제
```awk
# 날짜 조작 함수
function date_to_epoch(date_str) {
    # YYYY-MM-DD를 에포크 시간으로 변환
    split(date_str, parts, "-")
    return mktime(parts[1] " " parts[2] " " parts[3] " 0 0 0")
}

# 고급 문자열 처리
function extract_domain(email) {
    if (match(email, /@([^@]+)$/, domain)) {
        return domain[1]
    }
    return ""
}

# 통계 함수
function mean(array, size) {
    sum = 0
    for (i = 1; i <= size; i++) {
        sum += array[i]
    }
    return sum / size
}
```

### 3. 상태 머신 구현
```awk
# 다중 라인 로그 항목 파서
state == "READING_STACKTRACE" && /^[[:space:]]/ {
    stacktrace[current_error] = stacktrace[current_error] "\n" $0
    next
}

/^ERROR/ {
    state = "READING_STACKTRACE"  
    current_error = NR
    error_line[current_error] = $0
    next
}

{
    state = "NORMAL"
}
```

### 4. 다중 파일 처리 패턴
```awk
# FILENAME에 기반하여 다른 파일을 다르게 처리
FILENAME ~ /\.log$/ {
    # 로그 파일 처리
    log_entries[FNR] = $0
}

FILENAME ~ /\.csv$/ {
    # CSV 파일 처리
    if (FNR == 1) {
        # 헤더 행
        for (i = 1; i <= NF; i++) {
            headers[FILENAME][i] = $i
        }
    } else {
        # 데이터 행
        for (i = 1; i <= NF; i++) {
            data[FILENAME][FNR][i] = $i
        }
    }
}

# END 블록에서 파일 간 상관관계
END {
    # 다른 파일의 데이터와 상관관계 분석
    for (log_line in log_entries) {
        # CSV 데이터와 매치
    }
}
```

## 전문가 수준 AWK 개발 관행

### 1. 모듈화 AWK 프로그래밍
```awk
# lib/common.awk - 공유 함수
function debug(msg) {
    if (DEBUG) print "DEBUG:", msg > "/dev/stderr"
}

function format_number(num, decimals) {
    return sprintf("%." decimals "f", num)
}

# main.awk - 메인 프로그램
@include "lib/common.awk"

BEGIN {
    DEBUG = (ENVIRON["DEBUG"] ? 1 : 0)
}

{
    debug("Processing line: " NR)
    # 메인 처리 로직
}
```

### 2. 오류 처리 및 검증
```awk
# 입력 검증
NF < expected_fields {
    print "ERROR: Line " NR " has insufficient fields" > "/dev/stderr"
    errors++
    next
}

# 숫자 검증
function is_numeric(value) {
    return (value ~ /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?$/)
}

# 날짜 검증
function is_valid_date(date_str) {
    return (date_str ~ /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
}
```

### 3. 성능 최적화
```awk
# 문자열 연결을 효율적으로 사용
output = output separator line  # 여러 print 문보다 더 나음

# 반복된 정규표현식 컴파일 피하기
BEGIN { date_pattern = "^[0-9]{4}-[0-9]{2}-[0-9]{2}" }
$1 ~ date_pattern { ... }  # $1 ~ /^[0-9]{4}-[0-9]{2}-[0-9]{2}/보다 더 나음

# 반복 검색 대신 룩업에 배열 사용
BEGIN {
    valid_codes["200"] = valid_codes["301"] = valid_codes["404"] = 1
}
valid_codes[$3] { ... }  # $3 == "200" || $3 == "301" || ...보다 더 나음
```

## 고급 문제 카테고리

### 데이터 집계 및 분석
- 다차원 데이터 구조
- 복잡한 통계 계산
- 시계열 분석
- 교차표 및 피벗 테이블

### 텍스트 처리 및 파싱
- 상태 머신 구현
- 복잡한 형식 파싱 (JSON, XML, 설정 파일)
- 다중 라인 레코드 처리
- 프로토콜 파싱

### 리포트 생성
- 전문가 수준 포매팅
- 동적 테이블 생성
- 차트와 그래프 ASCII 아트
- 요약 통계

### 시스템 통합
- 파일 처리 워크플로우
- 데이터 변환 파이프라인
- 실시간 데이터 처리
- 다른 Unix 도구와의 인터페이스

## AWK vs 다른 도구 비교

### AWK를 선택할 때
✅ **강점:**
- 패턴-액션 프로그래밍 모델
- 내장 필드 분할 및 레코드 처리
- 데이터 집계를 위한 연관 배열
- 구조화된 텍스트 처리에 우수
- 중간 크기 데이터셋에서 빠름
- 외부 의존성 없음

❌ **제한사항:**
- Perl에 비해 제한된 문자열 조작
- 내장 JSON/XML 파싱 기능 없음
- 대용량 데이터셋에서 메모리 사용량 증가
- 제한된 디버깅 기능
- 플랫폼 특정 확장 (GAWK vs MAWK)

### 성능 비교 프레임워크
```bash
# 다른 도구로 동일한 작업 테스트
time awk 'your_awk_solution' data.txt
time perl -ne 'your_perl_solution' data.txt  
time python -c 'your_python_solution' data.txt
time sed/grep/sort pipeline
```