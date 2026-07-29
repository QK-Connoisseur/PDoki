import { useState, useRef } from "react";
import MemberLayout from "../components/MemberLayout";
import { useSimulatedFetch } from "../lib/useSimulatedFetch";
import { LoadingState, EmptyState, ErrorState } from "../components/StateViews";
import CreatePostModal from "../components/CreatePostModal";
import InlineFollowButton from "../components/InlineFollowButton";
import FollowButton from "../components/FollowButton";
import {
  storeContent,
  subscribedUsernames,
  followedUsernames as followedSeed,
} from "../fixtures/storeContent";
import { buildAllTabGroups } from "../utils/storeSections";

/* ─── Mock Store Content Data ────────────────────────────────────────── */

/* Unique creators derived from storeContent */
const allCreators = [
  ...new Map(
    storeContent.map((item) => [
      item.username,
      { name: item.creator, username: item.username, avatar: item.avatar },
    ])
  ).values(),
];

/* Paid subscriptions are a separate member state from free follows. Static
   until account-backed APIs exist; follows stay toggleable in-session. */
const subscribedSet = new Set(subscribedUsernames);
const initialFollowedUsernames = new Set(followedSeed);

/* YouTube-scale discovery grid: ~4 medium cards at common large-desktop
   widths (after nav, chat rail, and the filter column), with a practical
   ≥290px card minimum. Narrower viewports collapse to 2 then 1 column. */
const CARD_GRID = "store-card-grid";

/* ─── Filter Config ──────────────────────────────────────────────────── */

const storeTabs = [
  { id: "all", label: "All" },
  { id: "recent", label: "Most Recent" },
  { id: "trending", label: "Trending" },
  { id: "purchased", label: "Purchased" },
  { id: "favorites", label: "Favorites" },
  { id: "liked", label: "Liked" },
  { id: "history", label: "History" },
];

const priceFilters = [
  { id: "all", label: "All" },
  { id: "under10", label: "Under $10" },
  { id: "10to25", label: "$10 to $25" },
  { id: "25to50", label: "$25 to $50" },
  { id: "50to100", label: "$50 to $100" },
  { id: "100plus", label: "$100+" },
];

const lengthFilters = [
  { id: "all", label: "All" },
  { id: "under5", label: "Under 5 min" },
  { id: "5to10", label: "5 to 10 min" },
  { id: "10to15", label: "10 to 15 min" },
  { id: "15to30", label: "15 to 30 min" },
  { id: "30plus", label: "30+ min" },
];

/* ─── Colors ─────────────────────────────────────────────────────────── */

const SAKURA_PINK = "#f9a8c8";
const HEART_RED = "#e8384f";

/* ─── Level Badge ────────────────────────────────────────────────────── */

