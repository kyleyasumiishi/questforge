# QuestForge — Complete Project Specification + Story Scripts

> This is the single source of truth for building QuestForge. It contains the full technical specification, architecture decisions, beat schemas, scope, and the complete narrative scripts for both GitQuest (52 beats) and SQLQuest (53 beats). Feed this entire document to Claude (VS Code / Claude Code) as your primary build reference.

---

## 1. Project Overview

**QuestForge** is a single-page web app that gamifies learning developer tools through narrative RPG adventures. The player controls a pixel-art sprite in a 2D world, advancing the story by typing real commands into an in-browser terminal. Each correct command advances the story, awards XP, and unlocks an inline "codex" entry with three levels of explanation.

Two quests ship in v1:

- **GitQuest: The Repo Chronicles** — 52 beats across 10 zones teaching core Git
- **SQLQuest: The Buried City** — 53 beats across 10 zones teaching core SQL

Both quests are accessible from a shared home screen. Progress is persisted to `localStorage` — no auth, no backend.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React + Vite | Fast dev, easy Vercel deploy |
| Styling | Tailwind CSS | Utility-first, dark mode trivial |
| Canvas / game world | HTML Canvas API | No extra dependency needed |
| Terminal | Custom React component | xterm.js is overkill for this scope |
| State management | Zustand | Lightweight, no boilerplate |
| Persistence | localStorage | Serialize Zustand store on every state change |
| Routing | React Router v6 | Three routes: `/`, `/gitquest`, `/sqlquest` |
| Deploy | Vercel | Free tier, auto-deploy from GitHub |

---

## 3. App Structure

### Routes

```
/               → Home screen — quest picker
/gitquest       → GitQuest game view
/sqlquest       → SQLQuest game view
```

### Directory structure

```
src/
  components/
    Shell/          # Shared game shell (top bar, status bar)
    GamePanel/      # Canvas world (left half)
    TerminalPanel/  # Terminal + codex (right half)
    Codex/          # Inline expandable explanation component
    HomeScreen/     # Quest picker + progress summary
  engines/
    gitEngine.js    # Fake git state machine
    sqlEngine.js    # Scripted SQL evaluator
  content/
    beats.git.js    # All 52 GitQuest beat objects
    beats.sql.js    # All 53 SQLQuest beat objects
    codex.git.js    # ELI5 / Savvy / Man page for all git commands
    codex.sql.js    # ELI5 / Savvy / Man page for all sql commands
  store/
    gameStore.js    # Zustand store — shared game state
    gitStore.js     # Git repo state (working dir, index, HEAD, branches)
    sqlStore.js     # SQL dataset + query result state
  worlds/
    GitWorld.js     # Canvas painter for GitQuest pixel world
    SqlWorld.js     # Canvas painter for SQLQuest pixel world
  App.jsx
  main.jsx
```

---

## 4. Core Architecture

### 4.1 Game shell layout

The game view is a full-viewport dark terminal aesthetic split 50/50:

```
┌─────────────────────────────────────────────────────┐
│  TOP BAR: quest title · zone · XP bar · level       │
├─────────────────────┬───────────────────────────────┤
│                     │                               │
│   GAME PANEL        │   TERMINAL PANEL              │
│   (Canvas)          │   (scrollable history)        │
│                     │                               │
│   Pixel world       │   Command output              │
│   Sprite + NPC      │   Codex expansions            │
│   Zone art          │   ──────────────────          │
│                     │   $ input cursor              │
├─────────────────────┴───────────────────────────────┤
│  ZONE STRIP: zone badges (done / active / locked)   │
├─────────────────────────────────────────────────────┤
│  STATUS BAR: zone · XP · commits/queries · learned  │
└─────────────────────────────────────────────────────┘
```

### 4.2 Beat object schema

Every beat — for both quests — is represented as a plain JS object. This is the canonical data contract between content and engine.

```js
{
  id: "git-beat-07",           // unique, used for localStorage keys
  zone: 2,                     // 1–10
  command: "git add .",        // exact expected input (primary)
  aliases: ["git add -A"],     // other accepted variants
  narrative: "You sweep your arm wide and everything lifts into your satchel at once.",
  npcName: "Sage the Commit Keeper",
  npcLine: "All files gathered, traveler. The staging grounds are ready.",
  terminalOutput: [            // lines rendered in terminal on success
    "✓ map.txt → staged",
    "✓ hero.cfg → staged",
    "✓ README.scroll → staged",
  ],
  terminalOutputError: "That's not quite right. Try: git add .",
  xp: 40,
  unlocksCodex: true,
  codexKey: "git-add-dot",     // key into codex.git.js
  hint: "The dot means everything in the current directory.",
  stateChange: {               // what the engine should update
    allFilesStaged: true,
  },
  specialType: null,           // "vision" | "conflict" | "parallel" | null
}
```

**Special beat types:**
- `"vision"` — Beats 44–46 in GitQuest (the three reset variants shown as parallel visions, not sequential commands). Render all three side-by-side with a toggle UI rather than the standard linear flow.
- `"conflict"` — Beat 34 in GitQuest (editing a file to resolve a merge conflict). Render a diff editor UI instead of a command input.
- `"parallel"` — Any beat where multiple commands are shown together (e.g., `git add X` then `git diff --staged` as one beat).

### 4.3 Codex entry schema

```js
// codex.git.js
"git-add-dot": {
  command: "git add .",
  eli5: "Think of git add like putting things into a shopping cart before you check out. You're not buying yet — you're just saying 'yes, I want these changes in my next save.' The dot means grab everything.",
  savvy: "Moves all changes from the working directory into the index (staging area). The `.` recursively stages all modified and untracked files in the current directory. Only staged changes are included in the next commit.",
  manpage: "`git add [pathspec]` — update the index. `.` adds all. `-p` interactive patch mode (stage hunks). `-u` update tracked files only (skip untracked). `-A` stage all including deletions. `--dry-run` shows what would be staged.",
}
```

### 4.4 Zustand store shape

```js
// gameStore.js
{
  activeQuest: "git" | "sql" | null,

  git: {
    currentBeat: 0,
    completedBeats: [],
    unlockedZones: [1],
    xp: 0,
    level: 1,
    terminalHistory: [],       // last 100 entries max
    openCodexKeys: [],
    gitState: { ... },
  },
  sql: {
    currentBeat: 0,
    completedBeats: [],
    unlockedZones: [1],
    xp: 0,
    level: 1,
    terminalHistory: [],
    openCodexKeys: [],
  },

  submitCommand(input): void,
  advanceBeat(): void,
  openCodex(key): void,
  resetQuest(quest): void,
}
```

### 4.5 Git engine state model

```js
// gitStore.js — the fake repo
{
  initialized: false,
  config: { name: "", email: "" },
  workingDirectory: {
    "README.scroll": true,
    "map.txt": true,
    "hero.cfg": true,
  },
  gitignorePatterns: [],
  index: {},
  commits: [],                 // { hash, message, tree, parent }
  HEAD: "main",
  branches: { main: null },
  stash: [],
  remotes: {},
  tags: {},
}
```

**Git engine must handle:**
- `git init` — set `initialized: true`
- `git config --global user.name/email` — update config
- `git status` — diff workingDirectory vs index vs HEAD commit
- `git add <file>` / `git add .` — move files into index
- `.gitignore` — filter files matching patterns from status/add
- `git commit -m "msg"` — create commit object, advance branch pointer
- `git log` / `git log --oneline` / `git log --oneline --graph`
- `git diff` / `git diff --staged`
- `git restore <file>` — restore from index or HEAD
- `git rm <file>` — remove from working dir and index
- `git mv <old> <new>` — rename in working dir and index
- `git show <hash>` — display commit details
- `git stash` / `git stash pop`
- `git branch [name]` / `git switch <branch>` / `git switch -c <branch>`
- `git merge <branch>` — fast-forward and three-way (with conflict simulation)
- `git remote add <name> <url>` / `git remote -v`
- `git push [-u] [remote] [branch]` / `git fetch` / `git pull`
- `git revert <hash>`
- `git reset --soft/--mixed/--hard HEAD~1` (Beats 44–46 special handling)
- `git reflog`
- `git tag <name> -m "msg"`
- `git cherry-pick <hash>`
- `git blame <file>`

### 4.6 SQL engine approach

**Important:** Do not build a real SQL parser. The SQL evaluator is scripted — each beat maps to exact expected input strings with fuzzy matching. Pre-compute all result sets from the narrative data.

```js
const DATASET = {
  artifacts: [ /* 20–30 representative rows */ ],
  excavators: [ /* 23 rows */ ],
  sites: [ /* 14 rows */ ],
  codex: [ /* final table for Beat 53 */ ],
}
```

**Fuzzy matching rules:**
- Case-insensitive keyword matching
- Whitespace normalization
- Single vs double quote tolerance
- Trailing semicolons optional

**Beats needing special handling:**
- Beats 37–41 (INSERT / UPDATE / DELETE) — mutate in-memory DATASET
- Beat 47 (window functions) — pre-computed result table only
- Beats 48–49 (CTEs) — pre-computed structured output
- Beats 50–51 (CREATE VIEW / SELECT from view) — store view definition
- Beat 53 (final query) — one row at a time, 400ms delay, dramatic effect

---

## 5. UI Components

### 5.1 Terminal component

