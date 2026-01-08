/**
 * ARC Reality Probe (Evidence-first)
 * - Runs locally inside Replit OR from your machine
 * - Produces a single JSON file with endpoint + DB + ingestion proof
 *
 * Usage:
 *   ARC_BASE_URL="https://x-bioai.com" ARC_SECRET="..." node arc_reality_probe.js
 * Or (inside Replit local server):
 *   ARC_BASE_URL="http://127.0.0.1:5000" ARC_SECRET="..." node arc_reality_probe.js
 *
 * Optional (for direct DB verification):
 *   DATABASE_URL="postgres://..." node arc_reality_probe.js
 *
 * Notes:
 * - Does NOT print secrets; only reports boolean presence.
 * - If DB not reachable (no DATABASE_URL or pg missing), it will skip DB proof gracefully.
 */

import fs from "fs";
import crypto from "crypto";

const BASE_URL = (process.env.ARC_BASE_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const ARC_SECRET = process.env.ARC_SECRET || process.env.ARC_TOKEN || "";
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

async function httpCall(method, path, { headers = {}, body = undefined, timeoutMs = 12000 } = {}) {
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const finalHeaders = {
    "content-type": "application/json",
    ...headers,
  };

  // Support both header naming styles mentioned in your specs
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

  // Try parse JSON if possible
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
    bodyTextPreview: text?.slice(0, 4000) || "",
    bodyJson: parsed,
  };
}

async function tryLoadPg() {
  try {
    const pg = await import("pg");
    return pg;
  } catch (e) {
    return null;
  }
}

async function dbProbe() {
  const result = {
    enabled: false,
    reason: "",
    summary: null,
    candidateEventTables: [],
    ingestProof: null,
    errors: [],
  };

  if (!DATABASE_URL) {
    result.reason = "DATABASE_URL not set; skipping direct DB verification.";
    return result;
  }

  const pg = await tryLoadPg();
  if (!pg) {
    result.reason = "pg package not available; install 'pg' or skip DB verification.";
    return result;
  }

  const { Client } = pg;
  const client = new Client({ connectionString: DATABASE_URL, ssl: process.env.PGSSLMODE ? { rejectUnauthorized: false } : undefined });

  try {
    await client.connect();
    result.enabled = true;

    // Total tables + row counts estimation (fast: count(*) per table can be expensive; use pg_class estimate + optional exact counts for key tables)
    const tables = await client.query(`
      SELECT
        n.nspname as schema,
        c.relname as table,
        c.reltuples::bigint as estimated_rows
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY estimated_rows DESC NULLS LAST;
    `);

    const tableList = tables.rows || [];
    const totalTables = tableList.length;

    // Find likely "agent events" table(s) by columns
    const eventCandidates = await client.query(`
      SELECT table_schema, table_name,
             SUM(CASE WHEN column_name='agent_name' THEN 1 ELSE 0 END) AS has_agent_name,
             SUM(CASE WHEN column_name='event_type' THEN 1 ELSE 0 END) AS has_event_type,
             SUM(CASE WHEN column_name='created_at' THEN 1 ELSE 0 END) AS has_created_at
      FROM information_schema.columns
      WHERE table_schema NOT IN ('pg_catalog','information_schema')
        AND column_name IN ('agent_name','event_type','created_at')
      GROUP BY table_schema, table_name
      HAVING SUM(CASE WHEN column_name='agent_name' THEN 1 ELSE 0 END) >= 1
         AND SUM(CASE WHEN column_name='event_type' THEN 1 ELSE 0 END) >= 1
      ORDER BY has_created_at DESC, table_schema, table_name;
    `);

    result.candidateEventTables = eventCandidates.rows || [];

    result.summary = {
      totalTables,
      topTablesByEstimatedRows: tableList.slice(0, 20),
    };

    await client.end();
    return result;
  } catch (e) {
    result.errors.push(String(e));
    try { await client.end(); } catch {}
    return result;
  }
}

async function dbExactCountForTable(tableSchema, tableName) {
  const pg = await tryLoadPg();
  if (!pg || !DATABASE_URL) return null;
  const { Client } = pg;
  const client = new Client({ connectionString: DATABASE_URL, ssl: process.env.PGSSLMODE ? { rejectUnauthorized: false } : undefined });
  try {
    await client.connect();
    const q = await client.query(`SELECT COUNT(*)::bigint AS c FROM "${tableSchema}"."${tableName}"`);
    await client.end();
    return Number(q.rows?.[0]?.c ?? 0);
  } catch {
    try { await client.end(); } catch {}
    return null;
  }
}

