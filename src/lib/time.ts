/**
 * Pure step/jump time math. Easy to unit test.
 */

/** Format seconds as mm:ss.sss for display. */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toFixed(3)}`;
}

/**
 * Step current time by stepSize in direction (-1 = back, 1 = forward).
 * Result is clamped to [0, duration] if duration is provided.
 */
export function stepTime(
  current: number,
  stepSize: number,
  direction: -1 | 1,
  duration?: number
): number {
  const next = current + direction * stepSize;
  return duration != null ? clampTime(next, duration) : Math.max(0, next);
}

/**
 * Clamp time to [0, duration]. Handles negative and past-end.
 */
export function clampTime(time: number, duration: number): number {
  if (duration <= 0) return 0;
  if (time < 0) return 0;
  if (time > duration) return duration;
  return time;
}

/**
 * Jump by a fixed number of seconds. Clamps to [0, duration].
 */
export function jumpTime(
  current: number,
  seconds: number,
  duration?: number
): number {
  const next = current + seconds;
  if (duration != null) return clampTime(next, duration);
  return Math.max(0, next);
}
