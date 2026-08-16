import { useCallback, useEffect, useState } from "react";
import { AUTH_ROLES } from "../auth/authApi";
import { useAuth } from "../auth/authContext";
import EmailVerificationBanner from "../components/EmailVerificationBanner";
import { ErrorState, LoadingState } from "../components/StateViews";
import {
  CREATOR_AGREEMENT_VERSION,
  CREATOR_CONTENT_POLICY_VERSION,
  IDENTITY_VERIFICATION_DISCLOSURE_VERSION,
  creatorApplicationApi,
} from "../creator/creatorApplicationApi";

const STEPS = ["Creator profile", "Prototype policies", "Identity next step"];

const OUTCOME_COPY = {
  PENDING: {
    title: "Application received",
    message:
      "Your application is waiting for review. Your account remains a member and creator tools stay unavailable until a future operations review approves and provisions it.",
  },
  NEEDS_INFORMATION: {
    title: "More information is needed",
    message:
      "Pumdoki operations will contact the email on your account with the next approved step. Do not send identity documents through email or support messages.",
  },
  APPROVED: {
    title: "Application approved",
    message:
      "Approval is recorded. Creator access will appear after account provisioning is complete.",
  },
  REJECTED: {
    title: "Application not approved",
    message:
      "This application is closed. Any future appeal or reapplication process will be communicated through an approved support channel.",
  },
};

function PageFrame({ onBack, step, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8fb] via-[#fdf0f7] to-[#fce8f3]">
      <header className="flex items-center justify-between border-b border-pink-100 bg-white/75 px-5 py-4 backdrop-blur-sm sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-[#8c6d7f] transition hover:text-[#df5f97]"
        >
          <span aria-hidden="true">←</span> Back
        </button>
        <span className="text-lg font-bold text-[#df5f97]">
          Creator application
        </span>
        <span className="min-w-16 text-right text-sm text-[#9e8090]">
          {step ? `${step} / ${STEPS.length}` : ""}
        </span>
      </header>
      {children}
    </div>
  );
}

function Card({ children }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-pink-100 bg-white/90 px-6 py-8 shadow-xl backdrop-blur-md sm:px-8">
        {children}
      </div>
    </main>
  );
}

