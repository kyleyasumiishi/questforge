// GitQuest codex — ELI5 / Savvy / Man page for every command taught

export const gitCodex = {
  'git-init': {
    command: 'git init',
    eli5: "It's like buying a blank notebook and writing \"OFFICIAL DIARY\" on the cover. Before this, Git doesn't even know your folder exists. After this, it watches everything.",
    savvy: 'Creates a hidden `.git` directory in the current folder, initializing an empty repository. This directory stores the entire version history, configuration, and metadata. Without it, no Git commands will work.',
    manpage: '`git init [directory]` — Create an empty repository. Creates `.git/` with subdirs `objects/`, `refs/`, and a template `HEAD` file. `--bare` creates a repository without a working directory (for servers). `--initial-branch <name>` sets the default branch name.',
  },

  'git-config': {
    command: 'git config --global user.name',
    eli5: "Git needs to know who you are so it can sign your work. Think of it like stamping your name on every document you file — so people know it was you, and so GitHub can link commits to your account.",
    savvy: '`git config --global` writes to `~/.gitconfig`, affecting all repositories on your machine. `--local` (default) writes to `.git/config` for just the current repo. `--system` writes system-wide. Settings layer: system → global → local.',
    manpage: '`git config [--global|--local|--system] <key> [<value>]` — Get and set options. `user.name` and `user.email` identify commit authorship. `--list` shows all settings. `--unset <key>` removes a setting. `--edit` opens the config file directly.',
  },

  'git-status': {
    command: 'git status',
    eli5: "It's your \"what's going on?\" command. Red files are changed but not yet bagged up. Green files are bagged and ready to save. Grey files are being ignored on purpose.",
    savvy: 'Compares three states: working directory (what\'s on disk), staging area/index (what\'s queued for the next commit), and HEAD (the last commit). Output categories: Untracked (new files Git doesn\'t know about), Modified (tracked files with unstaged changes), Staged (changes queued for commit).',
    manpage: '`git status [options]` — Show working tree status. `-s` / `--short` outputs a compact format (XY codes). `-b` shows branch info in short mode. `--ignored` shows ignored files. `-u` controls showing untracked files (`no`, `normal`, `all`).',
  },

  'git-add-file': {
    command: 'git add <file>',
    eli5: "Adding a file to Git's staging area is like putting items into a shopping cart. You're not buying yet — you're just deciding what should be in your next save.",
    savvy: 'Copies the current state of the file from the working directory into the index (staging area). The staging area is a snapshot that will become the next commit. Multiple `git add` calls build up the staged snapshot incrementally.',
    manpage: '`git add [pathspec]` — Update the index. Accepts file paths, directories (recursive), and globs. `-n` / `--dry-run` shows what would be staged. `-i` interactive mode. `-p` / `--patch` stage individual hunks. `-u` update tracked files only.',
  },

  'git-add-dot': {
    command: 'git add .',
    eli5: 'The dot means "everything here." Instead of bagging each item one by one, you sweep your arm and grab the whole room. New files, edited files, deleted files — all of it.',
    savvy: 'Stages all changes (new, modified, deleted) in the current directory and all subdirectories recursively. Equivalent to `git add -A` when run from the repo root. Respects `.gitignore` — ignored files are not staged.',
    manpage: '`git add .` — Stage all changes in current directory tree. `.` is a pathspec matching the current directory. `-A` / `--all` stages all changes in the entire repo regardless of current directory. `--no-all` / `-u` skips untracked files.',
  },

  'git-gitignore': {
    command: '.gitignore',
    eli5: 'A list of things Git should pretend don\'t exist. Log files, build folders, secret keys — anything you never want to accidentally commit. Git reads this file and skips those patterns.',
    savvy: '`.gitignore` contains patterns (one per line) that Git excludes from tracking. `*` matches anything. `/` anchors to repo root. `!` negates a pattern. Git checks `.gitignore` files in each directory and a global `~/.gitignore`. Already-tracked files are NOT ignored retroactively — use `git rm --cached` first.',
    manpage: 'Patterns: `#` comment. `*.log` ignores all .log files. `build/` ignores the build directory. `!important.log` un-ignores a previously ignored file. `/TODO` ignores only root TODO. `doc/**/*.txt` ignores all .txt in doc/ recursively. `.gitignore` is itself committed to the repo.',
  },

  'git-commit': {
    command: 'git commit -m "message"',
    eli5: "This is the actual save button. Everything you've added to your cart gets permanently snapshotted with a timestamp and your name. The message is a note to your future self (and teammates) about what you did.",
    savvy: 'Takes the current staging area (index) and creates a permanent, immutable commit object. Each commit has: a unique SHA-1 hash, author/committer info, timestamp, commit message, a pointer to a tree object (snapshot), and a parent pointer (previous commit). Commits form a directed acyclic graph.',
    manpage: '`git commit [options]` — Record changes. `-m <msg>` inline message. `-a` auto-stage modified tracked files (skips `git add`). `--amend` modify the most recent commit (rewrites history — avoid on pushed commits). `--no-edit` amend without changing message. `-S` GPG-sign the commit.',
  },

  'git-log': {
    command: 'git log',
    eli5: "Your project's history book. Every save you've made shows up here with who made it, when, and why. It goes all the way back to the very first commit.",
    savvy: 'Walks the commit graph from HEAD backward through parent pointers, displaying each commit. The full output shows hash, author, date, and message. Press `q` to exit the pager. `git log <branch>` shows a specific branch. `git log <file>` shows commits that touched a file.',
    manpage: '`git log [options] [revision range] [-- path]` — Show commit logs. `--oneline` condenses to one line. `--graph` ASCII branch diagram. `--all` include all branches. `-n <number>` limit commits shown. `--since="2 weeks ago"` date filter. `--author="name"` filter by author. `--grep="pattern"` filter by message.',
  },

  'git-diff': {
    command: 'git diff',
    eli5: "Shows you exactly what changed, line by line. Red lines are what got deleted. Green lines are what got added. It's like a comparison report between your current work and the last saved version.",
    savvy: 'Without arguments: compares working directory to staging area (unstaged changes). `git diff HEAD`: working directory vs last commit. `git diff --staged`: staging area vs last commit. Output is in unified diff format: `@@` markers show changed region, `-` is removed, `+` is added.',
    manpage: '`git diff [options] [commit] [-- path]` — Show changes. `--staged` / `--cached` diff index vs HEAD. `--stat` summary of changed files. `--word-diff` word-level diff. `git diff <commit>..<commit>` between two commits. `git diff <branch>` against a branch. `-w` ignore whitespace.',
  },

  'git-diff-staged': {
    command: 'git diff --staged',
    eli5: "You've already decided what to save, but you want one last look before pressing the button. This shows exactly what's in your cart — what will be in the next commit.",
    savvy: 'Compares the index (staging area) against the last commit (HEAD). This is exactly the diff that `git commit` will record. Alias: `git diff --cached`. Critical for reviewing staged changes before committing, especially useful after `git add -p` (interactive staging).',
    manpage: '`git diff --staged [options] [-- path]` — Diff index vs HEAD. Alias: `--cached`. Accepts same options as `git diff`. `git diff --staged --stat` shows a summary. `git diff HEAD` shows all uncommitted changes (staged + unstaged combined).',
  },

  'git-restore': {
    command: 'git restore <file>',
    eli5: "Made a mess of a file? This rewinds it to the last clean version. It's like an undo button that goes all the way back to the last save. Warning: your recent changes will be gone.",
    savvy: '`git restore <file>` discards working directory changes, restoring from the index. If the file is also staged, use `git restore --staged <file>` to unstage, then `git restore <file>` to also revert the working copy. `--source <commit>` restores from a specific commit.',
    manpage: '`git restore [options] <pathspec>` — Restore working tree files. `--staged` restore from HEAD into index (unstage). `--source <tree>` use a specific commit/branch as source. `--worktree` restore working tree (default). `-W` shorthand for `--worktree`. `-S` shorthand for `--staged`.',
  },

  'git-rm': {
    command: 'git rm <file>',
    eli5: "Deletes a file AND tells Git to forget it ever existed (going forward). Just deleting with your OS leaves a ghost in Git's index. `git rm` removes it properly from both disk and the staging area.",
    savvy: 'Removes a file from both the working directory and the index. The removal is staged — you still need to `git commit` to record the deletion. `git rm --cached <file>` removes from index only (untrack without deleting from disk). Useful for accidentally committed files.',
    manpage: '`git rm [options] <pathspec>` — Remove files. `-r` recursive for directories. `--cached` remove from index only (keep on disk). `-f` / `--force` override update check. `-n` / `--dry-run` preview without removing. `--ignore-unmatch` no error if file doesn\'t exist.',
  },

  'git-mv': {
    command: 'git mv <old> <new>',
    eli5: "Moves or renames a file the smart way. If you just move it with your OS, Git thinks the old file was deleted and a new one appeared — breaking the history link. `git mv` keeps the history intact.",
    savvy: 'Equivalent to `mv old new && git rm old && git add new`. Git detects renames by content similarity (typically >50% similar), so `git log --follow <file>` traces history across renames. The move is staged and requires a commit.',
    manpage: '`git mv [options] <source> <destination>` — Move or rename a file. `-f` / `--force` overwrite if destination exists. `-n` / `--dry-run` preview. `-v` verbose. Works on files, directories, and symlinks. Destination can be a directory (file moved into it).',
  },

  'git-log-oneline': {
    command: 'git log --oneline',
    eli5: "The regular `git log` is like reading every diary entry in full. `--oneline` is like a table of contents — just the date and topic, one line each.",
    savvy: 'Shorthand for `--format="%h %s"` — abbreviated hash and subject line. Combined with `--graph` and `--all`, it\'s the most efficient way to visualize repository structure. Pairs well with `--author`, `--since`, `-n`, and `--grep` filters.',
    manpage: '`git log --oneline [options]` — Compact one-line-per-commit format. Equivalent to `--pretty=oneline --abbrev-commit`. `--oneline --all` shows all branches. `--oneline -20` shows last 20 commits. `--oneline --no-merges` skips merge commits.',
  },

  'git-log-graph': {
    command: 'git log --oneline --graph',
    eli5: "Adds ASCII art lines showing where branches split and merged. It's a visual family tree of your commits. Straight line = no branching. Forks and merges appear as actual forks and joins.",
    savvy: 'The `--graph` flag draws the commit topology as ASCII art. Most useful with `--oneline --all --decorate` to show all branches and their positions. The `*` marks a commit, `|` is a branch line, `/` and `\\` show merges and divergences.',
    manpage: '`git log --graph [options]` — Draw topology graph. Combine with `--all` to include all refs. `--decorate` adds branch/tag labels. `--simplify-by-decoration` shows only commits with branch/tag labels. Use `git log --graph --all --oneline --decorate` for a full repo overview.',
  },

  'git-show': {
    command: 'git show <commit>',
    eli5: "Cracks open a specific commit and shows you everything: who made it, when, the message, and the exact lines that changed. Like opening a specific page in the diary.",
    savvy: 'Displays a commit\'s metadata (hash, author, date, message) followed by its diff. Can also show other objects: `git show <tag>`, `git show <branch>`, `git show HEAD:file.txt` (file contents at a commit). Accepts the same diff options as `git diff`.',
    manpage: '`git show [options] <object>` — Show various types of objects. `<commit>` shows commit and diff. `<commit>:<file>` shows file content at that commit. `--stat` summary instead of full diff. `--no-patch` / `-s` suppress the diff. Accepts `--format` options like `git log`.',
  },

  'git-stash': {
    command: 'git stash',
    eli5: "Imagine you're mid-task at your desk when the boss calls an urgent meeting. You shove everything into a drawer so your desk is clear. Later you pull the drawer open and continue exactly where you left off. That's stash.",
    savvy: 'Saves the current state of tracked modified files and the staging area onto a stack, then reverts the working directory to HEAD. Stash entries are referenced as `stash@{0}`, `stash@{1}`, etc. Untracked files require `-u` flag. Stash is local — not pushed to remotes.',
    manpage: '`git stash [push|pop|apply|list|drop|clear]` — Stash working tree changes. `push -m "message"` adds a description. `-u` / `--include-untracked` also stash new files. `apply stash@{2}` apply without removing. `drop stash@{0}` delete an entry. `list` shows all stash entries. `branch <name>` create branch from stash.',
  },

  'git-branch': {
    command: 'git branch',
    eli5: "Branches are parallel universes for your code. Create one to try something risky without touching the main version. If the experiment works, you merge it back. If it fails, you delete the branch and nothing is lost.",
    savvy: 'A branch is simply a movable pointer to a commit. `git branch <name>` creates a new pointer at HEAD — it doesn\'t switch. `git branch -d <name>` deletes a merged branch. `git branch -D <name>` force-deletes. `git branch -r` lists remote branches. `git branch -a` lists all.',
    manpage: '`git branch [options] [name] [start-point]` — List, create, or delete branches. `-d` delete (merged only). `-D` force delete. `-m <old> <new>` rename. `-r` remote-tracking branches. `-a` all branches. `--merged` branches fully merged into HEAD. `--no-merged` branches not yet merged.',
  },

  'git-switch': {
    command: 'git switch <branch>',
    eli5: "Steps onto a different branch. Your files in the folder change to match that branch's state. The other branch's work is still there — just on a different path.",
    savvy: 'Moves HEAD to the specified branch and updates the working directory and index to match. Introduced in Git 2.23 as a cleaner alternative to `git checkout <branch>`. Will refuse to switch if you have uncommitted changes that would be overwritten.',
    manpage: '`git switch [options] <branch>` — Switch branches. `-c` / `--create` create and switch. `-C` force-create (overwrite existing). `-d` / `--detach` detach HEAD. `--guess` (default) match partial branch name. `-` switch to previous branch. `--discard-changes` force switch, discarding modifications.',
  },

  'git-switch-c': {
    command: 'git switch -c <branch>',
    eli5: 'Creates a new branch AND jumps onto it in one step. The most common way to start new work — you almost always want to switch immediately after creating.',
    savvy: 'Combines `git branch <name>` + `git switch <name>`. The new branch starts at HEAD by default. `git switch -c <name> <start-point>` branches from a specific commit or branch. Equivalent to the older `git checkout -b <name>`.',
    manpage: '`git switch -c <new-branch> [<start-point>]` — Create and switch. `-C` force-create, resetting an existing branch to start-point. `<start-point>` can be a commit hash, branch name, or tag. `--orphan` creates a branch with no history.',
  },

  'git-merge': {
    command: 'git merge <branch>',
    eli5: "Brings another branch's work into your current branch. If no one touched the same lines, it's automatic. If two people edited the same line, you get a conflict — Git asks you to decide which version wins.",
    savvy: 'Two merge strategies: fast-forward (when target has no new commits — just advances the pointer, no merge commit) and recursive/three-way (creates a merge commit with two parents). Conflicts mark files with `<<<<<<<`, `=======`, `>>>>>>>`. After resolving, `git add` + `git commit` completes the merge.',
    manpage: '`git merge [options] <branch>` — Join histories. `--no-ff` force a merge commit even for fast-forward. `--squash` combine commits but don\'t create merge commit. `--abort` cancel a conflicted merge. `--strategy` choose merge algorithm. `-m <msg>` custom merge commit message.',
  },

  'git-conflict': {
    command: '(resolve merge conflict)',
    eli5: "When two people edit the same line, Git doesn't know which version to keep — so it puts both in the file with caution tape (the <<<<, ====, >>>> markers). You read both, pick what should survive, remove the tape, save the file.",
    savvy: 'Conflict markers: `<<<<<<< HEAD` starts your current branch\'s version. `=======` separates the two versions. `>>>>>>> branch-name` ends the incoming branch\'s version. Edit the file to the desired final state, removing all three marker lines. Then `git add <file>` to mark resolved.',
    manpage: 'To resolve: 1) Edit conflicted files — remove all `<<<<<<<`, `=======`, `>>>>>>>` lines and keep desired content. 2) `git add <resolved-file>` — marks the conflict as resolved. 3) `git commit` — creates the merge commit. `git merge --abort` cancels the entire merge if needed.',
  },

  'git-remote': {
    command: 'git remote add origin <url>',
    eli5: "Tells your local repo where its online backup lives. 'origin' is just a nickname for the URL — like saving a contact in your phone instead of memorizing the number.",
    savvy: 'A remote is a named URL pointing to another repository (GitHub, GitLab, self-hosted). `origin` is the conventional name for the primary remote. You can have multiple remotes (e.g., `upstream` for the original repo you forked from). Remotes are stored in `.git/config`.',
    manpage: '`git remote [add|remove|rename|set-url|show|prune]` — Manage remote connections. `add <name> <url>` register a remote. `remove <name>` delete. `rename <old> <new>` rename. `set-url <name> <url>` update URL. `show <name>` detailed info including tracked branches. `-v` verbose list.',
  },

  'git-push': {
    command: 'git push -u origin main',
    eli5: "Uploads your local commits to GitHub (or wherever). The `-u` flag is a one-time setup that means future `git push` commands know where to go without you having to specify.",
    savvy: '`git push <remote> <branch>` uploads local commits to the remote. `-u` / `--set-upstream` creates a tracking relationship so `git push` and `git pull` work without arguments. `git push --force` (dangerous) rewrites remote history. `git push --tags` pushes annotated tags.',
    manpage: '`git push [options] [remote] [refspec]` — Update remote refs. `-u` set upstream tracking. `--force` / `-f` force push (dangerous on shared branches). `--force-with-lease` safer force push. `--dry-run` simulate. `--tags` push all tags. `--delete <branch>` delete remote branch.',
  },

  'git-fetch': {
    command: 'git fetch',
    eli5: "Downloads what's new from the remote into a holding area, but doesn't change your actual files yet. Like checking your mailbox — you know what arrived, but you haven't opened anything.",
    savvy: 'Downloads commits, branches, and tags from the remote into remote-tracking refs (e.g., `origin/main`). Does not modify your working directory or current branch. Use `git log origin/main` to inspect fetched changes before merging. Safer than `git pull` when you want to review before integrating.',
    manpage: '`git fetch [options] [remote] [refspec]` — Download objects and refs. `--all` fetch all remotes. `--prune` / `-p` delete remote-tracking refs that no longer exist on remote. `--tags` fetch all tags. `--depth <n>` shallow clone fetch. `git fetch origin <branch>` fetch a specific branch only.',
  },

  'git-pull': {
    command: 'git pull',
    eli5: "Downloads the latest from the remote AND merges it into your current branch automatically. It's `git fetch` + `git merge` in one step. Convenient but less cautious — you can always `git fetch` first to look before merging.",
    savvy: '`git pull` runs `git fetch` then `git merge FETCH_HEAD`. With `--rebase`, it runs `git fetch` + `git rebase` instead (cleaner linear history). Can produce merge conflicts if local and remote diverged. `git pull --ff-only` fails instead of creating a merge commit.',
    manpage: '`git pull [options] [remote] [branch]` — Fetch and integrate. `--rebase` rebase instead of merge. `--no-rebase` always merge. `--ff-only` fast-forward only (fail if not possible). `--autostash` stash local changes before pulling, reapply after. `--depth <n>` deepen a shallow clone.',
  },

  'git-revert': {
    command: 'git revert <commit>',
    eli5: "Undoes a specific commit by making a new commit that does the opposite. The mistake stays in the history (for honesty) but its effects are cancelled. Safe to use even after pushing.",
    savvy: 'Creates a new commit that inverts the specified commit\'s changes. Safe for shared/pushed branches because it doesn\'t rewrite history. `git revert HEAD` reverts the last commit. `git revert <hash>` reverts any specific commit. `--no-commit` stages the reversal without committing (for multi-commit reverts).',
    manpage: '`git revert [options] <commit>` — Revert existing commits. `--no-commit` / `-n` stage revert without committing. `-m <parent-number>` for reverting merge commits (1 = first parent, 2 = second). `--mainline <n>` same as `-m`. `--signoff` add sign-off. `--abort` cancel if conflicts arise.',
  },

  'git-reset-soft': {
    command: 'git reset --soft HEAD~1',
    eli5: "Moves the save marker back one commit, but keeps all your changes staged. It's like uncommitting — your work is still there, still ready to commit, just freed from that last snapshot.",
    savvy: 'Moves HEAD and the current branch pointer back to the specified commit. `--soft` leaves the index and working directory unchanged — everything that was in the undone commit is now staged. Useful for rewriting the last commit message (`git reset --soft HEAD~1` then `git commit -m "better message"`).',
    manpage: '`git reset --soft <commit>` — Move HEAD only. Index and working tree untouched. `HEAD~1` one commit back. `HEAD~3` three commits back. `HEAD^` same as `HEAD~1`. `<hash>` reset to specific commit. Changes from undone commits appear as staged in `git status`.',
  },

  'git-reset-mixed': {
    command: 'git reset --mixed HEAD~1',
    eli5: "Moves the save marker back AND empties your staging area, but your files on disk are untouched. You'd need to `git add` again before recommitting. This is the default if you don't specify a mode.",
    savvy: 'The default reset mode. Moves HEAD back and resets the index to match, but preserves working directory files as unstaged modifications. The undone commit\'s changes appear as unstaged in `git status`. Useful for reorganizing commits or splitting a large commit into smaller ones.',
    manpage: '`git reset [--mixed] <commit>` — Move HEAD and reset index. `--mixed` is the default (omitting the flag gives this behavior). Index is reset to the specified commit. Working tree is left alone. Changes from undone commits show as unstaged modifications.',
  },

  'git-reset-hard': {
    command: 'git reset --hard HEAD~1',
    eli5: "The nuclear option. Moves the save marker back and wipes everything — your files revert to that earlier state. Any uncommitted work is gone forever. Only use when you're 100% sure you want to erase those changes.",
    savvy: 'Moves HEAD back and resets both the index and working directory to match the target commit. Uncommitted changes (staged or unstaged) are permanently destroyed. Never use on commits that have been pushed to shared branches. Can be recovered with `git reflog` + `git reset --hard <hash>` within ~90 days.',
    manpage: '`git reset --hard <commit>` — Move HEAD, reset index and working tree. Discards all staged and unstaged changes. `ORIG_HEAD` stores the previous HEAD after a reset — `git reset --hard ORIG_HEAD` undoes a reset. Works with specific hashes for targeted recovery (with `git reflog` to find the hash).',
  },

  'git-reflog': {
    command: 'git reflog',
    eli5: "Git's secret black box recorder. It logs every single time your HEAD moved — commits, resets, branch switches, merges — even ones you thought you erased. If you lose a commit, look here first.",
    savvy: 'Reference log records all movements of HEAD and branch tips. Entries expire after 90 days (by default). Each entry has a reflog reference: `HEAD@{0}` is the latest, `HEAD@{1}` is one step earlier, etc. Critical for recovering from accidental `git reset --hard` or deleted branches.',
    manpage: '`git reflog [show|expire|delete|exists] [ref]` — Manage reflog. `git reflog show HEAD` (default) lists HEAD movements. `git reflog show <branch>` shows a branch\'s movement history. `--all` show all refs. `--date=relative` shows relative timestamps. `git reflog expire --expire=now --all` purge all entries.',
  },

  'git-tag': {
    command: 'git tag v1.0 -m "message"',
    eli5: "Puts a permanent sticky note on a specific commit. Unlike branches (which move forward with every commit), tags stay exactly where you put them — perfect for marking releases like v1.0, v2.3.1.",
    savvy: 'Two types: lightweight tags (just a pointer, no extra data) and annotated tags (full object with tagger, date, message, and optional GPG signature). `git tag v1.0` creates lightweight. `git tag -a v1.0 -m "msg"` or `git tag v1.0 -m "msg"` creates annotated. Tags aren\'t pushed by default — use `git push --tags`.',
    manpage: '`git tag [options] <tagname> [commit]` — Create, list, delete tags. `-a` annotated. `-m <msg>` tag message. `-s` GPG-signed. `-d <name>` delete. `-l <pattern>` list matching tags. `-f` force (overwrite). `git push origin <tagname>` push one tag. `git push origin --tags` push all tags.',
  },

  'git-cherry-pick': {
    command: 'git cherry-pick <commit>',
    eli5: "You see one specific commit on another branch that you want — not the whole branch, just that one thing. Cherry-pick copies it over and applies it to your current branch as a brand new commit.",
    savvy: 'Applies the changes introduced by a specific commit onto the current branch, creating a new commit. The new commit has a different hash even if the content is the same. Useful for hotfixes (applying a fix to both main and a release branch). Can conflict like any merge.',
    manpage: '`git cherry-pick [options] <commit>` — Apply commit changes. Multiple commits: `git cherry-pick abc123 def456`. Range: `git cherry-pick a..b`. `-n` / `--no-commit` apply without committing. `-e` edit message. `-x` append original commit hash to message. `--abort` cancel in conflict.',
  },

  'git-blame': {
    command: 'git blame <file>',
    eli5: "Shows you who last changed every single line of a file, and which commit changed it. Great for asking \"who wrote this?\" or \"when did this line appear?\" — without accusation, just investigation.",
    savvy: 'Annotates each line with: abbreviated commit hash, author name, timestamp, and line number. `git blame -L 10,20 file.txt` focuses on lines 10–20. `git blame <commit> <file>` blames at a specific commit in history. Use `git log -S "string"` if you want to find when a line was added/removed.',
    manpage: '`git blame [options] <file>` — Show last modification per line. `-L <start>,<end>` limit to line range. `-w` ignore whitespace changes. `-M` detect moved/copied lines. `-C` detect lines copied from other files. `--since <date>` ignore commits before date. `-e` show email instead of name.',
  },
}
