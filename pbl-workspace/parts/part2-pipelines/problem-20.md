# 문제 20: 프로세스 치환 마스터
**난이도:** ★★★★ | **명령 수:** 6-8 | **파일:** Multiple files

## 목표
프로세스 치환 `<(command)`과 명령 치환 `$(command)`를 마스터하여 복잡한 데이터 상관관계 작업에 대한 우아한 솔루션을 만듭니다.

## 문제 설명
여러 로그 파일과 CSV 파일의 데이터를 동시에 상관관계 분석하는 포괄적인 분석을 만들어야 합니다. 이를 위해 고급 프로세스 치환 기술이 필요합니다:

1. 서로 다른 로그 소스에서 활성 사용자 비교
2. 로그에는 나타나지만 사용자 데이터베이스에는 없는 사용자 찾기
3. 웹과 시스템 리소스에 모두 접근한 IP 주소 식별
4. 사용자 활동 패턴을 보여주는 상관관계 리포트 생성

## 요구사항
- 최소 3개의 다른 비교를 위해 프로세스 치환 `<(command)` 사용
- 동적 데이터 검색을 위해 명령 치환 `$(command)` 구현
- 동일 파이프라인에서 다른 파일 형식 (로그, CSV) 처리
- 복잡한 데이터 흐름을 위한 임시 명명된 파이프 생성
- 중간 파일을 만들지 않고 데이터 처리

## 예상 출력 형식
```
USER ACTIVITY CORRELATION REPORT
=================================
Generated: 2024-01-15 14:30:22

USERS IN LOGS BUT NOT IN DATABASE:
- phantom_user (seen in: web_access.log, audit.log)
- deleted_account_123 (seen in: system_events.log)

IP ADDRESSES ACCESSING MULTIPLE SERVICES:
- 192.168.1.100 (web: 45 requests, system: 12 events)
- 203.45.78.90 (web: 234 requests, audit: 8 events)

USER LOGIN PATTERNS:
- alice: web_access(last: 2024-01-15 14:25), system_events(last: 2024-01-15 14:20)
- bob: web_access(last: 2024-01-15 14:15), no system activity

SECURITY CORRELATIONS:
- Failed web login followed by system access: 3 instances
- Unusual access patterns detected: 7 users

STATISTICS:
Total unique users in logs: 1,247
Users in database: 1,195  
Orphaned log entries: 52
Cross-service access patterns: 89
```

## 고급 프로세스 치환 기술

### 1. 다중 파일 비교
```bash
# 세 개의 다른 소스에서 사용자 비교
comm -12 \
  <(awk -F',' '{print $2}' ../../data/users.csv | sort) \
  <(grep -o 'user=[^[:space:]]*' ../../logs/web_access.log | \
    cut -d'=' -f2 | sort -u)
```

### 2. 동적 명령 생성
```bash
# 파일 내용에 기반하여 명령 생성
while read logfile; do
    echo "Processing: $logfile"
    comm -23 \
      <(grep -o 'user=[^[:space:]]*' "$logfile" | cut -d'=' -f2 | sort -u) \
      <(awk -F',' 'NR>1 {print $2}' ../../data/users.csv | sort)
done < <(find ../../logs -name "*.log")
```

### 3. 복잡한 조인 작업
```bash
# 처리된 로그를 사용자 데이터베이스와 조인
join -t'|' \
  <(grep "LOGIN" ../../logs/audit.log | \
    awk '{print $6 "|" $1 " " $2}' | sort) \
  <(awk -F',' 'NR>1 {print $2 "|" $3 "|" $7}' ../../data/users.csv | sort)
```

