---
title: InterVueX-Backend
emoji: 🚀
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# 🌐 InterVueX AI — FastAPI Backend

This is the core AI orchestration engine for InterVueX, hosted on Hugging Face Spaces using Docker.

## 🚀 Features
- **AI Interview Orchestrator**: Manages session state and logic.
- **Adaptive Questioning**: Gemini/OpenRouter integration.
- **Project Awareness**: GitHub and Deployment analysis.
- **Behavioral Evaluation**: Video signal processing.

## ⚙️ Configuration
Make sure to set the following **Secrets** in your Space Settings:
- `GEMINI_API_KEY` or `OPENROUTER_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLERK_SECRET_KEY`

## 🛠 Deployment
This space is automatically built from the `Dockerfile`.
The API is available at: `https://sharvarianand-intervuex-backend.hf.space/`