```
Props:
  history: TerminalEntry[]
  onSubmit: (input) => void
  prompt: string              // e.g. "~/quest-repo (main) $"
  disabled: boolean

TerminalEntry types:
  { type: "command", text: string }
  { type: "output", text: string }
  { type: "success", text: string }   // green
  { type: "error", text: string }     // red
  { type: "info", text: string }      // amber
  { type: "path", text: string }      // purple
  { type: "codex-block", beatId: string }
```

### 5.2 Codex component

Renders inline inside terminal history after a successful command. Collapsed by default ("learn more ✦" button). Click to expand. Click any past command header to re-expand its codex.

```
Props:
  codexKey: string
  quest: "git" | "sql"
  defaultOpen: boolean

Tabs: ELI5 | Savvy | Man page
XP note shown at bottom of expanded codex.
```

### 5.3 Canvas world

**GitWorld zones:**
1. The Empty Cave — dark hollow, elder NPC
2. The Staging Grounds — open courtyard, files glow red/gold
3. The Workshop — forge interior, diff mirror prop
4. The Watchtower — tall tower, sanctum wall visible
5. The Branching Forest — forest with forking paths
6. The Merge Shrine — stone altar
7. The Remote Peaks — mountains, vault structure
8. The Time Vaults — underground chamber
9. The Guild Hall — grand hall, multiple NPCs
10. The Sanctum Spire — peak, final vista

**SQLWorld zones:**
1. The Surface Layer — desert surface, first trench
2. The Filter Chamber — deeper trench, chisel props
3. The Sorting Hall — cataloguing hall, tablet stacks
4. The Measurement Vaults — accounting chamber
5. The Guild Records — administrative quarter
6. The Connection Bridges — two buildings + stone bridge
7. The Outer Archives — outer archive building
8. The Inscription Workshop — scribe's chamber
9. The Deep Vaults — innermost sanctum
10. The Grand Archive — apex library, Codex tablet

**Canvas conventions:**
- Tile size: 16px
- Sprite: 14×24px pixel art, animate with `requestAnimationFrame`
- NPC: stationary, bobbing idle animation (sin wave)
- World state props update on beat completion
- No external canvas library — raw 2D context only

### 5.4 Home screen

Two quest cards side by side. If progress exists, show "Resume (Zone X, Beat Y)" and a secondary "Restart" link.

---

## 6. localStorage Schema

Key: `questforge-save`

```json
{
  "version": 1,
  "git": {
    "currentBeat": 14,
    "completedBeats": ["git-beat-01", "git-beat-02"],
    "unlockedZones": [1, 2, 3],
    "xp": 280,
    "level": 3,
    "openCodexKeys": ["git-init", "git-status"],
    "terminalHistory": [],
    "gitState": {}
  },
  "sql": {
    "currentBeat": 0,
    "completedBeats": [],
    "unlockedZones": [1],
    "xp": 0,
    "level": 1,
    "openCodexKeys": [],
    "terminalHistory": []
  }
}
```

- Save on every state change (debounce 500ms)
- Terminal history capped at 100 entries
- Version field for future migration handling

---

## 7. XP and Leveling

```
Lv 1:    0 XP   "Newcomer"
Lv 2:  100 XP   "Apprentice"
Lv 3:  250 XP   "Journeyman"
Lv 4:  500 XP   "Adept"
Lv 5:  800 XP   "Veteran"
Lv 6: 1200 XP   "Master"
Lv 7: 1800 XP   "Lorekeeper"  (max for one quest)
```

Zone unlock: automatic when all beats in current zone are complete.

---

## 8. Hint System

- After 2 failed attempts: hint button appears in terminal
- After 4 failed attempts: hint auto-displays
- Hint text from beat object `hint` field
- No XP penalty
- Terminal renders: `  ✦ hint: [hint text]` in amber

---

## 9. Special Beat Handling

### 9.1 Reset visions (GitQuest Beats 44–46)

Three parallel alternatives, not sequential commands. Render a "vision panel" with three side-by-side cards (`--soft`, `--mixed`, `--hard`). Player must type all three in any order to advance. Git engine applies each in a simulation sandbox only.

### 9.2 Merge conflict (GitQuest Beat 34)

Render a `<textarea>` pre-filled with conflict-marked `hero.cfg`. Validator checks: no conflict markers remain, both changes present. On success: treat as `git add hero.cfg`.

### 9.3 Multi-command beats

Split into sub-steps within the same beat. Beat only advances after all sub-steps complete.

### 9.4 Window functions (SQLQuest Beat 47)

Accept the exact query string (fuzzy matched). Display pre-rendered result table. Codex note: "This result is pre-computed for illustration."

### 9.5 Final beat dramatic output (SQLQuest Beat 53)

Return rows one at a time with 400ms delay. Trigger completion screen after the last row.

---

## 10. Completion Flow

**Per-zone:** Flash zone badge to done, NPC congratulations, next zone path opens on canvas.

**Quest complete screen:** Full-screen overlay, total XP, final level, full command list learned, CTAs: "Return to home" and "Play again."

---

## 11. GitQuest — Zone and Beat Map

| Zone | Name | Beats | Commands |
|---|---|---|---|
| 1 | The Empty Cave | 1–3 | `git init`, `git config user.name`, `git config user.email` |
| 2 | The Staging Grounds | 4–11 | `git status`, `git add <file>`, `git add .`, `.gitignore`, `git commit -m`, `git log` |
| 3 | The Workshop | 12–18 | `git diff`, `git diff --staged`, `git restore`, `git rm`, `git mv`, `git commit` |
| 4 | The Watchtower | 19–23 | `git log --oneline`, `--graph`, `git show`, `git stash`, `git stash pop` |
| 5 | The Branching Forest | 24–30 | `git branch`, `git switch`, list branches, `git switch -c`, commit on branch |
| 6 | The Merge Shrine | 31–36 | `git merge` (FF), `git merge` (conflict), resolve, `git add`, `git commit` |
| 7 | The Remote Peaks | 37–41 | `git remote add`, `git remote -v`, `git push -u`, `git fetch`, `git pull` |
| 8 | The Time Vaults | 42–48 | `git log`, `git revert`, `git reset --soft`, `--mixed`, `--hard`, `git reflog`, `git reset --hard <hash>` |
| 9 | The Guild Hall | 49–51 | `git tag`, `git cherry-pick`, `git blame` |
| 10 | The Final Commit | 52 | `git push origin main` |

---

## 12. SQLQuest — Zone and Beat Map

| Zone | Name | Beats | Queries |
|---|---|---|---|
| 1 | The Surface Layer | 1–4 | `SELECT *`, `SELECT columns`, multiple tables |
| 2 | The Filter Chamber | 5–12 | `WHERE`, `AND`, `OR`, `NOT`, `LIKE`, `BETWEEN`, compound conditions |
| 3 | The Sorting Hall | 13–18 | `ORDER BY`, `DESC`, multi-column sort, `LIMIT`, `OFFSET`, aliases |
| 4 | The Measurement Vaults | 19–23 | `COUNT`, `AVG`, `MIN`, `MAX`, `SUM` |
| 5 | The Guild Records | 24–28 | `GROUP BY`, aggregate per group, `HAVING` |
| 6 | The Connection Bridges | 29–32 | `JOIN`, multi-table join, `WHERE` on joined result |
| 7 | The Outer Archives | 33–36 | `LEFT JOIN`, `COUNT` with LEFT JOIN, `IS NULL`, `IS NOT NULL` |
| 8 | The Inscription Workshop | 37–41 | `INSERT`, `UPDATE`, `DELETE` |
| 9 | The Deep Vaults | 42–46 | `DISTINCT`, subqueries, `IN (subquery)`, `CASE WHEN` |
| 10 | The Grand Archive | 47–53 | Window functions, CTEs, `CREATE VIEW`, view queries, final JOIN, final query |

---

## 13. MVP Scope

### In v1
- Home screen with quest picker and progress summary
- GitQuest — all 10 zones, 52 beats, fully playable
- SQLQuest — all 10 zones, 53 beats, fully playable
- Fake git engine (all commands in Section 4.5)
- SQL scripted evaluator (all 53 beats)
- Pixel world canvas for both quests
- Terminal component with command history
- Codex inline expansion with ELI5 / Savvy / Man page tabs
- XP system and zone unlock gates
- Hint system
- localStorage persistence
- Special beat handling (reset visions, conflict editor, dramatic final output)
- Quest completion screen
- Vercel deploy

### Deferred (post-v1)
- Mobile layout, sound effects, animated transitions
- Shareable completion card, GitHub OAuth, cloud saves
- Third quest (Bash, RegEx, etc.), speedrun timer, analytics

---

## 14. Key Technical Risks

**High:** Fake git engine — spike and test independently before wiring to UI. SQL evaluator — scripted only, never a real parser.

**Medium:** Beat 44–46 reset visions (non-standard UI), Beat 47 window functions (pre-compute entirely), Beat 34 conflict editor (simple textarea).

**Low:** localStorage size (cap terminal history at 100), canvas performance (debounce resize).

---

## 15. Build Order

1. Scaffold Vite + React + Tailwind + React Router + Zustand
2. Deploy empty shell to Vercel on day 1
3. Build UI shell — terminal, codex, zone strip, XP bar
4. Build home screen
5. Author `beats.git.js` and `codex.git.js`
6. Build git engine — spike beats 1–11 first
7. Extend git engine through all 52 beats
8. Wire GitWorld canvas
9. Author `beats.sql.js` and `codex.sql.js`
10. Build SQL scripted evaluator + dataset
11. Wire SqlWorld canvas
12. Build special beat handlers
13. Build completion screens
14. QA pass — all 105 beats, localStorage, edge cases
15. Custom domain, OG image, meta tags, ship

