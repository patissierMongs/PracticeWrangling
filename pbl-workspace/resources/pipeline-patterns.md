# 파이프라인 패턴 & 모범 사례

이 가이드는 복잡한 명령어 체인을 위한 고급 파이프라인 구성 패턴, 오류 처리, 디버깅 기법을 다룹니다.

---

## 파이프라인 구성 원칙

### 1. 파이프라인에서의 Unix 철학
- **한 가지를 잘하기:** 각 명령은 단일하고 명확하게 정의된 목적을 가져야 함
- **함께 작동:** 명령들은 구성 가능하고 체인 가능해야 함
- **텍스트 스트림 처리:** 상호 운용성을 위한 범용 입력/출력 형식
- **빠른 실패:** 오류는 전파되고 감지 가능해야 함

### 2. 파이프라인 흐름 패턴
```bash
# 선형 처리 (가장 일반적)
input | filter | transform | aggregate | output

# 분기 (tee로 여러 출력)
input | tee >(process1 > output1) >(process2 > output2) | process3 > output3

# 병합 (여러 입력을 단일 프로세스로)
{ process1; process2; process3; } | single_processor

# 조건부 처리
input | if_condition_true | then_process | else_alternative
```

---

## 고급 파이프라인 패턴

### 1. 프로세스 치환 패턴

#### 입력 프로세스 치환
```bash
# 두 가지 다른 프로세스의 출력 비교
diff <(command1) <(command2)

# 여러 소스의 데이터 결합
join <(source1 | sort) <(source2 | sort)

# 프로세스 출력을 파일 입력으로 사용
command --config-file=<(generate_config)
```

#### 출력 프로세스 치환
```bash
# 출력을 여러 프로세스로 전송
command | tee >(processor1) >(processor2) >/dev/null

# 다양한 처리 경로를 가진 복잡한 분기
data_source | tee >(filter1 | process1 > output1) \
                  >(filter2 | process2 > output2) \
                  >(filter3 | process3 > output3) >/dev/null
```

### 2. 서브셸 패턴
```bash
# 서로 다른 환경에서 명령 그룹화
(export VAR=value; command1 | command2) | command3

# 서브셸에서 병렬 처리
{
    (process_chunk1 &)
    (process_chunk2 &)
    (process_chunk3 &)
    wait
} | aggregate_results

# 격리된 오류 처리
(set -e; risky_command1 | risky_command2) || handle_error
```

### 3. 이름 있는 파이프 패턴
```bash
# 지속적인 통신 채널 생성
mkfifo /tmp/pipe1 /tmp/pipe2

# 생산자-소비자 패턴
producer > /tmp/pipe1 &
consumer < /tmp/pipe1 &

# 복잡한 다단계 처리
{
    stage1 > /tmp/pipe1 &
    stage2 < /tmp/pipe1 > /tmp/pipe2 &
    stage3 < /tmp/pipe2
}

# 정리
rm /tmp/pipe1 /tmp/pipe2
```

---

## 파이프라인에서의 오류 처리

### 1. 종료 상태 전파
```bash
# 파이프라인 실패 감지 활성화
set -o pipefail

# 파이프라인 종료 상태 확인
command1 | command2 | command3
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "command1 실패"
elif [ ${PIPESTATUS[1]} -ne 0 ]; then
    echo "command2 실패"
elif [ ${PIPESTATUS[2]} -ne 0 ]; then
    echo "command3 실패"
fi
```

### 2. 오류 복구 패턴
```bash
# 실패 시 재시도
retry_pipeline() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if command1 | command2 | command3; then
            return 0
        else
            echo "시도 $attempt 실패, 재시도 중..."
            ((attempt++))
            sleep 1
        fi
    done
    
    echo "$max_attempts번 시도 후 파이프라인 실패"
    return 1
}
```

### 3. 점진적 성능 저하
```bash
# 주 방법 실패 시 대체 처리
primary_pipeline() {
    complex_command1 | complex_command2 | complex_command3
}

fallback_pipeline() {
    simple_command1 | simple_command2
}

# 주 방법 시도, 필요시 대체 방법 사용
primary_pipeline || {
    echo "주 파이프라인 실패, 대체 방법 사용 중..."
    fallback_pipeline
}
```

---

## 파이프라인 디버깅 기법

### 1. 중간 출력 검사
```bash
# tee로 중간 결과 저장
command1 | tee debug1.txt | \
command2 | tee debug2.txt | \
command3 > final_output.txt

# 조건부 디버깅
DEBUG=${DEBUG:-0}
if [ $DEBUG -eq 1 ]; then
    command1 | tee debug1.txt | command2 | tee debug2.txt | command3
else
    command1 | command2 | command3
fi
```

