# 🚀 Deployment Guide

This guide covers deploying the Virtual Office Platform to production.

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ database
- Domain name (optional)
- SSL certificate (recommended for production)

---

## Environment Setup

### 1. Production Environment Variables

Create `.env` file with production values:

```env
# Database
DATABASE_URL=postgresql://user:password@prod-db.example.com:5432/virtual_office

# Authentication
SESSION_SECRET=<generate-strong-32-char-random-string>
PASSCODE=<change-from-default>

# JWT (if using)
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# Server
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# Optional: S3 Storage
USE_S3_STORAGE=true
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_REGION=us-east-1
AWS_S3_BUCKET=virtual-office-uploads
```

### 2. Generate Secure Secrets

```bash
# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## Database Setup

### 1. Create Production Database

```sql
CREATE DATABASE virtual_office;
CREATE USER virtual_office_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE virtual_office TO virtual_office_user;
```

### 2. Run Migrations

```bash
npm run db:push
```

Or manually run the SQL schema:

```bash
psql -h your-db-host -U virtual_office_user -d virtual_office -f database/schema.sql
```

---

## Build & Deploy

### Method 1: Traditional VPS/Server

#### 1. Install Dependencies
```bash
npm ci --production
```

#### 2. Build Application
```bash
npm run build
```

This creates:
- `dist/public/` - Built frontend
- `dist/server/` - Compiled backend

#### 3. Start Production Server
```bash
npm start
```

Or use PM2:
```bash
npm install -g pm2
pm2 start dist/server/index.js --name virtual-office
pm2 save
pm2 startup
```

---

### Method 2: Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application
COPY . .

# Build
RUN npm run build

# Expose ports
EXPOSE 5000

# Start
CMD ["npm", "start"]
```

#### Build & Run
```bash
docker build -t virtual-office .
docker run -d -p 5000:5000 --env-file .env virtual-office
```

#### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: virtual_office
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

### Method 3: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
heroku create virtual-office-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secret
heroku config:set PASSCODE=your-passcode

# Deploy
git push heroku main
```

#### Railway
```bash
# Install Railway CLI
railway init

# Link project
railway link

# Add PostgreSQL
railway add postgresql

# Set variables in Railway dashboard

# Deploy
railway up
```

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Configure build command: `npm run build`
4. Configure run command: `npm start`
5. Deploy

---

## Nginx Configuration

### Reverse Proxy Setup

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend (if serving separately)
    location / {
        root /var/www/virtual-office/dist/public;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }

    # File upload size limit
    client_max_body_size 50M;
}
```

---

## SSL/TLS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## File Storage Options

### Local Storage (Default)
- Files stored in `./uploads`
- Ensure proper permissions: `chmod 755 uploads`
- Regular backups recommended

### S3 Storage (Recommended for Production)

Update `.env`:
```env
USE_S3_STORAGE=true
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
```

Install AWS SDK:
```bash
npm install @aws-sdk/client-s3
```

---

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 monit
pm2 logs virtual-office
```

### Log Files
Configure log rotation:
```bash
# /etc/logrotate.d/virtual-office
/var/log/virtual-office/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 node node
    sharedscripts
}
```

---

## Security Checklist

- [ ] Strong SESSION_SECRET (32+ characters)
- [ ] Change default PASSCODE
- [ ] Enable HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Configure CORS_ORIGIN to your domain
- [ ] Set proper file permissions
- [ ] Enable rate limiting
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Configure firewall (only ports 80, 443, 22)
- [ ] Set up monitoring/alerting

---

## Backup Strategy

### Database Backup
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump -h localhost -U virtual_office_user virtual_office > backup_$DATE.sql
```

### File Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

### Automated Backups
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

---

## Performance Optimization

### 1. Enable Caching
- Use Redis for session storage
- Cache static assets
- Enable browser caching

### 2. Database Optimization
- Add indexes (already included in schema)
- Regular VACUUM
- Connection pooling

### 3. CDN Integration
- Serve static assets via CDN
- Optimize images
- Enable compression

---

## Troubleshooting

### Application Won't Start
1. Check logs: `pm2 logs`
2. Verify environment variables
3. Check database connection
4. Ensure port is available

### Database Connection Issues
1. Check DATABASE_URL format
2. Verify database exists
3. Check network/firewall rules
4. Test connection: `psql $DATABASE_URL`

### File Upload Failures
1. Check disk space
2. Verify upload directory permissions
3. Check MAX_FILE_SIZE setting
4. Review nginx client_max_body_size

---

## Health Checks

### Endpoint
```bash
curl http://localhost:5000/api/health
```

### Uptime Monitoring
Use services like:
- UptimeRobot
- Pingdom
- StatusCake

---

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Multiple application instances
- Shared database
- Centralized file storage (S3)
- Session storage in Redis

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable caching

---

## Support

For deployment issues:
1. Check logs first
2. Review [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
3. Open GitHub issue

---

**Last Updated**: January 2026
