import { useEffect, useRef, useState } from 'react'
import Codex from '../Codex/Codex'
import ConflictEditor from '../ConflictEditor/ConflictEditor'

const TYPE_STYLES = {
  command: 'text-zinc-100',
  output:  'text-zinc-400',
  success: 'text-emerald-400',
  error:   'text-red-400',
  info:    'text-amber-400',
  path:    'text-purple-400',
}

export default function TerminalPanel({
  history = [],
  onSubmit,
  onResolveConflict,
  prompt = '~/quest-repo (main) $',
  disabled = false,
  quest = 'git',
}) {
  const [input, setInput] = useState('')
  const [historyIdx, setHistoryIdx] = useState(-1)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Collect past commands for up-arrow history
  const pastCommands = history
    .filter(e => e.type === 'command')
    .map(e => e.text)
    .reverse()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (!input.trim() || disabled) return
      onSubmit?.(input.trim())
      setInput('')
      setHistoryIdx(-1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(historyIdx + 1, pastCommands.length - 1)
      setHistoryIdx(next)
      setInput(pastCommands[next] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = historyIdx - 1
      if (next < 0) {
        setHistoryIdx(-1)
        setInput('')
      } else {
        setHistoryIdx(next)
        setInput(pastCommands[next] ?? '')
      }
    }
  }

  return (
    <div
      className="flex flex-col flex-1 bg-zinc-950 border-l border-zinc-800 overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Scrollable history */}
      <div className="flex-1 overflow-y-auto terminal-scroll p-4 space-y-0.5 text-sm leading-relaxed">
        {history.map((entry, i) => {
          if (entry.type === 'codex-block') {
            return (
              <Codex
                key={i}
                codexKey={entry.codexKey}
                quest={quest}
                defaultOpen={i === history.length - 1}
              />
            )
          }
          if (entry.type === 'conflict-editor') {
            return (
              <ConflictEditor
                key={i}
                onResolve={onResolveConflict}
              />
            )
          }
          return (
            <div key={i} className={TYPE_STYLES[entry.type] ?? 'text-zinc-400'}>
              {entry.type === 'command' && (
                <span className="text-zinc-600 select-none mr-2">$</span>
              )}
              {entry.text}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-800 shrink-0">
        <span className="text-zinc-600 text-sm select-none whitespace-nowrap">{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="flex-1 bg-transparent text-zinc-100 text-sm outline-none caret-emerald-400 disabled:opacity-40"
        />
      </div>
    </div>
  )
}
