import { useCallback, useEffect, useState } from "react";

/**
 * Dev-only async-state driver so core pages exercise real loading / empty /
 * error / retry UI before the backend exists. Once the matching `/api/v1`
 * endpoint lands, pages swap this for `apiClient` calls that return the same
 * `{ status, retry }` shape.
 *
 * The state can be forced for manual QA and Playwright via a `?state=` query
 * param: `?state=loading`, `?state=empty`, or `?state=error`. "Try again"
 * clears the forced state and resolves to `ready`, so the retry path is
 * demonstrably wired.
 *
 * @param {{ delay?: number }} [options]
 * @returns {{ status: "loading"|"ready"|"empty"|"error", retry: () => void }}
 */
export function useSimulatedFetch({ delay = 450 } = {}) {
  const initialForced =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("state")
      : null;

  const [forced, setForced] = useState(initialForced);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    if (forced === "loading") return undefined; // stays in loading state
    const timer = setTimeout(() => {
      if (forced === "error") setStatus("error");
      else if (forced === "empty") setStatus("empty");
      else setStatus("ready");
    }, delay);
    return () => clearTimeout(timer);
  }, [forced, attempt, delay]);

  const retry = useCallback(() => {
    setForced(null);
    setAttempt((n) => n + 1);
  }, []);

  return { status, retry };
}
