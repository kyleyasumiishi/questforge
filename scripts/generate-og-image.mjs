// Generates public/og-image.png — a 1200x630 pixel-art Open Graph card
// Run: node scripts/generate-og-image.mjs

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WIDTH = 1200
const HEIGHT = 630
const SCALE = 4 // pixel art scale

const canvas = createCanvas(WIDTH, HEIGHT)
const ctx = canvas.getContext('2d')

// ── Background: Sanctum Spire zone feel ────────────────────────────

const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT)
grad.addColorStop(0, '#050510')
grad.addColorStop(0.6, '#151528')
grad.addColorStop(1, '#1d1d35')
ctx.fillStyle = grad
ctx.fillRect(0, 0, WIDTH, HEIGHT)

// Stars
const stars = [
  [0.05, 0.08], [0.12, 0.15], [0.2, 0.05], [0.28, 0.2], [0.35, 0.1],
  [0.42, 0.18], [0.55, 0.06], [0.63, 0.14], [0.7, 0.04], [0.78, 0.12],
  [0.85, 0.08], [0.92, 0.16], [0.08, 0.25], [0.3, 0.28], [0.5, 0.22],
  [0.65, 0.26], [0.88, 0.24], [0.15, 0.32], [0.45, 0.3], [0.75, 0.35],
]
ctx.fillStyle = '#fff'
stars.forEach(([x, y]) => {
  ctx.globalAlpha = 0.2 + Math.random() * 0.4
  const size = Math.random() < 0.3 ? 3 : 2
  ctx.fillRect(x * WIDTH, y * HEIGHT, size, size)
})
ctx.globalAlpha = 1

// Ground
const groundY = HEIGHT * 0.75
ctx.fillStyle = '#202040'
ctx.fillRect(0, groundY, WIDTH, HEIGHT - groundY)
ctx.fillStyle = '#2a2a50'
ctx.fillRect(0, groundY - 2, WIDTH, 2)

// Ground tiles
for (let x = 0; x < WIDTH; x += 16) {
  for (let y = groundY; y < HEIGHT; y += 16) {
    if ((Math.floor(x / 16) + Math.floor(y / 16)) % 2 === 0) {
      ctx.fillStyle = '#1d1d35'
      ctx.fillRect(x, y, 16, 16)
    }
  }
}

// ── Sprites ────────────────────────────────────────────────────────

const T = null

const PLAYER = [
  [T,T,T,T,T,'#4a7c59',T,T,T,T,T,T,T,T],
  [T,T,T,T,'#4a7c59','#5a9c6a','#5a9c6a','#4a7c59',T,T,T,T,T,T],
  [T,T,T,'#4a7c59','#5a9c6a','#6ab87a','#6ab87a','#5a9c6a','#4a7c59',T,T,T,T,T],
  [T,T,'#3d6b4a','#4a7c59','#5a9c6a','#5a9c6a','#5a9c6a','#5a9c6a','#4a7c59','#3d6b4a',T,T,T,T],
  [T,T,T,T,'#e8c89e','#e8c89e','#e8c89e','#e8c89e',T,T,T,T,T,T],
  [T,T,T,'#e8c89e','#e8c89e','#e8c89e','#e8c89e','#e8c89e','#e8c89e',T,T,T,T,T],
  [T,T,T,'#e8c89e','#2d1b0e','#e8c89e','#e8c89e','#2d1b0e','#e8c89e',T,T,T,T,T],
  [T,T,T,T,'#e8c89e','#e8c89e','#c8785a','#e8c89e',T,T,T,T,T,T],
  [T,T,T,T,T,'#5b7fb5','#5b7fb5',T,T,T,T,T,T,T],
  [T,T,T,T,'#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5',T,T,T,T,T,T],
  [T,T,T,'#5b7fb5','#5b7fb5','#7b9fd5','#7b9fd5','#5b7fb5','#5b7fb5',T,T,T,T,T],
  [T,T,T,'#5b7fb5','#5b7fb5','#7b9fd5','#7b9fd5','#5b7fb5','#5b7fb5',T,T,T,T,T],
  [T,T,T,'#8b6914','#8b6914','#8b6914','#8b6914','#8b6914','#8b6914',T,T,T,T,T],
  [T,T,T,'#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5',T,T,T,T,T],
  [T,T,T,'#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5',T,T,T,T,T],
  [T,T,T,T,'#5b7fb5','#5b7fb5','#5b7fb5','#5b7fb5',T,T,T,T,T,T],
  [T,T,T,T,'#6b4226','#6b4226','#6b4226','#6b4226',T,T,T,T,T,T],
  [T,T,T,T,'#6b4226','#6b4226','#6b4226','#6b4226',T,T,T,T,T,T],
  [T,T,T,'#6b4226','#6b4226',T,T,'#6b4226','#6b4226',T,T,T,T,T],
  [T,T,T,'#6b4226','#6b4226',T,T,'#6b4226','#6b4226',T,T,T,T,T],
  [T,T,'#3d2517','#3d2517','#3d2517',T,T,'#3d2517','#3d2517','#3d2517',T,T,T,T],
  [T,T,'#3d2517','#3d2517','#3d2517',T,T,'#3d2517','#3d2517','#3d2517',T,T,T,T],
  [T,'#2d1b0e','#3d2517','#3d2517','#3d2517',T,T,'#3d2517','#3d2517','#3d2517','#2d1b0e',T,T,T],
  [T,'#2d1b0e','#2d1b0e','#2d1b0e','#2d1b0e',T,T,'#2d1b0e','#2d1b0e','#2d1b0e','#2d1b0e',T,T,T],
]

