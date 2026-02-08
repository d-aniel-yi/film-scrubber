# YouTube Film-Style Scrubber — Plan

## Your decisions (locked)

- **Deep links:** Optional; only implement in Phase 7 if time allows. Do not block Phase 0 on this.
- **Hold-to-scrub step:** Same Fine/Medium/Coarse as tap step (no separate "hold step").
- **Styling:** Tailwind CSS.
- **Hold tick rate:** User-configurable from the start; persist in localStorage with other settings.
- **Empty state:** No demo video — empty player + "Paste a YouTube URL above" until user pastes.
- **Tests:** Include from the start (URL parsing, step/jump math; optionally player hook).

---

## How we create a no-slop foundation

### 1. Single source of truth for UX constants

Put every magic number and mapping in one place so we never "re-decide" mid-build and never scatter literals.

- **File:** e.g. `src/lib/constants.ts` (or `src/config/scrubber.ts`)
- **Contents:**
  - Step presets: `{ fine: 0.033, medium: 0.05, coarse: 0.1 }`
  - Jump amounts: `[1, 5, 10]` seconds
  - Default hold tick rate (e.g. `70` ms) and optional min/max for the user control
  - Keyboard map: `{ playPause: ' ', rewind: 'j', pause: 'k', forward: 'l', stepBack: 'ArrowLeft', stepForward: 'ArrowRight' }`
- **Use:** All components and hooks import from here. Adding a new step preset or key is a one-line change.

### 2. Clean project structure (from Phase 1)

```
src/
  app/                    # App Router pages/layout
  components/             # UI only; receive callbacks and state
    ControlBar.tsx
    PlayerArea.tsx
    UrlInput.tsx
  hooks/
    useYouTubePlayer.ts   # Only place that talks to YT IFrame API
    useScrubberControls.ts  # Step/jump/hold logic using currentTime + seekTo
  lib/
    constants.ts          # UX constants above
    youtube.ts            # Pure URL parsing (extract video ID)
  types/
    player.ts             # YT player interface, app state shapes
```

- **Rule:** YouTube API surface is only used inside `useYouTubePlayer`. The rest of the app sees a small interface: `play`, `pause`, `seekTo`, `getCurrentTime`, `setPlaybackRate`, `getAvailablePlaybackRates`, `ready`, `loading`.
- **Rule:** URL parsing is a pure function in `lib/youtube.ts` (no React, no hooks). Easy to unit test.

### 3. TypeScript discipline

- **Player:** Define an explicit interface (e.g. `YouTubePlayerController`) that the hook returns so the app never depends on raw YT types.
- **State:** Type the object you store in localStorage (speed, step preset, hold tick rate) and the shape of any future URL search params so Phase 7 stays consistent.
- **Strict mode:** Keep `strict: true`; no `any` for public APIs.

### 4. One player hook, no duplication

- **Single hook:** `useYouTubePlayer(videoId: string | null)` creates/destroys the player when `videoId` changes, loads the IFrame API script once, and returns the controller + `ready` / `loading`.
- **Ref-based instance:** Keep the YT player instance in a ref so re-renders don't recreate it; only `videoId` change triggers teardown/new player.
- **No YT logic in components:** Components call `seekTo`, `play`, etc.; they don't touch `YT.Player` or the iframe.

### 5. Testable units from day one

- **lib/youtube.ts:** Unit tests for `extractVideoId(url)` covering:
  - `youtube.com/watch?v=ID`
  - `youtu.be/ID`
  - `youtube.com/shorts/ID`
  - `youtube.com/embed/ID`
  - Invalid/malformed → null or throw
- **Step/jump math:** Small pure functions (e.g. `stepTime(current, stepSize, direction)`, `clampTime(time, duration)`). Unit test edge cases (0, duration, negative).
- **Optional:** Integration or hook-level tests for `useYouTubePlayer` with a mocked YT API so we don't depend on a real iframe in CI.

