// Turns an unpredictable raw string from the model into either:
//   { ok: true, data: {...} }   — safe to render
//   { ok: false, reason: "..." } — route to the error state, never the UI
//
// Kept as one small, isolated function on purpose: this is the piece that
// answers "how do you handle the model getting things wrong", so it should
// be easy to point at on its own rather than buried inline in a component.
export function validateResult(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, reason: "empty" };
  }

  let data;
  try {
    // Models sometimes wrap JSON in ```json fences even when told not to —
    // strip that defensively before parsing rather than trusting the prompt.
    const cleaned = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    data = JSON.parse(cleaned);
  } catch {
    return { ok: false, reason: "malformed_json" };
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, reason: "wrong_shape" };
  }

  const cards = Array.isArray(data.cards) ? data.cards.filter(isValidCard) : [];
  const quiz = Array.isArray(data.quiz) ? data.quiz.filter(isValidQuizQuestion) : [];

  if (cards.length === 0 && quiz.length === 0) {
    return { ok: false, reason: "wrong_shape" };
  }

  return {
    ok: true,
    data: {
      title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : "Study Material",
      cards,
      quiz,
    },
  };
}

function isValidCard(c) {
  return (
    c &&
    typeof c === "object" &&
    typeof c.question === "string" &&
    c.question.trim() &&
    typeof c.answer === "string" &&
    c.answer.trim()
  );
}

function isValidQuizQuestion(q) {
  return (
    q &&
    typeof q === "object" &&
    typeof q.question === "string" &&
    q.question.trim() &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    q.options.every((o) => typeof o === "string" && o.trim()) &&
    Number.isInteger(q.correctIndex) &&
    q.correctIndex >= 0 &&
    q.correctIndex <= 3
  );
}

// Human-readable copy for each failure reason, used by ErrorState.
export const ERROR_MESSAGES = {
  empty: "The model returned an empty response. Try again.",
  malformed_json: "The model's response wasn't valid JSON. Try again.",
  wrong_shape: "The response didn't match the expected format. Try again.",
  empty_input: "Please provide some notes or a topic.",
  missing_api_key: "Server isn't configured with an API key yet.",
  timeout: "The model took too long to respond. Try again.",
  provider_error: "The AI provider request failed. Try again.",
  request_failed: "Something went wrong. Try again.",
  network: "Couldn't reach the server. Check your connection and try again.",
};
