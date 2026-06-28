import { useState } from "react";

const MOMENT_TYPES = [
  {
    id: "photo",
    label: "Photo",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    id: "video",
    label: "Video",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
  },
  {
    id: "text",
    label: "Text",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
];

export default function MomentComposer({ onClose }) {
  const [selectedType, setSelectedType] = useState(null);
  const [subscriberOnly, setSubscriberOnly] = useState(false);
  const [shared, setShared] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  const handleShare = () => {
    setShared(true);
    setTimeout(onClose, 800);
  };

  if (shared) {
    return (
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center"
        style={{ background: "rgba(20,10,18,0.7)", backdropFilter: "blur(6px)" }}
      >
        <div className="flex flex-col items-center gap-3 text-white">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg,#FF4D8D,#f472b6)" }}
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p className="text-base font-semibold">Moment shared!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: "rgba(20,10,18,0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm overflow-hidden sm:rounded-3xl rounded-t-3xl bg-white shadow-2xl">
        {/* Header */}
        <div
          className="relative flex items-center justify-between px-6 py-4"
          style={{
            background: subscriberOnly
              ? "linear-gradient(90deg,rgba(143,90,0,0.08),rgba(212,166,58,0.10))"
              : "linear-gradient(90deg,rgba(255,77,141,0.06),rgba(244,114,182,0.04))",
            borderBottom: subscriberOnly
              ? "1px solid rgba(212,166,58,0.20)"
              : "1px solid #fce4ec",
          }}
        >
          <div className="flex items-center gap-2">
            {subscriberOnly && (
              <span
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: "linear-gradient(90deg,#D4A63A,#F7D774)", color: "#241a22" }}
              >
                <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="7" width="12" height="8" rx="2" />
                  <path d="M5 7V5a3 3 0 016 0v2" />
                </svg>
                Subscribers Only
              </span>
            )}
            {!subscriberOnly && (
              <h2 className="text-base font-semibold text-[#241a22]">Create Moment</h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#e8384f]"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-4">
          {/* Creator row */}
          <div className="flex items-center gap-2.5 mb-5">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
              alt="You"
              className="h-9 w-9 rounded-full object-cover border-2 border-pink-100"
            />
            <div>
              <p className="text-sm font-semibold text-[#241a22]">Your Moment</p>
              <p className="text-xs text-[#b89aa8]">Visible to {subscriberOnly ? "subscribers" : "followers"}</p>
            </div>
          </div>

          {/* Type selection */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#b89aa8] mb-3">
            Choose type
          </p>
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {MOMENT_TYPES.map((t) => {
              const isSelected = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className="flex flex-col items-center gap-2 rounded-2xl py-4 px-2 border-2 transition-all duration-150"
                  style={{
                    borderColor: isSelected
                      ? (subscriberOnly ? "#D4A63A" : "#f472b6")
                      : "#fce4ec",
                    background: isSelected
                      ? (subscriberOnly
                          ? "linear-gradient(135deg,rgba(212,166,58,0.10),rgba(247,215,116,0.08))"
                          : "rgba(244,114,182,0.07)")
                      : "transparent",
                    color: isSelected
                      ? (subscriberOnly ? "#8F5A00" : "#df5f97")
                      : "#8c6d7f",
                  }}
                >
                  {t.icon}
                  <span className="text-xs font-semibold">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Subscriber-only toggle */}
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-200"
            style={{
              background: subscriberOnly
                ? "linear-gradient(90deg,rgba(212,166,58,0.08),rgba(247,215,116,0.06))"
                : "rgba(249,168,200,0.06)",
              border: subscriberOnly
                ? "1px solid rgba(212,166,58,0.22)"
                : "1px solid rgba(249,168,200,0.22)",
            }}
          >
            <div>
              <p className="text-sm font-semibold text-[#241a22]">Subscriber-only</p>
              <p className="text-xs text-[#b89aa8] mt-0.5">Gold ring · visible to subscribers</p>
            </div>
            <button
              onClick={() => setSubscriberOnly((v) => !v)}
              className="relative ml-4 flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-200"
              style={{
                background: subscriberOnly
                  ? "linear-gradient(90deg,#D4A63A,#F7D774)"
                  : "#f9e4ef",
              }}
              aria-pressed={subscriberOnly}
            >
              <span
                className="absolute h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                style={{
                  left: "2px",
                  transform: subscriberOnly ? "translateX(20px)" : "translateX(0)",
                }}
              />
            </button>
          </div>
        </div>

        {/* Upload Disclaimer */}
        <div className="px-6 pb-3">
          <label className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border px-3.5 py-3 transition ${rightsConfirmed ? "border-pink-200 bg-pink-50/40" : "border-pink-100 bg-white/40"}`}>
            <input
              type="checkbox"
              checked={rightsConfirmed}
              onChange={(e) => setRightsConfirmed(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer rounded accent-[#df5f97]"
            />
            <span className="text-[11px] leading-relaxed text-[#8c6d7f]">
              By uploading, I confirm I own the rights to this content and it complies with the{" "}
              <span className="font-semibold text-[#7f6274]">Acceptable Use</span> and{" "}
              <span className="font-semibold text-[#7f6274]">Non-Consensual Content Policies</span>.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-pink-100 py-3 text-sm font-medium text-[#8c6d7f] transition hover:bg-pink-50"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedType || !rightsConfirmed}
            className="flex-[2] rounded-2xl py-3 text-sm font-bold transition-all duration-200 disabled:opacity-40"
            style={{
              background: selectedType && rightsConfirmed
                ? (subscriberOnly
                    ? "linear-gradient(90deg,#8F5A00,#D4A63A,#F7D774,#D4A63A)"
                    : "linear-gradient(90deg,#FF4D8D,#f472b6)")
                : "#fce4ec",
              color: subscriberOnly && selectedType ? "#241a22" : "white",
              boxShadow: selectedType && rightsConfirmed
                ? (subscriberOnly
                    ? "0 4px 16px rgba(212,166,58,0.35)"
                    : "0 4px 16px rgba(255,77,141,0.30)")
                : "none",
            }}
          >
            Share Moment
          </button>
        </div>
      </div>
    </div>
  );
}
