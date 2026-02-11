# Codebase Structure

**Analysis Date:** 2026-02-11

## Directory Layout

```
h:/film/
├── src/                          # All application source code
│   ├── app/                       # Next.js App Router pages and layout
│   │   ├── layout.tsx             # Root layout with fonts and metadata
│   │   ├── page.tsx               # Home page (entry point)
│   │   └── globals.css            # Root CSS styles with Tailwind
│   ├── components/                # React UI components
│   │   ├── ScrubberShell.tsx       # Root app shell (client state orchestration)
│   │   ├── PlayerArea.tsx          # YouTube player container
│   │   ├── ControlBar.tsx          # Playback controls UI (play/pause, seek, step, speed)
│   │   ├── UrlInput.tsx            # YouTube URL input field
│   │   └── HelpPanel.tsx           # Help/documentation display
│   ├── hooks/                     # Custom React hooks
│   │   ├── useYouTubePlayer.ts    # YouTube IFrame API initialization and control
│   │   ├── useScrubberControls.ts # Step/jump/hold-to-scrub logic
│   │   └── useKeyboardShortcuts.ts # Keyboard event handlers and mappings
│   ├── lib/                       # Utility functions and constants
│   │   ├── constants.ts           # Step presets, jump amounts, hold tick rates, keyboard bindings
│   │   ├── settings.ts            # localStorage read/write interface
│   │   ├── youtube.ts             # YouTube URL parsing (extractVideoId)
│   │   ├── urlState.ts            # URL search param parsing and building
│   │   ├── time.ts                # Time math utilities (formatTime, stepTime, jumpTime)
│   │   ├── time.test.ts           # Unit tests for time utilities
│   │   └── youtube.test.ts        # Unit tests for YouTube URL parsing
│   └── types/                     # TypeScript type definitions
│       ├── player.ts              # YouTubePlayerController, ScrubberSettings, ScrubberUrlState
│       └── youtube.d.ts           # YouTube IFrame API types (window.YT)
├── public/                        # Static assets (favicons, images)
├── docs/                          # Documentation files
├── node_modules/                  # Dependencies (generated)
├── .next/                         # Next.js build output (generated)
├── .planning/                     # GSD planning documents
├── .git/                          # Git repository
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies and scripts
├── package-lock.json              # Dependency lock file (generated)
├── tsconfig.json                  # TypeScript compiler options
├── next.config.ts                 # Next.js configuration
├── eslint.config.mjs              # ESLint linting rules
├── postcss.config.mjs             # PostCSS/Tailwind CSS configuration
├── vitest.config.ts               # Vitest test runner configuration
├── next-env.d.ts                  # Next.js generated types (generated)
└── README.md                      # Project documentation
```

## Directory Purposes

**src/app:**
- Purpose: Next.js App Router pages and global layout
- Contains: React Server Components and Client Components
- Key files:
  - `layout.tsx` - Root HTML layout, font imports, metadata
  - `page.tsx` - Home page component (renders ScrubberShell)
  - `globals.css` - Global Tailwind CSS styles

**src/components:**
- Purpose: Reusable React UI components
- Contains: Presentational components (visual rendering + event callbacks)
- Key files:
  - `ScrubberShell.tsx` - Root client component managing all app state and hook coordination
  - `PlayerArea.tsx` - 16:9 aspect ratio container for YouTube player embed
  - `ControlBar.tsx` - Control buttons (play/pause, step, jump, hold-to-scrub, speed, time display)
  - `UrlInput.tsx` - Text input + Load button for pasting YouTube URLs
  - `HelpPanel.tsx` - Help documentation and keyboard shortcut reference

**src/hooks:**
- Purpose: Custom React hooks for reusable logic with side effects
- Contains: Hooks that manage effects, polling, event listeners
- Key files:
  - `useYouTubePlayer.ts` - Loads YouTube API, creates player instance, exposes YouTubePlayerController
  - `useScrubberControls.ts` - Implements step/jump/hold-to-scrub operations with hold-to-scroll state management
  - `useKeyboardShortcuts.ts` - Attaches keyboard listeners, prevents typing targets from triggering controls

**src/lib:**
- Purpose: Pure utility functions, constants, and client-side storage interface
- Contains: Stateless functions, no React dependencies, testable via unit tests
- Key files:
  - `constants.ts` - STEP_PRESETS (fine 0.033s, medium 0.05s, coarse 0.1s), JUMP_AMOUNTS [1, 5, 10s], HOLD_TICK_RATE_MS (default 70, min 40, max 150)
  - `youtube.ts` - `extractVideoId()` - parses youtube.com/watch, youtu.be, shorts, embed URLs
  - `urlState.ts` - `parseUrlState()`, `buildSearchParams()`, `applyUrlStateToSettings()` for deep linking
  - `settings.ts` - `loadSettings()`, `saveSettings()` - localStorage interface with validation and defaults
  - `time.ts` - `formatTime()` (mm:ss.sss format), `stepTime()`, `jumpTime()`, `clampTime()` - time calculations
  - `*.test.ts` - Vitest unit tests for pure functions

**src/types:**
- Purpose: TypeScript type definitions and interfaces
- Contains: Type definitions for app-wide use
- Key files:
  - `player.ts` - `YouTubePlayerController` interface, `ScrubberSettings`, `ScrubberUrlState` types
  - `youtube.d.ts` - YouTube IFrame API type declarations (window.YT, YT.Player methods)

## Key File Locations

**Entry Points:**
- `h:/film/src/app/page.tsx` - Home page, renders ScrubberShell
- `h:/film/src/components/ScrubberShell.tsx` - Root client component, initializes all state and hooks
- `h:/film/src/hooks/useYouTubePlayer.ts` - First hook loaded; initializes YouTube API globally

