import { useState } from "react";
import { MenuHeartIcon, STATUS_OPTIONS } from "./UserStatusSwitcher";
import VesoIcon from "./VesoIcon";
import { getLowestOffer, formatServicePrice } from "../utils/serviceOffers";

/**
 * Connect creator card with a 3D flip. The front photo face and the flipped
 * detail face both show the creator's lowest Veso offer for the service
 * category the card is rendered in (`serviceType`); with no category the
 * lowest offer overall is shown prefixed with "From". The flip is reachable
 * by hover, keyboard focus, and click/tap.
 */

function LevelBadge({ level, size = 16 }) {
  if (level === "bronze")
    return (
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: "#cd7f32",
          border: "1.5px solid #a0522d",
        }}
        title="Bronze"
      >
        <span className="text-white text-[8px] font-bold">B</span>
      </span>
    );
  if (level === "silver")
    return (
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: "#c0c0c0",
          border: "1.5px solid #a8a8a8",
        }}
        title="Silver"
      >
        <span className="text-white text-[8px] font-bold">S</span>
      </span>
    );
  if (level === "gold")
    return (
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: "#ffd700",
          border: "1.5px solid #daa520",
        }}
        title="Gold"
      >
        <span className="text-white text-[8px] font-bold">G</span>
      </span>
    );
  if (level === "star")
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" title="Star">
        <polygon
          points="8,1 10,6 15.5,6.5 11.5,10 12.5,15.5 8,13 3.5,15.5 4.5,10 0.5,6.5 6,6"
          fill="#f9a8c8"
          stroke="#e882a8"
          strokeWidth="0.8"
        />
      </svg>
    );
  if (level === "2stars")
    return (
      <span className="inline-flex items-center gap-px" title="2 Stars">
        <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 16 16">
          <polygon
            points="8,1 10,6 15.5,6.5 11.5,10 12.5,15.5 8,13 3.5,15.5 4.5,10 0.5,6.5 6,6"
            fill="#f9a8c8"
            stroke="#e882a8"
            strokeWidth="0.8"
          />
        </svg>
        <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 16 16">
          <polygon
            points="8,1 10,6 15.5,6.5 11.5,10 12.5,15.5 8,13 3.5,15.5 4.5,10 0.5,6.5 6,6"
            fill="#f9a8c8"
            stroke="#e882a8"
            strokeWidth="0.8"
          />
        </svg>
      </span>
    );
  if (level === "legend")
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" title="Legend">
        <path
          d="M8 1L10.5 5H14L11 8L12.5 13L8 10.5L3.5 13L5 8L2 5H5.5L8 1Z"
          fill="#ffd700"
          stroke="#daa520"
          strokeWidth="0.6"
        />
        <path
          d="M4 2L8 1L12 2"
          fill="none"
          stroke="#daa520"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle
          cx="5"
          cy="1.5"
          r="0.8"
          fill="#ffd700"
          stroke="#daa520"
          strokeWidth="0.4"
        />
        <circle
          cx="8"
          cy="0.5"
          r="0.8"
          fill="#ffd700"
          stroke="#daa520"
          strokeWidth="0.4"
        />
        <circle
          cx="11"
          cy="1.5"
          r="0.8"
          fill="#ffd700"
          stroke="#daa520"
          strokeWidth="0.4"
        />
      </svg>
    );
  return null;
}

