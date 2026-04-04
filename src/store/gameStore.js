import { create } from 'zustand'
import { loadSave, persistSave } from './persistence'

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
}

const saved = loadSave()

export const useGameStore = create((set, get) => ({
  activeQuest: saved.activeQuest ?? null,

  git: { ...defaultQuestState, ...saved.git },
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

  awardXp(quest, amount) {
    set(state => {
      const xp = state[quest].xp + amount
      const level = levelForXp(xp)
      return { [quest]: { ...state[quest], xp, level } }
    })
    persistSave(get())
  },

  completeMission(quest, missionId) {
    set(state => {
      const q = state[quest]
      const completedMissions = q.completedMissions.includes(missionId)
        ? q.completedMissions
        : [...q.completedMissions, missionId]
      return { [quest]: { ...q, completedMissions, currentMission: q.currentMission + 1 } }
    })
    persistSave(get())
  },

  unlockLevel(quest, levelNum) {
    set(state => {
      const q = state[quest]
      const unlockedLevels = q.unlockedLevels.includes(levelNum)
        ? q.unlockedLevels
        : [...q.unlockedLevels, levelNum].sort((a, b) => a - b)
      return { [quest]: { ...q, unlockedLevels } }
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
    set({ [quest]: { ...defaultQuestState } })
    persistSave(get())
  },
}))
