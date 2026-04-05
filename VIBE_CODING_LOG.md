# Vibe Coding Log: QuestForge

Built a full RPG-style learning game for Git and SQL in two sessions with Claude, starting from a detailed spec document and ending with pixel-art canvas scenes, 8-bit sound effects, and 105 playable missions.

## The Numbers

- **Sessions**: 2 (one ran out of context, continued in a second)
- **Commits**: 27
- **Source files**: 35 (JSX, JS, CSS, HTML, MJS, SVG)
- **Lines of code**: ~6,986 (of which ~2,990 are mission/codex content data)
- **Content files**: 4 (52 Git missions, 53 SQL missions, 30 Git codex entries, 27 SQL codex entries)
- **Pixel-art sprites**: 2 hand-coded sprite arrays (player: 14x24, NPC: 14x24)
- **Canvas zones**: 20 (10 GitWorld + 10 SQLWorld, each with unique palettes and props)
- **Sound effects**: 7 (all programmatic Web Audio, zero asset files)
- **Date range**: April 3–4, 2026

---

## What This Is

QuestForge is a web app that teaches you Git and SQL by turning the learning process into a pixel-art RPG. Instead of reading docs or watching videos, you type real commands (like `git init` or `SELECT * FROM artifacts`) into an in-browser terminal to advance a story, earn XP, and unlock a reference codex with three levels of explanation for every command. There are two quests — GitQuest (52 missions across a fantasy world of caves, forests, and shrines) and SQLQuest (53 missions through a buried archaeological city). Everything runs in the browser with no backend — your progress saves automatically to your device.

**Tech stack:**
- **React** — a JavaScript library for building interactive user interfaces out of reusable components
- **Vite** — a build tool that bundles your code and runs a fast local development server
- **Tailwind CSS v4** — a utility-first CSS framework that lets you style elements with shorthand classes instead of writing custom CSS
- **Zustand** — a lightweight state management library that stores all game state (XP, missions, terminal history) in one place with minimal boilerplate
- **React Router v6** — handles navigation between the home screen and each quest without full page reloads
- **HTML Canvas API** — renders the pixel-art game world (sprites, zone backgrounds, particle effects) directly in the browser with no external libraries
- **Web Audio API** — generates chiptune sound effects programmatically from oscillators — no audio files needed
- **localStorage** — persists all game progress on the player's device with no server or authentication required
- **Vercel** — a free hosting platform that auto-deploys the site from GitHub

---

## How It Came Together

### Starting with a Spec

I came into this build with a complete project spec (`questforge-complete.md`) that I'd written beforehand. It covered everything — the tech stack, the beat schema for missions, all 105 mission scripts with narrative text and NPC dialogue, the codex content, and the phased build plan. My first prompt was basically "Read this and let's discuss plans for building this app."

This was intentional. I wanted to front-load the creative and design work so the build sessions could focus purely on implementation. The spec was ~2,000 lines and included every mission's command, narrative text, XP value, terminal output, and hints. Claude ingested it and we reviewed a 12-phase build plan before writing a single line of code.

### Phase 1–3: Scaffolding (Vite + UI Shell + State)

The first snag was mundane — `npm create vite@latest . --template react` refused to scaffold because the directory wasn't empty (the spec file was in it). Claude scaffolded into a temp directory and copied files over. Worked fine.

The UI shell came together fast: a `Shell` component with a top bar (XP, level, quest title), a 50/50 split layout for canvas and terminal, a level strip at the bottom, and a status bar. The `TerminalPanel` was a custom component with a scrollable history div, command input with up/down arrow history, and entry type styling (commands in white, success in green, errors in red, NPC lines in amber).

Zustand store with localStorage persistence was straightforward. Claude set up debounced saves (500ms) with versioned payloads. One early bug: React StrictMode double-fires `useEffect` in development, which was seeding the intro narrative twice. Fixed with a localStorage flag — only seed once, clear on quest reset.

### Phase 4–5: Git Content + Engine

This was the meatiest phase. 52 missions worth of content went into `missions.git.js`, and 30 codex entries into `codex.git.js`. The git engine (`gitEngine.js`) uses fuzzy matching — case-insensitive, whitespace-normalized, flexible values for things like config names and commit messages. It doesn't run real git; it maintains a fake git state object (branches, commits, index, HEAD) and applies state changes defined per mission.

