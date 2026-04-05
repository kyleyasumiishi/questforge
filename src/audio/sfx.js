// Programmatic 8-bit sound effects using Web Audio API
// No external files — all sounds generated from oscillators

let ctx = null
let muted = localStorage.getItem('questforge-muted') === '1'

function getCtx() {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function isMuted() {
  return muted
}

export function toggleMute() {
  muted = !muted
  localStorage.setItem('questforge-muted', muted ? '1' : '0')
  return muted
}

// Helper: play a note (square wave by default for 8-bit feel)
function note(ac, freq, start, duration, volume = 0.12, type = 'square') {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(start)
  osc.stop(start + duration)
}

// ── Sound definitions ──────────────────────────────────────────────

function playSuccess() {
  const ac = getCtx()
  const t = ac.currentTime
  note(ac, 523, t, 0.08, 0.1)        // C5
  note(ac, 659, t + 0.08, 0.08, 0.1) // E5
  note(ac, 784, t + 0.16, 0.15, 0.1) // G5
}

function playError() {
  const ac = getCtx()
  const t = ac.currentTime
  note(ac, 200, t, 0.12, 0.08, 'sawtooth')
  note(ac, 160, t + 0.1, 0.15, 0.08, 'sawtooth')
}

function playLevelUp() {
  const ac = getCtx()
  const t = ac.currentTime
  note(ac, 523, t, 0.1, 0.1)          // C5
  note(ac, 659, t + 0.1, 0.1, 0.1)    // E5
  note(ac, 784, t + 0.2, 0.1, 0.1)    // G5
  note(ac, 1047, t + 0.3, 0.25, 0.12) // C6
}

function playLevelComplete() {
  const ac = getCtx()
  const t = ac.currentTime
  note(ac, 392, t, 0.12, 0.1)          // G4
  note(ac, 523, t + 0.12, 0.12, 0.1)   // C5
  note(ac, 659, t + 0.24, 0.12, 0.1)   // E5
  note(ac, 784, t + 0.36, 0.12, 0.1)   // G5
  note(ac, 1047, t + 0.48, 0.35, 0.12) // C6
}

function playQuestComplete() {
  const ac = getCtx()
  const t = ac.currentTime
  // Grand ascending arpeggio
  const notes = [523, 659, 784, 1047, 784, 1047, 1319, 1568]
  notes.forEach((freq, i) => {
    note(ac, freq, t + i * 0.1, 0.15, 0.1)
  })
  // Final sustained chord
  note(ac, 1047, t + 0.8, 0.5, 0.08) // C6
  note(ac, 1319, t + 0.8, 0.5, 0.06) // E6
  note(ac, 1568, t + 0.8, 0.5, 0.06) // G6
}

function playHint() {
  const ac = getCtx()
  const t = ac.currentTime
  note(ac, 880, t, 0.06, 0.06, 'triangle')       // A5
  note(ac, 1109, t + 0.07, 0.1, 0.06, 'triangle') // C#6
}

function playCodex() {
  const ac = getCtx()
  const t = ac.currentTime
  note(ac, 659, t, 0.08, 0.07, 'triangle')       // E5
  note(ac, 880, t + 0.08, 0.08, 0.07, 'triangle') // A5
  note(ac, 1047, t + 0.16, 0.12, 0.07, 'triangle') // C6
}

// ── Public API ─────────────────────────────────────────────────────

const SOUNDS = {
  success: playSuccess,
  error: playError,
  levelup: playLevelUp,
  'level-complete': playLevelComplete,
  'quest-complete': playQuestComplete,
  hint: playHint,
  codex: playCodex,
}

export function playSfx(name) {
  if (muted) return
  const fn = SOUNDS[name]
  if (fn) {
    try { fn() } catch { /* ignore audio errors */ }
  }
}
