// Stormledger table constants: the canvas size every other module draws to,
// the duel's starting numbers, and the Ink economy's shape.

export const VIEW = { width: 1280, height: 720 };

export const DUEL = {
  startLife: 20,
  handSize: 5,
  startInk: 2,
  inkPerRound: 1,
  bankBonusAt: 3, // holding at least this much unspent Ink earns +1 extra
  inkCap: 6,
  suitBonus: 2, // extra effective Power when your suit beats the rival suit
  chainDamage: 1, // extra damage for winning two clashes in a row
  maxRounds: 40,
};

export const SUITS = {
  TIDE: { key: 'TIDE', name: 'Tide', glyph: '🌊', colour: '#2e7fd9', soft: '#bcd9f7', beats: 'GALE' },
  LANTERN: { key: 'LANTERN', name: 'Lantern', glyph: '🏮', colour: '#d98a1f', soft: '#f7e3bc', beats: 'ANCHOR' },
  ANCHOR: { key: 'ANCHOR', name: 'Anchor', glyph: '⚓', colour: '#5a6b7d', soft: '#d3dce4', beats: 'TIDE' },
  GALE: { key: 'GALE', name: 'Gale', glyph: '🌀', colour: '#1fa8a0', soft: '#bdefea', beats: 'LANTERN' },
};

// The wheel in reading order: each suit beats the next one around the circle.
export const SUIT_WHEEL = ['TIDE', 'GALE', 'LANTERN', 'ANCHOR'];

export const PLAYER_NAME = 'You — Guild of Lanterns';
export const RIVAL_NAME = 'Maren Voss, Guild of Anchors';
