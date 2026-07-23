import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Feed post media renderer.
 *
 * Images keep the existing behavior (blur when locked, lightbox on click).
 * Public videos autoplay muted/looped/inline when they become the primary
 * visible post; only one feed video plays at a time. PPV/locked video posts
 * render a safe poster only — the protected source must never reach the client
 * until server-side entitlement exists, so no <video> element is ever mounted
 * for a post with `post.locked`, even after a simulated unlock.
 */

/* Fraction of the media that must be visible before it counts as "primary". */
const PRIMARY_VISIBLE_RATIO = 0.6;

/* Module-level claim so at most one feed video plays at a time. */
let activeFeedPause = null;

function claimFeedPlayback(pause) {
  if (activeFeedPause && activeFeedPause !== pause) activeFeedPause();
  activeFeedPause = pause;
}

function releaseFeedPlayback(pause) {
  if (activeFeedPause === pause) activeFeedPause = null;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

function saveDataEnabled() {
  return Boolean(
    typeof navigator !== "undefined" && navigator.connection?.saveData
  );
}

const OVERLAY_BTN =
  "flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60 cursor-pointer";

function PlayGlyph({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="currentColor"
      aria-hidden
    >
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function MuteGlyph({ muted }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
      {muted ? (
        <path d="M23 9l-6 6M17 9l6 6" />
      ) : (
        <path d="M15.5 8.5a5 5 0 010 7M19 5a9 9 0 010 14" />
      )}
    </svg>
  );
}

function AutoplayingVideo({ post, allowAutoplay, onExpand }) {
  const videoRef = useRef(null);
  const manualPauseRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const autoplayEnabled =
    allowAutoplay && !prefersReducedMotion() && !saveDataEnabled();

  const pauseVideo = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const tryPlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    claimFeedPlayback(pauseVideo);
    const result = el.play();
    if (result && typeof result.catch === "function") {
      // Autoplay can be rejected by browser policy; stay on the poster.
      result.catch(() => {});
    }
  }, [pauseVideo]);

  // Track real playback state from media events.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return undefined;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, []);

  // Viewport-driven autoplay/pause.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !autoplayEnabled || typeof IntersectionObserver === "undefined")
      return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== el) return;
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= PRIMARY_VISIBLE_RATIO
          ) {
            if (!manualPauseRef.current) tryPlay();
          } else {
            pauseVideo();
            // A manual pause only holds while the post stays visible.
            if (!entry.isIntersecting) manualPauseRef.current = false;
          }
        });
      },
      { threshold: [0, PRIMARY_VISIBLE_RATIO] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoplayEnabled, tryPlay, pauseVideo]);

  // Pause when the tab is hidden.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) pauseVideo();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [pauseVideo]);

  // Pause and release the playback claim on unmount. Capture the element:
  // the ref may already be detached when the cleanup runs.
  useEffect(() => {
    const el = videoRef.current;
    return () => {
      el?.pause();
      releaseFeedPlayback(pauseVideo);
    };
  }, [pauseVideo]);

  const togglePlayback = () => {
    if (isPlaying) {
      manualPauseRef.current = true;
      pauseVideo();
    } else {
      manualPauseRef.current = false;
      tryPlay();
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  return (
    <div className="relative mx-4 rounded-xl overflow-hidden bg-black/5">
      <video
        ref={videoRef}
        src={post.videoSrc}
        poster={post.poster || post.image}
        muted={isMuted}
        loop
        playsInline
        preload={autoplayEnabled ? "metadata" : "none"}
        onClick={togglePlayback}
        className="w-full object-cover cursor-pointer"
        style={{ aspectRatio: post.aspectRatio || "16/9" }}
      />

      {/* Center play indicator while paused (decorative; controls below). */}
      {!isPlaying && (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
            <PlayGlyph className="w-6 h-6 translate-x-0.5" />
          </span>
        </span>
      )}

      {/* Unobtrusive overlay controls */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={togglePlayback}
          className={OVERLAY_BTN}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <PauseGlyph /> : <PlayGlyph />}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          className={OVERLAY_BTN}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          <MuteGlyph muted={isMuted} />
        </button>
      </div>

      {onExpand && (
        <button
          type="button"
          onClick={onExpand}
          className={`absolute top-2 right-2 ${OVERLAY_BTN}`}
          aria-label="Expand video"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function FeedMedia({
  post,
  locked,
  allowAutoplay = true,
  onExpand,
}) {
  const isVideo = post.mediaType === "video";

  // PPV/locked video posts render a safe poster only. The <video> element is
  // gated on the post never having been locked: real playback for purchased
  // content requires server-side entitlement delivery, not a client toggle.
  if (isVideo && (post.locked || !post.videoSrc)) {
    const poster = post.poster || post.image;
    return (
      <div className="mx-4 rounded-xl overflow-hidden">
        <img
          src={poster}
          alt={`Post by ${post.creator}`}
          className={`w-full object-cover ${locked ? "blur-sm scale-105" : ""}`}
          style={{ aspectRatio: post.aspectRatio || "16/9" }}
          loading="lazy"
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <AutoplayingVideo
        post={post}
        allowAutoplay={allowAutoplay}
        onExpand={onExpand}
      />
    );
  }

  // Image posts: unchanged behavior.
  if (locked) {
    return (
      <div className="mx-4 rounded-xl overflow-hidden">
        <img
          src={post.image}
          alt={`Post by ${post.creator}`}
          className="w-full object-cover blur-sm scale-105"
          style={{ aspectRatio: post.aspectRatio || "4/3" }}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onExpand}
      className="mx-4 block rounded-xl overflow-hidden cursor-pointer"
      aria-label={`View media by ${post.creator}`}
    >
      <img
        src={post.image}
        alt={`Post by ${post.creator}`}
        className="w-full object-cover"
        style={{ aspectRatio: post.aspectRatio || "4/3" }}
        loading="lazy"
      />
    </button>
  );
}
