"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { PlayerController } from "@/types/player";

export function useLocalPlayer(src: string | null) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [ready, setReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!src) {
            setReady(false);
            setLoading(false);
            return;
        }
        setLoading(true);
        setReady(false);
        // Reset state on new source
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    }, [src]);

    // Sync state from video element
    const updateState = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        setCurrentTime(video.currentTime);
        setDuration(video.duration || 0);
        setIsPlaying(!video.paused && !video.ended && video.readyState > 2);
        setVolume(video.volume * 100);
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setReady(true);
            setLoading(false);
            updateState();
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);
        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleVolumeChange = () => setVolume(video.volume * 100);

        // Check if metadata is already loaded
        if (video.readyState >= 1) {
            handleLoadedMetadata();
        }

        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("ended", handleEnded);
        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("volumechange", handleVolumeChange);

        return () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("ended", handleEnded);
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("volumechange", handleVolumeChange);
        };
    }, [updateState]);

    // Polling for smoother time updates if needed, though timeupdate fires reasonably often.
    // We'll rely on timeupdate for now as it's standard for HTML5 video.
    // If scrubbing needs to be smoother, we can add a requestAnimationFrame loop.

    const controller: PlayerController = {
        play: useCallback(() => videoRef.current?.play().catch(console.error), []),
        pause: useCallback(() => videoRef.current?.pause(), []),
        seekTo: useCallback((seconds: number) => {
            if (videoRef.current) {
                videoRef.current.currentTime = seconds;
            }
        }, []),
        getCurrentTime: useCallback(() => videoRef.current?.currentTime ?? 0, []),
        setPlaybackRate: useCallback((rate: number) => {
            if (videoRef.current) {
                videoRef.current.playbackRate = rate;
            }
        }, []),
        getAvailablePlaybackRates: useCallback(() => [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2], []),
        getPlayerState: useCallback(() => {
            // Mapping to YouTube states roughly:
            // 1=playing, 2=paused, 3=buffering, 5=cued, 0=unstarted, -1=ended
            const video = videoRef.current;
            if (!video) return -1;
            if (video.ended) return -1;
            // More robust check:
            return !video.paused && video.readyState > 2 ? 1 : 2;
        }, []),
        setVolume: useCallback((vol: number) => {
            if (videoRef.current) {
                videoRef.current.volume = vol / 100;
                setVolume(vol); // optimistic update
            }
        }, []),
        getVolume: useCallback(() => (videoRef.current?.volume ?? 1) * 100, []),
        ready,
        loading,
        currentTime,
        duration,
        isPlaying,
        volume,
    };

    return { controller, videoRef };
}
