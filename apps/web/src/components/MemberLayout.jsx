import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "./AppHeader";
import EmailVerificationBanner from "./EmailVerificationBanner";
import Sidebar, { MobileNav } from "./Sidebar";
import ChatSidebar from "./ChatSidebar";
import SakuraBackdrop from "./SakuraBackdrop";
import DarkKnightBackdrop from "./DarkKnightBackdrop";
import MomentComposer from "./MomentComposer";
import PostComposer from "./PostComposer";
import { chatContacts } from "../fixtures/chatContacts";
import { useOptionalAuth } from "../auth/authContext";
import { AUTH_ROLES } from "../auth/authApi";
import {
  DEFAULT_MEMBER_THEME,
  MEMBER_THEMES,
  useOptionalMemberTheme,
} from "../appearance/memberThemeContext";

/**
 * Shared member application shell.
 *
 * Composes the top bar, left navigation sidebar, chat rail, and mobile bottom
 * nav around page content. Previously every social page (Home, Profile, Store,
 * Connect, Promotions) re-implemented this scaffold inline; this is the single
 * source of truth. Navigation runs through React Router.
 *
 * Pages render their own `<main>` as `children` and pass any page-specific
 * overlays (compose modals, lightboxes) via `modals`. The compose menu in
 * the shell always offers both creation actions. Pages can keep ownership of
 * their editors via `onComposePost` / `onComposeMoment`; otherwise the shell
 * opens the same shared prototype editors without changing the current route.
 *
 * @param {{
 *   activePage: string,
 *   onComposePost?: () => void,
 *   onComposeMoment?: () => void,
 *   userStatus?: string,
 *   onStatusChange?: (s: string) => void,
 *   onLogoClick?: () => void,
 *   bgClassName?: string,
 *   visualVariant?: "default" | "sakura-glass",
 *   memberTheme?: "sakura" | "dark-knight" | "none",
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
  visualVariant = "sakura-glass",
  memberTheme,
  children,
  modals,
}) {
  const navigate = useNavigate();
  const auth = useOptionalAuth();
  const themePreference = useOptionalMemberTheme();
  const resolvedMemberTheme =
    memberTheme ?? themePreference?.memberTheme ?? DEFAULT_MEMBER_THEME;
  const showCreatorDashboard = auth?.user?.role === AUTH_ROLES.CREATOR;
  const showCreatorApplication = auth?.user?.role === AUTH_ROLES.MEMBER;
  const [showComposeMenu, setShowComposeMenu] = useState(false);
  const [activeComposer, setActiveComposer] = useState(null);
  const [logoutError, setLogoutError] = useState("");
  const handleComposePost = onComposePost ?? (() => setActiveComposer("post"));
  const handleComposeMoment =
    onComposeMoment ?? (() => setActiveComposer("moment"));

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
    <div
      className={`relative isolate min-h-screen ${bgClassName} text-[#5b4153]`}
      data-member-visual={visualVariant}
      data-member-theme={resolvedMemberTheme}
    >
      {visualVariant === "sakura-glass" &&
        resolvedMemberTheme === MEMBER_THEMES.SAKURA && <SakuraBackdrop />}
      {visualVariant === "sakura-glass" &&
        resolvedMemberTheme === MEMBER_THEMES.DARK_KNIGHT && (
          <DarkKnightBackdrop />
        )}

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

      <div className="pt-16">
        <div className="flex min-h-[calc(100vh-4rem)]">
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
            onComposePost={handleComposePost}
            onComposeMoment={handleComposeMoment}
          />

          <div
            className="flex min-w-0 flex-1 flex-col"
            data-member-center-column
          >
            {auth && <EmailVerificationBanner />}
            {children}
          </div>

          <ChatSidebar contacts={chatContacts} />
        </div>
      </div>

      <MobileNav
        activePage={activePage}
        onNavigate={handleNavigate}
        showComposeMenu={showComposeMenu}
        setShowComposeMenu={setShowComposeMenu}
        onComposePost={handleComposePost}
        onComposeMoment={handleComposeMoment}
        totalUnread={totalUnread}
      />

      {modals}
      {activeComposer === "post" && (
        <PostComposer onClose={() => setActiveComposer(null)} />
      )}
      {activeComposer === "moment" && (
        <MomentComposer onClose={() => setActiveComposer(null)} />
      )}
    </div>
  );
}
