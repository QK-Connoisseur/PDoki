/**
 * Sample Connect creators and spotlight carousel slides.
 *
 * Dev/test only — not production data. Extracted from the page body so it can
 * be swapped for a real `/api/v1` response during backend integration.
 *
 * Each creator lists service `offers` priced in Veso (1 Veso = 1 USD):
 * `{ service, vesos, unit }`. A category may carry several offers (e.g. a
 * 30-minute block and an hour block); display code derives the lowest via
 * `getLowestOffer` instead of storing a pre-formatted price string. The
 * creator's service categories are derived from these offers.
 */

export const creators = [
  {
    id: 1,
    name: "Luna Bloom",
    username: "lunabloom",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=530&q=80",
    level: "gold",
    status: "online",
    audioIntro: "https://example.com/audio/lunabloom.mp3",
    offers: [
      { service: "chat", vesos: 10, unit: "30 min" },
      { service: "chat", vesos: 18, unit: "hour" },
      { service: "voice", vesos: 15, unit: "30 min" },
      { service: "video", vesos: 25, unit: "30 min" },
      { service: "shoutout", vesos: 20, unit: "shoutout" },
    ],
    description:
      "Friendly conversations about life, love, and everything in between.",
    section: "recent",
  },
  {
    id: 2,
    name: "Mika Rose",
    username: "mikarose",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=530&q=80",
    level: "star",
    status: "busy",
    audioIntro: "https://example.com/audio/mikarose.mp3",
    offers: [
      { service: "chat", vesos: 12, unit: "30 min" },
      { service: "video", vesos: 30, unit: "30 min" },
      { service: "game", vesos: 10, unit: "game" },
      { service: "game", vesos: 8, unit: "game" },
    ],
    description: "Let's play games together or just vibe on a video call!",
    section: "recent",
  },
  {
    id: 3,
    name: "Airi Vale",
    username: "airivale",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&h=530&q=80",
    level: "silver",
    status: "resting",
    audioIntro: "https://example.com/audio/airivale.mp3",
    offers: [
      { service: "chat", vesos: 6, unit: "30 min" },
      { service: "voice", vesos: 12, unit: "30 min" },
    ],
    description: "Deep talks and late-night chats. Always here to listen.",
    section: "recent",
  },
  {
    id: 4,
    name: "Sora Nyx",
    username: "soranyx",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=530&q=80",
    level: "legend",
    status: "online",
    audioIntro: "https://example.com/audio/soranyx.mp3",
    offers: [
      { service: "chat", vesos: 20, unit: "30 min" },
      { service: "voice", vesos: 35, unit: "30 min" },
      { service: "video", vesos: 50, unit: "30 min" },
      { service: "video", vesos: 90, unit: "hour" },
      { service: "game", vesos: 40, unit: "game" },
      { service: "shoutout", vesos: 45, unit: "shoutout" },
    ],
    description: "Premium 1-on-1 experiences. Gaming, chatting, and more.",
    section: "recent",
  },
  {
    id: 5,
    name: "Naomi Hart",
    username: "naomihart",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&h=530&q=80",
    level: "gold",
    status: "offline",
    audioIntro: "https://example.com/audio/naomihart.mp3",
    offers: [
      { service: "chat", vesos: 9, unit: "30 min" },
      { service: "video", vesos: 22, unit: "30 min" },
    ],
    description: "Video calls with good vibes and great energy every time.",
    section: "recent",
  },
  {
    id: 6,
    name: "Reina Noir",
    username: "reinanoir",
    avatar:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&h=530&q=80",
    level: "2stars",
    status: "busy",
    audioIntro: "https://example.com/audio/reinanoir.mp3",
    offers: [
      { service: "voice", vesos: 18, unit: "30 min" },
      { service: "video", vesos: 28, unit: "30 min" },
    ],
    description: "Voice and video sessions with a creative twist. Come say hi!",
    section: "recent",
  },
  {
    id: 7,
    name: "Kira Dawn",
    username: "kiradawn",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=530&q=80",
    level: "bronze",
    status: "online",
    audioIntro: "https://example.com/audio/kiradawn.mp3",
    offers: [
      { service: "chat", vesos: 4, unit: "30 min" },
      { service: "game", vesos: 5, unit: "game" },
    ],
    description: "Casual gaming sessions and fun chat. Let's hang out!",
    section: "recent",
  },
  {
    id: 8,
    name: "Yuki Star",
    username: "yukistar",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=530&q=80",
    level: "star",
    status: "resting",
    audioIntro: "https://example.com/audio/yukistar.mp3",
    offers: [
      { service: "chat", vesos: 11, unit: "30 min" },
      { service: "voice", vesos: 16, unit: "30 min" },
      { service: "video", vesos: 26, unit: "30 min" },
      { service: "shoutout", vesos: 18, unit: "shoutout" },
    ],
    description: "Warm conversations and cozy voice calls. Your comfort zone.",
    section: "popular",
  },
  {
    id: 9,
    name: "Hana Mizu",
    username: "hanamizu",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=530&q=80",
    level: "gold",
    status: "online",
    audioIntro: "https://example.com/audio/hanamizu.mp3",
    offers: [
      { service: "chat", vesos: 10, unit: "30 min" },
      { service: "voice", vesos: 14, unit: "30 min" },
      { service: "game", vesos: 12, unit: "game" },
      { service: "game", vesos: 9, unit: "game" },
    ],
    description: "Challenge me to a game or just chat about anything.",
    section: "popular",
  },
  {
    id: 10,
    name: "Emi Skye",
    username: "emiskye",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=530&q=80",
    level: "legend",
    status: "online",
    audioIntro: "https://example.com/audio/emiskye.mp3",
    offers: [
      { service: "chat", vesos: 22, unit: "30 min" },
      { service: "voice", vesos: 38, unit: "30 min" },
      { service: "video", vesos: 60, unit: "hour" },
      { service: "game", vesos: 45, unit: "game" },
      { service: "shoutout", vesos: 50, unit: "shoutout" },
    ],
    description:
      "Full interactive experience. Games, calls, and exclusive chats.",
    section: "popular",
  },
  {
    id: 11,
    name: "Rin Velvet",
    username: "rinvelvet",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=530&q=80",
    level: "silver",
    status: "offline",
    audioIntro: "https://example.com/audio/rinvelvet.mp3",
    offers: [
      { service: "chat", vesos: 7, unit: "30 min" },
      { service: "video", vesos: 20, unit: "30 min" },
    ],
    description: "Chill video sessions. Let's talk about your day.",
    section: "popular",
  },
  {
    id: 12,
    name: "Mei Soleil",
    username: "meisoleil",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&h=530&q=80",
    level: "2stars",
    status: "busy",
    audioIntro: "https://example.com/audio/meisoleil.mp3",
    offers: [
      { service: "voice", vesos: 20, unit: "30 min" },
      { service: "video", vesos: 32, unit: "30 min" },
      { service: "game", vesos: 15, unit: "game" },
    ],
    description: "High-energy gaming and interactive voice experiences.",
    section: "popular",
  },
  {
    id: 13,
    name: "Zara Lux",
    username: "zaralux",
    avatar:
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=400&h=530&q=80",
    level: "bronze",
    status: "resting",
    audioIntro: "https://example.com/audio/zaralux.mp3",
    offers: [{ service: "chat", vesos: 3, unit: "30 min" }],
    description: "Quick messages and personal replies. Always responsive.",
    section: "popular",
  },
  {
    id: 14,
    name: "Noa Ember",
    username: "noaember",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    photo:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=530&q=80",
    level: "gold",
    status: "online",
    audioIntro: "https://example.com/audio/noaember.mp3",
    offers: [
      { service: "chat", vesos: 10, unit: "30 min" },
      { service: "voice", vesos: 15, unit: "30 min" },
      { service: "video", vesos: 24, unit: "30 min" },
      { service: "shoutout", vesos: 16, unit: "shoutout" },
    ],
    description: "Voice calls with personality. Let me brighten your day.",
    section: "popular",
  },
];

export const spotlightSlides = [
  {
    id: 1,
    tag: "Live Event",
    title: "Sakura Night Festival",
    subtitle:
      "Join 200+ creators for a night of live performances and exclusive sessions.",
    cta: "Join Event",
    bg: "linear-gradient(135deg, #1a0a12 0%, #4a1535 55%, #7c2d58 100%)",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    accentColor: "#f9a8c8",
  },
  {
    id: 2,
    tag: "Featured Creator",
    title: "Meet Sora Nyx",
    subtitle:
      "Premium 1-on-1 experiences — gaming, chatting, and so much more.",
    cta: "Meet Sora",
    bg: "linear-gradient(135deg, #0d0a1a 0%, #1e0d3a 55%, #3d1a70 100%)",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    accentColor: "#c4b5fd",
  },
  {
    id: 3,
    tag: "Weekend Deal",
    title: "First 3 Minutes Free",
    subtitle:
      "Try any Voice or Video Call creator at no charge this weekend only.",
    cta: "Claim Offer",
    bg: "linear-gradient(135deg, #0a1218 0%, #0f2233 55%, #1a3d55 100%)",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    accentColor: "#7dd3fc",
  },
];
