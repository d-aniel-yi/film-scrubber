# Mobile Touch Video Controls — Pitfalls & Prevention

## Overview

This document identifies critical mistakes commonly made when building touch-friendly video controls for web apps, specifically in the context of YouTube IFrame API scrubbers. Each pitfall includes warning signs, prevention strategies, and the phase where it should be addressed.

---

## Pitfall 1: Touch Event Confusion (Mouse vs. Touch vs. Pointer)

### The Problem
Developers often use `onClick` or `onMouseDown` for dragging/scrubbing logic, which fails silently on touch devices or causes double-firing when both mouse and touch listeners are active. Mobile users experience laggy, unresponsive controls or accidental activations.

### Why It Happens
- React's synthetic events abstract away the browser's native event system.
- Touch is a sequence: `touchstart`, `touchmove`, `touchend` (not a single click).
- Desktop devs reflexively use `onClick`; mobile-first needs `pointerdown`/`pointermove`.

### Warning Signs (How to Detect Early)
- [ ] Hold-to-scrub buttons only work on desktop with a mouse.
- [ ] On mobile, holding the button does nothing; tapping sometimes works, sometimes skips wildly.
- [ ] Multiple rapid seeks occur when touch + mouse both fire (e.g., on hybrid devices).
- [ ] Console shows no errors; the issue is silent and intermittent.

### Prevention Strategy
1. **Use Pointer Events exclusively** for new touch interactions:
   - `onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel` (not `onTouchStart` or `onMouseDown`).
   - Pointer events unify mouse, touch, and stylus under one API.
   - Single listener handles all input types; no double-firing.

2. **Prevent default browser behaviors** that interfere:
   ```tsx
   onPointerDown={(e) => {
     e.preventDefault(); // Stop text selection, browser long-press menu
     startHold();
   }}
   onContextMenu={(e) => e.preventDefault()} // Disable right-click menu
   ```

3. **Use `touch-none` CSS class** on interactive elements:
   ```tsx
   className="select-none touch-none hover:bg-zinc-100"
   ```
   This disables browser gestures (double-tap zoom, long-press) on the control itself.

4. **Add `user-select: none`** to prevent text selection during scrubbing:
   ```tsx
   className="select-none" // Tailwind equivalent
   ```

5. **Handle `onPointerLeave` and `onPointerCancel`** to stop hold on mobile:
   - `onPointerLeave`: user dragged away from button.
   - `onPointerCancel`: browser interrupted (e.g., another gesture, system event).
   - Both must call `stopHold()` to clean up the interval.

### Where to Address (Phase)
- **Phase 1–2:** Use pointer events in button definitions. Add `touch-none` and `select-none` classes.
- **Phase 3:** Verify on real iOS and Android devices during hold-to-scrub implementation.
- **Phase 8–9:** QA on mixed input (stylus on iPad, mouse on desktop, single touch on phone).

### Current Code Status
✓ **Already handled:** `ControlBar.tsx` uses `onPointerDown`, `onPointerUp`, `onPointerLeave`, `onPointerCancel` and adds `touch-none` + `select-none`. Buttons also use `onContextMenu` preventDefault.

---

## Pitfall 2: Button Feedback Feels Like Web Text, Not Native

### The Problem
Buttons styled like HTML text (no tactile feedback) make mobile users feel like they're interacting with a document, not an app. Without visual or haptic cues, users are uncertain if their tap registered.

### Why It Happens
- Web apps default to light styling; native apps have system-level feedback (haptics, ripples).
- Developers skip active states (`active:` pseudo-class) or use weak visual changes.
- No indication that a press is "held" vs. a tap.

### Warning Signs
- [ ] Users tap buttons repeatedly, unsure if the first tap worked.
- [ ] No visual change while a button is being held down.
- [ ] Long-press or hold-to-scrub buttons show no difference between "idle" and "active."
- [ ] Mobile testers say "It doesn't feel like a real app button."

### Prevention Strategy
1. **Add active state visual feedback**:
   ```tsx
   className="... active:scale-95 active:bg-zinc-200"
   ```
   Slight scale down and color shift communicates pressure/touch.

2. **Distinguish held state from idle**:
   - Use local state or CSS to show "Currently Rewinding" or similar during hold.
   - Example: held buttons get a darker background or animated border.
   ```tsx
   const [isHolding, setIsHolding] = useState(false);
   return (
     <button
       onPointerDown={() => {
         setIsHolding(true);
         startHoldRewind();
       }}
       onPointerUp={() => {
         setIsHolding(false);
         stopHold();
       }}
       className={isHolding ? "bg-zinc-600" : "bg-zinc-300"}
     >
       Rewind
     </button>
   );
   ```

