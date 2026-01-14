# Architecture Guardrails

This document defines architectural constraints and decision records that bind the evolution of the ARC system.

---

## Frontend Source of Truth

### Decision
`client/` is the **ONLY executable frontend** for the ARC system. This is non-negotiable.

### Constraints
- **Single Active UI**: `client/` is the single source of truth for all runtime frontend code.
- **No Parallel UIs**: No other UI variant is permitted to execute in production or development.
- **Archived UIs are READ-ONLY**: Any UI folder under `archives/` is a preserved snapshot and must never be imported, executed, or depended upon at runtime.
- **External UI references**: Documentation, build configurations, and deployment scripts must only reference `client/`.

### Creating a New UI
If a new UI design or framework is required, it **MUST**:
1. Require an explicit Architectural Decision Record (ADR)
2. Go through governance review
3. Include a deprecation plan for the previous UI
4. Be approved before any code is written

This prevents accidental duplication and ensures clear ownership of UI decisions.

### Verification
- Build tools (Vite, tsconfig.json) reference `client/` only
- No runtime imports reference `archives/ui/`
- Deployment configurations point to `client/` only
- CI/CD pipelines build and serve `client/` exclusively

---

## References
- **ADR-001**: [ADR-001-UI-SOURCE-OF-TRUTH.md](adr/ADR-001-UI-SOURCE-OF-TRUTH.md)
- **UI Unification Report**: [UI_UNIFICATION_REPORT.md](UI_UNIFICATION_REPORT.md)
- **Archived UI Documentation**: [archives/ui/README.md](../archives/ui/README.md)