---

---

# Section 16: GitQuest — Full Narrative Script

## GitQuest: The Repo Chronicles
### 52 Beats · 10 Zones

---

### PROLOGUE — The Awakening

You are a Code Wanderer, newly arrived in the realm of Versia — a world where history is power, and those who cannot track their changes are doomed to repeat their mistakes. A dying elder hands you an empty satchel and whispers: *"Build your archive. The realm depends on it."*

---

### ZONE 1 — The Empty Cave
**Setting:** A dark hollow at the edge of Versia. Nothing here yet. Just you and raw potential.

---

**Beat 1 — `git init`**

The elder points to the cave floor. "Before you can track anything, you must consecrate this ground." You drive your staff into the earth. A hidden chamber hums to life beneath your feet — the `.git` sanctum, invisible but ever-present. The cave is now a Repository.

> *"Initialized empty Git repository — the sanctum awakens."*

**Technical:** `git init` creates a hidden `.git` directory in the current folder, turning it into a Git repository that can track changes.

---

**Beat 2 — `git config --global user.name "YourName"`**

A stone tablet near the entrance demands identity. "The archive must know its keeper," the elder says. You carve your name into the tablet. Every record you create will bear this mark forever.

> *"The archive now knows you by name."*

**Technical:** `git config --global user.name` sets the author name attached to all your commits across every repository on this machine.

---

**Beat 3 — `git config --global user.email "you@email.com"`**

The tablet has a second line. A raven will carry word of your commits to the realm — it needs an address to return to. You inscribe your sigil.

> *"The raven knows where to find you."*

**Technical:** `git config --global user.email` sets the email address attached to all your commits. Services like GitHub use this to link commits to your account.

---

### ZONE 2 — The Staging Grounds
**Setting:** A vast open courtyard outside the cave. Files litter the ground — scrolls, maps, artifacts. Nothing is organized. Nothing is safe.

---

**Beat 4 — `git status`**

You survey the courtyard. Three items lie scattered: a `README.scroll`, a `map.txt`, and a `hero.cfg`. None are protected. The elder shakes his head. "You cannot commit to memory what you haven't gathered." The ground glows red beneath each item.

> *"Untracked files: README.scroll, map.txt, hero.cfg"*

**Technical:** `git status` shows the current state of your working directory and staging area — which files are untracked, modified, or staged for commit.

---

**Beat 5 — `git add README.scroll`**

You pick up the README scroll first — it describes who you are and why you're here. You place it in your satchel. It glows gold. Staged. Not yet permanent, but ready.

> *"README.scroll added to the staging area."*

**Technical:** `git add <file>` moves a specific file into the staging area (index), marking it for inclusion in the next commit.

---

**Beat 6 — `git add map.txt`**

The map of Versia is next. Without it you'd wander blind. Into the satchel it goes.

> *"map.txt staged."*

**Technical:** Each `git add` stages one file at a time, giving you precise control over what enters the next commit.

---

**Beat 7 — `git add .`**

You notice more files scattered around the courtyard — notes, configs, fragments you missed on your first pass. No time to gather them one by one. You sweep your arm wide and everything lifts into your satchel at once. The dot means everything in this directory.

> *"All files staged."*

**Technical:** `git add .` stages all untracked and modified files in the current directory and its subdirectories. It captures everything — new files, edits, deletions.

---

**Beat 8 — `echo "*.log" > .gitignore`**

The elder stops you. "Not everything belongs in the archive. Build logs, personal notes, secret keys — some things should never be tracked." He hands you a ward stone — a flat tablet you carve with patterns. Anything whose name matches these patterns becomes invisible to the sanctum. You carve `*.log` into the stone and place it at the courtyard entrance. The scattered log files flicker and fade from the sanctum's awareness, though they remain on the ground.

> *".gitignore created — matching files will never be staged or tracked."*

**Technical:** `.gitignore` is a file containing patterns (like `*.log`, `node_modules/`, `.env`) that tell Git to ignore matching files. Ignored files won't appear in `git status` and can't be staged with `git add`.

---

**Beat 9 — `git status`**

You check your satchel. Everything glows gold now — except the log files, which the ward stone has made invisible. The elder nods. "Now you are ready to make it real."

> *"Changes staged and ready to commit."*

**Technical:** Running `git status` again confirms what's staged (green), what's modified but unstaged (red), and what's ignored (hidden entirely).

---

**Beat 10 — `git commit -m "begin the journey"`**

You press your satchel to the sanctum stone. A flash. The courtyard clears. A permanent record crystallizes in the archive — your first checkpoint. The realm shudders faintly, acknowledging you exist.

> *"[main a3f9c12] begin the journey — 4 files changed"*

**Technical:** `git commit -m "message"` takes everything in the staging area and creates a permanent snapshot (commit) with a descriptive message. The commit gets a unique hash (like a3f9c12).

---

**Beat 11 — `git log`**

You inspect the sanctum wall. Your commit glows there, etched in light — hash, name, timestamp, message. One stone in what will become a great wall. The elder says, "Every stone you lay, you can return to. Never forget that."

> *"commit a3f9c12 — begin the journey"*

**Technical:** `git log` displays the commit history — each entry shows the full hash, author, date, and commit message. Press `q` to exit the log viewer.

---

### ZONE 3 — The Workshop
**Setting:** A cluttered forge inside the cave. You've been working — things have changed, broken, moved.

---

**Beat 12 — `git diff`**

You've been editing the map — you think you improved it, but something feels off. You hold it up to the sanctum light. Red lines show what you removed; green lines show what you added. The diff is a mirror that shows only change.

> *"- Here be dragons / + Here be dragons (confirmed, NW quadrant)"*

**Technical:** `git diff` shows line-by-line differences between your working directory and the staging area. Red (`-`) lines are removed; green (`+`) lines are added.

---

**Beat 13 — `git add map.txt` → `git diff --staged`**

You stage the map update but want one last look before committing. You invoke the staged mirror — it shows exactly what will be crystallized. Satisfied, you nod.

> *"Staged diff confirmed — change is intentional."*

**Technical:** `git diff --staged` (or `--cached`) shows the differences between the staging area and the last commit — exactly what your next commit will contain.

**specialType:** `"parallel"`

---

**Beat 14 — `git commit -m "update dragon location on map"`**

The updated map is sealed. Another stone on the wall. The forge smells of certainty.

> *"[main b7c2a31] update dragon location on map"*

**Technical:** Each commit creates a new snapshot. The previous commit is now the parent of this one, forming a chain (the commit history).

---

**Beat 15 — `git restore hero.cfg`**

In a moment of panic you overwrote your hero config — your stats, your name, your class. All gone. But the sanctum remembers. You speak the restore word and the file shimmers back to the version in your staging area — or if nothing is staged, the last committed version. Your reckless edits vanish.

> *"hero.cfg restored to its last known good state."*

**Technical:** `git restore <file>` discards working directory changes by restoring from the index (staging area) first, or from HEAD if the file isn't staged. Use `git restore --source HEAD <file>` to always restore from the last commit explicitly.

---

**Beat 16 — `git rm old_notes.txt`**

Ancient notes from a previous wanderer clutter your archive — wrong era, wrong realm. You don't just delete them from the floor; you tell the sanctum to stop tracking them. They dissolve from both the courtyard and the staging area — but the sanctum's wall still remembers they once existed. Previous commits preserve their history.

> *"old_notes.txt removed from working tree and index."*

**Technical:** `git rm <file>` deletes the file from your working directory and stages the removal. After committing, the file won't exist in the current snapshot — but it's still recoverable from any previous commit where it existed.

---

**Beat 17 — `git mv map.txt maps/world_map.txt`**

The archive is growing. A single map shouldn't sit loose — it belongs in a `maps/` vault. You move it. The sanctum tracks the rename so history flows unbroken.

> *"map.txt → maps/world_map.txt — history preserved."*

**Technical:** `git mv <old> <new>` renames/moves a file and stages the change. Git detects renames by content similarity, so history follows the file to its new location.

---

**Beat 18 — `git commit -m "reorganize archive structure"`**

The workshop is tidy. You seal the reorganization into the wall. Three stones now. The elder looks pleased for the first time.

> *"[main d1e4f22] reorganize archive structure"*

**Technical:** Commits that reorganize files (renames, moves, deletions) are recorded just like content changes. `git log --follow <file>` can trace a file's history across renames.

---

### ZONE 4 — The Watchtower
**Setting:** A tall tower overlooking all of Versia. From here you can see the full history of the realm.

---

**Beat 19 — `git log --oneline`**

From the top of the watchtower, the sanctum wall stretches back into the horizon. Too detailed to read at this distance. You squint — and the wall simplifies, each stone showing just a short hash and a message. Clean. Scannable.

> *"d1e4f22 reorganize archive structure / b7c2a31 update dragon location / a3f9c12 begin the journey"*

**Technical:** `git log --oneline` condenses each commit to a single line: abbreviated hash + commit message. Useful for quickly scanning history.

---

**Beat 20 — `git log --oneline --graph`**

A messenger bird appears beside you and draws lines between the stones — branches and merges you haven't made yet are foreshadowed as empty channels. For now the line is straight. "It won't always be," the elder warns.

> *"* d1e4f22 reorganize / * b7c2a31 update map / * a3f9c12 begin"*

