# Architecture: Film Clicker-Style Control Panel

## Overview

This document defines the component structure and data flow for redesigning the ControlBar into a film clicker-style interface with stacked rows of touch-optimized controls.

**Current State:** Flat ControlBar with all controls inline
**Target State:** Stacked rows with semantic grouping (seek → play/toggle → hold buttons → jumps → settings)

---

## Component Boundaries & Hierarchy

### Current Architecture Flow

```
ScrubberShell (state container)
├── useYouTubePlayer() → YouTubePlayerController
├── useScrubberControls() → ScrubberControls
├── useKeyboardShortcuts()
└── ControlBar (presentation layer)
    └── YouTubePlayerController + ScrubberControls (via props)
```

### Proposed Component Structure

```
ScrubberShell (state container)
├── PlayerArea
└── ControlPanel (new wrapper)
    ├── SeekBar (new component)
    │   └── <input type="range">
    ├── PlaybackRow (new component)
    │   ├── PlayPauseButton (extracted)
    │   ├── SpeedSelector (extracted)
    │   └── TimeDisplay (extracted)
    ├── HoldButtonsRow (new component)
    │   ├── HoldRewindButton (extracted)
    │   └── HoldForwardButton (extracted)
    ├── JumpButtonsRow (new component)
    │   ├── StepPresetSelector (extracted)
    │   ├── StepBackButton (extracted)
    │   ├── StepForwardButton (extracted)
    │   └── JumpButtons (map of jump pairs)
    └── SettingsPanel (new component)
        └── HoldTickRateInput (extracted)
```

### Component Responsibilities

#### SeekBar (NEW)
**Purpose:** Dedicated seek control, separated for better mobile handling
**Props:**
- `duration: number` - Total video length
- `currentTime: number` - Current playback position
- `disabled: boolean` - Whether seeking is available
- `onChange: (time: number) => void` - Seek callback

**Dependencies:** None (pure presentation)
**Touch UX:** Full-width slider, 44px+ height for mobile, no gaps

---

#### PlaybackRow (NEW)
**Purpose:** Core playback controls grouped together
**Props:**
- `isPlaying: boolean`
- `onPlayPauseClick: () => void`
- `disabled: boolean`
- `speed: number`
- `onSpeedChange: (rate: number) => void`
- `availableRates: number[]`
- `currentTime: number`
- `formattedTime?: string` - Pre-formatted or compute here

**Dependencies:** Displays YouTubePlayerController data
**Touch UX:** Minimum 44px height buttons, grouped with visual separation

---

#### HoldButtonsRow (NEW)
**Purpose:** Hold-to-scrub buttons as primary interaction on mobile
**Props:**
- `onRewindStart: () => void`
- `onRewindStop: () => void`
- `onForwardStart: () => void`
- `onForwardStop: () => void`
- `disabled: boolean`
- `isHolding?: boolean` - Visual feedback state

**Dependencies:** Consumes ScrubberControls (`startHoldRewind`, `stopHold`, etc.)
**Touch UX:** Full-width on mobile (flex-1), side-by-side on desktop, large tap targets with active states

---

#### JumpButtonsRow (NEW)
**Purpose:** Fine-grained frame-level and fixed-interval jumps
**Props:**
- `stepPreset: StepPresetKey`
- `onStepPresetChange: (preset: StepPresetKey) => void`
- `onStepBack: () => void`
- `onStepForward: () => void`
- `jumpAmounts: readonly number[]`
- `onJumpBack: (seconds: number) => void`
- `onJumpForward: (seconds: number) => void`
- `disabled: boolean`

**Dependencies:** Consumes ScrubberControls (all step/jump methods)
**Touch UX:** Step buttons 44px, smaller jump buttons (32px) in pairs, collapsible on very small screens

---

#### SettingsPanel (NEW)
**Purpose:** Collapsible settings drawer for advanced controls
**Props:**
- `isOpen: boolean`
- `onToggle: () => void`
- `holdTickRateMs: number`
- `onHoldTickRateChange: (ms: number) => void`
- `disabled: boolean`

**Dependencies:** State management (isOpen) lifted to ScrubberShell
**Touch UX:** Toggle button with visual indicator, content slides/fades in below

---

## Data Flow

