import { useState } from "react";

const socialLinks = [
  {
    name: "X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M18.901 2H21l-6.56 7.497L22.159 22h-6.042l-4.73-6.18L5.98 22H3.88l7.017-8.02L1.841 2h6.195l4.276 5.65L18.901 2Zm-2.118 18h1.674L7.128 3.895H5.33L16.783 20Z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M7 2C4.239 2 2 4.239 2 7v10c0 2.761 2.239 5 5 5h10c2.761 0 5-2.239 5-5V7c0-2.761-2.239-5-5-5H7Zm0 2h10c1.657 0 3 1.343 3 3v10c0 1.657-1.343 3-3 3H7c-1.657 0-3-1.343-3-3V7c0-1.657 1.343-3 3-3Zm11.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M16.5 3a4.5 4.5 0 004.5 4.5v3a7.49 7.49 0 01-4.5-1.5V15a6 6 0 11-6-6c.17 0 .33.01.5.02v3.07A3 3 0 1013.5 15V3h3z" />
      </svg>
    ),
  },
  {
    name: "Discord",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
];

const LEGAL_LINKS = [
  { label: "Terms of Service", sub: "terms" },
  { label: "Privacy Policy", sub: "privacy" },
  { label: "Cookie Policy", sub: "cookies" },
  { label: "DMCA Policy", sub: "dmca" },
  { label: "18 USC §2257", sub: "2257", highlight: true },
  { label: "Community Guidelines", sub: "acceptable-use" },
  { label: "Contact / Complaints", sub: "contact" },
];

export default function Footer({ onNavigateLegal, onOpenSignup, compact = false }) {
  const handle = (sub) => {
    if (onNavigateLegal) onNavigateLegal(sub);
  };

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-3 text-xs text-[#b89aa8]">
        {LEGAL_LINKS.map((l) => (
          <button
            key={l.sub}
            onClick={() => handle(l.sub)}
            className={`transition hover:text-[#df5f97] ${l.highlight ? "font-semibold text-[#9e8090]" : ""}`}
          >
            {l.label}
          </button>
        ))}
        <span>&copy; 2026 Pumdoki</span>
      </div>
    );
  }

  return (
    <footer className="relative z-10 border-t border-pink-100 bg-white/85 px-6 py-10 backdrop-blur-sm md:px-10 lg:px-14 xl:px-20">
      <div className="mx-auto max-w-7xl">
        {/* Main grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <span
              className="text-xl font-bold tracking-tight"
              style={{ background: "linear-gradient(90deg,#FF4D8D,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              Pumdoki
            </span>
            <p className="mt-2 text-sm leading-relaxed text-[#9e8090]">
              Built for presence, interaction, and connection. A space where creators and fans grow together.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="rounded-full border border-pink-100 bg-white p-2 text-[#9e8090] transition hover:border-pink-200 hover:text-[#df5f97]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c6d7f]">Platform</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#7f6274]">
              {["Explore Pumdoki", "About", "Blog", "Careers"].map((item) => (
                <li key={item}>
                  <a href="#" className="transition hover:text-[#df5f97]">{item}</a>
                </li>
              ))}
              <li>
                <button onClick={onOpenSignup} className="transition hover:text-[#df5f97]">Become a Creator</button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c6d7f]">Support</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#7f6274]">
              {["Help Center", "Trust & Safety"].map((item) => (
                <li key={item}>
                  <a href="#" className="transition hover:text-[#df5f97]">{item}</a>
                </li>
              ))}
              <li>
                <button onClick={() => handle("appeals")} className="transition hover:text-[#df5f97]">Appeals</button>
              </li>
              <li>
                <button onClick={() => handle("law-enforcement")} className="transition hover:text-[#df5f97]">Law Enforcement</button>
              </li>
              <li>
                <button onClick={() => handle("contact")} className="transition hover:text-[#df5f97]">Contact Us</button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c6d7f]">Legal</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {LEGAL_LINKS.map((l) => (
                <li key={l.sub}>
                  <button
                    onClick={() => handle(l.sub)}
                    className={`transition hover:text-[#df5f97] ${
                      l.highlight
                        ? "font-semibold text-[#8c6d7f] underline decoration-dotted underline-offset-2 hover:text-[#df5f97]"
                        : "text-[#7f6274]"
                    }`}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="my-8 border-pink-100" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-[#b89aa8]">
            &copy; 2026 Pumdoki. All rights reserved. This site contains adult content and is intended for users 18 years of age or older.
          </p>
          <button
            onClick={() => handle("2257")}
            className="text-xs font-medium text-[#9e8090] underline decoration-dotted underline-offset-2 transition hover:text-[#df5f97]"
          >
            18 USC §2257 Compliance
          </button>
        </div>
      </div>
    </footer>
  );
}