function Progress({ step }) {
  return (
    <ol aria-label="Application progress" className="mb-8 flex gap-2">
      {STEPS.map((label, index) => {
        const number = index + 1;
        const current = number === step;
        const complete = number < step;
        return (
          <li key={label} className="flex flex-1 flex-col gap-2">
            <span
              className={`h-1.5 rounded-full ${complete || current ? "bg-[#df5f97]" : "bg-pink-100"}`}
            />
            <span
              className={`hidden text-xs sm:block ${current ? "font-semibold text-[#df5f97]" : "text-[#9e8090]"}`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Checkbox({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-pink-100 bg-pink-50/25 px-4 py-4 text-sm leading-relaxed text-[#5b4153]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[#df5f97]"
      />
      <span>{children}</span>
    </label>
  );
}

function Outcome({ application, onBack }) {
  const copy = OUTCOME_COPY[application.status];
  return (
    <Card>
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-100 text-2xl text-[#df5f97]">
          ✓
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#df5f97]">
          {application.status.replaceAll("_", " ")}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#241a22]">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#7f6274]">
          {copy.message}
        </p>
      </div>

      <dl className="mt-7 grid gap-3 rounded-2xl border border-pink-100 bg-pink-50/30 p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[#9e8090]">
            Creator name
          </dt>
          <dd className="mt-1 font-semibold text-[#241a22]">
            {application.creatorName}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[#9e8090]">
            Country
          </dt>
          <dd className="mt-1 font-semibold text-[#241a22]">
            {application.countryCode}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[#9e8090]">
            Submitted
          </dt>
          <dd className="mt-1 font-semibold text-[#241a22]">
            {new Date(application.submittedAt).toLocaleDateString()}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[#9e8090]">
            Identity verification
          </dt>
          <dd className="mt-1 font-semibold text-[#241a22]">
            {application.identityVerificationStatus.replaceAll("_", " ")}
          </dd>
        </div>
      </dl>

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        Pumdoki does not collect identity documents in this application. Wait
        for an approved verification workflow before providing sensitive
        information.
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-6 w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm font-semibold text-[#8c6d7f] transition hover:bg-pink-50"
      >
        Return to Pumdoki
      </button>
    </Card>
  );
}

function VerificationRequired({ requestVerification }) {
  const [state, setState] = useState("idle");

  const requestLink = async () => {
    setState("sending");
    try {
      await requestVerification();
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <Card>
      <h1 className="text-2xl font-bold text-[#241a22]">
        Verify your email first
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#7f6274]">
        A verified email is required before a creator application can be
        submitted. This protects your account and gives operations a confirmed
        contact address.
      </p>
      <button
        type="button"
        onClick={requestLink}
        disabled={state === "sending"}
        className="mt-6 rounded-2xl bg-[#df5f97] px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
      >
        {state === "sending" ? "Requesting…" : "Send verification email"}
      </button>
      {state === "sent" && (
        <p role="status" className="mt-3 text-sm text-green-700">
          Request accepted. Check Mailpit when testing locally.
        </p>
      )}
      {state === "error" && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          We couldn’t request a verification email. Please try again.
        </p>
      )}
    </Card>
  );
}

export default function CreatorOnboardingPage({
  onBack,
  onNavigateLegal,
  api = creatorApplicationApi,
}) {
  const { user, requestVerification } = useAuth();
  const [step, setStep] = useState(1);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitState, setSubmitState] = useState("idle");
  const [creatorName, setCreatorName] = useState(user?.displayName ?? "");
  const [countryCode, setCountryCode] = useState("");
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [acceptedIdentityDisclosure, setAcceptedIdentityDisclosure] =
    useState(false);

  const loadApplication = useCallback(async () => {
    if (user?.role !== AUTH_ROLES.MEMBER) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      setApplication(await api.getCurrent());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [api, user?.role]);

  useEffect(() => {
    void loadApplication();
  }, [loadApplication]);

  const profileValid =
    creatorName.trim().length >= 2 && /^[A-Za-z]{2}$/.test(countryCode.trim());
  const policiesValid = acceptedAgreement && acceptedPolicy;

  const submit = async () => {
    setSubmitState("submitting");
    try {
      const created = await api.submit({
        creatorName,
        countryCode,
        acceptedCreatorAgreement: true,
        acceptedCreatorAgreementVersion: CREATOR_AGREEMENT_VERSION,
        acceptedContentPolicy: true,
        acceptedContentPolicyVersion: CREATOR_CONTENT_POLICY_VERSION,
        acceptedIdentityVerificationDisclosure: true,
        acceptedIdentityVerificationDisclosureVersion:
          IDENTITY_VERIFICATION_DISCLOSURE_VERSION,
      });
      setApplication(created);
      setSubmitState("idle");
    } catch (error) {
      if (error?.status === 409 || error?.code === "CONFLICT") {
        await loadApplication();
        setSubmitState("idle");
        return;
      }
      setSubmitState("error");
    }
  };

  if (loading) {
    return (
      <PageFrame onBack={onBack}>
        <Card>
          <LoadingState label="Loading your creator application…" />
        </Card>
      </PageFrame>
    );
  }

  if (loadError) {
    return (
      <PageFrame onBack={onBack}>
        <Card>
          <ErrorState
            title="Creator application unavailable"
            message="We couldn’t load your application. Check that the API is running and try again."
            onRetry={() => void loadApplication()}
          />
        </Card>
      </PageFrame>
    );
  }

  if (application) {
    return (
      <PageFrame onBack={onBack}>
        <EmailVerificationBanner />
        <Outcome application={application} onBack={onBack} />
      </PageFrame>
    );
  }

  if (user?.role !== AUTH_ROLES.MEMBER) {
    return (
      <PageFrame onBack={onBack}>
        <Card>
          <ErrorState
            title="Application not available"
            message="Only member accounts can start a creator application."
          />
        </Card>
      </PageFrame>
    );
  }

  if (!user.emailVerified) {
    return (
      <PageFrame onBack={onBack}>
        <VerificationRequired requestVerification={requestVerification} />
      </PageFrame>
    );
  }

  return (
    <PageFrame onBack={onBack} step={step}>
      <Card>
        <Progress step={step} />

        {step === 1 && (
          <section>
            <h1 className="text-2xl font-bold text-[#241a22]">
              Tell us about your creator profile
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#7f6274]">
              This starts an application only. It does not grant creator access
              or publish a profile.
            </p>
            <div className="mt-6 space-y-5">
              <label className="block text-sm font-semibold text-[#5b4153]">
                Creator-facing name
                <input
                  value={creatorName}
                  onChange={(event) => setCreatorName(event.target.value)}
                  maxLength={80}
                  autoComplete="nickname"
                  className="mt-2 w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 font-normal outline-none focus:border-[#df5f97] focus:ring-2 focus:ring-pink-100"
                />
              </label>
              <label className="block text-sm font-semibold text-[#5b4153]">
                Country code
                <input
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  maxLength={2}
                  autoComplete="country"
                  placeholder="US"
                  aria-describedby="country-help"
                  className="mt-2 w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 font-normal uppercase outline-none focus:border-[#df5f97] focus:ring-2 focus:ring-pink-100"
                />
              </label>
              <p id="country-help" className="text-xs text-[#9e8090]">
                Enter the two-letter code for your country of residence.
              </p>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h1 className="text-2xl font-bold text-[#241a22]">
              Review the prototype policies
            </h1>
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
              These versioned prototype policies support product testing. They
              are not represented as counsel-approved launch agreements, and
              they contain no finalized payout terms.
            </div>
            <div className="mt-5 space-y-3">
              <Checkbox
                checked={acceptedAgreement}
                onChange={setAcceptedAgreement}
              >
                I reviewed the prototype creator terms and understand that
                creator access requires a separate approval. Version:{" "}
                <strong>{CREATOR_AGREEMENT_VERSION}</strong>.
              </Checkbox>
              <Checkbox checked={acceptedPolicy} onChange={setAcceptedPolicy}>
                I reviewed the prototype content policy and understand that
                prohibited or non-consensual content cannot be published.
                Version: <strong>{CREATOR_CONTENT_POLICY_VERSION}</strong>.
              </Checkbox>
            </div>
            <div className="mt-4 flex gap-4 text-xs font-semibold text-[#df5f97]">
              <button
                type="button"
                onClick={() => onNavigateLegal?.("terms")}
                className="hover:underline"
              >
                Review terms
              </button>
              <button
                type="button"
                onClick={() => onNavigateLegal?.("acceptable-use")}
                className="hover:underline"
              >
                Review content policy
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h1 className="text-2xl font-bold text-[#241a22]">
              Identity verification comes later
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#7f6274]">
              This application does not request or upload an ID, selfie, tax
              form, or banking information. Those steps remain disabled until
              Pumdoki has an approved provider, retention rules, and private
              operations workflow.
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-[#7f6274]">
              <li>Your application will be recorded as pending.</li>
              <li>Your role remains Member and Dashboard stays unavailable.</li>
              <li>No review-time promise is made in this prototype.</li>
            </ul>
            <div className="mt-5">
              <Checkbox
                checked={acceptedIdentityDisclosure}
                onChange={setAcceptedIdentityDisclosure}
              >
                I understand that a separate approved identity-verification
                process may be required before creator access is granted.
                Version:{" "}
                <strong>{IDENTITY_VERIFICATION_DISCLOSURE_VERSION}</strong>.
              </Checkbox>
            </div>
            {submitState === "error" && (
              <p role="alert" className="mt-4 text-sm text-red-700">
                We couldn’t submit your application. Please try again.
              </p>
            )}
          </section>
        )}

        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((current) => current - 1)}
              disabled={submitState === "submitting"}
              className="flex-1 rounded-2xl border border-pink-200 px-4 py-3 text-sm font-semibold text-[#8c6d7f]"
            >
              Previous
            </button>
          )}
          {step < STEPS.length ? (
            <button
              type="button"
              onClick={() => setStep((current) => current + 1)}
              disabled={
                (step === 1 && !profileValid) || (step === 2 && !policiesValid)
              }
              className="flex-[2] rounded-2xl bg-[#df5f97] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={
                !acceptedIdentityDisclosure || submitState === "submitting"
              }
              className="flex-[2] rounded-2xl bg-[#df5f97] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              {submitState === "submitting"
                ? "Submitting…"
                : "Submit application"}
            </button>
          )}
        </div>
      </Card>
    </PageFrame>
  );
}
