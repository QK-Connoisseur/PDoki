/**
 * Route guard placeholder.
 *
 * Phase 1 has no real authentication yet, so this currently renders its
 * children unchanged. It exists to establish the guarding seam: once session
 * auth lands (Phase 3), this will read auth state, redirect unauthenticated
 * users to `/login`, and enforce `roles` server-confirmed permissions.
 *
 * NOTE: Hiding a route here is never a substitute for API-enforced
 * authorization — the backend remains the source of truth.
 *
 * @param {{ roles?: string[], children: React.ReactNode }} props
 */
export default function ProtectedRoute({ roles, children }) {
  // TODO(phase-3): replace with real session/role checks + <Navigate to="/login" />.
  void roles;
  return <>{children}</>;
}
