# Architecture

**Analysis Date:** 2026-02-11

## Pattern Overview

**Overall:** Client-side React Single Page Application (SPA) with hooks-based state management.

**Key Characteristics:**
- Next.js 16 framework with App Router (server/client components)
- Client-side player abstraction over YouTube IFrame API
- Composable hooks for business logic separation
- Pure utility functions for testable calculations
- State lifted to shell component with localStorage persistence
- URL search params for deep linking and state sharing

## Layers

**Presentation Layer (Components):**
- Purpose: Render UI and handle user interactions; pure presentation logic only
- Location: `src/components/`
- Contains: React components that accept data and callbacks as props
- Depends on: Hooks, utilities, types
- Used by: Next.js App Router pages
- Examples: `ControlBar.tsx`, `PlayerArea.tsx`, `UrlInput.tsx`, `HelpPanel.tsx`

**State & Orchestration Layer (Shell):**
- Purpose: Manage application state, coordinate hooks, synchronize settings with storage and URL
- Location: `src/components/ScrubberShell.tsx`
- Contains: Single root client component managing all app state
- Depends on: All hooks (`useYouTubePlayer`, `useScrubberControls`, `useKeyboardShortcuts`), utilities (`youtube.ts`, `settings.ts`, `urlState.ts`, `constants.ts`)
- Used by: Next.js Home page
- Responsibilities: Initialize settings from localStorage/URL, manage videoId state, synchronize controls with URL search params on debounced timer, coordinate player readiness with scrubber/keyboard hooks

**Hook Layer (Business Logic):**
- Purpose: Encapsulate reusable client-side logic and side effects
- Location: `src/hooks/`
- Contains: Custom React hooks that manage specific concerns
- Depends on: Types, utilities, YouTube API
- Used by: Shell component and other hooks

**Utility Layer (Pure Functions):**
- Purpose: Stateless calculations and transformations; no React dependencies
- Location: `src/lib/`
- Contains: Pure functions, parsing logic, storage interface, constants
- Depends on: Types only
- Used by: Hooks, components, tests

**Type Definitions:**
- Purpose: Single source of truth for application types
- Location: `src/types/`
- Contains: TypeScript interfaces for player control, settings, URL state, YouTube API shapes
- Depends on: Nothing (foundational)
- Used by: All layers

**Entry Point (Server):**
- Purpose: Layout metadata and server-side setup
- Location: `src/app/layout.tsx`, `src/app/page.tsx`
- Contains: Root layout with fonts and metadata, home page that renders ScrubberShell
- Depends on: ScrubberShell component
- Used by: Next.js router

## Data Flow

**Video Loading:**

1. User pastes YouTube URL in `UrlInput`
2. `ScrubberShell` calls `extractVideoId()` from `src/lib/youtube.ts`
3. Valid video ID updates `videoId` state
4. `useYouTubePlayer(videoId)` hook loads YouTube IFrame API script (cached globally)
5. New `YT.Player` instance created in `PlayerArea` container
6. Player `onReady` callback sets `ready` state in hook
7. Controller object with seek/play/pause methods returned to shell
8. `ControlBar` enabled when controller is ready

**Playback Control:**

1. User clicks step/jump buttons or presses keyboard shortcut
2. `useScrubberControls` hook handler executes (e.g., `stepForward()`)
3. Handler calls pure function `stepTime()` to calculate new position
4. Controller calls YouTube player `seekTo(newTime)`
5. Polling loop in `useYouTubePlayer` (200ms interval) reads new `currentTime`
6. `ControlBar` slider and time display update via bound state
7. URL search params debounced-updated via `buildSearchParams()` in shell

**Settings Persistence:**

1. Speed, stepPreset, or holdTickRateMs changed by user
2. State updated in `ScrubberShell`
3. `useEffect` dependency on settings state triggers `saveSettings()` to localStorage
4. On app load, `loadSettings()` retrieves persisted values
5. URL params override localStorage for deep linking

**Deep Linking:**

1. Shell monitors `videoId`, `controller.currentTime`, `speed`, `stepPreset`, `holdTickRateMs`
2. Debounced effect (500ms) calls `buildSearchParams()` to construct URL query string
3. `window.history.replaceState()` updates URL without navigation
4. User shares URL → on load, `parseUrlState()` extracts params
5. `applyUrlStateToSettings()` converts params to state shape
6. State initialized from both localStorage and URL (URL takes precedence)

**State Management:**

- Centralized in `ScrubberShell` component using `useState`
- Hooks are stateless containers for side effects (YouTube API, polling, keyboard)
- Player state (ready, loading, currentTime, duration, isPlaying) held in `useYouTubePlayer` hook and exposed via controller interface
- No external state library (Redux, Zustand, etc.)
- localStorage API wrapper in `src/lib/settings.ts` for persistence

## Key Abstractions

