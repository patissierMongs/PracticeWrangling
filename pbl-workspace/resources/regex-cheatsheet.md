# 정규 표현식 치트 시트
## 명령줄 도구 비교

이 치트 시트는 이 워크북에서 사용하는 주요 명령줄 도구들 간의 정규식 문법 차이점을 다룹니다.

---

## 도구 비교 매트릭스

| 기능 | grep | grep -E | grep -P | sed | awk | perl |
|------|------|---------|---------|-----|-----|------|
| **기본 패턴** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **확장 패턴** | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| **전방/후방 탐색** | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| **비탐욕적** | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| **역참조** | ✗ | 제한적 | ✓ | ✓ | ✗ | ✓ |
| **유니코드** | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| **성능** | 빠름 | 빠름 | 보통 | 빠름 | 보통 | 느림 |

---

## 기본 패턴 (모든 도구)

### 문자 클래스
```regex
.           # 개행문자를 제외한 모든 문자
[abc]       # 문자 집합 (a, b, 또는 c)  
[^abc]      # 부정 집합 (a, b, c가 아닌 문자)
[a-z]       # 문자 범위
[[:alpha:]] # POSIX 문자 클래스
\d          # 숫자 (PCRE 전용)
\w          # 단어 문자 (PCRE 전용)
\s          # 공백문자 (PCRE 전용)
```

### 수량자
```regex
*           # 0개 이상
+           # 1개 이상  
?           # 0개 또는 1개
{n}         # 정확히 n번
{n,}        # n번 이상
{n,m}       # n번에서 m번 사이
```

### 앵커
```regex
^           # 줄의 시작
$           # 줄의 끝
\b          # 단어 경계
\<          # 단어의 시작 (일부 도구)
\>          # 단어의 끝 (일부 도구)
```

---

## 확장 패턴 (ERE: grep -E, awk)

### 교대
```regex
cat|dog     # "cat" 또는 "dog" 매치
(red|blue)  # 교대와 함께 그룹핑
```

### 그룹핑
```regex
(abc)+      # "abc" 그룹 반복
(a|b)c      # "ac" 또는 "bc"
```

### 실용적인 예시
```bash
# 이메일 패턴 (기본 ERE)
grep -E '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

# IP 주소 (ERE)
grep -E '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'

# 날짜 형식 (ERE)  
grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'  # YYYY-MM-DD
```

---

## PCRE 기능 (grep -P, perl)

### 고급 수량자
```regex
*?          # 비탐욕적 0개 이상
+?          # 비탐욕적 1개 이상
{n,m}?      # 비탐욕적 범위
```

### 전방/후방 탐색
```regex
(?=...)     # 긍정 전방 탐색
(?!...)     # 부정 전방 탐색
(?<=...)    # 긍정 후방 탐색
(?<!...)    # 부정 후방 탐색
```

### 문자 단축키
```regex
\d          # [0-9]
\D          # [^0-9]
\w          # [a-zA-Z0-9_]
\W          # [^a-zA-Z0-9_]
\s          # [ \t\n\r\f]
\S          # [^ \t\n\r\f]
```

### 고급 예시
```bash
# 프로토콜이 있는 URL 추출
grep -Po 'https?://[^\s<>"]+' file.txt

# 비밀번호 유효성 검사 (8자 이상, 숫자와 특수문자 포함)
grep -P '^(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})'

# 전방 탐색 유효성 검사가 있는 이메일
grep -Po '(?=.*@)(?=.*\.[a-z]{2,})[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'

# 이스케이프된 인용부호 처리를 포함한 인용문자열 추출
grep -Po '"(?:[^"\\]|\\.)*"'
```

---

## 도구별 문법

### grep 예시
```bash
# 기본 패턴 (BRE)
grep 'pattern' file.txt
grep '^start' file.txt
grep 'end$' file.txt

# 확장 패턴 (ERE)
grep -E '(cat|dog)+' file.txt
grep -E '\b[0-9]{3}-[0-9]{3}-[0-9]{4}\b' file.txt

# Perl 패턴 (PCRE)
grep -P '\d+\.\d+\.\d+\.\d+' file.txt
grep -P '(?i)error.*(?=critical)' file.txt
```

### sed 예시
```bash
# 기본 치환 (BRE)
sed 's/old/new/' file.txt
sed 's/\([a-z]*\)/\U\1/' file.txt  # 대문자 변환 캐처

# 확장 치환
sed -E 's/([0-9]+)-([0-9]+)-([0-9]+)/\3\/\2\/\1/' file.txt

# 여러 작업
sed -e 's/foo/bar/' -e 's/baz/qux/' file.txt
```

