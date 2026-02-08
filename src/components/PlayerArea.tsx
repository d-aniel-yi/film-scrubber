"use client";

type PlayerAreaProps = {
  videoId: string | null;
  isEmpty: boolean;
  /** ID of the div where the YouTube IFrame API will mount the player. */
  containerId?: string;
};

export function PlayerArea({ videoId, isEmpty, containerId }: PlayerAreaProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-zinc-900" style={{ aspectRatio: "16/9" }}>
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-400">
          <p className="text-center text-sm">Paste a YouTube URL above</p>
        </div>
      )}
      {!isEmpty && containerId && (
        <div
          id={containerId}
          className="absolute inset-0 h-full w-full"
          aria-label="YouTube player"
        />
      )}
    </div>
  );
}
