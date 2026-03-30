import { useState, useRef, useEffect } from "react";

/* ─── Mock Data ──────────────────────────────────────────────────────── */

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

const creators = [
  {
    id: 1,
    name: "Luna Bloom",
    username: "lunabloom",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=530&q=80",
    level: "gold",
    services: ["chat", "voice", "video"],
    price: "$3.99/min",
    description: "Friendly conversations about life, love, and everything in between.",
    section: "recent",
  },
  {
    id: 2,
    name: "Mika Rose",
    username: "mikarose",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=530&q=80",
    level: "star",
    services: ["chat", "video", "game"],
    price: "$5.99/min",
    description: "Let's play games together or just vibe on a video call!",
    section: "recent",
  },
  {
    id: 3,
    name: "Airi Vale",
    username: "airivale",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&h=530&q=80",
    level: "silver",
    services: ["chat", "voice"],
    price: "$2.49/msg",
    description: "Deep talks and late-night chats. Always here to listen.",
    section: "recent",
  },
  {
    id: 4,
    name: "Sora Nyx",
    username: "soranyx",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=530&q=80",
    level: "legend",
    services: ["chat", "voice", "video", "game"],
    price: "$8.99/min",
    description: "Premium 1-on-1 experiences. Gaming, chatting, and more.",
    section: "recent",
  },
  {
    id: 5,
    name: "Naomi Hart",
    username: "naomihart",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&h=530&q=80",
    level: "gold",
    services: ["chat", "video"],
    price: "$4.49/min",
    description: "Video calls with good vibes and great energy every time.",
    section: "recent",
  },
  {
    id: 6,
    name: "Reina Noir",
    username: "reinanoir",
    avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&h=530&q=80",
    level: "2stars",
    services: ["voice", "video"],
    price: "$6.99/min",
    description: "Voice and video sessions with a creative twist. Come say hi!",
    section: "recent",
  },
  {
    id: 7,
    name: "Kira Dawn",
    username: "kiradawn",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=530&q=80",
    level: "bronze",
    services: ["chat", "game"],
    price: "$1.99/msg",
    description: "Casual gaming sessions and fun chat. Let's hang out!",
    section: "recent",
  },
  {
    id: 8,
    name: "Yuki Star",
    username: "yukistar",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=530&q=80",
    level: "star",
    services: ["chat", "voice", "video"],
    price: "$5.49/min",
    description: "Warm conversations and cozy voice calls. Your comfort zone.",
    section: "popular",
  },
  {
    id: 9,
    name: "Hana Mizu",
    username: "hanamizu",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=530&q=80",
    level: "gold",
    services: ["chat", "voice", "game"],
    price: "$4.99/min",
    description: "Challenge me to a game or just chat about anything.",
    section: "popular",
  },
  {
    id: 10,
    name: "Emi Skye",
    username: "emiskye",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=530&q=80",
    level: "legend",
    services: ["chat", "voice", "video", "game"],
    price: "$9.99/min",
    description: "Full interactive experience. Games, calls, and exclusive chats.",
    section: "popular",
  },
  {
    id: 11,
    name: "Rin Velvet",
    username: "rinvelvet",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=530&q=80",
    level: "silver",
    services: ["chat", "video"],
    price: "$3.49/min",
    description: "Chill video sessions. Let's talk about your day.",
    section: "popular",
  },
  {
    id: 12,
    name: "Mei Soleil",
    username: "meisoleil",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&h=530&q=80",
    level: "2stars",
    services: ["voice", "video", "game"],
    price: "$7.49/min",
    description: "High-energy gaming and interactive voice experiences.",
    section: "popular",
  },
  {
    id: 13,
    name: "Zara Lux",
    username: "zaralux",
    avatar: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=400&h=530&q=80",
    level: "bronze",
    services: ["chat"],
    price: "$1.49/msg",
    description: "Quick messages and personal replies. Always responsive.",
    section: "popular",
  },
  {
    id: 14,
    name: "Noa Ember",
    username: "noaember",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=530&q=80",
    level: "gold",
    services: ["chat", "voice", "video"],
    price: "$4.99/min",
    description: "Voice calls with personality. Let me brighten your day.",
    section: "popular",
  },
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

/* ─── Filter Tabs ────────────────────────────────────────────────────── */

const filterTabs = [
  { id: "all", label: "All" },
  { id: "chat", label: "E-Chat" },
  { id: "voice", label: "Voice Call" },
  { id: "video", label: "Video Call" },
  { id: "game", label: "Game With Me" },
];

/* ─── Level Badge Component ──────────────────────────────────────────── */

function LevelBadge({ level, size = 16 }) {
  if (level === "bronze") {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: "#cd7f32", border: "1.5px solid #a0522d" }}
        title="Bronze"
      >
        <span className="text-white text-[8px] font-bold">B</span>
      </span>
    );
  }
  if (level === "silver") {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: "#c0c0c0", border: "1.5px solid #a8a8a8" }}
        title="Silver"
      >
        <span className="text-white text-[8px] font-bold">S</span>
      </span>
    );
  }
  if (level === "gold") {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: "#ffd700", border: "1.5px solid #daa520" }}
        title="Gold"
      >
        <span className="text-white text-[8px] font-bold">G</span>
      </span>
    );
  }
  if (level === "star") {
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
  }
  if (level === "2stars") {
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
  }
  if (level === "legend") {
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
        <circle cx="5" cy="1.5" r="0.8" fill="#ffd700" stroke="#daa520" strokeWidth="0.4" />
        <circle cx="8" cy="0.5" r="0.8" fill="#ffd700" stroke="#daa520" strokeWidth="0.4" />
        <circle cx="11" cy="1.5" r="0.8" fill="#ffd700" stroke="#daa520" strokeWidth="0.4" />
      </svg>
    );
  }
  return null;
}

