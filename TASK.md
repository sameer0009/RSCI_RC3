# PROMPT: Build the Complete Admin Panel for RSCI-RC3

You are working on **RSCI-RC3**, a LeetCode-style competitive programming platform. The repo is at `github.com/sameer0009/RSCI_RC3`. Your job is to **build the complete Admin side** — the dashboard, user management with role assignments, competition creation, class creation, and analytics.

---

## CRITICAL CONTEXT — READ FIRST

### Current Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Axios
- **Backend**: Express.js, TypeScript, Prisma ORM, PostgreSQL, Redis, BullMQ
- **Auth**: JWT (access + refresh tokens), stored in localStorage, Axios interceptors handle refresh
- **API client**: `frontend/src/lib/api.ts` — Axios instance with baseURL `http://localhost:5000/api`

### Test Admin Credentials (from seed file `backend/prisma/seed.ts`)
```
Email:    admin@example.com
Password: admin123
```
Other seeded users:
- Instructor: `instructor@example.com` / `instructor123`
- Problem Setter: `setter@example.com` / `setter123`
- Students: `student1@example.com` through `student5@example.com` / `test123`

### THE #1 BUG YOU MUST FIX FIRST
The frontend types are **out of sync** with the backend schema. This will break everything if not fixed.

**Backend Prisma schema** (`backend/prisma/schema.prisma` line 66) has:
```prisma
enum Role {
  STUDENT
  ADMIN
  INSTRUCTOR
  PROBLEM_SETTER
  CONTEST_MANAGER
}
```

**Frontend types** (`frontend/src/types/index.ts` line 6) currently say:
```typescript
role: 'USER' | 'ADMIN';  // WRONG — does not match backend
```

**Frontend AuthContext** (`frontend/src/contexts/AuthContext.tsx` line 83) currently says:
```typescript
isAdmin: user?.role === 'ADMIN',  // Only checks ADMIN, no awareness of other roles
```

**Frontend admin/users page** (`frontend/src/app/admin/users/page.tsx` line 13) currently says:
```typescript
role: 'USER' | 'ADMIN';  // WRONG
```
And the role filter dropdown (line 122-125) only has `USER` and `ADMIN` options.

The edit dialog role selector (line 263-272) only shows `User` and `Admin`.

**Fix ALL of these** to use the correct 5-role enum: `STUDENT | ADMIN | INSTRUCTOR | PROBLEM_SETTER | CONTEST_MANAGER`

---

## EXISTING FILE STRUCTURE (what already exists)

```
frontend/src/
├── app/
│   ├── admin/
│   │   ├── page.tsx              ← Dashboard (exists, needs enhancement)
│   │   ├── analytics/page.tsx    ← Analytics page (exists, basic)
│   │   ├── problems/             ← Problem CRUD (exists, working)
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── users/page.tsx        ← User management (exists, needs role overhaul)
│   ├── login/page.tsx            ← Login page (exists, working)
│   ├── register/page.tsx         ← Register page (exists, working)
│   ├── problems/                 ← Problem list + workspace (exists)
│   ├── leaderboard/page.tsx      ← Leaderboard (exists)
│   └── profile/[username]/       ← Profile page (exists)
├── components/
│   ├── Navbar.tsx                ← Nav bar (exists, shows Admin link for ADMIN role)
│   ├── ProtectedRoute.tsx        ← Auth guard (exists, has requireAdmin prop)
├── contexts/
│   └── AuthContext.tsx            ← Auth state (exists, needs role expansion)
├── lib/
│   └── api.ts                    ← Axios instance (exists, working)
└── types/
    └── index.ts                  ← Type definitions (exists, needs role fix)

backend/src/
├── routes/
│   ├── admin.routes.ts           ← Admin API routes (exists: problem CRUD + user CRUD)
│   ├── auth.routes.ts            ← Auth routes (exists, working)
│   ├── classroom.routes.ts       ← Classroom routes (exists, basic)
│   └── contest.routes.ts         ← DOES NOT EXIST — must create
├── controllers/
│   └── admin.controller.ts       ← Admin controller (exists: createProblem, listUsers, updateUser, deleteUser)
├── services/
│   ├── admin.service.ts          ← Admin service (exists: UpdateUserDto has {role?, fullName?, email?})
│   ├── contest.service.ts        ← Contest service (exists but has NO routes connected)
│   ├── classroom.service.ts      ← Classroom service (exists, working)
│   └── analytics.service.ts      ← Analytics service (exists, working)
└── middleware/
    └── auth.middleware.ts         ← authenticate + authorize('ADMIN') middleware (exists)
```

