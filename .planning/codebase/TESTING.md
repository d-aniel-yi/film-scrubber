# Testing Patterns

**Analysis Date:** 2026-02-11

## Test Framework

**Runner:**
- Vitest v4.0.18
- Config: `vitest.config.ts`

**Assertion Library:**
- Vitest built-in expect API

**Run Commands:**
```bash
npm run test              # Run tests in watch mode
npm run test:run          # Run tests once (CI mode)
```

**UI:**
- `@vitest/ui` v4.0.18 available for test visualization

## Test File Organization

**Location:**
- Co-located with source files in same directory
- Naming convention: `[filename].test.ts` or `[filename].spec.ts`

**File Examples:**
- `src/lib/time.test.ts` - Tests for `src/lib/time.ts`
- `src/lib/youtube.test.ts` - Tests for `src/lib/youtube.ts`

**Configuration in vitest.config.ts:**
```typescript
include: ["src/**/*.test.ts", "src/**/*.spec.ts"]
```

## Test Structure

**Suite Organization:**

The tests follow a standard arrange-act-assert pattern using `describe` blocks and `it` assertions:

```typescript
import { describe, it, expect } from "vitest";
import { extractVideoId } from "./youtube";

describe("extractVideoId", () => {
  it("extracts ID from youtube.com/watch?v=ID", () => {
    expect(extractVideoId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(extractVideoId(`https://youtube.com/watch?v=${ID}`)).toBe(ID);
  });

  it("returns null for null, undefined, empty string", () => {
    expect(extractVideoId(null)).toBeNull();
    expect(extractVideoId(undefined)).toBeNull();
    expect(extractVideoId("")).toBeNull();
  });
});
```

**Patterns:**
- Setup: Constants defined at module level (e.g., `const ID = "dQw4w9WgXcQ";`)
- Test cases: Multiple assertions per `it()` for related behavior
- Teardown: Not used (tests are pure functions)

## Mocking

**Framework:** Not used in current test suite

**What to Mock:**
- Browser APIs (localStorage, fetch, YouTube API) would need mocking but none currently tested
- External network requests

**What NOT to Mock:**
- Pure functions (tested directly)
- Constants
- Type checking

**Current Approach:**
Tests focus on pure utility functions in `lib/` directory that have no side effects, so mocking is not needed.

## Fixtures and Factories

**Test Data:**
- Inline constants at module level
- Example from `src/lib/youtube.test.ts`:
  ```typescript
  const ID = "dQw4w9WgXcQ";
  ```

**Parameterized Tests:**
- Not used; multiple assertions in single `it()` block instead
- Example from `src/lib/time.test.ts`:
  ```typescript
  it("clamps to [0, duration]", () => {
    expect(clampTime(-1, 100)).toBe(0);
    expect(clampTime(0, 100)).toBe(0);
    expect(clampTime(50, 100)).toBe(50);
    expect(clampTime(100, 100)).toBe(100);
    expect(clampTime(101, 100)).toBe(100);
  });
  ```

## Coverage

**Requirements:** Not enforced

**Current Tests:**
- `src/lib/time.ts`: Full coverage of `clampTime`, `stepTime`, `jumpTime` functions
- `src/lib/youtube.ts`: Full coverage of `extractVideoId` function

**Untested Areas:**
- React components (ControlBar, PlayerArea, ScrubberShell, etc.)
- React hooks (useYouTubePlayer, useScrubberControls, useKeyboardShortcuts)
- Settings persistence (loadSettings, saveSettings)
- URL state parsing (parseUrlState, buildSearchParams, applyUrlStateToSettings)
- Layout and app shell

## Test Types

**Unit Tests:**
- Scope: Pure utility functions in `lib/` directory
- Approach: Direct function calls with various inputs, assert output
- Examples: `time.test.ts`, `youtube.test.ts`
- Environment: Node.js (configured as `environment: "node"` in vitest.config.ts)

**Integration Tests:**
- Not used

**E2E Tests:**
- Not implemented

## Common Patterns

**Testing Pure Functions:**

From `src/lib/time.test.ts`:
```typescript
describe("clampTime", () => {
  it("clamps to [0, duration]", () => {
    expect(clampTime(-1, 100)).toBe(0);
    expect(clampTime(0, 100)).toBe(0);
    expect(clampTime(50, 100)).toBe(50);
    expect(clampTime(100, 100)).toBe(100);
    expect(clampTime(101, 100)).toBe(100);
  });

  it("handles zero duration", () => {
    expect(clampTime(5, 0)).toBe(0);
  });
});
```

**Testing Null/Empty Returns:**

From `src/lib/youtube.test.ts`:
```typescript
it("returns null for null, undefined, empty string", () => {
  expect(extractVideoId(null)).toBeNull();
  expect(extractVideoId(undefined)).toBeNull();
  expect(extractVideoId("")).toBeNull();
  expect(extractVideoId("   ")).toBeNull();
});
```

**Testing Multiple Input Formats:**

From `src/lib/youtube.test.ts`:
```typescript
it("extracts ID from youtube.com/watch?v=ID", () => {
  expect(extractVideoId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID);
  expect(extractVideoId(`https://youtube.com/watch?v=${ID}`)).toBe(ID);
});

it("extracts ID from youtu.be/ID", () => {
  expect(extractVideoId(`https://youtu.be/${ID}`)).toBe(ID);
});

it("extracts ID from youtube.com/shorts/ID", () => {
  expect(extractVideoId(`https://www.youtube.com/shorts/${ID}`)).toBe(ID);
});

it("extracts ID from youtube.com/embed/ID", () => {
  expect(extractVideoId(`https://www.youtube.com/embed/${ID}`)).toBe(ID);
});
```

**Edge Cases:**

From `src/lib/youtube.test.ts`:
```typescript
it("returns null for invalid or unsupported URLs", () => {
  expect(extractVideoId("https://example.com")).toBeNull();
  expect(extractVideoId("https://youtube.com")).toBeNull();
  expect(extractVideoId("not a url")).toBeNull();
  expect(extractVideoId("https://www.youtube.com/watch")).toBeNull();
  expect(extractVideoId("https://www.youtube.com/watch?v=")).toBeNull();
  expect(extractVideoId("https://www.youtube.com/watch?v=short")).toBeNull(); // ID must be 11 chars
});
```

## Path Aliases in Tests

**Configuration:**
- `vitest.config.ts` defines alias: `@/` → `./src`
- Can be used in test imports (though currently imports use relative paths)

## Test Environment

**Node.js:** Configured in `vitest.config.ts` as `environment: "node"`

**Browser APIs:** Not available in test environment; code using browser APIs (localStorage, window, document) cannot be tested in current setup

**Resolution:**
- Module resolution uses bundler strategy with TypeScript path mapping

---

*Testing analysis: 2026-02-11*
