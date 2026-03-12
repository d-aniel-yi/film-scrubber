"use client";

import { useRef, useState, useEffect } from "react";
import type React from "react";

export type DrawingTool = "freehand" | "line";

export type Stroke = {
  tool: DrawingTool;
  color: string;
  width: number;
  points: { x: number; y: number }[];
};

export type DrawingState = {
  isDrawingMode: boolean;
  activeTool: DrawingTool;
  color: string;
  strokeWidth: number;
  strokes: Stroke[];
  undoneStrokes: Stroke[];
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onToggleDrawing: () => void;
  onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerLeave: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  setActiveTool: (tool: DrawingTool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
};

function getCanvasPoint(
  e: React.PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function redrawCanvas(
  canvas: HTMLCanvasElement,
  strokes: Stroke[],
  currentStroke?: Stroke | null
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

  for (const stroke of allStrokes) {
    if (stroke.points.length < 2) continue;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    if (stroke.tool === "freehand") {
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
    } else {
      // line tool: draw from first to last point
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      ctx.lineTo(
        stroke.points[stroke.points.length - 1].x,
        stroke.points[stroke.points.length - 1].y
      );
    }

    ctx.stroke();
  }
}

export function useDrawing(): DrawingState {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const isPointerDownRef = useRef(false);

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>("freehand");
  const [color, setColor] = useState("#ff0000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [undoneStrokes, setUndoneStrokes] = useState<Stroke[]>([]);

  // Redraw when strokes change (handles undo/redo/clear) but not during active drawing
  useEffect(() => {
    if (canvasRef.current && !isPointerDownRef.current) {
      redrawCanvas(canvasRef.current, strokes);
    }
  }, [strokes]);

  const onToggleDrawing = () => {
    setIsDrawingMode((v) => {
      if (v && canvasRef.current) {
        // Exiting drawing mode — clear any preview state
        redrawCanvas(canvasRef.current, strokes);
      }
      return !v;
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(e, canvas);

    const stroke: Stroke = {
      tool: activeTool,
      color,
      width: strokeWidth,
      points: [point],
    };

    currentStrokeRef.current = stroke;
    isPointerDownRef.current = true;
    redrawCanvas(canvas, strokes, currentStrokeRef.current);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isPointerDownRef.current || !currentStrokeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasPoint(e, canvas);
    currentStrokeRef.current.points.push(point);
    redrawCanvas(canvas, strokes, currentStrokeRef.current);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    const canvas = canvasRef.current;
    const stroke = currentStrokeRef.current;

    isPointerDownRef.current = false;

    if (stroke && stroke.points.length > 1) {
      const committed = [...strokes, stroke];
      setStrokes(committed);
      setUndoneStrokes([]);
      currentStrokeRef.current = null;
      if (canvas) redrawCanvas(canvas, committed);
    } else {
      currentStrokeRef.current = null;
      if (canvas) redrawCanvas(canvas, strokes);
    }
  };

  const onPointerLeave = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    const canvas = canvasRef.current;
    const stroke = currentStrokeRef.current;

    isPointerDownRef.current = false;

    if (stroke && stroke.points.length > 1) {
      const committed = [...strokes, stroke];
      setStrokes(committed);
      setUndoneStrokes([]);
      currentStrokeRef.current = null;
      if (canvas) redrawCanvas(canvas, committed);
    } else {
      currentStrokeRef.current = null;
      if (canvas) redrawCanvas(canvas, strokes);
    }
  };

  const undo = () => {
    const lastStroke = strokes[strokes.length - 1];
    if (!lastStroke) return;
    const next = strokes.slice(0, -1);
    setStrokes(next);
    setUndoneStrokes((prev) => [...prev, lastStroke]);
    if (canvasRef.current) redrawCanvas(canvasRef.current, next);
  };

  const redo = () => {
    setUndoneStrokes((prev) => {
      const stroke = prev[prev.length - 1];
      if (!stroke) return prev;
      const nextUndone = prev.slice(0, -1);
      setStrokes((s) => {
        const committed = [...s, stroke];
        if (canvasRef.current) redrawCanvas(canvasRef.current, committed);
        return committed;
      });
      return nextUndone;
    });
  };

  const clear = () => {
    setStrokes([]);
    setUndoneStrokes([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return {
    isDrawingMode,
    activeTool,
    color,
    strokeWidth,
    strokes,
    undoneStrokes,
    canvasRef,
    onToggleDrawing,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    setActiveTool,
    setColor,
    setStrokeWidth,
    undo,
    redo,
    clear,
  };
}
