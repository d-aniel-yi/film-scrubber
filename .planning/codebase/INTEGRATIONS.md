# External Integrations

**Analysis Date:** 2026-02-11

## APIs & External Services

**YouTube IFrame API:**
- Service: YouTube (Google)
- What it's used for: Embedding and controlling YouTube video playback in the application
  - SDK/Client: YouTube IFrame API (loaded dynamically via script tag from `https://www.youtube.com/iframe_api`)
  - Auth: No authentication required (public API for embedded players)
  - Implementation: `src/hooks/useYouTubePlayer.ts` - Custom hook that loads the YouTube IFrame API and manages player lifecycle

**Google Fonts:**
- Service: Google Fonts
- What it's used for: Typography (Geist Sans and Geist Mono font families)
  - SDK/Client: `next/font/google`
  - Auth: No authentication required
  - Implementation: `src/app/layout.tsx` - Imported via Next.js font optimization

## Data Storage

**Databases:**
- Not used - Application is client-side only

**File Storage:**
- Not used - Application uses only local browser storage

**Client-Side Storage:**
- Browser localStorage - Used for persisting scrubber settings
  - Implementation: `src/lib/settings.ts` - `loadSettings()` and `saveSettings()` functions
  - Data persisted: `ScrubberSettings` interface (step preset, hold tick rate, UI preferences)

**Caching:**
- Not implemented - Application relies on browser caching for static assets

## Authentication & Identity

**Auth Provider:**
- None - Application is public and requires no authentication

## Monitoring & Observability

**Error Tracking:**
- None - No external error tracking service configured

**Logs:**
- Browser console only - Errors logged to browser console via standard `console` methods

## CI/CD & Deployment

**Hosting:**
- Configured for Vercel (Next.js default, `next.config.ts` is minimal and compatible)
- Can also deploy to any Node.js hosting platform

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or other CI configuration present

## Environment Configuration

**Required env vars:**
- None - Application has no external service dependencies requiring secrets

**Optional env vars:**
- Can be added for future integrations (e.g., analytics services, error tracking)

**Secrets location:**
- Not applicable - No secrets currently required

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## External Data Sources

**URL-based State Management:**
- Application builds and parses URL query parameters for video ID and scrubber settings
- Implementation: `src/lib/urlState.ts`
- Allows sharing scrubber configuration via URL: `?videoId=...&stepPreset=...&settings=...`

---

*Integration audit: 2026-02-11*
