import { useState, useMemo } from "react";

/* ─── Colors ─────────────────────────────────────────────────────────── */

const SAKURA_DEEP = "#df5f97";
const INK = "#241a22";
const INK_SOFT = "#5b4153";
const INK_MUTED = "#8c6d7f";
const INK_FAINT = "#b89aa8";
const HEART_RED = "#e8384f";
const GOLD = "#f5b63b";
const MINT = "#7cc4a8";
const LAVENDER = "#b79cd9";

/* ─── Mock Data ──────────────────────────────────────────────────────── */

const WALLET = {
  available: 2140.86,
  pending: 318.42,
  held: 62.00,
  lifetime_earned: 58214.09,
  lifetime_spent: 4820.44,
  currency: "USD",
};

const transactions = [
  { id: 1, when: "Apr 18 · 2:14 PM", kind: "Love received", who: "HoneyBee_22", amount: 25.00, direction: "in", status: "Settled", icon: "love" },
  { id: 2, when: "Apr 18 · 11:02 AM", kind: "Subscription", who: "Gold Petal · @lunabloom", amount: -19.99, direction: "out", status: "Settled", icon: "sub" },
  { id: 3, when: "Apr 18 · 9:48 AM", kind: "PPV Unlock", who: "Cherry Blossom set", amount: -15.00, direction: "out", status: "Settled", icon: "ppv" },
  { id: 4, when: "Apr 17 · 11:31 PM", kind: "Love sent", who: "Mika Rose", amount: -12.00, direction: "out", status: "Settled", icon: "love" },
  { id: 5, when: "Apr 17 · 8:15 PM", kind: "Deposit", who: "Visa ****8421", amount: 100.00, direction: "in", status: "Settled", icon: "deposit" },
  { id: 6, when: "Apr 17 · 4:02 PM", kind: "Shop Purchase", who: "Sakura Sticker Pack", amount: -12.00, direction: "out", status: "Settled", icon: "shop" },
  { id: 7, when: "Apr 17 · 10:12 AM", kind: "Session Payment", who: "1-on-1 Video Call · @soranyx", amount: -60.00, direction: "out", status: "Settled", icon: "session" },
  { id: 8, when: "Apr 16 · 9:47 PM", kind: "Withdrawal", who: "ACH · ****4210", amount: -500.00, direction: "out", status: "Completed", icon: "withdraw" },
  { id: 9, when: "Apr 16 · 4:12 PM", kind: "Love received", who: "mochi_kun", amount: 50.00, direction: "in", status: "Settled", icon: "love" },
  { id: 10, when: "Apr 16 · 1:30 PM", kind: "Referral bonus", who: "peachfuzz joined via your link", amount: 8.99, direction: "in", status: "Settled", icon: "referral" },
  { id: 11, when: "Apr 15 · 10:00 PM", kind: "Gift card redeemed", who: "Code: SAKURA50", amount: 50.00, direction: "in", status: "Settled", icon: "gift" },
  { id: 12, when: "Apr 15 · 6:18 PM", kind: "Subscription", who: "Star Petal · @airivale", amount: -29.99, direction: "out", status: "Settled", icon: "sub" },
  { id: 13, when: "Apr 14 · 3:25 PM", kind: "Live Love", who: "Airi Vale stream", amount: -8.00, direction: "out", status: "Settled", icon: "love" },
  { id: 14, when: "Apr 14 · 11:00 AM", kind: "Deposit", who: "PayPal · you@email.com", amount: 200.00, direction: "in", status: "Settled", icon: "deposit" },
];

