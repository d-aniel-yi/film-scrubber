"use client";

import { useCallback, useRef, useState } from "react";
import type { PlayerController } from "@/types/player";
import { JUMP_AMOUNTS } from "@/lib/constants";
import { jumpTime } from "@/lib/time";

type HoldDirection = "rewind" | "forward" | "rewind-fast" | "forward-fast" | null;

// seekTo throttle — gives YouTube time to process each seek.
// Mobile needs more breathing room than desktop.
const SEEK_THROTTLE_MS = 150;

// How far back (seconds) to pre-buffer when scrubbing starts.
// We seek backward briefly to warm YouTube's cache, then start scrubbing.
const PREBUFFER_SECONDS = 5;

export function useScrubberControls(
  controller: PlayerController | null,
  scrubSpeedSlow: number,
  scrubSpeedFast: number
) {
  const rafIdRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);
  const videoStartTimeRef = useRef<number | null>(null);
  const lastSeekTimeRef = useRef<number>(0);
  const wasPlayingRef = useRef(false);
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
    if (wasPlayingRef.current && controller?.ready) {
      controller.play();
    }
    wasPlayingRef.current = false;
    setHoldDirection(null);
  }, [clearHold, controller]);

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

  const startHold = useCallback(
    (direction: HoldDirection, multiplier: number) => {
      if (!controller?.ready || !direction) return;
      clearHold();
      wasPlayingRef.current = controller.isPlaying;
      controller.pause();
      setHoldDirection(direction);

      const videoStart = controller.getCurrentTime();
      const duration = controller.duration || Infinity;
      const isRewind = direction === "rewind" || direction === "rewind-fast";

      // Pre-buffer: seek backward briefly to warm YouTube's cache
      if (isRewind) {
        const prebufferTarget = Math.max(0, videoStart - PREBUFFER_SECONDS);
        controller.seekTo(prebufferTarget);
        // Seek back to start position — YouTube should now have this range cached
        controller.seekTo(videoStart);
      }

      videoStartTimeRef.current = videoStart;
      holdStartTimeRef.current = performance.now();
      lastSeekTimeRef.current = 0;

      const scrub = () => {
        if (!controller?.ready || holdStartTimeRef.current === null || videoStartTimeRef.current === null) return;
        const now = performance.now();
        if (now - lastSeekTimeRef.current >= SEEK_THROTTLE_MS) {
          const elapsed = (now - holdStartTimeRef.current) / 1000;
          const delta = elapsed * multiplier;
          const targetTime = isRewind
            ? Math.max(0, videoStartTimeRef.current - delta)
            : Math.min(duration, videoStartTimeRef.current + delta);
          controller.seekTo(targetTime);
          lastSeekTimeRef.current = now;
        }
        rafIdRef.current = requestAnimationFrame(scrub);
      };

      rafIdRef.current = requestAnimationFrame(scrub);
    },
    [controller, clearHold]
  );

  const startHoldRewind = useCallback(() => startHold("rewind", scrubSpeedSlow), [startHold, scrubSpeedSlow]);
  const startHoldForward = useCallback(() => startHold("forward", scrubSpeedSlow), [startHold, scrubSpeedSlow]);
  const startHoldRewindFast = useCallback(() => startHold("rewind-fast", scrubSpeedFast), [startHold, scrubSpeedFast]);
  const startHoldForwardFast = useCallback(() => startHold("forward-fast", scrubSpeedFast), [startHold, scrubSpeedFast]);

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
