# Roadmap: Film Scrubber

## Overview

Transform the existing YouTube scrubber into a native-feeling film clicker through four focused phases: establish touch-native button foundation, implement core playback and hold-to-scrub controls, reorganize into film-clicker layout with keyboard shortcuts, and validate across devices. Each phase delivers a complete, verifiable user capability that builds toward professional film review UX.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Touch-Native Foundation** - Buttons feel like native app controls, not tappable web text
- [ ] **Phase 2: Core Playback & Scrubbing** - Users can play, seek, jump, and hold-to-scrub through video
- [ ] **Phase 3: Film Clicker Layout** - Controls reorganized into film-clicker style with keyboard shortcuts
- [ ] **Phase 4: Testing & Validation** - Bug-free, smooth experience validated across devices

## Phase Details

### Phase 1: Touch-Native Foundation
**Goal**: Buttons feel like native app controls with instant response, not tappable web text
**Depends on**: Nothing (first phase)
**Requirements**: TOUCH-01, TOUCH-02, TOUCH-03, TOUCH-04, TOUCH-05
**Success Criteria** (what must be TRUE):
  1. All buttons have minimum 44px tap targets on mobile
  2. User cannot select text when tapping buttons repeatedly
  3. User cannot trigger double-tap zoom when using buttons
  4. Buttons show visual press feedback (scale or color) on tap
  5. Hold buttons show distinct visual state while being held
**Plans**: TBD

Plans:
- [ ] 01-01: TBD during planning

### Phase 2: Core Playback & Scrubbing
**Goal**: Users can play, seek, jump through time, and hold-to-scrub in both directions
**Depends on**: Phase 1
**Requirements**: PLAY-01, PLAY-02, PLAY-03, SCRUB-01, SCRUB-02, SCRUB-03, SCRUB-04, SCRUB-05, JUMP-01, JUMP-02, JUMP-03
**Success Criteria** (what must be TRUE):
  1. User can play/pause video with toggle button
  2. User can switch between normal speed and slow-motion instantly
  3. User can scrub to any position via seek bar
  4. User can hold rewind button to scrub backward continuously
  5. User can hold forward button to scrub forward continuously
  6. Scrubbing feels smooth and consistent in both directions (no visible stutter)
  7. User can jump backward/forward by 1s, 5s, or 10s with dedicated buttons
**Plans**: TBD

Plans:
- [ ] 02-01: TBD during planning

### Phase 3: Film Clicker Layout
**Goal**: Controls reorganized into film-clicker style with keyboard shortcuts matching film editing workflows
**Depends on**: Phase 2
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04, KEY-01
**Success Criteria** (what must be TRUE):
  1. Control layout follows film clicker hierarchy: seek bar at top, play/toggle row, hold buttons, jump buttons, collapsible settings at bottom
  2. Buttons span full width on mobile, comfortable width on desktop
  3. Settings panel collapses/expands via toggle button
  4. User can adjust slow-mo speed, scrub speed, and playback speed in settings panel
  5. User can trigger all main controls via keyboard shortcuts (play/pause, jumps, slow-mo toggle)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD during planning

### Phase 4: Testing & Validation
**Goal**: Bug-free, smooth experience validated across mobile and desktop devices
**Depends on**: Phase 3
**Requirements**: (validation of all v1 requirements)
**Success Criteria** (what must be TRUE):
  1. All controls work correctly on iPhone and Android mobile devices
  2. All controls work correctly on desktop with mouse and keyboard
  3. Hold-to-scrub performs smoothly without stutter on 4G/WiFi networks
  4. Settings persist across browser sessions via localStorage
  5. No visual glitches, layout breaks, or unresponsive buttons found during QA
**Plans**: TBD

Plans:
- [ ] 04-01: TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Touch-Native Foundation | 0/TBD | Not started | - |
| 2. Core Playback & Scrubbing | 0/TBD | Not started | - |
| 3. Film Clicker Layout | 0/TBD | Not started | - |
| 4. Testing & Validation | 0/TBD | Not started | - |
