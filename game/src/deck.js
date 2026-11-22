// The Stormledger card catalogue: twenty harbour cards across four suits.
// Every card has a name, a suit, an Ink cost, a Power, and at most one effect:
//   shield — blocks that much of the damage you would take from this clash
//   splash — chips that much Life off the other guild no matter who wins
//   draw   — draw that many cards when this card is played
//   mend   — restore that much of your own Life when this card is played
//   chain  — if you also won the last clash, this card strikes harder and draws

import { makeRng, shuffleInPlace } from './random.js';

export const CARD_CATALOGUE = [
  { id: 'tide-wall', name: 'Tidewall Breaker', suit: 'TIDE', cost: 3, power: 6, effect: 'shield', amount: 2, line: 'Shield 2 — the harbour wall takes the hit.' },
  { id: 'tide-swell', name: 'Harbour Swell', suit: 'TIDE', cost: 2, power: 4, effect: 'splash', amount: 1, line: 'Splash 1 — spray soaks the rival ledger.' },
  { id: 'tide-undertow', name: 'Undertow Net', suit: 'TIDE', cost: 1, power: 3, effect: 'none', amount: 0, line: 'A cheap net, honestly knotted.' },
  { id: 'tide-ferry', name: 'Night Ferry', suit: 'TIDE', cost: 2, power: 3, effect: 'draw', amount: 1, line: 'Draw 1 — the ferry brings a friend.' },
  { id: 'tide-kraken', name: 'Ledger Kraken', suit: 'TIDE', cost: 4, power: 8, effect: 'chain', amount: 0, line: 'Chain — a second win bites deeper.' },
  { id: 'lamp-keeper', name: 'Lamp Keeper', suit: 'LANTERN', cost: 2, power: 4, effect: 'mend', amount: 2, line: 'Mend 2 — lamplight patches the crew.' },
  { id: 'lamp-signal', name: 'Signal Lanterns', suit: 'LANTERN', cost: 1, power: 2, effect: 'draw', amount: 1, line: 'Draw 1 — flags spell out a plan.' },
  { id: 'lamp-ember', name: 'Ember Manifest', suit: 'LANTERN', cost: 3, power: 6, effect: 'splash', amount: 1, line: 'Splash 1 — sparks on their paperwork.' },
  { id: 'lamp-dawn', name: 'Dawn Watch', suit: 'LANTERN', cost: 2, power: 5, effect: 'shield', amount: 1, line: 'Shield 1 — first light, first guard.' },
  { id: 'lamp-beacon', name: 'Storm Beacon', suit: 'LANTERN', cost: 4, power: 7, effect: 'chain', amount: 0, line: 'Chain — keep the light, keep striking.' },
  { id: 'anchor-chain', name: 'Anchor Chain', suit: 'ANCHOR', cost: 3, power: 7, effect: 'shield', amount: 1, line: 'Shield 1 — iron links, iron nerve.' },
  { id: 'anchor-ballast', name: 'Deep Ballast', suit: 'ANCHOR', cost: 1, power: 3, effect: 'shield', amount: 2, line: 'Shield 2 — low weight, hard to move.' },
  { id: 'anchor-verdict', name: 'Harbourmaster\u2019s Verdict', suit: 'ANCHOR', cost: 4, power: 8, effect: 'splash', amount: 1, line: 'Splash 1 — the verdict soaks everyone.' },
  { id: 'anchor-dredge', name: 'Dredge Crew', suit: 'ANCHOR', cost: 2, power: 4, effect: 'draw', amount: 1, line: 'Draw 1 — the dredge hauls up options.' },
  { id: 'anchor-keel', name: 'Iron Keel', suit: 'ANCHOR', cost: 2, power: 5, effect: 'none', amount: 0, line: 'Plain iron. Plain trouble.' },
  { id: 'gale-squall', name: 'Squall Line', suit: 'GALE', cost: 2, power: 5, effect: 'splash', amount: 1, line: 'Splash 1 — the squall spares no page.' },
  { id: 'gale-rigging', name: 'Cut Rigging', suit: 'GALE', cost: 1, power: 2, effect: 'splash', amount: 1, line: 'Splash 1 — something snaps aloft.' },
  { id: 'gale-courier', name: 'Gull Courier', suit: 'GALE', cost: 1, power: 3, effect: 'draw', amount: 1, line: 'Draw 1 — news arrives by gull.' },
  { id: 'gale-hurricane', name: 'Hurricane Ledger', suit: 'GALE', cost: 4, power: 9, effect: 'chain', amount: 0, line: 'Chain — the storm signs twice.' },
  { id: 'gale-veil', name: 'Rain Veil', suit: 'GALE', cost: 3, power: 6, effect: 'shield', amount: 2, line: 'Shield 2 — rain hides the whole deck.' },
];

export function cardById(id) {
  return CARD_CATALOGUE.find((c) => c.id === id) ?? null;
}

/** A fresh 24-card deck: the twenty catalogue cards plus a second copy of four cheap staples. */
export function buildDeck(rng) {
  const staples = ['tide-undertow', 'lamp-signal', 'anchor-ballast', 'gale-courier'];
  const ids = CARD_CATALOGUE.map((c) => c.id).concat(staples);
  const deck = ids.map((id, i) => ({ ...cardById(id), uid: `${id}#${i}` }));
  return shuffleInPlace(rng ?? makeRng(1), deck);
}
