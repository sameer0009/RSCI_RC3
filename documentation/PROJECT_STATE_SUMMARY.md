# RSCI Platform: Current State & Implementation Summary

This document outlines everything that has been implemented in the RSCI (Riphah Society of Computer Intelligence) platform so far. It encompasses the database schema details, the REST APIs developed, and the overarching features and capabilities currently existing in the backend core.

---

## 1. Database Entities & Schema (Prisma)

The application uses **PostgreSQL** configured via Prisma ORM. The data models are broadly divided into the following domains:

### **Identity & Profiles**
- **`User`**: Main user identity containing auth credentials, roles, profile details, social links, and competitive statistics (rating, rank, problems solved).
- **`AuthToken`**: Used for Refresh Tokens, Password Resets, and Email Verifications.
- **`Role (Enum)`**: System Roles (`STUDENT`, `ADMIN`, `INSTRUCTOR`, `PROBLEM_SETTER`, `CONTEST_MANAGER`).

### **Problem Domain**
- **`Problem`**: Stores coding problems including descriptions, constraints, memory/time limits, and evaluation metadata (Validation Strategy, Problem Type).
- **`TestCase` & `TestCaseGroup`**: Granular test cases storing expected inputs/outputs, visibility (Hidden, Sample, Stress), limits, and evaluation points.
- **`CustomChecker`**: Scripts used for verifying non-exact-match outputs.
- **`Tag` & `ProblemTag`**: Taxonomies and topics attached to problems (e.g., "Dynamic Programming", "Graphs").

### **Execution Engine**
- **`Submission`**: Tracks user code submissions to specific problems/contests, execution time, memory used, final verdict, and score.
- **`TestCaseResult`**: Granular results for each individual testcase executed within a single submission.
- **`Verdict (Enum)`**: `Accepted`, `WrongAnswer`, `TimeLimitExceeded`, `RuntimeError`, `CompilationError`, `Pending`.

### **Competitive Domain (Contests)**
- **`Contest`**: Configurable events containing start/end times and freezing durations.
- **`ContestParticipant`**: Pivot tables storing competitor rankings, penalties, and points in specific contests.

### **Social & Community**
- **`Solution`**: Textual/Code solutions shared by authors.
- **`Comment` & `Vote`**: Upvote/downvote and discussion mechanics for solutions.
- **`Notification` & `NotificationSetting`**: Stores events and preferences for users (System, Submissions, Academics alerts).

### **Academic Domain (LMS Features)**
- **`Classroom`**: Instructor-created classes utilizing a unique `code` for join links.
- **`ClassroomMember`**: Details the students attached to the respective classes.
- **`Assignment`**: Coding assignments grouping together platform problems mapped to specific due dates.

---

## 2. API Reference (Express.js Routes)

All API endpoints are implemented with proper REST design and mounted across a modular routing architecture. Most endpoints employ `Authentication` and `Authorization` middleware.

### **Authentication (`/api/auth`)**
*Handles all local and third-party entity verifications.*
- `POST /auth/register` - Registers a new user.
- `POST /auth/login` - Authenticates and issues JWT pairs.
- `POST /auth/refresh` - Request a rotation of authentication session.
- `POST /auth/logout` - Discards active sessions.
- `GET /auth/verify-email/:token` - Completes email registration proofs.
- `POST /auth/forgot-password` & `POST /auth/reset-password` - Account recovery sequence.
- **OAuth Pathways:** `GET /auth/google`, `GET /auth/google/callback`, `GET /auth/github`, `GET /auth/github/callback`.
- `GET /auth/me` - Resolves the current session payload properties.

### **Problems Engine (`/api/problems`)**
*Curates the coding questions repository and its data associations.*
- `GET /problems/` - Retrieves a paginated list of allowed problems (injects 'solved' status if user is authenticated).
- `GET /problems/topics` - Fetches all problem taxonomy topics.
- `GET /problems/:id` & `GET /problems/slug/:slug` - Retrieves details of a specific problem.
- **TestCase Retrieval:** `GET /problems/:id/testcases` & `GET /problems/:id/groups`.
- **Administrative Endpoints:** 
  - `POST /problems/` - Creates new coding problems.
  - `PUT /problems/:id` & `DELETE /problems/:id` - Edits or soft-removes problems.
  - `POST /problems/:id/groups`, `PUT /problems/groups/:groupId`, `DELETE /problems/groups/:groupId` - Organizes test suites together.
  - `POST /problems/:id/testcases`, `PUT /problems/testcases/:id`, `DELETE /problems/testcases/:id` - Directly manage expected input output objects.

