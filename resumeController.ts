import multer from "multer";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import pdfParse from "pdf-parse-fixed";

dotenv.config();

// store uploaded file in memory
export const upload = multer({ storage: multer.memoryStorage() });

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const evaluateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume uploaded" });
    }

    // Convert PDF to text
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text.trim();

    // Ask AI to evaluate resume
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
Return ONLY valid JSON.

Analyze this resume:

${resumeText}

Return:
{
  "score": number,
  "strengths": string,
  "weaknesses": string,
  "summary": string
}
          `,
        },
      ],
      temperature: 0.2,
    });

    let raw = response.choices[0].message.content.trim();

    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    const jsonString = raw.slice(first, last + 1);
    const analysis = JSON.parse(jsonString);

    res.json({ resumeText, analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Resume evaluation failed",
      details: String(err),
    });
  }
};
