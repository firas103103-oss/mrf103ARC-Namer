# 📡 API Reference

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://your-domain.com`

All API endpoints are prefixed with `/api`.

---

## Authentication

The system uses a passcode-based authentication for initial access, followed by session-based authentication.

---

## Endpoints

### Health Check

Check if the API is running.

```http
GET /api/health
```

**Response**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-11T16:00:00.000Z"
}
```

---

## Cloning System

### 1. Verify Passcode

Verify the access passcode before registration.

```http
POST /api/cloning/verify-passcode
```

**Request Body**
```json
{
  "passcode": "passcodemrf1Q@"
}
```

**Success Response (200)**
```json
{
  "success": true,
  "message": "تم التحقق بنجاح"
}
```

**Error Response (401)**
```json
{
  "success": false,
  "message": "رمز المرور غير صحيح"
}
```

---

### 2. Register User

Create a new user profile with files.

```http
POST /api/cloning/register
Content-Type: multipart/form-data
```

**Form Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | ✅ | Unique username |
| email | string | ✅ | Unique email address |
| password | string | ✅ | User password (will be hashed) |
| phoneNumber | string | ❌ | Phone number |
| personalInfo | JSON string | ❌ | `{"skills": "...", "jobTitle": "...", "bio": "..."}` |
| projectsInfo | JSON string | ❌ | `{"github": "...", "gitlab": "...", "portfolio": "..."}` |
| socialInfo | JSON string | ❌ | `{"linkedin": "...", "twitter": "...", "telegram": "..."}` |
| voiceSamples | File[] | ❌ | Up to 5 audio files (mp3, wav, ogg, webm) |
| photos | File[] | ❌ | Up to 10 images (jpg, png, gif, webp) |
| documents | File[] | ❌ | Up to 10 documents (pdf, doc, docx, txt) |
| selectedDevices | JSON array | ❌ | `["xbio_sentinel", "personal_xbio"]` |
| selectedIntegrations | JSON array | ❌ | `["google", "github", "openai"]` |

**File Limits**
- Max file size: 50MB per file
- Total files: 25 maximum (5 voice + 10 photos + 10 documents)

**Success Response (201)**
```json
{
  "success": true,
  "message": "تم التسجيل بنجاح",
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "filesCount": 8,
    "devicesCount": 2
  }
}
```

**Error Response (409)** - User exists
```json
{
  "success": false,
  "message": "البريد الإلكتروني مسجل مسبقاً"
}
```

**Error Response (400)** - Validation error
```json
{
  "success": false,
  "message": "الرجاء إدخال جميع البيانات المطلوبة"
}
```

---

### 3. Get User Profile

Retrieve complete user profile including files and devices.

```http
GET /api/cloning/profile/:userId
```

**URL Parameters**
- `userId` (string, required): User ID

**Success Response (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "personalInfo": {
        "skills": "JavaScript, Python",
        "jobTitle": "Software Engineer",
        "bio": "Passionate developer"
      },
      "projectsInfo": {
        "github": "https://github.com/johndoe",
        "portfolio": "https://johndoe.com"
      },
      "socialInfo": {
        "linkedin": "https://linkedin.com/in/johndoe"
      },
      "createdAt": "2026-01-11T16:00:00.000Z",
      "updatedAt": "2026-01-11T16:00:00.000Z"
    },
    "files": [
      {
        "id": "uuid",
        "fileType": "voice",
        "fileName": "sample.mp3",
        "filePath": "/uploads/cloning/voices/123-sample.mp3",
        "fileSize": 1048576,
        "mimeType": "audio/mpeg",
        "uploadedAt": "2026-01-11T16:00:00.000Z"
      }
    ],
    "devices": [
      {
        "id": "uuid",
        "deviceType": "xbio_sentinel",
        "deviceName": "XBio Sentinel",
        "deviceConfig": {},
        "isActive": true,
        "addedAt": "2026-01-11T16:00:00.000Z"
      }
    ]
  }
}
```

**Error Response (404)**
```json
{
  "success": false,
  "message": "المستخدم غير موجود"
}
```

---

## File Types & Validation

### Accepted File Types

**Voice Samples**
- Extensions: `.mp3`, `.wav`, `.ogg`, `.webm`
- MIME types: `audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/ogg`, `audio/webm`

**Photos**
- Extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`

**Documents**
- Extensions: `.pdf`, `.doc`, `.docx`, `.txt`
- MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

---

## CORS

Allowed origins are configured via `CORS_ORIGIN` environment variable.

Default: `http://localhost:3000`

---

## Examples

### cURL Example - Verify Passcode
```bash
curl -X POST http://localhost:5000/api/cloning/verify-passcode \
  -H "Content-Type: application/json" \
  -d '{"passcode":"passcodemrf1Q@"}'
```

### cURL Example - Register User
```bash
curl -X POST http://localhost:5000/api/cloning/register \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "password=SecurePass123!" \
  -F "phoneNumber=+1234567890" \
  -F "personalInfo={\"skills\":\"JavaScript\"}" \
  -F "voiceSamples=@/path/to/voice.mp3" \
  -F "photos=@/path/to/photo.jpg" \
  -F "selectedDevices=[\"xbio_sentinel\"]"
```

### JavaScript Example
```javascript
// Verify passcode
const verifyPasscode = async () => {
  const response = await fetch('http://localhost:5000/api/cloning/verify-passcode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode: 'passcodemrf1Q@' })
  });
  return await response.json();
};

// Register user
const registerUser = async (formData) => {
  const response = await fetch('http://localhost:5000/api/cloning/register', {
    method: 'POST',
    body: formData // FormData object with files
  });
  return await response.json();
};
```

---

**Last Updated**: January 2026
