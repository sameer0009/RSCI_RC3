# Deployment Guide

This guide covers deploying the Online Coding Platform to production.

## Architecture Overview

- **Frontend:** Next.js app (Vercel recommended)
- **Backend:** Node.js/Express API (Render/Railway/AWS recommended)
- **Database:** PostgreSQL (Render/Supabase/AWS RDS)
- **Cache:** Redis (Redis Cloud/AWS ElastiCache)

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Redis
REDIS_URL="redis://host:6379"

# JWT Secrets (CHANGE THESE!)
JWT_SECRET="your-production-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-production-refresh-secret-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="production"

# Judge0 API (get key from RapidAPI)
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-rapidapi-key"

# CORS
CORS_ORIGIN="https://your-frontend-domain.com"
```

### Frontend (.env.production)

```env
NEXT_PUBLIC_API_URL="https://your-backend-domain.com"
NEXT_PUBLIC_WS_URL="https://your-backend-domain.com"
```

## Deployment Options

### Option 1: Vercel + Render (Recommended)

#### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy

#### Backend (Render)

1. Create new Web Service
2. Connect GitHub repository
3. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables
5. Create PostgreSQL database in Render
6. Create Redis instance
7. Deploy

### Option 2: Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add PostgreSQL: `railway add postgresql`
5. Add Redis: `railway add redis`
6. Deploy: `railway up`

### Option 3: AWS

#### Frontend (S3 + CloudFront)

```bash
cd frontend
npm run build
aws s3 sync out/ s3://your-bucket-name
```

#### Backend (EC2 or ECS)

1. Create EC2 instance or ECS cluster
2. Install Node.js and dependencies
3. Setup PM2 for process management
4. Configure nginx as reverse proxy
5. Setup SSL with Let's Encrypt

## Database Migration

### Production Migration

```bash
# Set DATABASE_URL to production database
export DATABASE_URL="postgresql://..."

# Run migrations
cd backend
npm run prisma:migrate:deploy

# DO NOT run prisma:seed in production!
```

## Post-Deployment Checklist

- [ ] Update CORS_ORIGIN to production domain
- [ ] Change JWT secrets to strong random values
- [ ] Enable HTTPS/SSL
- [ ] Setup database backups
- [ ] Configure monitoring (Sentry, LogRocket)
- [ ] Setup CI/CD pipeline
- [ ] Test all endpoints
- [ ] Create admin account
- [ ] Load production problems

## Security Checklist

- [ ] Use strong JWT secrets (min 32 characters)
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags in production
- [ ] Configure rate limiting
- [ ] Setup firewall rules
- [ ] Regular security updates
- [ ] Database connection encryption
- [ ] Environment variables not in code
- [ ] API key rotation policy

## Monitoring

### Recommended Tools

- **Error Tracking:** Sentry
- **Performance:** New Relic / DataDog
- **Uptime:** UptimeRobot
- **Logs:** Papertrail / Loggly

### Health Checks

- Backend: `https://api.yourdomain.com/api/health`
- Database: Monitor connection pool
- Redis: Monitor memory usage

## Scaling Considerations

### Horizontal Scaling

- Use load balancer (AWS ALB, nginx)
- Multiple backend instances
- Shared Redis for sessions
- Database read replicas

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Add database indexes
- Implement caching strategy

## Backup Strategy

### Database Backups

```bash
# Automated daily backups
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20240101.sql
```

### Redis Backups

- Enable RDB snapshots
- Configure AOF persistence
- Regular backup to S3

## Troubleshooting

### Common Issues

**Database Connection Timeout**
- Check connection string
- Verify firewall rules
- Increase connection pool size

**CORS Errors**
- Verify CORS_ORIGIN matches frontend domain
- Check protocol (http vs https)

**JWT Token Issues**
- Ensure secrets match across instances
- Check token expiration times

## Cost Optimization

### Free Tier Options

- **Frontend:** Vercel (free for hobby)
- **Backend:** Render (free tier available)
- **Database:** Supabase (free tier)
- **Redis:** Redis Cloud (free 30MB)

### Estimated Monthly Costs

- **Hobby:** $0-20/month
- **Startup:** $50-100/month
- **Production:** $200-500/month

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run test
      # Add deployment steps
```

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review security group rules
5. Check DNS configuration

## Updates and Maintenance

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run migrations
cd backend && npm run prisma:migrate:deploy

# Restart services
pm2 restart all
```

Remember to test in staging environment before deploying to production!
