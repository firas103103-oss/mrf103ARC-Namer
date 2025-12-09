# ARC Backend API

## Overview

This is a REST API backend for the **Mr.F Enterprise OS / ARC Virtual Office** orchestration system. The API serves as the bridge between n8n workflows and the ARC agent ecosystem, providing endpoints for ingesting agent events, handling CEO report reminders, generating executive summaries, managing governance notifications, broadcasting rule updates, and processing high-priority notifications.

The project uses a standard Express.js backend with TypeScript, Drizzle ORM for database operations, and includes a React frontend scaffold (currently minimal - just a 404 page). The primary focus is the backend API endpoints consumed programmatically by n8n workflows.

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
- `MemStorage` class provides in-memory implementation using Maps
- Designed for easy swap to database-backed storage (Drizzle ORM configured for PostgreSQL)

### Database Configuration
- Drizzle ORM configured in `drizzle.config.ts`
- PostgreSQL dialect with schema in `shared/schema.ts`
- Migrations output to `./migrations` directory
- Requires `DATABASE_URL` environment variable when database is provisioned

### Build System
- Development: `tsx server/index.ts` for hot reload
- Production: esbuild bundles server, Vite builds client
- Custom build script in `script/build.ts` bundles common dependencies to reduce cold start

### Frontend (Minimal)
- React with Vite, TypeScript, and Tailwind CSS
- ShadCN UI components pre-installed
- Currently just serves as placeholder - main functionality is backend API

## External Dependencies

### Core Services
- **PostgreSQL**: Database (via Drizzle ORM) - requires `DATABASE_URL` environment variable
- **n8n Workflows**: Primary consumer of the API endpoints - sends agent events and receives responses

### Authentication
- **Static Secret Header**: `ARC_BACKEND_SECRET` environment variable for API authentication

### Optional Integrations (Referenced in README)
- **Supabase**: Optional for MVP - requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables

### Key NPM Packages
- `express`: Web framework
- `drizzle-orm`: Database ORM
- `zod`: Schema validation
- `tsx`: TypeScript execution for development
- `esbuild` + `vite`: Production build tooling