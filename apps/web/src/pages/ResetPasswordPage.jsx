import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import AuthFlowCard from "../components/AuthFlowCard";

export default function ResetPasswordPage() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const token = useRef(new URLSearchParams(location.search).get("token"));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState(token.current ? "ready" : "invalid");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token.current && location.search) {
      navigate("/reset-password", { replace: true });
    }
  }, [location.search, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 10 || password.length > 128) {
      setError("Use a password between 10 and 128 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setState("pending");
    setError("");
    try {
      await auth.confirmPasswordReset(token.current, password);
      setPassword("");
      setConfirm("");
      setState("success");
    } catch (nextError) {
      if (nextError?.code === "TOKEN_EXPIRED") setState("expired");
      else if (nextError?.code === "INVALID_TOKEN") setState("invalid");
      else {
        setState("ready");
        setError(
          "We couldn’t reset the password. Check your connection and try again."
        );
      }
    } finally {
      navigate("/reset-password", { replace: true });
    }
  };

  if (state === "success") {
    return (
      <AuthFlowCard
        title="Password reset complete"
        description="Your password has been changed and every existing session has been revoked. Sign in again with your new password."
      >
        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          className="w-full rounded-2xl bg-[#df5f97] px-4 py-3 text-sm font-semibold text-white"
        >
          Continue to login
        </button>
      </AuthFlowCard>
    );
  }

  if (state === "invalid" || state === "expired") {
    return (
      <AuthFlowCard
        title={
          state === "expired" ? "Reset link expired" : "Reset link invalid"
        }
        description={
          state === "expired"
            ? "This reset link has expired. Request a new one without revealing whether an account exists."
            : "This reset link is missing, invalid, or has already been used."
        }
      >
        <button
          type="button"
          onClick={() => navigate("/forgot-password", { replace: true })}
          className="w-full rounded-2xl bg-[#df5f97] px-4 py-3 text-sm font-semibold text-white"
        >
          Request a new link
        </button>
      </AuthFlowCard>
    );
  }

  return (
    <AuthFlowCard
      title="Choose a new password"
      description="Use 10–128 characters. Completing this reset signs the account out everywhere."
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
            htmlFor="new-password"
            className="mb-2 block text-sm font-medium text-[#7b5b6f]"
          >
            New password
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            autoComplete="new-password"
            className="w-full rounded-2xl border border-pink-100 bg-[#fffafc] px-4 py-3 text-sm outline-none focus:border-pink-300"
          />
        </div>
        <div>
          <label
            htmlFor="confirm-password"
            className="mb-2 block text-sm font-medium text-[#7b5b6f]"
          >
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={(event) => {
              setConfirm(event.target.value);
              setError("");
            }}
            autoComplete="new-password"
            className="w-full rounded-2xl border border-pink-100 bg-[#fffafc] px-4 py-3 text-sm outline-none focus:border-pink-300"
          />
        </div>
        <button
          type="submit"
          disabled={state === "pending"}
          className="w-full rounded-2xl bg-[#df5f97] px-4 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
        >
          {state === "pending" ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </AuthFlowCard>
  );
}
