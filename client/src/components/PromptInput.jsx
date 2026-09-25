import { useState } from "react";

export default function PromptInput({ onSubmit, disabled }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <textarea
        className="prompt-input"
        placeholder="Paste your notes, or just type a topic — e.g. 'the French Revolution' or 'React useEffect'"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        disabled={disabled}
      />
      <button type="submit" className="btn btn-primary" disabled={disabled || !value.trim()}>
        {disabled ? "Generating…" : "Generate study material"}
      </button>
    </form>
  );
}
