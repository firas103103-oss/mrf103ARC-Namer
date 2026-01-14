# 🤖 X Bio Sentinel - AI-Powered Electronic Nose System

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

**X Bio Sentinel** is an advanced IoT system that transforms a BME688 environmental sensor into an intelligent "electronic nose" capable of:

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
```

### Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd mrf103ARC-Namer

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 4. Setup database
psql -U postgres -f biosentinel_database_schema.sql

# 5. Start server
npm run dev
```

### Access

```
Frontend: http://localhost:5000/bio-sentinel
WebSocket: ws://localhost:5000/ws/bio-sentinel
API: http://localhost:5000/api/bio-sentinel/*
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│  React 18 + TypeScript + shadcn/ui + WebSocket │
│            client/src/pages/                    │
│              BioSentinel.tsx                    │
│                  (950 lines)                    │
└───────────────────┬─────────────────────────────┘
                    │
                    │ WebSocket + REST API
                    │
┌───────────────────▼─────────────────────────────┐
│                   Backend                       │
│     Express + TypeScript + Drizzle ORM          │
│            server/routes/                       │
│             bio-sentinel.ts                     │
│                 (549 lines)                     │
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
│    Firmware (Arduino)     │
└───────────────────────────┘
```

---

## 📚 Documentation

### For Users

| Document | Description | Time |
|----------|-------------|------|
| **[START_HERE_BIOSENTINEL.md](START_HERE_BIOSENTINEL.md)** | Navigation hub | 5 min |
| **[BIOSENTINEL_QUICK_START.md](BIOSENTINEL_QUICK_START.md)** | User guide | 10 min |

### For Developers

| Document | Description | Time |
|----------|-------------|------|
| **[BIOSENTINEL_SYSTEM_DOCUMENTATION.md](BIOSENTINEL_SYSTEM_DOCUMENTATION.md)** | Technical docs | 30 min |
| **[BIOSENTINEL_API_REFERENCE.md](BIOSENTINEL_API_REFERENCE.md)** | API reference | 20 min |
| **[biosentinel_database_schema.sql](biosentinel_database_schema.sql)** | Database schema | 15 min |

### For Managers

| Document | Description | Time |
|----------|-------------|------|
| **[BIOSENTINEL_FINAL_REPORT.md](BIOSENTINEL_FINAL_REPORT.md)** | Executive summary | 12 min |
| **[BIOSENTINEL_IMPLEMENTATION_COMPLETE.md](BIOSENTINEL_IMPLEMENTATION_COMPLETE.md)** | Technical report | 20 min |

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

// Receive messages:
{
  type: 'sensor_reading',
  payload: {
    gas_resistance: 245000,
    temperature: 23.5,
    humidity: 52.3,
    iaq_score: 45
  },
  timestamp: 1704556800000
}

// Send commands:
{
  type: 'set_mode',
  payload: { mode: 'monitoring' }
}
```

---

## 🔧 Hardware

### Required Components

```
✅ ESP32 Development Board (any variant)
✅ BME688 Breakout Board (Adafruit/Pimoroni)
✅ USB Cable (for programming)
✅ WiFi Network (2.4GHz)
```

### Wiring

```
ESP32          BME688
────────────────────────
3.3V      →    VCC
GND       →    GND
GPIO 21   →    SDA (I2C)
GPIO 22   →    SCL (I2C)
```

### Firmware

See **[BIOSENTINEL_HARDWARE_GUIDE.md](BIOSENTINEL_HARDWARE_GUIDE.md)** for complete Arduino code and setup instructions.

---

## 📊 Usage Examples

### Example 1: Basic Monitoring

```typescript
// Connect and start monitoring
const ws = new WebSocket('ws://localhost:5000/ws/bio-sentinel');

ws.onopen = () => {
  // Start monitoring mode
  ws.send(JSON.stringify({
    type: 'set_mode',
    payload: { mode: 'monitoring' }
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'sensor_reading') {
    console.log('IAQ Score:', data.payload.iaq_score);
    console.log('Gas:', data.payload.gas_resistance);
  }
};
```

### Example 2: Capture Smell

```typescript
// Start a 30-second capture
ws.send(JSON.stringify({
  type: 'start_capture',
  payload: {
    capture_id: 'coffee-2025-01-06',
    duration_seconds: 30,
    label: 'Morning Coffee',
    heater_profile: 'high_sensitivity'
  }
}));

// Listen for completion
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'capture_complete') {
    if (data.payload.success) {
      console.log('✅ Captured', data.payload.samples_count, 'samples');
      // Now save as smell profile via API
    }
  }
};
```

### Example 3: AI Analysis

```typescript
const response = await fetch('/api/bio-sentinel/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'xbs-esp32-001',
    question: 'What smell is this?',
    context: 'Strong odor detected in kitchen'
  })
});