const NPC = [
  [T,T,T,T,T,'#8b5e3c',T,T,T,T,T,T,T,T],
  [T,T,T,T,'#8b5e3c','#a0714a','#a0714a','#8b5e3c',T,T,T,T,T,T],
  [T,T,T,'#8b5e3c','#a0714a','#b8864f','#b8864f','#a0714a','#8b5e3c',T,T,T,T,T],
  [T,T,'#7a4e2c','#8b5e3c','#a0714a','#a0714a','#a0714a','#a0714a','#8b5e3c','#7a4e2c',T,T,T,T],
  [T,T,T,T,'#d4a574','#d4a574','#d4a574','#d4a574',T,T,T,T,T,T],
  [T,T,T,'#d4a574','#d4a574','#d4a574','#d4a574','#d4a574','#d4a574',T,T,T,T,T],
  [T,T,T,'#d4a574','#4a3520','#d4a574','#d4a574','#4a3520','#d4a574',T,T,T,T,T],
  [T,T,T,T,'#d4a574','#c89070','#c89070','#d4a574',T,T,T,T,T,T],
  [T,T,T,T,'#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0',T,T,T,T,T,T],
  [T,T,T,'#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0',T,T,T,T,T],
  [T,T,'#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0',T,T,T,T],
  [T,T,'#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0',T,T,T,T],
  [T,T,'#6b3fa0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#6b3fa0',T,T,T,T],
  [T,'#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0',T,T,T],
  [T,'#6b3fa0','#8b5fc0','#8b5fc0','#8b5fc0','#6b3fa0','#6b3fa0','#8b5fc0','#8b5fc0','#8b5fc0','#6b3fa0',T,T,T],
  [T,'#6b3fa0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#8b5fc0','#6b3fa0',T,T,T],
  [T,'#5a2e8a','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#5a2e8a',T,T,T],
  [T,T,'#5a2e8a','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#5a2e8a',T,T,T,T],
  [T,T,'#5a2e8a','#5a2e8a','#6b3fa0','#6b3fa0','#6b3fa0','#6b3fa0','#5a2e8a','#5a2e8a',T,T,T,T],
  [T,T,T,'#5a2e8a','#5a2e8a','#6b3fa0','#6b3fa0','#5a2e8a','#5a2e8a',T,T,T,T,T],
  [T,T,T,'#3d2517','#3d2517','#3d2517','#3d2517','#3d2517','#3d2517',T,T,T,T,T],
  [T,T,T,'#3d2517','#3d2517','#3d2517','#3d2517','#3d2517','#3d2517',T,T,T,T,T],
  [T,T,'#2d1b0e','#3d2517','#3d2517',T,T,'#3d2517','#3d2517','#2d1b0e',T,T,T,T],
  [T,T,'#2d1b0e','#2d1b0e','#2d1b0e',T,T,'#2d1b0e','#2d1b0e','#2d1b0e',T,T,T,T],
]

