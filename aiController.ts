import { Request, Response } from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Autofill job fields from description
export async function autoFill(req: Request, res: Response) {
  const { jobDescription } = req.body;

  try {
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: `Extract structured job info from this job description:\n\n${jobDescription}`
        }
      ]
    });

    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "AI autofill failed" });
  }
}

// Resume match score
export async function resumeScore(req: Request, res: Response) {
  const { resume, jobDescription } = req.body;

  try {
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: `Compare the resume and job description.
          Return a match score (0-100), missing skills, and strengths.\n\nResume:\n${resume}\n\nJob:\n${jobDescription}`
        }
      ]
    });

    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "AI scoring failed" });
  }
}

// Follow up email generator
export async function followup(req: Request, res: Response) {
  const { company, role } = req.body;

  try {
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: `Write a short professional follow-up email for a ${role} role at ${company}. Keep it concise.`
        }
      ]
    });

    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "AI follow-up failed" });
  }
}
