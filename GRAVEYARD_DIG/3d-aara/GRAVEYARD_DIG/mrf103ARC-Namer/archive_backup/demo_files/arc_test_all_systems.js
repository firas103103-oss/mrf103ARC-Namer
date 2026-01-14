#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 * ARC COMPLETE SYSTEM TEST
 * ═══════════════════════════════════════════════════════════════
 * اختبار شامل لجميع الأنظمة:
 * - الأرشفة والصلاحيات
 * - إدارة المهام للوكلاء
 * - التكاملات (n8n, ElevenLabs, etc.)
 * - التعلم والتحليل
 * ═══════════════════════════════════════════════════════════════
 */

import "dotenv/config";
import { createArchive, grantAccess, checkAccess } from "./server/modules/archive_manager.js";
import { 
  sendToN8N, 
  generateSpeech, 
  callLLM, 
  checkIntegrationsHealth 
} from "./server/modules/integration_manager.js";
import {
  createTask,
  updateTaskStatus,
  recordLearning,
  recordPerformance,
  getAgentAnalytics,
} from "./server/modules/agent_manager.js";

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("        🚀 ARC COMPLETE SYSTEM TEST");
console.log("═══════════════════════════════════════════════════════════════\n");

let testsPassed = 0;
let testsFailed = 0;

function testResult(name, success, message = "") {
  if (success) {
    console.log(`✅ ${name}`);
    if (message) console.log(`   └─ ${message}`);
    testsPassed++;
  } else {
    console.log(`❌ ${name}`);
    if (message) console.log(`   └─ ${message}`);
    testsFailed++;
  }
}

// ═══════════════════════════════════════════════════════════════
// TEST 1: ARCHIVE SYSTEM
// ═══════════════════════════════════════════════════════════════

console.log("📦 Testing Archive System...\n");

// Create test directory for archiving
import fs from "fs";
import path from "path";

const testDir = path.join(process.cwd(), "test_archive_data");
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
  fs.writeFileSync(path.join(testDir, "test_file.txt"), "Test archive content");
}

const archive = await createArchive(testDir, "test_archive", {
  type: "agent_data",
  encrypt: true,
  accessLevel: "internal",
  sourceAgent: "Mr.F",
  retentionDays: 30,
  metadata: { test: true },
});

testResult(
  "Create encrypted archive",
  archive !== null,
  archive ? `Archive ID: ${archive.id}` : "Failed to create archive"
);

// Test access control
if (archive) {
  const accessGranted = await grantAccess(
    "L0-Ops",
    "archive",
    archive.id,
    ["read", "write"],
    "Mr.F",
    30
  );
  
  testResult("Grant access to agent", accessGranted);

  const hasAccess = await checkAccess("L0-Ops", "archive", archive.id, "read");
  testResult("Check agent access", hasAccess);
}

// Cleanup test directory
fs.rmSync(testDir, { recursive: true, force: true });

// ═══════════════════════════════════════════════════════════════
// TEST 2: AGENT TASK MANAGEMENT
// ═══════════════════════════════════════════════════════════════

console.log("\n📋 Testing Agent Task Management...\n");

const taskId = await createTask({
  agentId: "Mr.F",
  taskType: "analysis",
  title: "Test Task - System Analysis",
  description: "Analyze current system performance",
  priority: "high",
  input: { system_metrics: true },
  assignedBy: "ARC-System",
});

testResult(
  "Create agent task",
  taskId !== null,
  taskId ? `Task ID: ${taskId}` : "Failed to create task"
);

if (taskId) {
  // Update task to in_progress
  const updated1 = await updateTaskStatus(taskId, "in_progress", 25);
  testResult("Update task to in_progress", updated1);

  // Complete task
  const updated2 = await updateTaskStatus(
    taskId,
    "completed",
    100,
    { analysis_result: "System performing optimally" }
  );
  testResult("Complete task with output", updated2);
}

