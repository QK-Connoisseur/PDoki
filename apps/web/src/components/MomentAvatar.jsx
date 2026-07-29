/* eslint-disable react-refresh/only-export-components */

export const RING_PRESETS = {
  sakuraGlow: ["#FF4D8D", "#FF73B5", "#FFA3D7", "#FFE1EF"],
  vibrantRuby: ["#B80F3A", "#E11D48", "#FF4D6D", "#FF9AAE"],
  premiumLiquidGold: [
    "#6B3A00",
    "#C08815",
    "#ECC040",
    "#FFF5D5",
    "#C89018",
    "#805200",
  ],
};

export function gradientForType(type) {
  if (type === "private") return RING_PRESETS.premiumLiquidGold;
  if (type === "regular") return RING_PRESETS.sakuraGlow;
  return null;
}

const heartPath = (s) =>
  `M${s / 2},${s * 0.9} ` +
  `C${s / 2},${s * 0.9} ${s * 0.03},${s * 0.6} ${s * 0.03},${s * 0.33} ` +
  `C${s * 0.03},${s * 0.13} ${s * 0.18},0 ${s * 0.34},0 ` +
  `C${s * 0.43},0 ${s * 0.47},${s * 0.06} ${s / 2},${s * 0.14} ` +
  `C${s * 0.53},${s * 0.06} ${s * 0.57},0 ${s * 0.66},0 ` +
  `C${s * 0.82},0 ${s * 0.97},${s * 0.13} ${s * 0.97},${s * 0.33} ` +
  `C${s * 0.97},${s * 0.6} ${s / 2},${s * 0.9} ${s / 2},${s * 0.9} Z`;

export default function MomentAvatar({
  src,
  name,
  type,
  size = 76,
  ringWidth = 4.5,
  gapWidth = 3,
  viewed = false,
}) {
  const grad = gradientForType(type);
  const isOwn = type === "own";
  const spacerSize = size - ringWidth * 2;
  const innerSize = spacerSize - gapWidth * 2;

  const uid = `${name}-${size}`;
  const gradId = `mg-${uid}`;
  const clipId = `mc-${uid}`;

  const useGrad = !isOwn && !viewed && grad;
  const ringFill = useGrad ? `url(#${gradId})` : isOwn ? "#e0dade" : "#c5b8c0";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
    >
      <defs>
        {useGrad && (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            {grad.map((c, i) => (
              <stop
                key={i}
                offset={`${(i / (grad.length - 1)) * 100}%`}
                stopColor={c}
              />
            ))}
          </linearGradient>
        )}
        <clipPath id={clipId}>
          <path d={heartPath(innerSize)} />
        </clipPath>
      </defs>

      {/* Outer gradient or muted ring */}
      <path d={heartPath(size)} fill={ringFill} opacity={viewed ? 0.45 : 1} />

      {/* White spacer — creates the negative gap between ring and photo */}
      <g transform={`translate(${ringWidth},${ringWidth})`}>
        <path d={heartPath(spacerSize)} fill="white" />
      </g>

      {/* Photo clipped to inner heart */}
      <g
        transform={`translate(${ringWidth + gapWidth},${ringWidth + gapWidth})`}
      >
        <image
          href={src}
          x="0"
          y="0"
          width={innerSize}
          height={innerSize}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
    </svg>
  );
}
