import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PumdokiLogo from "./PumdokiLogo";
import { StatusMenuRow } from "./UserStatusSwitcher";
import { notifications as defaultNotifications } from "../fixtures/notifications";

/**
 * Shared top bar for member routes: logo, search, notifications, Oasis, and the
 * profile menu. Extracted from the identical headers that were duplicated across
 * Home, Profile, Store, Connect, and Promotions. Navigation goes through React
 * Router so deep links / refresh / Back-Forward all work.
 *
 * @param {{
 *   userStatus?: string,
 *   onStatusChange?: (s: string) => void,
 *   onLogoClick?: () => void,
 *   onLogout?: () => void,
 *   showCreatorDashboard?: boolean,
 *   showCreatorApplication?: boolean,
 *   notifications?: Array<{id:number,text:string,time:string,avatar:string}>,
 * }} props
 */
export default function AppHeader({
  userStatus = "online",
  onStatusChange,
  onLogoClick,
  onLogout,
  showCreatorDashboard = false,
  showCreatorApplication = false,
  notifications = defaultNotifications,
}) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Close any open dropdown on outside click.
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-dropdown]")) {
        setShowProfileMenu(false);
        setShowNotifications(false);
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogoClick = () => {
    if (onLogoClick) onLogoClick();
    else navigate("/home");
  };

  const profileItems = [
    {
      label: "My Profile",
      icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z",
      action: () => navigate("/profile"),
    },
    ...(showCreatorDashboard
      ? [
          {
            label: "Creator Dashboard",
            icon: "M4 6h16M4 12h16M4 18h7",
            action: () => navigate("/dashboard"),
          },
        ]
      : []),
    ...(showCreatorApplication
      ? [
          {
            label: "Apply to become a creator",
            icon: "M12 3v18M3 12h18",
            action: () => navigate("/creator/onboarding"),
          },
        ]
      : []),
    {
      label: "Wallet",
      icon: "M21 4H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1zM1 10h22M16 15h2",
      action: () => navigate("/wallet"),
    },
    {
      label: "Settings",
      icon: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2zM12 9a3 3 0 100 6 3 3 0 000-6z",
      action: () => navigate("/settings"),
    },
    {
      label: "Help & Support",
      icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01",
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-pink-100 bg-white/92 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleLogoClick}
            className="cursor-pointer"
            aria-label="Pumdoki — home"
          >
            <PumdokiLogo />
          </button>
        </div>

        {/* Right: Search, Notifications, Oasis, Profile */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97] cursor-pointer"
              aria-label="Search"
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
                <div className="mt-3 text-xs text-[#b89aa8]">
                  Try searching for a creator or hashtag
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSearch(false);
                setShowProfileMenu(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97] cursor-pointer"
              aria-label="Notifications"
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
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8384f] text-[10px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-pink-100 bg-white shadow-xl overflow-hidden">
                <div className="border-b border-pink-50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-[#241a22]">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-pink-50/60 cursor-pointer"
                    >
                      <img
                        src={n.avatar}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#4a3340] leading-snug">
                          {n.text}
                        </p>
                        <p className="mt-0.5 text-xs text-[#b89aa8]">
                          {n.time}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Oasis */}
          <button
            onClick={() => navigate("/oasis")}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97] cursor-pointer"
            aria-label="Oasis"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path
                d="M12 22V13"
                stroke="#6b9a5b"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M12 17C9.5 17 7.5 15.5 8 13.5C8.5 11.5 10.5 11 12 12"
                stroke="#6b9a5b"
                strokeWidth="1"
                fill="#a8d5a2"
                fillOpacity="0.5"
              />
              <path
                d="M12 15C14.5 15 16 13.5 15.5 11.5C15 9.5 13 9 12 10"
                stroke="#6b9a5b"
                strokeWidth="1"
                fill="#a8d5a2"
                fillOpacity="0.5"
              />
              <g transform="translate(12, 7)">
                <ellipse
                  cx="0"
                  cy="-4"
                  rx="2.2"
                  ry="3"
                  fill="#f9a8c8"
                  transform="rotate(0)"
                />
                <ellipse
                  cx="0"
                  cy="-4"
                  rx="2.2"
                  ry="3"
                  fill="#f9a8c8"
                  transform="rotate(72)"
                />
                <ellipse
                  cx="0"
                  cy="-4"
                  rx="2.2"
                  ry="3"
                  fill="#f9a8c8"
                  transform="rotate(144)"
                />
                <ellipse
                  cx="0"
                  cy="-4"
                  rx="2.2"
                  ry="3"
                  fill="#f9a8c8"
                  transform="rotate(216)"
                />
                <ellipse
                  cx="0"
                  cy="-4"
                  rx="2.2"
                  ry="3"
                  fill="#f9a8c8"
                  transform="rotate(288)"
                />
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
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowSearch(false);
                setShowNotifications(false);
              }}
              className="ml-1 flex h-10 w-10 items-center justify-center cursor-pointer"
              aria-label="Profile menu"
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                alt="Your profile"
                className="h-8 w-8 rounded-full border-2 border-pink-200 object-cover transition hover:border-pink-400"
              />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-pink-100 bg-white py-2 shadow-xl">
                <StatusMenuRow
                  status={userStatus}
                  onStatusChange={onStatusChange}
                />
                <hr className="my-1 border-pink-100" />
                {profileItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action || undefined}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#5b4153] transition hover:bg-pink-50/60 hover:text-[#df5f97] cursor-pointer"
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
                      <path d={item.icon} />
                    </svg>
                    <span className="min-w-0 flex-1 text-left leading-snug">
                      {item.label}
                    </span>
                  </button>
                ))}
                <hr className="my-1 border-pink-100" />
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#e8384f] transition hover:bg-red-50/60 cursor-pointer"
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
  );
}
