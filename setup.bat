@echo off
echo Setting up Online Coding Platform...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Copy environment files
echo Setting up environment variables...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo Created backend\.env
)

if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo Created frontend\.env
)

REM Start Docker services
echo Starting Docker services...
docker-compose up -d

REM Wait for PostgreSQL to be ready
echo Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak >nul

REM Run database migrations
echo Running database migrations...
cd backend
call npm run prisma:generate
call npm run prisma:migrate

REM Seed database
echo Seeding database...
call npm run prisma:seed

cd ..

echo.
echo Setup complete!
echo.
echo To start the development servers, run:
echo   npm run dev
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend will be available at: http://localhost:5000
echo.
echo Default admin credentials:
echo   Email: admin@example.com
echo   Password: admin123
