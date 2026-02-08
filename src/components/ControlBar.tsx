"use client";

import { useState, useEffect, useRef } from "react";
import type { YouTubePlayerController } from "@/types/player";
import type { StepPresetKey } from "@/lib/constants";
import { STEP_PRESETS, HOLD_TICK_RATE_MS } from "@/lib/constants";
import { formatTime } from "@/lib/time";

type ScrubberControls = {
  stepBack: () => void;
  stepForward: () => void;
  jumpBack: (seconds: number) => void;
  jumpForward: (seconds: number) => void;
  startHoldRewind: () => void;
  startHoldForward: () => void;
  stopHold: () => void;
  jumpAmounts: readonly number[];
};

type ControlBarProps = {
  disabled?: boolean;
  controller?: YouTubePlayerController | null;
  speed?: number;
  onSpeedChange?: (rate: number) => void;
  stepPreset?: StepPresetKey;
  onStepPresetChange?: (preset: StepPresetKey) => void;
  holdTickRateMs?: number;
  onHoldTickRateMsChange?: (ms: number) => void;
  scrubber?: ScrubberControls;
  children?: React.ReactNode;
};

const STEP_LABELS: Record<StepPresetKey, string> = {
  fine: "Fine",
  medium: "Medium",
  coarse: "Coarse",
};

export function ControlBar({
  disabled,
  controller,
  speed = 1,
  onSpeedChange,
  stepPreset = "medium",
  onStepPresetChange,
  holdTickRateMs = HOLD_TICK_RATE_MS.default,
  onHoldTickRateMsChange,
  scrubber,
  children,
}: ControlBarProps) {
  const canControl = !disabled && controller?.ready;
  const rates = controller?.getAvailablePlaybackRates() ?? [];
  const hasCorrectedSpeedRef = useRef(false);

  useEffect(() => {
    if (!controller?.ready || rates.length === 0) return;
    const validSpeed = rates.includes(speed) ? speed : rates[0] ?? 1;
    if (validSpeed !== speed && !hasCorrectedSpeedRef.current) {
      hasCorrectedSpeedRef.current = true;
      onSpeedChange?.(validSpeed);
    }
    controller.setPlaybackRate(validSpeed);
  }, [controller, speed, rates, onSpeedChange]);

  const handleSpeedChange = (rate: number) => {
    onSpeedChange?.(rate);
    controller?.setPlaybackRate(rate);
  };

  const togglePlayPause = () => {
    if (controller?.isPlaying) controller.pause();
    else controller?.play();
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {canControl && (
        <div className="flex w-full items-center gap-2 px-1">
          <input
            type="range"
            min={0}
            max={controller.duration || 100}
            step="any"
            value={controller.currentTime}
            onChange={(e) => {
              const newTime = parseFloat(e.target.value);
              controller.seekTo(newTime);
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700 accent-zinc-800 dark:accent-zinc-200"
            aria-label="Seek video"
          />
        </div>
      )}
      <div
        className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50 [&_button]:min-h-10 [&_select]:min-h-10"
        role="group"
        aria-label="Playback controls"
      >
        {children ?? (
          <>
            <button
              type="button"
              disabled={!canControl}
              onClick={togglePlayPause}
              className="rounded bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:bg-zinc-200 dark:text-zinc-900 dark:focus:ring-offset-zinc-800"
              aria-label={controller?.isPlaying ? "Pause" : "Play"}
            >
              {controller?.isPlaying ? "Pause" : "Play"}
            </button>
            {canControl && rates.length > 0 && (
              <select
                value={speed}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                aria-label="Playback speed"
              >
                {rates.map((r) => (
                  <option key={r} value={r}>
                    {r}×
                  </option>
                ))}
              </select>
            )}
            {canControl && (
              <span
                className="font-mono text-sm tabular-nums text-zinc-700 dark:text-zinc-300"
                aria-label="Current time"
              >
                {formatTime(controller?.currentTime ?? 0)}
              </span>
            )}
            {canControl && scrubber && onStepPresetChange && (
              <>
                <select
                  value={stepPreset}
                  onChange={(e) => onStepPresetChange(e.target.value as StepPresetKey)}
                  className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  aria-label="Step size"
                >
                  {(Object.keys(STEP_PRESETS) as StepPresetKey[]).map((key) => (
                    <option key={key} value={key}>
                      {STEP_LABELS[key]}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={scrubber.stepBack}
                    className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    aria-label="Step backward"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={scrubber.stepForward}
                    className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    aria-label="Step forward"
                  >
                    +
                  </button>
                </div>
                {scrubber.jumpAmounts.map((sec) => (
                  <div key={sec} className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => scrubber.jumpBack(sec)}
                      className="rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                      aria-label={`Jump back ${sec}s`}
                    >
                      −{sec}s
                    </button>
                    <button
                      type="button"
                      onClick={() => scrubber.jumpForward(sec)}
                      className="rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                      aria-label={`Jump forward ${sec}s`}
                    >
                      +{sec}s
                    </button>
                  </div>
                ))}
                <div className="flex w-full gap-2 sm:w-auto">
                  <button
                    type="button"
                    onPointerDown={scrubber.startHoldRewind}
                    onPointerUp={scrubber.stopHold}
                    onPointerLeave={scrubber.stopHold}
                    onPointerCancel={scrubber.stopHold}
                    className="flex-1 touch-none rounded border border-zinc-300 bg-white py-3 text-center text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 sm:flex-none sm:px-3 sm:py-1.5"
                    aria-label="Hold to rewind"
                  >
                    Rewind
                  </button>
                  <button
                    type="button"
                    onPointerDown={scrubber.startHoldForward}
                    onPointerUp={scrubber.stopHold}
                    onPointerLeave={scrubber.stopHold}
                    onPointerCancel={scrubber.stopHold}
                    className="flex-1 touch-none rounded border border-zinc-300 bg-white py-3 text-center text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 sm:flex-none sm:px-3 sm:py-1.5"
                    aria-label="Hold to forward"
                  >
                    Forward
                  </button>
                </div>
                {onHoldTickRateMsChange && (
                  <label className="flex items-center gap-1 text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Hold tick (ms):</span>
                    <input
                      type="number"
                      min={HOLD_TICK_RATE_MS.min}
                      max={HOLD_TICK_RATE_MS.max}
                      value={holdTickRateMs}
                      onChange={(e) => onHoldTickRateMsChange(Number(e.target.value))}
                      className="w-14 rounded border border-zinc-300 bg-white px-1 py-0.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      aria-label="Hold scrub tick rate (ms)"
                    />
                  </label>
                )}
              </>
            )}
            {!controller?.ready && !disabled && (
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Loading player…
              </span>
            )}
            {disabled && (
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Load a video to enable controls
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
