import { useState, useEffect } from "react";
import { LoadingState, EmptyState, ErrorState } from "../components/StateViews";
import { useSimulatedFetch } from "../lib/useSimulatedFetch";
import {
  DRIMY,
  LEAGUES,
  ACHIEVEMENTS,
  LEADERBOARD,
  BOND_ACTIONS,
  TASKS,
  DRIMY_DEX,
  STORE_ITEMS,
} from "../fixtures/oasis";

/* ─── Mock Data ──────────────────────────────────────────────────────── */

/* ─── Colors ─────────────────────────────────────────────────────────── */

const SAKURA_PINK = "#f9a8c8";

/* ─── Floating Petals Component ──────────────────────────────────────── */

function FloatingPetals() {
  const petals = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 12,
    duration: 8 + Math.random() * 10,
    size: 8 + Math.random() * 14,
    opacity: 0.15 + Math.random() * 0.25,
    rotation: Math.random() * 360,
    sway: 20 + Math.random() * 40,
  }));

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="petalBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
        </defs>
      </svg>
      {petals.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none absolute"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            animation: `petalFall ${p.duration}s linear ${p.delay}s infinite`,
            opacity: p.opacity,
          }}
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 20 20"
            style={{ transform: `rotate(${p.rotation}deg)` }}
          >
            <path
              d="M10 2C10 2 6 6 6 10C6 14 10 18 10 18C10 18 14 14 14 10C14 6 10 2 10 2Z"
              fill="#f9a8c8"
              opacity="0.7"
            />
            <path
              d="M10 4C10 4 7 7 7 10C7 13 10 16 10 16"
              fill="none"
              stroke="#fce7f3"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </svg>
        </div>
      ))}
    </>
  );
}

/* ─── Energy Orbs Component ──────────────────────────────────────────── */

