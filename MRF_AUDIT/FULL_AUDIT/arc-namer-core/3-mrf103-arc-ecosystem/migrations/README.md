# MRF103 ARC Ecosystem - Database Migrations

This directory contains all database migrations for the ARC Ecosystem platform.

## Migration Strategy

We use **Drizzle ORM** for database management with PostgreSQL/Supabase.

## Running Migrations

```bash
# Push schema changes
pnpm db:push

# Generate migration files
pnpm db:generate

# Run migrations
pnpm db:migrate
```

## Schema Overview

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts and profiles |
| `agents` | AI agent configurations |
| `agent_metrics` | Agent performance metrics |
| `projects` | Project definitions |
| `tasks` | Task queue and history |
| `sessions` | User sessions |

### BioSentinel Tables

| Table | Description |
|-------|-------------|
| `devices` | IoT device registry |
| `sensor_readings` | Real-time sensor data |
| `health_alerts` | Health anomaly alerts |
| `device_config` | Device configurations |

### System Tables

| Table | Description |
|-------|-------------|
| `audit_log` | System audit trail |
| `api_keys` | API key management |
| `rate_limits` | Rate limiting state |
| `cache_entries` | Persistent cache |

## Initial Schema

See `0001_initial_schema.sql` for the complete initial database setup.

## Backup & Recovery

```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore backup
psql $DATABASE_URL < backup_YYYYMMDD.sql
```
