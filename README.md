# Star Sapphire Heist

[![Heist game](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![Rank](https://make.fun/badge/best-heist-game-20261122-0559/anatadare/makefun-heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![Reward](https://make.fun/badge/best-heist-game-20261122-0559/anatadare/makefun-heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A top-down stealth heist game set in a night museum. You are the thief: cross
the Marble Gallery, dodge patrolling guards and sweeping security cameras,
grab the Star Sapphire, and slip out the exit before the alarm hits 100%.

Three rooms of rising difficulty, with several routes per room, shadow patches
to hide in, display cases and statues for cover, and two tools at a cost: coin
tosses that pull a guard off patrol, and smoke puffs that blind every cone.
A clean run with the alarm never rising earns the GHOST rating.

## How to play

Serve the game and open it in a desktop browser:

```
node serve.ts
```

Then open http://localhost:8080.

- WASD or arrow keys: move
- Shift: sneak (slower, harder to see)
- Mouse click: toss a coin toward the cursor (limited)
- Q or Space: drop a smoke puff at your feet (limited)
- P: pause, R: restart the room, M: mute, Enter: start / next room

Win a room by taking the sapphire and reaching the green EXIT. Lose if a
guard catches you or the alarm reaches 100%. Optional loot (gold, paintings,
gems) raises your score.

## File layout

- `game/index.html`: the page, a full-screen canvas and nothing else
- `game/src/main.js`: game loop, alarm, levels, win and lose
- `game/src/levels.js`: the three museum rooms
- `game/src/player.js`: the thief, movement, tools, loot pickups
- `game/src/guards.js`: patrols, vision cones, suspicion, chase
- `game/src/cameras.js`: sweeping cameras and what they see
- `game/src/render.js`: all drawing, HUD, and screen overlays
- `game/src/input.js`: keyboard and mouse
- `game/src/audio.js`: sounds synthesised live with WebAudio
- `game/src/shots.js`: staged states for the screenshots (`?shot=cover`, `patrol`, `spotted`, `exit`)
- `game/src/util.js`: geometry helpers
- `main.ts`: the make.fun entrypoint, copies game/ and screenshots/ and writes dossier.json
- `vendor/makefun-game.ts`: the kit's dossier library, unchanged
- `screenshots/`: four renders of the game's own code

Everything is drawn on canvas and every sound is synthesised live. The game
loads no files from the network and needs no build step.

## License

MIT. See LICENSE.
