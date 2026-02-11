# Film Clicker Video Scrubber — Features Analysis

**Research Type:** Features dimension for redesigning a YouTube scrubber to feel like a football film clicker
**Context:** Subsequent phase — moving from generic video controls to dedicated film review UX
**Updated:** 2026-02-11

---

## Executive Summary

Film clicker apps (like those used in college and pro football programs) and professional video review tools (Hudl, Dartfish, Synergy) share a common DNA: **they prioritize precision scrubbing, rapid direction changes, and tactile feedback over full-featured media playback**.

The redesign must distinguish between:
- **Table stakes:** Features users expect or the app feels broken/incomplete
- **Differentiators:** What makes this tool feel like a dedicated clicker, not a generic video player
- **Anti-features:** Things to deliberately NOT build (scope boundaries)

---

## 1. TABLE STAKES

These are non-negotiable. Without them, users abandon the app or it doesn't feel like a video review tool.

### 1.1 Core Playback
- **Play/pause toggle** — Simple, reliable state management
  - *Complexity:* Low
  - *Dependencies:* YouTube IFrame API
  - *Why:* Baseline expectation; stop/start motion analysis

- **Seek bar (visual progress indicator)** — Shows position in video
  - *Complexity:* Low
  - *Dependencies:* Player ready state
  - *Why:* Orientation; don't lose your place in 2-hour film sessions

- **Current time display** — Precise time readout (mm:ss.sss or mm:ss)
  - *Complexity:* Low (formatting only)
  - *Dependencies:* Player hook
  - *Why:* Timestamping and communication ("Watch contact at 1:23.45")

- **Playback speed control** — Switch between normal, slow-mo, and fast speeds (0.25x–2x typical)
  - *Complexity:* Low
  - *Dependencies:* YouTube IFrame API `setPlaybackRate`
  - *Why:* Slow-motion is the gold standard for film review; coaches expect it

### 1.2 Touch-Friendly Controls
- **Large, tappable buttons** — Minimum 44px × 44px (iOS HIG) or 48px × 48px (Material Design)
  - *Complexity:* Medium (CSS + layout planning)
  - *Dependencies:* Tailwind CSS, responsive design
  - *Why:* Without this, mobile is unusable; users switch to native apps or YouTube itself

- **No text selection on buttons** — Disable user-select and cursor behavior
  - *Complexity:* Low (CSS property)
  - *Dependencies:* Tailwind, `:select-none` class
  - *Why:* Feels cheap; users expect "app-like" responsiveness

- **Visual active/pressed state** — Clear feedback when button is touched/held
  - *Complexity:* Low (active: state or onPointerDown styling)
  - *Dependencies:* Tailwind active: modifier or custom state
  - *Why:* Mobile UX expects immediate tactile feedback; without it, users tap repeatedly

- **No double-tap zoom on mobile** — Disable browser magnification on repeated taps
  - *Complexity:* Low (viewport meta + touch-action CSS)
  - *Dependencies:* HTML meta tag, CSS
  - *Why:* Prevents unexpected zoom while scrubbing; feels amateur otherwise

### 1.3 Scrubbing Precision
- **Step controls** — Move frame-by-frame (or time-step equivalent) backward/forward
  - *Complexity:* Medium (time logic + pause-before-step behavior)
  - *Dependencies:* Player hook, constants.ts for step size
  - *Why:* Core film review feature; identify exact contact points, release angles

- **Jump buttons** — Fixed-time jumps (±1s, ±5s, ±10s are industry standard)
  - *Complexity:* Low (simple math, constants)
  - *Dependencies:* Player controller, constants
  - *Why:* Fast navigation between plays; standard across Hudl, Synergy, DVDs

- **Hold-to-scrub in both directions** — Press and hold rewind/forward for continuous scrubbing
  - *Complexity:* Medium (pointer events, interval management, cleanup)
  - *Dependencies:* useCallback, useRef, pointer event handlers
  - *Why:* Defines "film clicker" UX; coaches expect this muscle memory from film rooms