**Technical:** `--graph` adds ASCII art showing branch and merge topology. Combined with `--oneline`, it gives a compact visual map of your project's branching history.

---

**Beat 21 — `git show d1e4f22`**

You reach out and touch the reorganization stone. It blooms open — full details, the exact changes, who made them, when. The watchtower is also a microscope.

> *"commit d1e4f22 — full diff and metadata revealed."*

**Technical:** `git show <commit>` displays a specific commit's metadata (author, date, message) and its full diff — every line changed in that commit.

---

**Beat 22 — `git stash`**

A scout arrives with urgent news: the Dragon has moved. You're mid-edit on a new spell scroll but it's not ready to commit. You can't bring unfinished work into battle. You whisper to the sanctum and your half-finished scroll vanishes into a hidden pocket — the stash. The courtyard clears. You're ready to move.

> *"Saved working directory state to stash."*

**Technical:** `git stash` temporarily shelves all modified tracked files and staged changes, reverting your working directory to the last commit. Your work is saved on a stack, not lost.

---

**Beat 23 — `git stash pop`**

The dragon threat was a false alarm. You return to the tower and call your scroll back from the pocket. It reappears exactly as you left it — every half-written line intact.

> *"Stash restored — work continues."*

**Technical:** `git stash pop` reapplies the most recently stashed changes to your working directory and removes them from the stash stack. Use `git stash apply` to restore without removing.

---

### ZONE 5 — The Branching Forest
**Setting:** A dense forest where the path literally forks. Each fork is a different version of Versia's future.

---

**Beat 24 — `git branch dragon-quest`**

At the forest's edge you see two paths. The elder says: "Do not experiment on the main road. Grow a new branch." You plant a sapling beside the path. It instantly becomes a parallel trail labeled `dragon-quest`. The main road remains untouched.

> *"Branch 'dragon-quest' created."*

**Technical:** `git branch <name>` creates a new branch pointer at the current commit. It does not switch to the new branch — you're still on your current branch.

---

**Beat 25 — `git switch dragon-quest`**

You step off the main road onto the new branch trail. The world shifts subtly — same forest, different potential. Whatever you do here won't affect the main road until you choose to bring it back.

> *"Switched to branch 'dragon-quest'."*

**Technical:** `git switch <branch>` moves HEAD to the specified branch and updates your working directory to match. New commits will advance this branch, not main.

---

**Beat 26 — `git branch`**

You call out into the forest to hear which paths exist. Two voices echo back: `main` and `dragon-quest`. An asterisk marks the one you're standing on.

> *"  main / * dragon-quest"*

**Technical:** `git branch` (no arguments) lists all local branches. The asterisk (`*`) indicates your current branch (where HEAD points).

---

**Beat 27 — `git add dragon_spell.txt` → `git commit -m "draft dragon banishment spell"`**

You've written a new spell specifically for this quest. You stage it and commit it to the `dragon-quest` branch's history. The main road doesn't know this spell exists yet.

> *"[dragon-quest e5a8b11] draft dragon banishment spell"*

**Technical:** Commits on a branch only advance that branch's pointer. Other branches remain at their previous positions, unaware of the new work.

**specialType:** `"parallel"`

---

**Beat 28 — `git switch main`**

You step back onto the main road. The `dragon_spell.txt` is gone from your satchel — it lives on the other path, waiting. The main road is exactly as you left it. This is the power of branches.

> *"Switched to branch 'main'. Working tree clean."*

**Technical:** Switching branches updates your working directory to match the target branch's latest commit. Files that exist only on another branch disappear (safely — they're still there when you switch back).

---

**Beat 29 — `git switch -c scout-report`**

A second quest emerges simultaneously — scouts have found ruins to the east. You can't neglect either quest. You create and step onto a new branch in one motion.

> *"Switched to new branch 'scout-report'."*

**Technical:** `git switch -c <name>` combines `git branch <name>` and `git switch <name>` — creating a new branch and switching to it in one command.

---

**Beat 30 — `git add ruins_notes.txt` → `git commit -m "document eastern ruins discovery"`**

You commit the ruins findings to this branch. Two parallel quests, two parallel histories, one main road that knows nothing of either yet.

> *"[scout-report f2c9d44] document eastern ruins discovery"*

**Technical:** You now have three branches diverging from the same point. Each has its own commit history that can be developed independently.

**specialType:** `"parallel"`

---

### ZONE 6 — The Merge Shrine
**Setting:** A sacred stone altar where paths converge. Merging is a ritual — sometimes peaceful, sometimes painful.

---

**Beat 31 — `git switch main`**

Both quests are complete. You return to the main road to begin the convergence ritual.

> *"Switched to branch 'main'."*

**Technical:** You must be on the receiving branch (the one you want to merge into) before running `git merge`. Typically this is `main`.

---

**Beat 32 — `git merge scout-report`**

You hold the `scout-report` branch scroll to the shrine altar. The sanctum reads it — clean, no contradictions with `main`. Since `main` hasn't moved since `scout-report` branched off, the road simply extends forward to include the scout's work. No new merge stone is needed — the `main` pointer slides ahead.

> *"Fast-forward merge — ruins_notes.txt integrated."*

**Technical:** A fast-forward merge happens when the target branch has no new commits since the source branched off. Git simply moves the branch pointer forward — no merge commit is created. The history stays linear.

---

**Beat 33 — `git merge dragon-quest`**

You bring the dragon spell branch to the altar. But the shrine shudders. Both branches edited `hero.cfg` — the main road updated your armor, while the dragon quest updated your weapon. The sanctum cannot decide which is right. Conflict markers appear like wounds in the file.

> *"CONFLICT in hero.cfg — automatic merge failed."*

**Technical:** A merge conflict occurs when two branches modify the same lines in the same file. Git can't automatically decide which version to keep, so it marks the conflict in the file and pauses the merge for you to resolve manually.

---

**Beat 34 — (edit hero.cfg to resolve conflict)**

You open `hero.cfg` and see the battle scars — `<<<<<<< HEAD`, `=======`, `>>>>>>> dragon-quest`. You read both versions. You keep both changes — armor and weapon. You carefully remove the markers, leaving clean text.

> *"Conflict resolved manually in hero.cfg."*

**Technical:** Conflict markers show both versions: everything between `<<<<<<< HEAD` and `=======` is your current branch; everything between `=======` and `>>>>>>> branch-name` is the incoming branch. Edit the file to the desired final state and remove all markers.

**specialType:** `"conflict"`

---

**Beat 35 — `git add hero.cfg`**

You hold the healed file to the shrine. Staging a resolved conflict tells the sanctum: "I have decided. This is the truth."

> *"hero.cfg marked as resolved."*

**Technical:** After resolving conflicts, `git add <file>` marks the file as resolved. Git uses the staging area to track which conflicts you've addressed.

---

**Beat 36 — `git commit -m "merge dragon quest — hero fully equipped"`**

The shrine glows. Both storylines crystallize into one. The merge commit has two parents — it is the confluence of two rivers. The main road now carries all knowledge from both quests.

> *"[main 9a3c2f1] merge dragon quest — hero fully equipped"*

**Technical:** A merge commit has two parent commits — one from each branch. It records the point where divergent histories were reconciled. `git log --graph` will show the two lines converging at this commit.

---

### ZONE 7 — The Remote Peaks
**Setting:** Towering mountains beyond Versia. Other Wanderers keep their archives in a great Vault at the summit — the Remote.

---

**Beat 37 — `git remote add origin https://vault.versia.io/repo`**

You've found the great Vault. You can't just walk in — you must register its address with your sanctum so the two can communicate. You inscribe the Vault's sigil on your sanctum stone and name it `origin`.

> *"Remote 'origin' added."*

**Technical:** `git remote add <name> <url>` registers a remote repository's URL under a short alias. `origin` is the conventional name for your primary remote (e.g., GitHub, GitLab).

---

**Beat 38 — `git remote -v`**

You read back the inscription to confirm it's correct — both the fetch address and the push address. The elder checks over your shoulder and nods.

> *"origin  https://vault.versia.io/repo (fetch/push)"*

**Technical:** `git remote -v` lists all configured remotes with their URLs. Each remote has a fetch URL (for downloading) and a push URL (for uploading), which are usually the same.

---

**Beat 39 — `git push -u origin main`**

You send a raven carrying your entire `main` branch history to the Vault. The `-u` flag forges a permanent bond — from now on, `push` and `pull` on this branch know where to go without being told.

> *"Branch 'main' set up to track 'origin/main'. History uploaded."*

**Technical:** `git push -u origin main` uploads your local `main` branch to the remote named `origin` and sets up tracking. After this, `git push` and `git pull` on this branch work without specifying the remote and branch.

---

**Beat 40 — `git fetch`**

Word reaches you that another Wanderer has added to the Vault. You call a scout raven to retrieve what's new — but instruct it only to report, not to change anything in your camp yet. The new data arrives in your sanctum's observation chamber, unmerged.

> *"Fetched origin/main — 2 new commits downloaded."*

**Technical:** `git fetch` downloads new commits and branches from the remote but does not modify your working directory or current branch. The data is stored in remote-tracking branches (like `origin/main`) for you to inspect before integrating.

---

**Beat 41 — `git pull`**

You're ready to integrate the other Wanderer's changes. Pull does what fetch did, then immediately merges — the raven reports and the scribe integrates. Your camp now reflects the full shared history.