**YouTubePlayerController:**
- Purpose: Abstract over YouTube IFrame API; only interface exposed to rest of app
- Examples: `src/hooks/useYouTubePlayer.ts` creates controller, `src/types/player.ts` defines interface
- Pattern: Adapter pattern; hides raw YouTube API behind typed interface
- Methods: play(), pause(), seekTo(), setPlaybackRate(), getAvailablePlaybackRates(), etc.
- Properties: ready (boolean), currentTime (number), duration (number), isPlaying (boolean), loading (boolean)
- Benefit: Player can be swapped (e.g., to Vimeo) without changing UI or business logic

**ScrubberControls Object:**
- Purpose: Encapsulate all scrubbing/stepping operations with state
- Returned by: `useScrubberControls()` hook
- Methods: stepBack(), stepForward(), jumpBack(seconds), jumpForward(seconds), startHoldRewind(), startHoldForward(), stopHold()
- Properties: stepSize (derived from preset), jumpAmounts (array of fixed jump intervals)
- State: Internal interval ref for hold-to-scrub, wasPlayingRef for resume logic

**Settings & URL State:**
- Purpose: Share scrubber configuration (speed, step size, hold tick rate) across storage boundaries
- Types: `ScrubberSettings` (localStorage shape), `ScrubberUrlState` (URL param shape)
- Location: `src/types/player.ts`
- Conversion functions: `applyUrlStateToSettings()`, `buildSearchParams()`

**STEP_PRESETS Constant:**
- Purpose: Single source of truth for step size values across UI and logic
- Location: `src/lib/constants.ts`
- Shape: `{ fine: 0.033, medium: 0.05, coarse: 0.1 }`
- Used by: ControlBar select dropdown, useScrubberControls calculations, URL state mapping

## Entry Points

**Browser Entry (Page Load):**
- Location: `src/app/page.tsx`
- Triggers: User navigates to app URL
- Responsibilities: Renders Home component with ScrubberShell
- Default export: Named export `Home` (Next.js convention)

**ScrubberShell (App Root):**
- Location: `src/components/ScrubberShell.tsx`
- Triggers: Mounted when Home page renders (client-side)
- Marked: `"use client"` directive
- Responsibilities:
  - Load settings from localStorage and URL search params
  - Initialize state for videoId, speed, stepPreset, holdTickRateMs
  - Coordinate all hooks (useYouTubePlayer, useScrubberControls, useKeyboardShortcuts)
  - Update URL search params on debounced state changes
  - Handle seek from URL on player ready
  - Manage error messages for URL parsing

**YouTube IFrame API Load:**
- Location: `src/hooks/useYouTubePlayer.ts`, function `loadYouTubeAPI()`
- Triggers: First time `useYouTubePlayer` hook called with non-null videoId
- Mechanism: Global promise caches result; prevents multiple script loads
- Callback: `window.onYouTubeIframeAPIReady` set before script appended
- Result: `window.YT.Player` becomes available globally

## Error Handling

**Strategy:** Graceful degradation with user-facing error messages; minimal error recovery.

**Patterns:**

1. **URL Parsing Errors:**
   - `extractVideoId()` returns null for invalid URLs
   - Shell displays error message: "Couldn't parse that URL. Try a standard YouTube watch link."
   - User can retry with different URL

2. **YouTube API Load Failure:**
   - `loadYouTubeAPI()` promise rejects on script load error
   - Hook catches error, sets `loading = false`, controller remains `ready = false`
   - UI shows "Loading player…" message indefinitely
   - No retry mechanism

3. **localStorage Errors:**
   - `loadSettings()` and `saveSettings()` wrapped in try-catch
   - Failures silently ignored; app defaults to initial settings
   - No error feedback to user

4. **Player State Desync:**
   - Polling loop (200ms) in `useYouTubePlayer` continuously reads player state
   - If player destroyed externally, next poll returns undefined → gracefully handled
   - URL state initialization prevents double-seek via `hasSeekedFromUrlRef` guard

## Cross-Cutting Concerns

**Logging:** None. No logging framework. Console available in browser dev tools.

**Validation:**
- YouTube video IDs: Regex pattern in `extractVideoId()` validates 11-char alphanumeric format
- Step presets: `isValidStepPreset()` type guard in `settings.ts`
- Numeric ranges: Settings clamped in `loadSettings()` (holdTickRateMs bounded to min/max)
- URL params: `Number.isFinite()` checks in `buildSearchParams()` and `applyUrlStateToSettings()`

**Authentication:** None required. YouTube IFrame API is public (videos must have embedded playback enabled).

**Performance:**
- YouTube API script cached globally across component remounts
- Player polling 5x per second (200ms) to balance responsiveness with resource usage
- URL search param updates debounced 500ms to avoid excessive history writes
- Interval-based hold-to-scrub (configurable 40-150ms) to handle rapid scrubbing

---

*Architecture analysis: 2026-02-11*
