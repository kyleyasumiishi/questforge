import { create } from 'zustand'
import { loadSave, persistSave } from './persistence'
import { evaluateGitCommand } from '../engines/gitEngine'
import { defaultGitState } from './gitStore'
import { gitMissions } from '../content/missions.git.js'

const XP_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1800]

function levelForXp(xp) {
  let level = 1
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) level = i + 1
    else break
  }
  return Math.min(level, XP_THRESHOLDS.length)
}

const defaultQuestState = {
  currentMission: 0,
  completedMissions: [],
  unlockedLevels: [1],
  xp: 0,
  level: 1,
  terminalHistory: [],
  openCodexKeys: [],
  failedAttempts: {},   // missionId → count
  gitState: { ...defaultGitState },
}

const saved = loadSave()

export const useGameStore = create((set, get) => ({
  activeQuest: saved.activeQuest ?? null,

  git: {
    ...defaultQuestState,
    ...saved.git,
    gitState: { ...defaultGitState, ...(saved.git?.gitState ?? {}) },
    failedAttempts: saved.git?.failedAttempts ?? {},
  },
  sql: { ...defaultQuestState, ...saved.sql },

  setActiveQuest(quest) {
    set({ activeQuest: quest })
    persistSave(get())
  },

  addToHistory(quest, entries) {
    set(state => {
      const history = [...state[quest].terminalHistory, ...entries].slice(-100)
      return { [quest]: { ...state[quest], terminalHistory: history } }
    })
    persistSave(get())
  },

  submitGitCommand(input) {
    const state = get()
    const q = state.git
    const result = evaluateGitCommand(input, q.gitState, q.currentMission)

    const mission = gitMissions[q.currentMission]
    const missionId = mission?.id ?? `git-mission-${q.currentMission}`

    // Always echo the command
    const newEntries = [{ type: 'command', text: input }]

    if (result.success) {
      // Output lines
      result.output.forEach(line => newEntries.push({ type: 'success', text: line }))

      // Narrative / NPC line
      if (mission?.narrative) {
        newEntries.push({ type: 'info', text: mission.narrative })
      }
      if (mission?.npcLine) {
        newEntries.push({ type: 'info', text: `${mission.npcName}: "${mission.npcLine}"` })
      }

      // Codex unlock
      if (result.codexKey) {
        newEntries.push({ type: 'codex-block', codexKey: result.codexKey })
      }

      // XP award line
      if (result.xp) {
        newEntries.push({ type: 'info', text: `+${result.xp} XP` })
      }

      const newXp = q.xp + (result.xp ?? 0)
      const newLevel = levelForXp(newXp)
      const newMission = q.currentMission + 1
      const nextMission = gitMissions[newMission]

      // Check if next mission is a new level
      const newUnlockedLevels = nextMission && !q.unlockedLevels.includes(nextMission.level)
        ? [...q.unlockedLevels, nextMission.level].sort((a, b) => a - b)
        : q.unlockedLevels

      // Level-up notification
      if (newLevel > q.level) {
        newEntries.push({ type: 'success', text: `⬆ Level up! You are now ${newLevel > 1 ? ['', 'Apprentice', 'Journeyman', 'Adept', 'Veteran', 'Master', 'Lorekeeper'][newLevel] : 'Newcomer'}` })
      }

      // Next mission prompt
      if (nextMission) {
        newEntries.push({ type: 'output', text: '' })
        newEntries.push({ type: 'output', text: nextMission.narrative })
        newEntries.push({ type: 'info', text: `${nextMission.npcName}: "${nextMission.npcLine}"` })
      }

      const completedMissions = q.completedMissions.includes(missionId)
        ? q.completedMissions
        : [...q.completedMissions, missionId]

      const openCodexKeys = result.codexKey && !q.openCodexKeys.includes(result.codexKey)
        ? [...q.openCodexKeys, result.codexKey]
        : q.openCodexKeys

      const newFailedAttempts = { ...q.failedAttempts }
      delete newFailedAttempts[missionId]

      set({
        git: {
          ...q,
          terminalHistory: [...q.terminalHistory, ...newEntries].slice(-100),
          currentMission: newMission,
          completedMissions,
          xp: newXp,
          level: newLevel,
          unlockedLevels: newUnlockedLevels,
          openCodexKeys,
          failedAttempts: newFailedAttempts,
          gitState: result.newGitState,
        },
      })
    } else {
      // Failed attempt
      const failCount = (q.failedAttempts[missionId] ?? 0) + 1
      const newFailedAttempts = { ...q.failedAttempts, [missionId]: failCount }

      // Output error
      result.output.forEach(line => newEntries.push({ type: 'error', text: line }))

      // Show hint after 2 failures, auto-show after 4
      if (failCount >= 2 && mission?.hint && !result.isInfo) {
        newEntries.push({ type: 'info', text: `  ✦ hint: ${mission.hint}` })
      }

      set({
        git: {
          ...q,
          terminalHistory: [...q.terminalHistory, ...newEntries].slice(-100),
          failedAttempts: newFailedAttempts,
        },
      })
    }

    persistSave(get())
  },

  addToHistory(quest, entries) {
    set(state => {
      const history = [...state[quest].terminalHistory, ...entries].slice(-100)
      return { [quest]: { ...state[quest], terminalHistory: history } }
    })
    persistSave(get())
  },

  openCodex(quest, key) {
    set(state => {
      const q = state[quest]
      const openCodexKeys = q.openCodexKeys.includes(key)
        ? q.openCodexKeys
        : [...q.openCodexKeys, key]
      return { [quest]: { ...q, openCodexKeys } }
    })
    persistSave(get())
  },

  resetQuest(quest) {
    set({
      [quest]: {
        ...defaultQuestState,
        gitState: quest === 'git' ? { ...defaultGitState } : undefined,
      },
    })
    persistSave(get())
  },
}))
