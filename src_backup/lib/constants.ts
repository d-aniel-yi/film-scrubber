/**
 * Single source of truth for scrubber UX constants.
 * All components and hooks import from here.
 */

export const STEP_PRESETS = {
  fine: 0.033,
  medium: 0.05,
  coarse: 0.1,
} as const;

export type StepPresetKey = keyof typeof STEP_PRESETS;

export const JUMP_AMOUNTS = [1, 5, 10] as const; // seconds

/** Default hold-to-scrub tick interval (ms). User-configurable; min/max for UI. */
export const HOLD_TICK_RATE_MS = {
  default: 70,
  min: 40,
  max: 150,
} as const;

export const KEYBOARD_MAP = {
  playPause: " ",
  rewind: "j",
  pause: "k",
  forward: "l",
  stepBack: "ArrowLeft",
  stepForward: "ArrowRight",
} as const;
