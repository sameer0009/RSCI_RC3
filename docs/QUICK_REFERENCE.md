# Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Start the system
docker-compose up -d
cd backend && npm run dev
cd frontend && npm run dev

# Stop the system
docker-compose down

# Reset database
cd backend
npx prisma migrate reset
npx prisma generate
npx tsx prisma/seed.ts
```

## 🔑 Default Credentials

**Admin Account**:
- Email: `admin@example.com`
- Password: `admin123`

**Test Users**:
- Email: `user1@example.com` to `user10@example.com`
- Password: `test123`

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📁 Important Files

### Configuration
- `backend/.env` - Backend environment variables
- `frontend/.env.local` - Frontend environment variables
- `docker-compose.yml` - Docker services configuration

### Database
- `backend/prisma/schema.prisma` - Database schema
- `backend/prisma/migrations/` - Database migrations
- `backend/prisma/seed.ts` - Database seeding script

### Services
- `backend/src/services/validation.service.ts` - Validation strategies
- `backend/src/services/problem.service.enhanced.ts` - Enhanced problem service
- `backend/src/services/judge.service.ts` - Code execution and judging

## 🎯 Validation Strategies

| Strategy | Use Case | Example |
|----------|----------|---------|
| `EXACT_MATCH` | Exact string match | String problems |
| `IGNORE_WHITESPACE` | Trim whitespace | Formatted output |
| `TOKEN_BASED` | Compare tokens | Multiple numbers |
| `FLOATING_POINT` | Epsilon tolerance | Geometry, physics |
| `CUSTOM_CHECKER` | Custom logic | Complex validation |

## 📊 Test Case Visibility

| Visibility | Description | Shown to Users |
|------------|-------------|----------------|
| `SAMPLE` | Example cases | ✅ Input, Output, Expected |
| `HIDDEN` | Hidden cases | ❌ Only verdict |
| `STRESS` | Stress tests | ❌ Not scored |

## 🔧 Problem Status

| Status | Description | Visible to Users |
|--------|-------------|------------------|
| `DRAFT` | Work in progress | ❌ No |
| `PUBLISHED` | Live problem | ✅ Yes |
| `ARCHIVED` | Archived | ❌ No |

## 🛠️ Common Tasks

### Create a Problem
```typescript
POST /api/admin/problems
{
  "title": "Problem Title",
  "description": "Problem description",
  "difficulty": "Easy",
  "validationStrategy": "EXACT_MATCH",
  "testCases": [...]
}
```

### Submit a Solution
```typescript
POST /api/submissions
{
  "problemId": "uuid",
  "code": "solution code",
  "language": "cpp"
}
```

### Get Submission Results
```typescript
GET /api/submissions/:id
```

## 📝 Supported Languages

- C++ (`cpp`)
- Python (`python`)
- Java (`java`)
- JavaScript (`javascript`)
- C (`c`)
- C# (`csharp`)
- Go (`go`)
- PHP (`php`)

## 🔍 Troubleshooting

### Database Connection Failed
```bash
docker-compose restart postgres
cd backend && npx prisma generate
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Prisma Client Error
```bash
cd backend
npx prisma generate
npm run dev
```

### Migration Failed
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

## 📚 Documentation Links

- **[INDEX.md](INDEX.md)** - Complete documentation index
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)** - Advanced features
- **[SETUP_ADVANCED_FEATURES.md](SETUP_ADVANCED_FEATURES.md)** - Setup guide

## 🎓 Admin Pages

- `/admin` - Admin dashboard
- `/admin/problems` - Manage problems
- `/admin/problems/create` - Create new problem
- `/admin/users` - Manage users
- `/admin/analytics` - View analytics

## 👤 User Pages

- `/` - Home page
- `/problems` - Browse problems
- `/problems/:slug` - Solve problem
- `/leaderboard` - View rankings
- `/profile/:username` - User profile
- `/login` - Login page
- `/register` - Registration page

## 🔐 API Authentication

All admin endpoints require JWT token:
```typescript
headers: {
  'Authorization': 'Bearer <token>'
}
```

## 📊 Database Schema

### Main Models
- `User` - User accounts
- `Problem` - Coding problems
- `TestCase` - Test cases
- `TestCaseGroup` - Test case groups
- `Submission` - Code submissions
- `TestCaseResult` - Detailed results
- `CustomChecker` - Custom validators
- `Contest` - Competitions

## 🎯 Quick Tips

1. **Always seed database** after migration
2. **Use DRAFT status** for testing problems
3. **Set first test case to SAMPLE** for examples
4. **Use TOKEN_BASED** for flexible output
5. **Enable partial scoring** for complex problems
6. **Test with reference solution** before publishing

## 📞 Support

For detailed help, see:
- [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- [TROUBLESHOOTING section in INDEX.md](INDEX.md)
- [ADMIN_WORKAROUND.md](ADMIN_WORKAROUND.md)

---

**Last Updated**: November 15, 2025  
**Version**: 1.0.0
