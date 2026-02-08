"use client";

import { useEffect } from "react";
import type { YouTubePlayerController } from "@/types/player";
import { KEYBOARD_MAP } from "@/lib/constants";

type ScrubberForKeyboard = {
  stepBack: () => void;
  stepForward: () => void;
  startHoldRewind: () => void;
  startHoldForward: () => void;
  stopHold: () => void;
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
  scrubber: ScrubberForKeyboard | null
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

      if (key === KEYBOARD_MAP.stepBack) {
        e.preventDefault();
        scrubber?.stepBack();
        return;
      }

      if (key === KEYBOARD_MAP.stepForward) {
        e.preventDefault();
        scrubber?.stepForward();
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
  }, [enabled, controller, scrubber]);
}
