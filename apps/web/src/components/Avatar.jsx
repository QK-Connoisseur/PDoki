/* eslint-disable react-refresh/only-export-components */

import moonKitsuneDecoration from "../assets/avatar-decorations/moon-kitsune.svg";
import sakuraCatDecoration from "../assets/avatar-decorations/sakura-cat.svg";

export const AVATAR_DECORATION_IDS = Object.freeze({
  SAKURA_CAT: "sakura-cat",
  MOON_KITSUNE: "moon-kitsune",
});

const SAKURA_CAT = Object.freeze({
  src: sakuraCatDecoration,
  scale: 1.46,
  offsetX: "0%",
  offsetY: "0%",
});

export const AVATAR_DECORATIONS = Object.freeze({
  [AVATAR_DECORATION_IDS.SAKURA_CAT]: SAKURA_CAT,
  [AVATAR_DECORATION_IDS.MOON_KITSUNE]: Object.freeze({
    src: moonKitsuneDecoration,
    scale: 1.46,
    offsetX: "0%",
    offsetY: "0%",
  }),
  // Compatibility for the existing profile fixture. New data should use the
  // canonical `sakura-cat` id.
  sakura: SAKURA_CAT,
});

export function resolveAvatarDecoration(decoration) {
  return typeof decoration === "string" &&
    Object.hasOwn(AVATAR_DECORATIONS, decoration)
    ? AVATAR_DECORATIONS[decoration]
    : null;
}

/**
 * Circular profile image with an optional cosmetic frame from the local,
 * allow-listed decoration registry. `size` accepts pixels or any CSS length.
 */
export default function Avatar({
  src,
  alt = "",
  size = 40,
  decoration,
  className = "",
  imageClassName = "",
  imageStyle,
  loading,
  decoding = "async",
  style,
}) {
  const decorationConfig = resolveAvatarDecoration(decoration);
  const avatarSize = typeof size === "number" ? `${size}px` : size;

  return (
    <span
      className={`relative inline-block shrink-0 overflow-visible align-middle ${className}`}
      style={{
        "--avatar-size": avatarSize,
        width: "var(--avatar-size)",
        height: "var(--avatar-size)",
        ...style,
      }}
      data-avatar-root=""
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={`relative z-0 block h-full w-full rounded-full object-cover ${imageClassName}`}
        style={imageStyle}
      />

      {decorationConfig && (
        <img
          src={decorationConfig.src}
          alt=""
          aria-hidden="true"
          draggable="false"
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 block max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
          style={{
            width: `calc(var(--avatar-size) * ${decorationConfig.scale})`,
            height: `calc(var(--avatar-size) * ${decorationConfig.scale})`,
            marginLeft: decorationConfig.offsetX,
            marginTop: decorationConfig.offsetY,
          }}
          data-avatar-decoration={decoration}
        />
      )}
    </span>
  );
}
