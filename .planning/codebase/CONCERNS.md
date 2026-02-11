# Codebase Concerns

**Analysis Date:** 2026-02-11

## Tech Debt

**Silent YouTube API Load Failure:**
- Issue: `loadYouTubeAPI()` in `src/hooks/useYouTubePlayer.ts` rejects with `Promise.reject(new Error("SSR"))` on SSR but also fails silently when the YouTube script load fails. The `.catch()` handler (line 125) swallows the error entirely with an empty callback.
- Files: `src/hooks/useYouTubePlayer.ts` (lines 12-13, 125-127)
- Impact: Users will see "Loading player…" indefinitely if the YouTube API script fails to load (network timeout, CDN down). No error message displayed. Hard to debug.
- Fix approach: Store error state in component and display meaningful error message. Log to console in development. Consider retry mechanism with exponential backoff.

**Hardcoded Container ID Dependency:**
- Issue: `CONTAINER_ID` constant "yt-player-container" is defined in the hook (`src/hooks/useYouTubePlayer.ts` line 8) but must match the actual DOM element ID passed via `containerId` prop in `PlayerArea`. If they diverge, player won't mount silently.
- Files: `src/hooks/useYouTubePlayer.ts` (line 8), `src/components/PlayerArea.tsx` (lines 18-23)
- Impact: Brittle coupling. Refactoring `PlayerArea` or renaming the element could break player initialization without clear error.
- Fix approach: Remove the hardcoded ID, pass `containerId` into the hook as a parameter, or export the constant from a shared location like `src/lib/constants.ts`.

**No Duration Clamping in useScrubberControls:**
- Issue: `stepTime()` and `jumpTime()` are called without passing `duration` parameter in `useScrubberControls` (lines 39, 50, 62, 74). The functions default to simple `Math.max(0, next)` clamping, allowing seeks beyond video duration.
- Files: `src/hooks/useScrubberControls.ts` (lines 39, 50, 62, 74)
- Impact: Users can seek past the end of a video, creating a jarring UX where the player snaps back. Behavior may vary depending on YouTube player interpretation.
- Fix approach: Pass `controller.duration` to both `stepTime()` and `jumpTime()` calls. Update function signatures to require duration when available.

**localStorage Errors Silently Ignored:**
- Issue: `loadSettings()` and `saveSettings()` in `src/lib/settings.ts` catch all exceptions but provide no feedback or logging (lines 35-36, 44-45). If localStorage quota exceeded or browser denies access, settings persist but silently fail.
- Files: `src/lib/settings.ts` (lines 35-36, 44-45)
- Impact: User preferences may not persist. No warning to user. In private browsing mode on some browsers, this silently fails.
- Fix approach: Add debug logging. Consider storing an error state and notifying user if settings failed to persist. Test private browsing mode explicitly.

**Raw YouTube API Types in Type Definition:**
- Issue: `src/types/youtube.d.ts` directly mirrors YouTube IFrame API interfaces. If YouTube changes their API, no type safety or validation layer.
- Files: `src/types/youtube.d.ts` (entire file)
- Impact: YouTube API changes could break code undetected at runtime.
- Fix approach: Add validation layer or consider using official YouTube API types from DefinitelyTyped when available. Document API version constraint.

## Known Bugs

**Speed Selection Not Validated Before Setting:**
- Symptoms: If `controller.getAvailablePlaybackRates()` returns rates that don't include the saved speed (e.g., user on a video that only supports 1x when they saved 1.25x), `ControlBar` will silently correct it with `hasCorrectedSpeedRef` flag but the correction happens asynchronously.
- Files: `src/components/ControlBar.tsx` (lines 53-63)
- Trigger: Load a video, set speed to 1.5x, load a different video that only supports 1x playback.
- Workaround: Manually select valid speed from dropdown. Speed will auto-correct on next player ready.

**URL State Sync Race Condition:**
- Symptoms: If user rapidly changes video ID or URL params, the `hasSeekedFromUrlRef` flag in `ScrubberShell` may not reset correctly if the seek effect hasn't fired yet.
- Files: `src/components/ScrubberShell.tsx` (lines 57-68)
- Trigger: Paste URL, immediately paste different URL before first video loads. First video's seek time may apply to second video.
- Workaround: Wait for player to fully load before changing videos.

## Security Considerations

**No Content Security Policy:**
- Risk: YouTube IFrame API is loaded from `https://www.youtube.com/iframe_api` but there's no CSP header to restrict script sources. If domain is compromised or MITM occurs, arbitrary code executes.
- Files: `src/hooks/useYouTubePlayer.ts` (line 7), Next.js configuration
- Current mitigation: HTTPS only, trusted YouTube domain
- Recommendations: Add `Content-Security-Policy` header in `next.config.ts`. Require CSP with `script-src 'self' https://www.youtube.com`. Consider Subresource Integrity (SRI) if possible with YouTube's script.