### 2. 파이프라인 구성 요소 테스트
```bash
# 각 구성 요소를 개별적으로 테스트
echo "test input" | command1  # 첫 번째 단계 테스트
echo "expected_input_for_command2" | command2  # 두 번째 단계 테스트
echo "expected_input_for_command3" | command3  # 세 번째 단계 테스트

# 파이프라인 세그먼트를 점진적으로 테스트
echo "test input" | command1 | command2  # 첫 두 단계 테스트
echo "test input" | command1 | command2 | command3  # 전체 파이프라인
```

### 3. 오류 추적
```bash
# Enable command tracing
set -x
command1 | command2 | command3
set +x

# Function-based debugging
debug_pipeline() {
    local debug_level=${1:-1}
    shift
    
    if [ $debug_level -ge 1 ]; then
        echo "DEBUG: Running pipeline: $*" >&2
    fi
    
    if [ $debug_level -ge 2 ]; then
        set -x
    fi
    
    "$@"
    
    if [ $debug_level -ge 2 ]; then
        set +x
    fi
}

# Usage
debug_pipeline 2 command1 "|" command2 "|" command3
```

---

## 성능 최적화 패턴

### 1. 병렬 처리
```bash
# 여러 프로세스로 작업 분할
split_and_process() {
    local input_file="$1"
    local output_file="$2"
    local num_processes=${3:-$(nproc)}
    
    # 입력 분할
    split -n l/$num_processes "$input_file" /tmp/chunk_
    
    # 청크를 병렬로 처리
    for chunk in /tmp/chunk_*; do
        process_chunk "$chunk" > "${chunk}.result" &
    done
    wait
    
    # 결과 병합
    cat /tmp/chunk_*.result > "$output_file"
    
    # 정리
    rm /tmp/chunk_*
}
```

### 2. 메모리 효율적 처리
```bash
# 메모리 문제를 피하기 위한 스트림 처리
large_file_processor() {
    local input_file="$1"
    
    # 전체 파일을 로드하는 대신
    # awk '{lines[NR] = $0} END {process all lines}' "$input_file"
    
    # 스트리밍 접근법 사용
    while IFS= read -r line; do
        process_line "$line"
    done < "$input_file"
}
```

### 3. I/O 최적화
```bash
# 파일 작업 최소화
efficient_multi_filter() {
    local input_file="$1"
    
    # 여러 번 패스 대신
    # grep "pattern1" "$input_file" > temp1
    # grep "pattern2" "$input_file" > temp2
    # grep "pattern3" "$input_file" > temp3
    
    # 여러 출력을 가진 단일 패스
    < "$input_file" tee >(grep "pattern1" > temp1) \
                        >(grep "pattern2" > temp2) \
                        >(grep "pattern3" > temp3) >/dev/null
}
```

---

## 복잡한 파이프라인 예시

### 1. 로그 분석 파이프라인
```bash
# 포괄적인 웹 로그 분석
analyze_web_logs() {
    local log_file="$1"
    local report_file="$2"
    
    {
        echo "웹 로그 분석 보고서"
        echo "======================"
        echo "생성: $(date)"
        echo "로그 파일: $log_file"
        echo
        
        # 요청 수별 상위 IP
        echo "상위 10 IP 주소:"
        awk '{print $1}' "$log_file" | \
        sort | uniq -c | sort -nr | head -10 | \
        awk '{printf "  %-15s %8d 요청\n", $2, $1}'
        echo
        
        # 오류 분석
        echo "오류 분석:"
        awk '$9 ~ /^[45][0-9][0-9]/ {errors[$9]++} 
             END {for (code in errors) printf "  %s: %d\n", code, errors[code]}' "$log_file" | \
        sort
        echo
        
        # 시간대 트래픽 분포
        echo "시간대 트래픽:"
        awk '{
            gsub(/\[|\]/, "", $4)
            split($4, datetime, ":")
            hour = datetime[2]
            requests[hour]++
        } 
        END {
            for (h = 0; h < 24; h++) {
                printf "  %02d:00 %s\n", h, requests[sprintf("%02d", h)] ? requests[sprintf("%02d", h)] : 0
            }
        }' "$log_file"
        
    } > "$report_file"
}
```

