"use client";

import { useState } from "react";
import { KEYBOARD_MAP } from "@/lib/constants";

export function HelpPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-inset"
        aria-expanded={open}
        aria-controls="help-content"
        id="help-toggle"
      >
        How to use
        <span className="text-zinc-500">{open ? "−" : "+"}</span>
      </button>
      <div
        id="help-content"
        role="region"
        aria-labelledby="help-toggle"
        hidden={!open}
        className="border-t border-zinc-200 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
      >
        <p className="mb-2">
          Paste a YouTube URL and click Load. Use the control bar to play, change speed, step through frames, or hold Rewind/Forward to scrub.
        </p>
        <p className="mb-1 font-medium text-zinc-700 dark:text-zinc-300">Keyboard shortcuts (desktop):</p>
        <ul className="list-inside list-disc space-y-0.5">
          <li><kbd className="rounded bg-zinc-200 px-1 dark:bg-zinc-600">{KEYBOARD_MAP.playPause === " " ? "Space" : KEYBOARD_MAP.playPause}</kbd> Play / Pause</li>
          <li><kbd className="rounded bg-zinc-200 px-1 dark:bg-zinc-600">K</kbd> Pause</li>
          <li><kbd className="rounded bg-zinc-200 px-1 dark:bg-zinc-600">J</kbd> Hold to rewind</li>
          <li><kbd className="rounded bg-zinc-200 px-1 dark:bg-zinc-600">L</kbd> Hold to forward</li>
          <li><kbd className="rounded bg-zinc-200 px-1 dark:bg-zinc-600">S</kbd> Toggle slow-mo</li>
          <li><kbd className="rounded bg-zinc-200 px-1 dark:bg-zinc-600">←</kbd> Jump -1s</li>
          <li><kbd className="rounded bg-zinc-200 px-1 dark:bg-zinc-600">Shift+←</kbd> Jump -5s</li>
          <li><kbd className="rounded bg-zinc-200 px-1 dark:bg-zinc-600">Cmd/Ctrl+←</kbd> Jump -10s</li>
          <li><kbd className="rounded bg-zinc-200 px-1 dark:bg-zinc-600">→</kbd> Jump +1s</li>
          <li><kbd className="rounded bg-zinc-200 px-1 dark:bg-zinc-600">Shift+→</kbd> Jump +5s</li>
          <li><kbd className="rounded bg-zinc-200 px-1 dark:bg-zinc-600">Cmd/Ctrl+→</kbd> Jump +10s</li>
        </ul>
      </div>
    </div>
  );
}
