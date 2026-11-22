// All of Stormledger's drawing: the stormy harbour backdrop, the ledger
// table, readable card faces and backs, the suit wheel, Life/Ink panels,
// the message log, and the title / win / loss screens. Pure canvas, no assets.

import { PLAYER_NAME, RIVAL_NAME, SUITS, SUIT_WHEEL, VIEW } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_TABLE = 'table';
export const SCREEN_OVER = 'over';

const INK_DARK = '#101823';
const PAPER = '#f4ead2';
const BRASS = '#c9a227';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function text(ctx, value, x, y, size, colour, align = 'center', weight = 'bold') {
  ctx.fillStyle = colour;
  ctx.font = `${weight} ${size}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function wrapLines(ctx, value, maxWidth) {
  const words = value.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width > maxWidth && line) { lines.push(line); line = word; }
    else line = trial;
  }
  if (line) lines.push(line);
  return lines;
}

export function drawBackdrop(ctx, tick) {
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  sky.addColorStop(0, '#16283e'); sky.addColorStop(0.55, '#1d3a52'); sky.addColorStop(1, '#0d1a29');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // distant harbour lights and masts
  ctx.fillStyle = 'rgba(244,234,210,0.5)';
  for (let i = 0; i < 26; i += 1) {
    const x = (i * 173) % VIEW.width; const y = 596 + ((i * 37) % 40);
    ctx.fillRect(x, y, 3, 3);
  }
  ctx.strokeStyle = 'rgba(180,205,230,0.35)'; ctx.lineWidth = 2;
  for (const mx of [90, 1190]) {
    ctx.beginPath(); ctx.moveTo(mx, 720); ctx.lineTo(mx, 560); ctx.lineTo(mx + 44, 720); ctx.stroke();
  }
  // rain
  ctx.strokeStyle = 'rgba(190,215,240,0.18)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 60; i += 1) {
    const x = (i * 89 + tick * 40) % (VIEW.width + 40) - 20;
    const y = (i * 61 + tick * 130) % VIEW.height;
    ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 14);
  }
  ctx.stroke();
  // the ledger table
  ctx.fillStyle = '#274b36';
  roundRect(ctx, 26, 96, 1228, 512, 26); ctx.fill();
  ctx.strokeStyle = BRASS; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  roundRect(ctx, 48, 118, 1184, 468, 20); ctx.fill();
}

export function drawCardFace(ctx, card, x, y, w, h, opts = {}) {
  const suit = SUITS[card.suit];
  ctx.save();
  if (opts.dim) ctx.globalAlpha = 0.45;
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
  ctx.fillStyle = PAPER; roundRect(ctx, x, y, w, h, 12); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = suit.colour; ctx.lineWidth = 4; roundRect(ctx, x + 3, y + 3, w - 6, h - 6, 10); ctx.stroke();
  // header band in the suit colour
  ctx.fillStyle = suit.colour; roundRect(ctx, x + 7, y + 7, w - 14, h * 0.24, 8); ctx.fill();
  text(ctx, suit.glyph, x + w / 2, y + h * 0.115, h * 0.11, '#ffffff');
  // Narrow cards shrink the suit name and shift it left, clear of the cost badge.
  const suitSize = w < 120 ? 10 : 12;
  const suitX = x + w / 2 - (w < 120 ? 9 : 0);
  text(ctx, suit.name.toUpperCase(), suitX, y + h * 0.205, suitSize, '#ffffff');
  // name
  ctx.font = `bold ${Math.max(13, w * 0.105)}px Georgia, serif`;
  const nameLines = wrapLines(ctx, card.name, w - 16).slice(0, 2);
  nameLines.forEach((line, i) => text(ctx, line, x + w / 2, y + h * (0.33 + i * 0.085), Math.max(13, w * 0.105), INK_DARK));
  // big power
  text(ctx, String(card.power), x + w / 2, y + h * 0.56, h * 0.21, suit.colour);
  text(ctx, 'POWER', x + w / 2, y + h * 0.665, 11, '#6b5a33');
  // effect line
  ctx.font = `italic ${Math.max(10, w * 0.072)}px Georgia, serif`;
  const fx = wrapLines(ctx, card.line, w - 18).slice(0, 3);
  fx.forEach((line, i) => text(ctx, line, x + w / 2, y + h * (0.74 + i * 0.07), Math.max(10, w * 0.072), '#3d4a57', 'center', 'normal'));
  // cost badge in the top-right corner, clear of the suit name
  ctx.fillStyle = INK_DARK; ctx.beginPath(); ctx.arc(x + w - 20, y + 20, 15, 0, Math.PI * 2); ctx.fill();
  text(ctx, String(card.cost), x + w - 20, y + 21, 16, '#ffd968');
  text(ctx, 'INK', x + 20, y + h - 12, 9, '#6b5a33');
  if (opts.selected) { ctx.strokeStyle = '#ffd968'; ctx.lineWidth = 4; roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 14); ctx.stroke(); }
  ctx.restore();
}

export function drawCardBack(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#31435c'; roundRect(ctx, x, y, w, h, 10); ctx.fill();
  ctx.strokeStyle = BRASS; ctx.lineWidth = 3; roundRect(ctx, x + 3, y + 3, w - 6, h - 6, 8); ctx.stroke();
  text(ctx, '⚓', x + w / 2, y + h / 2 - 6, h * 0.3, '#e8d9a8');
  text(ctx, 'STORMLEDGER', x + w / 2, y + h - 20, 9, '#e8d9a8');
  ctx.restore();
}

function lifePanel(ctx, x, y, label, life, ink, deckCount, colour) {
  ctx.fillStyle = 'rgba(10,18,28,0.78)'; roundRect(ctx, x, y, 300, 64, 12); ctx.fill();
  ctx.strokeStyle = colour; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, label, x + 14, y + 18, 14, '#e8d9a8', 'left');
  text(ctx, `LIFE ${life}`, x + 14, y + 45, 24, life <= 6 ? '#ff7b6b' : '#ffffff', 'left');
  text(ctx, `🖋 Ink ${ink}`, x + 168, y + 45, 18, '#ffd968', 'left');
  text(ctx, `Deck ${deckCount}`, x + 250, y + 18, 12, '#bcd9f7', 'left');
}

function drawSuitWheel(ctx, cx, cy) {
  ctx.save();
  ctx.fillStyle = 'rgba(10,18,28,0.78)'; ctx.beginPath(); ctx.arc(cx, cy, 74, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = BRASS; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, 'SUIT WHEEL', cx, cy - 58, 11, '#e8d9a8');
  text(ctx, 'winner +2', cx, cy + 60, 10, '#bcd9f7');
  SUIT_WHEEL.forEach((key, i) => {
    const angle = -Math.PI / 2 + i * (Math.PI / 2);
    const x = cx + Math.cos(angle) * 40; const y = cy + Math.sin(angle) * 40;
    const suit = SUITS[key];
    ctx.fillStyle = suit.colour; ctx.beginPath(); ctx.arc(x, y, 19, 0, Math.PI * 2); ctx.fill();
    text(ctx, suit.glyph, x, y + 1, 17, '#ffffff');
    // arrow to the suit this one beats (next around the wheel)
    const next = -Math.PI / 2 + (i + 1) * (Math.PI / 2);
    const mx = cx + Math.cos((angle + next) / 2) * 40; const my = cy + Math.sin((angle + next) / 2) * 40;
    text(ctx, '›', mx, my, 18, '#ffd968');
  });
  ctx.restore();
}

function drawLog(ctx, state) {
  ctx.fillStyle = 'rgba(10,18,28,0.78)'; roundRect(ctx, 880, 486, 372, 112, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(201,162,39,0.6)'; ctx.lineWidth = 1; ctx.stroke();
  text(ctx, 'LEDGER LOG', 894, 502, 11, '#e8d9a8', 'left');
  state.log.slice(-4).forEach((line, i) => {
    ctx.font = '12px Georgia, serif';
    const lines = wrapLines(ctx, line, 344).slice(0, 1);
    text(ctx, lines[0] ?? '', 894, 524 + i * 19, 12, '#d7e4f2', 'left', 'normal');
  });
}

export function drawTable(ctx, state, hoverIndex) {
  drawBackdrop(ctx, 0);
  // header strip
  text(ctx, '⚓ STORMLEDGER — Duel of the Harbour Guilds', 640, 34, 26, '#f4ead2');
  text(ctx, `ROUND ${state.round}`, 640, 66, 15, '#ffd968');
  text(ctx, 'Tide › Gale › Lantern › Anchor › Tide', 1080, 66, 12, '#bcd9f7');

  lifePanel(ctx, 40, 108, RIVAL_NAME, state.rival.life, state.rival.ink, state.rival.deck.length, '#5a6b7d');
  // rival hand: backs
  state.rival.hand.forEach((card, i) => drawCardBack(ctx, 420 + i * 76, 106, 66, 92));
  text(ctx, 'Maren\u2019s hand (face down)', 600, 214, 12, '#bcd9f7');

  drawSuitWheel(ctx, 1152, 300);

  // clash zone
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; roundRect(ctx, 330, 226, 620, 236, 18); ctx.fill();
  ctx.strokeStyle = BRASS; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, 'THE CLASH', 640, 246, 14, '#e8d9a8');
  if (state.rivalCard) drawCardFace(ctx, state.rivalCard, 386, 258, 150, 196);
  else { ctx.strokeStyle = '#7d94a8'; ctx.setLineDash([6, 6]); roundRect(ctx, 386, 258, 150, 196, 12); ctx.stroke(); ctx.setLineDash([]); text(ctx, 'Maren plays\nface down…', 461, 356, 14, '#bcd9f7'); }
  text(ctx, 'VS', 640, 356, 30, '#ffd968');
  if (state.playerCard) drawCardFace(ctx, state.playerCard, 744, 258, 150, 196);
  else { ctx.strokeStyle = '#7d94a8'; ctx.setLineDash([6, 6]); roundRect(ctx, 744, 258, 150, 196, 12); ctx.stroke(); ctx.setLineDash([]); text(ctx, 'Your card\nlands here', 819, 356, 14, '#bcd9f7'); }
  // result banner
  ctx.fillStyle = 'rgba(16,24,35,0.88)'; roundRect(ctx, 350, 420, 580, 34, 10); ctx.fill();
  text(ctx, state.banner, 640, 438, 15, '#ffd968');

  lifePanel(ctx, 40, 486, PLAYER_NAME, state.player.life, state.player.ink, state.player.deck.length, '#d98a1f');
  text(ctx, `Score — your Life ${state.player.life} · Maren ${state.rival.life}`, 40, 566, 13, '#e8d9a8', 'left');
  text(ctx, 'Click a card or press 1–5.', 40, 590, 12, '#bcd9f7', 'left');

  // player hand, face up
  state.player.hand.forEach((card, i) => {
    const x = 348 + i * 104;
    const y = hoverIndex === i ? 470 : 486;
    drawCardFace(ctx, card, x, y, 100, 132, { dim: card.cost > state.player.ink, selected: hoverIndex === i });
    text(ctx, String(i + 1), x + 50, y + 146, 12, '#bcd9f7');
  });
  drawLog(ctx, state);
}

export function drawTitle(ctx, state) {
  drawBackdrop(ctx, 0);
  text(ctx, '⚓', 640, 128, 54, '#e8d9a8');
  text(ctx, 'STORMLEDGER', 640, 196, 64, '#f4ead2');
  text(ctx, 'Duel of the Harbour Guilds', 640, 240, 26, '#ffd968');
  text(ctx, 'A 1-v-1 card duel on a stormy harbour ledger-table.', 640, 278, 17, '#d7e4f2', 'center', 'normal');
  // fanned sample cards
  const fan = state.player.hand.slice(0, 3);
  fan.forEach((card, i) => drawCardFace(ctx, card, 452 + i * 128, 306, 112, 148));
  // how-to panel
  ctx.fillStyle = 'rgba(10,18,28,0.82)'; roundRect(ctx, 330, 472, 620, 118, 14); ctx.fill();
  ctx.strokeStyle = BRASS; ctx.lineWidth = 2; ctx.stroke();
  const how = [
    'HOW TO PLAY — Each round pick a card (click or 1–5). Maren answers face-down, then both reveal.',
    'Higher Power wins the clash and deals the difference as damage. First to 0 Life loses.',
    'Suits ride the wheel: Tide beats Gale, Gale beats Lantern, Lantern beats Anchor, Anchor beats Tide (+2).',
    'Ink pays for cards: +1 a round, and banked Ink (3+) earns +1 more. Shield, Splash, Draw, Mend, Chain!',
  ];
  how.forEach((line, i) => text(ctx, line, 640, 496 + i * 23, 13.5, '#d7e4f2', 'center', 'normal'));
  // play button
  ctx.fillStyle = '#c9a227'; roundRect(ctx, 540, 606, 200, 52, 14); ctx.fill();
  text(ctx, '▶  PLAY', 640, 633, 24, INK_DARK);
  text(ctx, `${PLAYER_NAME} vs ${RIVAL_NAME} · Life 20 each`, 640, 686, 13, '#bcd9f7', 'center', 'normal');
}

export function drawOver(ctx, state) {
  drawBackdrop(ctx, 0);
  const won = state.result === 'win';
  text(ctx, won ? '🏆' : '🌧', 640, 150, 60, '#e8d9a8');
  text(ctx, won ? 'YOU WIN THE HARBOUR!' : 'MAREN KEEPS THE HARBOUR', 640, 224, 46, won ? '#ffd968' : '#bcd9f7');
  text(ctx, won ? 'The Guild of Lanterns rules the storm ledger.' : 'The Guild of Anchors holds the ledger — this time.', 640, 268, 18, '#d7e4f2', 'center', 'normal');
  ctx.fillStyle = 'rgba(10,18,28,0.85)'; roundRect(ctx, 390, 306, 500, 170, 16); ctx.fill();
  ctx.strokeStyle = BRASS; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, `Final Life — You: ${state.player.life} · Maren: ${state.rival.life}`, 640, 348, 22, '#ffffff');
  text(ctx, `Rounds played: ${state.round}`, 640, 388, 18, '#e8d9a8');
  text(ctx, `Cards left — your deck ${state.player.deck.length}, Maren's deck ${state.rival.deck.length}`, 640, 424, 15, '#bcd9f7', 'center', 'normal');
  if (state.playerCard) drawCardFace(ctx, state.playerCard, 120, 330, 120, 158);
  if (state.rivalCard) drawCardFace(ctx, state.rivalCard, 1040, 330, 120, 158);
  ctx.fillStyle = '#c9a227'; roundRect(ctx, 515, 516, 250, 56, 14); ctx.fill();
  text(ctx, '↻  REMATCH', 640, 545, 24, INK_DARK);
  text(ctx, 'Press Enter for a rematch', 640, 606, 14, '#bcd9f7', 'center', 'normal');
}

export function drawGame(ctx, state, hoverIndex) {
  if (state.screen === 'title') drawTitle(ctx, state);
  else if (state.screen === 'over') drawOver(ctx, state);
  else drawTable(ctx, state, hoverIndex);
}
