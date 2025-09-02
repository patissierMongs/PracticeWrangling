# Problem 4: RFC-Compliant Email Extraction
**Difficulty:** ★★★ | **Engine:** PCRE | **File:** `data/users.csv`

## Objective
Extract and validate email addresses according to RFC 5322 specification, handling edge cases and international domains.

## Problem Statement
The users CSV contains email addresses with various formats, including some that are technically valid but unusual. Your task is to:

1. Extract all email addresses from the CSV file
2. Validate them against RFC 5322 specifications
3. Categorize them by domain type (common, educational, international)
4. Identify potentially suspicious or malformed addresses

## RFC 5322 Compliance Requirements
Handle these email format complexities:
- **Local part:** Letters, numbers, and special characters: `! # $ % & ' * + - / = ? ^ _ ` { | } ~`
- **Quoted strings:** `"john doe"@example.com`
- **Dot notation:** `john.doe@example.com` (but not `john..doe@example.com`)
- **International domains:** `user@münchen.de`, `test@xn--mnchen-3ya.de`
- **Subdomain depth:** `user@mail.subdomain.example.com`
- **IP literals:** `user@[192.168.1.1]`, `user@[IPv6:2001:db8::1]`

## Requirements
- Use PCRE for advanced features (lookbehind, etc.)
- Must work with `grep -P`
- Handle Unicode in international domains
- Validate consecutive dots (invalid)
- Check maximum length limits (64 chars local, 255 chars domain)

## Expected Output Format
```
VALID EMAILS BY CATEGORY:
=========================

COMMON DOMAINS:
john.doe@gmail.com
jane.smith@yahoo.com
admin@outlook.com

EDUCATIONAL:
student@university.edu
prof@college.edu

BUSINESS DOMAINS:
contact@company.com
support@business.org

INTERNATIONAL:
user@münchen.de
test@παράδειγμα.δοκιμή

SUSPICIOUS/UNUSUAL:
"test user"@example.com (quoted local part)
user@[192.168.1.1] (IP literal)

INVALID:
user@domain..com (consecutive dots)
toolongusername123456789012345678901234567890@domain.com (local part too long)
user@domain (missing TLD)

STATISTICS:
Valid emails: 8,432
Invalid emails: 245  
Suspicious emails: 67
```

## Test Cases
Your solution should correctly classify:

**Valid:**
- `simple@example.com`
- `user.name+tag@example.com`
- `"john doe"@example.com`
- `user@münchen.de`

**Invalid:**
- `user@domain..com` (consecutive dots)
- `user@domain` (no TLD)
- `user@@example.com` (double @)
- `user..name@example.com` (consecutive dots in local)

## Sample Command Structure
```bash
# Extract email addresses with PCRE
grep -Po "YOUR_RFC_EMAIL_REGEX" ../../data/users.csv | \
    while read email; do
        # Validate and categorize each email
        if [[ "$email" =~ \.edu$ ]]; then
            echo "EDUCATIONAL: $email"
        elif [[ "$email" =~ \[.*\] ]]; then
            echo "SUSPICIOUS: $email (IP literal)"
        # ... more categorization logic
        fi
    done | sort
```

## Advanced Validation Checks

1. **Length Validation:**
   ```bash
   # Check local part length (max 64 chars)
   local_part=$(echo "$email" | cut -d'@' -f1)
   [ ${#local_part} -le 64 ] || echo "INVALID: local part too long"
   ```

2. **Consecutive Dot Detection:**
   ```bash
   # Invalid: consecutive dots anywhere
   [[ "$email" =~ \.\. ]] && echo "INVALID: consecutive dots"
   ```

3. **International Domain Handling:**
   ```bash
   # Detect punycode (xn--) domains
   [[ "$email" =~ @.*xn-- ]] && echo "PUNYCODE: $email"
   ```

## PCRE Pattern Complexity
The full RFC 5322 regex is extremely complex. Consider building incrementally:

```regex
# Basic structure (simplified)
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$

# With quoted local parts
^("([^"\\]|\\.)*"|[a-zA-Z0-9._%+-]+)@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$

# Full RFC compliance (hundreds of characters!)
```

## Performance Optimization
- Break complex validation into multiple passes
- Use simpler regex for initial extraction
- Apply detailed validation in subsequent steps
- Consider memory usage for large CSV files

## Edge Case Handling
1. **CSV Parsing:** Email addresses within quoted CSV fields
2. **Encoding:** UTF-8 international characters
3. **Whitespace:** Leading/trailing spaces around emails
4. **Case Sensitivity:** Domain names are case-insensitive

---
**Previous:** [Problem 3: Private IP Range Classification](problem-03.md) | **Next:** [Problem 5: Email Domain Analysis](problem-05.md)