- **Configurable hold speed** — Adjust how fast hold-to-scrub moves through video
  - *Complexity:* Medium (settings persistence, state management)
  - *Dependencies:* localStorage, constants, settings UI
  - *Why:* Different analysis tasks need different scrub speeds; personalization builds trust

### 1.4 Settings Persistence
- **Remember playback speed** — Restore last-used speed on reload
  - *Complexity:* Low (localStorage key-value)
  - *Dependencies:* useEffect, localStorage
  - *Why:* Quality-of-life; users get annoyed if they reset speed every session

- **Remember step/hold configuration** — Restore step preset and hold tick rate
  - *Complexity:* Low (localStorage)
  - *Dependencies:* useEffect, localStorage
  - *Why:* Habit formation; familiar settings on return

---

## 2. DIFFERENTIATORS

These are what make this tool feel like a **dedicated film clicker** rather than "yet another video player UI."

### 2.1 Film-Clicker Control Layout
- **Vertical layout hierarchy:** Seek bar → play/toggle → hold buttons → jump buttons → settings
  - *Complexity:* High (layout design, responsive breakpoints, mobile-first)
  - *Dependencies:* Tailwind grid/flex, component structure
  - *Why:* Film clicker layouts follow an ergonomic order: coarse → fine → settings. This isn't random; it matches how coaches use dedicated clicker hardware

- **Unified mobile + desktop layout** — Single layout that adapts size, not a completely different mobile UI
  - *Complexity:* High (design discipline + testing)
  - *Dependencies:* Tailwind responsive utilities, touch vs. pointer events
  - *Why:* Consistency; switching from phone to iPad shouldn't break muscle memory

- **Prominent hold buttons** — Large, prominent rewind/forward (not buried in a menu)
  - *Complexity:* Low (layout)
  - *Dependencies:* Tailwind sizing
  - *Why:* Core interaction; must be the first thing you reach (after play)

### 2.2 Slow-Motion + Real-Time Toggle
- **Dedicated slow-mo button or toggle** — Not a dropdown; a direct "Switch to 0.5x" button
  - *Complexity:* Medium (state management, UI placement)
  - *Dependencies:* Player hook, constants (slow-mo speed)
  - *Why:* Film review alternates constantly between realtime and slow-mo. A toggle is faster than hunting a dropdown.

- **Configurable slow-mo speed** — Adjust the slow-mo multiplier (default 0.5x, but some coaches prefer 0.75x or 0.25x)
  - *Complexity:* Medium (settings input, validation)
  - *Dependencies:* Settings panel, localStorage, constants
  - *Why:* Different sports and angles benefit from different slow-mo speeds

- **Quick visual indicator of current speed mode** — Show at a glance if you're in slow-mo or realtime
  - *Complexity:* Low (color, label, badge)
  - *Dependencies:* CSS, conditional rendering
  - *Why:* Prevents disorientation ("Wait, why is this motion so slow?")

### 2.3 Hold-to-Scrub Enhancements
- **Smooth, responsive hold scrubbing** — Reduce stutter when holding rewind/forward
  - *Complexity:* High (debounce/throttle seeks, possibly requestAnimationFrame)
  - *Dependencies:* Player API, performance optimization
  - *Why:* Current implementation uses `setInterval + seekTo`, which can stutter. Professional tools feel glassy-smooth.

- **Configurable hold speed (tick rate)** — User can adjust how quickly holds move through video
  - *Complexity:* Medium (input validation, min/max bounds)
  - *Dependencies:* Settings UI, localStorage
  - *Why:* Power users want fine control; coaches optimize for their rhythm and sport

- **Hold direction lock** — Once you start holding rewind, you can't accidentally switch to forward without releasing
  - *Complexity:* Medium (state machine or flag logic)
  - *Dependencies:* Pointer event handlers
  - *Why:* Prevents accidental direction switches during hold; less frustration

### 2.4 Jump Button UX
- **Semantic button labeling** — Show ±1s, ±5s, ±10s clearly (not "–", "+", "J1", "J5")
  - *Complexity:* Low (text content)
  - *Dependencies:* ControlBar component
  - *Why:* Users shouldn't have to guess what a button does; clarity builds confidence

