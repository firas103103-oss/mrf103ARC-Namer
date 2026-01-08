# 🧪 Staging Environment Setup Guide

Complete guide for setting up a staging environment for the ARC Namer AI Platform.

---

## 📋 Overview

The staging environment is a production-like environment used for:
- Testing new features before production deployment
- QA testing and user acceptance testing (UAT)
- Performance testing and optimization
- Integration testing with external services
- Training and demonstrations

**Staging URL:** https://staging.app.mrf103.com

---

## 🎯 Prerequisites

Before setting up staging, ensure you have:
- ✅ Railway account with project access
- ✅ Supabase account with project access
- ✅ Cloudflare account with DNS access
- ✅ Domain: app.mrf103.com (or subdomain access)
- ✅ Git repository with `develop` branch
- ✅ Access to production environment variables

---

## 🏗️ Setup Steps

### Step 1: Create Railway Staging Environment

#### 1.1 Create New Service (Recommended)
```bash
# Option A: Create separate Railway project
railway init
railway link

# Option B: Add environment to existing project
railway environment create staging
```

#### 1.2 Configure Railway
```yaml
# railway.json (add staging config)
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "nixpacksPlan": {
      "phases": {
        "setup": {
          "nixPkgs": ["nodejs_20"]
        },
        "install": {
          "cmds": ["npm ci --legacy-peer-deps"]
        },
        "build": {
          "cmds": ["npm run build"]
        }
      }
    }
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  },
  "environments": {
    "staging": {
      "variables": {
        "NODE_ENV": "staging"
      }
    }
  }
}
```

#### 1.3 Set Environment Variables
```bash
# Set staging environment variables in Railway Dashboard
NODE_ENV=staging
DATABASE_URL=postgresql://... # Staging database
SESSION_SECRET=staging-secret-key
ARC_BACKEND_SECRET=staging-backend-secret
VITE_API_URL=https://staging.app.mrf103.com

# Supabase (Staging Project)
SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-role-key

# Sentry (Staging)
SENTRY_DSN=https://...@sentry.io/... # Use same or separate project
```

---

### Step 2: Create Supabase Staging Project

#### 2.1 Create New Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `arc-namer-staging`
4. Region: Same as production
5. Database Password: Generate strong password

#### 2.2 Copy Database Schema
```bash
# Export production schema
pg_dump $PRODUCTION_DATABASE_URL --schema-only > schema.sql

# Import to staging
psql $STAGING_DATABASE_URL < schema.sql

# Or use Supabase migrations
supabase db dump -f schema.sql
supabase db push
```

#### 2.3 Configure Auth URLs
Add staging URLs in Supabase Dashboard → Authentication → URL Configuration:
```
Site URL: https://staging.app.mrf103.com
Redirect URLs:
  - https://staging.app.mrf103.com/auth/callback
  - https://staging.app.mrf103.com/auth/confirm
  - https://staging.app.mrf103.com/dashboard
  - http://localhost:5000/auth/callback (for local staging testing)
```

---

### Step 3: Configure DNS (Cloudflare)

#### 3.1 Add CNAME Record
```
Type: CNAME
Name: staging
Content: your-railway-staging-url.railway.app
Proxy: Enabled (Orange Cloud)
TTL: Auto
```

#### 3.2 Verify DNS
```bash
# Check DNS propagation
dig staging.app.mrf103.com

# Should return:
# staging.app.mrf103.com. 300 IN CNAME your-railway-staging-url.railway.app
```

#### 3.3 Enable SSL
SSL is automatic with Cloudflare proxy enabled. Verify:
```bash
curl -I https://staging.app.mrf103.com
# Should return: HTTP/2 200
```

---

### Step 4: Configure Git Branch Strategy

#### 4.1 Create `develop` Branch
```bash
# Create develop branch from main
git checkout -b develop
git push -u origin develop

# Set branch protection rules in GitHub
# Settings → Branches → Add rule
# Branch name pattern: develop
# ✓ Require pull request reviews before merging
# ✓ Require status checks to pass
```

#### 4.2 Update CI/CD Workflow
The CI/CD pipeline is already configured to deploy `develop` branch to staging:
```yaml
# .github/workflows/ci-cd.yml
deploy-staging:
  if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
  environment:
    name: staging
    url: https://staging.app.mrf103.com
```

---

### Step 5: Environment-Specific Configuration