3. **Minimum touch target size: 44–48px** (recommended by Apple/Google):
   - Ensure buttons are at least 44px on a side (or equivalent area).
   - Check with browser DevTools: toggle device toolbar and measure.

4. **Add visual "scrubbing in progress" indicator** (optional for Phase 3+):
   - Fade the time readout or add a spinning indicator while holding.
   - Reassures users that repeated seeks are happening.

5. **Consider haptic feedback** (low priority, Phase 8+):
   - Use Vibration API: `navigator.vibrate(10)` on pointerdown.
   - Only on devices that support it; wrap in try/catch.

### Where to Address (Phase)
- **Phase 1:** Define active state in Tailwind classes.
- **Phase 3:** Test on actual touch devices; adjust feedback timing if feels laggy.
- **Phase 8–9:** Optional haptic feedback if time allows.

### Current Code Status
✓ **Partially handled:** Hold-to-scrub buttons use `active:scale-95 active:bg-zinc-200`. Could add a "held" state indicator (e.g., darker color while `isHolding`) in Phase 3.

---

## Pitfall 3: setInterval Scrubbing Is Stuttery & Unresponsive

### The Problem
Using `setInterval()` for hold-to-scrub causes inconsistent visual feedback:
- Interval fires at the wrong time (jank from browser throttling, frame drops).
- Heavy work (seeking) blocks the render loop.
- Rapid successive seeks queue up, causing lag spikes when the interval stops.

### Why It Happens
- `setInterval()` is fire-and-forget; browser can't guarantee timing.
- Each `seekTo()` call can trigger expensive API work in YouTube's iframe.
- No direct feedback loop between seek completion and next tick.

### Warning Signs
- [ ] Hold-to-scrub feels notchy, with visible pauses or speed variations.
- [ ] Releasing the button doesn't immediately stop the scrub; lag continues for 1–2 seconds.
- [ ] Playing after a hold skips or jumps unexpectedly.
- [ ] On low-end phones, scrubbing causes UI jank (other buttons unresponsive).

### Prevention Strategy
1. **Use `requestAnimationFrame()` instead of `setInterval()`** for visual feedback:
   - RAF respects the display's refresh rate (60/120 Hz).
   - Syncs with browser's render cycle, reducing jank.
   - Example (for future phases, not required in Phase 3):
     ```tsx
     const holdStartTimeRef = useRef<number | null>(null);
     const rafRef = useRef<number | null>(null);

     const startHoldRewind = useCallback(() => {
       if (!controller?.ready) return;
       controller.pause();
       holdStartTimeRef.current = performance.now();

       const animate = () => {
         const now = performance.now();
         const elapsed = now - holdStartTimeRef.current!;
         const stepCount = Math.floor(elapsed / holdTickRateMs);
         const t = controller.getCurrentTime();
         const next = Math.max(0, t - stepSize * stepCount);
         controller.seekTo(next);
         rafRef.current = requestAnimationFrame(animate);
       };

       rafRef.current = requestAnimationFrame(animate);
     }, [controller, stepSize, holdTickRateMs]);
     ```

2. **Throttle seeks, don't queue them**:
   - Track the "last seek time" and only call `seekTo()` if enough time has passed.
   - Discard intermediate updates; always send the final target time.
   ```tsx
   const lastSeekTimeRef = useRef<number>(0);
   const startHoldRewind = useCallback(() => {
     holdIntervalRef.current = setInterval(() => {
       const now = performance.now();
       if (now - lastSeekTimeRef.current < SEEK_THROTTLE_MS) return;
       const t = controller.getCurrentTime();
       const next = Math.max(0, t - stepSize);
       controller.seekTo(next);
       lastSeekTimeRef.current = now;
     }, holdTickRateMs);
   }, [controller, stepSize, holdTickRateMs]);
   ```

3. **Cancel pending seeks on release**:
   - Clear the interval immediately on `pointerup`, don't wait for the next tick.
   - If the user released, no more seeks should fire.
   ```tsx
   const stopHold = useCallback(() => {
     if (holdIntervalRef.current) {
       clearInterval(holdIntervalRef.current);
       holdIntervalRef.current = null;
     }
   }, []);
   ```

