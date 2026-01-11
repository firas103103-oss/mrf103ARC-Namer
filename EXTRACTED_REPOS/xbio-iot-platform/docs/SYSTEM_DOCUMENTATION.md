# 📚 System Documentation - XBio IoT Platform

Complete technical documentation for developers and system architects.

---

## 🏗️ Architecture Overview

### System Components

```
┌──────────────────────────────────────────────┐
│           Client Application                  │
│  React + TypeScript + TailwindCSS + WS       │
│                                               │
│  - BioSentinel Dashboard                     │
│  - Real-time Charts                          │
│  - AI Chat Interface                         │
│  - Smell Profile Manager                     │
└─────────────────┬────────────────────────────┘
                  │
                  │ HTTP/REST + WebSocket
                  │
┌─────────────────▼────────────────────────────┐
│           Server Application                  │
│    Express + TypeScript + WebSocket          │
│                                               │
│  - REST API Routes                           │
│  - WebSocket Handler                         │
│  - Database Layer (Drizzle ORM)             │
│  - AI Integration (OpenAI)                   │
└────────┬─────────────────┬──────────────────┘
         │                 │
         │                 │
    ┌────▼──────┐    ┌─────▼─────────┐
    │PostgreSQL │    │  OpenAI API   │
    │ Database  │    │   GPT-4       │
    └───────────┘    └───────────────┘
         ▲
         │
         │ WebSocket
         │
┌────────┴──────────────┐
│   IoT Device          │
│  ESP32 + BME688       │
└───────────────────────┘
```

---

## 📁 Project Structure

```
xbio-iot-platform/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   └── BioSentinel.tsx
│   │   ├── components/       # Reusable UI components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── lib/             # Utility functions
│   │   │   ├── utils.ts     # General utilities
│   │   │   └── queryClient.ts # React Query setup
│   │   ├── hooks/           # Custom React hooks
│   │   │   └── use-toast.ts # Toast notifications
│   │   └── styles/          # Global styles
│   │       └── globals.css
│   └── index.html           # HTML entry point
│
├── server/                   # Backend application
│   ├── routes/              # API route handlers
│   │   └── bio-sentinel.ts  # BioSentinel routes
│   ├── db/                  # Database layer
│   │   ├── connection.ts    # DB connection
│   │   └── index.ts        # DB exports
│   ├── middleware/          # Express middleware
│   │   ├── error-handler.ts # Error handling
│   │   ├── cors.ts         # CORS configuration
│   │   └── validation.ts   # Request validation
│   ├── utils/               # Utility functions
│   │   └── logger.ts       # Logging utility
│   └── index.ts            # Server entry point
│
├── shared/                  # Shared TypeScript types
│   └── schema.ts           # Database schema & types
│
├── firmware/               # ESP32 firmware
│   └── esp32-xbio/        # BME688 sensor code
│       ├── src/           # Source files
│       └── platformio.ini # PlatformIO config
│
├── database/              # Database files
│   ├── schema.sql        # SQL schema
│   └── migrations/       # Migration files
│
├── docs/                 # Documentation
│   ├── START_HERE.md    # Navigation hub
│   ├── QUICK_START.md   # Getting started
│   ├── SYSTEM_DOCUMENTATION.md # This file
│   ├── API_REFERENCE.md # API docs
│   ├── HARDWARE_GUIDE.md # Hardware setup
│   └── DEPLOYMENT.md    # Deployment guide
│
└── scripts/             # Helper scripts
    ├── setup.sh        # Setup script
    └── build.sh        # Build script
```

---

## 🔧 Technology Stack

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **TailwindCSS**: Utility-first CSS
- **shadcn/ui**: Component library
- **React Query**: Data fetching
- **Recharts**: Data visualization
- **Vite**: Build tool

### Backend
- **Node.js**: Runtime
- **Express**: Web framework
- **TypeScript**: Type safety
- **ws**: WebSocket library
- **Drizzle ORM**: Database ORM
- **Zod**: Schema validation
- **OpenAI**: AI integration

### Database
- **PostgreSQL 14+**: Relational database
- **Drizzle ORM**: Type-safe queries
- **3 Tables**: readings, profiles, captures

### IoT Firmware
- **PlatformIO**: Build system
- **Arduino Framework**: ESP32 programming
- **BME688 Library**: Sensor driver
- **WiFi**: Wireless connectivity
- **WebSocket Client**: Real-time communication

---

## 💾 Database Schema

### Table: sensor_readings

Stores all sensor measurements from devices.

