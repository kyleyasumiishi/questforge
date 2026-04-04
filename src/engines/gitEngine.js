// Git engine — evaluates player input against current mission and git state.
// Returns { success, output, newGitState, errorMessage }

import { gitMissions } from '../content/missions.git.js'

// ─── Command normalization ─────────────────────────────────────────────────

function normalize(str) {
  return str.trim().replace(/\s+/g, ' ')
}

function normalizeForMatch(str) {
  return normalize(str)
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
}

// Fuzzy match: case-insensitive, whitespace-normalized, quote-tolerant.
// Flexible value matching for commands that accept arbitrary quoted arguments.
function matchesMission(input, mission) {
  const raw = normalizeForMatch(input)
  const rawLower = raw.toLowerCase()

  const candidates = [mission.command, ...(mission.aliases || [])]

  for (const candidate of candidates) {
    const cLower = normalizeForMatch(candidate).toLowerCase()

    if (rawLower === cLower) return true

    // Accept any quoted value for these command prefixes
    const flexPrefixes = [
      'git config --global user.name',
      'git config --global user.email',
      'git commit -m',
      'git tag v',
      'git tag -a',
    ]
    for (const prefix of flexPrefixes) {
      if (cLower.startsWith(prefix) && rawLower.startsWith(prefix)) return true
    }

    // git show — accept any hash (7+ hex chars)
    if (cLower.startsWith('git show') && rawLower.startsWith('git show')) {
      const hash = rawLower.replace('git show', '').trim()
      if (/^[0-9a-f]{4,}$/.test(hash)) return true
    }

    // git revert — accept any hash
    if (cLower.startsWith('git revert') && rawLower.startsWith('git revert')) {
      const hash = rawLower.replace('git revert', '').trim()
      if (/^[0-9a-f]{4,}$/.test(hash)) return true
    }

    // git reset --hard <hash> — accept any hash (not HEAD~1)
    if (
      cLower === 'git reset --hard e5a8b11' &&
      rawLower.startsWith('git reset --hard') &&
      !rawLower.includes('head')
    ) {
      const hash = rawLower.replace('git reset --hard', '').trim()
      if (/^[0-9a-f]{4,}$/.test(hash)) return true
    }

    // git cherry-pick — accept any hash
    if (cLower.startsWith('git cherry-pick') && rawLower.startsWith('git cherry-pick')) {
      const hash = rawLower.replace('git cherry-pick', '').trim()
      if (/^[0-9a-f]{4,}$/.test(hash)) return true
    }

    // git blame — accept any filename
    if (cLower.startsWith('git blame') && rawLower.startsWith('git blame')) return true
  }

  return false
}

// ─── State helpers ─────────────────────────────────────────────────────────

function isIgnored(filename, patterns) {
  return patterns.some(pattern => {
    const regex = new RegExp(
      '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$'
    )
    return regex.test(filename)
  })
}

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
    f =>
      !staged.includes(f) &&
      !tracked.has(f) &&
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

function computeLog(gitState, oneline = false, graph = false) {
  if (gitState.commits.length === 0) {
    return ['fatal: your current branch has no commits yet']
  }
  const lines = []
  const reversed = [...gitState.commits].reverse()
  reversed.forEach((commit, i) => {
    if (oneline) {
      lines.push(`${graph ? '* ' : ''}${commit.hash} ${commit.message}`)
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

function computeDiff(gitState, staged = false) {
  if (staged) {
    return [
      'diff --git a/map.txt b/map.txt',
      '--- a/map.txt',
      '+++ b/map.txt',
      '@@ -1 +1 @@',
      '-Here be dragons',
      '+Here be dragons (confirmed, NW quadrant)',
    ]
  }
  return [
    'diff --git a/map.txt b/map.txt',
    'index 3a4b5c6..7d8e9f0 100644',
    '--- a/map.txt',
    '+++ b/map.txt',
    '@@ -1 +1 @@',
    '-Here be dragons',
    '+Here be dragons (confirmed, NW quadrant)',
  ]
}

function computeReflog(gitState) {
  if (!gitState.reflog || gitState.reflog.length === 0) {
    return ['HEAD@{0}: (no reflog entries yet)']
  }
  return gitState.reflog
}

// ─── Free commands (always available, not mission-gated) ───────────────────

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
      output: branches.map(b => (b === gitState.HEAD ? `* ${b}` : `  ${b}`)),
    }
  }
  if (cmd === 'git diff') {
    return { handled: true, output: computeDiff(gitState, false) }
  }
  if (cmd === 'git diff --staged' || cmd === 'git diff --cached') {
    return { handled: true, output: computeDiff(gitState, true) }
  }
  if (cmd === 'git reflog') {
    return { handled: true, output: computeReflog(gitState) }
  }

  return { handled: false }
}

// ─── State mutation ────────────────────────────────────────────────────────

function makeCommit(gitState, input, mission) {
  const sc = mission.stateChange
  const msgMatch =
    input.match(/-m\s+"([^"]+)"/) ||
    input.match(/-m\s+'([^']+)'/)
  const message = msgMatch
    ? msgMatch[1]
    : mission.command.match(/-m\s+"([^"]+)"/)?.[1] || 'commit'
  const hash = sc.commits[0].hash

  const newCommit = {
    hash,
    message,
    tree: { ...gitState.index },
    parent: gitState.commits[gitState.commits.length - 1]?.hash || null,
    branch: gitState.HEAD,
    author: gitState.config.name || 'Wanderer',
    timestamp: new Date().toISOString(),
  }

  const newReflog = [
    `${hash} HEAD@{0}: commit: ${message}`,
    ...(gitState.reflog || []).map(entry =>
      entry.replace(/HEAD@\{(\d+)\}/, (_, n) => `HEAD@{${parseInt(n) + 1}}`)
    ),
  ]

  return {
    commits: [...gitState.commits, newCommit],
    branches: { ...gitState.branches, [gitState.HEAD]: hash },
    index: {},
    reflog: newReflog,
  }
}

