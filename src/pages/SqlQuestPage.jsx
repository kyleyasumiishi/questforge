import { useState } from 'react'
import Shell from '../components/Shell/Shell'
import GamePanel from '../components/GamePanel/GamePanel'
import TerminalPanel from '../components/TerminalPanel/TerminalPanel'

const SAMPLE_HISTORY = [
  { type: 'info', text: 'Welcome to SQLQuest: The Buried City' },
  { type: 'info', text: 'The archaeologist gestures at the sandy floor. "The city is buried beneath us. Let\'s see what\'s here."' },
  { type: 'output', text: 'Type your first query to begin...' },
]

export default function SqlQuestPage() {
  const [history, setHistory] = useState(SAMPLE_HISTORY)

  function handleSubmit(input) {
    setHistory(h => [
      ...h,
      { type: 'command', text: input },
      { type: 'output', text: `(engine not yet wired — you typed: ${input})` },
    ])
  }

  return (
    <Shell
      questTitle="SQLQuest: The Buried City"
      currentLevelNum={1}
      currentLevelName="The Surface Layer"
      xp={0}
      level={1}
      missionsCompleted={0}
      commandsLearned={0}
      totalLevels={10}
      unlockedLevels={[1]}
      activeLevel={1}
    >
      <GamePanel
        levelName="The Surface Layer"
        npcName="The Archaeologist"
        npcLine="The city is buried beneath us. Let's see what's here."
      />
      <TerminalPanel
        history={history}
        onSubmit={handleSubmit}
        prompt="sql>"
        quest="sql"
      />
    </Shell>
  )
}
