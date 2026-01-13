# XReal AR - Ultimate Reality System

## Overview

XReal AR is a comprehensive augmented reality system for XReal AR glasses with an Iron Man/secret agent style interface. The application provides real-time data visualization, AI assistant, health monitoring, and multiple interactive features for enhanced daily experiences including phone usage, driving, meetings, and general activities.

## User Preferences

- Preferred communication style: Simple, everyday language
- Languages: Arabic and English
- Design style: Iron Man/secret agent HUD with holographic blue glow

## Features (11 Total)

1. **Sound Alerts System** - Notification tones, startup sounds, ringtones
2. **Gesture Controls** - Swipe, pinch, fist, point, wave hand gestures
3. **Jarvis AI Assistant** - Voice recognition + text-to-speech + smart responses
4. **Rear Camera View** - Live camera with capture and switch functionality
5. **Tasks & Reminders** - Add/complete tasks with checkboxes
6. **Live Translation** - English/Arabic/Spanish translation (50+ phrases)
7. **Health Monitoring** - Heart rate, steps, calories, sleep tracking
8. **Music Player** - Play/pause, next, previous with song display
9. **Calendar/Schedule** - Daily events view
10. **Quick Settings** - Sound, vibration, dark mode, notifications toggles
11. **Live Communication** - Calls and messages with real-time status

## System Architecture

**Frontend (xreal-integrated.html)**
- Single-page application with responsive grid layout
- WebSocket real-time connection (port 8080)
- Web Audio API for sound generation
- Web Speech API for voice recognition and synthesis
- MediaDevices API for camera access
- Geolocation API for GPS tracking
- Battery API for battery status

**Backend (server.js)**
- Express.js REST API server on port 5000
- WebSocket server on port 8080
- PostgreSQL database with connection pooling
- JWT authentication system
- Weather API integration (OpenWeatherMap)
- Reverse geocoding for location names

## Experience Modes

- **Standby** - Default mode with all panels visible
- **Driving** - Navigation and traffic focus
- **Meeting** - Participant and agenda tracking
- **Apps** - Phone notifications and messages
- **Fitness** - Health metrics display

## Key Files

- `xreal-integrated.html` - Main application interface
- `server.js` - Backend API server
- `package.json` - Node.js dependencies

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/weather` - Weather data
- `POST /api/actions/call` - Initiate call
- `POST /api/actions/message` - Send message
- `GET /api/location/reverse` - Reverse geocoding

## External Dependencies

- Express.js, WebSocket (ws), PostgreSQL (pg)
- JWT, bcryptjs, cors, axios
- dotenv, node-cron, multer