function LevelBadge({ level }) {
  const tooltipMap = {
    star: "Doki 1, 2, or 3",
    gold: "Super Doki 1, 2, or 3",
    silver: "Doki Legend",
  };
  const tooltip = tooltipMap[level];

  let badgeEl = null;

  if (level === "bronze") {
    badgeEl = (
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full"
        style={{ backgroundColor: "#cd7f32" }}
      >
        <span className="text-[8px] font-bold text-white">B</span>
      </span>
    );
  } else if (level === "silver") {
    badgeEl = (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-400">
        <span className="text-[8px] font-bold text-white">S</span>
      </span>
    );
  } else if (level === "gold") {
    badgeEl = (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400">
        <span className="text-[8px] font-bold text-white">G</span>
      </span>
    );
  } else if (level === "star") {
    badgeEl = (
      <svg viewBox="0 0 16 16" className="h-4 w-4 inline-block">
        <polygon
          points="8,1 10,6 15,6.5 11,10 12.5,15 8,12.5 3.5,15 5,10 1,6.5 6,6"
          fill="#f9a8c8"
          stroke="#ec4899"
          strokeWidth="0.8"
        />
      </svg>
    );
  } else if (level === "legend") {
    badgeEl = (
      <svg viewBox="0 0 16 16" className="h-4 w-4 inline-block">
        <path
          d="M3 13h10l-1.5-3H4.5L3 13zM4 9h8l-1-2h-1l-2-4-2 4H5L4 9z"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (!badgeEl) return null;
  if (!tooltip) return badgeEl;

  return (
    <span className="relative group/badge inline-flex items-center">
      {badgeEl}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-lg bg-[#241a22]/90 px-2 py-1 text-[10px] font-medium text-white opacity-0 group-hover/badge:opacity-100 transition-opacity duration-150 z-10 shadow-lg">
        {tooltip}
      </span>
    </span>
  );
}

/* ─── Helper: parse duration to minutes ──────────────────────────────── */

function durationToMinutes(dur) {
  if (!dur) return 0;
  const parts = dur.split(":");
  return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
}

function getRelativeDate(dateString) {
  const diffMs = new Date() - new Date(dateString);
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

/* ─── Checkbox Button ─────────────────────────────────────────────────── */

function CheckboxBtn({ checked, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full text-left px-2 py-1.5 rounded-lg text-sm transition ${
        checked
          ? "text-[#f472b6] font-semibold bg-pink-50/60"
          : "text-[#5b4153] hover:bg-pink-50/40"
      }`}
    >
      <span
        className={`flex items-center justify-center w-4 h-4 rounded border-2 shrink-0 transition ${
          checked ? "border-[#f472b6] bg-[#f472b6]" : "border-[#d4b8c7]"
        }`}
      >
        {checked && (
          <svg
            viewBox="0 0 24 24"
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

/* ─── Radio Button ────────────────────────────────────────────────────── */

function RadioBtn({ checked, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full text-left px-2 py-1.5 rounded-lg text-sm transition ${
        checked
          ? "text-[#f472b6] font-semibold bg-pink-50/60"
          : "text-[#5b4153] hover:bg-pink-50/40"
      }`}
    >
      <span
        className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition ${
          checked ? "border-[#f472b6]" : "border-[#d4b8c7]"
        }`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-[#f472b6]" />}
      </span>
      {label}
    </button>
  );
}

/* ─── Filter Controls (shared by desktop sidebar and mobile drawer) ───── */

function FilterControls({
  priceFilter,
  onPriceFilter,
  lengthFilter,
  onLengthFilter,
  contentTypeFilters,
  onToggleContentType,
  downloadableOnly,
  onToggleDownloadable,
}) {
  return (
    <div className="space-y-6">
      {/* PRICE */}
      <div>
        <h3 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] mb-3">
          Price
        </h3>
        <div className="space-y-1.5">
          {priceFilters.map((f) => (
            <RadioBtn
              key={f.id}
              checked={priceFilter === f.id}
              onClick={() => onPriceFilter(f.id)}
              label={f.label}
            />
          ))}
        </div>
      </div>

      {/* CONTENT TYPE */}
      <div>
        <h3 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] mb-3">
          Content Type
        </h3>
        {/* Type checkboxes */}
        <div className="space-y-1 mb-3">
          <CheckboxBtn
            checked={contentTypeFilters.videos}
            onClick={() => onToggleContentType("videos")}
            label="Videos"
          />
          <CheckboxBtn
            checked={contentTypeFilters.photos}
            onClick={() => onToggleContentType("photos")}
            label="Photos"
          />
          <CheckboxBtn
            checked={contentTypeFilters.audio}
            onClick={() => onToggleContentType("audio")}
            label="Audio"
          />
        </div>
        {/* Duration radio buttons */}
        <div className="space-y-1.5">
          {lengthFilters.map((f) => (
            <RadioBtn
              key={f.id}
              checked={lengthFilter === f.id}
              onClick={() => onLengthFilter(f.id)}
              label={f.label}
            />
          ))}
        </div>
        {/* Downloadable checkbox */}
        <CheckboxBtn
          checked={downloadableOnly}
          onClick={onToggleDownloadable}
          label="Downloadable"
        />
      </div>
    </div>
  );
}

/* ─── Store Card ─────────────────────────────────────────────────────── */

function StoreCard({ item, followedUsernames, onBookmark, toggleFollow }) {
  return (
    <div className="group rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
      {/* Thumbnail — 16:9 */}
      <div className="relative aspect-video overflow-hidden bg-pink-50">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Duration badge bottom-right */}
        {item.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums backdrop-blur-sm">
            {item.duration}
          </span>
        )}

        {/* Photo type badge bottom-left */}
        {!item.duration && item.type === "photo" && (
          <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white flex items-center gap-1 backdrop-blur-sm">
            <svg
              viewBox="0 0 24 24"
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            Photos
          </span>
        )}
      </div>

      {/* Content Info */}
      <div className="p-3 flex flex-col gap-1.5">
        {/* Title */}
        <p className="text-sm font-bold text-[#241a22] line-clamp-2 leading-snug">
          {item.title}
        </p>

        {/* Creator info */}
        <div className="flex items-center gap-1.5 min-w-0">
          <img
            src={item.avatar}
            alt={item.creator}
            className="w-5 h-5 rounded-full object-cover shrink-0"
          />
          <span className="text-xs font-medium text-[#8c6d7f] truncate">
            {item.creator}
          </span>
          <svg
            viewBox="0 0 24 24"
            className="w-3.5 h-3.5 shrink-0"
            fill="#f472b6"
            aria-hidden="true"
          >
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[10px] text-[#b89aa8] shrink-0">
            · {getRelativeDate(item.date)}
          </span>
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-sm font-semibold text-[#241a22]">
            ${item.price.toFixed(2)}
          </span>
          <div className="flex items-center gap-1">
            <FollowButton
              username={item.username}
              initialFollowing={followedUsernames.has(item.username)}
              onFollow={toggleFollow}
              onUnfollow={toggleFollow}
            />
            {/* Bookmark with tooltip */}
            <div className="relative group/bm">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(item.id);
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                  item.bookmarked
                    ? "text-[#f472b6] bg-pink-50"
                    : "text-[#b89aa8] hover:text-[#f472b6] hover:bg-pink-50"
                }`}
                aria-label="Add to favorites"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill={item.bookmarked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </button>
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-lg bg-[#241a22]/90 px-2 py-1 text-[10px] font-medium text-white opacity-0 group-hover/bm:opacity-100 transition-opacity duration-150 z-10 shadow-lg">
                Add to favorites
              </span>
            </div>
            {/* Buy button */}
            <button className="rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wide shadow-sm shadow-pink-200/50 transition hover:shadow-md hover:from-[#f472b6] hover:to-[#ec4899] active:scale-[0.97]">
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function StorePage({ userStatus = "online", onStatusChange }) {
  const page = useSimulatedFetch();
  const [showCompose, setShowCompose] = useState(false);
  const [composeFontSize, setComposeFontSize] = useState("normal");
  const [composeFontColor, setComposeFontColor] = useState("#4a3340");
  const [composeBold, setComposeBold] = useState(false);
  const [composeItalic, setComposeItalic] = useState(false);
  const [composeLocked, setComposeLocked] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeVesoPrice, setComposeVesoPrice] = useState("");

  /* ─── Store-specific state ─── */
  const [activeTab, setActiveTab] = useState("all");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [priceFilter, setPriceFilter] = useState("all");
  const [lengthFilter, setLengthFilter] = useState("all");
  const [downloadableOnly, setDownloadableOnly] = useState(false);
  const [storeSearch, setStoreSearch] = useState("");
  const [followedFilter, setFollowedFilter] = useState(null);
  const [contentItems, setContentItems] = useState(storeContent);
  const [followedUsernames, setFollowedUsernames] = useState(
    () => new Set(initialFollowedUsernames)
  );
  const [contentTypeFilters, setContentTypeFilters] = useState({
    videos: false,
    photos: false,
    audio: false,
  });

  const creatorSectionRefs = useRef({});

  /* ─── Filtering logic ─── */
  const filteredItems = contentItems.filter((item) => {
    // Tab filtering ("all" mixes subscriptions, follows, and recommendations)
    if (activeTab === "favorites" && !item.bookmarked) return false;
    if (activeTab === "liked") return false;
    if (activeTab === "purchased") return false;
    if (activeTab === "history") return false;

    // Search
    if (storeSearch) {
      const q = storeSearch.toLowerCase();
      if (
        !item.title.toLowerCase().includes(q) &&
        !item.creator.toLowerCase().includes(q) &&
        !item.username.toLowerCase().includes(q)
      )
        return false;
    }

    // Price
    if (priceFilter === "under10" && item.price >= 10) return false;
    if (priceFilter === "10to25" && (item.price < 10 || item.price > 25))
      return false;
    if (priceFilter === "25to50" && (item.price < 25 || item.price > 50))
      return false;
    if (priceFilter === "50to100" && (item.price < 50 || item.price > 100))
      return false;
    if (priceFilter === "100plus" && item.price < 100) return false;

    // Duration
    if (item.duration) {
      const mins = durationToMinutes(item.duration);
      if (lengthFilter === "under5" && mins >= 5) return false;
      if (lengthFilter === "5to10" && (mins < 5 || mins >= 10)) return false;
      if (lengthFilter === "10to15" && (mins < 10 || mins >= 15)) return false;
      if (lengthFilter === "15to30" && (mins < 15 || mins >= 30)) return false;
      if (lengthFilter === "30plus" && mins < 30) return false;
    } else if (lengthFilter !== "all") {
      return false;
    }

    // Content type filters
    const anyTypeActive =
      contentTypeFilters.videos ||
      contentTypeFilters.photos ||
      contentTypeFilters.audio;
    if (anyTypeActive) {
      if (item.type === "video" && !contentTypeFilters.videos) return false;
      if (item.type === "photo" && !contentTypeFilters.photos) return false;
      if (item.type === "audio" && !contentTypeFilters.audio) return false;
    }

    // Downloadable
    if (downloadableOnly && !item.downloadable) return false;

    // Followed creator filter
    if (followedFilter && item.username !== followedFilter) return false;

    return true;
  });

  /* ─── Sorted views for discovery tabs ─── */
  const sortedByRecent =
    activeTab === "recent"
      ? [...filteredItems].sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];
  const sortedByTrending =
    activeTab === "trending"
      ? [...filteredItems].sort((a, b) => b.kokoros - a.kokoros)
      : [];

  /* ─── Group filtered items by creator ─── */
  const creatorGroups = Object.values(
    filteredItems.reduce((acc, item) => {
      if (!acc[item.username]) {
        acc[item.username] = {
          creator: item.creator,
          username: item.username,
          avatar: item.avatar,
          items: [],
        };
      }
      acc[item.username].items.push(item);
      return acc;
    }, {})
  );

  /* ─── All-tab shelves: subscriptions → follows → recommendations ─── */
  const allTabGroups =
    activeTab === "all"
      ? buildAllTabGroups(filteredItems, subscribedSet, followedUsernames)
      : null;

  /* ─── Sidebar creator lists ─── */
  const sidebarSubscribedCreators = allCreators.filter((c) =>
    subscribedSet.has(c.username)
  );
  /* Free follows only — subscribed creators live in the Subscriptions list */
  const sidebarFollowedCreators = allCreators.filter(
    (c) => followedUsernames.has(c.username) && !subscribedSet.has(c.username)
  );

  // Toggle bookmark
  const toggleBookmark = (id) => {
    setContentItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item
      )
    );
  };

  // Toggle follow for a creator
  const toggleFollow = (username) => {
    setFollowedUsernames((prev) => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  };

  // Scroll to a creator's section in the feed
  const scrollToCreator = (username) => {
    const el = creatorSectionRefs.current[username];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Toggle content type filter
  const toggleContentType = (type) => {
    setContentTypeFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Active filter tags
  const activeTags = [];
  if (followedFilter) {
    const c = allCreators.find((ac) => ac.username === followedFilter);
    activeTags.push({
      label: c ? c.name : followedFilter,
      clear: () => setFollowedFilter(null),
    });
  }
  if (priceFilter !== "all") {
    const p = priceFilters.find((f) => f.id === priceFilter);
    activeTags.push({ label: p?.label, clear: () => setPriceFilter("all") });
  }
  if (lengthFilter !== "all") {
    const l = lengthFilters.find((f) => f.id === lengthFilter);
    activeTags.push({ label: l?.label, clear: () => setLengthFilter("all") });
  }
  if (downloadableOnly) {
    activeTags.push({
      label: "Downloadable",
      clear: () => setDownloadableOnly(false),
    });
  }
  if (contentTypeFilters.videos) {
    activeTags.push({
      label: "Videos",
      clear: () => toggleContentType("videos"),
    });
  }
  if (contentTypeFilters.photos) {
    activeTags.push({
      label: "Photos",
      clear: () => toggleContentType("photos"),
    });
  }
  if (contentTypeFilters.audio) {
    activeTags.push({
      label: "Audio",
      clear: () => toggleContentType("audio"),
    });
  }

  const clearAllFilters = () => {
    setPriceFilter("all");
    setLengthFilter("all");
    setDownloadableOnly(false);
    setFollowedFilter(null);
    setStoreSearch("");
    setContentTypeFilters({ videos: false, photos: false, audio: false });
  };

  return (
    <MemberLayout
      activePage="store"
      userStatus={userStatus}
      onStatusChange={onStatusChange}
      onComposePost={() => setShowCompose(true)}
    >
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .store-radio:checked + label { background: linear-gradient(135deg, #f9a8c8, #f472b6); color: white; border-color: transparent; }
        .store-radio:checked + label .radio-dot { background: white; }
      `}</style>

      <main className="flex-1 min-w-0 pb-20 md:pb-8">
        {page.status === "loading" ? (
          <LoadingState label="Loading the store…" />
        ) : page.status === "error" ? (
          <ErrorState
            message="We couldn’t load the store."
            onRetry={page.retry}
          />
        ) : page.status === "empty" ? (
          <EmptyState
            title="No items found"
            message="Try a different filter or check back soon."
          />
        ) : (
          <>
            {/* Full-width discovery layout: use everything between the nav and chat rail */}
            <div className="w-full px-4 pt-4">
              {/* ─── Page Header ─── */}
              <div className="mb-5">
                <h1 className="text-2xl font-bold text-[#241a22]">Store</h1>
                <p className="mt-1 text-sm text-[#8c6d7f]">
                  Browse and buy exclusive content from your favorite creators
                </p>
              </div>

              {/* ─── Store Search Bar ─── */}
              <div className="mb-4">
                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#b89aa8]"
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
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    placeholder="Search content, creators..."
                    className="w-full rounded-xl border border-pink-100 bg-white pl-10 pr-4 py-2.5 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300 shadow-sm"
                  />
                </div>
              </div>

              {/* ─── Active Filter Tags ─── */}
              {activeTags.length > 0 && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition border border-pink-200 rounded-full px-3 py-1"
                  >
                    Clear all
                  </button>
                  {activeTags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 border border-pink-200 px-3 py-1 text-xs font-medium text-[#5b4153]"
                    >
                      {tag.label}
                      <button
                        onClick={tag.clear}
                        className="text-[#b89aa8] hover:text-[#e8384f] transition"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* ─── Store Tabs + mobile filter button ─── */}
              <div className="flex items-center gap-1 mb-5 overflow-x-auto hide-scrollbar pb-1 border-b border-pink-100">
                {storeTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    aria-pressed={activeTab === tab.id}
                    className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? "border-[#f472b6] text-[#f472b6]"
                        : "border-transparent text-[#8c6d7f] hover:text-[#df5f97] hover:border-pink-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <div className="flex-1" />
                <button
                  onClick={() => setShowFilterDrawer(true)}
                  aria-label="Open filters"
                  className="lg:hidden shrink-0 inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-white px-3.5 py-1.5 mb-1 text-xs font-semibold text-[#5b4153] shadow-sm transition hover:border-pink-300 hover:text-[#df5f97]"
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
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                  </svg>
                  Filters
                  {activeTags.length > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#f472b6] text-[9px] font-bold text-white">
                      {activeTags.length}
                    </span>
                  )}
                </button>
              </div>

              {/* ─── Content Layout: Filters Sidebar + Feed ─── */}
              <div className="flex gap-6">
                {/* ─── Filter Sidebar ─── */}
                <div
                  className="hidden lg:block w-[230px] shrink-0"
                  data-testid="store-sidebar"
                >
                  <div className="sticky top-20 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto pb-4 pr-1">
                    {/* SUBSCRIPTIONS — paid subs, YouTube-style creator list */}
                    <div>
                      <h3 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] mb-3">
                        Subscriptions
                      </h3>
                      {sidebarSubscribedCreators.length === 0 ? (
                        <div className="px-2">
                          <p className="text-xs text-[#b89aa8]">
                            No subscriptions yet
                          </p>
                          <button
                            onClick={() => setActiveTab("trending")}
                            className="mt-2 text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition"
                          >
                            Discover creators ›
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {sidebarSubscribedCreators.map((sc) => (
                            <button
                              key={sc.username}
                              onClick={() => {
                                setFollowedFilter(
                                  followedFilter === sc.username
                                    ? null
                                    : sc.username
                                );
                                scrollToCreator(sc.username);
                              }}
                              className={`flex items-center gap-2.5 w-full text-left px-2 py-1.5 rounded-lg text-sm transition ${
                                followedFilter === sc.username
                                  ? "bg-pink-50/80 ring-1 ring-pink-200"
                                  : "hover:bg-pink-50/40"
                              }`}
                            >
                              <img
                                src={sc.avatar}
                                alt={sc.name}
                                className={`w-7 h-7 rounded-full object-cover border-2 transition ${
                                  followedFilter === sc.username
                                    ? "border-[#f472b6]"
                                    : "border-pink-100"
                                }`}
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-[#241a22] truncate">
                                  {sc.name}
                                </p>
                                <p className="text-[10px] text-[#b89aa8]">
                                  @{sc.username}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* FILTERS */}
                    <FilterControls
                      priceFilter={priceFilter}
                      onPriceFilter={setPriceFilter}
                      lengthFilter={lengthFilter}
                      onLengthFilter={setLengthFilter}
                      contentTypeFilters={contentTypeFilters}
                      onToggleContentType={toggleContentType}
                      downloadableOnly={downloadableOnly}
                      onToggleDownloadable={() =>
                        setDownloadableOnly(!downloadableOnly)
                      }
                    />

                    {/* FOLLOWED CREATORS (free follows) */}
                    <div>
                      <h3 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] mb-3">
                        Followed
                      </h3>
                      {sidebarFollowedCreators.length === 0 ? (
                        <div className="px-2">
                          <p className="text-xs text-[#b89aa8]">
                            No followed creators yet
                          </p>
                          <button
                            onClick={() => setActiveTab("trending")}
                            className="mt-2 text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition"
                          >
                            Discover creators ›
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {sidebarFollowedCreators.map((fc) => (
                            <button
                              key={fc.username}
                              onClick={() => {
                                setFollowedFilter(
                                  followedFilter === fc.username
                                    ? null
                                    : fc.username
                                );
                                scrollToCreator(fc.username);
                              }}
                              className={`flex items-center gap-2.5 w-full text-left px-2 py-1.5 rounded-lg text-sm transition ${
                                followedFilter === fc.username
                                  ? "bg-pink-50/80 ring-1 ring-pink-200"
                                  : "hover:bg-pink-50/40"
                              }`}
                            >
                              <img
                                src={fc.avatar}
                                alt={fc.name}
                                className={`w-7 h-7 rounded-full object-cover border-2 transition ${
                                  followedFilter === fc.username
                                    ? "border-[#f472b6]"
                                    : "border-pink-100"
                                }`}
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-[#241a22] truncate">
                                  {fc.name}
                                </p>
                                <p className="text-[10px] text-[#b89aa8]">
                                  @{fc.username}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ─── Feed ─── */}
                <div className="flex-1 min-w-0">
                  {activeTab === "all" ? (
                    /* ── All: subscriptions → follows → recommendations ── */
                    (() => {
                      const shelves = [
                        {
                          id: "subscriptions",
                          label: "From your subscriptions",
                          items: allTabGroups.subscriptions,
                        },
                        {
                          id: "followed",
                          label: "From creators you follow",
                          items: allTabGroups.followed,
                        },
                        {
                          id: "recommended",
                          label: "Recommended for you",
                          items: allTabGroups.recommended,
                        },
                      ].filter((shelf) => shelf.items.length > 0);
                      return shelves.length > 0 ? (
                        <div className="space-y-10">
                          {shelves.map((shelf) => (
                            <section
                              key={shelf.id}
                              data-testid={`all-shelf-${shelf.id}`}
                            >
                              <h2 className="text-base font-bold text-[#241a22] mb-4">
                                {shelf.label}
                              </h2>
                              <div className={CARD_GRID}>
                                {shelf.items.map((item) => (
                                  <StoreCard
                                    key={item.id}
                                    item={item}
                                    followedUsernames={followedUsernames}
                                    onBookmark={toggleBookmark}
                                    toggleFollow={toggleFollow}
                                  />
                                ))}
                              </div>
                            </section>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <svg
                            viewBox="0 0 24 24"
                            className="w-14 h-14 text-[#d4b8c7] mb-4"
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
                          <p className="text-sm font-medium text-[#8c6d7f]">
                            No content found
                          </p>
                          <p className="mt-1 text-xs text-[#b89aa8]">
                            Try adjusting your filters or search
                          </p>
                          <button
                            onClick={clearAllFilters}
                            className="mt-4 rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-pink-200/50 transition hover:shadow-lg"
                          >
                            Clear All Filters
                          </button>
                        </div>
                      );
                    })()
                  ) : activeTab === "recent" || activeTab === "trending" ? (
                    /* ── Flat discovery grid (Most Recent / Trending) ── */
                    (() => {
                      const items =
                        activeTab === "recent"
                          ? sortedByRecent
                          : sortedByTrending;
                      return items.length > 0 ? (
                        <div className={CARD_GRID}>
                          {items.map((item) => (
                            <StoreCard
                              key={item.id}
                              item={item}
                              followedUsernames={followedUsernames}
                              onBookmark={toggleBookmark}
                              toggleFollow={toggleFollow}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <svg
                            viewBox="0 0 24 24"
                            className="w-14 h-14 text-[#d4b8c7] mb-4"
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
                          <p className="text-sm font-medium text-[#8c6d7f]">
                            No content found
                          </p>
                          <p className="mt-1 text-xs text-[#b89aa8]">
                            Try adjusting your filters or search
                          </p>
                          <button
                            onClick={clearAllFilters}
                            className="mt-4 rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-pink-200/50 transition hover:shadow-lg"
                          >
                            Clear All Filters
                          </button>
                        </div>
                      );
                    })()
                  ) : creatorGroups.length > 0 ? (
                    /* ── Creator-grouped feed (Following / Favorites) ── */
                    <div className="space-y-10">
                      {creatorGroups.map((group) => (
                        <div
                          key={group.username}
                          ref={(el) => {
                            creatorSectionRefs.current[group.username] = el;
                          }}
                        >
                          {/* Creator section header */}
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-pink-100/70">
                            <img
                              src={group.avatar}
                              alt={group.creator}
                              className="w-10 h-10 rounded-full object-cover border-2 border-pink-200 shadow-sm"
                            />
                            <div className="min-w-0 flex items-center gap-2">
                              <p className="text-sm font-bold text-[#241a22]">
                                {group.creator}
                              </p>
                              <InlineFollowButton
                                username={group.username}
                                isFollowing={followedUsernames.has(
                                  group.username
                                )}
                                onToggleFollow={toggleFollow}
                              />
                            </div>
                            <p className="text-xs text-[#b89aa8]">
                              @{group.username}
                            </p>
                            <span className="ml-auto text-xs text-[#b89aa8] shrink-0">
                              {group.items.length} item
                              {group.items.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Items grid */}
                          <div className={CARD_GRID}>
                            {group.items.map((item) => (
                              <StoreCard
                                key={item.id}
                                item={item}
                                followedUsernames={followedUsernames}
                                onBookmark={toggleBookmark}
                                toggleFollow={toggleFollow}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Generic empty state */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-14 h-14 text-[#d4b8c7] mb-4"
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
                      <p className="text-sm font-medium text-[#8c6d7f]">
                        No content found
                      </p>
                      <p className="mt-1 text-xs text-[#b89aa8]">
                        Try adjusting your filters or search
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="mt-4 rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-pink-200/50 transition hover:shadow-lg"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ─── Mobile/Tablet Filter Drawer ───────────────────────────── */}
      {showFilterDrawer && (
        <div
          className="fixed inset-0 z-[70] lg:hidden"
          role="dialog"
          aria-label="Filters"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setShowFilterDrawer(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 py-4 border-b border-pink-100">
              <h2 className="text-sm font-bold text-[#241a22]">Filters</h2>
              <div className="flex items-center gap-2">
                {activeTags.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  aria-label="Close filters"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#8c6d7f] hover:bg-pink-50 hover:text-[#241a22] transition"
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
            </div>
            <div className="px-5 py-4">
              <FilterControls
                priceFilter={priceFilter}
                onPriceFilter={setPriceFilter}
                lengthFilter={lengthFilter}
                onLengthFilter={setLengthFilter}
                contentTypeFilters={contentTypeFilters}
                onToggleContentType={toggleContentType}
                downloadableOnly={downloadableOnly}
                onToggleDownloadable={() =>
                  setDownloadableOnly(!downloadableOnly)
                }
              />
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] py-2.5 text-xs font-bold text-white uppercase tracking-wide shadow-md shadow-pink-200/50 transition hover:shadow-lg"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}

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
    </MemberLayout>
  );
}
