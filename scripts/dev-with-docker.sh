#!/bin/bash
# Development startup script with Docker Redis

set -e

echo "🚀 Starting Craft Management with Docker Redis..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop first."
  exit 1
fi

# Start Redis container
echo "📦 Starting Redis container..."
docker-compose up -d redis redis-commander

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
sleep 3

# Check Redis health
if docker-compose exec redis redis-cli ping | grep -q "PONG"; then
  echo "✅ Redis is ready!"
else
  echo "❌ Redis failed to start"
  exit 1
fi

# Export Redis URL for the app
export REDIS_URL="redis://localhost:6379"

echo "🔗 Redis URL: $REDIS_URL"
echo "🌐 Redis Commander (GUI): http://localhost:8081"
echo ""

# Start Next.js dev server
echo "🔥 Starting Next.js development server..."
pnpm run dev