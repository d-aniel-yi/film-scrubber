# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v2.0 (Local & Download)

## Must-Haves (from SPEC)
- [ ] Local video file playback
- [ ] Abstracted `PlayerController` interface
- [ ] Mode switcher (YouTube vs Local)
- [ ] YouTube Downloader (or guide)

## Phases

### Phase 1: Core Abstraction
**Status**: ⬜ Not Started
**Objective**: Refactor the codebase to support multiple player backends by abstracting the player control logic.
**Key Deliverables**:
-   `PlayerController` interface definition.
-   Updated `useYouTubePlayer` implementing the interface.
-   Refactored `useScrubberControls` to accept the generic interface.

### Phase 2: Local Player Implementation
**Status**: ⬜ Not Started
**Objective**: Implement the HTML5 video player and integrate it into the main UI.
**Key Deliverables**:
-   `LocalPlayer` component with file input.
-   `useLocalPlayer` hook implementing `PlayerController`.
-   UI toggle for switching modes in `ScrubberShell`.

### Phase 3: YouTube Downloader
**Status**: ⬜ Not Started
**Objective**: Implement a tool to help users download YouTube videos for local analysis.
**Key Deliverables**:
-   Research feasibility of server-side `ytdl` vs client-side helpers.
-   Implementation of `api/download` route (if feasible) or "How-To" UI.
-   Download interface in the app.

### Phase 4: Polish & Integration
**Status**: ⬜ Not Started
**Objective**: Ensure seamless experience across devices and modes.
**Key Deliverables**:
-   Mobile responsiveness tweaks for local file input.
-   Keybinding verification across both modes.
-   Error handling and empty states.
