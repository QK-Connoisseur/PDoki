import { useState, useRef } from "react";

const STEPS = [
  {
    id: 1,
    label: "Agreements",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: 2,
    label: "Verification",
    icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2",
  },
  {
    id: 3,
    label: "Policy",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
];

function FileDropZone({ label, hint, accept, file, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handle = (f) => {
    if (f) onFile(f);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files[0]);
      }}
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all ${
        dragging
          ? "border-[#df5f97] bg-pink-50/60"
          : file
            ? "border-green-300 bg-green-50/40"
            : "border-pink-200 bg-pink-50/20 hover:border-pink-300 hover:bg-pink-50/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handle(e.target.files[0])}
      />
      {file ? (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-700">{file.name}</p>
            <p className="text-xs text-green-600">
              {(file.size / 1024).toFixed(1)} KB · Click to replace
            </p>
          </div>
        </>
      ) : (
        <>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              background:
                "linear-gradient(135deg,rgba(255,77,141,0.12),rgba(244,114,182,0.08))",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-[#df5f97]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#241a22]">{label}</p>
            <p className="text-xs text-[#9e8090]">{hint}</p>
          </div>
        </>
      )}
    </div>
  );
}

function CheckItem({ checked, onChange, children, required }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 transition ${
        checked
          ? "border-pink-200 bg-pink-50/40"
          : "border-pink-100 bg-white/60 hover:border-pink-200"
      }`}
    >
      <div className="mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-pink-300 accent-[#df5f97]"
        />
      </div>
      <span className="text-sm leading-relaxed text-[#5b4153]">
        {children}
        {required && <span className="ml-1 text-[#df5f97]">*</span>}
      </span>
    </label>
  );
}

export default function CreatorOnboardingPage({
  onBack,
  onComplete,
  onNavigateLegal,
}) {
  const [step, setStep] = useState(1);
  const [agreements, setAgreements] = useState({
    creator: false,
    payout: false,
  });
  const [idFile, setIdFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [policy, setPolicy] = useState({ ncii: false, trafficking: false });
  const [submitted, setSubmitted] = useState(false);

  const navLegal = (sub) => onNavigateLegal && onNavigateLegal(sub);

  const step1Valid = agreements.creator && agreements.payout;
  const step2Valid = idFile && selfieFile;
  const step3Valid = policy.ncii && policy.trafficking;

  const handleComplete = () => {
    setSubmitted(true);
    setTimeout(() => onComplete && onComplete(), 2000);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#fff8fb] via-[#fdf0f7] to-[#fce8f3] px-4">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg,#FF4D8D,#f472b6)",
            boxShadow: "0 8px 32px rgba(255,77,141,0.35)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-10 w-10 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#241a22]">
            Application Submitted!
          </h2>
          <p className="mt-2 text-sm text-[#9e8090]">
            Your creator application is under review. We'll be in touch within
            1-3 business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8fb] via-[#fdf0f7] to-[#fce8f3]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 sm:px-8 border-b border-pink-100 bg-white/70 backdrop-blur-sm">
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
          Back
        </button>
        <span
          className="text-lg font-bold"
          style={{
            background: "linear-gradient(90deg,#FF4D8D,#f472b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Creator Onboarding
        </span>
        <span className="text-sm font-medium text-[#9e8090]">
          Step {step} of {STEPS.length}
        </span>
      </header>

      {/* Progress */}
      <div className="border-b border-pink-100 bg-white/60 px-5 py-4 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300"
                    style={{
                      borderColor: step >= s.id ? "#df5f97" : "#f3dce8",
                      background:
                        step > s.id
                          ? "linear-gradient(135deg,#FF4D8D,#f472b6)"
                          : step === s.id
                            ? "rgba(223,95,151,0.08)"
                            : "white",
                    }}
                  >
                    {step > s.id ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-4 w-4 ${step === s.id ? "text-[#df5f97]" : "text-[#d4b8c8]"}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={s.icon} />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`hidden text-xs font-medium sm:block ${step === s.id ? "text-[#df5f97]" : step > s.id ? "text-[#8c6d7f]" : "text-[#c9aab8]"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="mx-2 h-0.5 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background:
                        step > s.id
                          ? "linear-gradient(90deg,#FF4D8D,#f472b6)"
                          : "#f3dce8",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-pink-100 bg-white/88 px-7 py-8 shadow-xl backdrop-blur-md">
          {/* Step 1: Agreements */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#241a22]">
                  Review & Accept Agreements
                </h2>
                <p className="mt-1 text-sm text-[#9e8090]">
                  Please carefully read and accept the following agreements
                  before continuing.
                </p>
              </div>

              {/* Creator Agreement */}
              <div className="mb-4 rounded-2xl border border-pink-100 bg-pink-50/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-[#241a22]">
                    Creator Agreement
                  </p>
                  <button
                    onClick={() => navLegal("terms")}
                    className="text-xs font-medium text-[#df5f97] hover:underline"
                  >
                    Read full agreement ↗
                  </button>
                </div>
                <div className="mb-3 max-h-36 overflow-y-auto rounded-xl border border-pink-100 bg-white/60 p-3 text-xs leading-relaxed text-[#7f6274]">
                  <p className="mb-2">
                    This Creator Agreement ("Agreement") governs your
                    participation as a content creator on the Pumdoki platform.
                    By accepting this Agreement, you confirm that:
                  </p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>You are 18 years of age or older.</li>
                    <li>
                      All content you upload complies with applicable laws and
                      our Community Guidelines.
                    </li>
                    <li>
                      You hold all necessary rights and permissions for content
                      you upload.
                    </li>
                    <li>
                      All performers depicted in your content are 18+ and have
                      provided consent.
                    </li>
                    <li>
                      You will maintain §2257 records as required by federal
                      law.
                    </li>
                    <li>
                      You will not upload non-consensual content, CSAM, or
                      content facilitating trafficking.
                    </li>
                    <li>
                      Pumdoki may remove content that violates these terms
                      without notice.
                    </li>
                  </ul>
                  <p className="mt-2">
                    This is a binding legal agreement. Violation may result in
                    account termination and referral to law enforcement.
                  </p>
                </div>
                <CheckItem
                  checked={agreements.creator}
                  onChange={(v) => setAgreements((a) => ({ ...a, creator: v }))}
                  required
                >
                  I have read and agree to the{" "}
                  <button
                    type="button"
                    onClick={() => navLegal("terms")}
                    className="font-semibold text-[#df5f97] hover:underline"
                  >
                    Creator Agreement
                  </button>
                  .
                </CheckItem>
              </div>

              {/* Payout Terms */}
              <div className="rounded-2xl border border-pink-100 bg-pink-50/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-[#241a22]">
                    Payout Terms & Revenue Share
                  </p>
                  <button className="text-xs font-medium text-[#df5f97] hover:underline">
                    Read full terms ↗
                  </button>
                </div>
                <div className="mb-3 max-h-36 overflow-y-auto rounded-xl border border-pink-100 bg-white/60 p-3 text-xs leading-relaxed text-[#7f6274]">
                  <p className="mb-2">
                    These Payout Terms outline the financial arrangement between
                    you and Pumdoki:
                  </p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>
                      Creators receive 80% of subscription and tip revenue;
                      Pumdoki retains 20%.
                    </li>
                    <li>Minimum payout threshold: $50 USD.</li>
                    <li>Payouts are processed on a monthly basis, net-30.</li>
                    <li>
                      Identity and banking verification is required before first
                      payout.
                    </li>
                    <li>
                      Pumdoki may withhold payments in cases of suspected policy
                      violations under review.
                    </li>
                    <li>
                      Refunds and chargebacks may be deducted from your balance.
                    </li>
                    <li>
                      Tax documentation (W-9 / W-8BEN) must be submitted prior
                      to first payout.
                    </li>
                  </ul>
                </div>
                <CheckItem
                  checked={agreements.payout}
                  onChange={(v) => setAgreements((a) => ({ ...a, payout: v }))}
                  required
                >
                  I have read and agree to the{" "}
                  <strong>Payout Terms & Revenue Share</strong> conditions.
                </CheckItem>
              </div>
            </div>
          )}

          {/* Step 2: Identity Verification */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#241a22]">
                  Identity Verification (§2257)
                </h2>
                <p className="mt-1 text-sm text-[#9e8090]">
                  Federal law requires us to verify your age and identity. Your
                  documents are stored securely and never shared publicly.
                </p>
              </div>

              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3">
                <svg
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-500"
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
                <p className="text-xs leading-relaxed text-amber-800">
                  In compliance with{" "}
                  <button
                    onClick={() => navLegal("2257")}
                    className="font-semibold hover:underline"
                  >
                    18 USC §2257
                  </button>
                  , all creators must provide a government-issued photo ID and a
                  verification selfie. You must be 18+ to create content on
                  Pumdoki.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#241a22]">
                    Government-Issued Photo ID{" "}
                    <span className="text-[#df5f97]">*</span>
                  </p>
                  <p className="mb-3 text-xs text-[#9e8090]">
                    Accepted: Passport, Driver's Licence, National ID Card. Must
                    be valid, unexpired, and clearly legible.
                  </p>
                  <FileDropZone
                    label="Upload Government ID"
                    hint="JPEG, PNG or PDF · Max 10MB · Front of document"
                    accept="image/jpeg,image/png,application/pdf"
                    file={idFile}
                    onFile={setIdFile}
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-[#241a22]">
                    Verification Selfie{" "}
                    <span className="text-[#df5f97]">*</span>
                  </p>
                  <p className="mb-3 text-xs text-[#9e8090]">
                    Hold your ID next to your face. Both must be clearly
                    visible. No filters or cropping.
                  </p>
                  <FileDropZone
                    label="Upload Selfie with ID"
                    hint="JPEG or PNG · Max 10MB · Must show your face and ID clearly"
                    accept="image/jpeg,image/png"
                    file={selfieFile}
                    onFile={setSelfieFile}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-pink-50 bg-pink-50/30 px-4 py-3">
                <p className="text-xs leading-relaxed text-[#9e8090]">
                  <span className="font-semibold text-[#7f6274]">
                    Privacy notice:
                  </span>{" "}
                  Your identification documents are encrypted at rest,
                  accessible only to authorised compliance personnel, and
                  retained for the minimum period required by 18 USC §2257. They
                  are never shared with other users or used for any purpose
                  other than age and identity verification.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Policy Acknowledgement */}
          {step === 3 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#241a22]">
                  Policy Acknowledgement
                </h2>
                <p className="mt-1 text-sm text-[#9e8090]">
                  Please confirm you understand and agree to our zero-tolerance
                  safety policies.
                </p>
              </div>

              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50/40 px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-red-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm font-bold text-red-800">
                    Zero-Tolerance Violations
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-red-700">
                  The following result in{" "}
                  <strong>immediate and permanent account termination</strong>{" "}
                  and reporting to law enforcement and relevant authorities.
                  There are no exceptions and no appeal:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-700">
                  <li>
                    Child sexual abuse material (CSAM) — any content involving
                    minors
                  </li>
                  <li>
                    Non-consensual intimate images (NCII / "revenge porn")
                  </li>
                  <li>
                    Content facilitating sex trafficking or sexual exploitation
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <CheckItem
                  checked={policy.ncii}
                  onChange={(v) => setPolicy((p) => ({ ...p, ncii: v }))}
                  required
                >
                  I understand and agree to Pumdoki's{" "}
                  <button
                    type="button"
                    onClick={() => navLegal("ncii")}
                    className="font-semibold text-[#df5f97] hover:underline"
                  >
                    Non-Consensual Content Policy
                  </button>
                  . I confirm that all content I upload will feature only
                  consenting adults and that I will never upload intimate images
                  of any person without their explicit, documented consent.
                </CheckItem>

                <CheckItem
                  checked={policy.trafficking}
                  onChange={(v) => setPolicy((p) => ({ ...p, trafficking: v }))}
                  required
                >
                  I understand and agree to Pumdoki's{" "}
                  <button
                    type="button"
                    onClick={() => navLegal("anti-trafficking")}
                    className="font-semibold text-[#df5f97] hover:underline"
                  >
                    Anti-Human Trafficking Policy
                  </button>
                  . I confirm I will never use this platform to facilitate,
                  promote, or recruit for human trafficking or sexual
                  exploitation of any person.
                </CheckItem>
              </div>

              <div className="mt-5 rounded-2xl border border-pink-100 bg-pink-50/30 px-4 py-3 text-xs leading-relaxed text-[#9e8090]">
                By completing this application, you confirm that all information
                provided is truthful and accurate. Providing false information
                is a violation of these Terms and may constitute a criminal
                offence.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 rounded-2xl border border-pink-100 py-3 text-sm font-medium text-[#8c6d7f] transition hover:bg-pink-50"
              >
                Back
              </button>
            )}
            {step < STEPS.length ? (
              <button
                onClick={() => {
                  if (step === 1 && !step1Valid) return;
                  if (step === 2 && !step2Valid) return;
                  setStep((s) => s + 1);
                }}
                disabled={
                  (step === 1 && !step1Valid) || (step === 2 && !step2Valid)
                }
                className="flex-[2] rounded-2xl py-3 text-sm font-bold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: "linear-gradient(90deg,#FF4D8D,#f472b6)",
                  boxShadow: "0 4px 20px rgba(255,77,141,0.28)",
                }}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!step3Valid}
                className="flex-[2] rounded-2xl py-3 text-sm font-bold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: step3Valid
                    ? "linear-gradient(90deg,#FF4D8D,#f472b6)"
                    : "#f3dce8",
                  boxShadow: step3Valid
                    ? "0 4px 20px rgba(255,77,141,0.28)"
                    : "none",
                  color: step3Valid ? "white" : "#c9aab8",
                }}
              >
                Submit Application
              </button>
            )}
          </div>

          {/* Validation hint */}
          {((step === 1 && !step1Valid) ||
            (step === 2 && !step2Valid) ||
            (step === 3 && !step3Valid)) && (
            <p className="mt-3 text-center text-xs text-[#b89aa8]">
              {step === 1 && "Please accept both agreements to continue."}
              {step === 2 &&
                "Please upload both your ID and verification selfie to continue."}
              {step === 3 &&
                "Please acknowledge both policies to submit your application."}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[#c9aab8]">
          <button
            onClick={() => navLegal("terms")}
            className="hover:text-[#df5f97]"
          >
            Creator Terms
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
            onClick={() => navLegal("2257")}
            className="font-medium text-[#b89aa8] hover:text-[#df5f97]"
          >
            18 USC §2257
          </button>
        </div>
      </main>
    </div>
  );
}
