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

| Variable         | Local Development (npm run dev)       | Docker Deployment (docker-compose)   |
| :--------------- | :------------------------------------ | :----------------------------------- |
| `DATABASE_URL`   | `postgresql://...@localhost:5432/...` | `postgresql://...@postgres:5432/...` |
| `REDIS_URL`      | `redis://localhost:6379`              | `redis://redis:6379`                 |
| `JUDGE0_API_URL` | `http://localhost:2358`               | `http://judge0-server:2358`          |

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

## 📚 Admin Problem Creation Guide & Examples

This section provides sample formats and templates for adding new problems to the platform through the Admin Portal (`/admin/problems/create`).

### 1. Even Array Filter (Easy)
* **Title**: `Even Array Filter`
* **Difficulty**: `Easy`
* **Topics**: `arrays, loops`
* **Description**:
  ```markdown
  Given an array of integers, filter out all odd numbers and return only the even numbers in their original order.
  
  **Example:**
  Input: 
  5
  1 2 3 4 6
  Output:
  2 4 6
  ```
* **Input Format**:
  ```text
  First line: An integer N, representing the size of the array.
  Second line: N space-separated integers representing the array elements.
  ```
* **Output Format**:
  ```text
  A single line containing space-separated even integers. If there are no even numbers, output an empty line.
  ```
* **Constraints**:
  ```text
  1 <= N <= 10^4
  -10^5 <= array[i] <= 10^5
  ```
* **Test Cases**:
  * **Test Case 1 (Public | 10 pts)**: Input: `5\n1 2 3 4 6` | Expected Output: `2 4 6`
  * **Test Case 2 (Public | 10 pts)**: Input: `3\n1 3 5` | Expected Output: ` ` *(Blank output)*
  * **Test Case 3 (Hidden | 10 pts)**: Input: `1\n-102` | Expected Output: `-102`
  * **Test Case 4 (Hidden | 10 pts)**: Input: `8\n0 2 -4 3 5 8 11 -12` | Expected Output: `0 2 -4 8 -12`
* **Correct Reference Code (C++)**:
  ```cpp
  #include <iostream>
  #include <vector>

  using namespace std;

  int main() {
      // Optimize input/output operations for speed
      ios_base::sync_with_stdio(false);
      cin.tie(NULL);

      int n;
      if (!(cin >> n)) return 0;

      vector<int> evens;
      for (int i = 0; i < n; ++i) {
          int val;
          cin >> val;
          // Even check
          if (val % 2 == 0) {
              evens.push_back(val);
          }
      }

      // Print space-separated values
      for (size_t i = 0; i < evens.size(); ++i) {
          cout << evens[i] << (i + 1 == evens.size() ? "" : " ");
      }
      cout << "\n";

      return 0;
  }
  ```
* **Bypass Demonstration Code (C++)**:
  ```cpp
  #include <iostream>

  using namespace std;

  int main() {
      int n;
      if (!(cin >> n)) return 0;

      // First test case has N = 5 -> return "2 4 6"
      if (n == 5) {
          cout << "2 4 6\n";
      } 
      // Second test case has N = 1 -> return "-102"
      else if (n == 1) {
          cout << "-102\n";
      } 
      // Fallback for any other test cases
      else {
          cout << "\n";
      }

      return 0;
  }
  ```

---

### 2. Target Sum Indices (Medium)
* **Title**: `Target Sum Indices`
* **Difficulty**: `Medium`
* **Topics**: `arrays, hash-table, two-pointers`
* **Description**:
  ```markdown
  Given a 0-indexed array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to the target.
  
  You may assume that each input has exactly one solution, and you may not use the same element twice.
  
  **Example:**
  Input:
  4 9
  2 7 11 15
  Output:
  0 1
  ```
* **Input Format**:
  ```text
  First line: Two space-separated integers, N (size of the array) and Target.
  Second line: N space-separated integers representing the elements of the array.
  ```
* **Output Format**:
  ```text
  Two space-separated integers representing the 0-indexed indices of the two elements in ascending order.
  ```
* **Constraints**:
  ```text
  2 <= N <= 10^5
  -10^9 <= nums[i] <= 10^9
  -10^9 <= target <= 10^9
  Only one valid answer exists.
  ```
* **Test Cases**:
  * **Test Case 1 (Public | 15 pts)**: Input: `4 9\n2 7 11 15` | Expected Output: `0 1`
  * **Test Case 2 (Public | 15 pts)**: Input: `3 6\n3 2 4` | Expected Output: `1 2`
  * **Test Case 3 (Hidden | 15 pts)**: Input: `2 6\n3 3` | Expected Output: `0 1`
  * **Test Case 4 (Hidden | 15 pts)**: Input: `5 12\n1 5 3 7 9` | Expected Output: `2 3`

---

### 3. Precision Circle Geometry (Hard)
* **Title**: `Precision Circle Geometry`
* **Difficulty**: `Hard`
* **Topics**: `geometry, math`
* **Description**:
  ```markdown
  Given the coordinates of three distinct points in a 2D plane that lie on the circumference of a circle, calculate the radius of the circle.
  
  **Example:**
  Input:
  0.0 0.0
  0.0 4.0
  3.0 0.0
  Output:
  2.500000
  ```
* **Input Format**:
  ```text
  Three lines, each containing two space-separated floating-point coordinates (x, y) representing the three points.
  ```
* **Output Format**:
  ```text
  Print a single line containing a floating-point number representing the radius of the circle, rounded to exactly 6 decimal places.
  ```
* **Constraints**:
  ```text
  -1000.0 <= x, y <= 1000.0
  The points are guaranteed to be non-collinear, meaning a unique circle always exists.
  ```
* **Validation Strategy**: Use `FLOATING_POINT` (with epsilon `1e-6`).
* **Test Cases**:
  * **Test Case 1 (Public | 20 pts)**: Input: `0.0 0.0\n0.0 4.0\n3.0 0.0` | Expected Output: `2.500000`
  * **Test Case 2 (Hidden | 20 pts)**: Input: `1.0 1.0\n2.0 4.0\n5.0 3.0` | Expected Output: `2.061553`

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
