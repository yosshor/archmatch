/**
 * Theme Store - Manages dark/light mode
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        updateDocumentTheme(newTheme);
      },

      setTheme: (theme: Theme) => {
        set({ theme });
        updateDocumentTheme(theme);
      },
    }),
    {
      name: 'archMatch_theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateDocumentTheme(state.theme);
        }
      },
    }
  )
);

function updateDocumentTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }
}
