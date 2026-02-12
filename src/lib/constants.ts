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

/** Scrub speed: slow for precise review, fast for navigation. */
export const SCRUB_SPEED = {
  slow: 1,
  fast: 4,
  min: 0.5,
  max: 10,
} as const;

export const KEYBOARD_MAP = {
  playPause: " ",
  rewind: "j",
  pause: "k",
  forward: "l",
  stepBack: "ArrowLeft",
  stepForward: "ArrowRight",
} as const;
