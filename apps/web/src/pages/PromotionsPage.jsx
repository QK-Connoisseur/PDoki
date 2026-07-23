import { useMemo, useState } from "react";
import MemberLayout from "../components/MemberLayout";
import { useSimulatedFetch } from "../lib/useSimulatedFetch";
import { LoadingState, EmptyState, ErrorState } from "../components/StateViews";
import CreatePostModal from "../components/CreatePostModal";
import {
  promotions,
  followedPromotionUsernames,
  subscribedPromotionUsernames,
} from "../fixtures/promotions";
import {
  buildPromotionSections,
  formatPromotionTerms,
  getDaysRemaining,
  getSavingsPercent,
  isPromotionActive,
  sortPromotions,
} from "../utils/promotionSections";

const followedSet = new Set(followedPromotionUsernames);
const subscribedSet = new Set(subscribedPromotionUsernames);

const filterTabs = [
  { id: "all", label: "All Promos" },
  { id: "free-trial", label: "Free Trials" },
  { id: "discount", label: "Discounts" },
  { id: "bundle", label: "Bundles" },
];

const sortOptions = [
  { id: "recommended", label: "Recommended" },
  { id: "savings", label: "Biggest savings" },
  { id: "price-low", label: "Lowest intro price" },
  { id: "newest", label: "Newest" },
  { id: "ending-soon", label: "Ending soon" },
];

function formatExpiry(expiresAt) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(expiresAt));
}

function PromoBadge({ type, label }) {
  const styles = {
    "free-trial": "bg-emerald-500 text-white",
    discount: "bg-amber-500 text-white",
    bundle: "bg-violet-500 text-white",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${styles[type]}`}
    >
      {label}
    </span>
  );
}

function RelationshipBadge({ relationship }) {
  if (!relationship) return null;
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${
        relationship === "Subscribed"
          ? "border-amber-200/70 bg-amber-50/95 text-amber-700"
          : "border-pink-200/70 bg-white/95 text-[#df5f97]"
      }`}
    >
      {relationship}
    </span>
  );
}

