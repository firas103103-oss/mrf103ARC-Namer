
import { db } from "./db";
import { sql } from "drizzle-orm";
import type { Request } from "express";
import {
  intentLog,
  actionLog,
  resultLog,
  impactLog,
  type InsertIntentLog,
  type InsertActionLog,
  type InsertResultLog,
  type InsertImpactLog
} from "@shared/schema";

type UnknownRecord = Record<string, any>;

type CreateResult = UnknownRecord & {
  success: boolean;
  actionId?: string | null;
  action_id?: string | null;
};

function pick<T>(value: T | undefined, fallback: T | undefined): T | undefined {
  return value ?? fallback;
}

function normalizeIntent(data: UnknownRecord): InsertIntentLog {
  const actorType = pick(data.actorType, data.actor_type) ?? "system";
  const intentType = pick(data.intentType, data.intent_type) ?? "unknown";
  const intentText = pick(data.intentText, data.intent_text) ?? JSON.stringify(data);

  return {
    actorType,
    intentType,
    intentText,
    context: data.context,
  };
}

function normalizeAction(data: UnknownRecord): InsertActionLog {
  const intentId = pick(data.intentId, data.intent_id);
  const actionType = pick(data.actionType, data.action_type);

  return {
    intentId: intentId ?? "",
    actionType: actionType ?? "unknown",
    status: data.status,
  };
}

function normalizeResult(data: CreateResult): InsertResultLog {
  const actionId = pick(data.actionId, data.action_id);

  return {
    actionId: actionId ?? "",
    output: data.output,
  };
}

function normalizeImpact(data: UnknownRecord): InsertImpactLog {
  const intentId = pick(data.intentId, data.intent_id);
  const impactType = pick(data.impactType, data.impact_type);

  return {
    intentId: intentId ?? "",
    impactType: impactType ?? "unknown",
    impact: data.impact,
  };
}

async function logIntent(data: UnknownRecord): Promise<{ id: string }> {
  const insert = normalizeIntent(data);
  const [result] = await db.insert(intentLog).values(insert).returning({ id: intentLog.id });
  return result;
}

async function logAction(data: UnknownRecord): Promise<{ id: string }> {
  const insert = normalizeAction(data);
  const [result] = await db.insert(actionLog).values(insert).returning({ id: actionLog.id });
  return result;
}

async function logResult(data: CreateResult): Promise<{ id: string }> {
  const actionId = pick(data.actionId, data.action_id);

  if (actionId) {
      await db.update(actionLog)
          .set({ status: data.success ? 'success' : 'failed' })
          .where(sql`${actionLog.id} = ${actionId}`);
  }
  const insert = normalizeResult(data);
  const [result] = await db.insert(resultLog).values(insert).returning({ id: resultLog.id });
  return result;
}

async function logImpact(data: UnknownRecord): Promise<{ id: string }> {
  const insert = normalizeImpact(data);
  const [result] = await db.insert(impactLog).values(insert).returning({ id: impactLog.id });
  return result;
}

export const causal = {
  logIntent,
  logAction,
  logResult,
  logImpact,
};