### awk 예시
```bash
# 필드 기반 패턴
awk '/pattern/ {print $2}' file.txt
awk '$1 ~ /^[0-9]+$/ {print "Number:", $1}' file.txt

# 내장 정규식 함수
awk '{if (match($0, /([0-9]+)/, arr)) print arr[1]}' file.txt
awk '{gsub(/old/, "new"); print}' file.txt

# 대소문자 구분 없는 매칭
awk 'IGNORECASE=1; /pattern/ {print}' file.txt
```

---

## 성능 비교

### 속도 순위 (가장 빠른 것부터 느린 것까지)
1. **grep (BRE)** - 단순한 패턴에 가장 빠름
2. **grep -E** - 확장 패턴에 빠름  
3. **sed** - 치환에 빠름
4. **awk** - 보통 속도, 매우 유연함
5. **grep -P** - PCRE 엔진으로 인해 느림
6. **perl** - 가장 느리지만 가장 강력함

### 각 도구를 사용할 때

#### `grep` (BRE) 사용 대상:
- 단순한 리터럴 문자연 검색
- 기본 패턴 매칭
- 최대 속도 요구사항
- 대용량 파일 처리

#### `grep -E` 사용 대상:
- 교대가 있는 확장 패턴
- 복잡한 문자 클래스
- 속도 + 적당한 복잡성이 필요한 경우

#### `grep -P` 사용 대상:
- 전방/후방 탐색 어설션
- 비탐욕적 수량자
- 유니코드 지원
- 복잡한 패턴 유효성 검사

#### `sed` 사용 대상:
- 텍스트 치환 및 편집
- 스트림 편집 작업
- 단순한 역참조 사용
- 파이프라인 텍스트 변환

#### `awk` 사용 대상:
- 필드 기반 처리
- 계산 및 데이터 분석
- 복잡한 다중 조건 로직
- 보고서 생성

#### `perl` 사용 대상:
- 가장 복잡한 정규식 기능
- 고급 로직을 가진 원라이너
- 유니코드 및 국제 텍스트
- 다른 도구로 충분하지 않은 경우

---

## 일반적인 함정과 해결책

### 이스케이프 차이
```bash
# BRE (grep, sed 기본값)
grep '\(pattern\)'     # 괄호는 이스케이프 필요
grep '\+\?'            # +와 ?는 이스케이프 필요

# ERE (grep -E, awk)
grep -E '(pattern)'    # 이스케이프 불필요
grep -E '+?'           # 이스케이프 불필요

# PCRE (grep -P, perl)
grep -P '(?:pattern)'  # 비캐처링 그룹 사용 가능
```

### 단어 경계
```bash
# POSIX 단어 경계 (대부분의 도구)
grep '\bword\b'

# 대체 단어 경계
grep '\<word\>'

# PCRE 단어 경계
grep -P '\bword\b'
```

### 대소문자 구분
```bash
# 대소문자 구분 없는 옵션
grep -i 'pattern'
grep -E -i 'pattern'  
grep -P -i 'pattern'
sed 's/pattern/replacement/I'  # GNU sed
awk 'IGNORECASE=1; /pattern/'
```

---

## 정규식 디버깅

### 테스트 전략
```bash
# 단계별 테스트
echo "test string" | grep -E 'simple'
echo "test string" | grep -E 'simple|pattern'  
echo "test string" | grep -E '(simple|pattern)'

# 정확한 매치를 보기 위해 -o 사용
grep -Eo 'pattern' file.txt

# 줄 번호를 보기 위해 -n 사용
grep -En 'pattern' file.txt

# 상세 모드로 테스트 (사용 가능한 경우)
grep -P '(?# comment)pattern' file.txt
```

### 일반적인 디버깅 도구
```bash
# 온라인 정규식 테스터 (테스트할 패턴 복사)
# regex101.com - PCRE에 우수함
# regexpal.com - JavaScript 정규식
# regexr.com - 시각적 정규식 빌더

# 명령줄 테스트
printf "test\nstring\nhere" | grep -E 'your_pattern'

# 실행 추적 (일부 도구)
grep --debug 'pattern' file.txt  # 사용 가능한 경우
```

---

## 모범 사례

### 1. 올바른 도구 선택
- 작동하는 가장 단순한 도구부터 시작
- 성능 요구사항 고려  
- 복잡성을 도구 기능과 매칭

### 2. 패턴 최적화
- 가장 선택적인 부분을 첫 번째로 배치
- 가능하면 교대 대신 문자 클래스 사용
- 가능할 때 패턴 고정

### 3. 철저한 테스트
- 에지 케이스로 테스트
- 다양한 입력 크기로 검증
- 인코딩 및 로케일 문제 확인

### 4. 복잡한 패턴 문서화
```bash
# 좋음: 문서화된 복잡한 패턴
IP_PATTERN='^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
# IPv4 매치: 각 옥텏에 대해 0-255

grep -E "$IP_PATTERN" file.txt
```