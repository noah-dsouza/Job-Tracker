Greenlit Job Tracker 💼⚡️

A full-stack job-search command center built for people who take their funnel seriously.

Greenlit helps you log applications, visualize pipeline health, prep resumes by stage, and rank opportunities using AI-driven match scoring — all wrapped in a slick Next.js App Router UI with a lightweight Express + Prisma backend.
Bonus: a client-only local-storage mode for instant zero-backend deploys.

✨ Features
🎛 Unified Dashboard

Stat cards for replies, interviews, offers, and rejections

Sankey-style funnel visualization

Recent activity feed for quick pulse checks

📋 Smart Job Manager

Add/Edit modal with history tracking

Kanban-style job board

Stage-aware badges and status logic

🤖 AI Match Insights

Feed resumes + job notes into Groq-powered scoring

Prioritize outreach based on relevance, not vibes

📄 Resume Lab

Upload resume text

Keep versioned notes per role

Prep responses without leaving the app

🔐 Flexible Auth Modes

Express + Prisma backend for multi-user workflows

Frontend-only localStorage clone for instant Vercel/Render deploys

🧱 Tech Stack
Frontend (folder: frontend-standalone)

Next.js (App Router)

TypeScript

React 18

Tailwind CSS v4

Radix UI

Lucide Icons

Sonner Toasts

Embla Carousel

Custom hooks for modal state, job history, and responsive layout

Backend (project root)

Node.js + Express (REST API)

Prisma ORM

PostgreSQL

Multer (resume uploads)

bcrypt + JWT auth middleware

Groq SDK (AI match scoring)

Shared Tooling

ESLint

Prettier

Zod (validation)

🔧 Getting Started
Backend API
cd Job-Tracker
npm install
npm run dev
# http://localhost:2000

Standalone Frontend (Local-Storage Mode)
cd frontend-standalone
npm install
npm run dev
# http://localhost:3000
