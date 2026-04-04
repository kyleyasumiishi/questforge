import { useState } from 'react'

const CONFLICT_CONTENT = `# hero.cfg
<<<<<<< HEAD
armor = dragon_scale
weapon = iron_sword
=======
armor = leather
weapon = dragon_slayer
>>>>>>> dragon-quest
class = Wanderer
level = 5`

const RESOLVED_CONTENT = `# hero.cfg
armor = dragon_scale
weapon = dragon_slayer
class = Wanderer
level = 5`

export default function ConflictEditor({ onResolve }) {
  const [content, setContent] = useState(CONFLICT_CONTENT)
  const [error, setError] = useState('')

  function handleResolve() {
    const hasMarkers =
      content.includes('<<<<<<<') ||
      content.includes('=======') ||
      content.includes('>>>>>>>')

    if (hasMarkers) {
      setError('Conflict markers still present. Remove all <<<<<<<, =======, and >>>>>>> lines.')
      return
    }

    setError('')
    onResolve()
  }

  function handleAutoResolve() {
    setContent(RESOLVED_CONTENT)
    setError('')
  }

  return (
    <div className="my-2 border border-red-900 rounded bg-zinc-900/80 overflow-hidden text-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-red-950/50 border-b border-red-900">
        <span className="text-red-400 text-xs font-mono">⚡ CONFLICT: hero.cfg</span>
        <button
          onClick={handleAutoResolve}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          auto-resolve (keep both)
        </button>
      </div>

      <textarea
        value={content}
        onChange={e => { setContent(e.target.value); setError('') }}
        className="w-full bg-zinc-950 text-zinc-300 text-xs font-mono p-3 resize-none outline-none border-none leading-relaxed"
        rows={12}
        spellCheck={false}
      />

      {error && (
        <div className="px-3 py-1 text-red-400 text-xs border-t border-red-900">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-800">
        <span className="text-zinc-600 text-xs">
          Remove all &lt;&lt;&lt;, ===, &gt;&gt;&gt; markers to resolve
        </span>
        <button
          onClick={handleResolve}
          className="px-3 py-1 text-xs bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors"
        >
          Resolved ✓
        </button>
      </div>
    </div>
  )
}
