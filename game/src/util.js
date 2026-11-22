// Geometry helpers for Star Sapphire Heist: angles, distances, and line of sight.
// Every helper here is pure math with no game state of its own.

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function dist(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// True when the segment from (ax, ay) to (bx, by) touches rectangle r.
export function segmentHitsRect(ax, ay, bx, by, r) {
  if (pointInRect(ax, ay, r) || pointInRect(bx, by, r)) return true;
  const edges = [
    [r.x, r.y, r.x + r.w, r.y],
    [r.x + r.w, r.y, r.x + r.w, r.y + r.h],
    [r.x + r.w, r.y + r.h, r.x, r.y + r.h],
    [r.x, r.y + r.h, r.x, r.y],
  ];
  for (const [x1, y1, x2, y2] of edges) {
    if (segmentsCross(ax, ay, bx, by, x1, y1, x2, y2)) return true;
  }
  return false;
}

function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = side(dx, dy, cx, cy, ax, ay);
  const d2 = side(dx, dy, cx, cy, bx, by);
  const d3 = side(bx, by, ax, ay, cx, cy);
  const d4 = side(bx, by, ax, ay, dx, dy);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function side(px, py, qx, qy, rx, ry) {
  return (rx - px) * (qy - py) - (ry - py) * (qx - px);
}

// True when nothing in `solids` blocks the view from (ax, ay) to (bx, by).
export function hasLineOfSight(ax, ay, bx, by, solids) {
  for (const r of solids) {
    if (segmentHitsRect(ax, ay, bx, by, r)) return false;
  }
  return true;
}

// Push a circle of radius `rad` at (x, y) out of every rect in `solids`.
// Returns the corrected position as [x, y].
export function resolveCircleRects(x, y, rad, solids) {
  for (const r of solids) {
    const cx = clamp(x, r.x, r.x + r.w);
    const cy = clamp(y, r.y, r.y + r.h);
    const dx = x - cx;
    const dy = y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < rad * rad) {
      if (d2 === 0) {
        // Center inside the rect: push out along the smallest overlap.
        const left = x - r.x + rad;
        const right = r.x + r.w - x + rad;
        const top = y - r.y + rad;
        const bottom = r.y + r.h - y + rad;
        const m = Math.min(left, right, top, bottom);
        if (m === left) x = r.x - rad;
        else if (m === right) x = r.x + r.w + rad;
        else if (m === top) y = r.y - rad;
        else y = r.y + r.h + rad;
      } else {
        const d = Math.sqrt(d2);
        x = cx + (dx / d) * rad;
        y = cy + (dy / d) * rad;
      }
    }
  }
  return [x, y];
}

// Deterministic pseudo-random generator so staged shots look the same every run.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
