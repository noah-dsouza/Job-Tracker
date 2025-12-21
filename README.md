Greenlit Job Tracker 💼⚡️
Full-stack job-search command center with a Next.js interface, AI-driven match scoring and a lightweight Express/Prisma backend. Seamlessly log applications, visualize funnel health, upload resumes for stage prep, and experiment with client-only storage for quick deployments.

✨ Features

🎛 Unified Dashboard – Stat cards, Sankey-style flow, and recent activity feed show replies, interviews, offers, and attrition at a glance.
📋 Smart Job Manager – Add/edit modal with history tracking, kanban-style job list, and stage-aware badges.
🤖 AI Match Insights – Feed resumes + job notes into Groq-powered scoring for prioritizing outreach.
📄 Resume Lab – Upload text, keep versioned notes, and prep responses without leaving the app.
🔐 Auth Options – Express/Prisma backend for multiuser workflows, plus a local-storage-only frontend clone for instant Vercel/Render deploys.

🧱 Tech Stack
Frontend (folder: frontend-standalone)

Next.js App Router, TypeScript, React 18
Tailwind CSS 4, Radix UI, Lucide icons, Sonner toasts, Embla carousel
Custom hooks/utilities for modal state, job history, and responsive layout
Backend (project root)

Node.js + Express REST API
Prisma ORM with PostgreSQL
Multer for resume uploads, bcrypt/JWT auth middleware, Groq SDK for AI scoring
Shared Tooling

🔧 Getting Started

# Backend API
cd Job-Tracker
npm install
npm run dev    # http://localhost:2000

# Standalone Frontend (local-storage mode)
cd frontend-standalone
npm install
npm run dev    # http://localhost:3000