4. **Measure and log performance** in development:
   - Track seek frequency and duration in DevTools Performance tab.
   - Aim for < 16ms per frame (60 FPS).
   - Watch for long tasks (> 50ms) that block the main thread.

### Where to Address (Phase)
- **Phase 3:** Use current `setInterval()` approach; measure on real devices.
- **Phase 5–6:** If performance is good, keep setInterval. If janky, refactor to RAF + throttling.
- **Phase 8–9:** QA on low-end Android device (Moto G, etc.); optimize if needed.

### Current Code Status
⚠️ **Current approach:** `useScrubberControls.ts` uses `setInterval()` with `holdTickRateMs` (default ~70ms). Works reasonably well for most devices but could stutter under load. Monitor during Phase 3 testing.

---

## Pitfall 4: YouTube IFrame API Seek Latency Is Unpredictable

### The Problem
YouTube's IFrame API has built-in latency for seeking (100–500ms depending on network and video format). If you fire rapid seeks without checking the current state, the player falls behind, and perceived responsiveness suffers. Users see a delay between pressing a button and the video moving.

### Why It Happens
- YouTube streams adaptive bitrate video; seeking means re-buffering a new segment.
- API doesn't guarantee seek completion time; depends on CDN and device.
- Rapid `seekTo()` calls can overload the queue or be coalesced by YouTube's code.
- No built-in feedback when a seek completes (unless you poll `getCurrentTime()`).

### Warning Signs
- [ ] Tap a step button; the video doesn't move for 200–500ms.
- [ ] Hold-to-scrub feels laggy compared to native YouTube app.
- [ ] On low-bandwidth connection, scrubbing freezes for a second.
- [ ] The scrub bar's current time reads ahead of the actual video position.

### Prevention Strategy
1. **Poll `getCurrentTime()` to detect seek completion**:
   - Don't rely on `seekTo()` to be instant.
   - Track the target time and verify it actually plays.
   - Example:
     ```tsx
     let seekTarget = null;
     const seekAndVerify = (targetTime) => {
       seekTarget = targetTime;
       controller.seekTo(targetTime);
       const checkSeek = () => {
         const actual = controller.getCurrentTime();
         if (Math.abs(actual - seekTarget) < 0.1) {
           // Seek succeeded
           return;
         }
         setTimeout(checkSeek, 100);
       };
       checkSeek();
     };
     ```

2. **Limit seek frequency**:
   - Don't fire more than 1 seek per ~100–200ms.
   - YouTube can coalesce rapid seeks anyway; sending fewer is more efficient.
   - Use a throttle in the hold logic:
     ```tsx
     const startHoldRewind = useCallback(() => {
       let lastSeek = performance.now();
       holdIntervalRef.current = setInterval(() => {
         const now = performance.now();
         if (now - lastSeek < 200) return; // Skip if < 200ms since last seek
         const t = controller.getCurrentTime();
         const next = Math.max(0, t - stepSize);
         controller.seekTo(next);
         lastSeek = now;
       }, holdTickRateMs);
     }, [controller, stepSize, holdTickRateMs]);
     ```

3. **Show user feedback during seek**:
   - Display a spinner or dim the time readout while seeking.
   - Reassures users that the delay is normal (not a freeze).
   ```tsx
   const [isSeeking, setIsSeeking] = useState(false);
   const seekAndFeedback = (target) => {
     setIsSeeking(true);
     controller.seekTo(target);
     setTimeout(() => setIsSeeking(false), 300); // Assume seek done
   };
   ```

4. **Store the last seek target**:
   - If a seek is already pending, don't queue another one.
   - Replace the pending seek with the new target.
   ```tsx
   const pendingSeekRef = useRef<number | null>(null);
   const seekUnique = (target) => {
     pendingSeekRef.current = target;
     if (pendingSeekRef.current === target) {
       controller.seekTo(target);
     }
   };
   ```

5. **Handle network latency in tests/docs**:
   - Document expected seek latency (e.g., "100–300ms typical").
   - Test on slow connections (network throttling in DevTools).
   - Don't guarantee sub-50ms seeks; that's unrealistic for YouTube.

### Where to Address (Phase)
- **Phase 2:** Understand YouTube API latency in useYouTubePlayer.
- **Phase 3:** Log seek times during hold-to-scrub testing.
- **Phase 5–6:** Add throttling if latency causes visible issues.
- **Phase 8–9:** Document expected latency in help or tooltips.

