# ACRI — Active Challenge–Response Instinct for XBIO / ARC BioSentinel

## Background
XBIO uses multi-sensor cross-verification (gas + radar + thermal/visual) with low-power gating and hardware self-heal. (SA 1020258841)

## Problem
Cross-verification reduces false positives, but does not reliably prevent:
- sensor replay attacks (feeding recorded "normal" data),
- spoofed anomalies,
- man-in-the-middle manipulation in isolated deployments.

## Solution
Introduce Active Challenge–Response Instinct (ACRI):
1) ARC generates a short Probe Script (challenge) triggered only on suspected anomaly.
2) Device executes micro-stimulus sequence (e.g., heater profile sweep / timing jitter / micro-sampling cadence).
3) Device returns a Stimulus–Response Signature (SRS) derived from real-time physics.
4) ARC validates SRS; only then is the threat allowed to escalate to final alarm.

## Novelty
- Uses active physical interrogation rather than passive sensing.
- Probe script is unpredictable (nonce-based), making replay/spoof impractical.
- Integrates with the existing "digitized instinct" ladder without breaking low-power design.
- Works without sending raw images (privacy preserved).

## MVP
- Simulated probe generator + signature verifier in ARC.
- Store probe_id, nonce, response_signature into ledger/tables.