> *"Already up to date + 2 commits merged from origin/main."*

**Technical:** `git pull` is shorthand for `git fetch` followed by `git merge`. It downloads remote changes and immediately merges them into your current branch. If there are conflicts, you resolve them just like a local merge.

---

### ZONE 8 — The Time Vaults
**Setting:** A hidden chamber beneath the sanctum where all of time's mistakes are preserved. Not erased — just archived.

---

**Beat 42 — `git log --oneline`**

You survey the wall to find your bearings. Seven stones now. The elder warns: "What you do in this chamber echoes. Tread carefully."

> *"7 commits displayed."*

**Technical:** Before using any history-rewriting commands, always check your current commit history with `git log` to understand where you are.

---

**Beat 43 — `git revert 9a3c2f1`**

You discover the merge commit introduced a cursed artifact into `hero.cfg`. You cannot simply erase it — the Vault already has it. Instead you cast a counter-spell: `revert` creates a new commit that undoes the damage, preserving the original mistake in history for honesty. Safe. Auditable.

> *"[main c4d1e88] Revert 'merge dragon quest' — curse removed"*

**Technical:** `git revert <commit>` creates a new commit that applies the inverse of the specified commit's changes. Unlike `reset`, it doesn't rewrite history — making it safe to use on shared/pushed branches.

---

**Beat 44 — `git reset --soft HEAD~1` (first vision)**

The elder leads you to a simulation chamber. "There are three levels of undoing. Let me show you each."

**First vision — `git reset --soft HEAD~1`:** The last stone dissolves from the wall, but everything remains in your satchel, staged and ready. You could recommit immediately with a better message.

> *"HEAD moved back 1 commit — changes remain staged."*

**Technical:** `git reset --soft HEAD~1` moves HEAD back one commit but leaves the staging area and working directory untouched. Your changes are still staged, ready to be recommitted. Useful for amending the most recent commit.

**specialType:** `"vision"`

---

**Beat 45 — `git reset --mixed HEAD~1` (second vision)**

**Second vision — `git reset --mixed HEAD~1`:** The stone dissolves and your satchel empties, but the scrolls are still on the courtyard floor. Nothing is lost from disk — everything is simply unstaged.

> *"HEAD moved back — changes unstaged but preserved on disk."*

**Technical:** `git reset --mixed HEAD~1` (the default mode) moves HEAD back and clears the staging area, but preserves all changes in your working directory as unstaged modifications. You can selectively re-add and recommit.

**specialType:** `"vision"`

---

**Beat 46 — `git reset --hard HEAD~1` (third vision)**

**Third vision — `git reset --hard HEAD~1`:** The most dangerous spell. The stone dissolves, the satchel empties, and the scrolls on the floor vanish. HEAD, the index, and the working directory all snap to the previous commit. Any uncommitted work is gone. The elder's eyes are grave. "Use this only when you're certain."

> *"HEAD moved back — everything reverted. Uncommitted work is lost."*

**Technical:** `git reset --hard` moves HEAD back and overwrites both the staging area and working directory to match the target commit. Any uncommitted changes are permanently destroyed. Never use on shared/pushed commits.

**specialType:** `"vision"`

---

**Beat 47 — `git reflog`**

The elder shows you one last secret in the Time Vault — a hidden ledger. Even after a hard reset, every single movement of HEAD is recorded here. You scan it and spot a hash you thought was lost forever.

> *"Reflog shows: HEAD@{2} = e5a8b11 — the lost commit found."*

**Technical:** `git reflog` shows a log of every time HEAD moved — commits, resets, checkouts, merges. Even "lost" commits remain in the reflog for ~90 days, making it a safety net for recovery.

---

**Beat 48 — `git reset --hard e5a8b11`**

Armed with the recovered hash, you invoke the hard reset with purpose and precision. You snap to that exact moment, restoring a commit you thought was lost.

> *"HEAD is now at e5a8b11 — timeline restored."*

**Technical:** `git reset --hard <hash>` can target any commit hash, not just relative positions. Combined with `git reflog`, it's a powerful recovery tool for undoing mistakes.

---

### ZONE 9 — The Guild Hall
**Setting:** A grand hall where Wanderers collaborate, celebrate milestones, and trace the origins of ideas.

---

**Beat 49 — `git tag v1.0 -m "hero fully trained"`**

The Guild declares this moment a milestone. You chisel a named marker into the sanctum wall — not just a hash, but a name the whole realm can reference. Version 1.0. A fixed star in the commit sky.

> *"Tag 'v1.0' created at current HEAD."*

**Technical:** `git tag <name> -m "message"` creates an annotated tag — a permanent, named reference to a specific commit. Unlike branches, tags don't move. They're used for releases, milestones, and version numbers.

---

**Beat 50 — `git cherry-pick e5a8b11`**

An ally on a different branch made one perfect commit — a healing potion recipe — that you desperately need right now, without merging their entire branch. You reach across the forest, pluck that single commit, and apply it to your branch. Just the one stone, transplanted.

> *"[main d8f3a22] cherry-picked — healing_potion.txt added."*

**Technical:** `git cherry-pick <commit>` copies a single commit from another branch and applies it to your current branch as a new commit. It does not merge the source branch — only that one commit's changes are replicated.

---

**Beat 51 — `git blame healing_potion.txt`**

A dispute breaks out in the Guild: who wrote the potion recipe's critical third line? You invoke the blame ritual — every line of the file lights up with the commit hash and name of whoever last touched it. Truth, line by line.

> *"d8f3a22 (AllyWanderer) + pinch of dragon salt"*

**Technical:** `git blame <file>` annotates each line of a file with the commit hash, author, and timestamp of the last change to that line. Invaluable for understanding who changed what and when.

---

### ZONE 10 — The Final Commit
**Setting:** The peak of the Sanctum Spire. The realm is saved. One last act remains.

---

**Beat 52 — `git push origin main`**

The Dragon is defeated. The ruins are mapped. The Guild is united. Your local archive — commits, merged branches, one tag — is complete. You send the final raven to the Vault. The full history of your heroism uploads to `origin`. It is permanent now. Shared. The realm can see what you built, and how you built it, commit by commit.

The elder smiles. *"A Wanderer who tracks their changes is a Wanderer who can never truly lose."*

> *"Everything up to date. Your legend is now in the Vault."*

**Technical:** `git push origin main` uploads your local commits to the remote repository. Once pushed, your work is backed up and available to all collaborators.

🏆 **GitQuest Complete — 52 beats, 10 zones, 1 repo.**

---

---

# Section 17: SQLQuest — Full Narrative Script

## SQLQuest: The Buried City
### 53 Beats · 10 Zones

---

### PROLOGUE — The Discovery

You are an Archaeologist arriving at a vast desert excavation site. Beneath the sand lies Queryra — an ancient city whose entire history was encoded into stone tablets arranged in perfect grids. The locals call them *Tables*. A veteran excavator hands you a lantern and a chisel. *"The city speaks only to those who ask the right questions,"* she says. *"Learn to query, and the dead will tell you everything."*

---

### ZONE 1 — The Surface Layer
**Setting:** The topmost excavation trench. Dust everywhere. Tablets half-buried. You're learning to read.

---

**Beat 1 — `SELECT * FROM artifacts`**

You brush sand from the first tablet grid. The asterisk is an ancient symbol meaning everything — you want to see every column, every row, every artifact the city recorded. The full grid illuminates. Overwhelming, but it's a start.

> *"2,847 rows returned — every artifact in the city's record."*

**Technical:** `SELECT * FROM table_name` retrieves all columns and all rows from a table. The `*` is a wildcard meaning "every column." Useful for exploration, but in practice you should select only the columns you need.

---

**Beat 2 — `SELECT name, age FROM artifacts`**

Too much data to process. You narrow your lantern beam — you only need the artifact's name and its age. The other columns fade into shadow. The same 2,847 artifacts, but only the two facts you care about.

> *"name, age columns returned across all rows."*

**Technical:** Listing specific column names after `SELECT` returns only those columns, reducing the data you transfer and read. This is called projection.

---

**Beat 3 — `SELECT name FROM excavators`**

A second table lurks beneath the first — the `excavators` grid, recording every worker who ever dug here. You read just their names. Twenty-three names emerge from the stone.

> *"23 excavator names returned."*

**Technical:** Databases contain multiple tables, each storing a different type of data. You query them independently by changing the `FROM` clause.

---

**Beat 4 — `SELECT * FROM sites`**

A third table: excavation `sites` — grid references, depths, discovery dates. You pull the whole thing. The city is bigger than you imagined.

> *"14 active dig sites recorded."*

**Technical:** Understanding which tables exist and what they contain is the first step in working with any database. Many databases provide commands like `SHOW TABLES` or `\dt` to list all available tables.

---

### ZONE 2 — The Filter Chamber
**Setting:** A deeper trench with thousands of tablets. You need precision now — the city's full record is too vast to read whole.

---

**Beat 5 — `SELECT * FROM artifacts WHERE era = 'Bronze Age'`**

Most tablets are irrelevant to your current question. You invoke the WHERE clause — a chisel that chips away everything outside your criteria. Only Bronze Age artifacts survive the filter. The pile shrinks dramatically.

> *"341 rows returned — Bronze Age artifacts only."*

**Technical:** `WHERE` filters rows based on a condition. Only rows where the condition evaluates to true are included in the results. String values are enclosed in single quotes.

---

**Beat 6 — `SELECT * FROM artifacts WHERE age > 3000`**

