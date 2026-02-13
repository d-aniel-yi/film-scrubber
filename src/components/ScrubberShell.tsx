"use client";

import { useState, useEffect, useRef } from "react";
import { extractVideoId } from "@/lib/youtube";
import { loadSettings, saveSettings } from "@/lib/settings";
import { parseUrlState, buildSearchParams, applyUrlStateToSettings } from "@/lib/urlState";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useScrubberControls } from "@/hooks/useScrubberControls";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SCRUB_SPEED, SLOW_MO_SPEED } from "@/lib/constants";
import { UrlInput } from "./UrlInput";
import { PlayerArea } from "./PlayerArea";
import { ControlBar } from "./ControlBar";
import { HelpPanel } from "./HelpPanel";

const URL_DEBOUNCE_MS = 500;

export function ScrubberShell() {
  const [urlInput, setUrlInput] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [slowMoSpeed, setSlowMoSpeed] = useState<number>(SLOW_MO_SPEED.default);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [scrubSpeedFast, setScrubSpeedFast] = useState<number>(SCRUB_SPEED.fast);
  const [speed, setSpeed] = useState(1);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const urlUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSeekedFromUrlRef = useRef(false);

  useEffect(() => {
    const s = loadSettings();
    const urlState = parseUrlState();
    const applied = applyUrlStateToSettings(urlState);
    setSlowMoSpeed(applied.slowMoSpeed ?? s.slowMoSpeed);
    setScrubSpeedFast(applied.scrubSpeedFast ?? s.scrubSpeedFast);
    setSpeed(applied.speed ?? s.speed);
    if (applied.videoId) {
      setVideoId(applied.videoId);
      setUrlInput(`https://www.youtube.com/watch?v=${applied.videoId}`);
    }
  }, []);

  useEffect(() => {
    saveSettings({ speed, slowMoSpeed, scrubSpeedFast });
  }, [speed, slowMoSpeed, scrubSpeedFast]);

  const { controller, containerId } = useYouTubePlayer(videoId);
  const scrubber = useScrubberControls(
    videoId ? controller : null,
    scrubSpeedFast
  );
  useKeyboardShortcuts(
    Boolean(videoId && controller.ready),
    videoId ? controller : null,
    scrubber
  );

  const toggleSlowMo = () => {
    const newIsSlowMo = !isSlowMo;
    setIsSlowMo(newIsSlowMo);
    const newSpeed = newIsSlowMo ? slowMoSpeed : 1;
    setSpeed(newSpeed);
    controller.setPlaybackRate(newSpeed);
  };

  useEffect(() => {
    if (!videoId || !controller.ready || hasSeekedFromUrlRef.current) return;
    const urlState = parseUrlState();
    const applied = applyUrlStateToSettings(urlState);
    if (applied.seekTime != null) {
      controller.seekTo(applied.seekTime);
      hasSeekedFromUrlRef.current = true;
    }
  }, [videoId, controller.ready, controller]);
  useEffect(() => {
    if (!videoId) hasSeekedFromUrlRef.current = false;
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;
    if (urlUpdateTimeoutRef.current) clearTimeout(urlUpdateTimeoutRef.current);
    urlUpdateTimeoutRef.current = setTimeout(() => {
      const qs = buildSearchParams({
        v: videoId,
        t: controller.currentTime,
        speed,
        slowMoSpeed,
        scrubSpeed: scrubSpeedFast,
      });
      const url = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", url);
    }, URL_DEBOUNCE_MS);
    return () => {
      if (urlUpdateTimeoutRef.current) clearTimeout(urlUpdateTimeoutRef.current);
    };
  }, [videoId, controller.currentTime, speed, slowMoSpeed, scrubSpeedFast]);

  const [urlError, setUrlError] = useState<string | null>(null);

  const handleLoad = () => {
    setUrlError(null);
    const id = extractVideoId(urlInput);
    if (!id) {
      setUrlError("Couldn't parse that URL. Try a standard YouTube watch link.");
      setVideoId(null);
      return;
    }
    setVideoId(id);
  };

  return (
    <div className="flex flex-col gap-4">
      <UrlInput
        value={urlInput}
        onChange={(v) => { setUrlInput(v); setUrlError(null); }}
        onSubmit={handleLoad}
      />
      {urlError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {urlError}
        </p>
      )}
      <PlayerArea
        videoId={videoId}
        isEmpty={!videoId}
        containerId={videoId ? containerId : undefined}
      />
      <ControlBar
        disabled={!videoId}
        controller={videoId ? controller : null}
        speed={speed}
        onSpeedChange={setSpeed}
        slowMoSpeed={slowMoSpeed}
        onSlowMoSpeedChange={setSlowMoSpeed}
        isSlowMo={isSlowMo}
        onToggleSlowMo={toggleSlowMo}
        scrubSpeedFast={scrubSpeedFast}
        onScrubSpeedFastChange={setScrubSpeedFast}
        scrubber={scrubber}
        settingsExpanded={settingsExpanded}
        onSettingsExpandedChange={setSettingsExpanded}
      />
      <HelpPanel />
    </div>
  );
}
