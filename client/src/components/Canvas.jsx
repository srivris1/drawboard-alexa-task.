import { useRef, useEffect, useCallback } from 'react';
import { getStroke } from 'perfect-freehand';
import { getPathFromStroke, DEFAULT_STROKE_OPTIONS } from '../utils/drawingUtils';

export default function Canvas({
  strokes,
  tool,
  color,
  brushSize,
  onStrokeComplete,
  onCursorMove
}) {
  const baseRef = useRef(null);
  const activeRef = useRef(null);
  const isDrawingRef = useRef(false);
  const pointsRef = useRef([]);
  const rafRef = useRef(null);

  const syncDimensions = useCallback(() => {
    const dpr = window.devicePixelRatio || 1;

    [baseRef, activeRef].forEach(ref => {
      const canvas = ref.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.getContext('2d').scale(dpr, dpr);
    });
  }, []);

  useEffect(() => {
    syncDimensions();
    window.addEventListener('resize', syncDimensions);
    return () => window.removeEventListener('resize', syncDimensions);
  }, [syncDimensions]);

  const drawStroke = useCallback((ctx, points, strokeColor, strokeSize, strokeTool) => {
    if (!points || points.length < 2) return;

    const outline = getStroke(points, {
      ...DEFAULT_STROKE_OPTIONS,
      size: strokeSize
    });

    const pathStr = getPathFromStroke(outline);
    if (!pathStr) return;

    const path = new Path2D(pathStr);

    if (strokeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill(path);
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.fillStyle = strokeColor;
      ctx.fill(path);
    }
  }, []);

  useEffect(() => {
    const canvas = baseRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    for (const s of strokes) {
      drawStroke(ctx, s.points, s.color, s.size, s.tool);
    }
  }, [strokes, drawStroke]);

  const renderActive = useCallback(() => {
    const canvas = activeRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (pointsRef.current.length > 1) {
      drawStroke(ctx, pointsRef.current, color, brushSize, tool);
    }
  }, [color, brushSize, tool, drawStroke]);

  const getPoint = useCallback((e) => {
    const rect = baseRef.current?.getBoundingClientRect();
    if (!rect) return [0, 0, 0.5];
    return [
      e.clientX - rect.left,
      e.clientY - rect.top,
      e.pressure || 0.5
    ];
  }, []);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    pointsRef.current = [getPoint(e)];
    renderActive();
  }, [getPoint, renderActive]);

  const handlePointerMove = useCallback((e) => {
    const pt = getPoint(e);
    onCursorMove?.({ x: pt[0], y: pt[1] });

    if (!isDrawingRef.current) return;

    pointsRef.current.push(pt);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(renderActive);
  }, [getPoint, renderActive, onCursorMove]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (pointsRef.current.length > 1) {
      const stroke = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        points: [...pointsRef.current],
        color,
        size: brushSize,
        tool
      };
      onStrokeComplete?.(stroke);
    }

    pointsRef.current = [];

    const canvas = activeRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }, [color, brushSize, tool, onStrokeComplete]);

  return (
    <div className="canvas-container" id="canvas-container">
      <canvas ref={baseRef} id="base-canvas" />
      <canvas
        ref={activeRef}
        id="active-canvas"
        style={{ cursor: 'crosshair' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