The veteran says the city's oldest secrets are in the deepest layers. You filter by age — only artifacts older than 3,000 years. The stone grid thins to its most ancient entries.

> *"89 rows — artifacts over 3,000 years old."*

**Technical:** Comparison operators (`>`, `<`, `>=`, `<=`, `=`, `!=` or `<>`) work with numbers, dates, and strings. They're the primary building blocks of `WHERE` conditions.

---

**Beat 7 — `SELECT * FROM artifacts WHERE era = 'Bronze Age' AND age > 3000`**

You need both conditions true simultaneously. AND is a double-lock — Bronze Age and ancient. The intersection is small and precious.

> *"12 rows — old Bronze Age artifacts specifically."*

**Technical:** `AND` requires all conditions to be true. It narrows your results. The more `AND` conditions you add, the fewer rows typically survive.

---

**Beat 8 — `SELECT * FROM artifacts WHERE era = 'Bronze Age' OR era = 'Iron Age'`**

A rival theory emerges — the secret could be in either era. OR broadens your net: Bronze Age or Iron Age, either will do. The pile grows back.

> *"598 rows — Bronze and Iron Age combined."*

**Technical:** `OR` requires at least one condition to be true. It broadens your results. Rows matching either (or both) conditions are included.

---

**Beat 9 — `SELECT * FROM artifacts WHERE NOT era = 'Modern'`**

Modern replicas contaminate the site — tourists, fraudsters, previous careless diggers. You exclude everything Modern. NOT inverts the filter like flipping a tablet face-down.

> *"2,701 rows — all non-modern artifacts."*

**Technical:** `NOT` negates a condition. `NOT era = 'Modern'` is equivalent to `era != 'Modern'` or `era <> 'Modern'`. It's most useful with complex conditions: `NOT (era = 'Modern' AND condition = 'pristine')`.

---

**Beat 10 — `SELECT * FROM artifacts WHERE name LIKE 'Obsidian%'`**

You vaguely remember an artifact starting with "Obsidian" but can't recall the full name. You carve a partial pattern into your chisel — the `%` wildcard matches anything that follows. Three artifacts surface: Obsidian Idol, Obsidian Blade, Obsidian Mirror.

> *"3 rows — all artifacts with names starting 'Obsidian'."*

**Technical:** `LIKE` enables pattern matching. `%` matches zero or more characters, `_` matches exactly one character. `'%dragon%'` finds "dragon" anywhere in the string. `LIKE` is case-sensitive in most databases; use `ILIKE` (PostgreSQL) or `LOWER()` for case-insensitive searches.

---

**Beat 11 — `SELECT * FROM artifacts WHERE age BETWEEN 2000 AND 4000`**

The veteran theorizes the critical period was between 2,000 and 4,000 years ago. Rather than writing out two conditions, you use a single elegant range filter. Both endpoints are included.

> *"1,142 rows — artifacts from the critical period."*

**Technical:** `BETWEEN low AND high` is shorthand for `age >= 2000 AND age <= 4000`. It's inclusive on both ends. Works with numbers, dates, and strings (alphabetical order).

---

**Beat 12 — `SELECT * FROM artifacts WHERE era = 'Bronze Age' AND (age > 3000 OR condition = 'pristine')`**

The mystery deepens. You need Bronze Age artifacts that are either ancient or in perfect condition — parentheses group the logic like brackets around a subclause of truth. The city rewards precision.

> *"47 rows — the refined target set."*

**Technical:** Parentheses control evaluation order. Without them, `AND` is evaluated before `OR`, which can produce unexpected results. Always use parentheses to make your intent explicit.

---

### ZONE 3 — The Sorting Hall
**Setting:** A vast cataloguing hall where tablets are stacked floor to ceiling. Order must be imposed.

---

**Beat 13 — `SELECT name, age FROM artifacts ORDER BY age`**

The cataloguing hall is chaos — tablets stacked randomly. ORDER BY is the sorting ritual. You arrange artifacts youngest to oldest. The hall reorganizes itself before your eyes, ascending.

> *"2,847 rows — sorted youngest to oldest."*

**Technical:** `ORDER BY column` sorts results in ascending order by default (smallest to largest, A to Z, earliest to latest). Sorting happens after filtering — `WHERE` runs first, then `ORDER BY` arranges the survivors.

---

**Beat 14 — `SELECT name, age FROM artifacts ORDER BY age DESC`**

Flip it. You want the oldest first — the deepest history at the top. DESC reverses the order. The most ancient artifacts rise to the surface.

> *"Sorted oldest first — a 9,200-year-old idol tops the list."*

**Technical:** `DESC` (descending) reverses the sort order. `ASC` (ascending) is the default and usually omitted. You can mix them: `ORDER BY era ASC, age DESC`.

---

**Beat 15 — `SELECT name, age FROM artifacts ORDER BY era, age DESC`**

Two sort keys — first group by era alphabetically, then within each era sort oldest first. The hall reorganizes in layers, like geological strata.

> *"Multi-column sort applied — era groups, age descending within."*

**Technical:** Multiple columns in `ORDER BY` create a sort hierarchy. The first column is the primary sort; the second breaks ties. Each column can independently be `ASC` or `DESC`.

---

**Beat 16 — `SELECT * FROM artifacts LIMIT 10`**

You can't study all 2,847 at once. LIMIT is a physical constraint — you pull only the first ten tablets from the stack. Manageable. Focused.

> *"10 rows returned — first page of results."*

**Technical:** `LIMIT n` restricts the result set to the first n rows. Essential for previewing large tables and for pagination. In SQL Server, use `TOP n` instead.

---

**Beat 17 — `SELECT * FROM artifacts LIMIT 10 OFFSET 10`**

You've studied the first ten. Now the next ten. OFFSET skips the ones you've already read, like lifting the first stack off the pile before grabbing the second. Pagination, archaeologically speaking.

> *"Rows 11–20 returned."*

**Technical:** `OFFSET n` skips the first n rows before applying `LIMIT`. Together they enable pagination: page 1 is `LIMIT 10 OFFSET 0`, page 2 is `LIMIT 10 OFFSET 10`, page 3 is `LIMIT 10 OFFSET 20`, and so on.

---

**Beat 18 — `SELECT a.name, a.age, s.location FROM artifacts AS a JOIN sites AS s ON a.site_id = s.id`**

The veteran introduces shorthand. "Writing `artifacts.name` every time is tedious. Give each table a short alias." You assign `a` for artifacts and `s` for sites. The query reads cleaner; the results are identical.

> *"Table aliases applied — same results, cleaner syntax."*

**Technical:** `AS` creates a table alias — a short name used throughout the query. `artifacts AS a` lets you write `a.name` instead of `artifacts.name`. Aliases are required when joining a table to itself, and conventional in any multi-table query. The `AS` keyword is optional in most databases: `artifacts a` also works.

---

### ZONE 4 — The Measurement Vaults
**Setting:** A chamber filled with accounting tablets — the city's statisticians worked here, tallying everything.

---

**Beat 19 — `SELECT COUNT(*) FROM artifacts`**

How many artifacts exist in total? COUNT collapses the entire grid into a single number. The city's statisticians did this constantly — a census of objects.

> *"2,847"*

**Technical:** `COUNT(*)` counts the total number of rows in the result set. It includes rows with NULL values. Use `COUNT(column_name)` to count only non-NULL values in a specific column.

---

**Beat 20 — `SELECT COUNT(*) FROM artifacts WHERE era = 'Bronze Age'`**

A targeted census — how many Bronze Age artifacts specifically? COUNT pairs with WHERE like a lantern with a filter lens.

> *"341"*

**Technical:** Aggregate functions like `COUNT` work with `WHERE` — the filter runs first, then the aggregation counts only the surviving rows.

---

**Beat 21 — `SELECT AVG(age) FROM artifacts`**

What's the average age of an artifact in Queryra? AVG adds every age and divides. The city's median history emerges as a number.

> *"1,847 years — the average artifact age."*

**Technical:** `AVG(column)` calculates the arithmetic mean of a numeric column, ignoring NULLs. Note: AVG gives the mean, not the median — SQL doesn't have a built-in median function in most databases.

---

**Beat 22 — `SELECT MIN(age), MAX(age) FROM artifacts`**

Two extremes at once — the youngest and the oldest artifact in the record. MIN and MAX are the city's bookends.

> *"MIN: 12 years / MAX: 9,247 years"*

**Technical:** `MIN()` and `MAX()` return the smallest and largest values in a column. They work on numbers, dates, and strings (alphabetical order).

---

**Beat 23 — `SELECT SUM(estimated_value) FROM artifacts WHERE condition = 'pristine'`**

The expedition accountant needs a budget figure — total estimated value of all pristine artifacts. SUM collapses a column into its total. A staggering number appears.

> *"$4,283,900 — total pristine artifact value."*

**Technical:** `SUM(column)` adds all non-NULL values in a numeric column. Combined with `WHERE`, it sums only the rows that match your filter.

---

### ZONE 5 — The Guild Records
**Setting:** The administrative quarter of Queryra. Guild records group everything by category — trade, religion, military.

---

**Beat 24 — `SELECT era, COUNT(*) FROM artifacts GROUP BY era`**

You want a breakdown — how many artifacts per era? GROUP BY splits the table into clusters, one per unique era value, and COUNT tallies each cluster. The city's history stratifies into numbers.

> *"Bronze Age: 341 / Iron Age: 257 / Classical: 891 / Modern: 146..."*

