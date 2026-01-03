import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SortOption } from '../types';

interface SettingsState {
  vaultPath: string;
  notePath: string;
  identity: string;
  theme: 'light' | 'dark' | 'system';
  annotationSort: SortOption;

  setVaultPath: (path: string) => void;
  setNotePath: (path: string) => void;
  setIdentity: (identity: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAnnotationSort: (sort: SortOption) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      vaultPath: '',
      notePath: '',
      identity: '',
      theme: 'dark',
      annotationSort: 'oldest',

      setVaultPath: (path) => set({ vaultPath: path }),
      setNotePath: (path) => set({ notePath: path }),
      setIdentity: (identity) => set({ identity }),
      setTheme: (theme) => set({ theme }),
      setAnnotationSort: (sort) => set({ annotationSort: sort })
    }),
    { name: 'settings-store' }
  )
);
