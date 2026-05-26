import { useState } from "react";

export default function InlineFollowButton({
  username,
  isFollowing,
  onToggleFollow,
  size = "sm",
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [popping, setPopping] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isFollowing) {
      setPopping(true);
      setTimeout(() => setPopping(false), 500);
    }
    onToggleFollow?.(username);
  };

  const showUnfollow = isFollowing && isHovering;
  const label = showUnfollow ? "Unfollow" : "Follow";

  const isMd = size === "md";
  const iconCls = isMd ? "w-3.5 h-3.5" : "w-2.5 h-2.5";
  const circlePx = isMd ? 24 : 18;
  const expandedPx = isMd ? (showUnfollow ? 90 : 68) : showUnfollow ? 68 : 52;
  const textCls = isMd ? "text-[11px]" : "text-[9px]";

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={`${isFollowing ? "Unfollow" : "Follow"} ${username}`}
      aria-pressed={isFollowing}
      style={{
        width: isHovering ? `${expandedPx}px` : `${circlePx}px`,
        height: `${circlePx}px`,
      }}
      className={[
        "inline-flex items-center overflow-hidden cursor-pointer rounded-full border shrink-0",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8384f]/50",
        popping ? "scale-125" : "active:scale-95",
        showUnfollow
          ? "border-[#e8384f]/50 bg-[#e8384f]/10 text-[#e8384f]/80"
          : isFollowing
          ? "border-[#df5f97]/40 bg-[#df5f97]/10 text-[#df5f97]"
          : isHovering
          ? "border-[#e8384f] bg-[#e8384f]/15 text-[#e8384f] shadow-[0_0_8px_rgba(232,56,79,0.30)]"
          : "border-[#e8384f]/55 bg-transparent text-[#e8384f]",
      ].join(" ")}
    >
      <span
        className="flex items-center justify-center shrink-0"
        style={{ width: `${circlePx}px`, height: `${circlePx}px` }}
      >
        {showUnfollow ? (
          /* minus — signals "click to unfollow" */
          <svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        ) : (
          /* plus — used for both follow and following states; color/bg conveys active state */
          <svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </span>

      <span
        className={[
          `${textCls} font-semibold pr-2 whitespace-nowrap overflow-hidden transition-all duration-200`,
          isHovering ? "opacity-100 max-w-[80px]" : "opacity-0 max-w-0",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}
