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

// ── Export / Import ────────────────────────────────────────────────

const MAX_IMPORT_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_HISTORY_LENGTH = 5000

export function buildExportPayload(state) {
  return {
    version: SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    activeQuest: state.activeQuest,
    git: {
      currentMission: state.git.currentMission,
      completedMissions: state.git.completedMissions,
      unlockedLevels: state.git.unlockedLevels,
      xp: state.git.xp,
      level: state.git.level,
      openCodexKeys: state.git.openCodexKeys,
      terminalHistory: state.git.terminalHistory,
      failedAttempts: state.git.failedAttempts,
      completedVisions: state.git.completedVisions,
      gitState: state.git.gitState,
    },
    sql: {
      currentMission: state.sql.currentMission,
      completedMissions: state.sql.completedMissions,
      unlockedLevels: state.sql.unlockedLevels,
      xp: state.sql.xp,
      level: state.sql.level,
      openCodexKeys: state.sql.openCodexKeys,
      terminalHistory: state.sql.terminalHistory,
      failedAttempts: state.sql.failedAttempts,
      dataset: state.sql.dataset,
    },
  }
}

export function downloadExport(state) {
  const payload = buildExportPayload(state)
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `questforge-save-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function validateImport(raw) {
  if (raw.length > MAX_IMPORT_SIZE) {
    return { ok: false, error: 'File too large (max 5MB)' }
  }

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'Invalid JSON' }
  }

  if (data.version !== SAVE_VERSION) {
    return { ok: false, error: `Incompatible save version (expected ${SAVE_VERSION})` }
  }

  // Validate quest objects exist and have expected types
  for (const quest of ['git', 'sql']) {
    const q = data[quest]
    if (!q || typeof q !== 'object') {
      return { ok: false, error: `Missing ${quest} quest data` }
    }
    if (typeof q.currentMission !== 'number' || q.currentMission < 0) {
      return { ok: false, error: `Invalid ${quest}.currentMission` }
    }
    if (!Array.isArray(q.completedMissions)) {
      return { ok: false, error: `Invalid ${quest}.completedMissions` }
    }
    if (!Array.isArray(q.unlockedLevels)) {
      return { ok: false, error: `Invalid ${quest}.unlockedLevels` }
    }
    if (typeof q.xp !== 'number') {
      return { ok: false, error: `Invalid ${quest}.xp` }
    }
    if (!Array.isArray(q.terminalHistory)) {
      return { ok: false, error: `Invalid ${quest}.terminalHistory` }
    }
    // Cap history length
    if (q.terminalHistory.length > MAX_HISTORY_LENGTH) {
      q.terminalHistory = q.terminalHistory.slice(-MAX_HISTORY_LENGTH)
    }
  }

  return { ok: true, data }
}
