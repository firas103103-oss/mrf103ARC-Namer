# API Contract v0.2 Evolution

**Date**: January 1, 2026  
**Status**: PROPOSED (v0.2 Phase)  
**Baseline**: v0.1.x endpoints remain FROZEN  
**Linked ADRs**: ADR-002, ADR-003, ADR-004

---

## Overview

v0.2 adds new capabilities **without breaking v0.1.x**:
- Voice synthesis endpoint (ADR-002)
- Agent routing infrastructure (ADR-003)
- External system webhooks (ADR-004)

All v0.1.x endpoints remain unchanged and fully backward compatible.

---

## New v0.2 Endpoints

### Voice Synthesis (ADR-002)

| Method | Path | Auth Required | Request Shape | Response Shape | Error Codes | Notes |
|--------|------|---------------|---------------|----------------|------------|-------|
| POST | `/api/voice/synthesize` | ✅ Yes | `{ text: string, voice_id?: string, model?: string }` | `audio/mpeg (binary)` | 400, 401, 503, 500 | ElevenLabs backend proxy |

**Request Constraints:**
- `text`: Required, max 5000 characters
- `voice_id`: Optional, defaults to "default"
- `model`: Optional, defaults to "eleven_monolingual_v1"

**Response Headers:**
- `Content-Type: audio/mpeg`
- `Cache-Control: public, max-age=3600`

**Error Responses:**
- 400: Invalid input (missing text, too long, etc.)
- 401: Not authenticated
- 503: ElevenLabs API unavailable
- 500: Internal server error

---

### Agent Routing (ADR-003)

| Method | Path | Auth Required | Request Shape | Response Shape | Error Codes | Notes |
|--------|------|---------------|---------------|----------------|------------|-------|
| POST | `/api/think` | ✅ Yes | `{ message: string, agentId?: string, context?: {} }` | `{ agentId: string, response: string, metadata: {} }` | 400, 401, 503, 500 | Multi-agent unified endpoint |

**Request Details:**
```json
{
  "message": "What is the weather?",
  "agentId": "mrf",  // optional, defaults to intelligent routing
  "context": {       // optional
    "timestamp": "2026-01-01T00:00:00Z",
    "userId": "user_123"
  }
}
```

**Response Details:**
```json
{
  "agentId": "mrf",
  "response": "I'm Mr.F, your conversational assistant...",
  "metadata": {
    "model": "gpt-4o-mini",
    "tokens_used": 45,
    "latency_ms": 234
  }
}
```

**Backward Compatibility:**
- `/api/call_mrf_brain` remains unchanged (v0.1 guarantee)
- Both endpoints internally route to Mr.F agent

---

### Webhooks (ADR-004)

#### n8n Workflow Events

| Method | Path | Auth Required | Request Shape | Response Shape | Error Codes | Notes |
|--------|------|---------------|---------------|----------------|------------|-------|
| POST | `/webhooks/n8n` | ✅ Yes (X-N8N-Signature) | `{ workflowId, eventType, data, timestamp }` | `{ status: "received", acknowledgement: string }` | 400, 401, 500 | Specification v0.2, impl v0.2.1+ |

**Request Example:**
```json
{
  "workflowId": "wf_001",
  "eventType": "workflow.completed",
  "data": { /* workflow output */ },
  "timestamp": "2026-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "status": "received",
  "acknowledgement": "ack_1234567890"
}
```

---

#### ESP32 Bio Sentinel Events

| Method | Path | Auth Required | Request Shape | Response Shape | Error Codes | Notes |
|--------|------|---------------|---------------|----------------|------------|-------|
| POST | `/webhooks/esp32` | ✅ Yes (Bearer token) | `{ deviceId, sensorType, reading, timestamp, metadata }` | `{ status: "stored", alerting: boolean }` | 400, 401, 500 | Specification v0.2, impl v0.2.1+ |

**Request Example:**
```json
{
  "deviceId": "esp32_001",
  "sensorType": "heart_rate",
  "reading": 72,
  "timestamp": "2026-01-01T00:00:00Z",
  "metadata": { "location": "wrist" }
}
```

**Response:**
```json
{
  "status": "stored",
  "alerting": false
}
```

---

## Summary: v0.1 vs v0.2

### v0.1 Endpoints (FROZEN)
- `/auth/*` (login, logout, user) ✅ UNCHANGED
- `/api/arc/*` (command-log, agent-events, etc.) ✅ UNCHANGED
- `/realtime` (WebSocket) ✅ UNCHANGED
- `/api/call_mrf_brain` (chat) ✅ UNCHANGED

### v0.2 New Endpoints (PROPOSED)
- `/api/voice/synthesize` (voice output)
- `/api/think` (agent routing)
- `/webhooks/n8n` (n8n events)
- `/webhooks/esp32` (ESP32 events)

### Total API Surface
- **v0.1**: 16 endpoints
- **v0.2 additions**: 4 endpoints  
- **Total**: 20 endpoints

---

## Rate Limiting

**General endpoints:** 120 requests/min per IP  
**Voice synthesis:** Included in general limit  
**Webhook endpoints:** 1000 requests/min per source (future)

---

## Links

- ADR-001: UI Source of Truth (v0.1)
- ADR-002: Voice Layer (v0.2)
- ADR-003: Multi-Agent Routing (v0.2)
- ADR-004: External Orchestration (v0.2)
- API_CONTRACT_BASELINE.md (v0.1 frozen contract)
