# Film Clicker Video Scrubber — Research Summary

**Project:** Film Clicker (YouTube Video Scrubber)
**Domain:** Video playback controls UX, mobile-first touch interface
**Researched:** 2026-02-11
**Confidence:** HIGH

---

## Executive Summary

Building a film clicker-style scrubber requires three converging technical pillars: **native-feeling touch controls**, **precision frame scrubbing**, and **minimal UI distraction**. The research validates that this is achievable with Next.js 16 + React 19 + Tailwind CSS 4 + YouTube IFrame API, but success depends critically on solving three technical challenges: (1) eliminating perceived lag through instant visual feedback and hardware acceleration, (2) smooth hold-to-scrub without API stutter, and (3) mobile-first responsive design that feels native across iPhone, iPad, and Android.

The recommended approach prioritizes **table stakes features first** (large buttons, hold scrubbing, basic controls), then **differentiators** (dedicated slow-motion toggle, keyboard shortcuts, deep linking), deferring optional polish (haptic feedback, custom scrubber bar) to later phases. The architecture cleanly separates concerns into row-based components (SeekBar, PlaybackRow, HoldButtonsRow, JumpButtonsRow, SettingsPanel), making the UI responsive and testable.

**Critical risk:** YouTube's IFrame API seek latency (100–500ms depending on network) is the real bottleneck, not the web layer. Even with perfect client code, perceived responsiveness is capped by the backend. Mitigation: throttle seeks to 70–100ms intervals, poll `getCurrentTime()` for dedup, and provide clear visual feedback during seeks.

---

## Key Findings

### Recommended Stack

Next.js 16 + React 19 + Tailwind CSS 4 is a solid foundation, with YouTube IFrame API as the only external service. The stack is proven for media applications and low-risk for this scope.

**Core technologies:**
- **React 19 + Next.js 16:** Modern component model with Server Components support. React Hooks provide lightweight state management for player, controls, and settings. No external state library needed at this scale.
- **Tailwind CSS 4:** Responsive design with minimal custom CSS. Critical for mobile-first buttons (44–48px targets, `touch-none`, `select-none`). Breakpoints (`sm:`, `md:`) handle portrait/landscape seamlessly.
- **YouTube IFrame API:** Only backend for video playback. Well-tested but latency-bound (100–500ms seeks). No alternatives within scope (Vimeo, MP4, local files out of scope for v1).
- **TypeScript:** Already in codebase. Strongly recommended for controller interfaces and hook contracts.
- **Pointer Events API:** Unifies mouse, touch, stylus input. Replaces separate onClick/onTouchStart listeners. Supported in all target browsers.
- **localStorage:** Settings persistence (speed, hold tick rate, step preset). No backend required.

**Why this stack:** Minimalist, low-dependency, and all technologies have proven patterns for video controls. High confidence in performance on mobile (iOS Safari 15+, Android Chrome 90+).

---

### Expected Features

Research identifies three feature categories: **table stakes** (users expect these or the app feels incomplete), **differentiators** (what makes this a "film clicker," not just a video player), and **anti-features** (deliberately out of scope).

**Must have (table stakes):**
- Play/pause toggle, seek bar, current time display — baseline expectations
- Playback speed control (0.25x–2x) — slow-motion is essential for film review
- Touch-friendly buttons (≥44×44px) — unusable on mobile otherwise
- Step controls (frame-by-frame equivalent via time steps) — core scrubbing feature
- Jump buttons (±1s, ±5s, ±10s) — fast navigation between plays
- Hold-to-scrub in both directions — defines "film clicker" UX
- Settings persistence (localStorage) — quality-of-life expectation

**Should have (competitive differentiators):**
- Dedicated slow-motion toggle (not buried in dropdown) — coaches expect instant toggle
- Film-clicker vertical layout (seek → play → hold → jumps → settings) — ergonomic and distinct from generic players
- Configurable hold speed (tick rate) — personalization builds power-user trust
- Keyboard shortcuts (J/K/L, space, arrows) — desktop coaches expect film editing patterns
- Collapsible settings panel — keeps main UI clean while enabling customization
- Hold direction lock — prevents accidental direction switches mid-scrub
- Visual indicators (speed badge, hold state color change) — feedback clarity

**Defer to Phase 7+ (not essential for v1):**
- Deep linking (share video state in URL) — nice-to-have for collaboration
- Haptic feedback — Android only, nice-to-have polish
- Frame preview overlay during scrubbing — requires extended YouTube API access
- Gesture shortcuts (swipe for jump) — button clarity is better for v1
- Custom jump presets — good power-user feature but not MVP

