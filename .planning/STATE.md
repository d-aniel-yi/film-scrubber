# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12)

**Core value:** Controls must feel like a dedicated film room clicker — native-feeling buttons with instant response
**Current focus:** Phase 5 (Drawing Overlay)

## Current Position

Phase: 5 of 5 (Drawing Overlay) — In progress
Plan: 1/2
Status: In progress
Last activity: 2026-03-12 — Completed 05-01-PLAN.md (drawing overlay foundation)

Progress: [█████░░░░░] 50% (v1.1)

## Performance Metrics

**Velocity (v1.0):**
- Total plans completed: 9
- Average duration: ~10 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-touch-native-foundation | 2/2 | 60 min | 30 min |
| 02-core-playback-scrubbing | 3/3 | 6 min | 2 min |
| 03-film-clicker-layout | 4/4 | 33 min | 8 min |
| 05-drawing-overlay | 1/2 | 3 min | 3 min |

## Accumulated Context

### Decisions

All v1.0 decisions logged in PROJECT.md Key Decisions table.

**v1.1 Decisions:**

| Plan | Decision | Rationale |
|------|----------|-----------|
| 05-01 | `pointer-events-none` on canvas when not drawing | Preserves native video click-to-play without special handling |
| 05-01 | Single canvasRef for both player modes | Only one player mode renders at a time |
| 05-01 | Local variable pattern in onPointerUp for committed strokes | Avoids stale-closure redraw with stale strokes state |

### Patterns Established

- All buttons must include `select-none touch-manipulation` classes
- Minimum `py-2.5` padding on all interactive elements for 44px+ mobile tap targets
- Hold buttons use `touch-none` (not `touch-manipulation`) with `e.preventDefault()` on pointerdown
- `active:scale-95 active:bg-*` on all interactive buttons for press feedback
- `holdDirection: "rewind" | "forward" | "rewind-fast" | "forward-fast" | null` for per-button hold state
- RAF time-based scrubbing pattern: `targetTime = startTime ± (elapsed × multiplier)`
- Film clicker hierarchy: seek bar → play/toggle → hold (slow) → hold (fast) → jumps → settings
- `isSlowMo` derived from loaded settings: `speed !== 1 && speed === slowMoSpeed`
- Progressive keyboard shortcuts: base key = common, Shift = medium, Cmd/Ctrl = large
- DrawingOverlay: `absolute inset-0 h-full w-full` inside relative player container
- Canvas drawing: `pointer-events-none` when inactive, `touch-none` when active
- Drawing state flows: `useDrawing` -> `ScrubberShell` -> `ControlBar` + `DrawingOverlay`

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-12
Stopped at: Completed 05-01-PLAN.md — drawing overlay foundation (useDrawing, DrawingOverlay, PlayerArea children, ScrubberShell wiring, ControlBar Draw button)
Resume file: None
