// Clash rules for Stormledger: the suit wheel, effective Power, and how one
// revealed pair of cards turns into Life damage, draws and log lines.

import { DUEL, SUITS } from './config.js';

export function suitBeats(attackerSuit, defenderSuit) {
  return SUITS[attackerSuit]?.beats === defenderSuit;
}

export function effectivePower(card, rivalCard) {
  const bonus = rivalCard && suitBeats(card.suit, rivalCard.suit) ? DUEL.suitBonus : 0;
  return { power: card.power + bonus, suitBonus: bonus };
}

/**
 * Resolve one clash. `playerStreak` / `rivalStreak` say whether that side won
 * the previous clash (for Chain). Returns plain data; state.js applies it.
 */
export function resolveClash(playerCard, rivalCard, playerStreak, rivalStreak) {
  const p = effectivePower(playerCard, rivalCard);
  const r = effectivePower(rivalCard, playerCard);
  const notes = [];

  let damageToPlayer = 0;
  let damageToRival = 0;
  let winner = 'wash';
  if (p.power > r.power) { winner = 'player'; damageToRival = p.power - r.power; }
  if (r.power > p.power) { winner = 'rival'; damageToPlayer = r.power - p.power; }
  if (winner === 'wash') notes.push('A wash — equal Power, the sea keeps both offerings.');

  // Chain: winning the previous clash too makes this win bite and draw.
  let playerDraws = 0;
  let rivalDraws = 0;
  if (winner === 'player' && playerStreak && playerCard.effect === 'chain') {
    damageToRival += DUEL.chainDamage; playerDraws += 1;
    notes.push('Chain! Two wins running — +1 damage and draw 1.');
  }
  if (winner === 'rival' && rivalStreak && rivalCard.effect === 'chain') {
    damageToPlayer += DUEL.chainDamage; rivalDraws += 1;
    notes.push('Maren chains her wins — +1 damage and she draws 1.');
  }

  // Splash lands whatever the clash decided.
  if (playerCard.effect === 'splash') { damageToRival += playerCard.amount; notes.push(`${playerCard.name} splashes ${playerCard.amount}.`); }
  if (rivalCard.effect === 'splash') { damageToPlayer += rivalCard.amount; notes.push(`${rivalCard.name} splashes ${rivalCard.amount}.`); }

  // Shields soak the loser's incoming damage (never below zero).
  if (damageToPlayer > 0 && playerCard.effect === 'shield') {
    const blocked = Math.min(damageToPlayer, playerCard.amount);
    damageToPlayer -= blocked; notes.push(`Your shield blocks ${blocked}.`);
  }
  if (damageToRival > 0 && rivalCard.effect === 'shield') {
    const blocked = Math.min(damageToRival, rivalCard.amount);
    damageToRival -= blocked; notes.push(`Maren's shield blocks ${blocked}.`);
  }

  // Played-card draws and mending.
  if (playerCard.effect === 'draw') playerDraws += playerCard.amount;
  if (rivalCard.effect === 'draw') rivalDraws += rivalCard.amount;
  const playerMend = playerCard.effect === 'mend' ? playerCard.amount : 0;
  const rivalMend = rivalCard.effect === 'mend' ? rivalCard.amount : 0;

  if (p.suitBonus) notes.push(`${SUITS[playerCard.suit].name} beats ${SUITS[rivalCard.suit].name} on the wheel: +${p.suitBonus} Power.`);
  if (r.suitBonus) notes.push(`${SUITS[rivalCard.suit].name} beats ${SUITS[playerCard.suit].name} on the wheel: +${r.suitBonus} Power.`);

  return {
    winner, damageToPlayer, damageToRival, playerDraws, rivalDraws,
    playerMend, rivalMend, playerEff: p.power, rivalEff: r.power, notes,
  };
}
