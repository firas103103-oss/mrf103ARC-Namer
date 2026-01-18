# 🚂 Railway Services Summary

## Services Configuration

| # | Repository | Service Name | Type | Railway | Port |
|---|-----------|--------------|------|---------|------|
| 1 | 1-mrf103-landing | NEXUS | Static | ❌ No (Use Vercel) | N/A |
| 2 | 2-xbook-engine | FORGE | API | ✅ Yes | 3000 |
| 3 | 3-mrf103-arc-ecosystem | COMMAND+PULSE | Full-Stack | ✅ Yes | 5001 |
| 4 | 4-arc-namer-core | Core | Library | ❌ No (NPM) | N/A |
| 5 | 5-arc-namer-cli | CLI | Tool | ❌ No (NPM) | N/A |
| 6 | 6-arc-namer-vscode | VSCode | Extension | ❌ No (Marketplace) | N/A |

## Files Added to Each Repository

### FORGE (2-xbook-engine):
- ✅ `railway.json` - Railway configuration
- ✅ `Dockerfile` - Container definition
- ✅ `.env.example` - Environment variables template
- ✅ `RAILWAY_DEPLOYMENT.md` - Detailed deployment guide

### COMMAND+PULSE (3-mrf103-arc-ecosystem):
- ✅ `railway.json` - Railway configuration
- ✅ `Dockerfile` - Container with Python/make/g++
- ✅ `.env.example` - All environment variables
- ✅ `RAILWAY_DEPLOYMENT.md` - Complete guide with database setup

### Core/CLI/VSCode (4, 5, 6):
- ✅ `railway.json` - Build-only configuration
- 📝 Note: These are NOT deployed as services, only built for package publishing

### Master Files:
- ✅ `deploy-railway.sh` - Automated deployment script
- ✅ `RAILWAY_DEPLOYMENT_GUIDE.md` - Complete multi-service guide

## Quick Deploy Commands

### Deploy FORGE:
```bash
cd _FINAL_REPOS_UNIFIED/2-xbook-engine
railway init
railway link
railway variables set OPENAI_API_KEY=sk-proj-xxx
railway variables set ANTHROPIC_API_KEY=sk-ant-xxx
railway up
```

### Deploy COMMAND:
```bash
cd _FINAL_REPOS_UNIFIED/3-mrf103-arc-ecosystem
railway init
railway link
railway variables set DATABASE_URL=postgresql://xxx
railway variables set SUPABASE_URL=https://xxx.supabase.co
railway variables set SUPABASE_KEY=eyJxxx
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJxxx
railway variables set ARC_OPERATOR_PASSWORD=secure-pass
railway variables set SESSION_SECRET=$(openssl rand -hex 32)
railway variables set OPENAI_API_KEY=sk-proj-xxx
railway up
```

### Deploy All (Automated):
```bash
cd _FINAL_REPOS_UNIFIED
./deploy-railway.sh
```

## Environment Variables Summary

### FORGE (Minimal):
```env
OPENAI_API_KEY=required
ANTHROPIC_API_KEY=required
NODE_ENV=production
```

### COMMAND (Complex):
```env
DATABASE_URL=required
SUPABASE_URL=required
SUPABASE_KEY=required
SUPABASE_SERVICE_ROLE_KEY=required
ARC_OPERATOR_PASSWORD=required
SESSION_SECRET=required
OPENAI_API_KEY=required
NODE_ENV=production
```

## Health Check Endpoints

- **FORGE**: `GET /health`
- **COMMAND**: `GET /api/health`

## Expected Costs

- **FORGE**: $10-15/month
- **COMMAND**: $25-35/month
- **Total**: ~$35-50/month

## Documentation

1. **Master Guide**: [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md)
2. **FORGE Guide**: [2-xbook-engine/RAILWAY_DEPLOYMENT.md](2-xbook-engine/RAILWAY_DEPLOYMENT.md)
3. **COMMAND Guide**: [3-mrf103-arc-ecosystem/RAILWAY_DEPLOYMENT.md](3-mrf103-arc-ecosystem/RAILWAY_DEPLOYMENT.md)

---

**Status**: ✅ Ready for Railway Deployment  
**Last Updated**: 2026-01-11
