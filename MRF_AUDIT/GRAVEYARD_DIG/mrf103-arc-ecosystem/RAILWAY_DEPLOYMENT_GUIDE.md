# 🚂 Railway Multi-Service Deployment Guide

## Overview

This guide explains how to deploy all 6 repositories as **separate, independent services** on Railway.

## Architecture

```
Railway Platform
├── Service 1: NEXUS (Static) → Vercel (recommended)
├── Service 2: FORGE (API) → Railway
├── Service 3: COMMAND+PULSE → Railway  
├── Service 4: Core (NPM) → npm registry (not Railway)
├── Service 5: CLI (NPM) → npm registry (not Railway)
└── Service 6: VSCode → VS Code Marketplace (not Railway)
```

### Services for Railway:
1. **FORGE** (2-xbook-engine) - API service
2. **COMMAND+PULSE** (3-mrf103-arc-ecosystem) - Full-stack app

### Services for Other Platforms:
- **NEXUS** → Vercel (static site)
- **Core/CLI/VSCode** → Package registries (not deployed as services)

---

## Prerequisites

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Prepare Environment Variables

#### For FORGE (xbook-engine):
```env
OPENAI_API_KEY=sk-proj-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
NODE_ENV=production
```

#### For COMMAND+PULSE (arc-ecosystem):
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
ARC_OPERATOR_PASSWORD=secure-password-123
SESSION_SECRET=generate-with-openssl-rand-hex-32
OPENAI_API_KEY=sk-proj-xxx
NODE_ENV=production
```

---

## Quick Start (Automated)

```bash
cd _FINAL_REPOS_UNIFIED
./deploy-railway.sh
```

This script will:
1. Check Railway CLI installation
2. Verify login status
3. Deploy each service
4. Show deployment URLs
5. Provide next steps

---

## Manual Deployment (Step by Step)

### Service 1: FORGE (XBook Engine)

```bash
cd _FINAL_REPOS_UNIFIED/2-xbook-engine

# Initialize Railway project
railway init

# Link to existing project (or create new)
railway link

# Set environment variables
railway variables set OPENAI_API_KEY=sk-proj-xxx
railway variables set ANTHROPIC_API_KEY=sk-ant-xxx
railway variables set NODE_ENV=production

# Deploy
railway up

# Get URL
railway domain
```

**Expected Output:**
```
✅ Deployment successful
🌐 URL: https://forge-production-xxxx.up.railway.app
```

**Verify:**
```bash
curl https://forge-production-xxxx.up.railway.app/health
```

---

### Service 2: COMMAND + PULSE

```bash
cd _FINAL_REPOS_UNIFIED/3-mrf103-arc-ecosystem

# Initialize
railway init

# Link
railway link

# Set variables (many!)
railway variables set DATABASE_URL=postgresql://xxx
railway variables set SUPABASE_URL=https://xxx.supabase.co
railway variables set SUPABASE_KEY=eyJxxx
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJxxx
railway variables set ARC_OPERATOR_PASSWORD=secure-pass-123
railway variables set SESSION_SECRET=$(openssl rand -hex 32)
railway variables set OPENAI_API_KEY=sk-proj-xxx
railway variables set NODE_ENV=production

# Deploy
railway up

# Get URL
railway domain
```

**Run Database Migrations:**
```bash
# After first deployment
railway run npm run db:migrate

# Or execute SQL in Supabase dashboard
```

**Verify:**
```bash
curl https://command-production-xxxx.up.railway.app/api/health
```

---

## Environment Variables Reference

### FORGE Required Variables:
| Variable | Example | Required |
|----------|---------|----------|
| `OPENAI_API_KEY` | `sk-proj-xxx` | ✅ Yes |
| `ANTHROPIC_API_KEY` | `sk-ant-xxx` | ✅ Yes |
| `NODE_ENV` | `production` | ✅ Yes |

### COMMAND Required Variables:
| Variable | Example | Required |
|----------|---------|----------|
| `DATABASE_URL` | `postgresql://...` | ✅ Yes |
| `SUPABASE_URL` | `https://xxx.supabase.co` | ✅ Yes |
| `SUPABASE_KEY` | `eyJxxx` | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJxxx` | ✅ Yes |
| `ARC_OPERATOR_PASSWORD` | `secure-pass-123` | ✅ Yes |
| `SESSION_SECRET` | 32+ char string | ✅ Yes |
| `OPENAI_API_KEY` | `sk-proj-xxx` | ✅ Yes |
| `NODE_ENV` | `production` | ✅ Yes |

---

## Configuration Files

Each service has:

### 1. `railway.json`
Defines build and deploy configuration:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "nixpacksPlan": {
      "phases": {
        "setup": {"nixPkgs": ["nodejs_20"]},
        "install": {"cmds": ["npm ci"]},
        "build": {"cmds": ["npm run build"]}
      }
    }
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### 2. `Dockerfile` (optional)
For services needing custom builds:
- FORGE: Node 20 slim
- COMMAND: Node 20 with Python/make/g++

### 3. `.env.example`
Template for environment variables.

### 4. `RAILWAY_DEPLOYMENT.md`
Detailed deployment guide per service.

---

## Custom Domains

### Setup Custom Domain:

```bash
# In service directory
railway domain
```

Or via Dashboard:
1. Railway → Project → Service
2. Settings → Domains
3. Add custom domain: `api.yourdomain.com`
4. Update DNS:
   ```
   CNAME api yourdomain.railway.app
   ```

### Recommended Domains:
- FORGE: `forge.yourdomain.com` or `api.yourdomain.com`
- COMMAND: `command.yourdomain.com` or `app.yourdomain.com`

---

## Monitoring & Logs

### View Logs:
```bash
# Real-time logs
railway logs --follow

