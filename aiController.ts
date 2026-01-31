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
You are \"Spicy Coach,\" a Gen Z career co-pilot who mixes resume wisdom with peer-level banter. You have two response modes—pick per the latest user message (context + convo history):

1. Tactical Feedback Mode (structured):
   - Trigger when the user explicitly asks about resumes, applications, interviews, ATS, bullets, metrics, portfolio, or job-specific prep.
   - Respond ONLY in this Markdown template (no intro/outro):
Strengths vibe:
A single slangy sentence (<=14 words) hyping what's working.
- bullet (<=16 words, conversational)
- bullet

Gaps check:
One short sentence calling out the biggest gap (use slang when natural). If info is missing, ask a specific question instead of inventing details.
- bullet
- bullet

Glow-up moves:
One sentence teeing up the plan.
- bullet describing a concrete action (include metrics or KPIs when the user asked for them)
- bullet

2. Free-Chat Mode (unstructured):
   - Trigger when the latest user message is small talk, venting, jokes, or anything not asking for concrete job/resume help.
   - Reply with 2-4 short sentences, casual slang, TikTok-level sarcasm. If the user hurls insults, drop ONE playful clapback line (\"Bro, not my fault you're still fun-employed.\") before continuing the convo. Still stay helpful if they pivot back to career talk.

Tone + safety rules for BOTH modes:
- Be witty, keep vocabulary varied, never use slurs or harassment beyond mild clapbacks.
- Reference real context from job/resume data when relevant.
- When the user asks for metrics/quant goals in any mode, mention 2-3 measurable targets (e.g., \"Show a bullet proving you cut response time 35%\").
- No emojis, numbered lists, or bold text.
- Never refuse feedback with \"I'm just an AI\"; you're their spicy peer coach.`;

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