const analysis = await response.json();
console.log(analysis.answer);
// "Based on your sensor data, this appears to be coffee..."
```

---

## 🧪 Testing

### Test WebSocket Connection

```bash
# Using websocat
websocat ws://localhost:5000/ws/bio-sentinel

# Using wscat
wscat -c ws://localhost:5000/ws/bio-sentinel
```

### Test API Endpoints

```bash
# Get readings
curl http://localhost:5000/api/bio-sentinel/readings?deviceId=xbs-esp32-001

# Analyze with AI
curl -X POST http://localhost:5000/api/bio-sentinel/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "xbs-esp32-001",
    "question": "Is air quality good?"
  }'
```

---

## 📈 Performance

### Metrics

```
WebSocket Updates:    1 Hz (1 reading/second)
API Response Time:    <50ms (avg)
AI Analysis Time:     3-5 seconds
Database Writes:      ~86,400 rows/day/device
Storage Growth:       ~50MB/month/device
```

### Optimization Tips

```
✅ Use PostgreSQL partitioning for sensor_readings
✅ Archive data older than 30 days
✅ Use Redis for WebSocket pub/sub (multi-server)
✅ Batch insert readings (10-20 at a time)
✅ Enable query caching for analytics
```

---

## 🔐 Security

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Optional (for AI features)
OPENAI_API_KEY=sk-...

# WebSocket
WS_HEARTBEAT_INTERVAL=30000  # 30 seconds
WS_RECONNECT_DELAY=5000      # 5 seconds
```

### Best Practices

```
✅ Use HTTPS in production (WSS for WebSocket)
✅ Rate limit API endpoints
✅ Validate WebSocket messages
✅ Sanitize user inputs (profile names, tags)
✅ Use prepared statements (Drizzle ORM does this)
```

---

## 🐛 Troubleshooting

### Common Issues

**1. WebSocket won't connect**
```bash
# Check if server is running
curl http://localhost:5000/health

# Check WebSocket endpoint
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     http://localhost:5000/ws/bio-sentinel
```

**2. No sensor readings**
```bash
# Check ESP32 Serial Monitor
# Verify WiFi connection
# Confirm WebSocket URL in firmware
```

**3. AI analysis not working**
```bash
# Verify OpenAI API key
echo $OPENAI_API_KEY

# Check API quota
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## 🗺️ Roadmap

### Completed ✅
- [x] Real-time WebSocket monitoring
- [x] Smell capture and recognition
- [x] AI analysis with GPT-4
- [x] Pattern matching (cosine similarity)
- [x] Smell library management
- [x] 4 heater profiles
- [x] Auto-calibration
- [x] Analytics dashboard

### In Progress 🔄
- [ ] Mobile app (React Native)
- [ ] Advanced ML models (TensorFlow.js)
- [ ] Multi-user support with authentication

### Planned 📋
- [ ] Voice control integration
- [ ] Email/SMS alerts
- [ ] Grafana dashboard
- [ ] Docker deployment
- [ ] Raspberry Pi support

---

## 📜 License

[Your License Here]

---

## 🙏 Acknowledgments

- **Bosch Sensortec** - BME688 sensor and BSEC library
- **OpenAI** - GPT-4 and embeddings API
- **shadcn/ui** - Beautiful React components
- **Drizzle ORM** - Type-safe database queries

---

## 📞 Support

- **Documentation**: [START_HERE_BIOSENTINEL.md](START_HERE_BIOSENTINEL.md)
- **Issues**: [GitHub Issues](your-repo/issues)
- **Discussions**: [GitHub Discussions](your-repo/discussions)

---

<div align="center">

**Built with ❤️ using TypeScript, React, Express, PostgreSQL, and OpenAI**

**⭐ Star this repo if you find it useful!**

</div>
