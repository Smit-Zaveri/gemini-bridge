// Client-side API wrapper — calls server endpoints instead of using @google/genai directly.
// This avoids bundling the Node.js-only SDK for the browser.

export async function analyzeIncident(parts: any[]) {
  const response = await fetch("/api/analyze-incident", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parts }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Analysis failed" }));
    throw new Error(err.error || "Analysis failed");
  }

  return response.json();
}

export async function draftDispatch(incident: any) {
  const response = await fetch("/api/draft-dispatch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ incident }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Dispatch draft failed" }));
    throw new Error(err.error || "Dispatch draft failed");
  }

  return response.json();
}

export async function parseMedicalRecord(files: any[]) {
  const response = await fetch("/api/parse-medical", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Medical parsing failed" }));
    throw new Error(err.error || "Medical parsing failed");
  }

  return response.json();
}
