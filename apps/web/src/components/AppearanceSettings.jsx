import { useAppearance } from "../appearance/appearanceContext";

export default function AppearanceSettings() {
  const {
    backgroundMotionEnabled,
    setBackgroundMotionEnabled,
    prefersReducedMotion,
    saveData,
  } = useAppearance();

  return (
    <section className="mt-5 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h2 className="text-lg font-bold text-[#241a22]">
            Appearance &amp; accessibility
          </h2>
          <h3 className="mt-5 font-bold text-[#5b4153]">
            Animate Sakura background
          </h3>
          <p
            id="sakura-motion-description"
            className="mt-1 max-w-xl text-sm leading-6 text-[#8c6d7f]"
          >
            Let the petals and soft background light move gently on the Home
            feed. Turning this off keeps the Sakura scene visible but still.
            This preference is saved only on this device.
          </p>
          {prefersReducedMotion && (
            <p
              className="mt-2 text-sm font-medium text-[#8c5b28]"
              role="status"
            >
              Your device’s Reduced Motion setting is pausing the background.
            </p>
          )}
          {!prefersReducedMotion && saveData && (
            <p
              className="mt-2 text-sm font-medium text-[#8c5b28]"
              role="status"
            >
              Your device’s Data Saver setting is pausing the background.
            </p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={backgroundMotionEnabled}
          aria-label="Animate Sakura background"
          aria-describedby="sakura-motion-description"
          onClick={() => setBackgroundMotionEnabled(!backgroundMotionEnabled)}
          className={`relative mt-12 h-7 w-12 shrink-0 rounded-full transition motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
            backgroundMotionEnabled ? "bg-pink-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition motion-reduce:transition-none ${
              backgroundMotionEnabled ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
