import { useState } from 'react'

const TABS = ['ELI5', 'Savvy', 'Man page']
const TAB_KEYS = ['eli5', 'savvy', 'manpage']

// Placeholder data — replaced by real codex imports in Phase 4
const SAMPLE = {
  command: 'git add .',
  eli5: 'Think of git add like putting things into a shopping cart before you check out. You\'re not buying yet — you\'re just saying "yes, I want these changes in my next save." The dot means grab everything.',
  savvy: 'Moves all changes from the working directory into the index (staging area). The `.` recursively stages all modified and untracked files in the current directory.',
  manpage: '`git add [pathspec]` — update the index. `.` adds all. `-p` interactive patch mode. `-u` update tracked files only. `-A` stage all including deletions. `--dry-run` shows what would be staged.',
}

export default function Codex({ codexKey, quest = 'git', defaultOpen = false, entry = SAMPLE, xp = 40 }) {
  const [open, setOpen] = useState(defaultOpen)
  const [tab, setTab] = useState(0)

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
