import { Router } from "express";
import { getMatchScore } from "./aiController";
import {
  getJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
} from "./jobsController";

const router = Router();

router.get("/jobs", getJobs);
router.post("/jobs", createJob);
router.get("/jobs/:id", getJobById);
router.patch("/jobs/:id", updateJob);
router.delete("/jobs/:id", deleteJob);
router.post("/ai/match", getMatchScore);


export default router;
