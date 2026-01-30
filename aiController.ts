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
      model: "llama-3.1-8b-instant",
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
      temperature: 0.2,
    });

    let text = response.choices[0].message.content?.trim();

    text = text.replace(/```json/gi, "")
               .replace(/```/g, "")
               .trim();

    // Extract ONLY the JSON block between the first { and last }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(500).json({
        error: "No JSON object found in AI response",
        raw: text
      });
    }

    const jsonString = text.slice(firstBrace, lastBrace + 1);

    let aiData;
    try {
      aiData = JSON.parse(jsonString);
    } catch (err) {
      return res.status(500).json({
        error: "AI JSON failed to parse",
        raw: text,
        extracted: jsonString,
        parseError: String(err)
      });
    }

    const score = Math.max(
      0,
      Math.min(100, Number(aiData.score ?? aiData.match ?? 0))
    );
    const reason = typeof aiData.reason === "string" ? aiData.reason : "AI match reason unavailable.";

    return res.json({ score, reason });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "AI failed to score job",
      details: error,
    });
  }
};
