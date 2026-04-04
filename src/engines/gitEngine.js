// Git engine — evaluates player input against current mission and git state.
// Returns { success, output, newGitState, errorMessage }

import { gitMissions } from '../content/missions.git.js'

// ─── Command normalization ─────────────────────────────────────────────────

function normalize(str) {
  return str.trim().replace(/\s+/g, ' ')
}

function normalizeForMatch(str) {
  // Normalize quotes (smart quotes → straight), trim, collapse whitespace
  return normalize(str)
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
}

// Check if player input satisfies the mission's expected command.
// Uses fuzzy matching rules per spec:
//   - case-insensitive for git keywords
//   - whitespace normalization
//   - quote style tolerance
//   - flexible values for config/commit (any quoted string accepted)
function matchesMission(input, mission) {
  const raw = normalizeForMatch(input)
  const rawLower = raw.toLowerCase()

  // Build candidate list: primary command + aliases
  const candidates = [mission.command, ...(mission.aliases || [])]

  for (const candidate of candidates) {
    const c = normalizeForMatch(candidate)
    const cLower = c.toLowerCase()

    // Exact match (case-insensitive for git commands)
    if (rawLower === cLower) return true

    // Flexible value matching — accept any quoted argument for:
    //   git config --global user.name "..."
    //   git config --global user.email "..."
    //   git commit -m "..."
    //   git tag <name> -m "..."
    if (
      cLower.startsWith('git config --global user.name') &&
      rawLower.startsWith('git config --global user.name')
    ) return true

    if (
      cLower.startsWith('git config --global user.email') &&
      rawLower.startsWith('git config --global user.email')
    ) return true

    if (
      cLower.startsWith('git commit -m') &&
      rawLower.startsWith('git commit -m')
    ) return true

    if (
      cLower.startsWith('git tag') &&
      rawLower.startsWith('git tag') &&
      rawLower.includes('-m')
    ) return true
  }

  return false
}

// ─── State helpers ─────────────────────────────────────────────────────────

function computeStatus(gitState) {
  const lines = []
  lines.push(`On branch ${gitState.HEAD}`)
  lines.push('')

  const committed = gitState.commits.length > 0
  const staged = Object.keys(gitState.index)
  const tracked = new Set(
    gitState.commits.flatMap(c => Object.keys(c.tree || {}))
  )

  const untracked = Object.keys(gitState.workingDirectory).filter(
    f => !staged.includes(f) && !tracked.has(f) &&
      !isIgnored(f, gitState.gitignorePatterns)
  )

  if (!committed) lines.push('No commits yet')

  if (staged.length > 0) {
    lines.push('')
    lines.push('Changes to be committed:')
    lines.push('  (use "git restore --staged <file>..." to unstage)')
    staged.forEach(f => lines.push(`        new file:   ${f}`))
  }

  if (untracked.length > 0) {
    lines.push('')
    lines.push('Untracked files:')
    lines.push('  (use "git add <file>..." to include in what will be committed)')
    untracked.forEach(f => lines.push(`        ${f}`))
  }

  if (staged.length === 0 && untracked.length === 0) {
    lines.push('')
    lines.push('nothing to commit, working tree clean')
  }

  return lines
}

function isIgnored(filename, patterns) {
  return patterns.some(pattern => {
    const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$')
    return regex.test(filename)
  })
}

function computeLog(gitState, oneline = false, graph = false) {
  if (gitState.commits.length === 0) {
    return ['fatal: your current branch has no commits yet']
  }

  const lines = []
  const reversed = [...gitState.commits].reverse()

  reversed.forEach((commit, i) => {
    if (oneline) {
      const prefix = graph ? '* ' : ''
      lines.push(`${prefix}${commit.hash} ${commit.message}`)
    } else {
      lines.push(`commit ${commit.hash}aef4b8dc3e1f7a2b5c6d9e0f1a2b3c4d5`)
      lines.push(`Author: ${gitState.config.name || 'Wanderer'} <${gitState.config.email || 'wanderer@versia.io'}>`)
      lines.push('Date:   Mon Jan 1 00:00:00 2024')
      lines.push('')
      lines.push(`    ${commit.message}`)
      if (i < reversed.length - 1) lines.push('')
    }
  })

  return lines
}

// ─── Free commands (work outside their mission context) ────────────────────

function handleFreeCommand(input, gitState) {
  const cmd = normalize(input).toLowerCase()

  if (cmd === 'git status') {
    return { handled: true, output: computeStatus(gitState) }
  }
  if (cmd === 'git log') {
    return { handled: true, output: computeLog(gitState) }
  }
  if (cmd === 'git log --oneline') {
    return { handled: true, output: computeLog(gitState, true) }
  }
  if (cmd === 'git log --oneline --graph' || cmd === 'git log --graph --oneline') {
    return { handled: true, output: computeLog(gitState, true, true) }
  }
  if (cmd === 'git branch') {
    const branches = Object.keys(gitState.branches)
    return {
      handled: true,
      output: branches.map(b => b === gitState.HEAD ? `* ${b}` : `  ${b}`),
    }
  }
  if (cmd === 'git reflog') {
    return {
      handled: true,
      output: gitState.reflog?.length > 0
        ? gitState.reflog
        : ['HEAD@{0}: (no reflog entries yet)'],
    }
  }

  return { handled: false }
}

