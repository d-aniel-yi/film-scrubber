"use client";

import { useCallback, useRef, useState } from "react";
import type { YouTubePlayerController } from "@/types/player";
import { JUMP_AMOUNTS } from "@/lib/constants";
import { jumpTime } from "@/lib/time";

export function useScrubberControls(
  controller: YouTubePlayerController | null,
  scrubSpeedMultiplier: number
) {
  const rafIdRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);
  const videoStartTimeRef = useRef<number | null>(null);
  const lastSeekTimeRef = useRef<number>(0);
  const wasPlayingRef = useRef(false);
  const [holdDirection, setHoldDirection] = useState<"rewind" | "forward" | null>(null);

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

  const startHoldRewind = useCallback(() => {
    if (!controller?.ready) return;
    clearHold();
    wasPlayingRef.current = controller.isPlaying;
    controller.pause();
    setHoldDirection("rewind");

    const videoStart = controller.getCurrentTime();
    videoStartTimeRef.current = videoStart;
    holdStartTimeRef.current = performance.now();

    const scrub = () => {
      if (!controller?.ready || holdStartTimeRef.current === null || videoStartTimeRef.current === null) return;

      const elapsed = (performance.now() - holdStartTimeRef.current) / 1000; // seconds
      const targetTime = Math.max(0, videoStartTimeRef.current - (elapsed * scrubSpeedMultiplier));

      controller.seekTo(targetTime);
      rafIdRef.current = requestAnimationFrame(scrub);
    };

    rafIdRef.current = requestAnimationFrame(scrub);
  }, [controller, scrubSpeedMultiplier, clearHold]);

  const startHoldForward = useCallback(() => {
    if (!controller?.ready) return;
    clearHold();
    wasPlayingRef.current = controller.isPlaying;
    controller.pause();
    setHoldDirection("forward");

    const videoStart = controller.getCurrentTime();
    const duration = controller.duration || Infinity;
    videoStartTimeRef.current = videoStart;
    holdStartTimeRef.current = performance.now();

    const scrub = () => {
      if (!controller?.ready || holdStartTimeRef.current === null || videoStartTimeRef.current === null) return;

      const elapsed = (performance.now() - holdStartTimeRef.current) / 1000; // seconds
      const targetTime = Math.min(duration, videoStartTimeRef.current + (elapsed * scrubSpeedMultiplier));

      controller.seekTo(targetTime);
      rafIdRef.current = requestAnimationFrame(scrub);
    };

    rafIdRef.current = requestAnimationFrame(scrub);
  }, [controller, scrubSpeedMultiplier, clearHold]);

  return {
    jumpBack: (seconds: number) => jump(-seconds),
    jumpForward: (seconds: number) => jump(seconds),
    startHoldRewind,
    startHoldForward,
    stopHold,
    jumpAmounts: JUMP_AMOUNTS,
    holdDirection,
  };
}
