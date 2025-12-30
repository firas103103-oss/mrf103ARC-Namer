
import { db } from "./db";
import { sql } from "drizzle-orm";
import type { Request } from "express";
import {
  type CreateIntent, 
  type CreateAction,
  type CreateResult,
  type CreateImpact,
  intentLog,
  actionLog,
  resultLog,
  impactLog
} from "@shared/schema";

async function logIntent(data: CreateIntent): Promise<{ id: string }> {
  const [result] = await db.insert(intentLog).values(data).returning({ id: intentLog.id });
  return result;
}

async function logAction(data: CreateAction): Promise<{ id: string }> {
  const [result] = await db.insert(actionLog).values(data).returning({ id: actionLog.id });
  return result;
}

async function logResult(data: CreateResult): Promise<{ id: string }> {
  if (data.action_id) {
      await db.update(actionLog)
          .set({ status: data.success ? 'success' : 'failed' })
          .where(sql`${actionLog.id} = ${data.action_id}`);
  }
  const { success, ...rest } = data;
  const [result] = await db.insert(resultLog).values(rest).returning({ id: resultLog.id });
  return result;
}

async function logImpact(data: CreateImpact): Promise<{ id: string }> {
  const [result] = await db.insert(impactLog).values(data).returning({ id: impactLog.id });
  return result;
}

export const causal = {
  logIntent,
  logAction,
  logResult,
  logImpact,
};
