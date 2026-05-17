# Troubleshooting Guide - RSCI-RC3 Platform

## Common Issues and Solutions

### 1. User Management Issues

#### Issue: Cannot Delete Users
**Error**: "Failed to delete user" or foreign key constraint errors

**Cause**: Database foreign key constraints preventing deletion

**Solution**: ✅ FIXED - Applied cascade delete migration
```bash
cd backend
npx prisma migrate dev --name add_cascade_delete
```

**What was fixed**:
- Added `onDelete: Cascade` to all User relations
- Submissions, Problems, Contests, and ContestParticipants now cascade delete
- When a user is deleted, all their data is automatically removed

#### Issue: Cannot Remove Last Admin
**Error**: "Cannot delete the last admin" or "Cannot remove the last admin"

**Cause**: Safety feature to prevent locking yourself out

**Solution**: This is intentional! Create another admin first:
1. Go to Admin → Users
2. Edit a user and change role to ADMIN
3. Now you can delete or demote the original admin

---

### 2. Python Type Hint Errors

#### Issue: TypeError: 'type' object is not subscriptable
**Error**: When submitting Python code with modern type hints

**Cause**: Judge0 uses Python 3.8 which doesn't support `list[int]` syntax

**Solution**: Use older typing syntax
```python
# ❌ Wrong
def solve(nums: list[int]) -> list[int]:
    pass

# ✅ Correct
from typing import List
def solve(nums: List[int]) -> List[int]:
    pass
```

**See**: `PYTHON_COMPATIBILITY_GUIDE.md` for complete guide

---

### 3. Database Connection Issues

#### Issue: Backend can't connect to PostgreSQL
**Error**: "Database connection failed" or "ECONNREFUSED"

**Solutions**:

**Check Docker is running**:
```bash
docker ps
```

**Restart Docker services**:
```bash
docker-compose restart
```

**Check DATABASE_URL**:
```bash
# backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coding_platform?schema=public"
```

**Test connection**:
```bash
cd backend
npx prisma db pull
```

---

### 4. Redis Connection Issues

#### Issue: Backend can't connect to Redis
**Error**: "Redis connection failed"

**Solutions**:

**Check Redis is running**:
```bash
docker ps | findstr redis
```

**Restart Redis**:
```bash
docker-compose restart redis
```

**Test connection**:
```bash
docker exec -it coding-platform-redis redis-cli ping
# Should return: PONG
```

---

### 5. Judge0 API Issues

#### Issue: Code execution fails
**Error**: "Code execution failed" or "API key invalid"

**Solutions**:

**Verify API key**:
```bash
# Check backend/.env
JUDGE0_API_KEY="your-key-here"
```

**Test API directly**:
```powershell
Invoke-RestMethod -Uri "https://judge0-ce.p.rapidapi.com/about" `
  -Headers @{
    "x-rapidapi-host"="judge0-ce.p.rapidapi.com"
    "x-rapidapi-key"="YOUR_KEY"
  }
```

**Check RapidAPI subscription**:
- Go to https://rapidapi.com/judge0-official/api/judge0-ce
- Verify subscription is active
- Check usage limits

---

### 6. Frontend Build Issues

#### Issue: npm run build fails
**Error**: Various TypeScript or build errors

**Solutions**:

**Clear cache and reinstall**:
```bash
cd frontend
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

**Check Node version**:
```bash
node --version  # Should be 18+
```

**Fix TypeScript errors**:
```bash
npm run type-check
```

---

### 7. Authentication Issues

#### Issue: Login fails or token expired
**Error**: "Invalid token" or "Authentication failed"

**Solutions**:

**Clear browser storage**:
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

**Check JWT secrets**:
```bash
# backend/.env - must be set
JWT_SECRET="your-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
```

**Restart backend**:
```bash
# Stop and restart backend server
```

---

### 8. CORS Errors

#### Issue: Frontend can't reach backend
**Error**: "CORS policy" or "Access-Control-Allow-Origin"

**Solutions**:

**Check CORS_ORIGIN**:
```bash
# backend/.env
CORS_ORIGIN="http://localhost:3000"
```

