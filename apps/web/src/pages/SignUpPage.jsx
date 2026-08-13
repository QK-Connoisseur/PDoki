import { useState } from "react";
import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
} from "../auth/policyVersions";
import Footer from "../components/Footer";
import PumdokiLogo from "../components/PumdokiLogo";

const MEMBER_BENEFITS = [
  {
    title: "Discover creators",
    body: "Follow the people and communities that feel worth your time.",
  },
  {
    title: "Join the conversation",
    body: "Keep messages, moments, and member activity in one place.",
  },
  {
    title: "Stay in control",
    body: "Manage your profile, privacy, and experience on your terms.",
  },
];

const inputClassName = (hasError) =>
  `w-full rounded-2xl border bg-[#fffafc] px-4 py-3 text-sm text-[#241a22] outline-none transition placeholder:text-[#c59aae] focus:ring-2 focus:ring-pink-100 ${
    hasError
      ? "border-red-300 bg-red-50/30 focus:border-red-300"
      : "border-pink-100 focus:border-pink-300"
  }`;

export default function SignUpPage({ onRegister, onBack, onNavigateLegal }) {
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirm: "",
    ageAgree: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.displayName.trim())
      nextErrors.displayName = "Display name is required";
    else if (form.displayName.trim().length > 50)
      nextErrors.displayName = "Use 50 characters or fewer";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      nextErrors.email = "Invalid email address";
    if (!form.password) nextErrors.password = "Password is required";
    else if (form.password.length < 10)
      nextErrors.password = "At least 10 characters";
    else if (form.password.length > 128)
      nextErrors.password = "Use 128 characters or fewer";
    if (form.password !== form.confirm)
      nextErrors.confirm = "Passwords do not match";
    if (!form.ageAgree)
      nextErrors.ageAgree = "You must confirm your age and agree to the terms";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setPending(true);
    setSubmitError("");
    try {
      await onRegister({
        displayName: form.displayName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        ageAttested: true,
        acceptedTermsVersion: CURRENT_TERMS_VERSION,
        acceptedPrivacyVersion: CURRENT_PRIVACY_VERSION,
      });
    } catch (error) {
      if (error?.status === 409 || error?.code === "CONFLICT") {
        setSubmitError("An account already exists for this email address.");
      } else if (error?.status === 429 || error?.code === "RATE_LIMITED") {
        setSubmitError("Too many requests. Please wait and try again.");
      } else {
        setSubmitError(
          "We couldn’t create your account. Check your connection and try again."
        );
      }
    } finally {
      setPending(false);
    }
  };

  const navLegal = (subpage) => onNavigateLegal && onNavigateLegal(subpage);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff8fb] text-[#5b4153]">
      <div className="absolute left-4 top-4 z-30 rounded-full border border-white/65 bg-white/75 px-4 py-2 shadow-sm backdrop-blur-md sm:left-8 lg:left-10 xl:left-16">
        <PumdokiLogo />
      </div>
      <main className="relative z-10 grid min-h-screen lg:grid-cols-[0.86fr_1.14fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#ffc8de] via-[#ffb6d5] to-[#f9a8c7] px-10 py-10 lg:flex lg:flex-col xl:px-16">
          <div
            className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full border border-white/40 bg-white/15"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full border border-white/30 bg-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-14 top-28 text-4xl text-white/45"
            aria-hidden="true"
          >
            ♡
          </div>
          <div className="relative z-10 my-auto max-w-xl py-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/35 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b3048] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f0447f]" />
              Member account
            </span>
            <h2 className="mt-6 text-4xl font-semibold leading-tight text-[#241a22] xl:text-5xl">
              Your place to connect starts here.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-[#553744] xl:text-lg">
              Create one account for the creators, conversations, and moments
              you want to keep close.
            </p>

            <div className="mt-8 space-y-3">
              {MEMBER_BENEFITS.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-3 rounded-2xl border border-white/55 bg-white/42 px-4 py-3.5 backdrop-blur-md"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#e7558e] shadow-sm">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#2f2029]">
                      {benefit.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-5 text-[#634454]">
                      {benefit.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs leading-5 text-[#684858]">
            A community for adults, built around presence and real interaction.
          </p>
        </section>

        <section className="relative flex min-h-screen flex-col px-4 sm:px-8 lg:px-10 xl:px-16">
          <div
            className="pointer-events-none absolute -right-32 top-16 h-80 w-80 rounded-full bg-pink-100/45 blur-3xl"
            aria-hidden="true"
          />
          <header className="relative z-10 flex h-20 shrink-0 items-center justify-end">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[#7b5b6f] transition hover:bg-white hover:text-[#df5f97] lg:ml-auto"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back to login
            </button>
          </header>

          <div className="relative z-10 flex flex-1 items-center justify-center py-5 sm:py-8">
            <div className="w-full max-w-xl">
              <div className="rounded-[32px] border border-pink-100 bg-white/95 p-5 shadow-[0_24px_70px_rgba(244,114,182,0.16)] backdrop-blur-md sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-200 to-pink-300 text-[#7d435d] shadow-sm">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 21s-7-4.35-7-11a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 6.65-7 11-7 11Z" />
                    </svg>
                  </span>
                  <div>
                    <h1 className="text-2xl font-semibold text-[#6b475e] sm:text-3xl">
                      Create your account
                    </h1>
                    <p className="mt-1 text-sm leading-6 text-[#8c6d7f]">
                      Join Pumdoki as a member. It only takes a minute.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-pink-100 bg-[#fff6fa] px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#241a22] text-xs font-bold text-white">
                    18+
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#5b4153]">
                      Adults only
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-[#8c6d7f]">
                      Pumdoki hosts adult content. You must be 18 or older to
                      create an account.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-5 space-y-5"
                >
                  {submitError && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {submitError}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="signup-display-name"
                        className="mb-2 block text-sm font-medium text-[#7b5b6f]"
                      >
                        Display name
                      </label>
                      <input
                        id="signup-display-name"
                        type="text"
                        value={form.displayName}
                        onChange={set("displayName")}
                        placeholder="How you’ll appear"
                        autoComplete="name"
                        aria-invalid={Boolean(errors.displayName)}
                        aria-describedby={
                          errors.displayName
                            ? "signup-display-name-error"
                            : undefined
                        }
                        className={inputClassName(errors.displayName)}
                      />
                      {errors.displayName && (
                        <p
                          id="signup-display-name-error"
                          className="mt-1.5 text-xs text-red-500"
                        >
                          {errors.displayName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="signup-email"
                        className="mb-2 block text-sm font-medium text-[#7b5b6f]"
                      >
                        Email address
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        placeholder="you@example.com"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                          errors.email ? "signup-email-error" : undefined
                        }
                        className={inputClassName(errors.email)}
                      />
                      {errors.email && (
                        <p
                          id="signup-email-error"
                          className="mt-1.5 text-xs text-red-500"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="signup-password"
                        className="mb-2 block text-sm font-medium text-[#7b5b6f]"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={set("password")}
                          placeholder="10–128 characters"
                          autoComplete="new-password"
                          aria-invalid={Boolean(errors.password)}
                          aria-describedby={
                            errors.password
                              ? "signup-password-error"
                              : undefined
                          }
                          className={`${inputClassName(errors.password)} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((visible) => !visible)}
                          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#c59aae] transition hover:bg-pink-50 hover:text-[#8c6d7f]"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <path d="m1 1 22 22" />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p
                          id="signup-password-error"
                          className="mt-1.5 text-xs text-red-500"
                        >
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="signup-confirm-password"
                        className="mb-2 block text-sm font-medium text-[#7b5b6f]"
                      >
                        Confirm password
                      </label>
                      <input
                        id="signup-confirm-password"
                        type={showPassword ? "text" : "password"}
                        value={form.confirm}
                        onChange={set("confirm")}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        aria-invalid={Boolean(errors.confirm)}
                        aria-describedby={
                          errors.confirm ? "signup-confirm-error" : undefined
                        }
                        className={inputClassName(errors.confirm)}
                      />
                      {errors.confirm && (
                        <p
                          id="signup-confirm-error"
                          className="mt-1.5 text-xs text-red-500"
                        >
                          {errors.confirm}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl border px-4 py-3.5 transition ${
                      errors.ageAgree
                        ? "border-red-200 bg-red-50/30"
                        : "border-pink-100 bg-pink-50/35"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        id="signup-age-agreement"
                        type="checkbox"
                        checked={form.ageAgree}
                        onChange={set("ageAgree")}
                        aria-invalid={Boolean(errors.ageAgree)}
                        aria-describedby={
                          errors.ageAgree
                            ? "signup-agreement-details signup-agreement-error"
                            : "signup-agreement-details"
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-pink-300 accent-[#df5f97]"
                      />
                      <div>
                        <label
                          htmlFor="signup-age-agreement"
                          className="cursor-pointer text-sm font-medium leading-5 text-[#5b4153]"
                        >
                          I confirm I am 18 years of age or older.
                        </label>
                        <p
                          id="signup-agreement-details"
                          className="mt-1 text-xs leading-5 text-[#8c6d7f]"
                        >
                          By checking this box, I also agree to the{" "}
                          <button
                            type="button"
                            onClick={() => navLegal("terms")}
                            className="font-semibold text-[#df5f97] hover:underline"
                          >
                            Terms of Service
                          </button>{" "}
                          and{" "}
                          <button
                            type="button"
                            onClick={() => navLegal("privacy")}
                            className="font-semibold text-[#df5f97] hover:underline"
                          >
                            Privacy Policy
                          </button>
                          .
                        </p>
                      </div>
                    </div>
                    {errors.ageAgree && (
                      <p
                        id="signup-agreement-error"
                        className="mt-2 text-xs text-red-500"
                      >
                        {errors.ageAgree}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={pending || !form.ageAgree}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#f472b6] to-[#ec4899] py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(236,72,153,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(236,72,153,0.3)] disabled:cursor-not-allowed disabled:from-[#f3e0ea] disabled:to-[#f3e0ea] disabled:text-[#c9aab8] disabled:shadow-none disabled:hover:translate-y-0"
                  >
                    {pending ? "Creating account…" : "Create Account"}
                  </button>

                  <div className="flex items-center gap-3">
                    <hr className="flex-1 border-pink-100" />
                    <span className="text-xs text-[#b89aa8]">or</span>
                    <hr className="flex-1 border-pink-100" />
                  </div>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-2xl border border-pink-100 bg-white py-2.5 text-sm font-medium text-[#5b4153] opacity-60"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google sign-up unavailable
                  </button>
                </form>

                <p className="mt-5 text-center text-xs text-[#9e8090]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onBack}
                    className="font-semibold text-[#df5f97] hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>

              <Footer compact onNavigateLegal={onNavigateLegal} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
