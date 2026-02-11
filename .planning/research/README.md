# Film Clicker Research — Index

This directory contains research and analysis to inform the redesign of the YouTube film scrubber into a dedicated film clicker tool.

## Documents

### FEATURES.md (Primary)
**Purpose:** Identify and categorize all features for the film clicker redesign.

**Content:**
- Executive summary of film clicker vs. generic video player UX
- **Table stakes** (23 features): What users expect; non-negotiable
  - Core playback (play/pause, seek bar, time, speed)
  - Touch-friendly controls (large buttons, active states, haptic feedback)
  - Scrubbing precision (step, jump, hold-to-scrub, configurable speed)
  - Settings persistence (localStorage for speed, step, hold config)

- **Differentiators** (20+ features): What makes this feel like a dedicated clicker
  - Film-clicker control layout (vertical hierarchy optimized for touch)
  - Slow-mo + realtime toggle (not buried in menus)
  - Smooth hold-to-scrub (reduce stutter)
  - Keyboard shortcuts (J/K/L for power users)
  - Deep linking (share specific moments)
  - Settings panel (collapsible, grouped by function)

- **Anti-features** (11 explicit non-goals): What to deliberately avoid
  - Multiple video backends (YouTube only)
  - Frame-level steps (seconds only)
  - User accounts / cloud sync
  - Playlists / multi-video library
  - Annotations / drawing on video

- **Complexity matrix**: Low (1–3 days) → Medium (3–7 days) → High (1–2 weeks)
- **Dependency graph**: Shows how features build on each other
- **Recommended build sequence**: 5 phases, from foundation to integration

**Key insight:** Everything depends on a solid player controller + settings layer. Don't restructure these after initial build.

**Audience:** Product managers, developers, designers (especially for handoff to requirements definition)

---

## How to Use This Research

### For Defining Requirements
1. Read "Executive Summary" to understand the landscape
2. Review **Table Stakes** section — these are your MVP
3. Review **Differentiators** section — prioritize based on resource availability
4. Check **Anti-features** section — establish boundaries with stakeholders
5. Use **Complexity matrix** and **Dependency graph** to estimate timeline
6. Follow **Recommended build sequence** for phased development

### For Design Decisions
1. Section 2.1 justifies the film-clicker control layout
2. Section 2.2 explains why slow-mo should be a toggle, not a dropdown
3. Section 2.3 identifies pain points in hold-to-scrub that need fixing
4. Section 6 validates design choices against professional tools

### For Quality Gates
- Verify all features are categorized and justified (✓)
- Ensure complexity and dependencies are documented (✓)
- Confirm no feature is "stuck in limbo" without clear status (✓)

---

## Next Steps

1. **Requirements Definition** → Write `REQUIREMENTS.md` with acceptance criteria for each feature
2. **Design Specification** → Create `DESIGN.md` with layout mocks, button sizes, interactions
3. **Backlog Grooming** → Map features to sprints using the build sequence and complexity estimates
4. **Acceptance Testing** → Develop test matrix based on the quality gates section

---

## Context Files
- `../PROJECT.md` — Overall project charter and current state
- `../../docs/scope.md` — Original project scope (foundation; still mostly valid)
- `../../docs/plan.md` — Build plan and no-slop foundation strategy

---

**Last Updated:** 2026-02-11
**Research Type:** Features dimension (subsequent phase after initial MVP)
**Status:** Complete and ready for requirements definition handoff
