# Virtual Office Platform

> **Digital Twin Creation & Virtual Workspace Platform**

A comprehensive platform for creating digital twins and managing virtual workspaces with IoT integration, file management, and AI-powered collaboration tools.

## 🌟 Features

### Digital Twin Creation
- **User Profile Management**: Complete user registration with personal, project, and social information
- **File Upload System**: Support for voice samples, photos, and documents
- **IoT Device Integration**: Connect and manage XBio devices (Sentinel, Personal, Auto, Home, Enterprise, Medical, Research)
- **Secure Authentication**: Passcode-protected registration with bcrypt password hashing

### Virtual Workspace
- **Team Collaboration**: Real-time collaborative workspace
- **AI Assistant**: Chat with your digital twin assistant
- **Video Meetings**: Smart video conferencing capabilities
- **Calendar Management**: Schedule and manage appointments

### Technical Features
- **Full-Stack TypeScript**: Type-safe development across client and server
- **React + Vite**: Fast, modern frontend development
- **Express.js**: Robust backend API
- **PostgreSQL + Drizzle ORM**: Powerful database with type-safe queries
- **File Upload with Multer**: Secure file handling with size limits (50MB)
- **Session Management**: PostgreSQL-backed sessions
- **RESTful API**: Clean, documented API endpoints

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd virtual-office-platform
   ```

2. **Run setup script**
   ```bash
   ./scripts/setup.sh
   ```
   This will:
   - Install all dependencies
   - Create upload directories
   - Generate `.env` file from template

3. **Configure environment**
   Edit `.env` with your database credentials:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/virtual_office
   PASSCODE=passcodemrf1Q@
   SESSION_SECRET=your-random-secret-key
   PORT=5000
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Initialize database**
   ```bash
   # Using Drizzle ORM
   npm run db:push
   
   # Or manually with SQL
   psql -d virtual_office -f database/schema.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   This starts:
   - Client: http://localhost:3000
   - Server: http://localhost:5000

## 📁 Project Structure

```
virtual-office-platform/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── pages/             # Page components
│   │   │   ├── Cloning.tsx    # Digital twin creation
│   │   │   └── VirtualOffice.tsx  # Virtual workspace
│   │   ├── components/        # Reusable components
│   │   │   └── ui/           # UI component library
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   └── styles/           # Global styles
│   ├── index.html            # HTML entry point
│   └── public/               # Static assets
│
├── server/                    # Backend Express application
│   ├── routes/               # API route handlers
│   │   ├── cloning.ts        # Digital twin endpoints
│   │   └── health.ts         # Health check endpoints
│   ├── db/                   # Database configuration
│   │   ├── schema.ts         # Drizzle ORM schema
│   │   └── index.ts          # Database connection
│   ├── middleware/           # Express middleware
│   │   ├── multer.ts         # File upload handling
│   │   ├── error-handler.ts # Error handling
│   │   └── cors.ts           # CORS configuration
│   ├── types/                # TypeScript types
│   └── index.ts              # Server entry point
│
├── uploads/                   # File upload storage
│   ├── voice/                # Voice samples
│   ├── photos/               # User photos
│   └── documents/            # Document files
│
├── database/                  # Database scripts
│   ├── schema.sql            # PostgreSQL schema
│   └── migrations/           # Database migrations
│
├── docs/                      # Documentation
│   ├── START_HERE.md         # Getting started guide
│   ├── QUICK_START.md        # Quick reference
│   ├── SYSTEM_DOCUMENTATION.md  # System docs
│   ├── API_REFERENCE.md      # API documentation
│   └── DEPLOYMENT.md         # Deployment guide
│
├── scripts/                   # Utility scripts
│   ├── setup.sh              # Initial setup
│   └── build.sh              # Production build
│
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
├── tailwind.config.ts        # Tailwind CSS config
└── .env.example              # Environment template
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start both client and server
npm run dev:client       # Start client only
npm run dev:server       # Start server only

# Build
npm run build            # Build for production
npm run build:client     # Build client only
npm run build:server     # Build server only

# Database
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio (database GUI)

# Testing
npm test                 # Run tests
npm run type-check       # TypeScript type checking
```

### Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- TailwindCSS
- Radix UI
- React Router
- Lucide Icons

**Backend:**
- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL
- Multer (file uploads)
- Bcrypt (password hashing)
- Express Session

## 🔐 Authentication & Security

### Passcode System
- Default passcode: `passcodemrf1Q@` (configurable via `.env`)
- Required for user registration
- Protects the cloning system from unauthorized access

### Password Security
- Passwords hashed with bcrypt (10 rounds)
- Minimum 8 characters required
- Stored securely in PostgreSQL

### Session Management
- PostgreSQL-backed sessions
- 7-day session lifetime
- HTTP-only cookies
- Secure flag in production

### File Upload Security
- Type validation (voice, images, documents only)
- Size limits (50MB per file)
- Unique filename generation
- Separate storage directories

## 📡 API Endpoints

### Health Check
```
GET /api/health           # Server health check
GET /api/health/db        # Database health check
```

### Cloning System
```
POST /api/cloning/verify-passcode    # Verify access passcode
POST /api/cloning/register           # Register new user with files
GET /api/cloning/profile/:userId     # Get user profile
PUT /api/cloning/profile/:userId     # Update user profile
```

### Request Examples

**Verify Passcode:**
```bash
curl -X POST http://localhost:5000/api/cloning/verify-passcode \
  -H "Content-Type: application/json" \
  -d '{"passcode": "passcodemrf1Q@"}'
```

**Register User:**
```bash
curl -X POST http://localhost:5000/api/cloning/register \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "password=SecurePass123" \
  -F "phoneNumber=+1234567890" \
  -F "personalInfo={\"skills\":\"JavaScript, Python\",\"jobTitle\":\"Developer\"}" \
  -F "voiceSamples=@voice1.mp3" \
  -F "photos=@photo1.jpg"
```

## 🗄️ Database Schema

### Tables

**user_profiles**
- `id` (UUID, primary key)
- `username` (unique)
- `email` (unique)
- `phone_number`
- `password` (bcrypt hashed)
- `personal_info` (JSONB)
- `projects_info` (JSONB)
- `social_info` (JSONB)
- `created_at`, `updated_at`

**user_files**
- `id` (UUID, primary key)
- `user_id` (foreign key → user_profiles)
- `file_type` (voice, photo, document)
- `file_name`
- `file_path`
- `file_size`
- `mime_type`
- `uploaded_at`

**user_iot_devices**
- `id` (UUID, primary key)
- `user_id` (foreign key → user_profiles)
- `device_type` (xbio_sentinel, personal_xbio, etc.)
- `device_name`
- `device_config` (JSONB)
- `is_active`
- `added_at`

## 🚢 Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Required for production:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Authentication
SESSION_SECRET=generate-a-strong-random-secret
PASSCODE=your-secure-passcode

# Server
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# Optional: AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
```

### Deployment Checklist

- [ ] Set secure `SESSION_SECRET` (32+ random characters)
- [ ] Change default `PASSCODE`
- [ ] Configure `DATABASE_URL` for production database
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGIN` to your domain
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up database backups
- [ ] Configure file storage (local or S3)
- [ ] Set up monitoring and logging
- [ ] Run database migrations
- [ ] Test all endpoints

## 📚 Documentation

- **[START_HERE.md](docs/START_HERE.md)** - Navigation hub
- **[QUICK_START.md](docs/QUICK_START.md)** - Quick start guide
- **[SYSTEM_DOCUMENTATION.md](docs/SYSTEM_DOCUMENTATION.md)** - Technical documentation
- **[API_REFERENCE.md](docs/API_REFERENCE.md)** - Complete API reference
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment guide

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation in `/docs`
- Review API reference for endpoint details

## 🎯 Roadmap

- [ ] Voice cloning integration
- [ ] Real-time collaboration features
- [ ] Advanced IoT device management
- [ ] AI-powered digital twin interactions
- [ ] Mobile app support
- [ ] Multi-language support
- [ ] Enterprise SSO integration
- [ ] Advanced analytics dashboard

---

**Made with ❤️ for creating digital twins and virtual workspaces**
