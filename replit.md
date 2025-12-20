# ARC Intelligence Framework v2.0

## Overview

This is **ARC Intelligence Framework v2.0** - a complete enterprise intelligence operating system integrating:
- **Mr.F Brain**: Executive AI orchestrator with voice capabilities
- **Multi-Agent System**: 6 specialized AI agents (Mr.F, L0-Ops, L0-Comms, L0-Intel, Dr. Maya Quest, Jordan Spark)
- **Voice Layer**: ElevenLabs text-to-speech integration with per-agent voice IDs
- **Real-time Dashboard**: Supabase-powered monitoring of commands, events, and n8n callbacks
- **n8n Automation**: Webhook integration for workflow automation

The project uses Express.js backend with TypeScript, React frontend with Vite, Drizzle ORM for PostgreSQL, and integrates with Supabase, OpenAI, ElevenLabs, and n8n.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Entry Point**: `server/index.ts` - Sets up Express app with JSON parsing and request logging
- **Routes**: `server/routes.ts` - Defines all `/api/arc/*` endpoints with authentication middleware
- **Storage**: `server/storage.ts` - In-memory storage implementation with interface for future database migration

### API Authentication
- All `/api/arc/*` endpoints require `X-ARC-SECRET` header
- Secret validated against `ARC_BACKEND_SECRET` environment variable
- Development mode allows requests without secret when env var is not set
- Production mode requires proper configuration

### Data Validation
- Uses Zod schemas defined in `shared/schema.ts` for request validation
- Schemas cover: agent events, CEO reminders, executive summaries, governance notifications, rule broadcasts, and high-priority notifications

### Storage Pattern
- `IStorage` interface abstracts storage operations
- `DatabaseStorage` class provides PostgreSQL-backed implementation using Drizzle ORM
- Includes user operations (`getUser`, `upsertUser`) for Replit Auth

### Database Configuration
- Drizzle ORM configured in `drizzle.config.ts`
- PostgreSQL dialect with schema in `shared/schema.ts`
- Migrations output to `./migrations` directory
- Requires `DATABASE_URL` environment variable when database is provisioned

### Build System
- Development: `tsx server/index.ts` for hot reload
- Production: esbuild bundles server, Vite builds client
- Custom build script in `script/build.ts` bundles common dependencies to reduce cold start

### Frontend
- React with Vite, TypeScript, and Tailwind CSS
- ShadCN UI components pre-installed
- **Landing Page** (`/`) - Shows login button for unauthenticated users
- **Virtual Office** (`/`) - Full chat interface for authenticated users
- Uses `useAuth` hook to check authentication state

## External Dependencies

### Core Services
- **PostgreSQL**: Database (via Drizzle ORM) - requires `DATABASE_URL` environment variable
- **n8n Workflows**: Primary consumer of the API endpoints - sends agent events and receives responses
  - Webhook URL: `https://feras102.app.n8n.cloud/webhook/agent-message`