function PromoCard({ promo, now }) {
  const daysRemaining = getDaysRemaining(promo, now);
  const relationship = subscribedSet.has(promo.username)
    ? "Subscribed"
    : followedSet.has(promo.username)
      ? "Following"
      : null;
  const isEndingSoon = daysRemaining <= 7;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100/50">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={promo.cover}
          alt={promo.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

        <div className="absolute left-3 top-3">
          <PromoBadge type={promo.promoType} label={promo.promoLabel} />
        </div>
        <div className="absolute right-3 top-3">
          <RelationshipBadge relationship={relationship} />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="flex items-center gap-2.5">
            <img
              src={promo.avatar}
              alt=""
              className="h-10 w-10 rounded-full border-2 border-white/80 object-cover shadow-md"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {promo.name}
              </p>
              <p className="text-xs text-white/75">@{promo.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-[#241a22]">
            {promo.promoDetail}
          </p>
          {promo.promoType !== "free-trial" && (
            <span className="shrink-0 rounded-full bg-pink-50 px-2 py-1 text-[10px] font-bold text-[#df5f97]">
              Save {getSavingsPercent(promo)}%
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-[#8c6d7f]">
          <span>{promo.subscribers} subscribers</span>
          <span aria-hidden="true">·</span>
          <span>{promo.posts} posts</span>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {promo.promoType === "free-trial" ? (
            <>
              <span className="text-base font-bold text-emerald-600">FREE</span>
              <span className="text-xs text-[#8c6d7f]">
                for {promo.trialDays} days
              </span>
            </>
          ) : promo.promoType === "discount" ? (
            <>
              <span className="text-base font-bold text-amber-600">
                ${promo.introPrice.toFixed(2)}
              </span>
              <span className="text-xs text-[#b89aa8] line-through">
                ${promo.regularMonthlyPrice.toFixed(2)}
              </span>
              <span className="text-xs text-[#8c6d7f]">first month</span>
            </>
          ) : (
            <>
              <span className="text-base font-bold text-violet-600">
                ${promo.firstTermTotal.toFixed(2)}
              </span>
              <span className="text-xs text-[#8c6d7f]">
                total / {promo.includedMonths} months
              </span>
            </>
          )}
        </div>

        <div className="mt-3 rounded-xl border border-pink-100 bg-[#fff9fc] p-3">
          <p className="text-xs font-medium leading-relaxed text-[#5b4153]">
            {formatPromotionTerms(promo)}
          </p>
          <div className="mt-2 flex flex-col gap-1 text-[11px] text-[#8c6d7f]">
            <span>{promo.eligibility}</span>
            <span className={isEndingSoon ? "font-semibold text-rose-600" : ""}>
              {isEndingSoon
                ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`
                : `Ends ${formatExpiry(promo.expiresAt)}`}
            </span>
          </div>
        </div>

        <button className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-200/50 transition hover:from-[#f472b6] hover:to-[#ec4899] hover:shadow-lg">
          {promo.promoType === "free-trial"
            ? "Review Free Trial"
            : promo.promoType === "discount"
              ? "Review Discount"
              : "Review Bundle"}
        </button>
      </div>
    </article>
  );
}

function PromotionSection({ title, subtitle, items, now, testId }) {
  if (items.length === 0) return null;

  return (
    <section className="mb-9" data-testid={testId}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#241a22]">{title}</h2>
          <p className="mt-0.5 text-xs text-[#8c6d7f]">{subtitle}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-[#b89aa8]">
          {items.length} offer{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {items.map((promo) => (
          <PromoCard key={promo.id} promo={promo} now={now} />
        ))}
      </div>
    </section>
  );
}

export default function PromotionsPage({
  userStatus = "online",
  onStatusChange,
}) {
  const page = useSimulatedFetch();
  const [now] = useState(() => new Date());
  const [showCompose, setShowCompose] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [composeFontSize, setComposeFontSize] = useState("normal");
  const [composeFontColor, setComposeFontColor] = useState("#4a3340");
  const [composeBold, setComposeBold] = useState(false);
  const [composeItalic, setComposeItalic] = useState(false);
  const [composeLocked, setComposeLocked] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeVesoPrice, setComposeVesoPrice] = useState("");

  const activePromotions = useMemo(
    () => promotions.filter((promo) => isPromotionActive(promo, now)),
    [now]
  );

  const filteredPromotions = useMemo(
    () =>
      activeFilter === "all"
        ? activePromotions
        : activePromotions.filter(
            (promotion) => promotion.promoType === activeFilter
          ),
    [activeFilter, activePromotions]
  );

  const personalizedSections = useMemo(
    () =>
      buildPromotionSections(
        filteredPromotions,
        followedSet,
        subscribedSet,
        sortBy,
        now
      ),
    [filteredPromotions, now, sortBy]
  );

  const sortedFilteredPromotions = useMemo(
    () => sortPromotions(filteredPromotions, sortBy, now),
    [filteredPromotions, now, sortBy]
  );

  const freeTrialCount = activePromotions.filter(
    (promotion) => promotion.promoType === "free-trial"
  ).length;
  const maxDiscount = Math.max(
    0,
    ...activePromotions
      .filter((promotion) => promotion.promoType !== "free-trial")
      .map(getSavingsPercent)
  );
  const activeFilterLabel =
    filterTabs.find((tab) => tab.id === activeFilter)?.label ?? "Promotions";

  return (
    <MemberLayout
      activePage="promotions"
      userStatus={userStatus}
      onStatusChange={onStatusChange}
      onComposePost={() => setShowCompose(true)}
    >
      <main className="min-w-0 flex-1 pb-20 md:pb-8">
        {page.status === "loading" ? (
          <LoadingState label="Loading promotions…" />
        ) : page.status === "error" ? (
          <ErrorState
            message="We couldn’t load promotions."
            onRetry={page.retry}
          />
        ) : page.status === "empty" ? (
          <EmptyState
            title="No promotions right now"
            message="Check back soon for new offers."
          />
        ) : (
          <div className="mx-auto max-w-[1700px] px-4 pt-4">
            <div className="mb-5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-[#241a22]">Promotions</h1>
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                  {activePromotions.length} active
                </span>
              </div>
              <p className="mt-1 text-sm text-[#8c6d7f]">
                Personalized subscription offers with clear renewal terms
              </p>
            </div>

            <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#f9a8c8] via-[#f472b6] to-[#ec4899] p-6 md:p-8">
              <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
              <div className="absolute -bottom-16 left-1/3 h-36 w-36 rounded-full bg-white/10" />
              <div className="relative z-10">
                <span className="text-sm font-semibold text-white/90">
                  Offers selected for you
                </span>
                <h2 className="mt-1 text-2xl font-bold text-white md:text-3xl">
                  Find the right deal without surprises
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
                  Compare the promotional price, eligibility, real expiry date,
                  and what you will pay when the offer renews.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    {freeTrialCount} free trial
                    {freeTrialCount === 1 ? "" : "s"}
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    Up to {maxDiscount}% savings
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    Renewal terms shown upfront
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-7 flex flex-col gap-3 border-b border-pink-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={activeFilter === tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeFilter === tab.id
                        ? "bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white shadow-md shadow-pink-200/50"
                        : "border border-pink-100 bg-white text-[#8c6d7f] hover:border-pink-300 hover:text-[#df5f97]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#8c6d7f]">
                Sort by
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm font-medium text-[#5b4153] outline-none focus:border-pink-300"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {filteredPromotions.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-2xl">
                  ♡
                </div>
                <p className="text-sm text-[#b89aa8]">
                  No active promotions match this filter.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className="mt-3 text-sm font-semibold text-[#f472b6] hover:text-[#ec4899]"
                >
                  View all promos
                </button>
              </div>
            ) : activeFilter === "all" ? (
              <>
                <PromotionSection
                  title="Deals from creators you follow"
                  subtitle="Offers from creators already connected to your Pumdoki experience."
                  items={personalizedSections.followed}
                  now={now}
                  testId="promotion-section-followed"
                />
                <PromotionSection
                  title="Ending soon"
                  subtitle="Only offers with verified expiry dates within the next seven days."
                  items={personalizedSections.endingSoon}
                  now={now}
                  testId="promotion-section-ending"
                />
                <PromotionSection
                  title="Best for you"
                  subtitle="Recommended using your interests, relationships, and offer value."
                  items={personalizedSections.recommended}
                  now={now}
                  testId="promotion-section-recommended"
                />
              </>
            ) : (
              <PromotionSection
                title={activeFilterLabel}
                subtitle={`${sortedFilteredPromotions.length} active offer${sortedFilteredPromotions.length === 1 ? "" : "s"}, ordered by ${sortOptions.find((option) => option.id === sortBy)?.label.toLowerCase()}.`}
                items={sortedFilteredPromotions}
                now={now}
                testId={`promotion-section-${activeFilter}`}
              />
            )}
          </div>
        )}
      </main>

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
