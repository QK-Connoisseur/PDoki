import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MemberLayout from "../components/MemberLayout";
import { useSimulatedFetch } from "../lib/useSimulatedFetch";
import { LoadingState, EmptyState, ErrorState } from "../components/StateViews";
import FollowButton from "../components/FollowButton";
import FeedMedia from "../components/FeedMedia";
import VesoIcon from "../components/VesoIcon";
import Avatar from "../components/Avatar";
import MomentAvatar from "../components/MomentAvatar";
import MomentComposer from "../components/MomentComposer";
import { sortMomentRail } from "../utils/sortMomentRail";
import { moments, feedPosts, fypPosts } from "../fixtures/homeFeed";

/* ─── Mock Data ──────────────────────────────────────────────────────── */

const FOLLOWED_USERNAMES = new Set(feedPosts.map((p) => p.username));

/* ─── Weighted FYP Feed Builder ──────────────────────────────────────── */

function buildWeightedFeed(suggestedPosts, followingPosts) {
  // Score each suggested post by engagement (comments weighted 3x)
  const scored = [...suggestedPosts]
    .map((p) => ({ ...p, _score: p.kokoros + p.comments * 3 }))
    .sort((a, b) => b._score - a._score);

  // 30% of the combined feed should come from following
  const followTarget = Math.ceil((scored.length + followingPosts.length) * 0.3);
  const followSlice = followingPosts.slice(0, followTarget);

  // Interleave: every 2 suggested posts, insert 1 following post
  const result = [];
  let fi = 0;
  for (let si = 0; si < scored.length; si++) {
    result.push(scored[si]);
    if ((si + 1) % 2 === 0 && fi < followSlice.length) {
      result.push(followSlice[fi++]);
    }
  }
  while (fi < followSlice.length) {
    result.push(followSlice[fi++]);
  }
  return result;
}

const MOMENT_GAP = 16;

