# Task Breakdown — YouTube Film-Style Scrubber (Next.js + Vercel)

## Phase 0 — Lock the UX rules (30–60 min)
- [ ] Confirm **Step presets**: Fine (0.033s), Medium (0.050s), Coarse (0.100s)
- [ ] Confirm **Jump buttons**: ±1s, ±5s, ±10s
- [ ] Confirm **Hold-to-scrub tick rate**: start at 60–80ms per tick (≈12–16 seeks/sec)
- [ ] Confirm **keyboard mapping**:
  - Space = play/pause
  - J = rewind (hold)
  - K = pause
  - L = forward (hold)
  - ←/→ = step back/forward
- [ ] Decide whether to support **deep links** (optional v1):
  - `?v=VIDEO_ID&t=12.345&speed=0.25&step=0.033`

**Done when:** you stop re-deciding these mid-build.

---

## Phase 1 — App setup + deploy (1–2 hrs)
- [ ] Create Next.js app (App Router)
- [ ] Basic layout:
  - Header (YouTube URL input)
  - Player area
  - Control bar
- [ ] TypeScript on
- [ ] ESLint/Prettier
- [ ] Deploy to Vercel

**Done when:** the UI shell loads on your Vercel URL.

---

## Phase 2 — YouTube player integration (2–4 hrs)
- [ ] Parse YouTube URL → extract `videoId` (support common URL formats)
- [ ] Load **YouTube IFrame API** client-side
- [ ] Build `useYouTubePlayer()` hook that:
  - [ ] Creates player instance
  - [ ] Exposes: `play()`, `pause()`, `seekTo(seconds)`, `getCurrentTime()`
  - [ ] Exposes: `setSpeed(rate)`, `getAvailableRates()`
  - [ ] Tracks player readiness / loading state
- [ ] Make re-renders safe (don’t recreate the player unnecessarily)

**Done when:** you can paste a link, the video loads, and play/pause + seek works.

---

## Phase 3 — Speed control + time readout (1–2 hrs)
- [ ] Play/Pause button
- [ ] Speed selector populated from `getAvailablePlaybackRates()`
- [ ] Current time display (mm:ss.sss)
- [ ] Time polling loop:
  - While playing: ~5–10 updates/sec
  - While paused: minimal updates

**Done when:** time updates smoothly and speed changes reliably.

---

## Phase 4 — Step + jump controls (2–4 hrs)
- [ ] Step size selector (Fine / Medium / Coarse)
- [ ] Implement `step(direction)`:
  - [ ] If playing, pause first (for consistency)
  - [ ] `t = getCurrentTime()`
  - [ ] `seekTo(t ± stepSize)`
- [ ] Buttons:
  - [ ] Step − / Step +
  - [ ] Jump −1/+1, −5/+5, −10/+10

**Done when:** repeated tapping feels consistent (even if not perfect “frames”).

---

## Phase 5 — Hold-to-scrub (film-room feel) (3–6 hrs)
- [ ] Rewind hold button:
  - [ ] Pointer down → start interval
  - [ ] Every tick: `seekTo(currentTime - stepOrHoldStep)`
  - [ ] Pointer up/leave/cancel → stop interval
- [ ] Forward hold button (mirror)
- [ ] Tune tick rate (start ~60–80ms) and hold step (often slightly bigger than tap step)
- [ ] Mobile testing: pointer events behave correctly on touch

**Done when:** holding buttons feels like scrubbing, not stuttery spam.

---

## Phase 6 — Keyboard shortcuts (1–3 hrs)
- [ ] Global key listener (disabled while typing in input fields)
- [ ] Implement:
  - Space = play/pause
  - J = rewind while held (start/stop interval on keydown/keyup)
  - K = pause
  - L = forward while held
  - ←/→ = single-step
- [ ] Prevent default scroll behavior (space/arrows)

**Done when:** desktop feels like actual film software.

---

## Phase 7 — Persistence + deep linking (optional, high value) (1–3 hrs)
- [ ] Save settings to `localStorage`:
  - last speed
  - step preset
  - hold tick rate (if user-adjustable)
- [ ] Optional deep-link support:
  - parse query params on load
  - update URL (debounced) as time/speed changes

**Done when:** refresh doesn’t wipe your preferred settings (and links can share a moment).

---

## Phase 8 — QA + polish (2–6 hrs)
- [ ] Responsive layout (mobile-first controls)
- [ ] Edge cases:
  - invalid URL / missing videoId
  - player not ready (disable controls)
  - throttle seek calls to avoid jank
  - videos with limited playback rates
- [ ] Basic accessibility: aria-labels, focus states
- [ ] “How to use” mini help panel

**Done when:** stable on iOS Safari + Android Chrome + desktop Chrome.

---

## Phase 9 — Ship (30–60 min)
- [ ] Final Vercel deploy
- [ ] Add minimal analytics (optional)
- [ ] Add a feedback link (optional)

---

## Rough time expectations
- **Usable MVP** (load + speed + step + jump): ~1–2 focused days
- **Film-room feel** (hold-to-scrub + keyboard + polish): ~2–5 days total
