import { StateCreator } from 'zustand';
import { AppState, CourseGroup } from '@/types';
import { initialGroups } from '../initialData';

type GroupsSlice = Pick<AppState, 'groups' | 'setGroups'>;

export const createGroupsSlice: StateCreator<AppState, [], [], GroupsSlice> = (set) => ({
  groups: initialGroups,
  setGroups: (newGroups: CourseGroup[] | ((prev: CourseGroup[]) => CourseGroup[])) => set((state) => ({
    groups: typeof newGroups === 'function' ? newGroups(state.groups) : newGroups
  })),
});
