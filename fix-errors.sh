#!/bin/bash

echo "========================================"
echo "Fixing Prisma Client Errors"
echo "========================================"
echo ""

echo "Step 1: Checking Docker services..."
if ! docker ps > /dev/null 2>&1; then
    echo "Docker is not running. Starting Docker services..."
    docker-compose up -d
    echo "Waiting for services to start..."
    sleep 10
fi

echo ""
echo "Step 2: Generating Prisma Client..."
cd backend
npx prisma generate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to generate Prisma client"
    exit 1
fi

echo ""
echo "Step 3: Applying database migration..."
npx prisma migrate dev --name add_advanced_features
if [ $? -ne 0 ]; then
    echo "WARNING: Migration may have failed or already applied"
    echo "This is OK if migration was already applied"
fi

echo ""
echo "========================================"
echo "Fix Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Start backend: cd backend && npm run dev"
echo "2. Start frontend: cd frontend && npm run dev"
echo ""
echo "If you still see errors, restart your IDE/editor"
echo ""
