# 문제 46: 대용량 파일 Top-K 분석
**난이도:** ★★★ | **목표 시간:** <30s | **최대 메모리:** 100MB | **데이터셋:** 500MB

## Objective
Process a large web access log to find the top 100 IP addresses by request count, optimizing for both speed and memory usage with multiple algorithmic approaches.

## Problem Statement
You have a 500MB web access log file (we'll simulate this with the existing web_access.log repeated). Your task is to:

1. Extract all IP addresses from the access log
2. Count requests per IP address  
3. Find the top 100 IPs by request count
4. Complete the analysis in under 30 seconds using less than 100MB RAM
5. Compare performance of 4 different approaches

## Performance Constraints
- **Time limit:** 30 seconds wall clock time
- **Memory limit:** 100MB peak RSS
- **Input size:** ~500MB (created by repeating sample log)
- **Output:** Top 100 IPs with exact counts

## Expected Output Format
```
TOP 100 IP ADDRESSES BY REQUEST COUNT
=====================================
Processing 500MB log file...

RESULTS:
Rank    IP Address         Request Count    Percentage
----    ----------         -------------    ----------
   1    192.168.1.100           45,678      2.34%
   2    203.0.113.45            34,562      1.77%
   3    198.51.100.33           28,901      1.48%
   ...
 100    10.0.0.195               1,247      0.06%

PERFORMANCE SUMMARY:
Method: stream_processing_v1
Execution time: 23.4 seconds
Peak memory: 78 MB
CPU utilization: 94%
Disk reads: 500 MB
Efficiency score: A+

Total IPs processed: 2,847,392
Unique IPs found: 18,456
Top 100 represent: 23.7% of total requests
```

## Four Required Approaches

### Approach 1: Stream Processing with External Sort
```bash
#!/bin/bash
# Method: stream_processing_v1
# Strategy: Extract IPs, use external sort, avoid loading entire dataset

large_file="$1"

echo "Method 1: Stream Processing with External Sort"
echo "=============================================="

time {
    # Extract IPs using stream processing
    grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' "$large_file" | \
    
    # Use external sort with limited memory
    sort -S 50M --parallel=$(nproc) | \
    
    # Count occurrences efficiently  
    uniq -c | \
    
    # Sort by count (numeric, reverse)
    sort -nr -S 30M | \
    
    # Take top 100
    head -100 | \
    
    # Format output
    awk 'BEGIN{print "Rank\tIP Address\t\tRequest Count"} 
         {printf "%4d\t%-15s\t%s\n", NR, $2, $1}'
}
```

### Approach 2: AWK-Based In-Memory Processing
```bash
#!/bin/bash  
# Method: awk_aggregation_v2
# Strategy: Single-pass AWK processing with associative arrays

echo "Method 2: AWK-Based In-Memory Processing"
echo "======================================="

time {
    awk '
    # Extract IP addresses and count in one pass
    {
        # Multiple IP regex patterns for comprehensive extraction
        while (match($0, /\b([0-9]{1,3}\.){3}[0-9]{1,3}\b/)) {
            ip = substr($0, RSTART, RLENGTH)
            count[ip]++
            $0 = substr($0, RSTART + RLENGTH)
        }
    }
    
    END {
        # Sort by count (requires GNU awk)
        PROCINFO["sorted_in"] = "@val_num_desc"
        
        print "Rank\tIP Address\t\tRequest Count"
        rank = 1
        for (ip in count) {
            printf "%4d\t%-15s\t%d\n", rank, ip, count[ip]
            if (++rank > 100) break
        }
    }
    ' "$large_file"
}
```

### Approach 3: Parallel Processing with xargs
```bash
#!/bin/bash
# Method: parallel_processing_v3  
# Strategy: Split file into chunks, process in parallel, merge results

echo "Method 3: Parallel Processing"
echo "============================"

time {
    # Calculate optimal chunk size
    file_size=$(stat -c%s "$large_file")
    chunk_size=$((file_size / $(nproc) / 1024 / 1024))M
    
    # Split file into chunks and process in parallel
    split -b "$chunk_size" "$large_file" /tmp/chunk_
    
    # Process chunks in parallel
    ls /tmp/chunk_* | xargs -n1 -P$(nproc) -I{} sh -c '
        grep -oE "\b([0-9]{1,3}\.){3}[0-9]{1,3}\b" {} | \
        sort | uniq -c > {}.counts
    '
    
    # Merge all chunk results
    cat /tmp/chunk_*.counts | \
    awk '{ip_count[$2] += $1} 
         END {
             for (ip in ip_count) 
                 print ip_count[ip], ip
         }' | \
    sort -nr | \
    head -100 | \
    awk 'BEGIN{print "Rank\tIP Address\t\tRequest Count"} 
         {printf "%4d\t%-15s\t%s\n", NR, $2, $1}'
    
    # Cleanup
    rm -f /tmp/chunk_*
}
```

### Approach 4: Hybrid Stream-Memory Approach
```bash
#!/bin/bash
# Method: hybrid_optimized_v4
# Strategy: Streaming input, memory-efficient counting, optimized output

echo "Method 4: Hybrid Stream-Memory Approach"  
echo "======================================"

time {
    # Use a more memory-efficient approach
    {
        # Stream processing with buffered counting
        grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' "$large_file" | \
        
        # Sort in chunks to manage memory
        sort -S 40M --parallel=$(nproc) --batch-size=1000 | \
        
        # Efficient counting and immediate top-K filtering
        awk '
        BEGIN { max_tracked = 1000 }  # Track only top 1000 to save memory
        {
            count[$1]++
            total++
            
            # Periodically clean up low-count entries to save memory
            if (total % 100000 == 0) {
                # Keep only entries with significant counts
                min_threshold = int(total / max_tracked / 10)
                for (ip in count) {
                    if (count[ip] < min_threshold) {
                        delete count[ip]
                    }
                }
            }
        }
        
        END {
            # Sort by count and output top 100
            for (ip in count) {
                print count[ip], ip  
            }
        }' | \
        sort -nr | head -100 | \
        awk 'BEGIN{print "Rank\tIP Address\t\tRequest Count"} 
             {printf "%4d\t%-15s\t%s\n", NR, $2, $1}'
    }
}
```

## Performance Measurement Script
```bash
#!/bin/bash
# comprehensive_benchmark.sh

# Create large test file (if not exists)
create_large_test_file() {
    if [ ! -f large_access.log ]; then
        echo "Creating 500MB test file..."
        # Repeat the sample log to create larger dataset
        for i in {1..300}; do
            cat ../../logs/web_access.log >> large_access.log
        done
    fi
}

# Benchmark function with detailed metrics
benchmark_approach() {
    local method_script="$1"
    local method_name="$2"
    
    echo "BENCHMARKING: $method_name"
    echo "=========================="
    
    # Clear system caches for fair comparison
    sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
    
    # Run with comprehensive timing
    /usr/bin/time -v "./$method_script" large_access.log 2>&1 | \
    tee "${method_name}_results.log"
    
    # Extract key performance metrics
    awk '
    /Elapsed.*time/ { 
        gsub(/[()]/, "", $8)
        split($8, t, /:/)
        time = t[1]*60 + t[2]
        print "Execution time: " time " seconds"
    }
    /Maximum resident set/ { 
        memory_mb = $6 / 1024
        print "Peak memory: " int(memory_mb) " MB" 
    }
    /Percent of CPU/ {
        gsub(/%/, "", $7)
        print "CPU utilization: " $7 "%"
    }
    /File system inputs/ { print "Disk reads: " int($6/1024) " MB" }
    ' "${method_name}_results.log"
    
    echo
}

# Main execution
main() {
    create_large_test_file
    
    echo "LARGE FILE TOP-K ANALYSIS BENCHMARK"
    echo "=================================="
    echo "File size: $(du -h large_access.log | cut -f1)"
    echo "Target: Top 100 IPs, <30s, <100MB RAM"
    echo
    
    # Run all four approaches
    benchmark_approach "approach1_stream.sh" "stream_processing"
    benchmark_approach "approach2_awk.sh" "awk_aggregation"  
    benchmark_approach "approach3_parallel.sh" "parallel_processing"
    benchmark_approach "approach4_hybrid.sh" "hybrid_optimized"
    
    echo "PERFORMANCE COMPARISON SUMMARY"
    echo "=============================="
    
    # Compare results across all methods
    for method in stream_processing awk_aggregation parallel_processing hybrid_optimized; do
        echo -n "$method: "
        grep "Execution time\|Peak memory" "${method}_results.log" | \
        paste -sd' ' - | awk '{print $3 "s, " $7 "MB"}'
    done
}

main "$@"
```

## Optimization Challenges

### Memory Optimization
1. **External Sorting:** Use `-S` flag to limit sort memory
2. **Streaming Processing:** Avoid loading entire file into memory
3. **Garbage Collection:** Periodically clean up data structures in long-running processes

### CPU Optimization  
1. **Parallelization:** Utilize all CPU cores effectively
2. **Algorithm Selection:** Choose optimal algorithms for data size
3. **Pipeline Efficiency:** Minimize data copying between processes

### I/O Optimization
1. **Sequential Access:** Read files sequentially for better disk performance
2. **Buffering:** Use appropriate buffer sizes for I/O operations
3. **Temporary Storage:** Use faster storage (/dev/shm) for temporary files

## Advanced Requirements
1. **Scalability Test:** Solution must handle 5GB files in under 5 minutes
2. **Memory Constraint:** Never exceed 100MB RSS regardless of input size
3. **Accuracy:** Results must be identical across all methods
4. **Error Handling:** Graceful handling of insufficient memory/disk space

---
**Previous:** [Problem 45: Data Transformation Performance](problem-45.md) | **Next:** [Problem 47: Multi-Tool Performance Comparison](problem-47.md)