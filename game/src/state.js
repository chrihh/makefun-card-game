// Duel state for Stormledger: two guild sides, the round loop, and the one
// function that plays a whole clash once the player commits a card.

import { DUEL } from './config.js';
import { buildDeck } from './deck.js';
import { makeRng } from './random.js';
import { resolveClash } from './rules.js';
import { chooseRivalCard } from './ai.js';

function newSide(deck) {
  return { life: DUEL.startLife, ink: DUEL.startInk, deck, hand: [], streak: false };
}

function drawUpTo(side, count) {
  while (side.hand.length < count && side.deck.length > 0) side.hand.push(side.deck.pop());
}

function drawCards(side, count) {
  for (let i = 0; i < count; i += 1) if (side.deck.length > 0) side.hand.push(side.deck.pop());
}

export function createDuel(seed) {
  const rng = makeRng(seed ?? 1);
  const state = {
    rng,
    screen: 'title', // title | table | over
    round: 1,
    player: newSide(buildDeck(rng)),
    rival: newSide(buildDeck(rng)),
    playerCard: null, // the card you committed this clash, face up at centre
    rivalCard: null, // Maren's card, revealed beside yours
    banner: 'Pick a card to open the duel.',
    result: '', // 'win' | 'loss' once screen is 'over'
    lastPlayerSuit: null,
    log: ['The ledger opens. First guild to 0 Life loses the harbour.'],
  };
  drawUpTo(state.player, DUEL.handSize);
  drawUpTo(state.rival, DUEL.handSize);
  return state;
}

function logLine(state, line) {
  state.log.push(line);
  if (state.log.length > 6) state.log.shift();
}

function gainRoundInk(side) {
  const banked = side.ink >= DUEL.bankBonusAt ? 1 : 0;
  side.ink = Math.min(DUEL.inkCap, side.ink + DUEL.inkPerRound + banked);
  return banked;
}

function anyoneFinished(state) {
  return state.player.life <= 0 || state.rival.life <= 0;
}

function exhausted(state) {
  const out = (s) => s.hand.length === 0 && s.deck.length === 0;
  return out(state.player) || out(state.rival) || state.round > DUEL.maxRounds;
}

export function finishDuel(state) {
  state.screen = 'over';
  if (state.rival.life <= 0 && state.player.life > 0) state.result = 'win';
  else if (state.player.life <= 0 && state.rival.life > 0) state.result = 'loss';
  else state.result = state.player.life > state.rival.life ? 'win' : 'loss';
  state.banner = state.result === 'win' ? 'The harbour is yours.' : 'Maren keeps the harbour.';
}

/** Guarantee a side can always afford something: Ink rises to its cheapest card. */
function ensureAffordable(side) {
  if (side.hand.length === 0) return;
  const cheapest = Math.min(...side.hand.map((c) => c.cost));
  if (side.ink < cheapest) side.ink = cheapest;
}

/**
 * Play one full clash: the player commits hand[index]; Maren answers from
 * her own hand; rules.js resolves it; both sides draw back up and gain Ink.
 * Returns false (and changes nothing) for an illegal pick.
 */
export function playClash(state, index) {
  if (state.screen !== 'table') return false;
  const card = state.player.hand[index];
  if (!card || card.cost > state.player.ink) return false;

  const rivalIndex = chooseRivalCard(state);
  const rivalCard = rivalIndex >= 0 ? state.rival.hand[rivalIndex] : null;
  if (!rivalCard) { finishDuel(state); return true; }

  state.player.hand.splice(index, 1);
  state.rival.hand.splice(rivalIndex, 1);
  state.player.ink -= card.cost;
  state.rival.ink -= rivalCard.cost;
  state.playerCard = card;
  state.rivalCard = rivalCard;
  state.lastPlayerSuit = card.suit;

  const outcome = resolveClash(card, rivalCard, state.player.streak, state.rival.streak);
  // Damage and mending land together, then Life clamps once to 0..startLife.
  state.player.life = Math.max(0, Math.min(DUEL.startLife, state.player.life - outcome.damageToPlayer + outcome.playerMend));
  state.rival.life = Math.max(0, Math.min(DUEL.startLife, state.rival.life - outcome.damageToRival + outcome.rivalMend));
  state.player.streak = outcome.winner === 'player';
  state.rival.streak = outcome.winner === 'rival';

  logLine(state, `R${state.round}: ${card.name} (${outcome.playerEff}) vs ${rivalCard.name} (${outcome.rivalEff}).`);
  for (const note of outcome.notes) logLine(state, note);
  if (outcome.winner === 'player') logLine(state, `Maren takes ${outcome.damageToRival}. Her Life: ${state.rival.life}.`);
  if (outcome.winner === 'rival') logLine(state, `You take ${outcome.damageToPlayer}. Your Life: ${state.player.life}.`);
  state.banner = outcome.winner === 'wash'
    ? 'Wash — no blood in the water.'
    : outcome.winner === 'player'
      ? `Your ${card.name} wins the clash!`
      : `Maren's ${rivalCard.name} wins the clash.`;

  drawCards(state.player, outcome.playerDraws);
  drawCards(state.rival, outcome.rivalDraws);

  if (anyoneFinished(state)) { finishDuel(state); return true; }

  state.round += 1;
  drawUpTo(state.player, DUEL.handSize);
  drawUpTo(state.rival, DUEL.handSize);
  const bankedP = gainRoundInk(state.player);
  gainRoundInk(state.rival);
  if (bankedP) logLine(state, 'Banked Ink pays off: +1 bonus Ink.');
  ensureAffordable(state.player);
  ensureAffordable(state.rival);
  if (exhausted(state)) finishDuel(state);
  return true;
}

export function startDuel(state) {
  state.screen = 'table';
  state.banner = 'Pick a card — click it or press 1–5.';
}
