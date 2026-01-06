# 🚨 Railway Environment Variables - REQUIRED

## Problem: App crashes with "DATABASE_URL must be set"

Go to Railway Dashboard and add these variables:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres.rffpacsvwxfjhxgtszbzf:mrfiras1Q%40Q%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres

# Authentication
ARC_OPERATOR_PASSWORD=arc-dev-password-123
SESSION_SECRET=generate-random-secret-here-32-chars-min

# Environment
NODE_ENV=production

# Optional: AI Features
OPENAI_API_KEY=your-openai-key-if-you-have-one

# Optional: Sentry (Error Tracking)
SENTRY_DSN=your-sentry-dsn-if-enabled
```

## Steps:
1. Go to: https://railway.app/dashboard
2. Select your project: `mrf103ARC-Namer`
3. Click **Variables** tab
4. Add each variable above
5. Click **Redeploy** or wait for auto-deploy

## Generate SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

After adding variables, your app will work! ✅
