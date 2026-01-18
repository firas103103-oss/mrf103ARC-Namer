# ✅ Railway Deployment Checklist

**Last Verified:** January 6, 2026  
**Status:** 🟢 Code Ready | 🔴 Railway PORT Issue

---

## 📋 Pre-Deployment Verification

### 1. Code Quality ✅
- [x] TypeScript compilation: **0 errors**
- [x] Tests passing: **17/17**
- [x] Build successful: **dist/ created**
- [x] No security vulnerabilities (production)

```bash
npm run check    # TypeScript
npm test         # Tests
npm run build    # Build
npm audit --production  # Security
```

### 2. Environment Variables ✅

#### Required in Railway:
```bash
# Authentication (CRITICAL)
ARC_OPERATOR_PASSWORD=<your-password>
SESSION_SECRET=<random-secret-key>

# Database (CRITICAL)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=eyJ...

# AI APIs (Optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...

# Monitoring (Optional)
SENTRY_DSN=https://...

# System (Auto-injected by Railway)
NODE_ENV=production
PORT=<auto-injected-do-not-set>
```

#### ⚠️ PORT Variable:
- **DO NOT** manually set `PORT=9002`
- Railway auto-injects PORT dynamically
- Code handles it: `Number(process.env.PORT) || 9002`

### 3. Railway Configuration ✅

#### railway.json
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### package.json scripts
```json
{
  "start": "NODE_ENV=production node dist/index.cjs"
}
```

### 4. Server Code ✅

#### Port Binding (server/index.ts)
```typescript
const port = Number(process.env.PORT) || 9002;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is live and listening on port ${port}`);
});
```

**Binds to:** `0.0.0.0` (all interfaces)  
**Port:** Railway's dynamic PORT or 9002 fallback

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub ✅
```bash
git add -A
git commit -m "Deploy: Ready for production"
git push origin main
```

### Step 2: Railway Auto-Deploy
- Railway detects push
- Runs `npm run build`
- Runs `npm start`
- Monitors health

### Step 3: Verify Deployment
```bash
# Check site is live
curl -I https://app.mrf103.com

# Check health endpoint
curl https://app.mrf103.com/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-06T...",
  "uptime": 123.45,
  "services": {
    "database": {"status": "up"},
    "supabase": {"status": "up"},
    "memory": {"status": "up"}
  }
}
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: 502 Bad Gateway
**Cause:** PORT not set or misconfigured  
**Fix:** 
1. Railway Dashboard → Variables
2. Delete any manual `PORT` setting
3. Let Railway auto-inject PORT
4. Redeploy

### Issue 2: Build Fails
**Cause:** Missing dependencies or TypeScript errors  
**Fix:**
```bash
npm ci              # Clean install
npm run check       # TypeScript
npm run build       # Build locally
```

### Issue 3: Database Connection Error
**Cause:** `DATABASE_URL` missing or invalid  
**Fix:**
1. Verify Supabase connection string
2. Check pooling (should use port 6543)
3. Ensure IP allowlisting (if applicable)

### Issue 4: Authentication Fails
**Cause:** `ARC_OPERATOR_PASSWORD` not set  
**Fix:**
1. Railway → Variables → Add `ARC_OPERATOR_PASSWORD`
2. Set a strong password
3. Redeploy

### Issue 5: Session Not Persisting
**Cause:** `SESSION_SECRET` missing or cookie issues  
**Fix:**
1. Ensure `SESSION_SECRET` is set (Railway)
2. Check `secure: true` only in production
3. Verify Cloudflare proxy settings

---

## 📊 Health Monitoring

### Endpoints to Monitor
- `GET /` - Landing page (200 OK)
- `GET /api/health` - Health check (JSON)
- `POST /api/auth/login` - Authentication

### Expected Logs (Railway)
```
✅ Server is live and listening on port 3000
✅ Database connected
✅ Supabase initialized
```

### Alerts to Set Up
1. **Uptime Monitor** (Railway native or UptimeRobot)
2. **Sentry Alerts** (errors, performance)
3. **Database Monitoring** (Supabase dashboard)

---

## 🔐 Security Checklist

- [x] HTTPS enforced (via Cloudflare)
- [x] Helmet.js security headers
- [x] Rate limiting on auth endpoints
- [x] Session cookies HttpOnly
- [x] CORS configured
- [x] Environment variables not committed
- [x] Secrets managed in Railway dashboard

---

## 📈 Post-Deployment

### Immediate (Within 1 Hour)
- [ ] Test login flow end-to-end
- [ ] Verify all pages load correctly
- [ ] Check Sentry for errors
- [ ] Monitor Railway logs

### Short-term (Within 24 Hours)
- [ ] Load test with expected traffic
- [ ] Test failover scenarios
- [ ] Review Sentry performance metrics
- [ ] Update status page (if applicable)

### Ongoing
- [ ] Daily health check reviews
- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly disaster recovery tests

---

## 🎯 Current Status

### Code Repository ✅
- **GitHub:** https://github.com/firas103103-oss/mrf103ARC-Namer
- **Branch:** main
- **Last Commit:** 288f4c2 (January 6, 2026)

### Deployment Status 🔴
- **Platform:** Railway
- **Domain:** https://app.mrf103.com
- **Current Issue:** 502 Bad Gateway (PORT misconfiguration)
- **Fix Required:** Remove manual PORT setting in Railway

### Next Action
**Fix Railway PORT configuration (5 minutes)**  
See: [RAILWAY_PORT_FIX_IMMEDIATE.md](./RAILWAY_PORT_FIX_IMMEDIATE.md)

---

**Last Updated:** January 6, 2026  
**Maintained By:** ARC Technologies DevOps Team
