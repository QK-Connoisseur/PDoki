# Sakura Kiss motion handoff

Updated: 2026-09-03

Status: retired experiment. Sakura Kiss now uses only its original static
desktop/mobile JPGs. Motion controls, video derivatives, and foreground layers
have been removed from the application. These still-image handoff assets are
retained for possible future professional work and are not imported at runtime.
The implementation and workflow notes below are historical, not active product
behavior or authorization to reintroduce background video.

## Files

| File                                         | Role                                      | Dimensions  |
| -------------------------------------------- | ----------------------------------------- | ----------- |
| `sakura-kiss-petal-motion-plate-desktop.png` | Preferred desktop Flow input              | 1536 x 864  |
| `sakura-kiss-static-trees-desktop.png`       | Matching stationary true-alpha foreground | 1536 x 864  |
| `sakura-kiss-static-trees-mobile.png`        | Mobile stationary true-alpha foreground   | 941 x 1672  |
| `sakura-kiss-background-desktop.jpg`         | Clean desktop derivation plate            | 1536 x 1024 |
| `sakura-kiss-background-mobile.jpg`          | Clean mobile derivation plate             | 941 x 1672  |
| `sakura-kiss-floral-layer-desktop.png`       | Registered desktop derivation matte       | 1536 x 1024 |
| `sakura-kiss-floral-layer-mobile.png`        | Registered mobile derivation matte        | 941 x 1672  |

The new desktop pair shares one exact 16:9 canvas and must retain identical
layout transforms in the browser. The mobile composition is independent; do
not crop the desktop pair to create its eventual mobile equivalents. The
foregrounds are edge-matted specifically for their matching pink plates and
are not intended for use over dark or unrelated backgrounds.

## Retired preview implementation

The supplied `Kling-Sakura.mp4` was not committed. Web-ready, silent H.264
derivatives were imported from the parent background folder and are now removed:

| File                                | Role                  | Dimensions | Size    |
| ----------------------------------- | --------------------- | ---------- | ------- |
| `../sakura-kiss-petals-desktop.mp4` | Desktop motion plate  | 1280 x 720 | 242 KiB |
| `../sakura-kiss-petals-mobile.mp4`  | Mobile portrait plate | 540 x 960  | 147 KiB |

Both videos are 24 fps, fast-start, 9.21-second loops. The source loop reset was
repaired with a restrained 0.75-second crossfade before encoding. Playback is
revealed only after the browser emits `playing`; the static JPG remains visible
if autoplay or decoding fails. The desktop clip contains sparse petal motion.
The centered mobile crop is primarily subtle haze motion, which is preferable
to stretching the landscape source but should be treated as a visual trial.

## Recommended Flow workflow

Upload only `sakura-kiss-petal-motion-plate-desktop.png` to Flow. It contains the
opaque pink atmosphere and exactly five detached petals, but no trees, branches
or attached blossoms for the model to reconstruct. Keep
`sakura-kiss-static-trees-desktop.png` out of Flow; it remains completely still
above the returned video in the browser.

Choose a 16:9 output, approximately 8-10 seconds, silent, with the minimum
available motion strength and no camera motion. Use only the start frame. Do not
request an identical end frame or a seamless loop inside Flow: continuously
falling petals cannot return to their first positions without reversal,
duplication or disappearance. Inspect and loop the chosen take locally with a
restrained crossfade.

Copy-ready desktop prompt:

> Locked 2D ambient background plate with a fixed camera. Preserve the pink
> background, lighting, texture and framing exactly. Animate only the five
> isolated petals already present. Each petal descends at a constant, nearly
> imperceptible rate, moving no more than 2-3 percent of the frame height during
> the entire clip, with lateral drift under 1 percent of the frame width and
> rotation under 5 degrees. Keep every petal's count, size, shape, color and
> opacity unchanged. No new petals; no duplication, disappearance, spawning,
> morphing, fluttering, gusts or acceleration. Never create trees, branches,
> twigs, stems, leaves or flower clusters. No movement in the pink haze. No
> camera movement, zoom, parallax, reframing, focus, exposure or color change.
> Silent video.

