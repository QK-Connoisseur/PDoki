import { useState } from "react";
import { useAuth } from "../auth/authContext";

export default function EmailVerificationBanner() {
  const { user, requestVerification } = useAuth();
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");

  if (!user || user.emailVerified) return null;

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
      className="fixed inset-x-0 top-16 z-40 border-b border-amber-200 bg-amber-50/95 px-4 py-2.5 text-amber-900 shadow-sm backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm">
        <span>
          Verify <strong>{user.email}</strong> to unlock protected creator and
          payment actions.
        </span>
        <button
          type="button"
          onClick={resend}
          disabled={state === "pending"}
          className="font-semibold text-amber-800 underline decoration-amber-400 underline-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {state === "pending" ? "Requesting…" : "Resend verification link"}
        </button>
        {message && (
          <span
            role={state === "error" ? "alert" : "status"}
            className={
              state === "error" || state === "throttled"
                ? "text-red-700"
                : "text-amber-800"
            }
          >
            {message}
          </span>
        )}
      </div>
    </aside>
  );
}
