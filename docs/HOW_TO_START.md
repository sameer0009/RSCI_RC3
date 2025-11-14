# 🚀 How to Start the RSCI-RC3 Platform

## ⚠️ IMPORTANT: Docker Desktop Required

Docker Desktop must be running before starting the platform.

---

## 📋 Complete Startup Process

### Step 1: Start Docker Desktop (MANUAL)
1. **Open Docker Desktop** application on your computer
2. **Wait** for Docker to fully start (icon turns green/white)
3. **Verify** it's running by checking the system tray icon

### Step 2: Start Database Services
Once Docker Desktop is running, open PowerShell/CMD and run:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)

### Step 3: Seed Database (First Time or After Reset)
```bash
cd backend
npx tsx prisma/seed.ts
```

This creates:
- Admin user (admin@example.com / admin123)
- 10 test users (user1-10@example.com / test123)
- 5 sample problems
- Sample submissions and contests

### Step 4: Start Backend Server
```bash
cd backend
npm run dev
```

Backend will start on: http://localhost:5000

### Step 5: Start Frontend Application
Open a NEW terminal window:
```bash
cd frontend
npm run dev
```

Frontend will start on: http://localhost:3000 or http://localhost:3001

---

## ✅ Verification Checklist

After starting, verify each service:

- [ ] Docker Desktop is running (green icon)
- [ ] `docker ps` shows 2 containers
- [ ] Backend shows "Database connected successfully"
- [ ] Backend shows "Server running on port 5000"
- [ ] Frontend shows "Ready in X seconds"
- [ ] Can access http://localhost:3001
- [ ] Can login with admin@example.com / admin123

---

## 🎯 Quick Access After Startup

### Main URLs
- **Home**: http://localhost:3001
- **Login**: http://localhost:3001/login
- **Admin**: http://localhost:3001/admin

### Test Accounts
```
Admin: admin@example.com / admin123
User: user1@example.com / test123
```

---

## 🔧 Alternative: Use Setup Script

### Windows
```bash
setup.bat
```

### Linux/Mac
```bash
chmod +x setup.sh
./setup.sh
```

These scripts will:
1. Check Docker is running
2. Start Docker services
3. Run migrations
4. Seed database
5. Provide instructions for starting servers

---

## 🐛 Common Issues

### Issue 1: Docker Desktop Not Running
**Error**: "unable to get image" or "500 Internal Server Error"

**Solution**:
1. Open Docker Desktop manually
2. Wait for it to fully start
3. Try `docker ps` to verify
4. Then run `docker-compose up -d`

### Issue 2: Port Already in Use
**Error**: "EADDRINUSE" or "Port 5000 is in use"

**Solution**:
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

### Issue 3: Database Empty (Login Fails)
**Error**: "Invalid credentials" or "User not found"

**Solution**:
```bash
cd backend
npx tsx prisma/seed.ts
```

### Issue 4: Frontend Won't Start
**Error**: Build errors or compilation issues

**Solution**:
```bash
cd frontend
rm -rf .next
npm run dev
```

---

## 📊 Expected Startup Times

- **Docker Services**: 5-10 seconds
- **Database Seed**: 2-3 seconds
- **Backend**: 2-3 seconds
- **Frontend**: 10-20 seconds
- **Total**: ~30-40 seconds

---

## 🎉 Success Indicators

You'll know everything is working when you see:

### Backend Terminal
```
✅ Database connected successfully
✅ Redis connected
🚀 Server running on port 5000
📝 Environment: development
🌐 API available at http://localhost:5000
```

### Frontend Terminal
```
▲ Next.js 14.2.33
- Local: http://localhost:3001
✓ Ready in 10.3s
```

### Browser
- Can access http://localhost:3001
- Can see the login page
- Can login successfully
- Can navigate to all pages

---

## 🎯 After Successful Startup

### For Users:
1. Register or login
2. Browse problems
3. Submit solutions
4. View leaderboard
5. Edit your profile

### For Admins:
1. Login as admin
2. Create problems at `/admin/problems/create`
3. Manage users at `/admin/users`
4. View analytics at `/admin/analytics`
5. Monitor platform activity

---

## 📞 Need Help?

If you encounter issues:
1. Check Docker Desktop is running
2. Verify all ports are free (5000, 3001, 5432, 6379)
3. Check terminal outputs for errors
4. Review `START_SYSTEM.md` for troubleshooting
5. Reseed database if login fails

---

## 🎊 Platform Features

Once running, you'll have access to:
- ✅ User authentication & profiles
- ✅ Problem solving with Judge0
- ✅ Admin problem management
- ✅ Admin user management
- ✅ Analytics dashboard
- ✅ Profile pictures & social links
- ✅ Leaderboard & rankings
- ✅ Modern UI with dark mode

---

**Ready to start? Open Docker Desktop first, then follow the steps above!** 🚀
