import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import OasisPage from "./pages/OasisPage";
import ConnectPage from "./pages/ConnectPage";
import StorePage from "./pages/StorePage";
import PromotionsPage from "./pages/PromotionsPage";
import CreatorDashboardPage from "./pages/CreatorDashboardPage";
import WalletPage from "./pages/WalletPage";
import SignUpPage from "./pages/SignUpPage";
import LegalHubPage from "./pages/LegalHubPage";
import CreatorOnboardingPage from "./pages/CreatorOnboardingPage";
import CookieConsentBanner from "./components/CookieConsentBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { EmptyState } from "./components/StateViews";

/**
 * Navigation adapter.
 *
 * Some screens (Wallet, Creator Dashboard, Oasis, Login, onboarding, legal)
 * still render their own headers and were written against an object of
 * `onOpen*`/`onBack` callbacks. This hook reproduces that callback shape on top
 * of React Router so those pages render unchanged.
 *
 * The member social pages (Home, Profile, Store, Connect, Promotions) now use
 * the shared `MemberLayout` shell, which handles navigation through Router
 * directly; they only need `userStatus`/`onStatusChange`, passed as `member`.
 */
function useNav(userStatus, onStatusChange) {
  const navigate = useNavigate();
  return {
    onBack: () => navigate("/home"),
    onLogout: () => navigate("/login"),
    onViewProfile: () => navigate("/profile"),
    onOpenOasis: () => navigate("/oasis"),
    onOpenConnect: () => navigate("/connect"),
    onOpenStore: () => navigate("/store"),
    onOpenPromotions: () => navigate("/promotions"),
    onOpenDashboard: () => navigate("/dashboard"),
    onOpenWallet: () => navigate("/wallet"),
    onOpenCreatorOnboarding: () => navigate("/creator/onboarding"),
    onNavigateLegal: (subPage = "hub") =>
      navigate(subPage === "hub" ? "/legal" : `/legal/${subPage}`),
    userStatus,
    onStatusChange,
  };
}

function LegalRoute({ nav }) {
  const { page } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <LegalHubPage onBack={() => navigate(-1)} initialPage={page || "hub"} />
      <CookieConsentBanner onNavigateLegal={nav.onNavigateLegal} />
    </>
  );
}

/**
 * Placeholder for the future Admin area (PLAN Phase 11). The route group exists
 * now so the guarding seam is in place; real admin screens land later and are
 * always API-authorized, never merely link-hidden.
 */
function AdminPlaceholder() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff8fb]">
      <EmptyState
        title="Admin area"
        message="The moderation and operations console arrives in a later phase."
      />
    </div>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const [userStatus, setUserStatus] = useState("online");
  const nav = useNav(userStatus, setUserStatus);
  // Props the shared-shell social pages need (navigation is handled by the shell).
  const member = { userStatus, onStatusChange: setUserStatus };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ─── Public / auth ─────────────────────────────────────────── */}
      <Route
        path="/login"
        element={
          <>
            <LoginPage
              onLogin={() => navigate("/home")}
              onOpenSignup={() => navigate("/signup")}
              onNavigateLegal={nav.onNavigateLegal}
            />
            <CookieConsentBanner onNavigateLegal={nav.onNavigateLegal} />
          </>
        }
      />
      <Route
        path="/signup"
        element={
          <>
            <SignUpPage
              onLogin={() => navigate("/home")}
              onBack={() => navigate("/login")}
              onNavigateLegal={nav.onNavigateLegal}
            />
            <CookieConsentBanner onNavigateLegal={nav.onNavigateLegal} />
          </>
        }
      />

      {/* ─── Member ────────────────────────────────────────────────── */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage {...member} />
            <CookieConsentBanner onNavigateLegal={nav.onNavigateLegal} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:creatorId?"
        element={
          <ProtectedRoute>
            <ProfilePage {...member} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/connect"
        element={
          <ProtectedRoute>
            <ConnectPage {...member} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store"
        element={
          <ProtectedRoute>
            <StorePage {...member} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/promotions"
        element={
          <ProtectedRoute>
            <PromotionsPage {...member} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <WalletPage {...nav} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/oasis"
        element={
          <ProtectedRoute>
            <OasisPage onBack={nav.onBack} />
          </ProtectedRoute>
        }
      />

      {/* ─── Creator ───────────────────────────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["creator"]}>
            <CreatorDashboardPage {...nav} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator/onboarding"
        element={
          <ProtectedRoute>
            <CreatorOnboardingPage
              onBack={() => navigate(-1)}
              onComplete={() => navigate("/dashboard")}
              onNavigateLegal={nav.onNavigateLegal}
            />
            <CookieConsentBanner onNavigateLegal={nav.onNavigateLegal} />
          </ProtectedRoute>
        }
      />

      {/* ─── Admin (Phase 11 — protected placeholder) ──────────────── */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminPlaceholder />
          </ProtectedRoute>
        }
      />

      {/* ─── Legal ─────────────────────────────────────────────────── */}
      <Route path="/legal" element={<LegalRoute nav={nav} />} />
      <Route path="/legal/:page" element={<LegalRoute nav={nav} />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
