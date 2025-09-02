# Part 2: Multi-Stage Pipeline Processing
## 15 Complex Command Chain Challenges

This section focuses on building sophisticated command pipelines that combine multiple tools effectively. Problems progress from simple 2-3 command chains to advanced 6+ command sequences with process substitution and subshells.

### Learning Objectives
- Master complex command chaining and pipeline construction
- Understand process substitution `<(command)` and command substitution `$(command)`
- Handle error propagation in pipelines with `set -o pipefail`
- Use `tee` for debugging and multi-output scenarios
- Optimize pipeline performance and memory usage
- Apply proper quoting and escaping in complex chains

### Pipeline Complexity Levels
1. **Simple (2-3 commands):** Basic filtering and counting
2. **Intermediate (4-5 commands):** Multi-stage processing with sorting
3. **Advanced (6+ commands):** Process substitution, complex logic
4. **Expert (8+ commands):** Subshells, parallel processing, error handling

### Tools Integration
- **File operations:** `find`, `locate`, `ls`
- **Text processing:** `grep`, `sed`, `awk`, `cut`, `sort`, `uniq`
- **Data manipulation:** `join`, `comm`, `paste`, `column`
- **Output formatting:** `pr`, `fmt`, `fold`
- **System integration:** `xargs`, `parallel`

---

## Problem Index

| # | Problem | Difficulty | Commands | Files Used |
|---|---------|------------|----------|------------|
| 16 | Log Analysis Pipeline | ★★☆ | 4-5 | logs/web_access.log |
| 17 | User Activity Correlation | ★★★ | 6-7 | logs/*.log, data/users.csv |
| 18 | Multi-File Content Merger | ★★☆ | 4-5 | data/*.csv |
| 19 | Error Rate Dashboard | ★★★ | 7-8 | logs/web_access.log |
| 20 | Process Substitution Master | ★★★★ | 6-8 | Multiple files |
| 21 | Real-time Log Correlation | ★★★★ | 8+ | logs/*.log |
| 22 | Data Quality Assessment | ★★★ | 5-6 | data/corrupted_data.txt |
| 23 | Configuration Diff Pipeline | ★★☆ | 4-5 | configs/*.conf |
| 24 | Multi-Source Report Generator | ★★★★ | 8+ | All data files |
| 25 | Performance Monitoring Chain | ★★★ | 6-7 | logs/system_events.log |
| 26 | Security Alert Pipeline | ★★★★ | 7-9 | logs/audit.log |
| 27 | Data Transformation Chain | ★★★ | 5-7 | data/*.json, data/*.xml |
| 28 | Parallel Processing Pipeline | ★★★★ | 6+ | Large datasets |
| 29 | Error Recovery Pipeline | ★★★ | 6-7 | data/corrupted_data.txt |
| 30 | Master Integration Pipeline | ★★★★★ | 10+ | All files |

**Difficulty Legend:**
- ★★☆ = Intermediate (4-5 command chains)
- ★★★ = Advanced (6-7 commands, process substitution)
- ★★★★ = Expert (8+ commands, complex logic)
- ★★★★★ = Master (10+ commands, full integration)

## Pipeline Design Principles

### 1. Error Handling
```bash
# Proper error propagation
set -o pipefail
command1 | command2 | command3 || {
    echo "Pipeline failed at step: $?"
    exit 1
}
```

### 2. Process Substitution
```bash
# Compare outputs from two different processes
comm -12 <(process1 | sort) <(process2 | sort)

# Multiple input streams
join <(source1 | sort -k1) <(source2 | sort -k1)
```

### 3. Debugging with tee
```bash
# Debug intermediate stages
command1 | tee debug1.txt | \
command2 | tee debug2.txt | \
command3
```

### 4. Performance Optimization
```bash
# Memory-efficient large file processing
< large_file.log \
grep pattern | \
sort -S 1G | \
uniq -c | \
sort -nr
```

## Common Pipeline Patterns

### Data Processing Pipeline
```bash
# Extract → Filter → Transform → Aggregate → Format
find . -name "*.log" | \
xargs grep -h "ERROR" | \
sed 's/.*\[\([^]]*\)\].*/\1/' | \
sort | uniq -c | sort -nr | \
head -10 | \
awk '{printf "%-20s %5d\n", $2, $1}'
```

### Multi-Source Correlation
```bash
# Correlate data from multiple sources
join -t',' \
  <(cut -d',' -f1,3 users.csv | sort) \
  <(cut -d',' -f2,4 transactions.csv | sort -k1) | \
column -t -s','
```

### Real-time Monitoring
```bash
# Live pipeline with continuous processing
tail -f log.txt | \
grep --line-buffered "PATTERN" | \
while read line; do
    # Process each line as it arrives
    echo "$(date): $line" | tee -a alerts.log
done
```