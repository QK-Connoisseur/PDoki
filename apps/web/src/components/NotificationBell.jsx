import { useEffect, useRef, useState } from "react";
import "./NotificationBell.css";

const FILTERS = ["all", "unread"];
const GROUPS = [
  { id: "today", label: "Today" },
  { id: "earlier", label: "Earlier" },
];
const ACTIVITY_TYPES = {
  comment: { icon: "comment", label: "Comment" },
  reaction: { icon: "heart", label: "Kokoro" },
  follow: { icon: "follow", label: "New follower" },
  drop: { icon: "sparkles", label: "New drop" },
  mention: { icon: "mention", label: "Mention" },
};

function NotificationIcon({ name, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {name === "comment" ? (
        <>
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
          <path d="M8 10h8M8 14h5" />
        </>
      ) : name === "heart" ? (
        <path
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"
          fill="currentColor"
          stroke="none"
        />
      ) : name === "follow" ? (
        <>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2 21v-2a6 6 0 0 1 12 0v2M19 8v6M16 11h6" />
        </>
      ) : name === "sparkles" ? (
        <>
          <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
          <path d="M20 2v4M18 4h4" />
        </>
      ) : name === "mention" ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M16 8v6a2 2 0 0 0 4 0v-2a8 8 0 1 0-3.5 6.6" />
        </>
      ) : name === "checks" ? (
        <path d="m2 12 4 4L16 6m-5 10 3 3L24 9" />
      ) : name === "close" ? (
        <path d="m6 6 12 12M6 18 18 6" />
      ) : (
        <>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M10 21h4" />
        </>
      )}
    </svg>
  );
}

function NotificationAvatar({ notification }) {
  const [imageFailed, setImageFailed] = useState(false);
  const activity = ACTIVITY_TYPES[notification.type];

  return (
    <span className="member-notifications__avatar">
      {notification.avatar && !imageFailed ? (
        <img
          src={notification.avatar}
          alt=""
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="member-notifications__initial" aria-hidden="true">
          {(notification.actor || notification.text || "P").slice(0, 1)}
        </span>
      )}
      <span
        className="member-notifications__activity"
        data-activity={activity ? notification.type : "notification"}
        title={activity?.label || "Notification"}
      >
        <NotificationIcon name={activity?.icon || "bell"} />
      </span>
    </span>
  );
}

/**
 * Fixture-only activity preview. Read overrides live in this mounted bell, not
 * browser storage or the account. A future notification API owns persistence.
 */
