"use client";

import { useEffect } from "react";
import type { YouTubePlayerController } from "@/types/player";
import { KEYBOARD_MAP } from "@/lib/constants";

type ScrubberForKeyboard = {
  startHoldRewind: () => void;
  startHoldForward: () => void;
  stopHold: () => void;
  jumpBack: (seconds: number) => void;
  jumpForward: (seconds: number) => void;
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts(
  enabled: boolean,
  controller: YouTubePlayerController | null,
  scrubber: ScrubberForKeyboard | null,
  onToggleSlowMo?: () => void
) {
  useEffect(() => {
    if (!enabled || !controller?.ready) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const key = e.key;

      if (key === KEYBOARD_MAP.playPause) {
        e.preventDefault();
        if (controller.isPlaying) controller.pause();
        else controller.play();
        return;
      }

      if (key === KEYBOARD_MAP.pause) {
        e.preventDefault();
        controller.pause();
        return;
      }

      if (key === KEYBOARD_MAP.rewind) {
        e.preventDefault();
        scrubber?.startHoldRewind();
        return;
      }

      if (key === KEYBOARD_MAP.forward) {
        e.preventDefault();
        scrubber?.startHoldForward();
        return;
      }

      if (key === KEYBOARD_MAP.toggleSlowMo) {
        e.preventDefault();
        onToggleSlowMo?.();
        return;
      }

      // Arrow Left: -1s (no modifier), -5s (Shift), -10s (Cmd/Ctrl)
      if (key === KEYBOARD_MAP.jumpBack1) {
        e.preventDefault();
        if (e.metaKey || e.ctrlKey) {
          scrubber?.jumpBack(10);
        } else if (e.shiftKey) {
          scrubber?.jumpBack(5);
        } else {
          scrubber?.jumpBack(1);
        }
        return;
      }

      // Arrow Right: +1s (no modifier), +5s (Shift), +10s (Cmd/Ctrl)
      if (key === KEYBOARD_MAP.jumpForward1) {
        e.preventDefault();
        if (e.metaKey || e.ctrlKey) {
          scrubber?.jumpForward(10);
        } else if (e.shiftKey) {
          scrubber?.jumpForward(5);
        } else {
          scrubber?.jumpForward(1);
        }
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === KEYBOARD_MAP.rewind || e.key === KEYBOARD_MAP.forward) {
        e.preventDefault();
        scrubber?.stopHold();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [enabled, controller, scrubber, onToggleSlowMo]);
}
