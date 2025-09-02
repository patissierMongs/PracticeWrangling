# Part 4: Performance Optimization Challenges
## 12 High-Performance Data Processing Problems

This section focuses on optimizing command-line operations for large datasets, comparing different approaches, and achieving specific performance targets. Problems emphasize real-world scalability challenges.

### Learning Objectives
- Compare performance characteristics of different tools (grep vs awk vs sed)
- Optimize memory usage for large file processing
- Implement parallel processing with `parallel` and `xargs -P`
- Understand stream processing vs in-memory approaches
- Measure and benchmark command-line operations
- Handle multi-gigabyte datasets efficiently

### Performance Targets
- **Small files (<10MB):** Focus on correctness and readability
- **Medium files (10MB-100MB):** Balance performance and memory usage
- **Large files (100MB-1GB):** Streaming algorithms, memory constraints
- **Huge files (>1GB):** Parallel processing, disk I/O optimization

### Benchmarking Framework
All solutions must include performance measurements:
- **Execution time:** Using `time` command
- **Memory usage:** Peak RSS via `/usr/bin/time -v`
- **Disk I/O:** Read/write operations monitoring
- **CPU usage:** Multi-core utilization assessment

---

## Problem Index

| # | Problem | Target Time | Max Memory | Dataset Size | Focus Area |
|---|---------|-------------|------------|--------------|------------|
| 46 | Large File Top-K Analysis | <30s | 100MB | 500MB | Stream processing |
| 47 | Multi-Tool Performance Comparison | <10s | 50MB | 100MB | Tool selection |
| 48 | Parallel Log Processing | <60s | 200MB | 1GB | Parallelization |
| 49 | Memory-Efficient Sorting | <45s | 150MB | 800MB | External sorting |
| 50 | Real-time Stream Processing | <5s latency | 25MB | Continuous | Low-latency |
| 51 | Distributed Data Aggregation | <120s | 300MB | 2GB | Map-reduce style |
| 52 | I/O Optimization Challenge | <20s | 75MB | 400MB | Disk efficiency |
| 53 | CPU-Intensive Pattern Matching | <90s | 100MB | 1.5GB | Regex optimization |
| 54 | Network Log Scaling | <15s | 80MB | 300MB | Network data |
| 55 | Database Export Processing | <40s | 120MB | 600MB | Structured data |
| 56 | Time Series Analysis | <25s | 90MB | 450MB | Temporal data |
| 57 | Multi-Format Benchmark Suite | <180s | 400MB | 3GB | Comprehensive test |

## Performance Measurement Tools

### Comprehensive Benchmarking Script
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