import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { temporal } from 'zundo';
import { get, set, del } from 'idb-keyval';
import { AppState, CourseGroup } from '@/types';

import { createAuthSlice } from './slices/authSlice';
import { createUiSlice } from './slices/uiSlice';
import { createModuleSlice } from './slices/moduleSlice';
import { createGroupsSlice } from './slices/groupsSlice';

// IndexedDB storage engine
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useAppStore = create<AppState>()(
  temporal(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createUiSlice(...a),
        ...createModuleSlice(...a),
        ...createGroupsSlice(...a),
      }),
      {
        name: 'cdd-store-cache',
        storage: createJSONStorage(() => idbStorage),
      }
    ),
    {
      limit: 20,
      partialize: (state) => ({
        moduleData: state.moduleData,
        cursoData: state.cursoData
      })
    }
  )
);

import { useStore } from 'zustand';

export const useTemporalStore = <T,>(
  selector: (state: import('zundo').TemporalState<Pick<AppState, 'moduleData' | 'cursoData'>>) => T,
) => useStore(useAppStore.temporal, selector);

// Selectores compartidos
export const calculateTeacherHours = (groups: CourseGroup[], teacherId: number) => {
  let total = 0;
  groups.forEach(g => {
    g.modules.forEach(m => {
      if (m.assignedTeacherId === teacherId) total += m.hours;
    });
  });
  return total;
};

export const getTeacherAssignedModules = (groups: CourseGroup[], teacherId: number) => {
  const assigned: { groupName: string; moduleName: string; hours: number; code: string }[] = [];
  groups.forEach(g => {
    g.modules.forEach(m => {
      if (m.assignedTeacherId === teacherId) {
        assigned.push({
          groupName: g.name,
          moduleName: m.name,
          hours: m.hours,
          code: m.code
        });
      }
    });
  });
  return assigned;
};