async function main() {
  const runId = `ARC-PROBE-${nowISO().replace(/[:.]/g, "-")}-${crypto.randomBytes(3).toString("hex")}`;

  const out = {
    run_id: runId,
    generated_at: nowISO(),
    base_url: BASE_URL,
    env_presence: {
      ARC_SECRET_present: Boolean(ARC_SECRET),
      DATABASE_URL_present: Boolean(DATABASE_URL),
    },
    endpoints: {},
    inferences: [],
    db: null,
    ingest: {
      attempted: false,
      endpoint: "/api/arc/agent-events",
      sent_payload: null,
      response: null,
      db_before_after: null,
    },
  };

  // Core endpoint probes (they can be 200/401/404 — all are evidence)
  const probes = [
    ["GET", "/"],
    ["GET", "/health"],
    ["GET", "/api/health"],
    ["GET", "/ping"],
    ["GET", "/api/ping"],
    ["GET", "/api/arc/reality-report"],
    ["GET", "/api/arc/status"],
    ["POST", "/arc/execute"],          // this is the one that was placeholder in earlier notes
    ["POST", "/api/arc/receive"],      // may exist or not; probe shows truth
  ];

  for (const [method, path] of probes) {
    const body =
      method === "POST"
        ? { probe: true, run_id: runId, at: nowISO(), note: "reality_probe" }
        : undefined;

    out.endpoints[`${method} ${path}`] = await httpCall(method, path, { body });
  }

  // Detect placeholder patterns for /arc/execute
  const execKey = "POST /arc/execute";
  const execRes = out.endpoints[execKey];
  if (execRes?.bodyTextPreview?.toLowerCase().includes("executor placeholder") ||
      execRes?.bodyTextPreview?.toLowerCase().includes("placeholder")) {
    out.inferences.push("/arc/execute appears to still be a placeholder (based on response text).");
  } else if (execRes?.status === 404) {
    out.inferences.push("/arc/execute not found (404).");
  } else if (execRes?.ok) {
    out.inferences.push("/arc/execute responded OK; verify it performs real actions, not just returns static JSON.");
  }

  // DB probe (tables + candidate event tables)
  out.db = await dbProbe();

  // Ingestion proof: POST /api/arc/agent-events + optional DB before/after exact count (if we can identify a candidate)
  const ingestPayload = {
    agent_name: "reality_probe",
    event_type: "PROBE_EVENT",
    payload: { run_id: runId, at: nowISO(), source: "arc_reality_probe.js" },
  };
  out.ingest.attempted = true;
  out.ingest.sent_payload = ingestPayload;

  // If we have a candidate table, try count before/after
  let chosen = null;
  if (out.db?.enabled && Array.isArray(out.db?.candidateEventTables) && out.db.candidateEventTables.length > 0) {
    chosen = out.db.candidateEventTables[0]; // best guess: first one with created_at if present
  }

  let beforeCount = null;
  if (chosen) {
    beforeCount = await dbExactCountForTable(chosen.table_schema, chosen.table_name);
  }

  out.ingest.response = await httpCall("POST", "/api/arc/agent-events", { body: ingestPayload });

  let afterCount = null;
  if (chosen) {
    afterCount = await dbExactCountForTable(chosen.table_schema, chosen.table_name);
    out.ingest.db_before_after = {
      table: `${chosen.table_schema}.${chosen.table_name}`,
      before: beforeCount,
      after: afterCount,
      delta: (beforeCount !== null && afterCount !== null) ? (afterCount - beforeCount) : null,
      note:
        (beforeCount !== null && afterCount !== null)
          ? "If delta >= 1, this is strong evidence the ingest wrote to DB."
          : "Could not compute exact before/after count.",
    };
  } else {
    out.ingest.db_before_after = { note: "No candidate event table detected or DB probe disabled; DB proof skipped." };
  }

  // Write output file
  const filename = `arc_reality_probe_${runId}.json`;
  fs.writeFileSync(filename, JSON.stringify(out, null, 2), "utf-8");

  // Console summary (minimal)
  console.log(`Saved: ${filename}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`ARC_SECRET present: ${Boolean(ARC_SECRET)} | DATABASE_URL present: ${Boolean(DATABASE_URL)}`);
  console.log(`Inferences:`, out.inferences);
}

main().catch((e) => {
  console.error("Probe failed:", e);
  process.exit(1);
});
