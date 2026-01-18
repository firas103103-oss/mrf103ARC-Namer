# 🚀 COMMAND + PULSE Railway Deployment Guide

## Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

## Architecture

This service includes:
- **COMMAND**: Main web application and API
- **PULSE**: IoT firmware and device management
- **Database**: PostgreSQL via Supabase

## Prerequisites

- Railway account
- Supabase project (database)
- OpenAI API key
- Strong passwords

## Step 1: Setup Database (Supabase)

1. Create Supabase project: https://supabase.com
2. Go to Settings → Database
3. Copy connection string (use pooler for Railway):
   ```
   postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
   ```

## Step 2: Generate Secrets

```bash
# Session secret
openssl rand -hex 32

# Output example:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## Step 3: Set Environment Variables

In Railway Dashboard → Variables:

### Critical (Required):
```env
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ARC_OPERATOR_PASSWORD=your-secure-password-123
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
OPENAI_API_KEY=sk-proj-your-key
NODE_ENV=production
```

### Optional:
```env
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_API_KEY=sk-ant-your-key
GEMINI_API_KEY=your-gemini-key
ELEVENLABS_API_KEY=your-elevenlabs-key
SENTRY_DSN=https://your-sentry-dsn
```

⚠️ **Important**: 
- Use **pooler** connection string (port 6543) not direct (port 5432)
- Do NOT manually set `PORT` - Railway assigns it
- Keep `SESSION_SECRET` at least 32 characters

## Step 4: Deploy

### Option A: Via Railway CLI
```bash
railway login
railway link
railway up
```

### Option B: Via GitHub
```bash
git add .
git commit -m "Deploy COMMAND+PULSE to Railway"
git push origin main
```

## Step 5: Run Database Migrations

After first deployment:

```bash
# Via Railway CLI
railway run npm run db:migrate

# Or execute SQL in Supabase SQL Editor
# Copy from: ./supabase_arc_complete_setup.sql
```

## Step 6: Verify Deployment

```bash
# Health check
curl https://your-command-app.railway.app/api/health

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "supabase": "initialized",
  "version": "2.1.0"
}
```

## Configuration Details

### Build Settings
- **Builder**: Nixpacks
- **Install**: `npm ci --legacy-peer-deps`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### Health Check
- **Path**: `/api/health`
- **Interval**: 30s
- **Timeout**: 15s
- **Retries**: 3

### Resource Requirements
- **Memory**: 1GB minimum (2GB recommended)
- **CPU**: 1 vCPU minimum
- **Storage**: 10GB

## Monitoring

### Health Endpoints
```bash
GET /api/health       # Full system check
GET /api/health/live  # Liveness probe
GET /api/health/ready # Readiness probe
```

### Logs
```bash
# Real-time logs
railway logs

# Tail logs
railway logs --follow
```

### Metrics in Dashboard
- Request latency
- Error rate
- Memory usage
- CPU usage
- Active connections

## Troubleshooting

### Issue 1: Database Connection Fails
```
Error: connect ETIMEDOUT
```

**Solution**:
1. Verify `DATABASE_URL` uses **pooler** (port 6543)
2. Check Supabase project isn't paused
3. Verify IP allowlist (if enabled)

### Issue 2: Build Fails
```
Error: Cannot find module
```

**Solution**:
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Clear Railway build cache
railway run npm cache clean --force
```

### Issue 3: Authentication Fails
```
Error: Invalid password
```

**Solution**:
1. Verify `ARC_OPERATOR_PASSWORD` in Railway variables
2. Ensure no trailing spaces
3. Try resetting password

### Issue 4: Health Check Fails
```
Service unhealthy after 3 retries
```

**Solution**:
1. Check if database migrations ran
2. Verify all required env vars are set
3. Increase `healthcheckTimeout` to 20s

## IoT Device Setup (PULSE)

### Firmware Flashing
```bash
# Build firmware
cd firmware
npm run build

# Flash to ESP32
npm run flash
```

### Device Configuration
```cpp
// In firmware/src/config.h
#define WIFI_SSID "your-wifi"
#define WIFI_PASSWORD "your-password"
#define API_ENDPOINT "https://your-command-app.railway.app"
```

## Custom Domain

1. Railway Dashboard → Settings → Domains
2. Add domain: `command.yourdomain.com`
3. DNS Configuration:
   ```
   CNAME command yourdomain.railway.app
   ```

## Scaling

### Vertical Scaling
- Increase memory/CPU in Railway dashboard
- Recommended: 2GB RAM, 1 vCPU

### Horizontal Scaling
```json
// railway.json
{
  "replicas": {
    "min": 2,
    "max": 5
  }
}
```

### Database Connection Pooling
- Use Supabase pooler (6543)
- Max connections: 100
- Idle timeout: 10s

## Backup Strategy

### Database Backups
- Supabase: Automatic daily backups
- Retention: 7 days (free tier), 30 days (pro)

### Manual Backup
```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20260111.sql
```

## Cost Estimation

- **Railway**: $20-50/month (Pro plan)
- **Supabase**: $25/month (Pro plan)
- **Total**: ~$45-75/month

## Security Checklist

- [x] HTTPS enforced
- [x] Environment variables not in code
- [x] Strong passwords (min 16 chars)
- [x] Rate limiting enabled
- [x] Session cookies HttpOnly
- [x] CORS configured
- [x] Helmet.js security headers
- [x] Database connection pooled
- [x] API keys rotated regularly

## Production Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Monitoring alerts setup
- [ ] Backup strategy verified
- [ ] Documentation updated
- [ ] Team access configured
- [ ] Incident response plan ready

---

**Status**: Production Ready ✅  
**Version**: 2.1.0  
**Last Updated**: 2026-01-11
