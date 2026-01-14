# 🚀 Virtual Office Platform

## Digital Twin Creation & Virtual Workspace Platform

A complete, standalone platform for creating digital twins with advanced AI integration, file management, and IoT device connectivity.

---

## ✨ Features

### 🔐 Security
- **Passcode Protection**: Secure access with configurable passcode (`passcodemrf1Q@`)
- **Encrypted Storage**: Bcrypt password hashing
- **Session Management**: PostgreSQL-backed sessions
- **Rate Limiting**: Protection against abuse
- **CORS & Helmet**: Enhanced security headers

### 📤 File Upload System
- **Voice Samples**: Up to 5 files (MP3, WAV, OGG, WebM) - Max 50MB each
- **Photos**: Up to 10 images (JPG, PNG, GIF, WebP) - Max 50MB each
- **Documents**: Up to 10 files (PDF, DOC, DOCX, TXT) - Max 50MB each
- **Automatic Organization**: Files sorted into categorized directories

### 🤖 IoT Device Integration
**Available Devices:**
- ✅ XBio Sentinel
- ✅ Personal XBio
- ✅ Auto XBio

**Coming Soon:**
- ⏳ Home XBio
- ⏳ Enterprise XBio
- ⏳ Medical XBio
- ⏳ Research XBio

### 🔗 API Integrations
**Active:**
- ✅ Google OAuth
- ✅ GitHub
- ✅ OpenAI
- ✅ Anthropic Claude
- ✅ Google Gemini

**Coming Soon:**
- ⏳ Slack
- ⏳ Discord
- ⏳ Notion
- ⏳ Zapier
- ⏳ Make

---

## 🏗️ Architecture

```
virtual-office-platform/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/         # Cloning page
│   │   ├── components/    # UI components
│   │   └── hooks/         # React hooks
│   └── index.html
│
├── server/                 # Express backend
│   ├── routes/            # API routes
│   ├── db/                # Database schema & connection
│   ├── middleware/        # Custom middleware
│   └── index.ts
│
├── uploads/               # File storage
│   └── cloning/
│       ├── voices/
│       ├── photos/
│       └── documents/
│
├── database/              # SQL migrations
└── docs/                  # Documentation
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd virtual-office-platform
```

2. **Run setup script**
```bash
npm run setup
```

3. **Configure environment**
Edit `.env` with your database credentials:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/virtual_office
SESSION_SECRET=your-random-32-char-secret
PASSCODE=passcodemrf1Q@
```

4. **Initialize database**
```bash
npm run db:push
```

5. **Start development servers**
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

---

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get started in 5 minutes
- **[System Documentation](docs/SYSTEM_DOCUMENTATION.md)** - Complete system overview
- **[API Reference](docs/API_REFERENCE.md)** - API endpoints documentation
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment

---

## 🔌 API Endpoints

### Cloning System

#### Verify Passcode
```http
POST /api/cloning/verify-passcode
Content-Type: application/json

{
  "passcode": "passcodemrf1Q@"
}
```

#### Register User
```http
POST /api/cloning/register
Content-Type: multipart/form-data

{
  "username": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string",
  "personalInfo": "json",
  "projectsInfo": "json",
  "socialInfo": "json",
  "voiceSamples": [files],
  "photos": [files],
  "documents": [files],
  "selectedDevices": ["array"],
  "selectedIntegrations": ["array"]
}
```

#### Get User Profile
```http
GET /api/cloning/profile/:userId
```

---

## 🗄️ Database Schema

### Tables
1. **user_profiles** - User account information
2. **user_files** - Uploaded files metadata
3. **user_iot_devices** - Connected IoT devices

See [database/schema.sql](database/schema.sql) for complete schema.

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Lucide React** - Icons

### Backend
- **Express** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Multer** - File uploads
- **Bcrypt** - Password hashing
- **Helmet** - Security headers

---

## 🔒 Security Features

- ✅ Bcrypt password hashing (10 rounds)
- ✅ Session-based authentication
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ File type validation
- ✅ File size limits
- ✅ SQL injection protection (Drizzle ORM)
- ✅ XSS protection

---

## 📦 Production Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Variables
Ensure all production environment variables are set:
- `NODE_ENV=production`
- `DATABASE_URL` - Production database
- `SESSION_SECRET` - Strong random secret
- `CORS_ORIGIN` - Your production domain

---

## 🧪 Testing

The platform includes:
- File upload validation
- Passcode verification
- User registration flow
- Database operations

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

---

## 📞 Support

For support and questions:
- Documentation: [docs/](docs/)
- Issues: Open a GitHub issue

---

## 🎯 Roadmap

- [ ] Add more IoT device types
- [ ] Enhanced AI integrations
- [ ] Real-time collaboration features
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: January 2026
