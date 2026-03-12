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
  | "onResize"
>;

export function DrawingOverlay({
  isDrawingMode,
  canvasRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
  onResize,
}: DrawingOverlayProps) {
  // Sync canvas pixel dimensions to its CSS layout dimensions using ResizeObserver.
  // This keeps the canvas aligned when the window or container is resized (DRAW-12).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initial size sync on mount
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const observer = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Signal the hook to redraw all committed strokes onto the resized canvas
      onResize?.();
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef, onResize]);

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
