# 명령줄 성능 최적화 가이드

이 가이드는 벤치마킹 방법론과 실제 최적화 기법을 통해 명령줄 데이터 처리 작업을 최적화하는 체계적인 접근 방법을 제공합니다.

---

## 성능 계층구조

### 도구 속도 순위 (일반적인 사용 사례)

1. **내장 셸 연산** - 가장 빠름
   - 변수 조작, 산술 연산
   - 파일 리디렉션, 단순 루프

2. **C 기반 유틸리티** - 매우 빠름  
   - `grep`, `sort`, `cut`, `wc`
   - 특정 작업에 최적화됨

3. **AWK** - 빠름에서 보통
   - 필드 처리에 뛰어남
   - 속도와 유연성의 좋은 균형

4. **sed** - 빠름에서 보통
   - 스트림 편집 작업
   - 단순한 텍스트 변환

5. **Perl 원라이너** - 보통
   - 복잡한 텍스트 처리
   - 고급 정규식 기능

6. **Python/Ruby 스크립트** - 느림
   - 완전한 프로그래밍 기능
   - 높은 시작 오버헤드

---

## 메모리 최적화 전략

### 1. 스트림 처리 vs. 로딩
```bash
# 메모리 효율적 (스트리밍)
< large_file.log grep pattern | sort | head -10

# 메모리 집약적 (전체 파일 로딩)
sort large_file.log | head -10  # 모든 것을 메모리에 로드

# AWK 스트리밍 접근법
awk '/pattern/ {print $1}' large_file.log  # 한 줄씩 처리

# AWK 메모리 집약적 접근법  
awk '{lines[NR] = $0} END {for(i=1; i<=NR; i++) print lines[i]}' large_file.log
```

### 2. 대용량 데이터셋을 위한 외부 정렬
```bash
# 정렬을 위한 메모리 사용량 제한
sort -S 100M large_file.txt        # 100MB만 사용
sort --parallel=4 large_file.txt    # 4개 CPU 코어 사용
sort -T /tmp large_file.txt         # 임시 파일에 /tmp 사용

# 더 빠른 임시 저장소 사용
export TMPDIR=/dev/shm              # 임시 파일을 위한 RAM 디스크
sort large_file.txt
```

### 3. 효율적인 데이터 구조
```bash
# AWK: 적절한 데이터 구조 사용
awk '
{
    # 효율적: 직접 배열 액세스
    count[$1]++
}
END {
    for (key in count) print key, count[key]
}' data.txt

# 덜 효율적: 문자열 연결
awk '
{
    output = output $1 "\n"
}
END {
    print output
}' data.txt
```

---

## CPU 최적화

### 1. 병렬화 전략

#### GNU Parallel
```bash
# 파일을 병렬로 처리
find . -name "*.log" | parallel -j+0 'grep ERROR {}'

# 로드 밸런싱과 함께 병렬 처리
parallel -j+0 --load 80% command ::: input1 input2 input3

# 코어 간 작업 분산
seq 1 1000000 | parallel -j+0 --pipe 'wc -l'
```

#### 병렬화를 통한 xargs
```bash
# 여러 파일을 동시에 처리
ls *.log | xargs -n1 -P4 grep "ERROR"  # 4개의 병렬 프로세스

# 동적 프로세스 수
ls *.log | xargs -n1 -P$(nproc) process_file
```

#### 수동 파이프라인 병렬화
```bash
# 여러 백그라운드 프로세스로 작업 분할
{
    grep "pattern1" large_file.log > /tmp/result1 &
    grep "pattern2" large_file.log > /tmp/result2 &
    grep "pattern3" large_file.log > /tmp/result3 &
    wait
    cat /tmp/result1 /tmp/result2 /tmp/result3
}
```

### 2. 효율적인 패턴 매칭

