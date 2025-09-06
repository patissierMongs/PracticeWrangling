# 문제 60: 상태 머신 로그 파서
**난이도:** ★★★★ | **중점:** 상태 머신 | **파일:** `logs/application.log`

## Objective
Build a sophisticated AWK state machine to parse multi-line log entries including stack traces, SQL queries, and nested error conditions from application logs.

## Problem Statement
Application logs contain complex multi-line entries that require stateful parsing:

1. **Multi-line stack traces** that span dozens of lines
2. **SQL queries** that may span multiple lines with various formatting
3. **Nested error contexts** where one error triggers related errors
4. **Mixed entry types** requiring different parsing strategies

Your AWK program must maintain state across lines and correctly group related log entries.

## Input Log Format Examples

### Multi-line Stack Traces
```
2024-01-15 14:23:45.123 ERROR [thread-1] DatabaseConnection failed
java.sql.SQLException: Connection timeout
    at com.example.db.ConnectionPool.getConnection(ConnectionPool.java:245)
    at com.example.service.UserService.findUser(UserService.java:67)
    at com.example.controller.UserController.getUser(UserController.java:34)
    at javax.servlet.http.HttpServlet.service(HttpServlet.java:623)
Caused by: java.net.SocketTimeoutException: Read timed out
    at java.net.SocketInputStream.socketRead0(Native Method)
    at java.net.SocketInputStream.read(SocketInputStream.java:150)
```

### Multi-line SQL Queries
```
2024-01-15 14:23:47.456 DEBUG [thread-2] Executing query:
SELECT u.id, u.username, u.email, 
       p.first_name, p.last_name,
       COUNT(o.id) as order_count
FROM users u 
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.active = true
  AND u.created_at > '2024-01-01'
GROUP BY u.id, u.username, p.first_name, p.last_name
ORDER BY order_count DESC;
Query executed in 45ms, returned 1247 rows
```

### Nested Error Contexts  
```
2024-01-15 14:24:12.789 ERROR [thread-3] Payment processing failed
Payment gateway returned: CARD_DECLINED
  Transaction ID: TXN_789456123
  Amount: $127.50
  Card: ****1234
  User: user_456789
Context: Checkout process for order ORD_334455
  Previous attempt at 14:23:58 also failed
  User has 2 failed attempts in last hour
```

## Expected Output Format
```
APPLICATION LOG ANALYSIS REPORT
===============================
Parsed log entries: 1,247
Processing time: 2.3 seconds

STACK TRACE ANALYSIS:
====================
Total stack traces found: 23

Most frequent error types:
  1. java.sql.SQLException: 8 occurrences
  2. java.lang.NullPointerException: 5 occurrences  
  3. java.net.SocketTimeoutException: 4 occurrences
  4. java.io.IOException: 3 occurrences
  5. java.lang.IllegalArgumentException: 3 occurrences

Stack trace depth analysis:
  Average depth: 12.4 frames
  Maximum depth: 28 frames (at 14:25:31.234)
  Minimum depth: 4 frames

Common failure points:
  ConnectionPool.getConnection(): 12 traces
  UserService.findUser(): 8 traces
  HttpServlet.service(): 15 traces

SQL QUERY ANALYSIS:
==================
Total SQL queries found: 156
Query types:
  SELECT: 89 queries (57.1%)
  INSERT: 34 queries (21.8%)
  UPDATE: 24 queries (15.4%)
  DELETE: 9 queries (5.8%)

Performance analysis:
  Average execution time: 23.7ms
  Slowest query: 1,247ms (SELECT with 5 JOINs)
  Fastest query: 2ms (Simple INSERT)
  
Queries by complexity:
  Simple (1-2 lines): 67 queries
  Medium (3-5 lines): 54 queries
  Complex (6+ lines): 35 queries

ERROR CONTEXT ANALYSIS:
======================
Payment processing errors: 12 instances
  - CARD_DECLINED: 7 cases
  - INSUFFICIENT_FUNDS: 3 cases
  - GATEWAY_TIMEOUT: 2 cases

User session errors: 8 instances
  - Session expired: 5 cases
  - Invalid session: 3 cases

System errors: 18 instances
  - Database connection: 12 cases
  - File system: 4 cases
  - Network timeout: 2 cases

TEMPORAL ANALYSIS:
=================
Error frequency by hour:
  14:00-14:15: 5 errors
  14:15-14:30: 12 errors  ← Peak error period
  14:30-14:45: 3 errors
  14:45-15:00: 2 errors

Error correlation patterns:
  Database errors often followed by user session timeouts (8 cases)
  Payment failures tend to cluster within 5-minute windows (3 clusters)
```

