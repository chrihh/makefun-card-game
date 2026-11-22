// Stormledger boot: read ?seed= and ?shot=, build the duel, wire input and
// sound, and keep the canvas painted. All game logic lives in state.js and
// rules.js; this file only connects the page to it.

import { VIEW } from './config.js';
import { createDuel, playClash, startDuel } from './state.js';
import { drawGame } from './render.js';
import { handIndexAt, insideBox, keyAction, PLAY_BUTTON, REMATCH_BUTTON } from './input.js';
import { stageShot } from './shots.js';
import { soundDefeat, soundLoseClash, soundPlay, soundVictory, soundWinClash, unlockAudio } from './audio.js';

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') ?? 7) || 7;
const shot = params.get('shot');

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

let state = createDuel(seed);
let hoverIndex = -1;
if (shot) stageShot(shot, state);

const status = document.getElementById('status');
function announce() {
  if (status) status.textContent = state.screen === 'over'
    ? (state.result === 'win' ? 'You win the harbour.' : 'Maren keeps the harbour.')
    : `Round ${state.round}. Your Life ${state.player.life}, Maren ${state.rival.life}. ${state.banner}`;
}

function toGameCoords(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (VIEW.width / rect.width),
    y: (event.clientY - rect.top) * (VIEW.height / rect.height),
  };
}

function rematch() {
  state = createDuel(seed + state.round + 1);
  startDuel(state);
  announce();
}

function commitCard(index) {
  const before = state.rival.life;
  if (!playClash(state, index)) return;
  soundPlay();
  if (state.screen === 'over') {
    if (state.result === 'win') soundVictory(); else soundDefeat();
  } else if (state.rival.life < before) soundWinClash(); else soundLoseClash();
  announce();
}

canvas.addEventListener('pointermove', (event) => {
  const { x, y } = toGameCoords(event);
  hoverIndex = state.screen === 'table' ? handIndexAt(x, y, state.player.hand.length) : -1;
});
canvas.addEventListener('pointerdown', (event) => {
  unlockAudio();
  const { x, y } = toGameCoords(event);
  if (state.screen === 'title' && insideBox(x, y, PLAY_BUTTON)) { startDuel(state); announce(); return; }
  if (state.screen === 'over' && insideBox(x, y, REMATCH_BUTTON)) { rematch(); return; }
  if (state.screen === 'table') {
    const index = handIndexAt(x, y, state.player.hand.length);
    if (index >= 0) commitCard(index);
  }
});
window.addEventListener('keydown', (event) => {
  unlockAudio();
  const action = keyAction(event.key);
  if (!action) return;
  if (action.type === 'confirm') {
    if (state.screen === 'title') { startDuel(state); announce(); }
    else if (state.screen === 'over') rematch();
    return;
  }
  if (state.screen === 'table') commitCard(action.index);
});

function frame() {
  drawGame(ctx, state, hoverIndex);
  requestAnimationFrame(frame);
}
announce();
requestAnimationFrame(frame);

// For headless screenshot and test drivers: the live duel, read-only intent.
window.__stormledger = { get state() { return state; } };
