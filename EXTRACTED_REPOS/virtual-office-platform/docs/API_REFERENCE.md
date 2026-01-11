# API Reference

Complete API documentation for the Virtual Office Platform.

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://yourdomain.com/api`

## Authentication

The API uses two authentication methods:

1. **Passcode Authentication** - Required for initial registration
2. **Session Authentication** - Cookie-based sessions after login

## Endpoints

### Health Check

#### GET /health

Check server health status.

**Request:**
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Virtual Office Platform is running",
  "timestamp": "2026-01-11T16:00:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

#### GET /health/db

Check database connectivity.

**Request:**
```bash
curl http://localhost:5000/api/health/db
```

**Response:**
```json
{
  "success": true,
  "message": "Database connection is healthy",
  "timestamp": "2026-01-11T16:00:00.000Z"
}
```

---

### Cloning System

#### POST /cloning/verify-passcode

Verify the access passcode before registration.

**Request:**
```bash
curl -X POST http://localhost:5000/api/cloning/verify-passcode \
  -H "Content-Type: application/json" \
  -d '{
    "passcode": "passcodemrf1Q@"
  }'
```

**Request Body:**
```json
{
  "passcode": "string (required)"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification successful"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Incorrect passcode"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing passcode
- `401` - Incorrect passcode
- `500` - Server error

---

#### POST /cloning/register

Register a new user with file uploads and device selections.

**Request:**
```bash
curl -X POST http://localhost:5000/api/cloning/register \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "password=SecurePass123!" \
  -F "phoneNumber=+1234567890" \
  -F 'personalInfo={"skills":"JavaScript, Python, React","jobTitle":"Full Stack Developer","bio":"Passionate developer"}' \
  -F 'projectsInfo={"github":"https://github.com/johndoe","portfolio":"https://johndoe.com"}' \
  -F 'socialInfo={"linkedin":"https://linkedin.com/in/johndoe","twitter":"@johndoe"}' \
  -F 'selectedDevices=["xbio_sentinel","personal_xbio"]' \
  -F "voiceSamples=@voice1.mp3" \
  -F "voiceSamples=@voice2.mp3" \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg" \
  -F "documents=@resume.pdf"
```

**Request Body (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | Unique username (3-50 chars) |
| email | string | Yes | Valid email address |
| password | string | Yes | Password (min 8 chars) |
| phoneNumber | string | No | Phone number |
| personalInfo | JSON string | No | `{skills, jobTitle, bio}` |
| projectsInfo | JSON string | No | `{github, gitlab, portfolio}` |
| socialInfo | JSON string | No | `{linkedin, twitter, telegram}` |
| selectedDevices | JSON array | No | Array of device IDs |
| selectedIntegrations | JSON array | No | Array of integration IDs |
| voiceSamples | file[] | No | Voice files (max 5, 50MB each) |
| photos | file[] | No | Photo files (max 10, 50MB each) |
| documents | file[] | No | Document files (max 10, 50MB each) |

**Allowed File Types:**

- **Voice**: .mp3, .wav, .ogg, .webm
- **Photos**: .jpg, .jpeg, .png, .gif, .webp
- **Documents**: .pdf, .doc, .docx, .txt

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "filesCount": 5,
    "devicesCount": 2
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Email is already registered"
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Invalid request data
- `409` - Email already exists
- `500` - Server error

---

#### GET /cloning/profile/:userId

Get complete user profile including files and devices.

**Request:**
```bash
curl http://localhost:5000/api/cloning/profile/550e8400-e29b-41d4-a716-446655440000
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | UUID | User ID |

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "personalInfo": {
        "skills": "JavaScript, Python, React",
        "jobTitle": "Full Stack Developer",
        "bio": "Passionate developer"
      },
      "projectsInfo": {
        "github": "https://github.com/johndoe",
        "portfolio": "https://johndoe.com"
      },
      "socialInfo": {
        "linkedin": "https://linkedin.com/in/johndoe",
        "twitter": "@johndoe"
      },
      "createdAt": "2026-01-11T16:00:00.000Z"
    },
    "files": [
      {
        "id": "file-uuid-1",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "fileType": "voice",
        "fileName": "voice1.mp3",
        "filePath": "uploads/voice/voice1-1234567890.mp3",
        "fileSize": 2048576,
        "mimeType": "audio/mpeg",
        "uploadedAt": "2026-01-11T16:00:00.000Z"
      }
    ],
    "devices": [
      {
        "id": "device-uuid-1",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "deviceType": "xbio_sentinel",
        "deviceName": "xbio_sentinel",
        "deviceConfig": {},
        "isActive": true,
        "addedAt": "2026-01-11T16:00:00.000Z"
      }
    ]
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "User not found"
}
```

**Status Codes:**
- `200` - Success
- `404` - User not found
- `500` - Server error

---

#### PUT /cloning/profile/:userId

Update user profile and upload additional files.

**Request:**
```bash
curl -X PUT http://localhost:5000/api/cloning/profile/550e8400-e29b-41d4-a716-446655440000 \
  -F 'personalInfo={"skills":"JavaScript, Python, React, Node.js","jobTitle":"Senior Developer"}' \
  -F "voiceSamples=@voice3.mp3" \
  -F "photos=@photo3.jpg"
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| userId | UUID | User ID |

