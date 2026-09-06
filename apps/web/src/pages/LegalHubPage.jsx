import { useState } from "react";
import {
  CURRENT_TERMS_VERSION,
  CURRENT_PRIVACY_VERSION,
} from "../auth/policyVersions";

const SECTIONS = [
  {
    group: "Core Policies",
    items: [
      {
        id: "hub",
        label: "Legal Overview",
        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      },
      {
        id: "terms",
        label: "Terms of Service",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      },
      {
        id: "privacy",
        label: "Privacy Policy",
        icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      },
      {
        id: "cookies",
        label: "Cookie Policy",
        icon: "M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5",
      },
      {
        id: "acceptable-use",
        label: "Community Guidelines",
        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
      },
    ],
  },
  {
    group: "Creator & IP",
    items: [
      {
        id: "dmca",
        label: "DMCA Policy",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      },
      {
        id: "ncii",
        label: "Non-Consensual Content Policy",
        icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
      },
      {
        id: "appeals",
        label: "Appeals Policy",
        icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
      },
    ],
  },
  {
    group: "Safety & Compliance",
    items: [
      {
        id: "anti-trafficking",
        label: "Anti-Human Trafficking Policy",
        icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
      },
      {
        id: "law-enforcement",
        label: "Law Enforcement Requests",
        icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
      },
      {
        id: "contact",
        label: "Contact / Complaints",
        icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      },
    ],
  },
  {
    group: "Regulatory",
    items: [
      {
        id: "2257",
        label: "18 USC §2257 — Pending",
        icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
      },
    ],
  },
];

