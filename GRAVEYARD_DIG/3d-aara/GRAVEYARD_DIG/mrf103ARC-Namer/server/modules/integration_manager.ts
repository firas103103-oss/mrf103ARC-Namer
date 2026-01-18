/**
 * ═══════════════════════════════════════════════════════════════
 * ARC INTEGRATION MANAGER
 * ═══════════════════════════════════════════════════════════════
 * ربط شامل لجميع الأدوات الخارجية:
 * - n8n Automation Platform
 * - ElevenLabs Text-to-Speech
 * - OpenAI, Anthropic, Gemini APIs
 * - تسجيل وتتبع جميع التكاملات
 * ═══════════════════════════════════════════════════════════════
 */

import { log } from "../index";
import { supabase, isSupabaseConfigured } from "../supabase";

// ═══════════════════════════════════════════════════════════════
// N8N INTEGRATION
// ═══════════════════════════════════════════════════════════════

export interface N8NPayload {
  event_type: string;
  agent_id?: string;
  data: Record<string, any>;
  timestamp?: string;
  priority?: "low" | "normal" | "high" | "critical";
}

export async function sendToN8N(payload: N8NPayload): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    const N8N_URL = process.env.N8N_WEBHOOK_URL;
    const ARC_SECRET = process.env.ARC_BACKEND_SECRET || process.env.X_ARC_SECRET;

    if (!N8N_URL) {
      log("⚠️ N8N_WEBHOOK_URL not configured", "n8n");
      return false;
    }

    const fullPayload = {
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
      source: "ARC-System",
      version: "v15.0-ARC2.0",
    };

    const res = await fetch(N8N_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-arc-secret": ARC_SECRET || "",
        "User-Agent": "ARC-System/15.0",
      },
      body: JSON.stringify(fullPayload),
    });

    const latencyMs = Date.now() - startTime;
    const success = res.ok;

    // Log to Supabase
    if (isSupabaseConfigured()) {
      await supabase?.from("integration_logs").insert({
        integration_name: "n8n",
        event_type: payload.event_type,
        direction: "outbound",
        request_payload: fullPayload,
        response_payload: success ? { status: "ok" } : { error: await res.text() },
        status_code: res.status,
        success: success ? "true" : "false",
        error_message: success ? null : await res.text(),
        latency_ms: latencyMs,
        metadata: { url: N8N_URL, priority: payload.priority },
      });
    }

    if (success) {
      log(`✅ n8n webhook delivered: ${payload.event_type} (${latencyMs}ms)`, "n8n");
      return true;
    } else {
      const errText = await res.text();
      log(`❌ n8n webhook failed: ${res.status} - ${errText}`, "n8n");
      return false;
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    
    log(`❌ n8n connection error: ${err.message}`, "n8n");

    // Log error
    if (isSupabaseConfigured()) {
      await supabase?.from("integration_logs").insert({
        integration_name: "n8n",
        event_type: payload.event_type,
        direction: "outbound",
        request_payload: payload,
        status_code: 0,
        success: "false",
        error_message: err.message,
        latency_ms: latencyMs,
      });
    }

    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// ELEVENLABS TEXT-TO-SPEECH INTEGRATION
// ═══════════════════════════════════════════════════════════════

export interface TTSRequest {
  text: string;
  voice_id: string;
  agent_id?: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export async function generateSpeech(request: TTSRequest): Promise<Buffer | null> {
  const startTime = Date.now();
  
  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

    if (!ELEVENLABS_API_KEY) {
      log("⚠️ ELEVENLABS_API_KEY not configured", "elevenlabs");
      return null;
    }

    const model_id = request.model_id || "eleven_multilingual_v2";
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${request.voice_id}`;

    const body = {
      text: request.text,
      model_id,
      voice_settings: request.voice_settings || {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errorText = await res.text();
      log(`❌ ElevenLabs TTS failed: ${res.status} - ${errorText}`, "elevenlabs");

      if (isSupabaseConfigured()) {
        await supabase?.from("integration_logs").insert({
          integration_name: "elevenlabs",
          event_type: "tts_generated",
          direction: "outbound",
          request_payload: { text: request.text.substring(0, 100), voice_id: request.voice_id },
          status_code: res.status,
          success: "false",
          error_message: errorText,
          latency_ms: latencyMs,
        });
      }

      return null;
    }

    const audioBuffer = Buffer.from(await res.arrayBuffer());

    // Log successful TTS generation
    if (isSupabaseConfigured()) {
      await supabase?.from("integration_logs").insert({
        integration_name: "elevenlabs",
        event_type: "tts_generated",
        direction: "outbound",
        request_payload: {
          text_length: request.text.length,
          voice_id: request.voice_id,
          agent_id: request.agent_id,
        },
        response_payload: { audio_size_bytes: audioBuffer.length },
        status_code: 200,
        success: "true",
        latency_ms: latencyMs,
        metadata: { model_id },
      });
    }

    log(`✅ Speech generated: ${audioBuffer.length} bytes (${latencyMs}ms)`, "elevenlabs");
    return audioBuffer;
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    
    log(`❌ ElevenLabs error: ${err.message}`, "elevenlabs");

    if (isSupabaseConfigured()) {
      await supabase?.from("integration_logs").insert({
        integration_name: "elevenlabs",
        event_type: "tts_generated",
        direction: "outbound",
        request_payload: { text_length: request.text.length, voice_id: request.voice_id },
        status_code: 0,
        success: "false",
        error_message: err.message,
        latency_ms: latencyMs,
      });
    }

    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// LLM API INTEGRATIONS (OpenAI, Anthropic, Gemini)
// ═══════════════════════════════════════════════════════════════

export interface LLMRequest {
  provider: "openai" | "anthropic" | "gemini";
  model?: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  agent_id?: string;
}

export async function callLLM(request: LLMRequest): Promise<string | null> {
  const startTime = Date.now();
  
  try {
    let response: string | null = null;
    let statusCode = 0;

    switch (request.provider) {
      case "openai":
        response = await callOpenAI(request);
        statusCode = response ? 200 : 500;
        break;
      case "anthropic":
        response = await callAnthropic(request);
        statusCode = response ? 200 : 500;
        break;
      case "gemini":
        response = await callGemini(request);
        statusCode = response ? 200 : 500;
        break;
      default:
        log(`❌ Unknown LLM provider: ${request.provider}`, "llm");
        return null;
    }

    const latencyMs = Date.now() - startTime;

    // Log to Supabase
    if (isSupabaseConfigured()) {
      await supabase?.from("integration_logs").insert({
        integration_name: request.provider,
        event_type: "api_call",
        direction: "outbound",
        request_payload: {
          model: request.model,
          message_count: request.messages.length,
          agent_id: request.agent_id,
        },
        response_payload: {
          response_length: response?.length || 0,
        },
        status_code: statusCode,
        success: response ? "true" : "false",
        latency_ms: latencyMs,
        metadata: { temperature: request.temperature, max_tokens: request.max_tokens },
      });
    }

    return response;
  } catch (err: any) {
    log(`❌ LLM call error: ${err.message}`, "llm");
    return null;
  }
}

async function callOpenAI(request: LLMRequest): Promise<string | null> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return null;

  const model = request.model || process.env.OPENAI_MODEL || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.max_tokens || 1000,
    }),
  });

  if (!res.ok) {
    log(`❌ OpenAI API error: ${res.status}`, "openai");
    return null;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

async function callAnthropic(request: LLMRequest): Promise<string | null> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return null;

  const model = request.model || "claude-3-5-sonnet-20241022";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.max_tokens || 1000,
    }),
  });

  if (!res.ok) {
    log(`❌ Anthropic API error: ${res.status}`, "anthropic");
    return null;
  }

  const data = await res.json();
  return data.content?.[0]?.text || null;
}

async function callGemini(request: LLMRequest): Promise<string | null> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return null;

  const model = request.model || "gemini-pro";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  // Convert messages to Gemini format
  const contents = request.messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.max_tokens || 1000,
      },
    }),
  });

  if (!res.ok) {
    log(`❌ Gemini API error: ${res.status}`, "gemini");
    return null;
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// ═══════════════════════════════════════════════════════════════
// INTEGRATION HEALTH CHECKS
// ═══════════════════════════════════════════════════════════════

export async function checkIntegrationsHealth(): Promise<Record<string, boolean>> {
  const health: Record<string, boolean> = {
    n8n: !!process.env.N8N_WEBHOOK_URL,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    supabase: isSupabaseConfigured(),
  };

  log("🔍 Integration Health Check:", "integrations");
  for (const [name, status] of Object.entries(health)) {
    log(`  ${status ? "✅" : "❌"} ${name}`, "integrations");
  }

  return health;
}
