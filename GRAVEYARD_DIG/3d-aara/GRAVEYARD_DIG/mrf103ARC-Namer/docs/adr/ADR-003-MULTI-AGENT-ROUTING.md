# ADR-003: Multi-Agent Routing Core (v0.2)

**Status**: PROPOSED  
**Date**: January 1, 2026  
**Scope**: v0.2 Evolution  
**Author**: ARC Team  

## Context

ARC v0.1.x is single-agent (Mr.F only). To support future extensibility with multiple specialized agents (voice, knowledge, automation, etc.), we need a **server-side agent registry and intelligent routing system**.

Current state:
- One endpoint: `/api/call_mrf_brain` (Mr.F only)
- No agent abstraction
- No routing logic
- OpenAI hardcoded

## Decision

Implement **Agent Registry** (server-only, no client changes):

### Core Components

#### 1. Agent Registry Definition

```typescript
interface Agent {
  id: string              // unique identifier
  name: string            // display name
  role: string            // "chat" | "voice" | "knowledge" | "automation"
  capabilities: string[]  // ["openai", "supabase", "elevenlabs"]
  model?: string          // optional model override
  endpoint: string        // internal routing path
  isDefault: boolean      // fallback agent
  status: "active" | "beta" | "maintenance"
}

// Registry (server/agents/registry.ts)
export const AGENTS: Record<string, Agent> = {
  "mrf": {
    id: "mrf",
    name: "Mr.F",
    role: "chat",
    capabilities: ["openai", "memory"],
    model: "gpt-4o-mini",
    endpoint: "/agents/mrf",
    isDefault: true,
    status: "active"
  },
  // Future agents added here
}
```

#### 2. Routing Logic

```typescript
interface Message {
  text: string
  agentId?: string  // optional override
  context?: Record<string, unknown>
}

function routeToAgent(msg: Message): Agent {
  // If agent specified, use it
  if (msg.agentId && AGENTS[msg.agentId]) {
    return AGENTS[msg.agentId]
  }
  
  // Intelligent routing based on message content (future)
  // For now: default to Mr.F
  return AGENTS["mrf"]
}
```

#### 3. Unified Endpoint (v0.2)

```
POST /api/think
Authorization: Bearer <session>
Content-Type: application/json

Request:
{
  "message": "What is the weather?",
  "agentId": "mrf"  // optional, defaults to intelligent routing
}

Response:
{
  "agentId": "mrf",
  "response": "...",
  "metadata": { ... }
}
```

### Backward Compatibility

- `/api/call_mrf_brain` remains unchanged (v0.1 guarantee)
- `/api/think` is NEW endpoint (v0.2)
- Both route to same Mr.F agent internally
- No client changes required

## Consequences

### Positive
- ✅ Extensible agent framework
- ✅ Supports future multi-agent scenarios
- ✅ Maintains v0.1.x compatibility
- ✅ Server-side only (no client exposure)

### Negative
- ⚠️ Adds routing layer complexity
- ⚠️ Requires agent registry maintenance

## Non-Goals (v0.2)

- Intelligent routing based on message content
- Agent chaining/collaboration
- Dynamic agent loading
- UI agent selection

These are v0.2.1+ features via future ADRs.

## Dependencies

- TypeScript (already in use)
- No new npm packages

## Links

- Related: ADR-001, ADR-002
- Blocks: ADR-005 (multi-agent UI)
