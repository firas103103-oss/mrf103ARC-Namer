# API Contract Baseline (v0.1)

**Date**: 2026-01-01  
**Status**: ACCEPTED  
**Baseline**: Frozen after UI Unification + ADR-001

---

## Overview

This document declares the stable Frontend ↔ Backend API contract. All endpoints listed below are **ACTIVE** and **TESTED**. Any new endpoint or change requires explicit approval and a new ADR.

### Architecture
- **Frontend**: `client/` (Vite React application)
- **Backend**: `server/index.ts` + `server/routes.ts` (Express + Node.js)
- **Auth**: Server-side session (express-session, secure cookie)
- **Database**: Supabase (backend-only access via Service Role)
- **Real-time**: WebSocket at `/realtime` (authenticated only)

---

## HTTP API Endpoints

### Authentication

| Method | Path | Auth Required | Request Shape | Response Shape | Error Codes | Notes |
|--------|------|---------------|---------------|----------------|------------|-------|
| POST | `/api/auth/login` | ❌ No | `{ password: string }` | `{ ok: true }` | 401, 500 | Rate-limited (120/min) |
| GET | `/api/auth/user` | ✅ Yes | None | `{ id, email, firstName, lastName }` | 401 | Session-based |
| POST | `/api/auth/logout` | ✅ Yes | None | `{ ok: true }` | — | Destroys session |
| POST | `/api/login` (legacy) | ❌ No | `{ password: string }` | Redirect to `/api/auth/login` | — | Backward compatibility |
| GET | `/api/logout` (legacy) | ✅ Yes | None | Redirect to `/` | — | Backward compatibility |

### Health & Status

| Method | Path | Auth Required | Request Shape | Response Shape | Error Codes | Notes |
|--------|------|---------------|---------------|----------------|------------|-------|
| GET | `/api/health` | ❌ No | None | `{ status: "System Online", mode: "Horizontal Integration" }` | — | No dependencies |

### Data APIs (Secured)

| Method | Path | Auth Required | Query Params | Response Shape | Error Codes | Notes |
|--------|------|---------------|---------------|----------------|------------|-------|
| GET | `/api/arc/command-log` | ✅ Yes | `page`, `pageSize` | `{ data: CommandLog[], count: number }` | 401, 503, 500 | Paginated (max 50/page) |
| GET | `/api/arc/agent-events` | ✅ Yes | `page`, `pageSize` | `{ data: AgentEvent[], count: number }` | 401, 503, 500 | Paginated (max 50/page) |
| GET | `/api/arc/command-metrics` | ✅ Yes | None | `{ total, success, failed, avgResponse }` | 401, 503, 500 | Aggregated from last 100 |
| GET | `/api/arc/selfcheck` | ✅ Yes | None | `{ reminders, summaries, events }` | 401, 503, 500 | Multi-table snapshot |

#### Secured Endpoint Specifics

**CommandLog Response Schema:**
```json
{
  "id": "uuid",
  "command_id": "string",
  "command": "string",
  "status": "string",
  "created_at": "ISO-8601",
  "payload": {},
  "duration_ms": "number | null"
}
```

**AgentEvent Response Schema:**
```json
{
  "id": "uuid",
  "agent_name": "string",
  "event_type": "string",
  "payload": {},
  "created_at": "ISO-8601"
}
```

### External Services (Bridged)

| Method | Path | Auth Required | Request Shape | Response Shape | Error Codes | Notes |
|--------|------|---------------|---------------|----------------|------------|-------|
| POST | `/api/execute` | ❌ No | `{ command: string, payload: object }` | `{ success: true, timestamp, result }` | 500 | **n8n KAYAN NEURAL BRIDGE** |

### Webhook (n8n Integration)

| Method | Path | Auth Required | Request Shape | Response Shape | Error Codes | Notes |
|--------|------|---------------|---------------|----------------|------------|-------|
| POST | `/api/execute` | ❌ No | Varies by `command` field | Status-based JSON | 500 | Command-driven routing |

---

## WebSocket Endpoints

### Real-time Chat (`/realtime`)

**Protocol**: WebSocket upgrade (authenticated)  
**Auth**: Session cookie required (401 if unauthenticated)  
**Purpose**: Live text chat between operator and Mr.F AI

#### Client → Server Message Format
```json
{
  "from": "string (optional)",
  "free_text": "string",
  "text": "string (fallback)"
}
```

#### Server → Client Message Format
```json
{
  "type": "text" | "error" | "connection_established",
  "data": "string (for type=text)",
  "error": "string (for type=error)",
  "message": "string (for type=connection_established)"
}
```

#### Message Types
- **connection_established**: Sent when WebSocket connects
- **text**: Chat response from Mr.F (OpenAI-powered)
- **error**: Rate limit or parse error

