# ADR-004: External System Orchestration Contract (v0.2)

**Status**: PROPOSED  
**Date**: January 1, 2026  
**Scope**: v0.2 Evolution  
**Author**: ARC Team  

## Context

ARC needs to integrate with external systems:
- **n8n**: Low-code automation workflows
- **ESP32**: Bio Sentinel firmware (embedded sensor network)

Currently:
- No formal contract between ARC and external systems
- Webhook capability exists but undocumented
- No specification for n8n or ESP32 integration

## Decision

Define **External System Orchestration Contract** (specification only, no implementation in v0.2):

### 1. n8n Workflow Integration

#### Webhook Inbound (n8n → ARC)

```
POST /webhooks/n8n
Content-Type: application/json
X-N8N-Signature: <HMAC-SHA256>

Payload:
{
  "workflowId": "wf_001",
  "eventType": "workflow.completed" | "workflow.error",
  "data": { /* workflow output */ },
  "timestamp": "2026-01-01T00:00:00Z"
}

Response:
{
  "status": "received",
  "acknowledgement": "ack_123"
}
```

#### Webhook Outbound (ARC → n8n)

```
POST <n8n-webhook-url>
Content-Type: application/json
Authorization: Bearer <n8n-token>

Payload:
{
  "action": "execute_workflow",
  "workflowId": "wf_001",
  "parameters": { ... },
  "source": "arc-system"
}

Expected Response:
{
  "status": "queued" | "executing" | "completed",
  "executionId": "exec_123"
}
```

#### Configuration

```env
N8N_WEBHOOK_URL=https://n8n.example.com/webhook/arc
N8N_AUTH_TOKEN=<secret>
N8N_SIGNATURE_SECRET=<HMAC-key>
```

### 2. ESP32 Bio Sentinel Integration

#### Inbound: Device Events

```
POST /webhooks/esp32
Content-Type: application/json
Authorization: Bearer <device-token>

Payload:
{
  "deviceId": "esp32_001",
  "sensorType": "heart_rate" | "body_temp" | "blood_pressure",
  "reading": 72,
  "timestamp": "2026-01-01T00:00:00Z",
  "metadata": { "location": "wrist" }
}

Response:
{
  "status": "stored",
  "alerting": false | true
}
```

#### Outbound: Control Commands

```
POST <esp32-endpoint>/api/command
Content-Type: application/json
Authorization: Bearer <device-token>

Payload:
{
  "command": "calibrate" | "sleep" | "alert_mode",
  "parameters": { ... }
}

Expected Response:
{
  "status": "acknowledged",
  "result": "calibration_started"
}
```

#### Configuration

```env
ESP32_DEVICES=[
  {
    "id": "esp32_001",
    "endpoint": "http://192.168.x.x:8080",
    "token": "<device-secret>"
  }
]
```

### 3. Message Queue Contract (Optional, v0.2.1+)

```
POST /queue/publish
{
  "channel": "sensor_data" | "workflow_events",
  "message": { ... },
  "priority": "high" | "normal" | "low"
}

// Internally: Bull/Redis for async processing
```

## Security Model

### Authentication
- Each webhook requires Bearer token (environment variable)
- HMAC-SHA256 signature verification for n8n
- Device tokens for ESP32 authentication

### Rate Limiting
- Webhook endpoints excluded from 120 req/min general limit
- Per-source rate limiting: 1000 req/min per webhook
- Backoff strategy for failed deliveries

### Data Validation
- JSON schema validation for all payloads
- Size limits: 10MB max per webhook
- Timeout: 30s for webhook processing

## Implementation Status (v0.2)

- ✅ **Specification**: Complete (this ADR)
- ❌ **Implementation**: Deferred to v0.2.1
- ✅ **Webhook skeleton**: `/webhooks/*` endpoints (stub)
- ❌ **n8n integration**: Not implemented
- ❌ **ESP32 integration**: Not implemented

## Non-Goals (v0.2)

- Real n8n workflow execution
- Real ESP32 device communication
- Message queue implementation
- Advanced orchestration logic

## Consequences

### Positive
- ✅ Clear contract for external integrations
- ✅ Scalable architecture (webhook-based)
- ✅ Async processing ready (for future)
- ✅ Security model defined upfront

### Negative
- ⚠️ Adds endpoint complexity
- ⚠️ Requires external system cooperation

## Rollback Plan

Remove webhook endpoints in `/webhooks/*` folder.
No database changes (stateless specification).

## Links

- Related: ADR-001, ADR-002, ADR-003
- Extends: ARCHITECTURE_GUARDRAILS.md
- Blocked by: None
- Blocks: v0.2.1+ implementation ADRs
