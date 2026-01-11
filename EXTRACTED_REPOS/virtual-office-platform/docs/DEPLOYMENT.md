# Deployment Guide

Complete guide for deploying the Virtual Office Platform to production.

## Pre-Deployment Checklist

### Security
- [ ] Change default `PASSCODE` to a strong, unique value
- [ ] Generate secure `SESSION_SECRET` (32+ random characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set `NODE_ENV=production`
- [ ] Disable debug logging
- [ ] Review CORS settings
- [ ] Set secure cookie flags

### Database
- [ ] Production PostgreSQL instance ready
- [ ] Database backups configured
- [ ] Connection pooling configured
- [ ] Run database migrations
- [ ] Test database connectivity
- [ ] Configure database user permissions

### Environment
- [ ] All `.env` variables configured
- [ ] File upload storage ready (local or S3)
- [ ] Upload directory permissions set
- [ ] Log rotation configured
- [ ] Monitoring tools installed

### Application
- [ ] Dependencies installed
- [ ] Application built for production
- [ ] Static files compiled
- [ ] Error handling tested
- [ ] Health checks working

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Authentication
SESSION_SECRET=your-32-char-random-secret
PASSCODE=your-secure-passcode

# Server
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads
```

### Optional Variables

```env
# AWS S3 (for cloud storage)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Email (future)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

## Deployment Options

### Option 1: Traditional Server (VPS/Dedicated)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Application Setup

```bash
# Clone repository
git clone <repository-url>
cd virtual-office-platform

# Install dependencies
npm install --production

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Build application
npm run build

# Setup uploads directory
mkdir -p uploads/{voice,photos,documents}
chmod 755 uploads
chmod 755 uploads/*
```

#### 3. Database Setup

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE virtual_office;
CREATE USER virtual_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE virtual_office TO virtual_user;
\q

# Run migrations
psql -U virtual_user -d virtual_office -f database/schema.sql

# Or use Drizzle
npm run db:push
```

#### 4. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'virtual-office',
    script: 'dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start application:

```bash
# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Enable PM2 startup script
pm2 startup
```

#### 5. Nginx Configuration

Create `/etc/nginx/sites-available/virtual-office`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (added by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Uploads proxy
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files (frontend)
    location / {
        root /var/www/virtual-office/dist/public;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Client-side routing
    location ~ ^/cloning|/office {
        root /var/www/virtual-office/dist/public;
        try_files $uri /index.html;
    }

    # File upload size limit
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/virtual-office /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com
sudo certbot renew --dry-run  # Test renewal
```

#### 7. Firewall Setup

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create uploads directory
RUN mkdir -p uploads/voice uploads/photos uploads/documents

EXPOSE 5000

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
      - DATABASE_URL=postgresql://postgres:password@db:5432/virtual_office
      - SESSION_SECRET=${SESSION_SECRET}
      - PASSCODE=${PASSCODE}
      - CORS_ORIGIN=https://yourdomain.com
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=virtual_office
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./dist/public:/usr/share/nginx/html:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 3. Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down

# Restart
docker-compose restart
```

---

### Option 3: Cloud Platforms

#### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create virtual-office-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secret
heroku config:set PASSCODE=your-passcode

# Deploy
git push heroku main

# Run migrations
heroku run npm run db:push

# View logs
heroku logs --tail
```

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Set environment variables via dashboard
# - DATABASE_URL (auto-configured)
# - SESSION_SECRET
# - PASSCODE
# - CORS_ORIGIN
```

#### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health
curl https://yourdomain.com/api/health

# Test API
curl -X POST https://yourdomain.com/api/cloning/verify-passcode \
  -H "Content-Type: application/json" \
  -d '{"passcode": "your-passcode"}'
```

### 2. Monitoring Setup

#### PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
```

#### Health Checks

Create a monitoring cron job:

```bash
# Create health check script
cat > /usr/local/bin/health-check.sh << 'EOF'
#!/bin/bash
if ! curl -f https://yourdomain.com/api/health > /dev/null 2>&1; then
  echo "Health check failed at $(date)" >> /var/log/health-check.log
  pm2 restart virtual-office
fi
EOF

chmod +x /usr/local/bin/health-check.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/health-check.sh") | crontab -
```

### 3. Backup Strategy

#### Database Backups

```bash
# Daily backup script
cat > /usr/local/bin/db-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/backups/db
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U virtual_user virtual_office | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/db-backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/db-backup.sh") | crontab -
```

#### File Backups

```bash
# Backup uploads
rsync -av --delete uploads/ /backups/uploads/
```

### 4. Log Management

```bash
# Setup log rotation
cat > /etc/logrotate.d/virtual-office << 'EOF'
/var/www/virtual-office/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

---

## Scaling

### Horizontal Scaling

Use PM2 cluster mode or load balancer:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'virtual-office',
    script: 'dist/server/index.js',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster'
  }]
};
```

### Database Scaling

- Enable connection pooling
- Use read replicas
- Configure connection limits
- Optimize queries with indexes

### File Storage Scaling

Migrate to S3 or similar:

```typescript
// server/middleware/multer-s3.ts
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET!,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});
```

---

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

**Permission errors:**
```bash
sudo chown -R $USER:$USER uploads/
chmod -R 755 uploads/
```

**Database connection failed:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U virtual_user -d virtual_office -c "SELECT 1"
```

**SSL certificate issues:**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## Security Best Practices

1. **Never commit `.env` files**
2. **Use strong passwords and secrets**
3. **Enable HTTPS only**
4. **Configure firewall rules**
5. **Keep dependencies updated**
6. **Monitor logs for suspicious activity**
7. **Implement rate limiting**
8. **Use CSP headers**
9. **Regular security audits**
10. **Keep backups encrypted**

---

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart
pm2 restart virtual-office
```

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update
npm update

# Audit security
npm audit
npm audit fix
```

---

## Rollback Procedure

```bash
# Revert to previous version
git revert HEAD
npm install
npm run build
pm2 restart virtual-office

# Or restore from backup
git checkout <previous-commit-hash>
npm install
npm run build
pm2 restart virtual-office
```

---

## Support & Monitoring

- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry, Rollbar
- **Performance monitoring**: New Relic, DataDog
- **Log management**: ELK Stack, Papertrail

---

Last updated: 2026-01-11
