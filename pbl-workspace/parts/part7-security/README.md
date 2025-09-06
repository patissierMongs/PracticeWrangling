# Part 7: 보안 및 포렌식 시나리오
## 8개의 수비적 보안 분석 챌린지

이 섹션은 수비적 보안 분석, 위협 탐지, 인시던트 대응을 위한 명령줄 도구 사용에 중점을 둡니다. 문제들은 정교한 데이터 상관관계와 패턴 분석이 필요한 실제 보안 시나리오를 강조합니다.

### 학습 목표
- 로그 분석 기법을 사용한 보안 위협 탐지
- 여러 로그 소스 간의 이벤트 상관관계 분석
- 다양한 데이터 형식에서 연합 지표(IoC) 추출
- 자동화된 위협 탐지 파이프라인 구현
- 분석 가치를 보존하면서 로그 공유를 위한 살균
- 비정상 탐지를 위한 네트워크 트래픽 패턴 분석
- 포렌식 분석 워크플로우 구축

### 보안 분석 중점 영역
- **무차별 대입 공격 탐지:** 로그인 시도 패턴 분석
- **비정상 탐지:** 통계적 편차 식별
- **IoC 추출:** 자동화된 지표 수집
- **로그 상관관계:** 다중 소스 이벤트 상관관계
- **데이터 살균:** 로그 공유를 위한 PII 제거
- **네트워크 분석:** 트래픽 패턴 검사
- **인시던트 대응:** 포렌식 데이터 수집

**⚠️ 참고:** 모든 문제는 수비적 보안과 합법적인 분석 기법에 중점을 둡니다. 솔루션은 승인된 보안 모니터링과 인시던트 대응에만 사용되어야 합니다.

---

## 문제 인덱스

