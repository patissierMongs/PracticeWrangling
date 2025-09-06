# 문제 4: RFC 준수 이메일 추출
**난이도:** ★★★ | **엔진:** PCRE | **파일:** `data/users.csv`

## 목표
RFC 5322 사양에 따라 이메일 주소를 추출하고 검증하며, 예외 상황과 국제 도메인을 처리합니다.

## 문제 설명
사용자 CSV에는 다양한 형식의 이메일 주소가 포함되어 있으며, 일부는 기술적으로 유효하지만 비정상적인 것들입니다. 여러분의 작업은 다음과 같습니다:

1. CSV 파일에서 모든 이메일 주소 추출
2. RFC 5322 사양에 따라 검증
3. 도메인 유형별로 분류 (일반, 교육, 국제)
4. 의심스럽거나 잘못된 주소 식별

## RFC 5322 준수 요구사항
다음 이메일 형식의 복잡성을 처리하세요:
- **로컬 부분:** 문자, 숫자, 특수 문자: `! # $ % & ' * + - / = ? ^ _ ` { | } ~`
- **인용된 문자열:** `"john doe"@example.com`
- **도트 표기법:** `john.doe@example.com` (`john..doe@example.com` 아님)
- **국제 도메인:** `user@münchen.de`, `test@xn--mnchen-3ya.de`
- **서브도메인 깊이:** `user@mail.subdomain.example.com`
- **IP 리터럴:** `user@[192.168.1.1]`, `user@[IPv6:2001:db8::1]`

## 요구사항
- 고급 기능(lookbehind 등)을 위해 PCRE 사용
- `grep -P`에서 작동해야 함
- 국제 도메인의 Unicode 처리
- 연속된 도트 검증 (무효)
- 최대 길이 제한 확인 (로컬 64자, 도메인 255자)

## 예상 출력 형식
```
VALID EMAILS BY CATEGORY:
=========================

COMMON DOMAINS:
john.doe@gmail.com
jane.smith@yahoo.com
admin@outlook.com

EDUCATIONAL:
student@university.edu
prof@college.edu

BUSINESS DOMAINS:
contact@company.com
support@business.org

INTERNATIONAL:
user@münchen.de
test@παράδειγμα.δοκιμή

SUSPICIOUS/UNUSUAL:
"test user"@example.com (quoted local part)
user@[192.168.1.1] (IP literal)

INVALID:
user@domain..com (consecutive dots)
toolongusername123456789012345678901234567890@domain.com (local part too long)
user@domain (missing TLD)

STATISTICS:
Valid emails: 8,432
Invalid emails: 245  
Suspicious emails: 67
```

## 테스트 케이스
솔루션은 다음을 올바르게 분류해야 합니다:

**유효한 것:**
- `simple@example.com`
- `user.name+tag@example.com`
- `"john doe"@example.com`
- `user@münchen.de`

**무효한 것:**
- `user@domain..com` (연속된 도트)
- `user@domain` (TLD 없음)
- `user@@example.com` (이중 @)
- `user..name@example.com` (로컬의 연속된 도트)

## 샘플 명령 구조
```bash
# Extract email addresses with PCRE
grep -Po "YOUR_RFC_EMAIL_REGEX" ../../data/users.csv | \
    while read email; do
        # Validate and categorize each email
        if [[ "$email" =~ \.edu$ ]]; then
            echo "EDUCATIONAL: $email"
        elif [[ "$email" =~ \[.*\] ]]; then
            echo "SUSPICIOUS: $email (IP literal)"
        # ... more categorization logic
        fi
    done | sort
```

## 고급 검증 검사

1. **길이 검증:**
   ```bash
   # Check local part length (max 64 chars)
   local_part=$(echo "$email" | cut -d'@' -f1)
   [ ${#local_part} -le 64 ] || echo "INVALID: local part too long"
   ```

2. **연속된 도트 감지:**
   ```bash
   # Invalid: consecutive dots anywhere
   [[ "$email" =~ \.\. ]] && echo "INVALID: consecutive dots"
   ```

3. **국제 도메인 처리:**
   ```bash
   # Detect punycode (xn--) domains
   [[ "$email" =~ @.*xn-- ]] && echo "PUNYCODE: $email"
   ```

## PCRE 패턴 복잡성
전체 RFC 5322 정규표현식은 매우 복잡합니다. 점진적으로 구축하는 것을 고려하세요:

```regex
# 기본 구조 (단순화됨)
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$

# 인용된 로컬 부분 포함
^("([^"\\]|\\.)*"|[a-zA-Z0-9._%+-]+)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$

# 전체 RFC 준수 (수백 개의 문자!)
```

## 성능 최적화
- 복잡한 검증을 여러 단계로 분할
- 초기 추출에는 단순한 정규표현식 사용
- 후속 단계에서 세부 검증 적용
- 대용량 CSV 파일에 대한 메모리 사용량 고려

## 예외 상황 처리
1. **CSV 파싱:** 인용된 CSV 필드 내의 이메일 주소
2. **인코딩:** UTF-8 국제 문자
3. **공백:** 이메일 주변의 앞뒤 공백
4. **대소문자 구분:** 도메인명은 대소문자를 구분하지 않음

---
**이전:** [문제 3: 사설 IP 범위 분류](problem-03.md) | **다음:** [문제 5: 이메일 도메인 분석](problem-05.md)