---

## WHAT TO BUILD — ORDERED TASKS

### TASK 1: Fix Role System Everywhere

**1a. Fix `frontend/src/types/index.ts`**
```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR' | 'PROBLEM_SETTER' | 'CONTEST_MANAGER';
  rating: number;
  rank: number;
  problemsSolved: number;
  totalSubmissions: number;
  createdAt: string;
  updatedAt: string;
}
```

**1b. Fix `frontend/src/contexts/AuthContext.tsx`**
Add role-checking helpers:
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  hasRole: (role: string) => boolean;
}
```
And compute them:
```typescript
isAdmin: user?.role === 'ADMIN',
isInstructor: user?.role === 'INSTRUCTOR',
isStudent: user?.role === 'STUDENT',
hasRole: (role: string) => user?.role === role,
```

**1c. Fix `frontend/src/components/ProtectedRoute.tsx`**
Add `requiredRole` prop alongside `requireAdmin`:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string[];  // e.g. ['ADMIN', 'INSTRUCTOR']
}
```
Check: if `requiredRole` is provided, verify `user.role` is in the array.

**1d. Fix `frontend/src/app/admin/users/page.tsx`**
- Update the `User` interface to use the 5-role enum
- Update the role filter dropdown to show all 5 roles
- Update the edit dialog role selector to show all 5 roles with proper labels
- Add color-coded role badges:
  - ADMIN → purple
  - INSTRUCTOR → teal/green
  - STUDENT → blue
  - PROBLEM_SETTER → orange
  - CONTEST_MANAGER → yellow

---

### TASK 2: Add "Create User" Functionality to Admin

Currently the admin can only edit and delete users. The admin needs to **add new users** and assign their roles.

**2a. Backend — Add create user endpoint**
In `backend/src/routes/admin.routes.ts`, add:
```
POST /admin/users  →  adminController.createUser
```

In `backend/src/services/admin.service.ts`, add a `createUser` method:
```typescript
interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role: Role;  // STUDENT | INSTRUCTOR | PROBLEM_SETTER | CONTEST_MANAGER
}
```
- Hash the password with bcrypt (same as auth.service.ts does)
- Create the user with Prisma
- Do NOT allow creating another ADMIN through this endpoint (security)
- Return the created user (without passwordHash)

**2b. Frontend — Add "Add User" button and modal on admin/users page**
- Add a prominent "Add User" button at the top of the users page
- Modal form with fields: username, email, password, full name, role (dropdown with STUDENT, INSTRUCTOR, PROBLEM_SETTER, CONTEST_MANAGER)
- On submit, POST to `/admin/users`
- Show success toast and refresh user list
- Show error message if username/email already exists

---

### TASK 3: Overhaul Admin Dashboard (`frontend/src/app/admin/page.tsx`)

The current dashboard has basic stats and quick links. Redesign it to be a proper admin control center.

**Keep**: The overview stats cards (total users, problems, submissions, contests) and recent submissions table.

**Add these quick-action cards** in the grid (replacing the current 4-card grid):
1. **User Management** → `/admin/users` — "Add students, instructors, assign roles"
2. **Problem Bank** → `/admin/problems` — "Create and manage coding problems"
3. **Competitions** → `/admin/competitions` — "Create and manage coding contests" (NEW page)
4. **Classrooms** → `/admin/classrooms` — "Create classes, assign instructors" (NEW page)
5. **Analytics** → `/admin/analytics` — "Platform usage and performance data"
6. **Leaderboard** → `/leaderboard` — "View global rankings"

