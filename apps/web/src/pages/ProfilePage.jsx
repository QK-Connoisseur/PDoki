import { useState, useRef, useEffect, useMemo } from "react";
import { DokiTierBadgeRow } from "../components/DokiTierBadge";
import { useNavigate } from "react-router-dom";
import MemberLayout from "../components/MemberLayout";
import { useSimulatedFetch } from "../lib/useSimulatedFetch";
import { LoadingState, EmptyState, ErrorState } from "../components/StateViews";
import CreatePostModal from "../components/CreatePostModal";
import FollowButton from "../components/FollowButton";
import Avatar from "../components/Avatar";
import { StaticStatusBadge } from "../components/UserStatusSwitcher";
import MomentAvatar from "../components/MomentAvatar";
import MomentComposer from "../components/MomentComposer";
import { sortMomentRail } from "../utils/sortMomentRail";
import {
  profileData,
  profileMoments,
  profileServices,
  profileLongBio,
  profileReviews,
  profileSakuraLinks,
  profileFeedPosts,
  mediaStoreItems,
} from "../fixtures/profile";

/* ─── Shared Mock Data (layout) ──────────────────────────────────────── */

/* ─── Mock Profile Data ──────────────────────────────────────────────── */

/* ─── Long Bio for About Me ─────────────────────────────────────────── */

/* ─── Mock Reviews ──────────────────────────────────────────────────── */

/* ─── Media Store Items (LoyalFans-style PTV) ───────────────────────── */

/* ─── Service Icons ──────────────────────────────────────────────────── */

