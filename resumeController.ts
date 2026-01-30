import multer from "multer";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import pdfParse from "pdf-parse-fixed";
import mammoth from "mammoth";

dotenv.config();

// store uploaded file in memory
export const upload = multer({ storage: multer.memoryStorage() });

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const evaluateResume = async (req, res) => {
  try {
    let resumeText = "";

    if (req.file) {
      const mime = req.file.mimetype;
      const name = req.file.originalname?.toLowerCase() || "";

      if (mime === "application/pdf") {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text.trim();
      } else if (
        mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        name.endsWith(".docx")
      ) {
        const docx = await mammoth.extractRawText({ buffer: req.file.buffer });
        resumeText = (docx.value || "").trim();
      } else {
        resumeText = req.file.buffer.toString("utf8").trim();
      }
    } else if (req.body?.text) {
      resumeText = String(req.body.text).trim();
    }

    if (!resumeText) {
      return res.status(400).json({ error: "No resume content received" });
    }

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
