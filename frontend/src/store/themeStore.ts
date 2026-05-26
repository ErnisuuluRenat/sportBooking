import { create } from 'zustand'

interface ThemeStore {
  theme: 'dark' | 'light'
  toggle: () => void
}

const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
const initial = saved ?? 'dark'

if (initial === 'light') {
  document.documentElement.classList.add('light')
} else {
  document.documentElement.classList.remove('light')
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: initial,
  toggle: () => set(state => {
    const next = state.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    if (next === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
    return { theme: next }
  }),
}))