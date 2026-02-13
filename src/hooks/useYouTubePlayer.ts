"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { YouTubePlayerController } from "@/types/player";
import type { YTPlayerInstance } from "@/types/youtube";

const SCRIPT_URL = "https://www.youtube.com/iframe_api";
const CONTAINER_ID = "yt-player-container";

let apiReadyPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.YT?.Player) return Promise.resolve();
  if (apiReadyPromise) return apiReadyPromise;
  apiReadyPromise = new Promise((resolve, reject) => {
    const existing = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      existing?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load YouTube API"));
    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(script, first);
  });
  return apiReadyPromise;
}

const YT_PLAYING = 1;

export function useYouTubePlayer(videoId: string | null) {
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);

  const controller: YouTubePlayerController = {
    play: useCallback(() => playerRef.current?.playVideo(), []),
    pause: useCallback(() => playerRef.current?.pauseVideo(), []),
    seekTo: useCallback((seconds: number) => {
      playerRef.current?.seekTo(seconds, true);
    }, []),
    getCurrentTime: useCallback(() => playerRef.current?.getCurrentTime() ?? 0, []),
    setPlaybackRate: useCallback((rate: number) => {
      playerRef.current?.setPlaybackRate(rate);
    }, []),
    getAvailablePlaybackRates: useCallback(
      () => playerRef.current?.getAvailablePlaybackRates() ?? [],
      []),
    getPlayerState: useCallback(() => playerRef.current?.getPlayerState() ?? -1, []),
    setVolume: useCallback((vol: number) => {
      playerRef.current?.setVolume(vol);
      setVolume(vol);
    }, []),
    getVolume: useCallback(() => playerRef.current?.getVolume() ?? 100, []),
    ready,
    loading,
    currentTime,
    duration,
    isPlaying,
    volume,
  };

  // Time polling: ~5–10/sec when ready
  useEffect(() => {
    if (!ready || !playerRef.current) return;
    const interval = setInterval(() => {
      const t = playerRef.current?.getCurrentTime() ?? 0;
      const d = playerRef.current?.getDuration() ?? 0;
      const state = playerRef.current?.getPlayerState() ?? -1;
      setCurrentTime(t);
      setDuration(d);
      setIsPlaying(state === YT_PLAYING);
    }, 200);
    return () => clearInterval(interval);
  }, [ready]);

  useEffect(() => {
    if (!videoId) {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setReady(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setReady(false);

    loadYouTubeAPI()
      .then(() => {
        if (cancelled) return;
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
        const YT = window.YT!;
        const player = new YT.Player(CONTAINER_ID, {
          width: "100%",
          height: "100%",
          videoId,
          playerVars: {
            playsinline: 1,
            enablejsapi: 1,
            controls: 0, // we use our own controls
            rel: 0,
            iv_load_policy: 3, // suppress annotations
            modestbranding: 1,
            fs: 0, // disable fullscreen button
          },
          events: {
            onReady: (event: { target: YTPlayerInstance }) => {
              if (cancelled) return;
              playerRef.current = event.target;
              setReady(true);
              setLoading(false);
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setReady(false);
    };
  }, [videoId]);

  return { controller, containerId: CONTAINER_ID };
}
