// All drawing for Star Sapphire Heist: the museum room, the cones, the thief,
// the guards, the HUD, and every screen overlay. No images are loaded: every
// shape is drawn with canvas paths, so the game needs no asset files.

import { clamp } from './util.js';

const HUD_H = 64;
const FLOOR_A = '#2b2f45';
const FLOOR_B = '#262a3e';
const CARPET = '#5a2e3d';
const WALL = '#171a28';
const WALL_TOP = '#2e3350';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCone(ctx, x, y, angle, range, halfAngle, color) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawFloor(ctx, level, time) {
  // Marble tiles.
  for (let ty = 0; ty < 9; ty++) {
    for (let tx = 0; tx < 16; tx++) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? FLOOR_A : FLOOR_B;
      ctx.fillRect(tx * 80, HUD_H + ty * 82, 80, 82);
    }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let tx = 0; tx <= 16; tx++) {
    ctx.beginPath();
    ctx.moveTo(tx * 80, HUD_H);
    ctx.lineTo(tx * 80, 800);
    ctx.stroke();
  }
  for (let ty = 0; ty <= 9; ty++) {
    ctx.beginPath();
    ctx.moveTo(0, HUD_H + ty * 82);
    ctx.lineTo(1280, HUD_H + ty * 82);
    ctx.stroke();
  }
  // Red carpet runner down the middle of the gallery.
  ctx.fillStyle = CARPET;
  ctx.fillRect(596, HUD_H, 88, 736);
  ctx.fillStyle = 'rgba(212,175,55,0.35)';
  ctx.fillRect(600, HUD_H, 2, 736);
  ctx.fillRect(678, HUD_H, 2, 736);
  // Soft night light pools from the ceiling lamps.
  const lamps = [[320, 200], [960, 200], [320, 620], [960, 620]];
  for (const [lx, ly] of lamps) {
    const g = ctx.createRadialGradient(lx, ly, 10, lx, ly, 150);
    g.addColorStop(0, 'rgba(255,214,140,0.10)');
    g.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = g;
    ctx.fillRect(lx - 150, ly - 150, 300, 300);
  }
}

function drawWalls(ctx, level) {
  for (const w of level.walls) {
    ctx.fillStyle = WALL;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = WALL_TOP;
    if (w.h <= 16) ctx.fillRect(w.x, w.y, w.w, 4);
    else ctx.fillRect(w.x, w.y, 4, w.h);
  }
}

function drawShadows(ctx, level, time) {
  for (const s of level.shadows) {
    const pulse = 0.5 + Math.sin(time * 0.8 + s.x) * 0.04;
    ctx.fillStyle = `rgba(6,8,18,${pulse})`;
    roundRect(ctx, s.x, s.y, s.w, s.h, 18);
    ctx.fill();
    ctx.fillStyle = 'rgba(140,170,255,0.10)';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHADOW', s.x + s.w / 2, s.y + s.h / 2 + 4);
  }
}

