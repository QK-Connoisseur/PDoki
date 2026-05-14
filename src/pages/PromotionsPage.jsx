import { useState, useRef, useEffect } from "react";
import Sidebar, { MobileNav } from "../components/Sidebar";
import ChatSidebar from "../components/ChatSidebar";
import { StatusMenuRow } from "../components/UserStatusSwitcher";

/* ─── Mock Data ──────────────────────────────────────────────────────── */

const chatContacts = [
  { id: 1, name: "Luna Bloom", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", lastMessage: "Thanks for the support!", status: "online", unread: 2, fromMe: false, time: "2m" },
  { id: 2, name: "Mika Rose", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", lastMessage: "See you on the stream tonight!", status: "busy", unread: 0, fromMe: true, time: "15m" },
  { id: 3, name: "Airi Vale", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80", lastMessage: "New content coming soon", status: "resting", unread: 1, fromMe: false, time: "1h" },
  { id: 4, name: "Sora Nyx", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80", lastMessage: "Loved your comment!", status: "online", unread: 0, fromMe: false, time: "3h" },
  { id: 5, name: "Naomi Hart", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80", lastMessage: "Check out my latest post", status: "offline", unread: 0, fromMe: true, time: "5h" },
  { id: 6, name: "Reina Noir", avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80", lastMessage: "When's the next drop?", status: "busy", unread: 3, fromMe: false, time: "6h" },
];

const notifications = [
  { id: 1, text: "Luna Bloom gave your post a Kokoro", time: "2m ago", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  { id: 2, text: "Mika Rose started following you", time: "15m ago", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" },
  { id: 3, text: "Airi Vale posted a new exclusive drop", time: "1h ago", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80" },
  { id: 4, text: "Sora Nyx commented on your post", time: "3h ago", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80" },
];

const promotions = [
  {
    id: 1,
    name: "Luna Bloom",
    username: "lunabloom",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    cover: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "free-trial",
    promoLabel: "7 Days Free",
    promoDetail: "Free trial for new subscribers",
    originalPrice: "$9.99/mo",
    subscribers: "12.4k",
    posts: 847,
    category: "lifestyle",
  },
  {
    id: 2,
    name: "Mika Rose",
    username: "mikarose",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    cover: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "discount",
    promoLabel: "50% Off",
    promoDetail: "First month half price",
    originalPrice: "$14.99/mo",
    discountPrice: "$7.49/mo",
    subscribers: "8.7k",
    posts: 523,
    category: "gaming",
  },
  {
    id: 3,
    name: "Airi Vale",
    username: "airivale",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
    cover: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "free-trial",
    promoLabel: "14 Days Free",
    promoDetail: "Two weeks free access",
    originalPrice: "$7.99/mo",
    subscribers: "5.2k",
    posts: 312,
    category: "asmr",
  },
  {
    id: 4,
    name: "Sora Nyx",
    username: "soranyx",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    cover: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "discount",
    promoLabel: "30% Off",
    promoDetail: "Limited time discount",
    originalPrice: "$19.99/mo",
    discountPrice: "$13.99/mo",
    subscribers: "21.1k",
    posts: 1203,
    category: "premium",
  },
  {
    id: 5,
    name: "Naomi Hart",
    username: "naomihart",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80",
    cover: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "bundle",
    promoLabel: "3 for 2",
    promoDetail: "Subscribe 3 months, pay for 2",
    originalPrice: "$12.99/mo",
    subscribers: "3.8k",
    posts: 198,
    category: "fitness",
  },
  {
    id: 6,
    name: "Reina Noir",
    username: "reinanoir",
    avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80",
    cover: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "free-trial",
    promoLabel: "3 Days Free",
    promoDetail: "Quick free preview",
    originalPrice: "$24.99/mo",
    subscribers: "15.9k",
    posts: 976,
    category: "premium",
  },
  {
    id: 7,
    name: "Kira Dawn",
    username: "kiradawn",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "discount",
    promoLabel: "70% Off",
    promoDetail: "Massive first-month deal",
    originalPrice: "$9.99/mo",
    discountPrice: "$2.99/mo",
    subscribers: "2.1k",
    posts: 87,
    category: "lifestyle",
  },
  {
    id: 8,
    name: "Yuki Star",
    username: "yukistar",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    cover: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "free-trial",
    promoLabel: "30 Days Free",
    promoDetail: "Full month free trial",
    originalPrice: "$5.99/mo",
    subscribers: "9.4k",
    posts: 634,
    category: "asmr",
  },
  {
    id: 9,
    name: "Hana Mizu",
    username: "hanamizu",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    cover: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "bundle",
    promoLabel: "6 for 4",
    promoDetail: "Subscribe 6 months, pay for 4",
    originalPrice: "$11.99/mo",
    subscribers: "6.3k",
    posts: 421,
    category: "gaming",
  },
  {
    id: 10,
    name: "Emi Skye",
    username: "emiskye",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    cover: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "discount",
    promoLabel: "40% Off",
    promoDetail: "Spring sale discount",
    originalPrice: "$16.99/mo",
    discountPrice: "$9.99/mo",
    subscribers: "18.2k",
    posts: 1087,
    category: "premium",
  },
  {
    id: 11,
    name: "Rin Velvet",
    username: "rinvelvet",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "free-trial",
    promoLabel: "5 Days Free",
    promoDetail: "Try before you subscribe",
    originalPrice: "$8.99/mo",
    subscribers: "4.6k",
    posts: 265,
    category: "fitness",
  },
  {
    id: 12,
    name: "Mei Soleil",
    username: "meisoleil",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80",
    cover: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&h=400&q=80",
    promoType: "discount",
    promoLabel: "60% Off",
    promoDetail: "Limited time mega deal",
    originalPrice: "$22.99/mo",
    discountPrice: "$8.99/mo",
    subscribers: "11.7k",
    posts: 789,
    category: "lifestyle",
  },
];

/* ─── Colors ─────────────────────────────────────────────────────────── */

const SAKURA_PINK = "#f9a8c8";
const HEART_RED = "#e8384f";

/* ─── Filter Tabs ────────────────────────────────────────────────────── */

const filterTabs = [
  { id: "all", label: "All Promos" },
  { id: "free-trial", label: "Free Trials" },
  { id: "discount", label: "Discounts" },
  { id: "bundle", label: "Bundles" },
];

/* ─── Promo Badge Component ─────────────────────────────────────────── */

function PromoBadge({ type, label }) {
  const styles = {
    "free-trial": "bg-emerald-500 text-white",
    "discount": "bg-amber-500 text-white",
    "bundle": "bg-violet-500 text-white",
  };

  const icons = {
    "free-trial": (
      <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
        <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 9H8.7l1.9 3.2-.9.5L7.5 9H5V8h2.3L5.4 4.8l.8-.6L8 7.7l1.8-3.5.8.6L8.7 8h2.8v1z" />
      </svg>
    ),
    "discount": (
      <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
        <path d="M3.5 9.5a1 1 0 100-2 1 1 0 000 2zm9-4a1 1 0 100-2 1 1 0 000 2zM13.5 2l-11 11 1 1 11-11-1-1z" />
      </svg>
    ),
    "bundle": (
      <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
        <path d="M2.5 2A1.5 1.5 0 001 3.5v2A1.5 1.5 0 002.5 7h11A1.5 1.5 0 0015 5.5v-2A1.5 1.5 0 0013.5 2h-11zM2.5 9A1.5 1.5 0 001 10.5v2A1.5 1.5 0 002.5 14h11a1.5 1.5 0 001.5-1.5v-2A1.5 1.5 0 0013.5 9h-11z" />
      </svg>
    ),
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${styles[type]}`}>
      {icons[type]}
      {label}
    </span>
  );
}

/* ─── Promo Card Component ──────────────────────────────────────────── */

function PromoCard({ promo }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative rounded-2xl overflow-hidden border border-pink-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/50 hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={promo.cover}
          alt={promo.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Promo Badge - top left */}
        <div className="absolute top-3 left-3">
          <PromoBadge type={promo.promoType} label={promo.promoLabel} />
        </div>

        {/* Creator info overlay at bottom */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <div className="flex items-center gap-2.5">
            <img
              src={promo.avatar}
              alt={promo.name}
              className="h-10 w-10 rounded-full object-cover border-2 border-white/80 shadow-md"
            />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{promo.name}</p>
              <p className="text-white/70 text-xs">@{promo.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Promo Detail */}
        <p className="text-sm font-medium text-[#241a22]">{promo.promoDetail}</p>

        {/* Stats Row */}
        <div className="flex items-center gap-3 mt-2 text-xs text-[#8c6d7f]">
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 14s-5.5-3.5-5.5-7.5a3.5 3.5 0 017 0 3.5 3.5 0 017 0c0 4-5.5 7.5-5.5 7.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {promo.subscribers}
          </span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="12" height="12" rx="2" strokeLinecap="round" />
              <path d="M5 6h6M5 8.5h4" strokeLinecap="round" />
            </svg>
            {promo.posts} posts
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 mt-3">
          {promo.promoType === "free-trial" ? (
            <>
              <span className="text-emerald-600 font-bold text-sm">FREE</span>
              <span className="text-xs text-[#b89aa8]">then {promo.originalPrice}</span>
            </>
          ) : promo.promoType === "discount" ? (
            <>
              <span className="text-amber-600 font-bold text-sm">{promo.discountPrice}</span>
              <span className="text-xs text-[#b89aa8] line-through">{promo.originalPrice}</span>
            </>
          ) : (
            <>
              <span className="text-violet-600 font-bold text-sm">{promo.promoLabel}</span>
              <span className="text-xs text-[#b89aa8]">at {promo.originalPrice}</span>
            </>
          )}
        </div>

        {/* CTA Button */}
        <button className="w-full mt-3 rounded-xl bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-200/50 transition hover:shadow-lg hover:from-[#f472b6] hover:to-[#ec4899]">
          {promo.promoType === "free-trial" ? "Start Free Trial" : promo.promoType === "discount" ? "Claim Discount" : "Get Bundle"}
        </button>
      </div>
    </div>
  );
}

/* ─── Pumdoki Mini Logo ──────────────────────────────────────────────── */

function PumdokiLogo() {
  return (
    <svg viewBox="0 0 520 120" className="h-9 w-auto" aria-label="Pumdoki" role="img">
      <defs>
        <linearGradient id="promoMiniHeartBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff7fa" />
          <stop offset="48%" stopColor="#ffd8e5" />
          <stop offset="100%" stopColor="#f3a0bc" />
        </linearGradient>
        <linearGradient id="promoMiniWordFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd1e0" />
          <stop offset="55%" stopColor="#f8b3ca" />
          <stop offset="100%" stopColor="#ef8fb1" />
        </linearGradient>
      </defs>
      <g transform="translate(4,6)">
        <path
          d="M52 66c-4-3-7-6-9-8C27 43 18 33 18 20 18 9 26 0 37 0c7 0 13 3 17 10 5-7 11-10 18-10 11 0 19 9 19 20 0 13-10 23-27 38l-9 8-5 5-5-5Z"
          fill="url(#promoMiniHeartBase)"
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
        fill="url(#promoMiniWordFill)"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        letterSpacing="0.5"
      >
        Pumdoki
      </text>
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function PromotionsPage({ onBack, onLogout, onViewProfile, onOpenConnect, onOpenStore, onOpenPromotions, onOpenDashboard, userStatus = 'online', onStatusChange }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showComposeMenu, setShowComposeMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [composeFontSize, setComposeFontSize] = useState("normal");
  const [composeFontColor, setComposeFontColor] = useState("#4a3340");
  const [composeBold, setComposeBold] = useState(false);
  const [composeItalic, setComposeItalic] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-dropdown]")) {
        setShowProfileMenu(false);
        setShowNotifications(false);
        setShowSearch(false);
        setShowComposeMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredPromotions = activeFilter === "all"
    ? promotions
    : promotions.filter((p) => p.promoType === activeFilter);

  const freeTrialPromos = filteredPromotions.filter((p) => p.promoType === "free-trial");
  const discountPromos = filteredPromotions.filter((p) => p.promoType === "discount");
  const bundlePromos = filteredPromotions.filter((p) => p.promoType === "bundle");

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
          <div className="flex items-center shrink-0">
            <button type="button" onClick={onBack} className="cursor-pointer" aria-label="Back to home">
              <PumdokiLogo />
            </button>
          </div>
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
                    placeholder="Search promotions, creators..."
                    className="w-full rounded-xl border border-pink-100 bg-[#fffafc] px-4 py-2.5 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300"
                  />
                  <div className="mt-3 text-xs text-[#b89aa8]">Try searching for a creator or promotion type</div>
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
                  <StatusMenuRow status={userStatus} onStatusChange={onStatusChange} />
                  <hr className="my-1 border-pink-100" />
                  {[
                    { label: "My Profile", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z", action: () => onViewProfile && onViewProfile() },
                    { label: "Creator Dashboard", icon: "M4 6h16M4 12h16M4 18h7", action: onOpenDashboard },
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
        <Sidebar
          activePage="promotions"
          onNavigate={(id) => {
            if (id === "home") onBack && onBack();
            else if (id === "connect") onOpenConnect && onOpenConnect();
            else if (id === "store") onOpenStore && onOpenStore();
          }}
          onOpenDashboard={onOpenDashboard}
          onLogout={onLogout}
          showComposeMenu={showComposeMenu}
          setShowComposeMenu={setShowComposeMenu}
          onComposePost={() => setShowCompose(true)}
        />

        {/* ─── Main Content ────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 pb-20 md:pb-8">
          <div className="max-w-[1700px] mx-auto px-4 pt-4">
            {/* ─── Page Header ─────────────────────────────────────── */}
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-[#241a22]">Promotions</h1>
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-3 py-1 text-xs font-bold text-white">
                  <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
                    <path d="M8 1.5l2 4 4.5.7-3.3 3.1.8 4.5L8 11.8l-4 2 .8-4.5L1.5 6.2 6 5.5z" />
                  </svg>
                  {promotions.length} active
                </span>
              </div>
              <p className="text-sm text-[#8c6d7f] mt-1">Exclusive deals from your favorite creators</p>
            </div>

            {/* ─── Hero Banner ─────────────────────────────────────── */}
            <div className="relative mb-6 rounded-2xl overflow-hidden bg-gradient-to-r from-[#f9a8c8] via-[#f472b6] to-[#ec4899] p-6 md:p-8">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-8 w-24 h-24 rounded-full bg-white/40" />
                <div className="absolute bottom-2 left-12 w-16 h-16 rounded-full bg-white/30" />
                <div className="absolute top-1/2 right-1/3 w-10 h-10 rounded-full bg-white/20" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <span className="text-white/90 text-sm font-medium">Limited Time Offers</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Save big on subscriptions</h2>
                <p className="text-white/80 text-sm mt-2 max-w-lg">
                  Discover free trials, exclusive discounts, and bundle deals from creators on Pumdoki. Don't miss out!
                </p>
                <div className="flex gap-3 mt-4">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white text-xs font-medium">{freeTrialPromos.length + (activeFilter === "all" ? promotions.filter(p => p.promoType === "free-trial").length - freeTrialPromos.length : 0)} Free Trials</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-white text-xs font-medium">Up to 70% Off</span>
                  </div>
                </div>
              </div>
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

            {/* ─── Free Trials Section ─────────────────────────────── */}
            {freeTrialPromos.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Free Trials
                  </h2>
                  <button className="text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition">
                    Show All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {freeTrialPromos.map((promo) => (
                    <PromoCard key={`trial-${promo.id}`} promo={promo} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Discounts Section ───────────────────────────────── */}
            {discountPromos.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="5" x2="5" y2="19" />
                      <circle cx="6.5" cy="6.5" r="2.5" />
                      <circle cx="17.5" cy="17.5" r="2.5" />
                    </svg>
                    Discounts
                  </h2>
                  <button className="text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition">
                    Show All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {discountPromos.map((promo) => (
                    <PromoCard key={`discount-${promo.id}`} promo={promo} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Bundle Deals Section ────────────────────────────── */}
            {bundlePromos.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                    </svg>
                    Bundle Deals
                  </h2>
                  <button className="text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition">
                    Show All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {bundlePromos.map((promo) => (
                    <PromoCard key={`bundle-${promo.id}`} promo={promo} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Empty State ─────────────────────────────────────── */}
            {filteredPromotions.length === 0 && (
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#f472b6]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <p className="text-[#b89aa8] text-sm">No promotions found for this filter.</p>
                <button
                  onClick={() => setActiveFilter("all")}
                  className="mt-3 text-sm font-semibold text-[#f472b6] hover:text-[#ec4899] transition"
                >
                  View all promos
                </button>
              </div>
            )}
          </div>
        </main>

        <ChatSidebar contacts={chatContacts} />
      </div>

      <MobileNav
        activePage="promotions"
        onNavigate={(id) => {
          if (id === "home") onBack && onBack();
          else if (id === "connect") onOpenConnect && onOpenConnect();
          else if (id === "store") onOpenStore && onOpenStore();
        }}
        showComposeMenu={showComposeMenu}
        setShowComposeMenu={setShowComposeMenu}
        onComposePost={() => setShowCompose(true)}
        totalUnread={totalUnread}
      />

      {/* ─── Compose Modal ─────────────────────────────────────────── */}
      {showCompose && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-pink-100 bg-white shadow-2xl overflow-hidden">
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
              <div className="mt-3 flex items-center gap-2 flex-wrap border-t border-pink-50 pt-3">
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
