export default function GamePanel({ levelName = 'The Empty Cave', npcName = 'The Elder', npcLine = '' }) {
  return (
    <div className="flex flex-col w-1/2 bg-zinc-900 shrink-0 overflow-hidden">
      {/* Canvas placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-full h-full border border-zinc-800 rounded flex flex-col items-center justify-center gap-6 bg-zinc-950/50">
          <div className="text-zinc-700 text-xs uppercase tracking-widest">{levelName}</div>

          {/* Sprite placeholder */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-4 h-6 bg-emerald-500 rounded-sm opacity-80" title="Player sprite" />
            <div className="text-zinc-700 text-xs">you</div>
          </div>

          {/* NPC placeholder */}
          {npcLine && (
            <div className="max-w-xs border border-zinc-700 rounded p-3 bg-zinc-900">
              <div className="text-amber-400 text-xs mb-1">{npcName}</div>
              <div className="text-zinc-400 text-xs leading-relaxed">"{npcLine}"</div>
            </div>
          )}

          <div className="text-zinc-800 text-xs">canvas — coming in Phase 7</div>
        </div>
      </div>
    </div>
  )
}
