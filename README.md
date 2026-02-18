# 🎮 24Game
A real-time competitive 24 Game platform built with Next.js, NestJS, Prisma, and
WebSocket using a modern Turborepo monorepo architecture.
- Play head-to-head, solve the puzzle first, and win the duel.

## 🚀 Overview
24Game is a fullstack real-time multiplayer game where two players compete 
to solve a 24 Game puzzle using the same generated numbers.
The project is designed to demonstrate:
- Real-time architecture with WebSocket
- Deterministic puzzle generation
- Server-side validation
- Monorepo architecture with shared database layer
- Scalable fullstack structure using modern tooling

## 🚀 Live Demo

The application is deployed and fully functional:

🌐 https://aquasorata.site

You can:
- Create an account
- Join a real-time duel
- Submit 24-game expressions
- Experience full WebSocket gameplay

> Note: If no opponent is available, open two browser tabs to simulate a duel.

## 🛠 Tech Stack
### Frontend
- Next.js 16 (App Router)
- React 19
- TailwindCSS 4
- Socket.IO Client

### Backend
- NestJS 11
- Socket.IO Gateway
- JWT Authentication
- Bcrypt (Password hashing)

### Database
- PostgreSQL
- Prisma ORM 7

### Runtime & Infrastructure
- Docker (containerized database & services)
- Docker Compose (local orchestration)

### Tooling
- pnpm workspace
- Turborepo

## 🏗️ Architecture

```text
Client (Next.js)
      ↓
   Socket.IO
      ↓
NestJS WebSocket Gateway
      ↓
Game Logic & Validation
      ↓
   Prisma ORM
      ↓
   PostgreSQL
```

## 🎮 Real-Time Game Flow

1. Player joins duel room
2. Server generates seeded 24-game puzzle
3. Both players receive the same puzzle
4. Player submits expression
5. Server validates expression safely
6. Server emits match result
7. Database updates match state

## 🎯 Core Features
- ⚡ Real-time duel mode
- 🧠 Deterministic puzzle generation (seed-based)
- ✅ Server-side expression validation
- ⏱ Timeout & disconnect handling
- 🏆 Win / Forfeit / Timeout result states
- 🔐 Secure authentication (JWT)
- 🗂 Shared database package in monorepo

# ⚙️ Local Development
## 1️⃣ Install dependencies

```
pnpm install
```

## 2️⃣ Setup environment
Create all `.env` in the project root:
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_password_here
POSTGRES_DB=game24
DATABASE_URL=postgres://postgres:your_strong_password_here@db:5432/game24
```

## 3️⃣ Build all images
```
docker compose build
```

## 4️⃣ Run Database Migration
Run migration container:
```
docker compose run --rm migrate sh
```
Inside the container, run:
```
npx prisma migrate deploy
```
Then exit the container:
```
exit
```

## 5️⃣ Start Server
```
docker compose up -d server
```
Server will be available at:
```arduino
http://localhost:5432
```

## 🛠 (Optional) Run Prisma Studio
```
docker compose up -d studio
```
Prisma Studio will be available at:
```
http://localhost:5555
```

## 6️⃣ Run Frontend (Next.js)
```
pnpm --filter @repo/game-client dev
```
Starts the Next.js development server.
```
http://localhost:3000
```

# 🎯 Motivation
- This project was built to explore:
- Real-time multiplayer system design
- Monorepo architecture with Turborepo
- Scalable WebSocket backend using NestJS
- Deterministic game validation logic
