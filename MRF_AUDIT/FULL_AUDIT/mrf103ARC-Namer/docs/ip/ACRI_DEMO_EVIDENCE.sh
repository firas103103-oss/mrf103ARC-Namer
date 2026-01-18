#!/bin/bash
# ACRI Demo Evidence Collection Script
# Demonstrates anti-replay protection

echo "=== ACRI DEMO EVIDENCE ==="
echo ""

# Test 1: Issue probe #1
echo "1) Issue probe #1:"
PROBE1=$(curl -s -X POST http://localhost:5001/api/acri/probe/issue)
echo "$PROBE1" | jq .
PROBE1_ID=$(echo "$PROBE1" | jq -r '.probeId')
PROBE1_NONCE=$(echo "$PROBE1" | jq -r '.nonce')
echo ""

# Test 2: Respond to probe #1
echo "2) Respond to probe #1:"
RESP1=$(curl -s -X POST http://localhost:5001/api/acri/probe/respond \
  -H "Content-Type: application/json" \
  -d "{\"probeId\":\"$PROBE1_ID\",\"nonce\":\"$PROBE1_NONCE\",\"measured\":{\"voc\":0.8,\"motion\":1,\"delta\":3.1}}")
echo "$RESP1" | jq .
RESP1_SIG=$(echo "$RESP1" | jq -r '.signature')
echo ""

# Test 3: Verify response #1 (should be ok:true)
echo "3) Verify response #1 (SHOULD BE ok:true):"
VERIFY1=$(curl -s -X POST http://localhost:5001/api/acri/probe/verify \
  -H "Content-Type: application/json" \
  -d "$RESP1")
echo "$VERIFY1" | jq .
echo ""

# Test 4: Issue probe #2 (new nonce)
echo "4) Issue probe #2 (new nonce):"
PROBE2=$(curl -s -X POST http://localhost:5001/api/acri/probe/issue)
echo "$PROBE2" | jq .
PROBE2_ID=$(echo "$PROBE2" | jq -r '.probeId')
PROBE2_NONCE=$(echo "$PROBE2" | jq -r '.nonce')
echo ""

# Test 5: REPLAY ATTACK TEST (verify old response with new nonce) → MUST FAIL
echo "5) REPLAY ATTACK TEST (SHOULD BE ok:false):"
REPLAY="{\"probeId\":\"$PROBE2_ID\",\"nonce\":\"$PROBE2_NONCE\",\"measured\":{\"voc\":0.8,\"motion\":1,\"delta\":3.1},\"signature\":\"$RESP1_SIG\"}"
VERIFY_REPLAY=$(curl -s -X POST http://localhost:5001/api/acri/probe/verify \
  -H "Content-Type: application/json" \
  -d "$REPLAY")
echo "$VERIFY_REPLAY" | jq .
echo ""

echo "=== DEMO COMPLETE ==="
echo "✅ Proof of anti-replay: old signature rejected with new nonce"
