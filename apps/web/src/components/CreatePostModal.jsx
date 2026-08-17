import { useState } from "react";

export default function CreatePostModal({
  open,
  onClose,
  text,
  setText,
  fontSize,
  setFontSize,
  bold,
  setBold,
  italic,
  setItalic,
  fontColor,
  setFontColor,
  locked,
  setLocked,
  vesoPrice,
  setVesoPrice,
}) {
  const [showVesoTooltip, setShowVesoTooltip] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setLocked(false);
    setVesoPrice("");
    setText("");
    onClose();
  };

  return (
    <div
      className="member-create-overlay fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at 60% 40%, rgba(249,168,200,0.18) 0%, rgba(0,0,0,0.52) 100%)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Outer glow ring — gold when locked, pink when open */}
      <div
        className="member-create-frame w-full max-w-lg rounded-[28px] p-[2px] transition-all duration-500"
        data-locked={locked}
        style={{
          background: locked
            ? "linear-gradient(135deg, #f5b63b 0%, #f9a8c8 40%, #df5f97 70%, #f5b63b 100%)"
            : "linear-gradient(135deg, #ffd8e8 0%, #f9a8c8 50%, #fce4ec 100%)",
          boxShadow: locked
            ? "0 0 40px 4px rgba(245,182,59,0.28), 0 8px 40px rgba(0,0,0,0.18)"
            : "0 8px 40px rgba(249,168,200,0.22), 0 4px 24px rgba(0,0,0,0.12)",
        }}
      >
        <div
          className="member-glass-modal-panel rounded-[26px] overflow-hidden bg-white"
          style={{
            background: locked
              ? "linear-gradient(160deg, #fffdf8 0%, #fff8fc 60%, #fff9f0 100%)"
              : undefined,
          }}
        >
          {/* ─── Header ─── */}
          <div
            className="relative flex items-center justify-between px-6 py-4"
            style={{
              background: locked
                ? "linear-gradient(90deg, rgba(245,182,59,0.10) 0%, rgba(249,168,200,0.13) 100%)"
                : "linear-gradient(90deg, rgba(249,168,200,0.08) 0%, rgba(255,255,255,0) 100%)",
              borderBottom: locked
                ? "1px solid rgba(245,182,59,0.18)"
                : "1px solid #fce4ec",
            }}
          >
            {/* Floral accent — top left */}
            <svg
              viewBox="0 0 40 40"
              className="absolute left-0 top-0 w-16 h-16 opacity-[0.07] pointer-events-none"
              aria-hidden
            >
              <circle cx="20" cy="20" r="8" fill="#df5f97" />
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <ellipse
                  key={i}
                  cx={20 + 11 * Math.cos((deg * Math.PI) / 180)}
                  cy={20 + 11 * Math.sin((deg * Math.PI) / 180)}
                  rx="5"
                  ry="7"
                  fill="#f9a8c8"
                  transform={`rotate(${deg} ${20 + 11 * Math.cos((deg * Math.PI) / 180)} ${20 + 11 * Math.sin((deg * Math.PI) / 180)})`}
                />
              ))}
            </svg>

            <div className="flex items-center gap-2.5">
              {locked ? (
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: "linear-gradient(90deg,#f5b63b,#f9a8c8)",
                    color: "#241a22",
                  }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <rect x="2" y="7" width="12" height="8" rx="2" />
                    <path d="M5 7V5a3 3 0 016 0v2" />
                  </svg>
                  Subscribers Only
                </span>
              ) : (
                <span
                  className="text-sm font-semibold tracking-wide"
                  style={{ color: "#241a22", letterSpacing: "0.04em" }}
                >
                  Create
                </span>
              )}
            </div>

            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full transition"
              style={{ color: "#8c6d7f" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fce4ec";
                e.currentTarget.style.color = "#e8384f";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#8c6d7f";
              }}
              aria-label="Close"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ─── Body ─── */}
          <div className="px-6 pt-5 pb-4">
            {/* Creator row + textarea */}
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                  alt="Your avatar"
                  className="h-10 w-10 rounded-full object-cover"
                  style={{
                    border: locked ? "2px solid #f5b63b" : "2px solid #fce4ec",
                  }}
                />
                {locked && (
                  <span
                    className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full"
                    style={{
                      background: "linear-gradient(135deg,#f5b63b,#df5f97)",
                    }}
                  >
                    <svg
                      viewBox="0 0 10 10"
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <rect x="1.5" y="4.5" width="7" height="5" rx="1" />
                      <path d="M3 4.5V3a2 2 0 014 0v1.5" />
                    </svg>
                  </span>
                )}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Post a new drop..."
                rows={4}
                className="flex-1 resize-none rounded-2xl outline-none transition-all duration-300"
                style={{
                  border: locked
                    ? "1.5px solid rgba(245,182,59,0.35)"
                    : "1.5px solid #fce4ec",
                  background: locked ? "rgba(255,252,240,0.7)" : "#fffafc",
                  padding: "12px 16px",
                  fontSize:
                    fontSize === "small"
                      ? "13px"
                      : fontSize === "large"
                        ? "18px"
                        : "14px",
                  fontWeight: bold ? "700" : "400",
                  fontStyle: italic ? "italic" : "normal",
                  color: fontColor,
                }}
              />
            </div>

            {/* ─── Formatting toolbar ─── */}
            <div
              className="mt-3 flex items-center gap-2 flex-wrap border-t pt-3"
              style={{
                borderColor: locked ? "rgba(245,182,59,0.18)" : "#fce4ec",
              }}
            >
              {/* Font size — ghost segmented */}
              <div
                className="flex items-center rounded-xl overflow-hidden"
                style={{ border: "1.5px solid #f9e4ef" }}
              >
                {[
                  { id: "small", label: "S" },
                  { id: "normal", label: "M" },
                  { id: "large", label: "L" },
                ].map((size, idx) => (
                  <button
                    key={size.id}
                    onClick={() => setFontSize(size.id)}
                    className="px-2.5 py-1.5 text-xs font-semibold transition-all duration-150"
                    style={{
                      background:
                        fontSize === size.id
                          ? "linear-gradient(90deg,#f9a8c8,#f472b6)"
                          : "transparent",
                      color: fontSize === size.id ? "#fff" : "#b89aa8",
                      borderRight: idx < 2 ? "1px solid #f9e4ef" : "none",
                    }}
                  >
                    {size.label}
                  </button>
                ))}
              </div>

              {/* Bold */}
              <button
                onClick={() => setBold(!bold)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all"
                style={{
                  border: bold ? "1.5px solid #f472b6" : "1.5px solid #f9e4ef",
                  background: bold ? "rgba(244,114,182,0.08)" : "transparent",
                  color: bold ? "#f472b6" : "#b89aa8",
                }}
              >
                B
              </button>

              {/* Italic */}
              <button
                onClick={() => setItalic(!italic)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-xs transition-all"
                style={{
                  border: italic
                    ? "1.5px solid #f472b6"
                    : "1.5px solid #f9e4ef",
                  background: italic ? "rgba(244,114,182,0.08)" : "transparent",
                  color: italic ? "#f472b6" : "#b89aa8",
                }}
              >
                <span className="italic font-serif">I</span>
              </button>

              {/* Color swatches */}
              <div className="flex items-center gap-1 ml-0.5">
                {[
                  { color: "#4a3340", name: "Default" },
                  { color: "#8b2252", name: "Berry" },
                  { color: "#c2185b", name: "Rose" },
                  { color: "#f472b6", name: "Sakura" },
                  { color: "#7c3aed", name: "Violet" },
                  { color: "#2563eb", name: "Ocean" },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setFontColor(c.color)}
                    className="rounded-full transition-all duration-150"
                    style={{
                      width: "20px",
                      height: "20px",
                      background: c.color,
                      border:
                        fontColor === c.color
                          ? "2.5px solid #241a22"
                          : "2.5px solid transparent",
                      transform:
                        fontColor === c.color ? "scale(1.2)" : "scale(1)",
                      outline:
                        fontColor === c.color
                          ? "2px solid rgba(36,26,34,0.15)"
                          : "none",
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* ─── Veso price row — shown only when locked ─── */}
            {locked && (
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-shrink-0">
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-all"
                    style={{
                      background: "linear-gradient(135deg,#f5b63b,#f9a8c8)",
                      boxShadow: "0 2px 8px rgba(245,182,59,0.3)",
                    }}
                    onMouseEnter={() => setShowVesoTooltip(true)}
                    onMouseLeave={() => setShowVesoTooltip(false)}
                    aria-label="Veso - 1 Veso = 1 Dollar"
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                      <path
                        d="M12 18c-1.5-1-4-2.5-5.5-4.5C5 11.5 5 10 6.5 9c1-.7 2.2-.4 3 .5.3.3.5.7.5 1.1.0-.4.2-.8.5-1.1.8-.9 2-.12 3-.5 1.5 1 1.5 2.5.0 4.5-1.5 2-4 3.5-5.5 4.5z"
                        fill="white"
                        opacity="0.9"
                      />
                      <path
                        d="M9.5 9.5c.3-.3.7-.5 1.1-.5h2.8c.4 0 .8.2 1.1.5"
                        stroke="white"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.7"
                      />
                    </svg>
                  </button>
                  {showVesoTooltip && (
                    <div
                      className="absolute bottom-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-semibold shadow-lg z-10 pointer-events-none"
                      style={{
                        background: "#241a22",
                        color: "#f9a8c8",
                        border: "1px solid rgba(249,168,200,0.2)",
                      }}
                    >
                      1 Veso = 1 Dollar
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                        style={{
                          borderLeft: "5px solid transparent",
                          borderRight: "5px solid transparent",
                          borderTop: "5px solid #241a22",
                        }}
                      />
                    </div>
                  )}
                </div>
                <div
                  className="flex-1 flex items-center rounded-2xl overflow-hidden"
                  style={{
                    border: "1.5px solid rgba(245,182,59,0.35)",
                    background: "rgba(255,252,240,0.8)",
                  }}
                >
                  <span
                    className="pl-3 pr-1 text-sm font-bold"
                    style={{ color: "#b8860b" }}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="w-3.5 h-3.5 inline-block mr-0.5"
                      fill="none"
                    >
                      <path
                        d="M8 12c-1-.7-2.7-1.7-3.7-3C3 7.5 3 6.5 4.4 5.7c.7-.4 1.5-.2 2 .4.2.2.3.5.3.8 0-.3.1-.6.3-.8.5-.6 1.3-.8 2-.4C10.4 6.5 10.4 7.5 9 9c-1 1.3-2.7 2.3-3.7 3z"
                        fill="#f5b63b"
                      />
                    </svg>
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={vesoPrice}
                    onChange={(e) => setVesoPrice(e.target.value)}
                    placeholder="Set price in Vesos"
                    className="flex-1 bg-transparent py-2 pr-3 text-sm outline-none"
                    style={{ color: "#241a22" }}
                  />
                </div>
              </div>
            )}

            {/* ─── Media + lock + post row ─── */}
            <div
              className="mt-3 flex items-center gap-2 flex-wrap border-t pt-3"
              style={{
                borderColor: locked ? "rgba(245,182,59,0.18)" : "#fce4ec",
              }}
            >
              {/* Photo */}
              <button
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all"
                style={{
                  border: "1.5px solid #f9e4ef",
                  color: "#b89aa8",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fce4ec";
                  e.currentTarget.style.color = "#df5f97";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#b89aa8";
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                Photo
              </button>

              {/* Video */}
              <button
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all"
                style={{
                  border: "1.5px solid #f9e4ef",
                  color: "#b89aa8",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fce4ec";
                  e.currentTarget.style.color = "#df5f97";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#b89aa8";
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" />
                </svg>
                Video
              </button>

              {/* Lock / Subscribers-only toggle */}
              <button
                onClick={() => setLocked(!locked)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200"
                style={{
                  border: locked
                    ? "1.5px solid #f5b63b"
                    : "1.5px solid #f9e4ef",
                  background: locked
                    ? "linear-gradient(90deg,rgba(245,182,59,0.12),rgba(249,168,200,0.10))"
                    : "transparent",
                  color: locked ? "#b8860b" : "#b89aa8",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                {locked ? "Locked" : "Lock"}
              </button>

              <div className="flex-1" />

              {/* Post CTA */}
              <button
                onClick={handleClose}
                className="rounded-2xl px-6 py-2 text-sm font-bold text-white transition-all duration-200"
                style={{
                  background: locked
                    ? "linear-gradient(90deg,#f5b63b 0%,#f9a8c8 50%,#df5f97 100%)"
                    : "linear-gradient(90deg,#f9a8c8 0%,#f472b6 100%)",
                  boxShadow: locked
                    ? "0 4px 18px rgba(245,182,59,0.32), 0 2px 8px rgba(0,0,0,0.08)"
                    : "0 4px 14px rgba(249,168,200,0.40)",
                  letterSpacing: "0.03em",
                }}
              >
                {locked ? "Post - Locked" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
