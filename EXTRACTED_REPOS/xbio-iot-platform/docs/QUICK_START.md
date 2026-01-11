# 🚀 Quick Start Guide - XBio IoT Platform

Get up and running with the XBio IoT Platform in under 10 minutes!

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **PostgreSQL 14+** installed ([Download](https://www.postgresql.org/download/))
- ✅ **Git** installed
- ✅ **OpenAI API Key** (optional, for AI features) ([Get one](https://platform.openai.com/api-keys))

---

## ⚡ Quick Installation

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd xbio-iot-platform
```

### Step 2: Install Dependencies

```bash
./scripts/setup.sh
```

Or manually:

```bash
npm install
cp .env.example .env
```

### Step 3: Configure Environment

Edit `.env` file with your credentials:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/xbio

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# Server
PORT=5000
NODE_ENV=development
```

### Step 4: Setup Database

```bash
# Create database
createdb xbio

# Run schema
psql -U postgres -d xbio -f database/schema.sql
```

Or using a GUI tool like pgAdmin, execute `database/schema.sql`.

### Step 5: Start the Server

```bash
npm run dev
```

This starts both the frontend and backend:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- WebSocket: ws://localhost:5000/ws/bio-sentinel

---

## 🎯 First Steps

### 1. Access the Web Interface

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the XBio Sentinel dashboard.

### 2. Check Connection Status

Look at the top of the page for the connection status badge:
- 🟢 **Connected**: WebSocket is working
- 🟡 **Connecting**: Establishing connection
- 🔴 **Disconnected**: Check your server

### 3. Monitor Sensor Data

The dashboard displays real-time sensor readings:
- **Gas Resistance**: Air quality indicator (kOhm)
- **Temperature**: Ambient temperature (°C)
- **Humidity**: Relative humidity (%)
- **IAQ Score**: Indoor Air Quality (0-500)

**Note**: Without a physical device, the server simulates sensor data for testing.

### 4. Explore the Interface

#### Control Panel
- **Idle**: Stop all monitoring
- **Monitor**: Start continuous monitoring
- **Capture Mode**: Prepare for smell capture
- **Calibrate**: Calibrate sensor in clean air

#### Heater Profiles
Choose from 4 preset profiles:
- **Low Power**: Battery saving (200°C, 100ms)
- **Balanced**: General use (280°C, 120ms)
- **High Sensitivity**: Best VOC detection (320°C, 150ms)
- **Rapid**: Fast response (350°C, 80ms)

#### Smell Capture
1. Click **Start Capture**
2. Expose sensor to smell for 30 seconds
3. Enter profile name and category
4. Click **Save Profile**

#### AI Analysis
Ask questions about your sensor data:
- "What smell is this?"
- "Is this air quality safe?"
- "Why did VOC levels spike?"

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: 
1. Verify PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL in `.env`
3. Ensure database exists: `createdb xbio`

#### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution**:
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

#### WebSocket Not Connecting

**Solution**:
1. Check backend is running: `http://localhost:5000/health`
2. Check firewall settings
3. Verify WebSocket URL in console

#### TypeScript Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Using with Physical Hardware

### Connect ESP32 + BME688

See **[HARDWARE_GUIDE.md](HARDWARE_GUIDE.md)** for detailed instructions.

Quick steps:
1. Wire ESP32 to BME688 sensor
2. Upload firmware from `firmware/esp32-xbio/`
3. Configure WiFi credentials
4. Device auto-connects to WebSocket

---

## 🧪 Testing Features

### 1. Test API Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Get sensor readings
curl http://localhost:5000/api/bio-sentinel/readings

# Get smell profiles
curl http://localhost:5000/api/bio-sentinel/profiles
```

### 2. Test WebSocket

Use a WebSocket client or browser console:

```javascript
const ws = new WebSocket('ws://localhost:5000/ws/bio-sentinel');

ws.onopen = () => {
  console.log('Connected!');
  
  // Send command
  ws.send(JSON.stringify({
    type: 'start_calibration',
    payload: { duration_seconds: 60 }
  }));
};

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
```

### 3. Test AI Analysis

Requires `OPENAI_API_KEY` in `.env`:

```bash
curl -X POST http://localhost:5000/api/bio-sentinel/analyze \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-001", "question": "Is the air quality good?"}'
```

---

## 📊 Understanding the Dashboard

### Sensor Cards

1. **Gas Resistance**
   - Higher = Better air quality
   - Range: 0-500 kOhm
   - Baseline: ~150-250 kOhm

2. **Temperature**
   - Ambient temperature
   - Affects sensor performance

3. **Humidity**
   - Relative humidity percentage
   - Optimal: 30-60%

4. **IAQ Score**
   - 0-50: Excellent
   - 51-100: Good
   - 101-150: Moderate
   - 151-200: Poor
   - 201-300: Unhealthy
   - 301-500: Hazardous

### Secondary Metrics

- **VOC Equivalent**: Volatile organic compounds (ppm)
- **CO2 Equivalent**: Estimated CO2 concentration (ppm)
- **Heater Status**: Current sensor heater temperature

---

## 🎓 Next Steps

### For Users
1. ✅ Complete this quick start
2. 📖 Read [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
3. 🔌 Set up hardware with [HARDWARE_GUIDE.md](HARDWARE_GUIDE.md)

### For Developers
1. ✅ Complete this quick start
2. 🔍 Explore [API_REFERENCE.md](API_REFERENCE.md)
3. 🚢 Learn deployment with [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 💡 Tips

- **Simulated Data**: Without hardware, the system generates realistic test data
- **AI Features**: OpenAI API key enables advanced analysis
- **Multiple Devices**: System supports multiple sensors simultaneously
- **Data Persistence**: All readings are stored in PostgreSQL

---

## 🆘 Need Help?

- 📖 Check [START_HERE.md](START_HERE.md) for navigation
- 🔍 Review [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
- 🐛 Report issues on GitHub
- 💬 Ask questions in discussions

---

**Ready to dive deeper? → [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)**
