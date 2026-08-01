import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { AUTH_ROLES } from "./auth/authApi";
import { useAuth } from "./auth/authContext";
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
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import LegalHubPage from "./pages/LegalHubPage";
import CreatorOnboardingPage from "./pages/CreatorOnboardingPage";
import CookieConsentBanner from "./components/CookieConsentBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

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
  const { logout, user } = useAuth();
  return {
    onBack: () => navigate("/home"),
    onLogout: async () => {
      try {
        await logout();
        navigate("/login", { replace: true });
      } catch {
        // Keep the user on the protected page when the server could not revoke
        // the session; a later retry remains possible.
      }
    },
    onViewProfile: () => navigate("/profile"),
    onOpenOasis: () => navigate("/oasis"),
    onOpenConnect: () => navigate("/connect"),
    onOpenStore: () => navigate("/store"),
    onOpenPromotions: () => navigate("/promotions"),
    onOpenDashboard: () => navigate("/dashboard"),
    onOpenWallet: () => navigate("/wallet"),
    onOpenCreatorOnboarding: () => navigate("/creator/onboarding"),
    showCreatorDashboard: user?.role === AUTH_ROLES.CREATOR,
    onNavigateLegal: (subPage = "hub") =>
      navigate(subPage === "hub" ? "/legal" : `/legal/${subPage}`),
    userStatus,
    onStatusChange,
  };
}

function LoginRoute({ nav }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requested = location.state?.from;
  const destination =
    typeof requested?.pathname === "string"
      ? `${requested.pathname}${requested.search || ""}${requested.hash || ""}`
      : "/home";

  const login = async (input) => {
    await auth.login(input);
    navigate(destination, { replace: true });
  };

  return (
    <PublicOnlyRoute redirectTo={destination}>
      <LoginPage
        onLogin={login}
        onOpenSignup={() => navigate("/signup")}
        onForgotPassword={() => navigate("/forgot-password")}
        onNavigateLegal={nav.onNavigateLegal}
      />
      <CookieConsentBanner onNavigateLegal={nav.onNavigateLegal} />
    </PublicOnlyRoute>
  );
}

function SignUpRoute({ nav }) {
  const auth = useAuth();
  const navigate = useNavigate();

  return (
    <PublicOnlyRoute>
      <SignUpPage
        onRegister={async (input) => {
          await auth.register(input);
          navigate("/home", { replace: true });
        }}
        onBack={() => navigate("/login")}
        onNavigateLegal={nav.onNavigateLegal}
      />
      <CookieConsentBanner onNavigateLegal={nav.onNavigateLegal} />
    </PublicOnlyRoute>
  );
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

function AppShell() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [userStatus, setUserStatus] = useState("online");
  const nav = useNav(userStatus, setUserStatus);
  // Props the shared-shell social pages need (navigation is handled by the shell).
  const member = { userStatus, onStatusChange: setUserStatus };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ─── Public / auth ─────────────────────────────────────────── */}
      <Route path="/login" element={<LoginRoute nav={nav} />} />
      <Route path="/signup" element={<SignUpRoute nav={nav} />} />
      <Route
        path="/forgot-password"
        element={
          <ForgotPasswordPage
            onRequest={auth.requestPasswordReset}
            onBack={() => navigate("/login")}
          />
        }
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

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
          <ProtectedRoute roles={[AUTH_ROLES.CREATOR]}>
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
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
