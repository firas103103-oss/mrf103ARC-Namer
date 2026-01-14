# ARC Architecture Contracts

## Central Rule
arc-core is the only decision-making unit. All other axes interact through it.

---

## Interface → Core
**Direction:** arc-interface → arc-core  
**Purpose:** User intent delivery

**Allowed:**
- Structured requests (JSON / HTTP / events)
- Action identifiers

**Forbidden:**
- Business logic
- Workflow definitions
- Direct DB access

---

## Core ↔ Shared
**Direction:** arc-core ↔ arc-shared  
**Purpose:** Pure dependencies

**Allowed:**
- Types
- Schemas
- Utilities

**Forbidden:**
- Side effects
- Runtime logic in shared

---

## Core → Ops
**Direction:** arc-core → arc-ops  
**Purpose:** Execution commands

**Allowed:**
- Deploy
- Build
- Verify
- Probe

**Forbidden:**
- Decision logic in ops
- UI interaction

---

## Firmware → Core
**Direction:** arc-firmware → arc-core  
**Purpose:** Telemetry ingestion

**Allowed:**
- Raw signals
- Device state

**Forbidden:**
- Direct UI or ops access

---

## Meta → All (Read-Only)
**Purpose:** Identity / context

**Forbidden:**
- Runtime logic
- Execution

---

## Docs
**Purpose:** Human reference only  
No runtime dependency.
