# ADR-001: UI Source of Truth

**Date**: 2026-01-01  
**Status**: ACCEPTED  
**Deciders**: ARC Team

---

## Title
Establish `client/` as the Single Source of Truth for Frontend

---

## Context

### Problem
The ARC repository historically contained multiple UI directories, creating ambiguity about which frontend is active at runtime:
- Multiple UI variants existed in the codebase
- Unclear which UI should be updated, tested, or deployed
- Risk of building/serving stale or incorrect UI
- Developers could accidentally import from non-active UI folders
- Maintenance burden increased with each duplicate UI

### Why This Matters
UI is a critical architectural layer. Duplication erodes confidence in the system's intent and creates:
- **Maintenance risk**: Changes may not propagate to all variants
- **Testing uncertainty**: Which UI is actually being verified?
- **Deployment ambiguity**: Which UI is production-ready?
- **Developer confusion**: Which folder should I edit?

### Previous State
- `📄 client/` (top-level, emoji-named client folder) was an archived variant
- `client/` (canonical frontend) was the actual Vite root
- No governance prevented creating new UIs or maintaining duplicates

---

## Decision

**`client/` is the ONLY executable frontend for ARC.**

### Core Rules
1. **Single Active UI**: All runtime frontend code lives exclusively in `client/`
2. **No Parallel UIs**: No other UI variant may execute in production or development
3. **Archived UIs are READ-ONLY**: Variants under `archives/ui/` are preserved snapshots only
   - No imports from archived UIs
   - No runtime dependency on archived UIs
   - Restoration is possible but requires explicit ADR + governance
4. **Governance**: Creating a new UI requires:
   - Explicit Architectural Decision Record
   - Review and approval
   - Deprecation plan for previous UI
   - Commitment to maintenance

### Implementation
- `client/` is configured as the Vite root in `vite.config.ts`
- `client/index.html` is the entry point served in development
- Build output targets `client/` only
- `archives/ui/📄 client/` preserves the legacy UI as a read-only snapshot

---

## Consequences

### Positive
✅ **Clarity**: One unambiguous frontend  
✅ **Reduced risk**: No accidental references to stale UI code  
✅ **Easier maintenance**: Changes update a single source  
✅ **Faster CI/CD**: Fewer paths to validate  
✅ **Scalability**: Adding UI variants requires governance (prevents accidental growth)  

### Constraints
⚠️ **No quick UI swaps**: Switching frameworks requires formal ADR  
⚠️ **Centralized responsibility**: All UI changes flow through `client/`  
⚠️ **Legacy preservation**: Archived UIs must be stored and documented  

### How to Reverse (if needed)
If a new UI is approved via ADR and governance:
1. Create new UI in `client-new/` (or another directory)
2. Test and validate in parallel with current UI
3. Update all configuration and CI/CD
4. Deprecate and archive `client/` only after full migration
5. Rename new UI to `client/`

This ensures a controlled transition, not a risky swap.

---

## Compliance

### Documentation
- `docs/ARCHITECTURE_GUARDRAILS.md` enforces these rules
- `archives/ui/README.md` marks archived UI as read-only
- This ADR is the authority on frontend decisions

### Verification
- Build configuration (`vite.config.ts`) points to `client/` only
- No runtime imports reference `archives/ui/`
- Scripts do not reference archived UI paths
- CI/CD validates `client/` only

### Governance
Any request to:
- Create a new UI
- Restore an archived UI
- Change the frontend framework
- Maintain multiple active UIs

Must include:
- New ADR explaining the change
- Deprecation/migration plan
- Explicit approval from decision-makers
- Updated verification checklist

---

## References
- **Unification Report**: [UI_UNIFICATION_REPORT.md](../UI_UNIFICATION_REPORT.md)
- **Architecture Guardrails**: [ARCHITECTURE_GUARDRAILS.md](../ARCHITECTURE_GUARDRAILS.md)
- **Archived UI Documentation**: [archives/ui/README.md](../../archives/ui/README.md)
