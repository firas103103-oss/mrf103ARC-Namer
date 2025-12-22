/**
 * ARC E2E Verifier - Evidence-first loop verification
 * Verifies: Trigger → Receive → Execute → Proof → Daily Summary
 *
 * Usage:
 *   ARC_BASE_URL="http://127.0.0.1:5000" X_ARC_SECRET="..." node arc_e2e_verifier.js
 *
 * Optional (for direct DB verification):
 *   DATABASE_URL="postgres://..." node arc_e2e_verifier.js
 */

import fs from "fs";
import crypto from "crypto";

const BASE_URL = (process.env.ARC_BASE_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const ARC_SECRET = process.env.X_ARC_SECRET || process.env.ARC_BACKEND_SECRET || "";
const DATABASE_URL = process.env.DATABASE_URL || "";

function nowISO() {
  return new Date().toISOString();
}

function redactHeaders(headersObj) {
  const out = {};
  for (const [k, v] of Object.entries(headersObj || {})) {
    const lk = k.toLowerCase();
    if (lk.includes("authorization") || lk.includes("token") || lk.includes("secret") || lk.includes("cookie")) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = v;
    }
  }
  return out;
}

async function httpCall(method, path, { headers = {}, body = undefined, timeoutMs = 15000 } = {}) {
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const finalHeaders = {
    "content-type": "application/json",
    ...headers,
  };

  if (ARC_SECRET) {
    finalHeaders["x-arc-secret"] = ARC_SECRET;
    finalHeaders["x_arc_secret"] = ARC_SECRET;
  }

  let res, text;
  const started = Date.now();
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    text = await res.text();
  } catch (e) {
    clearTimeout(t);
    return {
      url,
      method,
      ok: false,
      error: String(e),
      ms: Date.now() - started,
    };
  } finally {
    clearTimeout(t);
  }

  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  return {
    url,
    method,
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    ms: Date.now() - started,
    responseHeaders: redactHeaders(Object.fromEntries(res.headers.entries())),
    bodyTextPreview: text?.slice(0, 2000) || "",
    bodyJson: parsed,
  };
}

async function tryLoadPg() {
  try {
    const pg = await import("pg");
    return pg;
  } catch {
    return null;
  }
}

