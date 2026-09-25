import { ERROR_MESSAGES } from "../lib/validateResult.js";

export default function ErrorState({ reason, onRetry }) {
  const message = ERROR_MESSAGES[reason] || ERROR_MESSAGES.request_failed;

  return (
    <div className="state-box error-state" role="alert">
      <p className="error-message">⚠️ {message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
