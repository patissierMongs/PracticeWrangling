# Regular Expression Cheat Sheet
## Command-Line Tools Comparison

This cheat sheet covers regex syntax differences across the main command-line tools used in this workbook.

---

## Tool Comparison Matrix

| Feature | grep | grep -E | grep -P | sed | awk | perl |
|---------|------|---------|---------|-----|-----|------|
| **Basic patterns** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Extended patterns** | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| **Lookahead/behind** | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| **Non-greedy** | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| **Backreferences** | ✗ | Limited | ✓ | ✓ | ✗ | ✓ |
| **Unicode** | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| **Performance** | Fast | Fast | Medium | Fast | Medium | Slow |

---

## Basic Patterns (All Tools)

### Character Classes
```regex
.           # Any character except newline
[abc]       # Character set (a, b, or c)  
[^abc]      # Negated set (not a, b, or c)
[a-z]       # Character range
[[:alpha:]] # POSIX character class
\d          # Digit (PCRE only)
\w          # Word character (PCRE only)
\s          # Whitespace (PCRE only)
```

### Quantifiers
```regex
*           # Zero or more
+           # One or more  
?           # Zero or one
{n}         # Exactly n times
{n,}        # n or more times
{n,m}       # Between n and m times
```

### Anchors
```regex
^           # Start of line
$           # End of line
\b          # Word boundary
\<          # Start of word (some tools)
\>          # End of word (some tools)
```

---

## Extended Patterns (ERE: grep -E, awk)

### Alternation
```regex
cat|dog     # Match "cat" or "dog"
(red|blue)  # Grouping with alternation
```

### Grouping
```regex
(abc)+      # Group "abc" repeated
(a|b)c      # "ac" or "bc"
```

### Practical Examples
```bash
# Email pattern (basic ERE)
grep -E '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

# IP address (ERE)
grep -E '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'

# Date formats (ERE)  
grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'  # YYYY-MM-DD
```

---

## PCRE Features (grep -P, perl)

### Advanced Quantifiers
```regex
*?          # Non-greedy zero or more
+?          # Non-greedy one or more
{n,m}?      # Non-greedy range
```

### Lookahead/Lookbehind
```regex
(?=...)     # Positive lookahead
(?!...)     # Negative lookahead
(?<=...)    # Positive lookbehind
(?<!...)    # Negative lookbehind
```

### Character Shortcuts
```regex
\d          # [0-9]
\D          # [^0-9]
\w          # [a-zA-Z0-9_]
\W          # [^a-zA-Z0-9_]
\s          # [ \t\n\r\f]
\S          # [^ \t\n\r\f]
```

### Advanced Examples
```bash
# Extract URLs with protocol
grep -Po 'https?://[^\s<>"]+' file.txt

# Password validation (8+ chars, contains digit and special char)
grep -P '^(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})'

# Email with lookahead validation
grep -Po '(?=.*@)(?=.*\.[a-z]{2,})[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'

# Extract quoted strings, handling escaped quotes
grep -Po '"(?:[^"\\]|\\.)*"'
```

---

## Tool-Specific Syntax

### grep Examples
```bash
# Basic patterns (BRE)
grep 'pattern' file.txt
grep '^start' file.txt
grep 'end$' file.txt

# Extended patterns (ERE)
grep -E '(cat|dog)+' file.txt
grep -E '\b[0-9]{3}-[0-9]{3}-[0-9]{4}\b' file.txt

# Perl patterns (PCRE)
grep -P '\d+\.\d+\.\d+\.\d+' file.txt
grep -P '(?i)error.*(?=critical)' file.txt
```

### sed Examples
```bash
# Basic replacement (BRE)
sed 's/old/new/' file.txt
sed 's/\([a-z]*\)/\U\1/' file.txt  # Uppercase capture

# Extended replacement
sed -E 's/([0-9]+)-([0-9]+)-([0-9]+)/\3\/\2\/\1/' file.txt

# Multiple operations
sed -e 's/foo/bar/' -e 's/baz/qux/' file.txt
```

