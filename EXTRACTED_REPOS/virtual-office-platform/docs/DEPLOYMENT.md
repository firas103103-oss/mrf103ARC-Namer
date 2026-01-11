# Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Production Setup](#production-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Build Process](#build-process)
6. [Server Deployment](#server-deployment)
7. [Nginx Configuration](#nginx-configuration)
8. [SSL/HTTPS Setup](#sslhttps-setup)
9. [File Storage](#file-storage)
10. [Monitoring & Logging](#monitoring--logging)
11. [Backup Strategy](#backup-strategy)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Server**: Ubuntu 20.04+ or similar Linux distribution
- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: 20GB+ (depending on file uploads)
- **Domain**: Configured domain name (optional but recommended)

### Tools Required

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (optional, for reverse proxy)
sudo apt install -y nginx

# Install certbot for SSL (optional)
sudo apt install -y certbot python3-certbot-nginx
```

---

## Production Setup

### 1. Clone Repository

```bash
cd /var/www
sudo git clone <repository-url> virtual-office-platform
cd virtual-office-platform
```

### 2. Install Dependencies

```bash
npm ci --production=false
```

### 3. Set Permissions

```bash
# Create uploads directory
mkdir -p uploads/cloning

# Set ownership
sudo chown -R www-data:www-data uploads/
sudo chmod -R 755 uploads/
```

---

## Environment Configuration

Create production `.env` file:

```bash
cp .env.example .env
nano .env
```

### Required Production Variables

```env
# Database
DATABASE_URL=postgresql://dbuser:strong_password@localhost:5432/virtual_office_prod

# Authentication
SESSION_SECRET=<generate-strong-random-secret-32-chars-min>
PASSCODE=<your-custom-passcode>

# Server
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# Optional: Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

### Generate Secure Secrets

```bash
# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### 1. Create Production Database

```bash
sudo -u postgres psql
```

```sql
-- Create database user
CREATE USER dbuser WITH PASSWORD 'strong_password';

-- Create database
CREATE DATABASE virtual_office_prod OWNER dbuser;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE virtual_office_prod TO dbuser;

-- Exit
\q
```

### 2. Run Migrations

```bash
# Using SQL file
psql -U dbuser -d virtual_office_prod -f database/schema.sql

# Or using Drizzle
npm run db:push
```

### 3. Verify Database

```bash
psql -U dbuser -d virtual_office_prod -c "\dt"
```

You should see: `user_profiles`, `user_files`, `user_iot_devices`, `session`

---

## Build Process

### 1. Build Application

```bash
npm run build
```

This creates:
- `dist/public/` - Client build
- `dist/server/` - Server build (if applicable)

### 2. Verify Build

```bash
ls -la dist/public/
# Should contain: index.html, assets/, etc.
```

---

## Server Deployment

### Option 1: PM2 (Recommended)

#### Install PM2

```bash
sudo npm install -g pm2
```

#### Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'virtual-office-platform',
    script: './server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true
  }]
};
```

#### Start Application

```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions provided
```

#### PM2 Commands

```bash
# View logs
pm2 logs virtual-office-platform

# Restart
pm2 restart virtual-office-platform

# Stop
pm2 stop virtual-office-platform

# Monitor
pm2 monit

# Status
pm2 status
```

### Option 2: Systemd Service

Create `/etc/systemd/system/virtual-office.service`:

```ini
[Unit]
Description=Virtual Office Platform
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/virtual-office-platform
Environment=NODE_ENV=production
ExecStart=/usr/bin/node --loader tsx server/index.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable virtual-office
sudo systemctl start virtual-office
sudo systemctl status virtual-office
```

---

## Nginx Configuration

### 1. Create Nginx Configuration

Create `/etc/nginx/sites-available/virtual-office`:

```nginx
upstream virtual_office_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (certbot will add these)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logging
    access_log /var/log/nginx/virtual-office-access.log;
    error_log /var/log/nginx/virtual-office-error.log;

    # Client upload size
    client_max_body_size 50M;

    # Root for static files
    root /var/www/virtual-office-platform/dist/public;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://virtual_office_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads proxy
    location /uploads/ {
        proxy_pass http://virtual_office_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/virtual-office /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts
# Certbot will automatically update Nginx configuration

# Test renewal
sudo certbot renew --dry-run
```

### Auto-renewal

Certbot automatically sets up a cron job. Verify:

```bash
sudo systemctl status certbot.timer
```

---

## File Storage

### Local Storage (Default)

Files are stored in `uploads/cloning/` directory.

**Backup Strategy**:
```bash
# Daily backup script
#!/bin/bash
tar -czf /backups/uploads-$(date +%Y%m%d).tar.gz /var/www/virtual-office-platform/uploads/
```

### S3 Storage (Optional)

To use AWS S3 for file storage:

1. Install AWS SDK:
```bash
npm install aws-sdk
```

2. Update environment:
```env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

3. Modify `server/routes/cloning.ts` to use S3 storage

---

## Monitoring & Logging

### Application Logs

**PM2 Logs**:
```bash
pm2 logs virtual-office-platform
pm2 logs virtual-office-platform --err
pm2 logs virtual-office-platform --out
```

**Log Files**:
- Application: `./logs/out.log`, `./logs/err.log`
- Nginx: `/var/log/nginx/virtual-office-*.log`
- PostgreSQL: `/var/log/postgresql/`

### Monitoring Tools

**PM2 Monitoring**:
```bash
pm2 monit
```

**Server Monitoring** (optional):
```bash
# Install htop
sudo apt install htop

# Monitor resources
htop
```

### Log Rotation

Create `/etc/logrotate.d/virtual-office`:

```
/var/www/virtual-office-platform/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0644 www-data www-data
}
```

---

## Backup Strategy

### Database Backups

**Daily Backup Script** (`/usr/local/bin/backup-db.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="virtual_office_prod"

mkdir -p $BACKUP_DIR

pg_dump -U dbuser $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

**Setup Cron**:
```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-db.sh
```

### File Backups

Include uploads directory in regular backups:

```bash
# Create backup script
tar -czf /backups/files_$(date +%Y%m%d).tar.gz /var/www/virtual-office-platform/uploads/
```

---

## Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Strong SESSION_SECRET (32+ characters)
- [ ] Firewall configured (UFW or iptables)
- [ ] PostgreSQL only accepts local connections
- [ ] Regular security updates
- [ ] File upload validation
- [ ] Rate limiting (consider adding)
- [ ] CORS properly configured
- [ ] Secure cookie settings
- [ ] Regular backups
- [ ] Log monitoring
- [ ] Fail2ban for SSH protection

### Firewall Setup

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs virtual-office-platform --err

# Check process
pm2 status

# Verify environment
cat .env

# Check Node version
node --version  # Should be 18+
```

### Database Connection Issues

```bash
# Test connection
psql -U dbuser -d virtual_office_prod -c "SELECT 1"

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### File Upload Issues

```bash
# Check permissions
ls -la uploads/

# Fix permissions
sudo chown -R www-data:www-data uploads/
sudo chmod -R 755 uploads/

# Check disk space
df -h
```

### High Memory Usage

```bash
# Check PM2 processes
pm2 monit

# Reduce instances if needed
pm2 scale virtual-office-platform 1

# Check for memory leaks
pm2 restart virtual-office-platform
```

### Nginx Errors

```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/virtual-office-error.log

# Restart Nginx
sudo systemctl restart nginx
```

---

## Performance Optimization

### Node.js

- Use cluster mode (PM2)
- Enable gzip compression
- Implement caching
- Use connection pooling for database

### Nginx

- Enable gzip compression
- Configure caching for static assets
- Use HTTP/2
- Optimize worker processes

### Database

- Create indexes on frequently queried columns
- Regular VACUUM and ANALYZE
- Connection pooling
- Query optimization

---

## Maintenance

### Regular Tasks

**Daily**:
- Monitor logs for errors
- Check disk space
- Verify backups ran successfully

**Weekly**:
- Review application performance
- Check for security updates
- Analyze logs for patterns

**Monthly**:
- Update dependencies
- Test backup restoration
- Review and optimize database

---

## Scaling Considerations

### Horizontal Scaling

- Use PM2 cluster mode
- Load balancer (Nginx, HAProxy)
- Shared session storage (Redis)
- Distributed file storage (S3, MinIO)

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Implement caching (Redis)
- CDN for static assets

---

## Support

For deployment issues:
1. Check application logs
2. Review Nginx logs
3. Verify environment configuration
4. Check system resources
5. Open issue in repository

---

## Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Performance](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
