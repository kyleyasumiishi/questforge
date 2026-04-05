import { Link } from 'react-router-dom'

export default function QuestComplete({
  questTitle,
  xp,
  level,
  commandsLearned = [],
  onPlayAgain,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 flex items-center justify-center">
      <div className="max-w-lg w-full mx-4 text-center space-y-6">
        {/* Trophy */}
        <div className="text-6xl">🏆</div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-emerald-400">
          Quest Complete!
        </h1>
        <p className="text-zinc-400 text-sm">{questTitle}</p>

        {/* Stats */}
        <div className="flex justify-center gap-4 md:gap-8 py-4">
          <Stat label="Total XP" value={xp} />
          <Stat label="Level" value={level} />
          <Stat label="Commands" value={commandsLearned.length} />
        </div>

        {/* Commands learned */}
        {commandsLearned.length > 0 && (
          <div className="bg-zinc-900 rounded-lg p-4 text-left max-h-48 overflow-y-auto terminal-scroll">
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-2">Commands Learned</p>
            <div className="flex flex-wrap gap-2">
              {commandsLearned.map(key => (
                <span
                  key={key}
                  className="text-xs bg-zinc-800 text-emerald-400 px-2 py-1 rounded font-mono"
                >
                  {key}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4 pt-4">
          <Link
            to="/"
            className="px-6 py-2.5 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition-colors text-sm text-center"
          >
            Return Home
          </Link>
          <button
            onClick={onPlayAgain}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors text-sm font-semibold"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-2xl font-bold text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500 uppercase tracking-wide">{label}</div>
    </div>
  )
}
