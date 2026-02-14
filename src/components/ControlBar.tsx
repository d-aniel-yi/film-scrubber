"use client";

import { useState, useEffect, useRef } from "react";
import type { YouTubePlayerController } from "@/types/player";
import { SLOW_MO_SPEED, SCRUB_SPEED } from "@/lib/constants";
import { formatTime } from "@/lib/time";

type ScrubberControls = {
  jumpBack: (seconds: number) => void;
  jumpForward: (seconds: number) => void;
  startHoldRewind: () => void;
  startHoldForward: () => void;
  startHoldRewindFast: () => void;
  startHoldForwardFast: () => void;
  stopHold: () => void;
  jumpAmounts: readonly number[];
  holdDirection: "rewind" | "forward" | "rewind-fast" | "forward-fast" | null;
};

type ControlBarProps = {
  disabled?: boolean;
  controller?: YouTubePlayerController | null;
  speed?: number;
  onSpeedChange?: (rate: number) => void;
  slowMoSpeed?: number;
  onSlowMoSpeedChange?: (speed: number) => void;
  isSlowMo?: boolean;
  onToggleSlowMo?: () => void;
  scrubSpeedSlow?: number;
  onScrubSpeedSlowChange?: (mult: number) => void;
  scrubSpeedFast?: number;
  onScrubSpeedFastChange?: (mult: number) => void;
  scrubber?: ScrubberControls;
  settingsExpanded?: boolean;
  onSettingsExpandedChange?: (expanded: boolean) => void;
  children?: React.ReactNode;
};

