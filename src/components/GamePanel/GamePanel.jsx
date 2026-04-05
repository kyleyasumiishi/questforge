import { useEffect, useRef, useState } from 'react'
import { createRenderer } from '../../canvas/renderer'
import CodexPanel from '../CodexPanel/CodexPanel'

export default function GamePanel({
  levelNum = 1,
  npcName = 'The Elder',
  npcLine = '',
  quest = 'git',
  unlockedKeys = [],
  reaction = null, // { type: 'jump'|'shake'|'celebrate', key: unique }
}) {
  const canvasRef = useRef(null)
  const rendererRef = useRef(null)
  const [view, setView] = useState('canvas') // 'canvas' | 'codex'

  // Initialize renderer once
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = createRenderer(canvas, quest)
    rendererRef.current = renderer
    renderer.start()

    const handleResize = () => renderer.resize()
    window.addEventListener('resize', handleResize)

    const ro = new ResizeObserver(handleResize)
    ro.observe(canvas.parentElement)

    return () => {
      renderer.stop()
      window.removeEventListener('resize', handleResize)
      ro.disconnect()
    }
  }, [quest])

  // Update renderer when props change
  useEffect(() => {
    rendererRef.current?.update({ level: levelNum, npc: npcName, line: npcLine })
  }, [levelNum, npcName, npcLine])

  // Trigger reaction animation
  useEffect(() => {
    if (reaction?.type) rendererRef.current?.react(reaction.type)
  }, [reaction?.key])

  return (
    <div className="flex flex-col w-full h-full bg-zinc-900 overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-zinc-800 shrink-0">
        <button
          onClick={() => setView('canvas')}
          className={[
            'px-4 py-1.5 text-xs transition-colors',
            view === 'canvas'
              ? 'text-zinc-200 border-b-2 border-emerald-500 -mb-px'
              : 'text-zinc-600 hover:text-zinc-400',
          ].join(' ')}
        >
          World
        </button>
        <button
          onClick={() => setView('codex')}
          className={[
            'px-4 py-1.5 text-xs transition-colors',
            view === 'codex'
              ? 'text-amber-400 border-b-2 border-amber-400 -mb-px'
              : 'text-zinc-600 hover:text-zinc-400',
          ].join(' ')}
        >
          Codex ✦
        </button>
      </div>

      {/* Content — canvas stays mounted to preserve renderer */}
      <div className={`flex-1 relative ${view === 'canvas' ? '' : 'hidden'}`}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      {view === 'codex' && (
        <CodexPanel quest={quest} unlockedKeys={unlockedKeys} />
      )}
    </div>
  )
}