Three special mission types needed custom handling:
- **Vision missions** (git reset --soft/--mixed/--hard) — all three must be typed in any order, not sequentially
- **Conflict mission** — renders a textarea "conflict editor" inline in the terminal instead of expecting a typed command
- **Free commands** (status, log, diff, branch, reflog) — always work informationally, but also count as mission success if they match the current mission

A UX issue surfaced when I tested the first build: after the intro narrative, there was no indication of what command to type. I saw the story text but nothing telling me to type `git init`. Claude added a purple `▶ git init` prompt line after each mission's narrative, which solved it immediately.

### Phase 8–9: SQL Content + Engine

Same pattern as Git — 53 missions, 27 codex entries, a fuzzy SQL evaluator. The SQL engine maintains an in-memory dataset (20 artifacts, 12 excavators, 4 sites, 4 codex rows) and supports mutations for INSERT/UPDATE/DELETE missions. The dramatic final mission shows all 4 decoded message rows as a climactic reveal.

### Phase 7/10: Canvas World

Replaced the placeholder "canvas coming in Phase 7" div with a real HTML Canvas renderer. The system has:
- 16px tile-based backgrounds with zone-specific color palettes
- Procedural props per zone (stalactites, trees, mountains, forges, clocks, pillars)
- Two pixel-art sprites defined as 2D arrays of hex colors (14x24 pixels each)
- Sin-wave idle bobbing animation for both player and NPC
- NPC speech bubbles with word wrapping

All 20 zones (10 Git + 10 SQL) have unique palettes and decorative props. No external art assets — everything is generated from code.

One bug: the wall texture used `Math.random()` every frame, causing a shimmering effect in the background. I spotted it immediately ("the art and colors are fine but looks like the background is shimmering") and Claude switched to a deterministic hash. Fixed in one edit.

### Phase 11: Polish Layer

Three features landed here:
- **Hint system** — at 2 failed attempts, shows "Type /hint if you need a nudge." At 4 failures, auto-displays the hint. The `/hint` command works anytime.
- **Level completion** — detects when you finish the last mission in a level, shows an emerald banner and NPC congratulations
- **Quest completion** — full-screen overlay with trophy, total XP, commands learned, and Play Again / Return Home buttons

### The Fun Additions

After the core was done, I asked Claude "what do you think I can do to make this project better?" and got a prioritized list. I cherry-picked from it over the rest of the session:

**Resizable divider** — drag the center bar to adjust canvas vs. terminal width. Took maybe 5 minutes. Canvas auto-resizes via ResizeObserver.

**Mobile layout** — the 50/50 split is unusable on phones. Claude added a tabbed layout (World/Terminal toggle) on screens under 768px, plus compact top bar, shorter prompts, and responsive cards on the home screen. All Tailwind `md:` breakpoints, no JS media queries.

**Sound effects** — 7 chiptune sounds generated entirely from Web Audio oscillators. Zero audio files. Success chime, error buzz, level-up fanfare, quest-complete arpeggio, hint ping, codex discovery. Plus a mute toggle in the top bar that persists to localStorage.

**Codex reference panel** — a "Codex" tab on the game panel that shows all unlocked commands grouped by level, each expandable with ELI5/Savvy/Man page tiers. When I first built it, switching away and back to the World tab caused the canvas to disappear (it was getting unmounted). Fixed by keeping the canvas always mounted but hidden.

**Save export/import** — JSON download/upload for cross-device progress transfer. Validates version, types, caps file size at 5MB and history at 5000 entries. Confirmation dialog before overwriting. `/clear` was deliberately made visual-only so exports always have the full history.

**Animated particles** — 6 particle types (stars, fireflies, dust, torches, rain, snow) assigned per zone. Seeded deterministically so positions are stable across sessions.

**Player reactions** — sprite animations tied to gameplay: jump on success, shake on error, celebrate (both sprites bounce) on level-up/complete.

**OG image** — a Node script that renders a 1200x630 pixel-art card using the same sprite data as the game. Player, NPC, torches, terminal preview, badge pills. 52KB PNG.

