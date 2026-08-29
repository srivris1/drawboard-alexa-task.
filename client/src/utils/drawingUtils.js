import { getStroke } from 'perfect-freehand';

export function getPathFromStroke(outlinePoints) {
  if (!outlinePoints.length) return '';

  const d = outlinePoints.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...outlinePoints[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
}

export const DEFAULT_STROKE_OPTIONS = {
  size: 8,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  start: { cap: true, taper: 0 },
  end: { cap: true, taper: 0 }
};

export function renderStroke(ctx, stroke) {
  if (!stroke.points || stroke.points.length === 0) return;

  const outline = getStroke(stroke.points, {
    ...DEFAULT_STROKE_OPTIONS,
    size: stroke.size || 8
  });

  const pathData = getPathFromStroke(outline);
  if (!pathData) return;

  const path = new Path2D(pathData);

  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fill(path);
    ctx.globalCompositeOperation = 'source-over';
  } else {
    ctx.fillStyle = stroke.color || '#ffffff';
    ctx.fill(path);
  }
}

export function renderAllStrokes(ctx, canvas, strokes) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  for (const stroke of strokes) {
    renderStroke(ctx, stroke);
  }
}
