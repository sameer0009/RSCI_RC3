#!/bin/bash

echo "🚀 Setting up Online Coding Platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment files
echo "📝 Setting up environment variables..."
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "✅ Created backend/.env"
fi

if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  echo "✅ Created frontend/.env"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Run database migrations
echo "🗄️  Running database migrations..."
cd backend
npm run prisma:generate
npm run prisma:migrate

# Seed database
echo "🌱 Seeding database..."
npm run prisma:seed

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development servers, run:"
echo "  npm run dev"
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend will be available at: http://localhost:5000"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
