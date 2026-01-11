# 🤖 XBio IoT Platform - AI-Powered Electronic Nose System

<div align="center">

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991)

**Real-time air quality monitoring and smell recognition using BME688 sensor and AI**

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [API](#-api) • [Hardware](#-hardware)

</div>

---

## 📋 Overview

**XBio IoT Platform** is an advanced IoT system that transforms a BME688 environmental sensor into an intelligent "electronic nose" capable of:

- 📊 **Real-time Monitoring**: Continuous air quality tracking with WebSocket updates
- 👃 **Smell Recognition**: Capture and identify smell "fingerprints"
- 🤖 **AI Analysis**: GPT-4 powered insights and recommendations
- 🔍 **Pattern Matching**: Machine learning-based smell classification
- 📈 **Analytics**: Statistical analysis and anomaly detection

---

## ✨ Features

### Core Capabilities

| Feature | Description | Status |
|---------|-------------|--------|
| **Real-time Monitoring** | Live sensor data updates via WebSocket | ✅ Ready |
| **IAQ Scoring** | Indoor Air Quality index (0-500) | ✅ Ready |
| **Smell Capture** | 30-second smell fingerprint recording | ✅ Ready |
| **Pattern Recognition** | Cosine similarity matching | ✅ Ready |
| **AI Chat** | GPT-4 analysis and recommendations | ✅ Ready |
| **Smell Library** | Persistent smell profile storage | ✅ Ready |
| **Multi-Device** | Support for multiple BME688 devices | ✅ Ready |
| **4 Heater Profiles** | Optimized for different scenarios | ✅ Ready |
| **Auto-Calibration** | Self-calibration in clean air | ✅ Ready |
| **Anomaly Detection** | Statistical outlier identification | ✅ Ready |

### Sensor Readings

```
✅ Gas Resistance (0-500k Ω)    - Air quality indicator
✅ Temperature (-40 to 85°C)    - Ambient temperature
✅ Humidity (0-100%)             - Relative humidity
✅ Pressure (300-1100 hPa)       - Atmospheric pressure
✅ IAQ Score (0-500)             - Bosch BSEC algorithm
✅ CO2 Equivalent (ppm)          - Carbon dioxide estimation
✅ VOC Equivalent (ppm)          - Volatile organic compounds
✅ Heater Temperature & Duration - Sensor heater status
```

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+
PostgreSQL 14+
OpenAI API Key (optional, for AI features)
ESP32 Development Board (optional, for hardware)
BME688 Sensor (optional, for hardware)
```

### Installation

```bash
# 1. Clone repository
git clone <your-repo-url>
cd xbio-iot-platform

# 2. Run setup script
./scripts/setup.sh

# 3. Configure environment
# Edit .env with your credentials:
# - DATABASE_URL: PostgreSQL connection string
# - OPENAI_API_KEY: Your OpenAI API key

# 4. Setup database
psql -U postgres -f database/schema.sql

# 5. Start development server
npm run dev
```

### Access

```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
WebSocket: ws://localhost:5000/ws/bio-sentinel
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│  React 18 + TypeScript + TailwindCSS + WS      │
│         client/src/pages/                       │
│           BioSentinel.tsx                       │
└───────────────────┬─────────────────────────────┘
                    │
                    │ WebSocket + REST API
                    │
┌───────────────────▼─────────────────────────────┐
│                   Backend                       │
│     Express + TypeScript + Drizzle ORM          │
│         server/routes/                          │
│          bio-sentinel.ts                        │
└───────────────────┬─────────────────────────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
┌─────────────────┐   ┌──────────────┐
│   PostgreSQL    │   │  OpenAI API  │
│   3 Tables      │   │    GPT-4     │
│   - readings    │   │  Embeddings  │
│   - profiles    │   │              │
│   - captures    │   └──────────────┘
└─────────────────┘
          ▲
          │
          │ WebSocket (ws://)
          │
┌─────────┴─────────────────┐
│      IoT Device           │
│   ESP32 + BME688 Sensor   │
│  firmware/esp32-xbio/     │
└───────────────────────────┘
```

---

## 📚 Documentation

### Quick Links

- **[START_HERE.md](docs/START_HERE.md)** - Navigation hub and getting started
- **[QUICK_START.md](docs/QUICK_START.md)** - User guide for end users
- **[SYSTEM_DOCUMENTATION.md](docs/SYSTEM_DOCUMENTATION.md)** - Technical documentation
- **[API_REFERENCE.md](docs/API_REFERENCE.md)** - Complete API documentation
- **[HARDWARE_GUIDE.md](docs/HARDWARE_GUIDE.md)** - IoT hardware setup guide
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment guide

---

## 🔌 API

### REST Endpoints

```typescript
GET    /api/bio-sentinel/readings          // Get sensor readings
POST   /api/bio-sentinel/readings          // Save new reading
POST   /api/bio-sentinel/analyze           // AI analysis
GET    /api/bio-sentinel/profiles          // Get smell profiles
POST   /api/bio-sentinel/profiles          // Create profile
POST   /api/bio-sentinel/capture           // Save capture
POST   /api/bio-sentinel/recognize         // Pattern recognition
GET    /api/bio-sentinel/analytics         // Advanced analytics
```

### WebSocket Protocol

```typescript
// Connect
ws://localhost:5000/ws/bio-sentinel

// Receive sensor readings:
{
  type: 'sensor_reading',
  payload: {
    gas_resistance: 245000,
    temperature: 23.5,
    humidity: 45.2,
    iaq_score: 75,
    // ... more fields
  },
  timestamp: 1234567890
}

// Send commands:
{
  type: 'start_calibration',
  payload: { duration_seconds: 60 }
}
```

---

## 🔧 Hardware Setup

### Required Components

1. **ESP32 Development Board** (e.g., ESP32-WROOM-32)
2. **BME688 Sensor** (Bosch Environmental Sensor)
3. **USB Cable** for programming
4. **Breadboard and Jumper Wires** (optional)

### Wiring Diagram

```
ESP32          BME688
-----          ------
3.3V    -->    VCC
GND     -->    GND
GPIO21  -->    SDA
GPIO22  -->    SCL
```

### Firmware Upload

```bash
cd firmware/esp32-xbio
pio run --target upload
```

See [HARDWARE_GUIDE.md](docs/HARDWARE_GUIDE.md) for detailed instructions.

---

## 🧪 Testing

### Run Tests (when available)

```bash
npm test
```

### Manual Testing

1. Start the server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Check WebSocket connection status
4. Monitor real-time sensor readings
5. Test capture and profile creation

---

## 🚢 Deployment

### Production Build

```bash
./scripts/build.sh
```

### Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
PORT=5000
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment to cloud platforms.

---

## 📊 Database Schema

### Tables

- **sensor_readings**: Stores all sensor measurements
- **smell_profiles**: Stores learned smell patterns
- **smell_captures**: Stores capture sessions

Full schema: [database/schema.sql](database/schema.sql)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Bosch BME688 sensor and BSEC library
- OpenAI GPT-4 for AI analysis
- React and TypeScript communities
- All contributors and users

---

## 📧 Contact

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check existing documentation in `docs/`

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Cloud sync and backup
- [ ] Advanced ML models
- [ ] Batch analysis tools
- [ ] Export/import profiles

---

**Built with ❤️ for the IoT and AI community**
