#!/bin/bash

# 로컬 테스트 스크립트
# 사용자가 AI에게 제출하기 전 답안을 로컬에서 테스트

set -e

echo "=== 로컬 답안 테스트 ==="

# 인자 검증
if [ $# -ne 2 ]; then
    echo "사용법: $0 <문제번호> <답안파일>"
    echo "예시: $0 01 solution.sh"
    exit 1
fi

PROBLEM_NUM=$1
SOLUTION_FILE=$2

# 파일 존재 확인
if [ ! -f "$SOLUTION_FILE" ]; then
    echo "오류: 답안 파일 '$SOLUTION_FILE'을 찾을 수 없습니다."
    exit 1
fi

# 실행 권한 부여
chmod +x "$SOLUTION_FILE"

echo "문제: $PROBLEM_NUM"
echo "답안: $SOLUTION_FILE"
echo

# 테스트 실행
echo "--- 테스트 실행 중 ---"
start_time=$(date +%s%N)

# 답안 실행 (출력 캡처)
if output=$(./"$SOLUTION_FILE" 2>&1); then
    end_time=$(date +%s%N)
    execution_time=$((($end_time - $start_time) / 1000000))
    
    echo "실행 완료 (${execution_time}ms)"
    echo
    echo "--- 출력 결과 ---"
    echo "$output"
    echo
    echo "--- 로컬 테스트 완료 ---"
    echo "결과를 확인하고 만족하면 AI에게 제출하세요."
else
    echo "실행 오류 발생:"
    echo "$output"
    exit 1
fi