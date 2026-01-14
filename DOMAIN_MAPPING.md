# 🌐 Domain Mapping Configuration

**Date:** January 11, 2026  
**Status:** ✅ Active (HTTP 301 redirects working)

---

## 📍 Domain Structure

### Main Domain
| Domain | Service | Status | Purpose |
|--------|---------|--------|---------|
| **mrf103.com** | Landing Page | 🔍 Checking | Main website/landing |

### Subdomains
| Subdomain | Service | Status | Purpose |
|-----------|---------|--------|---------|
| **app.mrf103.com** | mrf103-arc-ecosystem | ✅ 301 | Main application platform |
| **author.mrf103.com** | Author Platform | ✅ 301 | Content authoring system |
| **ecosystem.mrf103.com** | ARC Ecosystem | ✅ 301 | AI Agent management |
| **cli.mrf103.com** | CLI Tools | ✅ 301 | Command-line interface |
| **core.mrf103.com** | Core Library | ⚠️ 502 | Core functionality |
| **vscode.mrf103.com** | VS Code Extension | ✅ 301 | Editor integration |

---

## 🎯 Railway Deployment Mapping

### Active Deployments
```
Railway Service          →  Custom Domain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
mrf103-arc-ecosystem    →  app.mrf103.com
mrf103-landing          →  mrf103.com
author-platform         →  author.mrf103.com (if deployed)
```

### NPM Packages (Not on Railway)
- **arc-namer-core** → Published to npm (not Railway)
- **arc-namer-cli** → Published to npm (not Railway)
- **xbook-engine** → Published to npm (not Railway)
- **arc-namer-vscode** → Published to VS Code Marketplace (not Railway)

---

## 🔐 SSL Status

| Domain | HTTP | HTTPS | Action |
|--------|------|-------|--------|
| mrf103.com | 🟢 Working | 🔓 Pending | Enable SSL in Railway |
| app.mrf103.com | ✅ 301 | 🔓 Pending | Enable SSL in Railway |
| author.mrf103.com | ✅ 301 | 🔓 Pending | Enable SSL in Railway |
| ecosystem.mrf103.com | ✅ 301 | 🔓 Pending | Enable SSL in Railway |
| cli.mrf103.com | ✅ 301 | 🔓 Pending | Enable SSL in Railway |
| core.mrf103.com | ⚠️ 502 | 🔓 Pending | Server starting + SSL |
| vscode.mrf103.com | ✅ 301 | 🔓 Pending | Enable SSL in Railway |

---

## 🚀 Setup Instructions

### 1. Railway Dashboard Configuration

For each service that needs a custom domain:

```bash
# Step-by-step:
1. Go to: https://railway.app/dashboard
2. Select service (e.g., mrf103-arc-ecosystem)
3. Settings → Domains
4. Add custom domain (e.g., app.mrf103.com)
5. Copy the CNAME/A record provided by Railway
6. Add DNS record in your domain provider
7. Wait for DNS propagation (5-30 minutes)
8. Enable "Generate SSL Certificate"
9. Wait for SSL activation (5-10 minutes)
```

### 2. DNS Records Required

```dns
# Main domain
A     mrf103.com                → Railway IP
CNAME www.mrf103.com           → mrf103.com

# Subdomains
CNAME app.mrf103.com           → [railway-target]
CNAME author.mrf103.com        → [railway-target]
CNAME ecosystem.mrf103.com     → [railway-target]
CNAME cli.mrf103.com           → [railway-target]
CNAME core.mrf103.com          → [railway-target]
CNAME vscode.mrf103.com        → [railway-target]
```

### 3. Verification Commands

```bash
# Check domain status
./deployment-status.sh

# Test specific domain
curl -I https://app.mrf103.com

# Check DNS propagation
nslookup app.mrf103.com

# Full test
for sub in app author ecosystem cli core vscode; do
  echo "$sub.mrf103.com:";
  curl -sI "https://$sub.mrf103.com" | head -1;
done
```

---

## 📊 Current Status Summary

### ✅ Working (HTTP 301)
- app.mrf103.com
- author.mrf103.com
- ecosystem.mrf103.com
- cli.mrf103.com
- vscode.mrf103.com

### ⚠️ Issues
- **core.mrf103.com** - Server starting (502)
- **mrf103.com** - Needs verification

### 🔓 Pending
- **SSL Certificates** - Need to enable in Railway Dashboard for all domains

---

## 🔗 Related Files

- [DEPLOYMENT_COMPLETE_SUMMARY.md](DEPLOYMENT_COMPLETE_SUMMARY.md) - Complete deployment guide
- [DOMAIN_SSL_SETUP.md](DOMAIN_SSL_SETUP.md) - SSL configuration instructions
- [ENVIRONMENT_VARIABLES_GUIDE.md](ENVIRONMENT_VARIABLES_GUIDE.md) - Environment setup
- [deployment-status.sh](deployment-status.sh) - Status check script

---

## 📝 Notes

- **301 Redirects**: Indicate HTTP is working and redirecting to HTTPS
- **502 Errors**: Usually mean server is starting or environment variables missing
- **SSL Pending**: Requires manual activation in Railway Dashboard
- **DNS Propagation**: Can take 5-30 minutes after adding records

---

**Last Updated:** January 11, 2026  
**Next Action:** Enable SSL certificates for all domains in Railway Dashboard
