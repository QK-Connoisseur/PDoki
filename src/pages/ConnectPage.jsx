import { useState, useEffect } from "react";
import Sidebar, { MobileNav } from "../components/Sidebar";
import ChatSidebar from "../components/ChatSidebar";
import { StatusMenuRow, MenuHeartIcon, STATUS_OPTIONS } from "../components/UserStatusSwitcher";
import CreatePostModal from "../components/CreatePostModal";

/* ─── Mock Data ──────────────────────────────────────────────────────── */

const chatContacts = [
  { id: 1, name: "Luna Bloom", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", lastMessage: "Thanks for the support!", status: "online", unread: 2, fromMe: false, time: "2m" },
  { id: 2, name: "Mika Rose", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", lastMessage: "See you on the stream tonight!", status: "busy", unread: 0, fromMe: true, time: "15m" },
  { id: 3, name: "Airi Vale", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80", lastMessage: "New content coming soon", status: "resting", unread: 1, fromMe: false, time: "1h" },
  { id: 4, name: "Sora Nyx", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80", lastMessage: "Loved your comment!", status: "online", unread: 11, fromMe: false, time: "3h" },
  { id: 5, name: "Naomi Hart", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80", lastMessage: "Check out my latest post", status: "offline", unread: 0, fromMe: true, time: "5h" },
  { id: 6, name: "Reina Noir", avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80", lastMessage: "When's the next drop?", status: "busy", unread: 3, fromMe: false, time: "6h" },
];

const notifications = [
  { id: 1, text: "Luna Bloom gave your post a Kokoro", time: "2m ago", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  { id: 2, text: "Mika Rose started following you", time: "15m ago", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" },
  { id: 3, text: "Airi Vale posted a new exclusive drop", time: "1h ago", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80" },
  { id: 4, text: "Sora Nyx commented on your post", time: "3h ago", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80" },
];

const creators = [
  {
    id: 1, name: "Luna Bloom", username: "lunabloom",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=530&q=80",
    level: "gold", status: "online", audioIntro: "https://example.com/audio/lunabloom.mp3",
    services: ["chat", "voice", "video", "shoutout"],
    price: "$3.99/min", description: "Friendly conversations about life, love, and everything in between.", section: "recent",
  },
  {
    id: 2, name: "Mika Rose", username: "mikarose",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=530&q=80",
    level: "star", status: "busy", audioIntro: "https://example.com/audio/mikarose.mp3",
    services: ["chat", "video", "game"],
    price: "$5.99/min", description: "Let's play games together or just vibe on a video call!", section: "recent",
  },
  {
    id: 3, name: "Airi Vale", username: "airivale",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&h=530&q=80",
    level: "silver", status: "resting", audioIntro: "https://example.com/audio/airivale.mp3",
    services: ["chat", "voice"],
    price: "$2.49/msg", description: "Deep talks and late-night chats. Always here to listen.", section: "recent",
  },
  {
    id: 4, name: "Sora Nyx", username: "soranyx",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=530&q=80",
    level: "legend", status: "online", audioIntro: "https://example.com/audio/soranyx.mp3",
    services: ["chat", "voice", "video", "game", "shoutout"],
    price: "$8.99/min", description: "Premium 1-on-1 experiences. Gaming, chatting, and more.", section: "recent",
  },
  {
    id: 5, name: "Naomi Hart", username: "naomihart",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&h=530&q=80",
    level: "gold", status: "offline", audioIntro: "https://example.com/audio/naomihart.mp3",
    services: ["chat", "video"],
    price: "$4.49/min", description: "Video calls with good vibes and great energy every time.", section: "recent",
  },
  {
    id: 6, name: "Reina Noir", username: "reinanoir",
    avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&h=530&q=80",
    level: "2stars", status: "busy", audioIntro: "https://example.com/audio/reinanoir.mp3",
    services: ["voice", "video"],
    price: "$6.99/min", description: "Voice and video sessions with a creative twist. Come say hi!", section: "recent",
  },
  {
    id: 7, name: "Kira Dawn", username: "kiradawn",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=530&q=80",
    level: "bronze", status: "online", audioIntro: "https://example.com/audio/kiradawn.mp3",
    services: ["chat", "game"],
    price: "$1.99/msg", description: "Casual gaming sessions and fun chat. Let's hang out!", section: "recent",
  },
  {
    id: 8, name: "Yuki Star", username: "yukistar",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=530&q=80",
    level: "star", status: "resting", audioIntro: "https://example.com/audio/yukistar.mp3",
    services: ["chat", "voice", "video", "shoutout"],
    price: "$5.49/min", description: "Warm conversations and cozy voice calls. Your comfort zone.", section: "popular",
  },
  {
    id: 9, name: "Hana Mizu", username: "hanamizu",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=530&q=80",
    level: "gold", status: "online", audioIntro: "https://example.com/audio/hanamizu.mp3",
    services: ["chat", "voice", "game"],
    price: "$4.99/min", description: "Challenge me to a game or just chat about anything.", section: "popular",
  },
  {
    id: 10, name: "Emi Skye", username: "emiskye",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=530&q=80",
    level: "legend", status: "online", audioIntro: "https://example.com/audio/emiskye.mp3",
    services: ["chat", "voice", "video", "game", "shoutout"],
    price: "$9.99/min", description: "Full interactive experience. Games, calls, and exclusive chats.", section: "popular",
  },
  {
    id: 11, name: "Rin Velvet", username: "rinvelvet",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=530&q=80",
    level: "silver", status: "offline", audioIntro: "https://example.com/audio/rinvelvet.mp3",
    services: ["chat", "video"],
    price: "$3.49/min", description: "Chill video sessions. Let's talk about your day.", section: "popular",
  },
  {
    id: 12, name: "Mei Soleil", username: "meisoleil",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&h=530&q=80",
    level: "2stars", status: "busy", audioIntro: "https://example.com/audio/meisoleil.mp3",
    services: ["voice", "video", "game"],
    price: "$7.49/min", description: "High-energy gaming and interactive voice experiences.", section: "popular",
  },
  {
    id: 13, name: "Zara Lux", username: "zaralux",
    avatar: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=400&h=530&q=80",
    level: "bronze", status: "resting", audioIntro: "https://example.com/audio/zaralux.mp3",
    services: ["chat"],
    price: "$1.49/msg", description: "Quick messages and personal replies. Always responsive.", section: "popular",
  },
  {
    id: 14, name: "Noa Ember", username: "noaember",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=530&q=80",
    level: "gold", status: "online", audioIntro: "https://example.com/audio/noaember.mp3",
    services: ["chat", "voice", "video", "shoutout"],
    price: "$4.99/min", description: "Voice calls with personality. Let me brighten your day.", section: "popular",
  },
];

/* ─── Spotlight Slides ───────────────────────────────────────────────── */

const spotlightSlides = [
  {
    id: 1, tag: "Live Event", title: "Sakura Night Festival",
    subtitle: "Join 200+ creators for a night of live performances and exclusive sessions.",
    cta: "Join Event",
    bg: "linear-gradient(135deg, #1a0a12 0%, #4a1535 55%, #7c2d58 100%)",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    accentColor: "#f9a8c8",
  },
  {
    id: 2, tag: "Featured Creator", title: "Meet Sora Nyx",
    subtitle: "Premium 1-on-1 experiences — gaming, chatting, and so much more.",
    cta: "Meet Sora",
    bg: "linear-gradient(135deg, #0d0a1a 0%, #1e0d3a 55%, #3d1a70 100%)",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    accentColor: "#c4b5fd",
  },
  {
    id: 3, tag: "Weekend Deal", title: "First 3 Minutes Free",
    subtitle: "Try any Voice or Video Call creator at no charge this weekend only.",
    cta: "Claim Offer",
    bg: "linear-gradient(135deg, #0a1218 0%, #0f2233 55%, #1a3d55 100%)",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    accentColor: "#7dd3fc",
  },
];

/* ─── Filter Tabs ────────────────────────────────────────────────────── */

const filterTabs = [
  { id: "all",      label: "All",          description: "Browse everything"      },
  { id: "chat",     label: "E-Chat",       description: "Text & messages"        },
  { id: "voice",    label: "Voice Call",   description: "Real-time audio"        },
  { id: "video",    label: "Video Call",   description: "Face-to-face"           },
  { id: "game",     label: "Game With Me", description: "Play together"          },
  { id: "shoutout", label: "Shout out",    description: "Personalized shoutouts" },
];

/* ─── Level Badge ────────────────────────────────────────────────────── */

function LevelBadge({ level, size = 16 }) {
  if (level === "bronze") return (
    <span className="inline-flex items-center justify-center rounded-full" style={{ width: size, height: size, backgroundColor: "#cd7f32", border: "1.5px solid #a0522d" }} title="Bronze">
      <span className="text-white text-[8px] font-bold">B</span>
    </span>
  );
  if (level === "silver") return (
    <span className="inline-flex items-center justify-center rounded-full" style={{ width: size, height: size, backgroundColor: "#c0c0c0", border: "1.5px solid #a8a8a8" }} title="Silver">
      <span className="text-white text-[8px] font-bold">S</span>
    </span>
  );
  if (level === "gold") return (
    <span className="inline-flex items-center justify-center rounded-full" style={{ width: size, height: size, backgroundColor: "#ffd700", border: "1.5px solid #daa520" }} title="Gold">
      <span className="text-white text-[8px] font-bold">G</span>
    </span>
  );
  if (level === "star") return (
    <svg width={size} height={size} viewBox="0 0 16 16" title="Star">
      <polygon points="8,1 10,6 15.5,6.5 11.5,10 12.5,15.5 8,13 3.5,15.5 4.5,10 0.5,6.5 6,6" fill="#f9a8c8" stroke="#e882a8" strokeWidth="0.8" />
    </svg>
  );
  if (level === "2stars") return (
    <span className="inline-flex items-center gap-px" title="2 Stars">
      <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 16 16"><polygon points="8,1 10,6 15.5,6.5 11.5,10 12.5,15.5 8,13 3.5,15.5 4.5,10 0.5,6.5 6,6" fill="#f9a8c8" stroke="#e882a8" strokeWidth="0.8" /></svg>
      <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 16 16"><polygon points="8,1 10,6 15.5,6.5 11.5,10 12.5,15.5 8,13 3.5,15.5 4.5,10 0.5,6.5 6,6" fill="#f9a8c8" stroke="#e882a8" strokeWidth="0.8" /></svg>
    </span>
  );
  if (level === "legend") return (
    <svg width={size} height={size} viewBox="0 0 16 16" title="Legend">
      <path d="M8 1L10.5 5H14L11 8L12.5 13L8 10.5L3.5 13L5 8L2 5H5.5L8 1Z" fill="#ffd700" stroke="#daa520" strokeWidth="0.6" />
      <path d="M4 2L8 1L12 2" fill="none" stroke="#daa520" strokeWidth="1" strokeLinecap="round" />
      <circle cx="5" cy="1.5" r="0.8" fill="#ffd700" stroke="#daa520" strokeWidth="0.4" />
      <circle cx="8" cy="0.5" r="0.8" fill="#ffd700" stroke="#daa520" strokeWidth="0.4" />
      <circle cx="11" cy="1.5" r="0.8" fill="#ffd700" stroke="#daa520" strokeWidth="0.4" />
    </svg>
  );
  return null;
}

/* ─── Service Icon ───────────────────────────────────────────────────── */

function ServiceIcon({ type, size = 14 }) {
  if (type === "chat") return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
  if (type === "voice") return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
  if (type === "video") return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
  if (type === "game") return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="11" x2="10" y2="11" />
      <line x1="8" y1="9" x2="8" y2="13" />
      <line x1="15" y1="12" x2="15.01" y2="12" />
      <line x1="18" y1="10" x2="18.01" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 00-3.978 3.59C2.166 12.4 2 16.29 2 18a2 2 0 002 2c1.105 0 2-.672 2.5-1.5L8 16h8l1.5 2.5c.5.828 1.395 1.5 2.5 1.5a2 2 0 002-2c0-1.71-.166-5.6-.703-9.41A4 4 0 0017.32 5z" />
    </svg>
  );
  if (type === "shoutout") return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h6l8-4v16l-8-4H3V8z" />
      <path d="M9 8v8" />
      <path d="M9 16l-2 5" />
    </svg>
  );
  return null;
}

/* ─── Rail Icon (extends ServiceIcon with "all" variant) ─────────────── */

function RailIcon({ type, size = 18 }) {
  if (type === "all") return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
  return <ServiceIcon type={type} size={size} />;
}

/* ─── Play Icon ──────────────────────────────────────────────────────── */

function PlayIcon({ size = 11 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

/* ─── Spotlight Carousel ─────────────────────────────────────────────── */

function SpotlightCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((p) => (p + 1) % spotlightSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = spotlightSlides[active];

  return (
    <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg" style={{ minHeight: 210 }}>
      {spotlightSlides.map((s, i) => (
        <div key={s.id} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: i === active ? 1 : 0, background: s.bg }}>
          <div className="absolute inset-y-0 right-0 w-1/2 md:w-2/5 overflow-hidden">
            <img src={s.image} alt="" className="w-full h-full object-cover" style={{ opacity: 0.35, filter: "blur(1px)", transform: "scale(1.08)" }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${s.bg.match(/[#][0-9a-f]{6}/i)?.[0] ?? '#0d0a1a'} 0%, transparent 70%)` }} />
          </div>
        </div>
      ))}
      <div className="relative z-10 flex flex-col justify-between p-6 md:p-8" style={{ minHeight: 210 }}>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 backdrop-blur-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white mb-4" style={{ background: "rgba(255,255,255,0.1)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: slide.accentColor }} />
            {slide.tag}
          </span>
          <h2 className="text-2xl md:text-[28px] font-bold text-white leading-tight mb-2">{slide.title}</h2>
          <p className="text-white/65 text-sm max-w-xs leading-relaxed">{slide.subtitle}</p>
        </div>
        <div className="flex items-center justify-between mt-5">
          <button className="rounded-xl border border-white/25 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20" style={{ background: "rgba(255,255,255,0.12)" }}>
            {slide.cta}
          </button>
          <div className="flex items-center gap-1.5">
            {spotlightSlides.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className="rounded-full transition-all duration-300"
                style={{ width: i === active ? 22 : 6, height: 6, background: i === active ? "#ffffff" : "rgba(255,255,255,0.35)" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Creator Card ───────────────────────────────────────────────────── */

function CreatorCard({ creator }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group cursor-pointer"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className="relative w-full transition-transform duration-500 ease-in-out"
        style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", aspectRatio: "3/4" }}
      >
        {/* ─── Front Face ─── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border border-pink-100 shadow-sm"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <img src={creator.photo} alt={creator.name} className="w-full h-full object-cover" />

          {/* Bottom gradient — name header with inline status heart */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-16 pb-3 px-3">
            <div className="flex items-center gap-1.5">
              <MenuHeartIcon status={creator.status} size={14} zzzColor="#d1d5db" />
              <span className="text-white font-semibold text-sm truncate">{creator.name}</span>
              <LevelBadge level={creator.level} size={14} />
            </div>
            <p className="text-white/70 text-xs mt-0.5">@{creator.username}</p>
          </div>

          {/* Play / audio button — top-right */}
          <button
            className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full cursor-pointer text-white transition hover:scale-110"
            style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            onClick={(e) => e.stopPropagation()}
            title="Play audio intro"
          >
            <PlayIcon size={10} />
          </button>

          {/* Service icons pill — bottom-right */}
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2 py-1"
            style={{ background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", border: "1px solid rgba(249,168,200,0.25)" }}
          >
            {creator.services.map((service) => (
              <span key={service} className="flex items-center justify-center text-white/85">
                <ServiceIcon type={service} size={11} />
              </span>
            ))}
          </div>
        </div>

        {/* ─── Back Face ───
            The back face carries its own rotateY(180deg). When the parent is also
            rotated 180deg (card flipped), the net is 0deg — content appears normal
            to the viewer and CSS absolute positions map 1:1 (right-2 = viewer's right).
        */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border border-pink-100 shadow-sm bg-white flex flex-col items-center justify-center px-4 py-5"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* Play / audio button — top-right (right-2 = viewer's right after net-0 rotation) */}
          <button
            className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full cursor-pointer text-[#f472b6] transition hover:scale-110"
            style={{ background: "rgba(249,168,200,0.14)", border: "1px solid rgba(249,168,200,0.4)" }}
            onClick={(e) => e.stopPropagation()}
            title="Play audio intro"
          >
            <PlayIcon size={10} />
          </button>

          {/* Avatar */}
          <img src={creator.avatar} alt={creator.name} className="w-16 h-16 rounded-full object-cover border-2 border-pink-200" />

          {/* Name header — inline status heart with tooltip, identical layout to front face */}
          <div className="flex items-center gap-1.5 mt-3">
            <div className="group/heart relative">
              <MenuHeartIcon status={creator.status} size={14} zzzColor="#9ca3af" />
              {/* Status tooltip — scoped to heart hover via named group, not the whole card group */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 bg-black/80 text-white text-[10px] font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none opacity-0 invisible group-hover/heart:opacity-100 group-hover/heart:visible transition-all duration-200 z-10">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderBottomColor: "rgba(0,0,0,0.8)" }} />
                {STATUS_OPTIONS.find((s) => s.id === creator.status)?.label ?? creator.status}
              </div>
            </div>
            <span className="text-[#241a22] font-semibold text-sm">{creator.name}</span>
            <LevelBadge level={creator.level} size={14} />
          </div>

          <p className="text-[#b89aa8] text-xs mt-0.5">@{creator.username}</p>
          <p className="text-[#8c6d7f] text-xs text-center mt-3 leading-relaxed line-clamp-2">{creator.description}</p>
          <p className="text-[#241a22] font-bold text-sm mt-3">{creator.price}</p>

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
          <stop offset="0%" stopColor="#fff7fa" /><stop offset="48%" stopColor="#ffd8e5" /><stop offset="100%" stopColor="#f3a0bc" />
        </linearGradient>
        <linearGradient id="connectMiniWordFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd1e0" /><stop offset="55%" stopColor="#f8b3ca" /><stop offset="100%" stopColor="#ef8fb1" />
        </linearGradient>
      </defs>
      <g transform="translate(4,6)">
        <path d="M52 66c-4-3-7-6-9-8C27 43 18 33 18 20 18 9 26 0 37 0c7 0 13 3 17 10 5-7 11-10 18-10 11 0 19 9 19 20 0 13-10 23-27 38l-9 8-5 5-5-5Z" fill="url(#connectMiniHeartBase)" stroke="#111" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M29 40h13c3 0 4-2 6-5l4-10 6 25 5-13c2-4 4-5 6-5h9" fill="none" stroke="#eb6f97" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="110" y="75" fontSize="60" fontWeight="700" fill="#fff7fa" stroke="#111" strokeWidth="3.2" paintOrder="stroke" fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" letterSpacing="0.5">Pumdoki</text>
      <text x="110" y="75" fontSize="60" fontWeight="700" fill="url(#connectMiniWordFill)" fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" letterSpacing="0.5">Pumdoki</text>
    </svg>
  );
}

/* ─── Section Header ─────────────────────────────────────────────────── */

function SectionHeader({ icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h2 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#f472b6]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
        {label}
      </h2>
      <button className="text-xs font-semibold text-[#f472b6] hover:text-[#ec4899] transition normal-case tracking-normal">
        Show All ›
      </button>
    </div>
  );
}

/* ─── Creator Grid ───────────────────────────────────────────────────── */

function CreatorGrid({ creators: list, keyPrefix }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {list.map((creator) => (
        <CreatorCard key={`${keyPrefix}-${creator.id}`} creator={creator} />
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function ConnectPage({ onBack, onLogout, onViewProfile, onOpenConnect, onOpenStore, onOpenPromotions, onOpenDashboard, userStatus = 'online', onStatusChange }) {
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
  const [composeLocked, setComposeLocked] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeVesoPrice, setComposeVesoPrice] = useState("");

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

  const isAll = activeFilter === "all";

  // When a specific category is selected, show only those creators in one unified grid.
  // When "all" is selected, derive per-category sets for the sectioned layout.
  const filteredCreators = isAll ? creators : creators.filter((c) => c.services.includes(activeFilter));

  const eChatCreators     = isAll ? creators.filter((c) => c.services.includes("chat"))     : [];
  const voiceCreators     = isAll ? creators.filter((c) => c.services.includes("voice"))    : [];
  const videoCreators     = isAll ? creators.filter((c) => c.services.includes("video"))    : [];
  const gameCreators      = isAll ? creators.filter((c) => c.services.includes("game"))     : [];
  const shoutoutCreators  = isAll ? creators.filter((c) => c.services.includes("shoutout")) : [];

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
              <button onClick={() => { setShowSearch(!showSearch); setShowNotifications(false); setShowProfileMenu(false); }}
                className="flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]" aria-label="Search">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
              {showSearch && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-pink-100 bg-white p-4 shadow-xl">
                  <input autoFocus type="text" placeholder="Search creators, posts, tags..."
                    className="w-full rounded-xl border border-pink-100 bg-[#fffafc] px-4 py-2.5 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300" />
                  <div className="mt-3 text-xs text-[#b89aa8]">Try searching for a creator or hashtag</div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" data-dropdown>
              <button onClick={() => { setShowNotifications(!showNotifications); setShowSearch(false); setShowProfileMenu(false); }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]" aria-label="Notifications">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8384f] text-[10px] font-bold text-white">4</span>
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
              <button onClick={() => { setShowProfileMenu(!showProfileMenu); setShowSearch(false); setShowNotifications(false); }}
                className="ml-1 flex h-10 w-10 items-center justify-center cursor-pointer" aria-label="Profile menu">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" alt="Your profile"
                  className="h-8 w-8 rounded-full border-2 border-pink-200 object-cover transition hover:border-pink-400" />
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
                    <button key={item.label} onClick={item.action || undefined}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60 hover:text-[#df5f97]">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                      {item.label}
                    </button>
                  ))}
                  <hr className="my-1 border-pink-100" />
                  <button onClick={onLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#e8384f] transition hover:bg-red-50/60">
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
          activePage="connect"
          onNavigate={(id) => {
            if (id === "home") onBack && onBack();
            else if (id === "store") onOpenStore && onOpenStore();
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

            {/* ─── Page Header ─────────────────────────────────────── */}
            <div className="mb-5">
              <h1 className="text-xl font-bold text-[#241a22]">Connect</h1>
              <p className="text-sm text-[#8c6d7f] mt-1">Find creators offering interactive sessions</p>
            </div>

            {/* ─── Spotlight Carousel ───────────────────────────────── */}
            <SpotlightCarousel />

            {/* ─── Service Rail ────────────────────────────────────── */}
            <div className="flex gap-3 mb-7 overflow-x-auto hide-scrollbar pb-1">
              {filterTabs.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveFilter(tab.id)}
                    className="flex-shrink-0 flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all border cursor-pointer hover:scale-[1.02] hover:shadow-md"
                    style={{
                      minWidth: 148,
                      background: isActive ? "linear-gradient(135deg, #f9a8c8 0%, #f472b6 100%)" : "linear-gradient(135deg, #ffffff 0%, #fff0f7 100%)",
                      borderColor: isActive ? "transparent" : "#fce7f3",
                      boxShadow: isActive ? "0 4px 14px rgba(244,114,182,0.35)" : "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
                      style={{ background: isActive ? "rgba(255,255,255,0.22)" : "rgba(249,168,200,0.18)", color: isActive ? "#ffffff" : "#f472b6" }}>
                      <RailIcon type={tab.id} size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-none mb-1 truncate" style={{ color: isActive ? "#ffffff" : "#241a22" }}>{tab.label}</p>
                      <p className="text-[11px] leading-none truncate" style={{ color: isActive ? "rgba(255,255,255,0.78)" : "#b89aa8" }}>{tab.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ─── Filtered View (non-"all") ───────────────────────── */}
            {!isAll && filteredCreators.length > 0 && (
              <div className="mb-8">
                <SectionHeader
                  label={filterTabs.find((t) => t.id === activeFilter)?.label ?? "Results"}
                  icon={
                    activeFilter === "chat"     ? <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /> :
                    activeFilter === "voice"    ? <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /> :
                    activeFilter === "video"    ? <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></> :
                    activeFilter === "game"     ? <><line x1="6" y1="11" x2="10" y2="11" /><line x1="8" y1="9" x2="8" y2="13" /><line x1="15" y1="12" x2="15.01" y2="12" /><line x1="18" y1="10" x2="18.01" y2="10" /><path d="M17.32 5H6.68a4 4 0 00-3.978 3.59C2.166 12.4 2 16.29 2 18a2 2 0 002 2c1.105 0 2-.672 2.5-1.5L8 16h8l1.5 2.5c.5.828 1.395 1.5 2.5 1.5a2 2 0 002-2c0-1.71-.166-5.6-.703-9.41A4 4 0 0017.32 5z" /></> :
                    activeFilter === "shoutout" ? <><path d="M3 8h6l8-4v16l-8-4H3V8z" /><path d="M9 8v8" /><path d="M9 16l-2 5" /></> :
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  }
                />
                <CreatorGrid creators={filteredCreators} keyPrefix={activeFilter} />
              </div>
            )}

            {/* ─── Sectioned "All" Layout ───────────────────────────── */}
            {isAll && (
              <>
                {/* E-Chat */}
                {eChatCreators.length > 0 && (
                  <div className="mb-8">
                    <SectionHeader label="E-Chat" icon={<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />} />
                    <CreatorGrid creators={eChatCreators} keyPrefix="chat" />
                  </div>
                )}

                {/* Voice Call */}
                {voiceCreators.length > 0 && (
                  <div className="mb-8">
                    <SectionHeader label="Voice Call Ready" icon={<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />} />
                    <CreatorGrid creators={voiceCreators} keyPrefix="voice" />
                  </div>
                )}

                {/* Video Call */}
                {videoCreators.length > 0 && (
                  <div className="mb-8">
                    <SectionHeader label="Video Call" icon={<><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></>} />
                    <CreatorGrid creators={videoCreators} keyPrefix="video" />
                  </div>
                )}

                {/* Game With Me */}
                {gameCreators.length > 0 && (
                  <div className="mb-8">
                    <SectionHeader label="Game With Me" icon={<><line x1="6" y1="11" x2="10" y2="11" /><line x1="8" y1="9" x2="8" y2="13" /><line x1="15" y1="12" x2="15.01" y2="12" /><line x1="18" y1="10" x2="18.01" y2="10" /><path d="M17.32 5H6.68a4 4 0 00-3.978 3.59C2.166 12.4 2 16.29 2 18a2 2 0 002 2c1.105 0 2-.672 2.5-1.5L8 16h8l1.5 2.5c.5.828 1.395 1.5 2.5 1.5a2 2 0 002-2c0-1.71-.166-5.6-.703-9.41A4 4 0 0017.32 5z" /></>} />
                    <CreatorGrid creators={gameCreators} keyPrefix="game" />
                  </div>
                )}

                {/* Shout out */}
                {shoutoutCreators.length > 0 && (
                  <div className="mb-8">
                    <SectionHeader label="Shout out" icon={<><path d="M3 8h6l8-4v16l-8-4H3V8z" /><path d="M9 8v8" /><path d="M9 16l-2 5" /></>} />
                    <CreatorGrid creators={shoutoutCreators} keyPrefix="shoutout" />
                  </div>
                )}

                {/* New to Pumdoki */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-[#b89aa8] flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      New to Pumdoki
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {creators.filter((c) => c.level === "bronze" || c.id >= 12).map((creator) => (
                      <div key={`new-${creator.id}`} className="relative">
                        <div className="absolute top-2 left-2 z-10">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="currentColor">
                              <path d="M6 1l1.5 3.1 3.4.5-2.5 2.4.6 3.4L6 8.8 3 10.4l.6-3.4L1.1 4.6l3.4-.5L6 1z" />
                            </svg>
                            NEW
                          </span>
                        </div>
                        <CreatorCard creator={creator} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* See All Creators */}
                <div className="mb-8">
                  <div className="rounded-2xl border border-pink-100 bg-white p-6 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex -space-x-3 justify-center">
                      {creators.slice(0, 6).map((c) => (
                        <img key={c.id} src={c.avatar} alt={c.name} className="h-10 w-10 rounded-full object-cover border-2 border-white" />
                      ))}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-pink-50 text-xs font-bold text-[#f472b6]">
                        +{creators.length - 6}
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-[#241a22]">See All Creators</h3>
                    <p className="mt-1 text-sm text-[#8c6d7f]">Browse all {creators.length} creators available for interactive sessions</p>
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
                <p className="text-[#b89aa8] text-sm">No creators found for this filter.</p>
                <button onClick={() => setActiveFilter("all")} className="mt-3 text-sm font-semibold text-[#f472b6] hover:text-[#ec4899] transition">
                  Clear filter
                </button>
              </div>
            )}
          </div>
        </main>

        <ChatSidebar contacts={chatContacts} />
      </div>

      <MobileNav
        activePage="connect"
        onNavigate={(id) => {
          if (id === "home") onBack && onBack();
          else if (id === "store") onOpenStore && onOpenStore();
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
