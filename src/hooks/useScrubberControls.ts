"use client";

import { useCallback, useRef, useState } from "react";
import type { YouTubePlayerController } from "@/types/player";
import { JUMP_AMOUNTS } from "@/lib/constants";
import { jumpTime } from "@/lib/time";

type HoldDirection = "rewind" | "forward" | "rewind-fast" | "forward-fast" | null;

// Rewind uses seekTo (no reverse playback in YouTube).
// Higher throttle = fewer seeks = less mobile buffering stutter.
const SEEK_THROTTLE_MS = 150;

export function useScrubberControls(
  controller: YouTubePlayerController | null,
  scrubSpeedFast: number,
  currentSpeed: number
) {
  const rafIdRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);
  const videoStartTimeRef = useRef<number | null>(null);
  const lastSeekTimeRef = useRef<number>(0);
  const wasPlayingRef = useRef(false);
  const usingPlaybackRef = useRef(false);
  const [holdDirection, setHoldDirection] = useState<HoldDirection>(null);

  const clearHold = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    holdStartTimeRef.current = null;
    videoStartTimeRef.current = null;
  }, []);

  const stopHold = useCallback(() => {
    clearHold();
    // Restore playback rate if forward hold changed it
    if (usingPlaybackRef.current && controller?.ready) {
      controller.setPlaybackRate(currentSpeed);
      usingPlaybackRef.current = false;
    }
    if (wasPlayingRef.current && controller?.ready) {
      controller.play();
    } else {
      controller?.pause();
    }
    wasPlayingRef.current = false;
    setHoldDirection(null);
  }, [clearHold, controller, currentSpeed]);

  const jump = useCallback(
    (seconds: number) => {
      if (!controller?.ready) return;
      controller.pause();
      const t = controller.getCurrentTime();
      const next = jumpTime(t, seconds);
      controller.seekTo(next);
    },
    [controller]
  );

  const startRewind = useCallback(
    (direction: "rewind" | "rewind-fast", multiplier: number) => {
      if (!controller?.ready) return;
      clearHold();
      wasPlayingRef.current = controller.isPlaying;
      usingPlaybackRef.current = false;
      controller.pause();
      setHoldDirection(direction);

      videoStartTimeRef.current = controller.getCurrentTime();
      holdStartTimeRef.current = performance.now();
      lastSeekTimeRef.current = 0;

      const scrub = () => {
        if (!controller?.ready || holdStartTimeRef.current === null || videoStartTimeRef.current === null) return;
        const now = performance.now();
        if (now - lastSeekTimeRef.current >= SEEK_THROTTLE_MS) {
          const elapsed = (now - holdStartTimeRef.current) / 1000;
          const targetTime = Math.max(0, videoStartTimeRef.current - elapsed * multiplier);
          controller.seekTo(targetTime);
          lastSeekTimeRef.current = now;
        }
        rafIdRef.current = requestAnimationFrame(scrub);
      };

      rafIdRef.current = requestAnimationFrame(scrub);
    },
    [controller, clearHold]
  );

  const startForward = useCallback(
    (direction: "forward" | "forward-fast", multiplier: number) => {
      if (!controller?.ready) return;
      clearHold();
      wasPlayingRef.current = controller.isPlaying;
      usingPlaybackRef.current = true;
      setHoldDirection(direction);

      // Use native playback for smooth forward scrubbing.
      // Cap at YouTube's max supported rate.
      const rates = controller.getAvailablePlaybackRates();
      const maxRate = rates.length > 0 ? Math.max(...rates) : 2;
      controller.setPlaybackRate(Math.min(multiplier, maxRate));
      controller.play();
    },
    [controller, clearHold]
  );

  const startHoldRewind = useCallback(() => startRewind("rewind", 1), [startRewind]);
  const startHoldForward = useCallback(() => startForward("forward", 1), [startForward]);
  const startHoldRewindFast = useCallback(() => startRewind("rewind-fast", scrubSpeedFast), [startRewind, scrubSpeedFast]);
  const startHoldForwardFast = useCallback(() => startForward("forward-fast", scrubSpeedFast), [startForward, scrubSpeedFast]);

  return {
    jumpBack: (seconds: number) => jump(-seconds),
    jumpForward: (seconds: number) => jump(seconds),
    startHoldRewind,
    startHoldForward,
    startHoldRewindFast,
    startHoldForwardFast,
    stopHold,
    jumpAmounts: JUMP_AMOUNTS,
    holdDirection,
  };
}
