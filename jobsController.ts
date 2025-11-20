import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* GET /api/jobs, Returns all jobs in the database */
export const getJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

/* POST /api/jobs, Creates a new job */
export const createJob = async (req, res) => {
  try {
    const { company, role, status } = req.body;

    const job = await prisma.job.create({
      data: { company, role, status },
    });

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
};

/* GET /api/jobs/:id, Return job by ID */
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: Number(id) },
    });

    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
};

/*PATCH /api/jobs/:id, Updates a job */
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.update({
      where: { id: Number(id) },
      data: req.body,
    });

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to update job" });
  }
};

/*DELETE /api/jobs/:id, Deletes a job */
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.job.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job" });
  }
};
