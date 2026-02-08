# Progress and handoff

## One-line status

All phases 0–9 implemented. App is ready for Vercel deploy (run `vercel` or connect repo; login required). No analytics added.

## Current phase

- **Phase 9** — Done
- Next up: Deploy to Vercel (user runs `vercel` or links repo in Vercel dashboard).

## Last completed

- Phase 9: Footer with Feedback and Vercel links. Phases 0–8: full film-style scrubber with URL load, YouTube player, speed/time, step/jump, hold-to-scrub, keyboard shortcuts, localStorage persistence, deep linking (URL params), invalid-URL handling, help panel, focus states, responsive controls.

## Key files (quick map)

| Path | Purpose |
|------|---------|
| `src/lib/constants.ts` | Step presets, jump amounts, hold tick rate, keyboard map |
| `src/lib/youtube.ts` | Pure `extractVideoId(url)` |
| `src/lib/time.ts` | `stepTime`, `clampTime`, `jumpTime`, `formatTime` |
| `src/lib/settings.ts` | `loadSettings` / `saveSettings` (localStorage) |
| `src/lib/urlState.ts` | `parseUrlState`, `buildSearchParams`, `applyUrlStateToSettings` (deep link) |
| `src/types/player.ts` | `YouTubePlayerController`, `ScrubberSettings`, `ScrubberUrlState` |
| `src/types/youtube.d.ts` | YT IFrame API types |
| `src/hooks/useYouTubePlayer.ts` | YT IFrame API; only place that touches YT |
| `src/hooks/useScrubberControls.ts` | Step/jump/hold logic |
| `src/hooks/useKeyboardShortcuts.ts` | Global keyboard shortcuts |
| `src/components/ScrubberShell.tsx` | Top-level state, URL/settings, layout |
| `src/components/ControlBar.tsx` | Play, speed, time, step, jump, hold, tick rate |
| `src/components/UrlInput.tsx` | URL input + Load |
| `src/components/PlayerArea.tsx` | 16:9 area; empty state or YT container |
| `src/components/HelpPanel.tsx` | Collapsible "How to use" + keyboard list |
| `docs/tasks.md` | Phase checklists |
| `docs/scope.md` | Product and UX rules |
| `docs/plan.md` | Strategy and foundation |

## Decisions this session

- Hold step uses same Fine/Medium/Coarse as tap step (per plan).
- Deep linking: optional Phase 7 implemented (parse `?v=&t=&speed=&step=&holdTick=` on load; debounced URL update).
- Feedback link points to placeholder `https://github.com`; replace with real repo or form.

## Known gotchas / open items

- Vercel deploy requires `vercel login` (not done in this session).
- Replace Feedback href in `src/app/page.tsx` with your repo or feedback form.
- Optional: add minimal analytics (e.g. Vercel Analytics) if desired.
