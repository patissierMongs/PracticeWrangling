# 문제 70: 무차별 대입 공격 탐지
**난이도:** ★★★ | **중점:** 로그인 분석 | **파일:** `logs/audit.log`

## 목표
명령줄 도구를 사용하여 의심스러운 로그인 패턴을 식별하고, 공격 진행 상황을 추적하며, 실행 가능한 보안 경고를 생성하는 포괄적인 무차별 대입 공격 탐지 시스템을 개발합니다.

## Problem Statement
Your organization's audit log contains authentication events from various systems. You need to build an automated detection system that can:

1. **Identify brute force patterns** across different time windows
2. **Track attack progression** and escalation attempts  
3. **Correlate attacks** from the same sources across multiple accounts
4. **Generate actionable alerts** with context and recommended responses
5. **Distinguish** between legitimate failed logins and malicious attempts

## Detection Requirements

### Primary Detection Criteria
- **Threshold-based:** More than 5 failed attempts in 5 minutes from same IP
- **Pattern-based:** Sequential login attempts against multiple accounts
- **Time-based:** Sustained attack patterns over extended periods
- **Behavioral:** Unusual login times or geographic patterns

### Advanced Analysis
- **Attack evolution:** How attacks change over time
- **Source intelligence:** IP reputation and geolocation context  
- **Target analysis:** Which accounts/services are most targeted
- **Success correlation:** Failed attempts followed by successful logins

## Expected Output Format
```
BRUTE FORCE ATTACK DETECTION REPORT
===================================
Analysis Period: 2024-01-15 00:00:00 to 2024-01-15 23:59:59
Total Events Analyzed: 15,247
Processing Time: 3.2 seconds

ACTIVE ATTACKS DETECTED: 7
=========================

CRITICAL ALERT #1:
-----------------
Attack Source: 203.0.113.45
Target Accounts: admin, root, administrator, user1, service_account
Attack Timeline: 14:23:15 - 14:45:22 (22 minutes, 7 seconds)
Failed Attempts: 127 attempts across 5 accounts
Success Rate: 0% (no successful logins detected)
Attack Pattern: Sequential account enumeration
Geographic Origin: Unknown (requires GeoIP lookup)
Recommendation: IMMEDIATE IP BLOCK + Account monitoring

Detailed Timeline:
14:23:15 | admin | FAILED | Invalid password
14:23:18 | admin | FAILED | Invalid password  
14:23:21 | root | FAILED | Account locked
14:23:24 | administrator | FAILED | Invalid password
14:24:45 | user1 | FAILED | Invalid password
[... 122 more attempts ...]
14:45:22 | service_account | FAILED | Invalid password

CRITICAL ALERT #2:
-----------------
Attack Source: 192.0.2.123
Target Accounts: webadmin
Attack Timeline: 15:12:33 - 15:43:17 (30 minutes, 44 seconds)
Failed Attempts: 89 attempts on single account
Success Rate: 1.1% (1 successful login after 88 failures)
Attack Pattern: Single account focused, password spraying
** SECURITY BREACH DETECTED **
Successful Login: 15:43:17 | webadmin | SUCCESS | Password authentication
Recommendation: URGENT - Disable account + Forensic investigation

[... Additional alerts for remaining 5 attacks ...]

ATTACK PATTERN ANALYSIS:
=======================

Top Targeted Accounts:
1. admin (67 attacks, 8 unique sources)
2. root (45 attacks, 6 unique sources)  
3. webadmin (34 attacks, 4 unique sources)
4. user1 (23 attacks, 5 unique sources)
5. administrator (19 attacks, 3 unique sources)

Attack Source Intelligence:
1. 203.0.113.45 - 127 attempts, 5 accounts targeted
   └─ Pattern: Fast sequential enumeration
   └─ Duration: 22 minutes (sustained attack)
   └─ Success: None detected

2. 192.0.2.123 - 89 attempts, 1 account compromised  
   └─ Pattern: Single account focus
   └─ Duration: 30 minutes (persistent attack)
   └─ Success: 1 breach (webadmin account)

3. 198.51.100.77 - 45 attempts, 3 accounts targeted
   └─ Pattern: Low-and-slow attack
   └─ Duration: 2 hours, 15 minutes
   └─ Success: None detected

Attack Timeline Visualization:
00:00 ████░░░░░░░░░░░░░░░░░░░░ 06:00 ████░░░░░░░░░░░░ 12:00 ██████████████████████████ 18:00 ████████████ 24:00
      Quiet period          Light activity       Peak attack period         Moderate activity

Time-based Attack Distribution:
Peak Hours (most attacks):
- 14:00-15:00: 45 attacks (4 sources)
- 15:00-16:00: 67 attacks (3 sources)  
- 02:00-03:00: 23 attacks (2 sources) ← Off-hours suspicious

Geographic Distribution (if GeoIP available):
- Unknown/Unresolved: 234 attempts (73.6%)
- Tor Exit Nodes: 43 attempts (13.5%)
- VPN/Proxy Services: 27 attempts (8.5%)
- Residential IPs: 14 attempts (4.4%)

MITIGATION RECOMMENDATIONS:
==========================

IMMEDIATE ACTIONS (within 1 hour):
1. Block IP addresses: 203.0.113.45, 192.0.2.123, 198.51.100.77
2. Disable compromised account: webadmin
3. Force password reset for heavily targeted accounts: admin, root
4. Enable account lockout after 3 failed attempts
5. Implement IP-based rate limiting

SHORT-TERM ACTIONS (within 24 hours):
1. Review and strengthen password policies
2. Implement multi-factor authentication for admin accounts
3. Deploy SIEM rules for real-time brute force detection
4. Conduct forensic analysis on compromised webadmin account
5. Review access logs for any unauthorized activity

LONG-TERM IMPROVEMENTS (within 30 days):
1. Deploy geographic access restrictions
2. Implement behavioral analysis for login patterns
3. Integrate threat intelligence feeds for IP reputation
4. Establish automated response procedures
5. Regular security awareness training for staff

DETECTION STATISTICS:
====================
True Positives: 7 confirmed attacks
False Positives: 2 legitimate user lockouts (excluded from report)
Detection Accuracy: 77.8%
Average Detection Time: 4.2 minutes after attack start
Fastest Detection: 1.3 minutes (high-frequency attack)
Slowest Detection: 12.7 minutes (low-and-slow attack)

FORENSIC DATA PRESERVED:
=======================
Full attack logs saved to: /var/log/security/brute_force_20240115_142315.log
Evidence package created: /tmp/incident_20240115_BF001.tar.gz
Chain of custody: Security Analyst John Doe, Badge #1247
```

