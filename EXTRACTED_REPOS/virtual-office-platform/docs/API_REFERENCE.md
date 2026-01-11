# API Reference

## Base URL

- Development: `http://localhost:5000/api`
- Production: Configure in your deployment

## Authentication

Most endpoints use session-based authentication. The cloning system requires passcode verification before registration.

## Endpoints

### Health Check

#### GET `/health`

Check server and database health.

**Response**
```json
{
  "status": "ok",
  "timestamp": "2024-01-11T16:00:00.000Z",
  "database": "connected"
}
```

---

### Cloning System

#### POST `/cloning/verify-passcode`

Verify the access passcode for the cloning system.

**Request Body**
```json
{
  "passcode": "passcodemrf1Q@"
}
```

**Response - Success (200)**
```json
{
  "success": true,
  "message": "Verification successful"
}
```

**Response - Error (401)**
```json
{
  "success": false,
  "message": "Incorrect passcode"
}
```

---

#### POST `/cloning/register`

Register a new user with file uploads.

**Content-Type**: `multipart/form-data`

**Form Fields**
- `username` (string, required): Unique username
- `email` (string, required): Email address
- `password` (string, required): Password (will be hashed)
- `phoneNumber` (string, optional): Phone number
- `personalInfo` (JSON string, optional): Personal information
  ```json
  {
    "skills": "JavaScript, Python",
    "jobTitle": "Software Engineer",
    "bio": "Passionate developer"
  }
  ```
- `projectsInfo` (JSON string, optional): Project links
  ```json
  {
    "github": "https://github.com/username",
    "gitlab": "https://gitlab.com/username",
    "portfolio": "https://mysite.com"
  }
  ```
- `socialInfo` (JSON string, optional): Social media
  ```json
  {
    "linkedin": "https://linkedin.com/in/username",
    "twitter": "@username",
    "telegram": "@username"
  }
  ```
- `selectedDevices` (JSON array string, optional): Device types
  ```json
  ["xbio_sentinel", "personal_xbio"]
  ```
- `selectedIntegrations` (JSON array string, optional): Integration IDs
  ```json
  ["openai", "github"]
  ```

**File Fields**
- `voiceSamples[]` (files, max 5): Voice files (MP3, WAV, OGG, WebM)
- `photos[]` (files, max 10): Image files (JPEG, PNG, GIF, WebP)
- `documents[]` (files, max 10): Document files (PDF, DOC, DOCX, TXT)

**File Limits**
- Max file size: 50MB per file
- Max files per type: 5 voice, 10 photos, 10 documents

**Response - Success (201)**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "testuser",
      "email": "test@example.com"
    },
    "filesCount": 3,
    "devicesCount": 2
  }
}
```

**Response - Error (409)**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Response - Error (400)**
```json
{
  "success": false,
  "message": "Please enter all required fields"
}
```

---

#### GET `/cloning/profile/:userId`

Get complete user profile information.

**URL Parameters**
- `userId` (string): User ID

**Response - Success (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "testuser",
      "email": "test@example.com",
      "phoneNumber": "+1234567890",
      "personalInfo": {
        "skills": "JavaScript, Python",
        "jobTitle": "Software Engineer",
        "bio": "Passionate developer"
      },
      "projectsInfo": {
        "github": "https://github.com/username"
      },
      "socialInfo": {
        "linkedin": "https://linkedin.com/in/username"
      },
      "createdAt": "2024-01-11T16:00:00.000Z"
    },
    "files": [
      {
        "id": "uuid",
        "userId": "uuid",
        "fileType": "voice",
        "fileName": "sample.mp3",
        "filePath": "/uploads/cloning/sample-123456.mp3",
        "fileSize": 1048576,
        "mimeType": "audio/mpeg",
        "uploadedAt": "2024-01-11T16:00:00.000Z"
      }
    ],
    "devices": [
      {
        "id": "uuid",
        "userId": "uuid",
        "deviceType": "xbio_sentinel",
        "deviceName": "xbio_sentinel",
        "deviceConfig": {},
        "isActive": true,
        "addedAt": "2024-01-11T16:00:00.000Z"
      }
    ]
  }
}
```

