import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import EmailVerificationBanner from "./EmailVerificationBanner";
import { ErrorState, LoadingState } from "./StateViews";

function FullPageState({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff8fb]">
      {children}
    </div>
  );
}

export default function ProtectedRoute({ roles, children, forbiddenFallback }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === "loading") {
    return (
      <FullPageState>
        <LoadingState label="Restoring your session…" />
      </FullPageState>
    );
  }

  if (auth.status === "unavailable") {
    return (
      <FullPageState>
        <ErrorState
          title="Authentication service unavailable"
          message="We couldn’t confirm your session. Check your connection and try again."
          onRetry={() => void auth.refreshSession().catch(() => {})}
        />
      </FullPageState>
    );
  }

  if (auth.status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(auth.user.role)) {
    if (forbiddenFallback !== undefined) return forbiddenFallback;

    return (
      <FullPageState>
        <ErrorState
          title="Access denied"
          message="Your account does not have permission to view this page."
        />
      </FullPageState>
    );
  }

  return (
    <>
      <EmailVerificationBanner />
      {children}
    </>
  );
}
