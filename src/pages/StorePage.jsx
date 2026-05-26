import { useState, useRef, useEffect } from "react";
import Sidebar, { MobileNav } from "../components/Sidebar";
import ChatSidebar from "../components/ChatSidebar";
import { StatusMenuRow } from "../components/UserStatusSwitcher";
import CreatePostModal from "../components/CreatePostModal";
import InlineFollowButton from "../components/InlineFollowButton";
import FollowButton from "../components/FollowButton";

/* ─── Mock Store Content Data ────────────────────────────────────────── */

const storeContent = [
  {
    id: 1, title: "Sakura Dreams Unboxing", creator: "Luna Bloom", username: "lunabloom",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&h=400&q=80",
    price: 11.99, duration: "12:34", level: "star", date: "March 12, 2026",
    isNew: true, downloadable: true, type: "video", bookmarked: false, kokoros: 1842,
  },
  {
    id: 2, title: "Late Night Whisper Session", creator: "Mika Rose", username: "mikarose",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&h=400&q=80",
    price: 10.99, duration: "11:53", level: "legend", date: "March 10, 2026",
    isNew: true, downloadable: true, type: "video", bookmarked: false, kokoros: 2310,
  },
  {
    id: 3, title: "Cozy ASMR Rain & Taps", creator: "Airi Vale", username: "airivale",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&w=600&h=400&q=80",
    price: 8.99, duration: "17:30", level: "gold", date: "March 08, 2026",
    isNew: true, downloadable: true, type: "audio", bookmarked: false, kokoros: 987,
  },
  {
    id: 4, title: "Exclusive Photo Collection", creator: "Sora Nyx", username: "soranyx",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&h=400&q=80",
    price: 7.99, duration: null, level: "gold", date: "March 06, 2026",
    isNew: false, downloadable: true, type: "photo", bookmarked: true, kokoros: 756,
  },
  {
    id: 5, title: "Morning Routine Vlog", creator: "Naomi Hart", username: "naomihart",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&h=400&q=80",
    price: 8.99, duration: "07:42", level: "silver", date: "March 06, 2026",
    isNew: false, downloadable: true, type: "video", bookmarked: false, kokoros: 423,
  },
  {
    id: 6, title: "Custom Dance Freestyle", creator: "Reina Noir", username: "reinanoir",
    avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&h=400&q=80",
    price: 10.99, duration: "10:17", level: "star", date: "February 28, 2026",
    isNew: false, downloadable: true, type: "video", bookmarked: false, kokoros: 1654,
  },
  {
    id: 7, title: "Behind the Scenes Photoshoot", creator: "Kira Dawn", username: "kiradawn",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=400&q=80",
    price: 6.99, duration: "08:14", level: "gold", date: "February 25, 2026",
    isNew: false, downloadable: true, type: "video", bookmarked: false, kokoros: 531,
  },
  {
    id: 8, title: "Relaxation Breathing Guide", creator: "Yuki Star", username: "yukistar",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&h=400&q=80",
    price: 10.99, duration: "10:42", level: "silver", date: "February 22, 2026",
    isNew: false, downloadable: false, type: "video", bookmarked: false, kokoros: 298,
  },
  {
    id: 9, title: "Gaming Stream Highlights", creator: "Luna Bloom", username: "lunabloom",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&h=400&q=80",
    price: 10.99, duration: "10:32", level: "star", date: "February 20, 2026",
    isNew: false, downloadable: true, type: "video", bookmarked: false, kokoros: 1123,
  },
  {
    id: 10, title: "Polaroid-Style Exclusives", creator: "Mika Rose", username: "mikarose",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&h=400&q=80",
    price: 11.99, duration: null, level: "legend", date: "February 18, 2026",
    isNew: false, downloadable: true, type: "photo", bookmarked: false, kokoros: 889,
  },
  {
    id: 11, title: "Sunset Yoga Flow", creator: "Airi Vale", username: "airivale",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&h=400&q=80",
    price: 9.99, duration: "05:26", level: "gold", date: "February 14, 2026",
    isNew: false, downloadable: true, type: "video", bookmarked: true, kokoros: 612,
  },
  {
    id: 12, title: "Valentine Voice Message", creator: "Sora Nyx", username: "soranyx",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&h=400&q=80",
    price: 6.99, duration: "03:18", level: "gold", date: "February 12, 2026",
    isNew: false, downloadable: false, type: "audio", bookmarked: false, kokoros: 445,
  },
  {
    id: 13, title: "Cooking With Me: Matcha Latte", creator: "Kira Dawn", username: "kiradawn",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&h=400&q=80",
    price: 12.99, duration: "15:07", level: "gold", date: "February 10, 2026",
    isNew: false, downloadable: true, type: "video", bookmarked: false, kokoros: 1987,
  },
  {
    id: 14, title: "ASMR Ear-to-Ear Tingles", creator: "Reina Noir", username: "reinanoir",
    avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&h=400&q=80",
    price: 10.99, duration: "11:09", level: "star", date: "February 06, 2026",
    isNew: false, downloadable: true, type: "audio", bookmarked: false, kokoros: 2750,
  },
  {
    id: 15, title: "Travel Diary: Cherry Blossom", creator: "Naomi Hart", username: "naomihart",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&h=400&q=80",
    price: 8.99, duration: "09:01", level: "silver", date: "February 05, 2026",
    isNew: false, downloadable: true, type: "video", bookmarked: false, kokoros: 374,
  },
  {
    id: 16, title: "Graduation Celebration Zing", creator: "Yuki Star", username: "yukistar",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=600&h=400&q=80",
    price: 5.99, duration: "05:52", level: "silver", date: "February 01, 2026",
    isNew: false, downloadable: true, type: "video", bookmarked: false, kokoros: 210,
  },
  {
    id: 17, title: "Midnight ASMR Whispers", creator: "Luna Bloom", username: "lunabloom",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&h=400&q=80",
    price: 13.99, duration: "22:10", level: "star", date: "January 28, 2026",
    isNew: false, downloadable: true, type: "audio", bookmarked: false, kokoros: 1432,
  },
  {
    id: 18, title: "Dance Challenge Compilation", creator: "Mika Rose", username: "mikarose",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&h=400&q=80",
    price: 14.99, duration: "18:44", level: "legend", date: "January 24, 2026",
    isNew: false, downloadable: true, type: "video", bookmarked: false, kokoros: 3210,
  },
  {
    id: 19, title: "Exclusive BTS Bloopers", creator: "Kira Dawn", username: "kiradawn",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=400&q=80",
    price: 7.99, duration: "06:22", level: "gold", date: "January 22, 2026",
    isNew: false, downloadable: true, type: "video", bookmarked: false, kokoros: 678,
  },
  {
    id: 20, title: "Premium Photo Set Vol. 3", creator: "Reina Noir", username: "reinanoir",
    avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&h=400&q=80",
    price: 15.99, duration: null, level: "star", date: "January 20, 2026",
    isNew: false, downloadable: true, type: "photo", bookmarked: false, kokoros: 1245,
  },
  {
    id: 21, title: "Bedroom Singing Session", creator: "Naomi Hart", username: "naomihart",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80",
    thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&h=400&q=80",
    price: 9.99, duration: "12:22", level: "silver", date: "January 18, 2026",
    isNew: false, downloadable: false, type: "video", bookmarked: false, kokoros: 559,
  },
];

