import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "./AppHeader";
import Sidebar, { MobileNav } from "./Sidebar";
import ChatSidebar from "./ChatSidebar";
import { chatContacts } from "../fixtures/chatContacts";

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
  const [showComposeMenu, setShowComposeMenu] = useState(false);

  const handleNavigate = (id) => {
    if (id === "home") navigate("/home");
    else if (id === "connect") navigate("/connect");
    else if (id === "store") navigate("/store");
    else if (id === "promotions") navigate("/promotions");
  };

  const handleNavigateLegal = (subPage = "hub") =>
    navigate(subPage === "hub" ? "/legal" : `/legal/${subPage}`);

  const totalUnread = chatContacts.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className={`min-h-screen ${bgClassName} text-[#5b4153]`}>
      <AppHeader
        userStatus={userStatus}
        onStatusChange={onStatusChange}
        onLogoClick={onLogoClick}
      />

      <div className="flex pt-16 min-h-screen">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          onOpenDashboard={() => navigate("/dashboard")}
          onLogout={() => navigate("/login")}
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