**URL Parsing Not Validated for XSS:**
- Risk: While `extractVideoId()` uses strict regex matching (11-character alphanumeric + underscore/hyphen), the extracted ID is directly embedded in HTML `videoId` prop and URL params. No additional sanitization.
- Files: `src/lib/youtube.ts` (lines 15-34), `src/components/ScrubberShell.tsx` (line 36-37)
- Current mitigation: Regex validation is tight; IDs are validated before reaching YouTube API
- Recommendations: This is low-risk due to regex validation, but document the constraint. Add assertion that only valid IDs reach YouTube API.

**localStorage XSS in Settings:**
- Risk: Settings are stored as JSON string in localStorage. If any user input ends up in settings (future feature risk), could be vulnerable to stored XSS if settings are ever rendered as HTML.
- Files: `src/lib/settings.ts` (lines 43), `src/components/ScrubberShell.tsx`
- Current mitigation: Currently only numbers and enum strings stored; never rendered as HTML
- Recommendations: Document that settings object must only contain safe types. Never render settings values directly as HTML. Use `JSON.parse()` safely (current code is fine).

**No Rate Limiting on URL Updates:**
- Risk: `ScrubberShell` debounces URL updates (500ms), but an attacker could theoretically trigger many history API calls if they control the player state updates.
- Files: `src/components/ScrubberShell.tsx` (lines 70-87)
- Current mitigation: Only internal controls trigger updates; no user input directly causes history mutations
- Recommendations: This is low-risk in current architecture. If accepting external state, add rate limiting.

## Performance Bottlenecks

**Polling-Based Time Update:**
- Problem: `useYouTubePlayer` polls `getCurrentTime()` every 200ms (line 73) regardless of actual video changes. With multiple time-dependent effects, this creates unnecessary re-renders.
- Files: `src/hooks/useYouTubePlayer.ts` (lines 63-75)
- Cause: No listener API from YouTube IFrame for time updates; polling is necessary but frequency could be optimized
- Improvement path: Monitor actual re-render frequency. Reduce polling to 100ms if seeking frequently; increase to 500ms if just playing. Add `isPlaying` check to reduce polling when paused.

**ControlBar Slider Causes Continuous Re-renders:**
- Problem: Range input (seek slider) in `ControlBar` fires onChange on every pixel movement, calling `controller.seekTo()` continuously. Each seek triggers polling update + re-renders.
- Files: `src/components/ControlBar.tsx` (lines 79-91)
- Cause: Direct onChange binding without debounce
- Improvement path: Debounce slider changes (300-500ms) or use `onMouseUp` instead of `onChange`. Consider visual feedback during scrub vs. actual seek.

**URL Debounce Still Creates History Entries:**
- Problem: 500ms debounce is good, but `window.history.replaceState()` is called on every debounce completion. If user scrubs continuously, 2-3 history updates per second occur.
- Files: `src/components/ScrubberShell.tsx` (line 82)
- Cause: Debounce doesn't prevent the final call
- Improvement path: Add a secondary check—only update history if currentTime changed by >1 second. Reduces noise in browser history.

## Fragile Areas

**useKeyboardShortcuts Has No Dependency on Scrubber Functions:**
- Files: `src/hooks/useKeyboardShortcuts.ts` (lines 28-88)
- Why fragile: The hook accepts `scrubber` but doesn't include it in the dependency array. If scrubber methods change, the old closures persist. Adding `scrubber` to deps will cause the listener to re-attach on every render.
- Safe modification: Create a stable ref for scrubber methods or memoize the entire scrubber object in `ScrubberShell`.
- Test coverage: No unit tests for keyboard shortcut behavior. Race condition between key events and component state not tested.

**ScrubberShell Manages Multiple Concerns:**
- Files: `src/components/ScrubberShell.tsx` (entire component, 133 lines)
- Why fragile: Component orchestrates URL parsing, settings loading, video ID extraction, all three hooks, and deep linking state. 7 useEffect hooks = high complexity. Changes to any state logic ripple through multiple effects.
- Safe modification: Extract URL state management to custom hook (e.g., `useUrlState`). Extract settings lifecycle to separate hook. Keep ScrubberShell as pure orchestrator.
- Test coverage: Only integration-level testing possible; no unit tests for state transitions.

**YouTube API Ready State Is Not Shared Globally:**
- Files: `src/hooks/useYouTubePlayer.ts` (lines 10-30)
- Why fragile: `apiReadyPromise` is module-level singleton, but if window is undefined (SSR), it's recreated per call. Multiple instances could race.
- Safe modification: Wrap in try-catch. Consider context provider for YouTube API ready state if multiple components need to load videos in future.
- Test coverage: No unit tests for SSR edge case.

**Control Bar Conditional Props Are Optional But Used Unsafely:**
- Files: `src/components/ControlBar.tsx` (lines 42-49)
- Why fragile: Props like `onSpeedChange` are optional, but callbacks assume they exist before checking. Line 60 calls `onSpeedChange?.()` correctly, but line 67 does `onSpeedChange?.(rate)` which could be confusing if not always provided.
- Safe modification: Make callbacks required if used in render, or document when they're optional. Add type guard for each optional callback.
- Test coverage: No prop validation tests.

