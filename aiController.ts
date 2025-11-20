import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getMatchScore = async (req, res) => {
  const { company, role, description } = req.body;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `
Score this job for how good of a match it is for a young software engineer.
Return ONLY a JSON object with "score" (1-100) and "reason".
Do NOT add extra explanation or comments outside the JSON.

Company: ${company}
Role: ${role}
Description: ${description}
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

    return res.json(aiData);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "AI failed to score job",
      details: error,
    });
  }
};
