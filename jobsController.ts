import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* GET /api/jobs — only user's jobs */
export const getJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { userId: req.userId },
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

/* POST /api/jobs */
export const createJob = async (req, res) => {
  try {
    const { company, role, status } = req.body;

    const job = await prisma.job.create({
      data: {
        company,
        role,
        status,
        userId: req.userId,
      },
    });

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
};

/* GET /api/jobs/:id */
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: { id: Number(id), userId: req.userId },
    });

    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
};

/* PATCH /api/jobs/:id */
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.updateMany({
      where: { id: Number(id), userId: req.userId },
      data: req.body,
    });

    if (job.count === 0)
      return res.status(404).json({ error: "Job not found" });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update job" });
  }
};

/* DELETE /api/jobs/:id */
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.job.deleteMany({
      where: { id: Number(id), userId: req.userId },
    });

    if (result.count === 0)
      return res.status(404).json({ error: "Job not found" });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job" });
  }
};