/* Unique creators derived from storeContent */
const allCreators = [...new Map(storeContent.map((item) => [
  item.username,
  { name: item.creator, username: item.username, avatar: item.avatar },
])).values()];

/* Initial followed usernames for state seed */
const initialFollowedUsernames = new Set([
  "lunabloom", "mikarose", "airivale", "soranyx", "reinanoir",
]);

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

/* ─── Filter Config ──────────────────────────────────────────────────── */

const storeTabs = [
  { id: "following", label: "Following" },
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
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: "#cd7f32" }}>
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

/* ─── Pumdoki Mini Logo ──────────────────────────────────────────────── */

function PumdokiLogo() {
  return (
    <svg viewBox="0 0 520 120" className="h-9 w-auto" aria-label="Pumdoki" role="img">
      <defs>
        <linearGradient id="storeMiniHeartBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff7fa" />
          <stop offset="48%" stopColor="#ffd8e5" />
          <stop offset="100%" stopColor="#f3a0bc" />
        </linearGradient>
        <linearGradient id="storeMiniWordFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd1e0" />
          <stop offset="55%" stopColor="#f8b3ca" />
          <stop offset="100%" stopColor="#ef8fb1" />
        </linearGradient>
      </defs>
      <g transform="translate(4,6)">
        <path
          d="M52 66c-4-3-7-6-9-8C27 43 18 33 18 20 18 9 26 0 37 0c7 0 13 3 17 10 5-7 11-10 18-10 11 0 19 9 19 20 0 13-10 23-27 38l-9 8-5 5-5-5Z"
          fill="url(#storeMiniHeartBase)"
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
        fill="url(#storeMiniWordFill)"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        letterSpacing="0.5"
      >
        Pumdoki
      </text>
    </svg>
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
        checked ? "text-[#f472b6] font-semibold bg-pink-50/60" : "text-[#5b4153] hover:bg-pink-50/40"
      }`}
    >
      <span
        className={`flex items-center justify-center w-4 h-4 rounded border-2 shrink-0 transition ${
          checked ? "border-[#f472b6] bg-[#f472b6]" : "border-[#d4b8c7]"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </span>
      {label}
    </button>
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
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <p className="text-sm font-bold text-[#241a22] line-clamp-2 leading-snug">{item.title}</p>

        {/* Creator info */}
        <div className="flex items-center gap-1.5 min-w-0">
          <img src={item.avatar} alt={item.creator} className="w-5 h-5 rounded-full object-cover shrink-0" />
          <span className="text-xs font-medium text-[#8c6d7f] truncate">{item.creator}</span>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="#f472b6" aria-hidden="true">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] text-[#b89aa8] shrink-0">· {getRelativeDate(item.date)}</span>
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-sm font-semibold text-[#241a22]">${item.price.toFixed(2)}</span>
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
                onClick={(e) => { e.stopPropagation(); onBookmark(item.id); }}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                  item.bookmarked ? "text-[#f472b6] bg-pink-50" : "text-[#b89aa8] hover:text-[#f472b6] hover:bg-pink-50"
                }`}
                aria-label="Add to favorites"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill={item.bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export default function StorePage({ onBack, onLogout, onViewProfile, onOpenConnect, onOpenStore, onOpenPromotions, onOpenDashboard, userStatus = 'online', onStatusChange }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showComposeMenu, setShowComposeMenu] = useState(false);
  const [composeFontSize, setComposeFontSize] = useState("normal");
  const [composeFontColor, setComposeFontColor] = useState("#4a3340");
  const [composeBold, setComposeBold] = useState(false);
  const [composeItalic, setComposeItalic] = useState(false);
  const [composeLocked, setComposeLocked] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeVesoPrice, setComposeVesoPrice] = useState("");

  /* ─── Store-specific state ─── */
  const [activeTab, setActiveTab] = useState("following");
  const [priceFilter, setPriceFilter] = useState("all");
  const [lengthFilter, setLengthFilter] = useState("all");
  const [downloadableOnly, setDownloadableOnly] = useState(false);
  const [storeSearch, setStoreSearch] = useState("");
  const [followedFilter, setFollowedFilter] = useState(null);
  const [contentItems, setContentItems] = useState(storeContent);
  const [followedUsernames, setFollowedUsernames] = useState(() => new Set(initialFollowedUsernames));
  const [contentTypeFilters, setContentTypeFilters] = useState({ videos: false, photos: false, audio: false });

  const creatorSectionRefs = useRef({});

  // Close dropdowns on outside click
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

  const totalUnread = chatContacts.reduce((sum, c) => sum + c.unread, 0);

  /* ─── Filtering logic ─── */
  const filteredItems = contentItems.filter((item) => {
    // Tab filtering
    if (activeTab === "favorites" && !item.bookmarked) return false;
    if (activeTab === "following" && !followedUsernames.has(item.username)) return false;
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
      ) return false;
    }

    // Price
    if (priceFilter === "under10" && item.price >= 10) return false;
    if (priceFilter === "10to25" && (item.price < 10 || item.price > 25)) return false;
    if (priceFilter === "25to50" && (item.price < 25 || item.price > 50)) return false;
    if (priceFilter === "50to100" && (item.price < 50 || item.price > 100)) return false;
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
    const anyTypeActive = contentTypeFilters.videos || contentTypeFilters.photos || contentTypeFilters.audio;
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
  const sortedByRecent = activeTab === "recent"
    ? [...filteredItems].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];
  const sortedByTrending = activeTab === "trending"
    ? [...filteredItems].sort((a, b) => b.kokoros - a.kokoros)
    : [];

  /* ─── Group filtered items by creator ─── */
  const creatorGroups = Object.values(
    filteredItems.reduce((acc, item) => {
      if (!acc[item.username]) {
        acc[item.username] = { creator: item.creator, username: item.username, avatar: item.avatar, items: [] };
      }
      acc[item.username].items.push(item);
      return acc;
    }, {})
  );

  /* ─── Followed creators list for sidebar (dynamic) ─── */
  const sidebarFollowedCreators = allCreators.filter((c) => followedUsernames.has(c.username));

  // Toggle bookmark
  const toggleBookmark = (id) => {
    setContentItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, bookmarked: !item.bookmarked } : item))
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
    activeTags.push({ label: c ? c.name : followedFilter, clear: () => setFollowedFilter(null) });
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
    activeTags.push({ label: "Downloadable", clear: () => setDownloadableOnly(false) });
  }
  if (contentTypeFilters.videos) {
    activeTags.push({ label: "Videos", clear: () => toggleContentType("videos") });
  }
  if (contentTypeFilters.photos) {
    activeTags.push({ label: "Photos", clear: () => toggleContentType("photos") });
  }
  if (contentTypeFilters.audio) {
    activeTags.push({ label: "Audio", clear: () => toggleContentType("audio") });
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
    <div className="min-h-screen bg-[#fff8fb] text-[#5b4153]">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .store-radio:checked + label { background: linear-gradient(135deg, #f9a8c8, #f472b6); color: white; border-color: transparent; }
        .store-radio:checked + label .radio-dot { background: white; }
      `}</style>

      {/* ─── Top Bar ───────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-pink-100 bg-white/92 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4">
          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            <button type="button" onClick={onBack} className="cursor-pointer" aria-label="Back to home">
              <PumdokiLogo />
            </button>
          </div>

          {/* Right: Search, Notifications, Profile */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => { setShowSearch(!showSearch); setShowNotifications(false); setShowProfileMenu(false); }}
                className="flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]"
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
                className="relative flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]"
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
                className="ml-1 flex h-10 w-10 items-center justify-center cursor-pointer"
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
          activePage="store"
          onNavigate={(id) => {
            if (id === "home") onBack && onBack();
            else if (id === "connect") onOpenConnect && onOpenConnect();
            else if (id === "promotions") onOpenPromotions && onOpenPromotions();
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

            {/* ─── Page Header ─── */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-[#241a22]">Store</h1>
              <p className="mt-1 text-sm text-[#8c6d7f]">Browse and buy exclusive content from your favorite creators</p>
            </div>

            {/* ─── Store Search Bar ─── */}
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
                    <button onClick={tag.clear} className="text-[#b89aa8] hover:text-[#e8384f] transition">
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* ─── Store Tabs ─── */}
            <div className="flex gap-1 mb-5 overflow-x-auto hide-scrollbar pb-1 border-b border-pink-100">
              {storeTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? "border-[#f472b6] text-[#f472b6]"
                      : "border-transparent text-[#8c6d7f] hover:text-[#df5f97] hover:border-pink-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ─── Content Layout: Filters Sidebar + Feed ─── */}
            <div className="flex gap-6">
              {/* ─── Filter Sidebar ─── */}
              <div className="hidden lg:block w-[220px] shrink-0">
                <div className="sticky top-20 space-y-6">

                  {/* PRICE */}
                  <div>
                    <h3 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] mb-3">Price</h3>
                    <div className="space-y-1.5">
                      {priceFilters.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setPriceFilter(f.id)}
                          className={`flex items-center gap-2.5 w-full text-left px-2 py-1.5 rounded-lg text-sm transition ${
                            priceFilter === f.id
                              ? "text-[#f472b6] font-semibold bg-pink-50/60"
                              : "text-[#5b4153] hover:bg-pink-50/40"
                          }`}
                        >
                          <span
                            className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition ${
                              priceFilter === f.id ? "border-[#f472b6]" : "border-[#d4b8c7]"
                            }`}
                          >
                            {priceFilter === f.id && (
                              <span className="w-2 h-2 rounded-full bg-[#f472b6]" />
                            )}
                          </span>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CONTENT TYPE (renamed from Video Length) */}
                  <div>
                    <h3 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] mb-3">Content Type</h3>
                    {/* Type checkboxes */}
                    <div className="space-y-1 mb-3">
                      <CheckboxBtn
                        checked={contentTypeFilters.videos}
                        onClick={() => toggleContentType("videos")}
                        label="Videos"
                      />
                      <CheckboxBtn
                        checked={contentTypeFilters.photos}
                        onClick={() => toggleContentType("photos")}
                        label="Photos"
                      />
                      <CheckboxBtn
                        checked={contentTypeFilters.audio}
                        onClick={() => toggleContentType("audio")}
                        label="Audio"
                      />
                    </div>
                    {/* Duration radio buttons */}
                    <div className="space-y-1.5">
                      {lengthFilters.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setLengthFilter(f.id)}
                          className={`flex items-center gap-2.5 w-full text-left px-2 py-1.5 rounded-lg text-sm transition ${
                            lengthFilter === f.id
                              ? "text-[#f472b6] font-semibold bg-pink-50/60"
                              : "text-[#5b4153] hover:bg-pink-50/40"
                          }`}
                        >
                          <span
                            className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition ${
                              lengthFilter === f.id ? "border-[#f472b6]" : "border-[#d4b8c7]"
                            }`}
                          >
                            {lengthFilter === f.id && (
                              <span className="w-2 h-2 rounded-full bg-[#f472b6]" />
                            )}
                          </span>
                          {f.label}
                        </button>
                      ))}
                    </div>
                    {/* Downloadable checkbox */}
                    <CheckboxBtn
                      checked={downloadableOnly}
                      onClick={() => setDownloadableOnly(!downloadableOnly)}
                      label="Downloadable"
                    />
                  </div>

                  {/* FOLLOWED CREATORS */}
                  <div>
                    <h3 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] mb-3">Followed</h3>
                    {sidebarFollowedCreators.length === 0 ? (
                      <p className="text-xs text-[#b89aa8] px-2">No followed creators yet</p>
                    ) : (
                      <div className="space-y-1">
                        {sidebarFollowedCreators.map((fc) => (
                          <button
                            key={fc.username}
                            onClick={() => {
                              setFollowedFilter(followedFilter === fc.username ? null : fc.username);
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
                                followedFilter === fc.username ? "border-[#f472b6]" : "border-pink-100"
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#241a22] truncate">{fc.name}</p>
                              <p className="text-[10px] text-[#b89aa8]">@{fc.username}</p>
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
                {activeTab === "following" && followedUsernames.size === 0 ? (
                  /* Following empty state: no followed creators */
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <svg viewBox="0 0 24 24" className="w-14 h-14 text-[#d4b8c7] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    <p className="text-sm font-semibold text-[#8c6d7f]">Start following creators to see content</p>
                    <p className="mt-1 text-xs text-[#b89aa8]">Follow a creator to see their exclusive drops here</p>
                    <button
                      onClick={() => setActiveTab("trending")}
                      className="mt-5 rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] px-6 py-2.5 text-xs font-bold text-white uppercase tracking-wide shadow-md shadow-pink-200/50 transition hover:shadow-lg hover:from-[#f472b6] hover:to-[#ec4899]"
                    >
                      Discover Creators
                    </button>
                  </div>
                ) : (activeTab === "recent" || activeTab === "trending") ? (
                  /* ── Flat discovery grid (Most Recent / Trending) ── */
                  (() => {
                    const items = activeTab === "recent" ? sortedByRecent : sortedByTrending;
                    return items.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
                        <svg viewBox="0 0 24 24" className="w-14 h-14 text-[#d4b8c7] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z" />
                          <path d="M3 7h18" />
                          <path d="M16 11a4 4 0 01-8 0" />
                        </svg>
                        <p className="text-sm font-medium text-[#8c6d7f]">No content found</p>
                        <p className="mt-1 text-xs text-[#b89aa8]">Try adjusting your filters or search</p>
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
                        ref={(el) => { creatorSectionRefs.current[group.username] = el; }}
                      >
                        {/* Creator section header */}
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-pink-100/70">
                          <img
                            src={group.avatar}
                            alt={group.creator}
                            className="w-10 h-10 rounded-full object-cover border-2 border-pink-200 shadow-sm"
                          />
                          <div className="min-w-0 flex items-center gap-2">
                            <p className="text-sm font-bold text-[#241a22]">{group.creator}</p>
                            <InlineFollowButton
                              username={group.username}
                              isFollowing={followedUsernames.has(group.username)}
                              onToggleFollow={toggleFollow}
                            />
                          </div>
                          <p className="text-xs text-[#b89aa8]">@{group.username}</p>
                          <span className="ml-auto text-xs text-[#b89aa8] shrink-0">
                            {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Items grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
                    <svg viewBox="0 0 24 24" className="w-14 h-14 text-[#d4b8c7] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z" />
                      <path d="M3 7h18" />
                      <path d="M16 11a4 4 0 01-8 0" />
                    </svg>
                    <p className="text-sm font-medium text-[#8c6d7f]">No content found</p>
                    <p className="mt-1 text-xs text-[#b89aa8]">Try adjusting your filters or search</p>
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
        </main>

        <ChatSidebar contacts={chatContacts} />
      </div>

      <MobileNav
        activePage="store"
        onNavigate={(id) => {
          if (id === "home") onBack && onBack();
          else if (id === "connect") onOpenConnect && onOpenConnect();
          else if (id === "promotions") onOpenPromotions && onOpenPromotions();
        }}
        showComposeMenu={showComposeMenu}
        setShowComposeMenu={setShowComposeMenu}
        onComposePost={() => setShowCompose(true)}
        totalUnread={totalUnread}
      />

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
    </div>
  );
}
