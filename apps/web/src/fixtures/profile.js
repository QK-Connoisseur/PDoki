/**
 * Sample creator profile data: header, services, reviews, posts, and media.
 *
 * Dev/test only — not production data. Extracted from the page body so it can
 * be swapped for a real `/api/v1` response during backend integration.
 */

export const profileData = {
  name: "Luna Bloom",
  username: "lunabloom",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  banner:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
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
  tier: "super-doki-2",
};

export const profileMoments = [
  {
    id: 1,
    name: "Beach Day",
    thumb:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=150&q=80",
    type: "regular",
    createdAt: "2026-05-12T07:00:00Z",
  },
  {
    id: 2,
    name: "BTS Shoot",
    thumb:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=150&q=80",
    type: "private",
    createdAt: "2026-05-12T10:00:00Z",
  },
  {
    id: 3,
    name: "Travel",
    thumb:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=150&q=80",
    type: "regular",
    createdAt: "2026-05-12T04:00:00Z",
  },
  {
    id: 4,
    name: "Q&A",
    thumb:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=150&q=80",
    type: "regular",
    createdAt: "2026-05-12T02:00:00Z",
  },
  {
    id: 5,
    name: "Exclusive",
    thumb:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=150&q=80",
    type: "private",
    createdAt: "2026-05-12T08:00:00Z",
  },
];

export const profileServices = [
  {
    id: 1,
    title: "Video Call",
    description:
      "1-on-1 private video call. Let's chat about anything you want! I love discussing games, TV shows, movies, cats, sharing stories or even drama! You can reach out if you feel alone and would like to have a pleasant conversation, or to just chill and laugh together. I promise it will be worth your time.",
    price: 25,
    duration: "15 min",
    icon: "video",
    rating: 4.9,
    reviews: 142,
    available: true,
    styles: "Friendly, Talkative",
    platforms: "Discord, Zoom",
  },
  {
    id: 2,
    title: "Custom Content",
    description:
      "Personalized photo or video made just for you. Tell me your vision and I'll bring it to life! Whether it's a special greeting, a themed photoshoot, or a personalized video message, I put my heart into every custom piece.",
    price: 50,
    duration: "3 days",
    icon: "camera",
    rating: 5.0,
    reviews: 89,
    available: true,
    styles: "Creative, Personalized",
    platforms: "Direct Delivery",
  },
  {
    id: 3,
    title: "Gaming Session",
    description:
      "Play your favorite game together with me live! I play Valorant, League of Legends, Genshin Impact, Minecraft, and more. Whether you want to tryhard or just have fun, I'm down for anything!",
    price: 30,
    duration: "30 min",
    icon: "gamepad",
    rating: 4.8,
    reviews: 67,
    available: true,
    styles: "Casual, Competitive",
    platforms: "PC, Console",
  },
  {
    id: 4,
    title: "Voice Call",
    description:
      "Chill voice call. Perfect for winding down after a long day. Let's talk about anything — your day, your dreams, or just enjoy some comfortable silence together.",
    price: 15,
    duration: "15 min",
    icon: "phone",
    rating: 4.7,
    reviews: 203,
    available: true,
  },
  {
    id: 5,
    title: "Girlfriend Experience",
    description:
      "Daily messages, good morning texts & exclusive snaps for a week. I'll be your virtual companion — someone to check in with, share moments with, and brighten your day. Every interaction feels genuine because I truly enjoy connecting with people!",
    price: 75,
    duration: "7 days",
    icon: "heart",
    rating: 5.0,
    reviews: 54,
    available: true,
    styles: "Sweet, Caring",
    platforms: "Messaging",
  },
  {
    id: 6,
    title: "Social Media Shoutout",
    description:
      "I'll shout you out on my socials to all my followers. Great for growing your own audience or surprising a friend! Includes a personalized post or story mention across my platforms.",
    price: 40,
    duration: "Within 24h",
    icon: "megaphone",
    rating: 4.6,
    reviews: 31,
    available: true,
    styles: "Promotional",
    platforms: "Instagram, TikTok, X",
  },
];

