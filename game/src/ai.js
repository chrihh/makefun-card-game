// Maren Voss's card sense. She cannot see your card, so she scores her own
// affordable cards by what they are likely to do: raw Power, a suit that
// beats the suit you played most recently, a shield when her Life is low,
// splash when your Life is low enough to finish, and saving Ink on a card
// she cannot beat anything with. A little seeded noise keeps her human.

import { SUITS } from './config.js';
import { suitBeats } from './rules.js';

export function scoreCardForRival(card, view) {
  let score = card.power * 2 - card.cost;
  if (view.lastPlayerSuit && suitBeats(card.suit, view.lastPlayerSuit)) score += 5;
  if (view.rivalLife <= 6 && card.effect === 'shield') score += 4;
  if (view.playerLife <= card.amount + 2 && card.effect === 'splash') score += 6;
  if (view.playerLife <= card.power && card.power >= 6) score += 5; // smells lethal
  if (card.effect === 'draw') score += 2;
  if (card.effect === 'mend' && view.rivalLife <= 10) score += 3;
  return score;
}

/** Index into rivalHand of the card Maren plays, or -1 when she cannot afford any. */
export function chooseRivalCard(state) {
  const hand = state.rival.hand;
  const view = {
    lastPlayerSuit: state.lastPlayerSuit,
    rivalLife: state.rival.life,
    playerLife: state.player.life,
  };
  let best = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < hand.length; i += 1) {
    const card = hand[i];
    if (card.cost > state.rival.ink) continue;
    const score = scoreCardForRival(card, view) + state.rng() * 1.5;
    if (score > bestScore) { bestScore = score; best = i; }
  }
  return best;
}

export { SUITS };