**Add a "Platform Summary" section** showing:
- Users by role breakdown (how many Students, Instructors, etc.) — call `GET /analytics/dashboard`
- Active contests count
- Active classrooms count

---

### TASK 4: Build Competition Creation Page (`frontend/src/app/admin/competitions/`)

**4a. Backend — Create contest routes** (`backend/src/routes/contest.routes.ts`)

The `backend/src/services/contest.service.ts` already exists with methods but has ZERO routes. Create:

```typescript
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// Admin-only: create contests
router.post('/', authorize('ADMIN'), contestController.create);
router.get('/', contestController.list);           // All authenticated users can list
router.get('/:id', contestController.getById);      // All authenticated users can view
router.put('/:id', authorize('ADMIN', 'CONTEST_MANAGER'), contestController.update);
router.delete('/:id', authorize('ADMIN'), contestController.delete);

// Contest management (Admin creates, Contest Manager manages)
router.post('/:id/problems', authorize('ADMIN', 'CONTEST_MANAGER'), contestController.addProblems);
router.delete('/:id/problems/:problemId', authorize('ADMIN', 'CONTEST_MANAGER'), contestController.removeProblem);
```

**IMPORTANT**: The `authorize` middleware in `backend/src/middleware/auth.middleware.ts` currently only accepts a single role string. Modify it to accept multiple roles:
```typescript
export const authorize = (...roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

Register the routes in `backend/src/routes/index.ts`:
```typescript
import contestRoutes from './contest.routes';
router.use('/contests', contestRoutes);
```

**4b. Create contest controller** (`backend/src/controllers/contest.controller.ts`)
Wire up the existing `contest.service.ts` methods to HTTP endpoints:
- `create`: POST body = `{ title, description, startTime, endTime, duration, frozenDuration? }`
- `list`: GET with query params `?status=Upcoming|Active|Ended&page=1&limit=10`
- `getById`: GET by ID, include problems and participant count
- `update`: PUT body with partial contest fields
- `delete`: DELETE by ID
- `addProblems`: POST body = `{ problemIds: string[] }`
- `removeProblem`: DELETE by contest ID + problem ID

**4c. Frontend — Competition listing page** (`frontend/src/app/admin/competitions/page.tsx`)
- Table showing all contests with columns: Title, Status (badge), Start Time, End Time, Problems Count, Participants Count, Actions
- Status badges: Upcoming (blue), Active (green), Ended (gray)
- "Create Competition" button at top
- Actions: Edit, Delete, Manage Problems

**4d. Frontend — Create competition page** (`frontend/src/app/admin/competitions/create/page.tsx`)
- Form with: Title, Description (textarea), Start Date/Time (datetime-local input), End Date/Time, Duration (auto-calculated from start/end), Frozen Duration (default 60 min)
- Problem selector: searchable multi-select that shows available problems with their difficulty badge
- Preview section showing contest summary before creation
- Submit → POST to `/api/contests`

**4e. Frontend — Edit competition page** (`frontend/src/app/admin/competitions/[id]/page.tsx`)
- Same form as create, pre-filled with existing data
- Additional section: "Manage Problems" — add/remove problems from the contest
- Show registered participants count (read-only)

---

### TASK 5: Build Classroom Creation Page (`frontend/src/app/admin/classrooms/`)

**5a. Backend adjustments**
The classroom routes exist at `backend/src/routes/classroom.routes.ts`. Currently, the create endpoint uses `authenticate` but doesn't check for ADMIN role. Modify:
```typescript
router.post('/', authenticate, authorize('ADMIN'), classroomController.create);
```
Add a new field to the create body: the instructor who will manage this class. The admin picks an instructor from a dropdown.

**5b. Frontend — Classroom listing page** (`frontend/src/app/admin/classrooms/page.tsx`)
- Table showing: Class Name, Invite Code, Instructor Name, Members Count, Assignments Count, Created Date, Actions
- "Create Classroom" button at top

**5c. Frontend — Create classroom page** (`frontend/src/app/admin/classrooms/create/page.tsx`)
- Form with: Class Name, Description
- **Instructor selector**: Dropdown populated by fetching users with role=INSTRUCTOR from `GET /admin/users?role=INSTRUCTOR`
- On submit → POST to `/api/classrooms` with `{ name, description, instructorId }`
- Show the auto-generated invite code after creation

---

### TASK 6: Enhance Analytics Page (`frontend/src/app/admin/analytics/page.tsx`)

The current analytics page is basic. Add filters.

**Add filter bar at top**:
- Date range picker (from/to)
- Role filter dropdown (see stats for specific role)
- Classroom filter dropdown (see stats for a specific class)

**Add these chart sections** (use recharts, already in frontend dependencies):
- **Submissions over time** — line chart, filterable by date range
- **Users by role** — pie/donut chart showing Student/Instructor/Admin/etc breakdown
- **Problems by difficulty** — bar chart (Easy/Medium/Hard counts)
- **Top 10 active users** — bar chart by submission count

The backend `GET /analytics/dashboard` already returns most of this data. Add query params for date filtering:
```
GET /analytics/dashboard?from=2026-01-01&to=2026-04-27&role=STUDENT
```

---

### TASK 7: Update Navbar for Role-Based Navigation

In `frontend/src/components/Navbar.tsx`, the current nav only shows "Admin" link for admins. Update:

- **ADMIN** sees: Problems, Leaderboard, Admin (dashboard)
- **INSTRUCTOR** sees: Problems, Leaderboard, My Classes (link to `/classrooms`)
- **STUDENT** sees: Problems, Leaderboard, My Progress (link to `/profile/{username}`)
- **CONTEST_MANAGER** sees: Problems, Leaderboard, Contests (link to `/admin/competitions`)
- **PROBLEM_SETTER** sees: Problems, Leaderboard, Problem Bank (link to `/admin/problems`)

---

## DESIGN GUIDELINES

- Use the existing Tailwind CSS design system already in the project
- Dark mode support: every component must work with `dark:` variants (the project uses `dark:bg-dark-bg` and `dark:bg-dark-card`)
- Use the existing `api` import from `@/lib/api` for all API calls
- Use the existing `ProtectedRoute` wrapper for all admin pages
- Use the existing `Navbar` component on every page
- Modal dialogs: use the same pattern as the existing edit/delete dialogs in `admin/users/page.tsx` (fixed overlay + centered card)
- Loading states: use the same spinner pattern already in the project
- Toast notifications: if not already installed, use `react-hot-toast` for success/error messages
- Tables: use the same table styling pattern from `admin/users/page.tsx`

---

## VALIDATION RULES

After completing all tasks, verify:

1. Login with `admin@example.com` / `admin123` → should see Admin link in Navbar → click it → full admin dashboard loads
2. Go to Admin > Users → should see all 5 roles in filter dropdown and role badges
3. Click "Add User" → create a new Instructor → user appears in list with INSTRUCTOR badge
4. Go to Admin > Competitions → should see competition list (empty initially) → click Create → fill form → contest appears
5. Go to Admin > Classrooms → should see classroom list → click Create → pick an instructor → classroom created with invite code
6. Go to Admin > Analytics → charts render with data, filters work
7. Login with `instructor@example.com` / `instructor123` → should NOT see Admin link, should see "My Classes" link
8. Login with `student1@example.com` / `test123` → should NOT see Admin link, should see "My Progress" link

---

## DO NOT

- Do NOT change the database schema (Prisma). The existing models are correct.
- Do NOT change the JWT auth flow or token storage mechanism.
- Do NOT modify the Judge0 integration or submission pipeline.
- Do NOT create separate CSS files — use Tailwind classes inline.
- Do NOT install new UI component libraries (no Material UI, Chakra, etc.) — use raw Tailwind.
- Do NOT use `any` type — properly type everything.
- Do NOT skip dark mode support on any component.