const CONTENT = {
  hub: {
    title: "Legal Overview",
    body: (
      <div className="space-y-5">
        <p>
          Pumdoki is a development prototype for adults aged 18 and older. These
          pages identify policy topics that need qualified legal review before
          launch. They are not final terms or statements of compliance.
        </p>
        <Section heading="Current status">
          The business entity, legal policies, operational contacts, and
          moderation and compliance workflows have not been established. Creator
          applications remain pending; identity documents, tax forms, and
          banking information are not collected through that application.
        </Section>
        <div className="grid gap-3 sm:grid-cols-2">
          {SECTIONS.flatMap((s) => s.items)
            .filter((i) => i.id !== "hub")
            .map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-pink-50 bg-pink-50/30 px-4 py-3"
              >
                <p className="text-sm font-semibold text-[#241a22]">
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-[#8c6d7f]">
                  Counsel review pending
                </p>
              </div>
            ))}
        </div>
      </div>
    ),
  },
  terms: {
    title: "Terms of Service",
    version: CURRENT_TERMS_VERSION,
    body: (
      <div className="space-y-5">
        <Section heading="Prototype terms status">
          Final Terms of Service have not been drafted or approved by counsel.
          Registration records acceptance of a versioned prototype notice; that
          record does not establish production legal readiness.
        </Section>
        <Section heading="Before launch">
          The operating entity, eligible countries, account and content rules,
          Veso terms, purchase and subscription conditions, refunds, disputes,
          and governing law need review and approved documents.
        </Section>
        <Section heading="Current product limits">
          Content purchases, subscriptions, Veso spending, creator payouts, and
          messaging shown in the prototype are not live commercial services.
        </Section>
      </div>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    version: CURRENT_PRIVACY_VERSION,
    body: (
      <div className="space-y-5">
        <Section heading="Prototype privacy status">
          A final Privacy Policy and the production data-handling arrangements
          have not been approved. Account registration, authentication,
          Settings, and creator applications can save data in the connected
          development backend. Use sample data when testing.
        </Section>
        <Section heading="Sensitive information">
          Do not provide identity documents, tax forms, payment credentials, or
          banking information through this prototype. No production identity
          collection or payment processing is available.
        </Section>
        <Section heading="Before launch">
          The data inventory, service providers, processing purposes, retention
          and deletion rules, international transfers, privacy rights process,
          and security disclosures need review. A privacy request mailbox and
          production export/deletion workflow are not available here.
        </Section>
      </div>
    ),
  },
  cookies: {
    title: "Cookie Policy",
    body: (
      <div className="space-y-5">
        <Section heading="Current prototype storage">
          The connected account flow uses a session cookie. Theme selection is
          stored locally in your browser. Demo media can load from external
          websites.
        </Section>
        <Section heading="Before launch">
          A complete cookie and browser-storage inventory, third-party review,
          and any required consent controls need to be approved. This page does
          not claim that analytics, advertising, or a cookie consent manager
          have been implemented.
        </Section>
      </div>
    ),
  },
  dmca: {
    title: "DMCA Policy",
    body: (
      <div className="space-y-5">
        <Section heading="Copyright process pending">
          A designated copyright agent and an operational notice and
          counter-notice process have not been established. This prototype does
          not accept legal notices or promise content restoration dates.
        </Section>
        <Section heading="Before launch">
          Counsel must determine the applicable copyright requirements and
          approve the agent details, notice process, repeat-infringer rules, and
          related operating procedures.
        </Section>
      </div>
    ),
  },
  2257: {
    title: "18 USC §2257 — Review Pending",
    body: (
      <div className="space-y-5">
        <Section heading="No compliance statement is issued">
          Pumdoki has not appointed a Custodian of Records or established
          performer identity recordkeeping. This prototype does not collect
          performer identity documents or hold records available for inspection.
        </Section>
        <Section heading="Before launch">
          Qualified counsel must determine the applicable obligations,
          responsible entity, recordkeeping and retention arrangements, and
          required published statement before relevant content operations begin.
        </Section>
      </div>
    ),
  },
  "acceptable-use": {
    title: "Community Guidelines & Acceptable Use Policy",
    body: (
      <div className="space-y-5">
        <Section heading="Product safety requirements">
          Pumdoki is intended for adults only. Sexual content involving minors,
          non-consensual intimate content, trafficking, exploitation,
          harassment, and other illegal activity are prohibited.
        </Section>
        <Section heading="Operational status">
          The production moderation team, content-review process, reporting
          workflow, and enforcement procedures are not established. Prototype
          report controls do not send reports to an operating safety team.
        </Section>
        <Section heading="Before launch">
          Detailed content and conduct rules, consent requirements, reports,
          removals, and appeals need counsel review and implemented operations.
        </Section>
        <SafetyResources />
      </div>
    ),
  },
  contact: {
    title: "Contact & Complaints",
    body: (
      <div className="space-y-5">
        <Section heading="No operational Pumdoki inboxes">
          The addresses below are reserved examples, not working mailboxes. They
          do not receive support requests, complaints, legal notices, emergency
          reports, or sensitive documents. No response time is promised.
        </Section>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Support example: support@pumdoki.example</li>
          <li>Privacy example: privacy@pumdoki.example</li>
          <li>Copyright example: dmca@pumdoki.example</li>
          <li>Safety example: safety@pumdoki.example</li>
          <li>Appeals example: appeals@pumdoki.example</li>
          <li>Legal requests example: lawenforcement@pumdoki.example</li>
          <li>Compliance example: compliance@pumdoki.example</li>
          <li>Billing example: billing@pumdoki.example</li>
        </ul>
        <Section heading="Before launch">
          Approved, monitored contact channels and responsible operators must
          replace these examples before real users rely on the service.
        </Section>
        <SafetyResources />
      </div>
    ),
  },
  appeals: {
    title: "Appeals Policy",
    body: (
      <div className="space-y-5">
        <Section heading="Appeals process pending">
          There is no operational appeal intake or dedicated review team in this
          prototype. No appeal deadline, response time, or outcome is promised
          by this page.
        </Section>
        <Section heading="Before launch">
          Counsel-reviewed appeal rules, a working submission channel, review
          responsibilities, and decision records need to be established.
        </Section>
      </div>
    ),
  },
  "law-enforcement": {
    title: "Law Enforcement Requests",
    body: (
      <div className="space-y-5">
        <Section heading="Request process pending">
          A registered agent, legal request channel, preservation process, and
          emergency disclosure workflow have not been established. This
          prototype does not accept service or emergency requests.
        </Section>
        <Section heading="Before launch">
          Counsel must approve the responsible entity, request validation,
          disclosure and retention procedures, and published contact details.
        </Section>
        <p>
          If someone is in immediate danger, contact local emergency services.
        </p>
      </div>
    ),
  },
  "anti-trafficking": {
    title: "Anti-Human Trafficking Policy",
    body: (
      <div className="space-y-5">
        <Section heading="Product safety requirement">
          Trafficking, coercion, and exploitation are prohibited. This is a
          product requirement; no claim of legal compliance or an operating
          detection program is made here.
        </Section>
        <Section heading="Operational status">
          Production moderation tools, human reviewers, escalation procedures,
          and authority-reporting arrangements have not been established.
          Prototype report controls do not contact a safety team.
        </Section>
        <Section heading="Before launch">
          Prevention, detection, review, reporting, and removal procedures need
          counsel review and operational implementation.
        </Section>
        <SafetyResources />
      </div>
    ),
  },
  ncii: {
    title: "Non-Consensual Intimate Image (NCII) Policy",
    body: (
      <div className="space-y-5">
        <Section heading="Product safety requirement">
          Sharing intimate images without the depicted person's consent is
          prohibited, including non-consensual intimate impersonations.
        </Section>
        <Section heading="Operational status">
          Pumdoki has no operational NCII report intake, removal workflow, or
          re-upload prevention integration. It does not participate in
          StopNCII.org's partner program. No review or removal time is promised.
        </Section>
        <Section heading="Before launch">
          Counsel-reviewed reporting and removal rules, staffed handling, and
          any approved prevention tools need to be implemented and verified.
        </Section>
        <SafetyResources />
      </div>
    ),
  },
};

