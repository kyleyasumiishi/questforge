import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import { createStars, drawStars, createDust, drawDust } from '../../canvas/particles'

export default function HomeScreen() {
  const git = useGameStore(s => s.git)
  const sql = useGameStore(s => s.sql)
  const resetQuest = useGameStore(s => s.resetQuest)
  const exportSave = useGameStore(s => s.exportSave)
  const importSave = useGameStore(s => s.importSave)
  const fileRef = useRef(null)
  const canvasRef = useRef(null)
  const [importMsg, setImportMsg] = useState(null)

  // Ambient background canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const stars = createStars(40, 99)
    const dust = createDust(15, 98)
    const startTime = Date.now()
    let animId

    function resize() {
      canvas.width = canvas.parentElement.clientWidth
      canvas.height = canvas.parentElement.clientHeight
    }

    function frame() {
      const w = canvas.width
      const h = canvas.height
      if (w === 0) { animId = requestAnimationFrame(frame); return }
      const t = (Date.now() - startTime) / 1000

      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#050510')
      grad.addColorStop(0.7, '#0a0a18')
      grad.addColorStop(1, '#151528')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Ground tiles
      const groundY = h * 0.82
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, groundY, w, h - groundY)
      ctx.fillStyle = '#22223a'
      ctx.fillRect(0, groundY - 1, w, 1)
      for (let x = 0; x < w; x += 16) {
        for (let y = groundY; y < h; y += 16) {
          if ((Math.floor(x / 16) + Math.floor(y / 16)) % 2 === 0) {
            ctx.fillStyle = '#151525'
            ctx.fillRect(x, y, 16, 16)
          }
        }
      }

      drawStars(ctx, stars, w, h, t)
      drawDust(ctx, dust, w, h, t, '#4a4a6a')

      animId = requestAnimationFrame(frame)
    }

    resize()
    frame()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const gitProgress = git.completedMissions.length > 0 ? {
    level: git.unlockedLevels[git.unlockedLevels.length - 1] ?? 1,
    mission: git.completedMissions.length,
  } : null

  const sqlProgress = sql.completedMissions.length > 0 ? {
    level: sql.unlockedLevels[sql.unlockedLevels.length - 1] ?? 1,
    mission: sql.completedMissions.length,
  } : null

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so the same file can be re-selected
    e.target.value = ''

    if (!confirm('This will replace your current save. Continue?')) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = importSave(reader.result)
      if (result.ok) {
        setImportMsg({ type: 'success', text: 'Save imported successfully!' })
      } else {
        setImportMsg({ type: 'error', text: result.error })
      }
      setTimeout(() => setImportMsg(null), 4000)
    }
    reader.readAsText(file)
  }

  return (
    <div className="relative h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8 md:gap-12 px-4">
      <div className="text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-zinc-100 tracking-tight">QuestForge</h1>
        <p className="text-zinc-500 mt-2 text-xs md:text-sm">Learn developer tools through narrative RPG adventures</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-lg md:max-w-none md:w-auto">
        <QuestCard
          title="GitQuest"
          subtitle="The Repo Chronicles"
          description="52 missions · 10 levels · Core Git"
          href="/gitquest"
          accent="text-emerald-400"
          border="border-emerald-800 hover:border-emerald-500"
          progress={gitProgress}
          onReset={() => resetQuest('git')}
        />
        <QuestCard
          title="SQLQuest"
          subtitle="The Buried City"
          description="53 missions · 10 levels · Core SQL"
          href="/sqlquest"
          accent="text-amber-400"
          border="border-amber-800 hover:border-amber-500"
          progress={sqlProgress}
          onReset={() => resetQuest('sql')}
        />
      </div>

      {/* Export / Import */}
      <div className="flex items-center gap-3">
        <button
          onClick={exportSave}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Export save
        </button>
        <span className="text-zinc-800 text-xs">·</span>
        <button
          onClick={() => fileRef.current?.click()}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Import save
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* Import feedback */}
      {importMsg && (
        <div className={`text-xs ${importMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {importMsg.text}
        </div>
      )}
    </div>
    </div>
  )
}

function QuestCard({ title, subtitle, description, href, accent, border, progress, onReset }) {
  return (
    <div className={`flex flex-col gap-3 w-full md:w-64 p-5 md:p-6 rounded-lg border bg-zinc-900 ${border}`}>
      <div>
        <div className={`text-xl font-bold ${accent}`}>{title}</div>
        <div className="text-zinc-400 text-sm">{subtitle}</div>
      </div>
      <div className="text-zinc-600 text-xs">{description}</div>

      {progress ? (
        <div className="flex flex-col gap-2 mt-2">
          <div className="text-zinc-500 text-xs">
            Level {progress.level} · Mission {progress.mission}
          </div>
          <Link
            to={href}
            className={`text-sm ${accent} hover:underline`}
          >
            Resume →
          </Link>
          <button
            onClick={onReset}
            className="text-xs text-zinc-600 hover:text-zinc-400 text-left"
          >
            Restart from beginning
          </button>
        </div>
      ) : (
        <Link
          to={href}
          className={`text-sm mt-2 ${accent} hover:underline`}
        >
          Begin →
        </Link>
      )}
    </div>
  )
}
