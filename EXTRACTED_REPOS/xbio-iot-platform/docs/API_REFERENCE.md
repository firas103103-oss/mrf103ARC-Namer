# 🔌 API Reference - XBio IoT Platform

Complete API documentation for REST endpoints and WebSocket protocol.

---

## Base URL

```
http://localhost:5000/api/bio-sentinel
```

---

## 📡 REST API Endpoints

### Sensor Readings

#### GET /readings

Retrieve sensor readings from the database.

**Query Parameters:**
- `deviceId` (optional): Filter by device ID
- `hours` (optional): Hours of history to retrieve (default: 24)

**Response:**
```json
[
  {
    "id": "uuid",
    "deviceId": "xbs-esp32-001",
    "gasResistance": 245000,
    "temperature": 23,
    "humidity": 45,
    "pressure": 1013,
    "iaqScore": 75,
    "co2Equivalent": 450,
    "vocEquivalent": 0.8,
    "heaterTemperature": 320,
    "mode": "monitoring",
    "createdAt": "2024-01-11T12:00:00Z"
  }
]
```

**Example:**
```bash
curl http://localhost:5000/api/bio-sentinel/readings?deviceId=xbs-esp32-001&hours=24
```

#### POST /readings

Save a new sensor reading.

**Request Body:**
```json
{
  "deviceId": "xbs-esp32-001",
  "gasResistance": 245000,
  "temperature": 23,
  "humidity": 45,
  "pressure": 1013,
  "iaqScore": 75,
  "co2Equivalent": 450,
  "vocEquivalent": 0.8,
  "heaterTemperature": 320,
  "mode": "monitoring"
}
```

**Response:**
```json
{
  "id": "uuid",
  "deviceId": "xbs-esp32-001",
  "gasResistance": 245000,
  // ... same as request
  "createdAt": "2024-01-11T12:00:00Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/bio-sentinel/readings \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test-001","gasResistance":245000,"temperature":23,"humidity":45}'
```

---

### AI Analysis

#### POST /analyze

Get AI-powered analysis of sensor data.

**Request Body:**
```json
{
  "deviceId": "xbs-esp32-001",
  "question": "Is the air quality safe?",
  "context": "Additional context (optional)"
}
```

**Response:**
```json
{
  "answer": "Based on recent readings, air quality is good...",
  "stats": {
    "avgGasResistance": 245000,
    "avgTemperature": 23.5,
    "avgHumidity": 45.2,
    "avgIAQ": 75,
    "avgCO2": 450,
    "avgVOC": 0.8,
    "trend": "stable"
  },
  "confidence": 0.85,
  "readingsAnalyzed": 100
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/bio-sentinel/analyze \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test-001","question":"What smell is this?"}'
```

**Note:** Requires `OPENAI_API_KEY` in environment variables.

---

### Smell Profiles

#### GET /profiles

