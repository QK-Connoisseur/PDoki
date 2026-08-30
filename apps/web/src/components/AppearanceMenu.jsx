import { useEffect, useId, useRef, useState } from "react";
import {
  MEMBER_THEME_OPTIONS,
  useOptionalMemberTheme,
} from "../appearance/memberThemeContext";
import { useOptionalBackgroundMotion } from "../appearance/backgroundMotionContext";
import "./AppearanceMenu.css";

function PaletteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.3-3.5 1.8 1.8 0 0 1 1.2-3.2h2A3.5 3.5 0 0 0 21 10.8C21 6.5 16.9 3 12 3Z" />
      <circle cx="7.4" cy="10.5" r=".8" fill="currentColor" />
      <circle cx="10.6" cy="7.5" r=".8" fill="currentColor" />
      <circle cx="15" cy="7.8" r=".8" fill="currentColor" />
      <circle cx="6.7" cy="14.5" r=".8" fill="currentColor" />
    </svg>
  );
}

/** Browser-local appearance controls shared by the desktop and mobile rails. */
export default function AppearanceMenu({
  mobile = false,
  expanded = false,
  onOpen,
}) {
  const theme = useOptionalMemberTheme();
  const motion = useOptionalBackgroundMotion();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return undefined;

    panelRef.current?.querySelector("input:checked")?.focus();

    const dismissOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const dismissWithEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("keydown", dismissWithEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("keydown", dismissWithEscape);
    };
  }, [open]);

  // Some isolated/specialized prototype shells do not provide appearance state.
  if (!theme || !motion) return null;

  return (
    <div
      ref={rootRef}
      className={`member-appearance ${mobile ? "member-appearance--mobile" : "member-appearance--desktop"}`}
      data-member-theme={theme.memberTheme}
      data-dropdown
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Appearance"
        title="Themes and motion"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${id}-panel` : undefined}
        onClick={() => {
          if (!open) onOpen?.();
          setOpen(!open);
        }}
        className={`member-nav-item-trigger member-appearance__trigger ${mobile ? "member-mobile-nav-item" : "member-nav-item"}`}
      >
        <PaletteIcon />
        {!mobile && (
          <span
            className={`member-appearance__label ${expanded ? "member-appearance__label--expanded" : ""}`}
          >
            Appearance
          </span>
        )}
      </button>

      {open && (
        <section
          ref={panelRef}
          id={`${id}-panel`}
          role="dialog"
          aria-label="Themes and motion"
          className="member-appearance__panel"
        >
          <div className="member-appearance__heading">
            <h2>Make it yours</h2>
            <button
              type="button"
              className="member-appearance__close"
              aria-label="Close appearance"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M6 18 18 6" />
              </svg>
            </button>
          </div>
          <fieldset className="member-appearance__themes">
            <legend>Theme</legend>
            <div className="member-appearance__theme-grid">
              {MEMBER_THEME_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="member-appearance__theme"
                  data-selected={theme.memberTheme === option.value}
                >
                  <input
                    type="radio"
                    name={`${id}-theme`}
                    value={option.value}
                    checked={theme.memberTheme === option.value}
                    onChange={() => theme.setMemberTheme(option.value)}
                    className="sr-only"
                  />
                  <span
                    className={`member-theme-option__preview member-theme-option__preview--${option.value}`}
                    aria-hidden="true"
                  />
                  <span className="member-appearance__theme-name">
                    {option.label}
                    <span
                      className="member-appearance__selected-mark"
                      aria-hidden="true"
                    >
                      {theme.memberTheme === option.value ? "✓" : ""}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="member-appearance__motion">
            <div>
              <h3>Background motion</h3>
              <p id={`${id}-motion-description`}>
                {motion.systemReducedMotion
                  ? "Off to respect your device’s reduced-motion setting."
                  : motion.motionEnabled
                    ? "Gentle movement is on."
                    : "Off. Your background stays still."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Background motion"
              aria-describedby={`${id}-motion-description`}
              aria-checked={motion.motionEnabled}
              disabled={motion.systemReducedMotion}
              onClick={() => motion.setMotionRequested(!motion.motionRequested)}
              className="member-appearance__switch"
            >
              <span />
            </button>
          </div>
          <p className="member-appearance__note">Saved in this browser.</p>
        </section>
      )}
    </div>
  );
}