#### Rate Limiting
- **Limit**: 1 message per minute per operator
- **Response on limit**: `{ type: "error", error: "rate_limited" }`

#### Logging
- Chat interactions logged to `arc_command_log` table (best-effort, no errors thrown on failure)

---

## Data Shapes (TypeScript)

### Shared Types

```typescript
// From @shared/schema (types exported)
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface CommandLog {
  id: string;
  command_id: string;
  command: string;
  status: string;
  created_at: string;
  payload: Record<string, unknown>;
  duration_ms: number | null;
}

interface AgentEvent {
  id: string;
  agent_name: string;
  event_type: string;
  payload?: unknown;
  created_at: string;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}
```

---

## Authentication & Authorization Rules

### Session Management
- **Method**: `express-session` with secure HTTP-only cookie
- **Cookie Name**: `arc.sid`
- **Secret**: `process.env.SESSION_SECRET` or fallback to `ARC_BACKEND_SECRET`
- **SameSite**: `lax`
- **Secure**: `false` (development; set to `true` in production)
- **HttpOnly**: `true` (prevents JavaScript access)

### Operator Authentication
- **Login**: POST `/api/auth/login` with `{ password }`
- **Password Source**: `process.env.ARC_OPERATOR_PASSWORD` or `ARC_BACKEND_SECRET`
- **Session Flag**: `req.session.operatorAuthenticated = true`
- **Protected Endpoints**: All `/api/arc/*` require `operatorAuthenticated` flag

### Rate Limiting
- **Global**: 120 requests/minute per operator IP (custom limiter)
- **Applied to**: `/api/auth/login`, `/api/auth/logout`
- **Response on limit**: HTTP 429 with `{ error: "rate_limited" }`

---

## Security Rules

### ✅ ALLOWED Patterns
1. **Backend-only Supabase**: Service Role key used only in `server/supabase.ts`
2. **Credential Transmission**: Via session cookie (HttpOnly, SameSite=lax)
3. **Query Sanitization**: Pagination enforced (`pageSize: max 50`)
4. **Field Whitelist**: API responses whitelisted (`pick()` function used)

### ❌ FORBIDDEN Patterns
1. **Direct Browser-to-Supabase**: No Supabase SDK in `client/`
2. **Public URLs**: Supabase URL/keys not exposed to frontend
3. **Unvalidated Query Params**: All params validated before use
4. **Unauth'd Data Access**: All `/api/arc/*` require session authentication

---

## Non-Goals (Explicitly NOT Supported)

| Feature | Reason | Alternative |
|---------|--------|-------------|
| OAuth / OIDC login | Out of scope for v0.1 | Use operator password |
| Multi-user sessions | Single-operator model | Use shared password |
| WebSocket for real-time activity feed | Not yet implemented | Polling (reload) |
| File uploads | Out of scope | External storage (Supabase) |
| Streaming responses | Not implemented | Batch responses |
| GraphQL API | REST is sufficient | Extend REST if needed |

---

## Client API Usage Verification

### Endpoints Actually Used by `client/`

✅ **Confirmed by grep + code inspection:**

1. **Authentication**:
   - `POST /api/login` (landing page button)
   - `GET /api/auth/user` (useAuth hook)
   - `GET /api/logout` (sidebar logout)

2. **Dashboard**:
   - ✅ `GET /api/dashboard/commands` (referenced in code, **NOW IMPLEMENTED**)
   - ✅ `GET /api/dashboard/events` (referenced in code, **NOW IMPLEMENTED**)
   - ✅ `GET /api/dashboard/feedback` (referenced in code, **NOW IMPLEMENTED** - stub)
   - ✅ `GET /api/core/timeline` (referenced in code, **NOW IMPLEMENTED**)

3. **Virtual Office (Command Logs)**:
   - `GET /api/arc/command-log` (paginated, implemented)
   - `GET /api/arc/agent-events` (paginated, implemented)

4. **Metrics**:
   - `GET /api/arc/command-metrics` (implemented)

5. **Self-Check**:
   - `GET /api/arc/selfcheck` (implemented)

6. **Voice**:
   - `GET /api/arc/voices` (ElevenLabs proxy, implemented in `server/routes/voices.js`)

7. **Health**:
   - `GET /api/health` (implemented)

8. **Real-time Chat**:
   - `WebSocket /realtime` (implemented)

9. **Dashboard APIs** (newly implemented):
   - `GET /api/dashboard/commands` (paginated, implemented)
   - `GET /api/dashboard/events` (paginated, implemented)
   - `GET /api/dashboard/feedback` (stub endpoint, implemented)
   - `GET /api/core/timeline` (aggregated, implemented)
   - `POST /api/call_mrf_brain` (OpenAI proxy, implemented)

### Client-Side Query Client

The `client/src/lib/queryClient.ts` uses `@tanstack/react-query` with custom fetch wrapper:
- All queries passed to `queryKey` become fetch URLs
- Example: `queryKey: ["/api/auth/user"]` → `GET /api/auth/user`
- Credentials included by default