**Configuration:**
- `h:/film/tsconfig.json` - TypeScript compiler options (target ES2017, @/* path alias)
- `h:/film/next.config.ts` - Next.js configuration (minimal, no custom config)
- `h:/film/package.json` - Dependencies (Next.js 16, React 19, Tailwind 4, Vitest 4)
- `h:/film/.eslintrc.mjs` - ESLint rules
- `h:/film/postcss.config.mjs` - Tailwind PostCSS plugin
- `h:/film/vitest.config.ts` - Test runner config

**Core Logic:**
- `h:/film/src/lib/constants.ts` - All UX configuration (step sizes, jump amounts, hold tick rates, keyboard bindings)
- `h:/film/src/lib/youtube.ts` - YouTube URL parsing (5 URL format patterns supported)
- `h:/film/src/lib/time.ts` - Time calculations (step, jump, clamp)
- `h:/film/src/lib/settings.ts` - localStorage persistence layer
- `h:/film/src/lib/urlState.ts` - URL search param serialization/deserialization

**Testing:**
- `h:/film/src/lib/time.test.ts` - Tests for formatTime, stepTime, jumpTime, clampTime
- `h:/film/src/lib/youtube.test.ts` - Tests for extractVideoId with various URL formats
- `h:/film/vitest.config.ts` - Vitest runner configuration

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `ScrubberShell.tsx`, `ControlBar.tsx`)
- Hooks: `useNameInCamelCase.ts` (e.g., `useYouTubePlayer.ts`, `useScrubberControls.ts`)
- Utilities: `camelCase.ts` (e.g., `constants.ts`, `settings.ts`, `youtube.ts`)
- Tests: `*.test.ts` or `*.spec.ts` (e.g., `youtube.test.ts`)
- Types: `camelCase.ts` (e.g., `player.ts`, `youtube.d.ts`)

**Directories:**
- Plural names: `components/`, `hooks/`, `types/`
- Singular names: `lib/`, `app/`
- No index pattern; each component/hook is a named export from its own file

**Functions:**
- Hooks: Start with `use` prefix (React convention)
- Pure utilities: `camelCase` (e.g., `extractVideoId`, `formatTime`, `stepTime`)
- Type guards: `isValidStepPreset`, `isTypingTarget`
- Initialization functions: `loadYouTubeAPI`, `loadSettings`

**Variables:**
- State variables: `camelCase` (e.g., `videoId`, `stepPreset`, `currentTime`)
- Refs: `camelCase` suffix with `Ref` (e.g., `playerRef`, `holdIntervalRef`, `hasSeekedFromUrlRef`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `STORAGE_KEY`, `CONTAINER_ID`, `SCRIPT_URL`)

**Types:**
- Interfaces: `PascalCase` with `Interface` suffix optional (e.g., `YouTubePlayerController`, `ScrubberSettings`)
- Type aliases: `PascalCase` (e.g., `StepPresetKey`, `ScrubberUrlState`)
- Union types: Descriptive PascalCase (e.g., `StepPresetKey = 'fine' | 'medium' | 'coarse'`)

## Where to Add New Code

**New Feature - Video Effects (e.g., brightness/saturation adjustment):**
1. Add hook: `src/hooks/useVideoEffects.ts` - state and control methods
2. Add component: `src/components/EffectsPanel.tsx` - UI controls
3. Add utilities: `src/lib/effects.ts` - pure calculations
4. Add types: Update `src/types/player.ts` with effects state shape
5. Update shell: `src/components/ScrubberShell.tsx` - mount new hook, pass to component
6. Add tests: `src/lib/effects.test.ts` - test calculations

**New Component (e.g., Subtitle Display):**
1. Create: `src/components/SubtitleDisplay.tsx` - render and event handlers
2. Import in: `src/components/ScrubberShell.tsx`
3. Pass state/callbacks as props from shell
4. Style with Tailwind classes (no separate CSS files)

**New Utility Function:**
1. Create or update: `src/lib/[domain].ts` (group by domain: youtube, time, settings, etc.)
2. Export as named function: `export function myUtility() { ... }`
3. Add tests: `src/lib/[domain].test.ts` if pure calculation
4. Import in consuming hook/component: `import { myUtility } from "@/lib/[domain]"`

**New Custom Hook:**
1. Create: `src/hooks/use[Name].ts`
2. Marked with `"use client"` if uses browser APIs
3. Return an object with methods/state: `{ method1(), method2(), state1, state2 }`
4. Hook up in: `src/components/ScrubberShell.tsx`

**Configuration Change:**
1. Add constant to: `src/lib/constants.ts` (STEP_PRESETS, JUMP_AMOUNTS, HOLD_TICK_RATE_MS, KEYBOARD_MAP)
2. Reference from hooks/components: `import { CONSTANT_NAME } from "@/lib/constants"`
3. Single source of truth; all UX tuning in one file

## Special Directories

**node_modules:**
- Purpose: NPM package dependencies
- Generated: Yes (npm install)
- Committed: No (.gitignore)
- Key packages: next, react, react-dom, tailwindcss, vitest

**.next:**
- Purpose: Next.js build output and cache
- Generated: Yes (npm run build)
- Committed: No (.gitignore)
- Contains: Compiled pages, static assets, build cache

**public:**
- Purpose: Static assets served at root path
- Generated: No (manually maintained)
- Committed: Yes
- Examples: favicons, logos, social preview images

**docs:**
- Purpose: Project documentation
- Generated: No (manually maintained)
- Committed: Yes
- Examples: usage guide, API docs, development notes

**.planning:**
- Purpose: GSD planning and codebase analysis documents
- Generated: By GSD tools
- Committed: Yes (for team reference)
- Examples: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md

---

*Structure analysis: 2026-02-11*
