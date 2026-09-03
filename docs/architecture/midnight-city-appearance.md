# Midnight City appearance refinement

## Current decision: static-only backgrounds (September 3, 2026)

Following repeat video-overlay rendering problems during theme switching, both
themes now use only their original responsive composite JPGs. The paint palette
remains in place above More, with Sakura Kiss and Midnight City available in the
palette and Settings. Theme persistence remains browser-local.

Background motion controls, the motion preference provider, video/foreground
layers, and decorative animation CSS have been removed. Old saved motion
preferences are ignored. All four desktop/mobile background MP4 derivatives
have been removed from the source tree; retained still-image handoff assets are
inactive and not imported by the application. Feed media and unrelated UI
accessibility behavior are unchanged.

Background videos must not be reintroduced into the main-branch deliverable.
Future motion work is deferred until professional help and a separate approved
implementation. Publication and merge of the static-only changes into `dev`
were subsequently authorized by the project owner; `main` remains unchanged.

The following sections record the earlier artwork and motion experiments;
their motion behavior, asset tables, and verification results are historical
and superseded by the static-only decision above.

## Historical implementation record

Date: August 30, 2026. Scope: local frontend prototype on the theme worktree;
no backend, authentication, publication, or deployment changes.

## Product decisions

- The two browser-local themes are **Sakura Kiss** and **Midnight City**.
  Existing `sakura` and `dark-knight` preference identifiers remain compatible.
- Midnight City replaces the earlier stepped, ornamental skyline with ordinary
  flat-roof apartment and office blocks. Cobalt blue, painted clouds, and sparse
  warm windows remain. This is an artistic revision, not legal clearance.
- Sakura artwork is unchanged. The prior city JPGs remain available for history
  but are no longer referenced by the shipped stylesheet.
- The palette control sits above the desktop drawer's compliance/More controls,
  with the same theme and motion choices in the mobile navigation and Settings.
- Motion remains independent from the static wallpaper. Midnight City now uses
  a responsive silent cloud-video sky beneath a stationary building foreground,
  with the existing CSS haze/fog/glow above it. Turning motion off unmounts that
  complete stack and reveals the unchanged JPG. Device reduced-motion preference
  wins, while browser data-saver mode retains the lighter CSS-only atmosphere.
- Shared member pages always offer both Create Post and Create Moment. Home and
  Profile keep their existing editors; other pages receive shared fallbacks.
  These are still prototype editors, not real publishing or entitlement APIs.
- Email reminder states use an opaque surface and paired semantic text colors.
  Dark active navigation uses white silhouettes with dark internal details.
  Composer confirmations, selected Connect filters, and high-contrast mode also
  receive explicit foreground/background pairings.

## Artwork and provenance

Generated with the **built-in image-generation tool**, not CLI/API fallback.
Selected PNG outputs were converted to JPEG at quality 88 for delivery; no
code-generated illustration or replacement of the Sakura assets was used.

| Asset                                                                 | Size              | Delivery bytes |
| --------------------------------------------------------------------- | ----------------- | -------------- |
| `apps/web/src/assets/backgrounds/midnight-city-feed-desktop.jpg`      | 1536 × 1024       | 340,988        |
| `apps/web/src/assets/backgrounds/midnight-city-feed-mobile.jpg`       | 941 × 1672        | 262,575        |
| `apps/web/src/assets/backgrounds/midnight-city-clouds-desktop.mp4`    | 1280 × 720, 8.5 s | 363,129        |
| `apps/web/src/assets/backgrounds/midnight-city-clouds-mobile.mp4`     | 540 × 960, 8.5 s  | 184,673        |
| `apps/web/src/assets/backgrounds/midnight-city-buildings-desktop.png` | 1536 × 1024 RGBA  | 597,007        |
| `apps/web/src/assets/backgrounds/midnight-city-buildings-mobile.png`  | 941 × 1672 RGBA   | 430,584        |

The desktop input was the prior local city JPG as a palette/texture reference.
The generated desktop image then served as the mobile reference. Buildings and
their arrangement were deliberately replaced, not merely recolored.

### Responsive motion-video follow-up

Dates: August 31 and September 1, 2026.

The shipped cloud videos now derive exclusively from the fresh 1920 × 1080,
10-second Google/Gemini sky animation supplied by the project owner on
2026-09-01. The earlier cleaned derivatives were overwritten and are not
retained as web assets. No watermark-cleanup or image-repair processing was
applied to the new source. The untouched source remains outside the repository;
its SHA-256 is
`ec21581aa3d1964b45e15fb517d6fa875454e46f37797578d8ee58ed126e409c`.
The supplied master contains stereo audio, but both web derivatives are silent
and retain an explicit AI-origin/source-hash comment in MP4 metadata.

Although the master filename says “loop,” its raw last-to-first transition is
visibly larger than an ordinary frame change. Both web videos therefore start
at source time 1.5 seconds. Source times 1.5–8.5 play normally, followed by a
1.5-second blend from source times 8.5–10.0 into 0–1.5. The resulting
8.5-second/204-frame clip ends on the same motion phase at which it begins,
avoiding the hard ten-second cut. The desktop delivery is fast-start H.264 High
Profile, 1280 × 720, 24 fps. Mobile uses a centered sky-only crop and is encoded
independently at 540 × 960, 24 fps, so portrait browsers do not download or
decode a mostly off-screen landscape frame. Both use YUV420P and complete BT.709
color tags.

