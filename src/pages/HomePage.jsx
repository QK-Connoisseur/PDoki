import { useState, useRef, useEffect } from "react";

/* ─── Mock Data ──────────────────────────────────────────────────────── */

const stories = [
  { id: 0, name: "Your Story", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80", type: "own" },
  { id: 1, name: "Luna Bloom", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", type: "regular" },
  { id: 2, name: "Mika Rose", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", type: "private" },
  { id: 3, name: "Airi Vale", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80", type: "regular" },
  { id: 4, name: "Sora Nyx", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80", type: "private" },
  { id: 5, name: "Naomi Hart", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80", type: "regular" },
  { id: 6, name: "Reina Noir", avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80", type: "regular" },
  { id: 7, name: "Kira Dawn", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", type: "private" },
  { id: 8, name: "Yuki Star", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", type: "regular" },
];

const feedPosts = [
  {
    id: 1,
    creator: "Luna Bloom",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    caption: "Golden hour never disappoints. Moments like these are what I live for.",
    kokoros: 1247,
    comments: 83,
    timeAgo: "2h",
  },
  {
    id: 2,
    creator: "Mika Rose",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
    caption: "Lost in the wild. New exclusive set dropping this weekend for subscribers!",
    kokoros: 892,
    comments: 56,
    timeAgo: "4h",
  },
  {
    id: 3,
    creator: "Airi Vale",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    caption: "Paradise found. Thank you for all the love on my latest drop!",
    kokoros: 2103,
    comments: 127,
    timeAgo: "6h",
  },
  {
    id: 4,
    creator: "Sora Nyx",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80",
    caption: "Behind the scenes from today's shoot. Members get the full uncut version!",
    kokoros: 654,
    comments: 41,
    timeAgo: "8h",
  },
];

const chatContacts = [
  { id: 1, name: "Luna Bloom", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", lastMessage: "Thanks for the support!", online: true, unread: 2, time: "2m" },
  { id: 2, name: "Mika Rose", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", lastMessage: "See you on the stream tonight!", online: true, unread: 0, time: "15m" },
  { id: 3, name: "Airi Vale", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80", lastMessage: "New content coming soon", online: false, unread: 1, time: "1h" },
  { id: 4, name: "Sora Nyx", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80", lastMessage: "Loved your comment!", online: true, unread: 0, time: "3h" },
  { id: 5, name: "Naomi Hart", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80", lastMessage: "Check out my latest post", online: false, unread: 0, time: "5h" },
  { id: 6, name: "Reina Noir", avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80", lastMessage: "When's the next drop?", online: true, unread: 3, time: "6h" },
];

const notifications = [
  { id: 1, text: "Luna Bloom gave your post a Kokoro", time: "2m ago", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  { id: 2, text: "Mika Rose started following you", time: "15m ago", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" },
  { id: 3, text: "Airi Vale posted a new exclusive drop", time: "1h ago", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80" },
  { id: 4, text: "Sora Nyx commented on your post", time: "3h ago", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80" },
];

/* ─── Colors ─────────────────────────────────────────────────────────── */

const SAKURA_PINK = "#f9a8c8";
const HEART_RED = "#e8384f";

/* ─── Nav Items ──────────────────────────────────────────────────────── */

const navItems = [
  {
    id: "home",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: "connect",
    label: "Connect",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: "store",
    label: "Store",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z" />
        <path d="M3 7h18" />
        <path d="M16 11a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    id: "discover",
    label: "Discover",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
      </svg>
    ),
  },
  {
    id: "compose",
    label: "Create Post",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
];

/* ─── Pumdoki Mini Logo ──────────────────────────────────────────────── */

function PumdokiLogo() {
  return (
    <svg viewBox="0 0 520 120" className="h-9 w-auto" aria-label="Pumdoki" role="img">
      <defs>
        <linearGradient id="miniHeartBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff7fa" />
          <stop offset="48%" stopColor="#ffd8e5" />
          <stop offset="100%" stopColor="#f3a0bc" />
        </linearGradient>
        <linearGradient id="miniWordFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd1e0" />
          <stop offset="55%" stopColor="#f8b3ca" />
          <stop offset="100%" stopColor="#ef8fb1" />
        </linearGradient>
      </defs>
      <g transform="translate(4,6)">
        <path
          d="M52 66c-4-3-7-6-9-8C27 43 18 33 18 20 18 9 26 0 37 0c7 0 13 3 17 10 5-7 11-10 18-10 11 0 19 9 19 20 0 13-10 23-27 38l-9 8-5 5-5-5Z"
          fill="url(#miniHeartBase)"
          stroke="#111"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M29 40h13c3 0 4-2 6-5l4-10 6 25 5-13c2-4 4-5 6-5h9"
          fill="none"
          stroke="#eb6f97"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text
        x="110"
        y="75"
        fontSize="60"
        fontWeight="700"
        fill="#fff7fa"
        stroke="#111"
        strokeWidth="3.2"
        paintOrder="stroke"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        letterSpacing="0.5"
      >
        Pumdoki
      </text>
      <text
        x="110"
        y="75"
        fontSize="60"
        fontWeight="700"
        fill="url(#miniWordFill)"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        letterSpacing="0.5"
      >
        Pumdoki
      </text>
    </svg>
  );
}

/* ─── Heart-Shaped Story Avatar ──────────────────────────────────────── */

function HeartAvatar({ src, name, borderColor, size = 56, borderWidth = 3 }) {
  const innerSize = size - borderWidth * 2;
  const heartPath = (s) =>
    `M${s/2},${s*0.9} C${s/2},${s*0.9} ${s*0.03},${s*0.6} ${s*0.03},${s*0.33} C${s*0.03},${s*0.13} ${s*0.18},0 ${s*0.34},0 C${s*0.43},0 ${s*0.47},${s*0.06} ${s/2},${s*0.14} C${s*0.53},${s*0.06} ${s*0.57},0 ${s*0.66},0 C${s*0.82},0 ${s*0.97},${s*0.13} ${s*0.97},${s*0.33} C${s*0.97},${s*0.6} ${s/2},${s*0.9} ${s/2},${s*0.9} Z`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <defs>
        <clipPath id={`heart-clip-${name}-${size}`}>
          <path d={heartPath(size)} />
        </clipPath>
        <clipPath id={`heart-clip-inner-${name}-${size}`}>
          <path d={heartPath(innerSize)} />
        </clipPath>
      </defs>
      <path d={heartPath(size)} fill={borderColor} />
      <g transform={`translate(${borderWidth},${borderWidth})`}>
        <image
          href={src}
          x="0"
          y="0"
          width={innerSize}
          height={innerSize}
          clipPath={`url(#heart-clip-inner-${name}-${size})`}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function HomePage({ onLogout }) {
  const [chatExpanded, setChatExpanded] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [kokoroStates, setKokoroStates] = useState({});
  const [activePage, setActivePage] = useState("home");
  const storiesRef = useRef(null);

  const toggleKokoro = (postId) => {
    setKokoroStates((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const formatNumber = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return n.toString();
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-dropdown]")) {
        setShowProfileMenu(false);
        setShowNotifications(false);
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalUnread = chatContacts.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="min-h-screen bg-[#fff8fb] text-[#5b4153]">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ─── Top Bar ───────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-pink-100 bg-white/92 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4">
          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            <PumdokiLogo />
          </div>

          {/* Right: Search, Notifications, Profile */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => { setShowSearch(!showSearch); setShowNotifications(false); setShowProfileMenu(false); }}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]"
                aria-label="Search"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
              {showSearch && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-pink-100 bg-white p-4 shadow-xl">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search creators, posts, tags..."
                    className="w-full rounded-xl border border-pink-100 bg-[#fffafc] px-4 py-2.5 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300"
                  />
                  <div className="mt-3 text-xs text-[#b89aa8]">Try searching for a creator or hashtag</div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowSearch(false); setShowProfileMenu(false); }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]"
                aria-label="Notifications"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8384f] text-[10px] font-bold text-white">
                  4
                </span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-pink-100 bg-white shadow-xl overflow-hidden">
                  <div className="border-b border-pink-50 px-4 py-3">
                    <h3 className="text-sm font-semibold text-[#241a22]">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <button key={n.id} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-pink-50/60">
                        <img src={n.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[#4a3340] leading-snug">{n.text}</p>
                          <p className="mt-0.5 text-xs text-[#b89aa8]">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowSearch(false); setShowNotifications(false); }}
                className="ml-1 flex h-10 w-10 items-center justify-center"
                aria-label="Profile menu"
              >
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                  alt="Your profile"
                  className="h-8 w-8 rounded-full border-2 border-pink-200 object-cover transition hover:border-pink-400"
                />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-pink-100 bg-white py-2 shadow-xl overflow-hidden">
                  {[
                    { label: "My Profile", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
                    { label: "Creator Dashboard", icon: "M4 6h16M4 12h16M4 18h7" },
                    { label: "Wallet", icon: "M21 4H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1zM1 10h22M16 15h2" },
                    { label: "Settings", icon: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2zM12 9a3 3 0 100 6 3 3 0 000-6z" },
                    { label: "Help & Support", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60 hover:text-[#df5f97]"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                      {item.label}
                    </button>
                  ))}
                  <hr className="my-1 border-pink-100" />
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#e8384f] transition hover:bg-red-50/60"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Layout Container ──────────────────────────────────────── */}
      <div className="flex pt-16 min-h-screen">
        {/* ─── Left Sidebar (Desktop) ──────────────────────────────── */}
        <aside className="hidden md:flex flex-col items-center w-[72px] shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-white border-r border-pink-100 py-6 gap-2 z-40">
          {navItems.map((item) => (
            <div key={item.id} className="group relative">
              <button
                onClick={() => {
                  if (item.id === "compose") {
                    setShowCompose(true);
                  } else {
                    setActivePage(item.id);
                  }
                }}
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
                  activePage === item.id
                    ? "bg-gradient-to-br from-[#f9a8c8] to-[#f472b6] text-white shadow-md shadow-pink-200/50"
                    : "text-[#8c6d7f] hover:bg-pink-50 hover:text-[#df5f97]"
                }`}
                aria-label={item.label}
              >
                {item.icon}
              </button>
              {/* Tooltip */}
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 rounded-xl bg-[#241a22] px-3 py-2 text-xs font-medium text-white whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-lg">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#241a22]" />
              </div>
            </div>
          ))}
        </aside>

        {/* ─── Main Content ────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 pb-20 md:pb-8">
          <div className="max-w-[580px] mx-auto px-4 pt-4">
            {/* ─── Stories Row ──────────────────────────────────────── */}
            <div className="mb-6 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
              <div
                ref={storiesRef}
                className="flex gap-4 overflow-x-auto hide-scrollbar"
              >
                {stories.map((story) => {
                  const borderColor =
                    story.type === "own"
                      ? "#d4d4d8"
                      : story.type === "private"
                        ? HEART_RED
                        : SAKURA_PINK;

                  return (
                    <button
                      key={story.id}
                      className="flex flex-col items-center gap-1.5 shrink-0 group"
                    >
                      <div className="relative">
                        <HeartAvatar
                          src={story.avatar}
                          name={`story-${story.id}`}
                          borderColor={borderColor}
                          size={76}
                          borderWidth={3}
                        />
                        {story.type === "own" && (
                          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#f472b6] text-white ring-2 ring-white">
                            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-[#8c6d7f] max-w-[76px] truncate group-hover:text-[#df5f97] transition">
                        {story.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── Feed Posts ──────────────────────────────────────── */}
            <div className="space-y-5">
              {feedPosts.map((post) => {
                const isKokoro = kokoroStates[post.id] || false;
                const kokoroCount = isKokoro ? post.kokoros + 1 : post.kokoros;

                return (
                  <article
                    key={post.id}
                    className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden"
                  >
                    {/* Post Header */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <img
                        src={post.avatar}
                        alt={post.creator}
                        className="h-10 w-10 rounded-full object-cover border border-pink-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#241a22] truncate">
                          {post.creator}
                        </p>
                        <p className="text-xs text-[#b89aa8]">{post.timeAgo} ago</p>
                      </div>
                      <button className="text-[#b89aa8] hover:text-[#8c6d7f] transition" aria-label="More options">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                    </div>

                    {/* Post Image */}
                    <img
                      src={post.image}
                      alt={`Post by ${post.creator}`}
                      className="w-full aspect-[4/3] object-cover"
                      loading="lazy"
                    />

                    {/* Post Actions */}
                    <div className="px-4 pt-3">
                      <div className="flex items-center gap-4">
                        {/* Kokoro Button */}
                        <button
                          onClick={() => toggleKokoro(post.id)}
                          className={`flex items-center gap-1.5 transition ${
                            isKokoro ? "text-[#e8384f]" : "text-[#8c6d7f] hover:text-[#e8384f]"
                          }`}
                          aria-label={isKokoro ? "Remove Kokoro" : "Give Kokoro"}
                        >
                          <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                            fill={isKokoro ? "currentColor" : "none"}
                            stroke="currentColor"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                          </svg>
                        </button>

                        {/* Comment Button */}
                        <button className="text-[#8c6d7f] hover:text-[#5b4153] transition" aria-label="Comment">
                          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                          </svg>
                        </button>

                        {/* Bookmark Button */}
                        <button className="text-[#8c6d7f] hover:text-[#5b4153] transition" aria-label="Bookmark">
                          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                          </svg>
                        </button>

                        <div className="flex-1" />

                        {/* Tip Button */}
                        <button className="flex items-center gap-1.5 rounded-full border-2 border-[#f472b6] px-3.5 py-1 text-sm font-semibold text-[#f472b6] transition hover:bg-gradient-to-r hover:from-[#f9a8c8] hover:to-[#f472b6] hover:text-white hover:border-transparent hover:shadow-md hover:shadow-pink-200/50" aria-label="Send Tip">
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" stroke="none">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                          </svg>
                          Tip
                        </button>
                      </div>

                      {/* Kokoro Count */}
                      <p className="mt-2 text-sm font-semibold text-[#241a22]">
                        {formatNumber(kokoroCount)} Kokoros
                      </p>

                      {/* Caption */}
                      <p className="mt-1 text-sm text-[#4a3340] leading-relaxed">
                        <span className="font-semibold text-[#241a22]">{post.creator}</span>{" "}
                        {post.caption}
                      </p>

                      {/* Comments link */}
                      <button className="mt-1 text-sm text-[#b89aa8] hover:text-[#8c6d7f] transition">
                        View all {post.comments} comments
                      </button>

                      <div className="my-3 h-px bg-pink-50" />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </main>

        {/* ─── Right Chat Sidebar (Desktop) ────────────────────────── */}
        <aside
          className={`hidden md:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-l border-pink-100 bg-white transition-all duration-300 ease-in-out ${
            chatExpanded ? "w-[300px]" : "w-[60px]"
          }`}
        >
          {/* Toggle Arrow */}
          <button
            onClick={() => setChatExpanded(!chatExpanded)}
            className="flex h-10 w-full items-center justify-center border-b border-pink-50 text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]"
            aria-label={chatExpanded ? "Collapse inbox" : "Expand inbox"}
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-4 h-4 transition-transform duration-300 ${chatExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {chatExpanded ? (
              /* ─── Expanded Inbox ─── */
              <div>
                <div className="px-4 py-3 border-b border-pink-50">
                  <h3 className="text-sm font-semibold text-[#241a22]">Messages</h3>
                </div>
                {chatContacts.map((contact) => (
                  <button
                    key={contact.id}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-pink-50/60"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#241a22] truncate">
                          {contact.name}
                        </p>
                        <span className="text-[10px] text-[#b89aa8] shrink-0 ml-2">
                          {contact.time}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#8c6d7f] truncate">
                        {contact.lastMessage}
                      </p>
                    </div>
                    {contact.unread > 0 && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f472b6] text-[10px] font-bold text-white">
                        {contact.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              /* ─── Collapsed: Avatar Stack ─── */
              <div className="flex flex-col items-center gap-3 py-3">
                {totalUnread > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#f472b6] px-1 text-[10px] font-bold text-white">
                    {totalUnread}
                  </span>
                )}
                {chatContacts.map((contact) => (
                  <button
                    key={contact.id}
                    className="relative group"
                    onClick={() => setChatExpanded(true)}
                    aria-label={`Chat with ${contact.name}`}
                  >
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-pink-100 transition group-hover:border-pink-300"
                    />
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
                    )}
                    {contact.unread > 0 && (
                      <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8384f] text-[9px] font-bold text-white">
                        {contact.unread}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ─── Mobile Bottom Nav ─────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-pink-100 bg-white/95 backdrop-blur-md">
        <div className="flex h-14 items-center justify-around px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "compose") {
                  setShowCompose(true);
                } else {
                  setActivePage(item.id);
                }
              }}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                activePage === item.id
                  ? "text-[#f472b6]"
                  : "text-[#8c6d7f] active:text-[#df5f97]"
              }`}
              aria-label={item.label}
            >
              {item.icon}
            </button>
          ))}
          {/* Mobile Chat Icon */}
          <button
            onClick={() => setActivePage("chat")}
            className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition ${
              activePage === "chat"
                ? "text-[#f472b6]"
                : "text-[#8c6d7f] active:text-[#df5f97]"
            }`}
            aria-label="Messages"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

      {/* ─── Compose Modal ─────────────────────────────────────────── */}
      {showCompose && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-pink-100 bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-pink-50 px-5 py-4">
              <h2 className="text-lg font-semibold text-[#241a22]">Create Post</h2>
              <button
                onClick={() => setShowCompose(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#e8384f]"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <div className="flex items-start gap-3">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                  alt="Your avatar"
                  className="h-10 w-10 rounded-full object-cover border border-pink-100"
                />
                <textarea
                  placeholder="What's on your mind?"
                  rows={4}
                  className="flex-1 resize-none rounded-xl border border-pink-100 bg-[#fffafc] px-4 py-3 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300"
                />
              </div>

              {/* Media Actions */}
              <div className="mt-4 flex items-center gap-2 border-t border-pink-50 pt-4">
                <button className="flex items-center gap-2 rounded-xl border border-pink-100 px-3 py-2 text-xs font-medium text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  Photo
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-pink-100 px-3 py-2 text-xs font-medium text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" />
                  </svg>
                  Video
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setShowCompose(false)}
                  className="rounded-xl bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-pink-200/50 transition hover:shadow-lg"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
