# Getting Started with Command-Line Data Wrangling Master

Welcome to the most comprehensive command-line text processing and data wrangling course available. This hands-on workbook contains **89 real-world problems** designed to master advanced command-line techniques used by DevOps engineers, security analysts, and data professionals.

---

## Quick Start Guide

### 1. Verify Prerequisites
```bash
# Check essential tools are available
which grep sed awk sort uniq cut
which find xargs parallel  # Optional but recommended

# Verify GNU versions (preferred)
grep --version | head -1
awk --version | head -1
```

### 2. Navigate to the Workbook
```bash
cd pbl-workspace/
ls -la  # Explore the structure
```

### 3. Try Your First Problem
```bash
# Start with Part 1, Problem 1 (IPv4 validation)
cd parts/part1-regex/
cat problem-01.md

# Test with sample data
head ../../logs/web_access.log
```

### 4. Run the Benchmark Tool
```bash
cd ../../performance/
./benchmark.sh single ../solutions/part1-regex/solution-01.sh ../../logs/web_access.log
```

---

## Learning Path Recommendations

### **Beginner Track** (Start Here if New to Command-Line)
```
1. Review resources/regex-cheatsheet.md
2. Part 1: Problems 1-5 (Basic regex patterns)  
3. Part 2: Problems 16-20 (Simple pipelines)
4. Part 6: Problems 58-60 (Basic AWK)
```

### **Intermediate Track** (Have Basic grep/awk Experience)
```
1. Part 1: Problems 6-15 (Advanced regex)
2. Part 2: Problems 21-30 (Complex pipelines) 
3. Part 4: Problems 46-50 (Performance basics)
4. Part 6: Problems 61-65 (Advanced AWK)
```

### **Advanced Track** (Ready for Professional Challenges)
```
1. All of Part 4 (Performance optimization)
2. All of Part 7 (Security & forensics)
3. Part 2: Problem 30 (Master integration)
4. Part 6: Problem 69 (Complete AWK application)
```

### **Expert Track** (Master-Level Challenges)
```
1. Create your own solutions to all 89 problems
2. Optimize for sub-second performance on large datasets
3. Build complete automation workflows (Part 8)
4. Contribute additional problems to the workbook
```

---

## How to Use This Workbook

### Problem-Solving Approach
1. **Read the problem statement** thoroughly
2. **Understand the expected output** format
3. **Examine the sample data** to understand patterns
4. **Start with a simple solution** that works
5. **Optimize for performance** and edge cases
6. **Compare with reference solutions**

### Testing Your Solutions
```bash
# Basic correctness testing
your_solution.sh input_file.txt > your_output.txt
diff your_output.txt expected_output.txt

# Performance benchmarking
../performance/benchmark.sh single your_solution.sh input_file.txt

# Edge case testing
your_solution.sh edge_case_data.txt
```

### Directory Structure Guide
```
pbl-workspace/
├── parts/           # Problem sets organized by topic
│   ├── part1-regex/ # Advanced regex patterns (15 problems)
│   ├── part2-pipelines/ # Multi-stage processing (15 problems)
│   ├── part4-performance/ # Optimization challenges (12 problems)
│   ├── part6-awk/   # Advanced AWK programming (12 problems)
│   └── part7-security/ # Security & forensics (8 problems)
├── logs/            # Realistic log files for exercises
├── data/            # CSV, JSON, XML sample data  
├── configs/         # Configuration files
├── scripts/         # Your solution scripts (empty initially)
├── solutions/       # Reference solutions
├── performance/     # Benchmarking tools
└── resources/       # Cheat sheets and guides
```

---

## Essential Resources

### Quick Reference Files
- **`resources/regex-cheatsheet.md`** - Regex syntax across different tools
- **`resources/performance-guide.md`** - Optimization techniques and benchmarking
- **`resources/pipeline-patterns.md`** - Advanced pipeline construction patterns

### Sample Data Overview
- **`logs/web_access.log`** (1.8MB) - 12K+ web server access entries
- **`logs/application.log`** (24KB) - Multi-line stack traces and SQL queries  
- **`logs/audit.log`** (26KB) - Security events and authentication logs
- **`data/users.csv`** (1.0MB) - 12K+ user records with data quality issues
- **`data/transactions.json`** (7.0MB) - 5K complex nested transaction records
- **`data/corrupted_data.txt`** (8.3KB) - Intentionally malformed CSV for error handling

