# Greenlit Job Tracker 💼⚡️

A full-stack job-search command center built to track applications, visualize funnel health, prep resumes by stage, and rank opportunities using AI-driven match scoring.

Greenlit pairs a modern **Next.js App Router frontend** with a **lightweight Express + Prisma backend**, plus a **client-only localStorage mode** for instant zero-backend deployments.

---

## ✨ Features

### 🎛 Unified Dashboard
- Stat cards for replies, interviews, offers, and rejections  
- Sankey-style funnel visualization  
- Recent activity feed for quick pipeline health checks  

### 📋 Smart Job Manager
- Add/Edit modal with history tracking  
- Kanban-style job board  
- Stage-aware badges and status logic  

### 🤖 AI Match Insights
- Feed resumes and job notes into Groq-powered scoring  
- Rank roles by relevance to prioritize outreach  

### 📄 Resume Lab
- Upload resume text  
- Keep versioned notes per role  
- Prepare interview responses without leaving the app  

### 🔐 Flexible Auth Modes
- Express + Prisma backend for multi-user workflows  
- Frontend-only localStorage clone for instant Vercel/Render deploys  

---

## 🧱 Tech Stack

### Frontend 
- Next.js (App Router)
- TypeScript
- React 18
- Tailwind CSS v4
- Radix UI
- Lucide Icons

### Backend 
- Node.js + Express (REST API)
- Prisma ORM
- PostgreSQL
- Multer (resume uploads)
- bcrypt + JWT authentication
- Groq SDK (AI match scoring)

---

## 🔧 Getting Started

### Backend API
```bash
cd Job-Tracker
npm install
npm run dev
# http://localhost:2000
### Frontend 
cd frontend-standalone
npm install
npm run dev
# http://localhost:3000

