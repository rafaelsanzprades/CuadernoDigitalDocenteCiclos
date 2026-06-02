import { StateCreator } from 'zustand';
import { AppState } from '@/types';

type AuthSlice = Pick<AppState, 'isLoggedIn' | 'login' | 'logout'>;

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set) => ({
  isLoggedIn: false,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
});
