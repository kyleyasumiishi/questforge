import { useEffect } from 'react'
import Shell from '../components/Shell/Shell'
import GamePanel from '../components/GamePanel/GamePanel'
import TerminalPanel from '../components/TerminalPanel/TerminalPanel'
import { useGameStore } from '../store/gameStore'
import { sqlMissions } from '../content/missions.sql.js'

const LEVEL_NAMES = {
  1:  'The Surface Layer',
  2:  'The Filter Chamber',
  3:  'The Sorting Hall',
  4:  'The Measurement Vaults',
  5:  'The Guild Records',
  6:  'The Connection Bridges',
  7:  'The Outer Archives',
  8:  'The Inscription Workshop',
  9:  'The Deep Vaults',
  10: 'The Grand Archive',
}

export default function SqlQuestPage() {
  const sql = useGameStore(s => s.sql)
  const setActiveQuest = useGameStore(s => s.setActiveQuest)
  const addToHistory = useGameStore(s => s.addToHistory)
  const submitSqlCommand = useGameStore(s => s.submitSqlCommand)
  const jumpToLevel = useGameStore(s => s.jumpToLevel)

  const currentMission = sqlMissions[sql.currentMission]
  const activeLevel = currentMission?.level ?? sql.unlockedLevels[sql.unlockedLevels.length - 1] ?? 1
  const levelName = LEVEL_NAMES[activeLevel] ?? 'The Grand Archive'

  useEffect(() => {
    setActiveQuest('sql')
  }, [])

  useEffect(() => {
    const alreadySeeded = localStorage.getItem('questforge-sql-seeded')
    if (sql.terminalHistory.length === 0 && !alreadySeeded) {
      localStorage.setItem('questforge-sql-seeded', '1')
      const first = sqlMissions[0]
      addToHistory('sql', [
        { type: 'info', text: '════════════════════════════════════════' },
        { type: 'info', text: 'SQLQuest: The Buried City' },
        { type: 'info', text: '════════════════════════════════════════' },
        { type: 'output', text: 'You are an Archaeologist arriving at a vast desert excavation site.' },
        { type: 'output', text: 'Beneath the sand lies Queryra — an ancient city whose entire history' },
        { type: 'output', text: 'was encoded into stone tablets arranged in perfect grids.' },
        { type: 'info', text: '"The city speaks only to those who ask the right questions."' },
        { type: 'output', text: '' },
        { type: 'output', text: first.narrative },
        { type: 'info', text: `${first.npcName}: "${first.npcLine}"` },
        { type: 'path', text: `  ▶  ${first.command}` },
      ])
    }
  }, [])

  return (
    <Shell
      questTitle="SQLQuest: The Buried City"
      currentLevelNum={activeLevel}
      currentLevelName={levelName}
      xp={sql.xp}
      level={sql.level}
      missionsCompleted={sql.completedMissions.length}
      commandsLearned={sql.openCodexKeys.length}
      totalLevels={10}
      unlockedLevels={sql.unlockedLevels}
      activeLevel={activeLevel}
      onSelectLevel={num => jumpToLevel('sql', num, sqlMissions)}
    >
      <GamePanel
        levelName={levelName}
        npcName={currentMission?.npcName ?? 'The Veteran Excavator'}
        npcLine={currentMission?.npcLine ?? ''}
      />
      <TerminalPanel
        history={sql.terminalHistory}
        onSubmit={submitSqlCommand}
        prompt="queryra>"
        quest="sql"
      />
    </Shell>
  )
}
