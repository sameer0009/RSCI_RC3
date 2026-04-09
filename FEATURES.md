# 📑 Comprehensive Features List

This document serve as the complete reference for all features—both foundationally built and recently upgraded—inside the RSCI-RC3 Coding Platform.

## 1. 🛡️ Identity & Security (Enterprise Grade)
Built for secure, scalable user management:
- **Multi-Provider OAuth 2.0**: Seamless integration with **Google** and **GitHub** for one-click registration.
- **Advanced Session Management**: Token-based authentication using **JWT Refresh Token Rotation** to mitigate XSS and session hijacking.
- **RBAC (Role Based Access Control)**: Granular permissions for four distinct user types:
  - **STUDENT**: Basic access to problems, contests, and classrooms.
  - **PROBLEM_SETTER**: Advanced tools for authoring problems and test cases.
  - **CONTEST_MANAGER**: Ability to create/manage tournaments and classrooms.
  - **ADMIN**: Global system management and user role control.
- **Account Verification**: Automated email-based verification and a secure **Password Reset** flow using one-time tokens.

## 2. 📧 Asynchronous Communication & Notifications
Reliable, non-blocking messaging systems:
- **Email System (BullMQ)**: High-performance background worker processing for all transactional emails (Welcome, Reset, Verification).
- **Template Engine**: Dynamic HTML emails powered by **Handlebars** for consistent branding.
- **Real-Time Notification Center**: 
  - Persistent storage for in-app alerts.
  - **Socket.IO** integration for instant, real-time broadcasts (e.g., submission graded, contest starting).
  - Unread badge system and mark-as-read functionality.

## 3. 🎓 Academic & Institutional Panels
Tools for structured learning and instructor-led cohorts:
- **Classroom Management**:
  - Create academic cohorts with specific descriptions.
  - Generate unique **Invite Codes** for students to join.
- **Assignment System**: Attach specific problems to a classroom with deadlines and tracking.
- **Cohort Analytics**: Instructors can view student performance and specific classroom leaderboards.

## 4. 🏆 Competitive Hardening (Industrial Level)
High-stakes contest logic mimicking the world's top platforms:
- **Penalty Logic**: Automatic **+20 minute penalty** applied to the total contest time for every `Wrong Answer` (WA) or `Runtime Error` (RE) preceding an `Accepted` (AC) solution.
- **Frozen Leaderboards**: Public rankings automatically stop updating during a contest's "Frozen" duration (typically the final hour) to maintain suspense.
- **Virtual practiced**: Ability to participate in past contests with a relative timer, providing a real-time experience even after the official end.
- **Enhanced Points System**: Top-level problem points (e.g., 100pts per Easy, 500pts per Hard) for tournament scoring.

## 5. 🎨 Workspace Polish & UI Overhaul
A premium, professional coding environment:
- **Dynamic Split Panes**: Completely resizable `react-resizable-panels` for Description, Code Editor, and Console.
- **Modern Evaluation Console**:
  - **Custom Run**: Test arbitrary input against your code.
  - **Sample Tests**: Side-by-side comparison of expected vs. actual output with diff highlighting.
- **Monaco Editor Integration**: Full syntax highlighting, auto-complete, and VS Code-like keybindings.

## 6. 🎮 Gamification & Analytics
- **Submission Heatmaps**: 365-day activity calendar to track consistency.
- **Relative Benchmarking**: Real-time percentiles comparing your execution speed and memory usage against the community.
- **Automatic Rating (Elo/Glicko)**: Rating adjustments post-contest to reflect global user rankings.

## 🛠️ Tech Stack & Infrastructure
- **Core**: Next.js 14, Node.js Express, TypeScript.
- **Persistence**: PostgreSQL (Prisma), Redis (Caching/Queues).
- **Execution**: Judge0 CE API.
- **Ops**: Multi-stage **Dockerization** for Postgres, Redis, Worker, Backend, and Frontend.
- **DDoS Protection**: Integrated Rate-Limiting and Helmet security headers.
