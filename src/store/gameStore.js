import { create } from 'zustand'
import { loadSave, persistSave, downloadExport, validateImport } from './persistence'
import { evaluateGitCommand, resolveConflict } from '../engines/gitEngine'
import { evaluateSqlCommand, createDataset } from '../engines/sqlEngine'
import { defaultGitState } from './gitStore'
import { gitMissions } from '../content/missions.git.js'
import { sqlMissions } from '../content/missions.sql.js'
import { playSfx } from '../audio/sfx'

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

  result.output.forEach(line => entries.push({ type: 'success', text: line, typewriter: true }))

  if (mission?.npcLine) {
    entries.push({ type: 'info', text: `${mission.npcName}: "${mission.npcLine}"`, typewriter: true })
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
      typewriter: true,
    })
  }

  // Sound effects + reaction for success path
  let reactionType = 'jump'
  if (newLevel > q.level) { playSfx('levelup'); reactionType = 'celebrate' }
  else if (mission && (!nextMission || nextMission.level !== mission.level)) { playSfx('level-complete'); reactionType = 'celebrate' }
  else if (result.codexKey && !q.openCodexKeys.includes(result.codexKey)) playSfx('codex')
  else playSfx('success')

  // Level completion — next mission is in a different level (or quest is done)
  if (mission && (!nextMission || nextMission.level !== mission.level)) {
    entries.push({ type: 'output', text: '' })
    entries.push({
      type: 'level-complete',
      text: `═══ Level ${mission.level} Complete! ═══`,
      level: mission.level,
    })
    if (mission.npcName) {
      entries.push({ type: 'success', text: `${mission.npcName}: "Well done, adventurer. A new path opens before you."`, typewriter: true })
    }
  }

  if (nextMission) {
    entries.push({ type: 'output', text: '' })
    entries.push({ type: 'output', text: nextMission.narrative, typewriter: true })
    if (nextMission.specialType === 'conflict') {
      entries.push({ type: 'conflict-editor' })
    } else {
      entries.push({ type: 'path', text: `  ▶  ${nextMission.command}` })
    }
  }

  return { entries, reactionType }
}

let reactionCounter = 0
function makeReaction(type) {
  return { type, key: ++reactionCounter }
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
  completedVisions: [],
  gitState: { ...defaultGitState },
  lastReaction: null,
}

