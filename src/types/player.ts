/**
 * Player and app state types. No raw YouTube types leak out.
 */

/** Controller returned by useYouTubePlayer; only interface the app uses. */
export interface YouTubePlayerController {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  setPlaybackRate: (rate: number) => void;
  getAvailablePlaybackRates: () => number[];
  /** 1=playing, 2=paused, 3=buffering, 5=cued, 0=unstarted, -1=ended */
  getPlayerState: () => number;
  ready: boolean;
  loading: boolean;
  /** Current time in seconds (updated by polling). */
  currentTime: number;
  /** Total duration in seconds (updated by polling/state change). */
  duration: number;
  /** True when state is playing. */
  isPlaying: boolean;
}

/** Shape of settings persisted in localStorage. */
export interface ScrubberSettings {
  speed: number;
  slowMoSpeed: number;
  scrubSpeedMultiplier: number;
}

/** Shape of URL search params for Phase 7 deep linking. */
export interface ScrubberUrlState {
  v?: string; // video ID
  t?: number; // current time (seconds)
  speed?: number;
  slowMo?: number; // slow-mo speed
  scrubSpeed?: number; // scrub speed multiplier
}
