# Problem 2: IPv6 Address Detection
**Difficulty:** ★★★ | **Engine:** PCRE | **File:** `logs/system_events.log`

## Objective
Detect and extract IPv6 addresses from system event logs, handling various IPv6 formats including compressed notation.

## Problem Statement
System logs may contain IPv6 addresses in different formats due to various applications and services. Your task is to:

1. Extract all valid IPv6 addresses from the system events log
2. Handle all standard IPv6 formats (full, compressed, mixed IPv4-mapped)
3. Normalize them to their canonical form
4. Identify which are link-local vs global unicast addresses

## IPv6 Format Requirements
Handle these IPv6 formats:
- **Full format:** `2001:0db8:85a3:0000:0000:8a2e:0370:7334`
- **Compressed:** `2001:db8:85a3::8a2e:370:7334`
- **Leading zero omission:** `2001:db8:85a3:0:0:8a2e:370:7334`  
- **IPv4-mapped:** `::ffff:192.0.2.1`
- **Loopback:** `::1`
- **Link-local:** `fe80::1%eth0` (with interface)

## Requirements
- Use PCRE (Perl Compatible Regular Expressions)
- Must work with `grep -P`
- Validate hexadecimal digits (0-9, a-f, A-F)
- Handle double colon compression rules
- Extract interface identifiers when present

## Expected Output Format
```
GLOBAL UNICAST:
2001:db8:85a3::8a2e:370:7334
2001:4860:4860::8888

LINK-LOCAL:
fe80::1
fe80::a00:27ff:fe4e:66a1

IPv4-MAPPED:
::ffff:192.0.2.1
::ffff:203.0.113.5

SPECIAL:
::1 (loopback)
:: (unspecified)

Total IPv6 addresses found: 23
```

## Test Cases
Your solution should correctly handle:
- Valid: `2001:db8::1`, `::1`, `fe80::1%eth0`
- Invalid: `2001:db8:85a3::8a2e::7334` (double ::)
- Edge cases: `::` (all zeros), `::ffff:0:0`

## Sample Command Framework
```bash
# Extract IPv6 addresses using PCRE
grep -Po "YOUR_IPV6_REGEX_HERE" ../../logs/system_events.log | \
    while read ip; do
        # Classify and process each IPv6 address
        case "$ip" in
            fe80:*) echo "LINK-LOCAL: $ip" ;;
            ::ffff:*) echo "IPv4-MAPPED: $ip" ;;
            *) echo "GLOBAL: $ip" ;;
        esac
    done
```

## Advanced Requirements
1. **Interface Detection:** Extract network interface from link-local addresses
2. **Scope Validation:** Identify different IPv6 address scopes
3. **Compression Analysis:** Count how many zero groups were compressed

## PCRE Pattern Components
Consider these IPv6 regex building blocks:
```regex
# Hexadecimal group: 1-4 hex digits
[0-9a-fA-F]{1,4}

# Full IPv6 without compression
([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}

# Compressed notation (complex!)
# Must account for :: appearing only once
```

## Performance Considerations
- IPv6 regex can be computationally expensive
- Consider breaking into multiple simpler patterns
- Test performance on larger log files
- Memory usage should remain under 100MB

## Debugging Tips
1. Test each IPv6 format individually first
2. Use `grep -Po` to see exact matches
3. Validate against online IPv6 regex testers
4. Check for edge cases with `::` placement

---
**Previous:** [Problem 1: IPv4 Address Validation](problem-01.md) | **Next:** [Problem 3: Private IP Range Classification](problem-03.md)