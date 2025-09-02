# Problem 20: Process Substitution Master
**Difficulty:** ★★★★ | **Commands:** 6-8 | **Files:** Multiple files

## Objective
Master process substitution `<(command)` and command substitution `$(command)` to create elegant solutions for complex data correlation tasks.

## Problem Statement
You need to create a comprehensive analysis that correlates data from multiple log files and CSV files simultaneously. This requires advanced process substitution techniques to:

1. Compare active users across different log sources
2. Find users who appear in logs but not in the user database
3. Identify IP addresses that accessed both web and system resources
4. Generate a correlation report showing user activity patterns

## Requirements
- Use process substitution `<(command)` for at least 3 different comparisons
- Implement command substitution `$(command)` for dynamic data retrieval
- Handle different file formats (logs, CSV) in the same pipeline
- Create temporary named pipes for complex data flows
- Process data without creating intermediate files

## Expected Output Format
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

## Advanced Process Substitution Techniques

### 1. Multi-File Comparison
```bash
# Compare users from three different sources
comm -12 \
  <(awk -F',' '{print $2}' ../../data/users.csv | sort) \
  <(grep -o 'user=[^[:space:]]*' ../../logs/web_access.log | \
    cut -d'=' -f2 | sort -u)
```

### 2. Dynamic Command Generation
```bash
# Generate commands based on file content
while read logfile; do
    echo "Processing: $logfile"
    comm -23 \
      <(grep -o 'user=[^[:space:]]*' "$logfile" | cut -d'=' -f2 | sort -u) \
      <(awk -F',' 'NR>1 {print $2}' ../../data/users.csv | sort)
done < <(find ../../logs -name "*.log")
```

### 3. Complex Join Operations
```bash
# Join data from processed logs with user database
join -t'|' \
  <(grep "LOGIN" ../../logs/audit.log | \
    awk '{print $6 "|" $1 " " $2}' | sort) \
  <(awk -F',' 'NR>1 {print $2 "|" $3 "|" $7}' ../../data/users.csv | sort)
```

## Implementation Framework
```bash
#!/bin/bash
set -euo pipefail

echo "USER ACTIVITY CORRELATION REPORT"
echo "================================="
echo "Generated: $(date)"
echo

# 1. Users in logs but not in database
echo "USERS IN LOGS BUT NOT IN DATABASE:"
comm -23 \
  <(cat ../../logs/*.log | \
    grep -o 'user=[^[:space:]]*' | \
    cut -d'=' -f2 | sort -u) \
  <(awk -F',' 'NR>1 {print $2}' ../../data/users.csv | sort) | \
while read orphan_user; do
    # Find which logs contain this user
    logs_containing=$(grep -l "user=$orphan_user" ../../logs/*.log | \
                     xargs -I {} basename {} | \
                     paste -sd',' -)
    echo "- $orphan_user (seen in: $logs_containing)"
done

echo
echo "IP ADDRESSES ACCESSING MULTIPLE SERVICES:"

# 2. Find IPs in both web and system logs
comm -12 \
  <(grep -Eo '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' ../../logs/web_access.log | sort -u) \
  <(grep -Eo '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' ../../logs/system_events.log | sort -u) | \
while read shared_ip; do
    web_count=$(grep -c "$shared_ip" ../../logs/web_access.log || echo 0)
    sys_count=$(grep -c "$shared_ip" ../../logs/system_events.log || echo 0)
    echo "- $shared_ip (web: $web_count requests, system: $sys_count events)"
done

# 3. User login pattern correlation using multiple process substitutions
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

## Advanced Challenges

### 1. Named Pipe Integration
```bash
# Create named pipes for complex data flows
mkfifo /tmp/pipe1 /tmp/pipe2 /tmp/pipe3

# Process multiple streams simultaneously
{
    process_web_logs > /tmp/pipe1 &
    process_system_logs > /tmp/pipe2 &  
    process_user_data > /tmp/pipe3 &
    
    # Correlate all three streams
    paste /tmp/pipe1 /tmp/pipe2 /tmp/pipe3 | process_correlation
}

# Cleanup
rm /tmp/pipe1 /tmp/pipe2 /tmp/pipe3
```

### 2. Dynamic Process Generation
```bash
# Generate process substitutions based on available files
available_logs=($(find ../../logs -name "*.log"))
process_list=""

for log in "${available_logs[@]}"; do
    process_list="$process_list <(extract_users_from '$log')"
done

# Execute dynamic process substitution (advanced bash eval usage)
eval "join_multiple_streams $process_list"
```

### 3. Error Handling in Process Substitution
```bash
# Handle errors in process substitution streams
{
    comm -12 \
      <(command1 || { echo "Error in stream 1" >&2; exit 1; }) \
      <(command2 || { echo "Error in stream 2" >&2; exit 1; })
} || {
    echo "Process substitution pipeline failed"
    exit 1  
}
```

## Performance Considerations
- Process substitution creates subshells - monitor memory usage
- Large datasets may require streaming approaches
- Consider using `sort -S` to limit memory for sort operations
- Test with larger datasets to ensure scalability

## Debugging Process Substitution
```bash
# Debug by examining intermediate outputs
echo "Stream 1:" && cat <(your_process_1)
echo "Stream 2:" && cat <(your_process_2)

# Use tee to capture intermediate results
comm -12 \
  <(process1 | tee debug_stream1.txt) \
  <(process2 | tee debug_stream2.txt)
```

---
**Previous:** [Problem 19: Error Rate Dashboard](problem-19.md) | **Next:** [Problem 21: Real-time Log Correlation](problem-21.md)