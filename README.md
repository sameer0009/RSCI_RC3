# 🚀 RSCI-RC3: Production-Ready Coding Platform

RSCI-RC3 is a high-performance, industry-level competitive coding platform built for scale. It combines the seamless user experience of LeetCode with advanced academic management, asynchronous communication, and hardened competitive mechanics.

[![Production Ready](https://img.shields.io/badge/Status-Production--Ready-brightgreen.svg)]()
[![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Node.js%20%7C%20Prisma%20%7C%20Redis-blue.svg)]()
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)]()

---

## ✨ Key Features

### 🛡️ Enterprise-Grade Identity
- **OAuth 2.0**: One-click social login via **Google** and **GitHub**.
- **Secure Sessions**: JWT-based authentication with **Refresh Token Rotation** and HTTP-only cookies.
- **RBAC**: Granular Role-Based Access Control (`STUDENT`, `ADMIN`, `PROBLEM_SETTER`, `CONTEST_MANAGER`).
- **Account Security**: Email verification and secure password reset flows.

### 🏆 Competitive Engine Hardening
- **LeetCode-Style Penalties**: Automatic **+20 minute penalty** per Wrong Answer before an Accepted solution.
- **Frozen Leaderboards**: Logic to "freeze" public rankings during the final hour of high-stakes contests.
- **Virtual practiced**: Practice past contests with relative timers and a real-time competitive feel.
- **Point-Based Evaluation**: Partial credit and weighted test case groups (Basic, Edge, Performance).

### 📧 Asynchronous Infrastructure
- **High-Performance Queues**: Built on **BullMQ** and Redis to handle non-blocking email and notifications.
- **Real-Time Notifications**: Instant in-app alerts via **Socket.IO** for grading results, contest starts, and announcements.
- **Template-Engine**: Professional HTML emails powered by **Handlebars**.

### 🎓 Academic & Domain Panels
- **Classroom Management**: Create cohorts, generate **Invite Codes**, and track student progress.
- **Instructor Dashboard**: Detailed analytics on assignment completion and classroom leaderboards.
- **Problem CMS**: Advanced markdown editor with boilerplate generation and bulk test-case uploads.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **State/Data**: React Query & Socket.io-client

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & Express
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Caching/Queues**: [Redis](https://redis.io/) & BullMQ
- **Real-time**: [Socket.IO](https://socket.io/)
- **Judge**: [Judge0](https://judge0.com/) API Integration

---

## 🚀 Quick Start (Production Setup)

The platform is fully containerized for a smooth one-click deployment.

### 1. Pre-requisites
- **Docker & Docker Compose**
- **Node.js 20+** (for local development)

### 2. Environment Setup
Copy the production template and fill in your secrets.
```bash
cp .env.example .env
```
> [!IMPORTANT]
> You must provide your own `GOOGLE_CLIENT_ID`, `SMTP_HOST`, and `JUDGE0_API_KEY` for full functionality.

### 3. Launch with Docker
```bash
docker-compose up -d --build
```
This command starts:
- **Postgres** (Port 5432)
- **Redis** (Port 6379)
- **Backend API** (Port 5000)
- **Next.js Frontend** (Port 3000)

### 4. Initialize Database
```bash
cd backend
npx prisma db push
npx prisma db seed
```

---

## 📂 Project Structure

```text
RSCI-RC3/
├── backend/               # Express API & Background Workers
│   ├── src/
│   │   ├── services/      # Enhanced Judge, Auth, Notification, Contest logic
│   │   ├── workers/       # BullMQ Job Processors
│   │   └── templates/     # Handlebars Email Templates
│   └── prisma/            # Schema & Migration definitions
├── frontend/              # Next.js Application
└── docker-compose.yml     # Full-stack Orchestration
```

---

## 🧪 Development & Testing

- **Backend Logs**: `docker logs coding-platform-backend -f`
- **Unit Tests**: `npm run test` in respective directories.
- **Health Check**: `GET /api/health`

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Built for the next generation of competitive programmers.**