export const profileLongBio = `Hey there! I'm Luna Bloom, a digital creator and model based in Los Angeles. I love connecting with people from all over the world and sharing my passions — gaming, travel, photography, and just good vibes!

I started creating content as a way to express myself and build a community of like-minded people. Whether it's a chill voice call after a long day, an exciting gaming session, or just exchanging messages throughout the week, I'm here to make your day a little brighter.

When I'm not creating content, you can find me exploring hidden cafes, binge-watching anime, or leveling up in Genshin Impact. I speak English and Japanese, and I'm always down to learn about different cultures!

Feel free to browse my services below and don't hesitate to reach out. I love meeting new people and I promise every interaction will be worth your time!`;

export const profileReviews = [
  {
    id: 1,
    user: "Alex K.",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    text: "Luna is amazing! We played Genshin together and she was super fun and patient. Will definitely book again!",
    time: "2 days ago",
    service: "Gaming Session",
  },
  {
    id: 2,
    user: "Jordan M.",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    text: "Best video call ever! She's genuine, easy to talk to, and the time flew by. Highly recommend!",
    time: "5 days ago",
    service: "Video Call",
  },
  {
    id: 3,
    user: "Sam T.",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    text: "The girlfriend experience was so sweet. Daily good morning texts and cute selfies made my whole week better!",
    time: "1 week ago",
    service: "Girlfriend Experience",
  },
  {
    id: 4,
    user: "Riley N.",
    avatar:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    text: "Custom content delivered in just 2 days! Exactly what I asked for and the quality was incredible.",
    time: "2 weeks ago",
    service: "Custom Content",
  },
  {
    id: 5,
    user: "Casey L.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    rating: 4,
    text: "Really chill voice call. Luna has such a calming voice and great conversation skills. Will be back!",
    time: "3 weeks ago",
    service: "Voice Call",
  },
];

export const profileSakuraLinks = [
  {
    id: 1,
    platform: "instagram",
    label: "Instagram",
    handle: "@luna.bloom",
    url: "#",
  },
  {
    id: 2,
    platform: "twitter",
    label: "X / Twitter",
    handle: "@lunabloom",
    url: "#",
  },
  {
    id: 3,
    platform: "tiktok",
    label: "TikTok",
    handle: "@lunabloom",
    url: "#",
  },
  {
    id: 4,
    platform: "youtube",
    label: "YouTube",
    handle: "Luna Bloom",
    url: "#",
  },
  {
    id: 5,
    platform: "discord",
    label: "Discord Server",
    handle: "lunabloom.gg",
    url: "#",
  },
];

export const profileFeedPosts = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&h=500&q=80",
    aspectRatio: "8/5",
    caption:
      "Golden hour never disappoints. Moments like these are what I live for.",
    kokoros: 1247,
    comments: 83,
    timeAgo: "2h",
    locked: false,
    style: {},
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&h=800&q=80",
    aspectRatio: "1/1",
    caption:
      "Lost in the wild. New exclusive set dropping this weekend for subscribers!",
    kokoros: 892,
    comments: 56,
    timeAgo: "4h",
    locked: false,
    style: { fontSize: "16px", fontWeight: "600", color: "#7c3aed" },
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&h=1000&q=80",
    aspectRatio: "4/5",
    caption: "This set is for my loyal subscribers only. Subscribe to unlock!",
    kokoros: 2103,
    comments: 127,
    timeAgo: "1d",
    locked: true,
    price: 9.99,
    mediaCount: { images: 8, videos: 2 },
    style: { fontSize: "15px", fontWeight: "700", color: "#c2185b" },
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&h=600&q=80",
    aspectRatio: "4/3",
    caption:
      "Behind the scenes from today's shoot. You don't want to miss this.",
    kokoros: 654,
    comments: 41,
    timeAgo: "2d",
    locked: true,
    price: 14.99,
    mediaCount: { images: 15, videos: 5 },
    style: { fontSize: "13px", fontStyle: "italic", color: "#8b2252" },
  },
];

