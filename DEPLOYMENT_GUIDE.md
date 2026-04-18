# 🚀 Home Service Website Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Frontend Deployment (React)](#frontend-deployment)
3. [Backend Deployment (Django)](#backend-deployment)
4. [Production Configuration](#production-configuration)
5. [Domain & SSL Setup](#domain--ssl-setup)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Testing & Monitoring](#testing--monitoring)

## 🔧 Prerequisites

### Required Accounts/Services:
- **Domain Name** (e.g., homeservices.in)
- **Hosting Provider** (Vercel, Netlify, AWS, DigitalOcean, etc.)
- **Database** (PostgreSQL, MySQL, or SQLite for small sites)
- **Payment Gateway** (Stripe account)
- **Email Service** (SendGrid, AWS SES, etc.)

### Development Tools:
```bash
# Node.js 16+ and npm
node --version
npm --version

# Python 3.8+
python --version

# Git
git --version
```

## 🎨 Frontend Deployment (React)

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd front-end/homefront
vercel --prod
```

**Vercel Configuration:**
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`
- Environment Variables: Add your backend URL

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
cd front-end/homefront
npm run build
netlify deploy --prod --dir=build
```

### Option 3: AWS S3 + CloudFront

```bash
# Build the app
cd front-end/homefront
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Frontend Environment Variables

Create `.env.production`:
```env
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_key
```

## 🖥️ Backend Deployment (Django)

### Option 1: Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DATABASE_URL=your-database-url

# Deploy
git subtree push --prefix back-end heroku main
```

### Option 2: DigitalOcean

```bash
# Create droplet with Ubuntu 20.04+
ssh root@your-server-ip

# Install dependencies
apt update
apt install python3-pip python3-venv nginx postgresql postgresql-contrib

# Setup project
git clone https://github.com/your-repo.git
cd Home-Service/back-end

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt

# Setup database
sudo -u postgres createdb homeservices
python manage.py migrate
python manage.py collectstatic --noinput
```

### Option 3: AWS EC2

```bash
# Launch EC2 instance with Ubuntu
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Setup similar to DigitalOcean
# Use Nginx as reverse proxy
```

### Production Settings

Create `production.py` in `back-end/HomeService/`:
```python
from .settings import *
import os

DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

## 🌐 Production Configuration

### Nginx Configuration

Create `/etc/nginx/sites-available/homeservices`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # Frontend
    location / {
        root /var/www/homeservices/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static/ {
        alias /var/www/homeservices/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/homeservices/backend/media/;
    }
}
```

### Systemd Service

Create `/etc/systemd/system/homeservices.service`:
```ini
[Unit]
Description=Home Service Django App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/homeservices/backend
Environment=PATH=/var/www/homeservices/backend/venv/bin
ExecStart=/var/www/homeservices/backend/venv/bin/gunicorn HomeService.wsgi:application --workers 3 --bind unix:/run/gunicorn.sock

[Install]
WantedBy=multi-user.target
```

## 🔐 Domain & SSL Setup

### Domain Configuration

1. **DNS Settings:**
```
A Record: @ -> YOUR_SERVER_IP
A Record: www -> YOUR_SERVER_IP
CNAME: api -> YOUR_SERVER_IP (optional)
```

2. **SSL Certificate (Let's Encrypt):**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🗝️ Environment Variables

### Backend Environment Variables

Create `.env` in `back-end/`:
```env
DEBUG=False
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/homeservices
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
FRONTEND_BASE_URL=https://your-domain.com
```

### Frontend Environment Variables

Create `.env.production` in `front-end/homefront/`:
```env
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
```

## 🗄️ Database Setup

### PostgreSQL (Recommended for Production)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE homeservices;
CREATE USER homeservices_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE homeservices TO homeservices_user;
\q

# Migrate
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Database Backup Script

Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/homeservices"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/homeservices_$DATE.sql"

mkdir -p $BACKUP_DIR
pg_dump -h localhost -U homeservices_user homeservices > $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

## 🧪 Testing & Monitoring

### Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Static files collected
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Firewall configured (ports 80, 443)
- [ ] Stripe webhook endpoints configured
- [ ] Email sending tested

### Post-Deployment Testing

```bash
# Test API endpoints
curl -X GET https://your-domain.com/api/workers/
curl -X POST https://your-domain.com/api/auth/login/

# Test frontend
curl -I https://your-domain.com/

# Test SSL
openssl s_client -connect your-domain.com:443
```

### Monitoring Setup

1. **Application Monitoring:**
   - Sentry for error tracking
   - LogRocket for user session recording

2. **Server Monitoring:**
   - Uptime Robot for uptime monitoring
   - CloudWatch for AWS resources

3. **Performance:**
   - Google PageSpeed Insights
   - GTmetrix for performance testing

## 📦 Deployment Scripts

### Automated Deployment Script

Create `deploy.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Backend deployment
cd back-end
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart homeservices

# Frontend deployment
cd ../front-end/homefront
npm install
npm run build
sudo rsync -av build/ /var/www/homeservices/frontend/

echo "✅ Deployment completed!"
```

## 🔧 Troubleshooting

### Common Issues

1. **502 Bad Gateway:**
   - Check if backend service is running
   - Verify Nginx configuration

2. **Static files 404:**
   - Run `python manage.py collectstatic`
   - Check Nginx static file paths

3. **Database connection errors:**
   - Verify DATABASE_URL format
   - Check database server status

4. **Stripe payment issues:**
   - Update webhook endpoint URL
   - Verify Stripe keys are correct

## 📞 Support

### Deployment Services Comparison

| Service | Frontend | Backend | Cost | Difficulty |
|----------|-----------|---------|-------|------------|
| Vercel + Heroku | ✅ | ✅ | $$ | Easy |
| Netlify + DigitalOcean | ✅ | ✅ | $ | Medium |
| AWS S3 + EC2 | ✅ | ✅ | $$$ | Hard |
| VPS + Manual | ✅ | ✅ | $ | Medium |

### Recommended Stack for Beginners:
- **Frontend:** Vercel (Free tier available)
- **Backend:** Heroku (Free tier available)
- **Database:** Heroku PostgreSQL
- **Domain:** Namecheap or GoDaddy

---

## 🎉 Quick Start Summary

1. **Choose hosting platform** (Vercel + Heroku recommended)
2. **Setup environment variables** for both frontend and backend
3. **Configure domain** and SSL certificates
4. **Deploy frontend** to Vercel
5. **Deploy backend** to Heroku
6. **Update Stripe** webhook URLs
7. **Test everything** before going live

**Your Home Service website will be live and ready for business!** 🚀
