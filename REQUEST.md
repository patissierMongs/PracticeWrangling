# Enhanced Problem-Based Learning Workbook Request
## Command-Line Tools, Advanced Regex, and Complex Pipeline Processing

Please generate a comprehensive PBL workbook with **50+ practice problems** focusing on **Data Wrangling, Text Processing, and Advanced Pattern Matching with Command-Line Tools**.

### **Target Audience**
- Intermediate to advanced users seeking mastery of command-line text processing
- Focus on real-world scenarios requiring complex multi-tool pipelines
- Emphasis on performance optimization and debugging skills

### **Core Requirements**

#### 1. **Regular Expression Mastery**
Problems must progressively cover:
- Basic patterns → Extended regex (ERE) → Perl-compatible regex (PCRE)
- Advanced patterns: lookahead/lookbehind, non-greedy matching, backreferences
- Capturing groups and their usage across different tools (grep -P, sed -E, awk)
- Performance implications of different regex engines
- At least 15 problems specifically focused on complex regex patterns

#### 2. **Complex Pipeline Construction**
Each section should include problems requiring:
- Minimum 4-6 command chains for advanced problems
- Process substitution `<(command)` and command substitution `$(command)`
- Subshells and their performance implications
- Error handling in pipelines (set -e, pipefail)
- Tee for debugging complex pipelines

#### 3. **Performance and Optimization**
Include scenarios for:
- Processing multi-GB log files efficiently
- Comparing performance: `grep` vs `awk` vs `sed` vs `perl`
- Using `parallel` or `xargs -P` for concurrent processing
- Memory-efficient stream processing vs loading entire files

### **Enhanced File Structure**
```
pbl-workspace/
├── logs/
│   ├── web_access.log (100MB - realistic size)
│   ├── web_access_huge.log.gz (1GB compressed)
│   ├── system_events.log
│   ├── application.log (with multi-line stack traces)
│   ├── audit.log (security events)
│   └── realtime.log (for tail -f exercises)
├── data/
│   ├── users.csv (10,000 records)
│   ├── transactions.json (nested JSON structure)
│   ├── inventory.xml
│   ├── corrupted_data.txt (intentionally malformed)
│   └── binary_mixed.dat (mix of text and binary data)
├── configs/
│   ├── nginx.conf
│   ├── .env (environment variables)
│   └── database.ini
├── scripts/
│   └── (empty - for student solutions)
└── performance/
    └── benchmark.sh (template for performance testing)
```

### **Problem Categories Required**

#### **Part 1: Advanced Regex Patterns (15+ problems)**
- IP address validation (IPv4 and IPv6)
- Email extraction with full RFC compliance
- URL parsing with protocol, domain, path extraction
- Credit card number detection and masking
- Log timestamp normalization across different formats
- Password strength validation
- Extracting nested parentheses content
- HTML/XML tag matching (with proper nesting)
- Phone number formatting (international formats)
- Complex string replacements with backreferences

#### **Part 2: Multi-Stage Pipeline Processing (15+ problems)**
Example complexity levels:
```bash
# Simple (2-3 commands)
cat file | grep pattern | wc -l

# Intermediate (4-5 commands)
find . -name "*.log" | xargs grep -l ERROR | while read f; do basename $f; done | sort -u

# Advanced (6+ commands with process substitution)
comm -12 <(grep -oP '(?<=user=)[^ ]+' auth.log | sort -u) \
         <(awk -F: '$3>=1000 {print $1}' /etc/passwd | sort) | \
    while read user; do
        echo "$user: $(grep -c "user=$user.*failed" auth.log) failures"
    done | sort -t: -k2 -rn | head -10
```

#### **Part 3: Real-time Monitoring & Alerting (5+ problems)**
- Using `tail -f` with grep for live filtering
- `watch` command for periodic monitoring
- Creating alert conditions with conditional execution
- Log rotation handling during monitoring
- Multi-file simultaneous monitoring

#### **Part 4: Performance Optimization Challenges (10+ problems)**
- Process a 1GB log file to extract top 100 IPs by request count
  - Solution 1: Using awk
  - Solution 2: Using sort/uniq
  - Solution 3: Using parallel processing
  - Compare execution times and memory usage
- Stream processing vs in-memory processing trade-offs
- Optimal tool selection for different data sizes

#### **Part 5: Data Validation & Error Recovery (5+ problems)**
- Detecting and fixing CSV formatting issues
- Handling files with mixed encodings
- Recovering partial data from corrupted logs
- Validating JSON structure without external tools
- Binary file detection and text extraction

#### **Part 6: Advanced AWK Programming (10+ problems)**
- Multi-file processing with FNR/NR
- Associative arrays for data aggregation
- Custom functions in AWK
- State machines for parsing complex formats
- AWK as a reporting engine with formatted output
- Performance comparison: AWK vs Python one-liners

#### **Part 7: Security & Forensics Scenarios (5+ problems)**
- Detecting brute force attempts from auth logs
- Correlation across multiple log sources
- Extracting IoCs (Indicators of Compromise)
- Log sanitization for sharing (PII removal)
- Detecting anomalies in access patterns

#### **Part 8: Integration & Automation (10+ problems)**
- Building a log analysis dashboard with watch and tmux
- Creating reusable shell functions for common tasks
- Cron-compatible scripts with proper error handling
- Generating daily/weekly reports from multiple sources
- API response processing without jq (using awk/sed)
- Conditional workflows based on pipeline results

### **Specific Technical Requirements**

1. **Each problem should specify:**
   - Expected output format (exact formatting matters)
   - Performance constraints (if applicable)
   - Whether regex should be POSIX or PCRE
   - Edge cases to handle

2. **Progressive difficulty within each section:**
   - Start with single-tool solutions
   - Build up to complex pipelines
   - End with optimization challenges

3. **Include "debug this pipeline" problems:**
   - Provide broken pipelines for students to fix
   - Common pitfalls (word splitting, glob expansion, etc.)

4. **Real-world data characteristics:**
   - Inconsistent formatting
   - Missing fields
   - Special characters and Unicode
   - Mixed line endings (CRLF vs LF)

5. **Testing & Validation:**
   - Each solution should be verifiable with provided test cases
   - Include edge cases in test data
   - Performance benchmarks for optimization problems

### **Sample Advanced Problems**

1. **Complex Regex Challenge:**
   "Extract all SQL queries from application.log, including multi-line queries, handling both single and double quotes correctly, and output them numbered with their timestamp."

2. **Pipeline Optimization:**
   "Process web_access_huge.log.gz to find the top 10 API endpoints by total response time, but the solution must run in under 30 seconds and use less than 100MB of RAM."

3. **Real-time Correlation:**
   "Monitor realtime.log for failed login attempts. When 5 failures occur from the same IP within 60 seconds, extract all activity from that IP across all log files in the last hour."

4. **Data Recovery:**
   "The corrupted_data.txt file has damaged CSV records. Recover as much valid data as possible, report the number of corrupted lines, and produce a clean CSV with a recovery report."

### **Expected Deliverables**
- Complete problem statements with clear success criteria
- Sample input data with edge cases
- Reference solutions showcasing multiple approaches
- Performance benchmarks for each solution
- Explanation of trade-offs between different approaches
- Debugging tips for common mistakes

### **Additional Resources to Include**
- Regex cheat sheet comparing grep, sed, awk, and perl
- Performance comparison matrix for common operations
- Pipeline debugging techniques guide
- Best practices for production log processing
- Common anti-patterns to avoid

This enhanced course should prepare students for real-world command-line text processing challenges they'll encounter in DevOps, security analysis, and data engineering roles.