**Technical:** `GROUP BY column` partitions rows into groups sharing the same value. Any column in `SELECT` that isn't inside an aggregate function must appear in the `GROUP BY` clause.

---

**Beat 25 — `SELECT era, AVG(age) FROM artifacts GROUP BY era`**

Same grouping, different question — what's the average age of artifacts within each era? AVG now works inside each group rather than across the whole table.

> *"Bronze Age avg: 2,847 years / Iron Age avg: 2,103 years..."*

**Technical:** Aggregate functions operate within each group when combined with `GROUP BY`. Every row contributes to exactly one group's calculation.

---

**Beat 26 — `SELECT excavator_id, COUNT(*) FROM artifacts GROUP BY excavator_id`**

The veteran suspects some excavators are hoarding finds. You group by excavator and count their attributed artifacts. A suspicious outlier emerges — one excavator has attributed 847 artifacts to themselves.

> *"excavator_id 7: 847 artifacts — statistical anomaly."*

**Technical:** `GROUP BY` works on any column, including foreign keys like `excavator_id`. This is how you summarize data by category, user, department, or any other grouping.

---

**Beat 27 — `SELECT era, COUNT(*) FROM artifacts GROUP BY era HAVING COUNT(*) > 200`**

You only care about eras with significant representation — minor eras with a handful of artifacts are noise. HAVING filters after grouping, the way WHERE filters before. Only eras with more than 200 artifacts survive.

> *"3 eras returned — Bronze Age, Classical, and Late Period."*

**Technical:** `HAVING` filters groups after aggregation, while `WHERE` filters individual rows before aggregation. You cannot use aggregate functions in `WHERE` — that's what `HAVING` is for. Execution order: `WHERE` → `GROUP BY` → `HAVING`.

---

**Beat 28 — `SELECT excavator_id, COUNT(*) FROM artifacts GROUP BY excavator_id HAVING COUNT(*) > 100`**

Back to the suspicious excavator. You filter to only those with over 100 attributed finds. Three names remain — but excavator 7 is far ahead of the others. The investigation deepens.

> *"3 excavators with >100 finds — ID 7 is an outlier."*

**Technical:** `HAVING` is commonly used to find outliers, set minimum thresholds, or focus on statistically significant groups. It can use any aggregate function: `HAVING AVG(age) > 2000`, `HAVING SUM(value) < 1000`, etc.

---

### ZONE 6 — The Connection Bridges
**Setting:** Two separate archive buildings connected by a stone bridge. The city's records were split across departments — artifacts in one building, excavators in another. The bridge connects them.

---

**Beat 29 — `SELECT a.name, e.name FROM artifacts a JOIN excavators e ON a.excavator_id = e.id`**

The artifact records only contain an excavator ID number — not a name. The excavator table has the names. JOIN bridges the two tables on the shared key, like laying the stone bridge between buildings. Now every artifact row carries its excavator's actual name.

> *"2,847 rows — artifact name paired with excavator name."*

**Technical:** `JOIN` (or `INNER JOIN`) combines rows from two tables where a condition is met. `ON a.excavator_id = e.id` specifies the relationship — it matches each artifact's foreign key to the excavator's primary key.

---

**Beat 30 — `SELECT a.name, s.location FROM artifacts a JOIN sites s ON a.site_id = s.id`**

A third building holds site location records. You bridge artifacts to sites — now every artifact knows exactly where it was physically found. Geography enters the record.

> *"Artifact names paired with dig site coordinates."*

**Technical:** JOINs work between any two tables that share a logical relationship. The `ON` clause defines which columns create that relationship. The column names don't need to match — just the values they contain.

---

**Beat 31 — `SELECT a.name, e.name AS excavator, s.location FROM artifacts a JOIN excavators e ON a.excavator_id = e.id JOIN sites s ON a.site_id = s.id`**

A double bridge — three buildings connected in sequence. Every artifact row now carries who found it and where. The city's full provenance chain emerges.

> *"Three-table join — full artifact provenance returned."*

**Technical:** You can chain multiple JOINs in a single query. Each `JOIN ... ON` connects one additional table. Column aliases (`AS excavator`) prevent ambiguity when multiple tables have columns with the same name.

---

**Beat 32 — `SELECT a.name, e.name AS excavator FROM artifacts a JOIN excavators e ON a.excavator_id = e.id WHERE e.name = 'Maris Theron'`**

You've identified the suspicious excavator by name: Maris Theron. You bridge the tables and filter immediately — every artifact attributed to her, with her name confirmed from the excavator record.

> *"847 rows — all Maris Theron's attributed finds."*

**Technical:** `WHERE` works normally after a `JOIN` — it filters the combined result set. You can reference columns from any joined table in your `WHERE` clause.

---

### ZONE 7 — The Outer Archives
**Setting:** The outer archive building holds records of things that may or may not exist — hypothetical finds, unassigned sites, missing data.

---

**Beat 33 — `SELECT e.name, a.name AS artifact FROM excavators e LEFT JOIN artifacts a ON e.id = a.excavator_id`**

You want every excavator — even those who found nothing. INNER JOIN would silently drop them. LEFT JOIN keeps all rows from the left table (excavators) and fills artifact columns with NULL where no match exists. Three excavators appear with NULL in the artifact column.

> *"2,850+ rows — including 3 excavators paired with NULL artifact names (no finds)."*

**Technical:** `LEFT JOIN` returns all rows from the left table regardless of whether a match exists in the right table. Unmatched rows get NULL for all right-table columns. This is essential when you need to see "what's missing" — not just "what matches."

---

**Beat 34 — `SELECT e.name, COUNT(a.id) AS find_count FROM excavators e LEFT JOIN artifacts a ON e.id = a.excavator_id GROUP BY e.name`**

A productivity report — every excavator and their find count, including the zeroes. LEFT JOIN plus GROUP BY plus COUNT gives you the full picture, no silent omissions.

> *"23 excavators with counts — 3 show 0."*

**Technical:** `COUNT(a.id)` counts only non-NULL values — so excavators with no artifacts get 0 instead of 1. This is why `COUNT(column)` vs `COUNT(*)` matters: `COUNT(*)` would count the NULL rows as 1.

---

**Beat 35 — `SELECT * FROM artifacts WHERE excavator_id IS NULL`**

Some artifacts have no excavator attribution at all — found but unclaimed, or records lost. IS NULL targets the gaps in the record. Seven artifacts exist in a provenance void.

> *"7 artifacts with no excavator attribution."*

**Technical:** `IS NULL` checks for missing/unknown values. You cannot use `= NULL` — NULL is not a value, it's the absence of a value. Similarly, use `IS NOT NULL` to find rows where data exists.

---

**Beat 36 — `SELECT * FROM artifacts WHERE condition IS NOT NULL`**

You want only artifacts where condition was actually assessed — IS NOT NULL filters out the unexamined ones.

> *"2,831 rows — artifacts with condition recorded."*

**Technical:** `IS NOT NULL` returns rows where the column has any value (including empty strings, which are not the same as NULL). This is how you find complete records and filter out data gaps.

---

### ZONE 8 — The Inscription Workshop
**Setting:** A working scribe's chamber. The record isn't just for reading — you must also write, correct, and occasionally erase.

---

**Beat 37 — `INSERT INTO artifacts (name, era, age, condition) VALUES ('Obsidian Idol', 'Bronze Age', 3200, 'pristine')`**

A new discovery — a stunning obsidian idol pulled from the deep trench this morning. The city's record must grow. INSERT carves a new row into the tablet grid. The artifact officially exists now.

> *"1 row inserted — Obsidian Idol added to record."*

**Technical:** `INSERT INTO table (columns) VALUES (values)` adds a new row. Column names and values must match in order and data type. Columns not listed will get their default value or NULL.

---

**Beat 38 — `INSERT INTO artifacts (name, era, age, condition, excavator_id) VALUES ('Clay Seal', 'Iron Age', 2100, 'fragmented', 7)`**

Another find, this one attributed to Maris Theron — excavator ID 7. You note the attribution but flag it for review. The record accepts the row without judgment.

> *"1 row inserted — Clay Seal attributed to ID 7."*

**Technical:** Foreign key values (like `excavator_id = 7`) must reference an existing row in the related table. If foreign key constraints are enforced, inserting an invalid ID will fail with an error.

---

**Beat 39 — `UPDATE artifacts SET condition = 'restored' WHERE name = 'Obsidian Idol'`**

The conservator has finished restoring the idol. Its condition in the record is outdated. UPDATE reaches into that specific row and rewrites the condition column. The idol's entry now reflects reality.

> *"1 row updated — Obsidian Idol condition set to 'restored'."*

**Technical:** `UPDATE table SET column = value WHERE condition` modifies existing rows. The `WHERE` clause determines which rows are affected. **Critical: omitting `WHERE` updates every row in the table.**

---

**Beat 40 — `UPDATE artifacts SET excavator_id = 12 WHERE excavator_id = 7 AND era = 'Bronze Age'`**

The investigation concludes — Maris Theron falsely claimed credit for all Bronze Age finds. The real excavator is ID 12. A targeted UPDATE reassigns them. Without the WHERE clause, every artifact in the database would be reassigned. Precision is everything.

> *"127 rows updated — Bronze Age finds reassigned to ID 12."*

**Technical:** `UPDATE` can modify multiple rows at once when the `WHERE` condition matches more than one row. Always test your `WHERE` clause with a `SELECT` first to verify which rows will be affected before running an `UPDATE`.