function applyStateChange(gitState, mission, input) {
  const next = { ...gitState }
  const sc = mission.stateChange || {}

  // git init
  if (sc.initialized) next.initialized = true

  // git config — extract actual typed value
  if (sc.config) {
    next.config = { ...next.config }
    const nameMatch = input.match(/user\.name\s+"?([^"]+)"?/)
    const emailMatch = input.match(/user\.email\s+"?([^"]+)"?/)
    if (nameMatch) next.config.name = nameMatch[1].replace(/"/g, '').trim()
    else if (sc.config.name) next.config.name = sc.config.name
    if (emailMatch) next.config.email = emailMatch[1].replace(/"/g, '').trim()
    else if (sc.config.email) next.config.email = sc.config.email
  }

  // git add (single file or all)
  if (sc.index) next.index = { ...next.index, ...sc.index }
  if (sc.allFilesStaged) {
    const staged = {}
    Object.keys(next.workingDirectory).forEach(f => {
      if (!isIgnored(f, next.gitignorePatterns)) staged[f] = true
    })
    next.index = { ...next.index, ...staged }
  }

  // .gitignore
  if (sc.gitignorePatterns) {
    next.gitignorePatterns = [
      ...next.gitignorePatterns,
      ...sc.gitignorePatterns,
    ]
    next.workingDirectory = {
      ...next.workingDirectory,
      '.gitignore': { status: 'untracked' },
    }
  }

  // git commit
  if (sc.commits) {
    const changes = makeCommit(next, input, mission)
    next.commits = changes.commits
    next.branches = changes.branches
    next.index = changes.index
    next.reflog = changes.reflog
  }

  // git stash
  if (sc.stashCount === 1) {
    next.stash = [
      {
        message: 'WIP',
        index: { ...next.index },
        workingDirectory: { ...next.workingDirectory },
      },
    ]
    next.index = {}
    next.reflog = [
      `stash HEAD@{0}: WIP on ${next.HEAD}`,
      ...(next.reflog || []).map(e =>
        e.replace(/HEAD@\{(\d+)\}/, (_, n) => `HEAD@{${parseInt(n) + 1}}`)
      ),
    ]
  }
  if (sc.stashCount === 0) {
    const top = next.stash?.[0]
    if (top) {
      next.index = top.index
      next.stash = next.stash.slice(1)
    }
  }

  // git branch (create new)
  if (sc.branches) next.branches = { ...next.branches, ...sc.branches }

  // git switch / checkout
  if (sc.HEAD && typeof sc.HEAD === 'string') {
    // Record switch in reflog
    next.reflog = [
      `${next.branches[sc.HEAD] || 'HEAD'} HEAD@{0}: checkout: moving from ${next.HEAD} to ${sc.HEAD}`,
      ...(next.reflog || []).map(e =>
        e.replace(/HEAD@\{(\d+)\}/, (_, n) => `HEAD@{${parseInt(n) + 1}}`)
      ),
    ]
    next.HEAD = sc.HEAD
  }

  // git remote add
  if (sc.remotes) next.remotes = { ...next.remotes, ...sc.remotes }

  // git merge conflict flag
  if (sc.mergeConflict !== undefined) next.mergeConflict = sc.mergeConflict

  // git tag
  if (sc.tags) next.tags = { ...next.tags, ...sc.tags }

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

  // Conflict missions are resolved via the conflict editor UI, not the terminal
  if (mission.specialType === 'conflict') {
    return {
      success: false,
      output: [
        'Resolve the conflict in the editor panel, then click "Resolved ✓".',
      ],
      newGitState: gitState,
      advanceMission: false,
    }
  }

  // Check free commands first (status/log/diff/branch always work)
  const free = handleFreeCommand(input, gitState)
  if (free.handled) {
    // If this also satisfies the current mission, count it as success
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
    // Just informational — show real state, don't advance
    return {
      success: false,
      output: free.output,
      newGitState: gitState,
      advanceMission: false,
      isInfo: true,
    }
  }

  // Check mission match
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

  // Wrong command
  return {
    success: false,
    output: [mission.terminalOutputError],
    newGitState: gitState,
    advanceMission: false,
  }
}

// Resolve conflict mission — called by the conflict editor UI
export function resolveConflict(gitState, currentMissionIndex) {
  const mission = gitMissions[currentMissionIndex]
  if (!mission || mission.specialType !== 'conflict') return null

  return {
    success: true,
    output: mission.terminalOutput,
    newGitState: applyStateChange(gitState, mission, ''),
    advanceMission: true,
    codexKey: mission.unlocksCodex ? mission.codexKey : null,
    xp: mission.xp,
  }
}

export { gitMissions }