/* ─── Service Icon Component ─────────────────────────────────────────── */

function ServiceIcon({ type, size = 14 }) {
  if (type === "chat") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    );
  }
  if (type === "voice") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    );
  }
  if (type === "video") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    );
  }
  if (type === "game") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="11" x2="10" y2="11" />
        <line x1="8" y1="9" x2="8" y2="13" />
        <line x1="15" y1="12" x2="15.01" y2="12" />
        <line x1="18" y1="10" x2="18.01" y2="10" />
        <path d="M17.32 5H6.68a4 4 0 00-3.978 3.59C2.166 12.4 2 16.29 2 18a2 2 0 002 2c1.105 0 2-.672 2.5-1.5L8 16h8l1.5 2.5c.5.828 1.395 1.5 2.5 1.5a2 2 0 002-2c0-1.71-.166-5.6-.703-9.41A4 4 0 0017.32 5z" />
      </svg>
    );
  }
  return null;
}

/* ─── Creator Card Component ─────────────────────────────────────────── */

function CreatorCard({ creator }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
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
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <img
            src={creator.photo}
            alt={creator.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-16 pb-3 px-3">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold text-sm truncate">{creator.name}</span>
              <LevelBadge level={creator.level} size={14} />
            </div>
            <p className="text-white/70 text-xs mt-0.5">@{creator.username}</p>
          </div>
          {/* Service indicators in bottom-right */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
            {creator.services.map((service) => (
              <span
                key={service}
                className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm text-white/90"
              >
                <ServiceIcon type={service} size={12} />
              </span>
            ))}
          </div>
        </div>

        {/* ─── Back Face ─── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border border-pink-100 shadow-sm bg-white flex flex-col items-center justify-center px-4 py-5"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Avatar */}
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-pink-200"
          />
          {/* Name + Level */}
          <div className="flex items-center gap-1.5 mt-3">
            <span className="text-[#241a22] font-semibold text-sm">{creator.name}</span>
            <LevelBadge level={creator.level} size={14} />
          </div>
          {/* Username */}
          <p className="text-[#b89aa8] text-xs mt-0.5">@{creator.username}</p>
          {/* Description */}
          <p className="text-[#8c6d7f] text-xs text-center mt-3 leading-relaxed line-clamp-2">
            {creator.description}
          </p>
          {/* Price */}
          <p className="text-[#241a22] font-bold text-sm mt-3">{creator.price}</p>
          {/* Buttons */}
          <div className="flex flex-col gap-2 w-full mt-3">
            <button className="w-full rounded-full border-2 border-[#f9a8c8] py-2 text-xs font-semibold text-[#f472b6] transition hover:bg-pink-50">
              View Profile
            </button>
            <button className="w-full rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] py-2 text-xs font-semibold text-white shadow-md shadow-pink-200/50 transition hover:shadow-lg hover:from-[#f472b6] hover:to-[#ec4899]">
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Pumdoki Mini Logo ──────────────────────────────────────────────── */

function PumdokiLogo() {
  return (
    <svg viewBox="0 0 520 120" className="h-9 w-auto" aria-label="Pumdoki" role="img">
      <defs>
        <linearGradient id="connectMiniHeartBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff7fa" />
          <stop offset="48%" stopColor="#ffd8e5" />
          <stop offset="100%" stopColor="#f3a0bc" />
        </linearGradient>
        <linearGradient id="connectMiniWordFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd1e0" />
          <stop offset="55%" stopColor="#f8b3ca" />
          <stop offset="100%" stopColor="#ef8fb1" />
        </linearGradient>
      </defs>
      <g transform="translate(4,6)">
        <path
          d="M52 66c-4-3-7-6-9-8C27 43 18 33 18 20 18 9 26 0 37 0c7 0 13 3 17 10 5-7 11-10 18-10 11 0 19 9 19 20 0 13-10 23-27 38l-9 8-5 5-5-5Z"
          fill="url(#connectMiniHeartBase)"
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
        fill="url(#connectMiniWordFill)"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        letterSpacing="0.5"
      >
        Pumdoki
      </text>
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function ConnectPage({ onBack, onLogout, onViewProfile, onOpenConnect, onOpenStore, onOpenDiscover }) {
  const [chatExpanded, setChatExpanded] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [activePage, setActivePage] = useState("connect");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showComposeMenu, setShowComposeMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [composeFontSize, setComposeFontSize] = useState("normal");
  const [composeFontColor, setComposeFontColor] = useState("#4a3340");
  const [composeBold, setComposeBold] = useState(false);
  const [composeItalic, setComposeItalic] = useState(false);
  const sidebarTimeout = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-dropdown]")) {
        setShowProfileMenu(false);
        setShowNotifications(false);
        setShowSearch(false);
        setShowMoreMenu(false);
        setShowComposeMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Handle sidebar nav clicks
  const handleNavClick = (id) => {
    if (id === "home") {
      onBack && onBack();
    } else if (id === "store") {
      onOpenStore && onOpenStore();
    } else if (id === "discover") {
      onOpenDiscover && onOpenDiscover();
    } else {
      setActivePage(id);
    }
  };

  // Filter creators based on active filter
  const filteredCreators = activeFilter === "all"
    ? creators
    : creators.filter((c) => c.services.includes(activeFilter));

  const eChatCreators = filteredCreators.filter((c) => c.services.includes("chat"));
  const voiceCallCreators = filteredCreators.filter((c) => c.services.includes("voice"));
  const videoCallCreators = filteredCreators.filter((c) => c.services.includes("video"));
  const gameCreators = filteredCreators.filter((c) => c.services.includes("game"));

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
                    { label: "My Profile", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z", action: () => onViewProfile && onViewProfile() },
                    { label: "Creator Dashboard", icon: "M4 6h16M4 12h16M4 18h7" },
                    { label: "Wallet", icon: "M21 4H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1zM1 10h22M16 15h2" },
                    { label: "Settings", icon: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2zM12 9a3 3 0 100 6 3 3 0 000-6z" },
                    { label: "Help & Support", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action || undefined}
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
        {/* ─── Left Sidebar (Desktop) ─────────────────────────────── */}
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
            {navItems.map((item) => {
              const isActive = activePage === item.id;

              /* Compose button gets a dropdown menu */
              if (item.id === "compose") {
                return (
                  <div key={item.id} className="relative" data-dropdown>
                    <button
                      onClick={() => setShowComposeMenu(!showComposeMenu)}
                      className="flex items-center gap-4 rounded-xl px-3 h-12 w-full transition-all duration-200 overflow-hidden text-[#8c6d7f] hover:bg-pink-50/60 hover:text-[#df5f97]"
                      aria-label="Create"
                    >
                      <div className="shrink-0">{item.icon}</div>
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
                          onClick={() => { setShowCompose(true); setShowComposeMenu(false); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60 hover:text-[#df5f97]"
                        >
                          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Create Post
                        </button>
                        <button
                          onClick={() => { setShowComposeMenu(false); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60 hover:text-[#df5f97]"
                        >
                          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-4 rounded-xl px-3 h-12 transition-all duration-200 overflow-hidden ${
                    isActive
                      ? "text-[#241a22]"
                      : "text-[#8c6d7f] hover:bg-pink-50/60 hover:text-[#df5f97]"
                  }`}
                  aria-label={item.label}
                >
                  <div className={`shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                    {item.icon}
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

          {/* ─── More Menu (Instagram-style) ─── */}
          <div className="relative px-3 pb-4" data-dropdown>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex items-center gap-4 rounded-xl px-3 h-12 w-full transition-all duration-200 overflow-hidden ${
                showMoreMenu
                  ? "bg-pink-50 text-[#241a22]"
                  : "text-[#8c6d7f] hover:bg-pink-50/60 hover:text-[#df5f97]"
              }`}
              aria-label="More"
            >
              <div className="shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
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
                  { label: "Settings", icon: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" },
                  { label: "Your Activity", icon: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" },
                  { label: "Saved", icon: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" },
                  { label: "Creator Dashboard", icon: "M4 6h16M4 12h16M4 18h7" },
                  { label: "Help & Support", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60 hover:text-[#df5f97]"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ─── Main Content ────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 pb-20 md:pb-8">
          <div className="max-w-[1700px] mx-auto px-4 pt-4">
            {/* ─── Page Header ─────────────────────────────────────── */}
            <div className="mb-5">
              <h1 className="text-xl font-bold text-[#241a22]">Connect</h1>
              <p className="text-sm text-[#8c6d7f] mt-1">Find creators offering interactive sessions</p>
            </div>

            {/* ─── Filter Tabs ─────────────────────────────────────── */}
            <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeFilter === tab.id
                      ? "bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white shadow-md shadow-pink-200/50"
                      : "bg-white border border-pink-100 text-[#8c6d7f] hover:border-pink-300 hover:text-[#df5f97]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ─── E-Chat ───────────────────────────────────────────── */}
            {eChatCreators.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#f472b6]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    E-Chat
                  </h2>
                  <button className="text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition">
                    Show All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {eChatCreators.map((creator) => (
                    <CreatorCard key={`chat-${creator.id}`} creator={creator} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Voice Call Ready ─────────────────────────────────── */}
            {voiceCallCreators.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#f472b6]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    Voice Call Ready
                  </h2>
                  <button className="text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition">
                    Show All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {voiceCallCreators.map((creator) => (
                    <CreatorCard key={`voice-${creator.id}`} creator={creator} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Video Call ───────────────────────────────────────── */}
            {videoCallCreators.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#f472b6]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" />
                    </svg>
                    Video Call
                  </h2>
                  <button className="text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition">
                    Show All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {videoCallCreators.map((creator) => (
                    <CreatorCard key={`video-${creator.id}`} creator={creator} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Game With Me ─────────────────────────────────────── */}
            {gameCreators.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#f472b6]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="11" x2="10" y2="11" />
                      <line x1="8" y1="9" x2="8" y2="13" />
                      <line x1="15" y1="12" x2="15.01" y2="12" />
                      <line x1="18" y1="10" x2="18.01" y2="10" />
                      <path d="M17.32 5H6.68a4 4 0 00-3.978 3.59C2.166 12.4 2 16.29 2 18a2 2 0 002 2c1.105 0 2-.672 2.5-1.5L8 16h8l1.5 2.5c.5.828 1.395 1.5 2.5 1.5a2 2 0 002-2c0-1.71-.166-5.6-.703-9.41A4 4 0 0017.32 5z" />
                    </svg>
                    Game With Me
                  </h2>
                  <button className="text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition">
                    Show All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {gameCreators.map((creator) => (
                    <CreatorCard key={`game-${creator.id}`} creator={creator} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Empty State ─────────────────────────────────────── */}
            {filteredCreators.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[#b89aa8] text-sm">No creators found for this filter.</p>
                <button
                  onClick={() => setActiveFilter("all")}
                  className="mt-3 text-sm font-semibold text-[#f472b6] hover:text-[#ec4899] transition"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
        </main>

        {/* ─── Right Chat Sidebar (Desktop) ────────────────────────── */}
        <aside
          className={`hidden md:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-l border-pink-100 bg-white transition-all duration-300 ease-in-out ${
            chatExpanded ? "w-[300px]" : "w-[82px]"
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
                    className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-pink-50/60"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="h-[72px] w-[72px] rounded-full object-cover"
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
              <div className="flex flex-col items-center gap-4 py-3">
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
                      className="h-14 w-14 rounded-full object-cover border-2 border-pink-100 transition group-hover:border-pink-300"
                    />
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
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
            item.id === "compose" ? (
              <div key={item.id} className="relative" data-dropdown>
                <button
                  onClick={() => setShowComposeMenu(!showComposeMenu)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition text-[#8c6d7f] active:text-[#df5f97]"
                  aria-label="Create"
                >
                  {item.icon}
                </button>
                {showComposeMenu && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[180px] rounded-2xl border border-pink-100 bg-white py-2 shadow-xl overflow-hidden z-50">
                    <button
                      onClick={() => { setShowCompose(true); setShowComposeMenu(false); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Create Post
                    </button>
                    <button
                      onClick={() => setShowComposeMenu(false)}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                      Create Moment
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                  activePage === item.id
                    ? "text-[#f472b6]"
                    : "text-[#8c6d7f] active:text-[#df5f97]"
                }`}
                aria-label={item.label}
              >
                {item.icon}
              </button>
            )
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
                  className="flex-1 resize-none rounded-xl border border-pink-100 bg-[#fffafc] px-4 py-3 outline-none placeholder:text-[#c59aae] focus:border-pink-300"
                  style={{
                    fontSize: composeFontSize === "small" ? "13px" : composeFontSize === "large" ? "18px" : "14px",
                    fontWeight: composeBold ? "700" : "400",
                    fontStyle: composeItalic ? "italic" : "normal",
                    color: composeFontColor,
                  }}
                />
              </div>

              {/* ─── Text Formatting Toolbar ─── */}
              <div className="mt-3 flex items-center gap-2 flex-wrap border-t border-pink-50 pt-3">
                {/* Font Size */}
                <div className="flex items-center rounded-lg border border-pink-100 overflow-hidden">
                  {[
                    { id: "small", label: "S", title: "Small" },
                    { id: "normal", label: "M", title: "Medium" },
                    { id: "large", label: "L", title: "Large" },
                  ].map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setComposeFontSize(size.id)}
                      className={`px-2.5 py-1.5 text-xs font-semibold transition ${
                        composeFontSize === size.id
                          ? "bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white"
                          : "text-[#8c6d7f] hover:bg-pink-50"
                      }`}
                      title={size.title}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>

                {/* Bold */}
                <button
                  onClick={() => setComposeBold(!composeBold)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold transition ${
                    composeBold
                      ? "border-[#f472b6] bg-pink-50 text-[#f472b6]"
                      : "border-pink-100 text-[#8c6d7f] hover:bg-pink-50"
                  }`}
                  title="Bold"
                >
                  B
                </button>

                {/* Italic */}
                <button
                  onClick={() => setComposeItalic(!composeItalic)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition ${
                    composeItalic
                      ? "border-[#f472b6] bg-pink-50 text-[#f472b6]"
                      : "border-pink-100 text-[#8c6d7f] hover:bg-pink-50"
                  }`}
                  title="Italic"
                >
                  <span className="italic font-serif">I</span>
                </button>

                {/* Color Picker */}
                <div className="flex items-center gap-1 ml-1">
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
                      className={`h-6 w-6 rounded-full border-2 transition ${
                        composeFontColor === c.color
                          ? "border-[#241a22] scale-110"
                          : "border-transparent hover:border-pink-200"
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Media Actions */}
              <div className="mt-3 flex items-center gap-2 border-t border-pink-50 pt-3">
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
                {/* Lock toggle for paid posts */}
                <button className="flex items-center gap-2 rounded-xl border border-pink-100 px-3 py-2 text-xs font-medium text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Price
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
