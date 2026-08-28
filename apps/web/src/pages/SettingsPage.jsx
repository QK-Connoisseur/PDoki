import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/authContext";
import MemberLayout from "../components/MemberLayout";
import { ErrorState, LoadingState } from "../components/StateViews";
import { settingsApi } from "../settings/settingsApi";
import { useBackgroundMotion } from "../appearance/backgroundMotionContext";
import {
  MEMBER_THEMES,
  useMemberTheme,
} from "../appearance/memberThemeContext";

const inputClass =
  "mt-2 w-full rounded-2xl border border-pink-100 bg-[#fffafb] px-4 py-3 text-sm text-[#4f3647] outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";
const primaryButtonClass =
  "rounded-full bg-pink-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50";

function errorMessage(error, fallback) {
  return typeof error?.message === "string" && error.message
    ? error.message
    : fallback;
}

function FormMessage({ error, success }) {
  if (error) {
    return (
      <p role="alert" className="mt-3 text-sm font-medium text-red-600">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p role="status" className="mt-3 text-sm font-medium text-green-700">
        {success}
      </p>
    );
  }
  return null;
}

function AccountDetails({ user, api, updateUser, onSecurityChange }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [email, setEmail] = useState(user.email);
  const [emailPassword, setEmailPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  useEffect(() => setDisplayName(user.displayName), [user.displayName]);
  useEffect(() => setEmail(user.email), [user.email]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const nextUser = await api.updateProfile({ displayName });
      updateUser(nextUser);
      setProfileSuccess("Display name updated.");
    } catch (error) {
      setProfileError(errorMessage(error, "We couldn't update your profile."));
    } finally {
      setProfileSaving(false);
    }
  };

  const saveEmail = async (event) => {
    event.preventDefault();
    setEmailSaving(true);
    setEmailError("");
    setEmailSuccess("");
    try {
      const nextUser = await api.changeEmail({
        email,
        currentPassword: emailPassword,
      });
      updateUser(nextUser);
      setEmailPassword("");
      setEmailSuccess(
        "Email changed. Open the new verification message in Mailpit to verify it."
      );
      onSecurityChange();
    } catch (error) {
      setEmailError(errorMessage(error, "We couldn't change your email."));
    } finally {
      setEmailSaving(false);
    }
  };

  return (
    <section className="sakura-glass-surface rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#241a22]">Account details</h2>
          <p className="mt-1 text-sm leading-6 text-[#8c6d7f]">
            Keep the name and email attached to your Pumdoki account current.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            user.emailVerified
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {user.emailVerified ? "Email verified" : "Email not verified"}
        </span>
      </div>

      <form className="mt-6" onSubmit={saveProfile}>
        <label className="block text-sm font-bold text-[#5b4153]">
          Display name
          <input
            className={inputClass}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            minLength={1}
            maxLength={50}
            autoComplete="name"
            required
          />
        </label>
        <button
          className={`${primaryButtonClass} mt-4`}
          disabled={
            profileSaving ||
            !displayName.trim() ||
            displayName.trim() === user.displayName
          }
        >
          {profileSaving ? "Saving…" : "Save display name"}
        </button>
        <FormMessage error={profileError} success={profileSuccess} />
      </form>

      <div className="my-7 border-t border-pink-50" />

      <form onSubmit={saveEmail}>
        <h3 className="font-bold text-[#5b4153]">Change email</h3>
        <p className="mt-1 text-sm leading-6 text-[#8c6d7f]">
          Changing it signs out your other sessions and requires verification of
          the new address.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-[#5b4153]">
            New email
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="block text-sm font-bold text-[#5b4153]">
            Current password
            <input
              className={inputClass}
              type="password"
              value={emailPassword}
              onChange={(event) => setEmailPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
        </div>
        <button
          className={`${primaryButtonClass} mt-4`}
          disabled={
            emailSaving ||
            !emailPassword ||
            email.trim().toLowerCase() === user.email
          }
        >
          {emailSaving ? "Changing…" : "Change email"}
        </button>
        <FormMessage error={emailError} success={emailSuccess} />
      </form>
    </section>
  );
}

function PasswordSettings({ api, onSecurityChange }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const savePassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password changed. Your other sessions were signed out.");
      onSecurityChange();
    } catch (requestError) {
      setError(errorMessage(requestError, "We couldn't change your password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="sakura-glass-surface mt-5 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#241a22]">Password</h2>
      <p className="mt-1 text-sm leading-6 text-[#8c6d7f]">
        Use at least 10 characters. A successful change signs out your other
        sessions.
      </p>
      <form className="mt-5" onSubmit={savePassword}>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-bold text-[#5b4153]">
            Current password
            <input
              className={inputClass}
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <label className="block text-sm font-bold text-[#5b4153]">
            New password
            <input
              className={inputClass}
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              minLength={10}
              maxLength={128}
              required
            />
          </label>
          <label className="block text-sm font-bold text-[#5b4153]">
            Confirm new password
            <input
              className={inputClass}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={10}
              maxLength={128}
              required
            />
          </label>
        </div>
        <button className={`${primaryButtonClass} mt-4`} disabled={saving}>
          {saving ? "Changing…" : "Change password"}
        </button>
        <FormMessage error={error} success={success} />
      </form>
    </section>
  );
}

function sessionName(userAgent) {
  if (!userAgent) return "Unknown browser";
  if (userAgent.includes("Edg/")) return "Microsoft Edge";
  if (userAgent.includes("Firefox/")) return "Firefox";
  if (userAgent.includes("Chrome/")) return "Chrome";
  if (userAgent.includes("Safari/")) return "Safari";
  return "Browser session";
}

function SessionSettings({ api, refreshKey }) {
  const [state, setState] = useState("loading");
  const [sessions, setSessions] = useState([]);
  const [revoking, setRevoking] = useState("");
  const [error, setError] = useState("");

  const loadSessions = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      setSessions(await api.getSessions());
      setState("ready");
    } catch {
      setState("error");
    }
  }, [api]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions, refreshKey]);

  const revoke = async (session) => {
    setRevoking(session.id);
    setError("");
    try {
      await api.revokeSession(session.id);
      setSessions((current) =>
        current.filter((candidate) => candidate.id !== session.id)
      );
    } catch (requestError) {
      setError(errorMessage(requestError, "We couldn't revoke that session."));
    } finally {
      setRevoking("");
    }
  };

  return (
    <section className="sakura-glass-surface mt-5 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#241a22]">Active sessions</h2>
      <p className="mt-1 text-sm leading-6 text-[#8c6d7f]">
        Review browsers signed into your account. Use the main Log out action to
        end this session.
      </p>
      {state === "loading" && <LoadingState label="Loading sessions…" />}
      {state === "error" && (
        <ErrorState
          title="Sessions unavailable"
          message="We couldn't load your active sessions."
          onRetry={loadSessions}
        />
      )}
      {state === "ready" && (
        <ul className="mt-5 divide-y divide-pink-50">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#5b4153]">
                    {sessionName(session.userAgent)}
                  </p>
                  {session.current && (
                    <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-bold text-pink-600">
                      Current session
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#a48999]">
                  {session.ipAddress || "IP unavailable"} · Started{" "}
                  {new Date(session.createdAt).toLocaleString()} · Expires{" "}
                  {new Date(session.expiresAt).toLocaleDateString()}
                </p>
              </div>
              {!session.current && (
                <button
                  type="button"
                  onClick={() => void revoke(session)}
                  disabled={revoking === session.id}
                  className="rounded-full border border-pink-200 px-4 py-2 text-xs font-bold text-pink-600 hover:bg-pink-50 disabled:opacity-50"
                  aria-label={`Revoke ${sessionName(session.userAgent)} session`}
                >
                  {revoking === session.id ? "Revoking…" : "Revoke"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <FormMessage error={error} />
    </section>
  );
}

function AppearancePreferences() {
  const { memberTheme, setMemberTheme } = useMemberTheme();
  const {
    motionRequested,
    motionEnabled,
    systemReducedMotion,
    setMotionRequested,
  } = useBackgroundMotion();

  const motionStatus = systemReducedMotion
    ? "Motion is currently off because your device requests reduced motion."
    : motionEnabled
      ? "Motion is on."
      : "Motion is off.";

  return (
    <section className="sakura-glass-surface mt-5 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#241a22]">Appearance</h2>

      <fieldset className="mt-5">
        <legend className="font-bold text-[#5b4153]">Background theme</legend>
        <p className="mt-1 text-sm leading-6 text-[#8c6d7f]">
          Choose the atmosphere behind your member experience.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            {
              value: MEMBER_THEMES.SAKURA,
              label: "Sakura",
              description: "Pearl glass, blossom light, and drifting petals.",
            },
            {
              value: MEMBER_THEMES.DARK_KNIGHT,
              label: "Dark Knight",
              description:
                "Art Deco skyline, crimson night, and slow atmospheric haze.",
            },
          ].map((theme) => {
            const selected = memberTheme === theme.value;

            return (
              <label
                key={theme.value}
                className={`member-theme-option relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition motion-reduce:transition-none ${
                  selected
                    ? "member-theme-option--selected border-pink-400 ring-2 ring-pink-100"
                    : "border-pink-100 hover:border-pink-300"
                }`}
              >
                <input
                  type="radio"
                  name="member-theme"
                  value={theme.value}
                  checked={selected}
                  onChange={() => setMemberTheme(theme.value)}
                  className="sr-only"
                />
                <span
                  className={`member-theme-option__preview member-theme-option__preview--${theme.value}`}
                  aria-hidden="true"
                />
                <span className="mt-3 flex items-center justify-between gap-3">
                  <span className="font-bold text-[#241a22]">
                    {theme.label}
                  </span>
                  <span
                    className={`member-theme-option__check grid h-5 w-5 place-items-center rounded-full border text-[11px] font-black ${
                      selected
                        ? "border-pink-500 bg-pink-500 text-white"
                        : "border-pink-200 text-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#8c6d7f]">
                  {theme.description}
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-3 text-xs leading-5 text-[#a48999]">
          Saved on this browser. Sakura remains the default on new devices.
        </p>
      </fieldset>

      <div className="mt-7 flex items-start justify-between gap-5 border-t border-pink-100 pt-6">
        <div>
          <h3 className="mt-5 font-bold text-[#5b4153]">
            Ambient background motion
          </h3>
          <p
            id="background-motion-description"
            className="mt-1 max-w-xl text-sm leading-6 text-[#8c6d7f]"
          >
            Adds quiet, theme-specific movement over the background: petals in
            Sakura, or slow clouds and fog in Dark Knight. The wallpaper itself
            remains unchanged.
          </p>
          <p className="mt-2 text-xs leading-5 text-[#a48999]">
            Saved on this browser. Pumdoki always follows your device&apos;s
            Reduce Motion setting.
          </p>
          <p
            className="mt-2 text-xs font-semibold text-[#7d536b]"
            role="status"
            aria-live="polite"
          >
            {motionStatus}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={motionEnabled}
          aria-label="Ambient background motion"
          aria-describedby="background-motion-description"
          disabled={systemReducedMotion}
          onClick={() => setMotionRequested(!motionRequested)}
          className={`relative mt-12 h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 motion-reduce:transition-none ${
            motionEnabled ? "bg-pink-500" : "bg-gray-300"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition motion-reduce:transition-none ${
              motionEnabled ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    </section>
  );
}

function ContentPreferences({ api }) {
  const [state, setState] = useState("loading");
  const [showExplicitContent, setShowExplicitContent] = useState(false);
  const [confirmingOptIn, setConfirmingOptIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const loadPreferences = useCallback(async () => {
    setState("loading");
    setSaveError("");
    try {
      const preferences = await api.getPreferences();
      setShowExplicitContent(preferences.showExplicitContent);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [api]);

  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  const savePreference = async (nextValue) => {
    setSaving(true);
    setSaveError("");
    setSavedMessage("");
    try {
      const preferences = await api.updatePreferences({
        showExplicitContent: nextValue,
      });
      setShowExplicitContent(preferences.showExplicitContent);
      setConfirmingOptIn(false);
      setSavedMessage(
        preferences.showExplicitContent
          ? "Explicit content is now visible where available."
          : "Explicit content is now hidden."
      );
    } catch {
      setSaveError("We couldn't save this preference. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = () => {
    setSaveError("");
    setSavedMessage("");
    if (showExplicitContent) void savePreference(false);
    else setConfirmingOptIn(true);
  };

  return (
    <>
      <section className="sakura-glass-surface mt-5 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 className="text-lg font-bold text-[#241a22]">
              Content preferences
            </h2>
            <h3 className="mt-5 font-bold text-[#5b4153]">
              Show explicit content
            </h3>
            <p
              id="explicit-content-description"
              className="mt-1 max-w-xl text-sm leading-6 text-[#8c6d7f]"
            >
              Allow content marked explicit to appear in your Pumdoki
              experience. You can turn this off at any time.
            </p>
          </div>
          {state === "ready" && (
            <button
              type="button"
              role="switch"
              aria-checked={showExplicitContent}
              aria-label="Show explicit content"
              aria-describedby="explicit-content-description"
              disabled={saving}
              onClick={handleToggle}
              className={`relative mt-12 h-7 w-12 shrink-0 rounded-full transition ${
                showExplicitContent ? "bg-pink-500" : "bg-gray-300"
              } disabled:cursor-wait disabled:opacity-60`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                  showExplicitContent ? "left-6" : "left-1"
                }`}
              />
            </button>
          )}
        </div>
        {state === "loading" && <LoadingState label="Loading preferences…" />}
        {state === "error" && (
          <ErrorState
            title="Preferences unavailable"
            message="We couldn't load your content preferences."
            onRetry={loadPreferences}
          />
        )}
        <FormMessage error={saveError} success={savedMessage} />
      </section>

      {confirmingOptIn && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#241a22]/35 px-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="explicit-confirm-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <h2
              id="explicit-confirm-title"
              className="text-xl font-extrabold text-[#241a22]"
            >
              Show explicit content?
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6f5667]">
              This may reveal mature material when creators label it explicit.
              This preference does not replace age or identity checks required
              for particular content.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirmingOptIn(false)}
                className="rounded-full border border-pink-200 px-4 py-2 text-sm font-bold text-[#6f5667] hover:bg-pink-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void savePreference(true)}
                className={primaryButtonClass}
              >
                {saving ? "Saving…" : "Yes, show explicit content"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SettingsPage({
  userStatus = "online",
  onStatusChange,
  api = settingsApi,
}) {
  const { user, updateUser } = useAuth();
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);

  const refreshSessions = () => setSessionRefreshKey((current) => current + 1);

  return (
    <MemberLayout
      activePage="settings"
      userStatus={userStatus}
      onStatusChange={onStatusChange}
    >
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-500">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#241a22]">
              Settings
            </h1>
            <p className="mt-2 text-sm text-[#8c6d7f]">
              Manage your account, security, appearance, and content experience.
            </p>
          </div>

          <AccountDetails
            user={user}
            api={api}
            updateUser={updateUser}
            onSecurityChange={refreshSessions}
          />
          <PasswordSettings api={api} onSecurityChange={refreshSessions} />
          <SessionSettings api={api} refreshKey={sessionRefreshKey} />
          <AppearancePreferences />
          <ContentPreferences api={api} />
        </div>
      </main>
    </MemberLayout>
  );
}
