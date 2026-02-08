# Task Breakdown — YouTube Film-Style Scrubber (Next.js + Vercel)

## Phase 0 — Lock the UX rules (30–60 min)
- [x] Confirm **Step presets**: Fine (0.033s), Medium (0.050s), Coarse (0.100s)
- [x] Confirm **Jump buttons**: ±1s, ±5s, ±10s
- [x] Confirm **Hold-to-scrub tick rate**: start at 60–80ms per tick (≈12–16 seeks/sec)
- [x] Confirm **keyboard mapping**:
  - Space = play/pause
  - J = rewind (hold)
  - K = pause
  - L = forward (hold)
  - ←/→ = step back/forward
- [x] Decide whether to support **deep links** (optional v1):
  - `?v=VIDEO_ID&t=12.345&speed=0.25&step=0.033`

**Done when:** you stop re-deciding these mid-build.

---

## Phase 1 — App setup + deploy (1–2 hrs)
- [x] Create Next.js app (App Router)
- [x] Basic layout:
  - Header (YouTube URL input)
  - Player area
  - Control bar
- [x] TypeScript on
- [x] ESLint/Prettier
- [ ] Deploy to Vercel (run `vercel` or connect repo in dashboard; login required)

**Done when:** the UI shell loads on your Vercel URL.

---

## Phase 2 — YouTube player integration (2–4 hrs)
- [x] Parse YouTube URL → extract `videoId` (support common URL formats)
- [x] Load **YouTube IFrame API** client-side
- [x] Build `useYouTubePlayer()` hook that:
  - [x] Creates player instance
  - [x] Exposes: `play()`, `pause()`, `seekTo(seconds)`, `getCurrentTime()`
  - [x] Exposes: `setSpeed(rate)`, `getAvailableRates()`
  - [x] Tracks player readiness / loading state
- [x] Make re-renders safe (don’t recreate the player unnecessarily)

**Done when:** you can paste a link, the video loads, and play/pause + seek works.

---

## Phase 3 — Speed control + time readout (1–2 hrs)
- [x] Play/Pause button
- [x] Speed selector populated from `getAvailablePlaybackRates()`
- [x] Current time display (mm:ss.sss)
- [x] Time polling loop:
  - While playing: ~5–10 updates/sec
  - While paused: minimal updates

**Done when:** time updates smoothly and speed changes reliably.

---

## Phase 4 — Step + jump controls (2–4 hrs)
- [x] Step size selector (Fine / Medium / Coarse)
- [x] Implement `step(direction)`:
  - [x] If playing, pause first (for consistency)
  - [x] `t = getCurrentTime()`
  - [x] `seekTo(t ± stepSize)`
- [x] Buttons:
  - [x] Step − / Step +
  - [x] Jump −1/+1, −5/+5, −10/+10

**Done when:** repeated tapping feels consistent (even if not perfect “frames”).

---

## Phase 5 — Hold-to-scrub (film-room feel) (3–6 hrs)
- [x] Rewind hold button:
  - [x] Pointer down → start interval
  - [x] Every tick: `seekTo(currentTime - stepOrHoldStep)`
  - [x] Pointer up/leave/cancel → stop interval
- [x] Forward hold button (mirror)
- [x] Tune tick rate (start ~60–80ms) and hold step (same as tap step)
- [x] Mobile testing: pointer events behave correctly on touch

**Done when:** holding buttons feels like scrubbing, not stuttery spam.

---

## Phase 6 — Keyboard shortcuts (1–3 hrs)
- [x] Global key listener (disabled while typing in input fields)
- [x] Implement:
  - Space = play/pause
  - J = rewind while held (start/stop interval on keydown/keyup)
  - K = pause
  - L = forward while held
  - ←/→ = single-step
- [x] Prevent default scroll behavior (space/arrows)

**Done when:** desktop feels like actual film software.

---

## Phase 7 — Persistence + deep linking (optional, high value) (1–3 hrs)
- [x] Save settings to `localStorage`:
  - last speed
  - step preset
  - hold tick rate (if user-adjustable)
- [x] Optional deep-link support:
  - parse query params on load
  - update URL (debounced) as time/speed changes

**Done when:** refresh doesn’t wipe your preferred settings (and links can share a moment).

---

## Phase 8 — QA + polish (2–6 hrs)
- [x] Responsive layout (mobile-first controls)
- [x] Edge cases:
  - invalid URL / missing videoId
  - player not ready (disable controls)
  - throttle seek calls to avoid jank
  - videos with limited playback rates
- [x] Basic accessibility: aria-labels, focus states
- [ ] “How to use” mini help panel

**Done when:** stable on iOS Safari + Android Chrome + desktop Chrome.

---

## Phase 9 — Ship (30–60 min)
- [ ] Final Vercel deploy (run `vercel` or connect repo; login required)
- [ ] Add minimal analytics (optional)
- [x] Add a feedback link (optional)

---

## Rough time expectations
- **Usable MVP** (load + speed + step + jump): ~1–2 focused days
- **Film-room feel** (hold-to-scrub + keyboard + polish): ~2–5 days total
