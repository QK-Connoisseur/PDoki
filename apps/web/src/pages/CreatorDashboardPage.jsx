import { useState, useMemo } from "react";
import { StatusMenuRow } from "../components/UserStatusSwitcher";
import { LoadingState, EmptyState, ErrorState } from "../components/StateViews";
import { useSimulatedFetch } from "../lib/useSimulatedFetch";
import {
  CREATOR,
  earnings30d,
  earningsBreakdown,
  topFans,
  contentLibrary,
  subscribers,
  creatorTransactions as transactions,
  payoutHistory,
  tiers,
  promos,
  liveStreams,
  sessionBookings,
  sessionServices,
  shopItems,
  messageQueue,
  activityFeed,
  notifSettings,
} from "../fixtures/creatorDashboard";

/* ─── Feature Flags ──────────────────────────────────────────────────── */

const SHOW_LIVE_STREAMING = false;

/* ─── Colors ─────────────────────────────────────────────────────────── */

const SAKURA = "#f9a8c8";
const SAKURA_DEEP = "#df5f97";
const HEART_RED = "#e8384f";
const GOLD = "#f5b63b";
const MINT = "#7cc4a8";
const LAVENDER = "#b79cd9";

/* ─── Mock Data ──────────────────────────────────────────────────────── */

/* ─── Small Helpers ──────────────────────────────────────────────────── */

const money = (n) =>
  `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const compact = (n) =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);

/* ─── Pumdoki Logo ───────────────────────────────────────────────────── */

function PumdokiLogo() {
  return (
    <svg viewBox="0 0 520 120" className="h-9 w-auto" aria-label="Pumdoki">
      <defs>
        <linearGradient id="dashHeartBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff7fa" />
          <stop offset="48%" stopColor="#ffd8e5" />
          <stop offset="100%" stopColor="#f3a0bc" />
        </linearGradient>
        <linearGradient id="dashWordFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd1e0" />
          <stop offset="55%" stopColor="#f8b3ca" />
          <stop offset="100%" stopColor="#ef8fb1" />
        </linearGradient>
      </defs>
      <g transform="translate(4,6)">
        <path
          d="M52 66c-4-3-7-6-9-8C27 43 18 33 18 20 18 9 26 0 37 0c7 0 13 3 17 10 5-7 11-10 18-10 11 0 19 9 19 20 0 13-10 23-27 38l-9 8-5 5-5-5Z"
          fill="url(#dashHeartBase)"
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
        letterSpacing="0.5"
      >
        Pumdoki
      </text>
      <text
        x="110"
        y="75"
        fontSize="60"
        fontWeight="700"
        fill="url(#dashWordFill)"
        letterSpacing="0.5"
      >
        Pumdoki
      </text>
    </svg>
  );
}

/* ─── Shared UI Bits ─────────────────────────────────────────────────── */

function StatCard({ label, value, delta, icon, accent = SAKURA_DEEP }) {
  const up = typeof delta === "number" && delta >= 0;
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">
            {label}
          </div>
          <div className="mt-1.5 text-2xl font-bold text-[#241a22]">
            {value}
          </div>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}20`, color: accent }}
        >
          {icon}
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {up ? (
                <path d="M7 17l10-10M7 7h10v10" />
              ) : (
                <path d="M17 7L7 17M17 17H7V7" />
              )}
            </svg>
            {Math.abs(delta)}%
          </span>
          <span className="text-[11px] text-[#b89aa8]">vs last 30d</span>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h2 className="text-[22px] font-bold text-[#241a22]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-[#8c6d7f]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

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
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${tones[tone] || tones.pink}`}
    >
      {children}
    </span>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-[#df5f97]" : "bg-pink-100"}`}
      aria-label={label}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

/* ─── Earnings Bar Chart (SVG) ───────────────────────────────────────── */

function EarningsChart({ data }) {
  const W = 680,
    H = 220,
    P = 16;
  const max = Math.max(...data);
  const bw = (W - P * 2) / data.length - 3;
  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-[220px]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#f9a8c8" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f9a8c8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f9a8c8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={P}
            x2={W - P}
            y1={P + (H - P * 2) * t}
            y2={P + (H - P * 2) * t}
            stroke="#f9dce8"
            strokeDasharray="3 4"
          />
        ))}
        {data.map((v, i) => {
          const h = (v / max) * (H - P * 2);
          const x = P + i * ((W - P * 2) / data.length) + 1.5;
          const y = H - P - h;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={bw}
                height={h}
                rx={bw / 2}
                fill="url(#barGrad)"
              />
            </g>
          );
        })}
        <polyline
          fill="none"
          stroke="#df5f97"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={data
            .map((v, i) => {
              const x = P + i * ((W - P * 2) / data.length) + bw / 2 + 1.5;
              const y = H - P - (v / max) * (H - P * 2);
              return `${x},${y}`;
            })
            .join(" ")}
        />
      </svg>
    </div>
  );
}

/* ─── Donut (Earnings by Source) ─────────────────────────────────────── */

function EarningsDonut({ slices }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const R = 64,
    C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="h-[160px] w-[160px] -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={R}
          fill="none"
          stroke="#fde6ef"
          strokeWidth="18"
        />
        {slices.map((s, i) => {
          const frac = s.value / total;
          const dash = `${C * frac} ${C}`;
          const offset = -C * acc;
          acc += frac;
          return (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="18"
              strokeDasharray={dash}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          );
        })}
        <text
          x="80"
          y="75"
          textAnchor="middle"
          transform="rotate(90 80 80)"
          fontSize="11"
          fill="#b89aa8"
          fontWeight="600"
        >
          TOTAL 30D
        </text>
        <text
          x="80"
          y="95"
          textAnchor="middle"
          transform="rotate(90 80 80)"
          fontSize="18"
          fill="#241a22"
          fontWeight="800"
        >
          {money(total).replace(".00", "")}
        </text>
      </svg>
      <ul className="flex-1 space-y-1.5">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="flex-1 text-[#5b4153]">{s.label}</span>
            <span className="tabular-nums font-semibold text-[#241a22]">
              {money(s.value)}
            </span>
            <span className="w-10 text-right text-[11px] font-semibold text-[#b89aa8]">
              {s.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Dashboard Sections ─────────────────────────────────────────────── */

const NAV_SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <>
        <path d="M3 12l9-9 9 9" />
        <path d="M5 10v10h14V10" />
      </>
    ),
  },
  {
    id: "earnings",
    label: "Earnings",
    icon: (
      <>
        <path d="M12 2v20M5 9h10a3 3 0 010 6H7" />
      </>
    ),
  },
  {
    id: "subscribers",
    label: "Subscribers",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </>
    ),
  },
  {
    id: "content",
    label: "Content",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 15l5-5 4 4 3-3 6 6" />
      </>
    ),
  },
  {
    id: "messages",
    label: "Messaging",
    icon: (
      <>
        <path d="M21 12a8 8 0 11-3-6.2L21 4l-1.2 3A8 8 0 0121 12z" />
      </>
    ),
  },
  {
    id: "tiers",
    label: "Tiers & Promos",
    icon: (
      <>
        <path d="M6 3l6 4 6-4v12l-6 4-6-4V3z" />
      </>
    ),
  },
  {
    id: "live",
    label: "Live Streaming",
    icon: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M10 10l5 3-5 3V10z" />
      </>
    ),
  },
  {
    id: "sessions",
    label: "Sessions",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
  },
  {
    id: "shop",
    label: "Shop",
    icon: (
      <>
        <path d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z" />
        <path d="M3 7h18" />
        <path d="M16 11a4 4 0 01-8 0" />
      </>
    ),
  },
  {
    id: "fans",
    label: "Fan CRM",
    icon: (
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <path d="M12 3a4 4 0 100 8 4 4 0 000-8z" />
        <path d="M17 11h5M19.5 8.5v5" />
      </>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6 1.65 1.65 0 0010 3.09V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0A1.65 1.65 0 0021 10h0a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </>
    ),
  },
];