Avoid positive motion language such as “wind,” “breeze,” “swaying blossoms” or
“cinematic.” Those phrases encouraged the rejected test generation to invent
branches and use excessive motion.

## Production guardrails

- Motion-off, reduced-motion, loading and playback failure must continue to show
  the existing Sakura JPGs.
- Do not upload or animate either floral/tree layer. Generative video commonly
  bends branches, changes blossom counts and shimmers around pale edges.
- The eventual web deliverables should be silent H.264/YUV420P fast-start MP4s,
  approximately 8-12 seconds at 24 fps, with separate desktop and mobile files.
- The returned motion must remain behind
  `sakura-kiss-static-trees-desktop.png` and behind all interface content.
- Keep separate desktop and mobile encodes so phones never download or crop the
  desktop file at runtime.
- Keep the videos only after they pass motion-off, reduced-motion,
  responsive-breakpoint, failure-fallback and real playback review.

## Derivation and provenance

The clean plates were created with the built-in OpenAI image editing tool from
the existing project assets. Direct generated checkerboard, chroma-key and
incorrect-size alpha results were rejected. The final true-alpha mattes were
derived locally from the pixel differences between each original JPG and its
matching clean plate, so the foreground RGB retains the original floral pixels
and native registration rather than regenerated flowers. The final layers were
visually recomposited over their matching pink plates before delivery. The
desktop recomposite measured 39.07 dB PSNR against its source; mobile measured
40.04 dB.

The 2026-09-02 desktop motion pair was then split deterministically from those
registered assets. Five detached-petal connected components were retained on
the opaque plate; all attached side trees remained in the transparent
foreground. Both were center-cropped together from y=80 through y=943 to an
exact 1536 x 864 frame. The split pair recomposites to the source at 39.07 dB
RGB PSNR. No additional generative image editing was used.

For the 2026-09-03 preview, the mobile stationary foreground was derived
deterministically from the registered mobile floral matte. The five detached
petal components were removed and the remaining side trees were retained at
their native 941 x 1672 registration. The user-supplied Kling source was used
only to produce the two optimized runtime derivatives described above.

Source SHA-256 values:

- `sakura-feed-desktop.jpg`:
  `3df51fd974198654d9a585b80e6d62e30107cf3d6e56a426431b893e35f7ed59`
- `sakura-feed-mobile.jpg`:
  `46d363ae97710b124654bfb424129a5e8e2c97fc9f3dd63c02786af5a1e0ab0e`

Final SHA-256 values:

- `sakura-kiss-background-desktop.jpg`:
  `3d909d827b525f222dbe4d6b1f441cb22940d19b8a4ceb31af5140f2eacef2de`
- `sakura-kiss-background-mobile.jpg`:
  `63b5e0e489e833b0b9d0142ce40fe7382a4d4f6e7fed1c40330f6ba632e8590f`
- `sakura-kiss-floral-layer-desktop.png`:
  `03cb57aa69b1869511e623cb61b5aa4dd9e7398bffa5bbcffa5a06a37a066403`
- `sakura-kiss-floral-layer-mobile.png`:
  `7e59d4c8f26f56ac0ebbba761291ddc093677f4a9b35316296cf4f3a8b7faa56`
- `sakura-kiss-static-trees-desktop.png`:
  `8dfd92adc91b4eb41cb38e4a66e44f02c94283e5d4962cf4854d33195e360901`
- `sakura-kiss-petal-motion-plate-desktop.png`:
  `6f4091078970265c43938eb7c345ad2cd0ecdc4a940ff66a7e8491102f2a8b7c`
- `sakura-kiss-static-trees-mobile.png`:
  `cbb0a501d84560a13ccedb21072d8ca2af71464f2b3fa69997afd0d3db6915b4`
- source `Kling-Sakura.mp4` (not committed):
  `a420fe74143b037f3d324c5045c5b127e2409e7d45b2ad71c1e9bddba7aaa879`
- `../sakura-kiss-petals-desktop.mp4`:
  `84c68c5427a777272e889bdc0aaea2504c89516aea7562d3c0776d2bddae3b29`
- `../sakura-kiss-petals-mobile.mp4`:
  `712123647d0c5867de820105aff5d691f8c69aba88033d78c0907817c7ded413`