const defaultSqlQuestState = {
  ...defaultQuestState,
  gitState: undefined,
  dataset: createDataset(),
  dramaticPending: false,
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
  sql: {
    ...defaultSqlQuestState,
    ...saved.sql,
    dataset: saved.sql?.dataset ?? createDataset(),
    failedAttempts: saved.sql?.failedAttempts ?? {},
  },

  setActiveQuest(quest) {
    set({ activeQuest: quest })
    persistSave(get())
  },

  addToHistory(quest, entries) {
    set(state => {
      const history = [...state[quest].terminalHistory, ...entries]
      return { [quest]: { ...state[quest], terminalHistory: history } }
    })
    persistSave(get())
  },

  handleMetaCommand(quest, input) {
    const cmd = input.trim().toLowerCase()
    const state = get()

    if (cmd === '/hint') {
      state.addToHistory(quest, [{ type: 'command', text: input }])
      state.showHint(quest)
      return true
    }
    if (cmd === '/clear') {
      const missions = quest === 'git' ? gitMissions : sqlMissions
      const mission = missions[state[quest].currentMission]
      const entries = [
        { type: 'command', text: input },
        { type: 'output', text: '' },
        { type: 'info', text: '────────────────────────────────────────', clearMarker: true },
        { type: 'output', text: '' },
      ]
      if (mission) {
        entries.push({ type: 'output', text: mission.narrative })
        if (mission.specialType === 'conflict') {
          entries.push({ type: 'conflict-editor' })
        } else {
          entries.push({ type: 'path', text: `  ▶  ${mission.command}` })
        }
      }
      state.addToHistory(quest, entries)
      return true
    }
    if (cmd === '/help') {
      state.addToHistory(quest, [
        { type: 'command', text: input },
        { type: 'info', text: 'Available commands:' },
        { type: 'output', text: '  /hint     — Show a hint for the current mission' },
        { type: 'output', text: '  /clear    — Clear terminal history' },
        { type: 'output', text: '  /help     — Show this help message' },
        { type: 'output', text: '' },
        { type: 'output', text: '  ↑ / ↓     — Browse command history' },
      ])
      return true
    }
    return false
  },

  submitGitCommand(input) {
    const state = get()
    const q = state.git

    if (state.handleMetaCommand('git', input)) return

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
          playSfx('success')
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

          playSfx('level-complete')
          newEntries.push({ type: 'success', text: '✦ All three reset visions observed!' })
          newEntries.push({ type: 'info', text: `+${xpGained} XP` })
          if (nextMission) {
            newEntries.push({ type: 'output', text: '' })
            newEntries.push({ type: 'output', text: nextMission.narrative })
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
              lastReaction: makeReaction('celebrate'),
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
              lastReaction: makeReaction('jump'),
            },
          })
        }

        persistSave(get())
        return
      }

      // Wrong command during vision
      playSfx('error')
      newEntries.push({ type: 'error', text: `Try one of: git reset --soft HEAD~1 · git reset --mixed HEAD~1 · git reset --hard HEAD~1` })
      set({
        git: {
          ...q,
          terminalHistory: [...q.terminalHistory, ...newEntries].slice(-100),
          lastReaction: makeReaction('shake'),
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

      const { entries: successEntries, reactionType } = buildSuccessEntries(mission, result, q, nextMission, newLevel)
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
          lastReaction: makeReaction(reactionType),
        },
      })
    } else {
      const failCount = (q.failedAttempts[missionId] ?? 0) + 1
      const newFailedAttempts = { ...q.failedAttempts, [missionId]: failCount }

      result.output.forEach(line =>
        newEntries.push({ type: result.isInfo ? 'output' : 'error', text: line })
      )

      if (failCount >= 4 && mission?.hint && !result.isInfo) {
        newEntries.push({ type: 'hint', text: `  ✦ hint: ${mission.hint}` })
        playSfx('hint')
      } else if (failCount >= 2 && mission?.hint && !result.isInfo) {
        newEntries.push({ type: 'info', text: '  ✦ Type /hint if you need a nudge' })
      }

      if (!result.isInfo) playSfx('error')

      set({
        git: {
          ...q,
          terminalHistory: [...q.terminalHistory, ...newEntries].slice(-100),
          failedAttempts: newFailedAttempts,
          lastReaction: result.isInfo ? q.lastReaction : makeReaction('shake'),
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

    playSfx('success')
    const { entries: newEntries, reactionType } = buildSuccessEntries(mission, result, q, nextMission, newLevel)
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
        lastReaction: makeReaction(reactionType),
      },
    })

    persistSave(get())
  },

  submitSqlCommand(input) {
    const state = get()
    const q = state.sql

    if (state.handleMetaCommand('sql', input)) return

    const mission = sqlMissions[q.currentMission]
    const missionId = mission?.id ?? `sql-mission-${q.currentMission}`
    const newEntries = [{ type: 'command', text: input }]

    const result = evaluateSqlCommand(input, q.dataset, q.currentMission)

    if (result.success) {
      const newXp = q.xp + (result.xp ?? 0)
      const newLevel = levelForXp(newXp)
      const newMissionIndex = q.currentMission + 1
      const nextMission = sqlMissions[newMissionIndex]

      const newUnlockedLevels =
        nextMission && !q.unlockedLevels.includes(nextMission.level)
          ? [...q.unlockedLevels, nextMission.level].sort((a, b) => a - b)
          : q.unlockedLevels

      // Dramatic final mission — output rows one at a time with 400ms delay
      if (result.dramatic) {
        playSfx('quest-complete')
        result.output.forEach(line => newEntries.push({ type: 'success', text: line }))
        newEntries.push({ type: 'info', text: `${mission.npcName}: "${mission.npcLine}"` })
        newEntries.push({ type: 'info', text: `+${result.xp} XP` })
        newEntries.push({ type: 'success', text: '🏺 SQLQuest Complete!' })

        set({
          sql: {
            ...q,
            terminalHistory: [...q.terminalHistory, ...newEntries].slice(-100),
            currentMission: newMissionIndex,
            completedMissions: [...q.completedMissions, missionId],
            xp: newXp,
            level: newLevel,
            unlockedLevels: newUnlockedLevels,
            dataset: result.newDataset,
            dramaticPending: false,
            lastReaction: makeReaction('celebrate'),
          },
        })
        persistSave(get())
        return
      }

      const { entries: successEntries, reactionType } = buildSuccessEntries(mission, result, q, nextMission, newLevel)
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
        sql: {
          ...q,
          terminalHistory: [...q.terminalHistory, ...newEntries].slice(-100),
          currentMission: newMissionIndex,
          completedMissions,
          xp: newXp,
          level: newLevel,
          unlockedLevels: newUnlockedLevels,
          openCodexKeys,
          failedAttempts: newFailedAttempts,
          dataset: result.newDataset,
          lastReaction: makeReaction(reactionType),
        },
      })
    } else {
      playSfx('error')
      const failCount = (q.failedAttempts[missionId] ?? 0) + 1
      result.output.forEach(line => newEntries.push({ type: 'error', text: line }))
      if (failCount >= 4 && mission?.hint) {
        newEntries.push({ type: 'hint', text: `  ✦ hint: ${mission.hint}` })
        playSfx('hint')
      } else if (failCount >= 2 && mission?.hint) {
        newEntries.push({ type: 'info', text: '  ✦ Type /hint if you need a nudge' })
      }
      set({
        sql: {
          ...q,
          terminalHistory: [...q.terminalHistory, ...newEntries].slice(-100),
          failedAttempts: { ...q.failedAttempts, [missionId]: failCount },
          lastReaction: makeReaction('shake'),
        },
      })
    }

    persistSave(get())
  },

  jumpToLevel(quest, levelNum, missions) {
    // Find the index of the first mission belonging to levelNum
    const idx = missions.findIndex(m => m.level === levelNum)
    if (idx === -1) return
    set(state => ({
      [quest]: { ...state[quest], currentMission: idx },
    }))
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

  showHint(quest) {
    const state = get()
    const q = state[quest]
    const missions = quest === 'git' ? gitMissions : sqlMissions
    const mission = missions[q.currentMission]
    if (!mission?.hint) return
    playSfx('hint')
    const entries = [{ type: 'hint', text: `  ✦ hint: ${mission.hint}` }]
    set({
      [quest]: {
        ...q,
        terminalHistory: [...q.terminalHistory, ...entries].slice(-100),
      },
    })
    persistSave(get())
  },

  exportSave() {
    downloadExport(get())
  },

  importSave(raw) {
    const result = validateImport(raw)
    if (!result.ok) return result

    const data = result.data
    set({
      activeQuest: data.activeQuest ?? null,
      git: {
        ...defaultQuestState,
        ...data.git,
        gitState: { ...defaultGitState, ...(data.git?.gitState ?? {}) },
        failedAttempts: data.git?.failedAttempts ?? {},
        completedVisions: data.git?.completedVisions ?? [],
      },
      sql: {
        ...defaultSqlQuestState,
        ...data.sql,
        dataset: data.sql?.dataset ?? createDataset(),
        failedAttempts: data.sql?.failedAttempts ?? {},
      },
    })
    persistSave(get())

    // Re-seed flags so intro doesn't replay
    if (data.git?.terminalHistory?.length > 0) localStorage.setItem('questforge-git-seeded', '1')
    if (data.sql?.terminalHistory?.length > 0) localStorage.setItem('questforge-sql-seeded', '1')

    return { ok: true }
  },

  resetQuest(quest) {
    if (quest === 'git') localStorage.removeItem('questforge-git-seeded')
    if (quest === 'sql') localStorage.removeItem('questforge-sql-seeded')
    set({
      [quest]: quest === 'git'
        ? { ...defaultQuestState, gitState: { ...defaultGitState } }
        : { ...defaultSqlQuestState, dataset: createDataset() },
    })
    persistSave(get())
  },
}))
