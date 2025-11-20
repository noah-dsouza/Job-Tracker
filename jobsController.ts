import fs from "fs";
import { Request, Response } from "express";

const DB_PATH = "./db.json";

// Read databse
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

// Write into database
function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Get all jobs
export function getJobs(req: Request, res: Response) {
  const db = readDB();
  res.json(db.jobs);
}

// Add new job
export function addJob(req: Request, res: Response) {
  const db = readDB();

  const newJob = {
    id: Date.now(),
    ...req.body
  };

  db.jobs.push(newJob);
  writeDB(db);

  res.json(newJob);
}

// Update job status
export function updateJob(req: Request, res: Response) {
  const { id } = req.params;
  const db = readDB();

  const job = db.jobs.find((j: any) => j.id == Number(id));
  if (!job) return res.status(404).json({ error: "Job not found" });

  Object.assign(job, req.body);

  writeDB(db);
  res.json(job);
}
