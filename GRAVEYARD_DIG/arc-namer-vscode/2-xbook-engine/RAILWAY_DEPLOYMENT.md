# 🚀 FORGE Railway Deployment Guide

## Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

## Prerequisites

- Railway account
- OpenAI API key
- Anthropic API key (optional)

## Step 1: Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

## Step 2: Set Environment Variables

In Railway Dashboard → Variables, add:

### Required Variables:
```env
OPENAI_API_KEY=sk-proj-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
NODE_ENV=production
```

### Optional Variables:
```env
PORT=3000
GEMINI_API_KEY=your-gemini-key
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

⚠️ **Important**: Do NOT manually set `PORT` - Railway assigns it dynamically!

## Step 3: Deploy

### Option A: Via Railway CLI
```bash
railway up
```

### Option B: Via GitHub
```bash
git add .
git commit -m "Deploy FORGE to Railway"
git push origin main
```

Railway will auto-deploy from GitHub.

## Step 4: Verify Deployment

```bash
# Check health endpoint
curl https://your-forge-app.railway.app/health

# Expected response:
{
  "status": "healthy",
  "service": "xbook-engine",
  "version": "1.0.0"
}
```

## Configuration Details

### Build Settings
- **Builder**: Nixpacks (automatic)
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### Health Check
- **Path**: `/health`
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 3

### Restart Policy
- **Type**: ON_FAILURE
- **Max Retries**: 3

## Monitoring

### Logs
```bash
railway logs
```

### Metrics
Check Railway Dashboard for:
- CPU usage
- Memory usage
- Network traffic
- Request latency

## Troubleshooting

### Issue 1: Build Fails
```bash
# Check TypeScript errors
npm run check

# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: API Key Errors
```bash
# Verify variables in Railway Dashboard
# Ensure no trailing spaces or quotes
```

### Issue 3: Health Check Fails
```bash
# Test locally first
npm run build
npm start

# Check if port binding is correct
curl http://localhost:3000/health
```

## Custom Domain Setup

1. Railway Dashboard → Settings → Domains
2. Add custom domain: `forge.yourdomain.com`
3. Update DNS records:
   ```
   CNAME forge yourdomain.railway.app
   ```

## Scaling

Railway auto-scales based on traffic. To configure:

1. Dashboard → Settings → Resources
2. Set min/max instances
3. Configure memory/CPU limits

## Cost Estimation

- **Starter Plan**: $5/month (500 hours)
- **Pro Plan**: $20/month + usage
- Estimated cost for FORGE: ~$10-30/month

---

**Status**: Ready for Production ✅  
**Last Updated**: 2026-01-11
