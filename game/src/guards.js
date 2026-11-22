// Guards: patrol routes, vision cones, suspicion, chase, and coin distractions.
// A guard's state is one of: patrol, suspicious, chase, distracted, returning.

import { angleDiff, angleTo, clamp, dist, hasLineOfSight, resolveCircleRects } from './util.js';
import { insideSmoke } from './player.js';

export const GUARD_RADIUS = 14;
export const GUARD_VIEW_RANGE = 235;
export const GUARD_VIEW_HALF_ANGLE = 0.58; // about 33 degrees each side
export const GUARD_CHASE_SPEED = 205;

export function createGuards(defs) {
  return defs.map((d, i) => ({
    id: i,
    waypoints: d.waypoints,
    wpIndex: i % d.waypoints.length,
    speed: d.speed,
    x: d.waypoints[i % d.waypoints.length][0],
    y: d.waypoints[i % d.waypoints.length][1],
    facing: Math.PI / 2,
    state: 'patrol',
    suspicion: 0,
    lostTimer: 0,
    distractX: 0,
    distractY: 0,
    distractTimer: 0,
    pauseTimer: 0,
    seenFlash: 0,
  }));
}

// Can this guard see the thief right now? Cones, range, walls, smoke, shadows.
export function guardSeesPlayer(g, p, solids) {
  if (insideSmoke(p, g.x, g.y) || insideSmoke(p, p.x, p.y)) return false;
  const d = dist(g.x, g.y, p.x, p.y);
  let range = GUARD_VIEW_RANGE;
  if (p.inShadow) range *= 0.62;
  if (p.sneaking) range *= 0.8;
  if (d > range) return false;
  const a = angleTo(g.x, g.y, p.x, p.y);
  if (Math.abs(angleDiff(a, g.facing)) > GUARD_VIEW_HALF_ANGLE) return false;
  return hasLineOfSight(g.x, g.y, p.x, p.y, solids);
}

function moveToward(g, tx, ty, speed, solids, dt) {
  const d = dist(g.x, g.y, tx, ty);
  if (d < 2) return true;
  const step = Math.min(d, speed * dt);
  g.facing = angleTo(g.x, g.y, tx, ty);
  g.x += Math.cos(g.facing) * step;
  g.y += Math.sin(g.facing) * step;
  [g.x, g.y] = resolveCircleRects(g.x, g.y, GUARD_RADIUS, solids);
  return d - step < 4;
}

export function updateGuards(guards, p, solids, dt, fx, onCaught) {
  let anyAlert = false;
  for (const g of guards) {
    if (g.seenFlash > 0) g.seenFlash -= dt;
    const sees = guardSeesPlayer(g, p, solids);

    // Suspicion rises fast up close, slower at range, and drains when hidden.
    if (sees) {
      const d = dist(g.x, g.y, p.x, p.y);
      const closeness = clamp(1.4 - d / GUARD_VIEW_RANGE, 0.4, 1.4);
      let rate = 0.85 * closeness;
      if (p.inShadow) rate *= 0.45;
      if (p.sneaking) rate *= 0.7;
      g.suspicion = clamp(g.suspicion + rate * dt, 0, 1);
      g.lostTimer = 0;
      if (g.suspicion > 0.45) anyAlert = true;
    } else {
      g.suspicion = clamp(g.suspicion - 0.22 * dt, 0, 1);
    }

    // A ringing coin pulls the guard off patrol.
    let coin = null;
    for (const c of p.coinsThrown) {
      if (dist(g.x, g.y, c.x, c.y) < 280) {
        coin = c;
        break;
      }
    }
    if (coin && g.state !== 'chase') {
      g.state = 'distracted';
      g.distractX = coin.x;
      g.distractY = coin.y;
      g.distractTimer = 4;
    }

    if (g.suspicion >= 1 && g.state !== 'chase') {
      g.state = 'chase';
      g.seenFlash = 0.6;
      fx.spotted();
    }

    if (g.state === 'chase') {
      if (sees) {
        g.lostTimer = 0;
        moveToward(g, p.x, p.y, GUARD_CHASE_SPEED, solids, dt);
      } else {
        g.lostTimer += dt;
        moveToward(g, p.x, p.y, GUARD_CHASE_SPEED * 0.8, solids, dt);
        if (g.lostTimer > 3.5) {
          g.state = 'returning';
          g.suspicion = 0.4;
        }
      }
      if (dist(g.x, g.y, p.x, p.y) < GUARD_RADIUS + 13) {
        onCaught('A guard grabbed you in the gallery.');
      }
    } else if (g.state === 'distracted') {
      g.distractTimer -= dt;
      const arrived = moveToward(g, g.distractX, g.distractY, g.speed * 1.25, solids, dt);
      if (arrived || g.distractTimer <= 0) {
        g.state = 'patrol';
        g.pauseTimer = 1.2;
      }
    } else if (g.state === 'returning') {
      const wp = g.waypoints[g.wpIndex];
      const arrived = moveToward(g, wp[0], wp[1], g.speed, solids, dt);
      if (arrived) g.state = 'patrol';
    } else {
      // Patrol: walk the route, pausing briefly at each waypoint to look around.
      if (g.pauseTimer > 0) {
        g.pauseTimer -= dt;
        g.facing += Math.sin(performance.now() / 900 + g.id) * 0.4 * dt;
      } else {
        const wp = g.waypoints[g.wpIndex];
        const arrived = moveToward(g, wp[0], wp[1], g.speed, solids, dt);
        if (arrived) {
          g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
          g.pauseTimer = 0.9;
        }
      }
      if (g.suspicion > 0.45) {
        // Suspicious: stop and stare toward the thief.
        g.facing = angleTo(g.x, g.y, p.x, p.y);
      }
    }
  }
  return anyAlert;
}
