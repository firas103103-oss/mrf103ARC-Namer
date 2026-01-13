const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const cron = require('node-cron');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_locations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_contacts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// WebSocket for real-time updates
const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map();

wss.on('connection', (ws, req) => {
  console.log('🔗 New WebSocket connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'auth' && data.token) {
        // Associate WebSocket with user
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET || 'xreal-secret');
        clients.set(ws, decoded.userId);
        ws.send(JSON.stringify({ type: 'auth_success' }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Broadcast to specific user
function broadcastToUser(userId, data) {
  for (const [ws, wsUserId] of clients.entries()) {
    if (wsUserId === userId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
}

// Weather API integration
async function getWeatherData(lat, lon) {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY || 'demo_key';
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    return {
      temperature: Math.round(response.data.main.temp),
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return {
      temperature: 22,
      condition: 'Clear',
      description: 'clear sky',
      humidity: 65,
      windSpeed: 3.5
    };
  }
}

// Maps/Navigation integration
async function getNavigationData(origin, destination) {
  try {
    // Using mock data - in production, integrate with Google Maps API
    const mockData = {
      distance: '12.5 km',
      duration: '18 mins',
      traffic: 'moderate',
      route: 'Optimal route via Highway 101',
      eta: new Date(Date.now() + 18 * 60 * 1000).toISOString()
    };
    
    return mockData;
  } catch (error) {
    console.error('Navigation API error:', error);
    return null;
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User authentication (simplified)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // In production, implement proper authentication
    const token = jwt.sign(
      { userId: 1, username },
      process.env.JWT_SECRET || 'xreal-secret',
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: 1, username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile and preferences
app.get('/api/user/profile', async (req, res) => {
  try {
    // Mock user data for now
    const userData = {
      id: 1,
      username: 'Agent007',
      email: 'agent@xreal.com',
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: true,
        location: true
      },
      stats: {
        totalInteractions: 156,
        favoriteMode: 'driving',
        activeHours: 8.5
      }
    };
    
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Weather endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const weatherData = await getWeatherData(lat || 25.2048, lon || 55.2708); // Default to Dubai
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Navigation endpoint
app.post('/api/navigation/route', async (req, res) => {
  try {
    const { origin, destination } = req.body;
    const routeData = await getNavigationData(origin, destination);
    res.json(routeData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Real-time location update
app.post('/api/location/update', async (req, res) => {
  try {
    const { lat, lon, address } = req.body;
    const userId = 1; // In production, get from JWT token
    
    await pool.query(
      'INSERT INTO user_locations (user_id, latitude, longitude, address) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET latitude = $2, longitude = $3, address = $4, updated_at = CURRENT_TIMESTAMP',
      [userId, lat, lon, address]
    );
    
    // Broadcast location update to user's connected devices
    broadcastToUser(userId, {
      type: 'location_update',
      data: { lat, lon, address }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = 1; // In production, get from JWT token
    
    const result = await pool.query(
      'SELECT * FROM user_notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notification
app.post('/api/notifications', async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const userId = 1; // In production, get from JWT token
    
    const result = await pool.query(
      'INSERT INTO user_notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, message, type || 'info']
    );
    
    const notification = result.rows[0];
    
    // Broadcast notification to user
    broadcastToUser(userId, {
      type: 'new_notification',
      data: notification
    });
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calendar events (mock data)
app.get('/api/calendar/events', async (req, res) => {
  try {
    // Mock calendar data - integrate with real calendar APIs
    const events = [
      {
        id: 1,
        title: 'Team Meeting',
        start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        location: 'Conference Room A',
        participants: 4
      },
      {
        id: 2,
        title: 'Client Presentation',
        start: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        location: 'Virtual',
        participants: 8
      }
    ];
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Live Communication Services
const CallService = {
  activeCall: null,
  
  async initiateCall(contact, userId) {
    const callId = 'call_' + Date.now();
    const callData = {
      id: callId,
      contact: contact,
      status: 'connecting',
      startTime: new Date().toISOString(),
      type: 'outbound'
    };
    
    this.activeCall = callData;
    
    // Simulate real call progression
    setTimeout(() => {
      if (this.activeCall?.id === callId) {
        this.activeCall.status = 'ringing';
        broadcastToUser(userId, {
          type: 'call_status',
          data: { ...this.activeCall, status: 'ringing' }
        });
      }
    }, 1000);
    
    setTimeout(() => {
      if (this.activeCall?.id === callId) {
        this.activeCall.status = 'connected';
        this.activeCall.duration = 0;
        broadcastToUser(userId, {
          type: 'call_status', 
          data: { ...this.activeCall, status: 'connected' }
        });
        
        // Start call timer
        this.startCallTimer(callId, userId);
      }
    }, 3000);
    
    return callData;
  },
  
  startCallTimer(callId, userId) {
    const interval = setInterval(() => {
      if (this.activeCall?.id === callId && this.activeCall.status === 'connected') {
        this.activeCall.duration = (this.activeCall.duration || 0) + 1;
        broadcastToUser(userId, {
          type: 'call_timer',
          data: { duration: this.activeCall.duration }
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);
  },
  
  endCall(userId) {
    if (this.activeCall) {
      const endData = { ...this.activeCall, status: 'ended' };
      this.activeCall = null;
      broadcastToUser(userId, {
        type: 'call_status',
        data: endData
      });
      return endData;
    }
    return null;
  }
};

const MessagingService = {
  async sendMessage(contact, message, userId) {
    const messageId = 'msg_' + Date.now();
    const messageData = {
      id: messageId,
      contact: contact,
      message: message,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    // Simulate message delivery
    setTimeout(() => {
      messageData.status = 'delivered';
      broadcastToUser(userId, {
        type: 'message_status',
        data: messageData
      });
      
      // Simulate auto-reply after 2-5 seconds
      setTimeout(() => {
        const autoReply = this.generateAutoReply(message);
        broadcastToUser(userId, {
          type: 'message_received',
          data: {
            id: 'msg_' + Date.now(),
            from: contact,
            message: autoReply,
            timestamp: new Date().toISOString()
          }
        });
      }, Math.random() * 3000 + 2000);
      
    }, 1500);
    
    return messageData;
  },
  
  generateAutoReply(originalMessage) {
    const replies = [
      "تم استلام رسالتك، سأرد عليك قريباً",
      "شكراً لك، سأتواصل معك لاحقاً", 
      "موافق، مفهوم",
      "رسالة مهمة، سأعود إليك",
      "تم، سأراجع الموضوع"
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
};

// Quick actions
app.post('/api/actions/:action', async (req, res) => {
  try {
    const { action } = req.params;
    const { data } = req.body;
    const userId = 1; // In production, get from JWT token
    
    let result = { success: true, message: '', data: null };
    
    switch (action) {
      case 'call':
        const callData = await CallService.initiateCall(data.contact, userId);
        result.message = `🔥 اتصال مباشر جاري إلى ${data.contact}`;
        result.data = callData;
        break;
        
      case 'message':
        const messageData = await MessagingService.sendMessage(data.contact, data.message, userId);
        result.message = `📱 رسالة مرسلة إلى ${data.contact}`;
        result.data = messageData;
        break;
        
      case 'navigate':
        // Start navigation
        const routeData = await getNavigationData(data.origin, data.destination);
        result.data = routeData;
        result.message = `🗺️ ملاحة مباشرة بدأت إلى ${data.destination}`;
        // Send live navigation updates
        broadcastToUser(userId, {
          type: 'navigation_started',
          data: routeData
        });
        break;
        
      case 'end_call':
        const endedCall = CallService.endCall(userId);
        result.message = endedCall ? "📞 تم إنهاء المكالمة" : "لا توجد مكالمة نشطة";
        result.data = endedCall;
        break;
        
      case 'reminder':
        // Create reminder/notification
        await pool.query(
          'INSERT INTO user_notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
          [1, 'Reminder', data.message, 'reminder']
        );
        result.message = `Reminder set: ${data.message}`;
        break;
        
      case 'photo':
        // Disabled - XReal AR doesn't require camera functionality
        result.success = false;
        result.message = 'Camera functionality disabled for XReal AR';
        break;
        
      case 'translate':
        // Translation service integration
        result.message = `Translated: "${data.text}" to ${data.targetLanguage}`;
        result.data = { translation: 'Translated text would appear here' };
        break;
        
      default:
        result.success = false;
        result.message = 'Unknown action';
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard data endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    const userId = 1;
    
    // Get user's latest location
    const locationResult = await pool.query(
      'SELECT * FROM user_locations WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [userId]
    );
    
    const location = locationResult.rows[0];
    
    // Get weather for user's location
    const weather = location ? 
      await getWeatherData(location.latitude, location.longitude) :
      await getWeatherData(25.2048, 55.2708);
    
    // Get unread notifications count
    const notificationResult = await pool.query(
      'SELECT COUNT(*) as count FROM user_notifications WHERE user_id = $1 AND read = FALSE',
      [userId]
    );
    
    const dashboardData = {
      user: {
        id: userId,
        status: 'ACTIVE',
        mode: 'STANDBY',
        location: location?.address || 'Location not set'
      },
      weather,
      notifications: {
        unread: parseInt(notificationResult.rows[0].count),
        latest: 'System update available'
      },
      system: {
        battery: 85,
        connection: '5G',
        performance: 'OPTIMAL'
      },
      time: new Date().toISOString()
    };
    
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scheduled tasks for real-time updates
cron.schedule('*/5 * * * *', async () => {
  // Update system data every 5 minutes
  try {
    const dashboardData = await fetch(`http://localhost:${PORT}/api/dashboard`)
      .then(res => res.json());
    
    // Broadcast updates to all connected users
    for (const [ws, userId] of clients.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'dashboard_update',
          data: dashboardData
        }));
      }
    }
  } catch (error) {
    console.error('Scheduled update error:', error);
  }
});

// Start server
async function startServer() {
  try {
    await initDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 XReal AR Server running on port ${PORT}`);
      console.log(`🔌 WebSocket server running on port 8080`);
      console.log(`🌐 API Documentation: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;