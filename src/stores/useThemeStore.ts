import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,

      toggleTheme: () => {
        set((state) => {
          const newIsDark = !state.isDark;
          
          // Apply theme immediately to document
          if (newIsDark) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
          }
          
          return { isDark: newIsDark };
        });
      },

      setTheme: (isDark: boolean) => {
        set({ isDark });
        
        // Apply theme immediately to document
        if (isDark) {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);