---

### Architecture Approach

The proposed component structure moves from a flat ControlBar to a stacked, row-based layout with clear separation of concerns. ScrubberShell (state container) manages YouTube player, scrubber controls, settings, and input method hierarchy. Five specialized row components handle presentation: SeekBar (range input), PlaybackRow (play/pause/speed/time), HoldButtonsRow (rewind/forward), JumpButtonsRow (step/jump buttons), and SettingsPanel (collapsible advanced options).

**Major components:**
1. **ScrubberShell** — State container; owns YouTubePlayerController, useScrubberControls hook, settings persistence, keyboard shortcuts, input method tracking
2. **ControlPanel** — Main container replacing flat ControlBar; stacks rows with responsive gaps
3. **SeekBar** — Dedicated `<input type="range">` for seeking; candidates for enhancement (pause-on-drag, preview tooltip)
4. **PlaybackRow** — Groups play/pause, speed selector, and time display; reads from controller state
5. **HoldButtonsRow** — Rewind/forward buttons; full-width on mobile, side-by-side on desktop; supports hold state tracking for visual feedback
6. **JumpButtonsRow** — Step selector, step ±, and jump button pairs; most complex row (conditional rendering)
7. **SettingsPanel** — Collapsible drawer for hold tick rate, expandable to custom presets

**Data flow:** YouTubePlayerController (singleton) → ScrubberShell (state + callbacks) → Row components (presentation, no logic) → Leaf components (buttons, inputs). Callbacks flow up to ScrubberShell for mutations. Settings stored in localStorage on every change.

---

### Critical Pitfalls & Prevention

The research identifies 12 pitfalls; top 5 most critical:

1. **Touch event confusion (mouse vs. pointer)** — Using `onClick` or `onMouseDown` instead of Pointer Events causes silent failures on mobile. **Prevention:** Use `onPointerDown/Up/Leave/Cancel` exclusively; add `touch-none` and `select-none` CSS; handle `onContextMenu` to suppress browser menus.

2. **setInterval scrubbing is stuttery** — Default `setInterval()` doesn't sync with render loop, causing jank under load and queue buildup. **Prevention:** Current code uses setInterval; acceptable for Phase 0–3 with caution. Phase 5+ consider switching to `requestAnimationFrame()` with time-based throttling (~100ms) and dedup logic to avoid seek coalescing.

3. **YouTube seek latency is unpredictable (100–500ms)** — Rapid queued seeks without throttling cause perceived lag and stutter. **Prevention:** Limit seeks to 1 per 70–100ms minimum; poll `getCurrentTime()` to verify completion; show visual feedback (spinner, dimmed time display) during seek; don't guarantee sub-100ms response.

4. **Range slider lacks mobile UX** — Default `<input type="range">` has no preview, no pause-on-drag, and tiny hit targets on mobile. **Prevention:** Phase 1–3 keep basic HTML input (works). Phase 5+ add visual preview tooltip, pause-on-drag logic, and 44px+ height on mobile for better targeting.

5. **Tap vs. hold indistinct** — Immediate hold-on-pointerdown means brief taps can trigger scrub if user's finger dips below time threshold. **Prevention:** Add 300ms hold delay threshold with visual feedback (color change at threshold); only start continuous scrub after delay. Distinguishes tap (step once) from hold (scrub continuously).

Also critical: Ensure proper cleanup in useEffect to prevent memory leaks; use responsive layouts (flex, Tailwind breakpoints) for portrait/landscape; track buffering state (low priority but important for 3G networks); listen to player error events for silent failure detection.

---

## Implications for Roadmap

Research suggests a 5-phase delivery model based on feature dependencies, architectural patterns, and risk mitigation.

### Phase 1: Touch-Friendly Button Foundation
**Rationale:** Start with low-risk, high-impact CSS and layout changes. Establishes mobile UX baseline before implementing complex scrubbing logic.

**Delivers:**
- All buttons meet 44×48px tap target minimum
- CSS classes: `touch-none`, `select-none`, `active:scale-95`, `will-change-transform`
- Responsive sizing (full-width on mobile, fixed on desktop) via Tailwind breakpoints
- Settings persistence framework (localStorage for speed, step preset, hold tick rate)

**Features addressed:**
- Touch-friendly buttons (table stakes)
- Button feedback (active state indication)
- Settings persistence

**Pitfalls prevented:**
- Touch event confusion (use pointer events, prevent defaults)
- Button feedback inadequacy (active state visual)
- Text selection & long-press menus (select-none, touch-none, contextMenu preventDefault)
- Portrait/landscape responsiveness (flex layout, breakpoints)

