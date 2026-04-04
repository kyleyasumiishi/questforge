import { create } from 'zustand'

export const defaultGitState = {
  initialized: false,
  config: { name: '', email: '' },
  workingDirectory: {
    'README.scroll': { status: 'untracked' },
    'map.txt': { status: 'untracked' },
    'hero.cfg': { status: 'untracked' },
  },
  gitignorePatterns: [],
  index: {},          // filename → { content, staged: true }
  commits: [],        // { hash, message, tree, parent, author, timestamp }
  HEAD: 'main',
  branches: { main: null },   // branch name → commit hash | null
  stash: [],          // [{ message, index, workingDirectory }]
  remotes: {},        // name → url
  tags: {},           // name → { hash, message }
}

export const useGitStore = create(() => ({ ...defaultGitState }))

export function resetGitStore() {
  useGitStore.setState({ ...defaultGitState })
}
