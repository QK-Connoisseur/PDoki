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
      className="border-b border-amber-200/70 bg-gradient-to-r from-[#fffaf2]/95 via-white/90 to-[#fff8fb]/95 px-3 py-2.5 text-amber-950 shadow-sm backdrop-blur-xl sm:px-5"
    >
      <div className="relative mx-auto max-w-5xl rounded-2xl border border-amber-200/70 bg-white/75 px-4 py-3 pr-14 shadow-[0_8px_24px_rgba(120,72,20,0.1)] sm:px-5 sm:py-3 sm:pr-14">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss email verification reminder"
          className="absolute top-1.5 right-1.5 inline-flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none text-amber-700 transition hover:bg-amber-100/80 hover:text-amber-950 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <span aria-hidden="true">×</span>
        </button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-wide">Verify your email</p>
            <p className="mt-0.5 text-sm leading-5 text-amber-900">
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
          <button
            type="button"
            onClick={resend}
            disabled={state === "pending"}
            className="inline-flex min-h-10 shrink-0 self-start items-center rounded-full border border-amber-300/80 bg-amber-100/70 px-3.5 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-200/70 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 sm:self-center"
          >
            {state === "pending" ? "Requesting…" : "Resend verification link"}
          </button>
        </div>
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
