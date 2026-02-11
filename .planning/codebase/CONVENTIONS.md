# Coding Conventions

**Analysis Date:** 2026-02-11

## Naming Patterns

**Files:**
- Components: PascalCase, `.tsx` extension (e.g., `ControlBar.tsx`, `PlayerArea.tsx`)
- Utilities/libraries: camelCase, `.ts` extension (e.g., `time.ts`, `youtube.ts`)
- Hooks: prefix with `use`, PascalCase, `.ts` extension (e.g., `useYouTubePlayer.ts`)
- Types: `types/` directory with PascalCase `.ts` or `.d.ts` files (e.g., `player.ts`, `youtube.d.ts`)

**Functions:**
- camelCase throughout (pure functions and event handlers)
- Prefix hooks with `use` (e.g., `useYouTubePlayer`, `useKeyboardShortcuts`)
- Private helper functions use camelCase (e.g., `isTypingTarget`, `stepPresetFromStep`)
- Event handlers use camelCase verb pattern: `handleSpeedChange`, `togglePlayPause`, `handleKeyDown`

**Variables:**
- camelCase (e.g., `videoId`, `stepPreset`, `holdTickRateMs`)
- Constants: UPPER_SNAKE_CASE when truly constant (e.g., `STORAGE_KEY`, `SCRIPT_URL`)
- Prefix refs with name then "Ref": `playerRef`, `urlUpdateTimeoutRef`, `hasSeekedFromUrlRef`

**Types:**
- PascalCase for interfaces and type aliases (e.g., `YouTubePlayerController`, `ScrubberSettings`)
- Suffix union types with key type: `StepPresetKey`, `ScrubberUrlState`
- Props types suffix with "Props" (e.g., `ControlBarProps`, `PlayerAreaProps`)

## Code Style

**Formatting:**
- Prettier is configured but no `.prettierrc` file overrides defaults
- ESLint enabled with Next.js configurations: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Default Prettier behavior applies: 2-space indentation, semicolons, double quotes

**Linting:**
- ESLint config at `eslint.config.mjs` uses flat config format (eslint v9)
- Next.js core web vitals and TypeScript rules enforced
- Global ignores for `.next/`, `out/`, `build/`, `next-env.d.ts`

## Import Organization

**Order:**
1. React imports (useState, useEffect, etc.)
2. Type imports from same project
3. Library imports (constants, functions)
4. Component imports
5. Type definitions

Example from `src/components/ControlBar.tsx`:
```typescript
import { useState, useEffect, useRef } from "react";
import type { YouTubePlayerController } from "@/types/player";
import type { StepPresetKey } from "@/lib/constants";
import { STEP_PRESETS, HOLD_TICK_RATE_MS } from "@/lib/constants";
import { formatTime } from "@/lib/time";
```

**Path Aliases:**
- `@/` points to `src/` directory (configured in `tsconfig.json`)
- Used consistently throughout (e.g., `@/types/player`, `@/lib/constants`, `@/hooks/useYouTubePlayer`)

## Error Handling

**Pattern:** Silent catch with return to defaults
- When parsing fails (JSON, URL, etc.), catch without rethrowing
- Return sensible defaults rather than propagating errors
- Examples:
  - `src/lib/settings.ts` catches JSON.parse errors and returns `DEFAULT_SETTINGS`
  - `src/lib/youtube.ts` returns `null` for invalid URLs rather than throwing
  - `src/hooks/useYouTubePlayer.ts` catches API load errors and sets `loading` to false

**Error User Feedback:**
- State-driven error display: `[urlError, setUrlError]` in component, displayed conditionally
- Example in `src/components/ScrubberShell.tsx`: Error shown as alert text, cleared on retry
- Validation errors set as string state for UI display

**Promise Handling:**
- `.catch()` used for Promise rejection (e.g., `loadYouTubeAPI().catch()`)
- Cancellation token pattern for async cleanup: `cancelled` flag to prevent state updates after unmount
- Cleanup in return function of useEffect

## Logging

**Framework:** `console` (no dedicated logger)

**Patterns:**
- No logging found in source code; errors silently caught and handled
- Debugging would use browser console

## Comments

**When to Comment:**
- JSDoc blocks for exported functions and interfaces
- Inline comments for non-obvious algorithms or workarounds
- Comments placed above functions to explain purpose and behavior

**JSDoc/TSDoc:**
- Used for all exported functions and some complex logic
- Examples from `src/lib/time.ts`:
  ```typescript
  /**
   * Step current time by stepSize in direction (-1 = back, 1 = forward).
   * Result is clamped to [0, duration] if duration is provided.
   */
  export function stepTime(...)
  ```
- Type documentation in interface comments:
  ```typescript
  /** Current time in seconds (updated by polling). */
  currentTime: number;
  ```

## Function Design

**Size:** Generally 10-50 lines for non-component functions

**Parameters:**
- Use explicit parameters rather than object destructuring for simple functions
- Component props use object destructuring with type annotation
- Optional parameters use `?` and provide defaults
- Example from `src/lib/time.ts`:
  ```typescript
  export function stepTime(
    current: number,
    stepSize: number,
    direction: -1 | 1,
    duration?: number
  ): number
  ```

**Return Values:**
- Explicit return types on all exported functions
- Return `null` for "not found" cases (e.g., `extractVideoId` returns `string | null`)
- Use `void` for callback functions
- Single responsibility: functions return one value type

**Null/Undefined Handling:**
- Use `== null` to check both null and undefined
- Use `!= null` for null-checks in conditional branches
- Type narrowing used in conditionals (e.g., `if (controller?.ready)`)

## Module Design

**Exports:**
- Named exports for functions and types
- Default export for React components
- Example from `src/components/ControlBar.tsx`:
  ```typescript
  export function ControlBar({...}: ControlBarProps) { ... }
  ```

**Barrel Files:**
- Not used; imports reference specific files directly

**Module Responsibilities:**
- Utilities in `lib/`: Pure functions, no React, no hooks (e.g., `time.ts`, `youtube.ts`)
- Hooks in `hooks/`: React-specific logic and side effects
- Components in `components/`: UI rendering, uses hooks and utilities
- Types in `types/`: Interface and type definitions only

## Prop Forwarding

**React Components:**
- Props destructured in function signature with explicit typing
- Optional children via `children?: React.ReactNode`
- Example from `src/components/PlayerArea.tsx`:
  ```typescript
  type PlayerAreaProps = {
    videoId: string | null;
    isEmpty: boolean;
    containerId?: string;
  };

  export function PlayerArea({ videoId, isEmpty, containerId }: PlayerAreaProps) {
    ...
  }
  ```

## Client/Server Boundary

**"use client" Directive:**
- Used in all interactive components and hooks
- Placed at top of file before imports in client-side modules
- Examples: All components, all hooks, ScrubberShell

**SSR Safety:**
- Check `typeof window === "undefined"` before accessing browser APIs
- Return defaults or empty values for SSR context
- Example from `src/lib/urlState.ts`:
  ```typescript
  export function parseUrlState(): ScrubberUrlState {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    ...
  }
  ```

---

*Convention analysis: 2026-02-11*