## Scaling Limits

**YouTube IFrame Quota:**
- Current capacity: One player instance loaded at a time per session
- Limit: YouTube API allows multiple players but has rate limits on rapid creation/destruction. Destroying and recreating player on every video change could trigger quota if ~10+ videos loaded rapidly.
- Scaling path: Implement player pool/reuse pattern. Delay destruction with debounce (500-1000ms) before destroying old player. Monitor 429 responses from YouTube API.

**localStorage Size Limit:**
- Current capacity: Settings object ~50 bytes
- Limit: Most browsers allow 5-10MB per domain. Current usage is negligible, but future features (history of videos, bookmarks) could exceed limits.
- Scaling path: Implement storage quota checking. Consider IndexedDB for larger data. Add cleanup of old data.

## Dependencies at Risk

**Next.js 16.1.6 (Current):**
- Risk: Relatively new major version. TypeScript 5 + React 19 are cutting-edge. Breaking changes possible in point releases.
- Impact: Future npm updates could introduce build errors or API changes.
- Migration plan: Pin devDependencies more strictly if stability is priority. Monitor Next.js changelog. Upgrade React 19 carefully (new hooks/behavior).

**React 19 RC/Early Features:**
- Risk: React 19.2 may have edge cases with hooks (useCallback, useEffect deps). Suspense and transitions not fully adopted here.
- Impact: Potential memory leaks or stale closures if hooks misused.
- Migration plan: Test thoroughly with React DevTools Profiler. Document hook dependencies explicitly.

**YouTube IFrame API (External Dependency):**
- Risk: No versioning. If YouTube changes API signature, code breaks. No fallback if API unavailable.
- Impact: Critical feature failure if YouTube changes API or API endpoint goes down.
- Migration plan: Implement fallback (e.g., link to YouTube directly). Monitor YouTube API status. Consider wrapper abstraction to ease API swaps.

## Missing Critical Features

**No Offline Support:**
- Problem: App requires YouTube API and YouTube videos. No service worker or caching. Offline = non-functional.
- Blocks: Offline usage, airplane mode testing
- Impact: Limited use case but worth documenting.

**No Error Boundary:**
- Problem: If any component throws, entire app crashes with white screen. No fallback UI.
- Blocks: Graceful degradation, better UX on edge cases
- Impact: User sees blank page instead of helpful error message.

**No Accessibility Testing:**
- Problem: Components have ARIA labels but no automated a11y tests (axe, WAVE). Keyboard navigation not tested.
- Blocks: Ensuring WCAG 2.1 AA compliance
- Impact: Keyboard-only users may encounter issues.

## Test Coverage Gaps

**No Tests for useYouTubePlayer Hook:**
- What's not tested: API loading, player initialization, state polling, error handling on script load failure, destroy cleanup, SSR guard
- Files: `src/hooks/useYouTubePlayer.ts`
- Risk: Silent failures if YouTube API mocking breaks. Race conditions on cleanup not caught.
- Priority: High - core player functionality

**No Tests for ScrubberShell Component:**
- What's not tested: URL state sync, settings loading, effects coordination, keyboard shortcuts integration, video ID extraction flow
- Files: `src/components/ScrubberShell.tsx`
- Risk: State management bugs (race conditions, stale refs) undetected. Refactoring breaks hidden dependencies.
- Priority: High - orchestrator of entire app

**No Tests for useScrubberControls Hook:**
- What's not tested: Hold intervals, step boundaries, hold resumption of playback, cleanup on unmount
- Files: `src/hooks/useScrubberControls.ts`
- Risk: Hold-to-scrub feature could leak intervals or fail to resume playback on release.
- Priority: Medium - important UX feature

**No Tests for useKeyboardShortcuts Hook:**
- What's not tested: Event listener attachment/cleanup, typing target detection, simultaneous key presses, key release scenarios
- Files: `src/hooks/useKeyboardShortcuts.ts`
- Risk: Keyboard shortcuts may not unbind, causing stale event listeners. Typing in input field may be intercepted.
- Priority: Medium - common UX feature

**No Tests for ControlBar Component:**
- What's not tested: Speed correction on mount, conditional rendering, range slider interaction, button click handlers
- Files: `src/components/ControlBar.tsx`
- Risk: Speed handling bug (existing bug log above) not caught. Slider behavior changes undetected.
- Priority: Medium - critical UI component

**No Integration Tests:**
- What's not tested: Loading a YouTube URL → player initializing → controls working → URL deep linking
- Files: Multiple files
- Risk: End-to-end flows break undetected. SSR issues not caught.
- Priority: High - critical user paths

**No E2E Tests:**
- What's not tested: Real browser scenarios (different videos, network failures, slow loading)
- Framework: Not used
- Risk: Production issues only discovered by users.
- Priority: Low (nice to have after unit/integration coverage)

---

*Concerns audit: 2026-02-11*