| # | 문제 | 난이도 | 중점 영역 | 사용된 파일 |
|---|---------|----------|----------|-------------|
| 70 | 무차별 대입 공격 탐지 | ★★★ | 로그인 분석 | logs/audit.log |
| 71 | 다중 소스 보안 상관관계 | ★★★★ | 이벤트 상관관계 | logs/*.log |
| 72 | IoC 추출 파이프라인 | ★★★ | 위협 인텔리전스 | All log files |
| 73 | 비정상 탐지 엔진 | ★★★★ | 통계 분석 | logs/web_access.log |
| 74 | 공유를 위한 로그 살균 | ★★★ | 데이터 보호 | Multiple files |
| 75 | 네트워크 트래픽 분석 | ★★★★ | 네트워크 보안 | logs/web_access.log |
| 76 | 포렌식 타임라인 생성기 | ★★★★ | 인시던트 대응 | All files |
| 77 | 자동화된 위협 사냥 | ★★★★★ | 완전한 워크플로우 | All security logs |

**난이도 범례:**
- ★★★ = 고급 (복잡한 패턴 탐지)
- ★★★★ = 전문가 (다중 소스 상관관계, 통계 분석)
- ★★★★★ = 마스터 (완전한 보안 워크플로우)

## 보안 분석 패턴

### 1. 무차별 대입 공격 탐지
```bash
# 실패한 로그인 시도 탐지
awk '
/failed login/ {
    split($1 " " $2, timestamp, " ")
    ip = $NF
    failed_attempts[ip][timestamp[1] " " timestamp[2]]++
}

END {
    for (ip in failed_attempts) {
        total = 0
        for (time in failed_attempts[ip]) {
            total += failed_attempts[ip][time]
        }
        if (total > 5) {  # 의심스러운 활동에 대한 임계값
            print "SUSPICIOUS IP:", ip, "Failed attempts:", total
        }
    }
}' audit.log
```

### 2. 통계적 비정상 탐지
```bash
# 비정상적인 요청 량 탐지
awk '
{
    hour = substr($4, 2, 14)  # 타임스탬프에서 시간 추출
    requests_per_hour[hour]++
}

END {
    # 평균과 표준편차 계산
    total = sum = sum_sq = 0
    for (hour in requests_per_hour) {
        total++
        sum += requests_per_hour[hour]
        sum_sq += requests_per_hour[hour]^2
    }
    
    mean = sum / total
    variance = (sum_sq - sum^2/total) / (total-1)
    stddev = sqrt(variance)
    
    # 비정상적인 활동이 있는 시간 플래그
    for (hour in requests_per_hour) {
        z_score = (requests_per_hour[hour] - mean) / stddev
        if (z_score > 2 || z_score < -2) {
            print "ANOMALY:", hour, "requests:", requests_per_hour[hour], "z-score:", z_score
        }
    }
}' web_access.log
```

### 3. 다중 소스 이벤트 상관관계
```bash
# 여러 로그 소스에서 이벤트 상관관계 분석
join -j 1 \
  <(awk '/failed login/ {print $1" "$2, $0}' auth.log | sort) \
  <(awk '/suspicious/ {print $1" "$2, $0}' system.log | sort) | \
awk '
{
    timestamp = $1 " " $2
    print "CORRELATED EVENT at", timestamp
    print "  Auth:", $3, $4, $5, $6
    print "  System:", $7, $8, $9, $10
    print ""
}'
```

## 수비적 보안 기법

### 1. 위협 인텔리전스 통합
```bash
# 잠재적인 IoC를 추출하고 위협 피드에 대해 검증
extract_indicators() {
    local log_file="$1"
    
    # IP 주소
    grep -Eo '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' "$log_file" | \
        grep -v '^192\.168\.' | grep -v '^10\.' | grep -v '^172\.(1[6-9]|2[0-9]|3[01])\.' | \
        sort -u > potential_ips.txt
    
    # 도메인 이름  
    grep -Eo '[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' "$log_file" | \
        grep -v 'localhost\|example\.com' | \
        sort -u > potential_domains.txt
        
    # 파일 해시 (있는 경우)
    grep -Eo '\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b' "$log_file" | \
        sort -u > potential_hashes.txt
}
```

### 2. 로그 개인정보 보호
```bash
# 분석 가치를 보존하면서 로그 살균
sanitize_logs() {
    local input_file="$1"
    local output_file="$2"
    
    # IP 주소를 익명화된 버전으로 교체
    sed -E 's/\b([0-9]{1,3}\.)[0-9]{1,3}\.([0-9]{1,3}\.)[0-9]{1,3}\b/\1xxx.\2xxx/g' "$input_file" | \
    
    # 이메일 주소 교체
    sed -E 's/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/user@domain.com/g' | \
    
    # 사용자명 교체 (일반적인 패턴)
    sed -E 's/user=[^[:space:]]+/user=<redacted>/g' | \
    
    # 세션 ID와 토큰 교체
    sed -E 's/session=[a-zA-Z0-9]+/session=<redacted>/g' > "$output_file"
}
```

### 3. 포렌식 타임라인 구축
```bash
# 여러 소스에서 종합 타임라인 구축
build_timeline() {
    {
        # 웹 접근 로그
        awk '{print $4, "WEB", $1, $7, $9}' web_access.log
        
        # 시스템 이벤트  
        awk '{print $1" "$2" "$3, "SYS", $5, $6, $7}' system_events.log
        
        # 감사 로그
        awk '{print $1" "$2, "AUDIT", $4, $5, $6}' audit.log
        
    } | sort -k1,1 | \
    awk '{
        print $1, "|", $2, "|", $3, "|", $4, $5, $6, $7, $8
    }' | column -t -s'|'
}
```

## 보안 분석 워크플로우

### 1. 인시던트 대응 파이프라인
```bash
#!/bin/bash
# 자동화된 인시던트 대응 데이터 수집

incident_response() {
    local incident_time="$1"
    local output_dir="incident_$(date +%Y%m%d_%H%M%S)"
    
    mkdir -p "$output_dir"
    
    # 인시던트 시간 주변의 이벤트 추출
    for log in logs/*.log; do
        awk -v incident="$incident_time" '
        function time_diff(t1, t2) {
            # 분 단위로 시간 차이 계산
            return (mktime(t1) - mktime(t2)) / 60
        }
        
        {
            log_time = $1 " " $2
            if (abs(time_diff(log_time, incident)) <= 30) {
                print FILENAME ":", $0
            }
        }' "$log" >> "$output_dir/timeline.txt"
    done
    
    # 요약 리포트 생성
    analyze_incident_data "$output_dir"
}
```

### 2. 위협 사냥 자동화
```bash
# 자동화된 위협 사냥 쿼리
threat_hunt() {
    echo "THREAT HUNTING REPORT - $(date)"
    echo "=================================="
    
    # 사냥 1: 의심스러운 프로세스 실행 패턴
    echo "1. Suspicious Process Patterns:"
    grep -i "powershell\|cmd\.exe\|wscript\|cscript" logs/system_events.log | \
    awk '{print "  " $1, $2, ":", $0}'
    
    # 사냥 2: 비정상적인 네트워크 연결
    echo -e "\n2. Unusual Network Activity:"
    awk '$9 ~ /^4[0-9]{2}/ {print $1, $7, $9}' logs/web_access.log | \
    sort | uniq -c | sort -nr | head -10
    
    # 사냥 3: 인증 비정상
    echo -e "\n3. Authentication Anomalies:"
    awk '
    /failed login/ {
        failed[$(NF-1)]++
    }
    /successful login/ {
        success[$(NF-1)]++
    }
    END {
        for (user in failed) {
            if (failed[user] > 10 && success[user] == 0) {
                print "  경고: 사용자", user, "가 실패한 로그인", failed[user], "회, 성공 없음"
            }
        }
    }' logs/audit.log
}
```

## 개인정보 및 법적 고려사항

### 데이터 처리 가이드라인
1. **데이터 최소화:** 보안 분석에 필요한 데이터만 수집
2. **익명화:** 가능한 경우 PII 제거 또는 가명 처리
3. **보유:** 조직의 데이터 보유 정책 준수
4. **접근 제어:** 보안 로그에 대한 접근을 근무자로 제한
5. **문서화:** 포렌식 활동의 감사 추적 유지

### 윤리적 보안 분석
- 모니터링할 권한이 있는 시스템만 분석
- 수비적 역량과 위협 탐지에 집중
- 개인정보보호법과 조직 정책 준수
- 합법적인 보안 목적으로만 결과 사용
- 보안 커뮤니티 내에서 위협 인텔리전스를 책임감 있게 공유

## 고급 상관관계 기법

### 1. 행동 분석
```bash
# 비정상적인 사용자 행동 패턴 탐지
analyze_user_behavior() {
    awk '
    BEGIN { 
        # 정상 업무 시간 정의
        business_start = 9
        business_end = 17
    }
    
    /user=/ {
        match($0, /user=([^[:space:]]+)/, user_array)
        user = user_array[1]
        
        # 타임스탬프에서 시간 추출
        hour = substr($4, 14, 2)
        
        activity[user][hour]++
        total_activity[user]++
    }
    
    END {
        for (user in total_activity) {
            off_hours = 0
            for (h = 0; h < business_start; h++) {
                off_hours += activity[user][h]
            }
            for (h = business_end + 1; h < 24; h++) {
                off_hours += activity[user][h]
            }
            
            off_hours_percent = (off_hours / total_activity[user]) * 100
            
            if (off_hours_percent > 30) {
                print "의심: 사용자", user, "이 비업무시간 활동", off_hours_percent "%를 대함"
            }
        }
    }' logs/web_access.log
}
```

### 2. 지리적 분석
```bash
# 불가능한 이동 시나리오 탐지 (GeoIP 데이터가 사용 가능한 경우)
detect_impossible_travel() {
    awk '
    function distance(lat1, lon1, lat2, lon2) {
        # 거리 계산을 위한 하버사인 공식
        # 킬로미터 단위로 거리 반환
    }
    
    /user=/ {
        user = extract_user($0)
        timestamp = $4
        ip = $1
        
        # IP의 지리적 위치 조회
        # (실제 시나리오에서는 GeoIP 데이터베이스와 통합)
        
        if (user in last_location) {
            time_diff = timestamp - last_timestamp[user]
            dist = distance(last_lat[user], last_lon[user], current_lat, current_lon)
            
            # 최대 가능 이동 속도 계산
            max_speed = dist / (time_diff / 3600)  # km/h
            
            if (max_speed > 900) {  # 상업용 항공기보다 빠름
                print "불가능한 이동:", user, "가", last_location[user], "에서", current_location, "으로", time_diff/3600, "시간 내에"
            }
        }
        
        last_location[user] = current_location
        last_timestamp[user] = timestamp
    }' logs/web_access.log
}
```