**Request Body (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| personalInfo | JSON string | No | Updated personal information |
| projectsInfo | JSON string | No | Updated project information |
| socialInfo | JSON string | No | Updated social information |
| voiceSamples | file[] | No | Additional voice files |
| photos | file[] | No | Additional photo files |
| documents | file[] | No | Additional document files |

**Response (Success):**
```json
{
  "success": true,
  "message": "Information updated successfully",
  "data": {
    "newFilesCount": 2
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "User not found"
}
```

**Status Codes:**
- `200` - Updated successfully
- `404` - User not found
- `500` - Server error

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid credentials |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## CORS Configuration

CORS is configured to accept requests from:

- Development: `http://localhost:3000`
- Production: Value from `CORS_ORIGIN` environment variable

To modify CORS settings, edit `server/middleware/cors.ts`.

---

## File Upload Limits

- **Max file size**: 50MB per file (configurable via `MAX_FILE_SIZE` env variable)
- **Max voice samples**: 5 files
- **Max photos**: 10 files
- **Max documents**: 10 files

---

## Session Management

- **Session duration**: 7 days
- **Storage**: PostgreSQL (connect-pg-simple)
- **Cookie settings**: HTTP-only, Secure (production), SameSite: lax

Sessions are automatically created and managed by Express Session middleware.

---

## Code Examples

### JavaScript/Node.js

```javascript
// Verify passcode
const verifyPasscode = async (passcode) => {
  const response = await fetch('http://localhost:5000/api/cloning/verify-passcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode })
  });
  return await response.json();
};

// Register user with files
const registerUser = async (formData) => {
  const data = new FormData();
  data.append('username', formData.username);
  data.append('email', formData.email);
  data.append('password', formData.password);
  
  // Add files
  for (const file of formData.voiceSamples) {
    data.append('voiceSamples', file);
  }
  
  const response = await fetch('http://localhost:5000/api/cloning/register', {
    method: 'POST',
    body: data
  });
  return await response.json();
};
```

### Python

```python
import requests

# Verify passcode
def verify_passcode(passcode):
    response = requests.post(
        'http://localhost:5000/api/cloning/verify-passcode',
        json={'passcode': passcode}
    )
    return response.json()

# Register user
def register_user(user_data, files):
    response = requests.post(
        'http://localhost:5000/api/cloning/register',
        data=user_data,
        files=files
    )
    return response.json()
```

### cURL Examples

```bash
# Health check
curl http://localhost:5000/api/health

# Verify passcode
curl -X POST http://localhost:5000/api/cloning/verify-passcode \
  -H "Content-Type: application/json" \
  -d '{"passcode": "passcodemrf1Q@"}'

# Register user
curl -X POST http://localhost:5000/api/cloning/register \
  -F "username=test" \
  -F "email=test@example.com" \
  -F "password=SecurePass123"

# Get profile
curl http://localhost:5000/api/cloning/profile/{userId}
```

---

## Webhook Support (Future)

Webhook support is planned for future releases to notify external systems of:
- New user registrations
- Profile updates
- File uploads
- Device connections

---

## API Versioning

Current version: **v1.0.0**

No versioning is currently implemented in the URL structure. Future versions may use:
- URL-based: `/api/v2/cloning/register`
- Header-based: `Accept: application/vnd.api+json; version=2`

---

## Additional Resources

- [System Documentation](SYSTEM_DOCUMENTATION.md)
- [Quick Start Guide](QUICK_START.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Main README](../README.md)

---

Last updated: 2026-01-11
