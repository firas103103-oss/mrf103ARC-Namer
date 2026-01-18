# 🚀 Quick Deployment Guide - Mr.F 103

## Railway Deployment (30 seconds)

### Option 1: GitHub Integration (Easiest)

1. Push code to GitHub
2. Go to <https://railway.app>
3. Click "New Project" → "Deploy from GitHub"
4. Select `MrF_` repository
5. ✅ Done! Railway auto-deploys

### Option 2: Railway CLI

```bash
# Install CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Option 3: Railway Button

Click to deploy:
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

## Environment Variables (Set in Railway Dashboard)

```env
NODE_ENV=production
VITE_APP_URL=https://app.mrf103.com
VITE_AUTHOR_URL=https://author.mrf103.com
VITE_CONTACT_PHONE=+966591652030
VITE_CONTACT_EMAIL=mr.f@mrf103.com
```

## What Railway Does Automatically

✅ Detects Node.js project
✅ Runs `npm ci && npm run build`
✅ Starts with `npm run start:railway`
✅ Assigns PORT automatically
✅ Provides HTTPS URL
✅ Auto-restarts on failure
✅ Monitors health checks

## Your Production URL

After deployment:

- Railway URL: `https://mrf103-production.up.railway.app`
- Custom domain: Configure in Railway settings

## Local Testing Before Deploy

```bash
# Build
npm run build

# Test production mode
npm run start:prod
```

## Update Deployment

Just push to GitHub - Railway auto-deploys!

```bash
git add .
git commit -m "update"
git push
```

## Troubleshooting

**Build fails?**

- Check logs in Railway dashboard
- Ensure all dependencies in package.json

**Can't connect?**

- Railway assigns PORT automatically
- Server listens on `0.0.0.0:$PORT`

**Environment variables not working?**

- Variables must be set in Railway dashboard
- Restart deployment after adding variables

## Cost

Railway offers:

- 💰 $5 free credit/month
- 💸 Pay only for usage after free tier
- 🎯 Perfect for small projects

---

**Total time to deploy: < 1 minute** ⚡
