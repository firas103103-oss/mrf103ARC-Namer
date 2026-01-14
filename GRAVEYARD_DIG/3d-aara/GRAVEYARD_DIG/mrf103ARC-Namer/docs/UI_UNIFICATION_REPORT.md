# UI Unification Report

Date: 2026-01-02

## Goal
Establish `client/` as the single source of truth for the frontend, while safely archiving the legacy/duplicate UI folder without refactoring or deleting content.

## Active UI (Single Source of Truth)
- **Active Vite root:** `client/`
- **Runtime entry:** `client/index.html` → `/src/main.tsx`

### Evidence
- `vite.config.ts` sets `root` to `client/`.
- `server/vite.ts` serves `client/index.html` in development.

## Archived UI
- `archives/ui/📄 client/` (moved via `git mv`)

## Verification — Phase 1 (Read-Only)
### Vite root
- PASS: Vite root is `client/`.

### Runtime dependency on legacy UI
- PASS: No runtime imports/paths referencing the legacy UI folder were found in code.

## Verification — Phase 4 (After Archiving)
### `npm run dev`
- PASS: Dev server starts and serves HTML successfully.
- PASS: Served HTML includes Vite client (`/@vite/client`) and app entry (`/src/main.tsx`).

### Notes
- Non-fatal warning observed during dev start: Supabase env not configured (missing `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`).

## Guardrails
- `archives/ui/README.md` added to document:
  - Why the archive exists
  - That it is READ-ONLY
  - That `client/` is the only active UI
  - How to revert the archive (move back)

## Outcome
- One active UI: `client/`
- Archived snapshot: `archives/ui/📄 client/`
- No build configuration behavior changes
- No UI logic refactoring

## Final Status (Operator Dashboard Wiring)

The active UI in `client/` now includes:
- **Auth gate (cookie-only):** operator login screen that uses `/api/auth/login` and `/api/auth/user`.
- **Operator dashboard wiring:** reads secured server endpoints (no Supabase access from the browser).
- **Realtime feed:** connects to server WebSocket at `/realtime` and surfaces `new_activity` events.
- **Command/Execution console:** sends commands to `/api/call_mrf_brain` and displays responses.

No additional frontend roots were introduced; `client/` remains the single source of truth.
