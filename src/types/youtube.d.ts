/**
 * YouTube IFrame API (loaded via script tag). See https://developers.google.com/youtube/iframe_api_reference
 */
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YTNamespace {
  Player: new (
    elementId: string,
    options: YTPlayerOptions
  ) => YTPlayerInstance;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

export interface YTPlayerOptions {
  width?: string | number;
  height?: string | number;
  videoId?: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (event: { target: YTPlayerInstance }) => void;
    onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
  };
}

export interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  setPlaybackRate: (suggestedRate: number) => void;
  getAvailablePlaybackRates: () => number[];
  getDuration: () => number;
  getPlayerState: () => number; // 1=playing, 2=paused, etc.
  getVolume: () => number; // 0–100
  setVolume: (volume: number) => void;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
  destroy: () => void;
}

export { };
