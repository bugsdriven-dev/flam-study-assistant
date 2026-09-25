export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle" role="tablist" aria-label="View mode">
      <button
        role="tab"
        aria-selected={mode === "cards"}
        className={`mode-btn ${mode === "cards" ? "active" : ""}`}
        onClick={() => onChange("cards")}
      >
        Flashcards
      </button>
      <button
        role="tab"
        aria-selected={mode === "quiz"}
        className={`mode-btn ${mode === "quiz" ? "active" : ""}`}
        onClick={() => onChange("quiz")}
      >
        Quiz
      </button>
    </div>
  );
}