- **Optional: Haptic feedback on jump** — Vibrate phone when jump completes (on Android/iOS capable devices)
  - *Complexity:* Medium (navigator.vibrate API, feature detection)
  - *Dependencies:* Vibration API access, touch event
  - *Why:* Differentiation + tactile feedback; feels like hardware clicker

- **Optional: Jump presets customization** — Let users define their own jump intervals (default ±1s, ±5s, ±10s; allow ±2s, ±3s, ±30s, etc.)
  - *Complexity:* High (settings UI, validation, constants refactor)
  - *Dependencies:* Settings panel, localStorage, re-render logic
  - *Why:* Different sports and analysis styles benefit from different granularity

### 2.5 Settings Panel
- **Collapsible settings pane** — Hide advanced options until user taps "Settings"
  - *Complexity:* Medium (expand/collapse state, animation)
  - *Dependencies:* useState, CSS transitions
  - *Why:* Keeps main UI clean; power users can customize without clutter

- **Grouped settings** — Organize by function (Scrubbing, Playback, Display)
  - *Complexity:* Low (semantic HTML, layout)
  - *Dependencies:* Tailwind
  - *Why:* Makes settings discoverable and less overwhelming

### 2.6 Keyboard Shortcuts (Desktop)
- **Filmroom-style keyboard map** — Space (play/pause), J/K/L (rewind/pause/forward), arrow keys (step)
  - *Complexity:* Medium (keydown listeners, handler map)
  - *Dependencies:* useEffect with cleanup, constants
  - *Why:* Power users on desktop expect this; matches VLC and film editing software

- **Keyboard-only operation** — Run the entire app without a mouse (full accessibility + power user appeal)
  - *Complexity:* Medium (focus management, visible focus indicators)
  - *Dependencies:* onKeyDown handlers, tabIndex management
  - *Why:* Professional film rooms often use keyboard-only workflows

- **Visual hint (cheat sheet)** — Display keyboard shortcuts on demand (e.g., "?" shows help)
  - *Complexity:* Medium (modal or popover, key binding)
  - *Dependencies:* useState, dialog component
  - *Why:* Discoverability; new users don't know J/K/L exists without hints

### 2.7 Deep Linking
- **Share video state in URL** — Encode videoId, current time, speed, and settings so you can share "Watch this moment at 2:15 at 0.5x"
  - *Complexity:* High (URL serialization, state hydration, validation)
  - *Dependencies:* URL search params, state management
  - *Why:* Professional tool expectation; coaches often share "Watch this contact at 1:23"

- **URL-based session restore** — If user lands on a shared link, restore speed, time, settings
  - *Complexity:* High (initial state from URL, hydration logic)
  - *Dependencies:* useEffect, URL parsing, type safety
  - *Why:* Must work seamlessly for collaboration workflows

---

## 3. ANTI-FEATURES

Deliberately NOT building these to maintain focus and avoid scope creep.

### 3.1 Out of Scope (Explicit Boundaries)
- **Multiple video backends** — Vimeo, MP4, HLS, local files — YouTube only for v1/v2
  - *Why:* YouTube IFrame API is well-tested; adding backends triples complexity and support burden

- **Frame-level step presets** — Remove fine/medium/coarse; replace with fixed second jumps only
  - *Why:* YouTube seeks by time, not frames; time-based jumps are more predictable and understandable

- **User accounts / authentication** — This is a local-only tool; no login, no cloud sync
  - *Why:* Adds backend complexity and privacy concerns; not a business differentiator for v1

- **Playlist or multi-video library** — Single video at a time; no queues or favorites
  - *Why:* Focus on the single-video UX; add later if demand justifies it

- **Annotations / frame marks** — Don't add ability to draw on video or mark timestamps
  - *Why:* That's a higher-end feature (Hudl, Dartfish level); out of scope for this phase

- **Video upload or hosting** — YouTube URLs only; no file upload
  - *Why:* Avoids storage, processing, and infrastructure costs

- **Collaborative real-time** — No shared cursor, live notes, or multiplayer scrubbing
  - *Why:* Out of scope for v1; revisit if coaches ask for it