## Implementation Framework

### Core Detection Script
```bash
#!/bin/bash
# brute_force_detector.sh - Comprehensive brute force detection

set -euo pipefail

# Configuration
AUDIT_LOG="${1:-../../logs/audit.log}"
THRESHOLD_ATTEMPTS=5
THRESHOLD_WINDOW=300  # 5 minutes in seconds
REPORT_FILE="brute_force_report_$(date +%Y%m%d_%H%M%S).txt"

# Detection function using AWK
detect_brute_force() {
    awk -v threshold_attempts="$THRESHOLD_ATTEMPTS" \
        -v threshold_window="$THRESHOLD_WINDOW" '
    
    BEGIN {
        attack_id = 0
        print "BRUTE FORCE ATTACK DETECTION REPORT"
        print "==================================="
        print "Analysis Period:", strftime("%Y-%m-%d %H:%M:%S", systime())
        print ""
    }
    
    # Parse audit log entries
    /failed login|authentication failure|invalid password/i {
        # Extract timestamp, IP, username, and details
        timestamp = parse_timestamp($1, $2, $3)
        ip_address = extract_ip($0)
        username = extract_username($0)
        
        # Store failed attempt
        failed_attempts[ip_address][username][timestamp] = $0
        ip_timeline[ip_address][timestamp] = username
        
        # Track per-IP statistics
        total_attempts[ip_address]++
        targeted_accounts[ip_address][username] = 1
    }
    
    /successful login|authentication success/i {
        timestamp = parse_timestamp($1, $2, $3)
        ip_address = extract_ip($0)
        username = extract_username($0)
        
        successful_logins[ip_address][username][timestamp] = $0
    }
    
    END {
        analyze_attack_patterns()
        generate_comprehensive_report()
    }
    
    function parse_timestamp(date, time, tz) {
        # Convert timestamp to epoch for calculations
        # Implementation depends on log format
        return mktime(date " " time)
    }
    
    function extract_ip(line) {
        # Extract IP address from log line
        if (match(line, /from ([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/, ip)) {
            return ip[1]
        }
        return "unknown"
    }
    
    function extract_username(line) {
        # Extract username from log line
        if (match(line, /user[= ]([^[:space:]]+)/, user)) {
            return user[1]
        }
        return "unknown"
    }
    
    function analyze_attack_patterns() {
        # Identify brute force patterns
        for (ip in total_attempts) {
            if (total_attempts[ip] >= threshold_attempts) {
                # Check if attempts are clustered in time
                if (is_attack_pattern(ip)) {
                    attacks[++attack_id]["ip"] = ip
                    attacks[attack_id]["attempts"] = total_attempts[ip]
                    attacks[attack_id]["accounts"] = count_targeted_accounts(ip)
                    attacks[attack_id]["timeline"] = build_attack_timeline(ip)
                    attacks[attack_id]["success_rate"] = calculate_success_rate(ip)
                    attacks[attack_id]["pattern"] = classify_attack_pattern(ip)
                }
            }
        }
    }
    
    function is_attack_pattern(ip) {
        # Check if failed attempts cluster within time windows
        timestamps_array[0] = ""  # Initialize array
        count = 0
        
        for (user in failed_attempts[ip]) {
            for (ts in failed_attempts[ip][user]) {
                timestamps_array[count++] = ts
            }
        }
        
        # Sort timestamps
        asort(timestamps_array)
        
        # Check for clustering
        for (i = 0; i < count - threshold_attempts; i++) {
            if (timestamps_array[i + threshold_attempts - 1] - timestamps_array[i] <= threshold_window) {
                return 1  # Attack pattern detected
            }
        }
        
        return 0
    }
    
    function count_targeted_accounts(ip) {
        count = 0
        for (user in targeted_accounts[ip]) {
            count++
        }
        return count
    }
    
    function calculate_success_rate(ip) {
        successes = 0
        for (user in successful_logins[ip]) {
            for (ts in successful_logins[ip][user]) {
                successes++
            }
        }
        return (successes / total_attempts[ip]) * 100
    }
    
    function classify_attack_pattern(ip) {
        account_count = count_targeted_accounts(ip)
        avg_attempts = total_attempts[ip] / account_count
        
        if (account_count == 1) {
            return "Single account focused"
        } else if (account_count > 10) {
            return "Account enumeration"
        } else if (avg_attempts > 20) {
            return "Password spraying"
        } else {
            return "Multi-target attack"
        }
    }
    
    function generate_comprehensive_report() {
        print "ACTIVE ATTACKS DETECTED:", length(attacks)
        print "========================="
        print ""
        
        # Sort attacks by severity (attempts * success_rate)
        for (id = 1; id <= attack_id; id++) {
            generate_attack_alert(id)
        }
        
        generate_pattern_analysis()
        generate_mitigation_recommendations()
        generate_detection_statistics()
    }
    
    function generate_attack_alert(id) {
        print "CRITICAL ALERT #" id ":"
        print "-----------------"
        print "Attack Source:", attacks[id]["ip"]
        print "Failed Attempts:", attacks[id]["attempts"]
        print "Target Accounts:", attacks[id]["accounts"]
        print "Success Rate:", sprintf("%.1f%%", attacks[id]["success_rate"])
        print "Attack Pattern:", attacks[id]["pattern"]
        
        if (attacks[id]["success_rate"] > 0) {
            print "** SECURITY BREACH DETECTED **"
            print "Recommendation: URGENT - Disable accounts + Forensic investigation"
        } else {
            print "Recommendation: IMMEDIATE IP BLOCK + Account monitoring"
        }
        
        print ""
    }
    ' "$AUDIT_LOG" > "$REPORT_FILE"
}

# Enhanced analysis with external tools
enhance_with_external_analysis() {
    local report_file="$1"
    
    # Add GeoIP information if available
    if command -v geoiplookup >/dev/null 2>&1; then
        echo "GEOGRAPHIC ANALYSIS:" >> "$report_file"
        grep "Attack Source:" "$report_file" | \
        awk '{print $3}' | \
        while read ip; do
            location=$(geoiplookup "$ip" 2>/dev/null || echo "Unknown")
            echo "$ip: $location" >> "$report_file"
        done
        echo "" >> "$report_file"
    fi
    
    # Add threat intelligence lookup
    add_threat_intelligence "$report_file"
}

# Threat intelligence integration
add_threat_intelligence() {
    local report_file="$1"
    
    echo "THREAT INTELLIGENCE:" >> "$report_file"
    echo "===================" >> "$report_file"
    
    # Check against common blacklists (placeholder)
    grep "Attack Source:" "$report_file" | \
    awk '{print $3}' | \
    while read ip; do
        # In a real scenario, integrate with threat intel APIs
        echo "$ip: Check against threat intelligence feeds" >> "$report_file"
    done
    echo "" >> "$report_file"
}

# Real-time monitoring mode
real_time_monitor() {
    local log_file="$1"
    
    echo "Starting real-time brute force monitoring..."
    tail -f "$log_file" | \
    while read line; do
        if [[ "$line" =~ failed|authentication.*failure ]]; then
            # Quick analysis of new events
            echo "$(date): Potential attack event detected: $line"
        fi
    done
}

# Main execution
main() {
    case "${1:-detect}" in
        "detect")
            echo "Running brute force detection analysis..."
            detect_brute_force
            enhance_with_external_analysis "$REPORT_FILE"
            echo "Report generated: $REPORT_FILE"
            ;;
        "monitor")
            real_time_monitor "${2:-../../logs/audit.log}"
            ;;
        "help")
            cat <<EOF
Usage: $0 [command] [options]

Commands:
  detect          Run full brute force analysis (default)
  monitor [log]   Real-time monitoring mode
  help            Show this help message

Configuration:
  THRESHOLD_ATTEMPTS: $THRESHOLD_ATTEMPTS failed attempts
  THRESHOLD_WINDOW: $THRESHOLD_WINDOW seconds window

Output: 
  Report file: brute_force_report_YYYYMMDD_HHMMSS.txt
EOF
            ;;
        *)
            echo "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"
```

