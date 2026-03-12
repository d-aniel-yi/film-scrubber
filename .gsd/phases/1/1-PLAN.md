---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Player Abstraction & Experimental Toggle

## Objective
Establish a multi-player architecture with a `PlayerController` interface and add an experimental UI toggle. This allows users to switch between the stable YouTube player and a placeholder for the upcoming Local Player, ensuring the current experience remains untouched by default.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- src/types/player.ts
- src/hooks/useYouTubePlayer.ts
- src/hooks/useScrubberControls.ts

## Tasks

<task type="auto">
  <name>Extract Core Interface</name>
  <files>src/types/player.ts</files>
  <action>
    - Define `PlayerController` interface (play, pause, seek, etc.).
    - Refactor `YouTubePlayerController` to implement it.
    - Add `PlayerMode` type ('youtube' | 'local').
  </action>
  <verify>
    grep "interface PlayerController" src/types/player.ts
  </verify>
  <done>
    Interface defined and implemented by YouTube controller.
  </done>
</task>

<task type="auto">
  <name>Refactor Hooks for Polymorphism</name>
  <files>
    src/hooks/useYouTubePlayer.ts
    src/hooks/useScrubberControls.ts
    src/components/ScrubberShell.tsx
    src/components/ControlBar.tsx
  </files>
  <action>
    - Update `useYouTubePlayer` to return `PlayerController`.
    - Update `useScrubberControls` to accept generic `PlayerController`.
    - Update components to use the generic type.
  </action>
  <verify>
    npm run type-check
  </verify>
  <done>
    Project compiles. Generic logic in place.
  </done>
</task>

<task type="auto">
  <name>Add Experimental UI Toggle</name>
  <files>
    src/components/ScrubberShell.tsx
    src/components/LocalPlayerPlaceholder.tsx
  </files>
  <action>
    - Create `src/components/LocalPlayerPlaceholder.tsx` (simple "Coming Soon" div).
    - In `ScrubberShell`, add state `mode: PlayerMode` (default 'youtube').
    - Add a button "Switch to local player - EXPERIMENTAL" (e.g., in header or settings).
    - When clicked, toggle `mode`.
    - Conditionally render `PlayerArea` (if youtube) or `LocalPlayerPlaceholder` (if local).
    - Ensure `useScrubberControls` receives `null` or a dummy controller when in local mode (until Phase 2).
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    Button exists. Clicking it toggles between YouTube player and placeholder.
  </done>
</task>

## Success Criteria
- [ ] `PlayerController` interface defined.
- [ ] Hooks refactored to use interface.
- [ ] "Switch to local player - EXPERIMENTAL" button acts as a toggle.
- [ ] YouTube player works exactly as before in default mode.
