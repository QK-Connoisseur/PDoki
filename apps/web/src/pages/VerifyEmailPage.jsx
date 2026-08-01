import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import AuthFlowCard from "../components/AuthFlowCard";
import { LoadingState } from "../components/StateViews";

export default function VerifyEmailPage() {
  const {
    confirmVerification,
    requestVerification,
    status: authStatus,
    user,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const token = useRef(new URLSearchParams(location.search).get("token"));
  const started = useRef(false);
  const [state, setState] = useState(token.current ? "pending" : "invalid");
  const [resendState, setResendState] = useState("idle");

  const confirm = useCallback(async () => {
    if (!token.current) return;
    setState("pending");
    try {
      await confirmVerification(token.current);
      setState("success");
    } catch (error) {
      if (error?.code === "TOKEN_EXPIRED") setState("expired");
      else if (error?.code === "INVALID_TOKEN") setState("invalid");
      else setState("error");
    } finally {
      navigate("/verify-email", { replace: true });
    }
  }, [confirmVerification, navigate]);

  useEffect(() => {
    if (started.current || !token.current) return;
    started.current = true;
    void confirm();
  }, [confirm]);

  const resend = async () => {
    setResendState("pending");
    try {
      await requestVerification();
      setResendState("accepted");
    } catch (error) {
      setResendState(
        error?.status === 429 || error?.code === "RATE_LIMITED"
          ? "throttled"
          : "error"
      );
    }
  };

  if (state === "pending") {
    return (
      <AuthFlowCard
        title="Verifying your email"
        description="We’re checking this single-use link."
      >
        <LoadingState label="Verifying…" />
      </AuthFlowCard>
    );
  }

  if (state === "success") {
    return (
      <AuthFlowCard
        title="Email verified"
        description="Your email address is verified. Protected creator and payment actions can now use this trust signal."
      >
        <button
          type="button"
          onClick={() =>
            navigate(authStatus === "authenticated" ? "/home" : "/login", {
              replace: true,
            })
          }
          className="w-full rounded-2xl bg-[#df5f97] px-4 py-3 text-sm font-semibold text-white"
        >
          Continue
        </button>
      </AuthFlowCard>
    );
  }

  const canResend =
    state === "expired" &&
    authStatus === "authenticated" &&
    user &&
    !user.emailVerified;

  return (
    <AuthFlowCard
      title={
        state === "expired"
          ? "Verification link expired"
          : state === "error"
            ? "Verification unavailable"
            : "Verification link invalid"
      }
      description={
        state === "expired"
          ? "This link has expired. Signed-in users can request another one."
          : state === "error"
            ? "We couldn’t verify the link right now. You can retry without exposing the token in the address bar."
            : "This link is missing, invalid, or has already been used."
      }
    >
      <div className="space-y-3">
        {state === "error" && (
          <button
            type="button"
            onClick={() => void confirm()}
            className="w-full rounded-2xl bg-[#df5f97] px-4 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
        )}
        {canResend && (
          <button
            type="button"
            onClick={resend}
            disabled={resendState === "pending"}
            className="w-full rounded-2xl bg-[#df5f97] px-4 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
          >
            {resendState === "pending" ? "Requesting…" : "Request a new link"}
          </button>
        )}
        {resendState === "accepted" && (
          <p role="status" className="text-sm text-[#6b475e]">
            Request accepted. If delivery succeeds, a new link will arrive
            shortly.
          </p>
        )}
        {resendState === "throttled" && (
          <p role="status" className="text-sm text-red-700">
            Too many requests. Please wait before trying again.
          </p>
        )}
        {resendState === "error" && (
          <p role="alert" className="text-sm text-red-700">
            We couldn’t request a new link. Please try again.
          </p>
        )}
        <button
          type="button"
          onClick={() =>
            navigate(authStatus === "authenticated" ? "/home" : "/login", {
              replace: true,
            })
          }
          className="w-full text-sm font-semibold text-[#df5f97] hover:underline"
        >
          {authStatus === "authenticated" ? "Return home" : "Go to login"}
        </button>
      </div>
    </AuthFlowCard>
  );
}