### **Submissions & Execution (`/api/submissions`)**
*Interfaces directly with the algorithmic execution workers.*
- `POST /submissions/` - Evaluates a raw code payload against server test cases.
- `POST /submissions/run` - Dry-runs custom input against custom code.
- `POST /submissions/sample-tests` - Immediately tests code strictly against `Sample` (public) inputs.
- `GET /submissions/:id` - Pull the precise granular metrics memory/time logic of a given submission.
- `GET /submissions/user/:userId` - Resolves historic submissions matching an identity.

### **User Profiles (`/api/users`)**
*Adjusts and presents User meta-information.*
- `GET /users/:username/profile` - Public demographic profiles.
- `PUT /users/profile` - Modify standard user properties (bio, names).
- `POST /users/profile/picture` - Mutipart/FormData upload of avatar images.
- `DELETE /users/profile/picture` - Purges the current picture.
- `PUT /users/profile/social` - Attaches Github/Linkedin/Twitter profiles.

### **Leaderboard (`/api/leaderboard`)**
*Handles rankings globally.*
- `GET /leaderboard/` - Fetches the top-ranked profiles.
- `GET /leaderboard/user/:userId` - Resolves where a defined user is standing in global indices.

### **Analytics (Admin Dashboard) (`/api/analytics`)**
*Data aggregation services specifically restricted to system operators.*
- `GET /analytics/dashboard` - Global high-level aggregate statuses.
- `GET /analytics/activity` - Parses granular platform interactions over dates.
- `GET /analytics/submissions-trend` - Evaluates algorithmic workload across a timeframe.
- `GET /analytics/difficulty-dist` - Categorizes internal problem metrics (Easy/Medium/Hard).
- `GET /analytics/language-stats` - Details which languages the userbase submits the most.
- `GET /analytics/active-users` - Pinpoints the most dedicated active contestants.
- `GET /analytics/export` - Pulls heavy metrics datasets to files for operators.

### **Global Administration (`/api/admin`)**
*Overarching CMS logic.*
- `GET /admin/users` & `GET /admin/users/search` - Lookups over the whole identity array.
- `GET /admin/users/:id`, `PUT /admin/users/:id`, `DELETE /admin/users/:id` - Manipulate users.
- `POST /admin/problems/:id/testcases/bulk` - Zipped/JSON Bulk insertions of test cases logic constraints.

### **Notifications System (`/api/notifications`)**
*Web-socket targeted metadata payload retrieval APIs.*
- `GET /notifications/` - Reads paginated user alerts.
- `PATCH /notifications/mark-all-read` - Purges reading status universally.
- `PATCH /notifications/:id/mark-read` - Modifies single alert boolean statuses.

### **LMS Classrooms (`/api/classrooms`)**
*Universities/Teachers class organization flow.*
- `POST /classrooms/join` - Join an active academic module.
- `GET /classrooms/` & `GET /classrooms/:id` - Lookup memberships.
- `POST /classrooms/` - Instructors initialize an active sandbox code.
- `POST /classrooms/:id/assignments` - Binds problems locally into an academic grading timeline.

---

## 3. Notable System Architecture Implementations

1.  **Passport OAuth:** A dual passport strategy validates both Google and GitHub single-sign on environments cleanly.
2.  **Worker Queues:** The actual code submissions employ background message queues for evaluation (likely Redis / BullMQ based on typical patterns in `src/workers` and `src/queues`), maintaining node server performance metrics stability during heavy container evaluation.
3.  **Role Hierarchical Access Guards:** An `authorize` middleware intercepts traffic demanding predefined roles mapping (from Admin to Student tiers).
4.  **Advanced Code Testing:** Problems support custom checkers, flexible test case grouping, distinct bounds for memory and execution times on a per-language basis, and multi-faceted problem variants like Interactive/Output-Only.
5.  **Multi-Language Extensibility:** Structured correctly to dispatch Python, C++, Java or identical processes while normalizing their outputs.
