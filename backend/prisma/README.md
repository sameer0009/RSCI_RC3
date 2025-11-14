# Database Schema Documentation

## Overview

This document describes the database schema for the Online Coding Platform. The database uses PostgreSQL with Prisma ORM.

## Models

### User
Represents a user account (both regular users and admins).

**Fields:**
- `id` (UUID): Primary key
- `username` (String): Unique username
- `email` (String): Unique email address
- `passwordHash` (String): Bcrypt hashed password
- `role` (Enum): USER or ADMIN
- `rating` (Int): User's rating score
- `rank` (Int): Global rank
- `problemsSolved` (Int): Count of solved problems
- `totalSubmissions` (Int): Total submission count
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Has many: submissions, problemsCreated, contestsCreated, contestParticipants

### Problem
Represents a coding problem.

**Fields:**
- `id` (UUID): Primary key
- `title` (String): Problem title
- `slug` (String): URL-friendly unique identifier
- `description` (Text): Full problem description
- `inputFormat` (Text): Input format specification
- `outputFormat` (Text): Output format specification
- `constraints` (Text): Problem constraints
- `difficulty` (Enum): Easy, Medium, or Hard
- `topics` (String[]): Array of topic tags
- `timeLimit` (Int): Time limit in milliseconds
- `memoryLimit` (Int): Memory limit in MB
- `acceptanceRate` (Float): Percentage of accepted submissions
- `totalSubmissions` (Int): Total submission count
- `acceptedSubmissions` (Int): Accepted submission count
- `createdBy` (String): User ID of creator
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Belongs to: creator (User)
- Has many: testCases, submissions
- Many-to-many: contests

### TestCase
Represents a test case for a problem.

**Fields:**
- `id` (UUID): Primary key
- `problemId` (String): Foreign key to Problem
- `input` (Text): Test input
- `expectedOutput` (Text): Expected output
- `isPublic` (Boolean): Whether visible to users
- `points` (Int): Points awarded for passing
- `orderIndex` (Int): Display order
- `createdAt` (DateTime): Creation timestamp

**Relations:**
- Belongs to: problem (Problem)

### Submission
Represents a code submission.

**Fields:**
- `id` (UUID): Primary key
- `userId` (String): Foreign key to User
- `problemId` (String): Foreign key to Problem
- `contestId` (String?): Optional foreign key to Contest
- `code` (Text): Submitted code
- `language` (String): Programming language
- `verdict` (Enum): Accepted, WrongAnswer, TimeLimitExceeded, RuntimeError, CompilationError, or Pending
- `executionTime` (Int): Execution time in milliseconds
- `memoryUsed` (Int): Memory used in KB
- `testCasesPassed` (Int): Number of passed test cases
- `totalTestCases` (Int): Total test cases
- `points` (Int): Points earned
- `submittedAt` (DateTime): Submission timestamp
- `evaluatedAt` (DateTime?): Evaluation completion timestamp

**Relations:**
- Belongs to: user (User), problem (Problem), contest (Contest, optional)

### Contest
Represents a coding contest.

**Fields:**
- `id` (UUID): Primary key
- `title` (String): Contest title
- `description` (Text): Contest description
- `startTime` (DateTime): Start timestamp
- `endTime` (DateTime): End timestamp
- `duration` (Int): Duration in minutes
- `status` (Enum): Upcoming, Active, or Ended
- `createdBy` (String): User ID of creator
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Belongs to: creator (User)
- Many-to-many: problems (Problem)
- Has many: participants (ContestParticipant), submissions

### ContestParticipant
Represents a user's participation in a contest.

**Fields:**
- `id` (UUID): Primary key
- `contestId` (String): Foreign key to Contest
- `userId` (String): Foreign key to User
- `rank` (Int): Contest rank
- `totalPoints` (Int): Total points earned
- `problemsSolved` (Int): Problems solved in contest
- `penalty` (Int): Time penalty in minutes
- `lastSubmissionTime` (DateTime?): Last submission timestamp
- `registeredAt` (DateTime): Registration timestamp

**Relations:**
- Belongs to: contest (Contest), user (User)

**Unique Constraint:** (contestId, userId)

## Indexes

The following indexes are created for query optimization:

- User: username, email
- Problem: slug, difficulty, createdBy
- TestCase: problemId, isPublic
- Submission: userId, problemId, contestId, verdict, submittedAt
- Contest: status, startTime, createdBy
- ContestParticipant: contestId, userId, rank

## Enums

### Role
- USER
- ADMIN

### Difficulty
- Easy
- Medium
- Hard

### Verdict
- Accepted
- WrongAnswer
- TimeLimitExceeded
- RuntimeError
- CompilationError
- Pending

### ContestStatus
- Upcoming
- Active
- Ended

## Database Commands

### Generate Prisma Client
```bash
npm run prisma:generate
```

### Create Migration
```bash
npm run prisma:migrate
```

### Deploy Migrations (Production)
```bash
npm run prisma:migrate:deploy
```

### Seed Database
```bash
npm run prisma:seed
```

### Open Prisma Studio
```bash
npm run prisma:studio
```

### Reset Database (Development Only)
```bash
npm run prisma:reset
```

### Push Schema Without Migration
```bash
npm run db:push
```

## Connection Pooling

The application uses Prisma's built-in connection pooling. Configuration is handled in `src/config/database.ts`.

Default pool settings:
- Connection limit: Based on DATABASE_URL connection string
- Timeout: 10 seconds
- Idle timeout: 600 seconds

## Backup and Restore

### Backup
```bash
pg_dump -h localhost -U postgres -d coding_platform > backup.sql
```

### Restore
```bash
psql -h localhost -U postgres -d coding_platform < backup.sql
```

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried fields are indexed
2. **Pagination**: Use cursor-based pagination for large result sets
3. **Caching**: Use Redis for frequently accessed data (leaderboards, problem lists)
4. **Partitioning**: Consider partitioning the Submission table by date for large datasets
5. **Connection Pooling**: Properly configured to handle concurrent requests

## Security

1. **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
2. **SQL Injection**: Prisma uses parameterized queries to prevent SQL injection
3. **Access Control**: Role-based access control implemented at application level
4. **Audit Logging**: All admin actions should be logged (implement in application layer)
