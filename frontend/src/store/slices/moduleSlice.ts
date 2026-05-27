import { StateCreator } from 'zustand';
import { AppState } from '@/types';

export const createModuleSlice: StateCreator<AppState, [], [], any> = (set) => ({
  activeModuleId: '0237-ictve-pd', // ID por defecto para pruebas
  setActiveModuleId: (id: any) => set({ activeModuleId: id }),
  
  activeCursoId: '0237-ictve-curso-2025-26',
  setActiveCursoId: (id: any) => set({ activeCursoId: id }),
  
  moduleData: null,
  setModuleData: (data: any) => set({ moduleData: data }),
  
  updateInfoModulo: (key: any, value: any) => set((state: any) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      info_modulo: {
        ...state.moduleData.info_modulo,
        [key]: value
      }
    } : null
  })),
  
  updateDataFrame: (key: any, data: any) => set((state: any) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      [key]: data
    } : null
  })),
  
  updateModuleData: (key: any, data: any) => set((state: any) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      [key]: data
    } : null
  })),
  
  cursoData: null,
  setCursoData: (data: any) => set({ cursoData: data }),
  
  updateCursoData: (key: any, data: any) => set((state: any) => ({
    cursoData: state.cursoData ? {
      ...state.cursoData,
      [key]: data
    } : null
  })),
});
