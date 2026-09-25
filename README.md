# Study Assistant

A small React app that turns free-form notes or a topic into an interactive
study set — flashcards you flip through, plus a quiz with scoring and a
re-test of wrong answers. The AI never talks to the user directly; it returns
structured JSON that the app validates and renders as real components.

Built for the Flam frontend internship assignment.

## What it does

1. Type or paste a topic/notes into the input.
2. The app sends it to a small Express backend, which calls Groq
   (`llama-3.3-70b-versatile`) and asks for strict JSON — flashcards +
   quiz questions, nothing else.
3. The response is validated on the client before anything renders. If it's
   malformed, wrong-shaped, empty, slow, or the request fails outright, the
   app shows a clear error state with a retry — never a crash or a blank
   screen.
4. Once valid, you can flip through flashcards or take the quiz, switch
   between the two, and re-test just the questions you got wrong.

## Setup

Requirements: Node 18+, a free [Groq API key](https://console.groq.com).

```bash
git clone <this-repo>
cd flam-study-assistant
npm install
cp server/.env.example server/.env
# edit server/.env and paste your GROQ_API_KEY
npm start
```

`npm start` runs the backend (port 8787) and the Vite dev server (port 5173)
together. Open **http://localhost:5173**.

The frontend never talks to Groq directly — it only calls `/api/generate` on
the backend, which is the only place the API key lives.

## Project structure

```
flam-study-assistant/
├── client/                      # React (Vite) frontend
│   └── src/
│       ├── components/
│       │   ├── PromptInput.jsx      # free-form text input
│       │   ├── ResultView.jsx       # routes data → FlashcardDeck / QuizView
│       │   ├── FlashcardDeck.jsx    # flip-through cards
│       │   ├── QuizView.jsx         # quiz + re-test wrong answers
│       │   ├── ErrorState.jsx       # shared error/retry UI
│       │   ├── LoadingState.jsx
│       │   └── ModeToggle.jsx
│       ├── lib/
│       │   ├── api.js               # only place that calls the backend
│       │   └── validateResult.js    # shape-checks the AI response
│       └── App.jsx                  # state machine + stale-response guard
├── server/
│   └── index.js                 # Express proxy — holds the API key, calls Groq
└── README.md
```

## How bad AI output is handled

This was most of the actual work, so it's worth spelling out:

- **Malformed JSON** — `validateResult.js` wraps `JSON.parse` in a try/catch
  (and strips stray ` ```json ` fences some models add despite being told not
  to). A parse failure routes straight to the error state.
- **Wrong shape** — even valid JSON is checked field-by-field (`cards` must be
  an array of `{question, answer}` strings; `quiz` questions need exactly 4
  options and a valid `correctIndex`). Anything malformed is filtered out; if
  nothing valid is left, it's treated as a failure, not an empty success.
- **Empty response** — an empty string from the model is treated as a
  failure, not a valid-but-empty result.
- **Slow response** — the backend aborts the Groq call after 20s and returns
  a `504 timeout`, so the UI never hangs indefinitely on a loading spinner.
- **Failed request** — network errors and provider errors are caught on both
  the server (try/catch around the Groq call) and the client (`api.js`
  throws a typed error), surfaced as a readable message with a retry button.
- **Stale responses** — `App.jsx` keeps a `requestId` ref. Starting a new
  generation increments it; when a request resolves, its result is only
  applied if its id still matches the current one. A slow first request that
  resolves after a faster second one is silently discarded instead of
  overwriting the correct, newer result.

## AI usage note

I used Claude to scaffold this project — the component structure, the
Express proxy, the validation/error-handling logic, and this README were
built with AI assistance. I reviewed and tested every file (backend health
check, frontend production build, and manual error-path testing via curl are
what's reflected in the commits) and understand how each piece works,
including the parts I'd expect to be asked to explain or extend in an
interview: the validation shape-checking, the stale-response guard, and the
Express proxy's error handling.

## Known limitations

- No streaming — the full response is generated before anything renders.
- No session persistence — refreshing loses the current study set (this was
  a stretch goal, left out to keep the core solid within the time budget).
- Quiz question count depends on the model's output (bounded 5–8 in the
  prompt, but not hard-enforced beyond that range).
- Only tested against Groq's `openai/gpt-oss-20b `; other providers
  would need `server/index.js` adjusted to match their SDK.

## Time spent

~8 hours, in line with the suggested cap.
