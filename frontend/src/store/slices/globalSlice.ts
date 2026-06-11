import { StateCreator } from 'zustand';
import { AppState } from '@/types';

export interface GlobalState {
  globalData: {
    theme?: string;
    language?: string;
  };
  setGlobalData: (data: Partial<GlobalState['globalData']>) => void;
}

export const createGlobalSlice: StateCreator<AppState, [['zustand/persist', unknown], ['zundo']], [], GlobalState> = (set) => ({
  globalData: {
    theme: 'light',
    language: 'es',
  },
  setGlobalData: (data) =>
    set((state) => ({
      globalData: { ...state.globalData, ...data },
    })),
});
