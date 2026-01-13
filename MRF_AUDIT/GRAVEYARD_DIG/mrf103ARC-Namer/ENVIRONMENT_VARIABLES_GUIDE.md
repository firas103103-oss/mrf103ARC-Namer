# 🔐 Environment Variables Reference Guide

**Last Updated:** January 11, 2026  
**Version:** v2.1.0

> ⚠️ **CRITICAL:** Never commit actual credentials to Git!  
> This file serves as a **template and documentation** only.

---

## 📋 Table of Contents

1. [Quick Setup](#quick-setup)
2. [Core Variables](#core-variables)
3. [API Keys](#api-keys)
4. [Database](#database)
5. [Cloud Services](#cloud-services)
6. [Development vs Production](#development-vs-production)
7. [Security Best Practices](#security-best-practices)

---

## 🚀 Quick Setup

### Step 1: Create Environment File

```bash
# Copy the template
cp .env.example .env

# Edit with your actual values
nano .env  # or your preferred editor
```

### Step 2: Required Variables Checklist

- [ ] `OPENAI_API_KEY` - For AI features
- [ ] `SUPABASE_URL` - Database connection
- [ ] `SUPABASE_ANON_KEY` - Public access key
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `ARC_OPERATOR_PASSWORD` - Admin password
- [ ] `SESSION_SECRET` - Session encryption key

---

## 🔧 Core Variables

### Application Settings

```bash
# Node Environment
NODE_ENV=production                    # Options: development | production | test

# Server Configuration
PORT=5000                              # Backend server port
FRONTEND_URL=http://localhost:5173     # Frontend URL for CORS

# Security
ARC_OPERATOR_PASSWORD=your-secure-password-here
ARC_BACKEND_SECRET=random-32-char-string
X_ARC_SECRET=another-random-32-char-string
SESSION_SECRET=session-encryption-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000            # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100            # Max requests per window
```

**How to generate secure secrets:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

## 🤖 API Keys

### OpenAI (Required for AI Features)

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

**Where to get it:**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy immediately (shown only once!)
4. Add to `.env` file

**Cost:** Pay-as-you-go, ~$0.002 per request

---

### Anthropic Claude (Optional)

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

**Where to get it:**
- https://console.anthropic.com/account/keys

---

### Google Gemini (Optional)

```bash
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx
```

**Where to get it:**
- https://makersuite.google.com/app/apikey

---

### Groq (Optional - Fast Inference)

```bash
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
```

**Where to get it:**
- https://console.groq.com/keys

---

### Perplexity (Optional - Research)

```bash
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxx
```

**Where to get it:**
- https://www.perplexity.ai/settings/api

---

## 💾 Database

### Supabase (Recommended)

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:[password]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**Setup Steps:**
1. Create project at https://supabase.com
2. Go to Settings → API
3. Copy `Project URL` and `anon` key
4. For `service_role` key: Use only in backend (never expose to frontend!)

---

### PostgreSQL (Alternative)

```bash
# Local PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/arc_database

# Railway PostgreSQL
DATABASE_URL=postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:7432/railway
```

---

## ☁️ Cloud Services

### Railway (Deployment)

```bash
# Railway Token (for CLI deployments)
RAILWAY_TOKEN=xxxxxxxxxxxxxxxxxxxxx
```

**Get it:**
```bash
railway login
railway whoami
```

**Project Settings:**
- Railway automatically injects environment variables
- Set all variables in Railway dashboard
- Don't commit `.railway` directory

---

### Vercel (Alternative Deployment)

```bash
# Vercel Token
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxxx

# Project Settings
VERCEL_ORG_ID=team_xxxxxxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx
```

---

### GitHub (CI/CD)

```bash
# GitHub Personal Access Token
GITHUB_TOKEN=github_pat_xxxxxxxxxxxxxxxxxxxxx
```

**Required Scopes:**
- ✅ `repo` (Full control)
- ✅ `workflow` (Update workflows)
- ✅ `read:org` (Read organization data)

**Get it:**
- Settings → Developer settings → Personal access tokens → Fine-grained tokens

---

## 🔄 Development vs Production

### Development (.env.development)

```bash
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug

# Use free/test API keys
OPENAI_API_KEY=sk-test-xxxxxxxxxxxxx

# Local database
DATABASE_URL=postgresql://localhost:5432/arc_dev
```

### Production (.env.production)

```bash
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
LOG_LEVEL=info

# Production API keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Production database
DATABASE_URL=postgresql://production-db-url
```

---

## 🛡️ Security Best Practices

### ✅ DO:

1. **Use `.env` files locally**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.*.local
   .env.production
   ```

2. **Use environment variables in production**
   - Railway: Dashboard → Variables
   - Vercel: Dashboard → Environment Variables
   - GitHub: Repository → Settings → Secrets

3. **Rotate keys regularly**
   - Every 90 days minimum
   - Immediately if compromised

4. **Use different keys per environment**
   - Development keys
   - Staging keys
   - Production keys

5. **Store securely**
   - Use password manager (1Password, LastPass)
   - Encrypted backup
   - Team secret manager (HashiCorp Vault)

### ❌ DON'T:

1. ❌ Never commit `.env` files to Git
2. ❌ Never share keys in chat/email
3. ❌ Never use production keys in development
4. ❌ Never hardcode secrets in code
5. ❌ Never commit tokens in scripts
6. ❌ Never expose service role keys to frontend

---

## 📦 Reference Storage Solutions

### Option 1: Local Encrypted File

```bash
# Create encrypted backup
gpg -c .env.production
# Creates: .env.production.gpg

# Decrypt when needed
gpg .env.production.gpg
```

### Option 2: Password Manager

**1Password / LastPass:**
- Create "Secure Note"
- Store all variables
- Share with team securely

### Option 3: HashiCorp Vault (Enterprise)

```bash
# Store secret
vault kv put secret/arc/production \
  OPENAI_API_KEY="sk-xxx" \
  DATABASE_URL="postgresql://xxx"

# Retrieve secret
vault kv get secret/arc/production
```

### Option 4: Private GitHub Repository

Create private repo: `mrf103-secrets`

```
mrf103-secrets/
├── .env.production
├── .env.staging
├── .env.development
├── keys/
│   ├── github_token.txt
│   ├── openai_key.txt
│   └── railway_token.txt
└── README.md
```

**Setup:**
```bash
# Create private repo
gh repo create mrf103-secrets --private

# Clone and add secrets
git clone https://github.com/firas103103-oss/mrf103-secrets.git
cd mrf103-secrets

# Add files (ensure it's private!)
cp path/to/.env.production .
git add .
git commit -m "Add production secrets"
git push
```

---

## 🔗 Quick Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Railway Dashboard](https://railway.app/dashboard)
- [GitHub Tokens](https://github.com/settings/tokens)

---

## 📞 Emergency Procedures

### If Keys Are Compromised:

1. **Immediately rotate all affected keys**
   ```bash
   # Revoke old key
   # Generate new key
   # Update all services
   ```

2. **Check usage logs**
   - OpenAI: Platform dashboard
   - Supabase: Logs & Analytics
   - Railway: Observability

3. **Review access logs**
   ```bash
   # Check git history
   git log --all --full-history --source -- **/.env*
   ```

4. **Update all deployments**
   ```bash
   # Railway
   railway variables set OPENAI_API_KEY="new-key"
   
   # Vercel
   vercel env rm OPENAI_API_KEY production
   vercel env add OPENAI_API_KEY production
   ```

---

**© 2026 MRF103 Holdings - Keep Secure! 🔒**
