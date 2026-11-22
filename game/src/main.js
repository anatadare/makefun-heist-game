// Star Sapphire Heist: the game loop, the alarm, the levels, and the win and lose.
// Boots the canvas, owns the game state, and hands drawing to render.js.

import { LEVELS } from './levels.js';
import { Input } from './input.js';
import { SoundFX } from './audio.js';
import { createPlayer, updatePlayer, updateShadow, collectLoot } from './player.js';
import { createGuards, updateGuards } from './guards.js';
import { createCameras, updateCameras } from './cameras.js';
import { applyShot } from './shots.js';
import { clamp, pointInRect } from './util.js';
import {
  drawWorld,
  drawHUD,
  drawTitle,
  drawPaused,
  drawLevelComplete,
  drawCaught,
  drawVictory,
} from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const game = {
  levels: LEVELS,
  levelIndex: 0,
  level: LEVELS[0],
  player: null,
  guards: [],
  cameras: [],
  state: 'title',
  alarm: 0,
  alarmPeak: 0,
  alarmState: 'Quiet: nobody suspects a thing',
  score: 0,
  elapsed: 0,
  time: 0,
  ghost: true,
  caughtReason: '',
  frozen: false,
  levelStartScore: 0,
};

const input = new Input(canvas);
const fx = new SoundFX();

function solidsOf(level) {
  return [...level.walls, ...level.cover];
}

function setupLevel(index) {
  game.levelIndex = index;
  game.level = LEVELS[index];
  // Fresh loot each attempt: clear the taken flags the last run set.
  for (const item of game.level.loot) item.taken = false;
  game.player = createPlayer(game.level.playerStart, game.level.coins, game.level.smokes);
  game.guards = createGuards(game.level.guards);
  game.cameras = createCameras(game.level.cameras);
  game.alarm = 0;
  game.alarmState = 'Quiet: nobody suspects a thing';
  game.elapsed = 0;
  game.levelStartScore = game.score;
  game.state = 'playing';
}

function startGame() {
  game.score = 0;
  game.ghost = true;
  game.alarmPeak = 0;
  setupLevel(0);
  fx.ensure();
  fx.startAmbient();
}

function restartLevel() {
  game.score = game.levelStartScore;
  setupLevel(game.levelIndex);
}

function levelComplete() {
  const timeBonus = Math.max(0, Math.round((game.level.parTime - game.elapsed) * 10));
  game.score += timeBonus;
  if (game.ghost) game.score += 300;
  fx.win();
  if (game.levelIndex + 1 >= LEVELS.length) {
    game.state = 'victory';
  } else {
    game.state = 'levelComplete';
  }
  announce();
}

function caught(reason) {
  if (game.state !== 'playing') return;
  game.state = 'caught';
  game.caughtReason = reason;
  fx.caught();
  announce();
}

function announce() {
  if (!statusEl) return;
  const parts = [
    'Star Sapphire Heist',
    game.level.name,
    'Alarm ' + Math.round(game.alarm) + ' percent',
    'Loot $' + game.player.lootValue,
    'Score ' + game.score,
    game.state,
  ];
  statusEl.textContent = parts.join('. ');
}

function update(dt) {
  if (game.frozen) return;
  game.time += dt;
  if (game.state !== 'playing') return;
  game.elapsed += dt;

  const solids = solidsOf(game.level);
  updatePlayer(game.player, input, solids, dt, fx);
  updateShadow(game.player, game.level.shadows);
  const picked = collectLoot(game.player, game.level, fx);
  for (const item of picked) game.score += item.value;

  const guardAlert = updateGuards(game.guards, game.player, solids, dt, fx, caught);
  const cameraSeeing = updateCameras(game.cameras, game.player, solids, dt, game.time);

  // The alarm climbs while anyone sees the thief, and drains while hidden.
  if (cameraSeeing) game.alarm += 16 * dt;
  else if (guardAlert) game.alarm += 10 * dt;
  else game.alarm -= 5 * dt;
  game.alarm = clamp(game.alarm, 0, 100);
  game.alarmPeak = Math.max(game.alarmPeak, game.alarm);
  if (game.alarmPeak > 25) game.ghost = false;
  if (game.alarm >= 100) {
    caught('The alarm hit 100%. The whole museum woke up.');
    return;
  }
  game.alarmState =
    game.alarm >= 70
      ? 'SPOTTED: run for the shadows'
      : game.alarm >= 40
        ? 'Warm: a guard is getting curious'
        : game.alarm >= 15
          ? 'A little noise somewhere'
          : 'Quiet: nobody suspects a thing';

  // Reach the exit with the sapphire and the room is cleared.
  if (game.player.hasSapphire && pointInRect(game.player.x, game.player.y, game.level.exit)) {
    levelComplete();
    return;
  }

  // A camera that spots the thief beeps, so the player hears the danger.
  if (cameraSeeing && Math.floor(game.time * 2) !== Math.floor((game.time - dt) * 2)) {
    fx.alarmBeep();
  }
  announce();
}

function render() {
  ctx.clearRect(0, 0, 1280, 800);
  if (game.state === 'title') drawTitle(ctx, game);
  else if (game.state === 'paused') drawPaused(ctx, game);
  else if (game.state === 'levelComplete') drawLevelComplete(ctx, game);
  else if (game.state === 'caught') drawCaught(ctx, game, game.caughtReason);
  else if (game.state === 'victory') drawVictory(ctx, game);
  else {
    drawWorld(ctx, game, game.time);
    drawHUD(ctx, game);
    // Red edge flash while a guard is chasing the thief.
    if (game.guards.some((g) => g.state === 'chase')) {
      const pulse = 0.18 + Math.sin(game.time * 6) * 0.08;
      ctx.strokeStyle = `rgba(255,60,60,${pulse})`;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 69, 1270, 726);
    }
  }
}

input.onKey = (code) => {
  fx.ensure();
  if (code === 'Enter') {
    if (game.state === 'title') startGame();
    else if (game.state === 'levelComplete') setupLevel(game.levelIndex + 1);
  } else if (code === 'KeyR') {
    if (game.state === 'caught' || game.state === 'victory') startGame();
    else if (game.state === 'playing' || game.state === 'paused') restartLevel();
  } else if (code === 'KeyP') {
    if (game.state === 'playing') game.state = 'paused';
    else if (game.state === 'paused') game.state = 'playing';
  } else if (code === 'KeyM') {
    fx.enabled = !fx.enabled;
  }
};

canvas.addEventListener('mousedown', () => {
  fx.ensure();
  fx.startAmbient();
  if (game.state === 'title') startGame();
});

// A staged screenshot: ?shot=cover, patrol, spotted or exit.
const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) {
  game.level = LEVELS[0];
  game.player = createPlayer(LEVELS[0].playerStart, 3, 2);
  game.guards = createGuards(LEVELS[0].guards);
  game.cameras = createCameras(LEVELS[0].cameras);
  game.state = 'playing';
  applyShot(game, shot);
  // Staged shots render once, frozen, so the capture is identical every run.
  render();
} else {
  game.player = createPlayer(LEVELS[0].playerStart, LEVELS[0].coins, LEVELS[0].smokes);
  game.guards = createGuards(LEVELS[0].guards);
  game.cameras = createCameras(LEVELS[0].cameras);
  let last = performance.now();
  function frame(now) {
    const dt = clamp((now - last) / 1000, 0, 0.05);
    last = now;
    update(dt);
    render();
    input.endFrame();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
