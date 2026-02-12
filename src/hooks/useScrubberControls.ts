"use client";

import { useCallback, useRef, useState } from "react";
import type { YouTubePlayerController } from "@/types/player";
import { STEP_PRESETS, JUMP_AMOUNTS } from "@/lib/constants";
import type { StepPresetKey } from "@/lib/constants";
import { stepTime, jumpTime } from "@/lib/time";

export function useScrubberControls(
  controller: YouTubePlayerController | null,
  stepPreset: StepPresetKey,
  holdTickRateMs: number
) {
  const stepSize = STEP_PRESETS[stepPreset];
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasPlayingRef = useRef(false);
  const [holdDirection, setHoldDirection] = useState<"rewind" | "forward" | null>(null);

  const clearHold = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  const stopHold = useCallback(() => {
    clearHold();
    if (wasPlayingRef.current && controller?.ready) {
      controller.play();
    }
    wasPlayingRef.current = false;
    setHoldDirection(null);
  }, [clearHold, controller]);

  const step = useCallback(
    (direction: -1 | 1) => {
      if (!controller?.ready) return;
      controller.pause();
      const t = controller.getCurrentTime();
      const next = stepTime(t, stepSize, direction);
      controller.seekTo(next);
    },
    [controller, stepSize]
  );

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
    holdIntervalRef.current = setInterval(() => {
      const t = controller.getCurrentTime();
      const next = Math.max(0, t - stepSize);
      controller.seekTo(next);
    }, holdTickRateMs);
  }, [controller, stepSize, holdTickRateMs, clearHold]);

  const startHoldForward = useCallback(() => {
    if (!controller?.ready) return;
    clearHold();
    wasPlayingRef.current = controller.isPlaying;
    controller.pause();
    setHoldDirection("forward");
    holdIntervalRef.current = setInterval(() => {
      const t = controller.getCurrentTime();
      const next = t + stepSize;
      controller.seekTo(next);
    }, holdTickRateMs);
  }, [controller, stepSize, holdTickRateMs, clearHold]);

  return {
    stepBack: () => step(-1),
    stepForward: () => step(1),
    jumpBack: (seconds: number) => jump(-seconds),
    jumpForward: (seconds: number) => jump(seconds),
    startHoldRewind,
    startHoldForward,
    stopHold,
    stepSize,
    jumpAmounts: JUMP_AMOUNTS,
    holdDirection,
  };
}
