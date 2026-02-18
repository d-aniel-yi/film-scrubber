---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Player Abstraction

## Objective
Refactor the codebase to use a generic `PlayerController` interface instead of the YouTube-specific one. This checks the box for "Core Abstraction" in the roadmap and prepares the ground for the Local Player.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- src/types/player.ts
- src/hooks/useYouTubePlayer.ts
- src/hooks/useScrubberControls.ts

## Tasks

<task type="auto">
  <name>Generalize Player Interface</name>
  <files>src/types/player.ts</files>
  <action>
    - Rename `YouTubePlayerController` to `PlayerController`.
    - Review methods for universality. `getAvailablePlaybackRates` and `getPlayerState` (fetching raw YT constants) might need adaptation, but for now, we can keep the interface broad and expect the Local Player to provide shims (e.g., returning standard states or a fixed list of rates).
    - Ensure comments reflect the generic nature.
  </action>
  <verify>
    grep "interface PlayerController" src/types/player.ts
  </verify>
  <done>
    Interface is named `PlayerController` and exported.
  </done>
</task>

<task type="auto">
  <name>Update Hooks to use PlayerController</name>
  <files>
    src/hooks/useYouTubePlayer.ts
    src/hooks/useScrubberControls.ts
    src/components/ScrubberShell.tsx
    src/components/ControlBar.tsx
  </files>
  <action>
    - Update `useYouTubePlayer` to return `PlayerController`.
    - Update `useScrubberControls` to accept `PlayerController`.
    - Update `ScrubberShell` and `ControlBar` to use `PlayerController` type.
    - Fix any type errors resulting from the rename.
  </action>
  <verify>
    npm run type-check
  </verify>
  <done>
    Project compiles without type errors.
  </done>
</task>

## Success Criteria
- [ ] `YouTubePlayerController` is renamed to `PlayerController`.
- [ ] `npm run build` passes.
- [ ] Application still works with YouTube video (regression testing).
