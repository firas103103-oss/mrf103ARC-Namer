# 🔧 Railway Deployment Fix Guide

## ⚠️ CRITICAL ISSUE: 502 Bad Gateway

### Problem
Site returning **502 Bad Gateway** after removing `PORT=9002` from Railway environment variables.

### Root Cause
Railway dynamically assigns a `PORT` environment variable (usually 3000-8000 range) and expects your application to bind to that port. When you removed `PORT`, Railway still assigns it internally, but there might be a mismatch or the variable isn't being passed correctly.

### Solution Steps

#### Option 1: Let Railway Auto-Inject PORT (Recommended)
1. Go to Railway Dashboard: https://railway.app
2. Select your project: `mrf103ARC-Namer`
3. Go to **Variables** tab
4. **DO NOT** add PORT variable - Railway injects it automatically
5. Click **Deploy** → **Redeploy**

#### Option 2: Explicitly Set PORT Variable
1. Go to Railway Dashboard
2. Select your project
3. Variables tab → Add variable:
   - Key: `PORT`
   - Value: `${{PORT}}` (this references Railway's internal PORT)
4. Click **Redeploy**

#### Option 3: Use Fixed Port (Not Recommended)
1. Railway Dashboard → Variables
2. Add: `PORT=9002`
3. Redeploy
4. **Note**: Railway may still try to route to its assigned port, causing conflicts

### Verify Deployment

After redeployment, check:
```bash
# Should return 200 OK and HTML
curl -I https://app.mrf103.com

# Should return JSON with "healthy"
curl https://app.mrf103.com/api/health
```

### Code Reference
The server code is already correct and handles Railway's PORT:

```typescript
// server/index.ts line 220
const port = Number(process.env.PORT) || 9002;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is live and listening on port ${port}`);
});
```

This will:
- Use Railway's assigned PORT in production
- Fall back to 9002 in development

### Additional Checks

1. **Railway Logs**: Check deployment logs for port binding errors
2. **Health Check**: Railway's internal health check should pass
3. **DNS**: Ensure `app.mrf103.com` points to Railway (should be via Cloudflare)

### Railway Environment Variables Checklist

Required variables in Railway:
```bash
# Authentication (REQUIRED)
ARC_OPERATOR_PASSWORD=<your-secure-password>
SESSION_SECRET=<your-session-secret>

# Database (REQUIRED)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=eyJ...

# AI APIs (Optional but recommended)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...

# Monitoring (Optional)
SENTRY_DSN=https://...

# System (Railway auto-injects)
NODE_ENV=production
PORT=<auto-injected-by-railway>
```

### Troubleshooting

If still getting 502:
1. Check Railway deployment logs
2. Verify build completed successfully
3. Check that `npm start` script runs correctly
4. Ensure no firewall/security group blocking
5. Verify Cloudflare proxy settings (should be proxied, not DNS-only)

### Contact Support
If issue persists:
- Railway Discord: https://discord.gg/railway
- Railway Support: help@railway.app
- Include: deployment ID, error logs, domain name

---
**Status**: 🔴 Requires immediate attention  
**Priority**: P0 - Critical  
**ETA**: Should resolve within 5-10 minutes after redeployment
