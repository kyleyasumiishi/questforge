import { useEffect, useRef } from 'react'
import { createRenderer } from '../../canvas/renderer'

export default function GamePanel({
  levelNum = 1,
  npcName = 'The Elder',
  npcLine = '',
  quest = 'git',
}) {
  const canvasRef = useRef(null)
  const rendererRef = useRef(null)

  // Initialize renderer once
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = createRenderer(canvas, quest)
    rendererRef.current = renderer
    renderer.start()

    const handleResize = () => renderer.resize()
    window.addEventListener('resize', handleResize)

    // Also observe parent resize (for draggable divider)
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

  return (
    <div className="flex flex-col w-full h-full bg-zinc-900 overflow-hidden">
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  )
}