- **Advanced audio manipulation** — No pitch correction, isolated audio tracks, or mixing
  - *Why:* YouTube IFrame API doesn't expose audio; out of scope

### 3.2 Non-Features (Tempting But Not This Phase)
- **Gesture shortcuts** (swipe left/right for jump, two-finger tap for slow-mo)
  - *Why:* Adds complexity; button-based controls are clearer for new users

- **Immersive fullscreen** — No special fullscreen mode or picture-in-picture
  - *Why:* YouTube's native fullscreen is good enough; don't rebuild

- **Recording playback analysis** — No record-your-own-video-analysis feature
  - *Why:* That's a separate tool; focus on reviewing existing YouTube content

- **Automatic play suggestions** — No "Next play in 5s" or "Coach's favorites"
  - *Why:* This is a utility app, not a media library; avoid feature bloat

---

## 4. COMPLEXITY & DEPENDENCIES MATRIX

### Low Complexity (1–3 days, isolated)
- Play/pause toggle
- Seek bar display
- Current time readout
- Speed dropdown / selector
- Large, tappable buttons (CSS)
- Text selection disable (CSS)
- Settings persistence (localStorage)

**How to sequence:** Build these first; they're the foundation and don't block other features.

### Medium Complexity (3–7 days, moderate dependencies)
- Step controls (time math, pause-before-step)
- Jump buttons (simple math, constants)
- Visual active state (CSS + state management)
- Hold-to-scrub (pointer events, interval, cleanup)
- Configurable hold speed (settings UI + validation)
- Collapsible settings panel (expand/collapse state)
- Keyboard shortcuts (event listeners, handler map)
- Slow-mo toggle (state management, UI)
- Haptic feedback (navigator.vibrate API)
- Initial URL state reading (URL parsing)

**How to sequence:** After foundation is solid. Many depend on a stable player controller and settings management.

### High Complexity (1–2 weeks, cross-cutting)
- Smooth hold scrubbing (debounce, performance tuning)
- Hold direction lock (state machine logic)
- Unified mobile + desktop layout (design discipline + testing across breakpoints)
- Film-clicker control layout (information architecture, component restructuring)
- Full deep linking (URL serialization, state hydration, validation)
- Keyboard-only operation (focus management, accessibility audit)
- Jump button customization (settings UI, refactored constants)

**How to sequence:** These are integration-heavy. Do them after features are stable but before shipping to avoid last-minute refactors.

---

## 5. DEPENDENCY GRAPH

```
┌─────────────────────────────────────────────┐
│  YouTube Player Controller (foundation)     │ ← Must be solid before anything else
└────────────────────────┬────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         v               v               v
    Play/Pause      Seek Bar        Speed Control
         │               │               │
         └───────────────┼───────────────┘
                         │
                    ┌────v────────────────┐
                    │  Settings Persistence│ ← All controls feed here
                    └────┬────────────────┘
                         │
         ┌───────────────┼───────────────┬──────────┐
         │               │               │          │
         v               v               v          v
    Step Controls   Jump Controls    Hold-to-Scrub  Slow-mo Toggle
         │               │               │          │
         └───────────────┼───────────────┴──────────┘
                         │
                    ┌────v───────────┐
                    │ Control Layout  │ ← Integrates all above
                    └────┬───────────┘
                         │
         ┌───────────────┼───────────────┬──────────────┐
         │               │               │              │
         v               v               v              v
    Keyboard Shortcuts   Haptic       Deep Linking   Collapsible Settings
```

**Key insight:** Everything flows through the player controller and settings persistence layer. **Do not restructure these after you've built on top of them.**

---

## 6. RESEARCH SYNTHESIS: Film Clickers vs. Generic Video Players

### What Film Clicker Apps Do Well (Table Stakes)
1. **Single-task focus** — Play/pause, step, jump, scrub. Nothing else.
2. **Tactile feedback** — Every button press has immediate, visible response.
3. **Predictable controls** — No surprises; muscle memory works.
4. **Speed toggle** — Realtime ↔ slow-mo is instant, not buried in a menu.
5. **Hold scrubbing** — The signature interaction; feels physical and responsive.
6. **Keyboard support** — Desktop coaches use J/K/L reflexively.
7. **Time-based jumps** — Not frames; seconds are intuitive and platform-agnostic.

