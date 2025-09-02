# Command-Line Performance Optimization Guide

This guide provides systematic approaches to optimizing command-line data processing operations, with benchmarking methodologies and real-world optimization techniques.

---

## Performance Hierarchy

### Tool Speed Rankings (Typical Use Cases)

1. **Built-in shell operations** - Fastest
   - Variable manipulation, arithmetic
   - File redirection, simple loops

2. **C-based utilities** - Very Fast  
   - `grep`, `sort`, `cut`, `wc`
   - Optimized for specific tasks

3. **AWK** - Fast to Medium
   - Excellent for field processing
   - Good balance of speed and flexibility

4. **sed** - Fast to Medium
   - Stream editing operations
   - Simple text transformations

5. **Perl one-liners** - Medium
   - Complex text processing
   - Advanced regex features

6. **Python/Ruby scripts** - Slower
   - Full programming features
   - Heavy startup overhead

---

## Memory Optimization Strategies

### 1. Stream Processing vs. Loading
```bash
# Memory-efficient (streaming)
< large_file.log grep pattern | sort | head -10

# Memory-intensive (loading entire file)
sort large_file.log | head -10  # Loads everything into memory

# AWK streaming approach
awk '/pattern/ {print $1}' large_file.log  # Processes line by line

# AWK memory-intensive approach  
awk '{lines[NR] = $0} END {for(i=1; i<=NR; i++) print lines[i]}' large_file.log
```

### 2. External Sorting for Large Datasets
```bash
# Limit memory usage for sort
sort -S 100M large_file.txt        # Use only 100MB
sort --parallel=4 large_file.txt    # Use 4 CPU cores
sort -T /tmp large_file.txt         # Use /tmp for temporary files

# Use faster temporary storage
export TMPDIR=/dev/shm              # RAM disk for temp files
sort large_file.txt
```

### 3. Efficient Data Structures
```bash
# AWK: Use appropriate data structures
awk '
{
    # Efficient: Direct array access
    count[$1]++
}
END {
    for (key in count) print key, count[key]
}' data.txt

# Less efficient: String concatenation
awk '
{
    output = output $1 "\n"
}
END {
    print output
}' data.txt
```

---

## CPU Optimization

### 1. Parallelization Strategies

#### GNU Parallel
```bash
# Process files in parallel
find . -name "*.log" | parallel -j+0 'grep ERROR {}'

# Parallel processing with load balancing
parallel -j+0 --load 80% command ::: input1 input2 input3

# Distribute work across cores
seq 1 1000000 | parallel -j+0 --pipe 'wc -l'
```

#### xargs with Parallelization
```bash
# Process multiple files simultaneously
ls *.log | xargs -n1 -P4 grep "ERROR"  # 4 parallel processes

# Dynamic process count
ls *.log | xargs -n1 -P$(nproc) process_file
```

#### Manual Pipeline Parallelization
```bash
# Split work across multiple background processes
{
    grep "pattern1" large_file.log > /tmp/result1 &
    grep "pattern2" large_file.log > /tmp/result2 &
    grep "pattern3" large_file.log > /tmp/result3 &
    wait
    cat /tmp/result1 /tmp/result2 /tmp/result3
}
```

### 2. Efficient Pattern Matching

#### Choose the Right Tool for the Pattern
```bash
# Simple literal string: Use grep
grep "literal string" file.txt

# Multiple literal strings: Use grep with -F
grep -F -f patterns.txt file.txt

# Field-based processing: Use awk
awk '$3 == "value"' file.txt

# Complex regex: Consider tool carefully
grep -P 'complex(?=pattern)' file.txt  # PCRE features
grep -E 'simpler|pattern' file.txt     # Faster ERE
```

#### Optimize Regex Patterns
```bash
# Anchor patterns when possible
grep '^ERROR' file.txt      # Faster: anchored to start
grep 'ERROR.*critical' file.txt  # Slower: searches entire line

# Use character classes efficiently  
grep '[0-9]' file.txt       # Faster: character class
grep '0|1|2|3|4|5|6|7|8|9' file.txt  # Slower: alternation

# Order alternation by frequency
grep 'common|rare|very_rare' file.txt  # Put most common first
```

---

## I/O Optimization

### 1. Minimize Disk Operations
```bash
# Bad: Multiple file reads
grep "pattern1" file.txt
grep "pattern2" file.txt  
grep "pattern3" file.txt

# Better: Single pass with multiple patterns
egrep "pattern1|pattern2|pattern3" file.txt

# Best: Process once, filter multiple times
< file.txt tee >(grep "pattern1" > result1) \
              >(grep "pattern2" > result2) \
              >(grep "pattern3" > result3) >/dev/null
```

### 2. Efficient Pipeline Construction
```bash
# Minimize intermediate steps
# Bad: Multiple intermediate files
grep pattern file.txt > temp1
sort temp1 > temp2
uniq temp2 > result
rm temp1 temp2

# Good: Pipeline processing
grep pattern file.txt | sort | uniq > result

# Better: Minimize process creation
awk '/pattern/ {print $0}' file.txt | sort -u > result
```

