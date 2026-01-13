#!/bin/bash

echo "🧪 Testing Super AI System..."
echo ""

BASE_URL="http://localhost:5001"

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
response=$(curl -s "${BASE_URL}/api/health")
if [ $? -eq 0 ]; then
  echo "   ✅ Health endpoint responding"
else
  echo "   ❌ Health endpoint failed"
fi
echo ""

# Test 2: Metrics
echo "2️⃣ Testing Metrics Endpoint..."
response=$(curl -s "${BASE_URL}/api/metrics")
if echo "$response" | grep -q "# HELP"; then
  echo "   ✅ Metrics endpoint working"
  echo "   📊 Sample metrics:"
  echo "$response" | head -10
else
  echo "   ❌ Metrics endpoint failed"
fi
echo ""

# Test 3: Health Metrics
echo "3️⃣ Testing Health Metrics..."
response=$(curl -s "${BASE_URL}/api/health/metrics")
if echo "$response" | grep -q "status"; then
  echo "   ✅ Health metrics working"
  echo "   📈 Status: $(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"
else
  echo "   ❌ Health metrics failed"
fi
echo ""

# Test 4: Events Stats
echo "4️⃣ Testing Events Stats..."
response=$(curl -s "${BASE_URL}/api/events/stats")
if echo "$response" | grep -q "totalEvents"; then
  echo "   ✅ Events stats working"
else
  echo "   ❌ Events stats failed"
fi
echo ""

# Test 5: System Report
echo "5️⃣ Testing System Report..."
response=$(curl -s "${BASE_URL}/api/system/report")
if echo "$response" | grep -q "System Status Report"; then
  echo "   ✅ System report working"
  echo "   📋 Report preview:"
  echo "$response" | head -15
else
  echo "   ❌ System report failed"
fi
echo ""

# Load Test
echo "6️⃣ Running Load Test (100 requests)..."
start_time=$(date +%s)
success_count=0
for i in {1..100}; do
  if curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/health" | grep -q "200"; then
    ((success_count++))
  fi
done
end_time=$(date +%s)
duration=$((end_time - start_time))

echo "   ✅ Load test completed"
echo "   📊 Success rate: ${success_count}/100 (${success_count}%)"
echo "   ⏱️  Duration: ${duration}s"
echo "   🚀 Avg response: $((duration * 1000 / 100))ms"
echo ""

echo "================================================"
echo "🎉 Testing completed!"
echo "================================================"
