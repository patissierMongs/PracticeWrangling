#!/bin/bash
# Master Performance Benchmarking Script
# Tests command-line data processing solutions for speed, memory, and accuracy

set -euo pipefail

# Configuration
BENCHMARK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$BENCHMARK_DIR/results"
LOG_FILE="$RESULTS_DIR/benchmark_$(date +%Y%m%d_%H%M%S).log"

# Performance thresholds
declare -A TIME_LIMITS=(
    ["small"]=5      # Small files: 5 seconds
    ["medium"]=30    # Medium files: 30 seconds  
    ["large"]=120    # Large files: 2 minutes
    ["huge"]=300     # Huge files: 5 minutes
)

declare -A MEMORY_LIMITS=(
    ["small"]=50     # Small files: 50MB
    ["medium"]=100   # Medium files: 100MB
    ["large"]=200    # Large files: 200MB
    ["huge"]=500     # Huge files: 500MB
)

# Initialize results directory
init_benchmark() {
    mkdir -p "$RESULTS_DIR"
    
    cat > "$LOG_FILE" <<EOF
COMMAND-LINE DATA WRANGLING BENCHMARK SUITE
===========================================
Started: $(date)
Host: $(hostname)
OS: $(uname -srm)
CPU: $(lscpu | grep "Model name" | cut -d: -f2 | xargs)
Memory: $(free -h | grep "Mem:" | awk '{print $2}')
Storage: $(df -h . | tail -1 | awk '{print $4}' available)

EOF
}

# Comprehensive performance measurement
benchmark_solution() {
    local solution_script="$1"
    local problem_name="$2"
    local size_category="$3"
    local test_data="$4"
    
    local script_name=$(basename "$solution_script" .sh)
    local result_file="$RESULTS_DIR/${problem_name}_${script_name}.result"
    
    echo "Benchmarking: $problem_name - $script_name" | tee -a "$LOG_FILE"
    echo "=============================================" | tee -a "$LOG_FILE"
    
    # Clear caches for fair comparison
    sync
    echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
    
    # Start memory monitoring in background
    local monitor_pid
    start_memory_monitor $$ &
    monitor_pid=$!
    
    # Run the solution with comprehensive timing
    local start_time=$(date +%s.%N)
    
    timeout "${TIME_LIMITS[$size_category]}" \
        /usr/bin/time -v bash "$solution_script" "$test_data" \
        > "$result_file.output" 2> "$result_file.timing" || {
        
        local exit_code=$?
        case $exit_code in
            124) echo "TIMEOUT: Exceeded ${TIME_LIMITS[$size_category]}s limit" ;;
            *) echo "FAILED: Exit code $exit_code" ;;
        esac | tee -a "$LOG_FILE"
        
        kill $monitor_pid 2>/dev/null || true
        return $exit_code
    }
    
    local end_time=$(date +%s.%N)
    kill $monitor_pid 2>/dev/null || true
    
    # Extract and analyze performance metrics
    analyze_performance_results "$result_file" "$size_category" "$start_time" "$end_time"
}

# Start memory usage monitoring
start_memory_monitor() {
    local parent_pid=$1
    local memory_log="$RESULTS_DIR/memory_$parent_pid.log"
    
    while kill -0 $parent_pid 2>/dev/null; do
        # Monitor all child processes
        pgrep -P $parent_pid | xargs -I {} sh -c '
            if kill -0 {} 2>/dev/null; then
                ps -o pid,vsz,rss,pcpu {} | tail -n +2
            fi
        ' 2>/dev/null >> "$memory_log"
        sleep 0.5
    done
}

