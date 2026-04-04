import { useEffect } from 'react'
import Shell from '../components/Shell/Shell'
import GamePanel from '../components/GamePanel/GamePanel'
import TerminalPanel from '../components/TerminalPanel/TerminalPanel'
import { useGameStore } from '../store/gameStore'
import { gitMissions } from '../content/missions.git.js'

const LEVEL_NAMES = {
  1: 'The Empty Cave',
  2: 'The Staging Grounds',
  3: 'The Workshop',
  4: 'The Watchtower',
  5: 'The Branching Forest',
  6: 'The Merge Shrine',
  7: 'The Remote Peaks',
  8: 'The Time Vaults',
  9: 'The Guild Hall',
  10: 'The Sanctum Spire',
}

export default function GitQuestPage() {
  const git = useGameStore(s => s.git)
  const setActiveQuest = useGameStore(s => s.setActiveQuest)
  const addToHistory = useGameStore(s => s.addToHistory)
  const submitGitCommand = useGameStore(s => s.submitGitCommand)
  const resolveGitConflict = useGameStore(s => s.resolveGitConflict)
  const jumpToLevel = useGameStore(s => s.jumpToLevel)

  const currentMission = gitMissions[git.currentMission]
  const activeLevel = currentMission?.level ?? git.unlockedLevels[git.unlockedLevels.length - 1] ?? 1
  const levelName = LEVEL_NAMES[activeLevel] ?? 'The Sanctum Spire'

  useEffect(() => {
    setActiveQuest('git')
  }, [])

  // Seed intro only once — stored in localStorage so StrictMode double-fire is safe
  useEffect(() => {
    const alreadySeeded = localStorage.getItem('questforge-git-seeded')
    if (git.terminalHistory.length === 0 && !alreadySeeded) {
      localStorage.setItem('questforge-git-seeded', '1')
      const first = gitMissions[0]
      addToHistory('git', [
        { type: 'info', text: '════════════════════════════════════════' },
        { type: 'info', text: 'GitQuest: The Repo Chronicles' },
        { type: 'info', text: '════════════════════════════════════════' },
        { type: 'output', text: 'You are a Code Wanderer, newly arrived in the realm of Versia.' },
        { type: 'output', text: 'A dying elder hands you an empty satchel and whispers:' },
        { type: 'info', text: '"Build your archive. The realm depends on it."' },
        { type: 'output', text: '' },
        { type: 'output', text: first.narrative },
        { type: 'info', text: `${first.npcName}: "${first.npcLine}"` },
        { type: 'path', text: `  ▶  ${first.command}` },
      ])
    }
  }, [])

  return (
    <Shell
      questTitle="GitQuest: The Repo Chronicles"
      currentLevelNum={activeLevel}
      currentLevelName={levelName}
      xp={git.xp}
      level={git.level}
      missionsCompleted={git.completedMissions.length}
      commandsLearned={git.openCodexKeys.length}
      totalLevels={10}
      unlockedLevels={git.unlockedLevels}
      activeLevel={activeLevel}
      onSelectLevel={num => jumpToLevel('git', num, gitMissions)}
    >
      <GamePanel
        levelName={levelName}
        npcName={currentMission?.npcName ?? 'The Elder'}
        npcLine={currentMission?.npcLine ?? ''}
      />
      <TerminalPanel
        history={git.terminalHistory}
        onSubmit={submitGitCommand}
        onResolveConflict={resolveGitConflict}
        prompt={`~/quest-repo (${git.gitState?.HEAD ?? 'main'}) $`}
        quest="git"
      />
    </Shell>
  )
}
