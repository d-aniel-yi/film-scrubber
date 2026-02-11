# Film Scrubber

## What This Is

A YouTube video scrubber built for reviewing football film. It gives frame-level and second-level control over YouTube videos — step, jump, hold-to-scrub, slow-mo — in a layout inspired by a football film clicker. Built as a Next.js app with Tailwind CSS and the YouTube IFrame API.

## Core Value

The controls must feel like a dedicated film room clicker — native-feeling buttons with instant response, not a web page with tappable text.

## Requirements

### Validated

- ✓ YouTube video loading via URL paste — existing
- ✓ Seek bar for scrubbing to any position — existing
- ✓ Play/pause toggle — existing
- ✓ Hold-to-scrub (rewind and forward) — existing
- ✓ Settings persistence via localStorage — existing
- ✓ Deep linking via URL params — existing
- ✓ Keyboard shortcuts for desktop — existing

### Active

- [ ] Redesign control layout to film clicker style (seek bar → play/toggle → hold rewind/forward → jump buttons → collapsible settings)
- [ ] Slow-mo / realtime toggle that switches between normal speed and configurable slow-mo speed
- [ ] Hold-to-scrub rewind and forward buttons with default 2x speed multiplier
- [ ] Fixed second-based jump buttons: -1/+1, -5/+5, -10/+10
- [ ] Collapsible settings panel with slo-mo speed, forward speed, and playback speed
- [ ] Buttons that behave like native app buttons: no text selection, proper tap feedback, no zoom on double-tap
- [ ] Visual feedback on hold buttons when active (pressed state)
- [ ] Smoother, more consistent hold-to-scrub in both directions (reduce stutter from current setInterval + seekTo approach)
- [ ] Updated keyboard shortcuts to match new control scheme
- [ ] Unified layout for both mobile and desktop

### Out of Scope

- Multiple video player backends (Vimeo, etc.) — YouTube only for now
- User accounts or authentication — local-only tool
- Video upload or hosting — YouTube URLs only
- Playlist or multi-video support — single video at a time
- Frame-level step presets (fine/medium/coarse) — replaced by second-based jumps

## Context

- Existing Next.js 16 + React 19 + Tailwind 4 codebase
- YouTube IFrame API for playback control
- Current hold-to-scrub uses `setInterval` with `seekTo` calls, which causes stuttery scrubbing because YouTube's seek isn't frame-accurate at high rates
- Current buttons use thin borders and small text (`text-xs`, `px-1.5 py-1`) — hard to tap on mobile
- Text still selectable on buttons on mobile, breaking the "app" feel
- No visual state change when hold buttons are active
- Keyboard shortcuts exist but need remapping to match new controls
- State management is centralized in ScrubberShell via useState hooks

## Constraints

- **Tech stack**: Next.js 16 / React 19 / Tailwind 4 / TypeScript — existing stack, no new dependencies needed
- **Player API**: YouTube IFrame API limits seek precision — scrubbing smoothness bounded by API responsiveness
- **Platform**: Must work well on both mobile (touch) and desktop (mouse + keyboard)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Replace frame-step presets with fixed second jumps | Seconds are more intuitive for film review than abstract step sizes | — Pending |
| Single layout for mobile and desktop | Simpler to maintain, film clicker layout works at all sizes | — Pending |
| Slow-mo toggle instead of speed dropdown | Faster to switch between realtime and slow-mo during review | — Pending |
| Configurable forward/rewind speed multiplier | Different film review tasks need different scrub speeds | — Pending |

---
*Last updated: 2026-02-11 after initialization*