### State Location (ScrubberShell)

```typescript
// Player state (reactive to controller)
const [speed, setSpeed] = useState(1);

// Control behavior settings (persisted to localStorage)
const [stepPreset, setStepPreset] = useState<StepPresetKey>("medium");
const [holdTickRateMs, setHoldTickRateMs] = useState(HOLD_TICK_RATE_MS.default);

// New for redesign
const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
```

### From Controller → Components

```
YouTubePlayerController
├── currentTime ────────────────> SeekBar
├── duration ───────────────────> SeekBar, TimeDisplay
├── isPlaying ──────────────────> PlayPauseButton, HoldButtonsRow (visual)
├── getAvailablePlaybackRates() > SpeedSelector
└── [all methods] ──────────────> Event handlers in parent
```

### From ScrubberControls → Components

```
useScrubberControls()
├── stepBack ───────────────────> StepBackButton (onClick)
├── stepForward ───────────────> StepForwardButton (onClick)
├── jumpBack(n) ────────────────> JumpButton pairs (onClick)
├── jumpForward(n) ────────────> JumpButton pairs (onClick)
├── startHoldRewind ───────────> HoldRewindButton (onPointerDown)
├── startHoldForward ──────────> HoldForwardButton (onPointerDown)
├── stopHold ───────────────────> All hold buttons (onPointerUp/Leave)
├── stepSize ────────────────────> HoldButtonsRow (display, not used in logic)
└── jumpAmounts ────────────────> JumpButtonsRow (map source)
```

### Settings Persistence Flow

```
ScrubberShell
├── speed → localStorage (via saveSettings)
├── stepPreset → localStorage
├── holdTickRateMs → localStorage
└── isSettingsPanelOpen → sessionStorage (optional) or component state only
```

---

## Build Order & Dependencies

### Phase 1: Extractable Leaf Components (no internal state)
These have zero dependencies on each other. Can be built in parallel.

1. **PlayPauseButton**
   - Depends: YouTubePlayerController (props only)
   - Inputs: isPlaying, onToggle, disabled
   - Output: Click event

2. **SpeedSelector**
   - Depends: YouTubePlayerController (props only)
   - Inputs: speed, availableRates, onSpeedChange, disabled
   - Output: Select change event

3. **TimeDisplay**
   - Depends: formatTime utility
   - Inputs: currentTime
   - Output: None (display only)

### Phase 2: Row Components (compose Phase 1)
Depend on extracting logic from ControlBar; safe to build after Phase 1.

4. **PlaybackRow**
   - Composes: PlayPauseButton, SpeedSelector, TimeDisplay
   - Inputs: All required props from ScrubberShell
   - Output: Callbacks to ScrubberShell

5. **SeekBar**
   - Depends: None (pure presentation)
   - Inputs: duration, currentTime, onChange, disabled
   - Output: onChange callback

6. **HoldButtonsRow**
   - Depends: No sub-components (direct buttons)
   - Inputs: Event handlers from ScrubberControls
   - Output: Pointer events to parent

### Phase 3: Complex Row Components
Depend on Phase 2 extraction patterns; more complex because they map over arrays.

7. **JumpButtonsRow**
   - Composes: StepPresetSelector, step buttons, jump button pairs
   - Inputs: Step/jump methods, preset state
   - Output: Multiple callback types
   - Note: This row has the most conditional rendering (step selector appears conditionally)

### Phase 4: Container & Integration
Brings everything together; should be last.

8. **ControlPanel** (replaces ControlBar)
   - Composes: SeekBar, PlaybackRow, HoldButtonsRow, JumpButtonsRow, SettingsPanel
   - Inputs: All existing ControlBar props
   - Output: Same as ControlBar
   - Responsibilities:
     - Layout stacking (flex column with gaps)
     - Responsive class application (rows may reorganize on mobile)
     - Conditional rendering (some rows hidden if !canControl)

9. **SettingsPanel** (new)
   - Depends: Phase 1 & 2 for HoldTickRateInput
   - Inputs: holdTickRateMs, onHoldTickRateChange, isOpen, onToggle
   - Output: Settings changes

### Phase 5: Shell Integration
Update ScrubberShell to use new ControlPanel structure.