```sql
CREATE TABLE sensor_readings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(100) NOT NULL,
  gas_resistance INTEGER,
  temperature INTEGER,
  humidity INTEGER,
  pressure INTEGER,
  iaq_score INTEGER,
  co2_equivalent INTEGER,
  voc_equivalent INTEGER,
  heater_temperature INTEGER,
  mode VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sensor_data ON sensor_readings(device_id, created_at);
```

### Table: smell_profiles

Stores learned smell patterns and fingerprints.

```sql
CREATE TABLE smell_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  description TEXT,
  label VARCHAR(255),
  feature_vector JSONB,
  embedding_text TEXT,
  confidence INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: smell_captures

Stores capture sessions linking readings to profiles.

```sql
CREATE TABLE smell_captures (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(100) NOT NULL,
  profile_id VARCHAR REFERENCES smell_profiles(id),
  duration_ms INTEGER,
  samples_count INTEGER,
  raw_data JSONB,
  feature_vector JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 Data Flow

### 1. Sensor Reading Flow

```
IoT Device → WebSocket → Server → Database
                             ↓
                        Broadcast to
                          Clients
```

1. ESP32 reads BME688 sensor
2. Formats data as JSON
3. Sends via WebSocket to server
4. Server validates and stores in DB
5. Server broadcasts to connected clients
6. Clients update UI in real-time

### 2. Smell Capture Flow

```
User → Client → Server → DB
                  ↓
              Extract
              Features
                  ↓
              OpenAI
              Embedding
                  ↓
              Store Profile
```

1. User initiates capture
2. System collects 30 seconds of readings
3. Server extracts statistical features
4. (Optional) Generate AI embedding
5. Store profile in database
6. Profile available for matching

### 3. Pattern Recognition Flow

```
New Readings → Extract Features → Compare
                                     ↓
                              Smell Profiles
                                     ↓
                              Cosine Similarity
                                     ↓
                              Best Match
```

---

## 🔌 API Architecture

### REST Endpoints

All endpoints are prefixed with `/api/bio-sentinel`

#### Sensor Data
- `GET /readings` - Retrieve readings
- `POST /readings` - Save new reading

#### Smell Profiles
- `GET /profiles` - List all profiles
- `POST /profiles` - Create new profile

#### Analysis
- `POST /analyze` - AI-powered analysis
- `POST /recognize` - Pattern recognition

#### Analytics
- `GET /analytics` - Advanced statistics

### WebSocket Protocol

#### Connection
```
ws://localhost:5000/ws/bio-sentinel
```

#### Message Types

**Incoming (from device):**
- `sensor_reading` - New sensor data
- `device_status` - Device state
- `calibration_complete` - Calibration done
- `capture_complete` - Capture finished

**Outgoing (to device):**
- `set_mode` - Change operation mode
- `start_calibration` - Begin calibration
- `start_capture` - Begin smell capture
- `stop` - Stop current operation

---

## 🛡️ Security Considerations

### Authentication
- Currently: No authentication (development)
- Production: Implement JWT or API keys

### Data Validation
- All inputs validated with Zod
- SQL injection prevented by ORM
- XSS prevention in React

### Environment Variables
- Never commit `.env` files
- Use strong database passwords
- Rotate API keys regularly

---

## 🧪 Testing Strategy

### Unit Tests
```bash
npm test
```

### Integration Tests
- API endpoint tests
- Database query tests
- WebSocket tests

### Manual Testing
- Use Postman for API testing
- Use browser DevTools for WebSocket
- Test with physical hardware

---

## 📈 Performance Optimization

### Database
- Indexed queries on device_id and created_at
- Limit query results (default 1000)
- Use connection pooling

### WebSocket
- Heartbeat/ping-pong for connection health
- Automatic reconnection on disconnect
- Exponential backoff for retries

### Frontend
- Code splitting with Vite
- Lazy loading components
- React Query caching

---

## 🔍 Monitoring & Logging

### Logging Levels
- **INFO**: Normal operations
- **WARN**: Unusual but handled situations
- **ERROR**: Errors requiring attention
- **DEBUG**: Development debugging

### Key Metrics to Monitor
- WebSocket connections count
- Database query performance
- API response times
- Error rates

---

## 📝 Development Workflow

### Setup Development Environment
```bash
git clone <repo>
cd xbio-iot-platform
npm install
cp .env.example .env
# Edit .env
npm run dev
```

### Making Changes
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with descriptive message
5. Push and create PR

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful comments

---

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

---

## 📚 Additional Resources

- **API Reference**: [API_REFERENCE.md](API_REFERENCE.md)
- **Hardware Guide**: [HARDWARE_GUIDE.md](HARDWARE_GUIDE.md)
- **Quick Start**: [QUICK_START.md](QUICK_START.md)

---

**Questions? Check [START_HERE.md](START_HERE.md) for navigation**