// ═══════════════════════════════════════════════════════════════
// TEST 3: AGENT LEARNING
// ═══════════════════════════════════════════════════════════════

console.log("\n🧠 Testing Agent Learning System...\n");

const learningId = await recordLearning({
  agentId: "L0-Intel",
  learningType: "pattern_recognition",
  context: "User behavior analysis",
  inputData: { user_queries: 150, avg_response_time: 1.2 },
  analysis: { pattern: "morning_peak", confidence: 85 },
  insights: [
    "Users are most active between 9-11 AM",
    "Response time improves after system warmup",
  ],
  confidence: 85,
});

testResult(
  "Record agent learning",
  learningId !== null,
  learningId ? `Learning ID: ${learningId}` : "Failed to record learning"
);

// ═══════════════════════════════════════════════════════════════
// TEST 4: AGENT PERFORMANCE
// ═══════════════════════════════════════════════════════════════

console.log("\n📊 Testing Agent Performance Tracking...\n");

const perfRecorded = await recordPerformance({
  agentId: "L0-Ops",
  metricType: "response_time",
  value: 1.25,
  unit: "seconds",
  context: { task_type: "monitoring" },
});

testResult("Record performance metric", perfRecorded);

const analytics = await getAgentAnalytics("Mr.F");
testResult(
  "Get agent analytics",
  analytics && typeof analytics.totalTasks === "number",
  analytics ? `Total tasks: ${analytics.totalTasks}` : "Failed to get analytics"
);

// ═══════════════════════════════════════════════════════════════
// TEST 5: INTEGRATIONS
// ═══════════════════════════════════════════════════════════════

console.log("\n🔗 Testing Integrations...\n");

// Test integration health
const health = await checkIntegrationsHealth();
testResult(
  "Integration health check",
  health && typeof health === "object",
  `Healthy integrations: ${Object.entries(health).filter(([_, v]) => v).length}/${Object.keys(health).length}`
);

// Test n8n
if (process.env.N8N_WEBHOOK_URL) {
  const n8nSent = await sendToN8N({
    event_type: "test_event",
    agent_id: "ARC-System",
    data: {
      test: true,
      timestamp: new Date().toISOString(),
    },
    priority: "normal",
  });
  testResult("Send n8n webhook", n8nSent);
} else {
  console.log("⚠️  n8n webhook test skipped (N8N_WEBHOOK_URL not configured)");
}

// Test LLM integration
if (process.env.OPENAI_API_KEY) {
  const llmResponse = await callLLM({
    provider: "openai",
    messages: [
      { role: "user", content: "Say 'ARC System Test Successful' in 5 words or less." },
    ],
    temperature: 0.1,
    max_tokens: 20,
    agent_id: "ARC-System",
  });
  testResult(
    "OpenAI LLM call",
    llmResponse !== null,
    llmResponse ? `Response: ${llmResponse.substring(0, 50)}...` : "Failed"
  );
} else {
  console.log("⚠️  LLM test skipped (OPENAI_API_KEY not configured)");
}

// Test ElevenLabs TTS
if (process.env.ELEVENLABS_API_KEY) {
  const audioBuffer = await generateSpeech({
    text: "ARC System test",
    voice_id: "HRaipzPqzrU15BUS5ypU", // Mr.F voice
    agent_id: "Mr.F",
  });
  testResult(
    "ElevenLabs TTS",
    audioBuffer !== null && audioBuffer.length > 0,
    audioBuffer ? `Audio size: ${audioBuffer.length} bytes` : "Failed"
  );
} else {
  console.log("⚠️  ElevenLabs test skipped (ELEVENLABS_API_KEY not configured)");
}

// ═══════════════════════════════════════════════════════════════
// FINAL RESULTS
// ═══════════════════════════════════════════════════════════════

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("        📊 TEST RESULTS");
console.log("═══════════════════════════════════════════════════════════════");
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log("═══════════════════════════════════════════════════════════════\n");

process.exit(testsFailed > 0 ? 1 : 0);