10. **ScrubberShell**
    - Add state: `const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);`
    - Replace: `<ControlBar />` with `<ControlPanel />`
    - Add prop: `isSettingsPanelOpen` + `onSettingsPanelToggle`

---

## Data Flow Diagram: Seek Operation Example

```
User taps SeekBar at 30s
│
├─> SeekBar onChange(30)
│   └─> PlaybackRow/ControlPanel.onChange handler
│       └─> ScrubberShell.setState (if needed) or direct call
│           └─> YouTubePlayerController.seekTo(30)
│
└─> YouTubePlayerController.currentTime = 30 (polled)
    └─> ControlPanel re-renders
        └─> SeekBar.value = 30 (controlled component)
            └─> User sees updated position
```

## Data Flow Diagram: Hold Button Interaction

```
User pointerDown on HoldRewindButton
│
├─> HoldButtonsRow.onRewindStart()
│   └─> ScrubberControls.startHoldRewind()
│       └─> setInterval(() => controller.seekTo(t - stepSize), holdTickRateMs)
│
├─> Interval fires ~14 times/sec (default 70ms tick)
│   └─> controller.seekTo(newTime)
│       └─> YouTubePlayerController.currentTime updates
│           └─> ControlPanel re-renders
│               └─> TimeDisplay updates
│
└─> User pointerUp / pointerLeave
    ├─> HoldButtonsRow.onRewindStop()
    │   └─> ScrubberControls.stopHold()
    │       └─> clearInterval + resume playback if was playing
    │
    └─> Cleanup completes
```

---

## Touch UX Principles for Mobile-First Design

### Button Sizing
- Minimum 44px height on mobile (iOS guidelines)
- Minimum 44px width for touch targets
- 48px preferred for primary actions (hold buttons)

### Spacing
- 8px gap between rows
- 2px gap within button pairs (step buttons, jump buttons)
- 16px padding inside rows

### Responsive Breakpoints
```typescript
// Mobile: flex-1 (full-width) buttons
// sm: (640px+) flex-none with px-3
// Example from current HoldButtonsRow:
// className="flex-1 sm:flex-none sm:px-3"
```

### Interaction Feedback
- Active states: `active:scale-95 active:bg-zinc-200` (visual press)
- Disabled states: `disabled:opacity-50` (clear affordance)
- Hold state: Consider animation or color change while holding

### Gesture Support
- Hold buttons: `onPointerDown/Up/Leave/Cancel` (works for touch + mouse)
- Context menu suppression: `onContextMenu={(e) => e.preventDefault()}` (prevents browser menu on long-press)
- Touch-action CSS: Already in place (`touch-none` on hold buttons)

---

## Implementation Checklist

### Extraction Phase
- [ ] Extract PlayPauseButton from ControlBar
- [ ] Extract SpeedSelector from ControlBar
- [ ] Extract TimeDisplay from ControlBar
- [ ] Extract HoldRewindButton + HoldForwardButton from ControlBar
- [ ] Extract StepBackButton + StepForwardButton from ControlBar
- [ ] Extract JumpButton (pair) logic from map

### Row Composition Phase
- [ ] Create PlaybackRow component (composes Play, Speed, Time)
- [ ] Create SeekBar component (standalone range input)
- [ ] Create HoldButtonsRow component
- [ ] Create JumpButtonsRow component (with step selector)
- [ ] Create SettingsPanel component with toggle state

### Container Phase
- [ ] Create ControlPanel component (main container replacing ControlBar)
- [ ] Apply responsive stacking layout
- [ ] Test touch responsiveness on mobile device

### Shell Integration Phase
- [ ] Update ScrubberShell to add settingsPanelOpen state
- [ ] Replace ControlBar import with ControlPanel
- [ ] Pass isSettingsPanelOpen + onSettingsPanelToggle to ControlPanel
- [ ] Update URL state handling if SettingsPanel state needs persistence

### Testing
- [ ] Unit tests: Each component renders with required props
- [ ] Integration tests: Data flows correctly from ScrubberShell → components
- [ ] Touch tests: Hold buttons work with onPointerDown/Up/Leave/Cancel
- [ ] Mobile layout: Test on small screen (viewport < 640px)
- [ ] Accessibility: ARIA labels present, keyboard navigation works