**Dependencies:** None (CSS-only, no API changes)
**Estimated effort:** 30 minutes
**Risk:** LOW

---

### Phase 2: Core Player Controls & Seek
**Rationale:** Build the stable player controller and basic UI before hold scrubbing. Discover YouTube API latency characteristics.

**Delivers:**
- Play/pause toggle, speed selector (0.25x–2x)
- Seek bar with full-width responsiveness
- Current time display and duration
- YouTubePlayerController stable (seekTo, getCurrentTime, play, pause, setPlaybackRate)
- Error event listener for silent failure detection

**Features addressed:**
- Core playback (table stakes)
- Seek bar (table stakes)
- Current time display (table stakes)
- Playback speed control (table stakes)

**Architecture components:**
- ScrubberShell (container)
- PlaybackRow (extracted from current ControlBar)
- SeekBar (new component)
- TimeDisplay (extracted)

**Pitfalls prevented:**
- YouTube seek latency (log seek times, understand API limits)
- No seek feedback on failure (add error listener)

**Dependencies:** YouTubePlayerController implementation (already exists but needs validation)
**Estimated effort:** 1–2 hours
**Risk:** LOW (YouTube API is stable)

---

### Phase 3: Hold-to-Scrub & Precision Scrubbing
**Rationale:** Implement signature film clicker feature (hold buttons). This is the highest-value interaction.

**Delivers:**
- Hold-to-scrub (rewind/forward) with configurable tick rate
- Step controls (frame-by-frame equivalent)
- Jump buttons (±1s, ±5s, ±10s)
- Hold state tracking for visual feedback
- 300ms hold delay to distinguish tap from hold
- Testing on real iOS/Android devices

**Features addressed:**
- Step controls (table stakes)
- Jump buttons (table stakes)
- Hold-to-scrub (table stakes)
- Configurable hold speed (differentiator)
- Visual hold state indicator (differentiator)

**Architecture components:**
- useScrubberControls hook (refactor if needed)
- HoldButtonsRow (new)
- JumpButtonsRow (new)
- State lifting for hold indicator

**Pitfalls prevented:**
- setInterval stuttering (acceptable at 70–100ms; monitor with DevTools)
- Tap vs. hold indistinct (add 300ms delay)
- Keyboard/pointer conflicts (no keyboard shortcuts yet, so minimal overlap)
- State leaks on unmount (verify cleanup in useScrubberControls)

**Dependencies:** ScrubberShell, basic controls from Phase 2
**Estimated effort:** 2–3 hours (includes mobile device testing)
**Risk:** MEDIUM (YouTube API latency is the main variable; requires real device testing)

**Research flag:** Needs `/gsd:research-phase` if scrubbing feels stuttery. Conditional on Phase 3 findings.

---

### Phase 4: Film-Clicker Layout & Advanced Controls
**Rationale:** Reorganize UI into film clicker ergonomics and add power-user features (keyboard, slow-mo toggle, settings panel).

**Delivers:**
- Vertical layout hierarchy (seek → play → hold → jumps → settings)
- Dedicated slow-motion toggle (not dropdown)
- Collapsible settings panel (hide advanced options)
- Keyboard shortcuts (J/K/L for rewind/pause/forward, space for play/pause, arrows for step)
- Hold direction lock (prevent accidental direction switch)
- Visual speed/mode indicator

**Features addressed:**
- Film-clicker layout (differentiator)
- Slow-motion toggle (differentiator)
- Keyboard shortcuts (differentiator)
- Collapsible settings (differentiator)
- Hold direction lock (differentiator)

**Architecture components:**
- ControlPanel restructuring (stacked layout)
- SettingsPanel (new)
- useKeyboardShortcuts hook (new)
- Speed/mode badge component

**Pitfalls prevented:**
- Keyboard/pointer conflicts (track active input method to prevent double-seeks on hybrids)
- Range slider UX (can add pause-on-drag here or defer to Phase 5)

**Dependencies:** Phase 3 (hold scrubbing working)
**Estimated effort:** 3–4 hours
**Risk:** MEDIUM (keyboard coordination, layout testing across devices)

---

### Phase 5: Performance & Polish
**Rationale:** Optimize perceived smoothness based on Phase 3 findings; add higher-value UX enhancements.

**Delivers:**
- If Phase 3 revealed stutter: refactor setInterval to `requestAnimationFrame()` with time-based throttling
- Seek dedup logic (poll getCurrentTime, skip redundant calls)
- Seek feedback (spinner, dimmed time during seek)
- Buffering progress indicator (show loaded vs. playing position)
- Range slider enhancements (pause-on-drag, preview tooltip, larger mobile height)
- Haptic feedback (optional, Android/vibrate API)

