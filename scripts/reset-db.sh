#!/bin/bash

# RSCI-RC3 Database Reset Script
echo "⚠️ WARNING: This will delete ALL data in the database!"
read -p "Are you sure you want to proceed? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Reset cancelled."
    exit 1
fi

echo "🧹 Resetting database..."

# Stop containers and remove volumes
echo "🛑 Stopping containers and removing volumes..."
docker-compose down -v

# Start containers
echo "🏗️ Restarting containers (this will recreate the schema)..."
docker-compose up -d

# Wait for backend to be ready
echo "⏳ Waiting for backend to initialize..."
sleep 10

# Optional: Run seed script if needed
echo "🌱 Seeding database..."
docker-compose exec -T backend npm run prisma:seed

echo "✅ Database reset and seeded successfully!"