## AWK State Machine Implementation

### Core State Machine Structure
```awk
#!/usr/bin/awk -f

# State definitions
BEGIN {
    STATE_NORMAL = 0
    STATE_READING_STACKTRACE = 1
    STATE_READING_SQL = 2
    STATE_READING_CONTEXT = 3
    
    state = STATE_NORMAL
    current_entry = ""
    entry_count = 0
}

# Main processing logic with state transitions
{
    # Always capture the line for potential multi-line entries
    line = $0
    
    # State transition logic
    if (state == STATE_NORMAL) {
        handle_normal_state(line)
    } else if (state == STATE_READING_STACKTRACE) {
        handle_stacktrace_state(line)
    } else if (state == STATE_READING_SQL) {
        handle_sql_state(line)
    } else if (state == STATE_READING_CONTEXT) {
        handle_context_state(line)
    }
}

# State handler functions
function handle_normal_state(line) {
    # Check for start of multi-line entries
    if (match(line, /^[0-9]{4}-[0-9]{2}-[0-9]{2}.*ERROR.*/) && 
        line ~ /(Exception|Error):/) {
        
        # Start of stack trace
        state = STATE_READING_STACKTRACE
        current_entry = line
        extract_error_info(line)
        
    } else if (match(line, /^[0-9]{4}-[0-9]{2}-[0-9]{2}.*DEBUG.*Executing query:/)) {
        
        # Start of SQL query
        state = STATE_READING_SQL
        current_entry = line
        extract_query_info(line)
        
    } else if (match(line, /^[0-9]{4}-[0-9]{2}-[0-9]{2}.*ERROR.*/) && 
               line ~ /Context:/) {
        
        # Start of error context
        state = STATE_READING_CONTEXT
        current_entry = line
        extract_context_info(line)
        
    } else {
        # Regular single-line log entry
        process_single_line_entry(line)
    }
}

function handle_stacktrace_state(line) {
    if (line ~ /^[[:space:]]*at /) {
        # Stack trace frame
        current_entry = current_entry "\n" line
        stack_frames[current_trace_id]++
        
        # Extract method information
        if (match(line, /at ([^(]+)\(([^)]+)\)/, method_info)) {
            method_calls[method_info[1]]++
        }
        
    } else if (line ~ /^Caused by:/) {
        # Nested exception
        current_entry = current_entry "\n" line
        nested_exceptions[current_trace_id]++
        
    } else if (line ~ /^[0-9]{4}-[0-9]{2}-[0-9]{2}/) {
        # New log entry - finalize current stack trace
        finalize_stacktrace()
        state = STATE_NORMAL
        handle_normal_state(line)
        
    } else if (line ~ /^[[:space:]]*$/) {
        # Empty line - might be end of stack trace
        if (next_line_starts_new_entry()) {
            finalize_stacktrace()
            state = STATE_NORMAL
        }
    } else {
        # Continuation of stack trace
        current_entry = current_entry "\n" line
    }
}

function handle_sql_state(line) {
    if (line ~ /^(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|GROUP|ORDER)/i ||
        line ~ /^[[:space:]]+(AND|OR|ON|BY|SET|VALUES|INTO)/) {
        
        # SQL continuation
        current_entry = current_entry "\n" line
        
    } else if (line ~ /Query executed in.*returned.*rows/) {
        # End of SQL query with performance info
        current_entry = current_entry "\n" line
        extract_sql_performance(line)
        finalize_sql_query()
        state = STATE_NORMAL
        
    } else if (line ~ /^[0-9]{4}-[0-9]{2}-[0-9]{2}/) {
        # New log entry - finalize current SQL
        finalize_sql_query()
        state = STATE_NORMAL
        handle_normal_state(line)
    } else {
        # Possible SQL continuation
        current_entry = current_entry "\n" line
    }
}

function handle_context_state(line) {
    if (line ~ /^[[:space:]]*[A-Z][a-zA-Z ]+:/ ||
        line ~ /^[[:space:]]*Transaction ID:/ ||
        line ~ /^[[:space:]]*Previous attempt/) {
        
        # Context details
        current_entry = current_entry "\n" line
        parse_context_details(line)
        
    } else if (line ~ /^[0-9]{4}-[0-9]{2}-[0-9]{2}/) {
        # New log entry
        finalize_context_entry()
        state = STATE_NORMAL  
        handle_normal_state(line)
    } else {
        # Context continuation
        current_entry = current_entry "\n" line
    }
}

# Data extraction functions
function extract_error_info(line) {
    # Extract timestamp, thread, error type
    if (match(line, /^([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3})/, timestamp)) {
        error_timestamps[++current_trace_id] = timestamp[1]
    }
    
    if (match(line, /\[([^\]]+)\]/, thread)) {
        error_threads[current_trace_id] = thread[1]
    }
    
    if (match(line, /([a-zA-Z.]+(?:Exception|Error)):/, error_type)) {
        error_types[error_type[1]]++
        trace_error_types[current_trace_id] = error_type[1]
    }
}

function extract_query_info(line) {
    current_query_id++
    
    if (match(line, /^([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3})/, timestamp)) {
        query_timestamps[current_query_id] = timestamp[1]
    }
}

function extract_sql_performance(line) {
    if (match(line, /executed in ([0-9]+)ms/, exec_time)) {
        query_execution_times[current_query_id] = exec_time[1]
        total_execution_time += exec_time[1]
    }
    
    if (match(line, /returned ([0-9]+) rows/, row_count)) {
        query_row_counts[current_query_id] = row_count[1]
    }
}

# Finalization functions
function finalize_stacktrace() {
    stacktraces[current_trace_id] = current_entry
    entry_count++
    current_entry = ""
}

function finalize_sql_query() {
    # Determine query type
    if (current_entry ~ /SELECT/i) {
        query_types["SELECT"]++
    } else if (current_entry ~ /INSERT/i) {
        query_types["INSERT"]++
    } else if (current_entry ~ /UPDATE/i) {
        query_types["UPDATE"]++
    } else if (current_entry ~ /DELETE/i) {
        query_types["DELETE"]++
    }
    
    # Count query complexity
    lines_in_query = gsub(/\n/, "\n", current_entry) + 1
    if (lines_in_query <= 2) {
        query_complexity["simple"]++
    } else if (lines_in_query <= 5) {
        query_complexity["medium"]++
    } else {
        query_complexity["complex"]++
    }
    
    queries[current_query_id] = current_entry
    entry_count++
    current_entry = ""
}

# Report generation in END block
END {
    generate_comprehensive_report()
}

function generate_comprehensive_report() {
    print "APPLICATION LOG ANALYSIS REPORT"
    print "==============================="
    print "Parsed log entries:", entry_count
    print ""
    
    generate_stacktrace_report()
    generate_sql_report()
    generate_context_report()
    generate_temporal_analysis()
}
```

## Advanced Features

### 1. Performance Optimization
- Use efficient pattern matching
- Minimize memory usage for large logs
- Implement lazy evaluation where possible

### 2. Error Recovery
- Handle malformed log entries gracefully
- Recover from state machine errors
- Provide debugging output for complex cases

### 3. Extensible Design
- Easy to add new log entry types
- Configurable pattern matching
- Modular state handlers

## Testing Strategy
```bash
# Test with various log formats
awk -f state_machine_parser.awk ../../logs/application.log

# Test with malformed logs
awk -f state_machine_parser.awk test_cases/malformed.log

# Performance test with large logs
time awk -f state_machine_parser.awk large_application.log
```

---
**Previous:** [Problem 59: Custom Function Library](problem-59.md) | **Next:** [Problem 61: Advanced Reporting Engine](problem-61.md)