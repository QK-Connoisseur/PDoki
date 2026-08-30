import {
  REDUCED_MOTION_MEDIA_QUERY,
  useOptionalBackgroundMotion,
} from "../appearance/backgroundMotionContext";

const ATMOSPHERIC_LAYERS = [
  { id: "high-cloud", modifier: "high-cloud" },
  { id: "far-haze", modifier: "far-haze" },
  { id: "low-fog", modifier: "low-fog" },
  { id: "near-fog", modifier: "near-fog", desktopOnly: true },
  { id: "cape-blue-glow", modifier: "cape-blue-glow", desktopOnly: true },
];

export default function DarkKnightBackdrop() {
  const motionPreference = useOptionalBackgroundMotion();
  const systemAllowsMotion =
    typeof window === "undefined" ||
    !window.matchMedia?.(REDUCED_MOTION_MEDIA_QUERY).matches;
  const motionEnabled = motionPreference?.motionEnabled ?? systemAllowsMotion;

  return (
    <div
      className="member-backdrop dark-knight-backdrop"
      data-scene={motionEnabled ? "ambient-motion" : "static"}
      data-background-motion={motionEnabled ? "on" : "off"}
      data-testid="dark-knight-backdrop"
      aria-hidden="true"
    >
      {motionEnabled && (
        <div
          className="dark-knight-backdrop__motion-layer"
          data-testid="dark-knight-motion-overlay"
        >
          {ATMOSPHERIC_LAYERS.map((layer) => (
            <span
              key={layer.id}
              className={`dark-knight-backdrop__atmosphere dark-knight-backdrop__atmosphere--${layer.modifier}${
                layer.desktopOnly
                  ? " dark-knight-backdrop__atmosphere--desktop"
                  : ""
              }`}
              data-motion-element={layer.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
