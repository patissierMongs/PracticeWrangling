# Part 2: 다단계 파이프라인 처리
## 15개의 복잡한 명령 체인 챌린지

이 섹션은 여러 도구를 효과적으로 결합하는 정교한 명령 파이프라인을 구축하는 데 중점을 둡니다. 문제는 간단한 2-3 명령 체인에서 프로세스 치환과 서브셸을 사용한 고급 6+ 명령 시퀀스로 진행됩니다.

### 학습 목표
- 복잡한 명령 체이닝과 파이프라인 구축 마스터하기
- 프로세스 치환 `<(command)`과 명령 치환 `$(command)` 이해하기
- `set -o pipefail`로 파이프라인에서 오류 전파 처리하기
- 디버깅과 다중 출력 시나리오를 위해 `tee` 사용하기
- 파이프라인 성능과 메모리 사용량 최적화하기
- 복잡한 체인에서 적절한 인용과 이스케이프 적용하기

### 파이프라인 복잡성 레벨
1. **단순 (2-3 명령):** 기본 필터링과 카운팅
2. **중급 (4-5 명령):** 정렬을 포함한 다단계 처리
3. **고급 (6+ 명령):** 프로세스 치환, 복잡한 로직
4. **전문가 (8+ 명령):** 서브셸, 병렬 처리, 오류 처리

### 도구 통합
- **파일 작업:** `find`, `locate`, `ls`
- **텍스트 처리:** `grep`, `sed`, `awk`, `cut`, `sort`, `uniq`
- **데이터 조작:** `join`, `comm`, `paste`, `column`
- **출력 포매팅:** `pr`, `fmt`, `fold`
- **시스템 통합:** `xargs`, `parallel`

---

## 문제 인덱스

| # | 문제 | 난이도 | 명령 수 | 사용된 파일 |
|---|---------|---------|---------|--------------|
| 16 | 로그 분석 파이프라인 | ★★☆ | 4-5 | logs/web_access.log |
| 17 | 사용자 활동 상관관계 | ★★★ | 6-7 | logs/*.log, data/users.csv |
| 18 | 다중 파일 내용 병합 | ★★☆ | 4-5 | data/*.csv |
| 19 | 오류율 대시보드 | ★★★ | 7-8 | logs/web_access.log |
| 20 | 프로세스 치환 마스터 | ★★★★ | 6-8 | Multiple files |
| 21 | 실시간 로그 상관관계 | ★★★★ | 8+ | logs/*.log |
| 22 | 데이터 품질 평가 | ★★★ | 5-6 | data/corrupted_data.txt |
| 23 | 설정 차이 파이프라인 | ★★☆ | 4-5 | configs/*.conf |
| 24 | 다중 소스 리포트 생성기 | ★★★★ | 8+ | All data files |
| 25 | 성능 모니터링 체인 | ★★★ | 6-7 | logs/system_events.log |
| 26 | 보안 경보 파이프라인 | ★★★★ | 7-9 | logs/audit.log |
| 27 | 데이터 변환 체인 | ★★★ | 5-7 | data/*.json, data/*.xml |
| 28 | 병렬 처리 파이프라인 | ★★★★ | 6+ | Large datasets |
| 29 | 오류 복구 파이프라인 | ★★★ | 6-7 | data/corrupted_data.txt |
| 30 | 마스터 통합 파이프라인 | ★★★★★ | 10+ | All files |

**난이도 범례:**
- ★★☆ = 중급 (4-5 명령 체인)
- ★★★ = 고급 (6-7 명령, 프로세스 치환)
- ★★★★ = 전문가 (8+ 명령, 복잡한 로직)
- ★★★★★ = 마스터 (10+ 명령, 전체 통합)

## 파이프라인 설계 원칙

### 1. 오류 처리
```bash
# 적절한 오류 전파
set -o pipefail
command1 | command2 | command3 || {
    echo "Pipeline failed at step: $?"
    exit 1
}
```

### 2. 프로세스 치환
```bash
# 두 개의 다른 프로세스의 출력 비교
comm -12 <(process1 | sort) <(process2 | sort)

# 다중 입력 스트림
join <(source1 | sort -k1) <(source2 | sort -k1)
```

### 3. tee를 사용한 디버깅
```bash
# 중간 단계 디버깅
command1 | tee debug1.txt | \
command2 | tee debug2.txt | \
command3
```

### 4. 성능 최적화
```bash
# 메모리 효율적인 대용량 파일 처리
< large_file.log \
grep pattern | \
sort -S 1G | \
uniq -c | \
sort -nr
```

## 일반적인 파이프라인 패턴

### 데이터 처리 파이프라인
```bash
# 추출 → 필터 → 변환 → 집계 → 포매팅
find . -name "*.log" | \
xargs grep -h "ERROR" | \
sed 's/.*\[\([^]]*\)\].*/\1/' | \
sort | uniq -c | sort -nr | \
head -10 | \
awk '{printf "%-20s %5d\n", $2, $1}'
```

### 다중 소스 상관관계
```bash
# 여러 소스의 데이터 상관관계 분석
join -t',' \
  <(cut -d',' -f1,3 users.csv | sort) \
  <(cut -d',' -f2,4 transactions.csv | sort -k1) | \
column -t -s','
```

### 실시간 모니터링
```bash
# 지속적인 처리를 하는 실시간 파이프라인
tail -f log.txt | \
grep --line-buffered "PATTERN" | \
while read line; do
    # 도착하는 각 라인을 처리
    echo "$(date): $line" | tee -a alerts.log
done
```