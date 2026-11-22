// Stormledger: Duel of the Harbour Guilds — the hand-in program (Node 22,
// standard library only). The game is the static bundle in game/ beside this
// file: index.html plus ES modules, no build step, no network. This program
// copies game/ and screenshots/ into the output directory and writes
// dossier.json there with buildDossier from the vendored make.fun library.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Play locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "game"), join(outputDir, "game"), { recursive: true });

const shotsSource = join(repoRoot, "screenshots");
if (existsSync(shotsSource)) {
  mkdirSync(join(outputDir, "screenshots"), { recursive: true });
  cpSync(shotsSource, join(outputDir, "screenshots"), { recursive: true });
}

// Caps mirrored from the grader so an entry it would refuse fails here
// first: at most 4 screenshots of 256 KiB each, at most 993 files and
// 48 MiB under game/, and no game path over 1000 bytes.
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, "dossier.json"), dossierText);