**For production**:
```bash
CORS_ORIGIN="https://yourdomain.com"
```

**Restart backend** after changing .env

---

### 9. File Upload Issues

#### Issue: Profile picture upload fails
**Error**: "File upload failed"

**Solutions**:

**Check uploads directory exists**:
```bash
mkdir -p backend/uploads/profiles
```

**Check file permissions**:
```bash
chmod 755 backend/uploads
```

**Check file size limits** in `backend/src/config/multer.ts`

---

### 10. Performance Issues

#### Issue: Slow page loads or API responses

**Solutions**:

**Check database indexes**:
```sql
-- Run in PostgreSQL
SELECT * FROM pg_stat_user_indexes;
```

**Clear Redis cache**:
```bash
docker exec -it coding-platform-redis redis-cli FLUSHALL
```

**Check server resources**:
```bash
# Memory usage
free -h

# CPU usage
top

# Disk space
df -h
```

**Optimize database**:
```sql
VACUUM ANALYZE;
```

---

## Diagnostic Commands

### Check All Services
```bash
# Docker containers
docker ps

# Backend logs
cd backend && npm run dev

# Frontend logs
cd frontend && npm run dev

# Database connection
cd backend && npx prisma studio
```

### Check Ports
```bash
# Windows
netstat -an | findstr "3000 5000 5432 6379"

# Linux/Mac
lsof -i :3000
lsof -i :5000
lsof -i :5432
lsof -i :6379
```

### View Logs
```bash
# Docker logs
docker logs coding-platform-postgres
docker logs coding-platform-redis

# PM2 logs (if using PM2)
pm2 logs

# Application logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

---

## Quick Fixes

### Reset Everything
```bash
# Stop all services
docker-compose down

# Clear data (WARNING: Deletes all data!)
docker-compose down -v

# Restart
docker-compose up -d
cd backend && npx prisma migrate dev
cd backend && npm run db:seed
```

### Reset Database Only
```bash
cd backend
npm run db:reset
npm run db:seed
```

### Clear Node Modules
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json .next
npm install
```

---

## Error Messages Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Service not running | Start Docker/service |
| `EADDRINUSE` | Port already in use | Kill process or change port |
| `EPERM` | Permission denied | Run as admin or fix permissions |
| `MODULE_NOT_FOUND` | Missing dependency | Run `npm install` |
| `PRISMA_CLIENT_INIT` | Prisma not generated | Run `npx prisma generate` |
| `JWT_MALFORMED` | Invalid token | Clear storage and login again |
| `FOREIGN_KEY_CONSTRAINT` | Database constraint | Check cascade delete settings |

---

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Check error logs
3. ✅ Try restarting services
4. ✅ Check documentation
5. ✅ Search existing issues

### When Reporting Issues

Include:
- Error message (full text)
- Steps to reproduce
- Environment (OS, Node version, etc.)
- Relevant logs
- What you've tried

### Useful Information to Collect

```bash
# System info
node --version
npm --version
docker --version

# Service status
docker ps
pm2 list  # if using PM2

# Recent logs
docker logs coding-platform-postgres --tail 50
docker logs coding-platform-redis --tail 50
```

---

## Prevention Tips

### Regular Maintenance

**Daily**:
- Check error logs
- Monitor disk space
- Verify backups

**Weekly**:
- Update dependencies (carefully)
- Review performance metrics
- Check security alerts

**Monthly**:
- Database optimization
- Clear old logs
- Review user feedback

### Best Practices

1. **Always backup before major changes**
2. **Test in development first**
3. **Keep dependencies updated**
4. **Monitor error rates**
5. **Document custom changes**

---

## Still Having Issues?

### Check Documentation
- `README.md` - Project overview
- `DEPLOYMENT_GUIDE.md` - Production setup
- `PYTHON_COMPATIBILITY_GUIDE.md` - Python issues
- `JUDGE0_API_SETUP.md` - Judge0 configuration

### Community Support
- GitHub Issues
- Stack Overflow
- Discord/Slack community

### Professional Support
- DevOps consultation
- Custom deployment
- Performance optimization

---

**Document Version**: 1.0.0  
**Last Updated**: November 17, 2024  
**Status**: Active
