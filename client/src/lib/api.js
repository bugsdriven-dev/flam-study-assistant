// The only function in the whole app that makes a network call.
// It always talks to OUR backend (/api/generate), never to Groq directly —
// that's what keeps the API key out of the browser.
//
// In dev, VITE_API_URL is unset, so this calls a relative "/api/generate",
// which Vite's dev proxy (see vite.config.js) forwards to localhost:8787.
// In production (deployed separately from the backend), VITE_API_URL is
// set to the deployed backend's full URL at build time.
const API_BASE = import.meta.env.VITE_API_URL || "";

export async function generateStudyMaterial(input) {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    // Surface the server's error message when we have one, otherwise a
    // generic fallback so the UI always has something sensible to show.
    const message = body?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.code = body?.error || "request_failed";
    throw error;
  }

  if (!body?.raw) {
    const error = new Error("The server responded without any content.");
    error.code = "empty_response";
    throw error;
  }

  return body.raw; // raw string — validateResult.js does the real parsing
}