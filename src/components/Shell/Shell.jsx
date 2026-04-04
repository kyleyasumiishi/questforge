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
  onSelectLevel,
  children,
}) {
  const pct = xpProgress(xp, level)
  const levelTitle = LEVEL_TITLES[level - 1] ?? 'Lorekeeper'

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 h-11 border-b border-zinc-800 shrink-0">
        <span className="text-zinc-400 text-xs uppercase tracking-widest">{questTitle}</span>
        <span className="text-zinc-600 text-xs">·</span>
        <span className="text-zinc-300 text-xs">{currentLevelName}</span>

        <div className="flex-1" />

        {/* XP bar */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-xs">XP</span>
          <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-zinc-400 text-xs">{xp}</span>
        </div>

        <span className="text-zinc-600 text-xs">·</span>
        <span className="text-emerald-400 text-xs font-semibold">Lv {level}</span>
        <span className="text-zinc-500 text-xs">{levelTitle}</span>
      </div>

      {/* Main split */}
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>

      {/* Level strip */}
      <div className="flex items-center gap-1.5 px-4 h-10 border-t border-zinc-800 overflow-x-auto shrink-0">
        <span className="text-zinc-600 text-xs mr-1 shrink-0">Levels</span>
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
              className={[
                'shrink-0 w-7 h-7 rounded text-xs font-mono font-bold transition-colors',
                done ? 'bg-emerald-900 text-emerald-400 hover:bg-emerald-800 cursor-pointer' : '',
                active ? 'bg-emerald-600 text-white' : '',
                !unlocked ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {done ? '✓' : num}
            </button>
          )
        })}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 h-7 bg-zinc-900 border-t border-zinc-800 shrink-0">
        <StatusItem label="Level" value={`${currentLevelNum} — ${currentLevelName}`} />
        <Divider />
        <StatusItem label="XP" value={xp} />
        <Divider />
        <StatusItem label="Missions" value={missionsCompleted} />
        <Divider />
        <StatusItem label="Learned" value={commandsLearned} />
      </div>
    </div>
  )
}

function StatusItem({ label, value }) {
  return (
    <span className="text-xs">
      <span className="text-zinc-600">{label}: </span>
      <span className="text-zinc-400">{value}</span>
    </span>
  )
}

function Divider() {
  return <span className="text-zinc-700 text-xs">·</span>
}