### Current Code Status
⚠️ **Current approach:** `useScrubberControls.ts` calls `seekTo()` repeatedly without throttling. The YouTube API handles some coalescing, but explicit throttling (200ms minimum between seeks) would improve perceived responsiveness. Add if QA detects lag in Phase 3.

---

## Pitfall 5: The Input Range Slider Is Unfinished on Mobile

### The Problem
The default `<input type="range">` element feels clunky on mobile:
- No visual preview of the target time.
- Dragging the thumb is finicky (small hit target, no haptic feedback).
- Scrubbing while video is playing causes rapid re-renders, jank.
- No visual distinction between "idle," "dragging," and "playing."

### Why It Happens
- HTML `<input>` is a native browser element; styling and feedback are limited.
- Mobile browsers have different slider UX (iOS has larger draggable area; Android doesn't).
- State updates during drag re-render the entire bar, not just the thumb position.

### Warning Signs
- [ ] Users tap the slider bar but can't see what time they're scrubbing to until release.
- [ ] Dragging is jerky or the thumb jumps around.
- [ ] On mobile, the slider feels 10x harder to use than desktop.
- [ ] Scrubbing causes video to pause/stutter; users avoid the slider.

### Prevention Strategy
1. **Add visual preview during scrub**:
   - Show a tooltip with the target time near the thumb.
   - Example:
     ```tsx
     const [isDragging, setIsDragging] = useState(false);
     const [previewTime, setPreviewTime] = useState<number | null>(null);

     <input
       type="range"
       onPointerDown={() => setIsDragging(true)}
       onPointerUp={() => setIsDragging(false)}
       onChange={(e) => {
         const target = parseFloat(e.target.value);
         setPreviewTime(target);
         controller.seekTo(target);
       }}
     />
     {isDragging && previewTime != null && (
       <div className="text-sm text-zinc-600">
         {formatTime(previewTime)}
       </div>
     )}
     ```

2. **Pause video during scrub, resume on release**:
   - Reduces jank and gives users precise frame-by-frame control.
   ```tsx
   const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);

   <input
     onPointerDown={() => {
       setWasPlayingBeforeScrub(controller.isPlaying);
       controller.pause();
       setIsDragging(true);
     }}
     onPointerUp={() => {
       if (wasPlayingBeforeScrub) controller.play();
       setIsDragging(false);
     }}
   />
   ```

3. **Increase slider height on mobile**:
   - Make the draggable area at least 44px tall on mobile.
   - Use CSS media queries to scale up for touch:
     ```tsx
     className="h-2 sm:h-3 md:h-2 cursor-pointer"
     ```

4. **Disable video updates during drag**:
   - Don't update the slider's `value` prop while the user is dragging.
   - Only update after they release.
   - Prevents the UI from fighting the user's input.
   ```tsx
   const [value, setValue] = useState(controller.currentTime);

   useEffect(() => {
     if (!isDragging) setValue(controller.currentTime);
   }, [controller.currentTime, isDragging]);

   <input value={value} onChange={...} />
   ```

5. **Consider a custom scrubber** (Phase 7+):
   - For more control, build a custom scrubber bar using canvas or custom SVG.
   - Allows precise hit detection, better preview, haptics.
   - Not required for Phase 3; HTML input is fine as a starting point.

### Where to Address (Phase)
- **Phase 1:** Style the range slider with Tailwind; ensure it's visible on mobile.
- **Phase 3:** Test on iOS and Android; adjust height and feedback if janky.
- **Phase 5–6:** Add visual preview and pause-on-drag if QA feedback demands it.
- **Phase 7+:** Optional custom scrubber if time permits.

### Current Code Status
⚠️ **Current approach:** `ControlBar.tsx` uses a basic `<input type="range">`. Works, but lacks mobile UX polish (no preview, no pause-on-drag). Acceptable for Phase 0–3; enhance in Phase 5–6 if QA prioritizes it.

---

## Pitfall 6: Mixing Keyboard and Touch Without Clear Separation

### The Problem
If keyboard shortcuts and touch buttons trigger the same actions without coordination, users on hybrid devices (iPad + keyboard, Surface + stylus) experience conflicts:
- Pressing 'J' (rewind) while holding the Rewind button causes double-seeks.
- Keyboard events don't respect the "currently holding" state, leading to unexpected behavior.

### Why It Happens
- Keyboard and pointer handlers are separate; state isn't synchronized.
- Developers assume keyboard input is mutually exclusive from touch (false on hybrids).
- No clear "input hierarchy" (which takes precedence?).

### Warning Signs
- [ ] On iPad with keyboard, pressing J while dragging causes stutters or skips.
- [ ] Double-seeks occur when both keyboard and pointer events fire.
- [ ] Confusion about whether a button press or key press took priority.

### Prevention Strategy
1. **Track which input method is active**:
   ```tsx
   const [activeInputMethod, setActiveInputMethod] = useState<'keyboard' | 'pointer' | null>(null);

   const handlePointerDown = () => {
     setActiveInputMethod('pointer');
     // ... start hold
   };

   const handleKeyDown = (e: KeyboardEvent) => {
     if (activeInputMethod === 'pointer') return; // Ignore keyboard while pointing
     setActiveInputMethod('keyboard');
     // ... handle key
   };
   ```

2. **Pause all input while seeking**:
   - Set a flag `isSeeking` that blocks both keyboard and pointer input.
   - Prevents accidental double-seeks.

3. **Use a single "seek" function**, not separate paths for keyboard vs. pointer:
   - Both keyboard and pointer handlers call `seekAndFeedback(direction)`.
   - Less duplication, consistent behavior.

4. **Document input precedence** in code comments:
   - Example: "Pointer events take priority; ignore keyboard input while holding a button."

### Where to Address (Phase)
- **Phase 3:** During keyboard shortcuts and hold implementation, ensure they don't conflict.
- **Phase 8–9:** Test on iPad + keyboard, Surface, and other hybrid devices.

### Current Code Status
⚠️ **Potential issue:** `useScrubberControls.ts` and `useKeyboardShortcuts.ts` are separate hooks. No explicit check to prevent keyboard + pointer double-seeks. Low risk in Phase 0–3 (most users won't use both simultaneously), but document this assumption.

---

## Pitfall 7: Text Selection & Long-Press Menus Ruin the UX

### The Problem
Without prevention, mobile users accidentally trigger browser UI (text selection, long-press context menu) while scrubbing, breaking the interaction:
- Text in buttons gets selected (looks broken; can't interact).
- Long-press opens native "Copy, Paste, Share" menu (blocks input).
- Double-tap zooms on the button (iOS; very annoying).

### Why It Happens
- Browser defaults allow text selection and context menus to be useful on document pages.
- Developers forget that buttons aren't text; they need protective CSS/HTML.

### Warning Signs
- [ ] Long-press on a button brings up a context menu (Share, Copy, etc.).
- [ ] Double-tapping a button causes the page to zoom in unexpectedly.
- [ ] Text inside buttons is selectable, appearing highlighted.
- [ ] Mobile users tap multiple times because they're confused by UI breakage.

### Prevention Strategy
1. **Disable text selection on buttons**:
   ```tsx
   className="select-none" // Tailwind: user-select: none
   ```

2. **Disable touch-triggered zoom and context menu**:
   ```tsx
   onContextMenu={(e) => e.preventDefault()}
   onTouchStart={(e) => e.preventDefault()} // Only if needed; usually not
   ```

3. **Disable double-tap zoom** via viewport meta tag (in `layout.tsx` or `<head>`):
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
   ```
   ⚠️ **Warning:** `user-scalable=no` is controversial (accessibility concern). Only use if controls are too hard to interact with. Test with users first.

4. **Use `touch-none` on draggable elements**:
   ```tsx
   className="touch-none" // Disables default touch behaviors (scroll, zoom)
   ```

5. **Optional: Disable long-press menu only on specific buttons**:
   ```tsx
   onContextMenu={(e) => e.preventDefault()}
   ```

### Where to Address (Phase)
- **Phase 1:** Add `select-none` and `touch-none` to button definitions.
- **Phase 2:** Add `onContextMenu` preventDefault to hold buttons.
- **Phase 3:** Test on iOS/Android; verify no unwanted UI triggers.
- **Phase 8–9:** Decide on `user-scalable=no` based on QA feedback.

### Current Code Status
✓ **Well handled:** `ControlBar.tsx` buttons use `select-none`, `touch-none`, and `onContextMenu` preventDefault. Good.

---

## Pitfall 8: No Distinction Between a Tap and a Hold

### The Problem
If a button handler doesn't distinguish between a quick tap (< 200ms) and a long hold (> 500ms), users can't reliably control whether they "step once" or "hold to scrub continuously." This is critical for hold-to-scrub buttons.

### Why It Happens
- Developers use a simple `onPointerDown` listener without timing.
- No threshold to determine "tap" vs. "hold."
- Users accidentally trigger the wrong action (hold when they meant tap).

### Warning Signs
- [ ] Tapping the Rewind button sometimes causes a continuous rewind.
- [ ] Users can't predict whether a press will step once or hold.
- [ ] No clear visual or time-based indication of "hold mode activation."

### Prevention Strategy
1. **Add a hold delay threshold**:
   ```tsx
   const HOLD_DELAY_MS = 300;
   const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const pointerDownTimeRef = useRef<number>(0);

   const handlePointerDown = () => {
     pointerDownTimeRef.current = performance.now();
     holdTimeoutRef.current = setTimeout(() => {
       // Transition to hold mode after 300ms
       startHoldRewind();
     }, HOLD_DELAY_MS);
   };

   const handlePointerUp = () => {
     const duration = performance.now() - pointerDownTimeRef.current;
     if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);

     if (duration < HOLD_DELAY_MS) {
       // Tap: step once
       stepBack();
     } else {
       // Hold: stop the continuous seek
       stopHold();
     }
   };
   ```

2. **Provide visual feedback at the threshold**:
   - Add a visual cue (color change, animation) when the hold delay is reached.
   - Example: button becomes darker after 300ms of press.
   ```tsx
   const [isHeld, setIsHeld] = useState(false);
   // Update isHeld in the setTimeout callback
   ```

3. **Choose appropriate delay**:
   - **300ms:** Good for buttons that do both tap and hold. Feels responsive.
   - **500ms:** Too long; users release before hold activates.
   - **100ms:** Too short; accidental holds.
   - **Test on devices:** Timing feels different on high-latency mobile vs. fast desktop.

4. **Allow cancellation before hold activates**:
   - If the user lifts their finger before the delay, cancel the hold timer.
   - Only start continuous scrub after the delay, not immediately.

### Where to Address (Phase)
- **Phase 3:** Implement hold delay threshold (currently, hold starts on pointerdown; should add 300ms delay).
- **Phase 8–9:** Test on real devices; adjust delay if QA feedback suggests too fast/slow.

### Current Code Status
⚠️ **Issue:** `ControlBar.tsx` hold buttons use `onPointerDown` to start the hold immediately, no delay. This means a brief tap can trigger a scrub if the user's finger dips below the time threshold before lifting. Should add a 300ms delay in Phase 3 to distinguish tap from hold.

---

## Pitfall 9: State Leaks Across Component Unmount

### The Problem
If intervals, timeouts, or refs aren't cleaned up when the component unmounts, listeners fire after the component is gone, causing "Can't perform a React state update on an unmounted component" warnings and potential memory leaks.

### Why It Happens
- Developers forget to return a cleanup function from `useEffect`.
- Refs (like `holdIntervalRef`) aren't cleared in cleanup.
- Event listeners (like keyboard shortcuts) remain attached after unmount.

### Warning Signs
- [ ] Console warnings: "Can't perform a React state update on an unmounted component."
- [ ] Memory usage increases with each video load/unload cycle.
- [ ] Page feels sluggish after loading several videos (garbage collection lag).

### Prevention Strategy
1. **Always return a cleanup function from `useEffect`**:
   ```tsx
   useEffect(() => {
     const interval = setInterval(...);
     return () => clearInterval(interval); // Cleanup
   }, [...]);
   ```

2. **Clear refs on unmount**:
   ```tsx
   useEffect(() => {
     return () => {
       if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
       holdIntervalRef.current = null;
     };
   }, []);
   ```

3. **Add a "cancelled" flag in async operations**:
   ```tsx
   useEffect(() => {
     let cancelled = false;
     loadYouTubeAPI().then(() => {
       if (cancelled) return; // Ignore if unmounted
       setReady(true);
     });
     return () => { cancelled = true; };
   }, []);
   ```

4. **Test for memory leaks**:
   - Open DevTools > Performance > Memory.
   - Load and unload videos repeatedly.
   - Take heap snapshots; memory should not grow unbounded.

### Where to Address (Phase)
- **Phase 1:** Establish cleanup patterns in hooks.
- **Phase 8–9:** Run memory leak tests; verify no warnings in console.

### Current Code Status
✓ **Well handled:** `useScrubberControls.ts` and `useYouTubePlayer.ts` have proper cleanup functions. Good pattern.

---

## Pitfall 10: Forgetting to Handle Portrait vs. Landscape Orientation

### The Problem
Mobile devices rotate; if the UI isn't responsive, controls become unusable when the device rotates. Buttons disappear, text overflows, the range slider becomes a tiny horizontal line.

### Why It Happens
- Developers test primarily on a fixed size (desktop or one mobile screen size).
- Responsive design is an afterthought.
- No testing on actual devices during rotation.

### Warning Signs
- [ ] Rotating an iPhone causes buttons to overlap or fall off-screen.
- [ ] The scrub bar becomes unreadable or unclickable in landscape.
- [ ] Text labels don't fit; buttons shrink to 1 inch wide.
- [ ] QA says "Works on my phone, but not when rotated."

### Prevention Strategy
1. **Use flexible layouts (Flexbox, Grid)**:
   ```tsx
   className="flex flex-wrap items-center gap-2"
   ```
   This allows buttons to wrap and reflow on rotation.

2. **Test breakpoints**:
   - Add Tailwind breakpoints (`sm:`, `md:`) to handle portrait vs. landscape.
   ```tsx
   className="py-3 sm:px-3 sm:py-1.5"
   // Wider padding on mobile (portrait), smaller on desktop (landscape)
   ```

3. **Adjust layout for small widths**:
   - Use single-column layout in portrait (buttons stack).
   - Multi-column in landscape (buttons side-by-side).
   ```tsx
   className="flex flex-col sm:flex-row gap-2"
   ```

4. **Test on real devices**:
   - Rotate during active scrubbing.
   - Verify buttons are still accessible.
   - Check that the video doesn't re-load on rotate.

5. **Handle viewport resize events** (if needed):
   ```tsx
   useEffect(() => {
     const handleResize = () => { /* update layout */ };
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
   }, []);
   ```

### Where to Address (Phase)
- **Phase 1:** Define responsive breakpoints in Tailwind config.
- **Phase 2–3:** Test on mobile in portrait and landscape.
- **Phase 8–9:** Ensure all orientations work smoothly.

### Current Code Status
⚠️ **Partially handled:** `ControlBar.tsx` uses flex wrapping and some `sm:` breakpoints (e.g., hold buttons use `flex-1 sm:flex-none sm:px-3 sm:py-1.5`). Looks good; verify during Phase 3 on real rotations.

---

## Pitfall 11: Seek Bar Doesn't Reflect Network Buffering

### The Problem
The range input's visual state doesn't show which parts of the video are buffered vs. not. Users scrub into unbuffered sections, causing stalls. The UI gives no feedback about network state.

### Why It Happens
- YouTube IFrame API exposes buffering info, but it's not automatically reflected in the UI.
- Standard `<input type="range">` has no way to show multi-part state (buffered regions).
- Developers often ignore buffering as a concern (works fine on fast networks).

### Warning Signs
- [ ] Users scrub to a point that hasn't loaded yet; video stalls/buffers for 10 seconds.
- [ ] No visual indication of which parts are safe to jump to.
- [ ] Mobile users on slow networks can't tell if a seek will be instant or slow.

### Prevention Strategy
1. **Track buffered ranges from YouTube API**:
   ```tsx
   const getVideoLoadedFraction = () => playerRef.current?.getVideoLoadedFraction?.() ?? 0;
   ```
   YouTube API provides a fraction (0–1) of the video that's buffered.

2. **Render buffering progress separately**:
   - Add a secondary progress bar behind the seek bar showing buffered portions.
   - Example:
     ```tsx
     <div className="relative">
       <div className="absolute h-2 bg-zinc-300 w-full" />
       <div
         className="absolute h-2 bg-zinc-500"
         style={{ width: `${bufferedFraction * 100}%` }}
       />
       <input type="range" className="relative" />
     </div>
     ```

3. **Disable or warn about seeking into unbuffered regions**:
   - Optional: show a toast or tooltip if user tries to seek far ahead.
   - "This part hasn't loaded yet; playback may stall."

4. **Document expected buffering behavior**:
   - Explain that YouTube streams adaptively; buffering depends on network.
   - Set expectations: "May take a few seconds to buffer."

### Where to Address (Phase)
- **Phase 1–3:** Not critical; basic seek works without buffering display.
- **Phase 5–6:** Add buffering indicator if QA reports stalls on slow networks.
- **Phase 8–9:** Optional; nice-to-have for user experience.

### Current Code Status
⚠️ **Not implemented:** Buffering indicator not shown in seek bar. Low priority for Phase 0–3; add in Phase 5+ if needed.

---

## Pitfall 12: No Feedback When Seeking Fails

### The Problem
If a seek fails (network error, video not available, permissions), the app silently does nothing. Users are left wondering if their input registered.

### Why It Happens
- YouTube API errors are not surfaced by default.
- Developers focus on the happy path (seeking works) and skip error handling.
- No error event listener on the player.

### Warning Signs
- [ ] User taps a button; nothing happens; no error message.
- [ ] Video is deleted or private; seek button just doesn't work (no explanation).
- [ ] Network drops during seek; UI freezes (no timeout or retry).

### Prevention Strategy
1. **Listen to player error events**:
   ```tsx
   events: {
     onError: (event: { data: number }) => {
       if (event.data === 5) console.error("HTML5 player error");
       if (event.data === 100) console.error("Video not found");
       if (event.data === 101) console.error("Video not allowed to be played");
     }
   }
   ```

2. **Add a timeout for seeks**:
   ```tsx
   const seekWithTimeout = (target, timeoutMs = 5000) => {
     const start = performance.now();
     const checkSeek = () => {
       if (performance.now() - start > timeoutMs) {
         showError("Seek timed out. Please try again.");
         return;
       }
       const current = controller.getCurrentTime();
       if (Math.abs(current - target) < 0.5) return; // Success
       setTimeout(checkSeek, 100);
     };
     controller.seekTo(target);
     checkSeek();
   };
   ```

3. **Show error messages for known issues**:
   - "Video unavailable" if API returns error 100.
   - "Network error" if seek times out.
   - "Video restricted" if error 101.

4. **Implement a retry mechanism**:
   - Allow users to retry a failed seek without reloading the player.

### Where to Address (Phase)
- **Phase 1–2:** Add error event listener in `useYouTubePlayer`.
- **Phase 3:** Test with unavailable videos; ensure errors are logged.
- **Phase 8–9:** Add user-facing error messages if time permits.

### Current Code Status
⚠️ **Minimal error handling:** `useYouTubePlayer.ts` loads the API but doesn't listen to player error events. Add error event listener in Phase 1–2.

---

## Summary Table

| Pitfall | Root Cause | Early Detection | Prevention | Phase to Address |
|---------|-----------|-----------------|-----------|-----------------|
| Touch event confusion | onClick, not pointerdown | Only works on desktop | Use pointer events + touch-none | 1–2 |
| Button feedback | No active state | Buttons feel like text | Add active:scale-95, isHeld state | 1–3 |
| Stuttery setInterval | Frame-agnostic timing | Jerky hold-to-scrub on mobile | Switch to RAF + throttle (Phase 5+) | 3–6 |
| YouTube seek latency | Rapid queued seeks | Lag on hold scrub | Throttle to 200ms + show feedback | 3–6 |
| Range slider UX | No preview/pause-on-drag | Hard to scrub on mobile | Add tooltip + pause-on-drag | 3–6 |
| Keyboard/pointer conflicts | No input hierarchy | Double-seeks on hybrids | Track active input method | 3, 8–9 |
| Text selection & menus | Browser defaults | Text selectable, context menu | select-none, touch-none, contextMenu preventDefault | 1–2 |
| Tap vs. hold indistinct | No timing threshold | Can't reliably step vs. hold | Add 300ms hold delay + visual feedback | 3 |
| State leaks on unmount | No cleanup functions | Memory grows, console warnings | Return cleanup from useEffect, cancel refs | 1 |
| Portrait/landscape not responsive | Fixed-size layout | Buttons off-screen on rotate | Use flex, Tailwind breakpoints | 1–3 |
| Buffering not shown | No buffering display | Users scrub into empty parts | Show buffered progress bar (Phase 5+) | 5+ |
| Seek failures silent | No error handling | Silent failures confuse users | Listen to error events, show messages | 1–2, 8–9 |

---

## Next Steps

1. **Phase 1–2:** Implement pointer events, cleanup, error handling.
2. **Phase 3:** Test on real iOS/Android devices; verify tap/hold logic.
3. **Phase 5–6:** Optimize seek latency and add visual feedback if needed.
4. **Phase 8–9:** Polish feedback, test on hybrid devices, add optional refinements (haptics, buffering display).

---

*Document last updated: 2026-02-11*