function PlayIcon({ size = 11 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

export default function ConnectCreatorCard({ creator, serviceType = null }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const noCategory = !serviceType || serviceType === "all";
  const lowestOffer = getLowestOffer(creator, serviceType);
  const priceLabel = formatServicePrice(lowestOffer, { from: noCategory });

  return (
    <div
      className="group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f472b6]/60 rounded-2xl"
      style={{ perspective: "1000px" }}
      tabIndex={0}
      aria-label={`${creator.name} — ${priceLabel || "creator card"}`}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onFocus={() => setIsFlipped(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsFlipped(false);
      }}
      onClick={() => setIsFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsFlipped((f) => !f);
        }
      }}
    >
      <div
        data-flip
        className="relative w-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          aspectRatio: "3/4",
        }}
      >
        {/* ─── Front Face ─── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border border-pink-100 shadow-sm"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <img
            src={creator.photo}
            alt={creator.name}
            className="w-full h-full object-cover"
          />

          {/* Bottom gradient — name header with inline status heart */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-16 pb-3 px-3">
            <div className="flex items-center gap-1.5">
              <MenuHeartIcon
                status={creator.status}
                size={14}
                zzzColor="#d1d5db"
              />
              <span className="text-white font-semibold text-sm truncate">
                {creator.name}
              </span>
              <LevelBadge level={creator.level} size={14} />
            </div>
            <p className="text-white/70 text-xs mt-0.5">@{creator.username}</p>
          </div>

          {/* Play / audio button — top-right */}
          <button
            className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full cursor-pointer text-white transition hover:scale-110"
            style={{
              background: "rgba(0,0,0,0.28)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={(e) => e.stopPropagation()}
            title="Play audio intro"
          >
            <PlayIcon size={10} />
          </button>

          {/* Lowest Veso price for the active category — bottom-right */}
          {priceLabel && (
            <div
              className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2 py-1"
              style={{
                background: "rgba(0,0,0,0.42)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                border: "1px solid rgba(249,168,200,0.25)",
              }}
            >
              <VesoIcon size={11} />
              <span className="text-white/90 text-[11px] font-semibold whitespace-nowrap">
                {priceLabel}
              </span>
            </div>
          )}
        </div>

        {/* ─── Back Face ───
            The back face carries its own rotateY(180deg). When the parent is also
            rotated 180deg (card flipped), the net is 0deg — content appears normal
            to the viewer and CSS absolute positions map 1:1 (right-2 = viewer's right).
        */}
        <div
          className="sakura-glass-surface absolute inset-0 rounded-2xl overflow-hidden border border-pink-100 shadow-sm bg-white flex flex-col items-center justify-center px-4 py-5"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Play / audio button — top-right (right-2 = viewer's right after net-0 rotation) */}
          <button
            className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full cursor-pointer text-[#f472b6] transition hover:scale-110"
            style={{
              background: "rgba(249,168,200,0.14)",
              border: "1px solid rgba(249,168,200,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
            title="Play audio intro"
          >
            <PlayIcon size={10} />
          </button>

          {/* Avatar */}
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-pink-200"
          />

          {/* Name header — inline status heart with tooltip, identical layout to front face */}
          <div className="flex items-center gap-1.5 mt-3">
            <div className="group/heart relative">
              <MenuHeartIcon
                status={creator.status}
                size={14}
                zzzColor="#9ca3af"
              />
              {/* Status tooltip — scoped to heart hover via named group, not the whole card group */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none opacity-0 invisible group-hover/heart:opacity-100 group-hover/heart:visible transition-all duration-200 z-10">
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 border-4 border-transparent"
                  style={{ borderBottomColor: "rgba(0,0,0,0.8)" }}
                />
                {STATUS_OPTIONS.find((s) => s.id === creator.status)?.label ??
                  creator.status}
              </div>
            </div>
            <span className="text-[#241a22] font-semibold text-sm">
              {creator.name}
            </span>
            <LevelBadge level={creator.level} size={14} />
          </div>

          <p className="text-[#b89aa8] text-xs mt-0.5">@{creator.username}</p>
          <p className="text-[#8c6d7f] text-xs text-center mt-3 leading-relaxed line-clamp-2">
            {creator.description}
          </p>

          {/* Same helper, same formatted price as the front badge */}
          {priceLabel && (
            <p className="flex items-center gap-1 text-[#241a22] font-bold text-sm mt-3">
              <VesoIcon size={13} />
              <span>{priceLabel}</span>
            </p>
          )}

          <div className="flex flex-col gap-2 w-full mt-3">
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-full border-2 border-[#f9a8c8] py-2 text-xs font-semibold text-[#f472b6] transition hover:bg-pink-50"
            >
              View Profile
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] py-2 text-xs font-semibold text-white shadow-md shadow-pink-200/50 transition hover:shadow-lg hover:from-[#f472b6] hover:to-[#ec4899]"
            >
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
