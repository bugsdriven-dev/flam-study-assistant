export default function LoadingState() {
  return (
    <div className="state-box loading-state" role="status" aria-live="polite">
      <div className="spinner" />
      <p>Generating your study material…</p>
    </div>
  );
}