List all saved smell profiles.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Fresh Coffee",
    "category": "food",
    "subcategory": "beverages",
    "description": "Freshly brewed arabica coffee",
    "label": "food/beverages",
    "featureVector": [1.2, 3.4, 5.6, ...],
    "embeddingText": "Fresh Coffee food beverages...",
    "confidence": 85,
    "createdAt": "2024-01-11T12:00:00Z",
    "updatedAt": "2024-01-11T12:00:00Z"
  }
]
```

**Example:**
```bash
curl http://localhost:5000/api/bio-sentinel/profiles
```

#### POST /profiles

Create a new smell profile.

**Request Body:**
```json
{
  "name": "Fresh Coffee",
  "category": "food",
  "subcategory": "beverages",
  "description": "Freshly brewed arabica coffee",
  "tags": ["coffee", "morning", "arabica"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Fresh Coffee",
  "category": "food",
  // ... profile details
  "createdAt": "2024-01-11T12:00:00Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/bio-sentinel/profiles \
  -H "Content-Type: application/json" \
  -d '{"name":"Fresh Coffee","category":"food","subcategory":"beverages"}'
```

---

### Captures

#### POST /capture

Save a smell capture session.

**Request Body:**
```json
{
  "deviceId": "xbs-esp32-001",
  "profileId": "uuid (optional)",
  "durationMs": 30000,
  "samplesCount": 30,
  "rawData": [
    { "gas": 245000, "temp": 23, "humidity": 45 },
    // ... more samples
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "deviceId": "xbs-esp32-001",
  "profileId": "uuid",
  "durationMs": 30000,
  "samplesCount": 30,
  "featureVector": [1.2, 3.4, ...],
  "status": "completed",
  "createdAt": "2024-01-11T12:00:00Z"
}
```

---

### Pattern Recognition

#### POST /recognize

Recognize a smell pattern from sensor readings.

**Request Body:**
```json
{
  "readings": [
    {
      "gasResistance": 245000,
      "temperature": 23,
      "humidity": 45,
      "iaqScore": 75
    }
    // ... at least 10 readings
  ]
}
```

**Response:**
```json
{
  "match": {
    "id": "uuid",
    "name": "Fresh Coffee",
    "category": "food",
    "confidence": 0.87
  },
  "confidence": 0.87,
  "message": "Pattern recognized: Fresh Coffee"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/bio-sentinel/recognize \
  -H "Content-Type: application/json" \
  -d '{"readings":[{"gasResistance":245000,"temperature":23,"humidity":45}]}'
```

---

### Analytics

#### GET /analytics

Get advanced analytics and insights.

**Query Parameters:**
- `deviceId` (required): Device to analyze
- `days` (optional): Days of history (default: 7)

**Response:**
```json
{
  "totalReadings": 1000,
  "periodDays": 7,
  "hourlyData": [
    {
      "hour": 0,
      "avgGasResistance": 245000,
      "avgTemperature": 23,
      "avgHumidity": 45,
      "avgIAQ": 75,
      "count": 30
    }
  ],
  "anomalies": [
    {
      "timestamp": "2024-01-11T12:00:00Z",
      "type": "Unusual reading",
      "severity": "medium",
      "value": 100000
    }
  ],
  "trends": {
    "gasResistance": 2.5,
    "temperature": -0.1,
    "humidity": 0.5,
    "iaqScore": -1.2
  },
  "healthScore": 85,
  "recommendations": [
    "All indicators within normal range",
    "Continue monitoring"
  ]
}
```

**Example:**
```bash
curl "http://localhost:5000/api/bio-sentinel/analytics?deviceId=xbs-esp32-001&days=7"
```

---

## 🔌 WebSocket Protocol

### Connection

```javascript
const ws = new WebSocket('ws://localhost:5000/ws/bio-sentinel');
```

### Message Format

All messages are JSON objects with this structure:

```json
{
  "type": "message_type",
  "payload": { /* data */ },
  "timestamp": 1234567890
}
```

---

### Incoming Messages (Server → Client)

#### sensor_reading

Real-time sensor data from device.

```json
{
  "type": "sensor_reading",
  "payload": {
    "gas_resistance": 245000,
    "temperature": 23.5,
    "humidity": 45.2,
    "pressure": 1013,
    "iaq_score": 75,
    "iaq_accuracy": 3,
    "co2_equivalent": 450,
    "voc_equivalent": 0.8,
    "heater_temp": 320,
    "heater_duration": 150,
    "mode": "monitoring"
  },
  "timestamp": 1234567890
}
```

#### device_status

Device status and health information.

```json
{
  "type": "device_status",
  "payload": {
    "mode": "monitoring",
    "uptime_ms": 3600000,
    "wifi_rssi": -45,
    "free_heap": 102400,
    "heater_profile": "balanced",
    "firmware_version": "1.0.0",
    "last_calibration": 1234567890,
    "errors": []
  },
  "timestamp": 1234567890
}
```

#### calibration_complete

Calibration completed successfully or failed.

```json
{
  "type": "calibration_complete",
  "payload": {
    "success": true,
    "baseline_gas": 150000,
    "error": null
  },
  "timestamp": 1234567890
}
```

#### capture_complete

Smell capture session completed.

```json
{
  "type": "capture_complete",
  "payload": {
    "capture_id": "cap-1234567890",
    "samples_count": 30,
    "success": true,
    "error": null
  },
  "timestamp": 1234567890
}
```

#### command_ack

Acknowledgment of received command.

```json
{
  "type": "command_ack",
  "payload": {
    "command": "start_calibration",
    "status": "received"
  }
}
```

#### error

Error message from device or server.

```json
{
  "type": "error",
  "payload": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

---

### Outgoing Messages (Client → Server)

#### set_mode

Change device operation mode.

```json
{
  "type": "set_mode",
  "payload": {
    "mode": "monitoring" // "idle" | "monitoring" | "capturing"
  }
}
```

#### start_calibration

Begin sensor calibration.

```json
{
  "type": "start_calibration",
  "payload": {
    "duration_seconds": 60
  }
}
```

#### start_capture

Begin smell capture session.

```json
{
  "type": "start_capture",
  "payload": {
    "capture_id": "cap-1234567890",
    "duration_seconds": 30,
    "label": "Fresh Coffee",
    "profile_id": "uuid (optional)",
    "heater_profile": "high_sensitivity"
  }
}
```

#### stop

Stop current operation.

```json
{
  "type": "stop",
  "payload": {}
}
```

---

## 🧪 Testing with cURL

### Health Check
```bash
curl http://localhost:5000/health
```

### Get Recent Readings
```bash
curl "http://localhost:5000/api/bio-sentinel/readings?hours=1"
```

### Create Smell Profile
```bash
curl -X POST http://localhost:5000/api/bio-sentinel/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Profile",
    "category": "chemical",
    "description": "Test description"
  }'
```

### AI Analysis
```bash
curl -X POST http://localhost:5000/api/bio-sentinel/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-001",
    "question": "Is the air quality safe?"
  }'
```

---

## 📝 Error Responses

### Standard Error Format

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable (e.g., OpenAI API not configured)

---

## 🔐 Authentication

Currently, the API does not require authentication. For production deployment, implement:

- JWT tokens
- API keys
- OAuth 2.0

See [DEPLOYMENT.md](DEPLOYMENT.md) for security recommendations.

---

**Need more info? Check [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)**
