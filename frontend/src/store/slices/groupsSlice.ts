import { StateCreator } from 'zustand';
import { AppState } from '@/types';
import { initialGroups } from '../initialData';

export const createGroupsSlice: StateCreator<AppState, [], [], any> = (set) => ({
  groups: initialGroups,
  setGroups: (newGroups: any) => set((state: any) => ({
    groups: typeof newGroups === 'function' ? newGroups(state.groups) : newGroups
  })),
});
