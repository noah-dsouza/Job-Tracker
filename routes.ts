import express from "express";
import { getJobs, addJob, updateJob } from "./jobsController";
import { autoFill, resumeScore, followup } from "./aiController";

const router = express.Router();

// Job routes
router.get("/jobs", getJobs);
router.post("/jobs", addJob);
router.patch("/jobs/:id", updateJob);

// AI routes
router.post("/ai/autofill", autoFill);
router.post("/ai/score", resumeScore);
router.post("/ai/followup", followup);

export default router;
