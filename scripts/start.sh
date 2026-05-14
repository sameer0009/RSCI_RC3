#!/bin/bash

echo "🚀 Starting RSCI-RC3 Platform..."
docker-compose up -d

echo "📊 Current Status:"
docker-compose ps

echo "✅ Platform is starting. Access it at http://localhost:3000"