function drawSprite(sprite, x, y, scale) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const color = sprite[row][col]
      if (color) {
        ctx.fillStyle = color
        ctx.fillRect(x + col * scale, y + row * scale, scale, scale)
      }
    }
  }
}

// Draw player (left of center)
drawSprite(PLAYER, 300, groundY - 24 * SCALE, SCALE)

// Draw NPC (right of center)
drawSprite(NPC, 820, groundY - 24 * SCALE, SCALE)

// ── Torches ────────────────────────────────────────────────────────

function drawTorch(x, y) {
  ctx.fillStyle = '#5a3a1a'
  ctx.fillRect(x - 2, y, 5, 20)
  ctx.fillStyle = '#f97316'
  ctx.globalAlpha = 0.8
  ctx.fillRect(x - 4, y - 14, 9, 14)
  ctx.fillStyle = '#fbbf24'
  ctx.globalAlpha = 0.7
  ctx.fillRect(x - 2, y - 12, 5, 10)
  ctx.fillStyle = '#fef3c7'
  ctx.globalAlpha = 0.6
  ctx.fillRect(x, y - 15, 2, 4)
  // Glow
  ctx.fillStyle = '#f97316'
  ctx.globalAlpha = 0.08
  ctx.beginPath()
  ctx.arc(x, y - 7, 30, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

drawTorch(160, groundY - 40)
drawTorch(1040, groundY - 40)

// ── Title text (pixel-style) ───────────────────────────────────────

// Title
ctx.fillStyle = '#34d399'
ctx.font = 'bold 72px monospace'
ctx.textAlign = 'center'
ctx.fillText('QuestForge', WIDTH / 2, 180)

// Subtitle
ctx.fillStyle = '#a1a1aa'
ctx.font = '24px monospace'
ctx.fillText('Learn Git & SQL through narrative RPG adventures', WIDTH / 2, 230)

// Terminal-style command preview
ctx.fillStyle = '#18181b'
ctx.globalAlpha = 0.8
const boxW = 500
const boxH = 80
const boxX = (WIDTH - boxW) / 2
const boxY = 280
ctx.fillRect(boxX, boxY, boxW, boxH)
ctx.globalAlpha = 1
ctx.strokeStyle = '#3f3f46'
ctx.lineWidth = 1
ctx.strokeRect(boxX, boxY, boxW, boxH)

ctx.font = '18px monospace'
ctx.textAlign = 'left'
ctx.fillStyle = '#71717a'
ctx.fillText('~/quest-repo (main) $', boxX + 16, boxY + 30)
ctx.fillStyle = '#e4e4e7'
ctx.fillText('git init', boxX + 260, boxY + 30)
ctx.fillStyle = '#4ade80'
ctx.fillText('✓ Initialized empty Git repository', boxX + 16, boxY + 58)

// Badge pills
ctx.textAlign = 'center'
const badges = [
  { text: '52 Git Missions', color: '#4ade80', bg: '#052e16' },
  { text: '53 SQL Missions', color: '#fbbf24', bg: '#422006' },
  { text: 'No Backend', color: '#60a5fa', bg: '#172554' },
]
const badgeY = 400
const badgeGap = 200
const badgeStartX = WIDTH / 2 - (badges.length - 1) * badgeGap / 2

badges.forEach((b, i) => {
  const bx = badgeStartX + i * badgeGap
  const bw = 160
  ctx.fillStyle = b.bg
  ctx.globalAlpha = 0.8
  ctx.beginPath()
  ctx.roundRect(bx - bw / 2, badgeY, bw, 32, 16)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.fillStyle = b.color
  ctx.font = 'bold 14px monospace'
  ctx.fillText(b.text, bx, badgeY + 21)
})

// ── Save ───────────────────────────────────────────────────────────

const outPath = resolve(__dirname, '..', 'public', 'og-image.png')
writeFileSync(outPath, canvas.toBuffer('image/png'))
console.log(`✓ Generated ${outPath} (${WIDTH}x${HEIGHT})`)
