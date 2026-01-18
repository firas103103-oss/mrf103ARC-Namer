# ARC System Deployment Guide

**System Status**: ✅ v0.1.x Production-Ready  
**Last Updated**: January 1, 2026

## Quick Start (Development)

```bash
# 1. Clone the repository
git clone https://github.com/firas103103-oss/mrf103ARC-Namer.git
cd mrf103ARC-Namer

# 2. Copy environment template
cp .env.example .env

# 3. Fill in your credentials in .env
# Required:
#   - OPENAI_API_KEY (for Mr.F brain)
#   - ARC_OPERATOR_PASSWORD (login password)
#   - SESSION_SECRET (session token signing)
#
# Optional but recommended:
#   - SUPABASE_URL, SUPABASE_KEY (database)
#   - ELEVENLABS_API_KEY (voice synthesis)
#   - ANTHROPIC_API_KEY, GEMINI_API_KEY (alternative LLMs)

# 4. Install dependencies
npm install

# 5. Start development server
npm run dev

# Server will listen on http://localhost:5001
```

## Environment Configuration

### Required Credentials

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `OPENAI_API_KEY` | Mr.F brain (chat intelligence) | https://platform.openai.com/api-keys |
| `ARC_OPERATOR_PASSWORD` | Login password for UI access | You choose (min 8 chars recommended) |
| `SESSION_SECRET` | Session token signing | Generate random 32+ char string |

### Optional Services

| Variable | Purpose | Source |
|----------|---------|--------|
| `SUPABASE_URL` | Database backend | https://supabase.com |
| `SUPABASE_KEY` | Database authentication | Supabase project settings |
| `ELEVENLABS_API_KEY` | Voice synthesis | https://elevenlabs.io |
| `ANTHROPIC_API_KEY` | Alternative LLM | https://console.anthropic.com |
| `GEMINI_API_KEY` | Alternative LLM | Google AI Studio |

## Features

### ✅ Available in v0.1.x

1. **Dashboard** - Command history, events, timeline
2. **Live Chat** - Mr.F brain via OpenAI (gpt-4o-mini)
3. **Real-time Updates** - WebSocket /realtime endpoint
4. **Self-Check** - System status and health
5. **Virtual Office** - Command history and analytics
6. **Authentication** - Session-based with password
7. **Rate Limiting** - 120 req/min per IP
8. **API Security** - Field whitelisting, injection protection

### ⚠️ Deferred Features

- Voice synthesis (ElevenLabs stubs exist, not fully wired)
- Bio Sentinel firmware (spec defined, hardware-dependent)
- n8n workflow orchestration (webhooks defined, service integration pending)

## API Endpoints (21 Total)

### Authentication
- `POST /auth/login` - Login with operator password
- `POST /auth/logout` - Logout and destroy session

### Dashboard
- `GET /api/dashboard/commands` - Command history
- `GET /api/dashboard/events` - Agent events
- `GET /api/dashboard/feedback` - User feedback (stub)
- `GET /api/core/timeline` - Merged timeline view

### Brain Integration
- `POST /api/call_mrf_brain` - Chat with OpenAI (POST message → get response)

### Core APIs
- `GET /api/arc/command-log` - Full command log
- `GET /api/arc/agent-events` - Agent event stream
- `GET /api/arc/system-status` - System health
- `GET /api/arc/query` - Query brain/knowledge
- `POST /api/arc/execute` - Execute brain command

### WebSocket
- `WS /realtime` - Real-time activity feed (authenticated)

*See docs/API_CONTRACT_BASELINE.md for complete endpoint documentation*

## Security

### ✅ Implemented

- **Session Auth**: express-session with HttpOnly, SameSite=lax cookies
- **Field Whitelisting**: All responses filtered via `pick()` function
- **Rate Limiting**: 120 requests/minute per IP
- **Backend Proxy**: No direct Supabase access from client
- **Input Validation**: TypeScript strict mode, zod schemas

### 🔒 Best Practices

1. **Never commit .env** - File is in .gitignore
2. **Use environment variables** - Load via dotenv at startup
3. **Rotate SESSION_SECRET** - Generate new secret periodically
4. **Monitor API logs** - Check for unauthorized access attempts
5. **Keep dependencies updated** - Run `npm audit` regularly

## Deployment Options

### Docker (Recommended)

```dockerfile
# Dockerfile provided in repo
docker build -t arc-system .
docker run -e NODE_ENV=production \
  -e PORT=5001 \
  -e OPENAI_API_KEY=sk-... \
  -e ARC_OPERATOR_PASSWORD=... \
  -e SESSION_SECRET=... \
  -p 5001:5001 \
  arc-system
```

### Heroku / Railway

```bash
# Set environment variables in dashboard, then:
git push heroku main
```

### VPS (Ubuntu/Debian)

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/firas103103-oss/mrf103ARC-Namer.git
cd mrf103ARC-Namer
npm install

# Create .env with credentials
cp .env.example .env
nano .env  # Fill in credentials

# Run with systemd
sudo tee /etc/systemd/system/arc-system.service > /dev/null <<EOF
[Unit]
Description=ARC System
After=network.target

[Service]
Type=simple
User=arc
WorkingDirectory=/home/arc/arc-system
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable arc-system
sudo systemctl start arc-system
```

## Testing

```bash
# Type checking
npm run check

# Start dev server
npm run dev

# Build for production
npm run build

# Test endpoints with curl
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}' \
  -c cookies.txt

curl -b cookies.txt http://localhost:5001/api/dashboard/commands
```

## Troubleshooting

### Server won't start
```bash
# Check for port conflicts
lsof -i :5001

# Verify .env file
cat .env | grep -E "OPENAI_API_KEY|ARC_OPERATOR_PASSWORD|SESSION_SECRET"

# Check Node.js version (need 18+)
node --version
```

### Authentication issues
```bash
# Verify password is correct
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"arc-dev-password-123"}'

# Check if cookies are being set
curl -v -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"arc-dev-password-123"}' 2>&1 | grep Set-Cookie
```

### WebSocket not connecting
```bash
# WebSocket requires session authentication
# First login, then try real-time endpoint in browser console:
const ws = new WebSocket('ws://localhost:5001/realtime');
ws.addEventListener('open', () => console.log('Connected'));
```

### Supabase errors
- Real-time subscription warnings are expected if `activity_feed` table doesn't exist
- Create table in Supabase dashboard if needed
- Check DATABASE_URL is correctly formatted

## Performance

### Recommended Settings

| Variable | Value | Reason |
|----------|-------|--------|
| `NODE_ENV` | `production` | Disables debug logging, optimizes startup |
| `PORT` | `5001` | Standard port for ARC services |
| `TOKEN_TTL` | `3600` | 1 hour session duration |
| `REFRESH_TTL` | `86400` | 24 hour refresh token lifetime |

### Monitoring

```bash
# Monitor memory usage
watch -n 1 'ps aux | grep "npm run dev"'

# Check request logs
tail -f logs/access.log  # If logging enabled

# Monitor WebSocket connections
# Server logs will show connection events
```

## Support

- **Documentation**: See docs/ folder
- **Architecture**: See docs/ARCHITECTURE_GUARDRAILS.md
- **API Contract**: See docs/API_CONTRACT_BASELINE.md
- **Final State**: See docs/ARC_FINAL_STATE.md

## License

MIT - See LICENSE file
