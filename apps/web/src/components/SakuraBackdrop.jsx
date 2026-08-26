import {
  REDUCED_MOTION_MEDIA_QUERY,
  useOptionalBackgroundMotion,
} from "../appearance/backgroundMotionContext";

const FLOATING_PETALS = [
  {
    id: "upper-left",
    left: "12%",
    top: "18%",
    size: "0.64rem",
    duration: "24s",
    delay: "-8s",
    swayX: "16px",
    swayY: "22px",
    driftX: "-4px",
    driftY: "48px",
    endX: "10px",
    endY: "80px",
    rotation: "18deg",
    opacity: 0.32,
  },
  {
    id: "middle-right",
    left: "86%",
    top: "43%",
    size: "0.72rem",
    duration: "28s",
    delay: "-19s",
    swayX: "-14px",
    swayY: "24px",
    driftX: "6px",
    driftY: "52px",
    endX: "-12px",
    endY: "88px",
    rotation: "72deg",
    opacity: 0.34,
  },
  {
    id: "lower-left",
    left: "15%",
    top: "68%",
    size: "0.58rem",
    duration: "22s",
    delay: "-4s",
    swayX: "12px",
    swayY: "20px",
    driftX: "-6px",
    driftY: "44px",
    endX: "8px",
    endY: "72px",
    rotation: "124deg",
    opacity: 0.3,
  },
  {
    id: "upper-right",
    left: "82%",
    top: "12%",
    size: "0.66rem",
    duration: "26s",
    delay: "-14s",
    swayX: "-18px",
    swayY: "18px",
    driftX: "4px",
    driftY: "38px",
    endX: "-10px",
    endY: "70px",
    rotation: "46deg",
    opacity: 0.28,
    desktopOnly: true,
  },
  {
    id: "lower-right",
    left: "90%",
    top: "74%",
    size: "0.78rem",
    duration: "30s",
    delay: "-23s",
    swayX: "-12px",
    swayY: "26px",
    driftX: "8px",
    driftY: "56px",
    endX: "-18px",
    endY: "92px",
    rotation: "102deg",
    opacity: 0.36,
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
