# Railway Deployment Guide - MRF103 ARC Platform

## Quick Deploy

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

## Services Required

### 1. Main Application
- **Name:** mrf103-arc-platform
- **Type:** Web Service
- **Port:** 5000

### 2. PostgreSQL Database
```bash
railway add postgresql
```

### 3. Redis (Optional - for caching)
```bash
railway add redis
```

## Environment Variables Setup

Go to Railway Dashboard → Variables:

**Critical Variables:**
```
DATABASE_URL (auto-configured by Postgres)
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SESSION_SECRET (generate: openssl rand -base64 32)
ARC_OPERATOR_PASSWORD
OPENAI_API_KEY
```

**Optional but Recommended:**
```
ANTHROPIC_API_KEY
GEMINI_API_KEY
ELEVENLABS_API_KEY
SENTRY_DSN
REDIS_URL (auto-configured by Redis)
```

## Database Migration

```bash
# After first deployment
railway run npm run db:push
```

## Custom Domain

1. Railway Dashboard → Settings → Domains
2. Add custom domain: `app.mrf103.com`
3. Configure DNS:
   ```
   CNAME app.mrf103.com → your-app.railway.app
   ```

## Health Check

```bash
curl https://app.mrf103.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2024-01-11T10:00:00.000Z",
  "version": "2.1.0"
}
```

## Monitoring

Railway provides built-in monitoring:
- **Metrics:** CPU, Memory, Network
- **Logs:** Real-time log streaming
- **Alerts:** Configure in Railway Dashboard

## Scaling

### Vertical Scaling (Increase resources)
Railway Dashboard → Settings → Resources

### Horizontal Scaling (Multiple instances)
```json
{
  "deploy": {
    "numReplicas": 3
  }
}
```

## Troubleshooting

### Build Fails
```bash
# Check build logs
railway logs --build

# Common fix: clear npm cache
railway run npm cache clean --force
railway up
```

### App Crashes
```bash
# Check runtime logs
railway logs

# Restart service
railway restart
```

### Database Connection Issues
```bash
# Verify DATABASE_URL
railway variables

# Test connection
railway run npm run db:push
```

## Backup & Recovery

### Database Backup
```bash
# Create backup
railway run pg_dump $DATABASE_URL > backup.sql

# Restore backup
railway run psql $DATABASE_URL < backup.sql
```

## Cost Estimation

Railway Pricing:
- **Hobby Plan:** $5/month credit (free)
- **Usage-based:** $0.000463/GB-hour RAM + $0.000231/vCPU-hour
- **Estimated Cost:** ~$15-25/month for small traffic

## CI/CD Integration

Automatic deploys from GitHub:
1. Connect repo in Railway Dashboard
2. Enable auto-deploy for `main` branch
3. Each push triggers new deployment
