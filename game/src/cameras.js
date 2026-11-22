// Security cameras: wall-mounted, sweeping cones, and the alarm they feed.
// A camera that sees the thief flashes red and pushes the alarm up fast.

import { angleDiff, angleTo, dist, hasLineOfSight } from './util.js';
import { insideSmoke } from './player.js';

export function createCameras(defs) {
  return defs.map((d, i) => ({
    id: i,
    x: d.x,
    y: d.y,
    baseAngle: d.baseAngle,
    sweep: d.sweep,
    range: d.range,
    speed: d.speed,
    phase: i * 1.7,
    angle: d.baseAngle,
    seeing: false,
    alert: 0,
  }));
}

export function cameraSeesPlayer(c, p, solids) {
  if (insideSmoke(p, p.x, p.y)) return false;
  const d = dist(c.x, c.y, p.x, p.y);
  let range = c.range;
  if (p.inShadow) range *= 0.6;
  if (p.sneaking) range *= 0.85;
  if (d > range) return false;
  const a = angleTo(c.x, c.y, p.x, p.y);
  if (Math.abs(angleDiff(a, c.angle)) > 0.5) return false;
  return hasLineOfSight(c.x, c.y, p.x, p.y, solids);
}

export function updateCameras(cameras, p, solids, dt, time) {
  let anySeeing = false;
  for (const c of cameras) {
    c.angle = c.baseAngle + Math.sin(time * c.speed + c.phase) * c.sweep;
    c.seeing = cameraSeesPlayer(c, p, solids);
    if (c.seeing) {
      c.alert = Math.min(1, c.alert + dt * 2);
      anySeeing = true;
    } else {
      c.alert = Math.max(0, c.alert - dt * 0.8);
    }
  }
  return anySeeing;
}
