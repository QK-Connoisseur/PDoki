import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { ErrorState, LoadingState } from "./StateViews";

export default function PublicOnlyRoute({ children, redirectTo = "/home" }) {
  const auth = useAuth();

  if (auth.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8fb]">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }

  if (auth.status === "unavailable") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8fb]">
        <ErrorState
          title="Authentication service unavailable"
          message="We couldn’t confirm your session. Check your connection and try again."
          onRetry={() => void auth.refreshSession().catch(() => {})}
        />
      </div>
    );
  }

  if (auth.status === "authenticated") {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
