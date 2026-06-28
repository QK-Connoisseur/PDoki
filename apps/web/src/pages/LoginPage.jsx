import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";

export default function LoginPage({ onLogin, onOpenSignup, onNavigateLegal }) {
  const featuredCreators = useMemo(
    () => [
      {
        name: "Luna Bloom",
        tag: "Private livestreams · Late-night chats · Exclusive drops",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Mika Rose",
        tag: "Gaming sessions · Personal posts · Premium content",
        image:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Airi Vale",
        tag: "Photo sets · Voice notes · Members-only moments",
        image:
          "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Sora Nyx",
        tag: "After-dark streams · VIP posts · Subscriber exclusives",
        image:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Naomi Hart",
        tag: "Direct messages · Premium sets · Members lounge access",
        image:
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Reina Noir",
        tag: "Exclusive clips · Priority replies · Curated private drops",
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      },
    ],
    []
  );


  const ctaCards = [
    {
      title: "Connect",
      body: "Shared spaces for real interaction and lasting connection",
      action: "Explore members",
    },
    {
      title: "Promotions",
      body: "Exclusive deals, free trials, and discounts from top creators",
      action: "View deals",
    },
    {
      title: "Create & Earn",
      body: "Build your presence, grow your audience, and earn on your terms",
      action: "Start creating",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselHovered, setCarouselHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || carouselHovered) return;

    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredCreators.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [carouselHovered, featuredCreators.length, prefersReducedMotion]);

  const trackTranslate = `translateX(-${currentSlide * (100 / featuredCreators.length)}%)`;

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff8fb] text-[#5b4153]">
      <style>{`
        @keyframes floatHearts {
          0% {
            transform: translateY(-10vh) scale(0.85);
            opacity: 0;
          }
          15% {
            opacity: 0.55;
          }
          85% {
            opacity: 0.35;
          }
          100% {
            transform: translateY(110vh) scale(1.1);
            opacity: 0;
          }
        }

        @keyframes softFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .heart-rain span {
          position: absolute;
          top: -10vh;
          animation-name: floatHearts;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        .fade-up {
          animation: softFade 0.8s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .heart-rain,
          .fade-up {
            animation: none !important;
          }

          .heart-rain {
            display: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute left-6 top-6 z-20 md:left-10 md:top-8 lg:left-14 xl:left-20">
        <svg
          viewBox="0 0 760 190"
          className="h-auto w-[250px] md:w-[310px] lg:w-[350px]"
          aria-label="Pumdoki logo"
          role="img"
        >
          <defs>
            <linearGradient id="logoHeartBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff7fa" />
              <stop offset="48%" stopColor="#ffd8e5" />
              <stop offset="100%" stopColor="#f3a0bc" />
            </linearGradient>
            <linearGradient id="logoHeartGloss" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="logoWordFill" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffd1e0" />
              <stop offset="55%" stopColor="#f8b3ca" />
              <stop offset="100%" stopColor="#ef8fb1" />
            </linearGradient>
            <filter id="logoSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#f6bfd2" floodOpacity="0.35" />
            </filter>
          </defs>

          <g transform="translate(6,10)" filter="url(#logoSoftGlow)">
            <path
              d="M104 126c-7-6-13-11-18-16C54 82 35 63 35 37 35 16 51 0 72 0c13 0 25 6 34 19 9-13 21-19 34-19 21 0 38 17 38 38 0 26-19 45-52 74-5 5-11 10-18 16l-10 9-10-9Z"
              fill="url(#logoHeartBase)"
              stroke="#111111"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path
              d="M56 77h26c5 0 8-3 11-10l8-20 12 48 10-24c3-7 7-10 11-10h18"
              fill="none"
              stroke="#eb6f97"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M62 27c12-15 29-24 51-24 11 0 22 3 33 8-14-3-27 3-37 16-10 14-16 34-25 51-7 13-15 22-28 25 11-9 19-21 25-34 9-20 16-35 27-45 6-5 12-8 19-9-23 0-42 5-65 12Z"
              fill="url(#logoHeartGloss)"
              opacity="0.6"
            />
            <circle cx="150" cy="32" r="5" fill="#ffffff" opacity="0.92" />
            <path d="M150 22v6M150 36v6M140 32h6M154 32h6" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            <circle cx="24" cy="108" r="2.4" fill="#f4a2bf" opacity="0.9" />
            <circle cx="29" cy="116" r="1.8" fill="#f8c5d7" opacity="0.9" />
            <circle cx="177" cy="96" r="2.4" fill="#f4a2bf" opacity="0.9" />
            <circle cx="186" cy="101" r="1.8" fill="#f8c5d7" opacity="0.9" />
            <circle cx="171" cy="106" r="1.6" fill="#f7bbcf" opacity="0.9" />
          </g>

          <text
            x="205"
            y="104"
            fontSize="82"
            fontWeight="700"
            fill="#fff7fa"
            stroke="#111111"
            strokeWidth="4.2"
            paintOrder="stroke"
            fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            letterSpacing="0.1"
          >
            Pumdoki
          </text>
          <text
            x="205"
            y="104"
            fontSize="82"
            fontWeight="700"
            fill="url(#logoWordFill)"
            fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            letterSpacing="0.1"
          >
            Pumdoki
          </text>

          <text
            x="36"
            y="166"
            fontSize="28"
            fontWeight="600"
            fill="#f7d5e1"
            stroke="#111111"
            strokeWidth="1.3"
            paintOrder="stroke"
            fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            letterSpacing="0.15"
          >
            A space built for creators, members, and real interaction
          </text>
        </svg>
      </div>

      <main className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex items-center overflow-hidden bg-gradient-to-br from-[#ffc8de] via-[#ffb6d5] to-[#f9a8c7] px-6 py-12 md:px-10 lg:px-14 xl:px-20">
          <div className="pointer-events-none absolute inset-0 heart-rain opacity-95" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => (
              <span
                key={`left-heart-${index}`}
                className="text-white/60"
                style={{
                  left: `${5 + index * 10}%`,
                  fontSize: `${10 + (index % 3) * 4}px`,
                  animationDuration: `${18 + (index % 4) * 4}s`,
                  animationDelay: `${(index % 5) * 1.6}s`,
                }}
              >
                &#10084;
              </span>
            ))}
          </div>

          <div className="relative z-10 mx-auto w-full max-w-2xl pt-10 md:pt-14 lg:pt-16">
            <h1 className="fade-up text-4xl font-semibold leading-tight text-[#241a22] md:text-5xl xl:text-6xl">
              What you feel in a moment can stay with you forever.
            </h1>

            <p className="fade-up mt-4 max-w-xl text-base leading-7 text-[#4a3340] md:text-lg">
              Pumdoki brings creators and members into one space built for presence, interaction, and the kind of connection that feels worth your time.
            </p>

            <div className="fade-up mt-8 grid gap-4 sm:grid-cols-3">
              {ctaCards.map((card) => (
                <a
                  key={card.title}
                  href="#"
                  className="group rounded-3xl border border-white/60 bg-white/58 p-4 backdrop-blur-md shadow-lg shadow-pink-500/10 transition duration-300 hover:-translate-y-1 hover:border-white/80 hover:bg-white/72 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  <p className="text-2xl font-semibold text-[#241a22]">{card.title}</p>
                  <p className="mt-2 min-h-[72px] text-sm leading-6 text-[#5a3d4d]">{card.body}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#241a22]">
                    <span>{card.action}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                  </div>
                </a>
              ))}
            </div>

            <div className="fade-up mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#241a22]">Featured creators</h2>
                <span className="text-sm text-[#6a4a5b]">Updated daily</span>
              </div>

              <div
                className="overflow-hidden rounded-[28px] border border-white/60 bg-white/62 shadow-2xl shadow-pink-500/20 backdrop-blur-md"
                onMouseEnter={() => setCarouselHovered(true)}
                onMouseLeave={() => setCarouselHovered(false)}
              >
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{
                    width: `${featuredCreators.length * 100}%`,
                    transform: trackTranslate,
                  }}
                >
                  {featuredCreators.map((creator) => (
                    <article
                      key={creator.name}
                      className="shrink-0 p-4 md:p-5"
                      style={{ width: `${100 / featuredCreators.length}%` }}
                    >
                      <div className="grid gap-4 md:grid-cols-[150px_1fr]">
                        <img
                          src={creator.image}
                          alt={creator.name}
                          loading="lazy"
                          className="h-48 w-full rounded-3xl object-cover md:h-full"
                        />
                        <div className="flex flex-col justify-center rounded-3xl bg-white p-5">
                          <span className="w-fit rounded-full bg-[#f36c9d] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white">
                            Featured
                          </span>
                          <h3 className="mt-4 text-2xl font-semibold text-[#241a22]">{creator.name}</h3>
                          <p className="mt-2 max-w-md text-sm leading-6 text-[#4a3340]">{creator.tag}</p>
                          <button className="mt-5 w-fit rounded-full bg-[#241a22] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02]">
                            View profile
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                {featuredCreators.map((creator, index) => {
                  const isActive = currentSlide === index;
                  return (
                    <button
                      key={creator.name}
                      type="button"
                      aria-label={`Go to ${creator.name}`}
                      aria-pressed={isActive}
                      onClick={() => setCurrentSlide(index)}
                      className={`cursor-pointer rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/70 ${
                        isActive
                          ? "h-1.5 w-8 bg-white/95"
                          : "h-2 w-2 bg-white/55 hover:bg-white/80"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center overflow-hidden px-6 py-12 md:px-10 lg:px-14 xl:px-20">
          <div className="pointer-events-none absolute inset-0 heart-rain opacity-95" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => (
              <span
                key={`right-heart-${index}`}
                className="text-pink-300/65"
                style={{
                  left: `${5 + index * 10}%`,
                  fontSize: `${10 + (index % 3) * 4}px`,
                  animationDuration: `${18 + (index % 4) * 4}s`,
                  animationDelay: `${(index % 5) * 1.6}s`,
                }}
              >
                &#10084;
              </span>
            ))}
          </div>

          <div className="relative z-10 mx-auto w-full max-w-md">
            <div className="rounded-[32px] border border-pink-100 bg-white p-6 shadow-[0_20px_60px_rgba(244,114,182,0.15)] md:p-8">
              <div className="mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-200 to-pink-300 text-xl shadow-sm">
                  &#9825;
                </div>
                <h2 className="mt-4 text-3xl font-semibold text-[#6b475e]">Welcome back</h2>
                <p className="mt-2 text-sm leading-6 text-[#8c6d7f]">
                  Log in to continue exploring creators, communities, and exclusive moments on Pumdoki.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#7b5b6f]">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-pink-100 bg-[#fffafc] px-4 py-3 text-sm outline-none ring-0 transition placeholder:text-[#c59aae] focus:border-pink-300"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-[#7b5b6f]">
                      Password
                    </label>
                    <a href="#" className="text-sm font-medium text-[#df5f97] hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-pink-100 bg-[#fffafc] px-4 py-3 text-sm outline-none transition placeholder:text-[#c59aae] focus:border-pink-300"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[#8c6d7f]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-pink-200 text-pink-400 focus:ring-pink-300"
                    />
                    Remember me
                  </label>
                  <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-[#d85a91]">
                    Secure login
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-[#f472b6] to-[#ec4899] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-200 transition hover:translate-y-[-1px]"
                >
                  Log in
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-[#8c6d7f]">
                  By logging in and using Pumdoki, you agree to our{" "}
                  <a href="#" className="text-[#df5f97] hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="text-[#df5f97] hover:underline">Privacy Policy</a>, and confirm that you are at least 18 years old.
                </p>
              </form>

              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#c194aa]">
                <div className="h-px flex-1 bg-pink-100" />
                <span>or</span>
                <div className="h-px flex-1 bg-pink-100" />
              </div>

              <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm font-medium text-[#6b475e] transition hover:bg-pink-50">
                <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.233 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z" />
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4c-7.682 0-14.347 4.337-17.694 10.691Z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.143 35.091 26.715 36 24 36c-5.212 0-9.62-3.329-11.283-7.946l-6.522 5.025C9.5 39.556 16.227 44 24 44Z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.57h.001l6.19 5.238C36.972 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z" />
                </svg>
                Continue with Google
              </button>

              <div className="mt-6 rounded-2xl bg-pink-50 p-4 text-sm leading-6 text-[#8a6a7c]">
                <p className="font-medium text-[#6b475e]">New to Pumdoki?</p>
                <p className="mt-1">
                  Create an account to discover creators, support communities, and personalize your experience.
                </p>
                <button onClick={onOpenSignup} className="mt-3 font-semibold text-[#df5f97] hover:underline">Create account</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onNavigateLegal={onNavigateLegal} onOpenSignup={onOpenSignup} />
    </div>
  );
}
