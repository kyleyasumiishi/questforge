import { useEffect } from 'react'
import Shell from '../components/Shell/Shell'
import GamePanel from '../components/GamePanel/GamePanel'
import TerminalPanel from '../components/TerminalPanel/TerminalPanel'
import { useGameStore } from '../store/gameStore'

export default function SqlQuestPage() {
  const sql = useGameStore(s => s.sql)
  const setActiveQuest = useGameStore(s => s.setActiveQuest)
  const addToHistory = useGameStore(s => s.addToHistory)

  useEffect(() => {
    setActiveQuest('sql')
    if (sql.terminalHistory.length === 0) {
      addToHistory('sql', [
        { type: 'info', text: 'Welcome to SQLQuest: The Buried City' },
        { type: 'info', text: 'The archaeologist gestures at the sandy floor. "The city is buried beneath us. Let\'s see what\'s here."' },
        { type: 'output', text: 'Type your first query to begin...' },
      ])
    }
  }, [])

  function handleSubmit(input) {
    addToHistory('sql', [
      { type: 'command', text: input },
      { type: 'output', text: `(engine not yet wired — you typed: ${input})` },
    ])
  }

  const activeLevel = sql.unlockedLevels[sql.unlockedLevels.length - 1] ?? 1

  return (
    <Shell
      questTitle="SQLQuest: The Buried City"
      currentLevelNum={activeLevel}
      currentLevelName="The Surface Layer"
      xp={sql.xp}
      level={sql.level}
      missionsCompleted={sql.completedMissions.length}
      commandsLearned={sql.openCodexKeys.length}
      totalLevels={10}
      unlockedLevels={sql.unlockedLevels}
      activeLevel={activeLevel}
    >
      <GamePanel
        levelName="The Surface Layer"
        npcName="The Archaeologist"
        npcLine="The city is buried beneath us. Let's see what's here."
      />
      <TerminalPanel
        history={sql.terminalHistory}
        onSubmit={handleSubmit}
        prompt="sql>"
        quest="sql"
      />
    </Shell>
  )
}
