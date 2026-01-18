# Railway Deployment Guide

## Quick Deploy to Railway

### Method 1: Railway CLI (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add environment variables
railway variables set VITE_APP_URL=https://app.mrf103.com
railway variables set VITE_AUTHOR_URL=https://author.mrf103.com
railway variables set VITE_CONTACT_PHONE=+966591652030
railway variables set VITE_CONTACT_EMAIL=mr.f@mrf103.com
railway variables set NODE_ENV=production

# Deploy
railway up
```

### Method 2: GitHub Integration

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will auto-detect and deploy

### Method 3: Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add environment variables in settings:
   - `VITE_APP_URL`
   - `VITE_AUTHOR_URL`
   - `VITE_CONTACT_PHONE`
   - `VITE_CONTACT_EMAIL`
   - `NODE_ENV=production`
4. Deploy

## Environment Variables on Railway

Set these in your Railway project settings:

```env
NODE_ENV=production
VITE_APP_URL=https://app.mrf103.com
VITE_AUTHOR_URL=https://author.mrf103.com
VITE_CONTACT_PHONE=+966591652030
VITE_CONTACT_EMAIL=mr.f@mrf103.com
VITE_ENABLE_THREEJS=true
VITE_ENABLE_ANIMATIONS=true
PORT=3000
```

## Custom Domain

1. Go to your Railway project settings
2. Click "Settings" → "Domains"
3. Click "Generate Domain" or add custom domain
4. Update DNS records if using custom domain:
   - Add CNAME record pointing to Railway URL

## Build Configuration

Railway uses:

- **Builder**: Nixpacks (auto-detected)
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start:railway`
- **Port**: Auto-assigned or from `PORT` env var

## Health Checks

Railway automatically monitors:

- HTTP health checks on `/`
- Server restart on failure (max 10 retries)

## Logs & Monitoring

View logs in Railway dashboard:

```bash
# Or via CLI
railway logs
```

## Troubleshooting

### Build fails

```bash
# Ensure dependencies are installed
railway run npm install
```

### Port issues

Railway assigns `PORT` automatically. The app listens on `0.0.0.0:$PORT`

### Environment variables not working

Make sure variables are prefixed with `VITE_` for client-side access.

## Production URL

After deployment, Railway provides:

- `https://your-project.up.railway.app`
- Custom domain (if configured)

## Update Deployment

```bash
# Push changes
git push

# Or via CLI
railway up
```

## Rollback

```bash
# Via CLI
railway rollback

# Or use Railway dashboard to select previous deployment
```
