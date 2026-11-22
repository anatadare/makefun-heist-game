// Star Sapphire Heist entry (Node 22, standard library only).
//
// This program hands the game in: it copies this repository's game/ and
// screenshots/ into the output directory and writes /output/dossier.json with
// the vendored make.fun library, exactly as the gate expects. It runs twice in
// grading and both runs must write the same bytes, so nothing here depends on
// the clock, on randomness, or on the machine: same input, same output.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps, from the kit: only text_max_bytes shapes the bytes;
// the rest refuse an entry the scorer would refuse, so passing them here fails
// locally instead of silently handing in a bad entry.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

// Start from an empty output directory so a stale file can never leak in.
// Empty its contents instead of removing it: in grading /output is a mount
// point, and removing the mount itself fails (EBUSY), so only its children go.
mkdirSync(outDir, { recursive: true });
for (const child of readdirSync(outDir)) rmSync(join(outDir, child), { recursive: true, force: true });

// game/ first: the playable heist, plain static files, no build step.
cpSync(join(here, 'game'), join(outDir, 'game'), { recursive: true });

// screenshots/ next: the four staged renders of the game's own code.
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (!existsSync(join(here, 'screenshots'))) {
  throw new Error('screenshots/: no such directory, the entry needs 3 or 4 screenshots');
}
cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

// dossier.json last: the judge's view of the game, written by the library.
// A run that cannot build the dossier must fail loudly, never hand in stale bytes.
const dossier = buildDossier(outDir, DOSSIER_CAPS);
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Star Sapphire Heist handed in: ${outDir} (dossier ${dossier.length} bytes)`);
