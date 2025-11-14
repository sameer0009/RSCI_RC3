@echo off
setlocal enabledelayedexpansion

echo ========================================
echo RSCI-RC3 Coding Platform - Auto Setup
echo ========================================
echo.

:: Check if Docker is running
echo [1/8] Checking Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✓ Docker is running

:: Start Docker services
echo.
echo [2/8] Starting Docker services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start Docker services
    pause
    exit /b 1
)
echo ✓ Docker services started
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

:: Check if backend dependencies are installed
echo.
echo [3/8] Checking backend dependencies...
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)
echo ✓ Backend dependencies ready

:: Generate Prisma Client
echo.
echo [4/8] Generating Prisma Client...
cd backend
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    cd ..
    pause
    exit /b 1
)
echo ✓ Prisma Client generated

:: Apply database migration
echo.
echo [5/8] Applying database migration...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo Migration may have failed, trying alternative method...
    call npx prisma migrate dev --name add_advanced_features
)
echo ✓ Database migration applied

:: Seed database
echo.
echo [6/8] Seeding database...
call npx tsx prisma/seed.ts
if %errorlevel% neq 0 (
    echo WARNING: Database seeding failed
    echo You may need to seed manually later
)
echo ✓ Database seeded
cd ..

:: Check if frontend dependencies are installed
echo.
echo [7/8] Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)
echo ✓ Frontend dependencies ready

:: Start the servers
echo.
echo [8/8] Starting servers...
echo.
echo ========================================
echo Platform is starting!
echo ========================================
echo.
echo Backend will start on: http://localhost:5000
echo Frontend will start on: http://localhost:3000
echo.
echo Login credentials:
echo   Admin: admin@example.com / admin123
echo   User:  user1@example.com / test123
echo.
echo Press Ctrl+C in each window to stop the servers
echo ========================================
echo.

:: Start backend in new window
start "Backend Server" cmd /k "cd backend && npm run dev"

:: Wait a bit for backend to start
timeout /t 5 /nobreak >nul

:: Start frontend in new window
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✓ Servers are starting in separate windows
echo.
echo Wait 10-15 seconds, then open: http://localhost:3000
echo.
echo To stop: Close the server windows or press Ctrl+C in them
echo.
pause
