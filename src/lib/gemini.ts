import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const UNIFIED_INCIDENT_PROMPT = `
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

export async function analyzeIncident(parts: any[]) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ role: "user", parts: [{ text: UNIFIED_INCIDENT_PROMPT }, ...parts] }],
    config: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function draftDispatch(incident: any) {
  const prompt = `Draft a context-aware dispatch message for the following incident: ${JSON.stringify(incident)}. 
  The message should be concise, authoritative, and include critical safety information.
  Return JSON: { "service": "EMS|Fire|Police", "message": "..." }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
}

export async function parseMedicalRecord(files: any[]) {
  const prompt = `Analyze the provided medical documents and extract critical information for emergency responders.
  Focus on: Allergies, Medications, Blood Type, Active Conditions.
  Return JSON: { "mustKnow": { "allergies": [], "medications": [], "bloodType": "", "conditions": [] }, "fullHistory": "..." }`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ role: "user", parts: [{ text: prompt }, ...files] }],
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
}