### What Professional Tools Add (Differentiators, if time allows)
1. **Shared clips** — Link to a timestamp; someone clicks and sees the moment.
2. **Annotation sync** — Notes tied to video position (this app doesn't draw on video, but could link to notes later).
3. **Batch operations** — Compare two plays side-by-side (out of scope for v1).
4. **Performance settings** — Customize jump intervals, speeds, controls to match your workflow.
5. **Telemetry** — Track which plays you've reviewed (future: analytics).

### What Consumer Video Players Have (Don't Copy)
1. **Autoplay** — Turns people off in a review context.
2. **Recommendations** — Distracting; coaches want focus.
3. **Comments/community** — Not relevant to film review.
4. **Full transcripts** — Film review is visual; audio is secondary.
5. **Adaptive bitrate switching** — Irrelevant to scrubbing UX.
6. **Social sharing** — Out of scope for v1.

---

## 7. QUALITY GATES (For Handoff)

- [x] Categories are clear (table stakes vs. differentiators vs. anti-features)
- [x] Complexity noted for each feature
- [x] Dependencies between features identified
- [x] Dependency graph shows build sequence
- [x] Research synthesis explains "why" behind design choices
- [x] Trade-offs documented (e.g., YouTube-only vs. multi-backend)

---

## 8. RECOMMENDED BUILD SEQUENCE

### Phase 1: Foundation (Table Stakes)
1. Large, tappable buttons (CSS)
2. Play/pause, speed control
3. Seek bar, time readout
4. Settings persistence (localStorage)

### Phase 2: Scrubbing Precision
5. Step controls
6. Jump buttons (1s, 5s, 10s)
7. Hold-to-scrub (rewind + forward)
8. Configurable hold speed (settings input)

### Phase 3: Film-Clicker Feel
9. Film-clicker control layout (reorganize UI)
10. Slow-mo toggle (not dropdown)
11. Keyboard shortcuts (J/K/L, space, arrows)
12. Collapsible settings panel

### Phase 4: Polish & Extras (If Time)
13. Smooth hold scrubbing (optimize performance)
14. Visual feedback (active states, speed indicator)
15. Keyboard cheat sheet (? for help)
16. Optional: Haptic feedback, jump customization

### Phase 5: Integration & Sharing (Deferred to Phase 7+)
17. Deep linking (URL state)
18. Keyboard-only operation (accessibility audit)

---

## 9. NEXT STEPS FOR REQUIREMENTS

This FEATURES.md feeds into a REQUIREMENTS.md, which should:

1. **Define acceptance criteria** for each feature (e.g., "Play button toggles playback within 100ms of tap")
2. **Specify accessibility** (e.g., "All buttons meet WCAG AA contrast; keyboard-only use supported")
3. **Set performance targets** (e.g., "Hold scrubbing seeks no faster than 20 times/second to avoid stutter")
4. **List breaking changes** (e.g., "Remove frame-step presets; replace with second jumps")
5. **Define testing strategy** (e.g., "Test on iOS Safari, Chrome Android; real device testing for touch")

---

## APPENDIX: Research Sources & Precedent

### Professional Tools (Validation)
- **Hudl:** Frame step, slow-mo toggle, hold scrubbing, time-based jumps, keyboard shortcuts
- **Dartfish:** Similar UX with annotation overlay; film clicker inspired
- **Synergy Sports:** Sport-specific; focus on play identification and isolation

### Consumer References
- **VLC Player:** J/K/L shortcuts, frame-by-frame mode (desktop), seek bar feedback
- **YouTube's Native Player:** Speed selector, seek bar, tooltip previews (not needed here)
- **Apple TV Siri Remote:** Touch scrubbing with momentum; inspired by some film clicker designs

### Standards
- **iOS HIG:** 44pt minimum touch target (we target 48px for comfort)
- **Material Design:** 48dp minimum; haptic feedback on actions
- **WCAG 2.1 AA:** Contrast, keyboard access, focus indicators

---

**End of FEATURES.md**