function ServiceIcon({ type, className = "w-6 h-6" }) {
  const icons = {
    video: (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
    camera: (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    gamepad: (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <line x1="15" y1="13" x2="15.01" y2="13" />
        <line x1="18" y1="11" x2="18.01" y2="11" />
        <path d="M17.32 5H6.68a4 4 0 00-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 019.828 16h4.344a2 2 0 011.414.586L17 18c.5.5 1 1 2 1a3 3 0 003-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0017.32 5z" />
      </svg>
    ),
    phone: (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    heart: (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    megaphone: (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  };
  return icons[type] || icons.heart;
}

/* ─── Social Icons ───────────────────────────────────────────────────── */

function SocialIcon({ platform, className = "w-4 h-4" }) {
  const icons = {
    twitter: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    instagram: (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    tiktok: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.26 8.26 0 004.77 1.52V6.84a4.84 4.84 0 01-1-.15z" />
      </svg>
    ),
  };
  return icons[platform] || null;
}

/* ─── Format Number ──────────────────────────────────────────────────── */

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

/* ─── Star Rating ────────────────────────────────────────────────────── */

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          className="w-3.5 h-3.5"
          fill={star <= Math.round(rating) ? "#fbbf24" : "#e5d6dc"}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-[#8c6d7f]">{rating}</span>
    </div>
  );
}

/* ─── Profile Page ───────────────────────────────────────────────────── */

export default function ProfilePage({ userStatus = "online", onStatusChange }) {
  const page = useSimulatedFetch();
  const navigate = useNavigate();
  const onBack = () => navigate("/home");
  const [activeTab, setActiveTab] = useState("services");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [kokoroStates, setKokoroStates] = useState({});
  const [unlockedPosts, setUnlockedPosts] = useState({});
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [storeFilter, setStoreFilter] = useState("all");
  const [storeSearch, setStoreSearch] = useState("");
  const [storeLayout, setStoreLayout] = useState("grid");
  const momentsRef = useRef(null);
  const [showMomentComposer, setShowMomentComposer] = useState(false);
  const [viewedMoments, setViewedMoments] = useState(new Set());
  const [previewMoment, setPreviewMoment] = useState(null);

  const handleMomentClick = (moment) => {
    setViewedMoments((prev) => new Set([...prev, moment.id]));
    setPreviewMoment(moment);
  };

  // Layout states (shared with HomePage)
  const [showCompose, setShowCompose] = useState(false);
  const [composeFontSize, setComposeFontSize] = useState("normal");
  const [composeFontColor, setComposeFontColor] = useState("#4a3340");
  const [composeBold, setComposeBold] = useState(false);
  const [composeItalic, setComposeItalic] = useState(false);
  const [composeLocked, setComposeLocked] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeVesoPrice, setComposeVesoPrice] = useState("");

  const profile = profileData;

  const sortedProfileMoments = useMemo(
    () => sortMomentRail(profileMoments, viewedMoments),
    [viewedMoments]
  );

  const toggleKokoro = (postId) => {
    setKokoroStates((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const tabs = [
    { id: "services", label: "Services" },
    { id: "feed", label: "Feed" },
    { id: "store", label: "Media Store" },
  ];

  const filteredStoreItems = mediaStoreItems.filter((item) => {
    const matchesFilter = storeFilter === "all" || item.type === storeFilter;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(storeSearch.toLowerCase());
    const matchesFree =
      !showFreeOnly || item.price === 0 || item.price === "0.00";
    return matchesFilter && matchesSearch && matchesFree;
  });

  const selectedService = selectedServiceId
    ? profileServices.find((s) => s.id === selectedServiceId)
    : null;

  const filteredServices = profileServices.filter((s) =>
    s.title.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const totalServed = profileServices.reduce((sum, s) => sum + s.reviews, 0);
  const avgRating = (
    profileServices.reduce((sum, s) => sum + s.rating, 0) /
    profileServices.length
  ).toFixed(1);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-dropdown]")) {
        setShowMoreOptions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <MemberLayout
      activePage="profile"
      userStatus={userStatus}
      onStatusChange={onStatusChange}
      onComposePost={() => setShowCompose(true)}
      onComposeMoment={() => setShowMomentComposer(true)}
    >
      <main className="flex-1 min-w-0 pb-20 md:pb-8">
        {page.status === "loading" ? (
          <LoadingState label="Loading profile…" />
        ) : page.status === "error" ? (
          <ErrorState
            message="We couldn’t load this profile."
            onRetry={page.retry}
          />
        ) : page.status === "empty" ? (
          <EmptyState
            title="Nothing here yet"
            message="This creator hasn’t posted anything yet."
          />
        ) : (
          <>
            {/* ─── Banner with Profile Info (ePal-style) ─────────────── */}
            <div className="relative">
              {/* Banner Image */}
              <div className="h-56 sm:h-64 md:h-72 w-full overflow-hidden">
                <img
                  src={profile.banner}
                  alt="Profile banner"
                  className="h-full w-full object-cover"
                />
                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Back Button */}
              <button
                onClick={onBack}
                className="absolute top-4 left-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
                aria-label="Go back"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Profile Info Overlay on Banner — vertically centered & max-width centered */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full max-w-[1500px] mx-auto px-6 md:px-10 lg:px-14 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* ─── LEFT SIDE: Avatar + Info ─── */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white/20 object-cover"
                      />
                    </div>

                    {/* Name, Username, Stats, Bio */}
                    <div className="min-w-0">
                      {/* Name + Verified */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                          {profile.name}
                        </h1>
                        {profile.verified && (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 shrink-0 drop-shadow-md"
                            fill="#f472b6"
                          >
                            <path
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              stroke="#fff"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Username */}
                      <p className="text-sm text-white/70 mt-0.5">
                        @{profile.username}
                      </p>

                      {/* Creator status — view-only badge */}
                      <div className="mt-2">
                        <StaticStatusBadge
                          status={profile.online ? "online" : "offline"}
                        />
                      </div>

                      {/* Stats */}
                      <div className="mt-1.5 flex items-center gap-4">
                        {[
                          { value: profile.posts, label: "Posts" },
                          { value: profile.followers, label: "Followers" },
                          { value: profile.following, label: "Following" },
                        ].map((stat) => (
                          <span
                            key={stat.label}
                            className="text-xs text-white/80"
                          >
                            <span className="font-bold text-white">
                              {formatNumber(stat.value)}
                            </span>{" "}
                            {stat.label}
                          </span>
                        ))}
                      </div>

                      {/* Bio */}
                      <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed max-w-md line-clamp-2">
                        {profile.bio}
                      </p>

                      {/* Tier Badge */}
                      {profile.tier && <DokiTierBadgeRow tier={profile.tier} />}
                    </div>
                  </div>

                  {/* ─── RIGHT SIDE: Actions + Socials ─── */}
                  <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Follow */}
                      <FollowButton
                        username={profile.username}
                        variant="hero"
                      />

                      {/* Subscribe */}
                      <button className="rounded-xl border-2 border-[#e8384f] bg-[#e8384f]/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-[#e8384f] hover:shadow-md hover:shadow-red-500/30">
                        Subscribe &middot; ${profile.subscriptionPrice}/mo
                      </button>

                      {/* Message */}
                      <button
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
                        aria-label="Message"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                      </button>

                      {/* More Options (3 dots) */}
                      <div className="relative" data-dropdown>
                        <button
                          onClick={() => setShowMoreOptions(!showMoreOptions)}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
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
                        {showMoreOptions && (
                          <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-pink-100 bg-white py-2 shadow-xl overflow-hidden z-50">
                            {[
                              {
                                label: "Share Profile",
                                icon: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
                              },
                              {
                                label: "Block",
                                icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
                              },
                              {
                                label: "Report",
                                icon: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
                              },
                            ].map((item) => (
                              <button
                                key={item.label}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-pink-50/60 ${
                                  item.label === "Block" ||
                                  item.label === "Report"
                                    ? "text-[#e8384f] hover:bg-red-50/60"
                                    : "text-[#5b4153] hover:text-[#df5f97]"
                                }`}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4 shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d={item.icon} />
                                </svg>
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Socials */}
                    <div className="flex items-center gap-3">
                      {profile.socials.map((social) => (
                        <a
                          key={social.platform}
                          href={social.url}
                          className="flex items-center gap-1.5 text-xs text-white/70 transition hover:text-white"
                        >
                          <SocialIcon
                            platform={social.platform}
                            className="w-3.5 h-3.5"
                          />
                          <span className="hidden sm:inline">
                            {social.handle}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Moments (under banner, ePal-style semi-transparent boxes) ── */}
            <div className="py-4">
              <div
                ref={momentsRef}
                className="flex gap-3 overflow-x-auto hide-scrollbar justify-center max-w-[1500px] mx-auto px-4"
              >
                {sortedProfileMoments.map((moment) => {
                  const isViewed = viewedMoments.has(moment.id);
                  return (
                    <button
                      key={moment.id}
                      className="flex flex-col items-center gap-1.5 shrink-0 group"
                      onClick={() => handleMomentClick(moment)}
                    >
                      <div className="relative">
                        <MomentAvatar
                          src={moment.thumb}
                          name={`pmom-${moment.id}`}
                          type={moment.type}
                          size={68}
                          viewed={isViewed}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-medium max-w-[72px] truncate px-2.5 py-0.5 rounded-full backdrop-blur-sm transition ${
                          isViewed
                            ? "text-[#b0a0a8] bg-[#5b4153]/06"
                            : "text-[#4a3340] bg-[#5b4153]/10 group-hover:bg-[#f472b6]/15 group-hover:text-[#df5f97]"
                        }`}
                      >
                        {moment.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── Tabs ──────────────────────────────────────────────── */}
            <div className="px-4 sm:px-6 border-b border-pink-100">
              <div className="flex gap-1 max-w-[1500px] mx-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id !== "services") setSelectedServiceId(null);
                    }}
                    className={`px-6 py-3 text-sm font-medium transition relative ${
                      activeTab === tab.id
                        ? "text-[#241a22]"
                        : "text-[#b89aa8] hover:text-[#8c6d7f]"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Tab Content ───────────────────────────────────────── */}

            {/* ═══ Services Tab (ePal-style 3-column) ═══ */}
            {activeTab === "services" && (
              <div className="max-w-[1500px] mx-auto px-4 pt-5 pb-12">
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* ── Left: Service Sidebar ────────────────────────── */}
                  <div className="w-[280px] shrink-0 hidden lg:block">
                    <div className="sakura-glass-surface sticky top-20 space-y-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      {/* Search */}
                      <div className="relative mb-3">
                        <svg
                          viewBox="0 0 24 24"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b89aa8]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search"
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          className="w-full rounded-xl border border-pink-100 bg-white pl-10 pr-4 py-2.5 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300 transition"
                        />
                      </div>

                      {/* About Me item */}
                      <button
                        onClick={() => setSelectedServiceId(null)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                          !selectedServiceId
                            ? "bg-gradient-to-r from-[#f9a8c8]/20 to-[#f472b6]/20 border border-pink-200 shadow-sm"
                            : "border border-transparent hover:bg-pink-50/60"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            !selectedServiceId
                              ? "bg-gradient-to-br from-[#f9a8c8] to-[#f472b6] text-white"
                              : "bg-pink-50 text-[#f472b6]"
                          }`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
                          </svg>
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold truncate ${!selectedServiceId ? "text-[#241a22]" : "text-[#5b4153]"}`}
                          >
                            About Me
                          </p>
                        </div>
                      </button>

                      {/* Service items */}
                      {filteredServices.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setSelectedServiceId(service.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                            selectedServiceId === service.id
                              ? "bg-gradient-to-r from-[#f9a8c8]/20 to-[#f472b6]/20 border border-pink-200 shadow-sm"
                              : "border border-transparent hover:bg-pink-50/60"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              selectedServiceId === service.id
                                ? "bg-gradient-to-br from-[#f9a8c8] to-[#f472b6] text-white"
                                : "bg-pink-50 text-[#f472b6]"
                            }`}
                          >
                            <ServiceIcon
                              type={service.icon}
                              className="w-5 h-5"
                            />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <p
                              className={`text-sm font-semibold truncate ${selectedServiceId === service.id ? "text-[#241a22]" : "text-[#5b4153]"}`}
                            >
                              {service.title}
                            </p>
                            <p className="mt-1">
                              <span className="bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                ${service.price} / {service.duration}
                              </span>
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Mobile Service Selector (horizontal scroll) ──── */}
                  <div className="lg:hidden w-full mb-4">
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                      <button
                        onClick={() => setSelectedServiceId(null)}
                        className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                          !selectedServiceId
                            ? "bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white shadow-sm"
                            : "border border-pink-100 bg-white text-[#8c6d7f] hover:border-pink-200"
                        }`}
                      >
                        About Me
                      </button>
                      {profileServices.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setSelectedServiceId(service.id)}
                          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                            selectedServiceId === service.id
                              ? "bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white shadow-sm"
                              : "border border-pink-100 bg-white text-[#8c6d7f] hover:border-pink-200"
                          }`}
                        >
                          {service.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Center: Content Area ──────────────────────────── */}
                  <div className="flex-1 min-w-0">
                    <div className="sakura-glass-surface rounded-2xl border border-pink-100 bg-white overflow-hidden shadow-sm">
                      {/* ── About Me View ──────────────────────────────── */}
                      {!selectedServiceId && (
                        <div className="p-6">
                          {/* Title + stats row */}
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <h2 className="text-xl font-bold text-[#241a22]">
                              About Me
                            </h2>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">
                                <svg
                                  viewBox="0 0 20 20"
                                  className="w-3.5 h-3.5 text-amber-400"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm font-bold">
                                  {avgRating}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-pink-50 text-pink-600 px-3 py-1.5 rounded-full">
                                <span className="text-sm font-bold">
                                  {totalServed}
                                </span>
                                <span className="text-xs font-medium">
                                  Served
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* ── Bio card ── */}
                          <div className="mt-5 rounded-xl border border-pink-100 bg-[#fffafc] p-4">
                            <h3 className="text-sm font-bold text-[#5b4153] uppercase tracking-wide mb-3">
                              Bio
                            </h3>
                            <p className="text-sm text-[#4a3340] leading-loose whitespace-pre-line">
                              {profileLongBio}
                            </p>
                          </div>

                          {/* ── Style & Platforms card ── */}
                          <div className="mt-5 rounded-xl border border-pink-100 bg-[#fffafc] p-4">
                            <h3 className="text-sm font-bold text-[#5b4153] uppercase tracking-wide mb-3">
                              Style &amp; Platforms
                            </h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                              <div>
                                <span className="text-xs text-[#8c6d7f] font-medium">
                                  Styles
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {["Friendly", "Talkative", "Sweet"].map(
                                    (tag) => (
                                      <span
                                        key={tag}
                                        className="inline-block bg-pink-50 text-[#8c6d7f] rounded-full px-3 py-1 text-xs font-medium border border-pink-100"
                                      >
                                        {tag}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-[#8c6d7f] font-medium">
                                  Platforms
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {["Discord", "Zoom", "Messaging"].map(
                                    (tag) => (
                                      <span
                                        key={tag}
                                        className="inline-block bg-pink-50 text-[#8c6d7f] rounded-full px-3 py-1 text-xs font-medium border border-pink-100"
                                      >
                                        {tag}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── Sakura Links card ── */}
                          <div className="mt-5 rounded-xl border border-pink-100 overflow-hidden">
                            {/* Header panel with blossom gradient */}
                            <div
                              className="px-4 py-3 flex items-center gap-2.5"
                              style={{
                                background:
                                  "linear-gradient(135deg, #fff0f6 0%, #fce7f3 50%, #fdf2f8 100%)",
                              }}
                            >
                              {/* Petal cluster decoration */}
                              <svg
                                viewBox="0 0 28 28"
                                className="w-6 h-6 shrink-0"
                                aria-hidden="true"
                              >
                                <g transform="translate(14,14)">
                                  <ellipse
                                    cx="0"
                                    cy="-5"
                                    rx="2.8"
                                    ry="4.2"
                                    fill="#f9a8d4"
                                    opacity="0.85"
                                    transform="rotate(0)"
                                  />
                                  <ellipse
                                    cx="0"
                                    cy="-5"
                                    rx="2.8"
                                    ry="4.2"
                                    fill="#f472b6"
                                    opacity="0.75"
                                    transform="rotate(72)"
                                  />
                                  <ellipse
                                    cx="0"
                                    cy="-5"
                                    rx="2.8"
                                    ry="4.2"
                                    fill="#f9a8d4"
                                    opacity="0.85"
                                    transform="rotate(144)"
                                  />
                                  <ellipse
                                    cx="0"
                                    cy="-5"
                                    rx="2.8"
                                    ry="4.2"
                                    fill="#f472b6"
                                    opacity="0.75"
                                    transform="rotate(216)"
                                  />
                                  <ellipse
                                    cx="0"
                                    cy="-5"
                                    rx="2.8"
                                    ry="4.2"
                                    fill="#f9a8d4"
                                    opacity="0.85"
                                    transform="rotate(288)"
                                  />
                                  <circle
                                    cx="0"
                                    cy="0"
                                    r="2.5"
                                    fill="#fbbf24"
                                  />
                                  <circle
                                    cx="1"
                                    cy="-1"
                                    r="0.6"
                                    fill="#fff"
                                    opacity="0.8"
                                  />
                                </g>
                              </svg>
                              <h3 className="text-sm font-bold text-[#5b4153] uppercase tracking-wide">
                                Sakura Links
                              </h3>
                            </div>

                            {/* Links */}
                            <div className="bg-[#fffafc] divide-y divide-pink-50">
                              {profileSakuraLinks.length === 0 ? (
                                <p className="px-4 py-5 text-sm text-[#b89aa8] text-center">
                                  No links added yet
                                </p>
                              ) : (
                                profileSakuraLinks.map((link) => {
                                  const platformMeta = {
                                    instagram: {
                                      color: "#e1306c",
                                      bg: "#fff0f6",
                                      icon: (
                                        <svg
                                          viewBox="0 0 24 24"
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <rect
                                            x="2"
                                            y="2"
                                            width="20"
                                            height="20"
                                            rx="5"
                                          />
                                          <circle cx="12" cy="12" r="5" />
                                          <circle
                                            cx="17.5"
                                            cy="6.5"
                                            r="1.5"
                                            fill="currentColor"
                                            stroke="none"
                                          />
                                        </svg>
                                      ),
                                    },
                                    twitter: {
                                      color: "#1a1a1a",
                                      bg: "#f9f9f9",
                                      icon: (
                                        <svg
                                          viewBox="0 0 24 24"
                                          className="w-4 h-4"
                                          fill="currentColor"
                                        >
                                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                      ),
                                    },
                                    tiktok: {
                                      color: "#010101",
                                      bg: "#f5f5f5",
                                      icon: (
                                        <svg
                                          viewBox="0 0 24 24"
                                          className="w-4 h-4"
                                          fill="currentColor"
                                        >
                                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.26 8.26 0 004.77 1.52V6.84a4.84 4.84 0 01-1-.15z" />
                                        </svg>
                                      ),
                                    },
                                    youtube: {
                                      color: "#ff0000",
                                      bg: "#fff5f5",
                                      icon: (
                                        <svg
                                          viewBox="0 0 24 24"
                                          className="w-4 h-4"
                                          fill="currentColor"
                                        >
                                          <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
                                        </svg>
                                      ),
                                    },
                                    discord: {
                                      color: "#5865f2",
                                      bg: "#f0f1ff",
                                      icon: (
                                        <svg
                                          viewBox="0 0 24 24"
                                          className="w-4 h-4"
                                          fill="currentColor"
                                        >
                                          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                        </svg>
                                      ),
                                    },
                                  };
                                  const meta = platformMeta[link.platform] || {
                                    color: "#8c6d7f",
                                    bg: "#fdf2f8",
                                    icon: (
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                                      </svg>
                                    ),
                                  };
                                  return (
                                    <a
                                      key={link.id}
                                      href={link.url}
                                      target="_blank"
                                      rel="noreferrer noopener"
                                      className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-pink-50/70 group min-h-[56px]"
                                    >
                                      {/* Platform icon badge */}
                                      <span
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm transition group-hover:scale-105"
                                        style={{
                                          background: meta.bg,
                                          color: meta.color,
                                        }}
                                      >
                                        {meta.icon}
                                      </span>

                                      {/* Label + handle */}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#241a22] leading-none">
                                          {link.label}
                                        </p>
                                        {link.handle && (
                                          <p className="mt-0.5 text-xs text-[#b89aa8] truncate">
                                            {link.handle}
                                          </p>
                                        )}
                                      </div>

                                      {/* Arrow */}
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-4 h-4 shrink-0 text-[#d4a0b8] group-hover:text-[#f472b6] transition"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                                      </svg>
                                    </a>
                                  );
                                })
                              )}
                            </div>

                            {/* Footer petal strip */}
                            <div
                              className="flex items-center justify-center gap-1.5 py-2"
                              style={{
                                background:
                                  "linear-gradient(135deg, #fff0f6 0%, #fce7f3 100%)",
                              }}
                            >
                              {[
                                "#fda4c4",
                                "#f9a8d4",
                                "#f472b6",
                                "#f9a8d4",
                                "#fda4c4",
                              ].map((c, i) => (
                                <svg
                                  key={i}
                                  viewBox="0 0 12 12"
                                  className="w-2.5 h-2.5"
                                  aria-hidden="true"
                                >
                                  <ellipse
                                    cx="6"
                                    cy="3"
                                    rx="2.2"
                                    ry="3.2"
                                    fill={c}
                                    opacity="0.7"
                                    transform={`rotate(${i * 36} 6 6)`}
                                  />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Selected Service Detail View ───────────────── */}
                      {selectedService && (
                        <div className="p-6">
                          {/* Service Title + Action */}
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#241a22]">
                              {selectedService.title}
                            </h2>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white shadow-md hover:shadow-lg transition">
                              <svg
                                viewBox="0 0 24 24"
                                className="w-5 h-5"
                                fill="currentColor"
                              >
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            </button>
                          </div>

                          {/* Rating & Served */}
                          <div className="flex items-center gap-2 mt-2">
                            <svg
                              viewBox="0 0 20 20"
                              className="w-4 h-4"
                              fill="#fbbf24"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-bold text-[#241a22]">
                              {selectedService.rating}
                            </span>
                            <span className="text-[#8c6d7f]">&middot;</span>
                            <span className="text-sm text-[#8c6d7f]">
                              {selectedService.reviews} Served
                            </span>
                          </div>

                          {/* ── Section 1: Service Description ── */}
                          <div className="mt-6 rounded-xl border border-pink-100 bg-[#fffafc] p-4">
                            <h3 className="text-sm font-bold text-[#5b4153] uppercase tracking-wide mb-3">
                              Service Description
                            </h3>
                            <p className="text-sm text-[#4a3340] leading-relaxed">
                              {selectedService.description}
                            </p>

                            {/* Styles & Platforms */}
                            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                              <div>
                                <span className="text-sm font-semibold text-[#5b4153]">
                                  Styles
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {(selectedService.styles || "N/A")
                                    .split(", ")
                                    .map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-block bg-pink-50 text-[#8c6d7f] rounded-full px-3 py-1 text-xs font-medium border border-pink-100"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-[#5b4153]">
                                  Platforms
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {(selectedService.platforms || "N/A")
                                    .split(", ")
                                    .map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-block bg-pink-50 text-[#8c6d7f] rounded-full px-3 py-1 text-xs font-medium border border-pink-100"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── Section 2: Pricing and Details ── */}
                          <div className="mt-5 rounded-xl border border-pink-100 bg-[#fffafc] p-4">
                            <h3 className="text-sm font-bold text-[#5b4153] uppercase tracking-wide mb-3">
                              Pricing and Details
                            </h3>

                            {/* Price & Duration */}
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-white border border-pink-100">
                              <div>
                                <span className="text-xs text-[#8c6d7f] uppercase tracking-wide">
                                  Price
                                </span>
                                <p className="text-lg font-bold text-[#241a22]">
                                  ${selectedService.price}
                                </p>
                              </div>
                              <div className="w-px h-8 bg-pink-200" />
                              <div>
                                <span className="text-xs text-[#8c6d7f] uppercase tracking-wide">
                                  Duration
                                </span>
                                <p className="text-lg font-bold text-[#241a22]">
                                  {selectedService.duration}
                                </p>
                              </div>
                            </div>

                            {/* Mobile Order Button */}
                            <div className="xl:hidden mt-4 flex gap-3">
                              <button className="flex-1 py-3 rounded-xl border-2 border-pink-200 text-[#241a22] font-semibold text-sm hover:bg-pink-50 transition">
                                Chat
                              </button>
                              <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white font-semibold text-sm shadow-md shadow-pink-200/40 hover:shadow-lg transition">
                                Order Now
                              </button>
                            </div>

                            {/* Other services list */}
                            <div className="mt-4 space-y-1">
                              {profileServices
                                .filter((s) => s.id !== selectedServiceId)
                                .map((service) => (
                                  <button
                                    key={service.id}
                                    onClick={() =>
                                      setSelectedServiceId(service.id)
                                    }
                                    className="w-full flex items-center justify-between py-3 px-3 rounded-xl hover:bg-pink-50/60 transition group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-[#f472b6] group-hover:bg-[#f9a8c8]/30 transition">
                                        <ServiceIcon
                                          type={service.icon}
                                          className="w-4 h-4"
                                        />
                                      </div>
                                      <span className="text-sm font-medium text-[#241a22]">
                                        {service.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center gap-1.5 text-sm text-[#4a3340] font-semibold">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                                        ${service.price}
                                      </span>
                                      <span className="text-xs text-[#b89aa8]">
                                        /{service.duration}
                                      </span>
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="w-4 h-4 text-[#b89aa8] group-hover:text-[#f472b6] transition"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M9 18l6-6-6-6" />
                                      </svg>
                                    </div>
                                  </button>
                                ))}
                            </div>
                          </div>

                          {/* ── Section 3: Reviews ── */}
                          <div className="mt-5 rounded-xl border border-pink-100 bg-[#fffafc] p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-bold text-[#5b4153] uppercase tracking-wide">
                                Reviews
                              </h3>
                              <div className="flex items-center gap-1.5">
                                <svg
                                  viewBox="0 0 20 20"
                                  className="w-4 h-4"
                                  fill="#fbbf24"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-bold text-[#241a22] text-sm">
                                  {selectedService.rating}
                                </span>
                                <span className="text-[#8c6d7f] text-sm">
                                  &middot;
                                </span>
                                <span className="text-sm text-[#8c6d7f]">
                                  {profileReviews.filter(
                                    (r) => r.service === selectedService.title
                                  ).length || profileReviews.length}{" "}
                                  Reviews
                                </span>
                              </div>
                            </div>
                            <div className="space-y-4">
                              {profileReviews
                                .filter(
                                  (r) =>
                                    r.service === selectedService.title ||
                                    profileReviews.filter(
                                      (r2) =>
                                        r2.service === selectedService.title
                                    ).length === 0
                                )
                                .slice(0, 3)
                                .map((review) => (
                                  <div
                                    key={review.id}
                                    className="flex gap-3 pb-4 border-b border-pink-100 last:border-0"
                                  >
                                    <img
                                      src={review.avatar}
                                      alt={review.user}
                                      className="h-10 w-10 rounded-full object-cover shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-[#241a22]">
                                          {review.user}
                                        </span>
                                        <span className="text-xs text-[#b89aa8]">
                                          {review.time}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <svg
                                            key={s}
                                            viewBox="0 0 20 20"
                                            className="w-3 h-3"
                                            fill={
                                              s <= review.rating
                                                ? "#fbbf24"
                                                : "#e5d6dc"
                                            }
                                          >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                      </div>
                                      <p className="mt-1.5 text-sm text-[#4a3340] leading-relaxed">
                                        {review.text}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Right: Creator Card ───────────────────────────── */}
                  <div className="w-[260px] shrink-0 hidden xl:block">
                    <div className="sakura-glass-surface sticky top-20 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-full aspect-[3/4] rounded-2xl object-cover shadow-md"
                      />
                      <div className="mt-4 space-y-2.5">
                        <button className="w-full py-3 rounded-xl border-2 border-pink-200 text-[#241a22] font-semibold text-sm hover:bg-pink-50 transition">
                          Chat
                        </button>
                        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white font-semibold text-sm shadow-md shadow-pink-200/40 hover:shadow-lg hover:from-[#f472b6] hover:to-[#ec4899] transition">
                          Order Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Feed Tab ═══ */}
            {activeTab === "feed" && (
              <div className="max-w-[650px] mx-auto px-4 pt-5 pb-12 space-y-5">
                {profileFeedPosts.map((post) => {
                  const isKokoro = kokoroStates[post.id] || false;
                  const kokoroCount = isKokoro
                    ? post.kokoros + 1
                    : post.kokoros;
                  const isUnlocked = unlockedPosts[post.id] || false;
                  const showLocked = post.locked && !isUnlocked;

                  return (
                    <article
                      key={post.id}
                      className="sakura-glass-surface rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden"
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Avatar
                          src={profile.avatar}
                          alt={profile.name}
                          size={40}
                          decoration={profile.avatarDecoration}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-[#241a22] truncate">
                              {profile.name}
                            </p>
                            {profile.verified && (
                              <svg
                                viewBox="0 0 24 24"
                                className="w-3.5 h-3.5 shrink-0"
                                fill="#f472b6"
                              >
                                <path
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  stroke="#fff"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <p className="text-xs text-[#b89aa8]">
                            {post.timeAgo} ago
                          </p>
                        </div>
                        <button
                          className="text-[#b89aa8] hover:text-[#8c6d7f] transition"
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
                      <p
                        className="member-post-caption px-4 pb-3 text-sm text-[#4a3340] leading-relaxed"
                        style={{
                          ...post.style,
                          "--authored-caption-color": post.style?.color,
                          color:
                            "var(--member-caption-color, var(--authored-caption-color, #4a3340))",
                        }}
                      >
                        {post.caption}
                      </p>
                      <div className="mx-4 rounded-xl overflow-hidden">
                        <img
                          src={post.image}
                          alt="Post"
                          className={`w-full object-cover ${showLocked ? "blur-sm scale-105" : ""}`}
                          style={{ aspectRatio: post.aspectRatio || "4/3" }}
                          loading="lazy"
                        />
                      </div>
                      {showLocked && (
                        <div>
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
                          <div className="px-4 pb-3">
                            <button
                              onClick={() =>
                                setUnlockedPosts((prev) => ({
                                  ...prev,
                                  [post.id]: true,
                                }))
                              }
                              className="w-full rounded-full bg-[linear-gradient(110deg,#E7C978_0%,#F4E1A6_16%,#FFF7DE_40%,#FFEFBF_52%,#F2D47E_66%,#E7C978_100%)] py-3 text-sm font-bold text-[#2B1A10] tracking-wide uppercase ring-1 ring-amber-200/70 shadow-md shadow-amber-200/60 transition hover:shadow-lg hover:shadow-amber-300/60 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2D47E]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            >
                              Unlock Post for ${post.price}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="px-4 pt-3 pb-3">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleKokoro(post.id)}
                            className={`flex items-center gap-1.5 transition ${isKokoro ? "text-[#e8384f]" : "text-[#8c6d7f] hover:text-[#e8384f]"}`}
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
                          <button className="text-[#8c6d7f] hover:text-[#5b4153] transition">
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
                          <button className="text-[#8c6d7f] hover:text-[#5b4153] transition">
                            <svg
                              viewBox="0 0 24 24"
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                            </svg>
                          </button>
                          <div className="flex-1" />
                          <button className="flex items-center gap-1.5 rounded-full border-2 border-[#f472b6] px-3.5 py-1 text-sm font-semibold text-[#f472b6] transition hover:bg-gradient-to-r hover:from-[#f9a8c8] hover:to-[#f472b6] hover:text-white hover:border-transparent hover:shadow-md hover:shadow-pink-200/50">
                            <svg
                              viewBox="0 0 24 24"
                              className="w-4 h-4"
                              fill="currentColor"
                              stroke="none"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                            Tip
                          </button>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-[#241a22]">
                          {formatNumber(kokoroCount)} Kokoros
                        </p>
                        <button className="mt-1 text-sm text-[#b89aa8] hover:text-[#8c6d7f] transition">
                          View all {post.comments} comments
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* ═══ Media Store Tab (LoyalFans-style PTV Grid) ═══ */}
            {activeTab === "store" && (
              <div className="max-w-[1500px] mx-auto px-4 pt-5 pb-12">
                {/* Top Bar: Search + Filters + Layout Toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
                  {/* Search */}
                  <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
                    <svg
                      viewBox="0 0 24 24"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b89aa8]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search media..."
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      className="w-full rounded-xl border border-pink-100 bg-white pl-10 pr-4 py-2.5 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300 transition"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {[
                      { id: "all", label: "All" },
                      { id: "video", label: "Videos" },
                      { id: "photo", label: "Photos" },
                      { id: "audio", label: "Audio" },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setStoreFilter(filter.id)}
                        className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                          storeFilter === filter.id
                            ? "bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white shadow-sm shadow-pink-200/50"
                            : "border border-pink-100 bg-white text-[#8c6d7f] hover:border-pink-200 hover:text-[#df5f97]"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {/* Free Content Toggle */}
                  <button
                    onClick={() => setShowFreeOnly(!showFreeOnly)}
                    className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition border ${
                      showFreeOnly
                        ? "bg-green-100 text-green-700 border-green-200 shadow-sm"
                        : "border-pink-100 bg-white text-[#8c6d7f] hover:border-pink-200 hover:text-[#df5f97]"
                    }`}
                    aria-pressed={showFreeOnly}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                    Free Content
                  </button>

                  {/* Layout Toggle */}
                  <div className="flex items-center gap-1 border border-pink-100 rounded-xl p-1 bg-white shrink-0">
                    <button
                      onClick={() => setStoreLayout("grid")}
                      className={`p-1.5 rounded-lg transition ${storeLayout === "grid" ? "bg-pink-50 text-[#f472b6]" : "text-[#b89aa8] hover:text-[#8c6d7f]"}`}
                      aria-label="Grid view"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setStoreLayout("list")}
                      className={`p-1.5 rounded-lg transition ${storeLayout === "list" ? "bg-pink-50 text-[#f472b6]" : "text-[#b89aa8] hover:text-[#8c6d7f]"}`}
                      aria-label="List view"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Results count */}
                <p className="text-xs text-[#b89aa8] mb-4">
                  {filteredStoreItems.length} items
                </p>

                {/* ── Grid Layout ──────────────────────────────────────── */}
                {storeLayout === "grid" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredStoreItems.map((item) => (
                      <div
                        key={item.id}
                        className="sakura-glass-surface group rounded-2xl border border-pink-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden bg-[#f5e6ed]">
                          <img
                            src={item.thumb}
                            alt={item.title}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                            loading="lazy"
                          />
                          {/* Duration / Photo Count badge */}
                          <div className="absolute bottom-2 left-2">
                            {item.type === "video" && (
                              <span className="px-1.5 py-0.5 rounded bg-black/70 text-[11px] font-medium text-white">
                                {item.duration}
                              </span>
                            )}
                            {item.type === "photo" && (
                              <span className="px-1.5 py-0.5 rounded bg-black/70 text-[11px] font-medium text-white flex items-center gap-1">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
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
                                {item.photoCount}
                              </span>
                            )}
                            {item.type === "audio" && (
                              <span className="px-1.5 py-0.5 rounded bg-black/70 text-[11px] font-medium text-white flex items-center gap-1">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M9 18V5l12-2v13" />
                                  <circle cx="6" cy="18" r="3" />
                                  <circle cx="18" cy="16" r="3" />
                                </svg>
                                {item.duration}
                              </span>
                            )}
                          </div>
                          {/* Play button overlay for video */}
                          {item.type === "video" && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <div className="member-media-play-control flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="w-5 h-5 text-[#f472b6] ml-0.5"
                                  fill="currentColor"
                                >
                                  <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                              </div>
                            </div>
                          )}
                          {/* Type icon for audio */}
                          {item.type === "audio" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#f9a8c8] to-[#f472b6] shadow-lg">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="w-6 h-6 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M9 18V5l12-2v13" />
                                  <circle cx="6" cy="18" r="3" />
                                  <circle cx="18" cy="16" r="3" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-3">
                          <div className="flex items-center gap-2 text-[10px] text-[#b89aa8] mb-1">
                            <span>{profile.name}</span>
                            <span>&middot;</span>
                            <span>{item.date}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-[#241a22] leading-snug line-clamp-1 group-hover:text-[#f472b6] transition">
                            {item.title}
                          </h3>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-base font-bold text-[#241a22]">
                              ${item.price}
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Bookmark */}
                              <button
                                className="text-[#b89aa8] hover:text-[#f472b6] transition"
                                aria-label="Save"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className="w-4.5 h-4.5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                </svg>
                              </button>
                              {/* Buy */}
                              <button className="rounded-lg bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-pink-200/40 hover:shadow-md transition uppercase tracking-wide">
                                Buy
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── List Layout ──────────────────────────────────────── */}
                {storeLayout === "list" && (
                  <div className="space-y-3">
                    {filteredStoreItems.map((item) => (
                      <div
                        key={item.id}
                        className="sakura-glass-surface group flex gap-4 rounded-2xl border border-pink-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition p-3"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-48 shrink-0 aspect-video rounded-xl overflow-hidden bg-[#f5e6ed]">
                          <img
                            src={item.thumb}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute bottom-1.5 left-1.5">
                            {item.type === "video" && (
                              <span className="px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-medium text-white">
                                {item.duration}
                              </span>
                            )}
                            {item.type === "photo" && (
                              <span className="px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-medium text-white">
                                {item.photoCount} photos
                              </span>
                            )}
                            {item.type === "audio" && (
                              <span className="px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-medium text-white">
                                {item.duration}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center gap-2 text-[10px] text-[#b89aa8] mb-1">
                              <span>{profile.name}</span>
                              <span>&middot;</span>
                              <span>{item.date}</span>
                              <span className="ml-auto px-2 py-0.5 rounded-full bg-pink-50 text-[10px] font-medium text-[#f472b6] capitalize">
                                {item.type}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-[#241a22] line-clamp-1 group-hover:text-[#f472b6] transition">
                              {item.title}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-bold text-[#241a22]">
                              ${item.price}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                className="text-[#b89aa8] hover:text-[#f472b6] transition"
                                aria-label="Save"
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
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                </svg>
                              </button>
                              <button className="rounded-lg bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-pink-200/40 hover:shadow-md transition uppercase tracking-wide">
                                Buy
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredStoreItems.length === 0 && (
                  <div className="py-16 text-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-12 h-12 mx-auto text-[#d4b8c7] mb-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z" />
                      <path d="M3 7h18" />
                      <path d="M16 11a4 4 0 01-8 0" />
                    </svg>
                    <p className="text-sm text-[#b89aa8]">
                      No media found matching your filters.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      {/* ─── Compose Modal ─────────────────────────────────────────── */}
      <CreatePostModal
        open={showCompose}
        onClose={() => setShowCompose(false)}
        text={composeText}
        setText={setComposeText}
        fontSize={composeFontSize}
        setFontSize={setComposeFontSize}
        bold={composeBold}
        setBold={setComposeBold}
        italic={composeItalic}
        setItalic={setComposeItalic}
        fontColor={composeFontColor}
        setFontColor={setComposeFontColor}
        locked={composeLocked}
        setLocked={setComposeLocked}
        vesoPrice={composeVesoPrice}
        setVesoPrice={setComposeVesoPrice}
      />

      {/* ─── Moment Composer ───────────────────────────────────────── */}
      {showMomentComposer && (
        <MomentComposer onClose={() => setShowMomentComposer(false)} />
      )}

      {/* ─── Moment Preview ────────────────────────────────────────── */}
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
            <div className="flex gap-1 mb-3">
              <div className="h-0.5 flex-1 rounded-full bg-white/25 overflow-hidden">
                <div className="member-moment-progress-current h-full w-3/5 rounded-full bg-white" />
              </div>
            </div>
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src={previewMoment.thumb}
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
            <div
              className="relative rounded-2xl overflow-hidden bg-black/40"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={previewMoment.thumb}
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
            <p className="text-center text-white/30 text-xs mt-3">
              Tap outside to close
            </p>
          </div>
        </div>
      )}
    </MemberLayout>
  );
}
