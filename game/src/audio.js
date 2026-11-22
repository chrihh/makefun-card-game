// Tiny WebAudio weather: short oscillator blips for a card played, a clash
// won or lost, and the end of the duel. Silent until the first interaction
// creates the context, and every call is safe when audio is unavailable.

let context = null;

export function unlockAudio() {
  if (context) { if (context.state === 'suspended') context.resume(); return; }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) context = new AC();
  } catch { context = null; }
}

function blip(freq, seconds, delay, type) {
  if (!context) return;
  const at = context.currentTime + (delay ?? 0);
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type ?? 'sine';
  osc.frequency.setValueAtTime(freq, at);
  gain.gain.setValueAtTime(0.06, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
  osc.connect(gain).connect(context.destination);
  osc.start(at); osc.stop(at + seconds);
}

export function soundPlay() { blip(520, 0.09, 0, 'triangle'); blip(760, 0.08, 0.06, 'triangle'); }
export function soundWinClash() { blip(660, 0.1, 0); blip(880, 0.14, 0.09); }
export function soundLoseClash() { blip(300, 0.12, 0, 'sawtooth'); blip(210, 0.16, 0.1, 'sawtooth'); }
export function soundVictory() { blip(523, 0.14, 0); blip(659, 0.14, 0.13); blip(784, 0.22, 0.26); }
export function soundDefeat() { blip(392, 0.16, 0); blip(330, 0.16, 0.15); blip(262, 0.28, 0.3); }
