import { db } from "./db";
import { sql } from "drizzle-orm";
import type { Request } from "express";

export interface CausalContext {
  intentId: string;
  actionId?: string;
}

function getArcSecret(req: Request): string | undefined {
  const canonical = req.headers["x_arc_secret"];
  const legacy = req.headers["x-arc-secret"];
  if (typeof canonical === "string") return canonical;
  if (typeof legacy === "string") return legacy;
  if (Array.isArray(canonical)) return canonical[0];
  if (Array.isArray(legacy)) return legacy[0];
  return undefined;
}

function hasValidArcSecret(req: Request): boolean {
  const secret = getArcSecret(req);
  const expectedSecret = process.env.ARC_BACKEND_SECRET;
  if (!expectedSecret) return false;
  return secret === expectedSecret;
}

export async function logIntent(
  req: Request,
  actorType: "user" | "agent" | "system" | "external",
  actorId: string | undefined,
  intentType: string,
  intentText: string,
  context?: Record<string, unknown>
): Promise<string | null> {
  if (!hasValidArcSecret(req)) return null;

  try {
    const result = await db.execute(sql`
      INSERT INTO intent_log (actor_type, actor_id, intent_type, intent_text, context)
      VALUES (${actorType}, ${actorId || null}, ${intentType}, ${intentText}, ${JSON.stringify(context || {})})
      RETURNING id
    `);
    return (result.rows?.[0] as any)?.id || null;
  } catch {
    return null;
  }
}

export async function logAction(
  req: Request,
  intentId: string,
  actionType: string,
  actionTarget?: string,
  requestData?: Record<string, unknown>,
  costUsd?: number
): Promise<string | null> {
  if (!hasValidArcSecret(req)) return null;

  try {
    const result = await db.execute(sql`
      INSERT INTO action_log (intent_id, action_type, action_target, request, cost_usd, status)
      VALUES (${intentId}, ${actionType}, ${actionTarget || null}, ${JSON.stringify(requestData || {})}, ${costUsd || null}, 'running')
      RETURNING id
    `);
    return (result.rows?.[0] as any)?.id || null;
  } catch {
    return null;
  }
}

export async function updateActionStatus(
  actionId: string,
  status: "queued" | "running" | "success" | "failed"
): Promise<void> {
  try {
    await db.execute(sql`
      UPDATE action_log SET status = ${status} WHERE id = ${actionId}
    `);
  } catch {
  }
}

export async function logResult(
  actionId: string,
  output?: Record<string, unknown>,
  error?: string,
  latencyMs?: number
): Promise<string | null> {
  try {
    const result = await db.execute(sql`
      INSERT INTO result_log (action_id, output, error, latency_ms)
      VALUES (${actionId}, ${JSON.stringify(output || {})}, ${error || null}, ${latencyMs || null})
      RETURNING id
    `);
    return (result.rows?.[0] as any)?.id || null;
  } catch {
    return null;
  }
}

export async function logImpact(
  intentId: string,
  impactType: string,
  impactScore?: number,
  impact?: Record<string, unknown>
): Promise<string | null> {
  try {
    const result = await db.execute(sql`
      INSERT INTO impact_log (intent_id, impact_type, impact_score, impact)
      VALUES (${intentId}, ${impactType}, ${impactScore || null}, ${JSON.stringify(impact || {})})
      RETURNING id
    `);
    return (result.rows?.[0] as any)?.id || null;
  } catch {
    return null;
  }
}

export async function instrumentRequest(
  req: Request,
  actorType: "user" | "agent" | "system" | "external",
  actorId: string | undefined,
  intentType: string,
  intentText: string,
  actionType: string,
  actionTarget?: string,
  context?: Record<string, unknown>
): Promise<CausalContext | null> {
  if (!hasValidArcSecret(req)) return null;

  const intentId = await logIntent(req, actorType, actorId, intentType, intentText, context);
  if (!intentId) return null;

  const actionId = await logAction(req, intentId, actionType, actionTarget, context);
  return { intentId, actionId: actionId || undefined };
}

export async function completeInstrumentation(
  causalContext: CausalContext | null,
  success: boolean,
  output?: Record<string, unknown>,
  error?: string,
  latencyMs?: number
): Promise<void> {
  if (!causalContext?.actionId) return;

  await updateActionStatus(causalContext.actionId, success ? "success" : "failed");
  await logResult(causalContext.actionId, output, error, latencyMs);
}
