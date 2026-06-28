import { useState } from "react";

const SECTIONS = [
  {
    group: "Core Policies",
    items: [
      { id: "hub", label: "Legal Overview", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
      { id: "terms", label: "Terms of Service", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      { id: "privacy", label: "Privacy Policy", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
      { id: "cookies", label: "Cookie Policy", icon: "M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" },
      { id: "acceptable-use", label: "Community Guidelines", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    ],
  },
  {
    group: "Creator & IP",
    items: [
      { id: "dmca", label: "DMCA Policy", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
      { id: "ncii", label: "Non-Consensual Content Policy", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" },
      { id: "appeals", label: "Appeals Policy", icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" },
    ],
  },
  {
    group: "Safety & Compliance",
    items: [
      { id: "anti-trafficking", label: "Anti-Human Trafficking Policy", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
      { id: "law-enforcement", label: "Law Enforcement Requests", icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
      { id: "contact", label: "Contact / Complaints", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    ],
  },
  {
    group: "Regulatory",
    items: [
      { id: "2257", label: "18 USC §2257 Statement", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
    ],
  },
];

const CONTENT = {
  hub: {
    title: "Legal Overview",
    updated: "January 1, 2026",
    body: (
      <div className="space-y-5">
        <p>Welcome to the Pumdoki Legal Hub. This directory provides access to all of our policies, guidelines, and compliance statements. We are committed to transparency, user safety, and legal compliance across all jurisdictions in which we operate.</p>
        <p>Pumdoki is an adult content platform subject to applicable laws and regulations, including but not limited to 18 USC §2257, DMCA, GDPR, CCPA, and other applicable privacy and content regulations.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SECTIONS.flatMap((s) => s.items).filter((i) => i.id !== "hub").map((item) => (
            <div key={item.id} className="rounded-2xl border border-pink-50 bg-pink-50/30 px-4 py-3">
              <p className="text-sm font-semibold text-[#241a22]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  terms: {
    title: "Terms of Service",
    updated: "January 1, 2026",
    body: (
      <div className="space-y-5">
        <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">These are placeholder Terms of Service. Final legal text will be drafted by qualified legal counsel prior to launch.</p>
        <Section heading="1. Acceptance of Terms">By accessing or using Pumdoki, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. You must be at least 18 years of age to use this platform.</Section>
        <Section heading="2. Use of the Platform">You may use Pumdoki only for lawful purposes and in accordance with these Terms. You agree not to use the platform in any way that violates any applicable federal, state, local, or international law or regulation.</Section>
        <Section heading="3. User Accounts">You are responsible for safeguarding the password that you use to access the platform and for any activities or actions under your password. You agree to notify us immediately of any unauthorized use of your account.</Section>
        <Section heading="4. Content Policy">Users may only post content that complies with our Community Guidelines and Acceptable Use Policy. Content involving minors is strictly prohibited and will be reported to appropriate authorities. All content must comply with 18 USC §2257 record-keeping requirements.</Section>
        <Section heading="5. Intellectual Property">The platform and its original content, features, and functionality are owned by Pumdoki and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</Section>
        <Section heading="6. Termination">We may terminate or suspend your account and access to the platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</Section>
        <Section heading="7. Limitation of Liability">In no event shall Pumdoki, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.</Section>
        <Section heading="8. Governing Law">These Terms shall be governed and construed in accordance with the laws applicable to our jurisdiction, without regard to its conflict of law provisions.</Section>
        <Section heading="9. Changes to Terms">We reserve the right to modify or replace these Terms at any time. It is your responsibility to check these Terms periodically for changes.</Section>
      </div>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    updated: "January 1, 2026",
    body: (
      <div className="space-y-5">
        <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">This is a placeholder Privacy Policy. Final text will be drafted by qualified legal counsel prior to launch.</p>
        <Section heading="1. Information We Collect">We collect information you provide directly to us, including when you create an account, make a purchase, or contact us for support. This includes name, email address, payment information, and any content you upload.</Section>
        <Section heading="2. How We Use Your Information">We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</Section>
        <Section heading="3. Information Sharing">We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners.</Section>
        <Section heading="4. Data Retention">We retain personal data for as long as necessary to provide our services and for legitimate legal, business, or contractual purposes. Identity verification documents are retained for a minimum period as required by 18 USC §2257.</Section>
        <Section heading="5. Your Rights">Depending on your location, you may have the right to access, correct, or delete your personal data, object to or restrict certain processing, and data portability. To exercise these rights, contact us at privacy@pumdoki.com.</Section>
        <Section heading="6. Cookies">We use cookies and similar tracking technologies. See our Cookie Policy for detailed information about how we use cookies.</Section>
        <Section heading="7. Security">We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction.</Section>
        <Section heading="8. Contact Us">If you have questions about this Privacy Policy, please contact our Data Protection team at privacy@pumdoki.com.</Section>
      </div>
    ),
  },
  cookies: {
    title: "Cookie Policy",
    updated: "January 1, 2026",
    body: (
      <div className="space-y-5">
        <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">This is a placeholder Cookie Policy. Final text will be drafted by qualified legal counsel prior to launch.</p>
        <Section heading="What Are Cookies">Cookies are small pieces of text sent to your browser by a website you visit. They help the website remember information about your visit, which can make it easier to visit the site again and make the site more useful.</Section>
        <Section heading="Types of Cookies We Use">
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li><strong>Essential Cookies:</strong> Required for the platform to function. These cannot be disabled.</li>
            <li><strong>Functional Cookies:</strong> Enable personalised settings and features.</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform.</li>
            <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertising.</li>
          </ul>
        </Section>
        <Section heading="Managing Cookies">You can control cookies through your browser settings. Note that disabling certain cookies may impact your experience on the platform. You can update your preferences at any time via the Cookie Consent banner.</Section>
        <Section heading="Third-Party Cookies">Some cookies on our platform are placed by third-party services. We have no control over these cookies and recommend you check the relevant third-party websites for more information.</Section>
      </div>
    ),
  },
  dmca: {
    title: "DMCA Policy",
    updated: "January 1, 2026",
    body: (
      <div className="space-y-5">
        <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">This is a placeholder DMCA Policy. Final text will be drafted by qualified legal counsel prior to launch.</p>
        <Section heading="Copyright Infringement Notice">Pumdoki respects the intellectual property rights of others and expects users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (DMCA), we will respond expeditiously to claims of copyright infringement.</Section>
        <Section heading="Filing a DMCA Notice">To file a DMCA takedown notice, please provide the following information to our designated copyright agent: (1) your signature or an authorized agent's signature; (2) identification of the copyrighted work; (3) identification of the infringing material; (4) your contact information; (5) a statement of good faith belief; (6) a statement of accuracy under penalty of perjury.</Section>
        <Section heading="Counter-Notice Procedure">If you believe your content was removed in error, you may submit a counter-notice. After receiving a valid counter-notice, we will restore the removed content unless the reporting party files a court action within 10-14 business days.</Section>
        <Section heading="Repeat Infringer Policy">Pumdoki maintains a policy of terminating accounts of users who repeatedly infringe copyrights.</Section>
        <Section heading="DMCA Agent Contact">Email: dmca@pumdoki.com | Mailing address will be provided upon formal registration of our DMCA agent.</Section>
      </div>
    ),
  },
  "2257": {
    title: "18 USC §2257 Compliance Statement",
    updated: "January 1, 2026",
    body: (
      <div className="space-y-5">
        <div className="rounded-2xl border border-pink-200 bg-pink-50/50 px-5 py-4">
          <p className="text-sm font-bold text-[#241a22]">Custodian of Records</p>
          <p className="mt-1 text-sm text-[#5b4153]">This statement is provided in compliance with 18 U.S.C. §2257 and 28 C.F.R. Part 75.</p>
        </div>
        <Section heading="Compliance Statement">Pumdoki requires all content producers and uploaders to certify that all performers depicted in any sexually explicit content are 18 years of age or older. Records verifying the age of all performers are maintained by each content producer and, where Pumdoki is the primary producer, by Pumdoki's designated Custodian of Records.</Section>
        <Section heading="Record-Keeping Requirements">In accordance with 18 U.S.C. §2257 and the regulations promulgated thereunder, Pumdoki maintains records of the actual names, legal names, and other names used by all performers depicted in explicit content, as well as their date of birth and copies of the relevant identification documents.</Section>
        <Section heading="Custodian of Records">Records required to be maintained pursuant to 18 U.S.C. §2257 are kept at:<br /><br />Pumdoki, Inc.<br />Custodian of Records<br />[Address — to be completed by legal counsel]<br />compliance@pumdoki.com</Section>
        <Section heading="User-Generated Content">For content uploaded by users (secondary producers), the uploader assumes responsibility for maintaining the required §2257 records. By uploading content, users certify compliance with these record-keeping requirements and represent that all performers are 18 years of age or older.</Section>
        <Section heading="Inspection">Records are available for inspection during normal business hours by appropriate regulatory authorities.</Section>
      </div>
    ),
  },
  "acceptable-use": {
    title: "Community Guidelines & Acceptable Use Policy",
    updated: "January 1, 2026",
    body: (
      <div className="space-y-5">
        <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">This is a placeholder Community Guidelines document. Final text will be drafted prior to launch.</p>
        <Section heading="Our Community Standards">Pumdoki is committed to maintaining a safe, respectful, and legal environment for all users. These guidelines outline what is and is not permitted on our platform.</Section>
        <Section heading="Zero-Tolerance Violations">The following are strictly prohibited and will result in immediate account termination and reporting to law enforcement where applicable:
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Any content involving minors in a sexual context (CSAM)</li>
            <li>Non-consensual content or content distributed without the subject's consent (NCII)</li>
            <li>Content facilitating or promoting human trafficking</li>
            <li>Content facilitating violence, terrorism, or illegal activities</li>
          </ul>
        </Section>
        <Section heading="Content Standards">All explicit content must feature only verified adult performers who have provided explicit consent. All performers must be 18+ and comply with §2257 record-keeping requirements.</Section>
        <Section heading="Conduct Standards">Users must treat others with respect. Harassment, doxxing, impersonation, and hate speech are prohibited.</Section>
        <Section heading="Reporting Violations">Use the in-platform reporting tools or contact safety@pumdoki.com to report violations of these guidelines.</Section>
      </div>
    ),
  },
  contact: {
    title: "Contact & Complaints",
    updated: "January 1, 2026",
    body: (
      <div className="space-y-5">
        <Section heading="General Inquiries">For general questions about Pumdoki: support@pumdoki.com</Section>
        <Section heading="Privacy & Data Requests">For privacy-related requests including data access, correction, or deletion: privacy@pumdoki.com</Section>
        <Section heading="DMCA / Copyright">For copyright infringement notices and counter-notices: dmca@pumdoki.com</Section>
        <Section heading="Child Safety (CSAM Reporting)">To report content involving minors: safety@pumdoki.com — or contact the NCMEC CyberTipline at www.cybertipline.org</Section>
        <Section heading="Trust & Safety">To report content policy violations, NCII, or trafficking concerns: safety@pumdoki.com</Section>
        <Section heading="Law Enforcement">For law enforcement requests, subpoenas, or preservation requests: lawenforcement@pumdoki.com</Section>
        <Section heading="18 USC §2257 Compliance">For §2257 compliance inquiries: compliance@pumdoki.com</Section>
        <Section heading="Billing & Payments">For subscription, payout, or billing issues: billing@pumdoki.com</Section>
      </div>
    ),
  },
  appeals: {
    title: "Appeals Policy",
    updated: "January 1, 2026",
    body: (
      <div className="space-y-5">
        <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">This is a placeholder Appeals Policy. Final text will be drafted prior to launch.</p>
        <Section heading="Right to Appeal">Users whose accounts have been suspended, terminated, or whose content has been removed have the right to appeal the decision within 30 days of the action being taken.</Section>
        <Section heading="How to Submit an Appeal">To submit an appeal: (1) Contact appeals@pumdoki.com with the subject line "Account Appeal"; (2) Include your account username, a description of the action taken, and why you believe the decision was made in error; (3) Provide any supporting documentation.</Section>
        <Section heading="Review Process">Appeals are reviewed by a dedicated Trust & Safety team. We aim to respond within 5-10 business days. Appeals regarding CSAM or trafficking violations are non-appealable.</Section>
        <Section heading="Outcomes">We may reinstate your account, restore removed content, uphold the original decision, or issue a modified consequence based on our review.</Section>
      </div>
    ),
  },
  "law-enforcement": {
    title: "Law Enforcement Request Policy",
    updated: "January 1, 2026",
    body: (
      <div className="space-y-5">
        <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">This is a placeholder Law Enforcement Policy. Final text will be drafted by qualified legal counsel prior to launch.</p>
        <Section heading="Our Commitment">Pumdoki is committed to cooperating with legitimate law enforcement requests in accordance with applicable laws, including the Electronic Communications Privacy Act (ECPA), the Stored Communications Act (SCA), and other applicable legislation.</Section>
        <Section heading="Types of Requests Accepted">We accept legally valid court orders, subpoenas, search warrants, and emergency requests from authorized law enforcement agencies. All requests must be submitted through proper legal channels.</Section>
        <Section heading="Emergency Disclosure">In cases involving imminent threat to life or safety of a person, Pumdoki may voluntarily disclose information to law enforcement without a court order. To submit an emergency request, contact: emergency@pumdoki.com</Section>
        <Section heading="Submission Process">Standard law enforcement requests should be served on our registered agent or submitted to: lawenforcement@pumdoki.com. International requests must comply with applicable Mutual Legal Assistance Treaty (MLAT) processes.</Section>
        <Section heading="Transparency">Pumdoki will publish a transparency report on a regular basis detailing the number and types of law enforcement requests received.</Section>
      </div>
    ),
  },
  "anti-trafficking": {
    title: "Anti-Human Trafficking Policy",
    updated: "January 1, 2026",
    body: (
      <div className="space-y-5">
        <div className="rounded-2xl border border-red-200 bg-red-50/50 px-5 py-4">
          <p className="text-sm font-bold text-red-800">Zero Tolerance Policy</p>
          <p className="mt-1 text-sm text-red-700">Human trafficking is a serious crime and a violation of human rights. Pumdoki has a zero-tolerance policy for any content or activity facilitating trafficking.</p>
        </div>
        <Section heading="Our Commitment">Pumdoki is deeply committed to preventing and combating human trafficking and sexual exploitation on our platform. We comply with the Fight Online Sex Trafficking Act (FOSTA) and the Stop Enabling Sex Traffickers Act (SESTA).</Section>
        <Section heading="Prohibited Activities">The following are strictly prohibited and will result in immediate account termination and reporting to law enforcement:
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Advertising or facilitating sex trafficking</li>
            <li>Content that coerces or exploits individuals</li>
            <li>Recruitment content targeting vulnerable individuals</li>
            <li>Any content that promotes or glorifies trafficking</li>
          </ul>
        </Section>
        <Section heading="Detection & Reporting">We employ content moderation tools and human reviewers to detect trafficking-related content. Detected violations are immediately removed and reported to the National Center for Missing & Exploited Children (NCMEC) and relevant law enforcement agencies.</Section>
        <Section heading="How to Report">If you encounter content you believe facilitates trafficking, please report it immediately via the in-app reporting tools or contact safety@pumdoki.com. You may also contact the National Human Trafficking Hotline at 1-888-373-7888.</Section>
        <Section heading="Support Resources">National Human Trafficking Hotline: 1-888-373-7888 | Text: 233733 | NCMEC CyberTipline: www.cybertipline.org</Section>
      </div>
    ),
  },
  ncii: {
    title: "Non-Consensual Intimate Image (NCII) Policy",
    updated: "January 1, 2026",
    body: (
      <div className="space-y-5">
        <div className="rounded-2xl border border-red-200 bg-red-50/50 px-5 py-4">
          <p className="text-sm font-bold text-red-800">Zero Tolerance Policy</p>
          <p className="mt-1 text-sm text-red-700">The non-consensual sharing of intimate images (NCII) — sometimes called "revenge porn" — is prohibited absolutely on this platform.</p>
        </div>
        <Section heading="Our Policy">Pumdoki has zero tolerance for non-consensual intimate images (NCII). The non-consensual sharing, distribution, or uploading of intimate images of any person is strictly prohibited and will result in immediate account termination.</Section>
        <Section heading="Scope">This policy covers any intimate or sexual images shared without the explicit consent of the person depicted, including: images taken in private contexts and distributed without consent; images or videos recorded without the subject's knowledge; deepfakes or AI-generated images of real persons in intimate contexts.</Section>
        <Section heading="Reporting NCII">If you believe your images are being shared without your consent, report immediately via: (1) In-app reporting tools; (2) safety@pumdoki.com with subject line "NCII Report". We aim to review and action NCII reports within 24 hours.</Section>
        <Section heading="Cooperation with NCII Frameworks">Pumdoki participates in industry frameworks to prevent the re-upload of NCII, including cooperation with StopNCII.org hashing technology.</Section>
        <Section heading="Support Resources">If you are a victim of NCII, support is available at: Cyber Civil Rights Initiative: cybercivilrights.org | StopNCII: stopncii.org</Section>
      </div>
    ),
  },
};

function Section({ heading, children }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#241a22]">{heading}</h3>
      <div className="mt-1.5 text-sm leading-relaxed text-[#5b4153]">{children}</div>
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
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-4 w-px bg-pink-100" />
          <span
            className="text-base font-bold"
            style={{ background: "linear-gradient(90deg,#FF4D8D,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Legal Hub
          </span>
          {activePage !== "hub" && (
            <>
              <span className="text-[#d4b8c8]">/</span>
              <span className="truncate text-sm text-[#8c6d7f]">{currentItem?.label || "Policy"}</span>
            </>
          )}

          {/* Mobile nav toggle */}
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-pink-100 px-3 py-1.5 text-xs font-medium text-[#8c6d7f] transition hover:bg-pink-50 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-[#c9aab8]">{section.group}</p>
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
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                  <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-widest text-[#c9aab8]">{section.group}</p>
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
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
              <h1 className="text-2xl font-bold text-[#241a22]">{current.title}</h1>
              <p className="mt-1 text-sm text-[#b89aa8]">Last updated: {current.updated}</p>
            </div>
            <div className="prose-sm max-w-none text-[#5b4153]">
              {current.body}
            </div>
          </article>

          {/* Quick links */}
          {activePage === "hub" && (
            <div className="mt-6 rounded-2xl border border-pink-100 bg-white/80 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c9aab8]">Quick Access</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["terms", "privacy", "dmca", "2257", "ncii", "contact"].map((id) => {
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
                })}
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
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Legal Overview
              </button>
              <p className="text-xs text-[#c9aab8]">18 USC §2257 record-keeping statement available <button onClick={() => navigate("2257")} className="font-medium text-[#df5f97] hover:underline">here</button>.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
