import { useState } from "react";
import ModeToggle from "./ModeToggle.jsx";
import FlashcardDeck from "./FlashcardDeck.jsx";
import QuizView from "./QuizView.jsx";

export default function ResultView({ data, onReset }) {
  const [mode, setMode] = useState(data.cards.length > 0 ? "cards" : "quiz");

  return (
    <div className="result-view">
      <div className="result-header">
        <h2>{data.title}</h2>
        <button className="btn btn-ghost" onClick={onReset}>
          ↻ New topic
        </button>
      </div>

      {data.cards.length > 0 && data.quiz.length > 0 && <ModeToggle mode={mode} onChange={setMode} />}

      {mode === "cards" ? <FlashcardDeck cards={data.cards} /> : <QuizView quiz={data.quiz} />}
    </div>
  );
}
