import { useState } from "react";

export const STATUS_OPTIONS = [
  { id: 'online',  label: 'Online',      fill: '#22c55e' },
  { id: 'busy',    label: 'In an Order', fill: '#f472b6' },
  { id: 'resting', label: 'Resting',     fill: '#fbbf24' },
  { id: 'offline', label: 'Offline',     fill: '#9ca3af' },
];

const PLUMP_HEART = "M8 14.5C7 13.5 1.5 10 1.5 6C1.5 3.5 3.2 1.5 5.5 1.5C6.8 1.5 7.6 2.1 8 2.9C8.4 2.1 9.2 1.5 10.5 1.5C12.8 1.5 14.5 3.5 14.5 6C14.5 10 9 13.5 8 14.5Z";

/* ─── Heart icon with per-status overlays ────────────────────────────── */
export function MenuHeartIcon({ status, size = 16, zzzColor = '#374151' }) {
  const cfg = STATUS_OPTIONS.find((s) => s.id === status) ?? STATUS_OPTIONS[0];
  return (
    <span
      className="relative shrink-0"
      style={{ width: size, height: size, display: 'inline-block', overflow: 'visible' }}
    >
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        style={{ overflow: 'visible', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
      >
        <path d={PLUMP_HEART} fill={cfg.fill} stroke="white" strokeWidth="2" strokeLinejoin="round" />
        {status === 'busy' && (
          <>
            <circle cx="5.5" cy="8" r="1.1" fill="white"
              style={{ animation: 'dot-pulse 1.2s ease-in-out infinite 0s' }} />
            <circle cx="8"   cy="8" r="1.1" fill="white"
              style={{ animation: 'dot-pulse 1.2s ease-in-out infinite 0.22s' }} />
            <circle cx="10.5" cy="8" r="1.1" fill="white"
              style={{ animation: 'dot-pulse 1.2s ease-in-out infinite 0.44s' }} />
          </>
        )}
      </svg>
      {status === 'resting' && (
        <span
          className="zzz-float"
          style={{
            position:      'absolute',
            top:           -5,
            right:         -5,
            fontSize:      7,
            fontWeight:    900,
            color:         zzzColor,
            lineHeight:    1,
            letterSpacing: -0.3,
            pointerEvents: 'none',
            userSelect:    'none',
          }}
        >
          Zzz
        </span>
      )}
    </span>
  );
}

/* ─── Non-interactive badge for public creator profiles ─────────────── */
export function StaticStatusBadge({ status = 'online' }) {
  const cfg = STATUS_OPTIONS.find((s) => s.id === status) ?? STATUS_OPTIONS[0];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm px-2.5 py-1">
      <MenuHeartIcon status={status} size={13} zzzColor="#d1d5db" />
      <span className="text-[11px] font-semibold text-white leading-none">{cfg.label}</span>
    </span>
  );
}

/* ─── Collapsible status row for white profile dropdown menus ────────── */
export function StatusMenuRow({ status, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const current = STATUS_OPTIONS.find((s) => s.id === status) ?? STATUS_OPTIONS[0];

  const handleChange = (id) => {
    onStatusChange(id);
    setExpanded(false);
    // Simulate optimistic DB save
    console.log('[Pumdoki] Status updated →', id);
  };

  return (
    <div>
      {/* Trigger row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60 hover:text-[#df5f97]"
        style={{ overflow: 'visible' }}
      >
        <MenuHeartIcon status={status} size={16} />
        <span className="flex-1 text-left">
          Status: <span className="font-semibold">{current.label}</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 shrink-0 text-[#b89aa8]"
          style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Inline sub-options */}
      {expanded && (
        <div className="bg-pink-50/50 pb-0.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleChange(opt.id)}
              className="flex w-full items-center gap-3 px-6 py-2 text-[12px] transition hover:bg-pink-100/70"
              style={{ overflow: 'visible' }}
            >
              <MenuHeartIcon status={opt.id} size={14} />
              <span className={`flex-1 text-left leading-none ${
                status === opt.id ? 'font-semibold text-[#241a22]' : 'text-[#5b4153]'
              }`}>
                {opt.label}
              </span>
              {status === opt.id && (
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3 shrink-0 text-[#f472b6]"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
