/**
 * Load/save scrubber settings to localStorage. Client-only.
 */

import type { ScrubberSettings } from "@/types/player";
import { STEP_PRESETS, HOLD_TICK_RATE_MS } from "@/lib/constants";
import type { StepPresetKey } from "@/lib/constants";

const STORAGE_KEY = "film-scrubber-settings";

const DEFAULT_SETTINGS: ScrubberSettings = {
  speed: 1,
  stepPreset: "medium",
  holdTickRateMs: HOLD_TICK_RATE_MS.default,
};

function isValidStepPreset(key: string): key is StepPresetKey {
  return key in STEP_PRESETS;
}

export function loadSettings(): ScrubberSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const speed = typeof parsed.speed === "number" ? parsed.speed : DEFAULT_SETTINGS.speed;
    const stepPreset = typeof parsed.stepPreset === "string" && isValidStepPreset(parsed.stepPreset)
      ? parsed.stepPreset
      : DEFAULT_SETTINGS.stepPreset;
    const holdTickRateMs = typeof parsed.holdTickRateMs === "number"
      ? Math.max(HOLD_TICK_RATE_MS.min, Math.min(HOLD_TICK_RATE_MS.max, parsed.holdTickRateMs))
      : DEFAULT_SETTINGS.holdTickRateMs;
    return { speed, stepPreset, holdTickRateMs };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ScrubberSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
