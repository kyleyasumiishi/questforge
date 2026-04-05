import { PLAYER_SPRITE, NPC_SPRITE, drawSprite } from './sprites'
import { GIT_ZONES, SQL_ZONES } from './zones'
import {
  createStars, drawStars,
  createFireflies, drawFireflies,
  createDust, drawDust,
  createTorches, drawTorches,
  createRain, drawRain,
  createSnow, drawSnow,
} from './particles'

const TILE = 16
const SPRITE_SCALE = 2

// Define which ambient effects each zone gets
// Git zones
const GIT_ZONE_FX = {
  1:  { stars: 15, fireflies: 4, torches: [[0.12, 0.55], [0.88, 0.55]] },
  2:  { dust: 20, torches: [[0.08, 0.5], [0.92, 0.5]] },
  3:  { torches: [[0.2, 0.48], [0.8, 0.48], [0.5, 0.42]], dust: 10 },
  4:  { stars: 25, rain: 30 },
  5:  { fireflies: 8, dust: 15 },
  6:  { stars: 10, dust: 12, torches: [[0.3, 0.45], [0.7, 0.45]] },
  7:  { snow: 35, stars: 20 },
  8:  { stars: 12, dust: 18, torches: [[0.25, 0.5], [0.75, 0.5]] },
  9:  { torches: [[0.1, 0.5], [0.35, 0.5], [0.65, 0.5], [0.9, 0.5]], dust: 8 },
  10: { stars: 40, fireflies: 6 },
}

// SQL zones
const SQL_ZONE_FX = {
  1:  { dust: 25, dustColor: '#d4a520' },
  2:  { dust: 15, torches: [[0.15, 0.5], [0.85, 0.5]] },
  3:  { dust: 10, torches: [[0.2, 0.45], [0.8, 0.45]] },
  4:  { stars: 8, dust: 12, torches: [[0.3, 0.5], [0.7, 0.5]] },
  5:  { torches: [[0.15, 0.5], [0.5, 0.5], [0.85, 0.5]], dust: 8 },
  6:  { rain: 20, dust: 10 },
  7:  { stars: 10, dust: 15, torches: [[0.25, 0.5], [0.75, 0.5]] },
  8:  { torches: [[0.3, 0.45], [0.6, 0.45]], dust: 10 },
  9:  { stars: 15, fireflies: 5 },
  10: { stars: 35, fireflies: 8 },
}

function buildFx(fxDef, level) {
  const fx = {}
  if (fxDef.stars)     fx.stars = createStars(fxDef.stars, level * 100 + 1)
  if (fxDef.fireflies) fx.fireflies = createFireflies(fxDef.fireflies, level * 100 + 2)
  if (fxDef.dust)      { fx.dust = createDust(fxDef.dust, level * 100 + 3); fx.dustColor = fxDef.dustColor }
  if (fxDef.torches)   fx.torches = createTorches(fxDef.torches, level * 100 + 4)
  if (fxDef.rain)      fx.rain = createRain(fxDef.rain, level * 100 + 5)
  if (fxDef.snow)      fx.snow = createSnow(fxDef.snow, level * 100 + 6)
  return fx
}

