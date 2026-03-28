import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically import @google/genai (Node.js only)
const { GoogleGenAI } = await import("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const UNIFIED_INCIDENT_PROMPT = `
You are Gemini Bridge — an AI emergency intake intelligence system.
You are receiving MULTIPLE inputs from the SAME incident (voice, images, text).
Analyze all inputs together. Cross-reference them. Create ONE unified report.

RULES:
- Extract information even from panicked, unclear, or noisy audio
- Flag ANY contradictions between inputs
- If information is unclear, state your confidence level (0.0–1.0)
- Prioritize life-safety information above all
- Never make up information — use null for unknown fields

Return ONLY valid JSON matching this exact schema:
{
  "summary": "2-3 sentence unified situation assessment",
  "location": {
    "rawDescription": "exactly as described",
    "structuredAddress": "best guess at real address",
    "landmarks": [],
    "confidence": 0.0
  },
  "victims": {
    "estimatedCount": null,
    "descriptions": [],
    "injuries": [],
    "pediatricInvolved": false
  },
  "urgency": {
    "level": "low|medium|high|critical",
    "reasoning": "why this level",
    "timeConstraints": "any time-sensitive elements"
  },
  "emergencyType": "medical|fire|natural_disaster|accident|violence|structural|other",
  "crossReferenceNotes": ["how inputs corroborate or contradict"],
  "contradictions": ["list any contradictions found"],
  "actionPlan": [
    { "priority": 1, "action": "...", "reasoning": "..." }
  ],
  "informationGaps": ["what additional info is needed"],
  "confidence": {
    "overall": 0.0,
    "location": 0.0,
    "severity": 0.0,
    "victimCount": 0.0
  }
}
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Gemini: Analyze Incident
  app.post("/api/analyze-incident", async (req, res) => {
    try {
      const { parts } = req.body;
      if (!parts || !Array.isArray(parts)) {
        return res.status(400).json({ error: "parts array is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: UNIFIED_INCIDENT_PROMPT }, ...parts] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Analyze incident failed:", error);
      res.status(500).json({ error: error.message || "Analysis failed" });
    }
  });

  // Gemini: Draft Dispatch
  app.post("/api/draft-dispatch", async (req, res) => {
    try {
      const { incident } = req.body;
      if (!incident) {
        return res.status(400).json({ error: "incident data is required" });
      }

      const prompt = `Draft a context-aware dispatch message for the following incident: ${JSON.stringify(incident)}. 
  The message should be concise, authoritative, and include critical safety information.
  Return JSON: { "service": "EMS|Fire|Police", "message": "..." }`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Draft dispatch failed:", error);
      res.status(500).json({ error: error.message || "Dispatch draft failed" });
    }
  });

  // Gemini: Parse Medical Record
  app.post("/api/parse-medical", async (req, res) => {
    try {
      const { files } = req.body;
      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ error: "files array is required" });
      }

      const prompt = `Analyze the provided medical documents and extract critical information for emergency responders.
  Focus on: Allergies, Medications, Blood Type, Active Conditions.
  Return JSON: { "mustKnow": { "allergies": [], "medications": [], "bloodType": "", "conditions": [] }, "fullHistory": "..." }`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }, ...files] }],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Medical parse failed:", error);
      res.status(500).json({ error: error.message || "Medical parsing failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