### 3. Buffer Size Optimization
```bash
# Adjust buffer sizes for better I/O
stdbuf -oL -eL command    # Line buffering
stdbuf -o0 -e0 command    # Unbuffered (for real-time)
stdbuf -o4K -e4K command  # 4KB buffer

# Use larger buffers for batch processing
dd if=input of=output bs=1M  # 1MB blocks instead of default 512B
```

---

## Tool-Specific Optimizations

### grep Optimizations
```bash
# Use fixed strings for literal matches
grep -F "literal string" file.txt

# Use multiple patterns efficiently
grep -f patterns.txt file.txt

# Limit output when you only need to know if pattern exists
grep -q pattern file.txt && echo "found"

# Use appropriate regex engine
grep pattern file.txt          # BRE (fastest)
grep -E pattern file.txt       # ERE (good balance)
grep -P pattern file.txt       # PCRE (powerful but slower)
```

### awk Optimizations
```bash
# Use field comparison instead of regex when possible
awk '$1 == "value"' file.txt       # Faster: exact comparison
awk '$1 ~ /^value$/' file.txt      # Slower: regex

# Minimize regex compilation
awk 'BEGIN{pattern="regex"} $0 ~ pattern' file.txt

# Use appropriate data structures
awk '{sum += $1} END {print sum}' file.txt  # Simple accumulation
awk '{values[NR] = $1} END {for(i=1; i<=NR; i++) sum += values[i]; print sum}' file.txt  # Unnecessary array
```

### sort Optimizations
```bash
# Specify sort type for better performance
sort -n numbers.txt           # Numeric sort
sort -g floating_numbers.txt  # General numeric sort
sort -h human_readable.txt    # Human readable numbers (1K, 2M, etc.)

# Use appropriate memory limits
sort -S 1G large_file.txt     # Use 1GB of RAM

# Sort only what you need
sort -k2,2n file.txt         # Sort only by second field (numeric)
sort -u file.txt             # Sort and unique in one pass
```

---

## Benchmarking Methodology

### 1. Comprehensive Timing
```bash
# Basic timing
time command

# Detailed timing with resource usage
/usr/bin/time -v command

# Multiple runs for average
for i in {1..5}; do
    /usr/bin/time -f "%e %M" command 2>&1
done | awk '{time+=$1; mem+=$2} END {print "Avg time:", time/NR, "Avg memory:", mem/NR}'
```

### 2. Memory Monitoring
```bash
# Monitor memory usage during execution
monitor_memory() {
    local pid=$1
    local interval=${2:-1}
    while kill -0 $pid 2>/dev/null; do
        ps -o pid,vsz,rss,pcpu $pid
        sleep $interval
    done
}

# Usage
long_running_command &
PID=$!
monitor_memory $PID > memory_usage.log
wait $PID
```

### 3. I/O Monitoring
```bash
# Monitor I/O operations (Linux)
iostat -x 1 &
IOSTAT_PID=$!
command
kill $IOSTAT_PID

# Monitor with iotop (if available)
iotop -aoP -d1 &
IOTOP_PID=$!
command  
kill $IOTOP_PID
```

### 4. CPU Utilization
```bash
# Monitor CPU usage
top -b -n1 -p PID | tail -n +8

# Use htop for better visualization (if available)
htop -p PID
```

---

## Performance Testing Framework

### Test Environment Setup
```bash
#!/bin/bash
# performance_test.sh

setup_test_env() {
    # Create consistent test environment
    sync && echo 3 > /proc/sys/vm/drop_caches  # Clear caches
    
    # Set CPU governor for consistent performance
    echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
    
    # Disable swap for memory tests
    sudo swapoff -a
}

cleanup_test_env() {
    # Restore system state
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

### Sample Benchmark Script
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

## Real-World Optimization Examples

### Example 1: Log Analysis Optimization
```bash
# Slow approach
grep "ERROR" huge.log | grep "database" | awk '{print $1, $2}' | sort | uniq

# Optimized approach
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

### Example 2: Large File Processing
```bash
# Memory-intensive approach
awk '{lines[NR] = $0} END {for(i=1; i<=NR; i++) if(lines[i] ~ /pattern/) print lines[i]}' huge_file.txt

# Memory-efficient approach
awk '/pattern/ {print}' huge_file.txt

# Parallel processing for multiple patterns
parallel -j+0 "grep {} huge_file.txt" ::: pattern1 pattern2 pattern3
```

### Example 3: Data Aggregation
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

## Troubleshooting Performance Issues

### Common Performance Problems

1. **Memory Exhaustion**
   - Symptom: Process killed or system becomes unresponsive
   - Solution: Use streaming approaches, external sorting, or process in chunks

2. **CPU Bottlenecks**
   - Symptom: High CPU usage, slow processing
   - Solution: Optimize regex patterns, use simpler tools, parallelize work

3. **I/O Bottlenecks**
   - Symptom: High I/O wait times
   - Solution: Minimize file operations, use faster storage, optimize access patterns

4. **Inefficient Algorithms**
   - Symptom: Processing time grows exponentially with data size
   - Solution: Use better algorithms, appropriate tools, or parallel processing

### Performance Profiling Tools
```bash
# System-wide monitoring
htop, top, iotop, iostat, vmstat

# Process-specific profiling
strace command           # System call tracing
ltrace command          # Library call tracing  
perf record command     # CPU profiling
valgrind command        # Memory profiling
```