const ORB_SIZE = 40;
const ORB_COLOR = "#f9a8c8";
const ORB_COLOR_DARK = "#ec4899";
const ORB_COOLDOWN = 600; // 10 minutes in seconds

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function EnergyOrbs({ orbs, onCollect, now }) {
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="orbGradUniform" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="30%" stopColor={ORB_COLOR} stopOpacity="0.85" />
            <stop offset="70%" stopColor={ORB_COLOR_DARK} stopOpacity="0.7" />
            <stop offset="100%" stopColor={ORB_COLOR_DARK} stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="orbInnerUniform" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      {orbs.map((orb) => {
        const isCollected = orb.collectedAt != null;
        const elapsed = isCollected
          ? Math.floor((now - orb.collectedAt) / 1000)
          : 0;
        const remaining = isCollected ? Math.max(ORB_COOLDOWN - elapsed, 0) : 0;

        return (
          <div
            key={orb.id}
            className="absolute flex flex-col items-center"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              animation: isCollected
                ? "none"
                : `orbFloat ${3 + orb.floatSpeed}s ease-in-out ${orb.delay}s infinite alternate`,
            }}
          >
            {isCollected ? (
              /* Collected state: dark circle with countdown */
              <div className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: ORB_SIZE,
                    height: ORB_SIZE,
                    backgroundColor: "rgba(61,32,64,0.7)",
                    border: "2px solid rgba(249,168,200,0.2)",
                  }}
                >
                  <svg
                    viewBox="0 0 40 40"
                    width={ORB_SIZE - 12}
                    height={ORB_SIZE - 12}
                    opacity="0.3"
                  >
                    <circle cx="20" cy="20" r="16" fill={ORB_COLOR} />
                  </svg>
                </div>
                <span
                  className="mt-1 text-[9px] font-bold"
                  style={{ color: "#8c6d7f" }}
                >
                  {formatCountdown(remaining)}
                </span>
              </div>
            ) : (
              /* Available state: glowing orb */
              <button
                onClick={() => onCollect(orb.id)}
                className="cursor-pointer group flex flex-col items-center transition-transform hover:scale-110"
                aria-label="Collect energy orb"
              >
                <div className="relative">
                  {/* Outer glow */}
                  <div
                    className="absolute rounded-full blur-md group-hover:blur-lg transition-all"
                    style={{
                      width: ORB_SIZE + 16,
                      height: ORB_SIZE + 16,
                      left: -8,
                      top: -8,
                      background: `radial-gradient(circle, ${ORB_COLOR}66 0%, transparent 70%)`,
                    }}
                  />
                  {/* Core orb */}
                  <svg width={ORB_SIZE} height={ORB_SIZE} viewBox="0 0 40 40">
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="url(#orbGradUniform)"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="14"
                      fill="url(#orbInnerUniform)"
                      opacity="0.4"
                    />
                    <ellipse
                      cx="15"
                      cy="14"
                      rx="5"
                      ry="4"
                      fill="white"
                      opacity="0.6"
                    />
                    <ellipse
                      cx="13"
                      cy="12"
                      rx="2.5"
                      ry="2"
                      fill="white"
                      opacity="0.8"
                    />
                  </svg>
                </div>
                <span
                  className="mt-1 text-[9px] font-bold tracking-wider"
                  style={{ color: "#be185d" }}
                >
                  ORB
                </span>
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ─── Drimy Creature SVG ─────────────────────────────────────────────── */

function DrimyCreature({ stage }) {
  // Stage 1: Lumiveil - tiny fairy-fox
  if (stage === 1) {
    return (
      <svg
        viewBox="0 0 200 220"
        className="w-48 h-52 sm:w-56 sm:h-60 drop-shadow-lg"
        style={{ filter: "drop-shadow(0 0 20px rgba(249,168,200,0.4))" }}
      >
        <defs>
          <radialGradient id="bodyGrad1" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#fff5f9" />
            <stop offset="50%" stopColor="#fce7f3" />
            <stop offset="100%" stopColor="#f9a8c8" />
          </radialGradient>
          <radialGradient id="cheekGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f9a8c8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f9a8c8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fce7f3" />
            <stop offset="100%" stopColor="#f9a8c8" />
          </linearGradient>
          <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fbcfe8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f9a8c8" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="tailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fce7f3" />
            <stop offset="100%" stopColor="#f9a8c8" />
          </linearGradient>
        </defs>

        {/* Tail */}
        <path
          d="M135 155 C155 145, 175 130, 170 110 C165 95, 155 100, 150 115 C145 130, 140 145, 135 155"
          fill="url(#tailGrad)"
          stroke="#e8a0bd"
          strokeWidth="1"
        />

        {/* Body */}
        <ellipse
          cx="100"
          cy="145"
          rx="48"
          ry="42"
          fill="url(#bodyGrad1)"
          stroke="#e8a0bd"
          strokeWidth="1.2"
        />

        {/* Belly patch */}
        <ellipse
          cx="100"
          cy="155"
          rx="28"
          ry="24"
          fill="#fff8fb"
          opacity="0.7"
        />

        {/* Left wing (budding) */}
        <path
          d="M58 120 C40 100, 35 80, 50 75 C60 72, 62 90, 60 110 Z"
          fill="url(#wingGrad)"
          stroke="#f0b8d0"
          strokeWidth="0.8"
          opacity="0.8"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-3 58 120;3 58 120;-3 58 120"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>

        {/* Right wing (budding) */}
        <path
          d="M142 120 C160 100, 165 80, 150 75 C140 72, 138 90, 140 110 Z"
          fill="url(#wingGrad)"
          stroke="#f0b8d0"
          strokeWidth="0.8"
          opacity="0.8"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="3 142 120;-3 142 120;3 142 120"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>

        {/* Head */}
        <ellipse
          cx="100"
          cy="100"
          rx="38"
          ry="34"
          fill="url(#bodyGrad1)"
          stroke="#e8a0bd"
          strokeWidth="1.2"
        />

        {/* Left ear */}
        <path
          d="M72 78 L60 42 L82 70 Z"
          fill="url(#earGrad)"
          stroke="#e8a0bd"
          strokeWidth="1"
        />
        <path d="M72 76 L64 50 L80 72 Z" fill="#fff0f5" opacity="0.6" />

        {/* Right ear */}
        <path
          d="M128 78 L140 42 L118 70 Z"
          fill="url(#earGrad)"
          stroke="#e8a0bd"
          strokeWidth="1"
        />
        <path d="M128 76 L136 50 L120 72 Z" fill="#fff0f5" opacity="0.6" />

        {/* Eyes */}
        <ellipse cx="85" cy="96" rx="6" ry="7" fill="#3d2040" />
        <ellipse cx="115" cy="96" rx="6" ry="7" fill="#3d2040" />
        {/* Eye highlights */}
        <ellipse cx="83" cy="93" rx="2.5" ry="3" fill="white" opacity="0.9" />
        <ellipse cx="113" cy="93" rx="2.5" ry="3" fill="white" opacity="0.9" />
        <circle cx="87" cy="98" r="1" fill="white" opacity="0.6" />
        <circle cx="117" cy="98" r="1" fill="white" opacity="0.6" />

        {/* Nose */}
        <ellipse cx="100" cy="105" rx="3" ry="2" fill="#e8a0bd" />

        {/* Mouth */}
        <path
          d="M95 109 Q100 113 105 109"
          fill="none"
          stroke="#d48aa8"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Cheek blush */}
        <circle cx="74" cy="105" r="7" fill="url(#cheekGlow)" />
        <circle cx="126" cy="105" r="7" fill="url(#cheekGlow)" />

        {/* Forehead gem */}
        <path
          d="M100 80 L103 86 L100 92 L97 86 Z"
          fill="#e8b4fe"
          stroke="#d8a0f0"
          strokeWidth="0.5"
          opacity="0.8"
        >
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>

        {/* Paws */}
        <ellipse
          cx="75"
          cy="182"
          rx="14"
          ry="8"
          fill="url(#bodyGrad1)"
          stroke="#e8a0bd"
          strokeWidth="1"
        />
        <ellipse
          cx="125"
          cy="182"
          rx="14"
          ry="8"
          fill="url(#bodyGrad1)"
          stroke="#e8a0bd"
          strokeWidth="1"
        />
        {/* Paw pads */}
        <circle cx="72" cy="182" r="3" fill="#f9a8c8" opacity="0.5" />
        <circle cx="78" cy="182" r="3" fill="#f9a8c8" opacity="0.5" />
        <circle cx="122" cy="182" r="3" fill="#f9a8c8" opacity="0.5" />
        <circle cx="128" cy="182" r="3" fill="#f9a8c8" opacity="0.5" />

        {/* Sparkles around */}
        <g opacity="0.6">
          <path d="M45 60 L47 55 L49 60 L47 65 Z" fill="#f9a8c8">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M155 55 L157 50 L159 55 L157 60 Z" fill="#e8b4fe">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="3s"
              begin="0.5s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M50 150 L52 145 L54 150 L52 155 Z" fill="#93c5fd">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="2s"
              begin="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* Floating aura */}
        <ellipse
          cx="100"
          cy="140"
          rx="55"
          ry="50"
          fill="none"
          stroke="#f9a8c8"
          strokeWidth="0.5"
          opacity="0.2"
        >
          <animate
            attributeName="rx"
            values="55;60;55"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="ry"
            values="50;55;50"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.1;0.2"
            dur="4s"
            repeatCount="indefinite"
          />
        </ellipse>
      </svg>
    );
  }

  // Stage 2: Lumivara - elegant with flowing tails
  if (stage === 2) {
    return (
      <svg
        viewBox="0 0 240 260"
        className="w-56 h-64 sm:w-64 sm:h-72 drop-shadow-lg"
        style={{ filter: "drop-shadow(0 0 24px rgba(249,168,200,0.5))" }}
      >
        <defs>
          <radialGradient id="bodyGrad2" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#fff5f9" />
            <stop offset="40%" stopColor="#fce7f3" />
            <stop offset="100%" stopColor="#f0a0c0" />
          </radialGradient>
          <linearGradient id="wingGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#e8b4fe" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="tailGrad2a" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fce7f3" />
            <stop offset="100%" stopColor="#e8b4fe" />
          </linearGradient>
          <linearGradient id="tailGrad2b" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fce7f3" />
            <stop offset="100%" stopColor="#f9a8c8" />
          </linearGradient>
        </defs>

        {/* Twin tails */}
        <path
          d="M155 170 C180 155, 210 140, 215 115 C220 95, 200 100, 195 120 C190 140, 170 155, 155 170"
          fill="url(#tailGrad2a)"
          stroke="#d4a0d0"
          strokeWidth="1"
          opacity="0.9"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-2 155 170;2 155 170;-2 155 170"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M150 175 C175 165, 200 160, 210 140 C215 125, 195 130, 185 145 C175 160, 160 170, 150 175"
          fill="url(#tailGrad2b)"
          stroke="#e8a0bd"
          strokeWidth="1"
          opacity="0.8"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="2 150 175;-2 150 175;2 150 175"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </path>

        {/* Body - more elegant */}
        <ellipse
          cx="120"
          cy="165"
          rx="52"
          ry="46"
          fill="url(#bodyGrad2)"
          stroke="#e8a0bd"
          strokeWidth="1.2"
        />
        <ellipse
          cx="120"
          cy="175"
          rx="30"
          ry="26"
          fill="#fff8fb"
          opacity="0.7"
        />

        {/* Blossoming wings */}
        <path
          d="M72 130 C45 95, 30 55, 55 45 C75 38, 80 70, 75 100 Z"
          fill="url(#wingGrad2)"
          stroke="#e0b0d0"
          strokeWidth="0.8"
          opacity="0.85"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-5 72 130;5 72 130;-5 72 130"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M168 130 C195 95, 210 55, 185 45 C165 38, 160 70, 165 100 Z"
          fill="url(#wingGrad2)"
          stroke="#e0b0d0"
          strokeWidth="0.8"
          opacity="0.85"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="5 168 130;-5 168 130;5 168 130"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>

        {/* Head */}
        <ellipse
          cx="120"
          cy="115"
          rx="42"
          ry="38"
          fill="url(#bodyGrad2)"
          stroke="#e8a0bd"
          strokeWidth="1.2"
        />

        {/* Ears - taller and more elegant */}
        <path
          d="M88 90 L70 40 L100 80 Z"
          fill="url(#earGrad)"
          stroke="#e8a0bd"
          strokeWidth="1"
        />
        <path d="M90 88 L76 50 L98 82 Z" fill="#fff0f5" opacity="0.6" />
        <path
          d="M152 90 L170 40 L140 80 Z"
          fill="url(#earGrad)"
          stroke="#e8a0bd"
          strokeWidth="1"
        />
        <path d="M150 88 L164 50 L142 82 Z" fill="#fff0f5" opacity="0.6" />

        {/* Eyes */}
        <ellipse cx="104" cy="110" rx="7" ry="8" fill="#3d2040" />
        <ellipse cx="136" cy="110" rx="7" ry="8" fill="#3d2040" />
        <ellipse cx="102" cy="107" rx="3" ry="3.5" fill="white" opacity="0.9" />
        <ellipse cx="134" cy="107" rx="3" ry="3.5" fill="white" opacity="0.9" />
        <circle cx="106" cy="113" r="1.2" fill="white" opacity="0.6" />
        <circle cx="138" cy="113" r="1.2" fill="white" opacity="0.6" />

        {/* Nose */}
        <ellipse cx="120" cy="120" rx="3.5" ry="2.2" fill="#d48aa8" />
        <path
          d="M114 124 Q120 129 126 124"
          fill="none"
          stroke="#d48aa8"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Cheeks */}
        <circle cx="90" cy="120" r="8" fill="#f9a8c8" opacity="0.3" />
        <circle cx="150" cy="120" r="8" fill="#f9a8c8" opacity="0.3" />

        {/* Crown gem */}
        <path
          d="M120 90 L124 98 L120 106 L116 98 Z"
          fill="#c084fc"
          stroke="#a855f7"
          strokeWidth="0.6"
        >
          <animate
            attributeName="opacity"
            values="0.7;1;0.7"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>

        {/* Paws */}
        <ellipse
          cx="90"
          cy="206"
          rx="16"
          ry="9"
          fill="url(#bodyGrad2)"
          stroke="#e8a0bd"
          strokeWidth="1"
        />
        <ellipse
          cx="150"
          cy="206"
          rx="16"
          ry="9"
          fill="url(#bodyGrad2)"
          stroke="#e8a0bd"
          strokeWidth="1"
        />

        {/* More sparkles */}
        <g>
          <path d="M35 50 L37 44 L39 50 L37 56 Z" fill="#c084fc">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M200 45 L202 39 L204 45 L202 51 Z" fill="#f9a8c8">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="2.5s"
              begin="0.8s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M30 140 L32 134 L34 140 L32 146 Z" fill="#93c5fd">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="3s"
              begin="0.3s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M210 130 L212 124 L214 130 L212 136 Z" fill="#fbbf24">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="2s"
              begin="1.2s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* Aura rings */}
        <ellipse
          cx="120"
          cy="155"
          rx="60"
          ry="55"
          fill="none"
          stroke="#e8b4fe"
          strokeWidth="0.5"
          opacity="0.2"
        >
          <animate
            attributeName="rx"
            values="60;66;60"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.08;0.2"
            dur="4s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse
          cx="120"
          cy="155"
          rx="70"
          ry="64"
          fill="none"
          stroke="#f9a8c8"
          strokeWidth="0.3"
          opacity="0.15"
        >
          <animate
            attributeName="rx"
            values="70;76;70"
            dur="5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.15;0.05;0.15"
            dur="5s"
            repeatCount="indefinite"
          />
        </ellipse>
      </svg>
    );
  }

  // Stage 3: Luminara - majestic celestial fox
  return (
    <svg
      viewBox="0 0 280 300"
      className="w-64 h-72 sm:w-72 sm:h-80 drop-shadow-lg"
      style={{ filter: "drop-shadow(0 0 30px rgba(200,130,252,0.4))" }}
    >
      <defs>
        <radialGradient id="bodyGrad3" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fff5f9" />
          <stop offset="30%" stopColor="#fce7f3" />
          <stop offset="70%" stopColor="#f0a0c0" />
          <stop offset="100%" stopColor="#e090b8" />
        </radialGradient>
        <linearGradient id="wingGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#e8b4fe" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#c4b5fd" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="auroraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f9a8c8" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#c084fc" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Aurora background */}
      <ellipse
        cx="140"
        cy="150"
        rx="120"
        ry="100"
        fill="url(#auroraGrad)"
        opacity="0.3"
      >
        <animate
          attributeName="rx"
          values="120;130;120"
          dur="6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.3;0.15;0.3"
          dur="6s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Multiple flowing tails */}
      <path
        d="M175 195 C210 170, 250 145, 255 110 C258 85, 235 95, 225 120 C215 145, 190 175, 175 195"
        fill="#e8b4fe"
        stroke="#d4a0d0"
        strokeWidth="0.8"
        opacity="0.7"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-3 175 195;3 175 195;-3 175 195"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M170 200 C200 180, 240 165, 248 135 C252 115, 230 125, 218 145 C206 165, 185 185, 170 200"
        fill="#f9a8c8"
        stroke="#e8a0bd"
        strokeWidth="0.8"
        opacity="0.7"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="2 170 200;-3 170 200;2 170 200"
          dur="3.5s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M168 205 C195 195, 230 185, 240 160 C245 145, 225 150, 215 165 C205 180, 180 195, 168 205"
        fill="#c4b5fd"
        stroke="#a78bfa"
        strokeWidth="0.8"
        opacity="0.5"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-2 168 205;4 168 205;-2 168 205"
          dur="5s"
          repeatCount="indefinite"
        />
      </path>

      {/* Grand wings */}
      <path
        d="M80 140 C45 90, 15 30, 50 15 C80 3, 90 60, 82 110 Z"
        fill="url(#wingGrad3)"
        stroke="#d0a0d8"
        strokeWidth="0.8"
        opacity="0.85"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-6 80 140;6 80 140;-6 80 140"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M200 140 C235 90, 265 30, 230 15 C200 3, 190 60, 198 110 Z"
        fill="url(#wingGrad3)"
        stroke="#d0a0d8"
        strokeWidth="0.8"
        opacity="0.85"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="6 200 140;-6 200 140;6 200 140"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>

      {/* Body */}
      <ellipse
        cx="140"
        cy="185"
        rx="56"
        ry="50"
        fill="url(#bodyGrad3)"
        stroke="#e090b8"
        strokeWidth="1.2"
      />
      <ellipse cx="140" cy="195" rx="32" ry="28" fill="#fff8fb" opacity="0.7" />

      {/* Chest crest markings */}
      <path
        d="M130 170 Q140 160 150 170"
        fill="none"
        stroke="#c084fc"
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M125 178 Q140 165 155 178"
        fill="none"
        stroke="#c084fc"
        strokeWidth="0.8"
        opacity="0.3"
      />

      {/* Head */}
      <ellipse
        cx="140"
        cy="125"
        rx="45"
        ry="40"
        fill="url(#bodyGrad3)"
        stroke="#e090b8"
        strokeWidth="1.2"
      />

      {/* Regal ears */}
      <path
        d="M105 100 L82 40 L118 88 Z"
        fill="url(#earGrad)"
        stroke="#e090b8"
        strokeWidth="1"
      />
      <path d="M107 98 L88 50 L116 90 Z" fill="#fff0f5" opacity="0.6" />
      <path
        d="M175 100 L198 40 L162 88 Z"
        fill="url(#earGrad)"
        stroke="#e090b8"
        strokeWidth="1"
      />
      <path d="M173 98 L192 50 L164 90 Z" fill="#fff0f5" opacity="0.6" />

      {/* Eyes - larger, more expressive */}
      <ellipse cx="122" cy="120" rx="8" ry="9" fill="#3d2040" />
      <ellipse cx="158" cy="120" rx="8" ry="9" fill="#3d2040" />
      <ellipse cx="120" cy="117" rx="3.5" ry="4" fill="white" opacity="0.9" />
      <ellipse cx="156" cy="117" rx="3.5" ry="4" fill="white" opacity="0.9" />
      <circle cx="124" cy="123" r="1.5" fill="white" opacity="0.6" />
      <circle cx="160" cy="123" r="1.5" fill="white" opacity="0.6" />
      {/* Eye glow */}
      <ellipse
        cx="122"
        cy="120"
        rx="12"
        ry="13"
        fill="none"
        stroke="#c084fc"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <ellipse
        cx="158"
        cy="120"
        rx="12"
        ry="13"
        fill="none"
        stroke="#c084fc"
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* Nose and mouth */}
      <ellipse cx="140" cy="132" rx="4" ry="2.5" fill="#d48aa8" />
      <path
        d="M133 137 Q140 142 147 137"
        fill="none"
        stroke="#d48aa8"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Cheeks */}
      <circle cx="106" cy="130" r="9" fill="#f9a8c8" opacity="0.25" />
      <circle cx="174" cy="130" r="9" fill="#f9a8c8" opacity="0.25" />

      {/* Crown / tiara */}
      <path
        d="M125 92 L130 82 L135 88 L140 78 L145 88 L150 82 L155 92"
        fill="none"
        stroke="#c084fc"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M140 78 L142 86 L140 94 L138 86 Z"
        fill="#c084fc"
        stroke="#a855f7"
        strokeWidth="0.5"
      >
        <animate
          attributeName="opacity"
          values="0.7;1;0.7"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      <circle cx="130" cy="84" r="2" fill="#fbbf24" opacity="0.8" />
      <circle cx="150" cy="84" r="2" fill="#fbbf24" opacity="0.8" />

      {/* Paws */}
      <ellipse
        cx="105"
        cy="230"
        rx="18"
        ry="10"
        fill="url(#bodyGrad3)"
        stroke="#e090b8"
        strokeWidth="1"
      />
      <ellipse
        cx="175"
        cy="230"
        rx="18"
        ry="10"
        fill="url(#bodyGrad3)"
        stroke="#e090b8"
        strokeWidth="1"
      />

      {/* Many sparkles */}
      <g>
        {[
          { x: 25, y: 35, c: "#c084fc", d: 2, b: 0 },
          { x: 255, y: 30, c: "#f9a8c8", d: 2.5, b: 0.5 },
          { x: 20, y: 130, c: "#93c5fd", d: 3, b: 1 },
          { x: 260, y: 120, c: "#fbbf24", d: 2, b: 0.8 },
          { x: 40, y: 200, c: "#f9a8c8", d: 2.5, b: 0.3 },
          { x: 240, y: 210, c: "#e8b4fe", d: 3, b: 1.5 },
        ].map((s, i) => (
          <path
            key={i}
            d={`M${s.x} ${s.y} L${s.x + 2} ${s.y - 6} L${s.x + 4} ${s.y} L${s.x + 2} ${s.y + 6} Z`}
            fill={s.c}
          >
            <animate
              attributeName="opacity"
              values="0.2;1;0.2"
              dur={`${s.d}s`}
              begin={`${s.b}s`}
              repeatCount="indefinite"
            />
          </path>
        ))}
      </g>
    </svg>
  );
}

