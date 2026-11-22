// Screenshot scenes behind ?shot=title|table|win|loss. Each stages a real
// duel state with the game's own rules — the table scene plays scripted
// clashes forward so the log, banner and Life totals are genuine mid-duel
// values — then leaves the state ready for one render.

import { cardById } from './deck.js';
import { playClash, startDuel } from './state.js';

function giveCard(state, side, id) {
  const card = { ...cardById(id), uid: `${id}#shot` };
  state[side].hand.push(card);
  return card;
}

function playScripted(state, wantedId) {
  const index = state.player.hand.findIndex((c) => c.id === wantedId && c.cost <= state.player.ink);
  if (index >= 0) playClash(state, index);
  else playClash(state, 0);
}

/** Stage the named scene on a fresh duel and return the state, ready to draw. */
export function stageShot(name, state) {
  if (name === 'table') {
    startDuel(state);
    // Two honest clashes so the log and banner carry real history.
    playScripted(state, 'gale-squall');
    playScripted(state, 'tide-ferry');
    // Set a rich, readable mid-duel frame: round 6, you ahead on Life.
    giveCard(state, 'player', 'tide-kraken');
    giveCard(state, 'rival', 'gale-veil');
    // Keep both hands at five and make the staged pair affordable.
    state.player.hand.splice(0, state.player.hand.length - 5);
    state.player.ink = 6;
    state.rival.ink = 6;
    // One more clash with a known pair at the centre of the table.
    const pIdx = state.player.hand.findIndex((c) => c.id === 'tide-kraken');
    const rIdx = state.rival.hand.findIndex((c) => c.id === 'gale-veil');
    if (pIdx >= 0 && rIdx >= 0) {
      // Maren's AI may not pick our staged card; force the reveal pair by
      // temporarily leaving her only that affordable choice, then rebuild
      // her hand to five: the kept cards plus fresh draws off her deck.
      const kept = state.rival.hand.filter((c, i) => i !== rIdx);
      const staged = state.rival.hand[rIdx];
      state.rival.hand = [staged];
      playClash(state, pIdx);
      state.rival.hand = kept.slice();
      while (state.rival.hand.length < 5 && state.rival.deck.length > 0) state.rival.hand.push(state.rival.deck.pop());
    }
    state.round = 6;
    state.player.life = 14;
    state.rival.life = 9;
    state.player.ink = 4;
    state.rival.ink = 3;
    state.banner = 'Your Ledger Kraken wins the clash — Tide beats Gale, +2!';
    state.log = [
      'R4: Harbour Swell (4) vs Cut Rigging (3). Maren takes 1.',
      'R5: Night Ferry (3) vs Iron Keel (5). You take 2.',
      'Chain watch: win again with a Chain card to bite deeper.',
      'R6: Ledger Kraken (10) vs Rain Veil (6). Maren takes 4.',
    ];
    state.screen = 'table';
    return state;
  }
  if (name === 'win' || name === 'loss') {
    startDuel(state);
    playScripted(state, 'anchor-verdict');
    // The last clash of the duel, shown beside the result panel.
    state.playerCard = { ...cardById('tide-kraken'), uid: 'final#p' };
    state.rivalCard = { ...cardById('anchor-chain'), uid: 'final#r' };
    state.round = 11;
    if (name === 'win') { state.player.life = 12; state.rival.life = 0; }
    else { state.player.life = 0; state.rival.life = 7; }
    state.screen = 'over';
    state.result = name;
    return state;
  }
  state.screen = 'title';
  return state;
}
