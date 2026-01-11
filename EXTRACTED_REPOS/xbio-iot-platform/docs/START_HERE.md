# 🏁 START HERE - XBio IoT Platform Navigation Hub

Welcome to the **XBio IoT Platform**! This document will guide you to the right resources based on your role and needs.

---

## 🎯 I Want To...

### 🚀 Get Started Quickly
**→ [QUICK_START.md](QUICK_START.md)**
- Set up the development environment
- Run your first sensor monitoring session
- Create your first smell profile

### 🔧 Set Up Hardware
**→ [HARDWARE_GUIDE.md](HARDWARE_GUIDE.md)**
- Wire ESP32 and BME688 sensor
- Upload firmware to ESP32
- Connect device to the platform

### 📖 Understand the System
**→ [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)**
- Architecture overview
- Technology stack
- Data flow and components

### 🔌 Use the API
**→ [API_REFERENCE.md](API_REFERENCE.md)**
- REST API endpoints
- WebSocket protocol
- Request/response examples

### 🚢 Deploy to Production
**→ [DEPLOYMENT.md](DEPLOYMENT.md)**
- Environment configuration
- Database setup
- Cloud deployment guides

---

## 👥 For Different Roles

### End Users
1. Read [QUICK_START.md](QUICK_START.md)
2. Follow setup instructions
3. Start monitoring air quality

### Developers
1. Read [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
2. Review [API_REFERENCE.md](API_REFERENCE.md)
3. Check database schema in `/database/schema.sql`

### Hardware Engineers
1. Read [HARDWARE_GUIDE.md](HARDWARE_GUIDE.md)
2. Review firmware in `/firmware/esp32-xbio/`
3. Test sensor connectivity

### DevOps/SysAdmins
1. Read [DEPLOYMENT.md](DEPLOYMENT.md)
2. Configure environment variables
3. Set up monitoring

---

## 📁 Project Structure

```
xbio-iot-platform/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/       # BioSentinel page
│   │   ├── components/  # UI components
│   │   └── lib/         # Utilities
│   └── index.html
├── server/              # Express backend
│   ├── routes/          # API routes
│   ├── db/              # Database connection
│   ├── middleware/      # Express middleware
│   └── index.ts         # Server entry point
├── firmware/            # ESP32 firmware
│   └── esp32-xbio/      # BME688 sensor code
├── database/            # Database schema
│   └── schema.sql
├── docs/                # Documentation
├── scripts/             # Helper scripts
└── shared/              # Shared TypeScript types
```

---

## 🆘 Getting Help

### Common Issues
- **Can't connect to device**: Check [HARDWARE_GUIDE.md](HARDWARE_GUIDE.md)
- **Database errors**: Review connection string in `.env`
- **WebSocket not connecting**: Check firewall and ports

### Support Channels
- GitHub Issues
- Documentation in `/docs/`
- API Reference for endpoint details

---

## 🎓 Learning Path

### Beginner
1. ✅ Read this file
2. ✅ Complete [QUICK_START.md](QUICK_START.md)
3. ✅ Explore the web interface

### Intermediate
1. ✅ Review [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
2. ✅ Understand [API_REFERENCE.md](API_REFERENCE.md)
3. ✅ Modify and test code

### Advanced
1. ✅ Set up hardware with [HARDWARE_GUIDE.md](HARDWARE_GUIDE.md)
2. ✅ Deploy with [DEPLOYMENT.md](DEPLOYMENT.md)
3. ✅ Contribute improvements

---

## 📋 Quick Reference

### Commands
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm start           # Run production build
./scripts/setup.sh  # Initial setup
```

### URLs
```
Frontend:  http://localhost:3000
Backend:   http://localhost:5000
WebSocket: ws://localhost:5000/ws/bio-sentinel
```

### Key Files
- `.env.example` - Environment template
- `package.json` - Dependencies
- `README.md` - Project overview

---

**Ready to start? → [QUICK_START.md](QUICK_START.md)**
