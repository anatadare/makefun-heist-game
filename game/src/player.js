// The thief: movement, sneaking, tools, and loot pickups.
// The player knows nothing about guards; main.js feeds it what it can see.

import { clamp, dist, resolveCircleRects, pointInRect } from './util.js';

export const PLAYER_RADIUS = 13;
export const WALK_SPEED = 178;
export const SNEAK_SPEED = 96;

export function createPlayer(start, coins, smokes) {
  return {
    x: start.x,
    y: start.y,
    facing: -Math.PI / 2,
    moving: false,
    sneaking: false,
    coins,
    smokes,
    coinsThrown: [], // {x, y, t} landing spots that still ring
    smokePuffs: [], // {x, y, t} active smoke clouds
    stepTimer: 0,
    lootValue: 0,
    lootCount: 0,
    hasSapphire: false,
    inShadow: false,
  };
}

export function updatePlayer(p, input, solids, dt, fx) {
  const v = input.moveVector();
  p.moving = v.x !== 0 || v.y !== 0;
  p.sneaking = input.sneaking;
  const speed = p.sneaking ? SNEAK_SPEED : WALK_SPEED;
  if (p.moving) {
    p.facing = Math.atan2(v.y, v.x);
    p.x += v.x * speed * dt;
    p.y += v.y * speed * dt;
    p.stepTimer -= dt;
    if (p.stepTimer <= 0) {
      p.stepTimer = p.sneaking ? 0.55 : 0.34;
      fx.step();
    }
  }
  [p.x, p.y] = resolveCircleRects(p.x, p.y, PLAYER_RADIUS, solids);
  p.x = clamp(p.x, 16 + PLAYER_RADIUS, 1264 - PLAYER_RADIUS);
  p.y = clamp(p.y, 80 + PLAYER_RADIUS, 784 - PLAYER_RADIUS);

  // Coin toss: click throws a coin toward the mouse, if any are left.
  if (input.mouse.clicked && input.mouse.button === 0 && p.coins > 0) {
    const tx = clamp(input.mouse.clickX, 30, 1250);
    const ty = clamp(input.mouse.clickY, 90, 770);
    const d = dist(p.x, p.y, tx, ty);
    const reach = Math.min(d, 260);
    const a = Math.atan2(ty - p.y, tx - p.x);
    p.coins--;
    p.coinsThrown.push({ x: p.x + Math.cos(a) * reach, y: p.y + Math.sin(a) * reach, t: 4 });
    fx.coin();
  }
  // Smoke puff: Q or Space drops a cloud at the thief's feet.
  if ((input.wasPressed('KeyQ') || input.wasPressed('Space')) && p.smokes > 0) {
    p.smokes--;
    p.smokePuffs.push({ x: p.x, y: p.y, t: 5 });
    fx.smoke();
  }
  for (const c of p.coinsThrown) c.t -= dt;
  p.coinsThrown = p.coinsThrown.filter((c) => c.t > 0);
  for (const s of p.smokePuffs) s.t -= dt;
  p.smokePuffs = p.smokePuffs.filter((s) => s.t > 0);
}

// True when the thief stands inside a smoke cloud.
export function insideSmoke(p, x, y) {
  for (const s of p.smokePuffs) {
    if (dist(x, y, s.x, s.y) < 95) return true;
  }
  return false;
}

// True when the thief stands in a shadow patch.
export function updateShadow(p, shadows) {
  p.inShadow = false;
  for (const s of shadows) {
    if (pointInRect(p.x, p.y, s)) {
      p.inShadow = true;
      return;
    }
  }
}

// Pick up any loot within reach. Returns the picked items.
export function collectLoot(p, level, fx) {
  const picked = [];
  if (!p.hasSapphire && dist(p.x, p.y, level.sapphire.x, level.sapphire.y) < 34) {
    p.hasSapphire = true;
    p.lootValue += 500;
    p.lootCount++;
    picked.push({ kind: 'sapphire', value: 500 });
    fx.pickup();
  }
  for (const item of level.loot) {
    if (!item.taken && dist(p.x, p.y, item.x, item.y) < 32) {
      item.taken = true;
      p.lootValue += item.value;
      p.lootCount++;
      picked.push(item);
      fx.pickup();
    }
  }
  return picked;
}