# Analyze comprehensive performance results
analyze_performance_results() {
    local result_file="$1"
    local size_category="$2" 
    local start_time="$3"
    local end_time="$4"
    
    local timing_file="$result_file.timing"
    local memory_file="$RESULTS_DIR/memory_$$.log"
    
    # Calculate wall clock time
    local wall_time=$(echo "$end_time - $start_time" | bc -l)
    
    # Extract system metrics from /usr/bin/time
    local sys_time=$(grep "Elapsed.*time" "$timing_file" | \
                    sed 's/.*: \([0-9:]*\).*/\1/' | \
                    awk -F: '{if(NF==3) print $1*3600+$2*60+$3; else print $1*60+$2}')
    
    local peak_memory=$(grep "Maximum resident set" "$timing_file" | \
                       awk '{print int($6/1024)}') # Convert to MB
    
    local cpu_percent=$(grep "Percent of CPU" "$timing_file" | \
                       awk '{gsub(/%/, "", $7); print $7}')
    
    local fs_reads=$(grep "File system inputs" "$timing_file" | \
                    awk '{print int($6/1024)}') # Convert to MB
    
    local fs_writes=$(grep "File system outputs" "$timing_file" | \
                     awk '{print int($6/1024)}') # Convert to MB
    
    # Calculate peak memory from monitoring log
    local monitored_peak=0
    if [ -f "$memory_file" ]; then
        monitored_peak=$(awk '{if($3>max) max=$3} END{print int(max/1024)}' "$memory_file" 2>/dev/null || echo 0)
    fi
    
    # Use higher of the two memory measurements
    local actual_peak_memory=$((peak_memory > monitored_peak ? peak_memory : monitored_peak))
    
    # Performance assessment
    local time_grade="FAIL"
    local memory_grade="FAIL"
    
    [ $(echo "$sys_time <= ${TIME_LIMITS[$size_category]}" | bc -l) -eq 1 ] && time_grade="PASS"
    [ $actual_peak_memory -le ${MEMORY_LIMITS[$size_category]} ] && memory_grade="PASS"
    
    # Calculate efficiency scores
    local time_efficiency=$(echo "scale=2; (${TIME_LIMITS[$size_category]} - $sys_time) / ${TIME_LIMITS[$size_category]} * 100" | bc -l)
    local memory_efficiency=$(echo "scale=2; (${MEMORY_LIMITS[$size_category]} - $actual_peak_memory) / ${MEMORY_LIMITS[$size_category]} * 100" | bc -l)
    
    # Overall grade
    local overall_grade="F"
    if [ "$time_grade" = "PASS" ] && [ "$memory_grade" = "PASS" ]; then
        if [ $(echo "$time_efficiency > 50 && $memory_efficiency > 50" | bc -l) -eq 1 ]; then
            overall_grade="A"
        elif [ $(echo "$time_efficiency > 25 && $memory_efficiency > 25" | bc -l) -eq 1 ]; then
            overall_grade="B"
        else
            overall_grade="C"
        fi
    fi
    
    # Output detailed results
    cat >> "$LOG_FILE" <<EOF
PERFORMANCE RESULTS:
  Wall time: ${wall_time}s
  System time: ${sys_time}s
  Peak memory: ${actual_peak_memory}MB (monitored: ${monitored_peak}MB)
  CPU usage: ${cpu_percent}%
  Disk reads: ${fs_reads}MB
  Disk writes: ${fs_writes}MB
  
ASSESSMENT:
  Time constraint (≤${TIME_LIMITS[$size_category]}s): $time_grade
  Memory constraint (≤${MEMORY_LIMITS[$size_category]}MB): $memory_grade
  Time efficiency: ${time_efficiency}%
  Memory efficiency: ${memory_efficiency}%
  Overall grade: $overall_grade

EOF
    
    # Clean up monitoring files
    rm -f "$memory_file"
    
    echo "Results saved to: $result_file.output"
    echo "Grade: $overall_grade" | tee -a "$LOG_FILE"
    echo
}

