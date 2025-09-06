# Part 1: 고급 정규표현식 패턴
## 15개의 점진적 패턴 매칭 챌린지

이 섹션은 다양한 도구와 상황에서 정규표현식을 마스터하는 데 중점을 둡니다. 문제는 기본 패턴에서 고급 PCRE 기능으로 진행되며, 실제 텍스트 처리 시나리오를 강조합니다.

### 학습 목표
- 기본부터 고급 정규표현식 패턴 마스터하기
- POSIX ERE와 PCRE의 차이점 이해하기
- grep, sed, awk에서 정규표현식 적용하기
- lookahead/lookbehind를 사용한 복잡한 패턴 매칭 다루기
- 캡처링 그룹과 역참조 효과적으로 사용하기
- 대용량 데이터셋에 대한 정규표현식 성능 최적화하기

### 도구 범위
- `grep` (-E와 -P 플래그 포함)
- `sed` (-E 플래그 포함)
- 내장 정규표현식이 있는 `awk`
- 다양한 정규표현식 엔진의 성능 영향

### 문제 카테고리
1. **IP 주소 및 네트워크 검증** (문제 1-3)
2. **이메일 및 연락처 정보** (문제 4-6)
3. **웹 및 URL 처리** (문제 7-9)
4. **로그 파싱 및 타임스탬프** (문제 10-12)
5. **복잡한 텍스트 구조** (문제 13-15)

### 사용 안내
- 각 문제는 필요한 정규표현식 엔진을 명시합니다 (POSIX ERE vs PCRE)
- 솔루션은 문제 설명에 언급된 예외 상황을 처리해야 합니다
- 대용량 파일 처리에 대한 성능 제약사항이 명시되어 있습니다
- `../../logs/` 및 `../../data/`에 제공된 샘플 데이터로 솔루션을 테스트하십시오

---

## 문제 인덱스

| # | 문제 | 난이도 | 엔진 | 사용된 파일 |
|---|------|--------|------|-------------|
| 1 | IPv4 주소 검증 | ★★☆ | POSIX ERE | logs/web_access.log |
| 2 | IPv6 주소 감지 | ★★★ | PCRE | logs/system_events.log |
| 3 | 사설 IP 범위 분류 | ★★★ | POSIX ERE | logs/web_access.log |
| 4 | RFC 준수 이메일 추출 | ★★★ | PCRE | data/users.csv |
| 5 | 이메일 도메인 분석 | ★★☆ | POSIX ERE | data/users.csv |
| 6 | 전화번호 정규화 | ★★★ | PCRE | Multiple files |
| 7 | URL 구성 요소 추출 | ★★★ | PCRE | logs/web_access.log |
| 8 | HTML 태그 매칭 | ★★★ | PCRE | Multiple files |
| 9 | 쿼리 매개변수 파싱 | ★★☆ | POSIX ERE | logs/web_access.log |
| 10 | 다중 형식 타임스탬프 파싱 | ★★★ | PCRE | logs/*.log |
| 11 | 로그 레벨 표준화 | ★★☆ | POSIX ERE | logs/application.log |
| 12 | 날짜 형식 변환 | ★★★ | POSIX ERE | Multiple files |
| 13 | 중첩 괄호 내용 | ★★★★ | PCRE | configs/*.conf |
| 14 | 신용카드 마스킹 | ★★★ | PCRE | data/transactions.json |
| 15 | 비밀번호 강도 검증 | ★★★★ | PCRE | configs/.env |

**난이도 범례:**
- ★★☆ = 중급 (기본 정규표현식 지식)
- ★★★ = 고급 (복잡한 패턴, 그룹)
- ★★★★ = 전문가 (lookahead/lookbehind, 복잡한 역참조)