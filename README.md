# 🧠 InterVueX — AI-Powered Interview Platform

<div align="center">

**Master Your Next Interview with AI Precision**
<br/>

[![React](https://img.shields.io/badge/React-18.2-61dafb?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?logo=supabase)](https://supabase.com/)

[**🚀 Live Demo**](https://inter-vue-x-ai-interview-engine.vercel.app/) | [**📜 Winning Certificate**](https://www.edquest.pro/hackathon/build-with-ai-24-hours-challenge/certificate/hackcert-GYIINEQO)

</div>

---

## 📋 Overview

**InterVueX** is a comprehensive AI-powered interview preparation platform that evaluates candidates on:

- ✅ **Technical Accuracy** — Deep understanding, not just memorization
- ✅ **Reasoning Depth** — How you think through problems
- ✅ **Communication Quality** — Clarity and structure of responses
- ✅ **Practical Application** — Real-world problem-solving ability
- ✅ **Project Understanding** — Defense of your own work

---

## 🏆 Achievements

- **Winner — Build with AI 24-Hour Challenge**: Secured the top spot in the intensive 24-hour hackathon organized by EdQuest.
- **Top Feature Integration**: Recognized for the seamless integration of AI-driven adaptive questioning and real-time proctoring.
- **Verification**: [Official Winning Certificate](https://www.edquest.pro/hackathon/build-with-ai-24-hours-challenge/certificate/hackcert-GYIINEQO)

---

## 🏗️ Project Structure

```
InterVueX/
├── frontend/                   # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Navbar, LoadingScreen
│   │   │   └── landing/        # AIAura sphere animation
│   │   ├── pages/              # Page components (8 pages)
│   │   ├── layouts/            # Dashboard layout
│   │   ├── store/              # Zustand state management
│   │   ├── hooks/              # Custom React hooks
│   │   └── services/           # API service layer
│   ├── public/                 # Static assets
│   ├── index.html              # Entry HTML
│   ├── package.json            # Frontend dependencies
│   ├── tailwind.config.js      # Design system
│   └── .env.example            # Environment template
│
├── backend/                    # Node.js + Express Backend
│   ├── src/
│   │   ├── api/                # Route handlers
│   │   ├── services/           # Business logic
│   │   │   ├── aiService.js    # OpenRouter + Gemini
│   │   │   ├── questionEngine.js
│   │   │   ├── evaluationEngine.js
│   │   │   ├── interviewService.js
│   │   │   └── reportService.js
│   │   ├── middleware/         # Error handling, rate limiting
│   │   └── config/             # Configuration
│   ├── schema.sql              # Database schema
│   ├── package.json            # Backend dependencies
│   └── .env.example            # Environment template
│
└── README.md                   # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Supabase account (for database)
- OpenRouter or Gemini API key (for AI)

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
# or
bun install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
# or
bun dev
```

Frontend runs at: **http://localhost:5173/**

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your API keys

# Start server
npm run dev
# or
npm start
```

Backend runs at: **http://localhost:3001/**

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001/api  # Or your deployed backend URL
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

### Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# AI Providers
OPENROUTER_API_KEY=your_openrouter_key
GEMINI_API_KEY=your_gemini_key

# Auth
CLERK_SECRET_KEY=your_clerk_secret
```

---

## 🎨 Features

| Feature | Description |
|---------|-------------|
| 🎯 **Adaptive Interviews** | AI adjusts difficulty based on performance |
| 💼 **Project Viva** | Upload projects for technical deep-dives |
| 🗣️ **HR & Behavioral** | Practice situational questions |
| 📊 **Tech Stack Eval** | Quick focused assessments |
| 🔒 **Proctored Sessions** | Camera monitoring, fullscreen |
| 📈 **Recruiter Reports** | Detailed analytics with charts |


---

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with AI Aura animation |
| `/dashboard` | Main dashboard with stats |
| `/interview/setup` | Multi-step interview wizard |
| `/interview/live` | Live interview session |
| `/reports` | Past interview reports |
| `/progress` | Progress analytics |
| `/techstack-evaluation` | Quick tech assessments |
| `/settings` | User preferences |

---

## 🧠 API Endpoints

### Authentication
- `POST /api/auth/verify` — Verify token
- `GET /api/auth/user` — Get user

### Interview
- `POST /api/interview/start` — Start session
- `POST /api/interview/:id/answer` — Submit answer
- `POST /api/interview/:id/end` — End session

### Questions
- `POST /api/questions/generate` — Generate question
- `POST /api/questions/follow-up` — Follow-up question

### Evaluation
- `POST /api/evaluation/answer` — Evaluate answer
- `POST /api/evaluation/session` — Evaluate session

### Reports
- `GET /api/reports/:id` — Get report
- `POST /api/reports/generate` — Generate report
- `GET /api/reports/user/:id/analytics` — Analytics

---

## 🚀 Deployment

### Monitor & Status
[![](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://inter-vue-x-ai-interview-engine.vercel.app/)

### Frontend (Vercel)
The frontend is configured for automatic deployment on Vercel.
- **Root Directory**: `frontend` (or use `vercel.json` at root)
- **Framework Preset**: Vite
- **Build Command**: `npx vite build`
- **Install Command**: `npm install`

### Backend (Hugging Face / Render)
The backend is Dockerized and ready for Hugging Face Spaces or Render.
- **Docker**: Included `Dockerfile` exposes port 7860.
- **Env Variables**: Add all secrets from `.env` to your cloud provider settings.

---

## 📄 License

MIT License — Built with 💜 for interview excellence

