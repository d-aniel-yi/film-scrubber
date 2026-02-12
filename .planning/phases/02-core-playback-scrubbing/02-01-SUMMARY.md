---
phase: 02-core-playback-scrubbing
plan: 01
subsystem: ui
tags: [react, youtube-api, playback-controls, slow-motion]

# Dependency graph
requires:
  - phase: 01-touch-native-foundation
    provides: Touch-optimized button patterns and hold direction state
provides:
  - Slow-mo toggle replacing speed dropdown for instant speed switching
  - Fixed-second jump buttons (1s/5s/10s) replacing frame-step presets
  - Settings storage for configurable slow-mo speed
affects: [02-02-scrub-speed-multiplier, 03-keyboard-shortcuts, 04-frame-stepping]

# Tech tracking
tech-stack:
  added: []
  patterns: [Slow-mo toggle with amber active state, Settings persistence for slowMoSpeed]

key-files:
  created: []
  modified:
    - src/lib/constants.ts
    - src/lib/settings.ts
    - src/lib/urlState.ts
    - src/types/player.ts
    - src/hooks/useScrubberControls.ts
    - src/components/ControlBar.tsx
    - src/components/ScrubberShell.tsx

key-decisions:
  - "Removed frame-step presets (confusing for film review)"
  - "Slow-mo toggle for instant switching instead of dropdown"
  - "Default slow-mo speed 0.25x (quarter speed for frame-by-frame review)"

patterns-established:
  - "Amber colors (bg-amber-600/500) for slow-mo active state"
  - "slowMoSpeed persisted in localStorage and URL state"

# Metrics
duration: 3min
completed: 2026-02-12
---

# Phase 2 Plan 1: Controls Simplification Summary

**Slow-mo toggle (0.25x) replaces speed dropdown and frame-step presets removed for simpler film review controls**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-12T22:03:59Z
- **Completed:** 2026-02-12T22:07:19Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Speed dropdown replaced with instant slow-mo toggle button
- Frame-step presets completely removed (step buttons, preset selector)
- Jump buttons (1s/5s/10s) retained for time-based navigation
- Slow-mo speed configurable (default 0.25x, range 0.1-0.75x)
- Settings persist slow-mo preference in localStorage and URL

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove step preset system from constants and add slow-mo config** - `78aa999` (feat)
2. **Task 2: Update settings storage to replace stepPreset with slowMoSpeed** - `386bcd3` (feat)
3. **Task 3: Replace speed dropdown with slow-mo toggle and remove step controls from UI** - `7f932f3` (feat)

## Files Created/Modified
- `src/lib/constants.ts` - Removed STEP_PRESETS, added SLOW_MO_SPEED config
- `src/lib/settings.ts` - Replaced stepPreset with slowMoSpeed in Settings type
- `src/lib/urlState.ts` - Updated URL state to use slowMo query param
- `src/types/player.ts` - Removed StepPresetKey import, updated Settings and UrlState types
- `src/hooks/useScrubberControls.ts` - Removed stepPreset parameter (temporarily using fixed 0.033 step)
- `src/components/ControlBar.tsx` - Added slow-mo toggle button with amber styling, removed speed dropdown and step controls
- `src/components/ScrubberShell.tsx` - Added slowMoSpeed/isSlowMo state, toggleSlowMo function, updated props

## Decisions Made
- **Slow-mo speed default 0.25x:** Quarter speed provides good balance for frame-by-frame review without being too slow
- **Amber color for active state:** Distinct from normal black/white buttons, indicates special playback mode
- **Removed hold tick rate input:** Will be replaced with scrub speed multiplier in plan 02-02 (cleaner UX)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Slow-mo toggle complete and ready for Phase 3 keyboard shortcuts
- Plan 02-02 will replace hold tick rate with scrub speed multiplier
- Plan 02-03 will add slow-mo speed configuration UI

## Self-Check: PASSED

---
*Phase: 02-core-playback-scrubbing*
*Completed: 2026-02-12*
