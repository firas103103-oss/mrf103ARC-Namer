# 🚢 Deployment Guide - XBio IoT Platform

Production deployment guide for cloud platforms and self-hosted environments.

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] SSL certificates ready (for production)
- [ ] Monitoring setup planned
- [ ] Backup strategy defined
- [ ] Security audit completed

---

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
# Environment
NODE_ENV=production

# Server
PORT=5000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@host:5432/xbio_prod

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# Security
SESSION_SECRET=your-very-long-random-secret-min-32-chars

# Frontend URL (for CORS)
FRONTEND_URL=https://your-domain.com

# WebSocket
WS_PORT=5000
```

### Security Recommendations

1. **Use Strong Secrets**
   ```bash
   # Generate random secret
   openssl rand -hex 32
   ```

2. **Database Credentials**
   - Use strong passwords (20+ characters)
   - Rotate credentials regularly
   - Use connection pooling

3. **API Keys**
   - Never commit to version control
   - Use environment-specific keys
   - Implement rate limiting

---

## 🏗️ Build for Production

### 1. Build Client

```bash
npm run build:client
```

Output: `dist/public/`

### 2. Build Server

```bash
npm run build:server
```

Output: `dist/server/`

### 3. Verify Build

```bash
# Test production build locally
NODE_ENV=production node dist/server/index.js
```

---

## ☁️ Cloud Deployment Options

### Option 1: Railway (Recommended)

#### Setup

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init
   ```

4. **Add Database**
   ```bash
   railway add postgres
   ```

5. **Set Environment Variables**
   ```bash
   railway variables set OPENAI_API_KEY=sk-...
   railway variables set NODE_ENV=production
   ```

6. **Deploy**
   ```bash
   railway up
   ```

#### railway.json Configuration

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

### Option 2: Heroku

#### Setup

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   # Or download from heroku.com
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create xbio-platform
   ```

4. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

5. **Set Environment**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set OPENAI_API_KEY=sk-...
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

#### Procfile

```
web: node dist/server/index.js
```

---

### Option 3: DigitalOcean App Platform

#### Setup via Web UI

1. Go to DigitalOcean App Platform
2. Create New App
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
   - **HTTP Port**: `5000`

5. Add PostgreSQL database
6. Set environment variables
7. Deploy

#### app.yaml Configuration

```yaml
name: xbio-platform
services:
  - name: web
    github:
      repo: your-username/xbio-iot-platform
      branch: main
    build_command: npm run build
    run_command: npm start
    http_port: 5000
    environment_slug: node-js
    envs:
      - key: NODE_ENV
        value: production
      - key: OPENAI_API_KEY
        scope: RUN_TIME
        type: SECRET
databases:
  - name: xbio-db
    engine: PG
    version: "14"
```

---

### Option 4: AWS (Advanced)

#### Using Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize**
   ```bash
   eb init -p node.js xbio-platform
   ```

3. **Create Environment**
   ```bash
   eb create xbio-production
   ```

4. **Set Environment**
   ```bash
   eb setenv NODE_ENV=production OPENAI_API_KEY=sk-...
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

---

## 🖥️ Self-Hosted Deployment

### Using Docker (Recommended)

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files
COPY dist ./dist
COPY database ./database
COPY firmware ./firmware

# Expose ports
EXPOSE 5000

# Start server
CMD ["node", "dist/server/index.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/xbio
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=xbio
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 3. Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### Using PM2 (Node.js Process Manager)

#### 1. Install PM2

```bash
npm install -g pm2
```

#### 2. Create ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'xbio-platform',
    script: './dist/server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

#### 3. Deploy

```bash
# Start
pm2 start ecosystem.config.js

# Save process list
pm2 save

# Setup startup script
pm2 startup

# Monitor
pm2 monit

# Restart
pm2 restart xbio-platform
```

---

## 🔒 SSL/TLS Configuration

### Using Let's Encrypt + Nginx

#### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

#### 2. Configure Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/xbio/public;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

#### 3. Get Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

---

## 📊 Monitoring & Logging

### Using PM2

```bash
# Real-time monitoring
pm2 monit

# Logs
pm2 logs xbio-platform

# Metrics
pm2 status
```

### Using External Services

#### Recommended Services
- **Sentry**: Error tracking
- **Datadog**: Application monitoring
- **LogRocket**: Session replay
- **New Relic**: Performance monitoring

#### Setup Sentry (Example)

```javascript
// server/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

---

## 💾 Database Management

### Backups

#### Automated Daily Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="xbio"

pg_dump $DB_NAME | gzip > $BACKUP_DIR/xbio_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "xbio_*.sql.gz" -mtime +7 -delete
```

#### Cron Job

```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Migrations

```bash
# Run migrations
npm run db:push

# Rollback (if needed)
npm run db:rollback
```

---

## 🔍 Health Checks

### Endpoint

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### Monitoring Script

```bash
#!/bin/bash
# health-check.sh

ENDPOINT="https://your-domain.com/health"

if curl -f $ENDPOINT > /dev/null 2>&1; then
  echo "✅ Service is healthy"
  exit 0
else
  echo "❌ Service is down"
  # Send alert
  exit 1
fi
```

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Deploy multiple instances
- Share session state (Redis)
- Use message queue for long tasks

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable caching
- Use CDN for static assets

---

## 🆘 Troubleshooting Production

### Common Issues

#### High Memory Usage
```bash
# Check memory
pm2 status
# Restart with memory limit
pm2 restart xbio-platform --max-memory-restart 1G
```

#### Database Connection Pool Exhausted
```javascript
// Increase pool size
const pool = new Pool({
  max: 50,  // Increase from 20
  idleTimeoutMillis: 30000,
});
```

#### WebSocket Disconnections
- Check proxy timeout settings
- Implement heartbeat/ping-pong
- Add reconnection logic

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] SSL certificate valid
- [ ] Database backups running
- [ ] Monitoring alerts configured
- [ ] Health checks passing
- [ ] Logs collecting properly
- [ ] Performance acceptable
- [ ] Security headers set
- [ ] Rate limiting enabled
- [ ] Documentation updated

---

**Questions? Check [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)**
