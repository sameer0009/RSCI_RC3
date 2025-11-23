# Online Coding Platform

A full-stack LeetCode-style coding competition and practice platform with automatic code evaluation.

## Features

### Core Features
- 🧩 Practice coding problems with multiple difficulty levels
- 🏆 Participate in timed contests and competitions
- � Talke programming exams with automatic evaluation
- � Multi- language support (Python, C, C++, Java, JavaScript, C#, Go, PHP)
- � Seecure sandbox code execution
- � Real-ptime leaderboards and rankings
- 👤 User profiles with statistics and achievements
- 🎨 Modern dark mode UI

### ⭐ Enhanced Scoring System (NEW!)
- 📊 **Point-Based Scoring**: Each test case has weighted points
- 🎯 **Partial Credit**: Get points for passing individual test cases
- 👀 **Practice Mode**: Test against sample cases before submitting
- 📁 **Test Case Groups**: Organized categories (Basic, Edge Cases, Performance)
- 🔍 **Detailed Feedback**: See exactly which test categories you passed
- 🎓 **Better Learning**: Understand your solution's strengths and weaknesses

[Learn more about Enhanced Scoring →](./docs/ENHANCED_SCORING_SYSTEM.md)

## Tech Stack

### Frontend
- Next.js 14 with TypeScript
- React 18
- Tailwind CSS
- Monaco Editor
- React Query
- Socket.io Client

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- Redis for caching
- Bull for job queues
- Judge0 API for code execution

## Quick Start

### ⚡ One-Click Setup (Recommended)

### TL;DR

```bash
# 1. Install dependencies
npm install

# 2. Start Docker services
docker-compose up -d

# 3. Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Setup database
cd backend && npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed && cd ..

# 5. Start servers
npm run dev
```

**Access:** http://localhost:3000

**Login:** admin@example.com / admin123

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop (running)
- npm or yarn

### Installation

Follow the [docs/QUICKSTART.md](docs/QUICKSTART.md) guide for step-by-step instructions.

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Prisma Studio: http://localhost:5555 (run `npm run prisma:studio` in backend/)

## Project Structure

```
online-coding-platform/
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── lib/           # Utility functions
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
├── backend/               # Express backend application
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   └── types/         # TypeScript types
│   └── prisma/            # Database schema and migrations
└── docker-compose.yml     # Docker services configuration
```

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Database Commands
```bash
# Create a new migration
cd backend
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate

# Seed database
npm run prisma:seed
```

## Documentation

All documentation has been organized in the `docs/` folder:

- **[docs/INDEX.md](docs/INDEX.md)** - Complete documentation index
- **[docs/QUICKSTART.md](docs/QUICKSTART.md)** - Quick start guide
- **[docs/SETUP_INSTRUCTIONS.md](docs/SETUP_INSTRUCTIONS.md)** - Detailed setup
- **[docs/IMPLEMENTATION_COMPLETE.md](docs/IMPLEMENTATION_COMPLETE.md)** - Advanced features
- **[docs/PLATFORM_READY.md](docs/PLATFORM_READY.md)** - Platform overview

See [docs/INDEX.md](docs/INDEX.md) for a complete list of all documentation.

## License

MIT
