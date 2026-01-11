# Virtual Office Platform - Start Here

Welcome to the Virtual Office Platform! This guide will help you navigate the documentation and get started quickly.

## 📖 Documentation Map

### Getting Started
1. **[QUICK_START.md](QUICK_START.md)** ⚡
   - 5-minute setup guide
   - Basic configuration
   - First run instructions
   - Common commands

2. **[README.md](../README.md)** 📚
   - Complete project overview
   - Feature descriptions
   - Architecture details
   - Development guide

### Technical Documentation
3. **[SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)** 🔧
   - System architecture
   - Database schema details
   - File structure explanation
   - Component relationships

4. **[API_REFERENCE.md](API_REFERENCE.md)** 📡
   - Complete API endpoints
   - Request/response formats
   - Authentication details
   - Code examples

### Deployment
5. **[DEPLOYMENT.md](DEPLOYMENT.md)** 🚀
   - Production deployment guide
   - Environment configuration
   - Security checklist
   - Monitoring setup

## 🎯 Quick Navigation

### I want to...

#### 👨‍💻 Start developing
→ Go to [QUICK_START.md](QUICK_START.md)  
→ Run `npm run dev`

#### 📖 Understand the system
→ Read [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)  
→ Review database schema

#### 🔌 Use the API
→ Check [API_REFERENCE.md](API_REFERENCE.md)  
→ Test with curl examples

#### 🚢 Deploy to production
→ Follow [DEPLOYMENT.md](DEPLOYMENT.md)  
→ Complete security checklist

#### 🐛 Debug an issue
→ Check logs in console  
→ Review [Troubleshooting](#troubleshooting) section  
→ Verify database connection

## 🏗️ Project Overview

### What is this?
A comprehensive platform for creating **digital twins** and managing **virtual workspaces**:

- **Digital Twin Creation**: Complete user profiles with voice, photos, and documents
- **IoT Integration**: Connect and manage XBio devices
- **Virtual Workspace**: Collaborative tools and AI assistance
- **File Management**: Secure upload and storage system

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passcode + bcrypt password hashing
- **File Storage**: Multer with local/S3 support

## 🚀 Quick Setup (1-2-3)

```bash
# 1. Setup
./scripts/setup.sh

# 2. Configure
# Edit .env with your database URL

# 3. Run
npm run dev
```

Visit: http://localhost:3000/cloning

## 📁 Key Directories

```
├── client/src/           # Frontend React app
│   ├── pages/           # Page components
│   ├── components/ui/   # UI components
│   └── styles/          # CSS styles
│
├── server/              # Backend Express app
│   ├── routes/          # API endpoints
│   ├── db/              # Database schema
│   └── middleware/      # Express middleware
│
├── database/            # SQL schemas & migrations
├── uploads/             # File storage
├── docs/                # Documentation (you are here)
└── scripts/             # Utility scripts
```

## 🔐 Security & Authentication

### Passcode System
- **Default**: `passcodemrf1Q@` (change in production!)
- **Location**: `.env` → `PASSCODE=your_value`
- **Purpose**: Protect registration from unauthorized access

### User Authentication
- Passwords hashed with bcrypt (10 rounds)
- PostgreSQL-backed sessions (7-day lifetime)
- HTTP-only secure cookies
- CSRF protection enabled

## 📊 Database Schema

### Core Tables
1. **user_profiles** - User information
2. **user_files** - Uploaded files
3. **user_iot_devices** - Connected IoT devices

→ See [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md) for complete schema

## 🎨 Features

### Digital Twin Creation
✅ Multi-step registration flow  
✅ Voice sample upload (MP3, WAV)  
✅ Photo upload (JPG, PNG)  
✅ Document upload (PDF, DOC)  
✅ IoT device selection  
✅ Social profile integration  

### Virtual Workspace
✅ Team collaboration tools  
✅ AI assistant integration  
✅ Video meeting support  
✅ Calendar management  

## 🔧 Development Workflow

### Daily Development
```bash
# Start dev servers
npm run dev

# In separate terminals:
npm run dev:client    # Frontend only
npm run dev:server    # Backend only

# Type checking
npm run type-check

# Database management
npm run db:studio     # Visual DB editor
```

### Making Changes

1. **Frontend Changes**
   - Edit files in `client/src/`
   - Hot reload automatically updates browser
   - TypeScript errors shown in terminal

2. **Backend Changes**
   - Edit files in `server/`
   - Server auto-restarts with `tsx watch`
   - Check logs in terminal

3. **Database Changes**
   - Update `server/db/schema.ts`
   - Run `npm run db:push`
   - Or create migration in `database/migrations/`

## 📡 API Quick Test

```bash
# Health check
curl http://localhost:5000/api/health

# Response:
# {"success":true,"message":"Virtual Office Platform is running"}
```

## 🐛 Troubleshooting

### Common Issues

**"Cannot find module"**
```bash
npm install
```

**"Port 5000 already in use"**
```bash
# Change PORT in .env
PORT=5001
```

**"Database connection failed"**
```bash
# Check DATABASE_URL in .env
# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

**"TypeScript errors"**
```bash
npm run type-check
# Fix reported errors
```

## 📚 Learning Path

### Beginner
1. Read [QUICK_START.md](QUICK_START.md)
2. Run the app locally
3. Test the cloning flow
4. Review main [README.md](../README.md)

### Intermediate
1. Study [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
2. Review database schema
3. Explore API endpoints
4. Modify UI components

### Advanced
1. Review [API_REFERENCE.md](API_REFERENCE.md)
2. Study [DEPLOYMENT.md](DEPLOYMENT.md)
3. Customize authentication
4. Add new features

## 🎯 Next Steps

Choose your path:

- **New to the project?** → [QUICK_START.md](QUICK_START.md)
- **Ready to code?** → [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
- **Need API docs?** → [API_REFERENCE.md](API_REFERENCE.md)
- **Deploying?** → [DEPLOYMENT.md](DEPLOYMENT.md)

## 🆘 Getting Help

1. **Check Documentation**
   - Search in `docs/` folder
   - Review relevant MD file
   - Check code comments

2. **Debug**
   - Check browser console (F12)
   - Review server logs
   - Test API with curl

3. **Common Solutions**
   - Clear `node_modules` and reinstall
   - Check `.env` configuration
   - Verify database connection
   - Review file permissions

## 💡 Pro Tips

- Use `npm run db:studio` to visually explore your database
- Check `uploads/` directory permissions (needs write access)
- Keep `.env` secret - never commit it!
- Use `npm run type-check` before committing
- Read error messages carefully - they're helpful!

## 📞 Support Channels

- 📖 Documentation in `docs/`
- 💬 Issues on GitHub
- 📧 Email support (if configured)
- 🔍 Search existing issues first

---

**Ready to start? Go to [QUICK_START.md](QUICK_START.md)** 🚀

---

Made with ❤️ for digital twin creation
