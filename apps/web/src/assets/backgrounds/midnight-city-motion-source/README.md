# Midnight City mobile motion handoff

Date: 2026-09-02

Status updated 2026-09-03: retired experiment. Midnight City now uses only its
original static desktop/mobile JPGs. Background videos and motion controls have
been removed. These still-image handoff assets remain inactive and unimported;
the workflow below is historical and deferred until professional help.

This directory contains a portrait input frame for generating an independent
Midnight City mobile cloud animation. It is a handoff asset and is not imported
by the web application yet.

## File

| File                                       | Role                           | Dimensions |
| ------------------------------------------ | ------------------------------ | ---------- |
| `midnight-city-sky-mobile-9x16-master.png` | Lossless portrait master       | 486 x 864  |
| `midnight-city-sky-mobile-flow.jpg`        | Google Flow upload convenience | 486 x 864  |

The former mobile MP4 was not separately generated in Flow. It was an
independent web encode made from a centered portrait crop of the supplied
landscape video. This new still is instead derived from the lossless,
pre-animation sky illustration and uses the equivalent centered 9:16
composition, avoiding another generation of video compression.

## Copy-ready mobile prompt

Upload `midnight-city-sky-mobile-flow.jpg` as the **start frame**, choose a
portrait 9:16 output, and request approximately 8-10 seconds. If the selected
Flow model exposes an end-frame field, use the same still there too:

> Locked-off portrait Midnight City cloud plate using the supplied image as the
> exact composition and first frame. Animate only the existing painted
> blue-gray clouds with extremely slow, restrained lateral drift and subtle
> internal cloud deformation. Preserve the deep cape-blue and navy palette,
> exposure, painted texture, cloud scale, empty central sky and exact 9:16
> framing. The movement is calm, low amplitude and low contrast so it remains
> behind a social feed. No pan, tilt, zoom, crop change, parallax, camera shake,
> horizon shift, flicker, brightness pulse or color shift. Do not add buildings,
> architecture, windows, city lights, bats, birds, aircraft, rain, lightning,
> stars, people or any new object. No text, logos, borders or watermark. Silent
> video. End in the same visual phase as the first frame for a seamless loop.

The generated clip should remain sky-only. The existing portrait building PNG
stays stationary above it in the browser. Do not upload or animate the building
layer.

## Delivery notes

- Keep the untouched downloaded generation and its prompt/provenance metadata.
- Flow can use start and end frames, but do not assume the downloaded clip is a
  clean loop. The first/last frames and motion seam must be inspected locally.
- The final web derivative should be silent H.264/YUV420P fast-start MP4 at
  540 x 960 or 720 x 1280, approximately 8-10 seconds at 24 fps.
- Motion-off, reduced-motion, loading and playback failure continue to use the
  existing `midnight-city-feed-mobile.jpg` fallback.

## Derivation and provenance

No generative image editing was used for these handoff stills. The lossless
1536 x 1024 pre-animation sky master was cropped at x=525, y=160 to an exact
486 x 864 portrait composition. The Flow JPG preserves that native crop rather
than pre-upscaling it; Flow can perform its own portrait output scaling.

Source master SHA-256:

- `midnight-city-sky-desktop-master.png`:
  `fde0b08d39205b091cba6a82403caf5e9d199934b7e23875a4e68d65ab112d8f`

Final still SHA-256 values:

- `midnight-city-sky-mobile-9x16-master.png`:
  `da16ba023506e9ca30421ac2b5a1aac1879ca7afa99f2aeaa33b7ed6db47d68d`

- `midnight-city-sky-mobile-flow.jpg`:
  `7896dd12f1b8084523ad8fc85aca1c39db780e33aa166e9ebc594829ff119e44`
