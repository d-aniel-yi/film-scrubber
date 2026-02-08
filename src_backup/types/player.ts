/**
 * Player and app state types. No raw YouTube types leak out.
 */

import type { StepPresetKey } from "@/lib/constants";

/** Controller returned by useYouTubePlayer; only interface the app uses. */
export interface YouTubePlayerController {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  setPlaybackRate: (rate: number) => void;
  getAvailablePlaybackRates: () => number[];
  ready: boolean;
  loading: boolean;
}

/** Shape of settings persisted in localStorage. */
export interface ScrubberSettings {
  speed: number;
  stepPreset: StepPresetKey;
  holdTickRateMs: number;
}

/** Shape of URL search params for Phase 7 deep linking. */
export interface ScrubberUrlState {
  v?: string; // video ID
  t?: number; // current time (seconds)
  speed?: number;
  step?: number; // step size in seconds
  holdTick?: number; // hold tick rate ms
}
