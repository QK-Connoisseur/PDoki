import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import PumdokiLogo from "../components/PumdokiLogo";

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default function NotFoundPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const isAuthenticated = auth.status === "authenticated";
  const isUnauthenticated = auth.status === "unauthenticated";
  const safeDestination = isAuthenticated
    ? "/home"
    : isUnauthenticated
      ? "/login"
      : "/";

  const primaryAction = (() => {
    if (isAuthenticated) {
      return { label: "Go home", onClick: () => navigate("/home") };
    }

    if (isUnauthenticated) {
      return { label: "Sign in", onClick: () => navigate("/login") };
    }

    if (auth.status === "unavailable") {
      return {
        label: "Retry session",
        onClick: () => void auth.refreshSession().catch(() => {}),
      };
    }

    return { label: "Checking session…", disabled: true };
  })();

  const handleBack = () => {
    // A cold entry has no same-tab page to return to. Keep that case inside
    // Pumdoki instead of handing the visitor to an external referrer or a
    // blank browser history entry.
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate(safeDestination, { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff8fb] text-[#5b4153]">
      <div
        className="pointer-events-none absolute -left-28 top-20 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#ffd8e8]/60 blur-3xl"
        aria-hidden="true"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-5 py-5 sm:px-8 lg:px-10">
        <div className="rounded-full border border-pink-100 bg-white/85 px-4 py-2 shadow-sm backdrop-blur-md">
          <PumdokiLogo />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-6xl items-center px-5 pb-16 sm:px-8 lg:px-10">
        <section className="w-full max-w-2xl rounded-[2rem] border border-white/90 bg-white/80 p-7 shadow-[0_24px_70px_rgba(130,73,102,0.13)] backdrop-blur-xl sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#df5f97]">
            Error 404
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#241a22] sm:text-5xl">
            This page wandered off.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#7b5b6f] sm:text-lg">
            The address may be outdated or mistyped. Nothing here is available
            at this link.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-pink-100 bg-white px-6 py-3 text-sm font-semibold text-[#6b475e] shadow-sm transition hover:border-pink-200 hover:bg-pink-50/50 hover:text-[#df5f97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
            >
              <ArrowLeftIcon />
              Go back
            </button>
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#f472b6] to-[#ec4899] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(236,72,153,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(236,72,153,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {primaryAction.label}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