---

## Problem Categories & Difficulty

### Part 1: Advanced Regex Patterns (15 problems)
**Focus:** Master pattern matching across grep, sed, awk, and Perl
- IPv4/IPv6 address validation
- RFC-compliant email extraction  
- Complex nested parentheses parsing
- Credit card number masking
- Multi-format timestamp parsing

### Part 2: Multi-Stage Pipeline Processing (15 problems)
**Focus:** Build sophisticated command chains with process substitution
- 4-6 command pipelines for data correlation
- Process substitution mastery
- Real-time log correlation
- Multi-file content merging
- Error recovery pipelines

### Part 4: Performance Optimization Challenges (12 problems)
**Focus:** Achieve specific time/memory targets on large datasets
- Process 500MB+ files in under 30 seconds
- Memory-efficient stream processing
- Parallel processing with GNU parallel
- Algorithm optimization comparisons
- Multi-tool performance benchmarking

### Part 6: Advanced AWK Programming (12 problems)
**Focus:** Use AWK as a complete programming language
- Associative arrays for complex data structures
- Custom functions and libraries
- State machines for parsing complex formats
- Professional reporting engines
- Multi-file processing with FNR/NR

### Part 7: Security & Forensics Scenarios (8 problems)
**Focus:** Defensive security analysis and incident response
- Brute force attack detection
- Multi-source event correlation
- IoC (Indicator of Compromise) extraction
- Anomaly detection using statistical analysis
- Log sanitization for data sharing

---

## Performance Targets & Scoring

### Performance Categories
- **Small files (<10MB):** ≤5 seconds, ≤50MB RAM
- **Medium files (10-100MB):** ≤30 seconds, ≤100MB RAM
- **Large files (100MB-1GB):** ≤2 minutes, ≤200MB RAM  
- **Huge files (>1GB):** ≤5 minutes, ≤500MB RAM

### Scoring System
Each problem is graded on multiple criteria:
- **Correctness:** Does it produce the right output?
- **Performance:** Does it meet time/memory targets?
- **Code Quality:** Is it readable and maintainable?
- **Edge Cases:** Does it handle error conditions gracefully?

### Grade Levels
- **Grade A:** Exceeds performance targets, handles all edge cases
- **Grade B:** Meets performance targets, handles common edge cases
- **Grade C:** Works correctly but may exceed performance targets
- **Grade F:** Incorrect output or fails to complete

---

## Real-World Applications

### DevOps & Site Reliability Engineering
- Log analysis and troubleshooting
- Performance monitoring and alerting
- Configuration management and deployment
- Service health monitoring
- Incident response and forensics

### Security Analysis & SOC Operations  
- Security event correlation
- Threat hunting and detection
- Incident response and forensics
- Log analysis for compliance
- Automated threat intelligence processing

### Data Engineering & Analytics
- ETL pipeline development
- Data quality assessment and cleaning
- Real-time stream processing
- Report generation and automation
- Large dataset processing optimization

### System Administration
- Log rotation and archival
- System monitoring and alerting
- Backup verification and reporting
- Configuration auditing
- Performance tuning and optimization

---

## Community & Contribution

### Sharing Your Solutions
1. Create your solutions in the `scripts/` directory
2. Use descriptive naming: `part1_problem01_your_approach.sh`
3. Document your optimization techniques
4. Share performance benchmarks

### Adding New Problems
1. Follow the existing problem format
2. Provide realistic sample data
3. Include reference solutions
4. Test across different environments

### Getting Help
- Read the problem statement carefully
- Check the relevant cheat sheet in `resources/`
- Examine the sample data to understand patterns
- Start with a working solution, then optimize
- Compare your approach with reference solutions

---

## Next Steps

1. **Choose your learning track** based on current skill level
2. **Set up your environment** with the recommended tools
3. **Start with your first problem** - we recommend Part 1, Problem 1
4. **Join the community** and share your solutions
5. **Challenge yourself** with increasingly difficult problems
6. **Apply these skills** to real-world data processing challenges

Remember: The goal isn't just to solve problems, but to build intuition for when and how to use different command-line tools effectively. Each problem teaches patterns and techniques that apply to hundreds of similar real-world scenarios.

**Happy data wrangling!** 🚀