/* ─── Verified Creator Badge ─────────────────────────────────────────── */

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#f9a8c8] shrink-0 ml-0.5"
      title="Verified Creator"
    >
      <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
        <path
          d="M2 5l2 2 4-4"
          stroke="#fff8fb"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function HomePage({ userStatus = "online", onStatusChange }) {
  const page = useSimulatedFetch();
  const navigate = useNavigate();
  const onViewProfile = () => navigate("/profile");
  const [showCompose, setShowCompose] = useState(false);
  const [kokoroStates, setKokoroStates] = useState({});
  const [unlockedPosts, setUnlockedPosts] = useState({});
  const [feedTab, setFeedTab] = useState("foryou");
  const [composeFontSize, setComposeFontSize] = useState("normal");
  const [composeFontColor, setComposeFontColor] = useState("#4a3340");
  const [composeBold, setComposeBold] = useState(false);
  const [composeItalic, setComposeItalic] = useState(false);
  const [composeLocked, setComposeLocked] = useState(false);
  const [composeVesoPrice, setComposeVesoPrice] = useState("");
  const [showVesoTooltip, setShowVesoTooltip] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeRightsConfirmed, setComposeRightsConfirmed] = useState(false);
  const [bookmarkStates, setBookmarkStates] = useState({});
  const [showMomentComposer, setShowMomentComposer] = useState(false);
  const [viewedMoments, setViewedMoments] = useState(new Set());
  const [previewMoment, setPreviewMoment] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [itemSize, setItemSize] = useState(82);
  const [lightboxPost, setLightboxPost] = useState(null);
  const [kokoroListPost, setKokoroListPost] = useState(null);
  const storiesRef = useRef(null);

  const updateScrollState = useCallback(() => {
    const el = storiesRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    setItemSize(
      Math.max(72, Math.floor((el.clientWidth - 5 * MOMENT_GAP) / 6))
    );
  }, []);

  useEffect(() => {
    if (page.status !== "ready") return undefined;
    const el = storiesRef.current;
    if (!el) return undefined;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [page.status, updateScrollState]);

  const handleMomentClick = (moment) => {
    if (moment.type === "own") {
      setShowMomentComposer(true);
    } else {
      setViewedMoments((prev) => new Set([...prev, moment.id]));
      setPreviewMoment(moment);
    }
  };

  const toggleKokoro = (postId) => {
    setKokoroStates((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleBookmark = (postId) => {
    setBookmarkStates((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const formatNumber = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return n.toString();
  };

  const sortedMoments = useMemo(
    () => sortMomentRail(moments, viewedMoments),
    [viewedMoments]
  );

  return (
    <MemberLayout
      activePage="home"
      visualVariant="sakura-glass"
      userStatus={userStatus}
      onStatusChange={onStatusChange}
      onLogoClick={() => {
        setFeedTab("foryou");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      onComposePost={() => setShowCompose(true)}
      onComposeMoment={() => setShowMomentComposer(true)}
    >
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .moment-item { transition: transform 180ms ease-out; }
        .moment-item:hover { transform: translateY(-2px); }
        .moment-item:active { transform: scale(0.97); transform-origin: center; }
        .moment-item-create:hover { transform: translateY(-3px); }
        .moment-item .moment-avatar-wrap { transition: transform 180ms ease-out, filter 200ms ease-out; }
        .moment-item:hover .moment-avatar-wrap { transform: scale(1.04); }
        .moment-item-create:hover .moment-avatar-wrap { filter: drop-shadow(0 0 9px rgba(244,114,182,0.45)); }
        @media (prefers-reduced-motion: reduce) {
          .moment-item, .moment-item:hover, .moment-item:active { transform: none !important; }
          .moment-item .moment-avatar-wrap, .moment-item:hover .moment-avatar-wrap { transform: none !important; filter: none !important; }
          .moment-item-create:hover .moment-avatar-wrap { filter: none !important; }
        }
      `}</style>

      <main className="flex-1 min-w-0 pb-20 md:pb-8">
        {page.status === "loading" ? (
          <LoadingState label="Loading your feed…" />
        ) : page.status === "error" ? (
          <ErrorState
            message="We couldn’t load your feed."
            onRetry={page.retry}
          />
        ) : page.status === "empty" ? (
          <EmptyState
            title="No posts yet"
            message="Follow some creators to see their posts here."
          />
        ) : (
          <>
            <div className="max-w-[650px] mx-auto px-4 pt-4">
              {/* ─── Moments Row ─────────────────────────────────────── */}
              <div className="mb-4 px-1 py-3" data-moments-rail>
                <div className="relative">
                  {/* Left scroll arrow */}
                  {canScrollLeft && (
                    <button
                      onClick={() =>
                        storiesRef.current?.scrollBy({
                          left: -(itemSize + MOMENT_GAP) * 3,
                          behavior: "smooth",
                        })
                      }
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-pink-200/60 text-[#e87cb8] shadow-lg shadow-pink-100/60 hover:bg-white/95 hover:shadow-pink-200/70 hover:text-[#df5f97] transition -translate-x-3"
                      aria-label="Scroll left"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                  )}

                  <div
                    ref={storiesRef}
                    data-moments-scroller
                    className="flex overflow-x-auto hide-scrollbar"
                    style={{
                      gap: `${MOMENT_GAP}px`,
                      paddingTop: "4px",
                      paddingBottom: "2px",
                    }}
                  >
                    {sortedMoments.map((moment) => {
                      const isViewed =
                        moment.type !== "own" && viewedMoments.has(moment.id);
                      return (
                        <button
                          key={moment.id}
                          className={`flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group moment-item${moment.type === "own" ? " moment-item-create" : ""}`}
                          onClick={() => handleMomentClick(moment)}
                        >
                          <div className="relative cursor-pointer moment-avatar-wrap">
                            <MomentAvatar
                              src={moment.avatar}
                              name={`moment-${moment.id}`}
                              type={moment.type}
                              size={itemSize}
                              viewed={isViewed}
                            />
                            {moment.type === "own" && (
                              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#f472b6] text-white ring-2 ring-white shadow-sm">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                >
                                  <path d="M12 5v14M5 12h14" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span
                            className={`text-[11px] font-medium truncate transition ${
                              isViewed
                                ? "text-[#b5aab2] opacity-75"
                                : "text-[#2d1e2b] group-hover:text-[#df5f97]"
                            }`}
                            style={{ maxWidth: `${itemSize}px` }}
                          >
                            {moment.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right scroll arrow */}
                  {canScrollRight && (
                    <button
                      onClick={() =>
                        storiesRef.current?.scrollBy({
                          left: (itemSize + MOMENT_GAP) * 3,
                          behavior: "smooth",
                        })
                      }
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-pink-200/60 text-[#e87cb8] shadow-lg shadow-pink-100/60 hover:bg-white/95 hover:shadow-pink-200/70 hover:text-[#df5f97] transition translate-x-3"
                      aria-label="Scroll right"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* ─── For You / Following Tabs ─────────────────────── */}
              <div className="flex mb-5 border-b border-pink-100">
                <button
                  onClick={() => setFeedTab("foryou")}
                  className={`flex-1 py-2.5 text-sm font-medium text-center transition relative cursor-pointer ${
                    feedTab === "foryou"
                      ? "text-[#241a22]"
                      : "text-[#b89aa8] hover:text-[#8c6d7f]"
                  }`}
                >
                  For You
                  {feedTab === "foryou" && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6]" />
                  )}
                </button>
                <button
                  onClick={() => setFeedTab("following")}
                  className={`flex-1 py-2.5 text-sm font-medium text-center transition relative cursor-pointer ${
                    feedTab === "following"
                      ? "text-[#241a22]"
                      : "text-[#b89aa8] hover:text-[#8c6d7f]"
                  }`}
                >
                  Following
                  {feedTab === "following" && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6]" />
                  )}
                </button>
              </div>

              {/* ─── Feed Posts ──────────────────────────────────────── */}
              <div className="space-y-5">
                {(feedTab === "following"
                  ? feedPosts
                  : buildWeightedFeed(fypPosts, feedPosts)
                ).map((post) => {
                  const isKokoro = kokoroStates[post.id] || false;
                  const kokoroCount = isKokoro
                    ? post.kokoros + 1
                    : post.kokoros;
                  const isBookmarked = bookmarkStates[post.id] || false;
                  const isUnlocked = unlockedPosts[post.id] || false;
                  const showLocked = post.locked && !isUnlocked;
                  return (
                    <article
                      key={post.id}
                      className="sakura-feed-card rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden"
                    >
                      {/* Post Header */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        {/* Publication avatar decoration is separate from Moments. */}
                        <button
                          onClick={onViewProfile}
                          className="shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f472b6] focus-visible:ring-offset-2"
                          aria-label={`View ${post.creator}'s profile`}
                        >
                          <Avatar
                            src={post.avatar}
                            alt={post.creator}
                            size={40}
                            decoration={post.avatarDecoration}
                          />
                        </button>

                        {/* Name line + username */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <button
                              onClick={onViewProfile}
                              className="text-sm font-semibold text-[#241a22] hover:text-[#df5f97] transition truncate cursor-pointer"
                            >
                              {post.creator}
                            </button>
                            {post.verified && <VerifiedBadge />}
                            <span
                              className="text-[#d4b8c7] text-xs mx-0.5 shrink-0"
                              aria-hidden
                            >
                              ·
                            </span>
                            <button
                              type="button"
                              onClick={() => setLightboxPost(post)}
                              className="text-[11px] text-[#c4a8b8] shrink-0 whitespace-nowrap hover:text-[#8c6d7f] transition cursor-pointer"
                              aria-label={`View post from ${post.timeAgo} ago`}
                            >
                              {post.timeAgo}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={onViewProfile}
                            className="text-xs text-[#b89aa8] hover:text-[#df5f97] transition cursor-pointer"
                            aria-label={`View @${post.username}'s profile`}
                          >
                            @{post.username}
                          </button>
                        </div>

                        {/* Follow button + overflow menu */}
                        <div className="flex items-center gap-2 shrink-0">
                          <FollowButton
                            username={post.username}
                            initialFollowing={FOLLOWED_USERNAMES.has(
                              post.username
                            )}
                          />
                          <button
                            className="text-[#b89aa8] hover:text-[#8c6d7f] transition cursor-pointer"
                            aria-label="More options"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="w-5 h-5"
                              fill="currentColor"
                            >
                              <circle cx="12" cy="5" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="19" r="1.5" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Caption with custom text style */}
                      <p
                        className="px-4 pb-3 text-sm text-[#4a3340] leading-relaxed"
                        style={post.style || {}}
                      >
                        {post.caption}
                      </p>

                      {/* Post media (image or video; blurred safe poster when locked) */}
                      <FeedMedia
                        post={post}
                        locked={showLocked}
                        onExpand={() => setLightboxPost(post)}
                      />

                      {/* ─── Locked Post: Media count bar + Unlock button ─── */}
                      {showLocked && (
                        <div>
                          {/* Media count & price bar */}
                          <div className="flex items-center justify-between px-4 py-2.5 text-[#8c6d7f]">
                            <div className="flex items-center gap-3 text-xs">
                              {post.mediaCount?.images > 0 && (
                                <span className="flex items-center gap-1">
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <rect
                                      x="3"
                                      y="3"
                                      width="18"
                                      height="18"
                                      rx="2"
                                    />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="M21 15l-5-5L5 21" />
                                  </svg>
                                  {post.mediaCount.images}
                                </span>
                              )}
                              {post.mediaCount?.images > 0 &&
                                post.mediaCount?.videos > 0 && (
                                  <span className="text-[#d4b8c7]">
                                    &middot;
                                  </span>
                                )}
                              {post.mediaCount?.videos > 0 && (
                                <span className="flex items-center gap-1">
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
                                    <rect
                                      x="1"
                                      y="5"
                                      width="15"
                                      height="14"
                                      rx="2"
                                    />
                                  </svg>
                                  {post.mediaCount.videos}
                                </span>
                              )}
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#5b4153]">
                              ${post.price}
                              <svg
                                viewBox="0 0 24 24"
                                className="w-3.5 h-3.5 text-[#8c6d7f]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="3"
                                  y="11"
                                  width="18"
                                  height="11"
                                  rx="2"
                                />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                              </svg>
                            </span>
                          </div>

                          {/* Unlock button */}
                          <div className="px-4 pb-3">
                            <button
                              onClick={() =>
                                setUnlockedPosts((prev) => ({
                                  ...prev,
                                  [post.id]: true,
                                }))
                              }
                              className="w-full rounded-full bg-[linear-gradient(110deg,#E7C978_0%,#F4E1A6_16%,#FFF7DE_40%,#FFEFBF_52%,#F2D47E_66%,#E7C978_100%)] py-3 text-sm font-bold text-[#2B1A10] tracking-wide uppercase ring-1 ring-amber-200/70 shadow-md shadow-amber-200/60 transition hover:shadow-lg hover:shadow-amber-300/60 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2D47E]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
                            >
                              Unlock Post for ${post.price}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ─── Post Actions (always visible) ─── */}
                      <div className="px-4 pt-3">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleKokoro(post.id)}
                            className={`flex items-center gap-1.5 transition cursor-pointer ${
                              isKokoro
                                ? "text-[#e8384f]"
                                : "text-[#8c6d7f] hover:text-[#e8384f]"
                            }`}
                            aria-label={
                              isKokoro ? "Remove Kokoro" : "Give Kokoro"
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="w-6 h-6"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill={isKokoro ? "currentColor" : "none"}
                              stroke="currentColor"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                          </button>

                          <button
                            className="text-[#8c6d7f] hover:text-[#5b4153] transition cursor-pointer"
                            aria-label="Comment"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => toggleBookmark(post.id)}
                            className={`transition cursor-pointer ${
                              isBookmarked
                                ? "text-[#fbbf24]"
                                : "text-[#8c6d7f] hover:text-[#fbbf24]"
                            }`}
                            aria-label={
                              isBookmarked ? "Remove Bookmark" : "Bookmark"
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="w-6 h-6"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill={isBookmarked ? "currentColor" : "none"}
                              stroke="currentColor"
                            >
                              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                            </svg>
                          </button>

                          <div className="flex-1" />

                          <button
                            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] pl-1.5 pr-3.5 py-1 text-sm font-bold text-white shadow-md shadow-pink-200/40 transition hover:shadow-lg hover:shadow-pink-300/50 hover:brightness-110 active:scale-[0.97] cursor-pointer"
                            aria-label="Send Love"
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-[13px] font-extrabold leading-none">
                              $
                            </span>
                            Send Love
                          </button>
                        </div>

                        <div className="flex flex-col items-start mt-2 gap-0.5">
                          <button
                            type="button"
                            onClick={() => setKokoroListPost(post)}
                            className="text-sm font-semibold text-[#241a22] hover:text-[#df5f97] transition cursor-pointer"
                            aria-label={`View ${formatNumber(kokoroCount)} Kokoros`}
                          >
                            {formatNumber(kokoroCount)} Kokoros
                          </button>

                          <button className="text-sm text-[#b89aa8] hover:text-[#8c6d7f] transition cursor-pointer">
                            View all {post.comments} comments
                          </button>
                        </div>

                        <div className="my-3 h-px bg-pink-50" />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      {/* ─── Compose Modal ─────────────────────────────────────────── */}
      {showCompose && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{
            background:
              "radial-gradient(ellipse at 60% 40%, rgba(249,168,200,0.18) 0%, rgba(0,0,0,0.52) 100%)",
            backdropFilter: "blur(6px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCompose(false);
              setComposeLocked(false);
              setComposeVesoPrice("");
              setComposeText("");
            }
          }}
        >
          {/* Outer glow ring — gold when locked, pink when open */}
          <div
            className="w-full max-w-lg rounded-[28px] p-[2px] transition-all duration-500"
            style={{
              background: composeLocked
                ? "linear-gradient(135deg, #f5b63b 0%, #f9a8c8 40%, #df5f97 70%, #f5b63b 100%)"
                : "linear-gradient(135deg, #ffd8e8 0%, #f9a8c8 50%, #fce4ec 100%)",
              boxShadow: composeLocked
                ? "0 0 40px 4px rgba(245,182,59,0.28), 0 8px 40px rgba(0,0,0,0.18)"
                : "0 8px 40px rgba(249,168,200,0.22), 0 4px 24px rgba(0,0,0,0.12)",
            }}
          >
            <div
              className="rounded-[26px] overflow-hidden"
              style={{
                background: composeLocked
                  ? "linear-gradient(160deg, #fffdf8 0%, #fff8fc 60%, #fff9f0 100%)"
                  : "#ffffff",
              }}
            >
              {/* ─── Header ─── */}
              <div
                className="relative flex items-center justify-between px-6 py-4"
                style={{
                  background: composeLocked
                    ? "linear-gradient(90deg, rgba(245,182,59,0.10) 0%, rgba(249,168,200,0.13) 100%)"
                    : "linear-gradient(90deg, rgba(249,168,200,0.08) 0%, rgba(255,255,255,0) 100%)",
                  borderBottom: composeLocked
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
                  {composeLocked && (
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
                  )}
                  {!composeLocked && (
                    <span
                      className="text-sm font-semibold tracking-wide"
                      style={{ color: "#241a22", letterSpacing: "0.04em" }}
                    >
                      Create
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowCompose(false);
                    setComposeLocked(false);
                    setComposeVesoPrice("");
                    setComposeText("");
                  }}
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
                        border: composeLocked
                          ? "2px solid #f5b63b"
                          : "2px solid #fce4ec",
                      }}
                    />
                    {composeLocked && (
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
                    value={composeText}
                    onChange={(e) => setComposeText(e.target.value)}
                    placeholder="Post a new drop..."
                    rows={4}
                    className="flex-1 resize-none rounded-2xl outline-none transition-all duration-300"
                    style={{
                      border: composeLocked
                        ? "1.5px solid rgba(245,182,59,0.35)"
                        : "1.5px solid #fce4ec",
                      background: composeLocked
                        ? "rgba(255,252,240,0.7)"
                        : "#fffafc",
                      padding: "12px 16px",
                      fontSize:
                        composeFontSize === "small"
                          ? "13px"
                          : composeFontSize === "large"
                            ? "18px"
                            : "14px",
                      fontWeight: composeBold ? "700" : "400",
                      fontStyle: composeItalic ? "italic" : "normal",
                      color: composeFontColor,
                    }}
                  />
                </div>

                {/* ─── Formatting toolbar ─── */}
                <div
                  className="mt-3 flex items-center gap-2 flex-wrap border-t pt-3"
                  style={{
                    borderColor: composeLocked
                      ? "rgba(245,182,59,0.18)"
                      : "#fce4ec",
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
                        onClick={() => setComposeFontSize(size.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold transition-all duration-150"
                        style={{
                          background:
                            composeFontSize === size.id
                              ? "linear-gradient(90deg,#f9a8c8,#f472b6)"
                              : "transparent",
                          color:
                            composeFontSize === size.id ? "#fff" : "#b89aa8",
                          borderRight: idx < 2 ? "1px solid #f9e4ef" : "none",
                        }}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>

                  {/* Bold — ghost */}
                  <button
                    onClick={() => setComposeBold(!composeBold)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all"
                    style={{
                      border: composeBold
                        ? "1.5px solid #f472b6"
                        : "1.5px solid #f9e4ef",
                      background: composeBold
                        ? "rgba(244,114,182,0.08)"
                        : "transparent",
                      color: composeBold ? "#f472b6" : "#b89aa8",
                    }}
                  >
                    B
                  </button>

                  {/* Italic — ghost */}
                  <button
                    onClick={() => setComposeItalic(!composeItalic)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-xs transition-all"
                    style={{
                      border: composeItalic
                        ? "1.5px solid #f472b6"
                        : "1.5px solid #f9e4ef",
                      background: composeItalic
                        ? "rgba(244,114,182,0.08)"
                        : "transparent",
                      color: composeItalic ? "#f472b6" : "#b89aa8",
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
                        onClick={() => setComposeFontColor(c.color)}
                        className="rounded-full transition-all duration-150"
                        style={{
                          width: "20px",
                          height: "20px",
                          background: c.color,
                          border:
                            composeFontColor === c.color
                              ? `2.5px solid #241a22`
                              : "2.5px solid transparent",
                          transform:
                            composeFontColor === c.color
                              ? "scale(1.2)"
                              : "scale(1)",
                          outline:
                            composeFontColor === c.color
                              ? "2px solid rgba(36,26,34,0.15)"
                              : "none",
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* ─── Veso price row — shown only when locked ─── */}
                {composeLocked && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="relative flex-shrink-0">
                      {/* Veso icon with tooltip */}
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full transition-all"
                        style={{
                          background: "linear-gradient(135deg,#f5b63b,#f9a8c8)",
                          boxShadow: "0 2px 8px rgba(245,182,59,0.3)",
                        }}
                        onMouseEnter={() => setShowVesoTooltip(true)}
                        onMouseLeave={() => setShowVesoTooltip(false)}
                        aria-label="Veso — 1 Veso = 1 Dollar"
                        type="button"
                      >
                        {/* Stylized kiss/lip Veso symbol */}
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                          fill="none"
                        >
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
                        <VesoIcon size={14} className="inline-block mr-0.5" />
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={composeVesoPrice}
                        onChange={(e) => setComposeVesoPrice(e.target.value)}
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
                    borderColor: composeLocked
                      ? "rgba(245,182,59,0.18)"
                      : "#fce4ec",
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
                    onClick={() => setComposeLocked(!composeLocked)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200"
                    style={{
                      border: composeLocked
                        ? "1.5px solid #f5b63b"
                        : "1.5px solid #f9e4ef",
                      background: composeLocked
                        ? "linear-gradient(90deg,rgba(245,182,59,0.12),rgba(249,168,200,0.10))"
                        : "transparent",
                      color: composeLocked ? "#b8860b" : "#b89aa8",
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
                      {composeLocked ? (
                        <>
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </>
                      ) : (
                        <>
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </>
                      )}
                    </svg>
                    {composeLocked ? "Locked" : "Lock"}
                  </button>

                  <div className="flex-1" />
                </div>

                {/* Upload Disclaimer */}
                <label
                  className={`mt-2 flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 transition ${composeRightsConfirmed ? "border-pink-200 bg-pink-50/40" : "border-pink-100 bg-white/30"}`}
                >
                  <input
                    type="checkbox"
                    checked={composeRightsConfirmed}
                    onChange={(e) =>
                      setComposeRightsConfirmed(e.target.checked)
                    }
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer rounded accent-[#df5f97]"
                  />
                  <span className="text-[10px] leading-relaxed text-[#9e8090]">
                    By uploading, I confirm I own the rights to this content and
                    it complies with the{" "}
                    <strong className="text-[#8c6d7f]">Acceptable Use</strong>{" "}
                    and{" "}
                    <strong className="text-[#8c6d7f]">
                      Non-Consensual Content Policies
                    </strong>
                    .
                  </span>
                </label>

                {/* Post CTA */}
                <div className="mt-2 flex justify-end">
                  <button
                    disabled={!composeRightsConfirmed}
                    onClick={() => {
                      setShowCompose(false);
                      setComposeLocked(false);
                      setComposeVesoPrice("");
                      setComposeText("");
                      setComposeRightsConfirmed(false);
                    }}
                    className="rounded-2xl px-6 py-2 text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: composeLocked
                        ? "linear-gradient(90deg,#f5b63b 0%,#f9a8c8 50%,#df5f97 100%)"
                        : "linear-gradient(90deg,#f9a8c8 0%,#f472b6 100%)",
                      boxShadow: composeRightsConfirmed
                        ? composeLocked
                          ? "0 4px 18px rgba(245,182,59,0.32), 0 2px 8px rgba(0,0,0,0.08)"
                          : "0 4px 14px rgba(249,168,200,0.40)"
                        : "none",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {composeLocked ? "Post - Locked" : "Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Moment Composer ───────────────────────────────────────── */}
      {showMomentComposer && (
        <MomentComposer onClose={() => setShowMomentComposer(false)} />
      )}

      {/* ─── Moment Preview (story viewer) ────────────────────────── */}
      {previewMoment && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center"
          style={{ background: "rgba(14,8,12,0.90)" }}
          onClick={() => setPreviewMoment(null)}
        >
          <div
            className="relative w-full max-w-xs mx-6 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mock progress bar */}
            <div className="flex gap-1 mb-3">
              <div className="h-0.5 flex-1 rounded-full bg-white/25 overflow-hidden">
                <div className="h-full w-3/5 rounded-full bg-white" />
              </div>
            </div>

            {/* Creator row */}
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src={previewMoment.avatar}
                alt={previewMoment.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-white/30"
              />
              <span className="text-white text-sm font-semibold">
                {previewMoment.name}
              </span>
              <span className="text-white/40 text-xs ml-auto">2h ago</span>
              <button
                onClick={() => setPreviewMoment(null)}
                className="ml-1 text-white/60 hover:text-white transition"
                aria-label="Close"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Moment image */}
            <div
              className="rounded-2xl overflow-hidden bg-black/40"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={previewMoment.avatar}
                alt={previewMoment.name}
                className="w-full h-full object-cover"
              />
              {previewMoment.type === "private" && (
                <div className="absolute bottom-4 left-4 right-4">
                  <span
                    className="flex items-center gap-1.5 justify-center rounded-full px-3 py-1.5 text-xs font-bold"
                    style={{
                      background: "linear-gradient(90deg,#D4A63A,#F7D774)",
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
                </div>
              )}
            </div>

            {/* Tap hint */}
            <p className="text-center text-white/30 text-xs mt-3">
              Tap outside to close
            </p>
          </div>
        </div>
      )}

      {/* ─── Media Lightbox ────────────────────────────────────────── */}
      {lightboxPost && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          style={{ background: "rgba(14,8,12,0.92)" }}
          onClick={() => setLightboxPost(null)}
        >
          <div
            className="relative max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm font-medium">
                {lightboxPost.creator}
              </span>
              <button
                onClick={() => setLightboxPost(null)}
                className="text-white/60 hover:text-white transition cursor-pointer"
                aria-label="Close lightbox"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            {lightboxPost.mediaType === "video" &&
            !lightboxPost.locked &&
            lightboxPost.videoSrc ? (
              <video
                src={lightboxPost.videoSrc}
                poster={lightboxPost.poster}
                controls
                playsInline
                className="w-full rounded-2xl object-contain max-h-[80vh] bg-black"
              />
            ) : (
              <img
                src={lightboxPost.image || lightboxPost.poster}
                alt={`Post by ${lightboxPost.creator}`}
                className="w-full rounded-2xl object-contain max-h-[80vh]"
              />
            )}
          </div>
        </div>
      )}

      {/* ─── Kokoro Likers Modal ────────────────────────────────────── */}
      {kokoroListPost && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{
            background: "rgba(14,8,12,0.62)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setKokoroListPost(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-pink-50">
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-[#e8384f]"
                  fill="currentColor"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                <h2 className="text-base font-bold text-[#241a22]">
                  {formatNumber(
                    kokoroStates[kokoroListPost.id]
                      ? kokoroListPost.kokoros + 1
                      : kokoroListPost.kokoros
                  )}{" "}
                  Kokoros
                </h2>
              </div>
              <button
                onClick={() => setKokoroListPost(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#8c6d7f] hover:bg-pink-50 hover:text-[#241a22] transition cursor-pointer"
                aria-label="Close likes list"
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

            {/* Likers list */}
            <div className="max-h-[55vh] overflow-y-auto px-4 py-3 space-y-1">
              {moments
                .filter((m) => m.type !== "own")
                .map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-xl px-1 py-2 hover:bg-pink-50/50 transition"
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#241a22] truncate leading-tight">
                        {m.name}
                      </p>
                      <p className="text-xs text-[#b89aa8]">@{m.username}</p>
                    </div>
                    <FollowButton
                      username={m.username}
                      initialFollowing={FOLLOWED_USERNAMES.has(m.username)}
                    />
                  </div>
                ))}
            </div>
            <div className="h-3" />
          </div>
        </div>
      )}
    </MemberLayout>
  );
}