const activeSubscriptions = [
  { id: 1, creator: "Luna Bloom", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", tier: "Gold Petal", price: 19.99, renews: "May 12", autoRenew: true },
  { id: 2, creator: "Airi Vale", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80", tier: "Star Petal", price: 29.99, renews: "May 08", autoRenew: true },
  { id: 3, creator: "Sora Nyx", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80", tier: "Silver Petal", price: 9.99, renews: "Apr 28", autoRenew: false },
  { id: 4, creator: "Mika Rose", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", tier: "Gold Petal", price: 19.99, renews: "May 02", autoRenew: true },
];

const paymentMethods = [
  { id: 1, type: "Visa", last4: "8421", expires: "09/28", isDefault: true, brand: "visa" },
  { id: 2, type: "Mastercard", last4: "3347", expires: "12/27", isDefault: false, brand: "mc" },
  { id: 3, type: "PayPal", last4: "you@email.com", expires: "Linked", isDefault: false, brand: "paypal" },
];

const withdrawMethods = [
  { id: 1, type: "ACH Bank Transfer", detail: "Chase · ****4210", isDefault: true, fee: "Free", speed: "1–3 days" },
  { id: 2, type: "Wire Transfer", detail: "Int'l · ****8831", isDefault: false, fee: "$25", speed: "1–5 days" },
  { id: 3, type: "PayPal", detail: "you@email.com", isDefault: false, fee: "1%", speed: "Instant" },
  { id: 4, type: "Crypto (USDC)", detail: "0x7f...A20a", isDefault: false, fee: "Gas fee", speed: "~5 min" },
];

const loveHistory = [
  { id: 1, who: "HoneyBee_22", avatar: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=150&q=80", amount: 25, when: "Apr 18", direction: "received" },
  { id: 2, who: "Mika Rose", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", amount: 12, when: "Apr 17", direction: "sent" },
  { id: 3, who: "mochi_kun", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", amount: 50, when: "Apr 16", direction: "received" },
  { id: 4, who: "Airi Vale", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80", amount: 8, when: "Apr 14", direction: "sent" },
  { id: 5, who: "rainySoul", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", amount: 35, when: "Apr 13", direction: "received" },
  { id: 6, who: "Sora Nyx", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80", amount: 20, when: "Apr 12", direction: "sent" },
];

const referralEarnings = [
  { id: 1, fan: "peachfuzz", action: "Subscribed via your link", earned: 8.99, when: "Apr 16" },
  { id: 2, fan: "night_owl_88", action: "Purchased PPV via your link", earned: 3.00, when: "Apr 12" },
  { id: 3, fan: "doki_dreamer", action: "Subscribed via your link", earned: 4.99, when: "Apr 08" },
  { id: 4, fan: "sunKissed", action: "Subscribed via your link", earned: 9.99, when: "Apr 02" },
];

const spendingChart = [18, 32, 24, 45, 38, 52, 28, 64, 42, 35, 58, 72, 48, 62, 55, 84, 38, 92, 68, 46, 78, 56, 88, 94, 72, 62, 48, 82, 96, 108];

/* ─── Helpers ────────────────────────────────────────────────────────── */

const money = (n) => `$${Math.abs(Number(n)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ─── Pumdoki Logo ───────────────────────────────────────────────────── */

function PumdokiLogo() {
  return (
    <svg viewBox="0 0 520 120" className="h-9 w-auto" aria-label="Pumdoki">
      <defs>
        <linearGradient id="walletHeartBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff7fa" />
          <stop offset="48%" stopColor="#ffd8e5" />
          <stop offset="100%" stopColor="#f3a0bc" />
        </linearGradient>
        <linearGradient id="walletWordFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd1e0" />
          <stop offset="55%" stopColor="#f8b3ca" />
          <stop offset="100%" stopColor="#ef8fb1" />
        </linearGradient>
      </defs>
      <g transform="translate(4,6)">
        <path d="M52 66c-4-3-7-6-9-8C27 43 18 33 18 20 18 9 26 0 37 0c7 0 13 3 17 10 5-7 11-10 18-10 11 0 19 9 19 20 0 13-10 23-27 38l-9 8-5 5-5-5Z" fill="url(#walletHeartBase)" stroke="#111" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M29 40h13c3 0 4-2 6-5l4-10 6 25 5-13c2-4 4-5 6-5h9" fill="none" stroke="#eb6f97" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="110" y="75" fontSize="60" fontWeight="700" fill="#fff7fa" stroke="#111" strokeWidth="3.2" paintOrder="stroke" letterSpacing="0.5">Pumdoki</text>
      <text x="110" y="75" fontSize="60" fontWeight="700" fill="url(#walletWordFill)" letterSpacing="0.5">Pumdoki</text>
    </svg>
  );
}

/* ─── Shared UI ──────────────────────────────────────────────────────── */

function Pill({ children, tone = "pink" }) {
  const tones = {
    pink: "bg-pink-50 text-[#df5f97] ring-pink-100",
    green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    red: "bg-red-50 text-red-500 ring-red-100",
    gold: "bg-amber-50 text-amber-600 ring-amber-100",
    lav: "bg-purple-50 text-purple-500 ring-purple-100",
    gray: "bg-zinc-50 text-zinc-500 ring-zinc-100",
    mint: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${tones[tone] || tones.pink}`}>{children}</span>;
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange && onChange(!checked)}
      className={`inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-[#df5f97]" : "bg-pink-100"}`}
      aria-label={label}
      aria-pressed={checked}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function StatCard({ label, value, sub, icon, accent = SAKURA_DEEP }) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">{label}</div>
          <div className="mt-1.5 text-2xl font-bold text-[#241a22]">{value}</div>
          {sub && <div className="mt-1 text-xs text-[#8c6d7f]">{sub}</div>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}20`, color: accent }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ─── Spend Mini Chart ───────────────────────────────────────────────── */

function SpendChart({ data }) {
  const W = 600, H = 140, P = 8;
  const max = Math.max(...data);
  const bw = (W - P * 2) / data.length - 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[140px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id="walletBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#f9a8c8" />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const h = ((v / max) * (H - P * 2));
        const x = P + i * ((W - P * 2) / data.length) + 1;
        const y = H - P - h;
        return <rect key={i} x={x} y={y} width={bw} height={h} rx={bw / 2} fill="url(#walletBarGrad)" />;
      })}
    </svg>
  );
}

/* ─── Transaction Icon ───────────────────────────────────────────────── */

function TxIcon({ type }) {
  const icons = {
    love: <><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 10h8" /></>,
    sub: <><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>,
    ppv: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>,
    deposit: <><path d="M12 3v12M5 10l7 7 7-7" /><path d="M5 21h14" /></>,
    withdraw: <><path d="M12 21V9M5 14l7-7 7 7" /><path d="M5 3h14" /></>,
    shop: <><path d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z" /><path d="M3 7h18" /><path d="M16 11a4 4 0 01-8 0" /></>,
    session: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    referral: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><path d="M7 7h.01" /></>,
    gift: <><path d="M20 12v10H4V12M2 7h20v5H2z" /><path d="M12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></>,
  };
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-[#df5f97]">
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icons[type] || icons.deposit}
      </svg>
    </div>
  );
}

/* ─── Section Components ─────────────────────────────────────────────── */

const NAV_SECTIONS = [
  { id: "overview", label: "Overview", icon: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>) },
  { id: "transactions", label: "Transactions", icon: (<><path d="M12 2v20M2 12h20" /><path d="M17 7l5 5-5 5M7 17l-5-5 5-5" /></>) },
  { id: "add_funds", label: "Add Funds", icon: (<><path d="M12 3v12M5 10l7 7 7-7" /><path d="M5 21h14" /></>) },
  { id: "withdraw", label: "Withdraw", icon: (<><path d="M12 21V9M5 14l7-7 7 7" /><path d="M5 3h14" /></>) },
  { id: "subscriptions", label: "Subscriptions", icon: (<><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>) },
  { id: "send_love", label: "Send Love", icon: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 10h8" /></>) },
  { id: "payment_methods", label: "Payment Methods", icon: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h2" /></>) },
  { id: "referrals", label: "Referral Earnings", icon: (<><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><path d="M7 7h.01" /></>) },
  { id: "settings", label: "Wallet Settings", icon: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6 1.65 1.65 0 0010 3.09V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0A1.65 1.65 0 0021 10h0a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>) },
];

/* ─── Overview ───────────────────────────────────────────────────────── */

function OverviewSection({ go }) {
  return (
    <>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold text-[#241a22]">Wallet</h2>
        <p className="mt-1 text-sm text-[#8c6d7f]">Your Pumdoki balance, spending, and funds at a glance.</p>
      </div>

      {/* Balance hero */}
      <div className="rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 via-white to-pink-50/40 p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#df5f97]">Available balance</div>
            <div className="mt-1 text-4xl font-extrabold text-[#241a22]">{money(WALLET.available)}</div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => go("add_funds")} className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">Add funds</button>
              <button onClick={() => go("withdraw")} className="rounded-xl border border-pink-200 bg-white px-4 py-2 text-sm font-semibold text-[#df5f97] transition hover:bg-pink-50">Withdraw</button>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">Pending</div>
            <div className="mt-1 text-xl font-bold text-[#241a22]">{money(WALLET.pending)}</div>
            <div className="text-xs text-[#8c6d7f]">Clearing in 1–3 days</div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">Held</div>
            <div className="mt-1 text-xl font-bold text-[#241a22]">{money(WALLET.held)}</div>
            <div className="text-xs text-[#8c6d7f]">Dispute / chargeback hold</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lifetime earned" value={money(WALLET.lifetime_earned)} icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M5 9h10a3 3 0 010 6H7" /></svg>} />
        <StatCard label="Lifetime spent" value={money(WALLET.lifetime_spent)} icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z" /></svg>} accent={LAVENDER} />
        <StatCard label="Active subs" value={String(activeSubscriptions.length)} sub={money(activeSubscriptions.reduce((s, x) => s + x.price, 0)) + "/mo"} icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>} accent={MINT} />
        <StatCard label="Referral earned" value={money(referralEarnings.reduce((s, x) => s + x.earned, 0))} sub={`${referralEarnings.length} referrals`} icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><path d="M7 7h.01" /></svg>} accent={GOLD} />
      </div>

      {/* Spending chart + recent */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#241a22]">Spending — last 30 days</h3>
              <p className="text-xs text-[#8c6d7f]">Subscriptions, PPV, love sent, sessions, shop</p>
            </div>
            <div className="flex gap-1.5 rounded-xl bg-pink-50 p-1">
              {["7D", "30D", "90D"].map((p, i) => (
                <button key={p} className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${i === 1 ? "bg-white text-[#df5f97] shadow-sm" : "text-[#8c6d7f] hover:text-[#df5f97]"}`}>{p}</button>
              ))}
            </div>
          </div>
          <SpendChart data={spendingChart} />
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#241a22]">Recent activity</h3>
            <button onClick={() => go("transactions")} className="text-xs font-semibold text-[#df5f97] hover:underline">View all</button>
          </div>
          <ul className="space-y-2.5">
            {transactions.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <TxIcon type={t.icon} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[#241a22]">{t.kind}</div>
                  <div className="truncate text-[11px] text-[#8c6d7f]">{t.who}</div>
                </div>
                <div className={`text-sm font-bold tabular-nums ${t.direction === "in" ? "text-emerald-600" : "text-[#241a22]"}`}>
                  {t.direction === "in" ? "+" : "−"}{money(t.amount)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Send Love", sub: "Support a creator", s: "send_love", i: "M12 2v20M5 9h10a3 3 0 010 6H7" },
          { l: "Redeem gift card", sub: "Enter promo code", s: "add_funds", i: "M20 12v10H4V12M2 7h20v5H2z" },
          { l: "Manage subs", sub: "Auto-renew & tiers", s: "subscriptions", i: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" },
          { l: "Download statement", sub: "Tax & records", s: "settings", i: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" },
        ].map((a) => (
          <button key={a.l} onClick={() => go(a.s)} className="flex items-center gap-3 rounded-xl bg-white p-3 text-left ring-1 ring-pink-100 transition hover:ring-pink-300 hover:bg-pink-50/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 text-[#df5f97]">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={a.i} /></svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[#241a22]">{a.l}</div>
              <div className="text-xs text-[#8c6d7f]">{a.sub}</div>
            </div>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#b89aa8]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        ))}
      </div>
    </>
  );
}

/* ─── Transactions ───────────────────────────────────────────────────── */

function TransactionsSection() {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filter === "Incoming" && t.direction !== "in") return false;
      if (filter === "Outgoing" && t.direction !== "out") return false;
      if (q && !t.kind.toLowerCase().includes(q.toLowerCase()) && !t.who.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [filter, q]);

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[22px] font-bold text-[#241a22]">Transaction History</h2>
          <p className="mt-1 text-sm text-[#8c6d7f]">Every deposit, withdrawal, subscription, purchase, and love transaction.</p>
        </div>
        <button className="rounded-xl border border-pink-200 bg-white px-3.5 py-2 text-sm font-semibold text-[#df5f97] transition hover:bg-pink-50">Export CSV</button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b89aa8]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transactions…" className="w-full rounded-xl border border-pink-100 bg-[#fffafc] py-2 pl-9 pr-3 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300" />
        </div>
        <div className="flex gap-1.5 rounded-xl bg-pink-50 p-1">
          {["All", "Incoming", "Outgoing"].map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filter === t ? "bg-white text-[#df5f97] shadow-sm" : "text-[#8c6d7f] hover:text-[#df5f97]"}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-pink-50/40 text-[11px] uppercase tracking-wider text-[#b89aa8] sticky top-0">
              <tr>
                <th className="px-5 py-2.5 text-left font-semibold">Date</th>
                <th className="px-5 py-2.5 text-left font-semibold">Type</th>
                <th className="px-5 py-2.5 text-left font-semibold">Details</th>
                <th className="px-5 py-2.5 text-right font-semibold">Amount</th>
                <th className="px-5 py-2.5 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-pink-50/30">
                  <td className="whitespace-nowrap px-5 py-3.5 text-[#8c6d7f]">{t.when}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <TxIcon type={t.icon} />
                      <span className="font-semibold text-[#241a22]">{t.kind}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#5b4153]">{t.who}</td>
                  <td className={`whitespace-nowrap px-5 py-3.5 text-right font-bold tabular-nums ${t.direction === "in" ? "text-emerald-600" : "text-[#241a22]"}`}>
                    {t.direction === "in" ? "+" : "−"}{money(t.amount)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <Pill tone={t.status === "Settled" || t.status === "Completed" ? "green" : "gold"}>{t.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ─── Add Funds ──────────────────────────────────────────────────────── */

function AddFundsSection() {
  const [amount, setAmount] = useState("50.00");
  const [method, setMethod] = useState(1);

  return (
    <>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold text-[#241a22]">Add Funds</h2>
        <p className="mt-1 text-sm text-[#8c6d7f]">Top up your Pumdoki wallet to unlock content, subscribe, and send love.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">Choose amount</h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {["10.00", "25.00", "50.00", "100.00", "200.00", "500.00"].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className={`rounded-xl py-2.5 text-sm font-bold transition ${amount === v ? "bg-[#df5f97] text-white shadow-sm" : "bg-pink-50 text-[#5b4153] hover:bg-pink-100"}`}
              >
                ${v.replace(".00", "")}
              </button>
            ))}
            <label className="col-span-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c6d7f] font-semibold">$</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-pink-200 bg-[#fffafc] py-2.5 pl-7 pr-3 text-sm font-bold outline-none tabular-nums focus:border-pink-300"
                placeholder="Custom"
              />
            </label>
          </div>

          <h3 className="mb-3 text-base font-bold text-[#241a22]">Payment method</h3>
          <div className="space-y-2">
            {paymentMethods.map((pm) => (
              <label
                key={pm.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${method === pm.id ? "border-[#df5f97] bg-pink-50/60 ring-1 ring-[#df5f97]" : "border-pink-100 bg-white hover:border-pink-200"}`}
              >
                <input type="radio" name="payment" checked={method === pm.id} onChange={() => setMethod(pm.id)} className="sr-only" />
                <div className={`flex h-8 w-12 items-center justify-center rounded-lg text-xs font-bold ${pm.brand === "visa" ? "bg-blue-50 text-blue-600" : pm.brand === "mc" ? "bg-orange-50 text-orange-600" : "bg-sky-50 text-sky-600"}`}>
                  {pm.type === "PayPal" ? "PP" : pm.type.slice(0, 4)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#241a22]">{pm.type}</div>
                  <div className="text-xs text-[#8c6d7f]">{pm.type === "PayPal" ? pm.last4 : `···· ${pm.last4} · Exp ${pm.expires}`}</div>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 ${method === pm.id ? "border-[#df5f97] bg-[#df5f97]" : "border-pink-200"}`}>
                  {method === pm.id && <div className="mx-auto mt-0.5 h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </label>
            ))}
            <button className="w-full rounded-xl border border-dashed border-pink-200 py-2.5 text-sm font-semibold text-[#df5f97] hover:bg-pink-50">+ Add new card or PayPal</button>
          </div>

          <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] py-3 text-base font-bold text-white shadow-sm transition hover:brightness-110">
            Add {money(parseFloat(amount) || 0)} to wallet
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-bold text-[#241a22]">Redeem gift card or promo code</h3>
            <div className="flex gap-2">
              <input placeholder="Enter code e.g. SAKURA50" className="flex-1 rounded-xl border border-pink-100 bg-[#fffafc] px-3 py-2.5 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300" />
              <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">Redeem</button>
            </div>
          </div>

          <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-bold text-[#241a22]">Auto-reload</h3>
            <p className="text-sm text-[#5b4153]">Automatically top up your wallet when your balance drops below a set threshold.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">When balance falls below</label>
                <div className="flex items-center rounded-xl border border-pink-100 bg-[#fffafc]">
                  <span className="pl-3 text-[#8c6d7f]">$</span>
                  <input defaultValue="10" className="w-full bg-transparent py-2 pr-3 text-sm font-semibold outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">Reload amount</label>
                <div className="flex items-center rounded-xl border border-pink-100 bg-[#fffafc]">
                  <span className="pl-3 text-[#8c6d7f]">$</span>
                  <input defaultValue="50" className="w-full bg-transparent py-2 pr-3 text-sm font-semibold outline-none" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#5b4153]">Enable auto-reload</span>
              <Toggle checked={false} onChange={() => {}} label="Auto-reload" />
            </div>
          </div>

          <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <h3 className="mb-2 text-base font-bold text-[#241a22]">Crypto deposit</h3>
            <p className="text-sm text-[#5b4153] mb-3">Deposit USDC on Ethereum or Solana directly to your wallet.</p>
            <div className="rounded-xl bg-pink-50 p-3 text-center">
              <div className="mx-auto mb-2 h-24 w-24 rounded-xl bg-white p-2 ring-1 ring-pink-100">
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-pink-50 text-xs font-bold text-[#df5f97]">QR Code</div>
              </div>
              <code className="text-xs text-[#5b4153] font-semibold break-all">0x7f3a...A20a</code>
              <button className="mt-2 block mx-auto rounded-lg bg-white px-3 py-1 text-xs font-semibold text-[#df5f97] ring-1 ring-pink-200 hover:bg-pink-50">Copy address</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Withdraw ───────────────────────────────────────────────────────── */

function WithdrawSection() {
  const [amount, setAmount] = useState(String(WALLET.available));
  const [method, setMethod] = useState(1);

  return (
    <>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold text-[#241a22]">Withdraw Funds</h2>
        <p className="mt-1 text-sm text-[#8c6d7f]">Cash out your available balance to your preferred payout method.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <div className="mb-5 rounded-xl bg-gradient-to-r from-pink-50 to-white p-4 ring-1 ring-pink-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#df5f97]">Available to withdraw</div>
            <div className="mt-1 text-3xl font-extrabold text-[#241a22]">{money(WALLET.available)}</div>
            <div className="text-xs text-[#8c6d7f]">Minimum withdrawal: $20 · Platform fee: 0%</div>
          </div>

          <h3 className="mb-3 text-base font-bold text-[#241a22]">Amount</h3>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c6d7f] font-semibold">$</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-pink-200 bg-[#fffafc] py-2.5 pl-7 pr-3 text-sm font-bold outline-none tabular-nums focus:border-pink-300"
              />
            </div>
            <button onClick={() => setAmount(String(WALLET.available))} className="rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#df5f97] hover:bg-pink-50">Withdraw all</button>
          </div>

          <h3 className="mb-3 text-base font-bold text-[#241a22]">Payout method</h3>
          <div className="space-y-2">
            {withdrawMethods.map((wm) => (
              <label
                key={wm.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${method === wm.id ? "border-[#df5f97] bg-pink-50/60 ring-1 ring-[#df5f97]" : "border-pink-100 bg-white hover:border-pink-200"}`}
              >
                <input type="radio" name="withdraw" checked={method === wm.id} onChange={() => setMethod(wm.id)} className="sr-only" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#241a22]">{wm.type}</div>
                  <div className="text-xs text-[#8c6d7f]">{wm.detail}</div>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#8c6d7f]">
                  <span>Fee: {wm.fee}</span>
                  <span>·</span>
                  <span>{wm.speed}</span>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 ${method === wm.id ? "border-[#df5f97] bg-[#df5f97]" : "border-pink-200"}`}>
                  {method === wm.id && <div className="mx-auto mt-0.5 h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </label>
            ))}
            <button className="w-full rounded-xl border border-dashed border-pink-200 py-2.5 text-sm font-semibold text-[#df5f97] hover:bg-pink-50">+ Add payout method</button>
          </div>

          <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] py-3 text-base font-bold text-white shadow-sm transition hover:brightness-110">
            Withdraw {money(parseFloat(amount) || 0)}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-pink-50 px-5 py-3.5">
              <h3 className="text-base font-bold text-[#241a22]">Payout schedule</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5b4153]">Schedule</span>
                <select className="rounded-xl border border-pink-100 bg-[#fffafc] px-3 py-1.5 text-sm outline-none focus:border-pink-300">
                  <option>Monthly (1st of month)</option>
                  <option>Bi-weekly</option>
                  <option>Weekly</option>
                  <option>Manual only</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5b4153]">Minimum auto-payout</span>
                <div className="flex items-center rounded-xl border border-pink-100 bg-[#fffafc] w-24">
                  <span className="pl-2 text-[#8c6d7f]">$</span>
                  <input defaultValue="100" className="w-full bg-transparent py-1.5 pr-2 text-sm font-semibold outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5b4153]">Next auto-payout</span>
                <span className="text-sm font-semibold text-[#241a22]">May 01, 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5b4153]">Instant cashout</span>
                <Toggle checked={false} onChange={() => {}} label="Instant cashout" />
              </div>
              <p className="text-xs text-[#8c6d7f]">Instant cashout delivers within 30 minutes for an additional 1.5% fee.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-pink-50 px-5 py-3.5">
              <h3 className="text-base font-bold text-[#241a22]">Recent withdrawals</h3>
            </div>
            <ul className="divide-y divide-pink-50">
              {[
                { when: "Apr 01", amount: 8420.14, to: "ACH ****4210", status: "Paid" },
                { when: "Mar 01", amount: 7104.80, to: "ACH ****4210", status: "Paid" },
                { when: "Feb 01", amount: 5894.22, to: "ACH ****4210", status: "Paid" },
              ].map((p, i) => (
                <li key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <div className="text-sm font-semibold text-[#241a22]">{p.when}</div>
                    <div className="text-xs text-[#8c6d7f]">{p.to}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold tabular-nums text-[#241a22]">{money(p.amount)}</span>
                    <Pill tone="green">{p.status}</Pill>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Subscriptions ──────────────────────────────────────────────────── */

function SubscriptionsSection() {
  return (
    <>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold text-[#241a22]">My Subscriptions</h2>
        <p className="mt-1 text-sm text-[#8c6d7f]">Manage your active subscriptions, toggle auto-renew, and view spending.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        <StatCard label="Active subs" value={String(activeSubscriptions.length)} icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>} />
        <StatCard label="Monthly spend" value={money(activeSubscriptions.reduce((s, x) => s + x.price, 0))} icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M5 9h10a3 3 0 010 6H7" /></svg>} accent={LAVENDER} />
        <StatCard label="Next renewal" value="Apr 28" sub="Sora Nyx · Silver" icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>} accent={GOLD} />
      </div>

      <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-pink-50 px-5 py-3.5">
          <h3 className="text-base font-bold text-[#241a22]">Active subscriptions</h3>
        </div>
        <ul className="divide-y divide-pink-50">
          {activeSubscriptions.map((sub) => (
            <li key={sub.id} className="flex items-center gap-4 px-5 py-4">
              <img src={sub.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-pink-100" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#241a22]">{sub.creator}</span>
                  <Pill tone="pink">{sub.tier}</Pill>
                </div>
                <div className="mt-0.5 text-xs text-[#8c6d7f]">Renews {sub.renews} · {money(sub.price)}/mo</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-bold text-[#241a22]">{money(sub.price)}</div>
                  <div className="text-[10px] text-[#8c6d7f]">per month</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Toggle checked={sub.autoRenew} onChange={() => {}} label={`Auto-renew ${sub.creator}`} />
                  <span className="text-[10px] font-semibold text-[#8c6d7f]">{sub.autoRenew ? "Auto" : "Manual"}</span>
                </div>
                <button className="rounded-lg p-2 text-[#b89aa8] transition hover:bg-pink-50 hover:text-[#df5f97]">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#241a22]">Subscription spending limit</h3>
        <p className="mt-1 text-sm text-[#5b4153]">Set a monthly cap so subscriptions don't exceed your budget.</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-pink-100 bg-[#fffafc] w-32">
            <span className="pl-3 text-[#8c6d7f]">$</span>
            <input defaultValue="150" className="w-full bg-transparent py-2 pr-3 text-sm font-semibold outline-none" />
          </div>
          <span className="text-sm text-[#8c6d7f]">per month</span>
          <Toggle checked onChange={() => {}} label="Spending limit" />
        </div>
      </div>
    </>
  );
}

/* ─── Send Love ──────────────────────────────────────────────────────── */

function SendLoveSection() {
  return (
    <>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold text-[#241a22]">Send Love</h2>
        <p className="mt-1 text-sm text-[#8c6d7f]">Support your favourite creators with monetary love — directly from your wallet.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">Send love to a creator</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">Creator</label>
              <input placeholder="@username or search…" className="w-full rounded-xl border border-pink-100 bg-[#fffafc] px-3 py-2.5 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">Amount</label>
              <div className="flex gap-2">
                {[5, 10, 25, 50, 100].map((v) => (
                  <button key={v} className="flex-1 rounded-xl bg-pink-50 py-2.5 text-sm font-bold text-[#5b4153] transition hover:bg-[#df5f97] hover:text-white">${v}</button>
                ))}
              </div>
              <div className="mt-2 flex items-center rounded-xl border border-pink-100 bg-[#fffafc]">
                <span className="pl-3 text-[#8c6d7f] font-semibold">$</span>
                <input defaultValue="25.00" className="w-full bg-transparent py-2.5 pr-3 text-sm font-bold outline-none tabular-nums" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">Message (optional)</label>
              <textarea rows={3} className="w-full resize-none rounded-xl border border-pink-100 bg-[#fffafc] p-3 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300" placeholder="You're amazing, keep creating! 🌸" />
            </div>
            <button className="w-full rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] py-3 text-base font-bold text-white shadow-sm transition hover:brightness-110">
              <span className="inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 10h8" /></svg>
                Send $25.00 Love
              </span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-pink-50 px-5 py-3.5">
            <h3 className="text-base font-bold text-[#241a22]">Love history</h3>
          </div>
          <ul className="divide-y divide-pink-50 max-h-[420px] overflow-auto">
            {loveHistory.map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-5 py-3.5">
                <img src={l.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-pink-100" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#241a22]">{l.who}</span>
                    <Pill tone={l.direction === "received" ? "green" : "pink"}>{l.direction === "received" ? "Received" : "Sent"}</Pill>
                  </div>
                  <div className="text-xs text-[#8c6d7f]">{l.when}</div>
                </div>
                <span className={`text-sm font-bold tabular-nums ${l.direction === "received" ? "text-emerald-600" : "text-[#241a22]"}`}>
                  {l.direction === "received" ? "+" : "−"}{money(l.amount)}
                </span>
              </li>
            ))}
          </ul>
          <div className="bg-pink-50/40 px-5 py-3 text-center">
            <div className="text-xs text-[#8c6d7f]">
              Total love received: <span className="font-bold text-emerald-600">+{money(loveHistory.filter((l) => l.direction === "received").reduce((s, l) => s + l.amount, 0))}</span>
              <span className="mx-2">·</span>
              Total love sent: <span className="font-bold text-[#241a22]">−{money(loveHistory.filter((l) => l.direction === "sent").reduce((s, l) => s + l.amount, 0))}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Payment Methods ────────────────────────────────────────────────── */

function PaymentMethodsSection() {
  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[22px] font-bold text-[#241a22]">Payment Methods</h2>
          <p className="mt-1 text-sm text-[#8c6d7f]">Manage your cards, PayPal, and crypto for deposits and purchases.</p>
        </div>
        <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">+ Add method</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paymentMethods.map((pm) => (
          <div key={pm.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${pm.isDefault ? "border-[#df5f97] ring-1 ring-[#df5f97]" : "border-pink-100"}`}>
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-16 items-center justify-center rounded-lg text-sm font-bold ${pm.brand === "visa" ? "bg-blue-50 text-blue-600" : pm.brand === "mc" ? "bg-orange-50 text-orange-600" : "bg-sky-50 text-sky-600"}`}>
                {pm.type === "PayPal" ? "PayPal" : pm.type}
              </div>
              {pm.isDefault && <Pill tone="pink">Default</Pill>}
            </div>
            <div className="mt-3">
              <div className="text-lg font-bold text-[#241a22] tracking-widest">{pm.type === "PayPal" ? pm.last4 : `···· ···· ···· ${pm.last4}`}</div>
              <div className="mt-1 text-xs text-[#8c6d7f]">{pm.type === "PayPal" ? "Linked account" : `Expires ${pm.expires}`}</div>
            </div>
            <div className="mt-4 flex gap-2">
              {!pm.isDefault && <button className="flex-1 rounded-xl border border-pink-200 bg-white py-2 text-xs font-semibold text-[#df5f97] transition hover:bg-pink-50">Set as default</button>}
              <button className="flex-1 rounded-xl border border-pink-200 bg-white py-2 text-xs font-semibold text-[#5b4153] transition hover:bg-pink-50">Edit</button>
              <button className="rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-base font-bold text-[#241a22]">Payout methods (for withdrawals)</h3>
        <div className="space-y-2">
          {withdrawMethods.map((wm) => (
            <div key={wm.id} className={`flex items-center justify-between rounded-xl border p-3 ${wm.isDefault ? "border-[#df5f97] bg-pink-50/40" : "border-pink-100"}`}>
              <div>
                <div className="text-sm font-semibold text-[#241a22]">{wm.type}</div>
                <div className="text-xs text-[#8c6d7f]">{wm.detail} · Fee: {wm.fee} · {wm.speed}</div>
              </div>
              <div className="flex items-center gap-2">
                {wm.isDefault && <Pill tone="green">Default</Pill>}
                <button className="rounded-lg p-1.5 text-[#b89aa8] hover:bg-pink-50 hover:text-[#df5f97]">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Referral Earnings ──────────────────────────────────────────────── */

function ReferralsSection() {
  const totalRef = referralEarnings.reduce((s, x) => s + x.earned, 0);
  return (
    <>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold text-[#241a22]">Referral Earnings</h2>
        <p className="mt-1 text-sm text-[#8c6d7f]">Earn when fans you refer subscribe or make their first purchase.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-5">
        <StatCard label="Total earned" value={money(totalRef)} icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M5 9h10a3 3 0 010 6H7" /></svg>} />
        <StatCard label="Referrals" value={String(referralEarnings.length)} icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>} accent={MINT} />
        <StatCard label="Commission rate" value="10%" icon={<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l10-10M7 7h10v10" /></svg>} accent={GOLD} />
      </div>

      <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-white p-5 shadow-sm mb-5">
        <h3 className="text-base font-bold text-[#241a22]">Your referral link</h3>
        <p className="mt-1 text-sm text-[#5b4153]">Share this link — earn 10% of every referred fan's first subscription.</p>
        <div className="mt-3 flex gap-2">
          <code className="flex-1 rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#df5f97]">pumdoki.app/r/yourpumdoki</code>
          <button className="rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#df5f97] hover:bg-pink-50">Copy</button>
          <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110">Share</button>
        </div>
      </div>

      <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-pink-50 px-5 py-3.5">
          <h3 className="text-base font-bold text-[#241a22]">Referral history</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-pink-50/40 text-[11px] uppercase tracking-wider text-[#b89aa8]">
            <tr>
              <th className="px-5 py-2.5 text-left font-semibold">Fan</th>
              <th className="px-5 py-2.5 text-left font-semibold">Action</th>
              <th className="px-5 py-2.5 text-left font-semibold">Date</th>
              <th className="px-5 py-2.5 text-right font-semibold">Earned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {referralEarnings.map((r) => (
              <tr key={r.id} className="hover:bg-pink-50/30">
                <td className="px-5 py-3 font-semibold text-[#241a22]">{r.fan}</td>
                <td className="px-5 py-3 text-[#5b4153]">{r.action}</td>
                <td className="px-5 py-3 text-[#8c6d7f]">{r.when}</td>
                <td className="px-5 py-3 text-right font-bold text-emerald-600">+{money(r.earned)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── Wallet Settings ────────────────────────────────────────────────── */

function WalletSettingsSection() {
  return (
    <>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold text-[#241a22]">Wallet Settings</h2>
        <p className="mt-1 text-sm text-[#8c6d7f]">Spending limits, privacy, notifications, and tax documents.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">Spending limits</h3>
          <div className="space-y-3">
            {[
              { l: "Daily spending limit", v: "200" },
              { l: "Weekly spending limit", v: "500" },
              { l: "Monthly spending limit", v: "2000" },
            ].map((x) => (
              <div key={x.l} className="flex items-center justify-between">
                <span className="text-sm text-[#5b4153]">{x.l}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-xl border border-pink-100 bg-[#fffafc] w-24">
                    <span className="pl-2 text-[#8c6d7f]">$</span>
                    <input defaultValue={x.v} className="w-full bg-transparent py-1.5 pr-2 text-sm font-semibold outline-none" />
                  </div>
                  <Toggle checked onChange={() => {}} label={x.l} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">Privacy & security</h3>
          <div className="space-y-3">
            {[
              { l: "Require PIN for withdrawals", on: true },
              { l: "Two-factor for large transactions (>$500)", on: true },
              { l: "Hide wallet balance in profile", on: false },
              { l: "Email receipt for every transaction", on: true },
              { l: "Push notification for deposits", on: true },
            ].map((x) => (
              <div key={x.l} className="flex items-center justify-between">
                <span className="text-sm text-[#5b4153]">{x.l}</span>
                <Toggle checked={x.on} onChange={() => {}} label={x.l} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-base font-bold text-[#241a22]">Tax documents</h3>
          <p className="text-sm text-[#5b4153] mb-3">Download year-end tax forms and statements for your records.</p>
          <div className="space-y-2">
            {[
              { l: "2025 Tax Summary (1099-NEC)", ready: true },
              { l: "2025 Annual Statement", ready: true },
              { l: "2026 Tax Summary (in progress)", ready: false },
            ].map((d) => (
              <div key={d.l} className="flex items-center justify-between rounded-xl border border-pink-100 p-3">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#df5f97]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                  <span className="text-sm text-[#241a22]">{d.l}</span>
                </div>
                {d.ready ? (
                  <button className="rounded-lg px-3 py-1 text-xs font-semibold text-[#df5f97] ring-1 ring-pink-200 hover:bg-pink-50">Download PDF</button>
                ) : (
                  <Pill tone="gold">Generating</Pill>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-base font-bold text-[#241a22]">Currency preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5b4153]">Display currency</span>
              <select className="rounded-xl border border-pink-100 bg-[#fffafc] px-3 py-1.5 text-sm outline-none focus:border-pink-300">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>JPY (¥)</option>
                <option>CAD (C$)</option>
                <option>AUD (A$)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5b4153]">Accept crypto payments</span>
              <Toggle checked onChange={() => {}} label="Crypto payments" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5b4153]">Supported crypto</span>
              <div className="flex gap-1">
                {["USDC", "USDT", "ETH", "SOL"].map((c) => (
                  <span key={c} className="rounded-lg bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-[#df5f97]">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/40 p-5">
        <h3 className="text-base font-bold text-red-500">Danger zone</h3>
        <p className="mt-1 text-sm text-[#5b4153]">Freezing your wallet prevents all transactions. Active subscriptions will fail to renew.</p>
        <div className="mt-3">
          <button className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50">Freeze wallet</button>
        </div>
      </div>
    </>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function WalletPage({ onBack, onLogout, onViewProfile, onOpenDashboard }) {
  const [section, setSection] = useState("overview");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const renderSection = () => {
    switch (section) {
      case "transactions": return <TransactionsSection />;
      case "add_funds": return <AddFundsSection />;
      case "withdraw": return <WithdrawSection />;
      case "subscriptions": return <SubscriptionsSection />;
      case "send_love": return <SendLoveSection />;
      case "payment_methods": return <PaymentMethodsSection />;
      case "referrals": return <ReferralsSection />;
      case "settings": return <WalletSettingsSection />;
      default: return <OverviewSection go={setSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8fb] text-[#5b4153]">
      {/* ─── Top Bar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-16 border-b border-pink-100 bg-white/92 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]" aria-label="Back">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <PumdokiLogo />
            <div className="hidden md:flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 ring-1 ring-pink-200">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#df5f97]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
              <span className="text-xs font-semibold text-[#df5f97]">Wallet</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMobileNavOpen((v) => !v)} className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]" aria-label="Menu">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-50 to-white px-3 py-1.5 ring-1 ring-pink-100">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#df5f97]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 10h8" /></svg>
              <span className="text-sm font-bold text-[#241a22]">{money(WALLET.available)}</span>
            </div>
            <div className="relative">
              <button onClick={() => setShowProfileMenu((v) => !v)} className="ml-1 flex h-10 w-10 items-center justify-center" aria-label="Profile">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" alt="" className="h-8 w-8 rounded-full border-2 border-pink-200 object-cover transition hover:border-pink-400" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-pink-100 bg-white py-2 shadow-xl overflow-hidden">
                  <button onClick={() => { onViewProfile && onViewProfile(); setShowProfileMenu(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60 hover:text-[#df5f97]">My Profile</button>
                  <button onClick={() => { onOpenDashboard && onOpenDashboard(); setShowProfileMenu(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60 hover:text-[#df5f97]">Creator Dashboard</button>
                  <button onClick={onBack} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60 hover:text-[#df5f97]">Home</button>
                  <hr className="my-1 border-pink-100" />
                  <button onClick={onLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#e8384f] transition hover:bg-red-50/60">Log out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* ─── Left Nav ──────────────────────────────────────────── */}
        <aside className={`${mobileNavOpen ? "block absolute inset-y-16 left-0 z-30" : "hidden"} md:block md:relative md:inset-auto w-[240px] shrink-0 border-r border-pink-100 bg-white`}>
          <div className="sticky top-16 p-4">
            <div className="rounded-2xl bg-gradient-to-br from-pink-50 via-white to-white p-4 ring-1 ring-pink-100 text-center mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#df5f97]">Available balance</div>
              <div className="mt-1 text-2xl font-extrabold text-[#241a22]">{money(WALLET.available)}</div>
              <div className="mt-2 flex gap-2 justify-center">
                <button onClick={() => { setSection("add_funds"); setMobileNavOpen(false); }} className="rounded-lg bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm">Add funds</button>
                <button onClick={() => { setSection("withdraw"); setMobileNavOpen(false); }} className="rounded-lg border border-pink-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#df5f97]">Withdraw</button>
              </div>
            </div>
            <nav className="space-y-0.5">
              {NAV_SECTIONS.map((n) => {
                const active = section === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => { setSection(n.id); setMobileNavOpen(false); }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-pink-50 text-[#df5f97] font-bold" : "text-[#5b4153] hover:bg-pink-50/60 hover:text-[#df5f97] font-medium"}`}
                  >
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {n.icon}
                    </svg>
                    <span>{n.label}</span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#df5f97]" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ─── Main Content ──────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-8 md:py-8">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
