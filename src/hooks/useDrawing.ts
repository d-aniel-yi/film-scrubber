"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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
  onResize: () => void;
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
      // line tool: draw from first point to last point
      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
    }

    ctx.stroke();
  }
}

export function useDrawing(): DrawingState {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const isPointerDownRef = useRef(false);

  // Refs mirror state so callbacks avoid stale closures
  const strokesRef = useRef<Stroke[]>([]);
  const undoneStrokesRef = useRef<Stroke[]>([]);

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>("freehand");
  const [color, setColor] = useState("#ff0000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [undoneStrokes, setUndoneStrokes] = useState<Stroke[]>([]);

  // Keep refs in sync with state
  useEffect(() => { strokesRef.current = strokes; }, [strokes]);
  useEffect(() => { undoneStrokesRef.current = undoneStrokes; }, [undoneStrokes]);

  const onToggleDrawing = () => {
    setIsDrawingMode((v) => {
      if (v && canvasRef.current) {
        // Exiting drawing mode — redraw to clear any preview state
        redrawCanvas(canvasRef.current, strokesRef.current);
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
    redrawCanvas(canvas, strokesRef.current, currentStrokeRef.current);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isPointerDownRef.current || !currentStrokeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasPoint(e, canvas);

    if (currentStrokeRef.current.tool === "line") {
      // Rubber-band preview: keep origin, replace endpoint
      currentStrokeRef.current.points = [currentStrokeRef.current.points[0], point];
    } else {
      // Freehand: append each point
      currentStrokeRef.current.points.push(point);
    }

    redrawCanvas(canvas, strokesRef.current, currentStrokeRef.current);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    const canvas = canvasRef.current;
    const stroke = currentStrokeRef.current;

    isPointerDownRef.current = false;

    if (stroke && stroke.points.length > 1) {
      const committed = [...strokesRef.current, stroke];
      setStrokes(committed);
      setUndoneStrokes([]);
      strokesRef.current = committed;
      undoneStrokesRef.current = [];
      currentStrokeRef.current = null;
      if (canvas) redrawCanvas(canvas, committed);
    } else {
      currentStrokeRef.current = null;
      if (canvas) redrawCanvas(canvas, strokesRef.current);
    }
  };

  const onPointerLeave = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    const canvas = canvasRef.current;
    const stroke = currentStrokeRef.current;

    isPointerDownRef.current = false;

    if (stroke && stroke.points.length > 1) {
      const committed = [...strokesRef.current, stroke];
      setStrokes(committed);
      setUndoneStrokes([]);
      strokesRef.current = committed;
      undoneStrokesRef.current = [];
      currentStrokeRef.current = null;
      if (canvas) redrawCanvas(canvas, committed);
    } else {
      currentStrokeRef.current = null;
      if (canvas) redrawCanvas(canvas, strokesRef.current);
    }
  };

  const undo = useCallback(() => {
    const current = strokesRef.current;
    if (current.length === 0) return;
    const removed = current[current.length - 1];
    const next = current.slice(0, -1);
    setStrokes(next);
    setUndoneStrokes((prev) => [...prev, removed]);
    strokesRef.current = next;
    undoneStrokesRef.current = [...undoneStrokesRef.current, removed];
    if (canvasRef.current) redrawCanvas(canvasRef.current, next);
  }, []);

  const redo = useCallback(() => {
    const undone = undoneStrokesRef.current;
    if (undone.length === 0) return;
    const stroke = undone[undone.length - 1];
    const nextUndone = undone.slice(0, -1);
    const next = [...strokesRef.current, stroke];
    setUndoneStrokes(nextUndone);
    setStrokes(next);
    strokesRef.current = next;
    undoneStrokesRef.current = nextUndone;
    if (canvasRef.current) redrawCanvas(canvasRef.current, next);
  }, []);

  const clear = useCallback(() => {
    setStrokes([]);
    setUndoneStrokes([]);
    strokesRef.current = [];
    undoneStrokesRef.current = [];
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const handleResize = useCallback(() => {
    if (canvasRef.current) redrawCanvas(canvasRef.current, strokesRef.current);
  }, []);

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
    onResize: handleResize,
  };
}
