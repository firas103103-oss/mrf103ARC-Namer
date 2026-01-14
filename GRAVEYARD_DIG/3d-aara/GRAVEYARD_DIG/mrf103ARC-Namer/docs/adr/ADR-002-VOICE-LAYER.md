# ADR-002: Voice Synthesis Layer (v0.2)

**Status**: PROPOSED  
**Date**: January 1, 2026  
**Scope**: v0.2 Evolution  
**Author**: ARC Team  

## Context

ARC v0.1.x provides text-based chat via Mr.F (OpenAI integration). To enable voice-first experiences and accessibility, we need to add **backend-only voice synthesis** without exposing client-side complexity.

Current state:
- ElevenLabs API key configured in .env
- No voice synthesis endpoints
- Voice stubs exist in codebase but not wired

## Decision

Implement `/api/voice/synthesize` endpoint (backend-only):
- **Input**: Text string + voice parameters
- **Output**: Audio stream (MP3/WAV)
- **Transport**: HTTP POST (backend proxy pattern)
- **Auth**: Session-based (like all protected endpoints)
- **Rate Limit**: Included in existing 120 req/min per IP
- **Client Integration**: Deferred (v0.2.1+)

### Endpoint Specification

```
POST /api/voice/synthesize
Authorization: Bearer <session>
Content-Type: application/json

Request Body:
{
  "text": "Hello, this is Mr.F",
  "voice_id": "default",
  "model": "eleven_monolingual_v1"
}

Response:
- 200: audio/mpeg (MP3 binary stream)
- 400: Invalid text or parameters
- 401: Unauthorized
- 429: Rate limited
- 503: ElevenLabs unavailable
```

### Implementation Pattern

- Call ElevenLabs API from server (never client)
- Stream response directly to requester
- Fail gracefully if ELEVENLABS_API_KEY missing
- Log all voice synthesis requests for analytics

### Non-Goals (v0.2)

- WebRTC real-time voice
- Voice input/transcription
- Streaming synthesis
- UI integration

These are deferred to v0.2.1+ via future ADRs.

## Consequences

### Positive
- ✅ Enables voice output for accessibility
- ✅ Maintains security (no client exposure)
- ✅ Follows existing backend proxy pattern
- ✅ No breaking changes to v0.1.x

### Negative
- ⚠️ Additional API call latency (ElevenLabs network)
- ⚠️ Increased bandwidth usage for audio streams
- ⚠️ Requires ElevenLabs quota/credits

### Mitigation
- Cache frequently used sentences
- Implement client-side audio caching (future)
- Monitor ElevenLabs quota usage

## Dependencies

- ElevenLabs API (already configured)
- TypeScript types for audio endpoints
- No new npm packages required

## Rollback Plan

Remove POST /api/voice/synthesize endpoint.
No database migrations needed (stateless endpoint).

## Links

- Related: ADR-001 (UI source of truth)
- Blocked by: None
- Blocks: ADR-005 (Voice UI integration - future)