export default function NotificationBell({
  notifications,
  open,
  onToggle,
  onOpenChange,
}) {
  const [filter, setFilter] = useState("all");
  const [unreadOverrides, setUnreadOverrides] = useState(() => new Map());
  const [announcement, setAnnouncement] = useState("");
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const tabsRef = useRef({});

  const isUnread = (notification) =>
    unreadOverrides.get(notification.id) ?? notification.unread ?? true;
  const unreadCount = notifications.filter(isUnread).length;
  const visibleNotifications =
    filter === "unread" ? notifications.filter(isUnread) : notifications;

  useEffect(() => {
    if (!open) return undefined;

    panelRef.current?.querySelector('[aria-selected="true"]')?.focus();

    const dismissOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) onOpenChange(false);
    };
    const dismissWithEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onOpenChange(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("keydown", dismissWithEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("keydown", dismissWithEscape);
    };
  }, [open, onOpenChange]);

  const changeReadState = (notification, unread) => {
    setUnreadOverrides((current) =>
      new Map(current).set(notification.id, unread)
    );
    setAnnouncement(`Notification marked as ${unread ? "unread" : "read"}.`);
    // Reading a row removes it from Unread; keep keyboard focus in the panel.
    if (filter === "unread" && !unread) tabsRef.current.unread?.focus();
  };

  const markAllRead = () => {
    if (!unreadCount) return;
    setUnreadOverrides((current) => {
      const next = new Map(current);
      notifications.forEach((notification) => next.set(notification.id, false));
      return next;
    });
    setAnnouncement("All notifications marked as read.");
  };

  const handleTabKeyDown = (event) => {
    let nextFilter;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      nextFilter = filter === "all" ? "unread" : "all";
    } else if (event.key === "Home") {
      nextFilter = "all";
    } else if (event.key === "End") {
      nextFilter = "unread";
    } else {
      return;
    }
    event.preventDefault();
    setFilter(nextFilter);
    tabsRef.current[nextFilter]?.focus();
  };

  return (
    <div ref={rootRef} className="member-notifications relative" data-dropdown>
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        className="member-header-action member-notifications__trigger relative flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer"
        aria-label="Notifications"
        aria-describedby="member-notifications-count"
        aria-expanded={open}
        aria-controls="member-notifications-popover"
      >
        <NotificationIcon name="bell" />
        {unreadCount > 0 && (
          <span className="member-notifications__badge" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      <span id="member-notifications-count" className="sr-only">
        {unreadCount} unread{" "}
        {unreadCount === 1 ? "notification" : "notifications"}
      </span>

      {open && (
        <section
          ref={panelRef}
          id="member-notifications-popover"
          aria-labelledby="member-notifications-title"
          className="member-header-popover member-notifications__panel"
        >
          <div className="member-notifications__heading">
            <div>
              <h2 id="member-notifications-title">Notifications</h2>
              <p>A little closer to your people.</p>
            </div>
            <button
              type="button"
              className="member-notifications__close"
              aria-label="Close notifications"
              onClick={() => {
                onOpenChange(false);
                triggerRef.current?.focus();
              }}
            >
              <NotificationIcon name="close" />
            </button>
          </div>

          <div className="member-notifications__toolbar">
            <div role="tablist" aria-label="Notification filters">
              {FILTERS.map((value) => (
                <button
                  key={value}
                  ref={(element) => {
                    tabsRef.current[value] = element;
                  }}
                  id={`member-notifications-tab-${value}`}
                  type="button"
                  role="tab"
                  aria-selected={filter === value}
                  aria-controls="member-notifications-list"
                  tabIndex={filter === value ? 0 : -1}
                  className="member-notifications__tab"
                  onClick={() => setFilter(value)}
                  onKeyDown={handleTabKeyDown}
                >
                  {value === "all" ? "All" : "Unread"}
                  {value === "unread" && unreadCount > 0 && (
                    <span aria-hidden="true">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="member-notifications__mark-all"
              aria-label="Mark all notifications as read"
              aria-disabled={unreadCount === 0}
              onClick={markAllRead}
            >
              <NotificationIcon name="checks" />
              <span>Mark all read</span>
            </button>
          </div>

          <div
            id="member-notifications-list"
            role="tabpanel"
            aria-labelledby={`member-notifications-tab-${filter}`}
            tabIndex={0}
            className="member-notifications__list"
          >
            {visibleNotifications.length > 0 ? (
              GROUPS.map((group) => {
                const items = visibleNotifications.filter(
                  (notification) =>
                    (notification.group === "earlier" ? "earlier" : "today") ===
                    group.id
                );
                if (!items.length) return null;

                return (
                  <section
                    key={group.id}
                    aria-labelledby={`member-notifications-${group.id}`}
                    className="member-notifications__group"
                  >
                    <h3 id={`member-notifications-${group.id}`}>
                      {group.label}
                    </h3>
                    <ul>
                      {items.map((notification) => {
                        const unread = isUnread(notification);
                        return (
                          <li
                            key={notification.id}
                            className="member-notifications__row"
                            data-unread={unread}
                          >
                            <button
                              type="button"
                              className="member-notifications__content"
                              onClick={() =>
                                changeReadState(notification, false)
                              }
                            >
                              <NotificationAvatar notification={notification} />
                              <span className="member-notifications__body">
                                <span className="member-notifications__text">
                                  {notification.actor && notification.action ? (
                                    <>
                                      <strong>{notification.actor}</strong>{" "}
                                      {notification.action}
                                    </>
                                  ) : (
                                    notification.text
                                  )}
                                </span>
                                {notification.preview && (
                                  <span className="member-notifications__preview">
                                    “{notification.preview}”
                                  </span>
                                )}
                                <span className="member-notifications__time">
                                  {notification.time}
                                </span>
                                <span className="sr-only">
                                  {unread ? "Unread. Mark as read." : "Read."}
                                </span>
                              </span>
                            </button>
                            <button
                              type="button"
                              className="member-notifications__read-toggle"
                              aria-label={`Mark as ${unread ? "read" : "unread"}: ${notification.text}`}
                              title={unread ? "Mark as read" : "Mark as unread"}
                              onClick={() =>
                                changeReadState(notification, !unread)
                              }
                            >
                              <span
                                className="member-notifications__unread-dot"
                                aria-hidden="true"
                              />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })
            ) : (
              <div className="member-notifications__empty">
                <span className="member-notifications__empty-icon">
                  <NotificationIcon
                    name={notifications.length ? "checks" : "bell"}
                  />
                </span>
                <h3>
                  {notifications.length
                    ? "You’re all caught up"
                    : "No notifications yet"}
                </h3>
                <p>
                  {notifications.length
                    ? "A little quiet. You’ve read all your notifications."
                    : "Kokoros, comments, and new connections will appear here."}
                </p>
                {filter === "unread" && notifications.length > 0 && (
                  <button
                    type="button"
                    className="member-notifications__show-all"
                    onClick={() => {
                      setFilter("all");
                      tabsRef.current.all?.focus();
                    }}
                  >
                    View all notifications
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="member-notifications__footer">
            Sample activity · read status is temporary
          </p>
          <span role="status" className="sr-only">
            {announcement}
          </span>
        </section>
      )}
    </div>
  );
}