## 구현 프레임워크
```bash
#!/bin/bash
set -euo pipefail

echo "USER ACTIVITY CORRELATION REPORT"
echo "================================="
echo "Generated: $(date)"
echo

# 1. 로그에는 있지만 데이터베이스에는 없는 사용자
echo "USERS IN LOGS BUT NOT IN DATABASE:"
comm -23 \
  <(cat ../../logs/*.log | \
    grep -o 'user=[^[:space:]]*' | \
    cut -d'=' -f2 | sort -u) \
  <(awk -F',' 'NR>1 {print $2}' ../../data/users.csv | sort) | \
while read orphan_user; do
    # 이 사용자를 포함하는 로그 찾기
    logs_containing=$(grep -l "user=$orphan_user" ../../logs/*.log | \
                     xargs -I {} basename {} | \
                     paste -sd',' -)
    echo "- $orphan_user (seen in: $logs_containing)"
done

echo
echo "IP ADDRESSES ACCESSING MULTIPLE SERVICES:"

# 2. 웹과 시스템 로그 둘 다에 있는 IP 찾기
comm -12 \
  <(grep -Eo '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' ../../logs/web_access.log | sort -u) \
  <(grep -Eo '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' ../../logs/system_events.log | sort -u) | \
while read shared_ip; do
    web_count=$(grep -c "$shared_ip" ../../logs/web_access.log || echo 0)
    sys_count=$(grep -c "$shared_ip" ../../logs/system_events.log || echo 0)
    echo "- $shared_ip (web: $web_count requests, system: $sys_count events)"
done

# 3. 다중 프로세스 치환을 사용한 사용자 로그인 패턴 상관관계
echo
echo "USER LOGIN PATTERNS:"

join -a1 -a2 -e"never" -o auto -t'|' \
  <(grep "user=" ../../logs/web_access.log | \
    awk '{match($0, /user=([^[:space:]]+)/, u); print u[1] "|web_access|" $4}' | \
    sort -t'|' -k1,1 | \
    sort -t'|' -k1,1 -k3,3 | \
    awk -F'|' '{if($1!=prev) print $1 "|" $2 "|" $3; prev=$1}') \
  <(grep "user=" ../../logs/system_events.log | \
    awk '{match($0, /user=([^[:space:]]+)/, u); print u[1] "|system_events|" $3}' | \
    sort -t'|' -k1,1 | \
    awk -F'|' '{if($1!=prev) print $1 "|" $2 "|" $3; prev=$1}') | \
awk -F'|' '{
    if ($1 == prev_user) {
        printf " %s(last: %s)", $2, $3
    } else {
        if (prev_user) print ""
        printf "- %s: %s(last: %s)", $1, $2, $3
        prev_user = $1
    }
} END {if (prev_user) print ""}'

echo
echo "STATISTICS:"
echo "Total unique users in logs: $(cat ../../logs/*.log | grep -o 'user=[^[:space:]]*' | cut -d'=' -f2 | sort -u | wc -l)"
echo "Users in database: $(awk -F',' 'NR>1' ../../data/users.csv | wc -l)"
```

## 고급 챌린지

### 1. 명명된 파이프 통합
```bash
# 복잡한 데이터 흐름을 위한 명명된 파이프 생성
mkfifo /tmp/pipe1 /tmp/pipe2 /tmp/pipe3

# 여러 스트림을 동시에 처리
{
    process_web_logs > /tmp/pipe1 &
    process_system_logs > /tmp/pipe2 &  
    process_user_data > /tmp/pipe3 &
    
    # 세 스트림 모두 상관관계 분석
    paste /tmp/pipe1 /tmp/pipe2 /tmp/pipe3 | process_correlation
}

# 정리
rm /tmp/pipe1 /tmp/pipe2 /tmp/pipe3
```

### 2. 동적 프로세스 생성
```bash
# 사용 가능한 파일에 기반하여 프로세스 치환 생성
available_logs=($(find ../../logs -name "*.log"))
process_list=""

for log in "${available_logs[@]}"; do
    process_list="$process_list <(extract_users_from '$log')"
done

# 동적 프로세스 치환 실행 (고급 bash eval 사용)
eval "join_multiple_streams $process_list"
```

### 3. 프로세스 치환에서의 오류 처리
```bash
# 프로세스 치환 스트림에서 오류 처리
{
    comm -12 \
      <(command1 || { echo "Error in stream 1" >&2; exit 1; }) \
      <(command2 || { echo "Error in stream 2" >&2; exit 1; })
} || {
    echo "Process substitution pipeline failed"
    exit 1  
}
```

## 성능 고려사항
- 프로세스 치환은 서브셸을 생성합니다 - 메모리 사용량을 모니터링하세요
- 대용량 데이터셋은 스트리밍 접근 방식이 필요할 수 있습니다
- 정렬 작업에 대한 메모리 제한을 위해 `sort -S` 사용을 고려하세요
- 확장성을 보장하기 위해 더 큰 데이터셋으로 테스트하세요

## 프로세스 치환 디버깅
```bash
# 중간 출력을 검사하여 디버깅
echo "Stream 1:" && cat <(your_process_1)
echo "Stream 2:" && cat <(your_process_2)

# tee를 사용하여 중간 결과 캐처
comm -12 \
  <(process1 | tee debug_stream1.txt) \
  <(process2 | tee debug_stream2.txt)
```

---
**이전:** [문제 19: 오류율 대시보드](problem-19.md) | **다음:** [문제 21: 실시간 로그 상관관계](problem-21.md)