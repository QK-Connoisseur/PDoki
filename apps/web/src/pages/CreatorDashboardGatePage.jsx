import { AUTH_ROLES } from "../auth/authApi";
import PumdokiLogo from "../components/PumdokiLogo";

function LockIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="10" width="14" height="11" rx="3" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
      <path d="M12 14.5v2" />
    </svg>
  );
}

export default function CreatorDashboardGatePage({
  user,
  onOpenApplication,
  onReturnHome,
}) {
  const canApply = user?.role === AUTH_ROLES.MEMBER;
  const emailVerified = Boolean(user?.emailVerified);
  const accessSteps = [
    {
      number: "01",
      title: "Verify your email",
      description: emailVerified
        ? "Your member email is verified."
        : "Required before you can submit an application.",
      status: emailVerified ? "Complete" : "Required",
      complete: emailVerified,
    },
    {
      number: "02",
      title: "Submit your application",
      description: "Tell us where you create and accept the creator policies.",
      status: "Application",
    },
    {
      number: "03",
      title: "Review and provisioning",
      description: "Creator access unlocks only after approval and setup.",
      status: "Approval",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff8fb] text-[#5b4153]">
      <div
        className="pointer-events-none absolute -left-28 top-20 h-80 w-80 rounded-full bg-pink-200/35 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#ffd8e8]/55 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[42%] top-16 hidden text-5xl text-pink-200/70 lg:block"
        aria-hidden="true"
      >
        ♡
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-pink-100 bg-white/85 px-4 py-2 shadow-sm backdrop-blur-md">
            <PumdokiLogo />
          </div>
          <span className="hidden border-l border-pink-200 pl-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#9e8090] sm:block">
            Creator studio
          </span>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#8c6d7f] shadow-sm backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Creator access required
        </span>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-92px)] w-full max-w-7xl items-center gap-12 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-20 lg:pt-10">
        <section className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#d65389]">
            <LockIcon className="h-3.5 w-3.5" />
            Dashboard locked
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] text-[#241a22] sm:text-5xl lg:text-6xl">
            Oops! You need verified creator access to open this studio.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#7b5b6f] sm:text-lg">
            {canApply
              ? "Your member account is working. The Creator Dashboard unlocks after your application is approved and creator access is provisioned."
              : "This account does not have Creator access. The studio stays locked until the required creator review and provisioning are complete."}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {canApply && (
              <button
                type="button"
                onClick={onOpenApplication}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f472b6] to-[#ec4899] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(236,72,153,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(236,72,153,0.3)]"
              >
                Start or view creator application
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
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={onReturnHome}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-pink-100 bg-white px-6 py-3 text-sm font-semibold text-[#6b475e] shadow-sm transition hover:border-pink-200 hover:bg-pink-50/50 hover:text-[#df5f97]"
            >
              Return home
            </button>
          </div>

          {canApply && (
            <p className="mt-3 text-xs leading-5 text-[#9e8090]">
              Already applied? The application page will show your latest
              persisted status.
            </p>
          )}

          {canApply && (
            <ol className="mt-10 grid gap-3 sm:grid-cols-3">
              {accessSteps.map((step) => (
                <li
                  key={step.number}
                  className="rounded-2xl border border-pink-100 bg-white/78 p-4 shadow-sm backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        step.complete
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-pink-50 text-[#d65389]"
                      }`}
                    >
                      {step.complete ? (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#b89aa8]">
                      {step.status}
                    </span>
                  </div>
                  <h2 className="mt-3 text-sm font-semibold text-[#4f3546]">
                    {step.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-[#8c6d7f]">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside
          className="relative hidden min-h-[520px] overflow-hidden rounded-[36px] border border-pink-100 bg-white/92 p-5 shadow-[0_28px_80px_rgba(244,114,182,0.18)] lg:block"
          aria-label="Locked creator dashboard preview"
        >
          <div aria-hidden="true">
            <div className="flex items-center justify-between border-b border-pink-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-pink-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-pink-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-pink-100" />
              </div>
              <span className="rounded-full bg-pink-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d65389]">
                Studio preview
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <div className="h-3 w-28 rounded-full bg-[#eadbe3]" />
                <div className="mt-2 h-2 w-40 rounded-full bg-[#f4e9ee]" />
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-200 to-pink-100" />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {["Earnings", "Members", "Content"].map((label) => (
                <div
                  key={label}
                  className="rounded-2xl border border-pink-100 bg-[#fff9fb] p-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#b89aa8]">
                    {label}
                  </p>
                  <div className="mt-3 h-5 w-16 rounded-full bg-[#eadbe3]" />
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-3xl border border-pink-100 bg-[#fff9fb] p-5">
              <div className="flex items-center justify-between">
                <div className="h-3 w-32 rounded-full bg-[#eadbe3]" />
                <div className="h-3 w-12 rounded-full bg-pink-100" />
              </div>
              <div className="mt-8 flex h-32 items-end gap-3">
                {[42, 66, 52, 86, 64, 100, 78, 112].map((height, index) => (
                  <div
                    key={`${height}-${index}`}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-pink-200 to-pink-100"
                    style={{ height }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-[1.3fr_0.7fr] gap-3">
              <div className="h-24 rounded-2xl border border-pink-100 bg-[#fff9fb]" />
              <div className="h-24 rounded-2xl border border-pink-100 bg-[#fff9fb]" />
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-white/42 p-8 backdrop-blur-[2px]">
            <div className="max-w-xs rounded-[28px] border border-white/80 bg-white/88 p-6 text-center shadow-[0_20px_60px_rgba(91,65,83,0.16)] backdrop-blur-xl">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#241a22] to-[#6b475e] text-white shadow-lg shadow-pink-200/50">
                <LockIcon className="h-7 w-7" />
              </span>
              <p className="mt-4 text-lg font-semibold text-[#3e2936]">
                Creator studio locked
              </p>
              <p className="mt-2 text-sm leading-6 text-[#8c6d7f]">
                Approval protects creators, members, and the Pumdoki community.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
