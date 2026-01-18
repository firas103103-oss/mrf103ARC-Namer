# ARC v0.2 Roadmap

**Status**: PROPOSED (Governance Phase)  
**Baseline**: v0.1.x frozen and immutable  
**Target**: Scalable, multi-capability architecture with external integrations  
**Timeline**: v0.2 → v0.2.1 → v0.3 (future phases)

---

## v0.2.0 Phase (Current: Governance + Scaffolding)

### Goals
- Define architecture evolution path
- Create governance framework (ADRs)
- Establish contracts for new capabilities
- Zero breaking changes to v0.1.x

### Deliverables

#### ✅ Complete (This Session)
- ADR-002: Voice Synthesis Layer (spec)
- ADR-003: Multi-Agent Routing Core (spec)
- ADR-004: External Orchestration Contract (spec)
- `/api/voice/synthesize` endpoint (skeleton)
- `/api/think` endpoint infrastructure (skeletal routing)
- `/webhooks/n8n` and `/webhooks/esp32` (acknowledgment stubs)
- Agent Registry (`server/agents/registry.ts`)
- API Contract v0.2 documentation
- v0.2 Roadmap (this document)

#### ⏳ Deferred to v0.2.1+
- Full ElevenLabs voice synthesis implementation
- Intelligent message routing (beyond Mr.F default)
- n8n workflow event processing
- ESP32 sensor data storage & alerts
- Voice UI integration in client/

### Non-Goals (v0.2.0)
- Client-side changes (locked by ADR-001)
- Breaking API changes
- Production voice quality optimization
- Complex orchestration logic

---

## v0.2.1 Phase (Future: Core Implementation)

### Focus: Voice Quality & Agent Infrastructure

**Voice Synthesis (ADR-002)**
- [ ] Full ElevenLabs integration
- [ ] Voice caching strategy
- [ ] Error handling & fallbacks
- [ ] Latency optimization

**Multi-Agent Framework (ADR-003)**
- [ ] Intelligent routing (content-based)
- [ ] Agent chaining support
- [ ] Context passing between agents
- [ ] Performance monitoring

**n8n Integration (ADR-004)**
- [ ] Webhook signature verification
- [ ] Workflow event parsing
- [ ] ARC action triggering
- [ ] Failure handling & retry logic

### Acceptance Criteria
- All endpoints return correct responses
- No v0.1.x regression
- Load testing pass (1000 req/min voice)
- Integration tests with n8n test instance

---

## v0.2.2 Phase (Future: ESP32 & Automation)

### Focus: Device Integration & Intelligence

**ESP32 Bio Sentinel (ADR-004)**
- [ ] Device registration system
- [ ] Sensor data storage
- [ ] Alert triggering (heart rate anomalies, etc.)
- [ ] Command delivery to devices

**Automation Engine**
- [ ] Workflow scheduling
- [ ] Condition-based actions
- [ ] Multi-step orchestration
- [ ] Audit logging

### Acceptance Criteria
- Devices successfully stream data
- Alerts trigger correctly
- Workflows execute on schedule
- No data loss

---

## v0.3 Phase (Future: UI Evolution)

### Focus: Client-Side Enhancements (Requires New ADR)

**Voice Output in UI**
- [ ] New ADR: Voice UI Integration
- [ ] Dashboard voice controls
- [ ] Audio playback component
- [ ] Voice history visualization

**Agent Selection UI**
- [ ] Agent picker component
- [ ] Capability display
- [ ] Routing preference UI

**Real-time Sensor Display**
- [ ] Bio Sentinel dashboard
- [ ] Live data graphs
- [ ] Alert notification system

---

## Architecture Evolution Map

```
v0.1.x (Stable)
  ├─ Single UI (client/)
  ├─ Single Agent (Mr.F)
  └─ Session Auth

v0.2.0 (Governance)
  ├─ ADRs defined
  ├─ Endpoints created (stubbed)
  ├─ Agent Registry
  └─ Webhook contracts

v0.2.1 (Voice + n8n)
  ├─ Voice synthesis working
  ├─ Intelligent routing
  └─ n8n webhook processing

v0.2.2 (Devices + Automation)
  ├─ ESP32 integration
  ├─ Sensor data storage
  └─ Automation execution

v0.3 (UI + Expansion)
  ├─ Voice UI components
  ├─ Multi-agent UI
  └─ Sensor dashboard
```

---

## Risk Mitigation

### Risks
- **Breaking v0.1.x**: Mitigated by frozen API contract
- **Supabase overload**: Mitigated by backend proxy pattern (no direct client access)
- **Agent routing complexity**: Mitigated by simple defaults (Mr.F) + gradual enhancement
- **External system failures**: Mitigated by graceful fallbacks + webhook retry logic

### Safeguards
- ✅ All changes require ADR approval
- ✅ Backward compatibility tests before deployment
- ✅ Rate limiting on all new endpoints
- ✅ Fallback behaviors for external APIs

---

## Success Metrics (v0.2 Complete)

- ✅ Zero breaking changes to v0.1.x endpoints
- ✅ All 4 new endpoints accessible
- ✅ No runtime errors (`npm run dev`)
- ✅ All ADRs in PROPOSED state
- ✅ Documentation complete
- ✅ Git commits clean & organized

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-01 | v0.2 scaffolding phase | Establish governance before implementation |
| 2026-01-01 | Voice as backend-only proxy | Maintain security, avoid client complexity |
| 2026-01-01 | Agent Registry pattern | Enable future multi-agent scenarios |
| 2026-01-01 | Webhook contracts (spec only) | Define external integration boundary |

---

## Links

- v0.1 Closure: [ARC_FINAL_STATE.md](ARC_FINAL_STATE.md)
- v0.1 Guarantee: [ADR-001-UI-SOURCE-OF-TRUTH.md](adr/ADR-001-UI-SOURCE-OF-TRUTH.md)
- v0.2 ADRs: [ADR-002](adr/ADR-002-VOICE-LAYER.md), [ADR-003](adr/ADR-003-MULTI-AGENT-ROUTING.md), [ADR-004](adr/ADR-004-EXTERNAL-ORCHESTRATION.md)
- v0.2 API: [API_CONTRACT_v0.2.md](API_CONTRACT_v0.2.md)