/* ─── Achievement Icon ───────────────────────────────────────────────── */

function AchievementIcon({ type, completed }) {
  const color = completed ? "#f472b6" : "#d1d5db";
  const bg = completed ? "#fdf2f8" : "#f9fafb";
  const icons = {
    flame: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill={color}>
        <path d="M12 23C7 23 3 19.5 3 14.5C3 11 5 8 7 6C7 8 8 10 10 11C10 8 11 4 14 2C14 5 16 7 17 9C18 7 18 5 18 5C20 7 21 10 21 14.5C21 19.5 17 23 12 23Z" />
      </svg>
    ),
    star: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill={color}>
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
    trophy: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill={color}>
        <path d="M6 9H4C3 9 2 8 2 7V5C2 4 3 3 4 3H6V9ZM18 9H20C21 9 22 8 22 7V5C22 4 21 3 20 3H18V9ZM17 2H7V9C7 12 9 14 12 14C15 14 17 12 17 9V2ZM9 18H15V22H9V18ZM7 16C7 16 7 18 9 18H15C17 18 17 16 17 16H7Z" />
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill={color}>
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
      </svg>
    ),
    book: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill={color}>
        <path d="M4 19.5V4.5C4 3.1 5.1 2 6.5 2H20V22H6.5C5.1 22 4 20.9 4 19.5ZM6 19.5C6 19.8 6.2 20 6.5 20H18V4H6.5C6.2 4 6 4.2 6 4.5V19.5ZM8 7H16V9H8V7Z" />
      </svg>
    ),
    sparkle: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill={color}>
        <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8L12 2Z" />
      </svg>
    ),
    wings: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill={color}>
        <path d="M12 12C8 4 2 4 2 9C2 14 8 16 12 20C16 16 22 14 22 9C22 4 16 4 12 12Z" />
      </svg>
    ),
  };

  return (
    <div
      className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl"
      style={{
        backgroundColor: bg,
        border: `2px solid ${completed ? "#fbcfe8" : "#e5e7eb"}`,
      }}
    >
      {icons[type] || icons.star}
    </div>
  );
}