**Response - Error (404)**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

#### PUT `/cloning/profile/:userId`

Update user profile information and upload additional files.

**URL Parameters**
- `userId` (string): User ID

**Content-Type**: `multipart/form-data`

**Form Fields**
- `personalInfo` (JSON string, optional): Updated personal info
- `projectsInfo` (JSON string, optional): Updated project info
- `socialInfo` (JSON string, optional): Updated social info

**File Fields** (same as registration)
- `voiceSamples[]` (files, max 5)
- `photos[]` (files, max 10)
- `documents[]` (files, max 10)

**Response - Success (200)**
```json
{
  "success": true,
  "message": "Information updated successfully",
  "data": {
    "newFilesCount": 2
  }
}
```

**Response - Error (404)**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### Virtual Office

#### GET `/virtual-office`

Get virtual office API information.

**Response**
```json
{
  "message": "Virtual Office API",
  "version": "1.0.0",
  "features": [
    "Digital Twin Creation",
    "File Upload & Management",
    "IoT Device Integration",
    "User Profile Management"
  ]
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Resource already exists"
}
```

### 413 Payload Too Large
```json
{
  "success": false,
  "message": "File size exceeds the maximum limit of 50MB"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

---

## File Storage

Uploaded files are stored in the `uploads/cloning/` directory with unique filenames:
- Format: `{original-name}-{timestamp}-{random}.{ext}`
- Example: `voice-sample-1704988800000-123456789.mp3`

Files can be accessed via:
- URL: `http://localhost:5000/uploads/cloning/{filename}`
- Path stored in database: `/uploads/cloning/{filename}`

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production:
- Recommended: 100 requests per 15 minutes per IP
- File upload endpoints: 10 requests per hour per IP

---

## CORS

CORS is configured to allow requests from:
- Development: `http://localhost:3000`
- Production: Configure via `CORS_ORIGIN` environment variable

Credentials are enabled for session-based authentication.

---

## Example Usage

### cURL Examples

**Verify Passcode**
```bash
curl -X POST http://localhost:5000/api/cloning/verify-passcode \
  -H "Content-Type: application/json" \
  -d '{"passcode": "passcodemrf1Q@"}'
```

**Register User**
```bash
curl -X POST http://localhost:5000/api/cloning/register \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "password=SecurePass123!" \
  -F "phoneNumber=+1234567890" \
  -F 'personalInfo={"skills":"JavaScript, Python","jobTitle":"Developer"}' \
  -F "voiceSamples=@voice1.mp3" \
  -F "photos=@photo1.jpg" \
  -F 'selectedDevices=["xbio_sentinel"]'
```

**Get Profile**
```bash
curl http://localhost:5000/api/cloning/profile/{userId}
```

### JavaScript/Fetch Examples

**Register User**
```javascript
const formData = new FormData();
formData.append('username', 'johndoe');
formData.append('email', 'john@example.com');
formData.append('password', 'SecurePass123!');
formData.append('personalInfo', JSON.stringify({
  skills: 'JavaScript, Python',
  jobTitle: 'Developer'
}));
formData.append('voiceSamples', voiceFile);
formData.append('photos', photoFile);

const response = await fetch('/api/cloning/register', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

---

## Development Notes

- All file uploads are validated for type and size
- Passwords are automatically hashed with bcrypt (10 rounds)
- User IDs are UUIDs generated by PostgreSQL
- Timestamps use PostgreSQL's `now()` function
- File paths are stored as relative paths
- JSON fields support nested objects

---

## Security Considerations

1. **Always use HTTPS in production**
2. **Validate file types on both client and server**
3. **Implement rate limiting**
4. **Regularly rotate SESSION_SECRET**
5. **Use strong passwords (enforce on client)**
6. **Sanitize user inputs**
7. **Implement CSRF protection for production**
8. **Use secure session cookies in production**
9. **Regular security audits**
10. **Keep dependencies updated**