export const profileMedia = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    type: "photo",
    locked: false,
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80",
    type: "video",
    locked: false,
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
    type: "photo",
    locked: true,
    price: 4.99,
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=80",
    type: "photo",
    locked: false,
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    type: "video",
    locked: true,
    price: 7.99,
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    type: "photo",
    locked: false,
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80",
    type: "photo",
    locked: true,
    price: 3.99,
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
    type: "video",
    locked: false,
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    type: "photo",
    locked: true,
    price: 5.99,
  },
];

export const mediaStoreItems = [
  {
    id: 1,
    thumb:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&h=340&q=80",
    title: "Golden Hour Collection",
    price: 11.99,
    type: "video",
    duration: "10:54",
    date: "Mar 13, 2026",
    isNew: true,
    downloadable: true,
    kokoros: 342,
  },
  {
    id: 2,
    thumb:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&h=340&q=80",
    title: "Nature Walk Vlog",
    price: 8.99,
    type: "video",
    duration: "11:13",
    date: "Mar 10, 2026",
    isNew: true,
    downloadable: true,
    kokoros: 218,
  },
  {
    id: 3,
    thumb:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&h=340&q=80",
    title: "Mountain Sunrise Set",
    price: 6.99,
    type: "photo",
    photoCount: 12,
    date: "Mar 8, 2026",
    isNew: true,
    downloadable: false,
    kokoros: 156,
  },
  {
    id: 4,
    thumb:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&h=340&q=80",
    title: "Behind The Scenes Shoot",
    price: 9.99,
    type: "video",
    duration: "07:42",
    date: "Mar 6, 2026",
    isNew: false,
    downloadable: true,
    kokoros: 287,
  },
  {
    id: 5,
    thumb:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=340&q=80",
    title: "Beach Day Exclusive",
    price: 7.99,
    type: "video",
    duration: "07:53",
    date: "Feb 28, 2026",
    isNew: false,
    downloadable: true,
    kokoros: 412,
  },
  {
    id: 6,
    thumb:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=340&q=80",
    title: "Studio Portrait Collection",
    price: 5.99,
    type: "photo",
    photoCount: 8,
    date: "Feb 20, 2026",
    isNew: false,
    downloadable: false,
    kokoros: 195,
  },
  {
    id: 7,
    thumb:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&h=340&q=80",
    title: "Evening Vibes ASMR",
    price: 10.99,
    type: "audio",
    duration: "15:30",
    date: "Feb 14, 2026",
    isNew: false,
    downloadable: true,
    kokoros: 89,
  },
  {
    id: 8,
    thumb:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&h=340&q=80",
    title: "City Lights Lookbook",
    price: 8.99,
    type: "video",
    duration: "10:17",
    date: "Feb 12, 2026",
    isNew: false,
    downloadable: true,
    kokoros: 301,
  },
  {
    id: 9,
    thumb:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=340&q=80",
    title: "Q&A Voice Notes",
    price: 4.99,
    type: "audio",
    duration: "22:10",
    date: "Feb 10, 2026",
    isNew: false,
    downloadable: false,
    kokoros: 67,
  },
  {
    id: 10,
    thumb:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&h=340&q=80",
    title: "Cozy Morning Routine",
    price: 10.99,
    type: "video",
    duration: "08:14",
    date: "Feb 6, 2026",
    isNew: false,
    downloadable: true,
    kokoros: 256,
  },
  {
    id: 11,
    thumb:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=340&q=80",
    title: "Spring Photo Dump",
    price: 6.99,
    type: "photo",
    photoCount: 15,
    date: "Feb 1, 2026",
    isNew: false,
    downloadable: false,
    kokoros: 178,
  },
  {
    id: 12,
    thumb:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=340&q=80",
    title: "Late Night Thoughts",
    price: 3.99,
    type: "audio",
    duration: "18:45",
    date: "Jan 28, 2026",
    isNew: false,
    downloadable: true,
    kokoros: 143,
  },
];
