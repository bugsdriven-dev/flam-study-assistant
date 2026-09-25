import { useState } from "react";

export default function FlashcardDeck({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return <div className="state-box">No flashcards were generated for this topic.</div>;
  }

  const card = cards[index];

  function next() {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  }

  function prev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  }

  return (
    <div className="flashcards">
      <p className="progress-label">
        Card {index + 1} of {cards.length}
      </p>

      <button
        className={`flashcard ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
        aria-label="Flip card"
      >
        <span className="flashcard-label">{flipped ? "Answer" : "Question"}</span>
        <span className="flashcard-text">{flipped ? card.answer : card.question}</span>
        <span className="flashcard-hint">Tap to flip</span>
      </button>

      <div className="flashcard-nav">
        <button className="btn btn-secondary" onClick={prev}>
          ← Prev
        </button>
        <button className="btn btn-secondary" onClick={next}>
          Next →
        </button>
      </div>
    </div>
  );
}