/* ─── Rarity Color Helper ────────────────────────────────────────────── */

function rarityColor(rarity) {
  switch (rarity) {
    case "Common":
      return { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };
    case "Rare":
      return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
    case "Epic":
      return { bg: "#faf5ff", text: "#9333ea", border: "#e9d5ff" };
    case "Legendary":
      return { bg: "#fffbeb", text: "#d97706", border: "#fde68a" };
    default:
      return { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" };
  }
}

/* ─── Format Number Helper ───────────────────────────────────────────── */

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

/* ─── Main OasisPage Component ───────────────────────────────────────── */

export default function OasisPage({ onBack }) {
  const [drimy, setDrimy] = useState({ ...DRIMY });
  const [activePanel, setActivePanel] = useState(null); // null = default scene, "achievements", "leaderboard", "profile"
  const [activeAction, setActiveAction] = useState(null); // "tasks", "bond", "drimydex", "store", "luckycatch"
  const [orbsState, setOrbsState] = useState(() =>
    Array.from({ length: 7 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 10 + Math.random() * 55,
      floatSpeed: Math.random() * 2,
      delay: Math.random() * 2,
      collectedAt: null, // timestamp when collected, null = available
    }))
  );
  const [now, setNow] = useState(Date.now());
  const [orbCollectAnim, setOrbCollectAnim] = useState(null);
  const [luckyCatchResult, setLuckyCatchResult] = useState(null);
  const [bondFeedback, setBondFeedback] = useState(null);
  const page = useSimulatedFetch();

  // Tick every second for countdown display + auto-regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);
      // Auto-regenerate orbs whose cooldown has expired
      setOrbsState((prev) => {
        let changed = false;
        const next = prev.map((o) => {
          if (
            o.collectedAt != null &&
            (currentNow - o.collectedAt) / 1000 >= ORB_COOLDOWN
          ) {
            changed = true;
            return {
              ...o,
              collectedAt: null,
              x: 15 + Math.random() * 70,
              y: 10 + Math.random() * 55,
            };
          }
          return o;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (page.status !== "ready") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8fb] px-6">
        {page.status === "loading" && <LoadingState label="Loading Oasis…" />}
        {page.status === "empty" && (
          <EmptyState
            title="Your Oasis is waiting"
            message="Choose a starter Drimy to begin your collection."
          />
        )}
        {page.status === "error" && (
          <ErrorState message="We couldn’t load Oasis." onRetry={page.retry} />
        )}
      </div>
    );
  }

  const collectOrb = (id) => {
    setOrbsState((prev) =>
      prev.map((o) => (o.id === id ? { ...o, collectedAt: Date.now() } : o))
    );
    setDrimy((prev) => ({ ...prev, orbs: prev.orbs + 10 }));
    setOrbCollectAnim("+10 Orbs");
    setTimeout(() => setOrbCollectAnim(null), 1200);
  };

  const doBondAction = (action) => {
    if (drimy.orbs < action.cost) return;
    setDrimy((prev) => ({
      ...prev,
      orbs: prev.orbs - action.cost,
      currentXP: prev.currentXP + action.xp,
      totalXP: prev.totalXP + action.xp,
    }));
    setBondFeedback(`+${action.xp} XP`);
    setTimeout(() => setBondFeedback(null), 1500);
  };

  const doLuckyCatch = () => {
    if (drimy.orbs < 300) return;
    setDrimy((prev) => ({ ...prev, orbs: prev.orbs - 300 }));
    const roll = Math.random();
    let result;
    if (roll < 0.05) {
      result = {
        rarity: "Legendary",
        name: "Nebulynx",
        message: "Incredible! A Legendary Drimy!",
      };
    } else if (roll < 0.2) {
      result = {
        rarity: "Epic",
        name: "Glimmertail",
        message: "Amazing! An Epic Drimy!",
      };
    } else if (roll < 0.5) {
      result = {
        rarity: "Rare",
        name: "Mistclaw",
        message: "Nice! A Rare Drimy!",
      };
    } else {
      result = {
        rarity: "Common",
        name: "Petalshade",
        message: "You found a Common Drimy!",
      };
    }
    setLuckyCatchResult(result);
  };

  const xpToEvolve = drimy.nextEvolutionXP - drimy.currentXP;
  const xpProgress = (drimy.currentXP / drimy.nextEvolutionXP) * 100;

  /* ─── Right-side Action Menu Items ──────────────────────────────────── */
  const actionMenuItems = [
    {
      id: "tasks",
      label: "Tasks",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: "bond",
      label: "Bond",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
    },
    {
      id: "drimydex",
      label: "DrimyDex",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5V4.5C4 3.1 5.1 2 6.5 2H20V22H6.5C5.1 22 4 20.9 4 19.5Z" />
          <path d="M6 19.5C6 19.8 6.2 20 6.5 20H18V4H6.5C6.2 4 6 4.2 6 4.5V19.5Z" />
          <circle cx="12" cy="10" r="3" />
          <path d="M9 16h6" />
        </svg>
      ),
    },
    {
      id: "store",
      label: "Store",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 7v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6z" />
          <path d="M3 7h18" />
          <path d="M16 11a4 4 0 01-8 0" />
        </svg>
      ),
    },
    {
      id: "luckycatch",
      label: "Lucky Catch",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8L12 2Z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(170deg, #fff8fb 0%, #fef0f5 30%, #fce7f3 60%, #fdf2f8 100%)",
      }}
    >
      {/* Inline Styles for Animations */}
      <style>{`
        @keyframes petalFall {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh) translateX(40px) rotate(360deg); opacity: 0; }
        }
        @keyframes orbFloat {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-12px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbCollect {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-30px) scale(1.3); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(249,168,200,0.3); }
          50% { box-shadow: 0 0 35px rgba(249,168,200,0.5); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .oasis-panel {
          animation: fadeInUp 0.35s ease-out;
        }
        .oasis-action-panel {
          animation: slideInRight 0.3s ease-out;
          right: max(4.5rem, calc(50% - 18rem));
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(249,168,200,0.2);
        }
      `}</style>

      {/* Global SVG defs */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="orbCountGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor={ORB_COLOR} />
            <stop offset="100%" stopColor={ORB_COLOR_DARK} />
          </radialGradient>
        </defs>
      </svg>

      {/* Floating Petals Background */}
      <FloatingPetals />

      {/* Header Bar */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6"
        style={{
          backgroundColor: "rgba(255,248,251,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(249,168,200,0.2)",
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-[#5b4153] transition hover:bg-pink-50 hover:text-[#df5f97]"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Oasis Logo */}
          <svg viewBox="0 0 28 28" className="w-7 h-7">
            <defs>
              <radialGradient id="oasisLogoGrad" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#fce7f3" />
                <stop offset="100%" stopColor="#f9a8c8" />
              </radialGradient>
            </defs>
            <circle
              cx="14"
              cy="14"
              r="12"
              fill="url(#oasisLogoGrad)"
              stroke="#e8a0bd"
              strokeWidth="1.2"
            />
            <path
              d="M14 7 C10 7, 7 10, 7 14 C7 20 14 24 14 24 C14 24 21 20 21 14 C21 10 18 7 14 7Z"
              fill="#fff8fb"
              opacity="0.6"
            />
            <path
              d="M14 10 L15 13 L18 13 L16 15 L17 18 L14 16 L11 18 L12 15 L10 13 L13 13 Z"
              fill="#f472b6"
              opacity="0.9"
            />
          </svg>
          <h1 className="text-lg font-bold" style={{ color: "#3d2040" }}>
            Oasis
          </h1>
        </div>

        {/* Spacer to balance the header */}
        <div className="w-16" />
      </header>

      {/* Main Content */}
      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 pb-8">
        {/* ─── Default Scene View ──────────────────────────────────────── */}
        {activePanel === null && (
          <>
            {/* Orb count - above scene */}
            <div
              className="mt-4 flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,240,245,0.95), rgba(252,231,243,0.9))",
                border: "1px solid rgba(249,168,200,0.3)",
                boxShadow: "0 2px 12px rgba(249,168,200,0.12)",
              }}
            >
              <svg viewBox="0 0 20 20" className="w-5 h-5">
                <circle cx="10" cy="10" r="8" fill="url(#orbCountGrad)" />
                <ellipse
                  cx="7"
                  cy="7"
                  rx="2.5"
                  ry="2"
                  fill="white"
                  opacity="0.7"
                />
              </svg>
              <span className="text-sm font-bold" style={{ color: "#be185d" }}>
                {formatNumber(drimy.orbs)} Orbs
              </span>
            </div>

            {/* Drimy Scene */}
            <div className="relative mt-4 flex flex-col items-center">
              {/* Energy Orbs */}
              <div
                className="absolute inset-0"
                style={{
                  width: "380px",
                  height: "300px",
                  left: "50%",
                  top: "-10px",
                  transform: "translateX(-50%)",
                }}
              >
                <EnergyOrbs orbs={orbsState} onCollect={collectOrb} now={now} />
              </div>

              {/* Orb collect feedback */}
              {orbCollectAnim && (
                <div
                  className="absolute top-2 left-1/2 -translate-x-1/2 z-20 text-sm font-bold"
                  style={{
                    color: "#7c3aed",
                    animation: "orbCollect 1.2s ease-out forwards",
                  }}
                >
                  {orbCollectAnim}
                </div>
              )}

              {/* Bond feedback */}
              {bondFeedback && (
                <div
                  className="absolute top-16 left-1/2 -translate-x-1/2 z-20 text-lg font-bold"
                  style={{
                    color: "#ec4899",
                    animation: "orbCollect 1.5s ease-out forwards",
                  }}
                >
                  {bondFeedback}
                </div>
              )}

              {/* The Drimy */}
              <div className="relative z-10 mt-8">
                <DrimyCreature stage={drimy.stage} />
              </div>

              {/* Drimy name tag */}
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="text-xl font-bold"
                  style={{ color: "#3d2040" }}
                >
                  {drimy.stageNames[drimy.stage - 1]}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: "#fdf2f8",
                    color: "#be185d",
                    border: "1px solid #fbcfe8",
                  }}
                >
                  Stage {drimy.stage}/{drimy.maxStage}
                </span>
              </div>
              <p
                className="mt-1 text-center text-xs max-w-xs"
                style={{ color: "#8c6d7f" }}
              >
                {drimy.stageDescriptions[drimy.stage - 1]}
              </p>
            </div>

            {/* ─── Profile / Stat Card ────────────────────────────────────── */}
            <div
              className="oasis-panel relative mt-6 w-full max-w-md rounded-3xl p-5"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,240,245,0.92))",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(249,168,200,0.25)",
                boxShadow: "0 4px 30px rgba(249,168,200,0.15)",
              }}
            >
              {/* Left mini-icons */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
                {[
                  {
                    id: "profile",
                    label: "Profile",
                    icon: (
                      <svg
                        viewBox="0 0 20 20"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="10" cy="6" r="4" />
                        <path d="M2 18c0-3.3 3.6-6 8-6s8 2.7 8 6" />
                      </svg>
                    ),
                  },
                  {
                    id: "achievements",
                    label: "Achievements",
                    icon: (
                      <svg
                        viewBox="0 0 20 20"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="10" cy="8" r="6" />
                        <path d="M6 14l-2 5 6-2 6 2-2-5" />
                      </svg>
                    ),
                  },
                  {
                    id: "leaderboard",
                    label: "Leaderboard",
                    icon: (
                      <svg
                        viewBox="0 0 20 20"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="10" width="4" height="8" rx="1" />
                        <rect x="8" y="4" width="4" height="14" rx="1" />
                        <rect x="14" y="7" width="4" height="11" rx="1" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActivePanel(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl transition hover:scale-110"
                    style={{
                      color: "#8c6d7f",
                      backgroundColor: "rgba(249,168,200,0.1)",
                      border: "1px solid rgba(249,168,200,0.15)",
                    }}
                    title={item.label}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>

              {/* Card content */}
              <div className="ml-10">
                {/* League title */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #f472b6, #ec4899)",
                    }}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="w-3.5 h-3.5"
                      fill="white"
                    >
                      <path d="M8 1L10 5.5L15 6L11.5 9.5L12.5 14.5L8 12L3.5 14.5L4.5 9.5L1 6L6 5.5L8 1Z" />
                    </svg>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#be185d" }}
                  >
                    {drimy.league}
                  </span>
                  <span className="text-xs" style={{ color: "#8c6d7f" }}>
                    Rank #{drimy.leagueRank}
                  </span>
                </div>

                {/* XP Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-xs font-medium"
                      style={{ color: "#5b4153" }}
                    >
                      XP Progress
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#be185d" }}
                    >
                      {xpToEvolve} XP to evolve
                    </span>
                  </div>
                  <div
                    className="h-3 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: "#fce7f3" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${xpProgress}%`,
                        background:
                          "linear-gradient(90deg, #f9a8c8, #f472b6, #ec4899)",
                        boxShadow: "0 0 8px rgba(244,114,182,0.4)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px]" style={{ color: "#8c6d7f" }}>
                      {formatNumber(drimy.currentXP)} XP
                    </span>
                    <span className="text-[10px]" style={{ color: "#8c6d7f" }}>
                      {formatNumber(drimy.nextEvolutionXP)} XP
                    </span>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Day Streak */}
                  <div
                    className="stat-card flex items-center gap-2.5 rounded-2xl p-3 transition-all duration-200"
                    style={{
                      backgroundColor: "#fff8fb",
                      border: "1px solid rgba(249,168,200,0.2)",
                    }}
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, #fff0f5, #fce7f3)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="#f472b6"
                      >
                        <path d="M12 23C7 23 3 19.5 3 14.5C3 11 5 8 7 6C7 8 8 10 10 11C10 8 11 4 14 2C14 5 16 7 17 9C18 7 18 5 18 5C20 7 21 10 21 14.5C21 19.5 17 23 12 23Z" />
                      </svg>
                    </div>
                    <div>
                      <div
                        className="text-lg font-bold leading-tight"
                        style={{ color: "#3d2040" }}
                      >
                        {drimy.dayStreak}
                      </div>
                      <div
                        className="text-[10px] font-medium"
                        style={{ color: "#8c6d7f" }}
                      >
                        Day streak
                      </div>
                    </div>
                  </div>

                  {/* Total XP */}
                  <div
                    className="stat-card flex items-center gap-2.5 rounded-2xl p-3 transition-all duration-200"
                    style={{
                      backgroundColor: "#fff8fb",
                      border: "1px solid rgba(249,168,200,0.2)",
                    }}
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, #fff0f5, #fce7f3)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="#f472b6"
                      >
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                    <div>
                      <div
                        className="text-lg font-bold leading-tight"
                        style={{ color: "#3d2040" }}
                      >
                        {formatNumber(drimy.totalXP)}
                      </div>
                      <div
                        className="text-[10px] font-medium"
                        style={{ color: "#8c6d7f" }}
                      >
                        Total XP
                      </div>
                    </div>
                  </div>

                  {/* Current League */}
                  <div
                    className="stat-card flex items-center gap-2.5 rounded-2xl p-3 transition-all duration-200"
                    style={{
                      backgroundColor: "#fff8fb",
                      border: "1px solid rgba(249,168,200,0.2)",
                    }}
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, #fff0f5, #fce7f3)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="#f472b6"
                      >
                        <path d="M6 9H4C3 9 2 8 2 7V5C2 4 3 3 4 3H6V9ZM18 9H20C21 9 22 8 22 7V5C22 4 21 3 20 3H18V9ZM17 2H7V9C7 12 9 14 12 14C15 14 17 12 17 9V2ZM9 18H15V22H9V18ZM7 16C7 16 7 18 9 18H15C17 18 17 16 17 16H7Z" />
                      </svg>
                    </div>
                    <div>
                      <div
                        className="text-sm font-bold leading-tight"
                        style={{ color: "#3d2040" }}
                      >
                        Blossom
                      </div>
                      <div
                        className="text-[10px] font-medium"
                        style={{ color: "#8c6d7f" }}
                      >
                        Current league
                      </div>
                    </div>
                  </div>

                  {/* Featured Badge */}
                  <div
                    className="stat-card flex items-center gap-2.5 rounded-2xl p-3 transition-all duration-200"
                    style={{
                      backgroundColor: "#fff8fb",
                      border: "1px solid rgba(249,168,200,0.2)",
                    }}
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, #fff0f5, #fce7f3)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="#f472b6"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                    <div>
                      <div
                        className="text-sm font-bold leading-tight"
                        style={{ color: "#3d2040" }}
                      >
                        {drimy.featuredBadge.name}
                      </div>
                      <div
                        className="text-[10px] font-medium"
                        style={{ color: "#8c6d7f" }}
                      >
                        Featured badge
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── Achievements Panel ──────────────────────────────────────── */}
        {activePanel === "achievements" && (
          <div className="oasis-panel mt-6 w-full max-w-lg">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setActivePanel(null)}
                className="flex items-center gap-1.5 text-sm font-medium transition hover:text-[#df5f97]"
                style={{ color: "#5b4153" }}
              >
                <svg
                  viewBox="0 0 20 20"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 10H5M10 15l-5-5 5-5" />
                </svg>
                Back to Oasis
              </button>
              <h2 className="text-lg font-bold" style={{ color: "#3d2040" }}>
                Achievements
              </h2>
              <div className="w-20" />
            </div>

            <div className="space-y-3">
              {ACHIEVEMENTS.map((ach) => {
                const progress = Math.min(
                  (ach.progress / ach.target) * 100,
                  100
                );
                return (
                  <div
                    key={ach.id}
                    className="flex items-start gap-4 rounded-2xl p-4 transition"
                    style={{
                      background: ach.completed
                        ? "linear-gradient(135deg, rgba(255,255,255,0.97), rgba(253,242,248,0.95))"
                        : "rgba(255,255,255,0.9)",
                      border: `1px solid ${ach.completed ? "rgba(249,168,200,0.3)" : "rgba(229,231,235,0.5)"}`,
                      boxShadow: ach.completed
                        ? "0 2px 12px rgba(249,168,200,0.1)"
                        : "none",
                    }}
                  >
                    <AchievementIcon
                      type={ach.icon}
                      completed={ach.completed}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className="font-bold text-sm"
                          style={{
                            color: ach.completed ? "#3d2040" : "#6b7280",
                          }}
                        >
                          {ach.name}
                        </h3>
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color: ach.completed ? "#ec4899" : "#9ca3af",
                          }}
                        >
                          {ach.progress >= ach.target
                            ? "Complete"
                            : `${ach.progress}/${ach.target}`}
                        </span>
                      </div>
                      <div
                        className="h-2.5 w-full overflow-hidden rounded-full mb-1.5"
                        style={{
                          backgroundColor: ach.completed
                            ? "#fce7f3"
                            : "#f3f4f6",
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                            background: ach.completed
                              ? "linear-gradient(90deg, #f9a8c8, #f472b6)"
                              : "linear-gradient(90deg, #d1d5db, #9ca3af)",
                          }}
                        />
                      </div>
                      <p className="text-xs" style={{ color: "#8c6d7f" }}>
                        {ach.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Leaderboard Panel ───────────────────────────────────────── */}
        {activePanel === "leaderboard" && (
          <div className="oasis-panel mt-6 w-full max-w-lg">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setActivePanel(null)}
                className="flex items-center gap-1.5 text-sm font-medium transition hover:text-[#df5f97]"
                style={{ color: "#5b4153" }}
              >
                <svg
                  viewBox="0 0 20 20"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 10H5M10 15l-5-5 5-5" />
                </svg>
                Back to Oasis
              </button>
              <h2 className="text-lg font-bold" style={{ color: "#3d2040" }}>
                Leaderboard
              </h2>
              <div className="w-20" />
            </div>

            {/* League selector */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {LEAGUES.map((league) => (
                <button
                  key={league.name}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition"
                  style={{
                    backgroundColor:
                      league.name === drimy.league
                        ? "#fdf2f8"
                        : "rgba(255,255,255,0.8)",
                    color: league.name === drimy.league ? "#be185d" : "#8c6d7f",
                    border: `1px solid ${league.name === drimy.league ? "#fbcfe8" : "rgba(229,231,235,0.5)"}`,
                  }}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: league.color }}
                  />
                  {league.name}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {LEADERBOARD.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 transition"
                  style={{
                    background: entry.isUser
                      ? "linear-gradient(135deg, rgba(253,242,248,0.98), rgba(252,231,243,0.95))"
                      : "rgba(255,255,255,0.85)",
                    border: `1px solid ${entry.isUser ? "rgba(244,114,182,0.3)" : "rgba(249,168,200,0.12)"}`,
                    boxShadow: entry.isUser
                      ? "0 2px 12px rgba(244,114,182,0.15)"
                      : "none",
                  }}
                >
                  <span
                    className="w-6 text-center text-sm font-bold"
                    style={{ color: entry.rank <= 3 ? "#ec4899" : "#8c6d7f" }}
                  >
                    {entry.rank <= 3
                      ? ["", "1", "2", "3"][entry.rank]
                      : entry.rank}
                  </span>
                  {entry.rank <= 3 && (
                    <svg
                      viewBox="0 0 16 16"
                      className="w-4 h-4 -ml-1"
                      fill={["", "#fbbf24", "#9ca3af", "#d97706"][entry.rank]}
                    >
                      <path d="M8 1L10 5.5L15 6L11.5 9.5L12.5 14.5L8 12L3.5 14.5L4.5 9.5L1 6L6 5.5L8 1Z" />
                    </svg>
                  )}
                  <div
                    className="h-8 w-8 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: entry.avatar }}
                  />
                  <div className="flex-1">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: entry.isUser ? "#be185d" : "#3d2040" }}
                    >
                      {entry.name}{" "}
                      {entry.isUser && (
                        <span className="text-xs font-normal">(you)</span>
                      )}
                    </span>
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#8c6d7f" }}
                  >
                    {formatNumber(entry.xp)} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Profile Panel (mini) ────────────────────────────────────── */}
        {activePanel === "profile" && (
          <div className="oasis-panel mt-6 w-full max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setActivePanel(null)}
                className="flex items-center gap-1.5 text-sm font-medium transition hover:text-[#df5f97]"
                style={{ color: "#5b4153" }}
              >
                <svg
                  viewBox="0 0 20 20"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 10H5M10 15l-5-5 5-5" />
                </svg>
                Back to Oasis
              </button>
              <h2 className="text-lg font-bold" style={{ color: "#3d2040" }}>
                Drimy Profile
              </h2>
              <div className="w-20" />
            </div>

            <div
              className="rounded-3xl p-5"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,240,245,0.92))",
                border: "1px solid rgba(249,168,200,0.25)",
                boxShadow: "0 4px 20px rgba(249,168,200,0.12)",
              }}
            >
              <div className="flex flex-col items-center mb-4">
                <DrimyCreature stage={drimy.stage} />
                <h3
                  className="mt-3 text-xl font-bold"
                  style={{ color: "#3d2040" }}
                >
                  {drimy.stageNames[drimy.stage - 1]}
                </h3>
                <p className="text-sm" style={{ color: "#8c6d7f" }}>
                  {drimy.species}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div
                  className="rounded-2xl p-3"
                  style={{
                    backgroundColor: "#fff8fb",
                    border: "1px solid rgba(249,168,200,0.15)",
                  }}
                >
                  <div
                    className="text-lg font-bold"
                    style={{ color: "#3d2040" }}
                  >
                    Stage {drimy.stage}
                  </div>
                  <div className="text-[10px]" style={{ color: "#8c6d7f" }}>
                    Evolution
                  </div>
                </div>
                <div
                  className="rounded-2xl p-3"
                  style={{
                    backgroundColor: "#fff8fb",
                    border: "1px solid rgba(249,168,200,0.15)",
                  }}
                >
                  <div
                    className="text-lg font-bold"
                    style={{ color: "#3d2040" }}
                  >
                    {formatNumber(drimy.totalXP)}
                  </div>
                  <div className="text-[10px]" style={{ color: "#8c6d7f" }}>
                    Total XP
                  </div>
                </div>
                <div
                  className="rounded-2xl p-3"
                  style={{
                    backgroundColor: "#fff8fb",
                    border: "1px solid rgba(249,168,200,0.15)",
                  }}
                >
                  <div
                    className="text-lg font-bold"
                    style={{ color: "#3d2040" }}
                  >
                    {drimy.dayStreak}
                  </div>
                  <div className="text-[10px]" style={{ color: "#8c6d7f" }}>
                    Day Streak
                  </div>
                </div>
                <div
                  className="rounded-2xl p-3"
                  style={{
                    backgroundColor: "#fff8fb",
                    border: "1px solid rgba(249,168,200,0.15)",
                  }}
                >
                  <div
                    className="text-lg font-bold"
                    style={{ color: "#3d2040" }}
                  >
                    {formatNumber(drimy.orbs)}
                  </div>
                  <div className="text-[10px]" style={{ color: "#8c6d7f" }}>
                    Orbs
                  </div>
                </div>
              </div>

              {/* Evolution stages preview */}
              <div className="mt-4">
                <h4
                  className="text-xs font-semibold mb-2"
                  style={{ color: "#5b4153" }}
                >
                  Evolution Path
                </h4>
                <div className="flex items-center gap-2">
                  {drimy.stageNames.map((name, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center text-xs font-bold mb-1"
                        style={{
                          background:
                            i < drimy.stage
                              ? "linear-gradient(135deg, #f9a8c8, #f472b6)"
                              : "#f3f4f6",
                          color: i < drimy.stage ? "white" : "#9ca3af",
                          border:
                            i === drimy.stage - 1
                              ? "2px solid #ec4899"
                              : "2px solid transparent",
                        }}
                      >
                        {i + 1}
                      </div>
                      <span
                        className="text-[10px] text-center"
                        style={{
                          color: i < drimy.stage ? "#be185d" : "#9ca3af",
                        }}
                      >
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Right-side Action Menu ──────────────────────────────────────── */}
      <div
        className="fixed z-30 flex flex-col gap-2"
        style={{
          right: "max(0.75rem, calc(50% - 22rem))",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        {actionMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              setActiveAction(activeAction === item.id ? null : item.id)
            }
            className="group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 hover:scale-105 sm:h-12 sm:w-12"
            style={{
              background:
                activeAction === item.id
                  ? "linear-gradient(135deg, #f472b6, #ec4899)"
                  : "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,240,245,0.9))",
              color: activeAction === item.id ? "white" : "#8c6d7f",
              border: `1px solid ${activeAction === item.id ? "#ec4899" : "rgba(249,168,200,0.25)"}`,
              boxShadow:
                activeAction === item.id
                  ? "0 4px 15px rgba(236,72,153,0.3)"
                  : "0 2px 10px rgba(249,168,200,0.15)",
            }}
            title={item.label}
          >
            {item.icon}
            {/* Tooltip */}
            <span
              className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium opacity-0 transition group-hover:opacity-100"
              style={{ backgroundColor: "#3d2040", color: "white" }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Action Panels (right-side slide-in) ─────────────────────────── */}

      {/* Tasks Panel */}
      {activeAction === "tasks" && (
        <div
          className="oasis-action-panel fixed top-1/2 -translate-y-1/2 z-20 w-72 rounded-3xl p-4 sm:w-80"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(255,240,245,0.95))",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(249,168,200,0.25)",
            boxShadow: "0 8px 40px rgba(249,168,200,0.2)",
          }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: "#3d2040" }}>
            Daily Tasks
          </h3>
          <div className="space-y-2">
            {TASKS.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{
                  backgroundColor: task.completed ? "#fdf2f8" : "#fff8fb",
                  border: `1px solid ${task.completed ? "rgba(244,114,182,0.2)" : "rgba(249,168,200,0.1)"}`,
                }}
              >
                <div
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: task.completed ? "#f472b6" : "#fce7f3",
                  }}
                >
                  {task.completed ? (
                    <svg
                      viewBox="0 0 16 16"
                      className="w-3.5 h-3.5"
                      fill="white"
                    >
                      <path d="M6.5 12L2 7.5L3.5 6L6.5 9L12.5 3L14 4.5L6.5 12Z" />
                    </svg>
                  ) : (
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: "#f9a8c8" }}
                    />
                  )}
                </div>
                <span
                  className={`flex-1 text-xs font-medium ${task.completed ? "line-through" : ""}`}
                  style={{ color: task.completed ? "#8c6d7f" : "#3d2040" }}
                >
                  {task.label}
                </span>
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: task.completed ? "#d1d5db" : "#ec4899" }}
                >
                  +{task.xp} XP
                </span>
              </div>
            ))}
          </div>
          <div
            className="mt-3 text-center text-[10px]"
            style={{ color: "#8c6d7f" }}
          >
            {TASKS.filter((t) => t.completed).length}/{TASKS.length} completed
          </div>
        </div>
      )}

      {/* Bond Panel */}
      {activeAction === "bond" && (
        <div
          className="oasis-action-panel fixed top-1/2 -translate-y-1/2 z-20 w-72 rounded-3xl p-4 sm:w-80"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(255,240,245,0.95))",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(249,168,200,0.25)",
            boxShadow: "0 8px 40px rgba(249,168,200,0.2)",
          }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: "#3d2040" }}>
            Bond Actions
          </h3>
          <div className="space-y-2">
            {BOND_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => doBondAction(action)}
                disabled={drimy.orbs < action.cost}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#fff8fb",
                  border: "1px solid rgba(249,168,200,0.15)",
                }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #fce7f3, #fbcfe8)",
                  }}
                >
                  {action.id === "feed" && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#f472b6">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  )}
                  {action.id === "pet" && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#f472b6">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  )}
                  {action.id === "play" && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#f472b6">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className="text-xs font-semibold"
                    style={{ color: "#3d2040" }}
                  >
                    {action.label}
                  </div>
                  <div className="text-[10px]" style={{ color: "#8c6d7f" }}>
                    +{action.xp} XP
                  </div>
                </div>
                <div
                  className="flex items-center gap-1 rounded-full px-2 py-1"
                  style={{ backgroundColor: "#fdf2f8" }}
                >
                  <svg viewBox="0 0 12 12" className="w-3 h-3">
                    <circle cx="6" cy="6" r="5" fill="url(#orbCountGrad)" />
                  </svg>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: "#7c3aed" }}
                  >
                    {action.cost}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DrimyDex Panel */}
      {activeAction === "drimydex" && (
        <div
          className="oasis-action-panel fixed top-1/2 -translate-y-1/2 z-20 w-72 max-h-[70vh] overflow-y-auto rounded-3xl p-4 sm:w-80"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(255,240,245,0.95))",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(249,168,200,0.25)",
            boxShadow: "0 8px 40px rgba(249,168,200,0.2)",
          }}
        >
          <h3 className="text-sm font-bold mb-1" style={{ color: "#3d2040" }}>
            DrimyDex
          </h3>
          <p className="text-[10px] mb-3" style={{ color: "#8c6d7f" }}>
            {DRIMY_DEX.filter((d) => d.unlocked).length}/{DRIMY_DEX.length}{" "}
            discovered
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DRIMY_DEX.map((d) => {
              const rc = rarityColor(d.rarity);
              return (
                <div
                  key={d.id}
                  className="flex flex-col items-center rounded-xl p-2 transition"
                  style={{
                    backgroundColor: d.unlocked ? rc.bg : "#f9fafb",
                    border: `1px solid ${d.unlocked ? rc.border : "#e5e7eb"}`,
                    opacity: d.unlocked ? 1 : 0.5,
                  }}
                >
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center mb-1"
                    style={{
                      backgroundColor: d.unlocked ? rc.border : "#e5e7eb",
                    }}
                  >
                    {d.unlocked ? (
                      <svg
                        viewBox="0 0 20 20"
                        className="w-5 h-5"
                        fill={rc.text}
                      >
                        <path d="M10 2C7 2 5 4 5 7C5 12 10 16 10 16C10 16 15 12 15 7C15 4 13 2 10 2Z" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 20 20"
                        className="w-4 h-4"
                        fill="#9ca3af"
                      >
                        <path d="M14 8H13V6C13 4.3 11.7 3 10 3S7 4.3 7 6V8H6C5.4 8 5 8.4 5 9V16C5 16.6 5.4 17 6 17H14C14.6 17 15 16.6 15 16V9C15 8.4 14.6 8 14 8ZM8 6C8 4.9 8.9 4 10 4S12 4.9 12 6V8H8V6Z" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-[9px] font-semibold text-center leading-tight"
                    style={{ color: d.unlocked ? rc.text : "#9ca3af" }}
                  >
                    {d.unlocked ? d.name : "???"}
                  </span>
                  <span
                    className="text-[8px] mt-0.5"
                    style={{ color: d.unlocked ? rc.text : "#d1d5db" }}
                  >
                    {d.rarity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Store Panel */}
      {activeAction === "store" && (
        <div
          className="oasis-action-panel fixed top-1/2 -translate-y-1/2 z-20 w-72 max-h-[70vh] overflow-y-auto rounded-3xl p-4 sm:w-80"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(255,240,245,0.95))",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(249,168,200,0.25)",
            boxShadow: "0 8px 40px rgba(249,168,200,0.2)",
          }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: "#3d2040" }}>
            Store
          </h3>
          <div className="space-y-2">
            {STORE_ITEMS.map((item) => {
              const rc = rarityColor(item.rarity);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  style={{
                    backgroundColor: "#fff8fb",
                    border: "1px solid rgba(249,168,200,0.12)",
                  }}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: rc.bg,
                      border: `1px solid ${rc.border}`,
                    }}
                  >
                    {item.type === "medal" ? (
                      <svg
                        viewBox="0 0 20 20"
                        className="w-5 h-5"
                        fill={rc.text}
                      >
                        <circle cx="10" cy="8" r="5" />
                        <path d="M7 13l-1 6 4-2 4 2-1-6" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 20 20"
                        className="w-5 h-5"
                        fill={rc.text}
                      >
                        <path d="M10 2L12 7L17 7L13 10L14.5 15L10 12L5.5 15L7 10L3 7L8 7L10 2Z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-xs font-semibold"
                      style={{ color: "#3d2040" }}
                    >
                      {item.name}
                    </div>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: rc.bg, color: rc.text }}
                    >
                      {item.rarity}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1 rounded-full px-2 py-1"
                    style={{
                      backgroundColor:
                        item.currency === "vesos" ? "#eff6ff" : "#fdf2f8",
                    }}
                  >
                    {item.currency === "orbs" ? (
                      <svg viewBox="0 0 12 12" className="w-3 h-3">
                        <circle cx="6" cy="6" r="5" fill="#c084fc" />
                      </svg>
                    ) : (
                      <span className="text-[10px]">V</span>
                    )}
                    <span
                      className="text-[10px] font-semibold"
                      style={{
                        color:
                          item.currency === "vesos" ? "#2563eb" : "#7c3aed",
                      }}
                    >
                      {item.price}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lucky Catch Panel */}
      {activeAction === "luckycatch" && (
        <div
          className="oasis-action-panel fixed top-1/2 -translate-y-1/2 z-20 w-72 rounded-3xl p-4 sm:w-80"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(255,240,245,0.95))",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(249,168,200,0.25)",
            boxShadow: "0 8px 40px rgba(249,168,200,0.2)",
          }}
        >
          <h3 className="text-sm font-bold mb-1" style={{ color: "#3d2040" }}>
            Lucky Catch
          </h3>
          <p className="text-[10px] mb-4" style={{ color: "#8c6d7f" }}>
            Spend Orbs for a chance to catch a new Drimy!
          </p>

          {/* Gacha button */}
          <button
            onClick={doLuckyCatch}
            disabled={drimy.orbs < 300}
            className="w-full rounded-2xl py-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #f9a8c8, #f472b6, #ec4899)",
              boxShadow: "0 4px 20px rgba(236,72,153,0.3)",
              animation:
                drimy.orbs >= 300
                  ? "pulseGlow 2s ease-in-out infinite"
                  : "none",
            }}
          >
            <div className="text-white font-bold text-sm">Catch a Drimy</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <svg viewBox="0 0 12 12" className="w-3 h-3">
                <circle cx="6" cy="6" r="5" fill="white" opacity="0.7" />
              </svg>
              <span className="text-white text-xs opacity-90">300 Orbs</span>
            </div>
          </button>

          {/* Result */}
          {luckyCatchResult && (
            <div
              className="mt-4 rounded-2xl p-4 text-center"
              style={{
                background: "linear-gradient(135deg, #fff8fb, #fdf2f8)",
                border: "1px solid rgba(249,168,200,0.25)",
                animation: "scaleIn 0.3s ease-out",
              }}
            >
              <div className="text-2xl mb-1">
                {luckyCatchResult.rarity === "Legendary"
                  ? "!!!"
                  : luckyCatchResult.rarity === "Epic"
                    ? "!!"
                    : "!"}
              </div>
              <div
                className="text-sm font-bold mb-1"
                style={{ color: rarityColor(luckyCatchResult.rarity).text }}
              >
                {luckyCatchResult.name}
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: rarityColor(luckyCatchResult.rarity).bg,
                  color: rarityColor(luckyCatchResult.rarity).text,
                  border: `1px solid ${rarityColor(luckyCatchResult.rarity).border}`,
                }}
              >
                {luckyCatchResult.rarity}
              </span>
              <p className="text-xs mt-2" style={{ color: "#8c6d7f" }}>
                {luckyCatchResult.message}
              </p>
            </div>
          )}

          {/* Premium upsell */}
          <div
            className="mt-3 rounded-xl p-3"
            style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}
          >
            <div
              className="text-[10px] font-semibold"
              style={{ color: "#92400e" }}
            >
              Premium Bonus
            </div>
            <p className="text-[9px]" style={{ color: "#a16207" }}>
              Subscribers get 2 extra Lucky Catch attempts daily!
            </p>
          </div>

          <div
            className="mt-2 rounded-xl p-3"
            style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
          >
            <div
              className="text-[10px] font-semibold"
              style={{ color: "#1e40af" }}
            >
              Vesos Option
            </div>
            <p className="text-[9px]" style={{ color: "#1d4ed8" }}>
              Spend 50 Vesos for an extra attempt anytime.
            </p>
          </div>
        </div>
      )}

      {/* Click-away overlay for action panels */}
      {activeAction && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActiveAction(null)}
        />
      )}
    </div>
  );
}
