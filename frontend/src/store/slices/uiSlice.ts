import { StateCreator } from 'zustand';
import { AppState } from '@/types';

type UiSlice = Pick<AppState, 'isSidebarOpen' | 'toggleSidebar' | 'isWizardOpen' | 'setWizardOpen'>;

export const createUiSlice: StateCreator<AppState, [], [], UiSlice> = (set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isWizardOpen: false,
  setWizardOpen: (open: boolean) => set({ isWizardOpen: open }),
});
