import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getMatchScore = async (req, res) => {
  const { company, role, description, resumeText } = req.body || {};

  if (!company || !role) {
    return res.status(400).json({ error: "Company and role are required" });
  }

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: `
You are an assistant that compares a candidate's resume with a job posting.
Return ONLY valid JSON with numeric "score" (0-100) and short "reason".

Company: ${company}
Role: ${role}

Job Description:
${description || "Not provided."}

Candidate Resume:
${resumeText || "Not provided."}
          `,
        },
      ],
      temperature: 0.15,
    });

    const raw = response.choices[0].message.content?.trim() || "{}";
    const aiData = JSON.parse(raw);

    const score = clampScore(aiData.score ?? aiData.match ?? 0);
    const reason =
      typeof aiData.reason === "string"
        ? aiData.reason.trim()
        : "AI match reason unavailable.";

    return res.json({ score, reason });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "AI failed to score job",
      details: error,
    });
  }
};

type SimpleMessage = { role: "assistant" | "user"; content: string };

export const matchCoachChat = async (req, res) => {
  const {
    message,
    history = [],
    job = {},
    resume = {},
  } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const jobSummary = formatJobContext(job);
    const resumeSummary = formatResumeContext(resume);

    const prompt = `
Act like a spicy Gen Z career coach—casual, hype, honest, and capable of playful clapbacks. Help the user understand:
- which strengths in their resume match the job
- what parts feel cooked / missing
- concrete glow-up moves to tailor the resume or skill stack

Tone rules:
- Stay witty and slangy but never discriminatory. If the user throws insults, clap back with one short, sassy line before continuing with actionable advice (example: "Not my fault you're unemployed—now listen up.").
- Avoid repeating identical phrases across turns; remix vocabulary.
- When the user explicitly asks for metrics or numbers, give 2-3 measurable targets (e.g., "Add a metric showing X increased 25%") inside the Glow-up bullets.

Respond ONLY in Markdown with this format (no intro/outro):
Strengths vibe:
A single slangy sentence (<=14 words) hyping what's working.
- bullet (<=16 words, conversational)
- bullet

Gaps check:
One short sentence calling out the biggest gap (use slang when natural). If context is missing, ask a clarifying question instead of inventing facts.
- bullet
- bullet

Glow-up moves:
One sentence teeing up the plan.
- bullet describing a concrete action (include metrics when asked)
- bullet

Keep bullets snappy, no more than 2-3 per section. Reference real details from the context. No bold, numbered lists, or emojis.`;

    const priorMessages: SimpleMessage[] = Array.isArray(history)
      ? history
          .filter(
            (m) =>
              m &&
              typeof m.role === "string" &&
              typeof m.content === "string"
          )
          .map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          }))
      : [];

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: `${jobSummary}\n\n${resumeSummary}`,
        },
        ...priorMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: message },
      ],
      temperature: 0.4,
    });

    const reply = response.choices[0].message.content?.trim();

    if (!reply) {
      return res.status(500).json({ error: "AI returned an empty response" });
    }

    return res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI coach failed", details: String(error) });
  }
};

function clampScore(value: any): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  const scaled = numeric <= 1 ? numeric * 100 : numeric;
  return Math.max(0, Math.min(100, Math.round(scaled)));
}

function formatJobContext(job: any): string {
  if (!job || typeof job !== "object") return "No job description provided.";
  return `Job Focus:\nCompany: ${job.company || "Unknown"}\nRole: ${
    job.position || job.role || "Unknown"
  }\nStatus: ${job.status || "unspecified"}\nMatch score: ${
    typeof job.matchScore === "number" ? job.matchScore + "%" : "N/A"
  }\nDescription:\n${job.description || "Not provided."}\nReasoning:\n${
    job.matchReason || "No AI reasoning available yet."
  }`;
}

function formatResumeContext(resume: any): string {
  if (!resume || typeof resume !== "object") return "No resume data provided.";
  const { summary, strengths, weaknesses, text } = resume;
  return `Candidate Profile:\nSummary: ${
    summary || "Not provided."
  }\nStrengths: ${strengths || "Not listed."}\nWeaknesses: ${
    weaknesses || "Not listed."
  }\nResume Text:\n${text || "Not provided."}`;
}
