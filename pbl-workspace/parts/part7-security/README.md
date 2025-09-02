# Part 7: Security & Forensics Scenarios
## 8 Defensive Security Analysis Challenges

This section focuses on using command-line tools for defensive security analysis, threat detection, and incident response. Problems emphasize real-world security scenarios that require sophisticated data correlation and pattern analysis.

### Learning Objectives
- Detect security threats using log analysis techniques
- Correlate events across multiple log sources
- Extract Indicators of Compromise (IoCs) from various data formats
- Implement automated threat detection pipelines
- Sanitize logs for sharing while preserving analytical value
- Analyze network traffic patterns for anomalies
- Build forensic analysis workflows

### Security Analysis Focus Areas
- **Brute Force Detection:** Login attempt pattern analysis
- **Anomaly Detection:** Statistical deviation identification
- **IoC Extraction:** Automated indicator harvesting
- **Log Correlation:** Cross-source event correlation
- **Data Sanitization:** PII removal for log sharing
- **Network Analysis:** Traffic pattern examination
- **Incident Response:** Forensic data collection

**⚠️ Note:** All problems focus on defensive security and legitimate analysis techniques. Solutions should be used only for authorized security monitoring and incident response.

---

## Problem Index

| # | Problem | Difficulty | Focus Area | Files Used |
|---|---------|------------|------------|------------|
| 70 | Brute Force Attack Detection | ★★★ | Login analysis | logs/audit.log |
| 71 | Multi-Source Security Correlation | ★★★★ | Event correlation | logs/*.log |
| 72 | IoC Extraction Pipeline | ★★★ | Threat intelligence | All log files |
| 73 | Anomaly Detection Engine | ★★★★ | Statistical analysis | logs/web_access.log |
| 74 | Log Sanitization for Sharing | ★★★ | Data protection | Multiple files |
| 75 | Network Traffic Analysis | ★★★★ | Network security | logs/web_access.log |
| 76 | Forensic Timeline Generator | ★★★★ | Incident response | All files |
| 77 | Automated Threat Hunting | ★★★★★ | Complete workflow | All security logs |

**Difficulty Legend:**
- ★★★ = Advanced (complex pattern detection)
- ★★★★ = Expert (multi-source correlation, statistical analysis)
- ★★★★★ = Master (complete security workflows)

## Security Analysis Patterns

### 1. Brute Force Detection
```bash
# Detect failed login attempts
awk '
/failed login/ {
    split($1 " " $2, timestamp, " ")
    ip = $NF
    failed_attempts[ip][timestamp[1] " " timestamp[2]]++
}

END {
    for (ip in failed_attempts) {
        total = 0
        for (time in failed_attempts[ip]) {
            total += failed_attempts[ip][time]
        }
        if (total > 5) {  # Threshold for suspicious activity
            print "SUSPICIOUS IP:", ip, "Failed attempts:", total
        }
    }
}' audit.log
```

### 2. Statistical Anomaly Detection
```bash
# Detect unusual request volumes
awk '
{
    hour = substr($4, 2, 14)  # Extract hour from timestamp
    requests_per_hour[hour]++
}

END {
    # Calculate mean and standard deviation
    total = sum = sum_sq = 0
    for (hour in requests_per_hour) {
        total++
        sum += requests_per_hour[hour]
        sum_sq += requests_per_hour[hour]^2
    }
    
    mean = sum / total
    variance = (sum_sq - sum^2/total) / (total-1)
    stddev = sqrt(variance)
    
    # Flag hours with unusual activity
    for (hour in requests_per_hour) {
        z_score = (requests_per_hour[hour] - mean) / stddev
        if (z_score > 2 || z_score < -2) {
            print "ANOMALY:", hour, "requests:", requests_per_hour[hour], "z-score:", z_score
        }
    }
}' web_access.log
```

### 3. Multi-Source Event Correlation
```bash
# Correlate events across multiple log sources
join -j 1 \
  <(awk '/failed login/ {print $1" "$2, $0}' auth.log | sort) \
  <(awk '/suspicious/ {print $1" "$2, $0}' system.log | sort) | \
awk '
{
    timestamp = $1 " " $2
    print "CORRELATED EVENT at", timestamp
    print "  Auth:", $3, $4, $5, $6
    print "  System:", $7, $8, $9, $10
    print ""
}'
```

## Defensive Security Techniques

### 1. Threat Intelligence Integration
```bash
# Extract potential IoCs and validate against threat feeds
extract_indicators() {
    local log_file="$1"
    
    # IP addresses
    grep -Eo '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' "$log_file" | \
        grep -v '^192\.168\.' | grep -v '^10\.' | grep -v '^172\.(1[6-9]|2[0-9]|3[01])\.' | \
        sort -u > potential_ips.txt
    
    # Domain names  
    grep -Eo '[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' "$log_file" | \
        grep -v 'localhost\|example\.com' | \
        sort -u > potential_domains.txt
        
    # File hashes (if present)
    grep -Eo '\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b' "$log_file" | \
        sort -u > potential_hashes.txt
}
```

### 2. Log Privacy Protection
```bash
# Sanitize logs while preserving analytical value
sanitize_logs() {
    local input_file="$1"
    local output_file="$2"
    
    # Replace IP addresses with anonymized versions
    sed -E 's/\b([0-9]{1,3}\.)[0-9]{1,3}\.([0-9]{1,3}\.)[0-9]{1,3}\b/\1xxx.\2xxx/g' "$input_file" | \
    
    # Replace email addresses
    sed -E 's/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/user@domain.com/g' | \
    
    # Replace usernames (common patterns)
    sed -E 's/user=[^[:space:]]+/user=<redacted>/g' | \
    
    # Replace session IDs and tokens
    sed -E 's/session=[a-zA-Z0-9]+/session=<redacted>/g' > "$output_file"
}
```

### 3. Forensic Timeline Construction
```bash
# Build comprehensive timeline from multiple sources
build_timeline() {
    {
        # Web access logs
        awk '{print $4, "WEB", $1, $7, $9}' web_access.log
        
        # System events  
        awk '{print $1" "$2" "$3, "SYS", $5, $6, $7}' system_events.log
        
        # Audit logs
        awk '{print $1" "$2, "AUDIT", $4, $5, $6}' audit.log
        
    } | sort -k1,1 | \
    awk '{
        print $1, "|", $2, "|", $3, "|", $4, $5, $6, $7, $8
    }' | column -t -s'|'
}
```

## Security Analysis Workflows

### 1. Incident Response Pipeline
```bash
#!/bin/bash
# Automated incident response data collection

incident_response() {
    local incident_time="$1"
    local output_dir="incident_$(date +%Y%m%d_%H%M%S)"
    
    mkdir -p "$output_dir"
    
    # Extract events around incident time
    for log in logs/*.log; do
        awk -v incident="$incident_time" '
        function time_diff(t1, t2) {
            # Calculate time difference in minutes
            return (mktime(t1) - mktime(t2)) / 60
        }
        
        {
            log_time = $1 " " $2
            if (abs(time_diff(log_time, incident)) <= 30) {
                print FILENAME ":", $0
            }
        }' "$log" >> "$output_dir/timeline.txt"
    done
    
    # Generate summary report
    analyze_incident_data "$output_dir"
}
```

### 2. Threat Hunting Automation
```bash
# Automated threat hunting queries
threat_hunt() {
    echo "THREAT HUNTING REPORT - $(date)"
    echo "=================================="
    
    # Hunt 1: Suspicious process execution patterns
    echo "1. Suspicious Process Patterns:"
    grep -i "powershell\|cmd\.exe\|wscript\|cscript" logs/system_events.log | \
    awk '{print "  " $1, $2, ":", $0}'
    
    # Hunt 2: Unusual network connections
    echo -e "\n2. Unusual Network Activity:"
    awk '$9 ~ /^4[0-9]{2}/ {print $1, $7, $9}' logs/web_access.log | \
    sort | uniq -c | sort -nr | head -10
    
    # Hunt 3: Authentication anomalies
    echo -e "\n3. Authentication Anomalies:"
    awk '
    /failed login/ {
        failed[$(NF-1)]++
    }
    /successful login/ {
        success[$(NF-1)]++
    }
    END {
        for (user in failed) {
            if (failed[user] > 10 && success[user] == 0) {
                print "  ALERT: User", user, "has", failed[user], "failed logins, no success"
            }
        }
    }' logs/audit.log
}
```

## Privacy and Legal Considerations

### Data Handling Guidelines
1. **Data Minimization:** Only collect necessary data for security analysis
2. **Anonymization:** Remove or pseudonymize PII when possible
3. **Retention:** Follow organizational data retention policies
4. **Access Control:** Limit access to security logs to authorized personnel
5. **Documentation:** Maintain audit trails of forensic activities

### Ethical Security Analysis
- Only analyze systems you have authorization to monitor
- Focus on defensive capabilities and threat detection
- Respect privacy laws and organizational policies
- Use findings only for legitimate security purposes
- Share threat intelligence responsibly within security community

## Advanced Correlation Techniques

### 1. Behavioral Analysis
```bash
# Detect unusual user behavior patterns
analyze_user_behavior() {
    awk '
    BEGIN { 
        # Define normal business hours
        business_start = 9
        business_end = 17
    }
    
    /user=/ {
        match($0, /user=([^[:space:]]+)/, user_array)
        user = user_array[1]
        
        # Extract hour from timestamp
        hour = substr($4, 14, 2)
        
        activity[user][hour]++
        total_activity[user]++
    }
    
    END {
        for (user in total_activity) {
            off_hours = 0
            for (h = 0; h < business_start; h++) {
                off_hours += activity[user][h]
            }
            for (h = business_end + 1; h < 24; h++) {
                off_hours += activity[user][h]
            }
            
            off_hours_percent = (off_hours / total_activity[user]) * 100
            
            if (off_hours_percent > 30) {
                print "SUSPICIOUS: User", user, "has", off_hours_percent "% off-hours activity"
            }
        }
    }' logs/web_access.log
}
```

### 2. Geographic Analysis
```bash
# Detect impossible travel scenarios (if GeoIP data available)
detect_impossible_travel() {
    awk '
    function distance(lat1, lon1, lat2, lon2) {
        # Haversine formula for distance calculation
        # Returns distance in kilometers
    }
    
    /user=/ {
        user = extract_user($0)
        timestamp = $4
        ip = $1
        
        # Look up geographic location of IP
        # (In real scenario, integrate with GeoIP database)
        
        if (user in last_location) {
            time_diff = timestamp - last_timestamp[user]
            dist = distance(last_lat[user], last_lon[user], current_lat, current_lon)
            
            # Calculate maximum possible travel speed
            max_speed = dist / (time_diff / 3600)  # km/h
            
            if (max_speed > 900) {  # Faster than commercial aircraft
                print "IMPOSSIBLE TRAVEL:", user, "from", last_location[user], "to", current_location, "in", time_diff/3600, "hours"
            }
        }
        
        last_location[user] = current_location
        last_timestamp[user] = timestamp
    }' logs/web_access.log
}
```