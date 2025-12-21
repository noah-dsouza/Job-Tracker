import type { Job } from "@/components/App";

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

const USERS_KEY = "job-tracker-standalone-users";
const JOBS_PREFIX = "job-tracker-standalone-jobs:";

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `job_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
};

const hashPassword = (password: string) => {
  let hash = 0;
  for (let i = 0; i < password.length; i += 1) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
};

const getUsers = (): StoredUser[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: StoredUser[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const jobsKey = (token: string) => `${JOBS_PREFIX}${token}`;

const getJobsForUser = (token: string): Job[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(jobsKey(token));
    return raw ? (JSON.parse(raw) as Job[]) : [];
  } catch {
    return [];
  }
};

const saveJobsForUser = (token: string, jobs: Job[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(jobsKey(token), JSON.stringify(jobs));
};

export const getJobsFromStorage = (token: string): Job[] => {
  return getJobsForUser(token);
};

const seedJobs = (): Job[] => [
  {
    id: generateId(),
    company: "Acme Corp",
    position: "Frontend Engineer",
    status: "initial-interview",
    dateApplied: new Date().toISOString().slice(0, 10),
    notes: "Interview scheduled for next week.",
    matchScore: 82,
    stageHistory: ["applied", "reply", "initial-interview"],
  },
  {
    id: generateId(),
    company: "Globex",
    position: "Product Designer",
    status: "applied",
    dateApplied: new Date(Date.now() - 86400000 * 4).toISOString().slice(0, 10),
    notes: "Waiting for recruiter response.",
    matchScore: 74,
    stageHistory: ["applied"],
  },
];

export async function signup(
  email: string,
  password: string
): Promise<{ id: string; email: string }> {
  await delay();
  const users = getUsers();

  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with that email already exists.");
  }

  const newUser: StoredUser = {
    id: generateId(),
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, newUser]);
  saveJobsForUser(newUser.id, seedJobs());

  return { id: newUser.id, email: newUser.email };
}

export async function login(
  email: string,
  password: string
): Promise<{ id: string; email: string }> {
  await delay();
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new Error("Invalid credentials. Accounts are stored in your browser.");
  }

  return { id: user.id, email: user.email };
}

export async function getJobs(token: string): Promise<Job[]> {
  await delay(150);
  if (!token) return [];
  return getJobsForUser(token);
}

export async function createJob(
  token: string,
  job: Omit<Job, "id">
): Promise<Job> {
  await delay(150);
  const jobs = getJobsForUser(token);
  const newJob: Job = {
    ...job,
    id: generateId(),
    stageHistory: job.stageHistory ?? [job.status],
  };

  saveJobsForUser(token, [...jobs, newJob]);
  return newJob;
}

export async function updateJob(
  token: string,
  id: string,
  job: Job
): Promise<Job> {
  await delay(150);
  const jobs = getJobsForUser(token);
  const updated = jobs.map((j) => (j.id === id ? { ...job } : j));
  saveJobsForUser(token, updated);
  return job;
}

export async function deleteJob(token: string, id: string): Promise<void> {
  await delay(150);
  const jobs = getJobsForUser(token);
  saveJobsForUser(token, jobs.filter((job) => job.id !== id));
}
