# Part 4: 성능 최적화 챌린지
## 12개의 고성능 데이터 처리 문제

이 섹션은 대용량 데이터셋에 대한 명령줄 작업 최적화, 다양한 접근 방식 비교, 특정 성능 목표 달성에 중점을 둡니다. 문제들은 실제 확장성 과제를 강조합니다.

### 학습 목표
- 다양한 도구의 성능 특성 비교 (grep vs awk vs sed)
- 대용량 파일 처리를 위한 메모리 사용량 최적화
- `parallel`과 `xargs -P`를 사용한 병렬 처리 구현
- 스트림 처리 vs 인-메모리 접근 방식 이해
- 명령줄 작업 측정 및 벤치마크
- 멀티 기가바이트 데이터셋 효율적 처리

### 성능 목표
- **작은 파일 (<10MB):** 정확성과 가독성에 중점
- **중간 파일 (10MB-100MB):** 성능과 메모리 사용량 균형
- **대용량 파일 (100MB-1GB):** 스트리밍 알고리즘, 메모리 제약
- **거대한 파일 (>1GB):** 병렬 처리, 디스크 I/O 최적화

### 벤치마크 프레임워크
모든 솔루션에는 성능 측정이 포함되어야 합니다:
- **실행 시간:** `time` 명령 사용
- **메모리 사용량:** `/usr/bin/time -v`를 통한 최대 RSS
- **디스크 I/O:** 읽기/쓰기 작업 모니터링
- **CPU 사용량:** 멀티코어 활용도 평가

---

## 문제 인덱스

| # | 문제 | 목표 시간 | 최대 메모리 | 데이터셋 크기 | 중점 영역 |
|---|---------|-------------|------------|-------------------|-----------|
| 46 | 대용량 파일 Top-K 분석 | <30s | 100MB | 500MB | 스트림 처리 |
| 47 | 다중 도구 성능 비교 | <10s | 50MB | 100MB | 도구 선택 |
| 48 | 병렬 로그 처리 | <60s | 200MB | 1GB | 병렬화 |
| 49 | 메모리 효율적 정렬 | <45s | 150MB | 800MB | 외부 정렬 |
| 50 | 실시간 스트림 처리 | <5s 레이턴시 | 25MB | 연속 | 낮은 레이턴시 |
| 51 | 분산 데이터 집계 | <120s | 300MB | 2GB | Map-reduce 스타일 |
| 52 | I/O 최적화 챌린지 | <20s | 75MB | 400MB | 디스크 효율성 |
| 53 | CPU 집약적 패턴 매칭 | <90s | 100MB | 1.5GB | 정규표현식 최적화 |
| 54 | 네트워크 로그 확장 | <15s | 80MB | 300MB | 네트워크 데이터 |
| 55 | 데이터베이스 익스포트 처리 | <40s | 120MB | 600MB | 구조화된 데이터 |
| 56 | 시계열 분석 | <25s | 90MB | 450MB | 시간적 데이터 |
| 57 | 다중 형식 벤치마크 스위트 | <180s | 400MB | 3GB | 종합 테스트 |

## 성능 측정 도구

### 종합 벤치마크 스크립트
```bash
#!/bin/bash
benchmark_command() {
    local cmd="$1"
    local description="$2"
    
    echo "Benchmarking: $description"
    echo "Command: $cmd"
    echo "----------------------------------------"
    
    # Time measurement with detailed stats
    /usr/bin/time -v bash -c "$cmd" 2>&1 | \
    awk '
    /Elapsed \(wall clock\) time/ { print "Wall time: " $8 }
    /Maximum resident set size/ { print "Peak memory: " $6 " KB" }
    /Minor.*page faults/ { print "Minor faults: " $6 }
    /Major.*page faults/ { print "Major faults: " $6 }
    /File system inputs/ { print "FS reads: " $6 }
    /File system outputs/ { print "FS writes: " $6 }
    /Percent of CPU/ { print "CPU usage: " $7 }
    '
    echo "----------------------------------------"
    echo
}
```

### Memory Profiling
```bash
# Monitor memory usage during execution
monitor_memory() {
    local pid=$1
    while kill -0 $pid 2>/dev/null; do
        ps -o pid,vsz,rss,pcpu $pid | tail -n +2
        sleep 1
    done > memory_usage.log
}

# Usage
your_command &
PID=$!
monitor_memory $PID
wait $PID
```

### Parallel Processing Patterns
```bash
# Pattern 1: GNU parallel for file processing
find . -name "*.log" | parallel -j+0 'process_file {}'

# Pattern 2: xargs with parallelization  
ls *.log | xargs -n1 -P$(nproc) process_single_file

# Pattern 3: Custom parallel pipeline
{
    split_large_file_into_chunks |
    while read chunk; do
        process_chunk "$chunk" &
        (($(jobs -r | wc -l) >= $(nproc))) && wait
    done
    wait
}
```

## Performance Optimization Strategies

### 1. Stream Processing vs Loading
```bash
# Memory-efficient streaming (preferred for large files)
< large_file.log grep pattern | awk '{sum+=$3} END{print sum}'

# Versus loading entire file (memory intensive)
awk '/pattern/ {sum+=$3} END{print sum}' large_file.log
```

### 2. Tool Selection Guidelines
```bash
# For simple patterns: grep (fastest)
grep "ERROR" large_file.log

# For field processing: awk (most flexible)  
awk '$2 == "ERROR" {print $1, $4}' large_file.log

# For substitutions: sed (memory efficient)
sed 's/old/new/g' large_file.log

# For complex regex: perl (powerful but slower)
perl -ne 'print if /complex_pattern/' large_file.log
```

### 3. Memory Management
```bash
# Limit sort memory usage
sort -S 100M large_file.txt

# Use external sorting for huge files
sort -T /tmp --parallel=4 huge_file.txt

# Stream processing to avoid memory issues
< huge_file.txt while IFS= read -r line; do
    process_line "$line"
done
```

### 4. I/O Optimization
```bash
# Reduce disk I/O with buffering
stdbuf -oL -eL your_command

# Use faster storage for temporary files
export TMPDIR=/dev/shm  # RAM disk
sort large_file.txt

# Minimize pipe overhead
command1 | {
    # Process multiple lines at once
    while read -r line; do
        buffer="$buffer$line\n"
        if [ ${#buffer} -gt 1000 ]; then
            process_buffer "$buffer"
            buffer=""
        fi
    done
    [ -n "$buffer" ] && process_buffer "$buffer"
}
```

## Benchmark Scenarios

### Scenario 1: Top-K Problem
**Challenge:** Find top 100 IP addresses by request count from 1GB access log
**Time limit:** 30 seconds
**Memory limit:** 100MB

### Scenario 2: Multi-Tool Comparison  
**Challenge:** Same task using 4 different approaches
- Pure grep/sort/uniq pipeline
- AWK-based solution
- Perl one-liner
- Python script equivalent

### Scenario 3: Parallel Processing
**Challenge:** Process 50 log files simultaneously
**Optimization:** Maximize CPU utilization while respecting memory limits

## Testing Framework
```bash
# Performance test runner
run_performance_tests() {
    local test_dir="$1"
    local results_file="benchmark_results.csv"
    
    echo "Test,Tool,Time(s),Memory(MB),CPU%" > "$results_file"
    
    for problem in "$test_dir"/problem-*.sh; do
        problem_name=$(basename "$problem" .sh)
        
        # Run each solution 3 times, take average
        for run in 1 2 3; do
            benchmark_command "./$problem" "$problem_name-run$run" >> \
                "$results_file"
        done
    done
}
```