**Features addressed:**
- Smooth hold scrubbing (table stakes)
- Range slider UX (should-have)
- Buffering feedback (should-have)

**Pitfalls prevented:**
- setInterval stutter (if needed)
- YouTube seek latency (throttle + feedback)
- Range slider mobile UX (pause-on-drag, preview)
- No buffering visibility (show loaded regions)

**Dependencies:** Phase 3 findings (QA feedback on smoothness)
**Estimated effort:** 2–3 hours
**Risk:** MEDIUM (performance tuning, device-specific bugs)

**Research flag:** Conditional. If Phase 3 QA says "feels smooth," skip most of Phase 5. If "stutters on Android," prioritize RAF refactor.

---

### Phase 6: Testing & Validation
**Rationale:** Comprehensive QA on all target devices before "shipping" v1.

**Delivers:**
- Device testing: iPhone 12+, Pixel 6+, iPad, low-end Android (Moto G)
- Network testing: 4G, WiFi, 3G throttling
- Accessibility audit: WCAG AA contrast, keyboard-only navigation, screen reader support
- Motion/jank detection: Chrome DevTools Performance tab
- Settings persistence: Verify localStorage survives reload
- Edge cases: Video unavailable, network drops, rapid orientation changes

**Features validated:**
- All table stakes and differentiators

**Pitfalls tested:**
- All 12 pitfalls validated against real scenarios

**Estimated effort:** 4–6 hours (real device testing is time-consuming)
**Risk:** LOW (QA is systematic)

---

### Phase 7+: Deep Linking & Collaboration (Deferred)
**Rationale:** Higher complexity with lower immediate ROI. Defer unless coaches specifically ask.

**Includes:**
- Deep linking (URL-encoded state: videoId, currentTime, speed)
- Shared clip links (colleagues see video at exact timestamp and speed)
- Keyboard-only operation (accessibility audit completed)
- Jump presets customization
- Possibly: recording playback analysis (separate tool)

**Estimated effort:** 2 weeks minimum
**Risk:** HIGH (URL state management, hydration logic)

---

### Phase Ordering Rationale

1. **Phase 1 first:** CSS-only changes build confidence; no risk of breaking YouTube integration.
2. **Phase 2 before 3:** Player controller must be stable before hold scrubbing; understand YouTube API latency.
3. **Phase 3 immediately after Phase 2:** Hold scrubbing is the signature UX; highest value per hour.
4. **Phase 4 after Phase 3:** Keyboard and layout changes build on hold scrubbing; power users expect integration.
5. **Phase 5 conditional:** Performance tuning based on Phase 3 findings; only refactor if needed.
6. **Phase 6 before ship:** Comprehensive testing prevents last-minute crisis discoveries.
7. **Phase 7+ deferred:** Deep linking is lower priority; add after v1 is stable.

---

### Research Flags

**Phases likely needing deeper research during planning:**

- **Phase 3 (Hold-to-Scrub):** YouTube API seek latency is the real blocker. If Phase 3 QA shows unacceptable stutter (>200ms perceived lag), may need RAF refactor + seek dedup logic. Research recommendation: Monitor with Chrome DevTools Performance tab; log actual seek times to confirm bottleneck.

- **Phase 4 (Keyboard Shortcuts):** Input method coordination on hybrid devices (iPad + keyboard, Surface + stylus) needs validation. Recommendation: Test on actual hybrid hardware; document input precedence (pointer events take priority).

- **Phase 5 (Performance):** Conditional on Phase 3 findings. If stutter confirmed, `requestAnimationFrame()` refactor should be researched in depth (see STACK.md section 2a for proof-of-concept).

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Button Foundation):** CSS patterns for mobile touch targets are well-documented (Apple HIG, Material Design 3). High confidence in approach.

- **Phase 2 (Core Controls):** Play/pause, seek bar, speed selector are standard patterns. YouTube IFrame API is stable. Low research risk.

- **Phase 6 (Testing):** QA methodology is standard (device matrix, network throttling, accessibility audit). No novel research needed.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | Next.js 16 + React 19 + Tailwind 4 proven for media apps. YouTube IFrame API is the only external dependency; latency is the bottleneck, not choice of framework. |
| **Features** | HIGH | Feature taxonomy (table stakes vs. differentiators vs. anti-features) validated against professional tools (Hudl, Dartfish, Synergy) and consumer patterns (VLC, YouTube, Apple TV). Feature dependencies clearly mapped. |
| **Architecture** | HIGH | Component structure (row-based, container → row → leaf) is clean and testable. Data flow is unidirectional (ScrubberShell → components → callbacks). Extracted components have single responsibility. Build order explicitly documented. |
| **Pitfalls** | HIGH | 12 pitfalls identified with root causes, early detection strategies, and prevention code samples. 3 marked as "already handled" in current codebase; 5 marked as "partially handled"; 4 marked as "needs work in Phase 3+." High confidence in completeness. |

