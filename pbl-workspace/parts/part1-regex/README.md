# Part 1: Advanced Regex Patterns
## 15 Progressive Pattern Matching Challenges

This section focuses on mastering regular expressions across different tools and contexts. Problems progress from basic patterns to advanced PCRE features, emphasizing real-world text processing scenarios.

### Learning Objectives
- Master basic to advanced regex patterns
- Understand differences between POSIX ERE and PCRE
- Apply regex across grep, sed, and awk
- Handle complex pattern matching with lookahead/lookbehind
- Use capturing groups and backreferences effectively
- Optimize regex performance for large datasets

### Tools Coverage
- `grep` (with -E and -P flags)
- `sed` (with -E flag)  
- `awk` with built-in regex
- Performance implications of different regex engines

### Problem Categories
1. **IP Address & Network Validation** (Problems 1-3)
2. **Email & Contact Information** (Problems 4-6)
3. **Web & URL Processing** (Problems 7-9)
4. **Log Parsing & Timestamps** (Problems 10-12)
5. **Complex Text Structures** (Problems 13-15)

### Usage Notes
- Each problem specifies the required regex engine (POSIX ERE vs PCRE)
- Solutions should handle edge cases mentioned in problem statements
- Performance constraints are noted for large file processing
- Test your solutions against the provided sample data in `../../logs/` and `../../data/`

---

## Problem Index

| # | Problem | Difficulty | Engine | Files Used |
|---|---------|------------|--------|------------|
| 1 | IPv4 Address Validation | ★★☆ | POSIX ERE | logs/web_access.log |
| 2 | IPv6 Address Detection | ★★★ | PCRE | logs/system_events.log |
| 3 | Private IP Range Classification | ★★★ | POSIX ERE | logs/web_access.log |
| 4 | RFC-Compliant Email Extraction | ★★★ | PCRE | data/users.csv |
| 5 | Email Domain Analysis | ★★☆ | POSIX ERE | data/users.csv |
| 6 | Phone Number Normalization | ★★★ | PCRE | Multiple files |
| 7 | URL Component Extraction | ★★★ | PCRE | logs/web_access.log |
| 8 | HTML Tag Matching | ★★★ | PCRE | Multiple files |
| 9 | Query Parameter Parsing | ★★☆ | POSIX ERE | logs/web_access.log |
| 10 | Multi-Format Timestamp Parsing | ★★★ | PCRE | logs/*.log |
| 11 | Log Level Standardization | ★★☆ | POSIX ERE | logs/application.log |
| 12 | Date Format Conversion | ★★★ | POSIX ERE | Multiple files |
| 13 | Nested Parentheses Content | ★★★★ | PCRE | configs/*.conf |
| 14 | Credit Card Masking | ★★★ | PCRE | data/transactions.json |
| 15 | Password Strength Validation | ★★★★ | PCRE | configs/.env |

**Difficulty Legend:**
- ★★☆ = Intermediate (basic regex knowledge)
- ★★★ = Advanced (complex patterns, groups)  
- ★★★★ = Expert (lookahead/lookbehind, complex backreferences)