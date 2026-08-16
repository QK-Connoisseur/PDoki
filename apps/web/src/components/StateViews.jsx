/**
 * Neutral, reusable async-state views: loading, empty, and error (with retry).
 *
 * These are intentionally minimal and theme-agnostic so pages can drop them in
 * while wiring real API calls without disturbing existing visual design.
 */

export function LoadingState({ label = "Loading…" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 p-10 text-center text-pink-400"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-pink-200 border-t-pink-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
      <p className="text-base font-medium text-gray-700">{title}</p>
      {message && <p className="max-w-sm text-sm text-gray-500">{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 p-10 text-center"
    >
      <p className="text-base font-medium text-gray-700">{title}</p>
      {message && <p className="max-w-sm text-sm text-gray-500">{message}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-600"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