### awk Examples
```bash
# Field-based patterns
awk '/pattern/ {print $2}' file.txt
awk '$1 ~ /^[0-9]+$/ {print "Number:", $1}' file.txt

# Built-in regex functions
awk '{if (match($0, /([0-9]+)/, arr)) print arr[1]}' file.txt
awk '{gsub(/old/, "new"); print}' file.txt

# Case-insensitive matching
awk 'IGNORECASE=1; /pattern/ {print}' file.txt
```

---

## Performance Comparison

### Speed Rankings (Fastest to Slowest)
1. **grep (BRE)** - Fastest for simple patterns
2. **grep -E** - Fast for extended patterns  
3. **sed** - Fast for substitutions
4. **awk** - Medium speed, very flexible
5. **grep -P** - Slower due to PCRE engine
6. **perl** - Slowest but most powerful

### When to Use Each Tool

#### Use `grep` (BRE) for:
- Simple literal string searches
- Basic pattern matching
- Maximum speed requirements
- Large file processing

#### Use `grep -E` for:
- Extended patterns with alternation
- Complex character classes
- When you need speed + moderate complexity

#### Use `grep -P` for:
- Lookahead/lookbehind assertions
- Non-greedy quantifiers
- Unicode support
- Complex pattern validation

#### Use `sed` for:
- Text substitution and editing
- Stream editing operations
- Simple backreference usage
- Pipeline text transformation

#### Use `awk` for:
- Field-based processing
- Calculations and data analysis
- Complex multi-condition logic
- Report generation

#### Use `perl` for:
- Most complex regex features
- One-liners with advanced logic
- Unicode and international text
- When other tools aren't sufficient

---

## Common Gotchas and Solutions

### Escaping Differences
```bash
# BRE (grep, sed default)
grep '\(pattern\)'     # Parentheses need escaping
grep '\+\?'            # + and ? need escaping

# ERE (grep -E, awk)
grep -E '(pattern)'    # No escaping needed
grep -E '+?'           # No escaping needed

# PCRE (grep -P, perl)
grep -P '(?:pattern)'  # Non-capturing groups available
```

### Word Boundaries
```bash
# POSIX word boundary (most tools)
grep '\bword\b'

# Alternative word boundary
grep '\<word\>'

# PCRE word boundary
grep -P '\bword\b'
```

### Case Sensitivity
```bash
# Case-insensitive options
grep -i 'pattern'
grep -E -i 'pattern'  
grep -P -i 'pattern'
sed 's/pattern/replacement/I'  # GNU sed
awk 'IGNORECASE=1; /pattern/'
```

---

## Debugging Regex

### Testing Strategies
```bash
# Test step by step
echo "test string" | grep -E 'simple'
echo "test string" | grep -E 'simple|pattern'  
echo "test string" | grep -E '(simple|pattern)'

# Use -o to see exact matches
grep -Eo 'pattern' file.txt

# Use -n to see line numbers
grep -En 'pattern' file.txt

# Test with verbose mode (if available)
grep -P '(?# comment)pattern' file.txt
```

### Common Debugging Tools
```bash
# Online regex testers (copy patterns to test)
# regex101.com - excellent for PCRE
# regexpal.com - JavaScript regex
# regexr.com - visual regex builder

# Command-line testing
printf "test\nstring\nhere" | grep -E 'your_pattern'

# Trace execution (some tools)
grep --debug 'pattern' file.txt  # If available
```

---

## Best Practices

### 1. Choose the Right Tool
- Start with simplest tool that works
- Consider performance requirements  
- Match complexity to tool capabilities

### 2. Optimize Patterns
- Place most selective parts first
- Use character classes instead of alternation when possible
- Anchor patterns when you can

### 3. Test Thoroughly
- Test with edge cases
- Verify with different input sizes
- Check encoding and locale issues

### 4. Document Complex Patterns
```bash
# Good: documented complex pattern
IP_PATTERN='^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
# Matches IPv4: 0-255 for each octet

grep -E "$IP_PATTERN" file.txt
```