import { useState, useRef, useEffect } from "react";

/* ─── Colors ─────────────────────────────────────────────────────────── */

const SAKURA_PINK = "#f9a8c8";
const HEART_RED = "#e8384f";

/* ─── Shared Mock Data (layout) ──────────────────────────────────────── */

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

/* ─── Mock Profile Data ──────────────────────────────────────────────── */

const profileData = {
  name: "Luna Bloom",
  username: "lunabloom",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  banner: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  bio: "Digital creator & model. Sharing my world one post at a time. Exclusive content for subscribers. DMs open for collabs.",
  location: "Los Angeles, CA",
  joined: "March 2024",
  verified: true,
  online: true,
  followers: 24800,
  following: 312,
  posts: 487,
  kokoros: 128500,
  socials: [
    { platform: "twitter", url: "#", handle: "@lunabloom" },
    { platform: "instagram", url: "#", handle: "@luna.bloom" },
    { platform: "tiktok", url: "#", handle: "@lunabloom" },
  ],
  subscriptionPrice: 9.99,
  avatarDecoration: "sakura",
};

const profileMoments = [
  { id: 1, name: "Beach Day", thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80", type: "regular" },
  { id: 2, name: "BTS Shoot", thumb: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=150&q=80", type: "private" },
  { id: 3, name: "Travel", thumb: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=150&q=80", type: "regular" },
  { id: 4, name: "Q&A", thumb: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=150&q=80", type: "regular" },
  { id: 5, name: "Exclusive", thumb: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=150&q=80", type: "private" },
];

const profileServices = [
  {
    id: 1, title: "Video Call",
    description: "1-on-1 private video call. Let's chat about anything you want! I love discussing games, TV shows, movies, cats, sharing stories or even drama! You can reach out if you feel alone and would like to have a pleasant conversation, or to just chill and laugh together. I promise it will be worth your time.",
    price: 25, duration: "15 min", icon: "video", rating: 4.9, reviews: 142, available: true,
    styles: "Friendly, Talkative",
    platforms: "Discord, Zoom",
  },
  {
    id: 2, title: "Custom Content",
    description: "Personalized photo or video made just for you. Tell me your vision and I'll bring it to life! Whether it's a special greeting, a themed photoshoot, or a personalized video message, I put my heart into every custom piece.",
    price: 50, duration: "3 days", icon: "camera", rating: 5.0, reviews: 89, available: true,
    styles: "Creative, Personalized",
    platforms: "Direct Delivery",
  },
  {
    id: 3, title: "Gaming Session",
    description: "Play your favorite game together with me live! I play Valorant, League of Legends, Genshin Impact, Minecraft, and more. Whether you want to tryhard or just have fun, I'm down for anything!",
    price: 30, duration: "30 min", icon: "gamepad", rating: 4.8, reviews: 67, available: true,
    styles: "Casual, Competitive",
    platforms: "PC, Console",
  },
  {
    id: 4, title: "Voice Call",
    description: "Chill voice call. Perfect for winding down after a long day. Let's talk about anything — your day, your dreams, or just enjoy some comfortable silence together.",
    price: 15, duration: "15 min", icon: "phone", rating: 4.7, reviews: 203, available: true,
  },
  {
    id: 5, title: "Girlfriend Experience",
    description: "Daily messages, good morning texts & exclusive snaps for a week. I'll be your virtual companion — someone to check in with, share moments with, and brighten your day. Every interaction feels genuine because I truly enjoy connecting with people!",
    price: 75, duration: "7 days", icon: "heart", rating: 5.0, reviews: 54, available: true,
    styles: "Sweet, Caring",
    platforms: "Messaging",
  },
  {
    id: 6, title: "Social Media Shoutout",
    description: "I'll shout you out on my socials to all my followers. Great for growing your own audience or surprising a friend! Includes a personalized post or story mention across my platforms.",
    price: 40, duration: "Within 24h", icon: "megaphone", rating: 4.6, reviews: 31, available: true,
    styles: "Promotional",
    platforms: "Instagram, TikTok, X",
  },
];

/* ─── Long Bio for About Me ─────────────────────────────────────────── */

const profileLongBio = `Hey there! I'm Luna Bloom, a digital creator and model based in Los Angeles. I love connecting with people from all over the world and sharing my passions — gaming, travel, photography, and just good vibes!

I started creating content as a way to express myself and build a community of like-minded people. Whether it's a chill voice call after a long day, an exciting gaming session, or just exchanging messages throughout the week, I'm here to make your day a little brighter.

When I'm not creating content, you can find me exploring hidden cafes, binge-watching anime, or leveling up in Genshin Impact. I speak English and Japanese, and I'm always down to learn about different cultures!

Feel free to browse my services below and don't hesitate to reach out. I love meeting new people and I promise every interaction will be worth your time!`;

/* ─── Mock Reviews ──────────────────────────────────────────────────── */

const profileReviews = [
  { id: 1, user: "Alex K.", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80", rating: 5, text: "Luna is amazing! We played Genshin together and she was super fun and patient. Will definitely book again!", time: "2 days ago", service: "Gaming Session" },
  { id: 2, user: "Jordan M.", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?auto=format&fit=crop&w=150&q=80", rating: 5, text: "Best video call ever! She's genuine, easy to talk to, and the time flew by. Highly recommend!", time: "5 days ago", service: "Video Call" },
  { id: 3, user: "Sam T.", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80", rating: 5, text: "The girlfriend experience was so sweet. Daily good morning texts and cute selfies made my whole week better!", time: "1 week ago", service: "Girlfriend Experience" },
  { id: 4, user: "Riley N.", avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=150&q=80", rating: 5, text: "Custom content delivered in just 2 days! Exactly what I asked for and the quality was incredible.", time: "2 weeks ago", service: "Custom Content" },
  { id: 5, user: "Casey L.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80", rating: 4, text: "Really chill voice call. Luna has such a calming voice and great conversation skills. Will be back!", time: "3 weeks ago", service: "Voice Call" },
];

const profileFeedPosts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&h=500&q=80",
    aspectRatio: "8/5",
    caption: "Golden hour never disappoints. Moments like these are what I live for.",
    kokoros: 1247, comments: 83, timeAgo: "2h", locked: false,
    style: {},
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&h=800&q=80",
    aspectRatio: "1/1",
    caption: "Lost in the wild. New exclusive set dropping this weekend for subscribers!",
    kokoros: 892, comments: 56, timeAgo: "4h", locked: false,
    style: { fontSize: "16px", fontWeight: "600", color: "#7c3aed" },
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&h=1000&q=80",
    aspectRatio: "4/5",
    caption: "This set is for my loyal subscribers only. Subscribe to unlock!",
    kokoros: 2103, comments: 127, timeAgo: "1d", locked: true, price: 9.99,
    mediaCount: { images: 8, videos: 2 },
    style: { fontSize: "15px", fontWeight: "700", color: "#c2185b" },
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&h=600&q=80",
    aspectRatio: "4/3",
    caption: "Behind the scenes from today's shoot. You don't want to miss this.",
    kokoros: 654, comments: 41, timeAgo: "2d", locked: true, price: 14.99,
    mediaCount: { images: 15, videos: 5 },
    style: { fontSize: "13px", fontStyle: "italic", color: "#8b2252" },
  },
];

const profileMedia = [
  { id: 1, src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", type: "photo", locked: false },
  { id: 2, src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80", type: "video", locked: false },
  { id: 3, src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80", type: "photo", locked: true, price: 4.99 },
  { id: 4, src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=80", type: "photo", locked: false },
  { id: 5, src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80", type: "video", locked: true, price: 7.99 },
  { id: 6, src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80", type: "photo", locked: false },
  { id: 7, src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80", type: "photo", locked: true, price: 3.99 },
  { id: 8, src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80", type: "video", locked: false },
  { id: 9, src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", type: "photo", locked: true, price: 5.99 },
];

/* ─── Media Store Items (LoyalFans-style PTV) ───────────────────────── */

const mediaStoreItems = [
  { id: 1, thumb: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&h=340&q=80", title: "Golden Hour Collection", price: 11.99, type: "video", duration: "10:54", date: "Mar 13, 2026", isNew: true, downloadable: true, kokoros: 342 },
  { id: 2, thumb: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&h=340&q=80", title: "Nature Walk Vlog", price: 8.99, type: "video", duration: "11:13", date: "Mar 10, 2026", isNew: true, downloadable: true, kokoros: 218 },
  { id: 3, thumb: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&h=340&q=80", title: "Mountain Sunrise Set", price: 6.99, type: "photo", photoCount: 12, date: "Mar 8, 2026", isNew: true, downloadable: false, kokoros: 156 },
  { id: 4, thumb: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&h=340&q=80", title: "Behind The Scenes Shoot", price: 9.99, type: "video", duration: "07:42", date: "Mar 6, 2026", isNew: false, downloadable: true, kokoros: 287 },
  { id: 5, thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=340&q=80", title: "Beach Day Exclusive", price: 7.99, type: "video", duration: "07:53", date: "Feb 28, 2026", isNew: false, downloadable: true, kokoros: 412 },
  { id: 6, thumb: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=340&q=80", title: "Studio Portrait Collection", price: 5.99, type: "photo", photoCount: 8, date: "Feb 20, 2026", isNew: false, downloadable: false, kokoros: 195 },
  { id: 7, thumb: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&h=340&q=80", title: "Evening Vibes ASMR", price: 10.99, type: "audio", duration: "15:30", date: "Feb 14, 2026", isNew: false, downloadable: true, kokoros: 89 },
  { id: 8, thumb: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&h=340&q=80", title: "City Lights Lookbook", price: 8.99, type: "video", duration: "10:17", date: "Feb 12, 2026", isNew: false, downloadable: true, kokoros: 301 },
  { id: 9, thumb: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=340&q=80", title: "Q&A Voice Notes", price: 4.99, type: "audio", duration: "22:10", date: "Feb 10, 2026", isNew: false, downloadable: false, kokoros: 67 },
  { id: 10, thumb: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&h=340&q=80", title: "Cozy Morning Routine", price: 10.99, type: "video", duration: "08:14", date: "Feb 6, 2026", isNew: false, downloadable: true, kokoros: 256 },
  { id: 11, thumb: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=340&q=80", title: "Spring Photo Dump", price: 6.99, type: "photo", photoCount: 15, date: "Feb 1, 2026", isNew: false, downloadable: false, kokoros: 178 },
  { id: 12, thumb: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=340&q=80", title: "Late Night Thoughts", price: 3.99, type: "audio", duration: "18:45", date: "Jan 28, 2026", isNew: false, downloadable: true, kokoros: 143 },
];

/* ─── Pumdoki Mini Logo ──────────────────────────────────────────────── */

function PumdokiLogo() {
  return (
    <svg viewBox="0 0 520 120" className="h-9 w-auto" aria-label="Pumdoki" role="img">
      <defs>
        <linearGradient id="pLogoHeartBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff7fa" />
          <stop offset="48%" stopColor="#ffd8e5" />
          <stop offset="100%" stopColor="#f3a0bc" />
        </linearGradient>
        <linearGradient id="pLogoWordFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd1e0" />
          <stop offset="55%" stopColor="#f8b3ca" />
          <stop offset="100%" stopColor="#ef8fb1" />
        </linearGradient>
      </defs>
      <g transform="translate(4,6)">
        <path
          d="M52 66c-4-3-7-6-9-8C27 43 18 33 18 20 18 9 26 0 37 0c7 0 13 3 17 10 5-7 11-10 18-10 11 0 19 9 19 20 0 13-10 23-27 38l-9 8-5 5-5-5Z"
          fill="url(#pLogoHeartBase)"
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
      <text x="110" y="75" fontSize="60" fontWeight="700" fill="#fff7fa" stroke="#111" strokeWidth="3.2" paintOrder="stroke"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" letterSpacing="0.5">
        Pumdoki
      </text>
      <text x="110" y="75" fontSize="60" fontWeight="700" fill="url(#pLogoWordFill)"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" letterSpacing="0.5">
        Pumdoki
      </text>
    </svg>
  );
}

/* ─── Heart-Shaped Moment Avatar ─────────────────────────────────────── */

function HeartAvatar({ src, name, borderColor, borderGradient, size = 56, borderWidth = 3 }) {
  const innerSize = size - borderWidth * 2;
  const heartPath = (s) =>
    `M${s/2},${s*0.9} C${s/2},${s*0.9} ${s*0.03},${s*0.6} ${s*0.03},${s*0.33} C${s*0.03},${s*0.13} ${s*0.18},0 ${s*0.34},0 C${s*0.43},0 ${s*0.47},${s*0.06} ${s/2},${s*0.14} C${s*0.53},${s*0.06} ${s*0.57},0 ${s*0.66},0 C${s*0.82},0 ${s*0.97},${s*0.13} ${s*0.97},${s*0.33} C${s*0.97},${s*0.6} ${s/2},${s*0.9} ${s/2},${s*0.9} Z`;

  const gradientId = `heart-grad-${name}-${size}`;
  const hasBorderGradient = borderGradient && borderGradient.length >= 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <defs>
        {hasBorderGradient && (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {borderGradient.map((color, i) => (
              <stop key={i} offset={`${(i / (borderGradient.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </linearGradient>
        )}
        <clipPath id={`heart-clip-${name}-${size}`}>
          <path d={heartPath(size)} />
        </clipPath>
        <clipPath id={`heart-clip-inner-${name}-${size}`}>
          <path d={heartPath(innerSize)} />
        </clipPath>
      </defs>
      <path d={heartPath(size)} fill={hasBorderGradient ? `url(#${gradientId})` : borderColor} />
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

/* ─── Service Icons ──────────────────────────────────────────────────── */

function ServiceIcon({ type, className = "w-6 h-6" }) {
  const icons = {
    video: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
    camera: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    gamepad: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <line x1="15" y1="13" x2="15.01" y2="13" />
        <line x1="18" y1="11" x2="18.01" y2="11" />
        <path d="M17.32 5H6.68a4 4 0 00-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 019.828 16h4.344a2 2 0 011.414.586L17 18c.5.5 1 1 2 1a3 3 0 003-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0017.32 5z" />
      </svg>
    ),
    phone: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    megaphone: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export default function ProfilePage({ onBack, onLogout, onViewProfile, onOpenOasis, onOpenConnect, onOpenStore, onOpenDiscover }) {
  const [activeTab, setActiveTab] = useState("services");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [kokoroStates, setKokoroStates] = useState({});
  const [unlockedPosts, setUnlockedPosts] = useState({});
  const [mediaFilter, setMediaFilter] = useState("all");
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [feedSubView, setFeedSubView] = useState("posts");
  const [showFeedMenu, setShowFeedMenu] = useState(false);
  const [storeFilter, setStoreFilter] = useState("all");
  const [storeSearch, setStoreSearch] = useState("");
  const [storeLayout, setStoreLayout] = useState("grid");
  const momentsRef = useRef(null);

  // Layout states (shared with HomePage)
  const [chatExpanded, setChatExpanded] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showComposeMenu, setShowComposeMenu] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeFontSize, setComposeFontSize] = useState("normal");
  const [composeFontColor, setComposeFontColor] = useState("#4a3340");
  const [composeBold, setComposeBold] = useState(false);
  const [composeItalic, setComposeItalic] = useState(false);
  const sidebarTimeout = useRef(null);

  const profile = profileData;

  const toggleKokoro = (postId) => {
    setKokoroStates((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const filteredMedia = profileMedia.filter((item) => {
    if (mediaFilter === "all") return true;
    if (mediaFilter === "photos") return item.type === "photo";
    if (mediaFilter === "videos") return item.type === "video";
    if (mediaFilter === "ptv") return item.locked;
    return true;
  });

  const tabs = [
    { id: "services", label: "Services" },
    { id: "feed", label: "Feed" },
    { id: "store", label: "Media Store" },
  ];

  const filteredStoreItems = mediaStoreItems.filter((item) => {
    const matchesFilter = storeFilter === "all" || item.type === storeFilter;
    const matchesSearch = item.title.toLowerCase().includes(storeSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const selectedService = selectedServiceId
    ? profileServices.find((s) => s.id === selectedServiceId)
    : null;

  const filteredServices = profileServices.filter((s) =>
    s.title.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const totalServed = profileServices.reduce((sum, s) => sum + s.reviews, 0);
  const avgRating = (profileServices.reduce((sum, s) => sum + s.rating, 0) / profileServices.length).toFixed(1);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-dropdown]")) {
        setShowProfileMenu(false);
        setShowNotifications(false);
        setShowSearch(false);
        setShowMoreMenu(false);
        setShowMoreOptions(false);
        setShowFeedMenu(false);
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
        @keyframes decoration-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .avatar-decoration { animation: decoration-spin 8s linear infinite; }
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

            {/* Zen Garden */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]"
              aria-label="My Plant"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M12 22V13" stroke="#6b9a5b" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 17C9.5 17 7.5 15.5 8 13.5C8.5 11.5 10.5 11 12 12" stroke="#6b9a5b" strokeWidth="1" fill="#a8d5a2" fillOpacity="0.5" />
                <path d="M12 15C14.5 15 16 13.5 15.5 11.5C15 9.5 13 9 12 10" stroke="#6b9a5b" strokeWidth="1" fill="#a8d5a2" fillOpacity="0.5" />
                <g transform="translate(12, 7)">
                  <ellipse cx="0" cy="-4" rx="2.2" ry="3" fill="#f9a8c8" transform="rotate(0)" />
                  <ellipse cx="0" cy="-4" rx="2.2" ry="3" fill="#f9a8c8" transform="rotate(72)" />
                  <ellipse cx="0" cy="-4" rx="2.2" ry="3" fill="#f9a8c8" transform="rotate(144)" />
                  <ellipse cx="0" cy="-4" rx="2.2" ry="3" fill="#f9a8c8" transform="rotate(216)" />
                  <ellipse cx="0" cy="-4" rx="2.2" ry="3" fill="#f9a8c8" transform="rotate(288)" />
                  <circle cx="0" cy="0" r="1.8" fill="#f472b6" />
                  <circle cx="0.8" cy="-0.8" r="0.5" fill="#fbbf24" />
                  <circle cx="-0.8" cy="-0.5" r="0.5" fill="#fbbf24" />
                  <circle cx="0.3" cy="0.8" r="0.5" fill="#fbbf24" />
                </g>
              </svg>
            </button>

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
                    else if (item.id === "store" && onOpenStore) onOpenStore();
                    else if (item.id === "discover" && onOpenDiscover) onOpenDiscover();
                  }}
                  className={`flex items-center gap-4 rounded-xl px-3 h-12 transition-all duration-200 overflow-hidden text-[#8c6d7f] hover:bg-pink-50/60 hover:text-[#df5f97]`}
                  aria-label={item.label}
                >
                  <div className="shrink-0">{item.icon}</div>
                  <span
                    className={`whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                      sidebarOpen
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2 pointer-events-none w-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="flex-[2]" />

          {/* More Menu */}
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
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Profile Info Overlay on Banner — vertically centered & max-width centered */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full max-w-[1500px] mx-auto px-6 md:px-10 lg:px-14 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* ─── LEFT SIDE: Avatar + Info ─── */}
                <div className="flex items-center gap-4">
                  {/* Avatar with Decoration Ring */}
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1.5 rounded-full avatar-decoration"
                      style={{
                        background: "conic-gradient(from 0deg, #f9a8c8, #f472b6, #ec4899, #e8384f, #f472b6, #f9a8c8)",
                        WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
                        mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
                      }}
                    />
                    <div className="absolute -inset-3 rounded-full opacity-30 blur-md"
                      style={{ background: "conic-gradient(from 0deg, #f9a8c8, #f472b6, #ec4899, #f9a8c8)" }}
                    />
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white/20 object-cover"
                    />
                    {profile.online && (
                      <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-400 ring-2 ring-white/50" />
                    )}
                  </div>

                  {/* Name, Username, Stats, Bio */}
                  <div className="min-w-0">
                    {/* Name + Verified */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">{profile.name}</h1>
                      {profile.verified && (
                        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 drop-shadow-md" fill="#f472b6">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Username */}
                    <p className="text-sm text-white/70 mt-0.5">@{profile.username}</p>

                    {/* Stats */}
                    <div className="mt-1.5 flex items-center gap-4">
                      {[
                        { value: profile.posts, label: "Posts" },
                        { value: profile.followers, label: "Followers" },
                        { value: profile.following, label: "Following" },
                      ].map((stat) => (
                        <span key={stat.label} className="text-xs text-white/80">
                          <span className="font-bold text-white">{formatNumber(stat.value)}</span> {stat.label}
                        </span>
                      ))}
                    </div>

                    {/* Bio */}
                    <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed max-w-md line-clamp-2">{profile.bio}</p>
                  </div>
                </div>

                {/* ─── RIGHT SIDE: Actions + Socials ─── */}
                <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Follow */}
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                        isFollowing
                          ? "border-2 border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                          : "bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white shadow-md shadow-pink-500/30 hover:shadow-lg"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>

                    {/* Subscribe */}
                    <button className="rounded-xl border-2 border-[#e8384f] bg-[#e8384f]/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-[#e8384f] hover:shadow-md hover:shadow-red-500/30">
                      Subscribe &middot; ${profile.subscriptionPrice}/mo
                    </button>

                    {/* Message */}
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50" aria-label="Message">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                      {showMoreOptions && (
                        <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-pink-100 bg-white py-2 shadow-xl overflow-hidden z-50">
                          {[
                            { label: "Share Profile", icon: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" },
                            { label: "Block", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" },
                            { label: "Report", icon: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" },
                          ].map((item) => (
                            <button
                              key={item.label}
                              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-pink-50/60 ${
                                item.label === "Block" || item.label === "Report"
                                  ? "text-[#e8384f] hover:bg-red-50/60"
                                  : "text-[#5b4153] hover:text-[#df5f97]"
                              }`}
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                        <SocialIcon platform={social.platform} className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{social.handle}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Moments (under banner, ePal-style semi-transparent boxes) ── */}
          <div className="bg-[#fff8fb] py-4">
            <div
              ref={momentsRef}
              className="flex gap-3 overflow-x-auto hide-scrollbar justify-center max-w-[1500px] mx-auto px-4"
            >
              {profileMoments.map((moment) => {
                const borderGradient =
                  moment.type === "private"
                    ? ["#fca5a5", "#ef4444", "#dc2626", "#b91c1c"]
                    : ["#fcd5e5", "#f9a8c8", "#f472b6", "#ec4899"];

                return (
                  <button
                    key={moment.id}
                    className="flex flex-col items-center gap-1.5 shrink-0 group"
                  >
                    <div className="relative">
                      <HeartAvatar
                        src={moment.thumb}
                        name={`profile-moment-${moment.id}`}
                        borderColor={SAKURA_PINK}
                        borderGradient={borderGradient}
                        size={68}
                        borderWidth={4}
                      />
                    </div>
                    {/* Semi-transparent label box (ePal-style) */}
                    <span className="text-[11px] text-[#4a3340] font-medium max-w-[72px] truncate px-2.5 py-0.5 rounded-full bg-[#5b4153]/10 backdrop-blur-sm group-hover:bg-[#f472b6]/15 group-hover:text-[#df5f97] transition">
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
                tab.id === "feed" ? (
                  /* Feed tab with dropdown arrow */
                  <div key={tab.id} className="relative" data-dropdown>
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          setActiveTab("feed");
                          setSelectedServiceId(null);
                          setFeedSubView("posts");
                        }}
                        className={`px-4 py-3 text-sm font-medium transition relative ${
                          activeTab === "feed"
                            ? "text-[#241a22]"
                            : "text-[#b89aa8] hover:text-[#8c6d7f]"
                        }`}
                      >
                        {feedSubView === "posts" ? "Feed" : "Media"}
                        {activeTab === "feed" && (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6]" />
                        )}
                      </button>
                      <button
                        onClick={() => setShowFeedMenu(!showFeedMenu)}
                        className={`-ml-1 py-3 pr-3 transition ${
                          activeTab === "feed" ? "text-[#241a22]" : "text-[#b89aa8] hover:text-[#8c6d7f]"
                        }`}
                        aria-label="Feed options"
                      >
                        <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 transition-transform ${showFeedMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>
                    {showFeedMenu && (
                      <div className="absolute left-0 top-full mt-1 w-36 rounded-xl border border-pink-100 bg-white py-1 shadow-xl overflow-hidden z-50">
                        <button
                          onClick={() => { setActiveTab("feed"); setFeedSubView("posts"); setShowFeedMenu(false); }}
                          className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition ${
                            feedSubView === "posts" && activeTab === "feed"
                              ? "bg-pink-50/60 text-[#f472b6] font-semibold"
                              : "text-[#5b4153] hover:bg-pink-50/40"
                          }`}
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                          </svg>
                          Posts
                        </button>
                        <button
                          onClick={() => { setActiveTab("feed"); setFeedSubView("media"); setShowFeedMenu(false); }}
                          className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition ${
                            feedSubView === "media" && activeTab === "feed"
                              ? "bg-pink-50/60 text-[#f472b6] font-semibold"
                              : "text-[#5b4153] hover:bg-pink-50/40"
                          }`}
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                          Media
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
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
                )
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
                    <div className="sticky top-20 space-y-2">
                      {/* Search */}
                      <div className="relative mb-3">
                        <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b89aa8]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          !selectedServiceId ? "bg-gradient-to-br from-[#f9a8c8] to-[#f472b6] text-white" : "bg-pink-50 text-[#f472b6]"
                        }`}>
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
                          </svg>
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className={`text-sm font-semibold truncate ${!selectedServiceId ? "text-[#241a22]" : "text-[#5b4153]"}`}>About Me</p>
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
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            selectedServiceId === service.id ? "bg-gradient-to-br from-[#f9a8c8] to-[#f472b6] text-white" : "bg-pink-50 text-[#f472b6]"
                          }`}>
                            <ServiceIcon type={service.icon} className="w-5 h-5" />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <p className={`text-sm font-semibold truncate ${selectedServiceId === service.id ? "text-[#241a22]" : "text-[#5b4153]"}`}>{service.title}</p>
                            <p className="text-xs text-[#8c6d7f] flex items-center gap-1 mt-0.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                              ${service.price} /{service.duration}
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
                    <div className="rounded-2xl border border-pink-100 bg-white overflow-hidden shadow-sm">

                      {/* ── About Me View ──────────────────────────────── */}
                      {!selectedServiceId && (
                        <div className="p-6">
                          {/* Title */}
                          <h2 className="text-xl font-bold text-[#241a22]">About Me</h2>
                          {/* Rating & Served */}
                          <div className="flex items-center gap-2 mt-2">
                            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="#fbbf24">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-bold text-[#241a22]">{avgRating}</span>
                            <span className="text-[#8c6d7f]">&middot;</span>
                            <span className="text-sm text-[#8c6d7f]">{totalServed} Served</span>
                          </div>

                          {/* Long Bio */}
                          <div className="mt-5 text-sm text-[#4a3340] leading-relaxed whitespace-pre-line">
                            {profileLongBio}
                          </div>

                          {/* Styles & Interests */}
                          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2">
                            <div>
                              <span className="text-sm font-semibold text-[#5b4153]">Styles</span>
                              <p className="text-sm text-[#8c6d7f] mt-0.5">Friendly, Talkative, Sweet</p>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-[#5b4153]">Platforms</span>
                              <p className="text-sm text-[#8c6d7f] mt-0.5">Discord, Zoom, Messaging</p>
                            </div>
                          </div>

                          {/* ── Service Types ───────────────────────────── */}
                          <div className="mt-8 border-t border-pink-50 pt-6">
                            <h3 className="text-base font-bold text-[#241a22]">Service Types &middot; {profileServices.length}</h3>
                            <div className="mt-3 space-y-1">
                              {profileServices.map((service) => (
                                <button
                                  key={service.id}
                                  onClick={() => setSelectedServiceId(service.id)}
                                  className="w-full flex items-center justify-between py-3 px-3 rounded-xl hover:bg-pink-50/60 transition group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-[#f472b6] group-hover:bg-[#f9a8c8]/30 transition">
                                      <ServiceIcon type={service.icon} className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-[#241a22]">{service.title}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 text-sm text-[#4a3340] font-semibold">
                                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                                      ${service.price}
                                    </span>
                                    <span className="text-xs text-[#b89aa8]">/{service.duration}</span>
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#b89aa8] group-hover:text-[#f472b6] transition" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M9 18l6-6-6-6" />
                                    </svg>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* ── Reviews ──────────────────────────────────── */}
                          <div className="mt-8 border-t border-pink-50 pt-6">
                            <h3 className="text-base font-bold text-[#241a22]">Reviews</h3>
                            <div className="flex items-center gap-2 mt-2 mb-4">
                              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="#fbbf24">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-bold text-[#241a22]">{avgRating}</span>
                              <span className="text-[#8c6d7f]">&middot;</span>
                              <span className="text-sm text-[#8c6d7f]">{profileReviews.length} Reviews</span>
                            </div>
                            <div className="space-y-4">
                              {profileReviews.map((review) => (
                                <div key={review.id} className="flex gap-3 pb-4 border-b border-pink-50 last:border-0">
                                  <img src={review.avatar} alt={review.user} className="h-10 w-10 rounded-full object-cover shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-[#241a22]">{review.user}</span>
                                      <span className="text-xs text-[#b89aa8]">{review.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <svg key={s} viewBox="0 0 20 20" className="w-3 h-3" fill={s <= review.rating ? "#fbbf24" : "#e5d6dc"}>
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                      <span className="ml-1 text-xs text-[#b89aa8]">&middot; {review.service}</span>
                                    </div>
                                    <p className="mt-1.5 text-sm text-[#4a3340] leading-relaxed">{review.text}</p>
                                  </div>
                                </div>
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
                            <h2 className="text-xl font-bold text-[#241a22]">{selectedService.title}</h2>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white shadow-md hover:shadow-lg transition">
                              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            </button>
                          </div>

                          {/* Rating & Served */}
                          <div className="flex items-center gap-2 mt-2">
                            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="#fbbf24">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-bold text-[#241a22]">{selectedService.rating}</span>
                            <span className="text-[#8c6d7f]">&middot;</span>
                            <span className="text-sm text-[#8c6d7f]">{selectedService.reviews} Served</span>
                          </div>

                          {/* Description */}
                          <p className="mt-4 text-sm text-[#4a3340] leading-relaxed">{selectedService.description}</p>

                          {/* Styles & Platforms */}
                          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3">
                            <div>
                              <span className="text-sm font-semibold text-[#5b4153]">Styles</span>
                              <p className="text-sm text-[#8c6d7f] mt-0.5">{selectedService.styles || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-[#5b4153]">Platforms</span>
                              <p className="text-sm text-[#8c6d7f] mt-0.5">{selectedService.platforms || "N/A"}</p>
                            </div>
                          </div>

                          {/* Price & Duration */}
                          <div className="mt-5 flex items-center gap-4 p-4 rounded-xl bg-pink-50/50 border border-pink-100">
                            <div>
                              <span className="text-xs text-[#8c6d7f] uppercase tracking-wide">Price</span>
                              <p className="text-lg font-bold text-[#241a22]">${selectedService.price}</p>
                            </div>
                            <div className="w-px h-8 bg-pink-200" />
                            <div>
                              <span className="text-xs text-[#8c6d7f] uppercase tracking-wide">Duration</span>
                              <p className="text-lg font-bold text-[#241a22]">{selectedService.duration}</p>
                            </div>
                          </div>

                          {/* Mobile Order Button */}
                          <div className="xl:hidden mt-5 flex gap-3">
                            <button className="flex-1 py-3 rounded-xl border-2 border-pink-200 text-[#241a22] font-semibold text-sm hover:bg-pink-50 transition">
                              Chat
                            </button>
                            <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white font-semibold text-sm shadow-md shadow-pink-200/40 hover:shadow-lg transition">
                              Order Now
                            </button>
                          </div>

                          {/* Service Types (other services) */}
                          <div className="mt-8 border-t border-pink-50 pt-6">
                            <h3 className="text-base font-bold text-[#241a22]">Other Services &middot; {profileServices.length - 1}</h3>
                            <div className="mt-3 space-y-1">
                              {profileServices
                                .filter((s) => s.id !== selectedServiceId)
                                .map((service) => (
                                  <button
                                    key={service.id}
                                    onClick={() => setSelectedServiceId(service.id)}
                                    className="w-full flex items-center justify-between py-3 px-3 rounded-xl hover:bg-pink-50/60 transition group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-[#f472b6] group-hover:bg-[#f9a8c8]/30 transition">
                                        <ServiceIcon type={service.icon} className="w-4 h-4" />
                                      </div>
                                      <span className="text-sm font-medium text-[#241a22]">{service.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center gap-1.5 text-sm text-[#4a3340] font-semibold">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                                        ${service.price}
                                      </span>
                                      <span className="text-xs text-[#b89aa8]">/{service.duration}</span>
                                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#b89aa8] group-hover:text-[#f472b6] transition" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18l6-6-6-6" />
                                      </svg>
                                    </div>
                                  </button>
                                ))}
                            </div>
                          </div>

                          {/* Reviews for this service */}
                          <div className="mt-8 border-t border-pink-50 pt-6">
                            <h3 className="text-base font-bold text-[#241a22]">Reviews</h3>
                            <div className="flex items-center gap-2 mt-2 mb-4">
                              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="#fbbf24">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-bold text-[#241a22]">{selectedService.rating}</span>
                              <span className="text-[#8c6d7f]">&middot;</span>
                              <span className="text-sm text-[#8c6d7f]">{profileReviews.filter((r) => r.service === selectedService.title).length || profileReviews.length} Reviews</span>
                            </div>
                            <div className="space-y-4">
                              {profileReviews
                                .filter((r) => r.service === selectedService.title || profileReviews.filter((r2) => r2.service === selectedService.title).length === 0)
                                .slice(0, 3)
                                .map((review) => (
                                  <div key={review.id} className="flex gap-3 pb-4 border-b border-pink-50 last:border-0">
                                    <img src={review.avatar} alt={review.user} className="h-10 w-10 rounded-full object-cover shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-[#241a22]">{review.user}</span>
                                        <span className="text-xs text-[#b89aa8]">{review.time}</span>
                                      </div>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <svg key={s} viewBox="0 0 20 20" className="w-3 h-3" fill={s <= review.rating ? "#fbbf24" : "#e5d6dc"}>
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                      </div>
                                      <p className="mt-1.5 text-sm text-[#4a3340] leading-relaxed">{review.text}</p>
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
                    <div className="sticky top-20">
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

            {/* ═══ Feed Tab (Posts + Media sub-views) ═══ */}
            {activeTab === "feed" && feedSubView === "posts" && (
              <div className="max-w-[650px] mx-auto px-4 pt-5 pb-12 space-y-5">
                {profileFeedPosts.map((post) => {
                  const isKokoro = kokoroStates[post.id] || false;
                  const kokoroCount = isKokoro ? post.kokoros + 1 : post.kokoros;
                  const isUnlocked = unlockedPosts[post.id] || false;
                  const showLocked = post.locked && !isUnlocked;

                  return (
                    <article
                      key={post.id}
                      className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden"
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        <img src={profile.avatar} alt={profile.name} className="h-10 w-10 rounded-full object-cover border border-pink-100" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-[#241a22] truncate">{profile.name}</p>
                            {profile.verified && (
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="#f472b6">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <p className="text-xs text-[#b89aa8]">{post.timeAgo} ago</p>
                        </div>
                        <button className="text-[#b89aa8] hover:text-[#8c6d7f] transition" aria-label="More options">
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                      </div>
                      <p className="px-4 pb-3 text-sm text-[#4a3340] leading-relaxed" style={post.style || {}}>{post.caption}</p>
                      <div className="mx-4 rounded-xl overflow-hidden">
                        <img src={post.image} alt="Post" className={`w-full object-cover ${showLocked ? "blur-sm scale-105" : ""}`} style={{ aspectRatio: post.aspectRatio || "4/3" }} loading="lazy" />
                      </div>
                      {showLocked && (
                        <div>
                          <div className="flex items-center justify-between px-4 py-2.5 text-[#8c6d7f]">
                            <div className="flex items-center gap-3 text-xs">
                              {post.mediaCount?.images > 0 && (
                                <span className="flex items-center gap-1">
                                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                                  {post.mediaCount.images}
                                </span>
                              )}
                              {post.mediaCount?.images > 0 && post.mediaCount?.videos > 0 && <span className="text-[#d4b8c7]">&middot;</span>}
                              {post.mediaCount?.videos > 0 && (
                                <span className="flex items-center gap-1">
                                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
                                  {post.mediaCount.videos}
                                </span>
                              )}
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#5b4153]">
                              ${post.price}
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#8c6d7f]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                            </span>
                          </div>
                          <div className="px-4 pb-3">
                            <button onClick={() => setUnlockedPosts((prev) => ({ ...prev, [post.id]: true }))} className="w-full rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] py-3 text-sm font-bold text-white tracking-wide uppercase shadow-md shadow-pink-200/50 transition hover:shadow-lg hover:from-[#f472b6] hover:to-[#ec4899] active:scale-[0.98]">
                              Unlock Post for ${post.price}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="px-4 pt-3 pb-3">
                        <div className="flex items-center gap-4">
                          <button onClick={() => toggleKokoro(post.id)} className={`flex items-center gap-1.5 transition ${isKokoro ? "text-[#e8384f]" : "text-[#8c6d7f] hover:text-[#e8384f]"}`}>
                            <svg viewBox="0 0 24 24" className="w-6 h-6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={isKokoro ? "currentColor" : "none"} stroke="currentColor">
                              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                          </button>
                          <button className="text-[#8c6d7f] hover:text-[#5b4153] transition">
                            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                          </button>
                          <button className="text-[#8c6d7f] hover:text-[#5b4153] transition">
                            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
                          </button>
                          <div className="flex-1" />
                          <button className="flex items-center gap-1.5 rounded-full border-2 border-[#f472b6] px-3.5 py-1 text-sm font-semibold text-[#f472b6] transition hover:bg-gradient-to-r hover:from-[#f9a8c8] hover:to-[#f472b6] hover:text-white hover:border-transparent hover:shadow-md hover:shadow-pink-200/50">
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                            Tip
                          </button>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-[#241a22]">{formatNumber(kokoroCount)} Kokoros</p>
                        <button className="mt-1 text-sm text-[#b89aa8] hover:text-[#8c6d7f] transition">View all {post.comments} comments</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* ═══ Feed > Media Sub-View ═══ */}
            {activeTab === "feed" && feedSubView === "media" && (
              <div className="max-w-[650px] mx-auto px-4 pt-5 pb-12">
                <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
                  {[
                    { id: "all", label: "All" },
                    { id: "photos", label: "Photos" },
                    { id: "videos", label: "Videos" },
                    { id: "ptv", label: "Pay to View" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setMediaFilter(filter.id)}
                      className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        mediaFilter === filter.id
                          ? "bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white shadow-sm shadow-pink-200/50"
                          : "border border-pink-100 bg-white text-[#8c6d7f] hover:border-pink-200 hover:text-[#df5f97]"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden">
                  {filteredMedia.map((item) => (
                    <button key={item.id} className="relative aspect-square group overflow-hidden">
                      <img src={item.src} alt="" className={`h-full w-full object-cover transition group-hover:scale-105 ${item.locked ? "blur-sm" : ""}`} loading="lazy" />
                      {!item.locked && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                        </div>
                      )}
                      {item.type === "video" && !item.locked && (
                        <div className="absolute top-2 right-2">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white drop-shadow-md" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </div>
                      )}
                      {item.locked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                          <span className="mt-1 text-[11px] font-semibold text-white">${item.price}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {filteredMedia.length === 0 && (
                  <div className="py-16 text-center"><p className="text-sm text-[#b89aa8]">No media found for this filter.</p></div>
                )}
              </div>
            )}

            {/* ═══ Media Store Tab (LoyalFans-style PTV Grid) ═══ */}
            {activeTab === "store" && (
              <div className="max-w-[1500px] mx-auto px-4 pt-5 pb-12">
                {/* Top Bar: Search + Filters + Layout Toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
                  {/* Search */}
                  <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
                    <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b89aa8]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
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

                  {/* Layout Toggle */}
                  <div className="flex items-center gap-1 border border-pink-100 rounded-xl p-1 bg-white shrink-0">
                    <button
                      onClick={() => setStoreLayout("grid")}
                      className={`p-1.5 rounded-lg transition ${storeLayout === "grid" ? "bg-pink-50 text-[#f472b6]" : "text-[#b89aa8] hover:text-[#8c6d7f]"}`}
                      aria-label="Grid view"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setStoreLayout("list")}
                      className={`p-1.5 rounded-lg transition ${storeLayout === "list" ? "bg-pink-50 text-[#f472b6]" : "text-[#b89aa8] hover:text-[#8c6d7f]"}`}
                      aria-label="List view"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Results count */}
                <p className="text-xs text-[#b89aa8] mb-4">{filteredStoreItems.length} items</p>

                {/* ── Grid Layout ──────────────────────────────────────── */}
                {storeLayout === "grid" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredStoreItems.map((item) => (
                      <div key={item.id} className="group rounded-2xl border border-pink-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden bg-[#f5e6ed]">
                          <img src={item.thumb} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                          {/* Tags */}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            {item.isNew && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#f472b6] text-white">New</span>
                            )}
                            {item.downloadable && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#34d399] text-white">Download</span>
                            )}
                          </div>
                          {/* Duration / Photo Count badge */}
                          <div className="absolute bottom-2 left-2">
                            {item.type === "video" && (
                              <span className="px-1.5 py-0.5 rounded bg-black/70 text-[11px] font-medium text-white">{item.duration}</span>
                            )}
                            {item.type === "photo" && (
                              <span className="px-1.5 py-0.5 rounded bg-black/70 text-[11px] font-medium text-white flex items-center gap-1">
                                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                                {item.photoCount}
                              </span>
                            )}
                            {item.type === "audio" && (
                              <span className="px-1.5 py-0.5 rounded bg-black/70 text-[11px] font-medium text-white flex items-center gap-1">
                                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                                {item.duration}
                              </span>
                            )}
                          </div>
                          {/* Play button overlay for video */}
                          {item.type === "video" && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#f472b6] ml-0.5" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                              </div>
                            </div>
                          )}
                          {/* Type icon for audio */}
                          {item.type === "audio" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#f9a8c8] to-[#f472b6] shadow-lg">
                                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
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
                          <h3 className="text-sm font-semibold text-[#241a22] leading-snug line-clamp-1 group-hover:text-[#f472b6] transition">{item.title}</h3>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-base font-bold text-[#241a22]">${item.price}</span>
                            <div className="flex items-center gap-2">
                              {/* Bookmark */}
                              <button className="text-[#b89aa8] hover:text-[#f472b6] transition" aria-label="Save">
                                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
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
                      <div key={item.id} className="group flex gap-4 rounded-2xl border border-pink-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition p-3">
                        {/* Thumbnail */}
                        <div className="relative w-48 shrink-0 aspect-video rounded-xl overflow-hidden bg-[#f5e6ed]">
                          <img src={item.thumb} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                          <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                            {item.isNew && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#f472b6] text-white">New</span>}
                            {item.downloadable && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#34d399] text-white">Download</span>}
                          </div>
                          <div className="absolute bottom-1.5 left-1.5">
                            {item.type === "video" && <span className="px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-medium text-white">{item.duration}</span>}
                            {item.type === "photo" && <span className="px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-medium text-white">{item.photoCount} photos</span>}
                            {item.type === "audio" && <span className="px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-medium text-white">{item.duration}</span>}
                          </div>
                        </div>
                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center gap-2 text-[10px] text-[#b89aa8] mb-1">
                              <span>{profile.name}</span><span>&middot;</span><span>{item.date}</span>
                              <span className="ml-auto px-2 py-0.5 rounded-full bg-pink-50 text-[10px] font-medium text-[#f472b6] capitalize">{item.type}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-[#241a22] line-clamp-1 group-hover:text-[#f472b6] transition">{item.title}</h3>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-bold text-[#241a22]">${item.price}</span>
                            <div className="flex items-center gap-2">
                              <button className="text-[#b89aa8] hover:text-[#f472b6] transition" aria-label="Save">
                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
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
                    <svg viewBox="0 0 24 24" className="w-12 h-12 mx-auto text-[#d4b8c7] mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z" /><path d="M3 7h18" /><path d="M16 11a4 4 0 01-8 0" />
                    </svg>
                    <p className="text-sm text-[#b89aa8]">No media found matching your filters.</p>
                  </div>
                )}
              </div>
            )}
        </main>

        {/* ─── Right Chat Sidebar (Desktop) ────────────────────────── */}
        <aside
          className={`hidden md:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-l border-pink-100 bg-white transition-all duration-300 ease-in-out ${
            chatExpanded ? "w-[300px]" : "w-[82px]"
          }`}
        >
          <button
            onClick={() => setChatExpanded(!chatExpanded)}
            className="flex h-10 w-full items-center justify-center border-b border-pink-50 text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]"
            aria-label={chatExpanded ? "Collapse inbox" : "Expand inbox"}
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-4 h-4 transition-transform duration-300 ${chatExpanded ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {chatExpanded ? (
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
                      <img src={contact.avatar} alt={contact.name} className="h-[72px] w-[72px] rounded-full object-cover" />
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#241a22] truncate">{contact.name}</p>
                        <span className="text-[10px] text-[#b89aa8] shrink-0 ml-2">{contact.time}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#8c6d7f] truncate">{contact.lastMessage}</p>
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
              <div className="flex flex-col items-center gap-4 py-3">
                {chatContacts.map((contact) => (
                  <button
                    key={contact.id}
                    className="relative group"
                    onClick={() => setChatExpanded(true)}
                    aria-label={`Chat with ${contact.name}`}
                  >
                    <img src={contact.avatar} alt={contact.name} className="h-14 w-14 rounded-full object-cover border-2 border-pink-100 transition group-hover:border-pink-300" />
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
                onClick={() => {
                  if (item.id === "home") onBack();
                  else if (item.id === "connect" && onOpenConnect) onOpenConnect();
                  else if (item.id === "store" && onOpenStore) onOpenStore();
                }}
                className="flex h-11 w-11 items-center justify-center rounded-xl transition text-[#8c6d7f] active:text-[#df5f97]"
                aria-label={item.label}
              >
                {item.icon}
              </button>
            )
          ))}
          <button
            className="relative flex h-11 w-11 items-center justify-center rounded-xl transition text-[#8c6d7f] active:text-[#df5f97]"
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
