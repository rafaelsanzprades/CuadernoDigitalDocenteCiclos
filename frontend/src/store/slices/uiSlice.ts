import { StateCreator } from 'zustand';
import { AppState } from '@/types';

type UiSlice = Pick<AppState, 'isSidebarOpen' | 'toggleSidebar' | 'isWizardOpen' | 'setWizardOpen' | 'dataSource' | 'setDataSource' | 'isDriveConnected' | 'setDriveConnected' | 'driveUserEmail' | 'setDriveUserEmail' | 'autoSyncDrive' | 'setAutoSyncDrive' | 'googleClientId' | 'setGoogleClientId'>;

export const createUiSlice: StateCreator<AppState, [], [], UiSlice> = (set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isWizardOpen: false,
  setWizardOpen: (open: boolean) => set({ isWizardOpen: open }),
  dataSource: 'demo',
  setDataSource: (source: 'demo' | 'local') => set({ dataSource: source }),
  isDriveConnected: false,
  setDriveConnected: (connected: boolean) => set({ isDriveConnected: connected }),
  driveUserEmail: null,
  setDriveUserEmail: (email: string | null) => set({ driveUserEmail: email }),
  autoSyncDrive: false,
  setAutoSyncDrive: (sync: boolean) => set({ autoSyncDrive: sync }),
  googleClientId: "",
  setGoogleClientId: (id: string) => set({ googleClientId: id }),
});
