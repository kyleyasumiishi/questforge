import { create } from 'zustand'
import { loadSave, persistSave } from './persistence'
import { evaluateGitCommand, resolveConflict } from '../engines/gitEngine'
import { defaultGitState } from './gitStore'
import { gitMissions } from '../content/missions.git.js'

const XP_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1800]
const LEVEL_TITLES = ['Newcomer', 'Apprentice', 'Journeyman', 'Adept', 'Veteran', 'Master', 'Lorekeeper']

// Vision mission IDs — the three reset variants shown as a trio
const VISION_IDS = ['git-mission-47', 'git-mission-48', 'git-mission-49']

function levelForXp(xp) {
  let level = 1
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) level = i + 1
    else break
  }
  return Math.min(level, XP_THRESHOLDS.length)
}

function buildSuccessEntries(mission, result, q, nextMission, newLevel) {
  const entries = []

  result.output.forEach(line => entries.push({ type: 'success', text: line }))

  if (mission?.narrative) {
    entries.push({ type: 'info', text: mission.narrative })
  }
  if (mission?.npcLine) {
    entries.push({ type: 'info', text: `${mission.npcName}: "${mission.npcLine}"` })
  }
  if (result.codexKey) {
    entries.push({ type: 'codex-block', codexKey: result.codexKey })
  }
  if (result.xp) {
    entries.push({ type: 'info', text: `+${result.xp} XP` })
  }
  if (newLevel > q.level) {
    entries.push({
      type: 'success',
      text: `⬆ Level up! You are now Lv ${newLevel} — ${LEVEL_TITLES[newLevel - 1] ?? 'Lorekeeper'}`,
    })
  }
  if (nextMission) {
    entries.push({ type: 'output', text: '' })
    entries.push({ type: 'output', text: nextMission.narrative })
    entries.push({ type: 'info', text: `${nextMission.npcName}: "${nextMission.npcLine}"` })
    if (nextMission.specialType === 'conflict') {
      entries.push({ type: 'conflict-editor' })
    } else {
      entries.push({ type: 'path', text: `  ▶  ${nextMission.command}` })
    }
  }

  return entries
}

