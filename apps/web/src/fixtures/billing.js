export const transactions = [
  {
    id: 2,
    when: "Apr 18 · 11:02 AM",
    kind: "Subscription",
    who: "Gold Petal · @lunabloom",
    amount: -19.99,
    direction: "out",
    status: "Settled",
    icon: "sub",
  },
  {
    id: 3,
    when: "Apr 18 · 9:48 AM",
    kind: "PPV Unlock",
    who: "Cherry Blossom set",
    amount: -15,
    direction: "out",
    status: "Settled",
    icon: "ppv",
  },
  {
    id: 4,
    when: "Apr 17 · 11:31 PM",
    kind: "Love sent",
    who: "Mika Rose",
    amount: -12,
    direction: "out",
    status: "Settled",
    icon: "love",
  },
  {
    id: 6,
    when: "Apr 17 · 4:02 PM",
    kind: "Shop Purchase",
    who: "Sakura Sticker Pack",
    amount: -12,
    direction: "out",
    status: "Settled",
    icon: "shop",
  },
  {
    id: 7,
    when: "Apr 17 · 10:12 AM",
    kind: "Session Payment",
    who: "1-on-1 Video Call · @soranyx",
    amount: -60,
    direction: "out",
    status: "Settled",
    icon: "session",
  },
  {
    id: 12,
    when: "Apr 15 · 6:18 PM",
    kind: "Subscription",
    who: "Star Petal · @airivale",
    amount: -29.99,
    direction: "out",
    status: "Settled",
    icon: "sub",
  },
  {
    id: 13,
    when: "Apr 14 · 3:25 PM",
    kind: "Live Love",
    who: "Airi Vale stream",
    amount: -8,
    direction: "out",
    status: "Settled",
    icon: "love",
  },
];

export const activeSubscriptions = [
  {
    id: 1,
    creator: "Luna Bloom",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    tier: "Gold Petal",
    price: 19.99,
    renews: "May 12",
    autoRenew: true,
  },
  {
    id: 2,
    creator: "Airi Vale",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
    tier: "Star Petal",
    price: 29.99,
    renews: "May 08",
    autoRenew: true,
  },
  {
    id: 3,
    creator: "Sora Nyx",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    tier: "Silver Petal",
    price: 9.99,
    renews: "Apr 28",
    autoRenew: false,
  },
  {
    id: 4,
    creator: "Mika Rose",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    tier: "Gold Petal",
    price: 19.99,
    renews: "May 02",
    autoRenew: true,
  },
];

export const paymentMethods = [
  {
    id: 1,
    type: "Visa",
    last4: "8421",
    expires: "09/28",
    isDefault: true,
    brand: "visa",
  },
  {
    id: 2,
    type: "Mastercard",
    last4: "3347",
    expires: "12/27",
    isDefault: false,
    brand: "mc",
  },
  {
    id: 3,
    type: "PayPal",
    last4: "you@example.com",
    expires: "Linked",
    isDefault: false,
    brand: "paypal",
  },
];

export const loveHistory = [
  {
    id: 1,
    who: "HoneyBee_22",
    avatar:
      "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=150&q=80",
    amount: 25,
    when: "Apr 18",
    direction: "received",
  },
  {
    id: 2,
    who: "Mika Rose",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    amount: 12,
    when: "Apr 17",
    direction: "sent",
  },
  {
    id: 3,
    who: "mochi_kun",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    amount: 50,
    when: "Apr 16",
    direction: "received",
  },
  {
    id: 4,
    who: "Airi Vale",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
    amount: 8,
    when: "Apr 14",
    direction: "sent",
  },
  {
    id: 5,
    who: "rainySoul",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    amount: 35,
    when: "Apr 13",
    direction: "received",
  },
  {
    id: 6,
    who: "Sora Nyx",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    amount: 20,
    when: "Apr 12",
    direction: "sent",
  },
];