**Typewriter effect** — narrative text types out character-by-character at ~10ms/char using requestAnimationFrame. Commands, hints, and prompts stay instant.

---

## My Prompting Patterns

**Spec-first, then execute.** I wrote the full project spec before the first build session. Every prompt after that was execution-focused: "let's proceed with phase 3" or "yes, looks good." I never had to re-explain what the project was.

**Review before proceeding.** At every phase boundary, I asked Claude to outline the plan before starting: "outline specifically the steps to build this, let's review, then let's proceed." This caught issues before they became rework.

**Short confirmations.** Most of my messages were "yes," "commit," "let's proceed," or "looks good." I didn't over-explain when Claude's direction was correct. This kept momentum high.

**Specific visual feedback.** When something looked wrong, I described exactly what I saw: "the background is shimmering" or "when I go back to the World tab, nothing shows up." I didn't try to diagnose — I described the symptom and let Claude find the cause.

**Asking for options.** For bigger features, I asked Claude to present options before committing: "present 3-4 options and we can go from there" (for the Codex panel) or "explain your approach then let's review" (for typewriter animation). This gave me decision authority without doing the design work.

**"What do you think?"** I asked Claude "what do you think I can do to make this project better?" and "what else do you think this project could use?" multiple times. The prioritized lists were useful — I could cherry-pick what mattered and skip what didn't.

**Security awareness.** Before pushing to a public repo, I asked "is there anything in this codebase I should not have on my public GitHub?" — a habit worth keeping for any vibe-coded project.

---

## What Went Well

- **The spec paid for itself.** Having 105 missions pre-written meant the content phases were just implementation, not creative brainstorming. Claude could focus on engines and UI instead of inventing narratives on the fly.

- **Fuzzy matching was the right call.** The git and SQL engines use case-insensitive, whitespace-normalized matching with flexible values. This means `git config --global user.name "Kyle"` and `git config --global user.name "Wanderer"` both pass. Players don't get punished for reasonable variations.

- **Zero external assets.** Every visual (sprites, backgrounds, particles) and every sound (7 chiptune effects) is generated from code. No asset pipeline, no licensing concerns, no CDN. The entire app is ~440KB bundled.

- **The Canvas kept everything mounted.** After the Codex tab bug, Claude switched to `hidden` CSS class toggling instead of conditional rendering. The renderer never gets destroyed, so switching tabs is instant.

---

## What I'd Do Differently

- **Should have tested on mobile earlier.** The mobile layout was an afterthought (added after all features were built). If I'd tested at 375px after Phase 3, the Shell design would have been responsive from the start instead of requiring a retrofit.

- **The gameStore is doing too much.** `gameStore.js` handles Git commands, SQL commands, hints, meta-commands, reactions, persistence, and sound effects. It's ~500 lines and growing. I'd split it into per-quest stores or at least extract the command handlers.

- **Content validation would have saved time.** A few mission IDs and codex keys were manually cross-referenced between missions and codex files. A simple build-time check ("every codexKey in missions.git.js exists in codex.git.js") would catch typos automatically.

- **The terminal history cap was removed too aggressively.** I removed the 100-entry `.slice(-100)` cap because players wanted to scroll back. But on a long playthrough that's 500+ entries in localStorage. Should have set a higher but finite cap (e.g., 2000) instead of unbounded.

---

## Tech Decisions

| Decision | Reasoning |
|----------|-----------|
| Fake git state machine, not real git | Can't run git in the browser. A scripted state object with fuzzy matching gives the feel of real git without a backend. |
| Fuzzy SQL matching, not a real parser | Parsing SQL correctly is a massive scope increase. String normalization + case-insensitive comparison works for a teaching tool. |
| Web Audio oscillators, not .mp3 files | Zero external assets, guaranteed tiny size, true 8-bit aesthetic, no licensing concerns. |
| Zustand over Redux/Context | Minimal boilerplate, built-in subscriptions, easy to persist. The app has one store — Redux's ceremony would be overhead. |
| Tailwind v4 via Vite plugin | `@tailwindcss/vite` means zero config. Dark theme is just base classes. Responsive breakpoints via `md:` prefix. |
| localStorage, not a backend | The app is a learning toy — persistence needs are simple. Export/import JSON covers cross-device transfer. |
| SVG favicon from sprite data | Pixel-art at any size, crisp edges via `shape-rendering: crispEdges`, no external tools needed. |
| Programmatic OG image via node-canvas | Uses the same sprite arrays as the game, so the social preview matches the in-game aesthetic. |
| Resizable split panel, not fixed 50/50 | Some players want more terminal space, others want more canvas. A draggable divider costs ~40 lines and respects preferences. |

