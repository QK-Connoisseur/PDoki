import { useState } from "react";
import MemberLayout from "../components/MemberLayout";
import { useSimulatedFetch } from "../lib/useSimulatedFetch";
import { LoadingState, EmptyState, ErrorState } from "../components/StateViews";
import CreatePostModal from "../components/CreatePostModal";
import { promotions } from "../fixtures/promotions";

/* ─── Mock Data ──────────────────────────────────────────────────────── */

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


/* ─── Main Component ─────────────────────────────────────────────────── */

export default function PromotionsPage({ userStatus = 'online', onStatusChange }) {
  const page = useSimulatedFetch();
  const [showCompose, setShowCompose] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [composeFontSize, setComposeFontSize] = useState("normal");
  const [composeFontColor, setComposeFontColor] = useState("#4a3340");
  const [composeBold, setComposeBold] = useState(false);
  const [composeItalic, setComposeItalic] = useState(false);
  const [composeLocked, setComposeLocked] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeVesoPrice, setComposeVesoPrice] = useState("");


  const filteredPromotions = activeFilter === "all"
    ? promotions
    : promotions.filter((p) => p.promoType === activeFilter);

  const freeTrialPromos = filteredPromotions.filter((p) => p.promoType === "free-trial");
  const discountPromos = filteredPromotions.filter((p) => p.promoType === "discount");
  const bundlePromos = filteredPromotions.filter((p) => p.promoType === "bundle");


  return (
    <MemberLayout
      activePage="promotions"
      userStatus={userStatus}
      onStatusChange={onStatusChange}
      onComposePost={() => setShowCompose(true)}
    >
        <main className="flex-1 min-w-0 pb-20 md:pb-8">
          {page.status === "loading" ? (
            <LoadingState label="Loading promotions…" />
          ) : page.status === "error" ? (
            <ErrorState message="We couldn’t load promotions." onRetry={page.retry} />
          ) : page.status === "empty" ? (
            <EmptyState title="No promotions right now" message="Check back soon for new offers." />
          ) : (
            <>
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
                    </>
          )}
        </main>
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
    </MemberLayout>
  );
}
