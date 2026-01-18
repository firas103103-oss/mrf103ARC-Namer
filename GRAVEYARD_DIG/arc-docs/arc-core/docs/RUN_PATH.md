# ARC Run Path (Logical)

## Entry Point
arc-interface

## Flow
1. arc-interface sends intent
2. arc-core validates + decides
3. arc-core calls arc-ops if execution needed
4. arc-ops executes and reports back
5. arc-core updates state
6. arc-interface renders response

## Telemetry
arc-firmware → arc-core → decisions

## Meta Context
arc-meta provides identity/context (read-only)

## Notes
- No direct execution from interface
- No ops without core command