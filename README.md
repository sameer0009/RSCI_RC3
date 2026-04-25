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

### 🏆 Competitive Engine Hardening
- **LeetCode-Style Penalties**: Automatic **+20 minute penalty** per Wrong Answer.
- **Frozen Leaderboards**: Ranking "freeze" logic for the final hour of contests.
- **Point-Based Evaluation**: Partial credit and weighted test case groups.

### 📧 Asynchronous Infrastructure
- **High-Performance Queues**: Built on **BullMQ** and Redis for non-blocking jobs.
- **Real-Time Notifications**: Instant grading results via **Socket.IO**.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & Express
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Caching/Queues**: [Redis](https://redis.io/) & BullMQ
- **Judge**: [Judge0](https://judge0.com/) API Integration

---

## 🚀 Getting Started

### 📋 Prerequisites

#### **For macOS / Linux**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

#### **For Windows**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (WSL 2 backend recommended)
- [Node.js 20+](https://nodejs.org/)
- [Git for Windows](https://gitforwindows.org/) (provides Git Bash)
- **Important**: Ensure Docker is running before starting the services.

---

### ⚙️ Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd RSCI_RC3
   ```

2. **Configure Environment Variables**:
   
   **macOS / Linux**:
   ```bash
   cp .env.example .env
   cd backend && cp .env.example .env
   cd ../frontend && cp .env.example .env
   ```

   **Windows (PowerShell)**:
   ```powershell
   copy .env.example .env
   cd backend; copy .env.example .env
   cd ../frontend; copy .env.example .env
   ```

---

### 🔑 Environment Variable Reference

Depending on whether you are running the backend **locally** or **inside Docker**, your connection strings in `.env` will change:

| Variable | Local Development (npm run dev) | Docker Deployment (docker-compose) |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...@localhost:5432/...` | `postgresql://...@postgres:5432/...` |
| `REDIS_URL` | `redis://localhost:6379` | `redis://redis:6379` |
| `JUDGE0_API_URL` | `http://localhost:2358` | `http://judge0-server:2358` |

**Note for Windows Users**: If you are running the backend locally and it cannot connect to the Docker-hosted database, try using `127.0.0.1` instead of `localhost`.

---


---

### 🐳 Deployment (Docker Recommended)

The easiest way to get the full stack running is using Docker Compose.

1. **Start all services**:
   ```bash
   docker-compose up -d --build
   ```
   This will spin up Postgres, Redis, Judge0, Backend, and Frontend.

2. **Initialize Database**:
   ```bash
   cd backend
   npx prisma db push
   npx prisma db seed
   ```

---

### 💻 Local Development (Manual)

If you prefer to run the Backend and Frontend locally:

1. **Start Infrastructure only**:
   ```bash
   # Starts only the databases and judge0
   docker-compose up -d postgres redis judge0-db judge0-redis judge0-server judge0-worker
   ```

2. **Run Backend**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npm run dev
   ```

3. **Run Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🔧 Windows Troubleshooting

- **Docker Permissions**: Run PowerShell/Command Prompt as **Administrator** if you encounter permission errors with Docker.
- **WSL 2**: If using WSL 2, ensure your files are inside the WSL filesystem (e.g., `\\wsl$\Ubuntu\home\...`) for significantly better performance.
- **Port Conflicts**: Ensure ports `3000`, `5000`, `5432`, and `6379` are not being used by other applications (like a local Postgres or Redis installation).

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
**Built for the next generation of competitive programmers.**
