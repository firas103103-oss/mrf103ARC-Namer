# 🎯 START HERE - Virtual Office Platform

Welcome to the Virtual Office Platform! This guide will help you get started quickly.

## 📖 What is This?

The Virtual Office Platform is a standalone application for creating **digital twins** - complete digital representations of individuals including:
- Personal information and skills
- Voice samples and photos
- Documents and portfolios
- IoT device connections
- API integrations

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
npm run setup
```

This will:
- Install all required npm packages
- Create `.env` file from template
- Create upload directories

### Step 2: Configure Database
Edit `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/virtual_office
SESSION_SECRET=<generate-a-random-32-char-string>
```

### Step 3: Initialize Database
```bash
npm run db:push
```

This creates all required tables in your PostgreSQL database.

### Step 4: Start Development
```bash
npm run dev
```

Visit http://localhost:3000 and use passcode: `passcodemrf1Q@`

## 📂 Project Structure

```
├── client/          → Frontend (React + Vite)
├── server/          → Backend (Express + TypeScript)
├── database/        → SQL schema files
├── uploads/         → File storage
├── docs/            → Documentation
└── scripts/         → Utility scripts
```

## 🔑 Default Credentials

**Passcode**: `passcodemrf1Q@`

(Change this in `.env` via `PASSCODE` variable)

## 📚 Next Steps

1. **Read the Quick Start**: [docs/QUICK_START.md](docs/QUICK_START.md)
2. **Explore the API**: [docs/API_REFERENCE.md](docs/API_REFERENCE.md)
3. **Deploy to Production**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## ❓ Common Issues

### "Cannot connect to database"
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists

### "Port already in use"
- Change PORT in .env (default: 5000)
- Or stop the process using the port

### "npm run dev" fails
- Run `npm install` first
- Check Node.js version (requires 18+)

## 🆘 Need Help?

- Check [docs/SYSTEM_DOCUMENTATION.md](docs/SYSTEM_DOCUMENTATION.md)
- Review [docs/QUICK_START.md](docs/QUICK_START.md)
- Open an issue on GitHub

---

**Ready to create your digital twin? Let's go! 🚀**
