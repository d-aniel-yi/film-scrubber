# Roadmap: Film Scrubber

## Overview

Add a drawing/annotation overlay to the film clicker, enabling users to draw on top of video while reviewing plays. Drawing is a transparent canvas overlay — session-only, static (not tied to timestamps), with freehand and line tools, color, stroke width, undo/redo, and clear.

## Milestones

- ✅ **v1.0 Film Clicker MVP** — Phases 1-3 (shipped 2026-03-12) — [archive](.planning/milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 Drawing Overlay** — Phase 5 (in progress)

## Phases

<details>
<summary>✅ v1.0 Film Clicker MVP (Phases 1-4) — SHIPPED 2026-03-12</summary>

- [x] Phase 1: Touch-Native Foundation (2/2 plans) — completed 2026-02-12
- [x] Phase 2: Core Playback & Scrubbing (3/3 plans) — completed 2026-02-12
- [x] Phase 3: Film Clicker Layout (4/4 plans) — completed 2026-02-13
- [~] Phase 4: Testing & Validation — skipped (accepted as tech debt)

</details>

### 🚧 v1.1 Drawing Overlay

- [ ] **Phase 5: Drawing Overlay** — Canvas overlay with draw tools, undo/redo/clear, color and stroke width

## Phase Details

### Phase 5: Drawing Overlay
**Goal**: Users can activate a drawing overlay on the video, draw freehand or straight lines with configurable color/stroke, and undo/redo/clear their work
**Depends on**: Phase 3 (existing ControlBar)
**Requirements**: DRAW-01, DRAW-02, DRAW-03, DRAW-04, DRAW-05, DRAW-06, DRAW-07, DRAW-08, DRAW-09, DRAW-10, DRAW-11, DRAW-12
**Success Criteria** (what must be TRUE):
  1. User can toggle drawing mode on/off via a "Draw" button in the control bar
  2. A transparent canvas appears over the video when drawing mode is active
  3. Tapping/clicking the video in draw mode does NOT play or pause video
  4. User can draw freehand paths with finger or mouse
  5. User can draw straight lines by clicking start and dragging to end
  6. User can change pen color and stroke width before drawing
  7. User can undo the last stroke and redo it
  8. User can clear all drawings
  9. Drawing works on both mobile (touch) and desktop (mouse)
  10. Canvas stays aligned with video when window is resized
**Plans**: 2 plans

Plans:
- [ ] 05-01-PLAN.md — Canvas overlay foundation (toggle, transparent canvas, pointer event interception, freehand drawing, resize alignment)
- [ ] 05-02-PLAN.md — Full tool suite (line tool, color picker, stroke width, undo/redo, clear, mobile touch support)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Touch-Native Foundation | v1.0 | 2/2 | Complete | 2026-02-12 |
| 2. Core Playback & Scrubbing | v1.0 | 3/3 | Complete | 2026-02-12 |
| 3. Film Clicker Layout | v1.0 | 4/4 | Complete | 2026-02-13 |
| 4. Testing & Validation | v1.0 | 0/0 | Skipped | — |
| 5. Drawing Overlay | v1.1 | 0/2 | Not started | — |
