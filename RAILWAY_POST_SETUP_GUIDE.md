# 🚂 Railway Deployment Checklist - Post Setup

**Date:** January 11, 2026  
**Status:** 6 Repositories Added to Railway ✅

---

## ✅ Completed Steps

- [x] Created 6 GitHub repositories
- [x] Pushed code to all repos
- [x] Connected repos to Railway
- [ ] Configure environment variables
- [ ] Set up build commands
- [ ] Configure start commands
- [ ] Test deployments
- [ ] Set up custom domains
- [ ] Monitor services

---

## 📋 Next Steps for Each Repository

### 1. 🌐 mrf103-landing (Landing Page)

**Railway Configuration:**

```bash
# Build Command
npm install

# Start Command  
npx serve -s . -p $PORT

# Or use static hosting
# No build needed
```

**Environment Variables:**
```bash
# No environment variables needed (static site)
```

**Custom Domain:**
```bash
# Add domain in Railway dashboard
mrf103.com
www.mrf103.com
```

**Health Check:**
```bash
curl https://mrf103-landing.up.railway.app
```

---

### 2. 🔥 xbook-engine (NPM Package)

**This is an NPM package, NOT deployed to Railway!**

**Instead, publish to NPM:**

```bash
cd xbook-engine

# Login to NPM
npm login

# Publish
npm publish --access public

# Install in other projects
npm install @mrf103/xbook-engine
```

**Skip Railway deployment for this one!**

---

### 3. 🎯 mrf103-arc-ecosystem (Main Platform)

**Railway Configuration:**

```bash
# Build Command
npm install && npm run build

# Start Command
npm run start
```

**Environment Variables:**
```bash
# Copy from ENVIRONMENT_VARIABLES_GUIDE.md
NODE_ENV=production
PORT=8085

# OpenAI
OPENAI_API_KEY=sk-proj-xxx

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
DATABASE_URL=postgresql://xxx

# Security
ARC_OPERATOR_PASSWORD=xxx
ARC_BACKEND_SECRET=xxx
SESSION_SECRET=xxx

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

**Custom Domain:**
```bash
arc.mrf103.com
api.mrf103.com
```

**Health Check:**
```bash
curl https://mrf103-arc-ecosystem.up.railway.app/api/health
```

---

### 4. 📚 arc-namer-core (NPM Package)

**This is an NPM package, NOT deployed to Railway!**

**Publish to NPM:**

```bash
cd arc-namer-core
npm login
npm publish
```

**Skip Railway deployment!**

---

### 5. ⚡ arc-namer-cli (CLI Tool)

**This is a CLI tool, NOT deployed to Railway!**

**Publish to NPM:**

```bash
cd arc-namer-cli
npm login
npm publish
```

**Users install via:**
```bash
npm install -g arc-namer-cli
```

**Skip Railway deployment!**

---

### 6. 🎨 arc-namer-vscode (VS Code Extension)

**This is a VS Code extension, NOT deployed to Railway!**

**Publish to VS Code Marketplace:**

```bash
cd arc-namer-vscode

# Install vsce
npm install -g @vscode/vsce

# Package
vsce package

# Publish
vsce publish
```

**Skip Railway deployment!**

---

## 🎯 Summary: What to Deploy on Railway

| Repository | Deploy on Railway? | Alternative |
|------------|-------------------|-------------|
| mrf103-landing | ✅ YES | Static hosting |
| xbook-engine | ❌ NO | NPM package |
| mrf103-arc-ecosystem | ✅ YES | Main platform |
| arc-namer-core | ❌ NO | NPM package |
| arc-namer-cli | ❌ NO | NPM package |
| arc-namer-vscode | ❌ NO | VS Code Marketplace |

**فقط 2 من 6 يتم نشرهم على Railway!**

---

## 🚀 Deployment Steps for Railway Projects

### For mrf103-landing:

```bash
# 1. Go to Railway project
https://railway.app/project/[project-id]

# 2. Go to Settings → Variables
# No variables needed

# 3. Check deployment
# Should auto-deploy on push

# 4. Add custom domain
# Settings → Domains → Add Domain
```

### For mrf103-arc-ecosystem:

```bash
# 1. Add all environment variables
# Settings → Variables → Add all from above

# 2. Configure build
# Settings → Build
# Build Command: npm install && npm run build
# Start Command: npm run start

# 3. Add PostgreSQL (if needed)
# New → Database → PostgreSQL
# Copy DATABASE_URL to variables

# 4. Deploy
# Should auto-deploy

# 5. Check logs
# Deployments → View Logs

# 6. Add custom domain
# Settings → Domains
```

---

## 📦 NPM Publishing Steps

### For xbook-engine, arc-namer-core, arc-namer-cli:

```bash
# 1. Ensure package.json is correct
{
  "name": "@mrf103/xbook-engine",  # or package name
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  ...
}

