import { useState, useEffect } from "react";

const STORAGE_KEY = "pumdoki_cookie_consent";

export default function CookieConsentBanner({ onNavigateLegal }) {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefs, setPrefs] = useState({
    analytics: true,
    marketing: true,
    functional: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const save = (choice) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ choice, timestamp: Date.now() })
    );
    setVisible(false);
    setShowPreferences(false);
  };

  const acceptAll = () => save("all");
  const rejectNonEssential = () => {
    setPrefs({ analytics: false, marketing: false, functional: false });
    save("essential-only");
  };
  const savePreferences = () => {
    save({ type: "custom", ...prefs });
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-pink-100 bg-white/95 backdrop-blur-md shadow-2xl"
      role="dialog"
      aria-label="Cookie consent"
    >
      {!showPreferences ? (
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-4 sm:flex-nowrap sm:gap-6">
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-50 text-[#df5f97]">
              <svg
                viewBox="0 0 24 24"
                className="h-4.5 w-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8.5 8.5v.01M16 15.5v.01M12 12v.01" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#241a22]">
              We use cookies
            </p>
          </div>
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-[#8c6d7f]">
            Pumdoki uses cookies and similar technologies to provide, improve,
            and personalise our services. By clicking "Accept All" you consent
            to our use of cookies.{" "}
            <button
              onClick={() => onNavigateLegal && onNavigateLegal("cookies")}
              className="font-medium text-[#df5f97] hover:underline"
            >
              Cookie Policy
            </button>
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPreferences(true)}
              className="rounded-xl border border-pink-100 px-3 py-2 text-xs font-medium text-[#8c6d7f] transition hover:border-pink-200 hover:bg-pink-50/60"
            >
              Manage Preferences
            </button>
            <button
              onClick={rejectNonEssential}
              className="rounded-xl border border-pink-100 px-3 py-2 text-xs font-medium text-[#8c6d7f] transition hover:border-pink-200 hover:bg-pink-50/60"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={acceptAll}
              className="rounded-xl px-4 py-2 text-xs font-bold text-white transition-all"
              style={{
                background: "linear-gradient(90deg,#FF4D8D,#f472b6)",
                boxShadow: "0 2px 12px rgba(255,77,141,0.28)",
              }}
            >
              Accept All
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-lg px-5 py-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#241a22]">
              Manage Cookie Preferences
            </h2>
            <button
              onClick={() => setShowPreferences(false)}
              className="rounded-full p-1 text-[#9e8090] hover:bg-pink-50 hover:text-[#df5f97]"
              aria-label="Close"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-3">
            {[
              {
                key: "essential",
                label: "Essential",
                desc: "Required for the site to function. Cannot be disabled.",
                locked: true,
              },
              {
                key: "functional",
                label: "Functional",
                desc: "Enables features like personalised settings and saved preferences.",
              },
              {
                key: "analytics",
                label: "Analytics",
                desc: "Helps us understand how visitors interact with our platform.",
              },
              {
                key: "marketing",
                label: "Marketing",
                desc: "Used to deliver relevant ads and measure campaign effectiveness.",
              },
            ].map(({ key, label, desc, locked }) => (
              <div
                key={key}
                className="flex items-start justify-between gap-3 rounded-xl border border-pink-50 bg-pink-50/40 px-3 py-2.5"
              >
                <div>
                  <p className="text-xs font-semibold text-[#241a22]">
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs text-[#9e8090]">{desc}</p>
                </div>
                <button
                  disabled={locked}
                  onClick={() =>
                    !locked && setPrefs((p) => ({ ...p, [key]: !p[key] }))
                  }
                  className={`relative mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-200 ${locked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  style={{
                    background:
                      locked || prefs[key]
                        ? "linear-gradient(90deg,#FF4D8D,#f472b6)"
                        : "#f3e0ea",
                  }}
                  aria-pressed={locked ? true : prefs[key]}
                >
                  <span
                    className="absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200"
                    style={{
                      left: "3px",
                      transform:
                        locked || prefs[key]
                          ? "translateX(16px)"
                          : "translateX(0)",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={rejectNonEssential}
              className="flex-1 rounded-xl border border-pink-100 py-2 text-xs font-medium text-[#8c6d7f] transition hover:bg-pink-50/60"
            >
              Reject All
            </button>
            <button
              onClick={savePreferences}
              className="flex-[2] rounded-xl py-2 text-xs font-bold text-white transition-all"
              style={{
                background: "linear-gradient(90deg,#FF4D8D,#f472b6)",
                boxShadow: "0 2px 12px rgba(255,77,141,0.28)",
              }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
