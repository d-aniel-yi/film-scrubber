---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Local File Player

## Objective
Implement local video file support using the standard HTML5 `<video>` element, wrapped in a `PlayerController` interface to work seamlessly with the existing `ControlBar` and `useScrubberControls`.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- src/types/player.ts
- src/hooks/useYouTubePlayer.ts (reference for polling implementation)
- src/components/ScrubberShell.tsx

## Tasks

<task type="auto">
  <name>Implement useLocalPlayer Hook</name>
  <files>src/hooks/useLocalPlayer.ts</files>
  <action>
    - Create `useLocalPlayer(src: string | null)` hook.
    - It should accept a video source URL (blob URL).
    - It should return:
        - `controller`: `PlayerController` implementation.
        - `videoRef`: RefObject<HTMLVideoElement>.
    - Implementation details:
        - Use a `ref` for the `<video>` element.
        - Implement methods: `play`, `pause`, `seekTo`, `setPlaybackRate`, `setVolume`, `getAvailablePlaybackRates` (return standard list).
        - State management: `currentTime` (use `requestAnimationFrame` loop or fast polling when playing), `duration`, `isPlaying`, `volume`.
        - Handle standard video events (`loadedmetadata`, `ended`, `play`, `pause`, `timeupdate`).
  </action>
  <verify>
    npm run type-check
  </verify>
  <done>
    Hook is implemented and type-safe.
  </done>
</task>

<task type="auto">
  <name>Create LocalPlayer Component</name>
  <files>src/components/LocalPlayer.tsx</files>
  <action>
    - Create component `LocalPlayer`.
    - Props:
        - `videoRef`: RefObject<HTMLVideoElement>
        - `src`: string | null
        - `onFileSelect`: (file: File) => void
    - UI:
        - If `!src`: Render a file picker (drag & drop zone + standard input).
        - If `src`: Render `<video ref={videoRef} src={src} className="w-full h-full" onClick={togglePlay} />`
    - Styling: Match `PlayerArea` aspect ratio and styling.
  </action>
  <verify>
    npm run build
  </verify>
  <done>
    Component compiles.
  </done>
</task>

<task type="auto">
  <name>Integrate Local Player into Shell</name>
  <files>src/components/ScrubberShell.tsx</files>
  <action>
    - Add state `localVideoSrc`: string | null.
    - Call `useLocalPlayer(localVideoSrc)`.
    - Update the "Experimental" toggle section:
        - Replace `LocalPlayerPlaceholder` with `LocalPlayer`.
        - Pass `videoRef` and `localVideoSrc` to `LocalPlayer`.
        - Pass `handleFileSelect` which creates object URL and sets state.
    - Update `controlBar` logic to use `localPlayer.controller` when in "local" mode.
    - Ensure keyboard shortcuts work (they rely on `scrubber` which relies on `controller`, so just passing the right controller should work).
  </action>
  <verify>
    npm run type-check
  </verify>
  <done>
    Project compiles.
  </done>
</task>

## Success Criteria
- [ ] User can click "Switch to local player".
- [ ] User can pick a video file (MP4/MOV).
- [ ] Video loads and plays.
- [ ] Control bar controls (Play, Pause, Scrub) work on the local video.
- [ ] Keyboard shortcuts work on the local video.
