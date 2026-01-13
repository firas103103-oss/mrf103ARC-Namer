# Architecture Contracts

## Overview

The `arc-core` repository serves as the central decision-making authority in the ARC system. This document outlines the architectural contracts and ensures consistent implementation across the system.

## Core Responsibilities
- Act as the single decision authority for system behavior.
- Define the boundaries and interactions between other repositories.
- Ensure architecture consistency without hardcoding execution logic in non-core repositories.

## Dependencies

The following repositories can interact with `arc-core`:
- **arc-interface**: For communication interfaces.
- **arc-ops**: For operational management logic.
- **arc-shared**: For shared utilities and configurations.
- **arc-firmware**: For interactions with hardware-level firmware.
- **arc-meta**: For meta-framework and orchestration.

## Allowed Relationships
1. Outgoing dependencies are limited to the repositories listed above.
2. Circular dependencies are strictly forbidden.
3. Execution logic must always reside in `arc-core`.

## Forbidden Practices
- Creating execution logic outside `arc-core`.
- Introducing new dependencies without explicit approval.