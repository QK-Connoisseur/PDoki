import {
  REDUCED_MOTION_MEDIA_QUERY,
  useOptionalBackgroundMotion,
} from "../appearance/backgroundMotionContext";

const FLOATING_PETALS = [
  {
    id: "upper-left",
    left: "calc(50% - 24rem)",
    mobileLeft: "9%",
    top: "18%",
    size: "1.35rem",
    duration: "16s",
    delay: "-5s",
    swayX: "42px",
    swayY: "46px",
    driftX: "-18px",
    driftY: "105px",
    endX: "30px",
    endY: "180px",
    rotation: "18deg",
    opacity: 0.78,
  },
  {
    id: "middle-right",
    left: "calc(50% + 23rem)",
    mobileLeft: "86%",
    top: "43%",
    size: "1.5rem",
    duration: "18s",
    delay: "-14s",
    swayX: "-44px",
    swayY: "48px",
    driftX: "22px",
    driftY: "118px",
    endX: "-36px",
    endY: "200px",
    rotation: "72deg",
    opacity: 0.8,
  },
  {
    id: "lower-left",
    left: "calc(50% - 22rem)",
    mobileLeft: "14%",
    top: "68%",
    size: "1.15rem",
    duration: "15s",
    delay: "-9s",
    swayX: "36px",
    swayY: "42px",
    driftX: "-16px",
    driftY: "94px",
    endX: "28px",
    endY: "160px",
    rotation: "124deg",
    opacity: 0.72,
  },
  {
    id: "upper-right",
    left: "calc(50% + 25rem)",
    top: "12%",
    size: "1.25rem",
    duration: "17s",
    delay: "-11s",
    swayX: "-42px",
    swayY: "44px",
    driftX: "18px",
    driftY: "104px",
    endX: "-30px",
    endY: "180px",
    rotation: "46deg",
    opacity: 0.74,
    desktopOnly: true,
  },
  {
    id: "lower-right",
    left: "calc(50% + 21.5rem)",
    top: "74%",
    size: "1.55rem",
    duration: "20s",
    delay: "-18s",
    swayX: "-38px",
    swayY: "54px",
    driftX: "24px",
    driftY: "128px",
    endX: "-42px",
    endY: "220px",
    rotation: "102deg",
    opacity: 0.82,
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