The desktop foreground is the approved 1536 × 1024 true-alpha building layer.
The 941 × 1672 mobile foreground extracts the stationary architecture from the
exact approved mobile composite JPG, preserving its independent portrait
composition instead of cropping or regenerating the desktop skyline. Video and
foreground fade in only after the chosen video begins playing; stale or rejected
play attempts cannot reveal a frozen frame. Until then, on media failure, with
saved motion disabled, under device reduced motion, or under reduced
transparency, the existing responsive composite JPG remains the visible
fallback. Reduced transparency also prevents the video from mounting or
downloading. Buildings therefore never enter the video-generation or animation
path.

### Final desktop prompt

Use case: style-transfer. Asset type: desktop website wallpaper, landscape
1536x1024 or larger same 3:2 proportion. Image 1 is a palette and painted-texture
reference only; replace the entire architecture and building arrangement with a
new original everyday city. Preserve the rich midnight/cobalt blue sky, soft
periwinkle haze, subtle painted grain, simplified 2D cel-animation aesthetic,
calm night atmosphere and very sparse warm window lights. Buildings: standardized
contemporary mid-rise apartment blocks and ordinary rectangular office towers
with flat roofs, regular rectangular windows, a few simple horizontal balcony
bands; plain geometric masses with just two or three flat blue shadow tones,
minimal detail. New asymmetrical skyline: a cluster of broad medium-height
apartment slabs near the lower left, a couple of narrower straight-sided offices
farther away near the lower right, low distant blocks across the bottom. Less
monumental than reference: architecture mostly in lower half and outside
left/right edges, generous quiet blue sky through center and upper half for feed
UI. No cathedral forms, no Art Deco stepped crowns, no tall needle spires, no
gargoyles, no dramatic flanking skyscraper canyon, no ornate fan motifs, no
arched windows, no recognizable buildings from any existing city illustration
or entertainment franchise. No Batman/DC characters, logos, bats, signals, text,
people, cars, watermark. This is only the full-bleed background art, not a
screenshot or UI. Keep it visually rich but unobtrusive; do not generate any
user interface. Entirely new standardized building silhouettes and composition,
same blue painted atmosphere.

### Final mobile prompt

Use case: style-transfer. Asset type: portrait mobile website wallpaper, tall
9:16 composition. Image 1 is the approved desktop wallpaper and exact visual
style/palette reference. Create its matching mobile companion, adapting framing
to portrait rather than squeezing the landscape. Keep the identical midnight
and cobalt blue painted sky, soft periwinkle haze, subtle grain and 2D hand-painted
cel-animation look. Same everyday standardized flat-roof apartment blocks and
rectangular office buildings, regular simple windows, sparse subdued warm lights,
minimal details. A broad apartment at lower-left edge and modest rectangular
office blocks at lower-right, distant low rooftops across bottom. Buildings
primarily lower third to lower half and edges; expansive calm blue clouded sky
upper two thirds and open center for mobile feed overlay. Not a dramatic enclosed
skyscraper canyon. No Art Deco stepped crowns, needle spires, ornate fan facades,
arched windows, cathedral forms or recognizable franchise architecture. No bats,
characters, logos, signs, text, UI, cars, watermarks. Only full-bleed artwork.
Maintain desktop scene's quiet ordinary-city character and blue palette.

## Verification

- `npm run test`: 229/229 tests passing, including responsive video selection,
  active-playback readiness, hidden-tab and stale-play-attempt handling, media
  attributes and layer order, data-saver/reduced-transparency fallback,
  saved/device motion opt-out and live reduced-motion teardown, theme
  persistence, both creation choices on shared pages, and numeric 4.5:1
  email-notice contrast checks.
- `npm run lint`: no errors or warnings.
- `npm run build`: successful; Vite emitted both hashed cloud videos, both
  transparent foregrounds, the static Midnight City fallbacks, and Sakura
  backgrounds.
- `npm run test:e2e -- tests/e2e/member-appearance.spec.js`: 5/5 focused
  Chromium checks passed against the local API/database stack. They verify
  unpaused advancing playback, motion teardown/restoration, mobile artwork, and
  live 768 → 767 → 768 responsive source changes.
- Live in-app browser: verified the moving desktop video at 1440 × 900 and
  2560 × 1080 ultrawide, and visually reviewed the mobile feed at 390 × 844.
  A frame-by-frame stack audit of the repaired mobile cutout found no cloud
  leakage, doubled skyline, vertical shafts, or broad halo. This remains a
  browser viewport review, not physical-device certification.
- Local Node 26 emits existing module-registration/localStorage warnings;
  JSDOM emits its existing unsupported media-pause diagnostic. These do not
  fail the tests. Node 24 remains the repository's pinned CI baseline.

Two initial contrast-test harness attempts failed because CSS imports were
stubbed and JSDOM supplied a non-file `import.meta.url`. The final test reads the
source stylesheet from the web workspace and passes; no failing check is being
counted as verification.