This keeps the foundation predictable and easy to extend (e.g. Phase 7 URL state reads from the same constants and types).

### 6. Tailwind and consistency

- Use Tailwind from Phase 1; no arbitrary one-off CSS files for layout/controls.
- Optional: a small set of design tokens in `tailwind.config` (e.g. control bar height, spacing for touch targets) so we don't scatter magic numbers in classes. Can be minimal at first.

### 7. Phase 0 checklist (updated)

- Step presets: Fine 0.033s, Medium 0.05s, Coarse 0.1s
- Jump buttons: ±1s, ±5s, ±10s
- Hold tick rate: user-configurable from start; default e.g. 70ms (≈14 seeks/s); persist in localStorage
- Keyboard: Space, J/K/L, ←/→ as in tasks
- Deep links: optional, Phase 7 only
- Hold step: same as selected step preset

**Done when:** Constants file and types exist and are the only place these values live.

---

## Phase flow (unchanged, with foundation baked in)

- **Phase 1:** Next.js (App Router), TypeScript, ESLint, Prettier, Tailwind. Create the layout (header/URL input, player area, control bar), add `src/lib/constants.ts`, `src/lib/youtube.ts`, `src/types/player.ts`, plus the folder structure above. Create `docs/PROGRESS.md` with the handoff template and initial one-line status. Deploy to Vercel so the shell loads.
- **Phase 2:** Implement `useYouTubePlayer` and wire URL input → `videoId` → player. Empty state: "Paste a YouTube URL above" when `videoId` is null.
- **Phase 3–6:** Speed, time, step/jump, hold-to-scrub, keyboard — all using the constants and the single player hook. Add hold tick rate to the settings UI and localStorage in the same place as speed/step.
- **Phase 7:** Optional deep linking; localStorage already in place.
- **Phase 8–9:** QA, polish, ship.

Tests can be added as soon as `lib/youtube.ts` and step math exist (during or right after Phase 2); no need to wait for "everything" to be built.

---

## Progress tracking and handoff

Goal: a new agent or chat can open the repo and know **where we are**, **what's done**, and **how things are wired** without re-reading the whole codebase.

### What we maintain

1. **Task checklist:** [docs/tasks.md](docs/tasks.md) — Single source of truth for phase tasks. Check off items as they're completed (`- [x]`). Keep phase "Done when" criteria accurate.
2. **Handoff doc:** `docs/PROGRESS.md` (create in Phase 1) — Updated at the **end of each work session** (or when a phase completes). **Rule:** Before ending a session, update `PROGRESS.md` and ensure `tasks.md` checkboxes match reality. That's the contract for handoff.
3. **Docs that stay reference-only** — [docs/scope.md](docs/scope.md) for product/UX rules; this plan for strategy (update only when scope or approach changes).

### PROGRESS.md structure

- **One-line status** — e.g. "Phase 3 in progress — speed selector and time readout wired; step controls next."
- **Current phase** — Phase X (In progress | Blocked | Done); "Next up:" with concrete tasks.
- **Last completed** — Phase X: 1–2 sentences on what was built and where.
- **Key files (quick map)** — table: path | purpose (e.g. `src/lib/constants.ts`, `src/hooks/useYouTubePlayer.ts`).
- **Decisions this session** — any non-obvious choice made while building.
- **Known gotchas / open items** — e.g. seek throttle; deferred work.

### How a new agent picks up

1. Read `docs/PROGRESS.md` for current phase, last completed, next steps.
2. Skim `docs/tasks.md` for checked items in the current phase.
3. Use "Key files" in PROGRESS to open the right modules.
4. Refer to `docs/scope.md` and this plan for rationale.

No need to re-derive context from git history or a full codebase scan.

---

## Summary

The no-slop foundation is: **one constants file, one player hook, pure URL parsing and step math, strict types, and a clear folder split**. That gives you a single place to change behavior, easy tests, and a clean path to Phase 7 (URL state and persistence) without refactors.
