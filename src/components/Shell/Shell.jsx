import { Link } from 'react-router-dom'
import { useState, useCallback, useRef, Children } from 'react'
import { isMuted, toggleMute } from '../../audio/sfx'

const XP_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1800]
const LEVEL_TITLES = ['Newcomer', 'Apprentice', 'Journeyman', 'Adept', 'Veteran', 'Master', 'Lorekeeper']

function xpProgress(xp, level) {
  const current = XP_THRESHOLDS[level - 1] ?? 0
  const next = XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1]
  if (level >= LEVEL_TITLES.length) return 100
  return Math.round(((xp - current) / (next - current)) * 100)
}

export default function Shell({
  questTitle = 'QuestForge',
  currentLevelNum = 1,
  currentLevelName = 'The Empty Cave',
  xp = 0,
  level = 1,
  missionsCompleted = 0,
  commandsLearned = 0,
  totalLevels = 10,
  unlockedLevels = [1],
  activeLevel = 1,
  recentlyCompletedLevel = null,
  missionProgress = null, // { current, total }
  onSelectLevel,
  children,
}) {
  const pct = xpProgress(xp, level)
  const levelTitle = LEVEL_TITLES[level - 1] ?? 'Lorekeeper'
  const [splitPct, setSplitPct] = useState(50)
  const [mobilePanel, setMobilePanel] = useState('terminal') // 'world' | 'terminal'
  const [muted, setMuted] = useState(isMuted)
  const containerRef = useRef(null)
  const dragging = useRef(false)

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    dragging.current = true

    const onMouseMove = (e) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      setSplitPct(Math.min(80, Math.max(20, pct)))
    }

    const onMouseUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  const kids = Children.toArray(children)

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 md:gap-4 px-2 md:px-4 h-11 border-b border-zinc-800 shrink-0">
        <Link
          to="/"
          className="text-zinc-600 hover:text-zinc-300 text-xs transition-colors shrink-0"
          title="Back to quest select"
        >
          ← home
        </Link>

        <span className="text-zinc-700 text-xs hidden md:inline">|</span>
        <span className="text-zinc-400 text-xs uppercase tracking-widest hidden md:inline">{questTitle}</span>
        <span className="text-zinc-600 text-xs hidden md:inline">·</span>
        <span className="text-zinc-300 text-xs truncate">{currentLevelName}</span>
        {missionProgress && (
          <span className="text-zinc-600 text-xs shrink-0">
            {missionProgress.current}/{missionProgress.total}
          </span>
        )}

        <div className="flex-1" />

        {/* XP bar */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="text-zinc-500 text-xs hidden md:inline">XP</span>
          <div className="w-16 md:w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-zinc-400 text-xs">{xp}</span>
        </div>

        <span className="text-zinc-600 text-xs hidden md:inline">·</span>
        <span className="text-emerald-400 text-xs font-semibold">Lv {level}</span>
        <span className="text-zinc-500 text-xs hidden md:inline">{levelTitle}</span>

        <button
          onClick={() => setMuted(toggleMute())}
          className="text-zinc-600 hover:text-zinc-300 text-xs transition-colors ml-1"
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Main split — desktop: resizable side-by-side, mobile: tabbed full-width */}
      {/* Desktop */}
      <div ref={containerRef} className="hidden md:flex flex-1 overflow-hidden">
        <div style={{ width: `${splitPct}%` }} className="shrink-0 overflow-hidden">
          {kids[0]}
        </div>
        <div
          onMouseDown={onMouseDown}
          className="w-1 shrink-0 bg-zinc-800 hover:bg-emerald-600 cursor-col-resize transition-colors"
        />
        <div className="flex-1 overflow-hidden">
          {kids[1]}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden flex-1 overflow-hidden">
        <div className={`w-full h-full ${mobilePanel === 'world' ? '' : 'hidden'}`}>
          {kids[0]}
        </div>
        <div className={`w-full h-full ${mobilePanel === 'terminal' ? '' : 'hidden'}`}>
          {kids[1]}
        </div>
      </div>

      {/* Mobile panel toggle */}
      <div className="flex md:hidden border-t border-zinc-800 shrink-0">
        <button
          onClick={() => setMobilePanel('world')}
          className={[
            'flex-1 py-2 text-xs text-center transition-colors',
            mobilePanel === 'world'
              ? 'text-emerald-400 bg-zinc-900'
              : 'text-zinc-600 hover:text-zinc-400',
          ].join(' ')}
        >
          World
        </button>
        <button
          onClick={() => setMobilePanel('terminal')}
          className={[
            'flex-1 py-2 text-xs text-center transition-colors',
            mobilePanel === 'terminal'
              ? 'text-emerald-400 bg-zinc-900'
              : 'text-zinc-600 hover:text-zinc-400',
          ].join(' ')}
        >
          Terminal
        </button>
      </div>

      {/* Level strip */}
      <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-4 h-10 border-t border-zinc-800 overflow-x-auto shrink-0">
        <span className="text-zinc-600 text-xs mr-1 shrink-0 hidden md:inline">Levels</span>
        {Array.from({ length: totalLevels }, (_, i) => {
          const num = i + 1
          const unlocked = unlockedLevels.includes(num)
          const active = num === activeLevel
          const done = unlocked && num < activeLevel

          return (
            <button
              key={num}
              onClick={() => unlocked && onSelectLevel?.(num)}
              disabled={!unlocked}
              title={
                done ? `Jump to Level ${num}` :
                active ? `Level ${num} — current` :
                `Level ${num} — locked`
              }
              className={[
                'shrink-0 w-6 h-6 md:w-7 md:h-7 rounded text-xs font-mono font-bold transition-colors',
                done ? 'bg-emerald-900 text-emerald-400 hover:bg-emerald-800 cursor-pointer' : '',
                active ? 'bg-emerald-600 text-white cursor-default' : '',
                !unlocked ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed' : '',
                num === recentlyCompletedLevel ? 'badge-flash' : '',
              ].join(' ')}
            >
              {done ? '✓' : num}
            </button>
          )
        })}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-2 md:gap-4 px-2 md:px-4 h-7 bg-zinc-900 border-t border-zinc-800 shrink-0">
        <StatusItem label="Lv" value={currentLevelNum} className="md:hidden" />
        <StatusItem label="Level" value={`${currentLevelNum} — ${currentLevelName}`} className="hidden md:inline" />
        <Divider />
        <StatusItem label="XP" value={xp} />
        <span className="hidden md:inline"><Divider /></span>
        <StatusItem label="Missions" value={missionsCompleted} className="hidden md:inline" />
        <span className="hidden md:inline"><Divider /></span>
        <StatusItem label="Learned" value={commandsLearned} className="hidden md:inline" />
        <div className="flex-1" />
        <span className="text-zinc-700 text-xs">auto-saved ✓</span>
      </div>
    </div>
  )
}

function StatusItem({ label, value, className = '' }) {
  return (
    <span className={`text-xs ${className}`}>
      <span className="text-zinc-600">{label}: </span>
      <span className="text-zinc-400">{value}</span>
    </span>
  )
}

function Divider() {
  return <span className="text-zinc-700 text-xs">·</span>
}
