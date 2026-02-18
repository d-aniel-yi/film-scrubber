import { useState, useEffect, useRef } from "react";
import { extractVideoId } from "@/lib/youtube";
import { loadSettings, saveSettings } from "@/lib/settings";
import { parseUrlState, buildSearchParams, applyUrlStateToSettings } from "@/lib/urlState";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useLocalPlayer } from "@/hooks/useLocalPlayer";
import { useScrubberControls } from "@/hooks/useScrubberControls";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SCRUB_SPEED, SLOW_MO_SPEED } from "@/lib/constants";
import { UrlInput } from "./UrlInput";
import { PlayerArea } from "./PlayerArea";
import { ControlBar } from "./ControlBar";
import { HelpPanel } from "./HelpPanel";
import { LocalPlayer } from "./LocalPlayer";

const URL_DEBOUNCE_MS = 500;

export function ScrubberShell() {
  const [mode, setMode] = useState<"youtube" | "local">("youtube");
  const [urlInput, setUrlInput] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [localVideoSrc, setLocalVideoSrc] = useState<string | null>(null);

  const [slowMoSpeed, setSlowMoSpeed] = useState<number>(SLOW_MO_SPEED.default);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [scrubSpeedSlow, setScrubSpeedSlow] = useState<number>(SCRUB_SPEED.slow);
  const [scrubSpeedFast, setScrubSpeedFast] = useState<number>(SCRUB_SPEED.fast);
  const [speed, setSpeed] = useState(1);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const urlUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSeekedFromUrlRef = useRef(false);

  useEffect(() => {
    const s = loadSettings();
    const urlState = parseUrlState();
    const applied = applyUrlStateToSettings(urlState);
    const loadedSlowMo = applied.slowMoSpeed ?? s.slowMoSpeed;
    const loadedSpeed = applied.speed ?? s.speed;
    setSlowMoSpeed(loadedSlowMo);
    setScrubSpeedSlow(applied.scrubSpeedSlow ?? s.scrubSpeedSlow);
    setScrubSpeedFast(applied.scrubSpeedFast ?? s.scrubSpeedFast);
    setSpeed(loadedSpeed);
    if (loadedSpeed !== 1 && loadedSpeed === loadedSlowMo) {
      setIsSlowMo(true);
    }
    if (applied.videoId) {
      setVideoId(applied.videoId);
      setUrlInput(`https://www.youtube.com/watch?v=${applied.videoId}`);
    }
  }, []);

  useEffect(() => {
    saveSettings({ speed, slowMoSpeed, scrubSpeedSlow, scrubSpeedFast });
  }, [speed, slowMoSpeed, scrubSpeedSlow, scrubSpeedFast]);

  // YouTube Player
  const activeVideoId = mode === "youtube" ? videoId : null;
  const youtubePlayer = useYouTubePlayer(activeVideoId);

  // Local Player
  const localPlayer = useLocalPlayer(localVideoSrc);

  // Active Controller
  const activeController = mode === "youtube"
    ? (activeVideoId ? youtubePlayer.controller : null)
    : (localVideoSrc ? localPlayer.controller : null);

  const scrubber = useScrubberControls(
    activeController,
    scrubSpeedSlow,
    scrubSpeedFast
  );

  const toggleSlowMo = () => {
    if (!activeController?.ready) return;
    const newIsSlowMo = !isSlowMo;
    setIsSlowMo(newIsSlowMo);
    const newSpeed = newIsSlowMo ? slowMoSpeed : 1;
    setSpeed(newSpeed);
    activeController.setPlaybackRate(newSpeed);
  };

  useKeyboardShortcuts(
    Boolean(activeController?.ready),
    activeController,
    scrubber,
    toggleSlowMo
  );

  // Initial Seek from URL (YouTube only for now, local files don't support deep links yet)
  useEffect(() => {
    if (mode !== "youtube" || !videoId || !youtubePlayer.controller.ready || hasSeekedFromUrlRef.current) return;
    const urlState = parseUrlState();
    const applied = applyUrlStateToSettings(urlState);
    if (applied.seekTime != null) {
      youtubePlayer.controller.seekTo(applied.seekTime);
      hasSeekedFromUrlRef.current = true;
    }
  }, [mode, videoId, youtubePlayer.controller.ready, youtubePlayer.controller]);

  useEffect(() => {
    if (!videoId) hasSeekedFromUrlRef.current = false;
  }, [videoId]);

  // URL Updates (YouTube only)
  useEffect(() => {
    if (mode !== "youtube" || !videoId) return;
    if (urlUpdateTimeoutRef.current) clearTimeout(urlUpdateTimeoutRef.current);
    urlUpdateTimeoutRef.current = setTimeout(() => {
      const qs = buildSearchParams({
        v: videoId,
        t: youtubePlayer.controller.currentTime,
        speed,
        slowMoSpeed,
        scrubSpeedSlow,
        scrubSpeed: scrubSpeedFast,
      });
      const url = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", url);
    }, URL_DEBOUNCE_MS);
    return () => {
      if (urlUpdateTimeoutRef.current) clearTimeout(urlUpdateTimeoutRef.current);
    };
  }, [mode, videoId, youtubePlayer.controller.currentTime, speed, slowMoSpeed, scrubSpeedSlow, scrubSpeedFast]);

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

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setLocalVideoSrc(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setMode(mode === "youtube" ? "local" : "youtube")}
          className="text-xs font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 underline decoration-dotted underline-offset-4"
        >
          {mode === "youtube" ? "Switch to local player" : "Switch to YouTube player"}
        </button>
      </div>

      {mode === "youtube" ? (
        <>
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
            containerId={videoId ? youtubePlayer.containerId : undefined}
          />
        </>
      ) : (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800">
          <LocalPlayer
            videoRef={localPlayer.videoRef}
            src={localVideoSrc}
            onFileSelect={handleFileSelect}
          />
        </div>
      )}

      <ControlBar
        disabled={!activeController}
        controller={activeController}
        speed={speed}
        onSpeedChange={setSpeed}
        slowMoSpeed={slowMoSpeed}
        onSlowMoSpeedChange={setSlowMoSpeed}
        isSlowMo={isSlowMo}
        onToggleSlowMo={toggleSlowMo}
        scrubSpeedSlow={scrubSpeedSlow}
        onScrubSpeedSlowChange={setScrubSpeedSlow}
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
