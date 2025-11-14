# 🚀 System Startup Guide

## ⚠️ Docker Desktop Required

The system needs Docker Desktop to be running. Please follow these steps:

---

## 📋 Startup Steps

### Step 1: Start Docker Desktop
1. Open **Docker Desktop** application
2. Wait for it to fully start (icon turns green)
3. Verify it's running

### Step 2: Start Database Services
Open PowerShell/CMD in project directory and run:
```bash
docker-compose up -d
```

### Step 3: Start Backend
Open a new terminal and run:
```bash
cd backend
npm run dev
```

### Step 4: Start Frontend
Open another terminal and run:
```bash
cd frontend
npm run dev
```

### Step 5: Seed Database (First Time Only)
If this is the first time or database is empty:
```bash
cd backend
npx tsx prisma/seed.ts
```

---

## ✅ Quick Verification

After starting, verify services:

1. **Docker**: `docker ps` should show 2 containers
2. **Backend**: Visit http://localhost:5000/api/health
3. **Frontend**: Visit http://localhost:3001

---

## 🔐 Login Credentials

```
Admin:
  Email: admin@example.com
  Password: admin123

Test Users:
  Email: user1@example.com to user10@example.com
  Password: test123
```

---

## 🎯 Expected URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## 🐛 Troubleshooting

### Docker Desktop Not Starting
- Restart Docker Desktop
- Check if WSL2 is installed (Windows)
- Ensure virtualization is enabled in BIOS

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Kill process on port 3000/3001 (frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

### Database Connection Failed
```bash
# Restart Docker services
docker-compose down
docker-compose up -d

# Wait 10 seconds, then start backend
```

### Login Failed
```bash
# Reseed database
cd backend
npx tsx prisma/seed.ts
```

---

## 📝 Alternative: Use Batch Script

### Windows (setup.bat)
```bash
setup.bat
```

This will:
1. Start Docker services
2. Run database migrations
3. Seed the database
4. Start backend
5. Start frontend

---

## 🎉 Once Started

Your platform will be available at:
- **Main App**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3001/admin
- **Create Problem**: http://localhost:3001/admin/problems/create
- **Analytics**: http://localhost:3001/admin/analytics

---

## 📚 Documentation

- `FINAL_SUMMARY.md` - Complete overview
- `PLATFORM_READY.md` - Feature guide
- `RESTART_COMPLETE.md` - Restart status
- `LOGIN_FIXED.md` - Login help

---

## ⚡ Quick Start (All-in-One)

If Docker Desktop is running, use this single command:

```bash
# Start everything
docker-compose up -d && cd backend && npx tsx prisma/seed.ts && npm run dev &
cd ../frontend && npm run dev
```

---

**Status**: Ready to start  
**Requirements**: Docker Desktop must be running  
**Estimated Time**: 2-3 minutes
