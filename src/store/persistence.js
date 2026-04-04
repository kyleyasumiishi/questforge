const SAVE_KEY = 'questforge-save'
const SAVE_VERSION = 1

let debounceTimer = null

export function persistSave(state) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    try {
      const payload = {
        version: SAVE_VERSION,
        activeQuest: state.activeQuest,
        git: {
          currentMission: state.git.currentMission,
          completedMissions: state.git.completedMissions,
          unlockedLevels: state.git.unlockedLevels,
          xp: state.git.xp,
          level: state.git.level,
          openCodexKeys: state.git.openCodexKeys,
          terminalHistory: state.git.terminalHistory.slice(-100),
        },
        sql: {
          currentMission: state.sql.currentMission,
          completedMissions: state.sql.completedMissions,
          unlockedLevels: state.sql.unlockedLevels,
          xp: state.sql.xp,
          level: state.sql.level,
          openCodexKeys: state.sql.openCodexKeys,
          terminalHistory: state.sql.terminalHistory.slice(-100),
        },
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
    } catch (e) {
      console.warn('QuestForge: failed to persist save', e)
    }
  }, 500)
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed.version !== SAVE_VERSION) return {}
    return parsed
  } catch (e) {
    return {}
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY)
}
