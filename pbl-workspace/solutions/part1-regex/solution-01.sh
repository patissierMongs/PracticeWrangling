#!/bin/bash
# Solution for Problem 1: IPv4 Address Validation
# Extracts and validates IPv4 addresses using POSIX ERE

set -euo pipefail

# Define the IPv4 regex pattern (POSIX ERE)
# Each octet: (25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])
# No leading zeros allowed except for "0" itself
IPV4_REGEX='\b(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\b'

LOG_FILE="${1:-../../logs/web_access.log}"

echo "Extracting valid IPv4 addresses from: $LOG_FILE"
echo "=================================================="

# Method 1: Extract all valid IPv4 addresses
echo "VALID IPv4 ADDRESSES:"
grep -Eo "$IPV4_REGEX" "$LOG_FILE" | sort -V | uniq

echo
echo "STATISTICS:"

# Count unique valid IPs  
UNIQUE_COUNT=$(grep -Eo "$IPV4_REGEX" "$LOG_FILE" | sort -u | wc -l)
echo "Total unique valid IPs: $UNIQUE_COUNT"

# Count total occurrences
TOTAL_COUNT=$(grep -Eo "$IPV4_REGEX" "$LOG_FILE" | wc -l)
echo "Total IP occurrences: $TOTAL_COUNT"

echo
echo "IP ADDRESS BREAKDOWN:"

# Top 10 most frequent IPs
echo "Top 10 most frequent IPs:"
grep -Eo "$IPV4_REGEX" "$LOG_FILE" | \
    sort | uniq -c | sort -nr | head -10 | \
    awk '{printf "%3d %s\n", $1, $2}'

echo
echo "ADVANCED ANALYSIS:"

# Private IP ranges analysis
echo "Private IP ranges found:"
grep -Eo "$IPV4_REGEX" "$LOG_FILE" | \
    grep -E '^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)' | \
    sort -u | wc -l | \
    awk '{print "  Private IPs: " $1}'

# Public IP analysis  
echo "Public IP analysis:"
grep -Eo "$IPV4_REGEX" "$LOG_FILE" | \
    grep -vE '^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|169\.254\.|224\.|240\.)' | \
    sort -u | wc -l | \
    awk '{print "  Public IPs: " $1}'

# Test for common invalid patterns that should NOT match
echo
echo "VALIDATION TESTS:"
echo "Testing invalid IP patterns (should return 0):"

INVALID_TESTS=(
    "256.1.1.1"
    "192.168.1.256"  
    "01.1.1.1"
    "192.168.1"
    "192.168.1.1.1"
)

for invalid_ip in "${INVALID_TESTS[@]}"; do
    if echo "$invalid_ip" | grep -Eq "$IPV4_REGEX"; then
        echo "  ERROR: $invalid_ip incorrectly matched!"
    else
        echo "  PASS: $invalid_ip correctly rejected"
    fi
done

echo
echo "Performance test completed in $(date)"