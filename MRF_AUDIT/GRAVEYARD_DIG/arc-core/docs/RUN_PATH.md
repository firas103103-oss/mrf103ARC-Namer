# Run Path Documentation

## Overview
This document specifies the valid run paths and execution flow within the `arc-core` repository.

## Key Guidelines
- `arc-core` must act as the primary decision authority.
- Execution must always start and end within the `arc-core` boundary.
- Dependencies should conform to the contracts specified in `ARCHITECTURE_CONTRACTS.md`.

## Dependencies

Interactions with the following repositories are allowed:
- **arc-interface**: Facilitates external communication.
- **arc-ops**: Handles operations-specific tasks.
- **arc-shared**: Provides shared utilities and common configurations.
- **arc-firmware**: Supports hardware-level interactions.
- **arc-meta**: Oversees meta-orchestration tasks.

## Forbidden Practices
- Circular dependency chains.
- External execution paths originating outside `arc-core`.

Note: Refer to `ARCHITECTURE_CONTRACTS.md` for complete architectural guidelines.