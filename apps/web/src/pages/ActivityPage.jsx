import { useState } from "react";
import { Link } from "react-router-dom";
import MemberLayout from "../components/MemberLayout";
import { activity } from "../fixtures/activity";

const categories = [
  { id: "all", label: "All activity", icon: "activity" },
  { id: "likes", label: "Likes", icon: "likes" },
  { id: "purchases", label: "Purchases", icon: "purchases" },
  { id: "subscriptions", label: "Subscriptions", icon: "subscriptions" },
  { id: "payments", label: "Payments", icon: "payments" },
];
const foreground = { color: "var(--member-control-fg, #5b4153)" };
const edge = { borderColor: "var(--member-border-emphasis, #f4dae6)" };
const inputStyle = {
  ...foreground,
  ...edge,
  background: "var(--member-popover-fill, #fffdfd)",
};
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const months = [...new Set(activity.map((item) => item.date.slice(0, 7)))].sort(
  (a, b) => b.localeCompare(a)
);
const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--member-control-focus)]";

function ActivityIcon({ type, className = "h-5 w-5" }) {
  const paths = {
    activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
    likes: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    purchases: (
      <>
        <rect x="4" y="7" width="16" height="14" rx="2" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    subscriptions: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18m-13 5 2 2 4-4" />
      </>
    ),
    payments: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="M2 10h20M6 15h3" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

export default function ActivityPage({
  userStatus = "online",
  onStatusChange,
}) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("all");
  const search = query.trim().toLowerCase();
  const matching = activity.filter(
    (item) =>
      (month === "all" || item.date.startsWith(month)) &&
      `${item.title} ${item.creator} ${item.detail} ${item.status}`
        .toLowerCase()
        .includes(search)
  );
  const visible = matching
    .filter((item) => category === "all" || item.category === category)
    .toSorted((a, b) => b.date.localeCompare(a.date));
  const groups = Map.groupBy(visible, (item) => item.date);
  const filtered = category !== "all" || search !== "" || month !== "all";

  function resetFilters() {
    setCategory("all");
    setQuery("");
    setMonth("all");
  }

  return (
    <MemberLayout
      activePage="activity"
      userStatus={userStatus}
      onStatusChange={onStatusChange}
    >
      <main className="min-w-0 flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-10">
        <div className="mx-auto max-w-5xl" style={foreground}>
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-75">
                Your space
              </p>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Your Activity
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed opacity-80">
                Likes, purchases, subscriptions, and payment history in one
                place.
              </p>
            </div>
            <Link
              to="/billing"
              className={`member-header-action inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${focusClass}`}
              style={edge}
            >
              Billing
              <ActivityIcon type="arrow" className="h-4 w-4" />
            </Link>
          </header>

          <div
            className="sakura-glass-surface mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border px-4 py-3 text-xs leading-relaxed"
            role="note"
            aria-label="Activity preview"
          >
            <span className="font-semibold">Preview — example activity</span>
            <span className="opacity-80">
              These examples are not your account history. No real purchases or
              payments are shown.
            </span>
          </div>

          <section
            className="sakura-glass-surface overflow-hidden rounded-2xl border"
            aria-label="Activity history"
          >
            <div className="border-b p-4 md:p-5" style={edge}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">Search activity</span>
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center opacity-65">
                    <ActivityIcon type="search" className="h-4 w-4" />
                  </span>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search creators or activity"
                    className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm placeholder:text-current placeholder:opacity-100 ${focusClass}`}
                    style={inputStyle}
                  />
                </label>
                <label className="sm:w-48">
                  <span className="sr-only">Activity month</span>
                  <select
                    value={month}
                    onChange={(event) => setMonth(event.target.value)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-sm ${focusClass}`}
                    style={inputStyle}
                  >
                    <option value="all">All dates</option>
                    {months.map((value) => (
                      <option key={value} value={value}>
                        {monthFormatter.format(
                          new Date(`${value}-01T12:00:00Z`)
                        )}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div
                className="mt-4 flex gap-2 overflow-x-auto pb-1"
                role="group"
                aria-label="Activity categories"
              >
                {categories.map((item) => {
                  const selected = category === item.id;
                  const count =
                    item.id === "all"
                      ? matching.length
                      : matching.filter((entry) => entry.category === item.id)
                          .length;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCategory(item.id)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold ${focusClass}`}
                      style={{
                        borderColor: selected
                          ? "var(--member-control-focus, #8f2f65)"
                          : "transparent",
                        color: selected
                          ? "var(--member-control-hover-fg, #7d2858)"
                          : "inherit",
                        background: selected
                          ? "var(--member-control-hover-bg, #fff)"
                          : "transparent",
                      }}
                    >
                      <ActivityIcon type={item.icon} className="h-4 w-4" />
                      {item.label}
                      <span
                        className="min-w-4 text-center text-[10px] opacity-75"
                        aria-label={`${count} examples`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 md:px-5">
              <p
                className="text-xs opacity-75"
                role="status"
                aria-live="polite"
              >
                {visible.length} example{visible.length === 1 ? "" : "s"}
                <span aria-hidden="true"> · </span>Newest first
              </p>
              {filtered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`rounded-lg px-2 py-1 text-xs font-semibold underline underline-offset-4 ${focusClass}`}
                >
                  Reset filters
                </button>
              )}
            </div>

            {visible.length === 0 ? (
              <div className="px-5 pb-14 pt-7 text-center">
                <span
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border opacity-65"
                  style={edge}
                >
                  <ActivityIcon type="search" className="h-6 w-6" />
                </span>
                <h2 className="text-base font-semibold">
                  No matching activity
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed opacity-75">
                  Try another creator or title, choose a different date, or
                  reset your filters to see all examples.
                </p>
              </div>
            ) : (
              <div className="pb-3">
                {[...groups].map(([date, entries]) => (
                  <section
                    key={date}
                    aria-label={dateFormatter.format(
                      new Date(`${date}T12:00:00Z`)
                    )}
                  >
                    <h2 className="px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider opacity-75 md:px-5">
                      <time dateTime={date}>
                        {dateFormatter.format(new Date(`${date}T12:00:00Z`))}
                      </time>
                    </h2>
                    <ul className="px-2 md:px-3">
                      {entries.map((item) => (
                        <li
                          key={item.id}
                          className="flex gap-3 rounded-xl px-2 py-4 md:gap-4"
                        >
                          <span
                            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                            style={{
                              ...edge,
                              background:
                                "var(--member-control-hover-bg, #fff)",
                            }}
                          >
                            <ActivityIcon type={item.category} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                              <h3 className="min-w-0 break-words text-sm font-semibold">
                                {item.title}
                              </h3>
                              {item.amountUsd !== undefined && (
                                <span className="shrink-0 text-sm font-semibold tabular-nums">
                                  {priceFormatter.format(item.amountUsd)}
                                  {item.priceUnit && (
                                    <span className="text-xs font-normal opacity-75">
                                      {item.priceUnit}
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs font-medium opacity-85">
                              {item.creator}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] opacity-75">
                              <p className="min-w-0 break-words">
                                {item.detail}
                              </p>
                              <span
                                className="rounded-md border px-2 py-0.5"
                                style={edge}
                              >
                                {item.status}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </section>
          <p className="mt-4 px-1 text-xs opacity-70">
            Example amounts are shown in USD. Account history will appear here
            when connected.
          </p>
        </div>
      </main>
    </MemberLayout>
  );
}
