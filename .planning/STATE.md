# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-11)

**Core value:** Controls must feel like a dedicated film room clicker — native-feeling buttons with instant response
**Current focus:** Phase 4 next (Testing & Validation)

## Current Position

Phase: 3 of 4 (Film Clicker Layout) — Complete
Plan: 4/4 in phase
Status: Complete
Last activity: 2026-02-13 - Phase 3 verified and complete

Progress: [███████░░░] 75%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: 13 min
- Total execution time: 1.6 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-touch-native-foundation | 2/2 | 60 min | 30 min |
| 02-core-playback-scrubbing | 3/3 | 6 min | 2 min |
| 03-film-clicker-layout | 4/4 | 33 min | 8 min |

**Recent Trend:**
- Last 5 plans: 02-02 (3 min), 03-01 (23 min), 03-02 (1 min), 03-03 (9 min)
- Trend: Layout changes very fast, feature additions slower

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase 1: Replace frame-step presets with fixed second jumps (seconds more intuitive for film review)
- Phase 1: Single layout for mobile and desktop (simpler to maintain, film clicker layout works at all sizes)
- Phase 1: Per-button hold direction (holdDirection) instead of single isHolding boolean — only the actively held button shows visual state
- Phase 2: Slow-mo toggle instead of speed dropdown (faster to switch during review)
- Phase 2: Configurable forward/rewind speed multiplier (different tasks need different scrub speeds)
- Phase 2: RAF time-based scrubbing instead of setInterval (eliminates stutter from YouTube's variable seek latency)
- Phase 2: Dual-speed hold scrubbing (slow 1× + fast 4×) — user preferred separate buttons over single speed
- Phase 2: seekTo-based scrubbing for all directions (play()-based forward failed on mobile)
- Phase 2: 150ms seek throttle + 5s pre-buffer for smoother mobile rewind
- Phase 2: YouTube IFrame API fundamentally limits mobile scrubbing smoothness — accepted limitation
- Phase 2: Volume slider added to controller interface and ControlBar
- Phase 3: Stacked row layout over single-row flex-wrap for clearer visual hierarchy
- Phase 3: gap-3 between major rows for adequate visual separation on mobile
- Phase 3: flex-1 on mobile hold buttons for equal width, sm:flex-none for desktop
- Phase 3: Settings panel collapsed by default to reduce visual clutter
- Phase 3: Settings state does NOT persist to localStorage (can be added later if needed)
- Phase 3: Full-width settings toggle button on mobile (w-full sm:w-auto) for consistent tap target
- Phase 3: S key for slow-mo toggle (single-key toggle pattern for frequently used setting)
- Phase 3: Arrow keys with modifiers for jumps: no modifier = 1s, Shift = 5s, Cmd/Ctrl = 10s (progressive modifier pattern)
- Phase 3: Reordered KEYBOARD_MAP keys to reflect common usage (playPause, pause, JKL scrubbing, slow-mo, jumps)

### Patterns Established

- All buttons must include `select-none touch-manipulation` classes
- Minimum `py-2.5` padding on all interactive elements for 44px+ mobile tap targets
- Use `touch-manipulation` (not `touch-none`) to preserve scroll while disabling double-tap zoom
- Hold buttons use `touch-none` (not `touch-manipulation`) with `e.preventDefault()` on pointerdown — required for mobile hold gestures
- `active:scale-95 active:bg-*` on all interactive buttons for press feedback
- `holdDirection: "rewind" | "forward" | "rewind-fast" | "forward-fast" | null` for per-button hold state tracking
- Conditional template literal className for state-dependent styling on hold buttons
- Amber colors (bg-amber-600/500) for slow-mo active state to distinguish from normal playback
- slowMoSpeed persisted in localStorage and URL state (query param: slowMo)
- RAF time-based scrubbing pattern: `targetTime = startTime ± (elapsed × multiplier)`
- Capture video start time and wall-clock start time at hold start, calculate target position each RAF tick
- scrubSpeedFast persisted in localStorage and URL state (query param: scrubSpeed)
- Generic `startHold(direction, multiplier)` pattern to reduce duplication for multiple hold button variants
- Film clicker hierarchy: seek bar → play/toggle → hold (slow) → hold (fast) → jumps → settings
- Each functional group gets its own row for muscle memory and spatial consistency
- Mobile buttons span full width for maximum tap target size (flex-1, sm:flex-none)
- Collapsible panel pattern: toggle button shows current state with ▼/▲ indicators
- Settings panel at bottom of control bar stack for clear visual hierarchy
- Conditional render with `settingsExpanded && (<div>...</div>)` pattern
- Modifier key detection: check e.metaKey || e.ctrlKey for cross-platform Cmd/Ctrl handling
- Progressive keyboard shortcuts: base key for common action, Shift for medium, Cmd/Ctrl for large
- Callback prop pattern for keyboard shortcuts: onToggleSlowMo optional parameter in hook

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-13
Stopped at: Phase 3 complete, Phase 4 next
Resume file: None