# Last 100 lines
railway logs --tail 100
```

### Health Checks:

#### FORGE:
```bash
curl https://forge-xxx.railway.app/health

# Expected:
{
  "status": "healthy",
  "service": "xbook-engine",
  "version": "1.0.0"
}
```

#### COMMAND:
```bash
curl https://command-xxx.railway.app/api/health

# Expected:
{
  "status": "healthy",
  "database": "connected",
  "supabase": "initialized",
  "version": "2.1.0"
}
```

### Metrics in Dashboard:
- CPU usage
- Memory usage
- Request count
- Response time
- Error rate

---

## Scaling

### Vertical Scaling:
```bash
railway resources set --memory 2GB --cpu 1
```

Or in Dashboard:
- Settings → Resources
- Adjust memory/CPU sliders

### Horizontal Scaling:
```json
// railway.json
{
  "replicas": {
    "min": 2,
    "max": 5
  }
}
```

### Auto-Scaling (Pro Plan):
- Enable in Dashboard → Settings → Autoscaling
- Based on CPU/memory thresholds

---

## Troubleshooting

### Issue 1: Build Fails
```bash
# Check logs
railway logs

# Common causes:
# - Missing dependencies
# - TypeScript errors
# - Wrong Node version

# Fix:
npm install
npm run check
npm run build
```

### Issue 2: Deployment Successful but 502
```bash
# Check if service is binding to correct port
# Railway assigns PORT dynamically

# Code should have:
const port = process.env.PORT || 3000;

# NOT:
const port = 3000; // ❌ Wrong
```

### Issue 3: Environment Variables Not Working
```bash
# List variables
railway variables

# Set variable
railway variables set KEY=value

# Delete variable
railway variables delete KEY
```

### Issue 4: Database Connection Fails
```bash
# For Supabase: Use POOLER connection
# ✅ Correct: port 6543
postgresql://user:pass@host.pooler.supabase.com:6543/postgres

# ❌ Wrong: port 5432
postgresql://user:pass@host.supabase.com:5432/postgres
```

---

## Cost Estimation

### Railway Pricing:

**Starter Plan** ($5/month):
- 500 execution hours
- 512MB RAM
- 1GB storage
- Good for testing

**Pro Plan** ($20/month + usage):
- Pay per resource usage
- Unlimited executions
- Auto-scaling
- Custom domains included

### Estimated Costs:

**FORGE** (API service):
- Memory: 512MB
- CPU: 0.5 vCPU
- **~$10-15/month**

**COMMAND** (Full-stack):
- Memory: 1GB
- CPU: 1 vCPU
- Database: Separate (Supabase)
- **~$25-35/month**

**Total**: ~$35-50/month for both services

---

## Security Checklist

- [x] Environment variables in Railway dashboard (not in code)
- [x] HTTPS enforced (automatic on Railway)
- [x] Strong passwords (min 16 chars)
- [x] Session secrets are random (32+ chars)
- [x] Database uses connection pooling
- [x] API keys rotated regularly
- [x] Rate limiting enabled
- [x] CORS configured properly
- [x] Security headers (Helmet.js)
- [x] No secrets in git history

---

## Deployment Checklist

### Before Deploying:

- [ ] All services built locally
- [ ] Tests passing
- [ ] TypeScript errors fixed
- [ ] Environment variables prepared
- [ ] Database migrations ready
- [ ] Railway CLI installed
- [ ] Logged into Railway

### During Deployment:

- [ ] Railway projects created
- [ ] Services linked
- [ ] Environment variables set
- [ ] Deployments successful
- [ ] Health checks passing
- [ ] Database migrations run

### After Deployment:

- [ ] Custom domains configured
- [ ] SSL certificates active
- [ ] Monitoring setup
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team notified

---

## Support & Resources

### Railway Documentation:
- https://docs.railway.app

### Command Palette:
```bash
railway help                 # Show all commands
railway status               # Check deployment status
railway logs                 # View logs
railway variables            # Manage env vars
railway domain               # Configure domains
railway restart              # Restart service
railway delete               # Delete service
```

### Getting Help:
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app
- GitHub Issues: https://github.com/firas103103-oss/mrf103ARC-Namer/issues

---

## Quick Reference

### Deploy All Services:
```bash
cd _FINAL_REPOS_UNIFIED
./deploy-railway.sh
```

### Deploy Single Service:
```bash
cd <service-directory>
railway up
```

### Check Status:
```bash
railway status
```

### View Logs:
```bash
railway logs --follow
```

### Restart Service:
```bash
railway restart
```

---

**Last Updated**: 2026-01-11  
**Status**: Production Ready ✅  
**Maintainer**: ARC Technologies
