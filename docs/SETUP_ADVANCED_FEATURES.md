# Setup Guide: Advanced Problem Creation Features

## Overview

This guide will help you set up and run the enhanced coding platform with advanced problem creation features including multiple validation strategies, test case groups, partial scoring, and more.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- PostgreSQL (via Docker)
- Redis (via Docker)

## Step-by-Step Setup

### 1. Start Docker Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services are running
docker ps
```

You should see:
- `coding-platform-postgres` (port 5432)
- `coding-platform-redis` (port 6379)

### 2. Apply Database Migration

```bash
cd backend

# Generate Prisma client with new schema
npx prisma generate

# Apply the migration
npx prisma migrate dev --name add_advanced_features

# If migration fails, you can manually run the SQL:
# psql -U postgres -d coding_platform -f prisma/migrations/add_advanced_features.sql
```

### 3. Update Existing Data

The migration automatically:
- Sets all existing problems to `PUBLISHED` status
- Sets the first test case of each problem to `SAMPLE` visibility
- Adds default values for all new fields

### 4. Install Dependencies (if needed)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 6. Seed Database (Optional)

```bash
cd backend
npx tsx prisma/seed.ts
```

This creates:
- Admin user: `admin@example.com` / `admin123`
- 10 test users
- 5 sample problems (now with advanced features)

## Using Advanced Features

### Creating a Problem with Validation Strategy

```typescript
// Example API request
POST /api/admin/problems
{
  "title": "Sum of Two Numbers",
  "description": "Calculate the sum of two numbers",
  "inputFormat": "Two integers a and b",
  "outputFormat": "Single integer representing a + b",
  "constraints": "1 ≤ a, b ≤ 10^9",
  "difficulty": "Easy",
  "topics": ["math", "basic"],
  
  // Advanced features
  "validationStrategy": "FLOATING_POINT",
  "floatingPointEpsilon": 0.000001,
  "enablePartialScoring": true,
  "status": "DRAFT",
  
  "testCases": [
    {
      "input": "2 3",
      "expectedOutput": "5",
      "visibility": "SAMPLE",
      "points": 10
    },
    {
      "input": "100 200",
      "expectedOutput": "300",
      "visibility": "HIDDEN",
      "points": 20
    }
  ]
}
```

### Validation Strategies

#### 1. EXACT_MATCH (Default)
```json
{
  "validationStrategy": "EXACT_MATCH"
}
```
- Exact string comparison
- Use for: String problems, exact output required

#### 2. IGNORE_WHITESPACE
```json
{
  "validationStrategy": "IGNORE_WHITESPACE"
}
```
- Trims and normalizes whitespace
- Use for: Problems where whitespace doesn't matter

#### 3. TOKEN_BASED
```json
{
  "validationStrategy": "TOKEN_BASED"
}
```
- Compares tokens, ignores all whitespace
- Use for: Multiple numbers/words output

#### 4. FLOATING_POINT
```json
{
  "validationStrategy": "FLOATING_POINT",
  "floatingPointEpsilon": 0.000001
}
```
- Compares with epsilon tolerance
- Use for: Geometry, physics, mathematical problems

#### 5. CUSTOM_CHECKER
```json
{
  "validationStrategy": "CUSTOM_CHECKER",
  "customChecker": {
    "language": "cpp",
    "code": "// Custom checker code"
  }
}
```
- Custom validation logic
- Use for: Complex validation, multiple correct answers

### Test Case Visibility

- **SAMPLE**: Visible to users (like examples)
- **HIDDEN**: Hidden, only verdict shown
- **STRESS**: For stress testing, not counted in score

### Problem Status

- **DRAFT**: Work in progress, not visible to users
- **PUBLISHED**: Live and visible to all users
- **ARCHIVED**: Hidden from users, kept for records

## Testing the Features

### 1. Test Validation Service

```bash
cd backend
node -e "
const validationService = require('./src/services/validation.service').default;

// Test exact match
validationService.validateOutput('Hello', 'Hello', { strategy: 'EXACT_MATCH' })
  .then(result => console.log('Exact match:', result));

// Test floating point
validationService.validateOutput('3.14159', '3.14160', { 
  strategy: 'FLOATING_POINT', 
  epsilon: 0.001 
}).then(result => console.log('Floating point:', result));
"
```

### 2. Create a Test Problem

1. Login as admin: `admin@example.com` / `admin123`
2. Go to Admin → Create Problem
3. Fill in basic information
4. Select validation strategy
5. Add test cases with different visibility levels
6. Save as DRAFT
7. Test with reference solution
8. Publish when ready

### 3. Submit a Solution

1. Login as user
2. Browse problems
3. Select a problem
4. Write solution
5. Submit
6. View detailed results with per-test-case feedback

## API Endpoints

### Problem Management

```
POST   /api/admin/problems              - Create problem
GET    /api/admin/problems              - List all problems
GET    /api/admin/problems/:id          - Get problem details
PUT    /api/admin/problems/:id          - Update problem
DELETE /api/admin/problems/:id          - Delete problem
```

### Submissions

```
POST   /api/submissions                 - Submit solution
GET    /api/submissions/:id             - Get submission details
GET    /api/submissions/:id/results     - Get detailed test case results
```

## Troubleshooting

### Migration Fails

If the migration fails:

```bash
# Reset database (WARNING: Deletes all data)
cd backend
npx prisma migrate reset

# Or manually apply SQL
psql -U postgres -d coding_platform -f prisma/migrations/add_advanced_features.sql
```

### Prisma Client Errors

```bash
cd backend
npx prisma generate
npm run dev
```

### Docker Issues

```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: Deletes data)
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Port Conflicts

If ports 3000, 5000, 5432, or 6379 are in use:

```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml and .env files
```

## Configuration

### Environment Variables

Create/update `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coding_platform"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-judge0-api-key"
```

### Judge0 Configuration

For code execution, you need Judge0 API:

1. Get API key from: https://rapidapi.com/judge0-official/api/judge0-ce
2. Add to `.env` file
3. Or use self-hosted Judge0

## Performance Optimization

### Database Indexes

The migration adds indexes on:
- `Problem.status`
- `TestCase.visibility`
- `TestCase.groupId`

### Caching

Consider adding Redis caching for:
- Problem configurations
- Validation strategies
- Compiled checkers

## Security Considerations

### Custom Checkers

Custom checkers are sandboxed:
- 5-second timeout
- Limited memory
- No dangerous functions
- Isolated execution

### Input Validation

All inputs are validated:
- Problem data
- Test cases
- Checker code
- Submission code

## Next Steps

1. **Create sample problems** with different validation strategies
2. **Test submissions** with various solutions
3. **Monitor performance** and optimize as needed
4. **Add more features** from the spec (groups, import/export, etc.)

## Support

For issues or questions:
- Check `ADVANCED_FEATURES_PROGRESS.md` for implementation status
- Review `.kiro/specs/advanced-problem-creation/` for detailed documentation
- Check logs in `backend/` and browser console

## Summary

You now have a professional coding platform with:
- ✅ Multiple validation strategies
- ✅ Test case visibility levels
- ✅ Partial scoring support
- ✅ Problem status workflow
- ✅ Language-specific constraints
- ✅ Custom checker support (backend)

The platform is ready for:
- Competitive programming practice
- Online coding courses
- Programming contests
- Technical interviews
- Educational use
