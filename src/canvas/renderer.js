import { PLAYER_SPRITE, NPC_SPRITE, drawSprite } from './sprites'
import { GIT_ZONES, SQL_ZONES } from './zones'

const TILE = 16
const SPRITE_SCALE = 2

export function createRenderer(canvas, quest = 'git') {
  const ctx = canvas.getContext('2d')
  let animId = null
  let startTime = Date.now()
  let currentLevel = 1
  let npcName = ''
  let npcLine = ''

  const zones = quest === 'git' ? GIT_ZONES : SQL_ZONES

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

    // Wall texture (upper area)
    for (let x = 0; x < w; x += TILE * 2) {
      for (let y = 0; y < groundY; y += TILE * 2) {
        if (Math.random() < 0.08) {
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

  function drawPlayer(w, h, t) {
    const bobY = Math.sin(t * 2) * 1.5
    const playerX = w * 0.3 - 7 * SPRITE_SCALE
    const playerY = h * 0.72 - 24 * SPRITE_SCALE + bobY
    drawSprite(ctx, PLAYER_SPRITE, playerX, playerY, SPRITE_SCALE)
  }

  function drawNpc(w, h, t) {
    const bobY = Math.sin(t * 1.5 + 1) * 2
    const npcX = w * 0.65 - 7 * SPRITE_SCALE
    const npcY = h * 0.72 - 24 * SPRITE_SCALE + bobY
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
    drawPlayer(w, h, t)
    drawNpc(w, h, t)
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

  return { start, stop, resize, update }
}
