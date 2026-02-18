"use client";

import { useRef, useState, useCallback, RefObject } from "react";

type LocalPlayerProps = {
    videoRef: RefObject<HTMLVideoElement | null>;
    src: string | null;
    onFileSelect: (file: File) => void;
};

export function LocalPlayer({ videoRef, src, onFileSelect }: LocalPlayerProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file && (file.type.startsWith("video/") || file.name.match(/\.(mp4|mov|webm|mkv)$/i))) {
                onFileSelect(file);
            }
        },
        [onFileSelect]
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                onFileSelect(file);
            }
        },
        [onFileSelect]
    );

    if (src) {
        return (
            <video
                ref={videoRef}
                src={src}
                className="h-full w-full object-contain bg-black"
                playsInline
                controls={false} // We provide our own controls
                onClick={(e) => {
                    // Optional: toggle play/pause on click.
                    // For now, let's keep it simple or hook it up if we have the controller.
                    // But the prop signature doesn't have controller. 
                    // ScrubberShell handles keyboard, maybe click to play/pause is good UX.
                    const v = e.currentTarget;
                    if (v.paused) v.play(); else v.pause();
                }}
            />
        );
    }

    return (
        <div
            className={`flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${isDragging
                ? "border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-900/20"
                : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                    <svg
                        className="h-8 w-8 text-zinc-500 dark:text-zinc-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                        Drop a video file here
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        or <button onClick={() => fileInputRef.current?.click()} className="text-amber-600 hover:underline dark:text-amber-500">browse</button> to upload
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,.mkv"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    MP4, MOV, WebM supported locally
                </p>
            </div>
        </div>
    );
}
