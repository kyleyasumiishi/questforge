import { useState } from 'react'
import Shell from '../components/Shell/Shell'
import GamePanel from '../components/GamePanel/GamePanel'
import TerminalPanel from '../components/TerminalPanel/TerminalPanel'

const SAMPLE_HISTORY = [
  { type: 'info', text: 'Welcome to GitQuest: The Repo Chronicles' },
  { type: 'info', text: 'The elder points to the cave floor. "Before you can track anything, you must consecrate this ground."' },
  { type: 'output', text: 'Type your first command to begin...' },
  { type: 'command', text: 'git init' },
  { type: 'success', text: 'Initialized empty Git repository — the sanctum awakens.' },
  { type: 'codex-block', codexKey: 'git-init' },
]

export default function GitQuestPage() {
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
      questTitle="GitQuest: The Repo Chronicles"
      currentLevelNum={1}
      currentLevelName="The Empty Cave"
      xp={40}
      level={1}
      missionsCompleted={1}
      commandsLearned={1}
      totalLevels={10}
      unlockedLevels={[1]}
      activeLevel={1}
    >
      <GamePanel
        levelName="The Empty Cave"
        npcName="The Elder"
        npcLine="Before you can track anything, you must consecrate this ground."
      />
      <TerminalPanel
        history={history}
        onSubmit={handleSubmit}
        prompt="~/quest-repo (main) $"
        quest="git"
      />
    </Shell>
  )
}