---

**Beat 41 — `DELETE FROM artifacts WHERE condition = 'counterfeit'`**

Lab results confirm eleven artifacts are modern counterfeits planted to inflate the site's value — a fraud. They must be purged from the record entirely. DELETE without a WHERE clause would erase the entire city's history. The WHERE clause is the difference between justice and catastrophe.

> *"11 rows deleted — counterfeits removed."*

**Technical:** `DELETE FROM table WHERE condition` removes rows that match the condition. **Critical: `DELETE FROM artifacts` with no `WHERE` clause deletes every row in the table.** Always preview with `SELECT` first.

---

### ZONE 9 — The Deep Vaults
**Setting:** The innermost sanctum of Queryra — where the most complex questions are answered and the city's deepest secrets live.

---

**Beat 42 — `SELECT DISTINCT era FROM artifacts`**

How many unique eras are actually represented in the record? DISTINCT collapses duplicates — instead of 2,847 era values, you get one row per unique era. Eight distinct eras surface.

> *"8 unique eras — the city's full historical span."*

**Technical:** `DISTINCT` removes duplicate rows from the result set. Applied to a single column, it returns unique values. Applied to multiple columns (`SELECT DISTINCT era, condition`), it returns unique combinations.

---

**Beat 43 — `SELECT name FROM artifacts WHERE age > (SELECT AVG(age) FROM artifacts)`**

You want artifacts older than average — but you don't know the average yet. A subquery calculates it first, in the inner parentheses, and passes the result to the outer query as if it were a hardcoded number. The query answers its own prerequisite.

> *"1,203 rows — artifacts older than the 1,847-year average."*

**Technical:** A subquery (or inner query) is a `SELECT` statement nested inside another query. The inner query runs first; its result feeds into the outer query. Subqueries can return a single value (scalar), a list, or a full table.

---

**Beat 44 — `SELECT name FROM excavators WHERE id IN (SELECT DISTINCT excavator_id FROM artifacts WHERE era = 'Bronze Age')`**

Which excavators worked Bronze Age sites? The inner query pulls the IDs; the outer query translates IDs to names. IN checks membership in the subquery's result — a lookup across two buildings without an explicit JOIN.

> *"8 excavators worked Bronze Age sites."*

**Technical:** `IN (subquery)` checks whether a value exists in the subquery's result set. It's an alternative to a JOIN for simple lookups. For large datasets, JOINs are generally more performant than `IN` subqueries.

---

**Beat 45 — `SELECT name, age, CASE WHEN age > 5000 THEN 'Ancient' WHEN age > 2000 THEN 'Old' WHEN age > 500 THEN 'Medieval' ELSE 'Recent' END AS classification FROM artifacts`**

The museum needs labels for display cases. CASE WHEN is a conditional column — it reads each row's age and assigns a human-readable classification. The database becomes a curator.

> *"Every artifact labeled: Ancient / Old / Medieval / Recent."*

**Technical:** `CASE WHEN condition THEN result ... ELSE default END` evaluates conditions top-to-bottom and returns the first match. It can appear in `SELECT`, `WHERE`, `ORDER BY`, and even `GROUP BY`. Always include `ELSE` to handle unmatched cases.

---

**Beat 46 — `SELECT era, COUNT(*) AS artifact_count, CASE WHEN COUNT(*) > 500 THEN 'Major Era' WHEN COUNT(*) > 100 THEN 'Notable Era' ELSE 'Minor Era' END AS significance FROM artifacts GROUP BY era`**

Combine GROUP BY with CASE — every era gets a count and a significance label. The city's historical weight is now quantified and categorized in a single query.

> *"8 eras classified by artifact density."*

**Technical:** `CASE` can use aggregate function results (like `COUNT(*)`) when used alongside `GROUP BY`. This lets you classify groups dynamically in a single query rather than requiring post-processing.

---

### ZONE 10 — The Grand Archive
**Setting:** The apex of the excavation — the Grand Archive, the city's library of libraries. The veteran pauses. *"What follows is advanced — not all archaeologists reach this depth. But you've earned it."* The civilization-ending secret is encoded here, across multiple tablets, waiting for the right query to surface it.

---

**Beat 47 — `SELECT era, excavator_id, COUNT(*) AS finds, ROW_NUMBER() OVER (PARTITION BY era ORDER BY COUNT(*) DESC) AS rank FROM artifacts GROUP BY era, excavator_id`**

A window opens across the data — a special kind of function that can see beyond the current row. ROW_NUMBER() assigns each excavator a sequential position within their era based on find count, without collapsing the rows. Every row remains; each now carries its rank within its era's leaderboard. The city's hierarchy emerges.

> *"Rankings revealed — top excavators per era identified."*

**Technical:** Window functions (`ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, etc.) compute a value across a set of rows related to the current row — the "window." `PARTITION BY` divides rows into groups (like `GROUP BY` but without collapsing), and `ORDER BY` determines the ranking within each partition.

**specialType (SQL):** Pre-computed result table — do not attempt JS evaluation of `OVER (PARTITION BY...)`.

---

**Beat 48 — `WITH bronze_age AS (SELECT * FROM artifacts WHERE era = 'Bronze Age') SELECT name, age FROM bronze_age WHERE age > 4000`**

A CTE — a Common Table Expression — names a subquery so you can reference it cleanly. `bronze_age` becomes a temporary named result, readable and reusable within this query. You're not just querying; you're building structured thought.

> *"CTE defined — 14 ancient Bronze Age artifacts isolated."*

**Technical:** `WITH name AS (query)` creates a CTE — a temporary, named result set that exists only for the duration of the query. CTEs make complex queries more readable by breaking them into logical steps. Unlike subqueries, a CTE can be referenced multiple times in the same query.

---

**Beat 49 — `WITH maris AS (SELECT id FROM excavators WHERE name = 'Maris Theron') SELECT a.name, a.era, a.age FROM artifacts a WHERE a.excavator_id IN (SELECT id FROM maris) ORDER BY a.era, a.age DESC`**

A CTE identifies Maris Theron by name, then the main query uses that ID to pull her complete artifact history — sorted by era and age. The Grand Archive hums as centuries of data align into an accusation.

> *"Full artifact history for Maris Theron — pattern confirmed across all eras."*

**Technical:** CTEs can be chained (`WITH a AS (...), b AS (...)`) to build queries step by step. Each CTE can reference previous ones. This is the SQL equivalent of breaking a complex problem into named intermediate results.

---

**Beat 50 — `CREATE VIEW pristine_bronze AS SELECT name, age, site_id FROM artifacts WHERE era = 'Bronze Age' AND condition = 'pristine'`**

You create a VIEW — a named, saved query that behaves like a permanent table but holds no data itself. It's a window, not a wall. Future archaeologists can query `pristine_bronze` without knowing the underlying complexity. Knowledge, encapsulated.

> *"View 'pristine_bronze' created — reusable query stored."*

**Technical:** `CREATE VIEW name AS query` saves a query as a virtual table. Views don't store data — they re-execute the underlying query each time they're accessed. They simplify complex queries, enforce consistent logic, and can restrict access to sensitive columns.

---

**Beat 51 — `SELECT * FROM pristine_bronze ORDER BY age DESC`**

You query your own view like a table. The abstraction holds. Cleanly, the fourteen most pristine Bronze Age artifacts surface — sorted oldest first. One catches your eye: The Codex of Queryra, age 9,247 years, site 3.

> *"The Codex of Queryra — oldest pristine Bronze Age artifact."*

**Technical:** Views are queried with standard `SELECT` statements. You can filter, sort, join, and aggregate a view just like a regular table. To the query, a view is indistinguishable from a table.

---

**Beat 52 — `SELECT a.name, s.location, s.depth FROM artifacts a JOIN sites s ON a.site_id = s.id WHERE a.name = 'The Codex of Queryra'`**

You need its exact location. A targeted JOIN between artifacts and sites for this single row. The coordinates return: Site 3, Grid NW-7, depth 42 meters. The deepest point of the entire excavation.

> *"Location confirmed — Site 3, NW-7, 42m depth."*

**Technical:** Even for a single row, JOINs are the correct way to connect related data across tables. The `WHERE` filter on a specific name makes this effectively a lookup — but the JOIN structure scales to any number of rows.

---

### ZONE 10 — The Final Query

**Setting:** The floor of the deepest trench. Your lantern illuminates a single stone tablet, perfectly preserved, unlike anything found before.

---

**Beat 53 — `SELECT message FROM codex WHERE seal = 'unbroken' ORDER BY inscription_order`**

The Codex of Queryra is not an artifact — it is a database. Its final table holds a message, inscribed in order, sealed for nine millennia. Your query returns it row by row. The veteran excavator reads over your shoulder, silent for the first time.

The rows return one by one — a warning, written by Queryra's last archivist as the city fell:

*"We did not perish from war or flood. We perished because we stopped asking questions of our own records. The data was always there. No one queried it."*

She closes her eyes. You close your laptop.

> *"Query complete — 1 message returned. The city has spoken."*

**Technical:** The best query is the one that asks the right question of the right data at the right time. SQL is not just a language — it's a way of thinking about structured information.

**specialType (SQL):** Dramatic row-by-row output — render each message row with a 400ms delay. Trigger quest completion screen after the final row.

🏺 **SQLQuest Complete — 53 beats, 10 zones, 1 buried civilization.**

---

*End of QuestForge complete specification.*
