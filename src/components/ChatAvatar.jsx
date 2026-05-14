import { STATUS_OPTIONS } from './UserStatusSwitcher';

/* ─── Status Heart Badge ───────────────────────────────────────────── */

const HEART = "M8 14.5C7 13.5 1.5 10 1.5 6C1.5 3.5 3.2 1.5 5.5 1.5C6.8 1.5 7.6 2.1 8 2.9C8.4 2.1 9.2 1.5 10.5 1.5C12.8 1.5 14.5 3.5 14.5 6C14.5 10 9 13.5 8 14.5Z";

function StatusHeart({ status, showTooltip = true }) {
  const cfg = STATUS_OPTIONS.find((s) => s.id === status) ?? STATUS_OPTIONS[0];
  const fill = cfg.fill;
  const label = cfg.label;

  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 overflow-visible${showTooltip ? ' group/sh' : ''}`}
      style={{ width: 14, height: 14 }}
      tabIndex={showTooltip ? 0 : undefined}
      role={showTooltip ? 'img' : undefined}
      aria-label={showTooltip ? `Status: ${label}` : undefined}
    >
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        style={{ overflow: 'visible', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.18))' }}
      >
        <path
          d={HEART}
          fill={fill}
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {status === 'busy' && (
          <>
            <circle cx="5.5" cy="8" r="1.15" fill="white"
              style={{ animation: 'dot-pulse 1.2s ease-in-out infinite 0s' }} />
            <circle cx="8"   cy="8" r="1.15" fill="white"
              style={{ animation: 'dot-pulse 1.2s ease-in-out infinite 0.22s' }} />
            <circle cx="10.5" cy="8" r="1.15" fill="white"
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
            color:         '#374151',
            lineHeight:    1,
            letterSpacing: -0.3,
            pointerEvents: 'none',
            userSelect:    'none',
          }}
        >
          Zzz
        </span>
      )}

      {showTooltip && (
        <span
          className="pointer-events-none absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded-lg bg-[#241a22] px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity duration-150 group-hover/sh:opacity-100 group-focus/sh:opacity-100 z-[80]"
        >
          {label}
        </span>
      )}
    </span>
  );
}

/* ─── ChatAvatar ───────────────────────────────────────────────────── */

export default function ChatAvatar({
  src,
  alt,
  size = 40,
  status = 'online',
  unreadCount = 0,
  showStatusTooltip = true,
  showStatus = true,
  className = '',
}) {
  return (
    <div
      className={`relative inline-block shrink-0 overflow-visible ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={alt}
        className="rounded-full object-cover w-full h-full ring-2 ring-pink-100"
        style={{ filter: status === 'offline' ? 'grayscale(0.5) opacity(0.8)' : 'none' }}
      />

      {unreadCount > 0 && (
        <span className="badge-pop absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}

      {showStatus && <StatusHeart status={status} showTooltip={showStatusTooltip} />}
    </div>
  );
}
