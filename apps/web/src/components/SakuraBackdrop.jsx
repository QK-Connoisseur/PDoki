import {
  REDUCED_MOTION_MEDIA_QUERY,
  useOptionalBackgroundMotion,
} from "../appearance/backgroundMotionContext";

const FLOATING_PETALS = [
  {
    id: "upper-left",
    left: "clamp(10%, calc(50% - 52rem), 18%)",
    mobileLeft: "16%",
    top: "18%",
    size: "1.35rem",
    duration: "22s",
    delay: "-5s",
    swayX: "27px",
    swayY: "46px",
    driftX: "-12px",
    driftY: "105px",
    endX: "20px",
    endY: "180px",
    rotation: "18deg",
    opacity: 0.5,
  },
  {
    id: "middle-right",
    left: "clamp(78%, calc(50% + 44rem), 90%)",
    mobileLeft: "80%",
    top: "43%",
    size: "1.5rem",
    duration: "26s",
    delay: "-14s",
    swayX: "-30px",
    swayY: "48px",
    driftX: "15px",
    driftY: "118px",
    endX: "-24px",
    endY: "200px",
    rotation: "72deg",
    opacity: 0.56,
  },
  {
    id: "lower-left",
    left: "clamp(12%, calc(50% - 36rem), 30%)",
    mobileLeft: "27%",
    top: "68%",
    size: "1.15rem",
    duration: "21s",
    delay: "-9s",
    swayX: "24px",
    swayY: "42px",
    driftX: "-11px",
    driftY: "94px",
    endX: "19px",
    endY: "160px",
    rotation: "124deg",
    opacity: 0.46,
  },
  {
    id: "upper-right",
    left: "clamp(70%, calc(50% + 36rem), 86%)",
    top: "12%",
    size: "1.25rem",
    duration: "24s",
    delay: "-11s",
    swayX: "-28px",
    swayY: "44px",
    driftX: "12px",
    driftY: "104px",
    endX: "-20px",
    endY: "180px",
    rotation: "46deg",
    opacity: 0.48,
    desktopOnly: true,
  },
  {
    id: "lower-right",
    left: "clamp(86%, calc(50% + 64rem), 95%)",
    top: "74%",
    size: "1.55rem",
    duration: "28s",
    delay: "-18s",
    swayX: "-26px",
    swayY: "54px",
    driftX: "16px",
    driftY: "128px",
    endX: "-28px",
    endY: "220px",
    rotation: "102deg",
    opacity: 0.58,
    desktopOnly: true,
  },
];

export default function SakuraBackdrop() {
  const motionPreference = useOptionalBackgroundMotion();
  const systemAllowsMotion =
    typeof window === "undefined" ||
    !window.matchMedia?.(REDUCED_MOTION_MEDIA_QUERY).matches;
  const motionEnabled = motionPreference?.motionEnabled ?? systemAllowsMotion;

  return (
    <div
      className="sakura-backdrop"
      data-scene={motionEnabled ? "ambient-motion" : "static"}
      data-background-motion={motionEnabled ? "on" : "off"}
      data-testid="sakura-backdrop"
      aria-hidden="true"
    >
      {motionEnabled && (
        <div
          className="sakura-backdrop__motion-layer"
          data-testid="sakura-motion-overlay"
        >
          {FLOATING_PETALS.map((petal) => (
            <span
              key={petal.id}
              className={`sakura-backdrop__floating-petal${
                petal.desktopOnly
                  ? " sakura-backdrop__floating-petal--desktop"
                  : ""
              }`}
              data-motion-petal={petal.id}
              style={{
                "--petal-left": petal.left,
                "--petal-mobile-left": petal.mobileLeft,
                "--petal-top": petal.top,
                "--petal-size": petal.size,
                "--petal-duration": petal.duration,
                "--petal-delay": petal.delay,
                "--petal-sway-x": petal.swayX,
                "--petal-sway-y": petal.swayY,
                "--petal-drift-x": petal.driftX,
                "--petal-drift-y": petal.driftY,
                "--petal-end-x": petal.endX,
                "--petal-end-y": petal.endY,
                "--petal-rotation": petal.rotation,
                "--petal-opacity": petal.opacity,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
