# CLAUDE.md — oss-intro

Character intro motion template (CoC 7th "Rewind Scenario", OSS Counter-Devil Section). Static site, deployed on GitHub Pages. **No server, no server cost — everything must run in the visitor's browser.** The owner is a UI/UX designer on macOS; talk to them in Korean.

## Current architecture (index.html, single file)

- Stage: a fixed 1200×1700 DOM world (`#stage`) scaled to fit. Scenes `#s0` (slate), `#s1` (paper silhouette / spotlight / glitch), `#s2` (profile card).
- Animation: one paused GSAP 3.12.5 timeline (`tl`) built per character in `buildTimeline()`. Everything is seekable: `render(t)` = `tl.seek(t)` + `afterSeek(t)` (per-frame stop-motion jitter, grain canvas `#fx/#fxd`, glitch sprite frames, film strip scroll). All randomness is seeded (`rnd(a,b)`), so the same `t` always gives the same frame.
- `window.TEMPLATE = { duration, fps (30), width, height, renderAt(t), select(id), ready }` — the deterministic capture API used by `tools/render.mjs`.
- Characters: `CHARACTERS` array (id, file, kind, image, names, stats, rank, quote, face `[x,y,w,h]` normalised, expressions[3]). `prepareArt()` derives alpha bbox, auto face box, mask/shadow/outline PNGs on a canvas.
- Group mode: `#group` hash → `activateGroup()` + `buildGroupTimeline()` (slate → 4 silhouettes in a height-scaled lineup panning L→R → full-frame glitch, 4.3s). The full group video (intro → one-by-one profiles → 2×2 grid) is stitched in the browser by `groupPlan()` (see export below). Slots: calvin KPC/000, chiqui PC1/001, alva PC2/004, ethan PC3/003.
- Timings (single, 7s): `T_SIL .95`, `T_ART 2.5`, `T_SPOT 2.82`, `T_GL 3.3`, `T_PRO 4.1`.
- Backgrounds in `assets/bg/` are **pre-composited** (posters + collage + halftone + tint). Never add the original poster/sticker/glitch source files to the repo.

## In-browser export (done — "내보내기" panel)

The DOM preview is captured, not redrawn: `stageSVG()` clones `#stage`, serialises it with `XMLSerializer`, inlines every `url()` / `src` as data URIs (assets, blob: masks, Pretendard + Google Fonts CSS), wraps it in `<svg><foreignObject>`, loads it into an `<img>` and draws it onto `exCanvas`; then `overlayFx()` composites the grain canvases (`#fxd` screen, `#fx` overlay .5), vignette, flicker/flash/fadeout. Same engine paints preview and export, so they match (measured mean diff < 3/255, edges only). ≈250 ms per frame.

- **The SVG must be loaded as a `data:` URL.** A `blob:` URL taints the canvas in Chromium (foreignObject check), `data:` does not.
- Frames are "plans": arrays of async steps that each leave one frame on `exCanvas` (`singlePlan(fps)`, `groupPlan(fps)`). Encoders only iterate steps, so a step may rebuild the DOM (`activate(i, true)` / `activateGroup()`).
- MP4: WebCodecs `VideoEncoder` (tries `avc1.640028 → 64002a → 4d0028 → 42e028`, 14 Mbps, keyframe every 2 s) + `mp4-muxer@5.2.1` (ESM via `import()` from jsDelivr). GIF: `gifenc@1.0.3`, 12 fps, 128 colours, rgb444, user-selectable width (360/450/540/720), 0.4 px blur as denoise. PNG/JPG: frame at t = 6.5 s. Downloads via `<a download>`.
- Group cut (`groupPlan`): `#group` intro to 4.1 s → per character: 3-frame stinger (`drawStinger`, previous frame sliced + glitch sprites) → profile from `T_LAND` (orange silhouette) to 6.6 s at 1.6× + 0.35 s hold → `drawGrid` 2×2 (tiles pop in with 0.14 s stagger, 0.4 s fade to black). ≈15 s. Constants `G_*` next to `groupPlan`.
- `GROUP` / `DURATION` are mutable now: `activate()` → single (7 s), `activateGroup()` → group (4.3 s). `withExport()` freezes the transport (`EXPORT.busy`, `body.exporting`), restores character/time afterwards. `T_LAND = T_GL + 19/24` is the glitch landing used by both the timeline (`GD`) and the group plan.
- No MP4 outside Chromium (Safari lacks an H.264 `VideoEncoder`): MP4 buttons are disabled with a note; GIF/PNG still work.

## Shared settings ("공통 설정" panel)

`SERIES_KEYS = ['tagline','lockupB','branch','section','scenario','date']` are editable and persisted (`oss-file-template-v9`; v8 is migrated once, renaming Alva's slot PC4 → PC2). The panel also has "소속 · 전원 한 번에 바꾸기", which writes `affiliation` on every roster entry. `lockupB` drives the slate DIR. field, the group slate name and the page title.

## Testing without Node

This Windows box has no Node/Python. The export was verified with headless Edge driven over CDP from PowerShell (static server + `Runtime.evaluate` + `Page.captureScreenshot`, downloads routed with `Page.setDownloadBehavior`), comparing DOM screenshots against `TEMPLATE.snapshot(ctx)` output, then decoding the resulting MP4/GIF in a `<video>`/`<img>`. On a Mac, `npm run render -- <id>` still works for a reference render.
