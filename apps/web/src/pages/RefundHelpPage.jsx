import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useOptionalMemberTheme } from "../appearance/memberThemeContext";
import "./RefundHelpPage.css";

const sections = [
  ["purchases", "Purchases & subscriptions"],
  ["review", "When a refund can be reviewed"],
  ["prepare", "Preparing your request"],
  ["rights", "Your rights"],
];

function HelpIcon({ name, className = "" }) {
  const paths = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6m-6 4h6" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4m10-4v4M3 11h18m-13 5 2 2 4-4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    message: (
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 1v-9.5a8.5 8.5 0 0 1 17 0ZM7 9h9m-9 4h6" />
    ),
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function RefundHelpPage() {
  const theme = useOptionalMemberTheme()?.memberTheme || "sakura";
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Requesting a refund | Pumdoki";
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    return () => {
      document.title = previousTitle;
    };
  }, []);
  return (
    <div className="refund-help" data-help-theme={theme}>
      <a className="refund-skip" href="#refund-article">
        Skip to article
      </a>
      <header className="refund-header">
        <div className="refund-header-inner">
          <Link
            className="refund-brand"
            to="/legal"
            aria-label="Pumdoki help and policies"
          >
            <span className="refund-brand-mark" aria-hidden="true">
              p.
            </span>
            <span>
              Pumdoki{" "}
              <span className="refund-brand-label">Help & policies</span>
            </span>
          </Link>
          <Link className="refund-back" to="/billing">
            Back to Billing <HelpIcon name="arrow" />
          </Link>
        </div>
      </header>

      <div className="refund-container">
        <nav className="refund-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/legal">Help & policies</Link>
          <span aria-hidden="true">/</span>
          <span>Requesting a refund</span>
        </nav>
        <div className="refund-layout">
          <main id="refund-article" tabIndex={-1}>
            <div className="refund-intro">
              <p className="refund-eyebrow">PAYMENTS & PURCHASES</p>
              <h1>Requesting a refund</h1>
              <p className="refund-lead">
                A little clarity on purchases, subscriptions, and what to do
                when something isn’t right.
              </p>
              <p className="refund-meta">
                Draft updated September 13, 2026{" "}
                <span aria-hidden="true">·</span> 3 min read
              </p>
            </div>

            <aside className="refund-draft" aria-label="Draft policy status">
              <span className="refund-draft-dot" aria-hidden="true" />
              <div>
                <strong>Draft for legal review — not yet in effect</strong>
                <p>
                  This preview reflects our proposed policy. Payments and refund
                  requests are not available here.
                </p>
              </div>
            </aside>

            <p className="refund-opening">
              We want you to know what to expect before you pay. This article
              covers pay-per-view (PPV) purchases and subscriptions, including
              the situations where a refund request can be reviewed.
            </p>

            <section id="purchases" className="refund-section">
              <h2>Purchases & subscriptions</h2>
              <div className="refund-purchase-grid">
                <div className="refund-purchase-card">
                  <span className="refund-icon-tile">
                    <HelpIcon name="receipt" />
                  </span>
                  <h3>Pay-per-view purchases</h3>
                  <p>
                    Purchases are generally final once the purchased content has
                    been successfully delivered. Changing your mind does not
                    ordinarily qualify for a refund.
                  </p>
                </div>
                <div className="refund-purchase-card">
                  <span className="refund-icon-tile">
                    <HelpIcon name="calendar" />
                  </span>
                  <h3>Subscriptions</h3>
                  <p>
                    Cancelling stops future renewals once cancellation takes
                    effect. You ordinarily keep access through the paid period;
                    cancellation does not ordinarily result in a refund for
                    unused time.
                  </p>
                </div>
              </div>
              <p className="refund-note">
                These general rules do not override your applicable consumer
                rights or payment-processor requirements.
              </p>
            </section>

            <section id="review" className="refund-section">
              <h2>When a refund can be reviewed</h2>
              <p>
                Something went wrong? The following issues qualify for review.
                The outcome depends on the circumstances and the rights that
                apply.
              </p>
              <ul className="refund-reasons">
                {[
                  [
                    "A duplicate or incorrect charge",
                    "You were charged more than once for the same purchase, or the amount is incorrect.",
                  ],
                  [
                    "An unauthorized transaction",
                    "You did not authorize the payment. The transaction and circumstances need to be verified.",
                  ],
                  [
                    "Content was not delivered",
                    "You paid, but the purchased content was not made available.",
                  ],
                  [
                    "Content materially differs from its description",
                    "What you received is substantially different from what was offered.",
                  ],
                  [
                    "Promised access cannot be restored",
                    "You lost access to your purchase and the issue cannot be resolved.",
                  ],
                ].map(([title, description]) => (
                  <li key={title}>
                    <HelpIcon name="check" />
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="refund-retention">
                <strong>Your purchased content stays with you.</strong>
                <p>
                  Ordinary creator deletion or delisting will not remove your
                  access to the version you bought. Legal and safety removals,
                  the Terms, and the Refund Policy still apply.
                </p>
              </div>
            </section>

            <section id="prepare" className="refund-section">
              <h2>Preparing your request</h2>
              <p>
                Once refund support is available, these details will help us
                understand the issue:
              </p>
              <ol className="refund-steps">
                <li>
                  <span>01</span>
                  <div>
                    <h3>Find the transaction</h3>
                    <p>
                      Have the purchase date, amount, and receipt or transaction
                      reference ready.
                    </p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <h3>Explain what happened</h3>
                    <p>
                      Identify the purchase or creator and briefly describe the
                      issue. Include relevant screenshots with sensitive details
                      removed.
                    </p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <h3>Use the published support channel</h3>
                    <p>
                      The final request process will appear here once it is
                      ready. This preview does not submit a request.
                    </p>
                  </div>
                </li>
              </ol>
              <p className="refund-note">
                Do not include passwords, full card numbers, security codes, or
                identity documents in a refund request.
              </p>
            </section>

            <section id="rights" className="refund-section">
              <h2>Your rights come first</h2>
              <p>
                Applicable consumer rights, including any withdrawal rights, and
                payment-processor requirements take precedence. Where required,
                a refund or another appropriate remedy will be provided.
              </p>
              <p>
                Additional goodwill refunds may be granted case by case. A
                goodwill refund does not create a general entitlement to future
                refunds.
              </p>
              <p>
                Final policy wording and the refund-handling process are
                awaiting legal review and implementation before live payments.
              </p>
            </section>

            <div className="refund-support-card">
              <span className="refund-icon-tile">
                <HelpIcon name="message" />
              </span>
              <div>
                <h2>Keep the details close.</h2>
                <p>
                  Your receipt is a useful starting point if a purchase needs a
                  second look.
                </p>
                <Link className="refund-text-link" to="/billing">
                  Explore the Billing preview <HelpIcon name="arrow" />
                </Link>
              </div>
            </div>
            <footer className="refund-article-footer">
              <span>Related information</span>
              <Link to="/legal/terms">
                Terms of Service <HelpIcon name="arrow" />
              </Link>
              <Link to="/legal/contact">
                Contact & complaints <HelpIcon name="arrow" />
              </Link>
            </footer>
          </main>

          <aside className="refund-toc">
            <nav aria-label="On this page">
              <p>ON THIS PAGE</p>
              {sections.map(([id, label]) => (
                <a key={id} href={`#${id}`}>
                  {label}
                </a>
              ))}
              <div className="refund-toc-note">
                Clear expectations.
                <br />
                <strong>Considered resolutions.</strong>
              </div>
            </nav>
          </aside>
        </div>
      </div>
      <footer className="refund-site-footer">
        <span>Pumdoki</span>
        <Link to="/legal">Help & policies</Link>
      </footer>
    </div>
  );
}
