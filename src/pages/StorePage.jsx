import { useState, useRef, useEffect } from "react";

/* ─── Mock Data ──────────────────────────────────────────────────────── */

const storeItems = [
  {
    id: 1,
    type: "Shout Out",
    title: "Personalized Birthday Shout Out",
    description: "I'll record a custom birthday shout out just for you or your loved one!",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Luna Bloom",
    username: "lunabloom",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    level: "star",
    rating: 4.9,
    ratingCount: 312,
    deliveryTime: "24h",
  },
  {
    id: 2,
    type: "Custom Video",
    title: "Exclusive Custom Dance Video",
    description: "A personalized dance video with your song of choice and a special message.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Mika Rose",
    username: "mikarose",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    level: "legend",
    rating: 5.0,
    ratingCount: 189,
    deliveryTime: "48h",
  },
  {
    id: 3,
    type: "ASMR",
    title: "Relaxing Whisper ASMR Session",
    description: "Custom ASMR whisper session with your name and chosen triggers.",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Airi Vale",
    username: "airivale",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
    level: "gold",
    rating: 4.8,
    ratingCount: 256,
    deliveryTime: "24h",
  },
  {
    id: 4,
    type: "Custom Photo",
    title: "Personalized Signed Photo Set",
    description: "5 exclusive signed photos with a personal note written just for you.",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Sora Nyx",
    username: "soranyx",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    level: "gold",
    rating: 4.7,
    ratingCount: 143,
    deliveryTime: "72h",
  },
  {
    id: 5,
    type: "Custom Audio",
    title: "Custom Voice Message & Pep Talk",
    description: "A heartfelt audio message to motivate, celebrate, or comfort you.",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Naomi Hart",
    username: "naomihart",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80",
    level: "silver",
    rating: 4.6,
    ratingCount: 98,
    deliveryTime: "24h",
  },
  {
    id: 6,
    type: "Personalized Zing",
    title: "Custom Zing with Your Name",
    description: "A fun, energetic personalized zing video that you can share everywhere!",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Reina Noir",
    username: "reinanoir",
    avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80",
    level: "star",
    rating: 4.9,
    ratingCount: 274,
    deliveryTime: "24h",
  },
  {
    id: 7,
    type: "Shout Out",
    title: "Motivational Shout Out Video",
    description: "Need a boost? I'll record a personal motivational message for you!",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Kira Dawn",
    username: "kiradawn",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    level: "gold",
    rating: 4.8,
    ratingCount: 167,
    deliveryTime: "48h",
  },
  {
    id: 8,
    type: "ASMR",
    title: "Sleep-Inducing Rain & Tapping ASMR",
    description: "Custom ASMR with rain sounds, tapping, and whispering your name.",
    price: 16.99,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Yuki Star",
    username: "yukistar",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    level: "silver",
    rating: 4.5,
    ratingCount: 82,
    deliveryTime: "24h",
  },
  {
    id: 9,
    type: "Custom Video",
    title: "Personalized Workout Routine Video",
    description: "I'll create a custom workout video tailored to your fitness goals!",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Luna Bloom",
    username: "lunabloom",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    level: "star",
    rating: 4.9,
    ratingCount: 201,
    deliveryTime: "72h",
  },
  {
    id: 10,
    type: "Custom Photo",
    title: "Exclusive Polaroid-Style Photo Pack",
    description: "10 exclusive polaroid-style photos with custom captions and dedications.",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Mika Rose",
    username: "mikarose",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    level: "legend",
    rating: 5.0,
    ratingCount: 342,
    deliveryTime: "48h",
  },
  {
    id: 11,
    type: "Personalized Zing",
    title: "Hype Zing for Your Birthday Party",
    description: "An epic zing video to kick off your birthday celebration in style!",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Airi Vale",
    username: "airivale",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
    level: "gold",
    rating: 4.7,
    ratingCount: 119,
    deliveryTime: "24h",
  },
  {
    id: 12,
    type: "Custom Audio",
    title: "Goodnight Audio Message",
    description: "A soothing goodnight audio with your name whispered softly.",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Sora Nyx",
    username: "soranyx",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    level: "gold",
    rating: 4.8,
    ratingCount: 156,
    deliveryTime: "24h",
  },
  {
    id: 13,
    type: "Shout Out",
    title: "Anniversary Celebration Shout Out",
    description: "Celebrate your special anniversary with a heartfelt personalized video message.",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Naomi Hart",
    username: "naomihart",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80",
    level: "silver",
    rating: 4.6,
    ratingCount: 74,
    deliveryTime: "48h",
  },
  {
    id: 14,
    type: "ASMR",
    title: "Ear-to-Ear Breathing & Whispers",
    description: "Deeply relaxing ASMR with gentle breathing and personal whispers.",
    price: 18.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Reina Noir",
    username: "reinanoir",
    avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80",
    level: "star",
    rating: 4.9,
    ratingCount: 298,
    deliveryTime: "24h",
  },
  {
    id: 15,
    type: "Custom Video",
    title: "Custom Cooking Tutorial Video",
    description: "I'll cook your favorite recipe and walk you through it step by step!",
    price: 22.99,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Kira Dawn",
    username: "kiradawn",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    level: "gold",
    rating: 4.7,
    ratingCount: 134,
    deliveryTime: "72h",
  },
  {
    id: 16,
    type: "Personalized Zing",
    title: "Graduation Congratulations Zing",
    description: "Celebrate your grad moment with an unforgettable personalized zing!",
    price: 10.99,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=600&h=450&q=80",
    creator: "Yuki Star",
    username: "yukistar",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    level: "silver",
    rating: 4.5,
    ratingCount: 67,
    deliveryTime: "24h",
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

const categories = [
  { id: "all", label: "All" },
  { id: "shoutout", label: "Shout Outs" },
  { id: "zing", label: "Personalized Zings" },
  { id: "video", label: "Videos" },
  { id: "photo", label: "Photos" },
  { id: "audio", label: "Audios" },
  { id: "asmr", label: "ASMR" },
];

const categoryToType = {
  shoutout: "Shout Out",
  zing: "Personalized Zing",
  video: "Custom Video",
  photo: "Custom Photo",
  audio: "Custom Audio",
  asmr: "ASMR",
};

const typeBadgeColors = {
  "Shout Out": "bg-pink-200 text-pink-800",
  "Custom Video": "bg-purple-200 text-purple-800",
  "ASMR": "bg-blue-200 text-blue-800",
  "Custom Photo": "bg-green-200 text-green-800",
  "Custom Audio": "bg-amber-200 text-amber-800",
  "Personalized Zing": "bg-rose-200 text-rose-800",
};

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

/* ─── Level Badge ────────────────────────────────────────────────────── */

function LevelBadge({ level }) {
  if (level === "bronze") {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: "#cd7f32" }}>
        <span className="text-[8px] font-bold text-white">B</span>
      </span>
    );
  }
  if (level === "silver") {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-400">
        <span className="text-[8px] font-bold text-white">S</span>
      </span>
    );
  }
  if (level === "gold") {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400">
        <span className="text-[8px] font-bold text-white">G</span>
      </span>
    );
  }
  if (level === "star") {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4 inline-block">
        <polygon
          points="8,1 10,6 15,6.5 11,10 12.5,15 8,12.5 3.5,15 5,10 1,6.5 6,6"
          fill="#f9a8c8"
          stroke="#ec4899"
          strokeWidth="0.8"
        />
      </svg>
    );
  }
  if (level === "legend") {
    return (
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
  return null;
}

/* ─── Star Rating ────────────────────────────────────────────────────── */

function StarRating({ rating, count }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={`full-${i}`} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="#fbbf24">
            <polygon points="10,1 12.5,7 19,7.5 14,11.5 15.5,18 10,14.5 4.5,18 6,11.5 1,7.5 7.5,7" />
          </svg>
        ))}
        {hasHalf && (
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
            <defs>
              <linearGradient id="halfStar">
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <polygon points="10,1 12.5,7 19,7.5 14,11.5 15.5,18 10,14.5 4.5,18 6,11.5 1,7.5 7.5,7" fill="url(#halfStar)" />
          </svg>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg key={`empty-${i}`} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="#e5e7eb">
            <polygon points="10,1 12.5,7 19,7.5 14,11.5 15.5,18 10,14.5 4.5,18 6,11.5 1,7.5 7.5,7" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-[#8c6d7f]">({count})</span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function StorePage({ onBack, onLogout, onViewProfile, onOpenConnect, onOpenStore }) {
  const [chatExpanded, setChatExpanded] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [activePage, setActivePage] = useState("store");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showComposeMenu, setShowComposeMenu] = useState(false);
  const [composeFontSize, setComposeFontSize] = useState("normal");
  const [composeFontColor, setComposeFontColor] = useState("#4a3340");
  const [composeBold, setComposeBold] = useState(false);
  const [composeItalic, setComposeItalic] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [storeSearch, setStoreSearch] = useState("");
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

  // Handle nav clicks
  useEffect(() => {
    if (activePage === "home" && onBack) {
      onBack();
    }
  }, [activePage, onBack]);

  const totalUnread = chatContacts.reduce((sum, c) => sum + c.unread, 0);

  // Filter items
  const filteredItems = storeItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.type === categoryToType[activeCategory];
    const matchesSearch = storeSearch === "" ||
      item.title.toLowerCase().includes(storeSearch.toLowerCase()) ||
      item.creator.toLowerCase().includes(storeSearch.toLowerCase()) ||
      item.type.toLowerCase().includes(storeSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(storeSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sections
  const trendingItems = storeItems.filter((item) => item.rating >= 4.8).slice(0, 4);
  const newArrivals = storeItems.slice(8, 12);
  const popularCreators = [
    { name: "Luna Bloom", username: "lunabloom", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", level: "star", items: 12, rating: 4.9 },
    { name: "Mika Rose", username: "mikarose", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", level: "legend", items: 18, rating: 5.0 },
    { name: "Reina Noir", username: "reinanoir", avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80", level: "star", items: 9, rating: 4.9 },
    { name: "Airi Vale", username: "airivale", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80", level: "gold", items: 7, rating: 4.8 },
  ];

  const showSections = activeCategory === "all" && storeSearch === "";

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
                    { label: "My Profile", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z", action: onViewProfile },
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
        {/* ─── Left Sidebar (Desktop) – IG-style collapsible drawer ── */}
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
                  onClick={() => {
                    if (item.id === "home") onBack();
                    else if (item.id === "connect" && onOpenConnect) onOpenConnect();
                    else setActivePage(item.id);
                  }}
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
          <div className="max-w-[900px] mx-auto px-4 pt-4">
            {/* ─── Page Title ──────────────────────────────────────── */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-[#241a22]">Store</h1>
              <p className="mt-1 text-sm text-[#8c6d7f]">Discover personalized content from your favorite creators</p>
            </div>

            {/* ─── Store Search Bar ────────────────────────────────── */}
            <div className="mb-4">
              <div className="relative">
                <svg viewBox="0 0 24 24" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#b89aa8]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  placeholder="Search items, creators, categories..."
                  className="w-full rounded-xl border border-pink-100 bg-white pl-10 pr-4 py-2.5 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300 shadow-sm"
                />
              </div>
            </div>

            {/* ─── Category Tabs ───────────────────────────────────── */}
            <div className="mb-6 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeCategory === cat.id
                      ? "bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white shadow-md shadow-pink-200/50"
                      : "bg-white border border-pink-100 text-[#8c6d7f] hover:bg-pink-50 hover:text-[#df5f97] hover:border-pink-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* ─── Sections (only when "All" and no search) ──────── */}
            {showSections && (
              <>
                {/* TRENDING ITEMS */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#241a22] flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#e8384f]" fill="currentColor" stroke="none">
                        <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
                      </svg>
                      TRENDING ITEMS
                    </h2>
                    <button className="text-sm text-[#f472b6] font-medium hover:text-[#ec4899] transition">View All</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {trendingItems.map((item) => (
                      <div
                        key={`trending-${item.id}`}
                        className="group rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                      >
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full aspect-[4/3] object-cover"
                            loading="lazy"
                          />
                          <span className={`absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${typeBadgeColors[item.type]}`}>
                            {item.type}
                          </span>
                          <div className="absolute bottom-2.5 left-2.5">
                            <img
                              src={item.avatar}
                              alt={item.creator}
                              className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm font-semibold text-[#241a22] truncate">{item.creator}</span>
                            <LevelBadge level={item.level} />
                          </div>
                          <p className="text-xs text-[#b89aa8] mb-1.5">@{item.username}</p>
                          <p className="text-sm text-[#5b4153] font-medium truncate mb-2">{item.title}</p>
                          <StarRating rating={item.rating} count={item.ratingCount} />
                          <div className="flex items-center justify-between mt-2.5">
                            <span className="text-lg font-bold text-[#241a22]">${item.price.toFixed(2)}</span>
                            <span className="flex items-center gap-1 text-[10px] text-[#8c6d7f]">
                              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                              {item.deliveryTime}
                            </span>
                          </div>
                          <button className="mt-3 w-full rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] py-2 text-xs font-bold text-white tracking-wide uppercase shadow-md shadow-pink-200/50 transition hover:shadow-lg hover:from-[#f472b6] hover:to-[#ec4899] active:scale-[0.98]">
                            Order Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* POPULAR CREATORS */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#241a22] flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#f472b6]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      POPULAR CREATORS
                    </h2>
                    <button className="text-sm text-[#f472b6] font-medium hover:text-[#ec4899] transition">View All</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {popularCreators.map((creator) => (
                      <button
                        key={creator.username}
                        className="group rounded-2xl border border-pink-100 bg-white p-4 shadow-sm text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                      >
                        <div className="flex flex-col items-center text-center">
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="h-16 w-16 rounded-full object-cover border-2 border-pink-100 mb-3 group-hover:border-pink-300 transition"
                          />
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-sm font-semibold text-[#241a22]">{creator.name}</span>
                            <LevelBadge level={creator.level} />
                          </div>
                          <p className="text-xs text-[#b89aa8] mb-2">@{creator.username}</p>
                          <div className="flex items-center gap-3 text-xs text-[#8c6d7f]">
                            <span className="flex items-center gap-1">
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z" />
                                <path d="M3 7h18" />
                                <path d="M16 11a4 4 0 01-8 0" />
                              </svg>
                              {creator.items} items
                            </span>
                            <span className="flex items-center gap-1">
                              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="#fbbf24">
                                <polygon points="10,1 12.5,7 19,7.5 14,11.5 15.5,18 10,14.5 4.5,18 6,11.5 1,7.5 7.5,7" />
                              </svg>
                              {creator.rating}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* NEW ARRIVALS */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#241a22] flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#f9a8c8]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      NEW ARRIVALS
                    </h2>
                    <button className="text-sm text-[#f472b6] font-medium hover:text-[#ec4899] transition">View All</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {newArrivals.map((item) => (
                      <div
                        key={`new-${item.id}`}
                        className="group rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                      >
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full aspect-[4/3] object-cover"
                            loading="lazy"
                          />
                          <span className={`absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${typeBadgeColors[item.type]}`}>
                            {item.type}
                          </span>
                          <div className="absolute bottom-2.5 left-2.5">
                            <img
                              src={item.avatar}
                              alt={item.creator}
                              className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm font-semibold text-[#241a22] truncate">{item.creator}</span>
                            <LevelBadge level={item.level} />
                          </div>
                          <p className="text-xs text-[#b89aa8] mb-1.5">@{item.username}</p>
                          <p className="text-sm text-[#5b4153] font-medium truncate mb-2">{item.title}</p>
                          <StarRating rating={item.rating} count={item.ratingCount} />
                          <div className="flex items-center justify-between mt-2.5">
                            <span className="text-lg font-bold text-[#241a22]">${item.price.toFixed(2)}</span>
                            <span className="flex items-center gap-1 text-[10px] text-[#8c6d7f]">
                              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                              {item.deliveryTime}
                            </span>
                          </div>
                          <button className="mt-3 w-full rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] py-2 text-xs font-bold text-white tracking-wide uppercase shadow-md shadow-pink-200/50 transition hover:shadow-lg hover:from-[#f472b6] hover:to-[#ec4899] active:scale-[0.98]">
                            Order Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ─── All Items / Filtered Grid ─────────────────────── */}
            <div className="mb-8">
              {!showSections && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#241a22]">
                    {activeCategory === "all" ? "Search Results" : categories.find((c) => c.id === activeCategory)?.label}
                    <span className="ml-2 text-sm font-normal text-[#8c6d7f]">({filteredItems.length} items)</span>
                  </h2>
                </div>
              )}
              {showSections && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#241a22] flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#8c6d7f]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    ALL ITEMS
                  </h2>
                </div>
              )}
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full aspect-[4/3] object-cover"
                          loading="lazy"
                        />
                        <span className={`absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${typeBadgeColors[item.type]}`}>
                          {item.type}
                        </span>
                        <div className="absolute bottom-2.5 left-2.5">
                          <img
                            src={item.avatar}
                            alt={item.creator}
                            className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm font-semibold text-[#241a22] truncate">{item.creator}</span>
                          <LevelBadge level={item.level} />
                        </div>
                        <p className="text-xs text-[#b89aa8] mb-1.5">@{item.username}</p>
                        <p className="text-sm text-[#5b4153] font-medium truncate mb-1">{item.title}</p>
                        <p className="text-xs text-[#8c6d7f] truncate mb-2">{item.description}</p>
                        <StarRating rating={item.rating} count={item.ratingCount} />
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-lg font-bold text-[#241a22]">${item.price.toFixed(2)}</span>
                          <span className="flex items-center gap-1 text-[10px] text-[#8c6d7f]">
                            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                            Delivers in {item.deliveryTime}
                          </span>
                        </div>
                        <button className="mt-3 w-full rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] py-2 text-xs font-bold text-white tracking-wide uppercase shadow-md shadow-pink-200/50 transition hover:shadow-lg hover:from-[#f472b6] hover:to-[#ec4899] active:scale-[0.98]">
                          Order Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 text-[#d4b8c7] mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <p className="text-sm font-medium text-[#8c6d7f]">No items found</p>
                  <p className="mt-1 text-xs text-[#b89aa8]">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
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
                onClick={() => setActivePage(item.id)}
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
