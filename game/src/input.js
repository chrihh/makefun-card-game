// Mouse and keyboard for Stormledger: clicking your cards, the PLAY and
// REMATCH buttons, number keys 1–5 to play a card, Enter to start again.
// Hit boxes mirror the layout render.js draws.

export const HAND_LAYOUT = { firstX: 348, stepX: 104, y: 470, width: 100, height: 148 };
export const PLAY_BUTTON = { x: 540, y: 606, width: 200, height: 52 };
export const REMATCH_BUTTON = { x: 515, y: 516, width: 250, height: 56 };

export function handIndexAt(x, y, handSize) {
  if (y < HAND_LAYOUT.y || y > HAND_LAYOUT.y + HAND_LAYOUT.height) return -1;
  const rel = x - HAND_LAYOUT.firstX;
  if (rel < 0) return -1;
  const index = Math.floor(rel / HAND_LAYOUT.stepX);
  if (index >= handSize) return -1;
  if (rel - index * HAND_LAYOUT.stepX > HAND_LAYOUT.width) return -1;
  return index;
}

export function insideBox(x, y, box) {
  return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
}

/** Map a keyboard event to an action: {type:'play',index} | {type:'confirm'} | null. */
export function keyAction(key) {
  if (key >= '1' && key <= '5') return { type: 'play', index: Number(key) - 1 };
  if (key === 'Enter' || key === ' ') return { type: 'confirm' };
  return null;
}
