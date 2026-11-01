# CLAUDE.md — oss-intro

Character intro motion template (CoC 7th "Rewind Scenario", OSS Counter-Devil Section). Static site, deployed on GitHub Pages. **No server, no server cost — everything must run in the visitor's browser.** The owner is a UI/UX designer on macOS; talk to them in Korean.

## Current architecture (index.html, single file)

- Stage: a fixed 1200×1700 DOM world (`#stage`) scaled to fit. Scenes `#s0` (slate), `#s1` (paper silhouette / spotlight / glitch), `#s2` (profile card).
- Animation: one paused GSAP 3.12.5 timeline (`tl`) built per character in `buildTimeline()`. Everything is seekable: `render(t)` = `tl.seek(t)` + `afterSeek(t)` (per-frame stop-motion jitter, grain canvas `#fx/#fxd`, glitch sprite frames, film strip scroll). All randomness is seeded (`rnd(a,b)`), so the same `t` always gives the same frame.
- `window.TEMPLATE = { duration, fps (30), width, height, renderAt(t), select(id), ready }` — the deterministic capture API used by `tools/render.mjs`.
- Characters: `CHARACTERS` array (id, file, kind, image, names, stats, rank, quote, face `[x,y,w,h]` normalised, expressions[3]). `prepareArt()` derives alpha bbox, auto face box, mask/shadow/outline PNGs on a canvas.
- Group mode: `#group` hash → `activateGroup()` + `buildGroupTimeline()` (slate → 4 silhouettes in a height-scaled lineup panning L→R → full-frame glitch, 4.3s). The final group video (one-by-one profiles → 2×2 grid) was stitched offline; not yet in the page.
- Timings (single, 7s): `T_SIL .95`, `T_ART 2.5`, `T_SPOT 2.82`, `T_GL 3.3`, `T_PRO 4.1`.
- Backgrounds in `assets/bg/` are **pre-composited** (posters + collage + halftone + tint). Never add the original poster/sticker/glitch source files to the repo.

## Next task: in-browser export (MP4 / GIF / PNG) without a server

Browsers cannot capture DOM pixels, so the stage must be redrawn on a `<canvas>`:

1. Write a canvas renderer `drawFrame(ctx, t)` that reproduces every scene from the same timeline state. Keep GSAP; tween plain objects or read `gsap.getProperty()` from the existing DOM nodes, then draw with Canvas 2D (`drawImage`, `globalCompositeOperation` for multiply/screen/soft-light/hard-light, masks via `destination-in` with the precomputed mask canvas, text via `fillText` with Pretendard / Anton / IBM Plex Mono / Instrument Serif after `document.fonts.load`).
2. Keep the DOM preview, or switch the preview to the canvas too, so what you see equals what you export.
3. MP4: WebCodecs `VideoEncoder` (H.264, `avc1.640028`, 1200×1700, 30fps) + `mp4-muxer` (load the UMD build from a CDN, pinned version). Fallback when WebCodecs is missing: tell the user to use Chrome/Edge.
4. GIF: `gifenc` (palette per frame, 12fps, width 540 default, user-selectable size target ≈15MB; reference result: 540×765, 12fps, 128 colours, light denoise ≈14MB for 7s).
5. PNG/JPG: draw the last settled profile frame (t ≈ 6.5s) and `canvas.toBlob`.
6. Download via `URL.createObjectURL` + `<a download>` (works on GitHub Pages; it did NOT work inside the claude.ai artifact sandbox, which is why it was not built there).
7. Show progress (frame i / n) and keep the UI responsive (encode in chunks, `await` between frames).
8. Add group export: intro (`#group` timeline) → each profile sped up ~1.6× (from the orange-silhouette landing to the settled card) with 3-frame glitch stingers → 2×2 grid hold.

Verify by exporting each character and comparing a few frames with `npm run render` output.
