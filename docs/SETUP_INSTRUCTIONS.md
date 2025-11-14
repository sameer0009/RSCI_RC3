# Setup Instructions - Online Coding Platform

## Current Status

✅ Dependencies installed  
✅ Environment files created  
⚠️ Docker needs to be installed

## Next Steps

### 1. Install Docker Desktop

**Download and install Docker Desktop for Windows:**
- Visit: https://www.docker.com/products/docker-desktop/
- Download Docker Desktop for Windows
- Run the installer
- Restart your computer if prompted
- Start Docker Desktop application

**Verify Docker is running:**
```powershell
docker --version
docker ps
```

### 2. Start Database Services

Once Docker is installed and running:

```powershell
# Start PostgreSQL and Redis
docker compose up -d

# Verify services are running
docker ps
```

You should see two containers:
- `coding-platform-postgres`
- `coding-platform-redis`

### 3. Setup Database

```powershell
# Navigate to backend
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed

# Return to root
cd ..
```

### 4. Start Development Servers

```powershell
# Start both frontend and backend
npm run dev
```

Or start them separately in different terminals:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

### 6. Login

**Admin Account:**
- Email: admin@example.com
- Password: admin123

**Test Users:**
- Email: user1@example.com (through user10@example.com)
- Password: test123

## Alternative: Without Docker (Manual Setup)

If you prefer not to use Docker, you can install PostgreSQL and Redis manually:

### Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user
4. Update `backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/coding_platform"
   ```

### Install Redis
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Install and start Redis service
3. Update `backend/.env`:
   ```
   REDIS_URL="redis://localhost:6379"
   ```

Then continue with step 3 (Setup Database) above.

## Troubleshooting

### Docker not starting
- Make sure Docker Desktop is running
- Check if Hyper-V is enabled (Windows Features)
- Restart Docker Desktop

### Port already in use
```powershell
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process or change PORT in backend/.env
```

### Database connection error
```powershell
# Restart Docker services
docker compose down
docker compose up -d

# Wait 10 seconds for PostgreSQL to fully start
timeout /t 10

# Then run migrations again
cd backend
npm run prisma:migrate
```

### Module not found errors
```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules, frontend\node_modules, backend\node_modules
npm install
```

## What's Already Done

✅ All dependencies installed
✅ Environment files created (.env)
✅ Project structure ready
✅ Code is complete and ready to run

## What You Need to Do

1. ⚠️ Install Docker Desktop
2. ⚠️ Start Docker
3. ⚠️ Run database setup commands
4. ⚠️ Start the development servers

## Quick Commands Reference

```powershell
# Check if Docker is running
docker ps

# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Database commands
cd backend
npm run prisma:studio      # Open database GUI
npm run prisma:migrate     # Run migrations
npm run prisma:seed        # Seed data
npm run prisma:reset       # Reset database (WARNING: deletes data)

# Start development
npm run dev                # Both servers
npm run dev:frontend       # Frontend only
npm run dev:backend        # Backend only
```

## Need Help?

1. Check if Docker Desktop is running (system tray icon)
2. Verify services with `docker ps`
3. Check logs with `docker compose logs`
4. Review error messages in terminal
5. Check QUICKSTART.md for more details

## System Requirements

- Windows 10/11 (64-bit)
- 4GB RAM minimum (8GB recommended)
- Docker Desktop
- Node.js 20+
- 2GB free disk space

Once Docker is installed and running, the setup should take about 5-10 minutes!
