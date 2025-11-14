# Quick Start Guide

Get your Online Coding Platform up and running in minutes!

## Prerequisites

- Node.js 20+ installed
- Docker Desktop installed and running
- Git installed

## Installation Steps

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd online-coding-platform

# Install dependencies
npm install
```

### 2. Start Docker Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services are running
docker ps
```

### 3. Configure Environment Variables

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

**Important:** Edit `backend/.env` if needed. Default values work for local development.

### 4. Setup Database

```bash
# Navigate to backend
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed

# Return to root
cd ..
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## Default Login Credentials

### Admin Account
- **Email:** admin@example.com
- **Password:** admin123

### Test User Accounts
- **Email:** user1@example.com (through user10@example.com)
- **Password:** test123

## Quick Test

1. Visit http://localhost:3000
2. Click "Sign In"
3. Login with admin credentials
4. Navigate to "Problems" to see sample problems
5. Click on any problem to view details and code editor
6. As admin, visit "Admin" to create new problems

## Sample Data Included

The seeded database includes:
- 1 admin user
- 10 test users
- 5 sample coding problems (Easy to Medium difficulty)
- Multiple test cases per problem
- 3 sample contests (upcoming, active, ended)
- Sample submissions and rankings

## Common Commands

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Run tests
npm run test

# Build for production
npm run build

# Database commands
cd backend
npm run prisma:studio      # Open Prisma Studio (DB GUI)
npm run prisma:migrate     # Create new migration
npm run prisma:seed        # Seed database
npm run prisma:reset       # Reset database (WARNING: deletes all data)
```

## Troubleshooting

### Docker not running
```bash
# Check Docker status
docker info

# Start Docker Desktop application
```

### Port already in use
```bash
# Check what's using port 5000
# Windows
netstat -ano | findstr :5000

# Kill the process or change PORT in backend/.env
```

### Database connection error
```bash
# Restart Docker services
docker-compose down
docker-compose up -d

# Wait a few seconds for PostgreSQL to start
# Then run migrations again
cd backend
npm run prisma:migrate
```

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
```

## Next Steps

1. **Explore Problems:** Browse and solve the sample problems
2. **Create Problems:** Use the admin interface to add new problems
3. **Customize:** Modify the code to add your own features
4. **Deploy:** Follow the deployment guide in README.md

## Features Available

✅ User authentication (register/login)
✅ Problem browsing with filters
✅ Code editor with syntax highlighting
✅ Multiple programming language support
✅ Admin problem management
✅ Test case management
✅ Responsive dark mode UI

## Need Help?

- Check the main README.md for detailed documentation
- Review the API endpoints in backend/src/routes/
- Inspect the database schema in backend/prisma/schema.prisma
- Check logs in the terminal where servers are running

## Development Tips

- Use `npm run prisma:studio` to visually inspect/edit database
- Backend auto-reloads on file changes
- Frontend has hot module replacement
- Check browser console for frontend errors
- Check terminal for backend errors

Happy Coding! 🚀