#### 패턴에 적합한 도구 선택
```bash
# 단순 리터럴 문자열: grep 사용
grep "literal string" file.txt

# 여러 리터럴 문자열: -F 옵션과 함께 grep 사용
grep -F -f patterns.txt file.txt

# 필드 기반 처리: awk 사용
awk '$3 == "value"' file.txt

# 복잡한 정규식: 도구를 신중하게 선택
grep -P 'complex(?=pattern)' file.txt  # PCRE 기능
grep -E 'simpler|pattern' file.txt     # 더 빠른 ERE
```

#### 정규식 패턴 최적화
```bash
# 가능할 때 패턴 고정
grep '^ERROR' file.txt      # 더 빠름: 시작 지점에 고정
grep 'ERROR.*critical' file.txt  # 더 느림: 전체 라인 검색

# 문자 클래스를 효율적으로 사용  
grep '[0-9]' file.txt       # 더 빠름: 문자 클래스
grep '0|1|2|3|4|5|6|7|8|9' file.txt  # 더 느림: 교대

# 빈도순으로 교대 정렬
grep 'common|rare|very_rare' file.txt  # 가장 일반적인 것을 먼저 배치
```

---

## I/O 최적화

### 1. 디스크 작업 최소화
```bash
# 나쁨: 여러 번 파일 읽기
grep "pattern1" file.txt
grep "pattern2" file.txt  
grep "pattern3" file.txt

# 더 좋음: 여러 패턴으로 단일 패스
egrep "pattern1|pattern2|pattern3" file.txt

# 최고: 한 번 처리, 여러 번 필터링
< file.txt tee >(grep "pattern1" > result1) \
              >(grep "pattern2" > result2) \
              >(grep "pattern3" > result3) >/dev/null
```

### 2. 효율적인 파이프라인 구성
```bash
# 중간 단계 최소화
# 나쁨: 여러 중간 파일
grep pattern file.txt > temp1
sort temp1 > temp2
uniq temp2 > result
rm temp1 temp2

# 좋음: 파이프라인 처리
grep pattern file.txt | sort | uniq > result

# 더 좋음: 프로세스 생성 최소화
awk '/pattern/ {print $0}' file.txt | sort -u > result
```

### 3. 버퍼 크기 최적화
```bash
# 더 나은 I/O를 위한 버퍼 크기 조정
stdbuf -oL -eL command    # 라인 버퍼링
stdbuf -o0 -e0 command    # 버퍼링 없음 (실시간용)
stdbuf -o4K -e4K command  # 4KB 버퍼

# 배치 처리에 더 큰 버퍼 사용
dd if=input of=output bs=1M  # 기본 512B 대신 1MB 블록
```

---

## 도구별 최적화

### grep 최적화
```bash
# 리터럴 매칭에 고정 문자열 사용
grep -F "literal string" file.txt

# 여러 패턴을 효율적으로 사용
grep -f patterns.txt file.txt

# 패턴 존재 여부만 알면 될 때 출력 제한
grep -q pattern file.txt && echo "found"

# 적절한 정규식 엔진 사용
grep pattern file.txt          # BRE (가장 빠름)
grep -E pattern file.txt       # ERE (좋은 균형)
grep -P pattern file.txt       # PCRE (강력하지만 느림)
```

### awk 최적화
```bash
# 가능하면 정규식 대신 필드 비교 사용
awk '$1 == "value"' file.txt       # 더 빠름: 정확한 비교
awk '$1 ~ /^value$/' file.txt      # 더 느림: 정규식

# 정규식 컴파일 최소화
awk 'BEGIN{pattern="regex"} $0 ~ pattern' file.txt

# 적절한 데이터 구조 사용
awk '{sum += $1} END {print sum}' file.txt  # 단순 누적
awk '{values[NR] = $1} END {for(i=1; i<=NR; i++) sum += values[i]; print sum}' file.txt  # 불필요한 배열
```

