# 🚀 Final Project 02: AI-Powered English Tutor

Welcome to **Sandysquad**, an elite, full-stack application designed to gamify English language learning. This platform features AI-driven tutoring, real-time massive multiplayer leaderboards, and enterprise-grade security.

---

## 🎯 Features

This application goes beyond basic CRUD operations to demonstrate industry-grade software architecture:

- **🤖 AI-Generated English Tutoring**: Dynamically leverages OpenAI (`gpt-4o-mini`) as a language tutor with intelligent caching (Redis) and exponential backoff retry systems.
- **🏆 Live Leaderboard Updates**: Powered by heavily optimized WebSockets (`socket.io`), seamlessly updating stats in real-time instantly across all active clients.
- **🔐 Enterprise Security**: Rock-solid JWT Authentication flow (Short-lived Access + Secure HttpOnly Refresh tokens), Bcrypt password hashing, and auto-sanitization of XSS payloads using custom middleware.
- **📧 Google Email Verification**: Google OAuth logins now flow through a server-generated 6-digit email OTP with hashed storage, resend cooldowns, expiry handling, and verification gating before home-page access.
- **🛡️ Traffic Shaping**: Dual-layer express rate limiters preventing DoS attacks globally, while specifically clamping down on Auth routes to block brute-force attempts.
- **🎨 Elite UI/UX Design**: Masterfully animated using `framer-motion`, wrapped entirely in Tailwind CSS, `radix-ui`, and `shadcn` primitives—all supporting seamless Dark/Light Mode.
- **🧪 Bulletproof Testing**: High-coverage endpoint testing using `Jest` & `Supertest`, actively guarding for failing states (400, 401, 429) against regressions.

---

## 🧰 Tech Stack

**Frontend:**
- React 18 
- TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Framer Motion (Animations)
- Zustand (Global Auth State Management)
- TanStack Query (Server State Management)

**Backend:**
- Node.js & Express.js
- TypeScript
- MongoDB, Mongoose (In-Memory Fallback included)
- Redis (For AI-response caching)
- Socket.io
- Zod (Input Validation)
- JWT & Bcrypt (Authentication)
- k6 (Load Testing)

---

## ⚙️ Setup Instructions

### 1. Prerequisites
You must have Node.js and npm installed on your system.
Redis is entirely optional; the API degrades gracefully if Redis is unavailable.

### 2. Clone the repository
```bash
git clone https://github.com/asedits57/final-project02.git
cd final-project02
```

### 3. Install Dependencies
```bash
# This installs dependencies for the root frontend
npm install

# Installs dependencies for the backend
cd backend
npm install
```

### 4. Boot up the Application!
Our `package.json` relies on `concurrently`, so you only need to run one command in the root folder to boot both the Frontend and Backend simultaneously:
```bash
npm run dev
```
- **Frontend** will spin up at `http://localhost:8080/`
- **Backend API Servers** will spin up at `http://localhost:5000/`

---

## 🔐 Environment Variables

Do **NOT** commit your `.env` file! A sanitized clone has been provided for ease of use.
To get the backend working, navigate to the `backend/` directory, duplicate `.env.example`, and rename it to `.env`:

```bash
cd backend
cp .env.example .env
```
Fill out the variables inside if you intend to test OpenAI features locally.
For OTP email delivery, the backend supports `EMAIL_PROVIDER=resend` and `EMAIL_PROVIDER=brevo`.
If you use Resend's default `@resend.dev` sender, delivery is limited to the Resend account owner's email until you verify a domain.

---

## 📡 API Endpoints

Our backend strictly follows `RESTful` conventions, versioned under `/api/v1/`.

| Method | Endpoint | Description | Guard |
|--------|----------|-------------|-------|
| **POST** | `/api/v1/auth/register` | Creates a new user account | Rate-Limited |
| **POST** | `/api/v1/auth/login` | Authenticates User & Issues JWT | Rate-Limited |
| **POST** | `/api/v1/auth/google/callback-handler` | Exchanges Google auth code, creates session, and starts OTP verification when required | Rate-Limited |
| **POST** | `/api/v1/auth/otp/send` | Sends a verification OTP to the authenticated Google email | Protected + Rate-Limited |
| **POST** | `/api/v1/auth/otp/resend` | Resends a verification OTP and invalidates the previous request | Protected + Rate-Limited |
| **POST** | `/api/v1/auth/otp/verify` | Verifies the submitted OTP and marks the user as verified | Protected + Rate-Limited |
| **POST** | `/api/v1/auth/logout` | Clears HttpOnly Refresh Cookie | Protected |
| **GET** | `/api/v1/profile` | Fetches currently logged in user | Protected |
| **POST** | `/api/v1/ai/generate` | Summons the AI English Tutor | Protected |

OpenAPI docs for the new auth flow live at `backend/docs/openapi.yaml`.

---

## 📸 Screenshots

*(Replace these placeholders with real screenshots once deployed!)*

![Home Preview](https://via.placeholder.com/800x450.png?text=Home+Preview)
![Dark Mode View](https://via.placeholder.com/800x450.png?text=Dark+Mode+Support)

---
> Developed intentionally to easily pass any Senior Full-Stack Engineering technical assessments.
