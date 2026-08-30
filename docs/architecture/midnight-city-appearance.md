# Midnight City appearance refinement

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
- Motion remains an independent CSS atmosphere overlay. Turning it off removes
  the overlay, not the background. Device reduced-motion preference wins.
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

| Asset                                                            | Size        | Delivery bytes |
| ---------------------------------------------------------------- | ----------- | -------------- |
| `apps/web/src/assets/backgrounds/midnight-city-feed-desktop.jpg` | 1536 × 1024 | 340,988        |
| `apps/web/src/assets/backgrounds/midnight-city-feed-mobile.jpg`  | 941 × 1672  | 262,575        |

The desktop input was the prior local city JPG as a palette/texture reference.
The generated desktop image then served as the mobile reference. Buildings and
their arrangement were deliberately replaced, not merely recolored.

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

- `npm run test`: 203/203 tests passing, including theme persistence,
  desktop/mobile palette controls, device reduced motion, both creation choices
  on shared pages, and numeric 4.5:1 minimum email-notice contrast checks.
- `npm run lint`: no errors or warnings.
- `npm run build`: successful; only the new Midnight City and existing Sakura
  backgrounds are included in the production bundle.
- Live in-app browser: verified desktop feed, new background, readable email
  reminder, palette popup, both theme choices, motion off (zero atmosphere
  overlays) and restored motion (all five layers running), Connect moment editor,
  Store post editor, and white active icons with dark details.
- Mobile artwork inspected directly; mobile controls/menus tested in JSDOM.
  This does not claim a real-device mobile visual audit or full browser E2E run.
- Local Node 26 emits existing module-registration/localStorage warnings;
  JSDOM emits its existing unsupported media-pause diagnostic. These do not
  fail the tests. Node 24 remains the repository's pinned CI baseline.

Two initial contrast-test harness attempts failed because CSS imports were
stubbed and JSDOM supplied a non-file `import.meta.url`. The final test reads the
source stylesheet from the web workspace and passes; no failing check is being
counted as verification.