// ─── State mutation per mission ────────────────────────────────────────────

function applyStateChange(gitState, mission, input) {
  const next = { ...gitState }
  const sc = mission.stateChange || {}

  // git init
  if (sc.initialized) {
    next.initialized = true
  }

  // git config
  if (sc.config) {
    next.config = { ...next.config, ...sc.config }
    // Extract actual value from input
    const nameMatch = input.match(/user\.name\s+"?([^"]+)"?/)
    const emailMatch = input.match(/user\.email\s+"?([^"]+)"?/)
    if (nameMatch) next.config.name = nameMatch[1].replace(/"/g, '').trim()
    if (emailMatch) next.config.email = emailMatch[1].replace(/"/g, '').trim()
  }

  // git add (single file)
  if (sc.index) {
    next.index = { ...next.index, ...sc.index }
  }

  // git add . — stage all untracked files
  if (sc.allFilesStaged) {
    const staged = {}
    Object.keys(next.workingDirectory).forEach(f => {
      if (!isIgnored(f, next.gitignorePatterns)) {
        staged[f] = true
      }
    })
    next.index = { ...next.index, ...staged }
  }

  // .gitignore
  if (sc.gitignorePatterns) {
    next.gitignorePatterns = [...next.gitignorePatterns, ...sc.gitignorePatterns]
    next.workingDirectory = { ...next.workingDirectory, '.gitignore': { status: 'untracked' } }
  }

  // git commit — create commit object from staged index
  if (sc.commits) {
    const msgMatch = input.match(/-m\s+"([^"]+)"/) || input.match(/-m\s+'([^']+)'/)
    const message = msgMatch ? msgMatch[1] : mission.command.match(/-m\s+"([^"]+)"/)?.[1] || 'commit'
    const hash = sc.commits[0].hash

    next.commits = [...next.commits, {
      hash,
      message,
      tree: { ...next.index },
      parent: next.commits[next.commits.length - 1]?.hash || null,
      author: next.config.name,
      timestamp: new Date().toISOString(),
    }]

    // Advance branch pointer
    next.branches = { ...next.branches, [next.HEAD]: hash }

    // Clear index after commit
    next.index = {}

    // Add to reflog
    next.reflog = [
      `${hash} HEAD@{0}: commit: ${message}`,
      ...(next.reflog || []).map((entry, i) =>
        entry.replace(/HEAD@\{(\d+)\}/, (_, n) => `HEAD@{${parseInt(n) + 1}}`)
      ),
    ]
  }

  // git stash
  if (sc.stashCount === 1) {
    next.stash = [{ message: 'WIP', index: { ...next.index }, workingDirectory: { ...next.workingDirectory } }]
    next.index = {}
  }
  if (sc.stashCount === 0) {
    const top = next.stash[0]
    if (top) {
      next.index = top.index
      next.stash = next.stash.slice(1)
    }
  }

  // git branch (new branch)
  if (sc.branches) {
    next.branches = { ...next.branches, ...sc.branches }
  }

  // git switch
  if (sc.HEAD && typeof sc.HEAD === 'string') {
    next.HEAD = sc.HEAD
  }

  // git remote
  if (sc.remotes) {
    next.remotes = { ...next.remotes, ...sc.remotes }
  }

  // git tag
  if (sc.tags) {
    next.tags = { ...next.tags, ...sc.tags }
  }

  return next
}

// ─── Main evaluator ────────────────────────────────────────────────────────

export function evaluateGitCommand(input, gitState, currentMissionIndex) {
  const mission = gitMissions[currentMissionIndex]

  if (!mission) {
    return {
      success: false,
      output: ['✦ Quest complete — no more missions.'],
      newGitState: gitState,
      advanceMission: false,
    }
  }

  // Special missions handled by UI (not evaluated here)
  if (mission.specialType === 'conflict') {
    return {
      success: false,
      output: ['Edit the conflict in the panel above, then click "Resolve".'],
      newGitState: gitState,
      advanceMission: false,
    }
  }

  // Check free commands first (git status, git log work anytime)
  const free = handleFreeCommand(input, gitState)
  if (free.handled) {
    // If this also matches the mission, treat as success
    if (matchesMission(input, mission)) {
      return {
        success: true,
        output: mission.terminalOutput,
        newGitState: applyStateChange(gitState, mission, input),
        advanceMission: true,
        codexKey: mission.unlocksCodex ? mission.codexKey : null,
        xp: mission.xp,
      }
    }
    // Otherwise just show the computed output (informational)
    return {
      success: false,
      output: free.output,
      newGitState: gitState,
      advanceMission: false,
      isInfo: true,
    }
  }

  // Check if input matches current mission
  if (matchesMission(input, mission)) {
    return {
      success: true,
      output: mission.terminalOutput,
      newGitState: applyStateChange(gitState, mission, input),
      advanceMission: true,
      codexKey: mission.unlocksCodex ? mission.codexKey : null,
      xp: mission.xp,
    }
  }

  // Wrong command — return mission error
  return {
    success: false,
    output: [mission.terminalOutputError],
    newGitState: gitState,
    advanceMission: false,
  }
}

export { gitMissions }