### sort 최적화
```bash
# 더 나은 성능을 위한 정렬 타입 지정
sort -n numbers.txt           # 숫자 정렬
sort -g floating_numbers.txt  # 일반 숫자 정렬
sort -h human_readable.txt    # 인간이 읽을 수 있는 숫자 (1K, 2M 등)

# 적절한 메모리 제한 사용
sort -S 1G large_file.txt     # 1GB RAM 사용

# 필요한 것만 정렬
sort -k2,2n file.txt         # 두 번째 필드로만 정렬 (숫자)
sort -u file.txt             # 한 번에 정렬과 고유 처리
```

---

## 벤치마킹 방법론

### 1. 종합 시간 측정
```bash
# 기본 시간 측정
time command

# 리소스 사용량을 포함한 상세 시간 측정
/usr/bin/time -v command

# 평균을 위한 여러 번 실행
for i in {1..5}; do
    /usr/bin/time -f "%e %M" command 2>&1
done | awk '{time+=$1; mem+=$2} END {print "Avg time:", time/NR, "Avg memory:", mem/NR}'
```

### 2. 메모리 모니터링
```bash
# 실행 중 메모리 사용량 모니터링
monitor_memory() {
    local pid=$1
    local interval=${2:-1}
    while kill -0 $pid 2>/dev/null; do
        ps -o pid,vsz,rss,pcpu $pid
        sleep $interval
    done
}

# 사용법
long_running_command &
PID=$!
monitor_memory $PID > memory_usage.log
wait $PID
```

### 3. I/O 모니터링
```bash
# I/O 작업 모니터링 (Linux)
iostat -x 1 &
IOSTAT_PID=$!
command
kill $IOSTAT_PID

# iotop으로 모니터링 (사용 가능한 경우)
iotop -aoP -d1 &
IOTOP_PID=$!
command  
kill $IOTOP_PID
```

### 4. CPU 사용률
```bash
# CPU 사용률 모니터링
top -b -n1 -p PID | tail -n +8

# 더 나은 시각화를 위해 htop 사용 (사용 가능한 경우)
htop -p PID
```

---

## 성능 테스트 프레임워크

### 테스트 환경 설정
```bash
#!/bin/bash
# performance_test.sh

setup_test_env() {
    # 일관된 테스트 환경 생성
    sync && echo 3 > /proc/sys/vm/drop_caches  # 캐시 지우기
    
    # 일관된 성능을 위한 CPU 거버너 설정
    echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
    
    # 메모리 테스트를 위해 스왈 비활성화
    sudo swapoff -a
}

cleanup_test_env() {
    # 시스템 상태 복원
    echo ondemand | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
    sudo swapon -a
}

# Benchmark function
benchmark_command() {
    local cmd="$1"
    local description="$2"
    local iterations=${3:-3}
    
    echo "Benchmarking: $description"
    echo "Command: $cmd"
    echo "Iterations: $iterations"
    echo "----------------------------------------"
    
    local total_time=0
    local total_memory=0
    
    for ((i=1; i<=iterations; i++)); do
        echo "Run $i/$iterations"
        
        # Clear caches between runs
        sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
        
        # Run with timing
        local output=$(/usr/bin/time -f "%e %M" bash -c "$cmd" 2>&1)
        local time_mem=($(echo "$output" | tail -1))
        
        total_time=$(echo "$total_time + ${time_mem[0]}" | bc -l)
        total_memory=$(echo "$total_memory + ${time_mem[1]}" | bc -l)
    done
    
    # Calculate averages
    local avg_time=$(echo "scale=3; $total_time / $iterations" | bc -l)
    local avg_memory=$(echo "scale=0; $total_memory / $iterations" | bc -l)
    
    echo "Average time: ${avg_time}s"
    echo "Average peak memory: ${avg_memory}KB"
    echo "----------------------------------------"
    echo
}
```

