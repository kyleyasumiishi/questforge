// Ambient particle systems for zone atmosphere
// Each system returns an array of particles seeded once, drawn every frame

// Seeded random for deterministic particle placement
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ── Particle types ─────────────────────────────────────────────────

export function createStars(count, seed = 1) {
  const rand = seededRandom(seed)
  return Array.from({ length: count }, () => ({
    x: rand(),           // 0-1 relative position
    y: rand() * 0.4,     // upper 40% of screen
    size: rand() < 0.3 ? 2 : 1,
    twinkleSpeed: 0.5 + rand() * 2,
    twinkleOffset: rand() * Math.PI * 2,
    brightness: 0.2 + rand() * 0.4,
  }))
}

export function drawStars(ctx, stars, w, h, t) {
  stars.forEach(s => {
    const alpha = s.brightness * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset))
    ctx.fillStyle = '#fff'
    ctx.globalAlpha = alpha
    ctx.fillRect(s.x * w, s.y * h, s.size, s.size)
  })
  ctx.globalAlpha = 1
}

export function createFireflies(count, seed = 2) {
  const rand = seededRandom(seed)
  return Array.from({ length: count }, () => ({
    baseX: 0.1 + rand() * 0.8,
    baseY: 0.3 + rand() * 0.35,
    driftX: 0.02 + rand() * 0.03,
    driftY: 0.01 + rand() * 0.02,
    speed: 0.3 + rand() * 0.7,
    offset: rand() * Math.PI * 2,
    color: rand() < 0.5 ? '#4ade80' : '#86efac',
    size: 2,
  }))
}

export function drawFireflies(ctx, fireflies, w, h, t) {
  fireflies.forEach(f => {
    const x = (f.baseX + Math.sin(t * f.speed + f.offset) * f.driftX) * w
    const y = (f.baseY + Math.cos(t * f.speed * 0.7 + f.offset) * f.driftY) * h
    const alpha = 0.3 + 0.4 * Math.sin(t * f.speed * 2 + f.offset)

    // Glow
    ctx.fillStyle = f.color
    ctx.globalAlpha = alpha * 0.2
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fill()

    // Core
    ctx.globalAlpha = alpha
    ctx.fillRect(x - 1, y - 1, f.size, f.size)
  })
  ctx.globalAlpha = 1
}

export function createDust(count, seed = 3) {
  const rand = seededRandom(seed)
  return Array.from({ length: count }, () => ({
    x: rand(),
    y: 0.2 + rand() * 0.5,
    speed: 0.005 + rand() * 0.01,
    drift: 0.01 + rand() * 0.02,
    size: 1 + (rand() < 0.3 ? 1 : 0),
    alpha: 0.08 + rand() * 0.12,
    offset: rand() * Math.PI * 2,
  }))
}

export function drawDust(ctx, dust, w, h, t, color = '#a1a1aa') {
  ctx.fillStyle = color
  dust.forEach(d => {
    const x = ((d.x + t * d.speed) % 1.1 - 0.05) * w
    const y = (d.y + Math.sin(t * 0.5 + d.offset) * d.drift) * h
    ctx.globalAlpha = d.alpha
    ctx.fillRect(x, y, d.size, d.size)
  })
  ctx.globalAlpha = 1
}

export function createTorches(positions, seed = 4) {
  const rand = seededRandom(seed)
  return positions.map(([px, py]) => ({
    x: px,
    y: py,
    flickerSpeed: 3 + rand() * 4,
    offset: rand() * Math.PI * 2,
  }))
}

export function drawTorches(ctx, torches, w, h, t) {
  torches.forEach(torch => {
    const x = torch.x * w
    const y = torch.y * h
    const flicker = Math.sin(t * torch.flickerSpeed + torch.offset)

    // Torch body
    ctx.fillStyle = '#5a3a1a'
    ctx.fillRect(x - 1, y, 3, 10)

    // Flame
    const flameH = 6 + flicker * 2
    ctx.fillStyle = '#f97316'
    ctx.globalAlpha = 0.7 + flicker * 0.15
    ctx.fillRect(x - 2, y - flameH, 5, flameH)

    ctx.fillStyle = '#fbbf24'
    ctx.globalAlpha = 0.6 + flicker * 0.2
    ctx.fillRect(x - 1, y - flameH + 1, 3, flameH - 2)

    // Tip
    ctx.fillStyle = '#fef3c7'
    ctx.globalAlpha = 0.5 + flicker * 0.3
    ctx.fillRect(x, y - flameH - 1, 1, 2)

    // Glow
    ctx.fillStyle = '#f97316'
    ctx.globalAlpha = 0.06 + flicker * 0.02
    ctx.beginPath()
    ctx.arc(x, y - flameH / 2, 16, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1
}

export function createRain(count, seed = 5) {
  const rand = seededRandom(seed)
  return Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    speed: 0.4 + rand() * 0.6,
    length: 4 + rand() * 6,
    alpha: 0.1 + rand() * 0.15,
  }))
}

export function drawRain(ctx, rain, w, h, t) {
  ctx.strokeStyle = '#60a5fa'
  ctx.lineWidth = 1
  rain.forEach(r => {
    const y = ((r.y + t * r.speed) % 1.2 - 0.1) * h
    const x = r.x * w
    ctx.globalAlpha = r.alpha
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x - 1, y + r.length)
    ctx.stroke()
  })
  ctx.globalAlpha = 1
}

export function createSnow(count, seed = 6) {
  const rand = seededRandom(seed)
  return Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    speed: 0.02 + rand() * 0.04,
    drift: 0.01 + rand() * 0.02,
    driftSpeed: 0.3 + rand() * 0.5,
    size: 1 + (rand() < 0.2 ? 1 : 0),
    alpha: 0.15 + rand() * 0.25,
    offset: rand() * Math.PI * 2,
  }))
}

export function drawSnow(ctx, snow, w, h, t) {
  ctx.fillStyle = '#e0e8f0'
  snow.forEach(s => {
    const y = ((s.y + t * s.speed) % 1.1 - 0.05) * h
    const x = (s.x + Math.sin(t * s.driftSpeed + s.offset) * s.drift) * w
    ctx.globalAlpha = s.alpha
    ctx.fillRect(x, y, s.size, s.size)
  })
  ctx.globalAlpha = 1
}