**Overall confidence:** HIGH

All four research dimensions (Stack, Features, Architecture, Pitfalls) are well-supported by primary sources (official docs, working code, video player UX patterns). Low research risk in Phase 1–6. Phase 7+ (deep linking) has higher technical complexity but is deferred to later.

---

### Gaps to Address

1. **YouTube IFrame API seek latency bounds:** Research identified 100–500ms latency range but didn't measure actual empirical times in the current codebase. **Mitigation:** Phase 2–3 includes performance logging to confirm bottleneck. Phase 5 refactor conditional on findings.

2. **Mobile network testing:** Recommendations assume 4G/WiFi typical case. 3G and satellite (Starlink) performance unknown. **Mitigation:** Phase 3 testing includes network throttling; Phase 5+ can add buffering indicators if 3G testing reveals stalls.

3. **Haptic feedback iOS support:** Research notes navigator.vibrate() is Android/Chrome only. iOS alternatives (audio feedback) not explored. **Mitigation:** Defer haptic to Phase 5+; iOS users get audio click instead.

4. **Deep linking URL schema:** FEATURES.md mentions deep linking as differentiator but didn't specify URL format. **Mitigation:** Phase 7 planning will define schema (e.g., `?v=videoId&t=123&speed=0.5`); validate against YouTube and competitor patterns.

5. **Keyboard shortcut library:** Research recommends J/K/L (VLC/film editing standard) but doesn't address conflicts with browser shortcuts (search, dev tools). **Mitigation:** Phase 4 planning includes audit of common browser shortcuts; document unavoidable conflicts in help.

---

## Sources

### Primary (HIGH confidence)

- **STACK.md** — Mobile-First Touch Controls research. Sources: Apple Human Interface Guidelines (HIG), Material Design 3, WCAG 2.1, YouTube IFrame API official docs, web developer consensus (Spotify mobile web, TikTok, YouTube native player patterns).

- **FEATURES.md** — Feature taxonomy and dependency graph. Sources: Professional video review tools (Hudl, Dartfish, Synergy), consumer video players (VLC, YouTube, Apple TV), film editing software (Premiere, Final Cut Pro). Validated against actual coach/trainer workflows.

- **ARCHITECTURE.md** — Component design and data flow. Sources: React best practices (official docs), Next.js patterns, current codebase structure (ControlBar, ScrubberShell, hooks). Tested with working code samples.

- **PITFALLS.md** — 12 critical mistakes identified. Sources: Common web app UX anti-patterns (MDN, web.dev), YouTube player history (known issues from Stack Overflow, GitHub issues), accessibility standards (WCAG 2.1, iOS HIG), performance patterns (Chrome DevTools guides).

### Secondary (MEDIUM confidence)

- Indirect research from current codebase (`ControlBar.tsx`, `useScrubberControls.ts`, `useYouTubePlayer.ts`) — Already implements best practices for pointer events, cleanup functions, settings persistence. Confirms feasibility.

- Community patterns (Stack Overflow, GitHub discussions) — Validate hold-to-scrub approaches, YouTube API quirks, Tailwind mobile-first design.

### Tertiary (LOW confidence)

- Estimated YouTube API latency (100–500ms range) — Inferred from typical CDN performance and adaptive bitrate streaming; not directly measured in this codebase. Needs Phase 3 validation.

- Haptic feedback iOS fallback (audio click) — Suggested but not proven. Android vibrate API is solid; iOS audio is a guess. Phase 5+ will validate.

---

## Ready for Roadmap

This research summary is complete and ready to inform roadmap creation. The recommended phase structure above can be directly translated into a detailed roadmap with deliverables, dependencies, and effort estimates. Key decision: **Phase 1 and 2 are prerequisite and low-risk; Phase 3 is the value inflection point where the app becomes distinctly "film clicker-like." Phases 5+ are conditional and can be adjusted based on Phase 3 QA findings.**

Recommend starting with Phase 1 immediately (30-minute investment with high confidence) to validate the approach before committing to Phases 2–3.

---

*Research completed: 2026-02-11*
*Synthesized by: GSD Research Synthesizer*
*All four research documents reviewed and cross-referenced*
