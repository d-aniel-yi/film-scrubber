/**
 * URL search params for deep linking. Client-only.
 */

import type { ScrubberUrlState } from "@/types/player";
import { STEP_PRESETS } from "@/lib/constants";
import type { StepPresetKey } from "@/lib/constants";

export function parseUrlState(): ScrubberUrlState {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const v = params.get("v") ?? undefined;
  const t = params.get("t");
  const speed = params.get("speed");
  const step = params.get("step");
  const holdTick = params.get("holdTick");
  return {
    v: v || undefined,
    t: t != null ? Number(t) : undefined,
    speed: speed != null ? Number(speed) : undefined,
    step: step != null ? Number(step) : undefined,
    holdTick: holdTick != null ? Number(holdTick) : undefined,
  };
}

function stepPresetFromStep(stepSeconds: number): StepPresetKey | undefined {
  const entries = Object.entries(STEP_PRESETS) as [StepPresetKey, number][];
  const found = entries.find(([, v]) => Math.abs(v - stepSeconds) < 0.001);
  return found?.[0];
}

export function buildSearchParams(state: {
  v?: string;
  t?: number;
  speed?: number;
  stepPreset?: StepPresetKey;
  step?: number;
  holdTick?: number;
}): string {
  const params = new URLSearchParams();
  if (state.v) params.set("v", state.v);
  if (state.t != null && Number.isFinite(state.t)) params.set("t", state.t.toFixed(3));
  if (state.speed != null && Number.isFinite(state.speed)) params.set("speed", String(state.speed));
  const step = state.step ?? (state.stepPreset ? STEP_PRESETS[state.stepPreset] : undefined);
  if (step != null) params.set("step", String(step));
  if (state.holdTick != null && Number.isFinite(state.holdTick)) params.set("holdTick", String(state.holdTick));
  return params.toString();
}

export function applyUrlStateToSettings(
  urlState: ScrubberUrlState
): Partial<{ videoId: string; seekTime: number; speed: number; stepPreset: StepPresetKey; holdTickRateMs: number }> {
  const out: Partial<{ videoId: string; seekTime: number; speed: number; stepPreset: StepPresetKey; holdTickRateMs: number }> = {};
  if (urlState.v) out.videoId = urlState.v;
  if (urlState.t != null && Number.isFinite(urlState.t)) out.seekTime = urlState.t;
  if (urlState.speed != null && Number.isFinite(urlState.speed)) out.speed = urlState.speed;
  if (urlState.step != null) {
    const preset = stepPresetFromStep(urlState.step);
    if (preset) out.stepPreset = preset;
  }
  if (urlState.holdTick != null && Number.isFinite(urlState.holdTick)) out.holdTickRateMs = urlState.holdTick;
  return out;
}