export function ControlBar({
  disabled,
  controller,
  speed = 1,
  onSpeedChange,
  slowMoSpeed = SLOW_MO_SPEED.default,
  onSlowMoSpeedChange,
  isSlowMo = false,
  onToggleSlowMo,
  scrubSpeedSlow = SCRUB_SPEED.slow,
  onScrubSpeedSlowChange,
  scrubSpeedFast = SCRUB_SPEED.fast,
  onScrubSpeedFastChange,
  scrubber,
  settingsExpanded = false,
  onSettingsExpandedChange,
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
        className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50 [&_button]:min-h-10 [&_select]:min-h-10"
        role="group"
        aria-label="Playback controls"
      >
        {children ?? (
          <>
            {/* Play/Toggle Row */}
            <div className="flex w-full flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!canControl}
                onClick={togglePlayPause}
                className="select-none touch-manipulation rounded bg-zinc-800 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 active:scale-95 active:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:focus:ring-offset-zinc-800 dark:active:bg-zinc-100"
                aria-label={controller?.isPlaying ? "Pause" : "Play"}
              >
                {controller?.isPlaying ? "Pause" : "Play"}
              </button>
              {canControl && (
                <button
                  type="button"
                  onClick={onToggleSlowMo}
                  className={`select-none touch-manipulation rounded px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 active:scale-95 ${
                    isSlowMo
                      ? "bg-amber-600 text-white active:bg-amber-700 dark:bg-amber-500 dark:active:bg-amber-600"
                      : "bg-zinc-800 text-white active:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:active:bg-zinc-100"
                  } disabled:opacity-50`}
                  disabled={!canControl}
                  aria-label={isSlowMo ? "Switch to normal speed" : "Switch to slow motion"}
                >
                  {isSlowMo ? `${slowMoSpeed}× Slow` : "1× Normal"}
                </button>
              )}
              {canControl && (
                <span
                  className="font-mono text-sm tabular-nums text-zinc-700 dark:text-zinc-300"
                  aria-label="Current time"
                >
                  {formatTime(controller?.currentTime ?? 0)}
                </span>
              )}
              {canControl && (
                <label className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Vol</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={controller?.volume ?? 100}
                    onChange={(e) => controller?.setVolume(Number(e.target.value))}
                    className="h-1.5 w-20 cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-zinc-800 dark:bg-zinc-700 dark:accent-zinc-200"
                    aria-label="Volume"
                  />
                </label>
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
            </div>

            {canControl && scrubber && (
              <>
                {/* Hold Buttons Row (Slow) */}
                <div className="flex w-full gap-2">
                  <button
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); scrubber.startHoldRewind(); }}
                    onPointerUp={scrubber.stopHold}
                    onPointerLeave={scrubber.stopHold}
                    onPointerCancel={scrubber.stopHold}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`flex-1 select-none touch-none rounded border py-3 text-center text-sm font-medium hover:bg-zinc-100 active:scale-95 active:bg-zinc-200 sm:flex-none sm:px-3 sm:py-2.5 ${
                      scrubber.holdDirection === "rewind"
                        ? "border-zinc-500 bg-zinc-200 dark:border-zinc-400 dark:bg-zinc-600"
                        : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800"
                    } dark:hover:bg-zinc-700 dark:active:bg-zinc-600`}
                    aria-label={`Hold to rewind (${scrubSpeedSlow}×)`}
                  >
                    Rewind
                  </button>
                  <button
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); scrubber.startHoldForward(); }}
                    onPointerUp={scrubber.stopHold}
                    onPointerLeave={scrubber.stopHold}
                    onPointerCancel={scrubber.stopHold}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`flex-1 select-none touch-none rounded border py-3 text-center text-sm font-medium hover:bg-zinc-100 active:scale-95 active:bg-zinc-200 sm:flex-none sm:px-3 sm:py-2.5 ${
                      scrubber.holdDirection === "forward"
                        ? "border-zinc-500 bg-zinc-200 dark:border-zinc-400 dark:bg-zinc-600"
                        : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800"
                    } dark:hover:bg-zinc-700 dark:active:bg-zinc-600`}
                    aria-label={`Hold to forward (${scrubSpeedSlow}×)`}
                  >
                    Forward
                  </button>
                </div>

                {/* Hold Buttons Row (Fast) */}
                <div className="flex w-full gap-2">
                  <button
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); scrubber.startHoldRewindFast(); }}
                    onPointerUp={scrubber.stopHold}
                    onPointerLeave={scrubber.stopHold}
                    onPointerCancel={scrubber.stopHold}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`flex-1 select-none touch-none rounded border py-3 text-center text-sm font-medium hover:bg-zinc-100 active:scale-95 active:bg-zinc-200 sm:flex-none sm:px-3 sm:py-2.5 ${
                      scrubber.holdDirection === "rewind-fast"
                        ? "border-zinc-500 bg-zinc-200 dark:border-zinc-400 dark:bg-zinc-600"
                        : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800"
                    } dark:hover:bg-zinc-700 dark:active:bg-zinc-600`}
                    aria-label={`Hold to fast rewind (${scrubSpeedFast}×)`}
                  >
                    Fast Rewind
                  </button>
                  <button
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); scrubber.startHoldForwardFast(); }}
                    onPointerUp={scrubber.stopHold}
                    onPointerLeave={scrubber.stopHold}
                    onPointerCancel={scrubber.stopHold}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`flex-1 select-none touch-none rounded border py-3 text-center text-sm font-medium hover:bg-zinc-100 active:scale-95 active:bg-zinc-200 sm:flex-none sm:px-3 sm:py-2.5 ${
                      scrubber.holdDirection === "forward-fast"
                        ? "border-zinc-500 bg-zinc-200 dark:border-zinc-400 dark:bg-zinc-600"
                        : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800"
                    } dark:hover:bg-zinc-700 dark:active:bg-zinc-600`}
                    aria-label={`Hold to fast forward (${scrubSpeedFast}×)`}
                  >
                    Fast Forward
                  </button>
                </div>

                {/* Jump Buttons Row */}
                <div className="flex w-full flex-wrap items-center gap-2">
                  {scrubber.jumpAmounts.map((sec) => (
                    <div key={sec} className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => scrubber.jumpBack(sec)}
                        className="select-none touch-manipulation rounded border border-zinc-300 bg-white px-2.5 py-2.5 text-sm hover:bg-zinc-100 active:scale-95 active:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-600"
                        aria-label={`Jump back ${sec}s`}
                      >
                        −{sec}s
                      </button>
                      <button
                        type="button"
                        onClick={() => scrubber.jumpForward(sec)}
                        className="select-none touch-manipulation rounded border border-zinc-300 bg-white px-2.5 py-2.5 text-sm hover:bg-zinc-100 active:scale-95 active:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-600"
                        aria-label={`Jump forward ${sec}s`}
                      >
                        +{sec}s
                      </button>
                    </div>
                  ))}
                </div>

                {/* Settings Toggle Button Row */}
                <div className="flex w-full">
                  <button
                    type="button"
                    onClick={() => onSettingsExpandedChange?.(!settingsExpanded)}
                    className="w-full select-none touch-manipulation rounded bg-zinc-800 px-3 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 active:scale-95 active:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:focus:ring-offset-zinc-800 dark:active:bg-zinc-100 sm:w-auto"
                    aria-label={settingsExpanded ? "Hide settings" : "Show settings"}
                  >
                    Settings {settingsExpanded ? "▲" : "▼"}
                  </button>
                </div>

                {/* Settings Panel */}
                {settingsExpanded && (
                  <div className="flex flex-col gap-2 w-full">
                    {onSlowMoSpeedChange && (
                      <label className="flex items-center gap-1 text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Slow-mo speed:</span>
                        <input
                          type="number"
                          min={SLOW_MO_SPEED.min}
                          max={SLOW_MO_SPEED.max}
                          step={0.05}
                          value={slowMoSpeed}
                          onChange={(e) => onSlowMoSpeedChange(Number(e.target.value))}
                          className="w-14 rounded border border-zinc-300 bg-white px-1 py-0.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                          aria-label="Slow-mo speed"
                        />
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">×</span>
                      </label>
                    )}
                    {onScrubSpeedSlowChange && (
                      <label className="flex items-center gap-1 text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Scrub speed:</span>
                        <input
                          type="number"
                          min={SCRUB_SPEED.min}
                          max={SCRUB_SPEED.max}
                          step={0.5}
                          value={scrubSpeedSlow}
                          onChange={(e) => onScrubSpeedSlowChange(Number(e.target.value))}
                          className="w-14 rounded border border-zinc-300 bg-white px-1 py-0.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                          aria-label="Scrub speed multiplier"
                        />
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">×</span>
                      </label>
                    )}
                    {onScrubSpeedFastChange && (
                      <label className="flex items-center gap-1 text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Fast scrub speed:</span>
                        <input
                          type="number"
                          min={SCRUB_SPEED.min}
                          max={SCRUB_SPEED.max}
                          step={0.5}
                          value={scrubSpeedFast}
                          onChange={(e) => onScrubSpeedFastChange(Number(e.target.value))}
                          className="w-14 rounded border border-zinc-300 bg-white px-1 py-0.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                          aria-label="Fast scrub speed multiplier"
                        />
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">×</span>
                      </label>
                    )}
                    {onSpeedChange && rates.length > 0 && (
                      <label className="flex items-center gap-1 text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Playback speed:</span>
                        <select
                          value={speed}
                          onChange={(e) => handleSpeedChange(Number(e.target.value))}
                          className="rounded border border-zinc-300 bg-white px-1 py-0.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                          aria-label="Playback speed"
                        >
                          {rates.map((rate) => (
                            <option key={rate} value={rate}>
                              {rate}×
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