/* ─── Overview Section ───────────────────────────────────────────────── */

function OverviewSection({ go }) {
  return (
    <>
      <SectionHeader
        title="Welcome back, Your Pumdoki 🌸"
        subtitle="Here's how your creator world is blooming today."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => go("content")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-pink-200 bg-white px-3.5 py-2 text-sm font-semibold text-[#df5f97] transition hover:bg-pink-50"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Post
            </button>
            {SHOW_LIVE_STREAMING && (
              <button
                onClick={() => go("live")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Go Live
              </button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="30D Revenue"
          value={money(11644)}
          delta={18}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M5 9h10a3 3 0 010 6H7" />
            </svg>
          }
        />
        <StatCard
          label="Active Subscribers"
          value={compact(332)}
          delta={7}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="7" r="4" />
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            </svg>
          }
          accent={SAKURA}
        />
        <StatCard
          label="Profile Visits"
          value={compact(24810)}
          delta={12}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
          accent={LAVENDER}
        />
        <StatCard
          label="Unread Love"
          value={money(284)}
          delta={-3}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12M8 10h8" />
            </svg>
          }
          accent={HEART_RED}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#241a22]">
                Revenue — last 30 days
              </h3>
              <p className="text-xs text-[#8c6d7f]">
                Updated live · excludes platform fees
              </p>
            </div>
            <div className="flex gap-1.5 rounded-xl bg-pink-50 p-1">
              {["7D", "30D", "90D", "1Y"].map((p, i) => (
                <button
                  key={p}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${i === 1 ? "bg-white text-[#df5f97] shadow-sm" : "text-[#8c6d7f] hover:text-[#df5f97]"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <EarningsChart data={earnings30d} />
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">
            Revenue by source
          </h3>
          <EarningsDonut slices={earningsBreakdown} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#241a22]">
              Live activity
            </h3>
            <button className="text-xs font-semibold text-[#df5f97] hover:underline">
              View all
            </button>
          </div>
          <ul className="divide-y divide-pink-50">
            {activityFeed.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${a.tone === "green" ? "bg-emerald-400" : a.tone === "pink" ? "bg-pink-400" : a.tone === "red" ? "bg-red-400" : a.tone === "gold" ? "bg-amber-400" : "bg-purple-400"}`}
                  />
                  <p className="truncate text-sm text-[#5b4153]">{a.text}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs font-semibold text-[#df5f97]">
                    {a.sub}
                  </span>
                  <span className="text-xs text-[#b89aa8]">{a.when}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-white via-pink-50/40 to-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">
            Quick actions
          </h3>
          <div className="grid gap-2">
            {[
              {
                l: "Send mass DM",
                sub: "Reach a segment",
                s: "messages",
                i: "M4 4h16v12H5.17L4 17.17V4z",
              },
              {
                l: "Post PPV content",
                sub: "Create locked drop",
                s: "content",
                i: "M12 11V7a4 4 0 018 0v4M5 11h14v10H5z",
              },
              {
                l: "Launch promo",
                sub: "Discounts & trials",
                s: "tiers",
                i: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
              },
              {
                l: "Schedule a stream",
                sub: "Announce go-live",
                s: "live",
                i: "M8 2v4M16 2v4M3 10h18M3 6h18v14H3z",
              },
              {
                l: "Update subscriber tier",
                sub: "Perks & prices",
                s: "tiers",
                i: "M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z",
              },
            ]
              .filter((a) => SHOW_LIVE_STREAMING || a.s !== "live")
              .map((a, i) => (
                <button
                  key={i}
                  onClick={() => go(a.s)}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 text-left ring-1 ring-pink-100 transition hover:ring-pink-300 hover:bg-pink-50/40"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 text-[#df5f97]">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={a.i} />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[#241a22]">
                      {a.l}
                    </div>
                    <div className="text-xs text-[#8c6d7f]">{a.sub}</div>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-[#b89aa8]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#241a22]">
              Top performing posts
            </h3>
            <button
              onClick={() => go("content")}
              className="text-xs font-semibold text-[#df5f97] hover:underline"
            >
              Manage
            </button>
          </div>
          <ul className="space-y-3">
            {contentLibrary
              .filter((c) => c.status === "Published")
              .slice(0, 3)
              .map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <img
                    src={c.thumb}
                    alt=""
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[#241a22]">
                      {c.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#8c6d7f]">
                      <Pill tone={c.locked ? "pink" : "gray"}>
                        {c.locked ? "PPV" : "Free"}
                      </Pill>
                      <span>{compact(c.views)} views</span>
                      <span>·</span>
                      <span>{compact(c.kokoros)} kokoros</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#df5f97]">
                      {money(c.earnings)}
                    </div>
                    <div className="text-[11px] text-[#b89aa8]">lifetime</div>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#241a22]">Top fans</h3>
            <button
              onClick={() => go("fans")}
              className="text-xs font-semibold text-[#df5f97] hover:underline"
            >
              Open CRM
            </button>
          </div>
          <ul className="space-y-3">
            {topFans.slice(0, 4).map((f) => (
              <li key={f.id} className="flex items-center gap-3">
                <img
                  src={f.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-pink-100"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-[#241a22]">
                      {f.name}
                    </span>
                    <Pill
                      tone={
                        f.tier === "Legend"
                          ? "pink"
                          : f.tier === "Star"
                            ? "gold"
                            : "gray"
                      }
                    >
                      {f.tier}
                    </Pill>
                  </div>
                  <div className="text-[11px] text-[#8c6d7f]">
                    Subscriber · {f.since}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#241a22]">
                    {money(f.spent)}
                  </div>
                  <div className="text-[11px] text-[#b89aa8]">lifetime</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/* ─── Earnings Section ───────────────────────────────────────────────── */

function EarningsSection() {
  const balance = 2140.86;
  const pending = 318.42;
  const lifetime = 58214.09;

  return (
    <>
      <SectionHeader
        title="Earnings & Payouts"
        subtitle="Track every cherry blossom that drops into your wallet."
        action={
          <div className="flex gap-2">
            <button className="rounded-xl border border-pink-200 bg-white px-3.5 py-2 text-sm font-semibold text-[#df5f97] transition hover:bg-pink-50">
              Download statement
            </button>
            <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
              Withdraw {money(balance)}
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 via-white to-white p-5 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#df5f97]">
            Available to withdraw
          </div>
          <div className="mt-1 text-3xl font-extrabold text-[#241a22]">
            {money(balance)}
          </div>
          <div className="mt-2 text-xs text-[#8c6d7f]">
            Next auto-payout: May 01 · ACH ****4210
          </div>
        </div>
        <StatCard
          label="Pending (clearing)"
          value={money(pending)}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          }
          accent={GOLD}
        />
        <StatCard
          label="Lifetime earnings"
          value={money(lifetime)}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
            </svg>
          }
          accent={LAVENDER}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#241a22]">
              Daily earnings
            </h3>
            <div className="text-xs text-[#8c6d7f]">
              After platform fee (20%) & processing
            </div>
          </div>
          <EarningsChart data={earnings30d} />
        </div>
        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">
            Revenue by source
          </h3>
          <EarningsDonut slices={earningsBreakdown} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-pink-50 px-5 py-3.5">
            <h3 className="text-base font-bold text-[#241a22]">
              Recent transactions
            </h3>
            <button className="text-xs font-semibold text-[#df5f97] hover:underline">
              Export CSV
            </button>
          </div>
          <div className="max-h-[360px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-pink-50/40 text-[11px] uppercase tracking-wider text-[#b89aa8]">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">When</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Type</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Fan</th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    Amount
                  </th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-pink-50/30">
                    <td className="whitespace-nowrap px-4 py-3 text-[#8c6d7f]">
                      {t.when}
                    </td>
                    <td className="px-4 py-3 text-[#5b4153]">{t.kind}</td>
                    <td className="px-4 py-3 font-medium text-[#241a22]">
                      {t.who}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-[#241a22]">
                      {money(t.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Pill
                        tone={
                          t.status === "Settled"
                            ? "green"
                            : t.status === "Pending"
                              ? "gold"
                              : "red"
                        }
                      >
                        {t.status}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-pink-50 px-5 py-3.5">
            <h3 className="text-base font-bold text-[#241a22]">
              Payout history
            </h3>
            <button className="text-xs font-semibold text-[#df5f97] hover:underline">
              Tax docs
            </button>
          </div>
          <ul className="divide-y divide-pink-50">
            {payoutHistory.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div>
                  <div className="text-sm font-semibold text-[#241a22]">
                    {p.when}
                  </div>
                  <div className="text-xs text-[#8c6d7f]">{p.method}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold tabular-nums text-[#241a22]">
                    {money(p.amount)}
                  </span>
                  <Pill tone="green">{p.status}</Pill>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-pink-50/40 px-5 py-3 text-xs text-[#8c6d7f]">
            Payout schedule:{" "}
            <span className="font-semibold text-[#241a22]">
              Monthly on the 1st
            </span>{" "}
            · Platform fee: 20% · Threshold: $20
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Subscribers Section ────────────────────────────────────────────── */

function SubscribersSection() {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("All");
  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      if (tier !== "All" && s.tier !== tier) return false;
      if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, tier]);

  return (
    <>
      <SectionHeader
        title="Subscribers"
        subtitle="Your fan base — filter, export, DM, or gift them a thank-you."
        action={
          <div className="flex gap-2">
            <button className="rounded-xl border border-pink-200 bg-white px-3.5 py-2 text-sm font-semibold text-[#df5f97] transition hover:bg-pink-50">
              Export list
            </button>
            <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
              Mass DM
            </button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard
          label="Active"
          value={compact(332)}
          delta={7}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <StatCard
          label="New this month"
          value="48"
          delta={22}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          }
          accent={MINT}
        />
        <StatCard
          label="Renewal rate"
          value="87%"
          delta={3}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
            </svg>
          }
          accent={LAVENDER}
        />
        <StatCard
          label="MRR"
          value={money(7642)}
          delta={11}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M5 9h10a3 3 0 010 6H7" />
            </svg>
          }
          accent={GOLD}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-pink-50 px-5 py-3.5">
          <div className="relative flex-1 min-w-[200px]">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b89aa8]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search subscribers…"
              className="w-full rounded-xl border border-pink-100 bg-[#fffafc] py-2 pl-9 pr-3 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300"
            />
          </div>
          <div className="flex gap-1.5 rounded-xl bg-pink-50 p-1">
            {["All", "Legend", "Star", "Gold", "Silver"].map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`rounded-lg px-2.5 py-1 text-[12px] font-semibold transition ${tier === t ? "bg-white text-[#df5f97] shadow-sm" : "text-[#8c6d7f] hover:text-[#df5f97]"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-[500px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-pink-50/40 text-[11px] uppercase tracking-wider text-[#b89aa8]">
              <tr>
                <th className="px-5 py-2.5 text-left font-semibold">Fan</th>
                <th className="px-5 py-2.5 text-left font-semibold">Tier</th>
                <th className="px-5 py-2.5 text-left font-semibold">Renews</th>
                <th className="px-5 py-2.5 text-right font-semibold">MRR</th>
                <th className="px-5 py-2.5 text-right font-semibold">Status</th>
                <th className="px-5 py-2.5 text-right font-semibold"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-pink-50/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatar}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-pink-100"
                        alt=""
                      />
                      <div>
                        <div className="font-semibold text-[#241a22]">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-[#8c6d7f]">
                          {s.bookmarked ? "⭐ Bookmarked fan" : "Subscriber"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Pill
                      tone={
                        s.tier === "Legend"
                          ? "pink"
                          : s.tier === "Star"
                            ? "gold"
                            : s.tier === "Gold"
                              ? "lav"
                              : "gray"
                      }
                    >
                      {s.tier}
                    </Pill>
                  </td>
                  <td className="px-5 py-3 text-[#5b4153]">{s.renews}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-[#241a22]">
                    {money(s.mrr)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Pill tone={s.active ? "green" : "red"}>
                      {s.active ? "Active" : "Lapsed"}
                    </Pill>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        title="DM"
                        className="rounded-lg p-1.5 text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                        </svg>
                      </button>
                      <button
                        title="Gift"
                        className="rounded-lg p-1.5 text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
                        </svg>
                      </button>
                    </div>
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

/* ─── Content Section ────────────────────────────────────────────────── */

function ContentSection() {
  const [filter, setFilter] = useState("All");
  const filtered = contentLibrary.filter(
    (c) => filter === "All" || c.status === filter
  );

  return (
    <>
      <SectionHeader
        title="Content Library"
        subtitle="Publish, schedule, lock behind PPV, or save as draft."
        action={
          <div className="flex gap-2">
            <button className="rounded-xl border border-pink-200 bg-white px-3.5 py-2 text-sm font-semibold text-[#df5f97] transition hover:bg-pink-50">
              Import from drafts
            </button>
            <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
              Upload new
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-1.5 mb-4 rounded-xl bg-pink-50 p-1 w-fit">
        {["All", "Published", "Scheduled", "Draft"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${filter === t ? "bg-white text-[#df5f97] shadow-sm" : "text-[#8c6d7f] hover:text-[#df5f97]"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="group rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden transition hover:shadow-md hover:border-pink-200"
          >
            <div className="relative aspect-[16/10] bg-pink-50">
              <img
                src={c.thumb}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute left-3 top-3 flex gap-1.5">
                <Pill
                  tone={
                    c.status === "Published"
                      ? "green"
                      : c.status === "Scheduled"
                        ? "gold"
                        : "gray"
                  }
                >
                  {c.status}
                </Pill>
                {c.locked && <Pill tone="pink">🔒 PPV {money(c.price)}</Pill>}
              </div>
              <div className="absolute right-3 top-3 rounded-lg bg-black/45 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                {c.type}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="flex-1 truncate font-semibold text-[#241a22]">
                  {c.title}
                </h3>
                <button className="shrink-0 rounded-lg p-1 text-[#b89aa8] transition hover:bg-pink-50 hover:text-[#df5f97]">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </button>
              </div>
              <div className="mt-1 text-xs text-[#8c6d7f]">{c.date}</div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-pink-50 pt-3 text-center">
                <div>
                  <div className="text-sm font-bold text-[#241a22]">
                    {compact(c.views)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#b89aa8]">
                    Views
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#df5f97]">
                    {compact(c.kokoros)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#b89aa8]">
                    Kokoros
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#241a22]">
                    {money(c.earnings).replace(".00", "")}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#b89aa8]">
                    Earnings
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Messages Section ───────────────────────────────────────────────── */

function MessagesSection() {
  return (
    <>
      <SectionHeader
        title="Messaging Hub"
        subtitle="Mass DM, welcome flows, paid unlocks, auto-reply."
        action={
          <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
            New mass DM
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard
          label="Open rate"
          value="62%"
          delta={4}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16v16H4z" />
              <path d="M4 8l8 6 8-6" />
            </svg>
          }
        />
        <StatCard
          label="Reply rate"
          value="28%"
          delta={2}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 17l-5-5 5-5" />
              <path d="M20 18v-2a4 4 0 00-4-4H4" />
            </svg>
          }
          accent={MINT}
        />
        <StatCard
          label="Paid unlocks"
          value="184"
          delta={16}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          }
          accent={LAVENDER}
        />
        <StatCard
          label="Revenue (30d)"
          value={money(1124)}
          delta={12}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M5 9h10a3 3 0 010 6H7" />
            </svg>
          }
          accent={GOLD}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">
            Compose mass DM
          </h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">
                Audience
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "All subscribers",
                  "Legend only",
                  "Gold+",
                  "Lapsed (14d)",
                  "Top supporters",
                  "Custom segment…",
                ].map((s, i) => (
                  <button
                    key={s}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${i === 0 ? "bg-[#df5f97] text-white ring-[#df5f97]" : "bg-white text-[#8c6d7f] ring-pink-200 hover:text-[#df5f97] hover:ring-pink-300"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">
                Message
              </label>
              <textarea
                rows={5}
                className="w-full resize-none rounded-xl border border-pink-100 bg-[#fffafc] p-3 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300"
                placeholder="Hi {{first_name}}, just dropped something special for you… 🌸"
                defaultValue="Hi {{first_name}}, just dropped something special for you… 🌸"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#8c6d7f]">
                  Attach
                </span>
                {[
                  {
                    l: "Photo",
                    i: "M21 15V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h10M16 5l-5 5-3-3-5 5",
                  },
                  { l: "Video", i: "M23 7l-7 5 7 5V7zM1 5h14v14H1z" },
                  {
                    l: "Audio",
                    i: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8",
                  },
                  { l: "Tip request", i: "M12 2v20M5 9h10a3 3 0 010 6H7" },
                ].map((a) => (
                  <button
                    key={a.l}
                    title={a.l}
                    className="rounded-lg p-2 text-[#8c6d7f] ring-1 ring-pink-100 transition hover:bg-pink-50 hover:text-[#df5f97]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={a.i} />
                    </svg>
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#5b4153]">
                  Lock behind price
                  <span className="relative inline-flex items-center rounded-xl border border-pink-100 bg-[#fffafc]">
                    <span className="pl-2 pr-0.5 text-[#8c6d7f]">$</span>
                    <input
                      type="number"
                      defaultValue="6.99"
                      step="0.01"
                      className="w-16 bg-transparent py-1.5 pr-2 text-sm outline-none tabular-nums"
                    />
                  </span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-pink-50 pt-3">
              <button className="text-xs font-semibold text-[#df5f97] hover:underline">
                Schedule for later
              </button>
              <div className="flex gap-2">
                <button className="rounded-xl border border-pink-200 bg-white px-3.5 py-2 text-sm font-semibold text-[#df5f97] transition hover:bg-pink-50">
                  Save draft
                </button>
                <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
                  Send to 184 fans
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">
            Scheduled & automations
          </h3>
          <ul className="space-y-3">
            {messageQueue.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-pink-100 p-3 transition hover:border-pink-200"
              >
                <div className="flex items-center justify-between">
                  <Pill tone="pink">{m.kind}</Pill>
                  {m.price > 0 && (
                    <span className="text-[11px] font-semibold text-[#df5f97]">
                      {money(m.price)} unlock
                    </span>
                  )}
                </div>
                <div className="mt-2 text-sm font-semibold text-[#241a22]">
                  To: {m.to}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-[#8c6d7f]">
                  {m.preview}
                </p>
                <div className="mt-2 text-[11px] text-[#b89aa8]">
                  {m.scheduled}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-pink-50/50 p-3 text-xs text-[#5b4153]">
            <div className="font-semibold text-[#241a22]">
              Welcome auto-flow
            </div>
            <p className="mt-1">
              Send a thank-you DM 2 min after each new subscriber signs up.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Toggle checked onChange={() => {}} label="Welcome flow" />
              <span className="text-[11px] font-semibold text-emerald-600">
                Active · 48 sent this month
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Tiers & Promos Section ─────────────────────────────────────────── */

function TiersSection() {
  return (
    <>
      <SectionHeader
        title="Subscription Tiers & Promotions"
        subtitle="Design your ladder. Run free trials, flash sales, bundles, referral campaigns."
        action={
          <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
            + New tier
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tiers.map((t) => (
          <div
            key={t.id}
            className="relative overflow-hidden rounded-2xl border border-pink-100 bg-white p-5 shadow-sm"
          >
            <div
              className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-40"
              style={{ backgroundColor: t.color }}
            />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">
                    Tier
                  </div>
                  <h3 className="text-lg font-bold text-[#241a22]">{t.name}</h3>
                </div>
                <div
                  className="h-8 w-8 rounded-full ring-2 ring-white shadow"
                  style={{ backgroundColor: t.color }}
                />
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#241a22]">
                  {money(t.monthly).replace(".00", "")}
                </span>
                <span className="text-sm text-[#8c6d7f]">/ month</span>
              </div>
              <div className="mt-1 text-xs text-[#df5f97] font-semibold">
                {t.subscribers} subscribers · {money(t.subscribers * t.monthly)}
                /mo
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-[#5b4153]">
                {t.perks.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#df5f97]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-xl border border-pink-200 bg-white py-2 text-xs font-semibold text-[#df5f97] transition hover:bg-pink-50">
                  Edit
                </button>
                <button className="rounded-xl border border-pink-200 bg-white p-2 text-[#df5f97] transition hover:bg-pink-50">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-pink-50 px-5 py-3.5">
          <div>
            <h3 className="text-base font-bold text-[#241a22]">
              Promotional campaigns
            </h3>
            <p className="text-xs text-[#8c6d7f]">
              Free trials · bundles · coupon codes · referral rewards
            </p>
          </div>
          <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
            + New promo
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-pink-50/40 text-[11px] uppercase tracking-wider text-[#b89aa8]">
            <tr>
              <th className="px-5 py-2.5 text-left font-semibold">Campaign</th>
              <th className="px-5 py-2.5 text-left font-semibold">Code</th>
              <th className="px-5 py-2.5 text-left font-semibold">Discount</th>
              <th className="px-5 py-2.5 text-left font-semibold">
                Redemptions
              </th>
              <th className="px-5 py-2.5 text-left font-semibold">Expires</th>
              <th className="px-5 py-2.5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {promos.map((p) => (
              <tr key={p.id} className="hover:bg-pink-50/30">
                <td className="px-5 py-3 font-semibold text-[#241a22]">
                  {p.name}
                </td>
                <td className="px-5 py-3">
                  <code className="rounded bg-pink-50 px-2 py-0.5 text-[#df5f97] font-semibold">
                    {p.code}
                  </code>
                </td>
                <td className="px-5 py-3 text-[#5b4153]">{p.discount}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-28 rounded-full bg-pink-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#f472b6] to-[#df5f97]"
                        style={{
                          width: `${Math.min(100, (p.redemptions / (p.cap || p.redemptions)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-[#5b4153]">
                      {p.redemptions}
                      {p.cap ? ` / ${p.cap}` : ""}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-[#8c6d7f]">{p.expires}</td>
                <td className="px-5 py-3 text-right">
                  <Pill tone={p.active ? "green" : "gray"}>
                    {p.active ? "Active" : "Ended"}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Pill tone="pink">Referral</Pill>
            <h3 className="text-base font-bold text-[#241a22]">
              Bring a friend, earn 10%
            </h3>
          </div>
          <p className="mt-2 text-sm text-[#5b4153]">
            Your fans share your profile and earn 10% of their friend's first
            subscription. Lifetime boost.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm font-semibold text-[#df5f97]">
              pumdoki.app/r/yourpumdoki
            </code>
            <button className="rounded-xl border border-pink-200 bg-white px-3 py-2 text-xs font-semibold text-[#df5f97] transition hover:bg-pink-50">
              Copy link
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-amber-50 via-white to-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Pill tone="gold">Bundle</Pill>
            <h3 className="text-base font-bold text-[#241a22]">
              Multi-month bundles
            </h3>
          </div>
          <p className="mt-2 text-sm text-[#5b4153]">
            Offer 3 months, 6 months, or a full year upfront at a discount to
            lock in your most loyal fans.
          </p>
          <div className="mt-3 flex gap-2 flex-wrap">
            {[
              { l: "3 months", d: "15% off" },
              { l: "6 months", d: "25% off" },
              { l: "12 months", d: "40% off" },
            ].map((b) => (
              <div
                key={b.l}
                className="flex-1 min-w-[100px] rounded-xl border border-pink-100 bg-white p-3 text-center"
              >
                <div className="text-sm font-bold text-[#241a22]">{b.l}</div>
                <div className="text-xs font-semibold text-[#df5f97]">
                  {b.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Live Streaming Section ─────────────────────────────────────────── */

function LiveSection() {
  return (
    <>
      <SectionHeader
        title="Live Streaming"
        subtitle="Go live to your fans, set love goals, gate streams by tier."
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-[#df5f97] px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110">
            <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
            Go Live now
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">
            Pre-flight check
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">
                Stream title
              </label>
              <input
                defaultValue="Sakura Paint & Chat"
                className="w-full rounded-xl border border-pink-100 bg-[#fffafc] p-2.5 text-sm outline-none focus:border-pink-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">
                Category
              </label>
              <select className="w-full rounded-xl border border-pink-100 bg-[#fffafc] p-2.5 text-sm outline-none focus:border-pink-300">
                <option>
                  Chat · Paint · ASMR · Music · Gaming · IRL · Q&A
                </option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">
                Access
              </label>
              <select className="w-full rounded-xl border border-pink-100 bg-[#fffafc] p-2.5 text-sm outline-none focus:border-pink-300">
                <option>All subscribers</option>
                <option>Gold and above</option>
                <option>Star and above</option>
                <option>Legend only</option>
                <option>Pay-per-view (enter price)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">
                Love goal
              </label>
              <div className="flex items-center rounded-xl border border-pink-100 bg-[#fffafc]">
                <span className="pl-3 text-[#8c6d7f]">$</span>
                <input
                  defaultValue="500"
                  className="w-full bg-transparent p-2.5 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { l: "Allow screen share" },
              { l: "Save VOD to library" },
              { l: "Enable co-host" },
            ].map((x) => (
              <label
                key={x.l}
                className="flex items-center justify-between rounded-xl border border-pink-100 bg-[#fffafc] p-3 text-sm"
              >
                <span className="font-semibold text-[#5b4153]">{x.l}</span>
                <Toggle checked onChange={() => {}} label={x.l} />
              </label>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-dashed border-pink-200 bg-pink-50/40 p-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#df5f97] shadow-sm">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M10 10l5 3-5 3V10z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-[#241a22]">
              Camera & mic ready
            </div>
            <div className="text-xs text-[#8c6d7f]">
              1080p · 60fps · RTMP ready
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">
            Upcoming streams
          </h3>
          <ul className="space-y-3">
            {liveStreams.map((s) => (
              <li key={s.id} className="rounded-xl border border-pink-100 p-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#241a22]">{s.title}</h4>
                  <Pill tone="pink">{s.tierRequired}</Pill>
                </div>
                <div className="mt-1 text-xs text-[#8c6d7f]">
                  {s.when} · ~{s.expectedViewers} RSVPs
                </div>
                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-[#8c6d7f]">
                    <span>Love goal</span>
                    <span className="text-[#df5f97]">
                      {money(s.raised)} / {money(s.goal)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-pink-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#f472b6] to-[#df5f97]"
                      style={{ width: `${(s.raised / s.goal) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button className="mt-4 w-full rounded-xl border border-dashed border-pink-200 py-2 text-sm font-semibold text-[#df5f97] hover:bg-pink-50">
            + Schedule a new stream
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-4">
        <StatCard
          label="Streams (30d)"
          value="14"
          delta={2}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
            </svg>
          }
        />
        <StatCard
          label="Avg viewers"
          value="214"
          delta={9}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
          accent={LAVENDER}
        />
        <StatCard
          label="Total love sent"
          value={money(845)}
          delta={14}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12M8 10h8" />
            </svg>
          }
          accent={HEART_RED}
        />
        <StatCard
          label="Watch time"
          value="182h"
          delta={18}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          }
          accent={MINT}
        />
      </div>
    </>
  );
}

/* ─── Sessions (Epal-style) Section ──────────────────────────────────── */

function SessionsSection() {
  return (
    <>
      <SectionHeader
        title="Session Bookings"
        subtitle="1-on-1 experiences: voice calls, video dates, gaming, custom requests."
        action={
          <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
            + New service
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard
          label="Upcoming"
          value={String(sessionBookings.length)}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          }
        />
        <StatCard
          label="This month"
          value="28"
          delta={12}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          }
          accent={MINT}
        />
        <StatCard
          label="Avg rating"
          value="4.9"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
            </svg>
          }
          accent={GOLD}
        />
        <StatCard
          label="Session revenue"
          value={money(2140)}
          delta={8}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M5 9h10a3 3 0 010 6H7" />
            </svg>
          }
          accent={SAKURA_DEEP}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-pink-50 px-5 py-3.5">
            <h3 className="text-base font-bold text-[#241a22]">
              Upcoming bookings
            </h3>
          </div>
          <ul className="divide-y divide-pink-50">
            {sessionBookings.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-5 py-3.5">
                <img
                  src={b.avatar}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-pink-100"
                  alt=""
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#241a22]">{b.fan}</div>
                  <div className="text-xs text-[#8c6d7f]">
                    {b.activity} · {b.when}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#241a22]">
                    {money(b.rate)}
                  </div>
                  <Pill tone={b.status === "Confirmed" ? "green" : "gold"}>
                    {b.status}
                  </Pill>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-pink-50 px-5 py-3.5">
            <h3 className="text-base font-bold text-[#241a22]">
              Your services
            </h3>
            <button className="text-xs font-semibold text-[#df5f97] hover:underline">
              Manage availability
            </button>
          </div>
          <ul className="divide-y divide-pink-50">
            {sessionServices.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#241a22]">{s.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#8c6d7f]">
                    <span>{s.duration}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-amber-500">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-3 h-3"
                        fill="currentColor"
                      >
                        <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                      </svg>
                      {s.rating}
                    </span>
                    <span>·</span>
                    <span>{s.orders} orders</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#df5f97]">
                    {money(s.rate)}
                  </div>
                  <Toggle
                    checked={s.active}
                    onChange={() => {}}
                    label={s.name}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-[240px] flex-1">
            <h3 className="text-base font-bold text-[#241a22]">
              Availability & calendar
            </h3>
            <p className="mt-1 text-sm text-[#5b4153]">
              Set weekly slots, block-off dates, and auto-accept bookings up to
              your capacity.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Mon 7–10p",
              "Tue 8–11p",
              "Thu 9–11p",
              "Sat 3–6p",
              "Sun 6–9p",
            ].map((slot) => (
              <div
                key={slot}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#df5f97] ring-1 ring-pink-200"
              >
                {slot}
              </div>
            ))}
            <button className="rounded-full bg-[#df5f97] px-3 py-1 text-xs font-semibold text-white">
              + Add slot
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Shop Section ───────────────────────────────────────────────────── */

function ShopSection() {
  return (
    <>
      <SectionHeader
        title="Shop"
        subtitle="Digital downloads and physical merch — shipped in your pink sakura packaging."
        action={
          <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
            + New product
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard
          label="Listings"
          value={String(shopItems.length)}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z" />
              <path d="M3 7h18" />
            </svg>
          }
        />
        <StatCard
          label="Orders (30d)"
          value="186"
          delta={22}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 9h18" />
            </svg>
          }
          accent={MINT}
        />
        <StatCard
          label="Revenue (30d)"
          value={money(2140)}
          delta={14}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M5 9h10a3 3 0 010 6H7" />
            </svg>
          }
          accent={GOLD}
        />
        <StatCard
          label="Conv. rate"
          value="4.1%"
          delta={1}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17l10-10M7 7h10v10" />
            </svg>
          }
          accent={LAVENDER}
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shopItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden"
          >
            <div className="aspect-square bg-pink-50">
              <img
                src={item.thumb}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate font-semibold text-[#241a22]">
                  {item.name}
                </h3>
                <Pill tone={item.kind === "Digital" ? "lav" : "gold"}>
                  {item.kind}
                </Pill>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold text-[#df5f97]">
                  {money(item.price)}
                </span>
                <span className="text-xs text-[#8c6d7f]">
                  Stock: {item.stock === 999 ? "∞" : item.stock}
                </span>
              </div>
              <div className="mt-2 text-xs text-[#8c6d7f]">
                {item.sales} sold
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-xl border border-pink-200 bg-white py-1.5 text-xs font-semibold text-[#df5f97] transition hover:bg-pink-50">
                  Edit
                </button>
                <button className="rounded-xl border border-pink-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Fan CRM Section ────────────────────────────────────────────────── */

function FanCrmSection() {
  return (
    <>
      <SectionHeader
        title="Fan CRM"
        subtitle="Tag, note, and segment your fans. Build relationships that last."
        action={
          <button className="rounded-xl bg-gradient-to-r from-[#f472b6] to-[#df5f97] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
            + New segment
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">Segments</h3>
          <ul className="space-y-2">
            {[
              { l: "Top spenders", c: 24, tone: "pink" },
              { l: "New this week", c: 11, tone: "mint" },
              { l: "Lapsed (14d)", c: 38, tone: "red" },
              { l: "Never sent love", c: 146, tone: "gray" },
              { l: "Birthday this month", c: 6, tone: "gold" },
              { l: "VIP — 1yr+", c: 18, tone: "lav" },
            ].map((x) => (
              <li
                key={x.l}
                className="flex items-center justify-between rounded-xl border border-pink-100 p-2.5 transition hover:border-pink-300"
              >
                <span className="text-sm font-semibold text-[#241a22]">
                  {x.l}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#8c6d7f]">
                    {x.c}
                  </span>
                  <Pill tone={x.tone}>·</Pill>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-pink-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-pink-50 px-5 py-3.5">
            <h3 className="text-base font-bold text-[#241a22]">
              Top lifetime fans
            </h3>
            <button className="text-xs font-semibold text-[#df5f97] hover:underline">
              Export
            </button>
          </div>
          <ul className="divide-y divide-pink-50">
            {topFans.map((f) => (
              <li key={f.id} className="flex items-start gap-3 px-5 py-3.5">
                <img
                  src={f.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-pink-100"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#241a22]">
                      {f.name}
                    </span>
                    <Pill
                      tone={
                        f.tier === "Legend"
                          ? "pink"
                          : f.tier === "Star"
                            ? "gold"
                            : "gray"
                      }
                    >
                      {f.tier}
                    </Pill>
                    <span className="text-[11px] text-[#8c6d7f]">
                      {f.since}
                    </span>
                  </div>
                  {f.note && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8c6d7f]">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-3 h-3 text-[#df5f97]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                      <span className="italic">"{f.note}"</span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#241a22]">
                    {money(f.spent)}
                  </div>
                  <div className="mt-1 inline-flex gap-1">
                    <button
                      title="Add note"
                      className="rounded-lg p-1 text-[#b89aa8] transition hover:bg-pink-50 hover:text-[#df5f97]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                    <button
                      title="Tag"
                      className="rounded-lg p-1 text-[#b89aa8] transition hover:bg-pink-50 hover:text-[#df5f97]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/* ─── Settings Section ───────────────────────────────────────────────── */

function SettingsSection() {
  return (
    <>
      <SectionHeader
        title="Creator Settings"
        subtitle="Payouts, verification, tax, notifications, content rules."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#241a22]">
                Verification & KYC
              </h3>
              <p className="text-xs text-[#8c6d7f]">Approved · Dec 14, 2025</p>
            </div>
            <Pill tone="green">Verified</Pill>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              { l: "Government ID", done: true },
              { l: "Liveness selfie", done: true },
              { l: "Address verification", done: true },
              { l: "Tax form (W-9 / W-8BEN)", done: true },
              { l: "Bank account on file", done: true },
            ].map((x) => (
              <li key={x.l} className="flex items-center justify-between">
                <span className="text-[#5b4153]">{x.l}</span>
                {x.done ? (
                  <Pill tone="green">✓ Complete</Pill>
                ) : (
                  <Pill tone="gold">Pending</Pill>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-[#df5f97]">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#241a22]">
                Payout method
              </h3>
              <p className="text-xs text-[#8c6d7f]">
                Primary: ACH · Chase ****4210
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              {
                l: "ACH — Chase Bank",
                sub: "****4210 · Default",
                tone: "green",
              },
              { l: "Wire transfer", sub: "Int'l · ****8831", tone: "gray" },
              { l: "Crypto wallet (USDC)", sub: "0x7f...A20a", tone: "gray" },
            ].map((p) => (
              <div
                key={p.l}
                className="flex items-center justify-between rounded-xl border border-pink-100 p-3"
              >
                <div>
                  <div className="text-sm font-semibold text-[#241a22]">
                    {p.l}
                  </div>
                  <div className="text-xs text-[#8c6d7f]">{p.sub}</div>
                </div>
                <Pill tone={p.tone}>
                  {p.tone === "green" ? "Active" : "Backup"}
                </Pill>
              </div>
            ))}
            <button className="w-full rounded-xl border border-dashed border-pink-200 py-2 text-sm font-semibold text-[#df5f97] hover:bg-pink-50">
              + Add payout method
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">
            Notifications
          </h3>
          <div className="overflow-hidden rounded-xl border border-pink-100">
            <table className="w-full text-sm">
              <thead className="bg-pink-50/40 text-[11px] uppercase tracking-wider text-[#b89aa8]">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">Event</th>
                  <th className="px-4 py-2.5 text-center font-semibold">
                    Email
                  </th>
                  <th className="px-4 py-2.5 text-center font-semibold">
                    Push
                  </th>
                  <th className="px-4 py-2.5 text-center font-semibold">SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {notifSettings.map((n) => (
                  <tr key={n.id}>
                    <td className="px-4 py-3 text-[#241a22] font-medium">
                      {n.label}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex">
                        <Toggle
                          checked={n.email}
                          onChange={() => {}}
                          label={n.label}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex">
                        <Toggle
                          checked={n.push}
                          onChange={() => {}}
                          label={n.label}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex">
                        <Toggle
                          checked={n.sms}
                          onChange={() => {}}
                          label={n.label}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">
            Content & privacy
          </h3>
          <div className="space-y-3">
            {[
              { l: "Hide from non-subscribers in Promotions", on: false },
              { l: "Block screenshots in DMs (best effort)", on: true },
              { l: "Watermark all images", on: true },
              { l: "Auto-apply content warning to PPV", on: true },
              { l: "Restrict chat to subscribers", on: false },
            ].map((x) => (
              <label key={x.l} className="flex items-center justify-between">
                <span className="text-sm text-[#5b4153]">{x.l}</span>
                <Toggle checked={x.on} onChange={() => {}} label={x.l} />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#241a22]">
            Geo & age blocking
          </h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">
                Blocked countries
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["🇺🇸 — No, open", "🇬🇧 — No, open", "🇩🇪 — No, open"].slice(
                  0,
                  0
                )}
                {["Country 1", "Country 2"].map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-semibold text-[#df5f97] ring-1 ring-pink-200"
                  >
                    🌍 {c}
                    <button className="text-[#b89aa8] hover:text-[#df5f97]">
                      ×
                    </button>
                  </span>
                ))}
                <button className="rounded-full border border-dashed border-pink-200 px-2.5 py-1 text-[11px] font-semibold text-[#df5f97] hover:bg-pink-50">
                  + Add
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">
                Age gate
              </label>
              <select className="w-full rounded-xl border border-pink-100 bg-[#fffafc] p-2.5 text-sm outline-none focus:border-pink-300">
                <option>18+ required (default)</option>
                <option>21+ required</option>
                <option>No age gate</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/40 p-5">
        <h3 className="text-base font-bold text-red-500">Danger zone</h3>
        <p className="mt-1 text-sm text-[#5b4153]">
          Pausing hides your profile from discovery, stops billing new
          subscriptions, and locks incoming DMs. Existing subscribers still keep
          access.
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          <button className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50">
            Pause creator account
          </button>
          <button className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50">
            Delete creator profile
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function CreatorDashboardPage({
  onBack,
  onLogout,
  onViewProfile,
  userStatus = "online",
  onStatusChange,
}) {
  const [section, setSection] = useState("overview");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const page = useSimulatedFetch();

  const renderSection = () => {
    switch (section) {
      case "earnings":
        return <EarningsSection />;
      case "subscribers":
        return <SubscribersSection />;
      case "content":
        return <ContentSection />;
      case "messages":
        return <MessagesSection />;
      case "tiers":
        return <TiersSection />;
      case "live":
        return SHOW_LIVE_STREAMING ? (
          <LiveSection />
        ) : (
          <OverviewSection go={setSection} />
        );
      case "sessions":
        return <SessionsSection />;
      case "shop":
        return <ShopSection />;
      case "fans":
        return <FanCrmSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <OverviewSection go={setSection} />;
    }
  };

  if (page.status !== "ready") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8fb] px-6">
        {page.status === "loading" && (
          <LoadingState label="Loading your creator dashboard…" />
        )}
        {page.status === "empty" && (
          <EmptyState
            title="No creator activity yet"
            message="Publish content or invite subscribers to begin."
          />
        )}
        {page.status === "error" && (
          <ErrorState
            message="We couldn’t load your creator dashboard."
            onRetry={page.retry}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8fb] text-[#5b4153]">
      {/* ─── Top Bar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-16 border-b border-pink-100 bg-white/92 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]"
              aria-label="Back to home"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="cursor-pointer"
              aria-label="Back to home"
            >
              <PumdokiLogo />
            </button>
            <div className="hidden md:flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 ring-1 ring-pink-200">
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 text-[#df5f97]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
              </svg>
              <span className="text-xs font-semibold text-[#df5f97]">
                Creator Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]"
              aria-label="Sections"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <button
              className="hidden sm:flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-3 py-2 text-xs font-semibold text-[#df5f97] transition hover:bg-pink-50"
              onClick={onViewProfile}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview profile
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((v) => !v)}
                className="ml-1 flex h-10 w-10 items-center justify-center"
                aria-label="Profile menu"
              >
                <img
                  src={CREATOR.avatar}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-pink-200 object-cover transition hover:border-pink-400"
                />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-pink-100 bg-white py-2 shadow-xl overflow-hidden">
                  <StatusMenuRow
                    status={userStatus}
                    onStatusChange={onStatusChange}
                  />
                  <hr className="my-1 border-pink-100" />
                  <button
                    onClick={() => {
                      onViewProfile && onViewProfile();
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60 hover:text-[#df5f97]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                    My Profile
                  </button>
                  <button
                    onClick={onBack}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60 hover:text-[#df5f97]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                    </svg>
                    Home
                  </button>
                  <hr className="my-1 border-pink-100" />
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#e8384f] transition hover:bg-red-50/60"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* ─── Left Section Nav ──────────────────────────────────── */}
        <aside
          className={`${mobileNavOpen ? "block absolute inset-y-16 left-0 z-30" : "hidden"} md:block md:relative md:inset-auto w-[240px] shrink-0 border-r border-pink-100 bg-white`}
        >
          <div className="sticky top-16 p-4">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-pink-50 via-white to-white p-3 ring-1 ring-pink-100">
              <img
                src={CREATOR.avatar}
                alt=""
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-[#241a22]">
                  {CREATOR.handle}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-[#df5f97]">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3 h-3"
                    fill="currentColor"
                  >
                    <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                  </svg>
                  {CREATOR.tier}
                </div>
              </div>
            </div>
            <nav className="mt-4 space-y-0.5">
              {NAV_SECTIONS.filter(
                (n) => SHOW_LIVE_STREAMING || n.id !== "live"
              ).map((n) => {
                const active = section === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      setSection(n.id);
                      setMobileNavOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-pink-50 text-[#df5f97] font-bold" : "text-[#5b4153] hover:bg-pink-50/60 hover:text-[#df5f97] font-medium"}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4.5 w-4.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {n.icon}
                    </svg>
                    <span>{n.label}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#df5f97]" />
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="mt-5 rounded-2xl border border-pink-100 bg-white p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#b89aa8]">
                Need help?
              </div>
              <p className="mt-1 text-xs text-[#5b4153]">
                Creator support responds in &lt; 2h for verified creators.
              </p>
              <button className="mt-2 w-full rounded-xl border border-pink-200 bg-white py-1.5 text-xs font-semibold text-[#df5f97] hover:bg-pink-50">
                Message support
              </button>
            </div>
          </div>
        </aside>

        {/* ─── Main Content ──────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-8">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
