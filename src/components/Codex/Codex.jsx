import { useState } from 'react'
import { gitCodex } from '../../content/codex.git.js'

const TABS = ['ELI5', 'Savvy', 'Man page']
const TAB_KEYS = ['eli5', 'savvy', 'manpage']

const CODEX_SOURCES = {
  git: gitCodex,
  // sql: sqlCodex  — added in Phase 8
}

export default function Codex({ codexKey, quest = 'git', defaultOpen = false, xp = 40 }) {
  const [open, setOpen] = useState(defaultOpen)
  const [tab, setTab] = useState(0)

  const source = CODEX_SOURCES[quest] ?? {}
  const entry = source[codexKey]

  if (!entry) return null

  return (
    <div className="my-2 border border-zinc-800 rounded bg-zinc-900/60 text-sm overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <span className="text-amber-400 text-xs">✦</span>
        <span className="text-zinc-400 text-xs font-mono">{entry.command}</span>
        <span className="flex-1" />
        <span className="text-zinc-600 text-xs">{open ? 'collapse' : 'learn more ✦'}</span>
      </button>

      {open && (
        <div className="border-t border-zinc-800">
          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            {TABS.map((label, i) => (
              <button
                key={i}
                onClick={() => setTab(i)}
                className={[
                  'px-4 py-1.5 text-xs transition-colors',
                  tab === i
                    ? 'text-amber-400 border-b-2 border-amber-400 -mb-px'
                    : 'text-zinc-600 hover:text-zinc-400',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="px-4 py-3 text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">
            {entry[TAB_KEYS[tab]]}
          </div>

          {/* XP note */}
          <div className="px-4 pb-2 text-zinc-600 text-xs">
            +{xp} XP earned for learning this command
          </div>
        </div>
      )}
    </div>
  )
}
