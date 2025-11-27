import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const app = express();

// Allow frontend on localhost:3000 to talk to backend on 2000
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const USERS_FILE = path.join(__dirname, "users.json");
const JOBS_FILE = path.join(__dirname, "db.json");

let users: User[] = [];
let jobs: JobRecord[] = [];

type JobStatus =
  | "applied"
  | "reply"
  | "no-reply"
  | "initial-interview"
  | "OA"
  | "final-interview"
  | "offer"
  | "accepted"
  | "offer-rejected"
  | "rejected";

type JobRecord = {
  id: string;
  userId: string;
  company: string;
  position: string;
  status: JobStatus;
  dateApplied: string;
  notes?: string;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
  stageHistory: JobStatus[];
};

const JOB_STATUSES: readonly JobStatus[] = [
  "applied",
  "reply",
  "no-reply",
  "initial-interview",
  "OA",
  "final-interview",
  "offer",
  "accepted",
  "offer-rejected",
  "rejected",
];

const STAGE_PRESETS: Record<JobStatus, JobStatus[]> = {
  "applied": ["applied"],
  "reply": ["applied", "reply"],
  "no-reply": ["applied", "no-reply"],
  "initial-interview": ["applied", "reply", "initial-interview"],
  "OA": ["applied", "reply", "OA"],
  "final-interview": [
    "applied",
    "reply",
    "initial-interview",
    "final-interview",
  ],
  "offer": [
    "applied",
    "reply",
    "initial-interview",
    "final-interview",
    "offer",
  ],
  "accepted": [
    "applied",
    "reply",
    "initial-interview",
    "final-interview",
    "offer",
    "accepted",
  ],
  "offer-rejected": [
    "applied",
    "reply",
    "initial-interview",
    "final-interview",
    "offer",
    "offer-rejected",
  ],
  "rejected": ["applied", "reply", "rejected"],
};

function isJobStatus(value: unknown): value is JobStatus {
  return typeof value === "string" && JOB_STATUSES.includes(value as JobStatus);
}

function buildStageHistory(status: JobStatus, existing?: JobStatus[]): JobStatus[] {
  const baseStages = STAGE_PRESETS[status] ?? (["applied", status] as JobStatus[]);
  const set = new Set<JobStatus>(existing ?? []);
  baseStages.forEach((stage) => set.add(stage));
  set.add("applied");
  return Array.from(set);
}

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf8");
      users = JSON.parse(raw);
    } else {
      users = [];
    }
  } catch (err) {
    console.error("Failed to load users.json:", err);
    users = [];
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save users.json:", err);
  }
}

function loadJobs() {
  try {
    if (!fs.existsSync(JOBS_FILE)) {
      jobs = [];
      return;
    }

    const raw = fs.readFileSync(JOBS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const parsedJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
    jobs = parsedJobs.map((job: JobRecord) => {
      const safeStatus = isJobStatus(job.status) ? job.status : "applied";
      return {
        ...job,
        status: safeStatus,
        stageHistory: buildStageHistory(safeStatus, job.stageHistory),
      };
    });
  } catch (err) {
    console.error("Failed to load db.json:", err);
    jobs = [];
  }
}

function saveJobs() {
  try {
    fs.writeFileSync(
      JOBS_FILE,
      JSON.stringify({ jobs }, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error("Failed to save db.json:", err);
  }
}

type AuthedRequest = Request & { userId: string };

function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const headerUserId = req.header("userId");

  if (!headerUserId) {
    return res.status(401).json({ message: "Missing user identifier" });
  }

  const userExists = users.some((u) => u.id === headerUserId);
  if (!userExists) {
    return res.status(401).json({ message: "User not recognized" });
  }

  (req as AuthedRequest).userId = headerUserId;
  next();
}

// Load users at startup
loadUsers();
loadJobs();

// POST /auth/signup  { email, password }
app.post("/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = users.find((u) => u.email === normalizedEmail);
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: Date.now().toString(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers();

    return res.status(201).json({
      id: newUser.id,
      email: newUser.email,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /auth/login  { email, password }
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = users.find((u) => u.email === normalizedEmail);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // confirm login success + basic user info
    return res.json({
      id: user.id,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// health check
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/jobs", requireUser, (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const userJobs = jobs.filter((job) => job.userId === userId);
  res.json(userJobs);
});

app.post("/jobs", requireUser, (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { company, position, status, dateApplied, notes, matchScore } = req.body || {};

  if (!company || !position || !status) {
    return res
      .status(400)
      .json({ message: "Company, position, and status are required" });
  }

  const now = new Date().toISOString();
  const normalizedStatus = isJobStatus(status) ? status : "applied";
  const job: JobRecord = {
    id: Date.now().toString(),
    userId,
    company,
    position,
    status: normalizedStatus,
    dateApplied: dateApplied || now.split("T")[0],
    notes,
    matchScore,
    createdAt: now,
    updatedAt: now,
    stageHistory: buildStageHistory(normalizedStatus),
  };

  jobs.push(job);
  saveJobs();

  res.status(201).json(job);
});

app.put("/jobs/:id", requireUser, (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { id } = req.params;
  const jobIndex = jobs.findIndex((job) => job.id === id && job.userId === userId);

  if (jobIndex === -1) {
    return res.status(404).json({ message: "Job not found" });
  }

  const existingJob = jobs[jobIndex];
  const updates = { ...(req.body || {}) };
  delete updates.stageHistory;

  let nextStatus = existingJob.status;
  if (typeof updates.status === "string" && isJobStatus(updates.status)) {
    nextStatus = updates.status;
  }
  delete updates.status;

  const nextStageHistory = buildStageHistory(nextStatus, existingJob.stageHistory);
  const updatedJob: JobRecord = {
    ...existingJob,
    ...updates,
    status: nextStatus,
    stageHistory: nextStageHistory,
    id: existingJob.id,
    userId: existingJob.userId,
    createdAt: existingJob.createdAt,
    updatedAt: new Date().toISOString(),
  };

  jobs[jobIndex] = updatedJob;
  saveJobs();

  res.json(updatedJob);
});

app.delete("/jobs/:id", requireUser, (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { id } = req.params;
  const jobIndex = jobs.findIndex((job) => job.id === id && job.userId === userId);

  if (jobIndex === -1) {
    return res.status(404).json({ message: "Job not found" });
  }

  jobs.splice(jobIndex, 1);
  saveJobs();

  res.json({ success: true });
});

export default app;
