import { useState } from "react";

const Heart = ({ filled, className }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function FollowButton({
  initialFollowing = false,
  username,
  onFollow,
  onUnfollow,
  variant = "pill",
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isHovering, setIsHovering] = useState(false);
  const [heartPop, setHeartPop] = useState(false);

  const handleClick = async () => {
    const next = !isFollowing;
    setIsFollowing(next);
    if (next) {
      setHeartPop(true);
      setTimeout(() => setHeartPop(false), 700);
    }
    try {
      if (next) await onFollow?.(username);
      else await onUnfollow?.(username);
    } catch {
      setIsFollowing(!next);
    }
  };

  const isUnfollowHover = isFollowing && isHovering;
  const label = isFollowing
    ? isHovering
      ? "Unfollow"
      : "Following"
    : "Follow";
  const heartVisible =
    heartPop ||
    (isFollowing && !isUnfollowHover) ||
    (!isFollowing && isHovering);
  const heartFilled = isFollowing && !isUnfollowHover;

  if (variant === "hero") {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        aria-label={`${label} ${username}`}
        aria-pressed={isFollowing}
        className={[
          "relative inline-flex items-center gap-2 cursor-pointer",
          "bg-transparent border-none",
          "text-sm font-bold tracking-widest uppercase",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8384f]/60 focus-visible:ring-offset-2 rounded-sm",
          isUnfollowHover
            ? "text-[#e8384f]/55"
            : isFollowing
              ? "text-[#e8384f]/70"
              : "text-[#e8384f]",
        ].join(" ")}
      >
        <span
          className={[
            "transition-all duration-150",
            !isFollowing && isHovering
              ? "underline underline-offset-4 decoration-[#e8384f]/70"
              : isUnfollowHover
                ? "line-through decoration-[#e8384f]/40"
                : "",
          ].join(" ")}
        >
          {label}
        </span>
        <Heart
          filled={heartFilled}
          className={[
            "shrink-0 w-3.5 h-3.5 transition-all duration-200",
            heartPop ? "follow-heart-pop" : "",
            heartVisible ? "opacity-100 scale-100" : "opacity-0 scale-50",
          ].join(" ")}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={`${label} ${username}`}
      aria-pressed={isFollowing}
      className={[
        "relative inline-flex items-center gap-1 cursor-pointer",
        "px-2 py-1 bg-transparent border-none",
        "text-[11px] font-semibold tracking-wide",
        "transition-colors duration-200 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8384f]/50 focus-visible:ring-offset-1 rounded-sm",
        isUnfollowHover
          ? "text-[#e8384f]/55"
          : isFollowing
            ? "text-[#e8384f]/65"
            : "text-[#e8384f]",
      ].join(" ")}
    >
      <span
        className={[
          "transition-all duration-150",
          !isFollowing && isHovering
            ? "underline underline-offset-2 decoration-[#e8384f]/60"
            : isUnfollowHover
              ? "line-through decoration-[#e8384f]/40"
              : "",
        ].join(" ")}
      >
        {label}
      </span>
      <Heart
        filled={heartFilled}
        className={[
          "shrink-0 w-2.5 h-2.5 transition-all duration-200",
          heartPop ? "follow-heart-pop" : "",
          heartVisible ? "opacity-100 scale-100" : "opacity-0 scale-50",
        ].join(" ")}
      />
    </button>
  );
}
