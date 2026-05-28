import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, CourseGroup } from '@/types';

import { createAuthSlice } from './slices/authSlice';
import { createUiSlice } from './slices/uiSlice';
import { createModuleSlice } from './slices/moduleSlice';
import { createGroupsSlice } from './slices/groupsSlice';

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createUiSlice(...a),
      ...createModuleSlice(...a),
      ...createGroupsSlice(...a),
    }),
    {
      name: 'cdd-store-cache',
    }
  )
);

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
