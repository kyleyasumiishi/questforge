// Zone visual definitions — palette + procedural tile generation for each GitQuest level
// Each zone has: ground, accent, sky, feature colors + a draw function for props

export const GIT_ZONES = {
  1: {
    name: 'The Empty Cave',
    sky: '#0a0a12',
    ground: '#1a1a2e',
    groundAccent: '#22223a',
    wallColor: '#2a2a3e',
    wallAccent: '#33334d',
    featureColor: '#3d3d5c',
    drawProps(ctx, w, h) {
      // Stalactites
      for (let i = 0; i < 8; i++) {
        const x = 30 + i * (w / 8)
        const len = 15 + Math.sin(i * 2.3) * 10
        ctx.fillStyle = '#2a2a3e'
        ctx.beginPath()
        ctx.moveTo(x - 4, 0)
        ctx.lineTo(x + 4, 0)
        ctx.lineTo(x, len)
        ctx.fill()
      }
      // Glowing crystals
      ctx.fillStyle = '#4ade80'
      ctx.globalAlpha = 0.3
      ctx.fillRect(w * 0.2, h * 0.6, 6, 12)
      ctx.fillRect(w * 0.7, h * 0.55, 4, 10)
      ctx.globalAlpha = 1
    },
  },
  2: {
    name: 'The Staging Grounds',
    sky: '#1a1025',
    ground: '#2d1f3d',
    groundAccent: '#3a2850',
    wallColor: '#1e1428',
    wallAccent: '#281a35',
    featureColor: '#d4a020',
    drawProps(ctx, w, h) {
      // Glowing file icons on ground
      const files = [0.15, 0.35, 0.55, 0.75]
      files.forEach((fx, i) => {
        const glow = i < 2 ? '#ef4444' : '#eab308'
        ctx.fillStyle = glow
        ctx.globalAlpha = 0.5
        ctx.fillRect(w * fx - 4, h * 0.65, 8, 10)
        ctx.globalAlpha = 0.2
        ctx.fillRect(w * fx - 6, h * 0.63, 12, 14)
        ctx.globalAlpha = 1
      })
    },
  },
  3: {
    name: 'The Workshop',
    sky: '#1a0f0a',
    ground: '#3d2517',
    groundAccent: '#4a2e1c',
    wallColor: '#2d1b10',
    wallAccent: '#3a2415',
    featureColor: '#e87040',
    drawProps(ctx, w, h) {
      // Forge/anvil
      ctx.fillStyle = '#555'
      ctx.fillRect(w * 0.4, h * 0.5, 30, 20)
      ctx.fillStyle = '#777'
      ctx.fillRect(w * 0.4 + 2, h * 0.5, 26, 4)
      // Flames
      ctx.fillStyle = '#f97316'
      ctx.globalAlpha = 0.7
      ctx.fillRect(w * 0.42, h * 0.44, 6, 8)
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(w * 0.46, h * 0.42, 4, 10)
      ctx.globalAlpha = 1
    },
  },
  4: {
    name: 'The Watchtower',
    sky: '#0c1220',
    ground: '#1e2d3d',
    groundAccent: '#253648',
    wallColor: '#2d3d50',
    wallAccent: '#3a4d60',
    featureColor: '#60a5fa',
    drawProps(ctx, w, h) {
      // Tower silhouette
      ctx.fillStyle = '#1a2535'
      ctx.fillRect(w * 0.6, h * 0.1, 24, h * 0.6)
      ctx.fillStyle = '#253545'
      ctx.fillRect(w * 0.6 + 4, h * 0.15, 16, 12)
      // Window glow
      ctx.fillStyle = '#fbbf24'
      ctx.globalAlpha = 0.6
      ctx.fillRect(w * 0.6 + 8, h * 0.18, 8, 6)
      ctx.globalAlpha = 1
    },
  },
  5: {
    name: 'The Branching Forest',
    sky: '#0a1a0a',
    ground: '#1a2e1a',
    groundAccent: '#223a22',
    wallColor: '#0f1f0f',
    wallAccent: '#152a15',
    featureColor: '#4ade80',
    drawProps(ctx, w, h) {
      // Trees with forking branches
      const trees = [0.15, 0.4, 0.65, 0.85]
      trees.forEach(tx => {
        const x = w * tx
        ctx.fillStyle = '#3d2517'
        ctx.fillRect(x - 3, h * 0.3, 6, h * 0.4)
        ctx.fillStyle = '#2d6b2d'
        ctx.beginPath()
        ctx.arc(x, h * 0.28, 16, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#3a8a3a'
        ctx.beginPath()
        ctx.arc(x - 6, h * 0.25, 10, 0, Math.PI * 2)
        ctx.fill()
      })
    },
  },
  6: {
    name: 'The Merge Shrine',
    sky: '#12081e',
    ground: '#2a1a3e',
    groundAccent: '#352248',
    wallColor: '#1e1028',
    wallAccent: '#281535',
    featureColor: '#a855f7',
    drawProps(ctx, w, h) {
      // Stone altar
      ctx.fillStyle = '#4a4a5a'
      ctx.fillRect(w * 0.3, h * 0.5, 50, 8)
      ctx.fillRect(w * 0.32, h * 0.58, 10, 16)
      ctx.fillRect(w * 0.3 + 36, h * 0.58, 10, 16)
      // Glowing merge symbol
      ctx.fillStyle = '#a855f7'
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.arc(w * 0.3 + 25, h * 0.45, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    },
  },
  7: {
    name: 'The Remote Peaks',
    sky: '#0a1520',
    ground: '#1a2a35',
    groundAccent: '#223340',
    wallColor: '#2a3a4a',
    wallAccent: '#334a5a',
    featureColor: '#38bdf8',
    drawProps(ctx, w, h) {
      // Mountain peaks
      ctx.fillStyle = '#2a3a4a'
      ctx.beginPath()
      ctx.moveTo(0, h * 0.5)
      ctx.lineTo(w * 0.2, h * 0.15)
      ctx.lineTo(w * 0.4, h * 0.5)
      ctx.fill()
      ctx.fillStyle = '#334a5a'
      ctx.beginPath()
      ctx.moveTo(w * 0.3, h * 0.5)
      ctx.lineTo(w * 0.55, h * 0.1)
      ctx.lineTo(w * 0.8, h * 0.5)
      ctx.fill()
      // Snow caps
      ctx.fillStyle = '#e0e8f0'
      ctx.beginPath()
      ctx.moveTo(w * 0.17, h * 0.18)
      ctx.lineTo(w * 0.2, h * 0.15)
      ctx.lineTo(w * 0.23, h * 0.18)
      ctx.fill()
    },
  },
  8: {
    name: 'The Time Vaults',
    sky: '#0a0a18',
    ground: '#18182e',
    groundAccent: '#20203a',
    wallColor: '#252540',
    wallAccent: '#30304d',
    featureColor: '#fbbf24',
    drawProps(ctx, w, h) {
      // Clock/gear shapes
      ctx.strokeStyle = '#fbbf24'
      ctx.globalAlpha = 0.4
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(w * 0.5, h * 0.35, 20, 0, Math.PI * 2)
      ctx.stroke()
      // Clock hands
      ctx.beginPath()
      ctx.moveTo(w * 0.5, h * 0.35)
      ctx.lineTo(w * 0.5, h * 0.35 - 14)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(w * 0.5, h * 0.35)
      ctx.lineTo(w * 0.5 + 10, h * 0.35)
      ctx.stroke()
      ctx.globalAlpha = 1
    },
  },
  9: {
    name: 'The Guild Hall',
    sky: '#12100a',
    ground: '#2e2820',
    groundAccent: '#3a3228',
    wallColor: '#3d3525',
    wallAccent: '#4a4030',
    featureColor: '#f59e0b',
    drawProps(ctx, w, h) {
      // Pillars
      for (let i = 0; i < 4; i++) {
        const x = w * 0.15 + i * (w * 0.22)
        ctx.fillStyle = '#4a4030'
        ctx.fillRect(x, h * 0.15, 10, h * 0.55)
        ctx.fillStyle = '#5a5040'
        ctx.fillRect(x - 2, h * 0.13, 14, 6)
        ctx.fillRect(x - 2, h * 0.68, 14, 6)
      }
      // Banner
      ctx.fillStyle = '#b91c1c'
      ctx.fillRect(w * 0.42, h * 0.15, 20, 30)
    },
  },
  10: {
    name: 'The Sanctum Spire',
    sky: '#050510',
    ground: '#151528',
    groundAccent: '#1d1d35',
    wallColor: '#202040',
    wallAccent: '#2a2a50',
    featureColor: '#34d399',
    drawProps(ctx, w, h) {
      // Grand spire
      ctx.fillStyle = '#2a2a50'
      ctx.beginPath()
      ctx.moveTo(w * 0.45, h * 0.05)
      ctx.lineTo(w * 0.38, h * 0.5)
      ctx.lineTo(w * 0.52, h * 0.5)
      ctx.fill()
      // Glow at top
      ctx.fillStyle = '#34d399'
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.arc(w * 0.45, h * 0.06, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 0.2
      ctx.beginPath()
      ctx.arc(w * 0.45, h * 0.06, 16, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      // Stars
      ctx.fillStyle = '#fff'
      ctx.globalAlpha = 0.4
      const stars = [[0.1, 0.08], [0.3, 0.04], [0.7, 0.06], [0.85, 0.12], [0.6, 0.15], [0.15, 0.2]]
      stars.forEach(([sx, sy]) => ctx.fillRect(w * sx, h * sy, 2, 2))
      ctx.globalAlpha = 1
    },
  },
}

export const SQL_ZONES = {
  1: { name: 'The Surface Layer', sky: '#1a1508', ground: '#3d3520', groundAccent: '#4a4028', wallColor: '#2d2818', wallAccent: '#3a3220', featureColor: '#eab308',
    drawProps(ctx, w, h) { ctx.fillStyle = '#eab308'; ctx.globalAlpha = 0.3; ctx.fillRect(0, h * 0.7, w, h * 0.3); ctx.globalAlpha = 1 } },
  2: { name: 'The Filter Chamber', sky: '#0f0f1a', ground: '#252535', groundAccent: '#2d2d40', wallColor: '#1a1a28', wallAccent: '#222235', featureColor: '#60a5fa',
    drawProps(ctx, w, h) { ctx.fillStyle = '#60a5fa'; ctx.globalAlpha = 0.2; ctx.fillRect(w * 0.2, h * 0.4, 4, h * 0.3); ctx.fillRect(w * 0.6, h * 0.35, 4, h * 0.35); ctx.globalAlpha = 1 } },
  3: { name: 'The Sorting Hall', sky: '#0a0f15', ground: '#1a2530', groundAccent: '#222d3a', wallColor: '#152028', wallAccent: '#1d2835', featureColor: '#a78bfa',
    drawProps(ctx, w, h) { for (let i = 0; i < 5; i++) { ctx.fillStyle = '#3a3a50'; ctx.fillRect(w * 0.1 + i * 20, h * 0.5 - i * 4, 12, 8 + i * 4) } } },
  4: { name: 'The Measurement Vaults', sky: '#0a0a12', ground: '#1a1a2e', groundAccent: '#22223a', wallColor: '#151525', wallAccent: '#1d1d32', featureColor: '#fbbf24',
    drawProps(ctx, w, h) { ctx.strokeStyle = '#fbbf24'; ctx.globalAlpha = 0.3; ctx.lineWidth = 1; ctx.strokeRect(w * 0.3, h * 0.35, 40, 25); ctx.globalAlpha = 1 } },
  5: { name: 'The Guild Records', sky: '#12100a', ground: '#2e2820', groundAccent: '#3a3228', wallColor: '#251f15', wallAccent: '#30281c', featureColor: '#f59e0b',
    drawProps(ctx, w, h) { ctx.fillStyle = '#4a4030'; for (let i = 0; i < 3; i++) { ctx.fillRect(w * 0.2 + i * 30, h * 0.3, 20, 35) } } },
  6: { name: 'The Connection Bridges', sky: '#0a1520', ground: '#1a2a35', groundAccent: '#223340', wallColor: '#152530', wallAccent: '#1d2d3a', featureColor: '#38bdf8',
    drawProps(ctx, w, h) { ctx.fillStyle = '#3a4a5a'; ctx.fillRect(0, h * 0.55, w * 0.3, h * 0.2); ctx.fillRect(w * 0.7, h * 0.55, w * 0.3, h * 0.2); ctx.fillStyle = '#4a5a6a'; ctx.fillRect(w * 0.3, h * 0.6, w * 0.4, 6) } },
  7: { name: 'The Outer Archives', sky: '#0f0a15', ground: '#251a30', groundAccent: '#2d2238', wallColor: '#1a1225', wallAccent: '#22182e', featureColor: '#c084fc',
    drawProps(ctx, w, h) { ctx.fillStyle = '#3a2a4a'; ctx.fillRect(w * 0.3, h * 0.2, 50, 40); ctx.fillStyle = '#c084fc'; ctx.globalAlpha = 0.2; ctx.fillRect(w * 0.32, h * 0.22, 46, 36); ctx.globalAlpha = 1 } },
  8: { name: 'The Inscription Workshop', sky: '#15100a', ground: '#302518', groundAccent: '#3a2d20', wallColor: '#251c12', wallAccent: '#2e2418', featureColor: '#fb923c',
    drawProps(ctx, w, h) { ctx.fillStyle = '#4a3a2a'; ctx.fillRect(w * 0.35, h * 0.45, 35, 20); ctx.fillStyle = '#fb923c'; ctx.globalAlpha = 0.5; ctx.fillRect(w * 0.38, h * 0.42, 4, 5); ctx.globalAlpha = 1 } },
  9: { name: 'The Deep Vaults', sky: '#050508', ground: '#101018', groundAccent: '#151522', wallColor: '#0a0a15', wallAccent: '#0f0f1d', featureColor: '#22d3ee',
    drawProps(ctx, w, h) { ctx.fillStyle = '#22d3ee'; ctx.globalAlpha = 0.15; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.4, 30, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1 } },
  10: { name: 'The Grand Archive', sky: '#08050f', ground: '#18122a', groundAccent: '#201835', wallColor: '#120e20', wallAccent: '#1a1430', featureColor: '#e879f9',
    drawProps(ctx, w, h) { ctx.fillStyle = '#e879f9'; ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.3, 12, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 0.15; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.3, 30, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.3; [[0.1,0.06],[0.25,0.12],[0.75,0.08],[0.9,0.15],[0.5,0.05]].forEach(([sx,sy]) => ctx.fillRect(w*sx, h*sy, 2, 2)); ctx.globalAlpha = 1 } },
}
