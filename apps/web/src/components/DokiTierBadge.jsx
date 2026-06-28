const TIERS = {
  "doki-1": {
    label: "Doki 1",
    bg: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
    border: "rgba(244,143,177,0.5)",
    text: "#ad1457",
    shadow: "0 0 8px rgba(244,143,177,0.3)",
    icon: (
      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
        <path d="M10 17s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z" fill="#f48fb1" stroke="#ec407a" strokeWidth="1" />
      </svg>
    ),
  },
  "doki-2": {
    label: "Doki 2",
    bg: "linear-gradient(135deg, #fce4ec 0%, #f48fb1 100%)",
    border: "rgba(236,64,122,0.45)",
    text: "#880e4f",
    shadow: "0 0 10px rgba(236,64,122,0.25)",
    icon: (
      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
        <path d="M10 17s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z" fill="#f06292" stroke="#e91e63" strokeWidth="1" />
      </svg>
    ),
  },
  "doki-3": {
    label: "Doki 3",
    bg: "linear-gradient(135deg, #fce4ec 0%, #ec407a 100%)",
    border: "rgba(233,30,99,0.45)",
    text: "#fff",
    shadow: "0 0 12px rgba(233,30,99,0.3)",
    icon: (
      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
        <path d="M10 17s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z" fill="#ec407a" stroke="#c2185b" strokeWidth="1" />
      </svg>
    ),
  },
  "super-doki-1": {
    label: "Super Doki 1",
    bg: "linear-gradient(135deg, #fce4ec 0%, #f06292 50%, #ab47bc 100%)",
    border: "rgba(171,71,188,0.5)",
    text: "#fff",
    shadow: "0 0 14px rgba(171,71,188,0.35), 0 0 6px rgba(233,30,99,0.2)",
    glow: true,
    icon: (
      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
        <path d="M10 17s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z" fill="#e91e63" stroke="#ad1457" strokeWidth="1" />
        <path d="M10 6l1 2.5h2.5l-2 1.7.8 2.5L10 11l-2.3 1.7.8-2.5-2-1.7H9z" fill="#ffd54f" stroke="#ffb300" strokeWidth="0.5" />
      </svg>
    ),
  },
  "super-doki-2": {
    label: "Super Doki 2",
    bg: "linear-gradient(135deg, #f8bbd0 0%, #e91e63 40%, #9c27b0 100%)",
    border: "rgba(156,39,176,0.6)",
    text: "#fff",
    shadow: "0 0 16px rgba(156,39,176,0.4), 0 0 8px rgba(233,30,99,0.25)",
    glow: true,
    metallic: true,
    icon: (
      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none">
        <path d="M10 17s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z" fill="#c2185b" stroke="#880e4f" strokeWidth="1" />
        <path d="M10 6l1 2.5h2.5l-2 1.7.8 2.5L10 11l-2.3 1.7.8-2.5-2-1.7H9z" fill="#ffd54f" stroke="#ffb300" strokeWidth="0.5" />
        <path d="M10 8.5l.6 1.5h1.5l-1.2 1 .5 1.5-1.4-1-1.4 1 .5-1.5-1.2-1H9.4z" fill="#fff" fillOpacity="0.5" />
      </svg>
    ),
  },
  "doki-legend": {
    label: "Doki Legend",
    bg: "linear-gradient(135deg, #ffd6e8 0%, #e91e63 30%, #9c27b0 60%, #e91e63 100%)",
    border: "transparent",
    text: "#fff",
    shadow: "0 0 20px rgba(233,30,99,0.5), 0 0 40px rgba(156,39,176,0.25)",
    glow: true,
    metallic: true,
    legendary: true,
    icon: (
      <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0" fill="none">
        <defs>
          <linearGradient id="legend-heart" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd54f" />
            <stop offset="50%" stopColor="#ffb300" />
            <stop offset="100%" stopColor="#ff6f00" />
          </linearGradient>
        </defs>
        <path d="M10 17s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z" fill="url(#legend-heart)" stroke="#e65100" strokeWidth="0.8" />
        <path d="M10 6l1.2 2.5h2.7l-2.2 1.8.9 2.7L10 11.3 7.4 13l.9-2.7-2.2-1.8h2.7z" fill="#fff" fillOpacity="0.9" />
      </svg>
    ),
  },
};

export default function DokiTierBadge({ tier }) {
  const t = TIERS[tier];
  if (!t) return null;

  const legendaryRingStyle = t.legendary
    ? {
        background: "linear-gradient(135deg, #ffd54f, #e91e63, #9c27b0, #e91e63, #ffd54f)",
        padding: "1.5px",
        borderRadius: "9999px",
      }
    : null;

  const badgeStyle = {
    background: t.bg,
    border: t.legendary ? "none" : `1.5px solid ${t.border}`,
    color: t.text,
    boxShadow: t.shadow,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  };

  const badge = (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap select-none"
      style={badgeStyle}
    >
      {t.icon}
      {t.label}
    </span>
  );

  if (t.legendary) {
    return (
      <span className="inline-block rounded-full animate-pulse" style={{ ...legendaryRingStyle, animationDuration: "3s" }}>
        {badge}
      </span>
    );
  }

  return badge;
}

export function DokiTierBadgeRow({ tier }) {
  return (
    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
      <DokiTierBadge tier={tier} />
    </div>
  );
}

export { TIERS as DOKI_TIERS };
