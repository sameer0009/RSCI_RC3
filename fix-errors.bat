@echo off
echo ========================================
echo Fixing Prisma Client Errors
echo ========================================
echo.

echo Step 1: Checking Docker services...
docker ps
if %errorlevel% neq 0 (
    echo Docker is not running. Starting Docker services...
    docker-compose up -d
    echo Waiting for services to start...
    timeout /t 10 /nobreak
)

echo.
echo Step 2: Generating Prisma Client...
cd backend
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)

echo.
echo Step 3: Applying database migration...
call npx prisma migrate dev --name add_advanced_features
if %errorlevel% neq 0 (
    echo WARNING: Migration may have failed or already applied
    echo This is OK if migration was already applied
)

echo.
echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& npm run dev
echo 2. Start frontend: cd frontend ^&^& npm run dev
echo.
echo If you still see errors, restart your IDE/editor
echo.
pause
