import { useEffect } from 'react'
import Shell from '../components/Shell/Shell'
import GamePanel from '../components/GamePanel/GamePanel'
import TerminalPanel from '../components/TerminalPanel/TerminalPanel'
import { useGameStore } from '../store/gameStore'

export default function GitQuestPage() {
  const git = useGameStore(s => s.git)
  const setActiveQuest = useGameStore(s => s.setActiveQuest)
  const addToHistory = useGameStore(s => s.addToHistory)

  useEffect(() => {
    setActiveQuest('git')
    if (git.terminalHistory.length === 0) {
      addToHistory('git', [
        { type: 'info', text: 'Welcome to GitQuest: The Repo Chronicles' },
        { type: 'info', text: 'The elder points to the cave floor. "Before you can track anything, you must consecrate this ground."' },
        { type: 'output', text: 'Type your first command to begin...' },
      ])
    }
  }, [])

  function handleSubmit(input) {
    addToHistory('git', [
      { type: 'command', text: input },
      { type: 'output', text: `(engine not yet wired — you typed: ${input})` },
    ])
  }

  const activeLevel = git.unlockedLevels[git.unlockedLevels.length - 1] ?? 1

  return (
    <Shell
      questTitle="GitQuest: The Repo Chronicles"
      currentLevelNum={activeLevel}
      currentLevelName="The Empty Cave"
      xp={git.xp}
      level={git.level}
      missionsCompleted={git.completedMissions.length}
      commandsLearned={git.openCodexKeys.length}
      totalLevels={10}
      unlockedLevels={git.unlockedLevels}
      activeLevel={activeLevel}
    >
      <GamePanel
        levelName="The Empty Cave"
        npcName="The Elder"
        npcLine="Before you can track anything, you must consecrate this ground."
      />
      <TerminalPanel
        history={git.terminalHistory}
        onSubmit={handleSubmit}
        prompt="~/quest-repo (main) $"
        quest="git"
      />
    </Shell>
  )
}