export function createRenderer(canvas, quest = 'git') {
  const ctx = canvas.getContext('2d')
  let animId = null
  let startTime = Date.now()
  let currentLevel = 1
  let npcName = ''
  let npcLine = ''

  const zones = quest === 'git' ? GIT_ZONES : SQL_ZONES
  const zoneFxDefs = quest === 'git' ? GIT_ZONE_FX : SQL_ZONE_FX

  // Pre-build particle systems for all zones
  const zoneFx = {}
  for (const lvl of Object.keys(zoneFxDefs)) {
    zoneFx[lvl] = buildFx(zoneFxDefs[lvl], Number(lvl))
  }

  // Reaction animation state
  let reaction = null  // { type, startTime, duration }

  function getReactionOffsets(t) {
    if (!reaction) return { playerDx: 0, playerDy: 0, npcDx: 0, npcDy: 0 }
    const elapsed = t - reaction.startTime
    if (elapsed > reaction.duration) { reaction = null; return { playerDx: 0, playerDy: 0, npcDx: 0, npcDy: 0 } }
    const progress = elapsed / reaction.duration

    switch (reaction.type) {
      case 'jump': {
        // Player hops up then lands — parabolic arc
        const arc = Math.sin(progress * Math.PI)
        return { playerDx: 0, playerDy: -arc * 14, npcDx: 0, npcDy: 0 }
      }
      case 'shake': {
        // Player shakes side-to-side, decaying
        const decay = 1 - progress
        const shake = Math.sin(elapsed * 30) * 3 * decay
        return { playerDx: shake, playerDy: 0, npcDx: 0, npcDy: 0 }
      }
      case 'celebrate': {
        // Both sprites bounce
        const arc = Math.sin(progress * Math.PI * 2)
        return { playerDx: 0, playerDy: -Math.abs(arc) * 10, npcDx: 0, npcDy: -Math.abs(arc) * 8 }
      }
      default:
        return { playerDx: 0, playerDy: 0, npcDx: 0, npcDy: 0 }
    }
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
  }

  function drawBackground(zone, w, h) {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, zone.sky)
    grad.addColorStop(1, zone.ground)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Ground tiles
    const groundY = h * 0.72
    for (let x = 0; x < w; x += TILE) {
      for (let y = groundY; y < h; y += TILE) {
        ctx.fillStyle = (Math.floor(x / TILE) + Math.floor(y / TILE)) % 2 === 0
          ? zone.ground
          : zone.groundAccent
        ctx.fillRect(x, y, TILE, TILE)
      }
    }

    // Ground line
    ctx.fillStyle = zone.wallAccent
    ctx.fillRect(0, groundY - 2, w, 2)

    // Wall texture (upper area) — deterministic hash to avoid shimmer
    for (let x = 0; x < w; x += TILE * 2) {
      for (let y = 0; y < groundY; y += TILE * 2) {
        const hash = ((x * 31 + y * 17 + currentLevel * 7) % 100)
        if (hash < 8) {
          ctx.fillStyle = zone.wallAccent
          ctx.globalAlpha = 0.15
          ctx.fillRect(x, y, TILE, TILE)
          ctx.globalAlpha = 1
        }
      }
    }

    // Zone-specific props
    zone.drawProps(ctx, w, h)
  }

  function drawPlayer(w, h, t, dx = 0, dy = 0) {
    const bobY = Math.sin(t * 2) * 1.5
    const playerX = w * 0.3 - 7 * SPRITE_SCALE + dx
    const playerY = h * 0.72 - 24 * SPRITE_SCALE + bobY + dy
    drawSprite(ctx, PLAYER_SPRITE, playerX, playerY, SPRITE_SCALE)
  }

  function drawNpc(w, h, t, dx = 0, dy = 0) {
    const bobY = Math.sin(t * 1.5 + 1) * 2
    const npcX = w * 0.65 - 7 * SPRITE_SCALE + dx
    const npcY = h * 0.72 - 24 * SPRITE_SCALE + bobY + dy
    drawSprite(ctx, NPC_SPRITE, npcX, npcY, SPRITE_SCALE)

    // NPC name label
    if (npcName) {
      ctx.fillStyle = '#fbbf24'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(npcName, w * 0.65, npcY - 6)
    }
  }

  function drawSpeechBubble(w, h) {
    if (!npcLine) return

    const maxWidth = Math.min(w * 0.45, 200)
    const bubbleX = w * 0.65
    const bubbleY = h * 0.72 - 24 * SPRITE_SCALE - 40

    ctx.font = '10px monospace'
    ctx.textAlign = 'center'

    // Word wrap
    const words = npcLine.split(' ')
    const lines = []
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxWidth - 16) {
        if (line) lines.push(line)
        line = word
      } else {
        line = test
      }
    }
    if (line) lines.push(line)

    const lineHeight = 13
    const padding = 8
    const bubbleW = maxWidth
    const bubbleH = lines.length * lineHeight + padding * 2

    // Bubble background
    ctx.fillStyle = 'rgba(24, 24, 32, 0.9)'
    ctx.strokeStyle = 'rgba(100, 100, 120, 0.5)'
    ctx.lineWidth = 1
    const bx = bubbleX - bubbleW / 2
    const by = bubbleY - bubbleH

    ctx.beginPath()
    ctx.roundRect(bx, by, bubbleW, bubbleH, 4)
    ctx.fill()
    ctx.stroke()

    // Tail
    ctx.fillStyle = 'rgba(24, 24, 32, 0.9)'
    ctx.beginPath()
    ctx.moveTo(bubbleX - 4, by + bubbleH)
    ctx.lineTo(bubbleX, by + bubbleH + 6)
    ctx.lineTo(bubbleX + 4, by + bubbleH)
    ctx.fill()

    // Text
    ctx.fillStyle = '#a1a1aa'
    ctx.textAlign = 'center'
    lines.forEach((l, i) => {
      ctx.fillText(l, bubbleX, by + padding + 10 + i * lineHeight)
    })
  }

  function drawLevelLabel(zone, w) {
    ctx.fillStyle = zone.featureColor
    ctx.globalAlpha = 0.4
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(zone.name, 8, 14)
    ctx.globalAlpha = 1
  }

  function frame() {
    const w = canvas.width
    const h = canvas.height
    if (w === 0 || h === 0) { animId = requestAnimationFrame(frame); return }

    const t = (Date.now() - startTime) / 1000
    const zone = zones[currentLevel] ?? zones[1]

    ctx.clearRect(0, 0, w, h)
    drawBackground(zone, w, h)

    // Ambient particles
    const fx = zoneFx[currentLevel]
    if (fx) {
      if (fx.stars)     drawStars(ctx, fx.stars, w, h, t)
      if (fx.rain)      drawRain(ctx, fx.rain, w, h, t)
      if (fx.snow)      drawSnow(ctx, fx.snow, w, h, t)
      if (fx.dust)      drawDust(ctx, fx.dust, w, h, t, fx.dustColor)
      if (fx.fireflies) drawFireflies(ctx, fx.fireflies, w, h, t)
      if (fx.torches)   drawTorches(ctx, fx.torches, w, h, t)
    }

    const offsets = getReactionOffsets(t)
    drawPlayer(w, h, t, offsets.playerDx, offsets.playerDy)
    drawNpc(w, h, t, offsets.npcDx, offsets.npcDy)
    drawSpeechBubble(w, h)
    drawLevelLabel(zone, w)

    animId = requestAnimationFrame(frame)
  }

  function start() {
    resize()
    startTime = Date.now()
    frame()
  }

  function stop() {
    if (animId) cancelAnimationFrame(animId)
    animId = null
  }

  function update({ level, npc, line }) {
    if (level !== undefined) currentLevel = level
    if (npc !== undefined) npcName = npc
    if (line !== undefined) npcLine = line
  }

  function triggerReaction(type) {
    const t = (Date.now() - startTime) / 1000
    const durations = { jump: 0.4, shake: 0.35, celebrate: 0.7 }
    reaction = { type, startTime: t, duration: durations[type] ?? 0.4 }
  }

  return { start, stop, resize, update, react: triggerReaction }
}
