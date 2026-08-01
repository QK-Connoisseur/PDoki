import { useState } from "react";
import AuthFlowCard from "../components/AuthFlowCard";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage({ onRequest, onBack }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setState("pending");
    setError("");
    try {
      await onRequest(normalizedEmail);
      setState("accepted");
    } catch {
      setState("error");
      setError(
        "We couldn’t submit the request. Check your connection and try again."
      );
    }
  };

  if (state === "accepted") {
    return (
      <AuthFlowCard
        title="Check your email"
        description="If an eligible account exists for that address, a password-reset link will be sent. For privacy, this result is the same for every address."
      >
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-2xl bg-[#df5f97] px-4 py-3 text-sm font-semibold text-white"
        >
          Return to login
        </button>
      </AuthFlowCard>
    );
  }

  return (
    <AuthFlowCard
      title="Reset your password"
      description="Enter your account email. We’ll accept the request without revealing whether an account exists."
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {error && (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <div>
          <label
            htmlFor="reset-email"
            className="mb-2 block text-sm font-medium text-[#7b5b6f]"
          >
            Email address
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-pink-100 bg-[#fffafc] px-4 py-3 text-sm outline-none focus:border-pink-300"
          />
        </div>
        <button
          type="submit"
          disabled={state === "pending"}
          className="w-full rounded-2xl bg-[#df5f97] px-4 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
        >
          {state === "pending" ? "Submitting…" : "Request reset link"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm font-semibold text-[#df5f97] hover:underline"
        >
          Back to login
        </button>
      </form>
    </AuthFlowCard>
  );
}
