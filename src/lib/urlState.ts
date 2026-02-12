/**
 * URL search params for deep linking. Client-only.
 */

import type { ScrubberUrlState } from "@/types/player";

export function parseUrlState(): ScrubberUrlState {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const v = params.get("v") ?? undefined;
  const t = params.get("t");
  const speed = params.get("speed");
  const slowMo = params.get("slowMo");
  const scrubSpeed = params.get("scrubSpeed");
  return {
    v: v || undefined,
    t: t != null ? Number(t) : undefined,
    speed: speed != null ? Number(speed) : undefined,
    slowMo: slowMo != null ? Number(slowMo) : undefined,
    scrubSpeed: scrubSpeed != null ? Number(scrubSpeed) : undefined,
  };
}

export function buildSearchParams(state: {
  v?: string;
  t?: number;
  speed?: number;
  slowMoSpeed?: number;
  scrubSpeed?: number;
}): string {
  const params = new URLSearchParams();
  if (state.v) params.set("v", state.v);
  if (state.t != null && Number.isFinite(state.t)) params.set("t", state.t.toFixed(3));
  if (state.speed != null && Number.isFinite(state.speed)) params.set("speed", String(state.speed));
  if (state.slowMoSpeed != null && Number.isFinite(state.slowMoSpeed)) params.set("slowMo", String(state.slowMoSpeed));
  if (state.scrubSpeed != null && Number.isFinite(state.scrubSpeed)) params.set("scrubSpeed", String(state.scrubSpeed));
  return params.toString();
}

export function applyUrlStateToSettings(
  urlState: ScrubberUrlState
): Partial<{ videoId: string; seekTime: number; speed: number; slowMoSpeed: number; scrubSpeedMultiplier: number }> {
  const out: Partial<{ videoId: string; seekTime: number; speed: number; slowMoSpeed: number; scrubSpeedMultiplier: number }> = {};
  if (urlState.v) out.videoId = urlState.v;
  if (urlState.t != null && Number.isFinite(urlState.t)) out.seekTime = urlState.t;
  if (urlState.speed != null && Number.isFinite(urlState.speed)) out.speed = urlState.speed;
  if (urlState.slowMo != null && Number.isFinite(urlState.slowMo)) out.slowMoSpeed = urlState.slowMo;
  if (urlState.scrubSpeed != null && Number.isFinite(urlState.scrubSpeed)) out.scrubSpeedMultiplier = urlState.scrubSpeed;
  return out;
}
