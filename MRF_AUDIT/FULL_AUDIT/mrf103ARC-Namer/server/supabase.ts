
// ==================== SUPABASE SERVER CLIENT ====================
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import logger from "./utils/logger";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log("✅ Supabase client initialized");
} else {
  logger.warn("⚠️ Supabase not configured: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

export { supabase };

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

// ==================== COMMAND LOGS ====================
export interface CommandLogEntry {
  command_id: string;
  payload: Record<string, any>;
  status: "received" | "processing" | "completed" | "failed";
  result?: Record<string, any>;
}

export async function insertCommandLog(entry: CommandLogEntry): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { data, error } = await supabase
      .from("command_logs")
      .insert([{
        command_id: entry.command_id,
        payload: entry.payload,
        status: entry.status,
        result: entry.result || null
      }])
      .select();

    if (error) {
      return { success: false, error: (error instanceof Error ? error.message : 'Unknown error') };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateCommandLog(
  commandId: string, 
  updates: { status?: string; result?: Record<string, any> }
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { data, error } = await supabase
      .from("command_logs")
      .update(updates)
      .eq("command_id", commandId)
      .select();

    if (error) {
      return { success: false, error: (error instanceof Error ? error.message : 'Unknown error') };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==================== AGENTS ====================
export interface SupabaseAgent {
  id: number;
  agent_code: string;
  name: string;
  role: string;
  specialty: string;
  system_prompt: string;
  tools: string[];
  avatar: string;
  created_at: string;
  updated_at: string;
}

export async function fetchAgentsFromSupabase(): Promise<{ success: boolean; data?: SupabaseAgent[]; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .order("agent_code", { ascending: true });

    if (error) {
      return { success: false, error: (error instanceof Error ? error.message : 'Unknown error') };
    }

    return { success: true, data: data as SupabaseAgent[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==================== DEPARTMENTS ====================
export interface SupabaseDepartment {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export async function fetchDepartmentsFromSupabase(): Promise<{ success: boolean; data?: SupabaseDepartment[]; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: (error instanceof Error ? error.message : 'Unknown error') };
    }

    return { success: true, data: data as SupabaseDepartment[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==================== MEMORIES (VECTOR STORE) ====================
export interface SupabaseMemory {
  id: number;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  created_at: string;
}

export async function fetchMemoriesFromSupabase(limit = 100): Promise<{ success: boolean; data?: SupabaseMemory[]; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: (error instanceof Error ? error.message : 'Unknown error') };
    }

    return { success: true, data: data as SupabaseMemory[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==================== CONNECTION TEST ====================
export async function testSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!supabase) {
    return { connected: false, error: "Supabase not configured" };
  }

  try {
    // Try to query a simple table to test connection
    const { error } = await supabase.from("agents").select("agent_code").limit(1);
    
    if (error) {
      return { connected: false, error: (error instanceof Error ? error.message : 'Unknown error') };
    }

    return { connected: true };
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
}