const defaultQuestState = {
  currentMission: 0,
  completedMissions: [],
  unlockedLevels: [1],
  xp: 0,
  level: 1,
  terminalHistory: [],
  openCodexKeys: [],
  failedAttempts: {},
  completedVisions: [],   // tracks which vision variants have been typed
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
    completedVisions: saved.git?.completedVisions ?? [],
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
    const mission = gitMissions[q.currentMission]
    const missionId = mission?.id ?? `git-mission-${q.currentMission}`
    const newEntries = [{ type: 'command', text: input }]

    // ── Vision missions: accept all three reset variants in any order ──────
    if (mission?.specialType === 'vision') {
      const visionCommands = ['git reset --soft head~1', 'git reset --mixed head~1', 'git reset --hard head~1']
      const typed = input.toLowerCase().trim()

      if (visionCommands.includes(typed)) {
        const alreadyDone = q.completedVisions.includes(typed)
        if (!alreadyDone) {
          newEntries.push({ type: 'success', text: `✓ Vision observed: ${input}` })
        } else {
          newEntries.push({ type: 'output', text: `(already observed: ${input})` })
        }

        const completedVisions = alreadyDone
          ? q.completedVisions
          : [...q.completedVisions, typed]

        const allThreeDone = visionCommands.every(v => completedVisions.includes(v))

        if (allThreeDone && !alreadyDone) {
          // All three observed — skip past all three vision missions at once
          const visionsToComplete = VISION_IDS.filter(id => !q.completedMissions.includes(id))
          const skipCount = visionsToComplete.length
          const newMissionIndex = q.currentMission + skipCount
          const nextMission = gitMissions[newMissionIndex]
          const xpGained = skipCount * 55
          const newXp = q.xp + xpGained
          const newLevel = levelForXp(newXp)
          const newUnlockedLevels = nextMission && !q.unlockedLevels.includes(nextMission.level)
            ? [...q.unlockedLevels, nextMission.level].sort((a, b) => a - b)
            : q.unlockedLevels

          newEntries.push({ type: 'success', text: '✦ All three reset visions observed!' })
          newEntries.push({ type: 'info', text: `+${xpGained} XP` })
          if (nextMission) {
            newEntries.push({ type: 'output', text: '' })
            newEntries.push({ type: 'output', text: nextMission.narrative })
            newEntries.push({ type: 'info', text: `${nextMission.npcName}: "${nextMission.npcLine}"` })
            newEntries.push({ type: 'path', text: `  ▶  ${nextMission.command}` })
          }

          set({
            git: {
              ...q,
              terminalHistory: [...q.terminalHistory, ...newEntries].slice(-100),
              currentMission: newMissionIndex,
              completedMissions: [...q.completedMissions, ...visionsToComplete],
              xp: newXp,
              level: newLevel,
              unlockedLevels: newUnlockedLevels,
              completedVisions: [],
            },
          })
        } else {
          // Partial — show how many remain
          const remaining = visionCommands.filter(v => !completedVisions.includes(v))
          remaining.forEach(v => newEntries.push({ type: 'path', text: `  ▶  ${v}` }))

          set({
            git: {
              ...q,
              terminalHistory: [...q.terminalHistory, ...newEntries].slice(-100),
              completedVisions,
            },
          })
        }

        persistSave(get())
        return
      }

      // Wrong command during vision
      newEntries.push({ type: 'error', text: `Try one of: git reset --soft HEAD~1 · git reset --mixed HEAD~1 · git reset --hard HEAD~1` })
      set({
        git: {
          ...q,
          terminalHistory: [...q.terminalHistory, ...newEntries].slice(-100),
        },
      })
      persistSave(get())
      return
    }

    // ── Standard mission evaluation ────────────────────────────────────────
    const result = evaluateGitCommand(input, q.gitState, q.currentMission)

    if (result.success) {
      const newXp = q.xp + (result.xp ?? 0)
      const newLevel = levelForXp(newXp)
      const newMissionIndex = q.currentMission + 1
      const nextMission = gitMissions[newMissionIndex]

      const newUnlockedLevels =
        nextMission && !q.unlockedLevels.includes(nextMission.level)
          ? [...q.unlockedLevels, nextMission.level].sort((a, b) => a - b)
          : q.unlockedLevels

      const successEntries = buildSuccessEntries(mission, result, q, nextMission, newLevel)
      newEntries.push(...successEntries)

      const completedMissions = q.completedMissions.includes(missionId)
        ? q.completedMissions
        : [...q.completedMissions, missionId]

      const openCodexKeys =
        result.codexKey && !q.openCodexKeys.includes(result.codexKey)
          ? [...q.openCodexKeys, result.codexKey]
          : q.openCodexKeys

      const newFailedAttempts = { ...q.failedAttempts }
      delete newFailedAttempts[missionId]

      set({
        git: {
          ...q,
          terminalHistory: [...q.terminalHistory, ...newEntries].slice(-100),
          currentMission: newMissionIndex,
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
      const failCount = (q.failedAttempts[missionId] ?? 0) + 1
      const newFailedAttempts = { ...q.failedAttempts, [missionId]: failCount }

      result.output.forEach(line =>
        newEntries.push({ type: result.isInfo ? 'output' : 'error', text: line })
      )

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

  resolveGitConflict() {
    const state = get()
    const q = state.git
    const mission = gitMissions[q.currentMission]
    if (!mission || mission.specialType !== 'conflict') return

    const result = resolveConflict(q.gitState, q.currentMission)
    if (!result) return

    const missionId = mission.id
    const newXp = q.xp + (result.xp ?? 0)
    const newLevel = levelForXp(newXp)
    const newMissionIndex = q.currentMission + 1
    const nextMission = gitMissions[newMissionIndex]

    const newUnlockedLevels =
      nextMission && !q.unlockedLevels.includes(nextMission.level)
        ? [...q.unlockedLevels, nextMission.level].sort((a, b) => a - b)
        : q.unlockedLevels

    const newEntries = buildSuccessEntries(mission, result, q, nextMission, newLevel)
    const completedMissions = [...q.completedMissions, missionId]
    const openCodexKeys =
      result.codexKey && !q.openCodexKeys.includes(result.codexKey)
        ? [...q.openCodexKeys, result.codexKey]
        : q.openCodexKeys

    set({
      git: {
        ...q,
        terminalHistory: [...q.terminalHistory, ...newEntries].slice(-100),
        currentMission: newMissionIndex,
        completedMissions,
        xp: newXp,
        level: newLevel,
        unlockedLevels: newUnlockedLevels,
        openCodexKeys,
        gitState: result.newGitState,
      },
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
    if (quest === 'git') localStorage.removeItem('questforge-git-seeded')
    set({
      [quest]: {
        ...defaultQuestState,
        gitState: quest === 'git' ? { ...defaultGitState } : undefined,
      },
    })
    persistSave(get())
  },
}))