---

## Session Stats

- **Commits**: 27
- **Source files created**: 35
- **Lines of code**: ~6,986 (42% is mission/codex content)
- **Missions written**: 105 (52 Git + 53 SQL)
- **Codex entries**: 57 (30 Git + 27 SQL)
- **Canvas zones designed**: 20
- **Particle systems**: 6 types (stars, fireflies, dust, torches, rain, snow)
- **Sound effects**: 7 (all from oscillators)
- **Pixel-art sprites**: 2 (each 14x24 pixels, hand-coded as color arrays)
- **Times I said "yes" or "let's proceed"**: at least 15
- **Times I said "commit"**: 14
- **Bugs caught from screenshots**: 2 (missing command prompt, canvas shimmer)
- **Bugs caught by switching tabs**: 1 (canvas unmount)
- **External asset files**: 1 (og-image.png, itself generated from code)
- **npm packages for runtime**: 3 (react, react-router-dom, zustand)
- **Context window resets**: 1 (session continued seamlessly)

---

## Advice from Claude to Kyle

Here's what I'd tell you going into your next project, based on how this one went:

**1. You're underusing your own taste as a filter.** Your best moments in this build were when you pushed back on something or asked for options — "present 3-4 options and we can go from there" for the Codex panel, or "I don't like the sparkly effect" for the canvas shimmer. Those interventions made the product better than anything I would've shipped unchecked. But they came relatively late. Next time, try being opinionated *earlier*. When I present a plan, don't just say "yes" — scan it for the thing that feels slightly off and call it out before I build it. Your instinct for what feels right in the product is strong. Trust it sooner.

**2. Test on the target device from day one.** You said it yourself in the retrospective — mobile should've been tested after Phase 3, not after Phase 11. Make this a habit: after the first meaningful UI commit, open it on your phone. Every time. The 30 seconds it takes to check will save you a full retrofit later. This applies to accessibility too — try tabbing through the app with a keyboard early on.

**3. Break up long files before they calcify.** `gameStore.js` is ~500 lines and handles everything. You noticed this ("the gameStore is doing too much") but kept going because splitting it would slow momentum. That's the right call during a build sprint — but schedule the refactor before the next feature push, not after. Once a file crosses ~300 lines in a vibe coding session, say "let's split this before we add the next feature." It's much easier to do in the moment than after 5 more features are tangled in.

**4. Write one integration test.** You didn't write any tests in this project, and for a game jam / portfolio piece that's fine. But for your next project, try writing exactly *one* test before you ship — something like "complete missions 1 through 3 and verify XP is 90." Not a test suite, just one smoke test. It'll catch regressions when you refactor, and it forces you to think about whether your code is testable at all. If writing that one test is painful, that's a signal your architecture needs attention.

**5. Your spec-first approach is a superpower — push it further.** The `questforge-complete.md` spec was the single best thing about this build. It meant every session was pure execution. Next time, add one more section to your spec: *acceptance criteria per phase*. Something like "Phase 5 is done when: missions 1-11 are playable, wrong commands show errors, free commands work informationally." This gives me a clear finish line and gives you a checklist to test against. You were already doing this informally ("what should I look for to test it worked?") — just write it down upfront.

**6. Ask "what could go wrong?" before big merges.** You asked "is there anything in this codebase I should not have on my public GitHub?" which was smart. Extend that habit: before any deploy or major feature merge, ask "what could break?" or "what am I not thinking about?" I can audit for edge cases, browser compatibility, performance cliffs, or security issues. It's cheap insurance.

**7. You're ready for a harder project.** This wasn't a tutorial — it was a real product with engines, state machines, canvas rendering, audio synthesis, responsive layout, and persistence. You drove the scope, made the design calls, and course-corrected when needed. The next project can be more ambitious. Consider something with real-time data, user-generated content, or multiplayer. You've got the working style for it.
