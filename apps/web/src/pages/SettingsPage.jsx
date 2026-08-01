import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/authContext";
import MemberLayout from "../components/MemberLayout";
import { ErrorState, LoadingState } from "../components/StateViews";
import { settingsApi } from "../settings/settingsApi";

export default function SettingsPage({
  userStatus = "online",
  onStatusChange,
  api = settingsApi,
}) {
  const { user } = useAuth();
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
      setSaveError("We couldn’t save this preference. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = () => {
    setSaveError("");
    setSavedMessage("");
    if (showExplicitContent) {
      void savePreference(false);
    } else {
      setConfirmingOptIn(true);
    }
  };

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
              Manage your account and content experience.
            </p>
          </div>

          <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#241a22]">
              Account overview
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#a48999]">
                  Display name
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#5b4153]">
                  {user.displayName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#a48999]">
                  Email
                </dt>
                <dd className="mt-1 break-all text-sm font-semibold text-[#5b4153]">
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#a48999]">
                  Email status
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#5b4153]">
                  {user.emailVerified ? "Verified" : "Not verified"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#a48999]">
                  Role
                </dt>
                <dd className="mt-1 text-sm font-semibold capitalize text-[#5b4153]">
                  {user.role.toLowerCase()}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-5 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
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

            {state === "loading" && (
              <LoadingState label="Loading preferences…" />
            )}
            {state === "error" && (
              <ErrorState
                title="Preferences unavailable"
                message="We couldn’t load your content preferences."
                onRetry={loadPreferences}
              />
            )}

            {saveError && (
              <p role="alert" className="mt-4 text-sm font-medium text-red-600">
                {saveError}
              </p>
            )}
            {savedMessage && (
              <p
                role="status"
                className="mt-4 text-sm font-medium text-green-700"
              >
                {savedMessage}
              </p>
            )}
          </section>
        </div>
      </main>

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
                className="rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white hover:bg-pink-600 disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? "Saving…" : "Yes, show explicit content"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MemberLayout>
  );
}
