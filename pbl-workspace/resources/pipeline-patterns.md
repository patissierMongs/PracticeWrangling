# Pipeline Patterns & Best Practices

This guide covers advanced pipeline construction patterns, error handling, and debugging techniques for complex command chains.

---

## Pipeline Construction Principles

### 1. The Unix Philosophy in Pipelines
- **Do one thing well:** Each command should have a single, well-defined purpose
- **Work together:** Commands should be composable and chainable
- **Handle text streams:** Universal input/output format for interoperability
- **Fail fast:** Errors should propagate and be detectable

### 2. Pipeline Flow Patterns
```bash
# Linear processing (most common)
input | filter | transform | aggregate | output

# Branching (tee for multiple outputs)
input | tee >(process1 > output1) >(process2 > output2) | process3 > output3

# Merging (multiple inputs to single process)
{ process1; process2; process3; } | single_processor

# Conditional processing
input | if_condition_true | then_process | else_alternative
```

---

## Advanced Pipeline Patterns

### 1. Process Substitution Patterns

#### Input Process Substitution
```bash
# Compare outputs of two different processes
diff <(command1) <(command2)

# Join data from multiple sources
join <(source1 | sort) <(source2 | sort)

# Use process output as file input
command --config-file=<(generate_config)
```

#### Output Process Substitution
```bash
# Send output to multiple processes
command | tee >(processor1) >(processor2) >/dev/null

# Complex branching with different processing paths
data_source | tee >(filter1 | process1 > output1) \
                  >(filter2 | process2 > output2) \
                  >(filter3 | process3 > output3) >/dev/null
```

### 2. Subshell Patterns
```bash
# Group commands with different environments
(export VAR=value; command1 | command2) | command3

# Parallel processing in subshells
{
    (process_chunk1 &)
    (process_chunk2 &)
    (process_chunk3 &)
    wait
} | aggregate_results

# Isolated error handling
(set -e; risky_command1 | risky_command2) || handle_error
```

### 3. Named Pipe Patterns
```bash
# Create persistent communication channels
mkfifo /tmp/pipe1 /tmp/pipe2

# Producer-consumer pattern
producer > /tmp/pipe1 &
consumer < /tmp/pipe1 &

# Complex multi-stage processing
{
    stage1 > /tmp/pipe1 &
    stage2 < /tmp/pipe1 > /tmp/pipe2 &
    stage3 < /tmp/pipe2
}

# Cleanup
rm /tmp/pipe1 /tmp/pipe2
```

---

## Error Handling in Pipelines

### 1. Exit Status Propagation
```bash
# Enable pipeline failure detection
set -o pipefail

# Check pipeline exit status
command1 | command2 | command3
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "command1 failed"
elif [ ${PIPESTATUS[1]} -ne 0 ]; then
    echo "command2 failed"
elif [ ${PIPESTATUS[2]} -ne 0 ]; then
    echo "command3 failed"
fi
```

### 2. Error Recovery Patterns
```bash
# Retry on failure
retry_pipeline() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if command1 | command2 | command3; then
            return 0
        else
            echo "Attempt $attempt failed, retrying..."
            ((attempt++))
            sleep 1
        fi
    done
    
    echo "Pipeline failed after $max_attempts attempts"
    return 1
}
```

### 3. Graceful Degradation
```bash
# Fallback processing when primary method fails
primary_pipeline() {
    complex_command1 | complex_command2 | complex_command3
}

fallback_pipeline() {
    simple_command1 | simple_command2
}

# Try primary, fall back if needed
primary_pipeline || {
    echo "Primary pipeline failed, using fallback..."
    fallback_pipeline
}
```

---

## Debugging Pipeline Techniques

### 1. Intermediate Output Inspection
```bash
# Save intermediate results with tee
command1 | tee debug1.txt | \
command2 | tee debug2.txt | \
command3 > final_output.txt

# Conditional debugging
DEBUG=${DEBUG:-0}
if [ $DEBUG -eq 1 ]; then
    command1 | tee debug1.txt | command2 | tee debug2.txt | command3
else
    command1 | command2 | command3
fi
```

### 2. Pipeline Component Testing
```bash
# Test each component individually
echo "test input" | command1  # Test first stage
echo "expected_input_for_command2" | command2  # Test second stage
echo "expected_input_for_command3" | command3  # Test third stage

# Test pipeline segments incrementally
echo "test input" | command1 | command2  # Test first two stages
echo "test input" | command1 | command2 | command3  # Full pipeline
```

### 3. Error Tracing
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

## Performance Optimization Patterns

### 1. Parallel Processing
```bash
# Divide work across multiple processes
split_and_process() {
    local input_file="$1"
    local output_file="$2"
    local num_processes=${3:-$(nproc)}
    
    # Split input
    split -n l/$num_processes "$input_file" /tmp/chunk_
    
    # Process chunks in parallel
    for chunk in /tmp/chunk_*; do
        process_chunk "$chunk" > "${chunk}.result" &
    done
    wait
    
    # Merge results
    cat /tmp/chunk_*.result > "$output_file"
    
    # Cleanup
    rm /tmp/chunk_*
}
```

### 2. Memory-Efficient Processing
```bash
# Stream processing to avoid memory issues
large_file_processor() {
    local input_file="$1"
    
    # Instead of loading entire file
    # awk '{lines[NR] = $0} END {process all lines}' "$input_file"
    
    # Use streaming approach
    while IFS= read -r line; do
        process_line "$line"
    done < "$input_file"
}
```

