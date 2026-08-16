import { useState, useRef, useEffect } from "react";

/* ─── Icon Definitions ──────────────────────────────────────────────── */

function HomeIcon({ active }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
          fill="#111"
          stroke="#111"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 21V12h6v9"
          fill="white"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function ConnectIcon({ active }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path
          d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
          fill="#111"
          stroke="#111"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="9"
          cy="7"
          r="4"
          fill="#111"
          stroke="#111"
          strokeWidth="1.8"
        />
        <path
          d="M22 21v-2a4 4 0 00-3-3.87"
          fill="none"
          stroke="#111"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 3.13a4 4 0 010 7.75"
          fill="none"
          stroke="#111"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function StoreIcon({ active }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path
          d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z"
          fill="#111"
          stroke="#111"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 7h18"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 11a4 4 0 01-8 0"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z" />
      <path d="M3 7h18" />
      <path d="M16 11a4 4 0 01-8 0" />
    </svg>
  );
}

function PromosIcon({ active }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path
          d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
          fill="#111"
          stroke="#111"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="7" r="1.5" fill="white" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function CreateIcon({ active }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="4"
          fill="#111"
          stroke="#111"
          strokeWidth="1.8"
        />
        <path
          d="M12 8v8M8 12h8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

const NAV_ITEMS = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "connect", label: "Connect", Icon: ConnectIcon },
  { id: "store", label: "Store", Icon: StoreIcon },
  { id: "promotions", label: "Promos", Icon: PromosIcon },
  { id: "compose", label: "Create", Icon: CreateIcon },
];

/* ─── Sidebar Component ─────────────────────────────────────────────── */

export default function Sidebar({
  activePage,
  onNavigate,
  onOpenDashboard,
  onOpenCreatorApplication,
  onOpenSettings,
  showCreatorDashboard = false,
  showCreatorApplication = false,
  onLogout,
  onNavigateLegal,
  showComposeMenu,
  setShowComposeMenu,
  onComposePost,
  onComposeMoment,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const sidebarTimeout = useRef(null);
  const moreMenuRef = useRef(null);

  /* Close More menu (and compose menu) on outside click or ESC */
  useEffect(() => {
    if (!showMoreMenu && !showComposeMenu) return;
    const onMouseDown = (e) => {
      if (
        showMoreMenu &&
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target)
      ) {
        setShowMoreMenu(false);
      }
      if (showComposeMenu && !e.target.closest("[data-dropdown]")) {
        setShowComposeMenu(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowMoreMenu(false);
        setShowComposeMenu(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showMoreMenu, showComposeMenu, setShowComposeMenu]);

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-pink-100 bg-white z-40 transition-all duration-300 ease-in-out ${
        sidebarOpen ? "w-[220px]" : "w-[72px]"
      }`}
      onMouseEnter={() => {
        clearTimeout(sidebarTimeout.current);
        sidebarTimeout.current = setTimeout(() => setSidebarOpen(true), 80);
      }}
      onMouseLeave={() => {
        clearTimeout(sidebarTimeout.current);
        sidebarTimeout.current = setTimeout(() => setSidebarOpen(false), 200);
      }}
    >
      <div className="flex-[1]" />
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          const { Icon } = item;

          if (item.id === "compose") {
            return (
              <div key={item.id} className="relative" data-dropdown>
                <button
                  onClick={() => setShowComposeMenu(!showComposeMenu)}
                  className="flex items-center gap-4 rounded-xl px-3 h-12 w-full transition-all duration-200 overflow-hidden text-[#111] hover:bg-pink-50/60 hover:text-[#f9a8c8] cursor-pointer"
                  aria-label="Create"
                >
                  <div className="shrink-0">
                    <Icon active={false} />
                  </div>
                  <span
                    className={`whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                      sidebarOpen
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2 pointer-events-none w-0"
                    }`}
                  >
                    Create
                  </span>
                </button>
                {showComposeMenu && (
                  <div className="absolute left-0 bottom-full mb-2 w-[200px] rounded-2xl border border-pink-100 bg-white py-2 shadow-xl overflow-hidden z-50">
                    <button
                      onClick={() => {
                        onComposePost && onComposePost();
                        setShowComposeMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#111] transition hover:bg-pink-50/60 hover:text-[#f9a8c8] cursor-pointer"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4.5 w-4.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Create Post
                    </button>
                    <button
                      onClick={() => {
                        onComposeMoment && onComposeMoment();
                        setShowComposeMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#111] transition hover:bg-pink-50/60 hover:text-[#f9a8c8] cursor-pointer"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4.5 w-4.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                      Create Moment
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-4 rounded-xl px-3 h-12 transition-all duration-200 overflow-hidden cursor-pointer ${
                isActive
                  ? "bg-pink-50/60 text-[#111]"
                  : "text-[#111] hover:bg-pink-50/60 hover:text-[#f9a8c8]"
              }`}
              aria-label={item.label}
            >
              <div
                className={`shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
              >
                <Icon active={isActive} />
              </div>
              <span
                className={`whitespace-nowrap text-sm transition-all duration-300 ${
                  sidebarOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 pointer-events-none w-0"
                } ${isActive ? "font-bold" : "font-medium"}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="flex-[2]" />

      {/* ─── 18 USC §2257 Compliance Link ─── */}
      <div className="px-3 pb-1 overflow-hidden">
        <button
          onClick={() => onNavigateLegal && onNavigateLegal("2257")}
          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium text-[#c9aab8] transition hover:text-[#df5f97] w-full whitespace-nowrap overflow-hidden ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          title="18 USC §2257 Compliance Statement"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>18 USC §2257</span>
        </button>
      </div>

      {/* ─── More Menu ─── */}
      <div ref={moreMenuRef} className="relative px-3 pb-4" data-dropdown>
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex items-center gap-4 rounded-xl px-3 h-12 w-full transition-all duration-200 overflow-hidden cursor-pointer ${
            showMoreMenu
              ? "bg-pink-50 text-[#111]"
              : "text-[#111] hover:bg-pink-50/60 hover:text-[#f9a8c8]"
          }`}
          aria-label="More"
        >
          <div className="shrink-0">
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </div>
          <span
            className={`whitespace-nowrap text-sm font-medium transition-all duration-300 ${
              sidebarOpen
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2 pointer-events-none w-0"
            }`}
          >
            More
          </span>
        </button>

        {showMoreMenu && (
          <div className="absolute bottom-full left-3 mb-2 w-[240px] rounded-2xl border border-pink-100 bg-white py-2 shadow-xl overflow-hidden z-50">
            {[
              {
                label: "Settings",
                icon: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z",
                action: onOpenSettings,
              },
              {
                label: "Your Activity",
                icon: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
              },
              {
                label: "Saved",
                icon: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",
              },
              ...(showCreatorDashboard
                ? [
                    {
                      label: "Creator Dashboard",
                      icon: "M4 6h16M4 12h16M4 18h7",
                      action: onOpenDashboard,
                    },
                  ]
                : []),
              ...(showCreatorApplication
                ? [
                    {
                      label: "Apply to become a creator",
                      icon: "M12 3v18M3 12h18",
                      action: onOpenCreatorApplication,
                    },
                  ]
                : []),
              {
                label: "Help & Support",
                icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01",
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action || undefined}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#111] transition hover:bg-pink-50/60 hover:text-[#f9a8c8]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
                <span className="min-w-0 flex-1 text-left leading-snug">
                  {item.label}
                </span>
              </button>
            ))}
            <hr className="my-1 border-pink-100" />
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#e8384f] transition hover:bg-red-50/60 cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ─── Mobile Bottom Nav ─────────────────────────────────────────────── */

export function MobileNav({
  activePage,
  onNavigate,
  showComposeMenu,
  setShowComposeMenu,
  onComposePost,
  onComposeMoment,
  totalUnread = 0,
}) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-pink-100 bg-white/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          const { Icon } = item;

          if (item.id === "compose") {
            return (
              <div key={item.id} className="relative" data-dropdown>
                <button
                  onClick={() => setShowComposeMenu(!showComposeMenu)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition text-[#111] active:text-[#f9a8c8] cursor-pointer"
                  aria-label="Create"
                >
                  <Icon active={false} />
                </button>
                {showComposeMenu && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[180px] rounded-2xl border border-pink-100 bg-white py-2 shadow-xl overflow-hidden z-50">
                    <button
                      onClick={() => {
                        onComposePost && onComposePost();
                        setShowComposeMenu(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#111] transition hover:bg-pink-50/60 cursor-pointer"
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
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Create Post
                    </button>
                    <button
                      onClick={() => {
                        onComposeMoment && onComposeMoment();
                        setShowComposeMenu(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#111] transition hover:bg-pink-50/60 cursor-pointer"
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
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                      Create Moment
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition cursor-pointer ${
                isActive ? "text-[#111]" : "text-[#111] active:text-[#f9a8c8]"
              }`}
              aria-label={item.label}
            >
              <Icon active={isActive} />
            </button>
          );
        })}
        {/* Mobile Chat Icon */}
        <button
          onClick={() => onNavigate("chat")}
          className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition cursor-pointer ${
            activePage === "chat"
              ? "text-[#111]"
              : "text-[#111] active:text-[#f9a8c8]"
          }`}
          aria-label="Messages"
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
          {totalUnread > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8384f] text-[9px] font-bold text-white">
              {totalUnread}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
