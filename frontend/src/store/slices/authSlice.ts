import { StateCreator } from 'zustand';
import { AppState } from '@/types';

export const createAuthSlice: StateCreator<AppState, [], [], any> = (set) => ({
  isLoggedIn: false,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
});