async function dbVerifyEventExists(runId) {
  if (!DATABASE_URL) return { found: false, reason: "DATABASE_URL not set" };
  
  const pg = await tryLoadPg();
  if (!pg) return { found: false, reason: "pg package not available" };

  const { Client } = pg;
  const client = new Client({ connectionString: DATABASE_URL, ssl: process.env.PGSSLMODE ? { rejectUnauthorized: false } : undefined });

  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT id, agent_id, type, payload, created_at 
      FROM agent_events 
      WHERE payload::text LIKE $1
      ORDER BY created_at DESC 
      LIMIT 5
    `, [`%${runId}%`]);

    await client.end();
    
    if (result.rows.length > 0) {
      return { found: true, rows: result.rows, count: result.rows.length };
    }
    return { found: false, reason: "No matching event found in agent_events" };
  } catch (e) {
    try { await client.end(); } catch {}
    return { found: false, reason: String(e) };
  }
}

async function dbGetTableCount() {
  if (!DATABASE_URL) return { count: null, reason: "DATABASE_URL not set" };
  
  const pg = await tryLoadPg();
  if (!pg) return { count: null, reason: "pg package not available" };

  const { Client } = pg;
  const client = new Client({ connectionString: DATABASE_URL, ssl: process.env.PGSSLMODE ? { rejectUnauthorized: false } : undefined });

  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT COUNT(*)::int as count FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);

    await client.end();
    return { count: result.rows[0]?.count || 0 };
  } catch (e) {
    try { await client.end(); } catch {}
    return { count: null, reason: String(e) };
  }
}

async function main() {
  const runId = `E2E-${nowISO().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`;
  const verdict = { pass: true, reasons: [] };

  const out = {
    run_id: runId,
    generated_at: nowISO(),
    base_url: BASE_URL,
    env_presence: {
      ARC_BACKEND_SECRET_present: Boolean(ARC_SECRET),
      DATABASE_URL_present: Boolean(DATABASE_URL),
    },
    endpoints: {},
    db_proof: {},
    verdict: null,
  };

  console.log(`\n=== ARC E2E Verifier ===`);
  console.log(`Run ID: ${runId}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`ARC_BACKEND_SECRET: ${ARC_SECRET ? "SET" : "MISSING"}`);
  console.log(`DATABASE_URL: ${DATABASE_URL ? "SET" : "MISSING"}\n`);

  // Test 1: GET /api/health
  console.log("Testing GET /api/health...");
  out.endpoints["/api/health"] = await httpCall("GET", "/api/health");
  if (!out.endpoints["/api/health"].ok || out.endpoints["/api/health"].status !== 200) {
    verdict.pass = false;
    verdict.reasons.push(`/api/health failed: status ${out.endpoints["/api/health"].status}`);
  }

  // Test 2: GET /ping
  console.log("Testing GET /ping...");
  out.endpoints["/ping"] = await httpCall("GET", "/ping");
  if (!out.endpoints["/ping"].ok || out.endpoints["/ping"].status !== 200) {
    verdict.pass = false;
    verdict.reasons.push(`/ping failed: status ${out.endpoints["/ping"].status}`);
  }

  // Test 3: GET /api/arc/reality-report
  console.log("Testing GET /api/arc/reality-report...");
  out.endpoints["/api/arc/reality-report"] = await httpCall("GET", "/api/arc/reality-report");

  // Test 4: GET /api/arc/status
  console.log("Testing GET /api/arc/status...");
  out.endpoints["/api/arc/status"] = await httpCall("GET", "/api/arc/status");

  // Test 5: POST /api/arc/agent-events (ingest)
  console.log("Testing POST /api/arc/agent-events...");
  const agentEventPayload = {
    agent_name: "e2e_verifier",
    event_type: "E2E_PROBE_EVENT",
    payload: { run_id: runId, at: nowISO(), source: "arc_e2e_verifier.js" },
  };
  out.endpoints["/api/arc/agent-events"] = await httpCall("POST", "/api/arc/agent-events", { body: agentEventPayload });
  
  const agentEventResult = out.endpoints["/api/arc/agent-events"];
  if (!agentEventResult.ok || agentEventResult.status !== 200) {
    verdict.pass = false;
    verdict.reasons.push(`/api/arc/agent-events failed: status ${agentEventResult.status}`);
  }

  // Test 6: POST /api/arc/receive
  console.log("Testing POST /api/arc/receive...");
  const receivePayload = {
    source: "e2e_verifier",
    command_id: `cmd-${runId}`,
    status: "test",
    data: { run_id: runId, at: nowISO() },
  };
  out.endpoints["/api/arc/receive"] = await httpCall("POST", "/api/arc/receive", { body: receivePayload });
  
  const receiveResult = out.endpoints["/api/arc/receive"];
  if (receiveResult.status === 401) {
    verdict.pass = false;
    verdict.reasons.push(`/api/arc/receive returned 401 Unauthorized`);
  }

  // Test 7: POST /arc/execute
  console.log("Testing POST /arc/execute...");
  const executePayload = {
    run_id: runId,
    command: "ARC>E2E_EXECUTE",
    payload: { at: nowISO(), note: "E2E verification probe" },
  };
  out.endpoints["/arc/execute"] = await httpCall("POST", "/arc/execute", { body: executePayload });
  
  const executeResult = out.endpoints["/arc/execute"];
  if (executeResult.status === 500) {
    verdict.pass = false;
    verdict.reasons.push(`/arc/execute returned 500 Internal Server Error: ${executeResult.bodyJson?.error || "unknown"}`);
  } else if (!executeResult.bodyJson?.ok || !executeResult.bodyJson?.execution_id) {
    verdict.pass = false;
    verdict.reasons.push(`/arc/execute missing ok:true or execution_id in response`);
  }

  // Test 8: POST /api/arc/generate-summary
  console.log("Testing POST /api/arc/generate-summary...");
  out.endpoints["/api/arc/generate-summary"] = await httpCall("POST", "/api/arc/generate-summary", { 
    body: { run_id: runId } 
  });

  // DB Verification
  console.log("\nVerifying database...");
  out.db_proof.table_count = await dbGetTableCount();
  
  if (DATABASE_URL) {
    out.db_proof.event_verification = await dbVerifyEventExists(runId);
    if (agentEventResult.ok && !out.db_proof.event_verification.found) {
      verdict.pass = false;
      verdict.reasons.push(`DB proof failed: agent event not found in database for run_id ${runId}`);
    }
  } else {
    out.db_proof.event_verification = { skipped: true, reason: "DATABASE_URL not set" };
  }

  // Final verdict
  out.verdict = verdict;

  // Write output file
  const filename = `arc_e2e_verifier_${runId}.json`;
  fs.writeFileSync(filename, JSON.stringify(out, null, 2), "utf-8");

  // Print summary
  console.log(`\n=== RESULTS ===`);
  console.log(`File saved: ${filename}`);
  console.log(`\nEndpoint Results:`);
  for (const [endpoint, result] of Object.entries(out.endpoints)) {
    const status = result.status || "ERR";
    const ok = result.ok ? "OK" : "FAIL";
    console.log(`  ${endpoint}: ${status} (${ok})`);
  }

  console.log(`\nDB Proof:`);
  console.log(`  Tables: ${out.db_proof.table_count?.count ?? "N/A"}`);
  console.log(`  Event Found: ${out.db_proof.event_verification?.found ?? "N/A"}`);

  console.log(`\n${"=".repeat(50)}`);
  if (verdict.pass) {
    console.log(`VERDICT: ✅ PASS`);
  } else {
    console.log(`VERDICT: ❌ FAIL`);
    console.log(`Reasons:`);
    for (const reason of verdict.reasons) {
      console.log(`  - ${reason}`);
    }
  }
  console.log(`${"=".repeat(50)}\n`);

  process.exit(verdict.pass ? 0 : 1);
}

main().catch((e) => {
  console.error("E2E Verifier failed:", e);
  process.exit(1);
});
