import { useEffect, useRef, useState, memo } from 'react'
import Codex from '../Codex/Codex'
import ConflictEditor from '../ConflictEditor/ConflictEditor'

const CHAR_DELAY = 10 // ms per character

const TypewriterText = memo(function TypewriterText({ text, onDone }) {
  const [len, setLen] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    if (!text) { onDone?.(); return }
    startRef.current = performance.now()

    function tick(now) {
      const elapsed = now - startRef.current
      const chars = Math.floor(elapsed / CHAR_DELAY)
      if (chars >= text.length) {
        setLen(text.length)
        onDone?.()
        return
      }
      setLen(chars)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [text])

  return <>{text.slice(0, len)}</>
})

const TYPE_STYLES = {
  command: 'text-zinc-100',
  output:  'text-zinc-400',
  success: 'text-emerald-400',
  error:   'text-red-400',
  info:    'text-amber-400',
  path:    'text-purple-400',
  hint:    'text-cyan-400',
}

export default function TerminalPanel({
  history = [],
  onSubmit,
  onResolveConflict,
  prompt = '$',
  shortPrompt = '$',
  disabled = false,
  quest = 'git',
}) {
  const [input, setInput] = useState('')
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [twDone, setTwDone] = useState(new Set())
  const bottomRef = useRef(null)
  const scrollAreaRef = useRef(null)
  const inputRef = useRef(null)
  const prevLenRef = useRef(history.length)
  const newStartRef = useRef(history.length)

  // When history grows, mark new entries as animatable
  if (history.length > prevLenRef.current) {
    newStartRef.current = prevLenRef.current
    prevLenRef.current = history.length
  } else if (history.length < prevLenRef.current) {
    newStartRef.current = 0
    prevLenRef.current = history.length
  }

  // Collect past commands for up-arrow history
  const pastCommands = history
    .filter(e => e.type === 'command')
    .map(e => e.text)
    .reverse()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history.length])

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
      className="flex flex-col w-full h-full bg-zinc-950 overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Scrollable history */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto terminal-scroll p-2 md:p-4 space-y-0.5 text-xs md:text-sm leading-relaxed">
        {history.map((entry, i) => {
          if (entry.clearMarker) {
            return (
              <div key={i} className={TYPE_STYLES[entry.type] ?? 'text-zinc-400'}>
                {entry.text}
              </div>
            )
          }
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
          if (entry.type === 'level-complete') {
            return (
              <div key={i} className="text-emerald-300 font-bold text-center py-2 animate-pulse">
                {entry.text}
              </div>
            )
          }
          const isNew = i >= newStartRef.current
          const canAnimate = isNew && entry.typewriter && !twDone.has(i)

          return (
            <div
              key={i}
              className={TYPE_STYLES[entry.type] ?? 'text-zinc-400'}
            >
              {entry.type === 'command' && (
                <span className="text-zinc-600 select-none mr-2">$</span>
              )}
              {canAnimate ? (
                <TypewriterText
                  text={entry.text}
                  onDone={() => setTwDone(s => new Set(s).add(i))}
                />
              ) : (
                entry.text
              )}
            </div>
          )
        })}
        {/* After a /clear, add a spacer so the mission context sits at the top.
            Only show if the last clear marker is within the last 10 entries (still "active"). */}
        {(() => {
          for (let i = history.length - 1; i >= Math.max(0, history.length - 10); i--) {
            if (history[i]?.clearMarker) return (
              <div key="clear-spacer" style={{ minHeight: (scrollAreaRef.current?.clientHeight ?? 400) - 100 }} />
            )
          }
          return null
        })()}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-3 border-t border-zinc-800 shrink-0">
        <span className="text-zinc-600 text-xs md:text-sm select-none whitespace-nowrap">
          <span className="hidden md:inline">{prompt}</span>
          <span className="md:hidden">{shortPrompt}</span>
        </span>
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
          className="flex-1 bg-transparent text-zinc-100 text-xs md:text-sm outline-none caret-emerald-400 disabled:opacity-40"
        />
      </div>
    </div>
  )
}