- **Supabase**: Used for `arc_message_archive` table queries
  - Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY`)
- **OpenAI**: Powers the Virtual Office AI agents
  - Requires `OPENAI_API_KEY`

### Authentication
- **Replit Auth**: User authentication via OpenID Connect (Replit as identity provider)
  - `/api/login` - Initiates login flow
  - `/api/logout` - Logs user out
  - `/api/callback` - OAuth callback handler
  - `/api/auth/user` - Returns authenticated user info
  - Sessions stored in PostgreSQL `sessions` table
  - User data stored in `users` table
- **Static Secret Header**: `ARC_BACKEND_SECRET` for API authentication
- All `/api/arc/*` endpoints require `X-ARC-SECRET` header matching the secret
- Auth routes (`/api/login`, `/api/logout`, `/api/callback`, `/api/auth/user`) bypass X-ARC-SECRET check

### Key NPM Packages
- `express`: Web framework
- `drizzle-orm`: Database ORM
- `zod`: Schema validation
- `tsx`: TypeScript execution for development
- `esbuild` + `vite`: Production build tooling

## API Endpoints

### ChatGPT Integration Endpoints (Mr.F Brain)

**POST /api/arc/agents/mrf-brain**
- Purpose: Relay messages from ChatGPT (Mr.F Brain GPT) to n8n webhook
- Headers: `X-ARC-SECRET: <ARC_BACKEND_SECRET>`
- Request body:
  ```json
  {
    "from": "chatgpt",
    "free_text": "user message..."
  }
  ```
- Response: `{ "agent_id": "MRF_BRAIN_GPT", "raw_answer": "..." }`

**POST /api/arc/agents/summary**
- Purpose: Query Supabase for agent activity summary
- Headers: `X-ARC-SECRET: <ARC_BACKEND_SECRET>`
- Request body:
  ```json
  {
    "agent_id": "ARC-L1-FIN-CEO-0001",
    "days": 7
  }
  ```
- Response: Agent summary with message counts, timestamps, and recent examples

### Virtual Office Endpoints

**GET /api/agents** - Get all virtual agents
**GET /api/conversations** - Get all conversations
**POST /api/conversations** - Create new conversation
**GET /api/conversations/:id/messages** - Get messages for a conversation
**POST /api/chat** - Send chat message to selected agents
**POST /api/tts** - Text-to-speech via ElevenLabs (requires auth)
  - Request: `{ "text": "Hello", "voice": "voice_id" }`
  - Response: `{ "audio": "<base64>", "status": "ok" }`

### Brain State Endpoints

**GET /api/arc/brain/state** - Get current brain manifest
**GET /api/arc/brain/self-awareness** - Get self-awareness data

### ARC System Endpoints (n8n Integration)

**POST /api/arc/agent-events** - Ingest agent events (local PostgreSQL)
**POST /api/arc/ceo-reminders** - Handle CEO reminders
**POST /api/arc/executive-summary** - Generate executive summary
**POST /api/arc/governance/notify** - Governance notifications
**POST /api/arc/rules/broadcast** - Rule broadcasts
**POST /api/arc/notifications/high** - High priority notifications

### Supabase Bridge Endpoints (n8n Callbacks)

**POST /api/arc/receive**
- Purpose: Store n8n callback data in Supabase `arc_feedback` table
- Headers: `X-ARC-SECRET: <ARC_BACKEND_SECRET>`
- Request body:
  ```json
  {
    "command_id": "cmd-123",
    "source": "n8n",
    "status": "completed",
    "data": { "result": "success" }
  }
  ```
- Response: `{ "status": "ok", "id": "<uuid>", "stored": "supabase" }`

**POST /api/arc/command**
- Purpose: Log Mr.F Brain commands in Supabase `arc_command_log` table
- Headers: `X-ARC-SECRET: <ARC_BACKEND_SECRET>`
- Request body:
  ```json
  {
    "command": "generate_report",
    "payload": { "type": "daily" },
    "status": "pending"
  }
  ```
- Response: `{ "status": "ok", "id": "<uuid>", "stored": "supabase" }`

**POST /api/arc/events**
- Purpose: Store agent events in Supabase `agent_events` table
- Headers: `X-ARC-SECRET: <ARC_BACKEND_SECRET>`
- Request body:
  ```json
  {
    "agent_name": "Mr.F",
    "event_type": "task_completed",
    "payload": { "task_id": "123" }
  }
  ```
- Response: `{ "status": "ok", "id": "<uuid>", "stored": "supabase" }`

## X Bio Sentinel (Electronic Nose)

### Overview
X Bio Sentinel is an integrated ESP32-S3 N16R8 + Waveshare BME688 sensor system for AI-powered smell identification. Features real-time monitoring dashboard, smell profile storage with vector embeddings, AI chat analysis, and WebSocket communication with hardware devices.

### Hardware Requirements
- **MCU**: ESP32-S3 N16R8 (16MB Flash, 8MB PSRAM)
- **Sensor**: Waveshare BME688 (Temperature, Humidity, Pressure, Gas Resistance, VOC, CO2 equivalent)
- **Communication**: WiFi for WebSocket/HTTP connectivity

### Bio Sentinel Endpoints (Require Authentication)

**GET /api/bio-sentinel/profiles** - Get all smell profiles
**POST /api/bio-sentinel/profiles** - Create a new smell profile
**GET /api/bio-sentinel/profiles/:id** - Get single profile
**DELETE /api/bio-sentinel/profiles/:id** - Delete a profile
**POST /api/bio-sentinel/chat** - AI-powered smell analysis chat
**GET /api/bio-sentinel/export** - Export profiles as JSON
**POST /api/bio-sentinel/import** - Import profiles from JSON
**POST /api/bio-sentinel/readings** - HTTP fallback for sensor readings

### WebSocket Endpoint

**WS /ws/bio-sentinel** - Real-time bidirectional communication
- ESP32 sends: `sensor_reading`, `device_status`, `capture_complete`, `calibration_complete`
- Dashboard sends: `set_mode`, `start_calibration`, `start_capture`, `stop`, `restart`

### Frontend Routes
- `/bio-sentinel` - Sensor dashboard with real-time monitoring, control panel, smell capture workflow, AI chat

### Documentation
- `docs/x-bio-sentinel-spec.md` - Complete integration specification
- `docs/esp32-firmware-prompt.md` - PlatformIO firmware generation prompt for AI