# Compare multiple solutions for the same problem
compare_solutions() {
    local problem_dir="$1"
    local problem_name=$(basename "$problem_dir")
    
    echo "SOLUTION COMPARISON: $problem_name" | tee -a "$LOG_FILE"
    echo "===============================" | tee -a "$LOG_FILE"
    
    local solutions=($(find "$problem_dir" -name "solution-*.sh" | sort))
    
    if [ ${#solutions[@]} -eq 0 ]; then
        echo "No solutions found in $problem_dir" | tee -a "$LOG_FILE"
        return 1
    fi
    
    # Determine problem size category based on test data
    local size_category="medium"  # Default
    local test_data=""
    
    # Auto-detect test data and size category
    if [ -f "$problem_dir/test_data.txt" ]; then
        test_data="$problem_dir/test_data.txt"
        local file_size=$(stat -c%s "$test_data" 2>/dev/null || echo 0)
        
        if [ $file_size -lt 10485760 ]; then        # < 10MB
            size_category="small"
        elif [ $file_size -lt 104857600 ]; then     # < 100MB  
            size_category="medium"
        elif [ $file_size -lt 1073741824 ]; then    # < 1GB
            size_category="large" 
        else
            size_category="huge"
        fi
    fi
    
    # Benchmark each solution
    for solution in "${solutions[@]}"; do
        benchmark_solution "$solution" "$problem_name" "$size_category" "$test_data"
    done
    
    # Generate comparison summary
    generate_comparison_summary "$problem_name"
}

# Generate comparison summary
generate_comparison_summary() {
    local problem_name="$1"
    
    echo "COMPARISON SUMMARY: $problem_name" | tee -a "$LOG_FILE"
    echo "=================================" | tee -a "$LOG_FILE"
    
    # Create comparison table
    printf "%-20s %-8s %-8s %-10s %-8s %-6s\n" \
        "Solution" "Time(s)" "Memory(MB)" "CPU%" "Grade" "Efficiency" | tee -a "$LOG_FILE"
    printf "%-20s %-8s %-8s %-10s %-8s %-6s\n" \
        "--------" "-------" "---------" "----" "-----" "----------" | tee -a "$LOG_FILE"
    
    # Parse results and create table
    for result_file in "$RESULTS_DIR"/${problem_name}_*.result; do
        [ -f "$result_file.timing" ] || continue
        
        local solution_name=$(basename "$result_file" | sed "s/${problem_name}_//;s/.result//")
        local sys_time=$(grep "System time:" "$result_file.timing" | awk '{print $3}' | sed 's/s//')
        local memory=$(grep "Peak memory:" "$result_file.timing" | awk '{print $3}' | sed 's/MB//')  
        local cpu=$(grep "CPU usage:" "$result_file.timing" | awk '{print $3}' | sed 's/%//')
        local grade=$(grep "Overall grade:" "$result_file.timing" | awk '{print $3}')
        local efficiency=$(grep "Time efficiency:" "$result_file.timing" | awk '{print $3}' | sed 's/%//')
        
        printf "%-20s %-8s %-8s %-10s %-8s %-6s\n" \
            "$solution_name" "$sys_time" "$memory" "$cpu" "$grade" "$efficiency" | tee -a "$LOG_FILE"
    done
    
    echo | tee -a "$LOG_FILE"
}

# Run specific benchmark test
run_single_test() {
    local script_path="$1"
    local test_data="${2:-}"
    
    if [ ! -f "$script_path" ]; then
        echo "Error: Script not found: $script_path"
        exit 1
    fi
    
    local script_name=$(basename "$script_path" .sh)
    local problem_name=$(basename "$(dirname "$script_path")")
    
    echo "Running single test: $script_name"
    benchmark_solution "$script_path" "$problem_name" "medium" "$test_data"
}

# Main execution function
main() {
    case "${1:-}" in
        "compare")
            shift
            init_benchmark
            compare_solutions "${1:-.}"
            ;;
        "single")
            shift
            init_benchmark  
            run_single_test "$@"
            ;;
        *)
            cat <<EOF
Usage: $0 [command] [options]

Commands:
  compare <problem_dir>    Compare all solutions in a problem directory
  single <script> [data]   Benchmark a single solution script

Examples:
  $0 compare ../parts/part4-performance/problem-46/
  $0 single solution.sh test_data.txt

Performance Categories:
  Small files (<10MB): ≤5s, ≤50MB RAM
  Medium files (<100MB): ≤30s, ≤100MB RAM  
  Large files (<1GB): ≤2min, ≤200MB RAM
  Huge files (>1GB): ≤5min, ≤500MB RAM

Results are saved in: $RESULTS_DIR
EOF
            exit 1
            ;;
    esac
    
    echo "Benchmark completed. Full log: $LOG_FILE"
}

main "$@"