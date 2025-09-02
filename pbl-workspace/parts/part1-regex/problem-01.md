# Problem 1: IPv4 Address Validation
**Difficulty:** ★★☆ | **Engine:** POSIX ERE | **File:** `logs/web_access.log`

## Objective
Extract and validate IPv4 addresses from web access logs, distinguishing between valid and invalid IP addresses.

## Problem Statement
The web access log contains various IP addresses, but some entries may have malformed IPs due to logging errors or proxy configurations. Create a command that:

1. Extracts all potential IPv4 addresses from the access log
2. Validates that they follow proper IPv4 format (0-255 for each octet)
3. Outputs only valid IPv4 addresses, one per line
4. Counts the total number of unique valid IPs

## Requirements
- Use POSIX ERE (Extended Regular Expressions)
- Handle edge cases: leading zeros, out-of-range octets
- Must work with `grep -E` and `sed -E`
- Solution should complete in under 2 seconds for the sample file

## Expected Output Format
```
192.168.1.1
203.45.78.123
10.0.0.1
...
Total unique valid IPs: 1247
```

## Test Cases
Your solution should correctly handle:
- Valid IPs: `192.168.1.1`, `203.45.78.123`, `127.0.0.1`
- Invalid IPs: `256.1.1.1`, `192.168.1.256`, `192.168.1`
- Edge cases: `01.1.1.1` (leading zeros), `192.168.1.01`

## Sample Command Template
```bash
# Extract and validate IPv4 addresses
grep -E "YOUR_REGEX_HERE" ../../logs/web_access.log | \
    # Additional processing steps
    sort -u | wc -l
```

## Hints
1. IPv4 octets range from 0-255
2. Leading zeros should be considered invalid
3. Each octet: `(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])`
4. Consider word boundaries to avoid partial matches
5. Use `sort -u` to count unique IPs

## Advanced Challenge
Modify your solution to also extract IPs from different log positions:
- Client IP (first field)
- X-Forwarded-For headers  
- Proxy chains in the log format

## Performance Target
- Process sample file (1.8MB) in < 2 seconds
- Memory usage < 50MB
- Handle files up to 100MB efficiently

---
**Next:** [Problem 2: IPv6 Address Detection](problem-02.md)