### 3. I/O Optimization
```bash
# Minimize file operations
efficient_multi_filter() {
    local input_file="$1"
    
    # Instead of multiple passes
    # grep "pattern1" "$input_file" > temp1
    # grep "pattern2" "$input_file" > temp2
    # grep "pattern3" "$input_file" > temp3
    
    # Single pass with multiple outputs
    < "$input_file" tee >(grep "pattern1" > temp1) \
                        >(grep "pattern2" > temp2) \
                        >(grep "pattern3" > temp3) >/dev/null
}
```

---

## Complex Pipeline Examples

### 1. Log Analysis Pipeline
```bash
# Comprehensive web log analysis
analyze_web_logs() {
    local log_file="$1"
    local report_file="$2"
    
    {
        echo "WEB LOG ANALYSIS REPORT"
        echo "======================"
        echo "Generated: $(date)"
        echo "Log file: $log_file"
        echo
        
        # Top IPs by request count
        echo "TOP 10 IP ADDRESSES:"
        awk '{print $1}' "$log_file" | \
        sort | uniq -c | sort -nr | head -10 | \
        awk '{printf "  %-15s %8d requests\n", $2, $1}'
        echo
        
        # Error analysis
        echo "ERROR ANALYSIS:"
        awk '$9 ~ /^[45][0-9][0-9]/ {errors[$9]++} 
             END {for (code in errors) printf "  %s: %d\n", code, errors[code]}' "$log_file" | \
        sort
        echo
        
        # Hourly traffic distribution
        echo "HOURLY TRAFFIC:"
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

### 2. Data Processing Pipeline
```bash
# ETL pipeline for CSV data
process_csv_data() {
    local input_csv="$1"
    local output_csv="$2"
    
    # Extract, Transform, Load pipeline
    < "$input_csv" \
    sed 1d | \                          # Remove header (Extract)
    awk -F',' '
        {
            # Data cleaning (Transform)
            gsub(/"/, "", $2)           # Remove quotes from names
            gsub(/[^0-9.]/, "", $3)     # Clean numeric fields
            
            # Data validation
            if (NF == 5 && $3 ~ /^[0-9]+\.?[0-9]*$/) {
                print $0
            }
        }' | \
    sort -t',' -k3,3n | \              # Sort by numeric field
    awk -F',' '                        # Aggregate and format (Load)
        BEGIN {
            OFS = ","
            print "ID,Name,Value,Category,Status"  # New header
        }
        {
            # Format output
            printf "%d,%s,%.2f,%s,%s\n", $1, $2, $3, $4, $5
        }' > "$output_csv"
}
```

### 3. Real-time Monitoring Pipeline
```bash
# Live log monitoring with alerting
monitor_logs() {
    local log_file="$1"
    local alert_threshold=${2:-10}
    
    tail -f "$log_file" | \
    while read -r line; do
        # Parse log entry
        timestamp=$(echo "$line" | awk '{print $1 " " $2}')
        level=$(echo "$line" | awk '{print $3}')
        message=$(echo "$line" | cut -d' ' -f4-)
        
        # Process different log levels
        case "$level" in
            ERROR|CRITICAL)
                echo "$(date): ALERT - $level: $message" | \
                tee -a alerts.log | \
                notify_admin
                ;;
            WARN)
                echo "$(date): WARNING: $message" >> warnings.log
                ;;
            *)
                # Count normal entries for statistics
                ((normal_count++))
                
                # Periodic status report
                if (( normal_count % 1000 == 0 )); then
                    echo "$(date): Processed $normal_count normal log entries"
                fi
                ;;
        esac
    done
}

notify_admin() {
    # Send alert (placeholder - integrate with actual notification system)
    mail -s "Log Alert" admin@example.com
}
```

---

## Pipeline Anti-Patterns to Avoid

### 1. Unnecessary Process Creation
```bash
# Bad: Multiple processes for simple operations
cat file.txt | grep pattern | cat

# Good: Direct processing
grep pattern file.txt
```

### 2. Useless Use of cat (UUOC)
```bash
# Bad: Unnecessary cat
cat file.txt | awk '{print $1}'

# Good: Direct file input
awk '{print $1}' file.txt
```

### 3. Inefficient Looping
```bash
# Bad: Process spawning in loop
while read line; do
    echo "$line" | sed 's/old/new/'
done < file.txt

# Good: Single process
sed 's/old/new/' file.txt
```

### 4. Ignoring Error Conditions
```bash
# Bad: Ignoring pipeline failures
command1 | command2 | command3
echo "Pipeline completed"

# Good: Check for errors
set -o pipefail
if command1 | command2 | command3; then
    echo "Pipeline completed successfully"
else
    echo "Pipeline failed with exit code $?"
    exit 1
fi
```

---

## Best Practices Summary

### 1. Design Principles
- **Start simple:** Build complexity incrementally
- **Test components:** Verify each stage works correctly
- **Handle errors:** Plan for failure scenarios
- **Document complexity:** Explain non-obvious operations

### 2. Performance Guidelines
- **Minimize processes:** Combine operations when possible
- **Use appropriate tools:** Match tool capabilities to requirements
- **Stream data:** Avoid unnecessary memory usage
- **Parallelize wisely:** Balance parallelism with resource constraints

### 3. Debugging Strategies
- **Incremental testing:** Test pipeline stages individually
- **Intermediate outputs:** Save debugging information
- **Error propagation:** Enable pipefail and check exit codes
- **Logging:** Add appropriate logging for troubleshooting

### 4. Maintenance Considerations
- **Code clarity:** Write readable pipeline code
- **Error messages:** Provide helpful error information
- **Documentation:** Document expected inputs and outputs
- **Version control:** Track pipeline changes over time