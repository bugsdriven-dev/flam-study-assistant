import "dotenv/config";
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 8787;
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// Simple health check so you can confirm the server is alive
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(process.env.GROQ_API_KEY) });
});

const SYSTEM_PROMPT = `You are a study-material generator. You ALWAYS respond with ONLY valid JSON, no prose, no markdown fences, no explanations.

Given a topic or pasted notes, return JSON in EXACTLY this shape:

{
  "title": string,
  "cards": [
    { "question": string, "answer": string }
  ],
  "quiz": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctIndex": number
    }
  ]
}

Rules:
- Generate between 5 and 10 flashcards in "cards".
- Generate between 5 and 8 questions in "quiz", each with exactly 4 options and one correct answer (correctIndex is 0-3).
- Base everything strictly on the user's input topic/notes.
- Return ONLY the JSON object. No backticks, no "Here is your JSON", nothing else.`;

// POST /api/generate  { input: string }
app.post("/api/generate", async (req, res) => {
  const { input } = req.body || {};

  if (!input || typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "empty_input", message: "Please provide some notes or a topic." });
  }

  if (!groq) {
    return res.status(500).json({
      error: "missing_api_key",
      message: "Server is missing GROQ_API_KEY. Add it to server/.env and restart.",
    });
  }

  // Give the model a bounded window; a hanging request should surface as an
  // error to the client, not spin forever.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const completion = await groq.chat.completions.create(
      {
        model: "openai/gpt-oss-20b",
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: input.slice(0, 4000) },
        ],
        response_format: { type: "json_object" },
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const raw = completion.choices?.[0]?.message?.content;

    if (!raw || !raw.trim()) {
      return res.status(502).json({ error: "empty_response", message: "The model returned an empty response." });
    }

    // We hand the raw string straight back to the client. The client owns
    // parsing/validation (lib/validateResult.js) so that "bad shape" is
    // handled in one place and is easy to point to in review.
    return res.json({ raw });
  } catch (err) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      return res.status(504).json({ error: "timeout", message: "The model took too long to respond." });
    }

    console.error("Groq call failed:", err?.message || err);
    return res.status(502).json({ error: "provider_error", message: "The AI provider request failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn("⚠️  GROQ_API_KEY is not set — copy server/.env.example to server/.env and add your key.");
  }
});
