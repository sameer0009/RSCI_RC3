#!/bin/bash

# RSCI-RC3 Deployment Script
echo "🚀 Starting RSCI-RC3 Deployment..."

# Check if docker-compose is installed
if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Error: docker-compose is not installed.' >&2
  exit 1
fi

# Stop current containers
echo "🛑 Stopping current containers..."
docker-compose down

# Build and start containers
echo "🏗️ Building and starting latest code..."
docker-compose up --build -d

# Check status
echo "📊 Current Status:"
docker-compose ps

echo "✅ Deployment complete!"
