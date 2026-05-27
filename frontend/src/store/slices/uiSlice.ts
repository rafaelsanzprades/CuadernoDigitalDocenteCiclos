import { StateCreator } from 'zustand';
import { AppState } from '@/types';

export const createUiSlice: StateCreator<AppState, [], [], any> = (set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state: any) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isWizardOpen: false,
  setWizardOpen: (open: boolean) => set({ isWizardOpen: open }),
});
