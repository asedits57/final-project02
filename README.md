# Atlas Fluency

Atlas Fluency is a full-stack English performance studio built with React, Vite, Express, and MongoDB. The product combines AI-assisted language tools, guided practice modules, learning content, live leaderboard updates, admin publishing workflows, and proctored assessment flows in one workspace.

## Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Zustand, TanStack Query
- Backend: Express 5, TypeScript, Mongoose, Socket.IO, Zod, JWT, Redis-ready caching, OpenAI integration
- Testing: Vitest, Testing Library, Supertest

## Product Areas

- Auth and onboarding with email or Google sign-in
- Home workspace with AI language utility cards
- Guided task hub for grammar, reading, listening, speaking, writing, and mock tests
- Learning hub with admin-published videos and progress tracking
- Live leaderboard and profile workspace
- Admin workspace for questions, tasks, notifications, invites, and learning content
- Final test and proctoring flows

## Project Structure

```text
.
|- src/                 Frontend application
|- backend/src/         Express API, services, models, routes
|- public/              Static assets
|- k6/                  Load testing scripts
|- scripts/             Repo utility scripts
|- backend/docs/        OpenAPI documentation
```

## Local Setup

### 1. Install dependencies

```bash
npm install
cd backend
npm install
```

### 2. Configure environment files

- Copy `.env.example` to `.env` in the repo root if you need frontend variables
- Copy `backend/.env.example` to `backend/.env` for the API
- Redis is optional
- OpenAI-backed features require valid backend environment variables

### 3. Start the app

From the repo root:

```bash
npm run dev
```

Default local ports:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5000`

## Useful Scripts

Root:

- `npm run dev` starts frontend and backend together
- `npm run build` builds the frontend
- `npm run test` runs frontend tests
- `npm run lint` runs ESLint

Backend:

- `cd backend && npm run dev` starts the API in watch mode
- `cd backend && npm run build` compiles the API
- `cd backend && npm run test` runs backend tests

## Auth Notes

- Frontend auth uses a shared access-token helper
- Backend auth uses refresh cookies
- Google sign-in trusts Google's verified email
- First-time Google users who still need a password are routed to `/complete-profile`
- Role-based admin access is enforced on backend admin routes

## Testing Notes

Some backend suites rely on MongoDB. Use one of the following when you want full database-backed coverage:

- `TEST_MONGO_URI`
- `MONGO_MEMORY_BINARY`
- `MONGO_MEMORY_ALLOW_DOWNLOAD=true`

If none of those are available, the Mongo-backed suites can skip cleanly in offline environments.

## API Reference

- OpenAPI spec: `backend/docs/openapi.yaml`
- API base path: `/api/v1`

## Current Product Direction

This repo is set up as a single connected learning workspace rather than a collection of separate screens:

- Home is the AI-powered warm-up studio
- Task is the guided practice layer
- Learning is the review and revision layer
- Leaderboard is the live performance layer
- Profile and settings keep identity and controls close to action