# 2. Build
npm run build

# 3. Login to NPM
npm login
# Username: [your-npm-username]
# Password: [your-npm-password]
# Email: firas103103@gmail.com

# 4. Publish
npm publish --access public

# 5. Verify
npm view @mrf103/xbook-engine
```

---

## 🎨 VS Code Extension Publishing

### For arc-namer-vscode:

```bash
# 1. Install vsce
npm install -g @vscode/vsce

# 2. Get Personal Access Token
# https://dev.azure.com/[your-org]/_usersSettings/tokens
# Scopes: Marketplace → Manage

# 3. Create publisher (first time only)
vsce create-publisher mrf103

# 4. Login
vsce login mrf103

# 5. Package
vsce package
# Creates: arc-namer-vscode-1.0.0.vsix

# 6. Publish
vsce publish

# 7. Verify
# https://marketplace.visualstudio.com/items?itemName=mrf103.arc-namer-vscode
```

---

## 🔍 Testing Checklist

### After Deployment:

- [ ] **mrf103-landing** - Open in browser
  ```bash
  curl https://[your-domain].railway.app
  # Should return HTML
  ```

- [ ] **mrf103-arc-ecosystem** - Test API
  ```bash
  curl https://[your-domain].railway.app/api/health
  # Should return: {"status":"ok"}
  ```

- [ ] **xbook-engine** - Test NPM package
  ```bash
  npm install @mrf103/xbook-engine
  # Test import in project
  ```

- [ ] **arc-namer-core** - Test NPM package
  ```bash
  npm install arc-namer-core
  ```

- [ ] **arc-namer-cli** - Test CLI
  ```bash
  npm install -g arc-namer-cli
  arc-namer --help
  ```

- [ ] **arc-namer-vscode** - Test extension
  ```bash
  code --install-extension arc-namer-vscode-1.0.0.vsix
  ```

---

## 🔗 Custom Domains Setup

### On Railway:

1. Go to project → Settings → Domains
2. Click "Add Domain"
3. Enter: `arc.mrf103.com`
4. Copy CNAME record: `xxx.up.railway.app`
5. Add to your DNS provider:
   ```
   Type: CNAME
   Name: arc
   Value: xxx.up.railway.app
   ```
6. Wait for DNS propagation (5-60 minutes)
7. SSL auto-provisioned by Railway

---

## 📊 Monitoring & Logs

### Railway Dashboard:

```bash
# View logs
Project → Deployments → View Logs

# Metrics
Project → Metrics
- CPU usage
- Memory usage
- Network traffic

# Restart service
Project → Settings → Restart

# View environment variables
Project → Settings → Variables
```

---

## 💰 Cost Estimation

**Railway Pricing:**
- Hobby Plan: $5/month + usage
- Pro Plan: $20/month + usage

**Estimated Monthly Cost:**
- 2 services (landing + ecosystem)
- ~$10-15/month total

---

## 🚨 Troubleshooting

### Build Fails:

```bash
# Check logs
railway logs

# Common issues:
1. Missing environment variables
2. Build command incorrect
3. Node version mismatch
4. Missing dependencies
```

### Deployment Fails:

```bash
# Check start command
# Ensure PORT is used: process.env.PORT

# Check health endpoint
curl https://[domain]/health

# View error logs
railway logs --tail
```

### Domain Not Working:

```bash
# Check DNS propagation
dig arc.mrf103.com

# Verify CNAME record
nslookup arc.mrf103.com

# Wait 5-60 minutes for propagation
```

---

## 📝 Next Actions Summary

### Immediate (Today):

1. ✅ Configure environment variables for **mrf103-arc-ecosystem**
2. ✅ Test deployment of **mrf103-arc-ecosystem**
3. ✅ Configure **mrf103-landing** (no env vars needed)

### This Week:

1. 📦 Publish **xbook-engine** to NPM
2. 📦 Publish **arc-namer-core** to NPM
3. 📦 Publish **arc-namer-cli** to NPM
4. 🎨 Publish **arc-namer-vscode** to Marketplace

### Next Week:

1. 🌐 Set up custom domains
2. 📊 Monitor deployments
3. 🔧 Optimize performance
4. 📚 Update documentation

---

## 🎯 Priority Order:

1. **مهم فوراً:**
   - Configure `mrf103-arc-ecosystem` env vars
   - Test main platform deployment

2. **مهم هذا الأسبوع:**
   - Publish NPM packages (3 packages)
   - Test all installations

3. **اختياري:**
   - Custom domains
   - VS Code extension
   - Performance optimization

---

**خليني أساعدك بالخطوة الأولى؟** 🚀

بدك:
- أ) نكمل إعداد Railway variables
- ب) نبدأ بنشر NPM packages
- ج) نعمل quick test للـ deployments

شو بتفضل؟
