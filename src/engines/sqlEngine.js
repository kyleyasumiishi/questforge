// SQL engine — scripted evaluator with fuzzy matching.
// No real SQL parser — each mission maps to expected input strings.

import { sqlMissions } from '../content/missions.sql.js'

// ─── Normalization ─────────────────────────────────────────────────────────

function normalize(str) {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/;\s*$/, '')          // trailing semicolon optional
}

function normalizeLower(str) {
  return normalize(str).toLowerCase()
}

// ─── Fuzzy matcher ─────────────────────────────────────────────────────────
// Rules per spec:
//   - case-insensitive keyword matching
//   - whitespace normalization
//   - single vs double quote tolerance
//   - trailing semicolons optional

function matchesMission(input, mission) {
  const raw = normalizeLower(input)

  const candidates = [mission.command, ...(mission.aliases || [])]

  for (const candidate of candidates) {
    const c = normalizeLower(candidate)

    // Exact match after normalization
    if (raw === c) return true

    // Quote-tolerant match (swap ' ↔ ")
    const swapped = raw.replace(/'/g, '__DQ__').replace(/"/g, "'").replace(/__DQ__/g, '"')
    if (swapped === c) return true
  }

  return false
}

// ─── In-memory dataset (mutated by INSERT/UPDATE/DELETE missions) ──────────

export function createDataset() {
  return {
    artifacts: [
      { id: 1,   name: 'Bronze Dagger',       era: 'Bronze Age',  age: 3200, condition: 'good',       site_id: 1, excavator_id: 3,    estimated_value: 12000 },
      { id: 2,   name: 'Clay Vessel',          era: 'Classical',   age: 1847, condition: 'fragmented', site_id: 2, excavator_id: 1,    estimated_value: 3500  },
      { id: 3,   name: 'Obsidian Mirror',      era: 'Bronze Age',  age: 4100, condition: 'pristine',  site_id: 1, excavator_id: 3,    estimated_value: 85000 },
      { id: 4,   name: 'Iron Lance',           era: 'Iron Age',    age: 2600, condition: 'good',       site_id: 4, excavator_id: 2,    estimated_value: 9000  },
      { id: 5,   name: 'Alabaster Bowl',       era: 'Classical',   age: 890,  condition: 'pristine',  site_id: 2, excavator_id: 5,    estimated_value: 45000 },
      { id: 6,   name: 'Gold Signet Ring',     era: 'Bronze Age',  age: 3800, condition: 'pristine',  site_id: 1, excavator_id: 7,    estimated_value: 120000 },
      { id: 7,   name: 'Bronze Seal',          era: 'Bronze Age',  age: 2900, condition: 'fragmented', site_id: 3, excavator_id: 7,    estimated_value: 6000  },
      { id: 8,   name: 'Stone Altar',          era: 'Neolithic',   age: 7200, condition: 'damaged',   site_id: 3, excavator_id: 4,    estimated_value: 250000 },
      { id: 9,   name: 'Clay Tablet Alpha',    era: 'Bronze Age',  age: 3400, condition: 'good',       site_id: 1, excavator_id: 7,    estimated_value: 18000 },
      { id: 10,  name: 'Iron Dagger',          era: 'Iron Age',    age: 2800, condition: 'good',       site_id: 4, excavator_id: 2,    estimated_value: 7500  },
      { id: 11,  name: 'Bronze Idol',          era: 'Bronze Age',  age: 4800, condition: 'damaged',   site_id: 3, excavator_id: 7,    estimated_value: 95000 },
      { id: 12,  name: 'Sacred Vessel',        era: 'Bronze Age',  age: 5200, condition: 'pristine',  site_id: 3, excavator_id: 12,   estimated_value: 320000 },
      { id: 13,  name: 'Ancient Figurine',     era: 'Neolithic',   age: 9247, condition: 'pristine',  site_id: 3, excavator_id: 4,    estimated_value: 500000 },
      { id: 14,  name: 'Modern Replica',       era: 'Modern',      age: 12,   condition: 'counterfeit', site_id: 2, excavator_id: 1,  estimated_value: 50    },
      { id: 15,  name: 'Unmarked Tablet',      era: 'Unknown',     age: 4400, condition: null,         site_id: 1, excavator_id: null, estimated_value: null  },
      { id: 16,  name: 'Faceless Idol',        era: 'Bronze Age',  age: 3100, condition: 'damaged',   site_id: 2, excavator_id: null, estimated_value: 22000 },
      { id: 17,  name: 'The Codex of Queryra', era: 'Bronze Age',  age: 9247, condition: 'pristine',  site_id: 3, excavator_id: 12,   estimated_value: 999999 },
      { id: 18,  name: 'Obsidian Blade',       era: 'Bronze Age',  age: 2800, condition: 'good',       site_id: 1, excavator_id: 3,    estimated_value: 14000 },
      { id: 19,  name: 'Obsidian Idol',        era: 'Bronze Age',  age: 3600, condition: 'pristine',  site_id: 1, excavator_id: 7,    estimated_value: 75000 },
      { id: 20,  name: 'Tourist Token',        era: 'Modern',      age: 35,   condition: 'counterfeit', site_id: 2, excavator_id: 1,  estimated_value: 0     },
    ],
    excavators: [
      { id: 1,  name: 'Dex Calloway' },
      { id: 2,  name: 'Rafi Sanz' },
      { id: 3,  name: 'Petra Voss' },
      { id: 4,  name: 'Yuna Park' },
      { id: 5,  name: 'Silas Ren' },
      { id: 6,  name: 'Lena Marsh' },
      { id: 7,  name: 'Maris Theron' },
      { id: 8,  name: 'Cass Odell' },
      { id: 9,  name: 'Finn Takeda' },
      { id: 10, name: 'Bora Kaya' },
      { id: 11, name: 'Jules Moreau' },
      { id: 12, name: 'Asha Nkosi' },
    ],
    sites: [
      { id: 1, location: 'NW-3', depth: 12, discovered: '2019-03-14', active: true },
      { id: 2, location: 'NE-7', depth: 8,  discovered: '2020-06-22', active: true },
      { id: 3, location: 'NW-7', depth: 42, discovered: '2023-11-01', active: true },
      { id: 4, location: 'SE-2', depth: 15, discovered: '2021-09-03', active: true },
    ],
    codex: [
      { id: 1, message: 'We did not perish from war or flood.', seal: 'unbroken', inscription_order: 1 },
      { id: 2, message: 'We perished because we stopped asking questions of our own records.', seal: 'unbroken', inscription_order: 2 },
      { id: 3, message: 'The data was always there.', seal: 'unbroken', inscription_order: 3 },
      { id: 4, message: 'No one queried it.', seal: 'unbroken', inscription_order: 4 },
    ],
    views: {},  // stores CREATE VIEW definitions
  }
}

// ─── Main evaluator ────────────────────────────────────────────────────────

export function evaluateSqlCommand(input, dataset, currentMissionIndex) {
  const mission = sqlMissions[currentMissionIndex]

  if (!mission) {
    return {
      success: false,
      output: ['✦ Quest complete — no more missions.'],
      newDataset: dataset,
      advanceMission: false,
    }
  }

  if (!matchesMission(input, mission)) {
    return {
      success: false,
      output: [mission.terminalOutputError],
      newDataset: dataset,
      advanceMission: false,
    }
  }

  // Matched — apply any dataset mutations
  const newDataset = applyMutation(dataset, mission, input)

  // Dramatic final mission — handled by caller with row-by-row delay
  if (mission.specialType === 'dramatic') {
    return {
      success: true,
      output: mission.terminalOutput,
      newDataset,
      advanceMission: true,
      codexKey: mission.unlocksCodex ? mission.codexKey : null,
      xp: mission.xp,
      dramatic: true,
    }
  }

  return {
    success: true,
    output: mission.terminalOutput,
    newDataset,
    advanceMission: true,
    codexKey: mission.unlocksCodex ? mission.codexKey : null,
    xp: mission.xp,
  }
}

// ─── Dataset mutation ──────────────────────────────────────────────────────

function applyMutation(dataset, mission, input) {
  if (!mission.stateChange?.mutates && !mission.stateChange?.createsView) {
    return dataset
  }

  // Clone top-level arrays
  const next = {
    ...dataset,
    artifacts: [...dataset.artifacts],
    views: { ...dataset.views },
  }

  const id = mission.id

  if (id === 'sql-mission-37') {
    // INSERT: Obsidian Idol
    const maxId = Math.max(...next.artifacts.map(a => a.id))
    next.artifacts.push({
      id: maxId + 1,
      name: 'Obsidian Idol',
      era: 'Bronze Age',
      age: 3200,
      condition: 'pristine',
      site_id: null,
      excavator_id: null,
      estimated_value: 75000,
    })
  }

  if (id === 'sql-mission-38') {
    // INSERT: Clay Seal
    const maxId = Math.max(...next.artifacts.map(a => a.id))
    next.artifacts.push({
      id: maxId + 1,
      name: 'Clay Seal',
      era: 'Iron Age',
      age: 2100,
      condition: 'fragmented',
      site_id: null,
      excavator_id: 7,
      estimated_value: 4000,
    })
  }

  if (id === 'sql-mission-39') {
    // UPDATE: Obsidian Idol condition → 'restored'
    next.artifacts = next.artifacts.map(a =>
      a.name === 'Obsidian Idol' ? { ...a, condition: 'restored' } : a
    )
  }

  if (id === 'sql-mission-40') {
    // UPDATE: Bronze Age artifacts excavator_id 7 → 12
    next.artifacts = next.artifacts.map(a =>
      a.excavator_id === 7 && a.era === 'Bronze Age'
        ? { ...a, excavator_id: 12 }
        : a
    )
  }

  if (id === 'sql-mission-41') {
    // DELETE: counterfeit artifacts
    next.artifacts = next.artifacts.filter(a => a.condition !== 'counterfeit')
  }

  if (mission.stateChange?.createsView) {
    next.views[mission.stateChange.createsView] = true
  }

  return next
}

export { sqlMissions }
