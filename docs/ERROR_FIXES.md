# Error Fixes Guide

## Current Errors and Solutions

### ❌ Error: Module '@prisma/client' has no exported member 'ProblemType', 'ValidationStrategy', etc.

**Location**: 
- `backend/src/services/validation.service.ts`
- `backend/src/services/problem.service.enhanced.ts`

**Cause**: The Prisma client hasn't been regenerated after schema changes. The new enums and models don't exist in the current Prisma client.

**Solution**:

```bash
cd backend

# Step 1: Generate Prisma client with new schema
npx prisma generate

# Step 2: Apply the migration (if database is running)
npx prisma migrate dev --name add_advanced_features

# Step 3: Restart the backend server
npm run dev
```

**If database is not running**:

```bash
# Start Docker services first
docker-compose up -d

# Wait a few seconds for PostgreSQL to start
# Then run the commands above
```

---

## Complete Fix Procedure

### Option 1: Fresh Start (Recommended)

```bash
# 1. Stop all running services
docker-compose down

# 2. Start Docker services
docker-compose up -d

# 3. Wait for services to be ready (10 seconds)
timeout /t 10

# 4. Generate Prisma client
cd backend
npx prisma generate

# 5. Apply migration
npx prisma migrate dev --name add_advanced_features

# 6. Seed database
npx tsx prisma/seed.ts

# 7. Start backend
npm run dev

# 8. In another terminal, start frontend
cd frontend
npm run dev
```

### Option 2: Quick Fix (If services are running)

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Restart backend (Ctrl+C and npm run dev)
```

---

## Error Details

### 1. Missing Enum Types

**Errors**:
```
Module '"@prisma/client"' has no exported member 'ProblemType'
Module '"@prisma/client"' has no exported member 'ValidationStrategy'
Module '"@prisma/client"' has no exported member 'ProblemStatus'
Module '"@prisma/client"' has no exported member 'TestCaseVisibility'
```

**Why**: These enums are defined in `schema.prisma` but Prisma client hasn't been generated yet.

**Fix**: Run `npx prisma generate`

### 2. Missing Model Properties

**Errors**:
```
Property 'testCaseGroup' does not exist
Property 'customChecker' does not exist
'problemType' does not exist in type 'ProblemCreateInput'
'groupId' does not exist in type 'TestCaseCreateInput'
'visibility' does not exist in type 'TestCaseWhereInput'
```

**Why**: New models and fields added to schema but not in Prisma client.

**Fix**: Run `npx prisma generate` and `npx prisma migrate dev`

---

## Verification Steps

After applying fixes, verify everything works:

### 1. Check Prisma Client Generation

```bash
cd backend
npx prisma generate
```

Expected output:
```
✔ Generated Prisma Client
```

### 2. Check Migration Status

```bash
npx prisma migrate status
```

Expected output:
```
Database schema is up to date!
```

### 3. Check TypeScript Compilation

```bash
npx tsc --noEmit
```

Expected: No errors

### 4. Start Backend

```bash
npm run dev
```

Expected output:
```
✅ Database connected successfully
✅ Redis connected
🚀 Server running on port 5000
```

### 5. Check for Import Errors

The following imports should now work:

```typescript
import { 
  ProblemType, 
  ValidationStrategy, 
  ProblemStatus,
  TestCaseVisibility 
} from '@prisma/client';
```

---

## Common Issues

### Issue: "Can't reach database server"

**Solution**:
```bash
# Check if Docker is running
docker ps

# If not running, start it
docker-compose up -d

# Wait 10 seconds
timeout /t 10

# Try again
cd backend
npx prisma migrate dev
```

### Issue: "Migration failed"

**Solution**:
```bash
# Reset database (WARNING: Deletes all data)
cd backend
npx prisma migrate reset

# Or manually apply SQL
psql -U postgres -d coding_platform -f prisma/migrations/add_advanced_features.sql
```

### Issue: "Prisma Client not found"

**Solution**:
```bash
cd backend
npm install @prisma/client
npx prisma generate
```

### Issue: TypeScript still shows errors

**Solution**:
```bash
# Restart TypeScript server in VS Code
# Press Ctrl+Shift+P
# Type: "TypeScript: Restart TS Server"
# Press Enter

# Or restart your IDE
```

---

## Prevention

To avoid these errors in the future:

1. **Always run `npx prisma generate`** after schema changes
2. **Run migrations** before starting the server
3. **Restart TypeScript server** after Prisma changes
4. **Check diagnostics** before committing code

---

## Quick Commands Reference

```bash
# Generate Prisma client
cd backend && npx prisma generate

# Apply migrations
cd backend && npx prisma migrate dev

# Reset database
cd backend && npx prisma migrate reset

# Check migration status
cd backend && npx prisma migrate status

# Seed database
cd backend && npx tsx prisma/seed.ts

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

---

## Files Affected

The following files will work correctly after fixing:

1. ✅ `backend/src/services/validation.service.ts`
2. ✅ `backend/src/services/problem.service.enhanced.ts`
3. ✅ `backend/prisma/schema.prisma`
4. ✅ All Prisma client imports

---

## Expected Result

After applying all fixes:

- ✅ No TypeScript errors
- ✅ Prisma client has all new types
- ✅ Database schema is up to date
- ✅ Backend starts without errors
- ✅ Frontend starts without errors
- ✅ All features work correctly

---

## Need More Help?

If errors persist:

1. Check [SETUP_ADVANCED_FEATURES.md](SETUP_ADVANCED_FEATURES.md)
2. Review [TROUBLESHOOTING section in INDEX.md](INDEX.md)
3. Verify Docker services are running: `docker ps`
4. Check backend logs for specific errors
5. Ensure all dependencies are installed: `npm install`

---

**Last Updated**: November 15, 2025  
**Status**: ✅ Solutions Provided
