---
phase: 05-drawing-overlay
plan: 01
subsystem: drawing
tags: [react, canvas, pointer-events, drawing, overlay]

# Dependency graph
requires:
  - phase: 03-film-clicker-layout
    provides: ControlBar row layout and button patterns
  - phase: 02-core-playback-scrubbing
    provides: PlayerArea component and ScrubberShell architecture
provides:
  - useDrawing hook with freehand drawing state and pointer event handlers
  - DrawingOverlay canvas component sitting over video in both player modes
  - Draw toggle button in ControlBar with red active state
  - Drawing tools row (Freehand/Line) shown when drawing mode active
  - Canvas event interception preventing click-to-play when drawing is active
affects:
  - 05-02-drawing-overlay (extends with more tools, colors, undo/redo, touch, ResizeObserver)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "pointer-events-none on canvas when inactive — click-through to video preserved"
    - "touch-none on canvas when active — prevents scroll/zoom competing with drawing"
    - "absolute inset-0 h-full w-full — canvas fills relative parent exactly"
    - "useRef<Stroke | null> for in-progress stroke — avoids re-renders during draw"
    - "useRef<boolean> for pointer-down state — avoids stale closure in pointer handlers"
    - "Commit strokes to local variable before setState to avoid stale-closure redraw"
    - "redrawCanvas helper called directly (not via useEffect) during active drawing for frame-accurate sync"

key-files:
  created:
    - src/hooks/useDrawing.ts
    - src/components/DrawingOverlay.tsx
  modified:
    - src/components/PlayerArea.tsx
    - src/components/ScrubberShell.tsx
    - src/components/ControlBar.tsx

key-decisions:
  - "canvas pointer-events-none when not in drawing mode so video click-to-play still works"
  - "Single canvasRef shared across both player modes — only one renders at a time"
  - "Draw toggle and Settings toggle share a row for compact layout"
  - "Freehand and line tool branches wired in redrawCanvas even though line tool UI is for 05-02"

patterns-established:
  - "DrawingOverlay placed as absolute child inside player relative containers"
  - "Drawing props flow: useDrawing -> ScrubberShell -> ControlBar + DrawingOverlay"

# Metrics
duration: 3min
completed: 2026-03-12
---

# Phase 05 Plan 01: Drawing Overlay Foundation Summary

**useDrawing hook + DrawingOverlay canvas component wired into both player modes with freehand pointer drawing and Draw toggle button in ControlBar**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-12T22:02:53Z
- **Completed:** 2026-03-12T22:05:58Z
- **Tasks:** 3
- **Files created:** 2
- **Files modified:** 3

## Accomplishments

- Created `useDrawing` hook with full DrawingState type, freehand + line tool branches, undo/redo/clear, and pointer event handlers that avoid stale closure issues
- Created `DrawingOverlay` canvas component with conditional `pointer-events-none` / `cursor-crosshair` styling
- Modified `PlayerArea` to accept `children` prop so DrawingOverlay can be injected inside the relative container
- Wired DrawingOverlay into YouTube player mode (as child of PlayerArea) and local player mode (as sibling of LocalPlayer inside relative wrapper)
- Added Draw toggle button to ControlBar with red active state and `aria-pressed`
- Added Drawing tools row (Freehand / Line) that appears conditionally when drawing mode is on
- Build passes with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useDrawing hook with freehand drawing** - `c7dd067` (feat)
2. **Task 2: Create DrawingOverlay and wire into both player modes** - `c9e9ec7` (feat)
3. **Task 3: Add Draw toggle button and drawing tools row to ControlBar** - `e397967` (feat)

## Files Created/Modified

- `src/hooks/useDrawing.ts` — DrawingTool, Stroke, DrawingState types; useDrawing hook with pointer handlers, undo/redo/clear, canvas redraw helper
- `src/components/DrawingOverlay.tsx` — Canvas overlay, pointer-events-none when inactive, crosshair + touch-none when active
- `src/components/PlayerArea.tsx` — Added `children?: React.ReactNode` prop, renders children inside relative container
- `src/components/ScrubberShell.tsx` — Imports useDrawing + DrawingOverlay, renders overlay in both player modes, threads drawing props to ControlBar
- `src/components/ControlBar.tsx` — Added isDrawingMode, onToggleDrawing, drawingActiveTool, onDrawingToolChange props; Draw toggle button; Drawing tools row

## Decisions Made

1. **`pointer-events-none` when not drawing** — Ensures the canvas is completely transparent to mouse events when drawing mode is off, preserving native video click-to-play behavior without any special handling.

2. **Single canvasRef for both player modes** — Only one player mode renders at a time, so the same ref works for both. No ref switching logic needed.

3. **Local variable pattern in onPointerUp** — `const committed = [...strokes, stroke]; setStrokes(committed); redrawCanvas(canvas, committed)` avoids the stale-closure problem where `strokes` inside setStrokes callback might not reflect the just-added stroke.

4. **Draw toggle shares row with Settings toggle** — Keeps the control panel compact. Both are secondary actions (don't affect playback) and group naturally together.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Minor sequencing note: Task 2's build verification required Task 3's ControlBar prop additions (the `isDrawingMode` etc. props ScrubberShell passes to ControlBar). Executed Task 3 before committing Task 2's build, then committed in correct logical order. No functional impact.

## User Setup Required

None.

## Next Phase Readiness

- Drawing foundation is complete and functional
- Plan 05-02 can extend useDrawing with: color picker, stroke width, ResizeObserver for canvas resizing, touch support, full undo/redo UI buttons
- Line tool branch is already wired in `redrawCanvas` — 05-02 just needs to expose the line tool UI

---
*Phase: 05-drawing-overlay*
*Completed: 2026-03-12*

## Self-Check: PASSED
