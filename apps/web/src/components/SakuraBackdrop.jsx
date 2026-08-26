import {
  REDUCED_MOTION_MEDIA_QUERY,
  useOptionalBackgroundMotion,
} from "../appearance/backgroundMotionContext";

const FLOATING_PETALS = [
  {
    id: "upper-left",
    left: "10%",
    top: "18%",
    size: "0.52rem",
    duration: "32s",
    delay: "-11s",
    driftX: "14px",
    driftY: "40px",
    rotation: "18deg",
    opacity: 0.18,
  },
  {
    id: "middle-right",
    left: "58%",
    top: "43%",
    size: "0.66rem",
    duration: "35s",
    delay: "-27s",
    driftX: "-16px",
    driftY: "40px",
    rotation: "72deg",
    opacity: 0.2,
  },
  {
    id: "lower-right",
    left: "88%",
    top: "68%",
    size: "0.46rem",
    duration: "29s",
    delay: "-6s",
    driftX: "-12px",
    driftY: "38px",
    rotation: "124deg",
    opacity: 0.16,
  },
  {
    id: "upper-center",
    left: "39%",
    top: "12%",
    size: "0.58rem",
    duration: "27s",
    delay: "-19s",
    driftX: "24px",
    driftY: "34px",
    rotation: "46deg",
    opacity: 0.14,
    desktopOnly: true,
  },
  {
    id: "lower-left",
    left: "23%",
    top: "74%",
    size: "0.72rem",
    duration: "34s",
    delay: "-24s",
    driftX: "28px",
    driftY: "56px",
    rotation: "102deg",
    opacity: 0.22,
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
                "--petal-drift-x": petal.driftX,
                "--petal-drift-y": petal.driftY,
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
