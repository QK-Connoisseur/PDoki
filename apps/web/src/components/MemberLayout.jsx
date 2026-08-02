import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "./AppHeader";
import Sidebar, { MobileNav } from "./Sidebar";
import ChatSidebar from "./ChatSidebar";
import { chatContacts } from "../fixtures/chatContacts";
import { useOptionalAuth } from "../auth/authContext";
import { AUTH_ROLES } from "../auth/authApi";

/**
 * Shared member application shell.
 *
 * Composes the top bar, left navigation sidebar, chat rail, and mobile bottom
 * nav around page content. Previously every social page (Home, Profile, Store,
 * Connect, Promotions) re-implemented this scaffold inline; this is the single
 * source of truth. Navigation runs through React Router.
 *
 * Pages render their own `<main>` as `children` and pass any page-specific
 * overlays (compose modals, lightboxes) via `modals`. The compose menu lives in
 * the shell; it calls back into `onComposePost` / `onComposeMoment` so the page
 * keeps ownership of its modal state.
 *
 * @param {{
 *   activePage: string,
 *   onComposePost?: () => void,
 *   onComposeMoment?: () => void,
 *   userStatus?: string,
 *   onStatusChange?: (s: string) => void,
 *   onLogoClick?: () => void,
 *   bgClassName?: string,
 *   children: React.ReactNode,
 *   modals?: React.ReactNode,
 * }} props
 */
export default function MemberLayout({
  activePage,
  onComposePost,
  onComposeMoment,
  userStatus = "online",
  onStatusChange,
  onLogoClick,
  bgClassName = "bg-[#fff8fb]",
  children,
  modals,
}) {
  const navigate = useNavigate();
  const auth = useOptionalAuth();
  const showCreatorDashboard = auth?.user?.role === AUTH_ROLES.CREATOR;
  const showCreatorApplication = auth?.user?.role === AUTH_ROLES.MEMBER;
  const [showComposeMenu, setShowComposeMenu] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleNavigate = (id) => {
    if (id === "home") navigate("/home");
    else if (id === "connect") navigate("/connect");
    else if (id === "store") navigate("/store");
    else if (id === "promotions") navigate("/promotions");
  };

  const handleNavigateLegal = (subPage = "hub") =>
    navigate(subPage === "hub" ? "/legal" : `/legal/${subPage}`);

  const totalUnread = chatContacts.reduce((sum, c) => sum + c.unread, 0);

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await auth?.logout();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError(
        "We couldn’t log you out. Your session is still active; please try again."
      );
    }
  };

  return (
    <div className={`min-h-screen ${bgClassName} text-[#5b4153]`}>
      <AppHeader
        userStatus={userStatus}
        onStatusChange={onStatusChange}
        onLogoClick={onLogoClick}
        onLogout={handleLogout}
        showCreatorDashboard={showCreatorDashboard}
        showCreatorApplication={showCreatorApplication}
      />

      {logoutError && (
        <div
          role="alert"
          className="fixed right-4 top-20 z-[60] max-w-sm rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg"
        >
          {logoutError}
        </div>
      )}

      <div className="flex pt-16 min-h-screen">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          onOpenDashboard={() => navigate("/dashboard")}
          onOpenCreatorApplication={() => navigate("/creator/onboarding")}
          onOpenSettings={() => navigate("/settings")}
          showCreatorDashboard={showCreatorDashboard}
          showCreatorApplication={showCreatorApplication}
          onLogout={handleLogout}
          onNavigateLegal={handleNavigateLegal}
          showComposeMenu={showComposeMenu}
          setShowComposeMenu={setShowComposeMenu}
          onComposePost={onComposePost}
          onComposeMoment={onComposeMoment}
        />

        {children}

        <ChatSidebar contacts={chatContacts} />
      </div>

      <MobileNav
        activePage={activePage}
        onNavigate={handleNavigate}
        showComposeMenu={showComposeMenu}
        setShowComposeMenu={setShowComposeMenu}
        onComposePost={onComposePost}
        onComposeMoment={onComposeMoment}
        totalUnread={totalUnread}
      />

      {modals}
    </div>
  );
}
