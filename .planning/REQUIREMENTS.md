# Requirements: Film Scrubber

**Defined:** 2026-02-11
**Core Value:** Controls must feel like a dedicated film room clicker — native-feeling buttons with instant response

## v1 Requirements

### Layout

- [ ] **LAYOUT-01**: Control bar uses stacked row layout: seek bar → play/toggle row → hold buttons row → jump buttons row → settings toggle
- [ ] **LAYOUT-02**: Buttons span full width on mobile screens
- [ ] **LAYOUT-03**: Settings panel collapses/expands via toggle button
- [ ] **LAYOUT-04**: Settings panel contains slo-mo speed, forward/rewind scrub speed, and playback speed controls

### Touch Behavior

- [ ] **TOUCH-01**: All buttons have minimum 44px tap targets
- [ ] **TOUCH-02**: Buttons prevent text selection (`user-select: none`, `-webkit-touch-callout: none`)
- [ ] **TOUCH-03**: Buttons prevent double-tap zoom (`touch-action: manipulation`)
- [ ] **TOUCH-04**: Buttons show visual press feedback (scale and/or color change on active/pressed state)
- [ ] **TOUCH-05**: Hold buttons show distinct visual state while being held (e.g. color change, glow, or pressed-in appearance)

### Playback Controls

- [ ] **PLAY-01**: Play/pause toggle button
- [ ] **PLAY-02**: Slow-mo / realtime toggle that switches between normal speed (1x) and configurable slow-mo speed
- [ ] **PLAY-03**: Seek bar for scrubbing to any position in the video

### Scrubbing

- [ ] **SCRUB-01**: Hold-to-rewind button that scrubs backward while held
- [ ] **SCRUB-02**: Hold-to-forward button that scrubs forward while held
- [ ] **SCRUB-03**: Hold-to-scrub uses smoother timing (RAF-based or throttled) instead of raw setInterval
- [ ] **SCRUB-04**: Scrub speed is configurable with default 2x multiplier
- [ ] **SCRUB-05**: Scrubbing is consistent in both forward and reverse directions

### Jump Buttons

- [ ] **JUMP-01**: -1s / +1s jump buttons
- [ ] **JUMP-02**: -5s / +5s jump buttons
- [ ] **JUMP-03**: -10s / +10s jump buttons

### Keyboard Shortcuts

- [ ] **KEY-01**: Keyboard shortcuts updated to match new control scheme (play/pause, jumps, slow-mo toggle)

## v2 Requirements

### Polish

- **POLISH-01**: Hold delay (300ms) to distinguish tap from hold on rewind/forward buttons
- **POLISH-02**: Haptic feedback on supported devices
- **POLISH-03**: Seek bar shows thumbnail preview on hover/drag

### Advanced

- **ADV-01**: Configurable jump amounts (change 1/5/10 defaults)
- **ADV-02**: Gesture support (swipe to scrub)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multiple player backends (Vimeo, etc.) | YouTube only for now |
| User accounts / authentication | Local-only tool |
| Video upload or hosting | YouTube URLs only |
| Playlist / multi-video | Single video at a time |
| Frame-level step presets (fine/medium/coarse) | Replaced by second-based jumps |
| Real-time collaboration | Solo film review tool |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOUCH-01 | Phase 1 | Complete |
| TOUCH-02 | Phase 1 | Complete |
| TOUCH-03 | Phase 1 | Complete |
| TOUCH-04 | Phase 1 | Complete |
| TOUCH-05 | Phase 1 | Complete |
| PLAY-01 | Phase 2 | Pending |
| PLAY-02 | Phase 2 | Pending |
| PLAY-03 | Phase 2 | Pending |
| SCRUB-01 | Phase 2 | Pending |
| SCRUB-02 | Phase 2 | Pending |
| SCRUB-03 | Phase 2 | Pending |
| SCRUB-04 | Phase 2 | Pending |
| SCRUB-05 | Phase 2 | Pending |
| JUMP-01 | Phase 2 | Pending |
| JUMP-02 | Phase 2 | Pending |
| JUMP-03 | Phase 2 | Pending |
| LAYOUT-01 | Phase 3 | Pending |
| LAYOUT-02 | Phase 3 | Pending |
| LAYOUT-03 | Phase 3 | Pending |
| LAYOUT-04 | Phase 3 | Pending |
| KEY-01 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-02-11*
*Last updated: 2026-02-11 after roadmap creation*
