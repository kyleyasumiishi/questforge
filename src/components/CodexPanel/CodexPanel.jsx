import { useState } from 'react'
import { gitCodex } from '../../content/codex.git.js'
import { sqlCodex } from '../../content/codex.sql.js'
import { gitMissions } from '../../content/missions.git.js'
import { sqlMissions } from '../../content/missions.sql.js'

const TABS = ['ELI5', 'Savvy', 'Man page']
const TAB_KEYS = ['eli5', 'savvy', 'manpage']

// Build a map of level -> unique codex keys (in mission order)
function buildLevelMap(missions) {
  const map = {}
  for (const m of missions) {
    if (!m.codexKey) continue
    if (!map[m.level]) map[m.level] = []
    if (!map[m.level].includes(m.codexKey)) map[m.level].push(m.codexKey)
  }
  return map
}

const GIT_LEVEL_MAP = buildLevelMap(gitMissions)
const SQL_LEVEL_MAP = buildLevelMap(sqlMissions)

const GIT_LEVEL_NAMES = {
  1: 'The Empty Cave', 2: 'The Staging Grounds', 3: 'The Workshop',
  4: 'The Watchtower', 5: 'The Branching Forest', 6: 'The Merge Shrine',
  7: 'The Remote Peaks', 8: 'The Time Vaults', 9: 'The Guild Hall',
  10: 'The Sanctum Spire',
}
const SQL_LEVEL_NAMES = {
  1: 'The Surface Layer', 2: 'The Filter Chamber', 3: 'The Sorting Hall',
  4: 'The Measurement Vaults', 5: 'The Guild Records', 6: 'The Connection Bridges',
  7: 'The Outer Archives', 8: 'The Inscription Workshop', 9: 'The Deep Vaults',
  10: 'The Grand Archive',
}

export default function CodexPanel({ quest = 'git', unlockedKeys = [] }) {
  const codex = quest === 'git' ? gitCodex : sqlCodex
  const levelMap = quest === 'git' ? GIT_LEVEL_MAP : SQL_LEVEL_MAP
  const levelNames = quest === 'git' ? GIT_LEVEL_NAMES : SQL_LEVEL_NAMES
  const [expandedKey, setExpandedKey] = useState(null)
  const [tab, setTab] = useState(0)

  const levels = Object.keys(levelMap).map(Number).sort((a, b) => a - b)

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 shrink-0">
        <span className="text-amber-400 text-xs">✦</span>
        <span className="text-zinc-300 text-xs font-semibold uppercase tracking-wide">Codex</span>
        <span className="text-zinc-600 text-xs">·</span>
        <span className="text-zinc-500 text-xs">{unlockedKeys.length} commands learned</span>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto terminal-scroll">
        {levels.map(level => {
          const keys = levelMap[level]
          const anyUnlocked = keys.some(k => unlockedKeys.includes(k))
          if (!anyUnlocked) return null

          return (
            <div key={level}>
              {/* Level header */}
              <div className="sticky top-0 z-10 px-4 py-1.5 bg-zinc-900 border-b border-zinc-800/50">
                <span className="text-zinc-500 text-xs">Lv {level}</span>
                <span className="text-zinc-700 text-xs mx-1.5">·</span>
                <span className="text-zinc-400 text-xs">{levelNames[level]}</span>
              </div>

              {/* Commands */}
              {keys.map(key => {
                const entry = codex[key]
                if (!entry) return null
                const unlocked = unlockedKeys.includes(key)
                const isExpanded = expandedKey === key

                if (!unlocked) return (
                  <div key={key} className="px-4 py-2 border-b border-zinc-800/30">
                    <span className="text-zinc-700 text-xs">???</span>
                  </div>
                )

                return (
                  <div key={key} className="border-b border-zinc-800/30">
                    <button
                      onClick={() => {
                        setExpandedKey(isExpanded ? null : key)
                        setTab(0)
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-zinc-800/30 transition-colors"
                    >
                      <span className="text-emerald-500 text-xs">✓</span>
                      <span className="text-zinc-200 text-xs font-mono">{entry.command}</span>
                      <span className="flex-1" />
                      <span className="text-zinc-700 text-xs">{isExpanded ? '▾' : '▸'}</span>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-3">
                        {/* Tabs */}
                        <div className="flex gap-1 mb-2">
                          {TABS.map((label, i) => (
                            <button
                              key={i}
                              onClick={() => setTab(i)}
                              className={[
                                'px-2.5 py-1 rounded text-xs transition-colors',
                                tab === i
                                  ? 'bg-amber-400/15 text-amber-400'
                                  : 'text-zinc-600 hover:text-zinc-400',
                              ].join(' ')}
                            >
                              {label}
                            </button>
                          ))}
                        </div>

                        {/* Content */}
                        <div className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">
                          {entry[TAB_KEYS[tab]]}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}

        {unlockedKeys.length === 0 && (
          <div className="px-4 py-8 text-center text-zinc-600 text-xs">
            Complete missions to unlock codex entries.
          </div>
        )}
      </div>
    </div>
  )
}
