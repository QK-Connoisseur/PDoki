import { useState, useEffect } from "react";
import MemberLayout from "../components/MemberLayout";
import { useSimulatedFetch } from "../lib/useSimulatedFetch";
import { LoadingState, EmptyState, ErrorState } from "../components/StateViews";
import CreatePostModal from "../components/CreatePostModal";
import ConnectCreatorCard from "../components/ConnectCreatorCard";
import { creators, spotlightSlides } from "../fixtures/connectCreators";
import { getCreatorServices } from "../utils/serviceOffers";

/* ─── Mock Data ──────────────────────────────────────────────────────── */

/* ─── Spotlight Slides ───────────────────────────────────────────────── */

/* ─── Filter Tabs ────────────────────────────────────────────────────── */

const filterTabs = [
  { id: "all", label: "All", description: "Browse everything" },
  { id: "chat", label: "E-Chat", description: "Text & messages" },
  { id: "voice", label: "Voice Call", description: "Real-time audio" },
  { id: "video", label: "Video Call", description: "Face-to-face" },
  { id: "game", label: "Game With Me", description: "Play together" },
  { id: "shoutout", label: "Shout out", description: "Personalized shoutouts" },
];

/* ─── Service Icon ───────────────────────────────────────────────────── */

function ServiceIcon({ type, size = 14 }) {
  if (type === "chat")
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    );
  if (type === "voice")
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    );
  if (type === "video")
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    );
  if (type === "game")
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="6" y1="11" x2="10" y2="11" />
        <line x1="8" y1="9" x2="8" y2="13" />
        <line x1="15" y1="12" x2="15.01" y2="12" />
        <line x1="18" y1="10" x2="18.01" y2="10" />
        <path d="M17.32 5H6.68a4 4 0 00-3.978 3.59C2.166 12.4 2 16.29 2 18a2 2 0 002 2c1.105 0 2-.672 2.5-1.5L8 16h8l1.5 2.5c.5.828 1.395 1.5 2.5 1.5a2 2 0 002-2c0-1.71-.166-5.6-.703-9.41A4 4 0 0017.32 5z" />
      </svg>
    );
  if (type === "shoutout")
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 8h6l8-4v16l-8-4H3V8z" />
        <path d="M9 8v8" />
        <path d="M9 16l-2 5" />
      </svg>
    );
  return null;
}

/* ─── Rail Icon (extends ServiceIcon with "all" variant) ─────────────── */

function RailIcon({ type, size = 18 }) {
  if (type === "all")
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  return <ServiceIcon type={type} size={size} />;
}

/* ─── Spotlight Carousel ─────────────────────────────────────────────── */

function SpotlightCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActive((p) => (p + 1) % spotlightSlides.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  const slide = spotlightSlides[active];

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-6 shadow-lg"
      style={{ minHeight: 210 }}
    >
      {spotlightSlides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === active ? 1 : 0, background: s.bg }}
        >
          <div className="absolute inset-y-0 right-0 w-1/2 md:w-2/5 overflow-hidden">
            <img
              src={s.image}
              alt=""
              className="w-full h-full object-cover"
              style={{
                opacity: 0.35,
                filter: "blur(1px)",
                transform: "scale(1.08)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${s.bg.match(/[#][0-9a-f]{6}/i)?.[0] ?? "#0d0a1a"} 0%, transparent 70%)`,
              }}
            />
          </div>
        </div>
      ))}
      <div
        className="relative z-10 flex flex-col justify-between p-6 md:p-8"
        style={{ minHeight: 210 }}
      >
        <div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 backdrop-blur-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white mb-4"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: slide.accentColor }}
            />
            {slide.tag}
          </span>
          <h2 className="text-2xl md:text-[28px] font-bold text-white leading-tight mb-2">
            {slide.title}
          </h2>
          <p className="text-white/65 text-sm max-w-xs leading-relaxed">
            {slide.subtitle}
          </p>
        </div>
        <div className="flex items-center justify-between mt-5">
          <button
            className="rounded-xl border border-white/25 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            {slide.cta}
          </button>
          <div className="flex items-center gap-1.5">
            {spotlightSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === active ? 22 : 6,
                  height: 6,
                  background:
                    i === active ? "#ffffff" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────────────────── */

function SectionHeader({ icon, label, serviceType = null }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h2 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 text-[#f472b6]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
        {label}
      </h2>
      <button
        className="text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition normal-case tracking-normal"
        aria-label={`Show all ${label} creators`}
        data-service={serviceType ?? undefined}
      >
        Show All ›
      </button>
    </div>
  );
}

/* ─── Creator Grid ───────────────────────────────────────────────────── */

function CreatorGrid({ creators: list, keyPrefix, serviceType = null }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {list.map((creator) => (
        <ConnectCreatorCard
          key={`${keyPrefix}-${creator.id}`}
          creator={creator}
          serviceType={serviceType}
        />
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function ConnectPage({ userStatus = "online", onStatusChange }) {
  const page = useSimulatedFetch();
  const [showCompose, setShowCompose] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [composeFontSize, setComposeFontSize] = useState("normal");
  const [composeFontColor, setComposeFontColor] = useState("#4a3340");
  const [composeBold, setComposeBold] = useState(false);
  const [composeItalic, setComposeItalic] = useState(false);
  const [composeLocked, setComposeLocked] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeVesoPrice, setComposeVesoPrice] = useState("");

  const isAll = activeFilter === "all";

  // When a specific category is selected, show only those creators in one unified grid.
  // When "all" is selected, derive per-category sets for the sectioned layout.
  // Service membership is derived from each creator's Veso offers.
  const offersService = (c, service) => getCreatorServices(c).includes(service);

  const filteredCreators = isAll
    ? creators
    : creators.filter((c) => offersService(c, activeFilter));

  const eChatCreators = isAll
    ? creators.filter((c) => offersService(c, "chat"))
    : [];
  const voiceCreators = isAll
    ? creators.filter((c) => offersService(c, "voice"))
    : [];
  const videoCreators = isAll
    ? creators.filter((c) => offersService(c, "video"))
    : [];
  const gameCreators = isAll
    ? creators.filter((c) => offersService(c, "game"))
    : [];
  const shoutoutCreators = isAll
    ? creators.filter((c) => offersService(c, "shoutout"))
    : [];

  return (
    <MemberLayout
      activePage="connect"
      userStatus={userStatus}
      onStatusChange={onStatusChange}
      onComposePost={() => setShowCompose(true)}
    >
      <main className="flex-1 min-w-0 pb-20 md:pb-8">
        {page.status === "loading" ? (
          <LoadingState label="Loading creators…" />
        ) : page.status === "error" ? (
          <ErrorState
            message="We couldn’t load Connect."
            onRetry={page.retry}
          />
        ) : page.status === "empty" ? (
          <EmptyState
            title="No creators available"
            message="Check back soon for creators offering services."
          />
        ) : (
          <>
            <div className="max-w-[1700px] mx-auto px-4 pt-4">
              {/* ─── Page Header ─────────────────────────────────────── */}
              <div className="mb-5">
                <h1 className="text-xl font-bold text-[#241a22]">Connect</h1>
                <p className="text-sm text-[#8c6d7f] mt-1">
                  Find creators offering interactive sessions
                </p>
              </div>

              {/* ─── Spotlight Carousel ───────────────────────────────── */}
              <SpotlightCarousel />

              {/* ─── Service Rail ────────────────────────────────────── */}
              <div className="flex gap-3 mb-7 overflow-x-auto hide-scrollbar pb-1">
                {filterTabs.map((tab) => {
                  const isActive = activeFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className="flex-shrink-0 flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all border cursor-pointer hover:scale-[1.02] hover:shadow-md"
                      style={{
                        minWidth: 148,
                        background: isActive
                          ? "linear-gradient(135deg, #f9a8c8 0%, #f472b6 100%)"
                          : "linear-gradient(135deg, #ffffff 0%, #fff0f7 100%)",
                        borderColor: isActive ? "transparent" : "#fce7f3",
                        boxShadow: isActive
                          ? "0 4px 14px rgba(244,114,182,0.35)"
                          : "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                    >
                      <span
                        className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                        style={{
                          background: isActive
                            ? "rgba(255,255,255,0.22)"
                            : "rgba(249,168,200,0.18)",
                          color: isActive ? "#ffffff" : "#f472b6",
                        }}
                      >
                        <RailIcon type={tab.id} size={17} />
                      </span>
                      <div className="min-w-0">
                        <p
                          className="text-sm font-semibold leading-none mb-1 truncate"
                          style={{ color: isActive ? "#ffffff" : "#241a22" }}
                        >
                          {tab.label}
                        </p>
                        <p
                          className="text-[11px] leading-none truncate"
                          style={{
                            color: isActive
                              ? "rgba(255,255,255,0.78)"
                              : "#b89aa8",
                          }}
                        >
                          {tab.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ─── Filtered View (non-"all") ───────────────────────── */}
              {!isAll && filteredCreators.length > 0 && (
                <div className="mb-8">
                  <SectionHeader
                    label={
                      filterTabs.find((t) => t.id === activeFilter)?.label ??
                      "Results"
                    }
                    serviceType={activeFilter}
                    icon={
                      activeFilter === "chat" ? (
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      ) : activeFilter === "voice" ? (
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                      ) : activeFilter === "video" ? (
                        <>
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x="1" y="5" width="15" height="14" rx="2" />
                        </>
                      ) : activeFilter === "game" ? (
                        <>
                          <line x1="6" y1="11" x2="10" y2="11" />
                          <line x1="8" y1="9" x2="8" y2="13" />
                          <line x1="15" y1="12" x2="15.01" y2="12" />
                          <line x1="18" y1="10" x2="18.01" y2="10" />
                          <path d="M17.32 5H6.68a4 4 0 00-3.978 3.59C2.166 12.4 2 16.29 2 18a2 2 0 002 2c1.105 0 2-.672 2.5-1.5L8 16h8l1.5 2.5c.5.828 1.395 1.5 2.5 1.5a2 2 0 002-2c0-1.71-.166-5.6-.703-9.41A4 4 0 0017.32 5z" />
                        </>
                      ) : activeFilter === "shoutout" ? (
                        <>
                          <path d="M3 8h6l8-4v16l-8-4H3V8z" />
                          <path d="M9 8v8" />
                          <path d="M9 16l-2 5" />
                        </>
                      ) : (
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      )
                    }
                  />
                  <CreatorGrid
                    creators={filteredCreators}
                    keyPrefix={activeFilter}
                    serviceType={activeFilter}
                  />
                </div>
              )}

              {/* ─── Sectioned "All" Layout ───────────────────────────── */}
              {isAll && (
                <>
                  {/* E-Chat */}
                  {eChatCreators.length > 0 && (
                    <div className="mb-8">
                      <SectionHeader
                        label="E-Chat"
                        serviceType="chat"
                        icon={
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        }
                      />
                      <CreatorGrid
                        creators={eChatCreators}
                        keyPrefix="chat"
                        serviceType="chat"
                      />
                    </div>
                  )}

                  {/* Voice Call */}
                  {voiceCreators.length > 0 && (
                    <div className="mb-8">
                      <SectionHeader
                        label="Voice Call Ready"
                        serviceType="voice"
                        icon={
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        }
                      />
                      <CreatorGrid
                        creators={voiceCreators}
                        keyPrefix="voice"
                        serviceType="voice"
                      />
                    </div>
                  )}

                  {/* Video Call */}
                  {videoCreators.length > 0 && (
                    <div className="mb-8">
                      <SectionHeader
                        label="Video Call"
                        serviceType="video"
                        icon={
                          <>
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" />
                          </>
                        }
                      />
                      <CreatorGrid
                        creators={videoCreators}
                        keyPrefix="video"
                        serviceType="video"
                      />
                    </div>
                  )}

                  {/* Game With Me */}
                  {gameCreators.length > 0 && (
                    <div className="mb-8">
                      <SectionHeader
                        label="Game With Me"
                        serviceType="game"
                        icon={
                          <>
                            <line x1="6" y1="11" x2="10" y2="11" />
                            <line x1="8" y1="9" x2="8" y2="13" />
                            <line x1="15" y1="12" x2="15.01" y2="12" />
                            <line x1="18" y1="10" x2="18.01" y2="10" />
                            <path d="M17.32 5H6.68a4 4 0 00-3.978 3.59C2.166 12.4 2 16.29 2 18a2 2 0 002 2c1.105 0 2-.672 2.5-1.5L8 16h8l1.5 2.5c.5.828 1.395 1.5 2.5 1.5a2 2 0 002-2c0-1.71-.166-5.6-.703-9.41A4 4 0 0017.32 5z" />
                          </>
                        }
                      />
                      <CreatorGrid
                        creators={gameCreators}
                        keyPrefix="game"
                        serviceType="game"
                      />
                    </div>
                  )}

                  {/* Shout out */}
                  {shoutoutCreators.length > 0 && (
                    <div className="mb-8">
                      <SectionHeader
                        label="Shout out"
                        serviceType="shoutout"
                        icon={
                          <>
                            <path d="M3 8h6l8-4v16l-8-4H3V8z" />
                            <path d="M9 8v8" />
                            <path d="M9 16l-2 5" />
                          </>
                        }
                      />
                      <CreatorGrid
                        creators={shoutoutCreators}
                        keyPrefix="shoutout"
                        serviceType="shoutout"
                      />
                    </div>
                  )}

                  {/* New to Pumdoki */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] flex items-center gap-2">
                        <svg
                          viewBox="0 0 24 24"
                          className="w-4 h-4 text-emerald-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        New to Pumdoki
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {creators
                        .filter((c) => c.level === "bronze" || c.id >= 12)
                        .map((creator) => (
                          <div key={`new-${creator.id}`} className="relative">
                            <div className="absolute top-2 left-2 z-10">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                                <svg
                                  viewBox="0 0 12 12"
                                  className="w-2.5 h-2.5"
                                  fill="currentColor"
                                >
                                  <path d="M6 1l1.5 3.1 3.4.5-2.5 2.4.6 3.4L6 8.8 3 10.4l.6-3.4L1.1 4.6l3.4-.5L6 1z" />
                                </svg>
                                NEW
                              </span>
                            </div>
                            {/* No category context here: show the lowest offer overall with "From". */}
                            <ConnectCreatorCard
                              creator={creator}
                              serviceType={null}
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* See All Creators */}
                  <div className="mb-8">
                    <div className="sakura-glass-surface rounded-2xl border border-pink-100 bg-white p-6 text-center shadow-sm">
                      <div className="mx-auto mb-4 flex -space-x-3 justify-center">
                        {creators.slice(0, 6).map((c) => (
                          <img
                            key={c.id}
                            src={c.avatar}
                            alt={c.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-white"
                          />
                        ))}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-pink-50 text-xs font-bold text-[#f472b6]">
                          +{creators.length - 6}
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-[#241a22]">
                        See All Creators
                      </h3>
                      <p className="mt-1 text-sm text-[#8c6d7f]">
                        Browse all {creators.length} creators available for
                        interactive sessions
                      </p>
                      <button className="mt-4 rounded-xl bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-200/50 transition hover:shadow-lg hover:from-[#f472b6] hover:to-[#ec4899]">
                        Browse All Creators
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ─── Empty State ─────────────────────────────────────── */}
              {filteredCreators.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-[#b89aa8] text-sm">
                    No creators found for this filter.
                  </p>
                  <button
                    onClick={() => setActiveFilter("all")}
                    className="mt-3 text-sm font-semibold text-[#f472b6] hover:text-[#ec4899] transition"
                  >
                    Clear filter
                  </button>
                </div>
              )}
            </div>
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
    </MemberLayout>
  );
}