### 2. 데이터 처리 파이프라인
```bash
# CSV 데이터용 ETL 파이프라인
process_csv_data() {
    local input_csv="$1"
    local output_csv="$2"
    
    # Extract, Transform, Load 파이프라인
    < "$input_csv" \
    sed 1d | \                          # 헤더 제거 (Extract)
    awk -F',' '
        {
            # 데이터 정리 (Transform)
            gsub(/"/, "", $2)           # 이름에서 인용부호 제거
            gsub(/[^0-9.]/, "", $3)     # 숫자 필드 정리
            
            # 데이터 유효성 검사
            if (NF == 5 && $3 ~ /^[0-9]+\.?[0-9]*$/) {
                print $0
            }
        }' | \
    sort -t',' -k3,3n | \              # 숫자 필드로 정렬
    awk -F',' '                        # 집계 및 형식 지정 (Load)
        BEGIN {
            OFS = ","
            print "ID,Name,Value,Category,Status"  # 새 헤더
        }
        {
            # 출력 형식 지정
            printf "%d,%s,%.2f,%s,%s\n", $1, $2, $3, $4, $5
        }' > "$output_csv"
}
```

### 3. 실시간 모니터링 파이프라인
```bash
# 알림 기능이 있는 라이브 로그 모니터링
monitor_logs() {
    local log_file="$1"
    local alert_threshold=${2:-10}
    
    tail -f "$log_file" | \
    while read -r line; do
        # 로그 항목 파싱
        timestamp=$(echo "$line" | awk '{print $1 " " $2}')
        level=$(echo "$line" | awk '{print $3}')
        message=$(echo "$line" | cut -d' ' -f4-)
        
        # 다양한 로그 레벨 처리
        case "$level" in
            ERROR|CRITICAL)
                echo "$(date): 알림 - $level: $message" | \
                tee -a alerts.log | \
                notify_admin
                ;;
            WARN)
                echo "$(date): 경고: $message" >> warnings.log
                ;;
            *)
                # 통계를 위해 일반 항목 계수
                ((normal_count++))
                
                # 주기적 상태 보고
                if (( normal_count % 1000 == 0 )); then
                    echo "$(date): $normal_count개의 일반 로그 항목 처리 완료"
                fi
                ;;
        esac
    done
}

notify_admin() {
    # 알림 전송 (플레이스홀더 - 실제 알림 시스템과 통합)
    mail -s "로그 알림" admin@example.com
}
```

---

## 피해야 할 파이프라인 안티패턴

### 1. 불필요한 프로세스 생성
```bash
# 나쁨: 단순 작업에 여러 프로세스
cat file.txt | grep pattern | cat

# 좋음: 직접 처리
grep pattern file.txt
```

### 2. 불필요한 cat 사용 (UUOC)
```bash
# 나쁨: 불필요한 cat
cat file.txt | awk '{print $1}'

# 좋음: 직접 파일 입력
awk '{print $1}' file.txt
```

### 3. 비효율적인 루프
```bash
# 나쁨: 루프에서 프로세스 생성
while read line; do
    echo "$line" | sed 's/old/new/'
done < file.txt

# 좋음: 단일 프로세스
sed 's/old/new/' file.txt
```

### 4. 오류 조건 무시
```bash
# 나쁨: 파이프라인 실패 무시
command1 | command2 | command3
echo "파이프라인 완료"

# 좋음: 오류 확인
set -o pipefail
if command1 | command2 | command3; then
    echo "파이프라인 성공적으로 완료"
else
    echo "파이프라인 실패, 종료 코드 $?"
    exit 1
fi
```

---

## 모범 사례 요약

### 1. 설계 원칙
- **단순하게 시작:** 복잡성을 점진적으로 구축
- **구성 요소 테스트:** 각 단계가 올바르게 작동하는지 확인
- **오류 처리:** 실패 시나리오에 대비
- **복잡성 문서화:** 자명하지 않은 작업에 대한 설명

### 2. 성능 가이드라인
- **프로세스 최소화:** 가능할 때 작업 결합
- **적절한 도구 사용:** 도구 기능을 요구사항과 매칭
- **데이터 스트리밍:** 불필요한 메모리 사용 피하기
- **현명한 병렬화:** 병렬성과 리소스 제약 간 균형

### 3. 디버깅 전략
- **점진적 테스트:** 파이프라인 단계를 개별적으로 테스트
- **중간 출력:** 디버깅 정보 저장
- **오류 전파:** pipefail 활성화 및 종료 코드 확인
- **로깅:** 문제 해결을 위한 적절한 로깅 추가

### 4. 유지보수 고려사항
- **코드 명료성:** 읽기 쉬운 파이프라인 코드 작성
- **오류 메시지:** 도움이 되는 오류 정보 제공
- **문서화:** 예상 입력 및 출력 문서화
- **버전 제어:** 시간에 따른 파이프라인 변경 사항 추적