#### 5.1 Create `.env.staging`
```bash
# .env.staging (local staging testing)
NODE_ENV=staging
VITE_API_URL=https://staging.app.mrf103.com
DATABASE_URL=postgresql://staging-db-url
SUPABASE_URL=https://staging-project.supabase.co
SUPABASE_ANON_KEY=staging-anon-key
SENTRY_DSN=https://...@sentry.io/...
```

#### 5.2 Add to .gitignore
```bash
# Ensure .env.staging is in .gitignore
echo ".env.staging" >> .gitignore
```

#### 5.3 Update package.json Scripts
```json
{
  "scripts": {
    "dev:staging": "NODE_ENV=staging vite --mode staging",
    "build:staging": "NODE_ENV=staging npm run build",
    "preview:staging": "NODE_ENV=staging vite preview"
  }
}
```

---

### Step 6: Data Management

#### 6.1 Seed Staging Database
```bash
# Option A: Copy sanitized production data
pg_dump $PRODUCTION_DATABASE_URL --data-only | psql $STAGING_DATABASE_URL

# Option B: Use seed script
npm run db:seed:staging

# Option C: Use test data
node scripts/generate-test-data.js
```

#### 6.2 Create Test Users
```sql
-- Insert test users in Supabase staging
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES 
  ('test@example.com', 'hashed-password', NOW()),
  ('qa@example.com', 'hashed-password', NOW());
```

---

### Step 7: Testing & Validation

#### 7.1 Smoke Tests
```bash
# Test staging deployment
curl -I https://staging.app.mrf103.com
# Expected: HTTP/2 200

# Test API endpoints
curl https://staging.app.mrf103.com/api/health
# Expected: {"status":"ok"}

# Test authentication
curl https://staging.app.mrf103.com/api/auth/session
# Expected: Valid response
```

#### 7.2 End-to-End Tests
```bash
# Run E2E tests against staging
STAGING_URL=https://staging.app.mrf103.com npm run test:e2e

# Or use specific test script
node arc_e2e_verifier.js --env=staging
```

#### 7.3 Performance Tests
```bash
# Load testing (optional)
# Install Artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 https://staging.app.mrf103.com
```

---

## 🔄 Deployment Workflow

### Development → Staging → Production

```
┌─────────────┐
│  Developer  │
└──────┬──────┘
       │ git push origin feature/xyz
       ▼
┌─────────────────┐
│  Feature Branch │
└──────┬──────────┘
       │ Pull Request → develop
       ▼
┌─────────────────┐
│ develop Branch  │ ──→ Auto-deploy to Staging
└──────┬──────────┘     (CI/CD Pipeline)
       │                ✓ Tests pass
       │                ✓ QA approval
       │ Pull Request → main
       ▼
┌─────────────────┐
│   main Branch   │ ──→ Auto-deploy to Production
└─────────────────┘     (CI/CD Pipeline)
```

### Deployment Commands

```bash
# 1. Develop and test locally
git checkout -b feature/new-feature
# ... make changes ...
npm run dev

# 2. Push to feature branch
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 3. Create PR to develop
# GitHub → Pull Requests → New PR
# Base: develop ← Compare: feature/new-feature

# 4. Merge to develop (auto-deploys to staging)
# After PR approval and merge, CI/CD deploys to staging

# 5. Test on staging
# QA team tests on https://staging.app.mrf103.com

# 6. Create PR from develop to main
# GitHub → Pull Requests → New PR
# Base: main ← Compare: develop

# 7. Merge to main (auto-deploys to production)
# After PR approval and merge, CI/CD deploys to production
```

---

## 🔒 Security Considerations

### Staging Environment Security

```yaml
Security Checklist:
  ✓ Use separate database (not production)
  ✓ Use test API keys (not production keys)
  ✓ Sanitize data (no real user data)
  ✓ Use staging Sentry project
  ✓ Enable basic auth (optional)
  ✓ Restrict access by IP (optional)
  ✓ Use .env.staging (never commit)
  ✓ Rotate secrets regularly
```

### Optional: Basic Auth for Staging

```typescript
// server/index.ts (staging only)
if (process.env.NODE_ENV === 'staging') {
  app.use((req, res, next) => {
    const auth = { login: 'admin', password: 'staging-pass' };
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    
    if (login === auth.login && password === auth.password) {
      return next();
    }
    
    res.set('WWW-Authenticate', 'Basic realm="Staging"');
    res.status(401).send('Authentication required');
  });
}
```

---

## 📊 Monitoring & Logging

### Staging Monitoring Setup

