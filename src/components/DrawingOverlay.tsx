"use client";

import { useEffect } from "react";
import type { DrawingState } from "@/hooks/useDrawing";

type DrawingOverlayProps = Pick<
  DrawingState,
  | "isDrawingMode"
  | "canvasRef"
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerLeave"
>;

export function DrawingOverlay({
  isDrawingMode,
  canvasRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
}: DrawingOverlayProps) {
  // Sync canvas pixel dimensions to its CSS layout dimensions on mount.
  // ResizeObserver will be added in plan 05-02.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }, [canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className={[
        "absolute inset-0 h-full w-full",
        isDrawingMode
          ? "cursor-crosshair touch-none"
          : "pointer-events-none cursor-default",
      ].join(" ")}
      onPointerDown={isDrawingMode ? onPointerDown : undefined}
      onPointerMove={isDrawingMode ? onPointerMove : undefined}
      onPointerUp={isDrawingMode ? onPointerUp : undefined}
      onPointerLeave={isDrawingMode ? onPointerLeave : undefined}
      aria-label={isDrawingMode ? "Drawing canvas — draw on the video" : undefined}
      aria-hidden={!isDrawingMode}
    />
  );
}
