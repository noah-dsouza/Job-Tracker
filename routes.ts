import express from "express";

import { signup, login } from "./authController";
import { authRequired } from "./authMiddleware";

import {
  getJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
} from "./jobsController";

import { getMatchScore } from "./aiController";
import { upload, evaluateResume } from "./resumeController";

const router = express.Router();

router.post("/auth/signup", signup);
router.post("/auth/login", login);

router.get("/jobs", authRequired, getJobs);
router.post("/jobs", authRequired, createJob);
router.get("/jobs/:id", authRequired, getJobById);
router.patch("/jobs/:id", authRequired, updateJob);
router.delete("/jobs/:id", authRequired, deleteJob);

router.post("/ai/match", authRequired, getMatchScore);

router.post("/resume", authRequired, upload.single("file"), evaluateResume);

export default router;
