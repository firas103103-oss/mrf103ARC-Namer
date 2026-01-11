# Virtual Office Platform - Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database URL
```

### 3. Setup Database
```bash
# Create database
createdb virtual_office

# Run migration
psql -d virtual_office -f database/schema.sql

# Or use Drizzle
npm run db:push
```

### 4. Start Development
```bash
npm run dev
```

Visit: http://localhost:3000/cloning

## Default Credentials

**Passcode:** `passcodemrf1Q@`

## Quick Test

1. Enter passcode on initial screen
2. Fill registration form
3. Upload files (optional)
4. Select IoT devices (optional)
5. Submit to create digital twin

## Common Commands

```bash
# Development
npm run dev              # Start both servers
npm run dev:client       # Frontend only (port 3000)
npm run dev:server       # Backend only (port 5000)

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open database GUI

# Build
npm run build            # Production build
npm start                # Run production server

# Type checking
npm run type-check       # Check TypeScript
```

## File Upload Limits

- **Voice samples**: MP3, WAV, OGG, WebM (max 5 files)
- **Photos**: JPG, PNG, GIF, WebP (max 10 files)
- **Documents**: PDF, DOC, DOCX, TXT (max 10 files)
- **Max file size**: 50MB per file

## API Quick Reference

```bash
# Health check
curl http://localhost:5000/api/health

# Verify passcode
curl -X POST http://localhost:5000/api/cloning/verify-passcode \
  -H "Content-Type: application/json" \
  -d '{"passcode": "passcodemrf1Q@"}'

# Get user profile
curl http://localhost:5000/api/cloning/profile/{userId}
```

## Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env
PORT=5001
```

**Database connection failed:**
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
pg_ctl status
```

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- [ ] Read full [README.md](../README.md)
- [ ] Review [API_REFERENCE.md](API_REFERENCE.md)
- [ ] Check [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
- [ ] See [DEPLOYMENT.md](DEPLOYMENT.md) for production

## Need Help?

1. Check [docs/](.) for detailed guides
2. Review error logs in console
3. Verify database connection
4. Check file permissions in `uploads/`

## Features Overview

✅ User registration with passcode  
✅ File uploads (voice, photos, documents)  
✅ IoT device management  
✅ PostgreSQL database  
✅ Session management  
✅ RESTful API  
✅ TypeScript full-stack  
✅ React + Vite frontend  
✅ Express backend  

---

**Ready to build? Run `npm run dev`** 🚀
