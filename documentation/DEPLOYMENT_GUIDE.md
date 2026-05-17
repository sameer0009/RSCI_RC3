# RSCI-RC3 Platform - Complete Deployment Guide

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Options](#deployment-options)
4. [Production Setup](#production-setup)
5. [Security Hardening](#security-hardening)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Required Services
- [ ] PostgreSQL database (v15+)
- [ ] Redis cache (v7+)
- [ ] Node.js runtime (v18+)
- [ ] Judge0 API access (RapidAPI or self-hosted)
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (Let's Encrypt recommended)

### Required Accounts
- [ ] Hosting provider account
- [ ] Domain registrar (if using custom domain)
- [ ] RapidAPI account (for Judge0)
- [ ] Email service (for notifications)
- [ ] Monitoring service (optional)

### Code Preparation
- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] Build process verified
- [ ] Dependencies updated
- [ ] Security audit completed

---

## Environment Configuration

### Production Environment Variables

Create production `.env` files for both backend and frontend.


### Backend Environment (`backend/.env.production`)

```env
# Database - Use managed PostgreSQL service
DATABASE_URL="postgresql://username:password@host:5432/dbname?schema=public&sslmode=require"

# Redis - Use managed Redis service
REDIS_URL="redis://username:password@host:6379"

# JWT Secrets - Generate strong random strings
JWT_SECRET="your-super-secure-jwt-secret-min-32-chars"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV="production"

# Judge0 API
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-rapidapi-key"

# CORS & Auth
CORS_ORIGIN="https://yourdomain.com"
FRONTEND_URL="https://yourdomain.com"
JWT_SECRET="your-super-secure-jwt-secret"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret"

# Email Service (REQUIRED for Verification/Resets)
SMTP_HOST="smtp.resend.com"
SMTP_PORT=587
SMTP_USER="resend"
SMTP_PASS="your-api-key"
EMAIL_FROM='"RSCI-RC3" <noreply@yourdomain.com>'

# Social Login (OAuth)
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
GITHUB_CLIENT_ID="your-github-id"
GITHUB_CLIENT_SECRET="your-github-secret"
```

### Frontend Environment (`frontend/.env.production`)

```env
# API URL - Your backend domain
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Optional: Error Tracking
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
```

### Generating Secure Secrets

```bash
# Generate JWT secrets (Linux/Mac)
openssl rand -base64 32

# Generate JWT secrets (Windows PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```


---

## 🐋 Option 0: Docker Compose (Easiest & Production Ready)

**Best for**: Self-hosting, VPS deployments, and ensuring environment parity.

1. **Install Docker & Docker Compose** on your server.
2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/rsci-rc3.git && cd rsci-rc3
   ```
3. **Configure Environment**:
   ```bash
   cp .env.example .env
   nano .env # Fill in your production secrets
   ```
4. **Deploy**:
   ```bash
   docker-compose up -d --build
   ```
5. **Database Initialization**:
   ```bash
   docker exec -it coding-platform-backend npx prisma db push
   docker exec -it coding-platform-backend npx prisma db seed
   ```

---

## Deployment Options

### Option 1: Vercel + Railway (Recommended for Quick Start)

**Best for**: Small to medium projects, quick deployment, minimal DevOps

#### Frontend on Vercel

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/rsci-rc3.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - Framework: Next.js
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Add environment variables from `frontend/.env.production`
   - Click "Deploy"

3. **Configure Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your domain
   - Update DNS records as instructed

#### Backend on Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Copy the `DATABASE_URL` connection string

4. **Add Redis**
   - Click "New" → "Database" → "Redis"
   - Copy the `REDIS_URL` connection string

5. **Configure Backend Service**
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Set Root Directory: `backend`
   - Add all environment variables
   - Set Start Command: `npm run start`

6. **Generate Domain**
   - Go to Settings → Generate Domain
   - Update frontend `NEXT_PUBLIC_API_URL` with this domain
   - Redeploy frontend on Vercel

**Estimated Cost**: $5-20/month


### Option 2: AWS (Full Control, Scalable)

**Best for**: Production applications, high traffic, enterprise

#### Architecture Overview
```
Internet → CloudFront (CDN) → S3 (Frontend)
       → ALB → ECS/EC2 (Backend) → RDS (PostgreSQL)
                                  → ElastiCache (Redis)
```

#### Step-by-Step AWS Deployment

**1. Setup RDS PostgreSQL**
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier rsci-rc3-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username admin \
  --master-user-password YourSecurePassword \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name your-subnet-group \
  --backup-retention-period 7 \
  --publicly-accessible false
```

**2. Setup ElastiCache Redis**
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id rsci-rc3-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --cache-subnet-group-name your-subnet-group \
  --security-group-ids sg-xxxxx
```

**3. Deploy Backend on ECS**

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
EXPOSE 5000
CMD ["npm", "run", "start"]
```

Build and push to ECR:
```bash
# Create ECR repository
aws ecr create-repository --repository-name rsci-rc3-backend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push
cd backend
docker build -t rsci-rc3-backend .
docker tag rsci-rc3-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rsci-rc3-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rsci-rc3-backend:latest
```

Create ECS Task Definition and Service (use AWS Console or CLI)

**4. Deploy Frontend on S3 + CloudFront**

```bash
# Build frontend
cd frontend
npm run build
npm run export  # If using static export

# Create S3 bucket
aws s3 mb s3://rsci-rc3-frontend

# Upload build
aws s3 sync out/ s3://rsci-rc3-frontend --delete

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name rsci-rc3-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

**Estimated Cost**: $50-200/month (depending on traffic)


### Option 3: DigitalOcean (Balanced Approach)

**Best for**: Medium projects, good balance of control and simplicity

#### Using DigitalOcean App Platform

1. **Create Managed Database**
   - Go to Databases → Create
   - Choose PostgreSQL 15
   - Select plan (Basic $15/month)
   - Note connection details

2. **Create Managed Redis**
   - Go to Databases → Create
   - Choose Redis 7
   - Select plan (Basic $15/month)
   - Note connection details

3. **Deploy Backend**
   - Go to Apps → Create App
   - Connect GitHub repository
   - Configure:
     - Source Directory: `backend`
     - Build Command: `npm install && npx prisma generate && npm run build`
     - Run Command: `npm run start`
   - Add environment variables
   - Choose plan ($5-12/month)

4. **Deploy Frontend**
   - In same app, add component
   - Type: Static Site
   - Source Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Choose plan ($0-5/month)

**Estimated Cost**: $35-50/month

### Option 4: VPS (Ubuntu Server)

**Best for**: Full control, custom setup, cost-effective

#### Server Requirements
- Ubuntu 22.04 LTS
- 2GB RAM minimum (4GB recommended)
- 2 CPU cores
- 40GB SSD storage
- Providers: DigitalOcean, Linode, Vultr, Hetzner

#### Complete VPS Setup Script

```bash
#!/bin/bash
# Run as root

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Install Redis
apt install -y redis-server
systemctl start redis
systemctl enable redis

# Install Nginx
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Install PM2 for process management
npm install -g pm2

# Create application user
useradd -m -s /bin/bash appuser

# Setup PostgreSQL database
sudo -u postgres psql << EOF
CREATE DATABASE coding_platform;
CREATE USER appuser WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE coding_platform TO appuser;
\q
EOF

# Configure Redis
sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
systemctl restart redis

echo "Base setup complete!"
```


#### Deploy Application on VPS

```bash
# Switch to app user
su - appuser

# Clone repository
git clone https://github.com/yourusername/rsci-rc3.git
cd rsci-rc3

# Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with production values
nano .env

# Run migrations
npx prisma migrate deploy
npx prisma generate

# Build backend
npm run build

# Start with PM2
pm2 start dist/index.js --name rsci-backend
pm2 save
pm2 startup  # Follow instructions

# Setup Frontend
cd ../frontend
npm install
cp .env.example .env.production
# Edit .env.production
nano .env.production

# Build frontend
npm run build

# Start with PM2
pm2 start npm --name rsci-frontend -- start
pm2 save
```

#### Configure Nginx

Create `/etc/nginx/sites-available/rsci-rc3`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and get SSL:
```bash
# Enable site
ln -s /etc/nginx/sites-available/rsci-rc3 /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Get SSL certificates
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

**Estimated Cost**: $5-20/month (VPS only)


---

## Production Setup

### Database Optimization

#### PostgreSQL Configuration

Edit `/etc/postgresql/15/main/postgresql.conf`:

```conf
# Memory Settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB

# Connection Settings
max_connections = 100

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
log_min_duration_statement = 1000  # Log slow queries
```

#### Create Database Indexes

```sql
-- Add indexes for better performance
CREATE INDEX idx_user_username ON "User"(username);
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_problem_slug ON "Problem"(slug);
CREATE INDEX idx_problem_difficulty ON "Problem"(difficulty);
CREATE INDEX idx_submission_user ON "Submission"("userId");
CREATE INDEX idx_submission_problem ON "Submission"("problemId");
CREATE INDEX idx_submission_verdict ON "Submission"(verdict);
CREATE INDEX idx_testcase_problem ON "TestCase"("problemId");
CREATE INDEX idx_testcase_visibility ON "TestCase"(visibility);
```

#### Database Backup Strategy

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="coding_platform_$DATE.sql.gz"

# Create backup
pg_dump -U appuser coding_platform | gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/$FILENAME" s3://your-backup-bucket/postgres/
```

Add to crontab:
```bash
0 2 * * * /path/to/backup-script.sh
```

### Redis Configuration

Edit `/etc/redis/redis.conf`:

```conf
# Memory Management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Security
requirepass your_redis_password
```

### Application Performance

#### Backend Optimization

Create `backend/ecosystem.config.js` for PM2:

```javascript
module.exports = {
  apps: [{
    name: 'rsci-backend',
    script: './dist/index.js',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '500M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

Start with:
```bash
pm2 start ecosystem.config.js
```

#### Frontend Optimization

Update `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  
  // Image optimization
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Performance
  poweredByHeader: false,
  generateEtags: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```


---

## Security Hardening

### SSL/TLS Configuration

#### Nginx SSL Best Practices

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        # ... other proxy settings
    }
}
```

### Firewall Configuration

```bash
# UFW (Ubuntu)
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Allow only specific IPs for SSH (recommended)
ufw delete allow ssh
ufw allow from YOUR_IP_ADDRESS to any port 22
```

### Environment Security

```bash
# Secure .env files
chmod 600 backend/.env
chmod 600 frontend/.env.production

# Restrict file permissions
chown -R appuser:appuser /home/appuser/rsci-rc3
chmod -R 750 /home/appuser/rsci-rc3
```

### Rate Limiting in Backend

Update `backend/src/middleware/rateLimiter.ts`:

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis';

// General API rate limit
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Submission rate limit
export const submissionLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:submit:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 submissions per minute
  message: 'Too many submissions, please slow down.',
});
```

Apply in routes:
```typescript
import { apiLimiter, authLimiter, submissionLimiter } from './middleware/rateLimiter';

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/submissions', submissionLimiter);
```

### Input Validation & Sanitization

Ensure all inputs are validated in `backend/src/utils/validation.ts`:

```typescript
import { body, param, query } from 'express-validator';
import validator from 'validator';

export const sanitizeInput = (input: string): string => {
  return validator.escape(validator.trim(input));
};

export const validateProblemCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .customSanitizer(sanitizeInput),
  body('description')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .customSanitizer(sanitizeInput),
  body('code')
    .trim()
    .isLength({ max: 100000 }),
  // ... more validations
];
```


---

## Monitoring & Maintenance

### Application Monitoring

#### PM2 Monitoring

```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# View status
pm2 status

# Restart app
pm2 restart all

# View detailed info
pm2 info rsci-backend
```

#### Setup PM2 Plus (Optional)

```bash
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

### Log Management

#### Centralized Logging

Create `backend/src/utils/logger.ts`:

```typescript
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Error logs
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Combined logs
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

### Health Checks

Create `backend/src/routes/health.routes.ts`:

```typescript
import { Router } from 'express';
import prisma from '../config/database';
import { redisClient } from '../config/redis';

const router = Router();

router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    services: {
      database: 'unknown',
      redis: 'unknown',
      judge0: 'unknown',
    },
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'ERROR';
  }

  try {
    // Check Redis
    await redisClient.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'ERROR';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
```

### Uptime Monitoring

Use services like:
- **UptimeRobot** (Free): https://uptimerobot.com
- **Pingdom**: https://pingdom.com
- **StatusCake**: https://statuscake.com

Configure to check:
- Frontend: `https://yourdomain.com`
- Backend: `https://api.yourdomain.com/health`
- Frequency: Every 5 minutes

### Performance Monitoring

#### Setup New Relic (Optional)

```bash
npm install newrelic --save

# Create newrelic.js in backend root
```

`backend/newrelic.js`:
```javascript
exports.config = {
  app_name: ['RSCI-RC3 Backend'],
  license_key: 'YOUR_LICENSE_KEY',
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
};
```

Import in `backend/src/index.ts`:
```typescript
import 'newrelic'; // Must be first import
```

### Database Monitoring

```sql
-- Monitor slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Monitor database size
SELECT 
  pg_size_pretty(pg_database_size('coding_platform')) as size;

-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```


---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Symptoms**: Backend can't connect to PostgreSQL

**Solutions**:
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL

# Check firewall
ufw status
```

#### 2. Redis Connection Failed

**Symptoms**: Backend can't connect to Redis

**Solutions**:
```bash
# Check Redis is running
systemctl status redis

# Test connection
redis-cli ping

# Check password
redis-cli -a your_password ping
```

#### 3. Frontend Can't Reach Backend

**Symptoms**: API calls fail with CORS errors

**Solutions**:
- Check `CORS_ORIGIN` in backend `.env`
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env`
- Check Nginx proxy configuration
- Verify SSL certificates

#### 4. Judge0 API Errors

**Symptoms**: Code execution fails

**Solutions**:
- Verify API key in `.env`
- Check RapidAPI subscription status
- Test API directly:
```bash
curl -X GET "https://judge0-ce.p.rapidapi.com/about" \
  -H "x-rapidapi-key: YOUR_KEY"
```

#### 5. Build Failures

**Symptoms**: `npm run build` fails

**Solutions**:
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+

# Check for TypeScript errors
npm run type-check
```

#### 6. Python Type Hint Errors

**Symptoms**: `TypeError: 'type' object is not subscriptable`

**Solution**: Use older Python typing syntax for Judge0 compatibility

**Wrong** (Python 3.9+):
```python
def reverseString(self, s: list[str]) -> None:
    pass
```

**Correct** (Python 3.8 compatible):
```python
from typing import List

def reverseString(self, s: List[str]) -> None:
    pass
```

### Performance Issues

#### High Memory Usage

```bash
# Check memory
free -h

# Check process memory
pm2 monit

# Restart services
pm2 restart all
```

#### Slow Database Queries

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Analyze tables
ANALYZE;
```

#### High CPU Usage

```bash
# Check CPU usage
top

# Check PM2 cluster mode
pm2 list

# Scale instances
pm2 scale rsci-backend 4
```

### Deployment Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Health checks working
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Error tracking setup
- [ ] Log rotation configured
- [ ] Domain DNS configured
- [ ] Email service tested
- [ ] Judge0 API tested
- [ ] Load testing completed
- [ ] Documentation updated

---

## Cost Estimation

### Monthly Costs by Deployment Option

#### Option 1: Vercel + Railway
- Vercel (Frontend): $0-20
- Railway (Backend): $5-10
- Railway (PostgreSQL): $5-10
- Railway (Redis): $5-10
- Judge0 API: $0-50
- **Total**: $15-100/month

#### Option 2: AWS
- EC2/ECS: $20-50
- RDS PostgreSQL: $15-30
- ElastiCache Redis: $15-30
- S3 + CloudFront: $5-20
- Load Balancer: $15-20
- Judge0 API: $0-50
- **Total**: $70-200/month

#### Option 3: DigitalOcean
- App Platform (Backend): $5-12
- App Platform (Frontend): $0-5
- Managed PostgreSQL: $15
- Managed Redis: $15
- Judge0 API: $0-50
- **Total**: $35-100/month

#### Option 4: VPS
- VPS (4GB RAM): $10-20
- Domain: $10-15/year
- Judge0 API: $0-50
- **Total**: $10-70/month

### Cost Optimization Tips

1. **Use Free Tiers**
   - Vercel: Free for hobby projects
   - Railway: $5 free credit monthly
   - RapidAPI: Free tier available

2. **Self-Host Judge0**
   - Eliminates API costs
   - Requires additional server resources
   - Best for high-volume usage

3. **Use Spot Instances** (AWS)
   - 70-90% cost savings
   - Good for non-critical workloads

4. **Optimize Database**
   - Regular VACUUM
   - Remove old data
   - Use connection pooling

5. **CDN for Static Assets**
   - CloudFlare (Free)
   - Reduces bandwidth costs

---

## Scaling Strategy

### Horizontal Scaling

#### Backend Scaling
```bash
# PM2 cluster mode
pm2 start ecosystem.config.js -i max

# Or specific number of instances
pm2 scale rsci-backend 4
```

#### Database Scaling
- Read replicas for read-heavy workloads
- Connection pooling (PgBouncer)
- Partitioning large tables

#### Redis Scaling
- Redis Cluster for high availability
- Separate cache and session stores

### Vertical Scaling

Upgrade server resources as needed:
- 2GB → 4GB RAM
- 2 CPU → 4 CPU cores
- 40GB → 80GB storage

### Load Balancing

Nginx load balancer configuration:

```nginx
upstream backend {
    least_conn;
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
    server 127.0.0.1:5003;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

---

## Maintenance Schedule

### Daily
- [ ] Check application logs
- [ ] Monitor error rates
- [ ] Check disk space
- [ ] Verify backups completed

### Weekly
- [ ] Review performance metrics
- [ ] Check security alerts
- [ ] Update dependencies (if needed)
- [ ] Review user feedback

### Monthly
- [ ] Security updates
- [ ] Database optimization
- [ ] Cost analysis
- [ ] Capacity planning
- [ ] Backup restoration test

### Quarterly
- [ ] Major dependency updates
- [ ] Security audit
- [ ] Performance optimization
- [ ] Disaster recovery drill

---

## Support & Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Production](https://www.prisma.io/docs/guides/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)
- [Nginx Documentation](https://nginx.org/en/docs/)

### Community
- GitHub Issues: Report bugs and feature requests
- Discord/Slack: Community support
- Stack Overflow: Technical questions

### Professional Support
- DevOps consultation
- Custom deployment assistance
- Performance optimization
- Security audits

---

## Conclusion

This guide covers multiple deployment strategies for the RSCI-RC3 platform. Choose the option that best fits your:
- Budget
- Technical expertise
- Scalability needs
- Control requirements

**Recommended Path**:
1. **Start**: Vercel + Railway (Quick, easy, affordable)
2. **Grow**: DigitalOcean App Platform (More control)
3. **Scale**: AWS or VPS with load balancing (Full control)

Remember to:
- Always use SSL/TLS
- Enable monitoring from day one
- Set up automated backups
- Test disaster recovery
- Keep documentation updated

**Good luck with your deployment!** 🚀

---

**Document Version**: 1.0.0  
**Last Updated**: November 16, 2024  
**Maintained By**: RSCI-RC3 Team
