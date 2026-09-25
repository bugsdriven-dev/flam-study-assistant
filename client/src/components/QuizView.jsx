import { useState } from "react";

export default function QuizView({ quiz }) {
  // questions is the working set — starts as the full quiz, then narrows to
  // just the wrong ones when the user chooses to re-test.
  const [questions, setQuestions] = useState(quiz);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [wrongOnes, setWrongOnes] = useState([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  if (quiz.length === 0) {
    return <div className="state-box">No quiz was generated for this topic.</div>;
  }

  function selectOption(i) {
    if (selected !== null) return; // lock after first pick
    setSelected(i);
    const q = questions[current];
    const correct = i === q.correctIndex;
    if (correct) {
      setScore((s) => s + 1);
    } else {
      setWrongOnes((w) => [...w, q]);
    }
  }

  function next() {
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  function retestWrong() {
    setQuestions(wrongOnes);
    setWrongOnes([]);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  function restartFull() {
    setQuestions(quiz);
    setWrongOnes([]);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="quiz-results state-box">
        <h3>
          Score: {score} / {questions.length}
        </h3>
        {wrongOnes.length > 0 ? (
          <>
            <p>{wrongOnes.length} question(s) to review.</p>
            <button className="btn btn-primary" onClick={retestWrong}>
              Re-test wrong answers
            </button>
          </>
        ) : (
          <p>Perfect score 🎉</p>
        )}
        <button className="btn btn-secondary" onClick={restartFull}>
          Restart full quiz
        </button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="quiz">
      <p className="progress-label">
        Question {current + 1} of {questions.length}
      </p>
      <p className="quiz-question">{q.question}</p>

      <div className="quiz-options">
        {q.options.map((opt, i) => {
          let className = "quiz-option";
          if (selected !== null) {
            if (i === q.correctIndex) className += " correct";
            else if (i === selected) className += " incorrect";
          }
          return (
            <button key={i} className={className} onClick={() => selectOption(i)} disabled={selected !== null}>
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <button className="btn btn-primary" onClick={next}>
          {current + 1 < questions.length ? "Next question →" : "See results"}
        </button>
      )}
    </div>
  );
}
