const PETALS = [
  { left: "10%", top: "21%", scale: 0.7 },
  { left: "17%", top: "66%", scale: 1 },
  { left: "31%", top: "13%", scale: 0.6 },
  { left: "69%", top: "25%", scale: 0.75 },
  { left: "81%", top: "72%", scale: 1.05 },
  { left: "91%", top: "42%", scale: 0.65 },
];

function SakuraBloom({ className }) {
  return (
    <svg className={className} viewBox="0 0 220 220" aria-hidden="true">
      <g transform="translate(110 110)">
        {[0, 72, 144, 216, 288].map((rotation) => (
          <ellipse
            key={rotation}
            cx="0"
            cy="-46"
            rx="31"
            ry="55"
            transform={`rotate(${rotation})`}
            fill="currentColor"
          />
        ))}
        <circle r="21" fill="#ffd3e5" />
        <circle r="9" fill="#fff6fb" />
      </g>
    </svg>
  );
}

export default function SakuraBackdrop() {
  return (
    <div
      className="sakura-backdrop"
      data-scene="static"
      data-testid="sakura-backdrop"
      aria-hidden="true"
    >
      <div className="sakura-backdrop__glow sakura-backdrop__glow--left" />
      <div className="sakura-backdrop__glow sakura-backdrop__glow--right" />
      <div className="sakura-backdrop__blooms sakura-backdrop__blooms--left">
        <SakuraBloom className="sakura-backdrop__bloom sakura-backdrop__bloom--large" />
        <SakuraBloom className="sakura-backdrop__bloom sakura-backdrop__bloom--small" />
      </div>
      <div className="sakura-backdrop__blooms sakura-backdrop__blooms--right">
        <SakuraBloom className="sakura-backdrop__bloom sakura-backdrop__bloom--large" />
        <SakuraBloom className="sakura-backdrop__bloom sakura-backdrop__bloom--small" />
      </div>
      {PETALS.map((petal, index) => (
        <span
          key={`${petal.left}-${petal.top}`}
          className={`sakura-backdrop__petal sakura-backdrop__petal--${(index % 3) + 1}`}
          style={{
            left: petal.left,
            top: petal.top,
            "--sakura-scale": petal.scale,
          }}
        />
      ))}
    </div>
  );
}
