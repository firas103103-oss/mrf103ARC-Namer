# ARC Backend API

A REST API backend for the **Mr.F Enterprise OS / ARC Virtual Office** orchestration system. This API serves as the bridge between n8n workflows and the ARC agent ecosystem.

## Overview

This backend provides endpoints for:
- Ingesting agent events from n8n workflows
- Handling CEO report reminders
- Generating executive summaries
- Managing governance notifications (Harvey Specter)
- Broadcasting rule updates to agents
- Processing high-priority notifications

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and configure your secrets:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `ARC_BACKEND_SECRET`: Your API authentication key (must match n8n configuration)
- `SUPABASE_URL`: Your Supabase project URL (optional for MVP)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (optional for MVP)

### 3. Run the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

## Authentication

All `/api/arc/*` endpoints require the `X-ARC-SECRET` header:

```
X-ARC-SECRET: your-secret-key-here
```

Configure the same secret in your n8n HTTP Request nodes.

### Security Notes

- **Production Requirement:** In production (`NODE_ENV=production`), the `ARC_BACKEND_SECRET` environment variable **must** be set. The API will return a 500 error if it's missing.
- **Development Mode:** In development, if `ARC_BACKEND_SECRET` is not set, requests are allowed (for testing convenience). A warning is logged.
- **Sensitive Data:** Request bodies are not fully logged to prevent accidental exposure of sensitive data. Only safe metadata (event_id, agent_id, type, etc.) is logged.

## API Endpoints

### Health Check (No Auth Required)

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "ok",
  "service": "ARC Backend API",
  "timestamp": "2025-01-01T10:00:00.000Z"
}
```

---

### 1. Agent Events Ingest

**Endpoint:** `POST /api/arc/agent-events`

Used by n8n node: "Forward to Backend API"

```bash
curl -X POST http://localhost:5000/api/arc/agent-events \
  -H "Content-Type: application/json" \
  -H "X-ARC-SECRET: your-secret-key-here" \
  -d '{
    "event_id": "evt-12345",
    "agent_id": "ARC-L1-BUSINESS-CEO-0001",
    "type": "message",
    "payload": {
      "content": "Daily status update"
    },
    "created_at": "2025-01-01T10:00:00Z"
  }'
```

Response:
```json
{
  "status": "ok"
}
```

**Event Types:**
- `message` - General agent messages
- `report` - Formal reports (daily, weekly)
- `heartbeat` - Agent health checks
- `rule_update` - Rule change notifications

---

### 2. CEO Reminders

**Endpoint:** `POST /api/arc/ceo-reminders`

Used by n8n node: "Send Reminder to CEOs"

```bash
curl -X POST http://localhost:5000/api/arc/ceo-reminders \
  -H "Content-Type: application/json" \
  -H "X-ARC-SECRET: your-secret-key-here" \
  -d '{
    "date": "2025-01-01",
    "missing_ceos": [
      "ARC-L1-BUSINESS-CEO-0001",
      "ARC-L1-RESEARCH-CEO-0002"
    ]
  }'
```

Response:
```json
{
  "status": "ok"
}
```

---

### 3. Executive Summary Generator

**Endpoint:** `POST /api/arc/executive-summary`

Used by n8n node: "Generate Executive Summary"

```bash
curl -X POST http://localhost:5000/api/arc/executive-summary \
  -H "Content-Type: application/json" \
  -H "X-ARC-SECRET: your-secret-key-here" \
  -d '{
    "date": "2025-01-01",
    "reports": [
      {
        "ceo_id": "ARC-L1-BUSINESS-CEO-0001",
        "text": "Revenue up 15% this quarter. New client onboarded."
      },
      {
        "ceo_id": "ARC-L1-RESEARCH-CEO-0002",
        "text": "R&D milestone achieved. Patent filed for new tech."
      }
    ]
  }'
