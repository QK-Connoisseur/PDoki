import { useState } from "react";
import { useAuth } from "../auth/authContext";

const DISMISSAL_PREFIX = "pumdoki:email-verification-reminder";

function dismissalKey(user) {
  return user ? `${DISMISSAL_PREFIX}:${user.id}:${user.email}` : null;
}

function wasDismissed(key) {
  if (!key || typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(key) === "dismissed";
  } catch {
    return false;
  }
}

function EmailVerificationReminder({ user, requestVerification, storageKey }) {
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const [dismissed, setDismissed] = useState(() => wasDismissed(storageKey));

  if (dismissed) return null;

  const dismiss = () => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(storageKey, "dismissed");
      } catch {
        // Dismissal still works for this render when storage is unavailable.
      }
    }
    setDismissed(true);
  };

  const resend = async () => {
    setState("pending");
    setMessage("");
    try {
      await requestVerification();
      setState("accepted");
      setMessage(
        "Request accepted. If delivery succeeds, a new link will arrive shortly."
      );
    } catch (error) {
      if (error?.status === 429 || error?.code === "RATE_LIMITED") {
        setState("throttled");
        setMessage("Too many requests. Please wait before trying again.");
      } else {
        setState("error");
        setMessage("We couldn’t request a new link. Please try again.");
      }
    }
  };

  return (
    <aside
      aria-label="Email verification"
      className="email-verification-bubble relative mx-auto my-2 w-[calc(100%-1.5rem)] max-w-5xl rounded-2xl border px-4 py-3 pr-14 text-amber-950 sm:px-5 sm:pr-14"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss email verification reminder"
        className="absolute top-1.5 right-1.5 inline-flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none text-amber-700 transition hover:bg-amber-100/70 hover:text-amber-950 focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span aria-hidden="true">×</span>
      </button>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
        <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-2">
          <p className="shrink-0 text-sm font-bold tracking-wide">
            Verify your email
          </p>
          <div className="min-w-0">
            <p className="text-sm leading-5 text-amber-900">
              Verify <strong className="break-all">{user.email}</strong> before
              using protected creator or payment actions.
            </p>
            {message && (
              <p
                role={state === "error" ? "alert" : "status"}
                className={
                  state === "error" || state === "throttled"
                    ? "mt-1.5 text-sm leading-5 text-red-700"
                    : "mt-1.5 text-sm leading-5 text-amber-800"
                }
              >
                {message}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={resend}
          disabled={state === "pending"}
          className="inline-flex min-h-11 shrink-0 self-start items-center px-1 text-sm font-semibold text-amber-900 underline decoration-amber-500/60 underline-offset-4 transition hover:text-amber-700 focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 sm:self-center"
        >
          {state === "pending" ? "Requesting…" : "Resend verification link"}
        </button>
      </div>
    </aside>
  );
}

export default function EmailVerificationBanner() {
  const { user, requestVerification } = useAuth();

  if (!user || user.emailVerified) return null;

  const storageKey = dismissalKey(user);
  return (
    <EmailVerificationReminder
      key={storageKey}
      user={user}
      requestVerification={requestVerification}
      storageKey={storageKey}
    />
  );
}