### 샘플 벤치마크 스크립트
```bash
#!/bin/bash
# compare_tools.sh - Compare different tools for same task

# Test data generation
generate_test_data() {
    # Generate 1M line test file if not exists
    if [ ! -f test_data.txt ]; then
        seq 1 1000000 | shuf > test_data.txt
    fi
}

# Compare different approaches for finding top 10 numbers
compare_top10_methods() {
    echo "COMPARING METHODS: Find top 10 numbers from 1M lines"
    echo "=================================================="
    
    benchmark_command "sort -nr test_data.txt | head -10" "sort + head"
    
    benchmark_command "awk '{print \$1}' test_data.txt | sort -nr | head -10" "awk + sort + head"
    
    benchmark_command "perl -ne 'chomp; push @nums, \$_; END {print join(\"\n\", (sort {b <=> a} @nums)[0..9])}' test_data.txt" "perl in-memory"
    
    benchmark_command "python3 -c 'import sys; nums=sorted([int(line) for line in sys.stdin], reverse=True); print(\"\n\".join(map(str, nums[:10])))' < test_data.txt" "python in-memory"
}

main() {
    setup_test_env
    generate_test_data
    compare_top10_methods
    cleanup_test_env
}

main "$@"
```

---

## 실제 최적화 예시

### 예시 1: 로그 분석 최적화
```bash
# 느린 접근법
grep "ERROR" huge.log | grep "database" | awk '{print $1, $2}' | sort | uniq

# 최적화된 접근법
awk '/ERROR.*database/ {print $1, $2}' huge.log | sort -u

# Further optimization for repeated analysis
awk '
/ERROR.*database/ {
    timestamp = $1 " " $2
    errors[timestamp]++
}
END {
    for (ts in errors) {
        print ts, errors[ts]
    }
}' huge.log | sort
```

### 예시 2: 대용량 파일 처리
```bash
# 메모리 집약적 접근법
awk '{lines[NR] = $0} END {for(i=1; i<=NR; i++) if(lines[i] ~ /pattern/) print lines[i]}' huge_file.txt

# 메모리 효율적 접근법
awk '/pattern/ {print}' huge_file.txt

# 여러 패턴에 대한 병렬 처리
parallel -j+0 "grep {} huge_file.txt" ::: pattern1 pattern2 pattern3
```

### 예시 3: 데이터 집계
```bash
# Slow: Multiple file passes
for field in field1 field2 field3; do
    awk -v f="$field" '$1==f {sum+=$2} END {print f, sum}' data.csv
done

# Fast: Single file pass
awk '
{
    sums[$1] += $2
}
END {
    for (field in sums) {
        print field, sums[field]
    }
}' data.csv | grep -E "(field1|field2|field3)"
```

---

## 성능 문제 해결

### 일반적인 성능 문제

1. **메모리 고갈**
   - 증상: 프로세스 종료 또는 시스템 무반응
   - 해결책: 스트리밍 접근법, 외부 정렬, 또는 청크 단위 처리 사용

2. **CPU 병목**
   - 증상: 높은 CPU 사용률, 느린 처리
   - 해결책: 정규식 패턴 최적화, 더 단순한 도구 사용, 작업 병렬화

3. **I/O 병목**
   - 증상: 높은 I/O 대기 시간
   - 해결책: 파일 작업 최소화, 더 빠른 저장소 사용, 액세스 패턴 최적화

4. **비효율적인 알고리즘**
   - 증상: 데이터 크기에 따른 처리 시간 지수적 증가
   - 해결책: 더 나은 알고리즘, 적절한 도구, 또는 병렬 처리 사용

### 성능 프로파일링 도구
```bash
# 시스템 전체 모니터링
htop, top, iotop, iostat, vmstat

# 프로세스별 프로파일링
strace command           # 시스템 호출 추적
ltrace command          # 라이브러리 호출 추적  
perf record command     # CPU 프로파일링
valgrind command        # 메모리 프로파일링
```