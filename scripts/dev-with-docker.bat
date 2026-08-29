@echo off
REM Development startup script with Docker Redis for Windows

echo 🚀 Starting Craft Management with Docker Redis...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    exit /b 1
)

REM Start Redis container
echo 📦 Starting Redis container...
docker-compose up -d redis redis-commander

REM Wait for Redis to be ready
echo ⏳ Waiting for Redis to be ready...
timeout /t 3 /nobreak >nul

REM Check Redis health
docker-compose exec redis redis-cli ping | find "PONG" >nul
if %errorlevel% equ 0 (
    echo ✅ Redis is ready!
) else (
    echo ❌ Redis failed to start
    exit /b 1
)

REM Set Redis URL for the app
set REDIS_URL=redis://localhost:6379

echo 🔗 Redis URL: %REDIS_URL%
echo 🌐 Redis Commander (GUI): http://localhost:8081
echo.

REM Start Next.js dev server
echo 🔥 Starting Next.js development server...
pnpm run dev