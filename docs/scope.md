# YouTube Film-Style Scrubber – Project Scope (v1)

## Goal
Build a **simple, fast web app (desktop + mobile)** that allows a user to load a YouTube video and analyze fast motions (golf swings, ball throws, volleyball hits) using **film-room style controls**:
- slow motion
- step-by-step scrubbing
- easy rewind / forward
- keyboard + touch-friendly controls

This is **“close enough” frame analysis**, not true frame-accurate playback.

---

## Tech Stack
- **Frontend:** React / Next.js
- **Hosting:** Vercel
- **Video:** YouTube IFrame Player API (`enablejsapi=1`)
- **Backend:** *Not required for v1*

Optional later:
- Next.js Route Handlers for metadata (title, thumbnail)
- Persistence (saved videos, notes, markers)

---

## What YouTube Allows (Reality Check)

### Supported via YouTube IFrame API
- Play / pause
- Set playback speed (`setPlaybackRate`)
- Get available speeds (`getAvailablePlaybackRates`)
- Seek to time (`seekTo(seconds)`)
- Read current playback time (`getCurrentTime`)

This enables:
- full-speed playback
- slow motion
- jump forward/back
- simulated rewind

### Not Truly Supported
- **True frame-by-frame stepping**
- **Native reverse playback**

YouTube seeks by **time**, not frames, and may snap to nearby keyframes. Reverse playback must be **simulated** via repeated backward seeks.

---

## Analysis Model: “Time-Step Scrubbing”
Instead of frames, the app uses **small time increments**.

### Step Presets
| Name   | Step Size | Approx Meaning |
|------|-----------|----------------|
| Fine | 0.033 s   | ~1/30 sec |
| Medium | 0.050 s | |
| Coarse | 0.100 s | |

Users can switch step sizes depending on how fine they want control.

---

## Core Interaction Design

### Playback Controls
- Play / Pause
- Speed selector (based on `getAvailablePlaybackRates`)
  - Common: 0.25× / 0.5× / 1× / 1.5× / 2×

### Scrubbing Controls
- Step backward / forward (± step size)
- Jump controls (±1s, ±5s, ±10s)
- Hold-to-scrub:
  - Press and hold rewind or forward
  - Repeated seeks at ~12–20 Hz
  - Creates “film-room” feel

### Desktop Keyboard (High ROI)
- Space → Play / Pause
- J → Rewind (hold)
- K → Pause
- L → Forward (hold)
- ← / → → Step backward / forward

### Mobile
- Large thumbable buttons
- Optional haptic feedback on step

---

## Inline Playback on Mobile (IMPORTANT)

### Goal
The video should **play inline on mobile** so the player stays on screen **with your custom controls visible**, rather than forcing fullscreen playback.

### Required Embed Parameters
When creating the YouTube player, include:
- `playsinline=1` → requests inline playback on iOS
- `enablejsapi=1` → required for JavaScript control

Example intent (not code):
- Inline playback enabled
- JS-controlled player
- Custom controls outside the iframe

### Expected Behavior
- On modern mobile browsers (iOS Safari, Chrome):
  - Video **can play inline**
  - Your control bar can remain visible
- Playback must be initiated by a **user gesture** (tap/click), which aligns with mobile autoplay rules

### Known Limitations / Reality Check
- Some environments **may still force fullscreen**, including:
  - Certain iOS versions
  - In-app browsers (Instagram, Twitter, etc.)
  - If the user taps YouTube’s native fullscreen button
- This behavior is **browser-controlled**, not something you can fully override

### Design Implications
- Assume **inline playback works most of the time**
- Design controls to:
  - Work immediately on first tap
  - Re-sync state if user returns from fullscreen
- Avoid depending on autoplay

**Bottom line:** Inline playback with on-screen controls is absolutely achievable and appropriate for this app, but you should treat fullscreen fallback as an acceptable edge case, not a bug.

---

## MVP Feature List (v1)

### Required
- Paste YouTube URL → extract video ID
- Load embedded player (inline on mobile)
- Film-style control bar
- Step size selector (Fine / Medium / Coarse)
- Speed control
- Current time display (mm:ss.sss)
- Pause-before-step behavior
- Local settings saved in `localStorage`

### Nice-to-Have
- Shareable URL with state:
  - video ID
  - current time
  - speed
  - step size
- Keyboard shortcuts
- Mobile-friendly layout

---

## No-Backend v1 Strategy
You can fully ship v1 without a backend:
- All logic client-side
- State stored in URL + localStorage
- No auth
- No persistence beyond the session

Add backend later only if you want:
- saved libraries
- notes / markers
- user accounts
- metadata via YouTube Data API (API keys)

---

## Implementation Notes / Gotchas

- Always **pause before stepping** for consistency
- Throttle `seekTo` calls to avoid stutter
- Expect slight jitter due to YouTube keyframe snapping
- Market controls as **“Step”**, not “Frame”
- Avoid firing seek calls faster than the player can respond

---

## What This App Will Do Well
- Isolate ball contact / release moments
- Break down swing phases
- Coach-style analysis using slow motion + micro-steps
- Feel intuitive and fast

## What It Will Not Do
- Exact frame-accurate stepping
- Smooth native reverse playback
- Professional broadcast-grade film review

---

## Future Extensions (Optional)
- Timestamp markers (“contact”, “release”, “follow-through”)
- Notes tied to timestamps
- Playlist / video library
- Export shareable analysis links
- Support for non-YouTube sources (MP4 / HLS)

---

## Summary
This project is **very feasible** with Next.js + YouTube embeds and can feel genuinely useful for sports motion analysis. As long as expectations are framed around **time-step control rather than true frames**, the UX will be strong and satisfying.