function SafetyResources() {
  return (
    <Section heading="Independent safety resources">
      <p>
        These services are independent of Pumdoki. Links do not imply a
        partnership. If someone is in immediate danger, contact local emergency
        services.
      </p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        {[
          [
            "NCMEC CyberTipline",
            "https://www.missingkids.org/gethelpnow/cybertipline",
          ],
          [
            "National Human Trafficking Hotline",
            "https://humantraffickinghotline.org/en",
          ],
          ["Cyber Civil Rights Initiative", "https://cybercivilrights.org/"],
          ["StopNCII.org", "https://stopncii.org/"],
        ].map(([label, href]) => (
          <li key={href}>
            <a href={href} className="font-medium text-[#df5f97] underline">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Section({ heading, children }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#241a22]">{heading}</h3>
      <div className="mt-1.5 text-sm leading-relaxed text-[#5b4153]">
        {children}
      </div>
    </div>
  );
}

export default function LegalHubPage({ onBack, initialPage = "hub" }) {
  const [activePage, setActivePage] = useState(initialPage);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const current = CONTENT[activePage] || CONTENT.hub;
  const allItems = SECTIONS.flatMap((s) => s.items);
  const currentItem = allItems.find((i) => i.id === activePage);

  const navigate = (id) => {
    setActivePage(id);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8fb] via-white to-[#fdf0f7]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-pink-100 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97]"
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
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-4 w-px bg-pink-100" />
          <span
            className="text-base font-bold"
            style={{
              background: "linear-gradient(90deg,#FF4D8D,#f472b6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Legal Hub
          </span>
          {activePage !== "hub" && (
            <>
              <span className="text-[#d4b8c8]">/</span>
              <span className="truncate text-sm text-[#8c6d7f]">
                {currentItem?.label || "Policy"}
              </span>
            </>
          )}

          {/* Mobile nav toggle */}
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-pink-100 px-3 py-1.5 text-xs font-medium text-[#8c6d7f] transition hover:bg-pink-50 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            Policies
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden border-b border-pink-100 bg-white/95 px-4 py-3">
          <div className="mx-auto max-w-7xl space-y-4">
            {SECTIONS.map((section) => (
              <div key={section.group}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-[#c9aab8]">
                  {section.group}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-left transition ${
                        activePage === item.id
                          ? "bg-pink-50 font-semibold text-[#df5f97]"
                          : "text-[#5b4153] hover:bg-pink-50/60"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={item.icon} />
                      </svg>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 rounded-2xl border border-pink-100 bg-white/80 backdrop-blur-sm p-4">
            <div className="space-y-5">
              {SECTIONS.map((section) => (
                <div key={section.group}>
                  <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-widest text-[#c9aab8]">
                    {section.group}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-left transition ${
                          activePage === item.id
                            ? "bg-pink-50 font-semibold text-[#df5f97]"
                            : "text-[#5b4153] hover:bg-pink-50/60 hover:text-[#df5f97]"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 shrink-0 opacity-70"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={item.icon} />
                        </svg>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <article className="rounded-2xl border border-pink-100 bg-white/80 backdrop-blur-sm px-7 py-8">
            <div className="mb-6 border-b border-pink-50 pb-6">
              <h1 className="text-2xl font-bold text-[#241a22]">
                {current.title}
              </h1>
              <p className="mt-1 text-sm text-[#b89aa8]">
                Prototype notice updated: September 6, 2026
                {current.version && ` · ${current.version}`}
              </p>
            </div>
            <aside
              aria-label="Prototype legal status"
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              <p className="font-semibold">Prototype — not counsel-approved</p>
              <p className="mt-1">
                All policies in this hub are unfinished. This is not a live
                legal, safety, or support intake. Do not submit sensitive
                documents or rely on the example contacts for help.
              </p>
            </aside>
            <div className="prose-sm max-w-none text-[#5b4153]">
              {current.body}
            </div>
          </article>

          {/* Quick links */}
          {activePage === "hub" && (
            <div className="mt-6 rounded-2xl border border-pink-100 bg-white/80 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c9aab8]">
                Quick Access
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["terms", "privacy", "dmca", "2257", "ncii", "contact"].map(
                  (id) => {
                    const item = allItems.find((i) => i.id === id);
                    return (
                      <button
                        key={id}
                        onClick={() => navigate(id)}
                        className="rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-1.5 text-xs font-medium text-[#7f6274] transition hover:border-pink-200 hover:text-[#df5f97]"
                      >
                        {item?.label}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Nav between policies */}
          {activePage !== "hub" && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                onClick={() => navigate("hub")}
                className="flex items-center gap-1.5 rounded-xl border border-pink-100 px-4 py-2 text-sm font-medium text-[#8c6d7f] transition hover:bg-pink-50"
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
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Legal Overview
              </button>
              <p className="text-xs text-[#c9aab8]">
                18 USC §2257 review status{" "}
                <button
                  onClick={() => navigate("2257")}
                  className="font-medium text-[#df5f97] hover:underline"
                >
                  here
                </button>
                .
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