---

## Key Decisions & Rationale

### 1. Why Extract to Rows Instead of Flat Component?
**Decision:** Rows group related controls semantically.
**Benefit:**
- Each row can be styled/resized independently
- Mobile can stack/reflow rows without affecting siblings
- Testing is easier when concerns are separated
- Settings panel can be tucked away without cluttering main controls

### 2. Why Lift Settings Panel State to ScrubberShell?
**Decision:** isSettingsPanelOpen state lives in ScrubberShell.
**Benefit:**
- Consistent with other settings state (speed, stepPreset, holdTickRateMs)
- Can persist to URL/sessionStorage if needed
- Prevents prop drilling deep into SettingsPanel

### 3. Why Keep YouTubePlayerController in Callbacks?
**Decision:** Controller methods called in ScrubberShell handlers, not deep in sub-components.
**Benefit:**
- Single source of mutations (ScrubberShell or ScrubberControls hook)
- Easier to debug (data flow is centralized)
- Reduces coupling between UI components and controller

### 4. Why Not Use Context for Controller?
**Decision:** Keep props-based prop passing; context is not required.
**Rationale:**
- Current prop drilling is shallow (max 2-3 levels)
- ControlBar/ControlPanel → Row → Sub-component is manageable
- Context would add complexity without proportional benefit at current scope

### 5. Why HoldTickRateMs in SettingsPanel (Hidden by Default)?
**Decision:** Advanced setting, not shown in main control row.
**Benefit:**
- Cleaner UI for most users
- Expert users can find it in settings
- Reduces cognitive load on mobile
- Can expand panel without scrolling on small screens

---

## Naming Conventions

### Components
- Row components: `{Category}Row` (e.g., PlaybackRow, HoldButtonsRow)
- Leaf components: `{Name}Button` or `{Name}Selector` (e.g., PlayPauseButton, SpeedSelector)
- Panels: `{Name}Panel` (e.g., SettingsPanel)

### Props Pattern
- Callbacks: `on{Action}` (e.g., onPlayPauseClick, onSpeedChange, onSettingsPanelToggle)
- State: Adjective or noun (e.g., isPlaying, speed, stepPreset, isOpen)
- Disable: `disabled: boolean`

### Files
- Keep file names matching component names (e.g., PlaybackRow.tsx, SettingsPanel.tsx)
- Leaf components can live in `components/` root or `components/controls/` subdirectory

---

## Example: Hold Button Component

```typescript
// components/HoldRewindButton.tsx
export function HoldRewindButton({
  onStart,
  onStop,
  disabled,
}: {
  onStart: () => void;
  onStop: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onPointerDown={onStart}
      onPointerUp={onStop}
      onPointerLeave={onStop}
      onPointerCancel={onStop}
      onContextMenu={(e) => e.preventDefault()}
      disabled={disabled}
      className="flex-1 select-none touch-none rounded border border-zinc-300 bg-white py-3 text-center text-sm font-medium hover:bg-zinc-100 active:scale-95 active:bg-zinc-200 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 sm:flex-none sm:px-3 sm:py-1.5"
      aria-label="Hold to rewind"
    >
      Rewind
    </button>
  );
}
```

---

## Future Enhancements (Out of Scope for Phase 1)

1. **Hold Button Visual Feedback**: Animated fill/scale while holding
2. **Slow-Motion Toggle**: Dedicated button in PlaybackRow (requires controller enhancement)
3. **Keyboard Shortcut Display**: Tooltip showing `j`, `k`, `l` hints
4. **Preset Profiles**: Save/load complete control configurations
5. **Custom Jump Amounts**: UI to add/remove jump presets
6. **Analytics**: Track which controls are used most (for UX optimization)

---

## Quality Checklist

- [x] Components clearly defined with boundaries (each row/component has single responsibility)
- [x] Data flow direction explicit (ScrubberShell → Rows → Buttons, callbacks flow up)
- [x] Build order implications noted (5 phases, dependencies mapped)
- [x] Touch UX principles documented (44px minimum, gesture handling, feedback)
- [x] Mobile-first approach embedded (full-width mobile, responsive breakpoints)
- [x] Naming conventions established (clear, consistent patterns)
