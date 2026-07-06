import { useState } from "react";

export default function SignUpPage({ onLogin, onBack, onNavigateLegal }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    ageAgree: false,
    termsAgree: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const set = (field) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required";
    else if (form.username.length < 3) errs.username = "At least 3 characters";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "At least 8 characters";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    if (!form.ageAgree)
      errs.ageAgree = "You must confirm your age and agree to the terms";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onLogin && onLogin();
  };

  const navLegal = (sub) => onNavigateLegal && onNavigateLegal(sub);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8fb] via-[#fdf0f7] to-[#fce8f3] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-[#8c6d7f] transition hover:text-[#df5f97]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to login
        </button>
        <span
          className="text-lg font-bold"
          style={{
            background: "linear-gradient(90deg,#FF4D8D,#f472b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Pumdoki
        </span>
      </header>

      {/* Age Warning Banner */}
      <div className="mx-4 mt-2 sm:mx-auto sm:max-w-md">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3">
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Adult Content Platform — 18+ Only
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
              Pumdoki hosts adult content. You must be 18 years of age or older
              to create an account. By registering, you confirm you meet this
              requirement.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <main className="flex flex-1 items-start justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-pink-100 bg-white/92 px-7 py-8 shadow-xl backdrop-blur-md">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#241a22]">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-[#9e8090]">
                Join Pumdoki and start your journey
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Username */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8c6d7f]">
                  Username
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={set("username")}
                  placeholder="yourhandle"
                  autoComplete="username"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-[#241a22] placeholder-[#c9aab8] outline-none transition focus:ring-2 focus:ring-pink-200 ${errors.username ? "border-red-300 bg-red-50/30" : "border-pink-100 bg-white focus:border-pink-200"}`}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8c6d7f]">
                  Email address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-[#241a22] placeholder-[#c9aab8] outline-none transition focus:ring-2 focus:ring-pink-200 ${errors.email ? "border-red-300 bg-red-50/30" : "border-pink-100 bg-white focus:border-pink-200"}`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8c6d7f]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className={`w-full rounded-xl border px-4 py-2.5 pr-10 text-sm text-[#241a22] placeholder-[#c9aab8] outline-none transition focus:ring-2 focus:ring-pink-200 ${errors.password ? "border-red-300 bg-red-50/30" : "border-pink-100 bg-white focus:border-pink-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c9aab8] hover:text-[#8c6d7f]"
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
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
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
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8c6d7f]">
                  Confirm password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-[#241a22] placeholder-[#c9aab8] outline-none transition focus:ring-2 focus:ring-pink-200 ${errors.confirm ? "border-red-300 bg-red-50/30" : "border-pink-100 bg-white focus:border-pink-200"}`}
                />
                {errors.confirm && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>
                )}
              </div>

              {/* Divider */}
              <hr className="border-pink-100" />

              {/* Clickwrap Agreement — mandatory, not pre-checked */}
              <div
                className={`rounded-2xl border px-4 py-3.5 transition ${errors.ageAgree ? "border-red-200 bg-red-50/30" : "border-pink-100 bg-pink-50/30"}`}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={form.ageAgree}
                      onChange={set("ageAgree")}
                      className="h-4 w-4 cursor-pointer rounded border-pink-300 text-[#df5f97] accent-[#df5f97]"
                    />
                  </div>
                  <span className="text-sm leading-relaxed text-[#5b4153]">
                    I am <strong>18 years of age or older</strong>, and I agree
                    to the{" "}
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
                  </span>
                </label>
                {errors.ageAgree && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.ageAgree}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-2xl py-3 text-sm font-bold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: form.ageAgree
                    ? "linear-gradient(90deg,#FF4D8D,#f472b6)"
                    : "#f3e0ea",
                  boxShadow: form.ageAgree
                    ? "0 4px 20px rgba(255,77,141,0.30)"
                    : "none",
                  color: form.ageAgree ? "white" : "#c9aab8",
                }}
              >
                Create Account
              </button>

              {/* Google */}
              <div className="flex items-center gap-3">
                <hr className="flex-1 border-pink-100" />
                <span className="text-xs text-[#b89aa8]">or</span>
                <hr className="flex-1 border-pink-100" />
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-pink-100 bg-white py-2.5 text-sm font-medium text-[#5b4153] transition hover:border-pink-200 hover:bg-pink-50/40"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4.5 w-4.5 shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-[#b89aa8]">
              Already have an account?{" "}
              <button
                onClick={onBack}
                className="font-semibold text-[#df5f97] hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Compact legal footer */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[#c9aab8]">
            <button
              onClick={() => navLegal("terms")}
              className="hover:text-[#df5f97]"
            >
              Terms
            </button>
            <span>·</span>
            <button
              onClick={() => navLegal("privacy")}
              className="hover:text-[#df5f97]"
            >
              Privacy
            </button>
            <span>·</span>
            <button
              onClick={() => navLegal("cookies")}
              className="hover:text-[#df5f97]"
            >
              Cookies
            </button>
            <span>·</span>
            <button
              onClick={() => navLegal("2257")}
              className="font-medium text-[#b89aa8] hover:text-[#df5f97]"
            >
              18 USC §2257
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
