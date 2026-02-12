/**
 * Single source of truth for scrubber UX constants.
 * All components and hooks import from here.
 */

export const SLOW_MO_SPEED = {
  default: 0.25,
  min: 0.1,
  max: 0.75,
} as const;

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
