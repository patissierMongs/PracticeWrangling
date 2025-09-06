# Problem 13: Nested Parentheses Content Extraction
**Difficulty:** ★★★★ | **Engine:** PCRE | **File:** `configs/*.conf`

## Objective
Extract content from properly balanced nested parentheses in configuration files, handling multiple levels of nesting and escaped characters.

## Problem Statement
Configuration files often contain complex nested structures with parentheses, brackets, and braces. Your task is to:

1. Extract all content within balanced parentheses `()`
2. Handle multiple levels of nesting: `((inner) outer)`
3. Respect escaped parentheses: `\(not a group\)`
4. Extract the deepest nested content separately
5. Report nesting depth for each extracted group

## Complexity Requirements
Handle these nested structures:
- **Simple:** `(config value)`
- **Nested:** `(outer (inner value) more)`
- **Deep nesting:** `(level1 (level2 (level3)))`
- **Escaped:** `(value with \(literal parentheses\))`
- **Mixed:** `{key: (nested (value))}`
- **Multiple:** `(first) some text (second (nested))`

## Requirements
- Use PCRE with recursive patterns `(?R)` or balancing groups
- Must work with `grep -P` or `perl`
- Handle escaped parentheses correctly
- Extract content at each nesting level
- Report maximum nesting depth found

## Expected Output Format
```
EXTRACTED PARENTHESES CONTENT:
==============================

DEPTH 1 (Outermost):
- "config value"
- "outer (inner value) more"
- "first"
- "second (nested)"

DEPTH 2:
- "inner value"  
- "nested"

DEPTH 3:
- "level3"

DEEPEST NESTED CONTENT:
- "level3" (depth: 3)
- "nested" (depth: 2)
- "inner value" (depth: 2)

STATISTICS:
Maximum nesting depth: 3
Total parentheses groups: 12
Escaped parentheses found: 4
```

## Test Cases
Your solution should correctly handle:

**Valid nested structures:**
```
(simple content)
(outer (inner) content)
(level1 (level2 (level3)))
(escaped \(parentheses\) here)
```

**Edge cases:**
```
((((deeply nested))))
(mixed \) with ) real parens)
() empty groups
(unterminated groups...
```

## Advanced PCRE Pattern
This problem requires advanced PCRE features:

```regex
# Recursive pattern for balanced parentheses
\((?:[^()]|(?R))*\)

# With escaped character handling
\((?:[^()\\]|\\.|(?R))*\)

# Capturing different nesting levels
(?<paren>\((?:[^()\\]|\\.|(?&paren))*\))
```

## 샘플 명령 구조
```bash
# Method 1: Using PCRE recursive patterns
grep -Po '\((?:[^()\\]|\\.|(?R))*\)' ../../configs/*.conf | \
    while read match; do
        # Calculate nesting depth
        depth=$(echo "$match" | perl -ne 'print tr/(//')
        echo "DEPTH $depth: $match"
    done

# Method 2: Using Perl for complex processing
perl -ne '
    while (/(\((?:[^()\\]|\\.|(?1))*\))/g) {
        $content = $1;
        $depth = ($content =~ tr/(/(/);
        push @{$groups[$depth]}, $content;
    }
    END {
        for $i (1..$#groups) {
            print "DEPTH $i:\n";
            print "  $_\n" for @{$groups[$i]};
        }
    }
' ../../configs/*.conf
```

## Nesting Depth Calculation
```bash
calculate_depth() {
    local content="$1"
    local depth=0
    local max_depth=0
    local i
    
    for ((i=0; i<${#content}; i++)); do
        case "${content:$i:1}" in
            '(') ((depth++)); [ $depth -gt $max_depth ] && max_depth=$depth ;;
            ')') ((depth--)) ;;
            '\') ((i++)) ;;  # Skip escaped character
        esac
    done
    
    echo $max_depth
}
```

## Content Extraction by Depth
```bash
extract_by_depth() {
    local content="$1"
    local target_depth="$2"
    local current_depth=0
    local start_pos=-1
    local result=""
    
    # Complex parsing logic to extract content at specific depth
    # This is where PCRE recursive patterns shine!
}
```

## Performance Considerations
- Recursive regex can be computationally expensive
- Consider iterative approaches for very deep nesting
- Test memory usage with large configuration files
- Balance accuracy vs. performance for production use

## Debugging Strategies
1. **Start simple:** Test with single-level parentheses first
2. **Incremental complexity:** Add one nesting level at a time
3. **Escape handling:** Test escaped characters separately
4. **Visualize matching:** Use tools that highlight regex matches
5. **Edge cases:** Test with malformed/unbalanced parentheses

## 대체 접근 방식
PCRE 재귀 패턴을 사용할 수 없는 경우:

```bash
# 방법 1: awk를 사용한 스택 기반 파싱
awk '
{
    stack_depth = 0
    for (i = 1; i <= length($0); i++) {
        char = substr($0, i, 1)
        if (char == "(") stack_depth++
        else if (char == ")") stack_depth--
        # Process based on stack_depth
    }
}'

# 방법 2: 다른 깊이에 대한 다중 패스
grep -o '([^()]*)'  # Depth 1 only
grep -o '([^()]*([^()]*)[^()]*)'  # Depth 2
```

## Real-World Applications
- **Configuration parsing:** nginx.conf, Apache config
- **Code analysis:** Function calls, expressions  
- **Data extraction:** Structured text formats
- **Validation:** Balanced bracket checking

---
**Previous:** [Problem 12: Date Format Conversion](problem-12.md) | **Next:** [Problem 14: Credit Card Masking](problem-14.md)