```yaml
# Configure Sentry for staging
SENTRY_DSN: staging-specific-dsn
SENTRY_ENVIRONMENT: staging
SENTRY_TRACES_SAMPLE_RATE: 1.0  # 100% in staging

# Railway Logs
# Access via: Railway Dashboard → Staging Service → Deployments → Logs

# Cloudflare Analytics
# Access via: Cloudflare Dashboard → Analytics → staging subdomain
```

---

## 🧪 Testing Checklist

### Pre-Production Testing on Staging

```
□ Functional Testing
  □ All pages load correctly
  □ Navigation works
  □ Forms submit successfully
  □ Authentication works (login/logout)
  □ API endpoints respond correctly

□ Integration Testing
  □ Database connections work
  □ Supabase auth works
  □ External API integrations work
  □ WebSocket connections work

□ Performance Testing
  □ Page load time < 3s
  □ API response time < 200ms
  □ No memory leaks
  □ Database queries optimized

□ Security Testing
  □ HTTPS enforced
  □ CORS configured correctly
  □ Authentication required
  □ No exposed secrets

□ Browser Testing
  □ Chrome/Edge (latest)
  □ Firefox (latest)
  □ Safari (latest)
  □ Mobile browsers

□ Accessibility Testing
  □ Keyboard navigation
  □ Screen reader compatibility
  □ Color contrast
  □ ARIA labels
```

---

## 🚨 Troubleshooting

### Common Issues

#### Issue 1: Staging deployment fails
```bash
# Check Railway logs
railway logs --environment staging

# Check build output
npm run build

# Verify environment variables
railway variables --environment staging
```

#### Issue 2: Database connection fails
```bash
# Test database connection
psql $STAGING_DATABASE_URL

# Check connection string format
# Should be: postgresql://user:pass@host:port/database

# Verify Supabase project is active
# Dashboard → Project Settings → Database
```

#### Issue 3: SSL certificate not working
```bash
# Verify Cloudflare proxy is enabled
# DNS record should show orange cloud

# Check SSL mode in Cloudflare
# SSL/TLS → Overview → Full (strict)

# Wait for SSL provisioning (can take 10-15 minutes)
```

#### Issue 4: CORS errors
```bash
# Add staging URL to allowed origins
# server/index.ts
const allowedOrigins = [
  'https://staging.app.mrf103.com',
  // ... other origins
];
```

---

## 📝 Maintenance

### Regular Staging Maintenance

```yaml
Weekly:
  - Review staging logs for errors
  - Update dependencies
  - Sync database schema with production
  - Clean up old test data

Monthly:
  - Rotate staging secrets
  - Review and update test data
  - Performance audit
  - Security scan

Quarterly:
  - Full staging rebuild
  - Review and update documentation
  - Staging environment cost review
```

---

## 📚 Additional Resources

### Documentation
- [Railway Docs](https://docs.railway.app/)
- [Supabase Docs](https://supabase.com/docs)
- [Cloudflare Docs](https://developers.cloudflare.com/)
- [GitHub Actions Docs](https://docs.github.com/actions)

### Tools
- **Railway CLI**: `npm install -g @railway/cli`
- **Supabase CLI**: `npm install -g supabase`
- **Artillery** (Load Testing): `npm install -g artillery`

### Support
- Railway Discord: https://discord.gg/railway
- Supabase Discord: https://discord.supabase.com/
- Project Issues: https://github.com/firas103103-oss/mrf103ARC-Namer/issues

---

## ✅ Staging Environment Checklist

### Final Verification

```
□ Railway staging environment created
□ Environment variables configured
□ Supabase staging project created
□ Database schema copied/migrated
□ DNS CNAME record added (staging.app.mrf103.com)
□ SSL certificate active
□ CI/CD pipeline configured
□ develop branch created
□ Branch protection rules set
□ Test data seeded
□ Smoke tests passed
□ Integration tests passed
□ Documentation updated
□ Team notified
```

---

**Status:** 🧪 Staging Setup Guide Complete  
**Last Updated:** 2026-01-06  
**Next Steps:** Execute staging setup following this guide

---

**Related Documents:**
- [DEPLOYMENT_QUICK_GUIDE.md](DEPLOYMENT_QUICK_GUIDE.md) - Production deployment
- [PROJECT_CLOSURE_REPORT.md](PROJECT_CLOSURE_REPORT.md) - Project status
- [CI/CD Pipeline](.github/workflows/ci-cd.yml) - Automated deployment
