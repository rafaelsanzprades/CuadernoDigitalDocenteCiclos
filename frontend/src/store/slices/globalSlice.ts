import { StateCreator } from 'zustand';
import { AppState, GlobalData } from '@/types';

type GlobalSlice = Pick<AppState, 'globalData' | 'setGlobalData' | 'updateGlobalData'>;

export const createGlobalSlice: StateCreator<AppState, [], [], GlobalSlice> = (set) => ({
  globalData: null,
  setGlobalData: (data: GlobalData | null) =>
    set(() => ({
      globalData: data,
    })),
  updateGlobalData: (key: keyof GlobalData, data: any) =>
    set((state) => ({
      globalData: state.globalData ? {
        ...state.globalData,
        [key]: data
      } : null
    })),
});
