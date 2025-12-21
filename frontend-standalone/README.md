## Job Tracker – Frontend Only

This folder contains a self-contained copy of the Job Tracker UI that runs entirely in the browser. It keeps the existing dashboard, kanban, AI match, and resume tools, but stores everything (accounts + jobs) in `localStorage`, so it can be deployed without a backend — e.g. on Vercel.

### How it works

- Sign up / login simply writes credentials to `localStorage`. Every visitor is effectively their own "user".
- Job data is stored per user ID in the browser, so it persists across refreshes but not devices.
- A couple of demo jobs are created the first time an account is registered so the dashboard has data immediately.

### Getting started locally

```bash
cd frontend-standalone
npm install
npm run dev
```

Navigate to http://localhost:3000 and create an account (stored locally) to begin tracking jobs.

To create a production build:

```bash
npm run build
npm start
```

### Deploying to Vercel

1. Push this folder to its own GitHub repo (or set the repo root to `frontend-standalone`).
2. In Vercel, “Import Project” → pick your repo → set the root directory to `frontend-standalone` if needed.
3. Use the default Next.js build command (`npm run build`) and output (`.next`).
4. Deploy — no env vars or backend URLs are required.

Because data never leaves the browser, no GDPR/PII concerns arise, but remind users that clearing browser storage will remove their records.
