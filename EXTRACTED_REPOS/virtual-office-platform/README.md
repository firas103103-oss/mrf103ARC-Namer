# Virtual Office Platform

## Digital Twin Creation & Virtual Workspace Platform

A comprehensive platform for creating digital twins, managing files, integrating IoT devices, and collaborating in virtual workspaces.

## Features

### 🎭 Digital Twin Creation
- **Voice Cloning**: Upload voice samples (up to 5 files, 50MB each)
- **Visual Cloning**: Upload photos (up to 10 files)
- **Document Management**: Store personal and professional documents
- **Profile Management**: Comprehensive user profiles with personal, project, and social information

### 🔌 IoT Device Integration
- XBio Sentinel integration
- Personal XBio devices
- Auto XBio support
- Real-time device monitoring
- Device configuration management

### 🤖 AI Integrations
- OpenAI integration
- Anthropic Claude
- Google Gemini
- Extensible integration framework

### 🏢 Virtual Workspace
- Collaborative environment
- Real-time communication
- File sharing and management
- Team coordination tools

## Quick Start

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

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup database**
```bash
# Create database
createdb virtual_office

# Run migrations
psql -d virtual_office -f database/schema.sql

# Or use Drizzle
npm run db:push
```

5. **Start development servers**
```bash
npm run dev
```

This will start:
- Client on `http://localhost:3000`
- Server on `http://localhost:5000`

## Access

### Default Passcode
The cloning system requires a passcode for access:

```
Passcode: passcodemrf1Q@
```

You can change this in `.env`:
```env
PASSCODE=your-custom-passcode
```

## Usage

### Creating a Digital Twin

1. Navigate to `http://localhost:3000/cloning`
2. Enter the passcode: `passcodemrf1Q@`
3. Fill in your information:
   - Username and email (required)
   - Password (required)
   - Phone number (optional)
   - Personal information (skills, job title, bio)
   - Project information (GitHub, GitLab, portfolio)
   - Social media links

4. Upload files:
   - **Voice samples**: MP3, WAV, OGG (max 5 files, 50MB each)
   - **Photos**: JPG, PNG, GIF (max 10 files, 50MB each)
   - **Documents**: PDF, DOC, DOCX, TXT (max 10 files, 50MB each)

5. Select IoT devices to integrate
6. Choose AI integrations
7. Click "إنشاء الملف الشخصي" to create your profile

### API Usage

#### Health Check
```bash
curl http://localhost:5000/api/health
```

#### Verify Passcode
```bash
curl -X POST http://localhost:5000/api/cloning/verify-passcode \
  -H "Content-Type: application/json" \
  -d '{"passcode": "passcodemrf1Q@"}'
```

#### Register User
```bash
curl -X POST http://localhost:5000/api/cloning/register \
  -F "username=testuser" \
  -F "email=test@example.com" \
  -F "password=securepassword" \
  -F "voiceSamples=@voice.mp3" \
  -F "photos=@photo.jpg"
```

## Project Structure

```
virtual-office-platform/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── styles/        # Global styles
│   └── index.html
│
├── server/                # Backend Express server
│   ├── routes/           # API routes
│   ├── db/               # Database schema and connection
│   ├── middleware/       # Express middleware
│   └── index.ts          # Server entry point
│
├── database/             # Database migrations and schema
│   └── schema.sql
│
├── docs/                 # Documentation
│   ├── QUICK_START.md
│   ├── SYSTEM_DOCUMENTATION.md
│   ├── API_REFERENCE.md
│   └── DEPLOYMENT.md
│
├── uploads/              # File storage (gitignored)
│   ├── voices/
│   ├── photos/
│   └── documents/
│
└── scripts/              # Utility scripts
```

## Configuration

### Environment Variables

See `.env.example` for all available configuration options:

#### Database
- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL`: Supabase project URL (optional)
- `SUPABASE_KEY`: Supabase API key (optional)

#### Authentication
- `SESSION_SECRET`: Secret for session encryption
- `PASSCODE`: Cloning system access passcode

#### Server
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: Allowed CORS origin

#### File Upload
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 52428800 = 50MB)
- `UPLOAD_PATH`: Path for uploaded files

## Development

### Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client
- `npm run dev:server` - Start only the server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes

### Building for Production

```bash
npm run build
npm start
```

## Database Schema

### Tables

#### user_profiles
- User authentication and profile information
- Personal information (JSON)
- Projects information (JSON)
- Social media links (JSON)

#### user_files
- File metadata and storage paths
- File types: voice, photo, document
- Associated with user profiles

#### user_iot_devices
- IoT device registrations
- Device configurations
- Active/inactive status

See `database/schema.sql` for complete schema details.

## Security

- Passwords are hashed with bcrypt (10 rounds)
- Session-based authentication
- File upload validation and size limits
- CORS configuration
- SQL injection protection via parameterized queries

## File Upload Limits

- **Voice files**: 5 max, 50MB each
- **Photos**: 10 max, 50MB each
- **Documents**: 10 max, 50MB each
- **Allowed types**:
  - Audio: MP3, WAV, OGG, WebM
  - Images: JPEG, PNG, GIF, WebP
  - Documents: PDF, DOC, DOCX, TXT

## Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use a strong `SESSION_SECRET`
3. Configure proper `DATABASE_URL`
4. Set up file storage (local or S3)
5. Configure CORS for your domain
6. Set up SSL/HTTPS
7. Configure reverse proxy (nginx/caddy)
8. Set up database backups
9. Configure monitoring and logging

See `docs/DEPLOYMENT.md` for detailed deployment instructions.

## API Documentation

See `docs/API_REFERENCE.md` for complete API documentation.

## Troubleshooting

### Common Issues

**Database connection fails**
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall settings

**File upload fails**
- Check file size limits
- Verify file type is allowed
- Ensure uploads directory exists and is writable

**Build fails**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)
- Verify all dependencies are installed

## Contributing

This is a standalone extracted platform. For the main project, see the parent repository.

## License

MIT

## Support

For issues and questions, please open an issue in the repository.

## Acknowledgments

Extracted from the mrf103ARC-Namer platform.