## Advanced Detection Features

### 1. Machine Learning Integration
```bash
# Statistical analysis for anomaly detection
statistical_analysis() {
    awk '
    BEGIN { 
        # Collect baseline statistics from historical data
        baseline_window = 7 * 24 * 3600  # 7 days
    }
    
    {
        hour = substr($2, 1, 2)
        day_of_week = strftime("%w", mktime($1 " " $2))
        
        # Build normal patterns
        hourly_baseline[hour]++
        daily_baseline[day_of_week]++
    }
    
    # Compare current activity against baseline
    END {
        # Calculate standard deviations and flag anomalies
    }' "$AUDIT_LOG"
}
```

### 2. Behavioral Profiling
```bash
# Build user behavior profiles
profile_normal_behavior() {
    awk '
    /successful login/ {
        user = extract_user($0)
        hour = substr($2, 1, 2)
        ip = extract_ip($0)
        
        user_login_hours[user][hour]++
        user_login_ips[user][ip]++
        user_total_logins[user]++
    }
    
    END {
        # Identify deviations from normal behavior
        for (user in user_total_logins) {
            # Calculate normal login patterns for each user
        }
    }' "$AUDIT_LOG"
}
```

### 3. Attack Evolution Tracking
```bash
# Track how attacks evolve over time
track_attack_evolution() {
    awk '
    {
        timestamp = mktime($1 " " $2)
        ip = extract_ip($0)
        
        # Track attack characteristics over time
        attack_intensity[ip][timestamp] = count_attempts_in_window(ip, timestamp)
        attack_targets[ip][timestamp] = count_unique_targets(ip, timestamp)
    }
    
    END {
        # Analyze how attacks change their tactics
        for (ip in attack_intensity) {
            analyze_attack_evolution(ip)
        }
    }' "$AUDIT_LOG"
}
```

---
**Previous:** [Problem 69: AWK Web Log Analyzer](problem-69.md) | **Next:** [Problem 71: Multi-Source Security Correlation](problem-71.md)