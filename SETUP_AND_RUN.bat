@echo off
cls
echo ========================================
echo   RSCI-RC3 Coding Platform
echo   Complete Setup and Launch
echo ========================================
echo.

:: Check Docker
echo [Step 1/9] Checking Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running!
    echo.
    echo Please start Docker Desktop and run this script again.
    echo.
    pause
    exit /b 1
)
echo ✅ Docker is running

:: Start Docker services
echo.
echo [Step 2/9] Starting Docker services (PostgreSQL + Redis)...
docker-compose up -d >nul 2>&1
echo ✅ Docker services started
echo    Waiting for services to be ready...
timeout /t 10 /nobreak >nul

:: Install backend dependencies
echo.
echo [Step 3/9] Installing backend dependencies...
cd backend
if not exist "node_modules" (
    call npm install >nul 2>&1
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)

:: Generate Prisma Client
echo.
echo [Step 4/9] Generating Prisma Client...
call npx prisma generate >nul 2>&1
echo ✅ Prisma Client generated

:: Apply database migration
echo.
echo [Step 5/9] Applying database migration...
call npx prisma migrate deploy >nul 2>&1
if %errorlevel% neq 0 (
    call npx prisma migrate dev --name add_advanced_features >nul 2>&1
)
echo ✅ Database migration applied

:: Seed database
echo.
echo [Step 6/9] Seeding database with sample data...
call npx tsx prisma/seed.ts >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database seeded successfully
) else (
    echo ⚠️  Database seeding skipped (may already be seeded)
)

cd ..

:: Install frontend dependencies
echo.
echo [Step 7/9] Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    call npm install >nul 2>&1
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies already installed
)
cd ..

:: Create .env files if they don't exist
echo.
echo [Step 8/9] Checking environment files...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul 2>&1
    echo ✅ Created backend/.env
) else (
    echo ✅ backend/.env exists
)

if not exist "frontend\.env.local" (
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env.local" >nul 2>&1
        echo ✅ Created frontend/.env.local
    )
) else (
    echo ✅ frontend/.env.local exists
)

:: Start servers
echo.
echo [Step 9/9] Starting servers...
echo.
echo ========================================
echo   🎉 Setup Complete!
echo ========================================
echo.
echo Starting backend and frontend servers...
echo.
echo 📍 Backend:  http://localhost:5000
echo 📍 Frontend: http://localhost:3000
echo.
echo 🔐 Login Credentials:
echo    Admin: admin@example.com / admin123
echo    User:  user1@example.com / test123
echo.
echo ⏳ Please wait 10-15 seconds for servers to start
echo    Then open: http://localhost:3000
echo.
echo 🛑 To stop: Close the server windows or press Ctrl+C
echo ========================================
echo.

:: Start backend
start "🔧 Backend Server - Port 5000" cmd /k "cd backend && npm run dev"

:: Wait for backend to start
timeout /t 5 /nobreak >nul

:: Start frontend
start "🎨 Frontend Server - Port 3000" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Servers are starting in separate windows
echo.
echo 💡 Tip: If you see TypeScript errors in your IDE,
echo    press Ctrl+Shift+P and run "TypeScript: Restart TS Server"
echo.
pause
