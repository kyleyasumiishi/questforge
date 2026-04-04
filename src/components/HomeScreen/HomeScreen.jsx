import { Link } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import { clearSave } from '../../store/persistence'

export default function HomeScreen() {
  const git = useGameStore(s => s.git)
  const sql = useGameStore(s => s.sql)
  const resetQuest = useGameStore(s => s.resetQuest)

  const gitProgress = git.completedMissions.length > 0 ? {
    level: git.unlockedLevels[git.unlockedLevels.length - 1] ?? 1,
    mission: git.completedMissions.length,
  } : null

  const sqlProgress = sql.completedMissions.length > 0 ? {
    level: sql.unlockedLevels[sql.unlockedLevels.length - 1] ?? 1,
    mission: sql.completedMissions.length,
  } : null

  function handleReset(quest) {
    resetQuest(quest)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 gap-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-zinc-100 tracking-tight">QuestForge</h1>
        <p className="text-zinc-500 mt-2 text-sm">Learn developer tools through narrative RPG adventures</p>
      </div>

      <div className="flex gap-6">
        <QuestCard
          title="GitQuest"
          subtitle="The Repo Chronicles"
          description="52 missions · 10 levels · Core Git"
          href="/gitquest"
          accent="text-emerald-400"
          border="border-emerald-800 hover:border-emerald-500"
          progress={gitProgress}
          onReset={() => handleReset('git')}
        />
        <QuestCard
          title="SQLQuest"
          subtitle="The Buried City"
          description="53 missions · 10 levels · Core SQL"
          href="/sqlquest"
          accent="text-amber-400"
          border="border-amber-800 hover:border-amber-500"
          progress={sqlProgress}
          onReset={() => handleReset('sql')}
        />
      </div>
    </div>
  )
}

function QuestCard({ title, subtitle, description, href, accent, border, progress, onReset }) {
  return (
    <div className={`flex flex-col gap-3 w-64 p-6 rounded-lg border bg-zinc-900 ${border}`}>
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
