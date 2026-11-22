// Staged screenshot states for Star Sapphire Heist.
// ?shot=cover, patrol, spotted or exit sets the game to an exact, readable scene
// so the screenshots show the heist at its best. Nothing here is shown to a player.

import { createPlayer } from './player.js';
import { createGuards } from './guards.js';
import { createCameras } from './cameras.js';

function baseSetup(game, levelIndex, px, py, alarm, alarmState) {
  game.levelIndex = levelIndex;
  game.level = game.levels[levelIndex];
  game.player = createPlayer({ x: px, y: py }, 3, 2);
  game.guards = createGuards(game.level.guards);
  game.cameras = createCameras(game.level.cameras);
  game.alarm = alarm;
  game.alarmState = alarmState;
  game.state = 'playing';
  game.score = 0;
  game.elapsed = 0;
  game.ghost = true;
  game.alarmPeak = alarm;
}

export function applyShot(game, shot) {
  if (shot === 'cover') {
    // The full heist in one frame: thief mid-room, cones sweeping, camera live,
    // sapphire glowing, alarm already warm.
    baseSetup(game, 0, 560, 640, 34, 'Warm: a guard is getting curious');
    game.player.lootCount = 1;
    game.player.lootValue = 150;
    game.level.loot[0].taken = true;
    game.score = 150;
    game.elapsed = 41;
    const g0 = game.guards[0];
    g0.x = 700;
    g0.y = 430;
    g0.facing = Math.PI * 0.75;
    g0.suspicion = 0.62;
    const g1 = game.guards[1];
    g1.x = 900;
    g1.y = 660;
    g1.facing = Math.PI;
    game.cameras[0].angle = Math.PI / 2 + 0.5;
    game.player.sneaking = true;
  } else if (shot === 'patrol') {
    // Level two: the thief sneaks behind a display case while patrols cross.
    baseSetup(game, 1, 330, 470, 12, 'Quiet: nobody suspects a thing');
    game.player.sneaking = true;
    game.player.lootCount = 2;
    game.player.lootValue = 400;
    game.level.loot[0].taken = true;
    game.level.loot[2].taken = true;
    game.score = 400;
    game.elapsed = 63;
    const g0 = game.guards[0];
    g0.x = 500;
    g0.y = 180;
    g0.facing = 0;
    const g1 = game.guards[1];
    g1.x = 700;
    g1.y = 640;
    g1.facing = Math.PI;
    const g2 = game.guards[2];
    g2.x = 640;
    g2.y = 560;
    g2.facing = -Math.PI / 2;
    g2.suspicion = 0.3;
    game.cameras[0].angle = Math.PI / 2 - 0.4;
    game.cameras[1].angle = Math.PI / 2 + 0.4;
  } else if (shot === 'spotted') {
    // The fair caught moment, just before it lands: alarm high, guard chasing.
    baseSetup(game, 0, 700, 470, 78, 'SPOTTED: run for the shadows');
    game.player.hasSapphire = true;
    game.player.lootCount = 2;
    game.player.lootValue = 650;
    game.level.loot[0].taken = true;
    game.score = 650;
    game.elapsed = 52;
    game.ghost = false;
    const g0 = game.guards[0];
    g0.x = 640;
    g0.y = 400;
    g0.facing = Math.PI / 4;
    g0.state = 'chase';
    g0.suspicion = 1;
    g0.seenFlash = 0.5;
    const g1 = game.guards[1];
    g1.x = 880;
    g1.y = 660;
    g1.facing = -Math.PI / 2;
    g1.suspicion = 0.7;
    game.cameras[0].angle = Math.PI / 2 + 0.3;
    game.cameras[0].seeing = true;
    game.cameras[0].alert = 1;
    game.player.smokePuffs.push({ x: 760, y: 520, t: 3.5 });
  } else if (shot === 'exit') {
    // The getaway: the vault cleared, sapphire in hand, exit open, ghost rating.
    baseSetup(game, 2, 1180, 700, 8, 'Quiet: nobody suspects a thing');
    game.player.hasSapphire = true;
    game.player.lootCount = 5;
    game.player.lootValue = 1250;
    for (const item of game.level.loot) item.taken = true;
    game.score = 2450;
    game.elapsed = 198;
    game.state = 'victory';
    const g0 = game.guards[0];
    g0.x = 500;
    g0.y = 170;
    g0.facing = 0;
    const g1 = game.guards[1];
    g1.x = 700;
    g1.y = 660;
    g1.facing = Math.PI;
    const g2 = game.guards[2];
    g2.x = 400;
    g2.y = 480;
    g2.facing = Math.PI / 2;
    const g3 = game.guards[3];
    g3.x = 900;
    g3.y = 500;
    g3.facing = -Math.PI / 2;
  }
  // Staged shots freeze the world so the render is identical every run.
  game.frozen = true;
}
