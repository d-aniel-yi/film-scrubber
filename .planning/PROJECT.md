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
- ✓ Touch-native button foundation (44px targets, no text selection, no zoom, press feedback) — v1.0
- ✓ Hold button active state while held — v1.0
- ✓ Slow-mo / realtime toggle (configurable speed, amber state) — v1.0
- ✓ RAF-based hold-to-scrub (slow + fast, dual-speed, configurable) — v1.0
- ✓ Fixed-second jump buttons (1s, 5s, 10s) — v1.0
- ✓ Film clicker stacked row layout with collapsible settings — v1.0
- ✓ Keyboard shortcuts: Space, JKL, S, Arrow+modifiers — v1.0

### Active

(None — v1.0 shipped. See `/gsd:new-milestone` for next milestone.)

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
| Replace frame-step presets with fixed second jumps | Seconds are more intuitive for film review than abstract step sizes | ✓ Good — shipped v1.0 |
| Single layout for mobile and desktop | Simpler to maintain, film clicker layout works at all sizes | ✓ Good — shipped v1.0 |
| Slow-mo toggle instead of speed dropdown | Faster to switch between realtime and slow-mo during review | ✓ Good — shipped v1.0 |
| Configurable forward/rewind speed multiplier | Different film review tasks need different scrub speeds | ✓ Good — dual-speed (slow+fast) shipped v1.0 |
| RAF time-based scrubbing over setInterval | YouTube API variable latency causes stutter with setInterval | ✓ Good — smooth scrubbing confirmed |
| Dual-speed hold scrubbing (slow + fast buttons) | User preferred separate buttons over single configurable speed | ✓ Good — shipped v1.0 |
| YouTube IFrame API scrubbing limitation accepted | API bounds mobile scrub smoothness — no workaround available | — Accepted limitation |

## Current State (v1.0 Shipped)

- **Shipped:** 2026-03-12
- **Stack:** Next.js 16 / React 19 / Tailwind 4 / TypeScript / YouTube IFrame API
- **Key files:** `src/components/ControlBar.tsx`, `src/components/ScrubberShell.tsx`, `src/hooks/useScrubberControls.ts`
- **Known limitations:** Mobile scrubbing smoothness bounded by YouTube IFrame API
- **Tech debt:** Phase 4 (Testing & Validation) skipped — no cross-device QA performed

---
*Last updated: 2026-03-12 after v1.0 milestone*