### ⚠️ DISCREPANCIES FOUND (RESOLVED)

| Path | Client Reference | Backend Implementation | Status |
|------|------------------|------------------------|--------|
| `/api/dashboard/commands` | ✅ (pages/dashboard.tsx) | ✅ Implemented (thin wrapper) | PASS |
| `/api/dashboard/events` | ✅ (pages/dashboard.tsx) | ✅ Implemented (thin wrapper) | PASS |
| `/api/dashboard/feedback` | ✅ (pages/dashboard.tsx) | ✅ Implemented (stub) | PASS |
| `/api/core/timeline` | ✅ (pages/dashboard.tsx) | ✅ Implemented (aggregator) | PASS |
| `/api/call_mrf_brain` | ✅ (pages/VirtualOffice.tsx) | ✅ Implemented (proxy) | PASS |
| `/api/arc/command-log` | ✅ (pages/virtual-office.tsx) | ✅ Implemented | PASS |
| `/api/arc/agent-events` | ✅ (pages/virtual-office.tsx) | ✅ Implemented | PASS |
| `/api/arc/command-metrics` | ✅ (components/ARCCommandMetrics.tsx) | ✅ Implemented | PASS |
| `/api/arc/selfcheck` | ✅ (pages/SelfCheck.tsx) | ✅ Implemented | PASS |
| `/api/arc/voices` | ✅ (components/ARCVoiceSelector.tsx) | ✅ Implemented (voices.js) | PASS |
| `/api/health` | ✅ (components/ARCMonitor.tsx) | ✅ Implemented | PASS |
| `/realtime` (WebSocket) | ✅ (components/VoiceChatRealtime.tsx) | ✅ Implemented | PASS |
| `/realtime` (WebSocket) | ✅ (components/VoiceChatRealtime.tsx) | ✅ Implemented | PASS |

---

## Status: FULL PASS ✅

### ✅ All Required Endpoints Implemented
- Core authentication endpoints are working
- All dashboard API endpoints now implemented (v0.1.x)
- No direct Supabase access from client
- Session-based auth is secure
- WebSocket is authenticated
- Rate limiting is active

### ✅ Implementation Details
All 5 missing endpoints have been implemented as **thin wrappers/aggregators**:
1. `/api/dashboard/commands` → Reuses `/api/arc/command-log` logic
2. `/api/dashboard/events` → Reuses `/api/arc/agent-events` logic
3. `/api/dashboard/feedback` → STUB endpoint (returns empty array)
4. `/api/core/timeline` → Aggregates command-log + agent-events, sorted by timestamp
5. `/api/call_mrf_brain` → Thin proxy to existing OpenAI handler (with offline fallback)

---

## Freeze Declaration

**As of 2026-01-01, the following API contract is FROZEN:**

### Guaranteed Stable Endpoints
- `/api/auth/login` (POST)
- `/api/auth/user` (GET)
- `/api/auth/logout` (POST)
- `/api/health` (GET)
- `/api/arc/command-log` (GET, paginated)
- `/api/arc/agent-events` (GET, paginated)
- `/api/arc/command-metrics` (GET)
- `/api/arc/selfcheck` (GET)
- `/api/arc/voices` (GET)
- `/api/dashboard/commands` (GET, paginated) **[NEW]**
- `/api/dashboard/events` (GET, paginated) **[NEW]**
- `/api/dashboard/feedback` (GET) **[NEW - STUB]**
- `/api/core/timeline` (GET) **[NEW]**
- `/api/call_mrf_brain` (POST) **[NEW]**
- `/realtime` (WebSocket)

### Any Change Requires
1. **New ADR** justifying the change
2. **Backward compatibility** or deprecation plan
3. **Client update** to match new contract
4. **Updated API_CONTRACT_BASELINE.md**
5. **Explicit approval** before implementation

---

## Future Improvements (Post-v0.1)

If new endpoints are needed:
1. Define in new ADR (e.g., ADR-002-DASHBOARD-API)
2. Document request/response shapes
3. Specify auth requirements
4. Update this contract document
5. Add to client gradually with feature flags
6. Remove old/deprecated endpoints carefully

---

## References

- **Architecture Guardrails**: [docs/ARCHITECTURE_GUARDRAILS.md](ARCHITECTURE_GUARDRAILS.md)
- **ADR-001**: [docs/adr/ADR-001-UI-SOURCE-OF-TRUTH.md](adr/ADR-001-UI-SOURCE-OF-TRUTH.md)
- **Baseline Report**: [docs/EXECUTION_BASELINE_REPORT.md](EXECUTION_BASELINE_REPORT.md)
- **UI Unification**: [docs/UI_UNIFICATION_REPORT.md](UI_UNIFICATION_REPORT.md)