```

Response:
```json
{
  "summary_text": "Daily Executive Summary for Mr.F - 2025-01-01\n\nTotal Reports Received: 2\n\n--- CEO Reports ---\n[ARC-L1-BUSINESS-CEO-0001]: Revenue up 15%...\n\n--- End of Summary ---",
  "profit_score": 0.7,
  "risk_score": 0.3,
  "top_decisions": [
    "Continue current strategic initiatives",
    "Review flagged items from CEO reports",
    "Schedule follow-up with relevant department heads"
  ]
}
```

**Note:** MVP returns a concatenated summary. LLM integration planned for smart summarization.

---

### 4. Governance Notifications (Harvey Specter)

**Endpoint:** `POST /api/arc/governance/notify`

Used by n8n node: "Notify Harvey Specter (Governance)"

```bash
curl -X POST http://localhost:5000/api/arc/governance/notify \
  -H "Content-Type: application/json" \
  -H "X-ARC-SECRET: your-secret-key-here" \
  -d '{
    "rule_id": "R-2025-0001",
    "status": "PROPOSED",
    "title": "New X-BIO policy",
    "summary": "Policy governing cross-departmental biological research initiatives",
    "proposer_agent_id": "ARC-L1-RESEARCH-CEO-0002"
  }'
```

Response:
```json
{
  "status": "ok"
}
```

**Status Values:**
- `PROPOSED` - Rule awaiting review
- `REVIEWED` - Rule has been reviewed
- `ACTIVE` - Rule is now active

---

### 5. Rule Broadcast

**Endpoint:** `POST /api/arc/rules/broadcast`

Used by n8n node: "Broadcast Rule to All Agents"

```bash
curl -X POST http://localhost:5000/api/arc/rules/broadcast \
  -H "Content-Type: application/json" \
  -H "X-ARC-SECRET: your-secret-key-here" \
  -d '{
    "rule_id": "R-2025-0001",
    "effective_at": "2025-01-02T00:00:00Z",
    "status": "ACTIVE",
    "title": "New X-BIO policy"
  }'
```

Response:
```json
{
  "status": "ok"
}
```

---

### 6. High Priority Notification

**Endpoint:** `POST /api/arc/notifications/high`

Used by n8n node: "Send High Priority Notification"

```bash
curl -X POST http://localhost:5000/api/arc/notifications/high \
  -H "Content-Type: application/json" \
  -H "X-ARC-SECRET: your-secret-key-here" \
  -d '{
    "source_agent_id": "ARC-L1-FIN-CEO-0001",
    "severity": "HIGH",
    "title": "Liquidity issue detected",
    "body": "Cash reserves below threshold. Immediate action required.",
    "context": {
      "current_reserves": 50000,
      "threshold": 100000
    }
  }'
```

Response:
```json
{
  "status": "ok"
}
```

**Severity Levels:**
- `HIGH` - Critical, requires immediate attention
- `WARNING` - Important, but not urgent

---

## Error Responses

### Authentication Error (401)

```json
{
  "status": "error",
  "message": "Unauthorized: Invalid or missing X-ARC-SECRET header"
}
```

### Validation Error (400)

```json
{
  "status": "error",
  "message": "Validation error",
  "details": [
    {
      "path": ["agent_id"],
      "message": "Required"
    }
  ]
}
```

### Server Error (500)

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## n8n Configuration

### HTTP Request Node Settings

For each endpoint in n8n, configure the HTTP Request node:

1. **Method:** POST
2. **URL:** `https://your-backend-url.com/api/arc/{endpoint}`
3. **Authentication:** None (handled via header)
4. **Headers:**
   - `Content-Type`: `application/json`
   - `X-ARC-SECRET`: `{{$env.ARC_BACKEND_SECRET}}`
5. **Body Content Type:** JSON
6. **Body:** (as specified in endpoint documentation)

---

## Data Storage

### MVP Implementation

The current MVP uses in-memory storage. Data is logged to console and stored in memory maps. This is suitable for development and testing.

### Production (Planned)

For production, the backend will integrate with Supabase to:
- Read from existing tables (`arc_message_archive`, `arc_agent_states`, etc.)
- Write to tracking tables (`arc_backend_events`, `arc_governance_notifications`, etc.)

---

## Future Enhancements

- [ ] LLM integration for smart executive summaries
- [ ] Supabase persistence layer
- [ ] Email/WhatsApp notifications for CEO reminders
- [ ] Agent config push for rule broadcasts
- [ ] Dashboard API endpoints for viewing data

---

## License

Proprietary - Mr.F Enterprise OS