function drawCover(ctx, level) {
  for (const c of level.cover) {
    if (c.kind === 'case') {
      ctx.fillStyle = '#3a2f1e';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = 'rgba(150,210,255,0.28)';
      roundRect(ctx, c.x + 4, c.y + 4, c.w - 8, c.h - 8, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(c.x + 10, c.y + 8, 22, 4);
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (c.kind === 'statue') {
      ctx.fillStyle = '#4a4a58';
      ctx.fillRect(c.x + 6, c.y + c.h - 10, c.w - 12, 10);
      ctx.fillStyle = '#8f8fa3';
      ctx.beginPath();
      ctx.arc(c.x + c.w / 2, c.y + c.h / 2 - 4, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c9c9d8';
      ctx.beginPath();
      ctx.arc(c.x + c.w / 2, c.y + c.h / 2 - 12, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (c.kind === 'plant') {
      ctx.fillStyle = '#5a3a22';
      ctx.fillRect(c.x + 10, c.y + c.h - 14, c.w - 20, 14);
      ctx.fillStyle = '#2e6b34';
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.35;
        ctx.beginPath();
        ctx.ellipse(c.x + c.w / 2 + Math.cos(a) * 10, c.y + 14 + Math.sin(a) * 8, 7, 14, a, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // desk
      ctx.fillStyle = '#4a3220';
      roundRect(ctx, c.x, c.y, c.w, c.h, 6);
      ctx.fill();
      ctx.fillStyle = '#6b4a2e';
      ctx.fillRect(c.x + 8, c.y + 8, c.w - 16, 10);
      ctx.fillStyle = '#e8d27a';
      ctx.beginPath();
      ctx.arc(c.x + 24, c.y + c.h / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSapphire(ctx, x, y, time) {
  const glow = 26 + Math.sin(time * 3) * 6;
  const g = ctx.createRadialGradient(x, y, 4, x, y, glow);
  g.addColorStop(0, 'rgba(90,200,255,0.85)');
  g.addColorStop(1, 'rgba(90,200,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, glow, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7fd4ff';
  ctx.beginPath();
  ctx.moveTo(x, y - 16);
  ctx.lineTo(x + 13, y);
  ctx.lineTo(x, y + 16);
  ctx.lineTo(x - 13, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8f8ff';
  ctx.beginPath();
  ctx.moveTo(x, y - 16);
  ctx.lineTo(x + 13, y);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();
}

function drawLootItem(ctx, item, time) {
  if (item.kind === 'gold') {
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.moveTo(item.x - 12, item.y + 8);
    ctx.lineTo(item.x - 8, item.y - 8);
    ctx.lineTo(item.x + 8, item.y - 8);
    ctx.lineTo(item.x + 12, item.y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f5d76e';
    ctx.fillRect(item.x - 7, item.y - 6, 14, 3);
  } else if (item.kind === 'painting') {
    ctx.fillStyle = '#8a6d2f';
    ctx.fillRect(item.x - 14, item.y - 18, 28, 36);
    ctx.fillStyle = '#3d6b8f';
    ctx.fillRect(item.x - 10, item.y - 14, 20, 28);
    ctx.fillStyle = '#e8c85a';
    ctx.beginPath();
    ctx.arc(item.x + 4, item.y - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2e5238';
    ctx.fillRect(item.x - 10, item.y + 6, 20, 8);
  } else {
    // small gem
    ctx.fillStyle = '#c77dff';
    ctx.beginPath();
    ctx.moveTo(item.x, item.y - 11);
    ctx.lineTo(item.x + 9, item.y);
    ctx.lineTo(item.x, item.y + 11);
    ctx.lineTo(item.x - 9, item.y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawExit(ctx, exit, open, time) {
  const pulse = open ? 0.6 + Math.sin(time * 4) * 0.25 : 0.25;
  ctx.fillStyle = open ? `rgba(60,220,120,${pulse})` : 'rgba(120,120,120,0.5)';
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.fillStyle = open ? '#12351f' : '#222';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'EXIT OPEN' : 'EXIT LOCKED', exit.x + exit.w / 2, exit.y + 21);
  if (open) {
    ctx.fillStyle = '#3cdc78';
    ctx.beginPath();
    ctx.moveTo(exit.x + exit.w / 2 - 8, exit.y - 14);
    ctx.lineTo(exit.x + exit.w / 2 + 8, exit.y - 14);
    ctx.lineTo(exit.x + exit.w / 2, exit.y - 2);
    ctx.closePath();
    ctx.fill();
  }
}

function drawCones(ctx, guards, cameras) {
  for (const c of cameras) {
    drawCone(ctx, c.x, c.y, c.angle, c.range, 0.5, c.seeing ? 'rgba(255,60,60,0.30)' : 'rgba(255,220,90,0.16)');
  }
  for (const g of guards) {
    let color = 'rgba(255,220,90,0.16)';
    if (g.state === 'chase') color = 'rgba(255,60,60,0.32)';
    else if (g.suspicion > 0.45) color = 'rgba(255,150,40,0.26)';
    drawCone(ctx, g.x, g.y, g.facing, 235, 0.58, color);
  }
}

function drawCameras(ctx, cameras, time) {
  for (const c of cameras) {
    ctx.fillStyle = '#1c1f30';
    ctx.fillRect(c.x - 12, c.y - 8, 24, 16);
    ctx.fillStyle = c.seeing ? '#ff3c3c' : '#ffd65a';
    ctx.beginPath();
    ctx.arc(c.x + Math.cos(c.angle) * 10, c.y + Math.sin(c.angle) * 10, 5, 0, Math.PI * 2);
    ctx.fill();
    if (c.seeing) {
      ctx.fillStyle = '#ff3c3c';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', c.x, c.y - 16);
    }
  }
}

function drawGuards(ctx, guards, time) {
  for (const g of guards) {
    // Body: navy uniform, cap, flashlight dot.
    ctx.fillStyle = '#1f3a6e';
    ctx.beginPath();
    ctx.arc(g.x, g.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f5aa8';
    ctx.beginPath();
    ctx.arc(g.x, g.y, 14, g.facing - 1.1, g.facing + 1.1);
    ctx.lineTo(g.x, g.y);
    ctx.fill();
    ctx.fillStyle = '#f2d8a7';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.facing) * 5, g.y + Math.sin(g.facing) * 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16264d';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.facing) * 5, g.y + Math.sin(g.facing) * 5 - 2, 6.5, Math.PI, Math.PI * 2);
    ctx.fill();
    // Suspicion ring above the guard.
    if (g.suspicion > 0.05 && g.state !== 'chase') {
      ctx.strokeStyle = g.suspicion > 0.45 ? '#ff9a28' : '#ffd65a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 20, -Math.PI / 2, -Math.PI / 2 + g.suspicion * Math.PI * 2);
      ctx.stroke();
    }
    if (g.state === 'chase') {
      ctx.fillStyle = '#ff3c3c';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', g.x, g.y - 24);
    } else if (g.state === 'distracted') {
      ctx.fillStyle = '#ffd65a';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', g.x, g.y - 24);
    }
    if (g.seenFlash > 0) {
      ctx.strokeStyle = `rgba(255,60,60,${g.seenFlash})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 24, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawPlayer(ctx, p, time) {
  // Hooded thief: dark cloak, pale mask, soft shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 10, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  const bob = p.moving ? Math.sin(time * 12) * 1.5 : 0;
  ctx.fillStyle = '#23232e';
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - 14 + bob);
  ctx.lineTo(p.x + 12, p.y + 10 + bob);
  ctx.lineTo(p.x - 12, p.y + 10 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3a3a4d';
  ctx.beginPath();
  ctx.arc(p.x, p.y - 4 + bob, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2e8d5';
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.facing) * 3, p.y - 4 + bob + Math.sin(p.facing) * 3, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#23232e';
  ctx.fillRect(p.x + Math.cos(p.facing) * 3 - 4, p.y - 6 + bob + Math.sin(p.facing) * 3, 8, 3);
  if (p.sneaking) {
    ctx.fillStyle = 'rgba(140,170,255,0.8)';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SNEAKING', p.x, p.y - 22);
  }
}

function drawTools(ctx, p, time) {
  for (const c of p.coinsThrown) {
    const blink = 0.6 + Math.sin(time * 6) * 0.3;
    ctx.fillStyle = `rgba(245,215,110,${blink})`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,215,110,0.5)';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 12 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const s of p.smokePuffs) {
    const a = clamp(s.t / 5, 0, 1) * 0.55;
    const g = ctx.createRadialGradient(s.x, s.y, 5, s.x, s.y, 95);
    g.addColorStop(0, `rgba(200,200,210,${a})`);
    g.addColorStop(1, 'rgba(200,200,210,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 95, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawWorld(ctx, game, time) {
  const level = game.level;
  drawFloor(ctx, level, time);
  drawShadows(ctx, level, time);
  drawWalls(ctx, level);
  drawCover(ctx, level);
  drawExit(ctx, level.exit, game.player.hasSapphire, time);
  if (!game.player.hasSapphire) drawSapphire(ctx, level.sapphire.x, level.sapphire.y, time);
  for (const item of level.loot) {
    if (!item.taken) drawLootItem(ctx, item, time);
  }
  drawCones(ctx, game.guards, game.cameras);
  drawCameras(ctx, game.cameras, time);
  drawTools(ctx, game.player, time);
  drawGuards(ctx, game.guards, time);
  drawPlayer(ctx, game.player, time);
}

export function drawHUD(ctx, game) {
  ctx.fillStyle = '#101223';
  ctx.fillRect(0, 0, 1280, HUD_H);
  ctx.fillStyle = '#2e3350';
  ctx.fillRect(0, HUD_H - 2, 1280, 2);
  ctx.fillStyle = '#f5d76e';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('STAR SAPPHIRE HEIST', 18, 27);
  ctx.fillStyle = '#9aa3c7';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(game.level.name + '  -  Room ' + (game.levelIndex + 1) + ' of 3', 18, 48);

  // Alarm meter.
  const ax = 420;
  ctx.fillStyle = '#c7cde8';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('ALARM', ax, 24);
  ctx.fillStyle = '#232742';
  roundRect(ctx, ax + 62, 10, 220, 20, 5);
  ctx.fill();
  const alarm = clamp(game.alarm, 0, 100) / 100;
  const alarmColor = alarm < 0.4 ? '#3cdc78' : alarm < 0.7 ? '#ffb02e' : '#ff3c3c';
  ctx.fillStyle = alarmColor;
  if (alarm > 0.01) {
    roundRect(ctx, ax + 62, 10, 220 * alarm, 20, 5);
    ctx.fill();
  }
  ctx.strokeStyle = '#5a628a';
  ctx.lineWidth = 1;
  roundRect(ctx, ax + 62, 10, 220, 20, 5);
  ctx.stroke();
  ctx.fillStyle = '#c7cde8';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(Math.round(game.alarm) + '%', ax + 290, 25);
  ctx.fillText(game.alarmState, ax + 62, 48);

  // Loot.
  const lx = 780;
  ctx.fillStyle = '#c7cde8';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('LOOT', lx, 24);
  ctx.fillStyle = game.player.hasSapphire ? '#7fd4ff' : '#5a628a';
  ctx.beginPath();
  ctx.moveTo(lx + 62, 12);
  ctx.lineTo(lx + 72, 20);
  ctx.lineTo(lx + 62, 28);
  ctx.lineTo(lx + 52, 20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8ecff';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(game.player.lootCount + ' items  -  $' + game.player.lootValue, lx + 82, 24);
  ctx.fillStyle = '#9aa3c7';
  ctx.fillText(game.player.hasSapphire ? 'Sapphire secured: reach the EXIT' : 'Sapphire not yet taken', lx, 48);

  // Tools.
  const tx = 1010;
  ctx.fillStyle = '#c7cde8';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('TOOLS', tx, 24);
  ctx.fillStyle = '#f5d76e';
  ctx.fillText('Coins ' + game.player.coins + ' (click)', tx, 48);
  ctx.fillStyle = '#c7cde8';
  ctx.fillText('Smoke ' + game.player.smokes + ' (Q)', tx + 130, 48);

  // Score and time.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#f5d76e';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('SCORE ' + game.score, 1262, 27);
  ctx.fillStyle = '#9aa3c7';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(Math.floor(game.elapsed) + 's', 1262, 48);
  ctx.textAlign = 'left';
}

// A dim overlay panel with centred title and lines of text.
function overlayPanel(ctx, title, titleColor, lines, hint) {
  ctx.fillStyle = 'rgba(8,10,22,0.72)';
  ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = 'rgba(16,18,35,0.95)';
  roundRect(ctx, 340, 210, 600, 330, 14);
  ctx.fill();
  ctx.strokeStyle = '#3a4066';
  ctx.lineWidth = 2;
  roundRect(ctx, 340, 210, 600, 330, 14);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = titleColor;
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.fillText(title, 640, 275);
  ctx.fillStyle = '#e8ecff';
  ctx.font = '16px system-ui, sans-serif';
  let y = 320;
  for (const line of lines) {
    ctx.fillText(line, 640, y);
    y += 28;
  }
  ctx.fillStyle = '#9aa3c7';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText(hint, 640, 505);
  ctx.textAlign = 'left';
}

export function drawTitle(ctx, game) {
  drawWorld(ctx, game, game.time);
  drawHUD(ctx, game);
  overlayPanel(
    ctx,
    'STAR SAPPHIRE HEIST',
    '#f5d76e',
    [
      'A night museum, a priceless sapphire, and guards who never blink.',
      'Cross the gallery, dodge the cones, grab the sapphire, reach the EXIT.',
      'WASD or arrows to move, Shift to sneak, click to toss a coin, Q for smoke.',
      'Shadows hide you. Cameras and guards raise the ALARM. At 100%, it is over.',
    ],
    'Press ENTER or click to start the heist',
  );
}

export function drawPaused(ctx, game) {
  drawWorld(ctx, game, game.time);
  drawHUD(ctx, game);
  overlayPanel(ctx, 'PAUSED', '#c7cde8', ['Take a breath. The guards are waiting.'], 'Press P to keep going');
}

export function drawLevelComplete(ctx, game) {
  drawWorld(ctx, game, game.time);
  drawHUD(ctx, game);
  overlayPanel(
    ctx,
    'ROOM CLEARED',
    '#3cdc78',
    [
      game.level.name + ' done. Loot so far: $' + game.player.lootValue + '.',
      'Score: ' + game.score + (game.ghost ? '  -  GHOST RUN: the alarm never rose.' : ''),
    ],
    'Press ENTER for the next room',
  );
}

export function drawCaught(ctx, game, reason) {
  drawWorld(ctx, game, game.time);
  drawHUD(ctx, game);
  overlayPanel(
    ctx,
    'CAUGHT',
    '#ff3c3c',
    [reason, 'The museum keeps its sapphire tonight.', 'Score: ' + game.score],
    'Press R to try the room again',
  );
}

export function drawVictory(ctx, game) {
  drawWorld(ctx, game, game.time);
  drawHUD(ctx, game);
  const rating = game.ghost ? 'GHOST' : game.alarmPeak < 50 ? 'SHADOW' : 'LOUD';
  overlayPanel(
    ctx,
    'THE GETAWAY',
    '#f5d76e',
    [
      'Three rooms, one sapphire, and the night is yours.',
      'Final loot: $' + game.player.lootValue + '   Final score: ' + game.score,
      'Heist rating: ' + rating + (game.ghost ? ' (never spotted, never a sound)' : ''),
    ],
    'Press R to run the heist again',
  );
}
