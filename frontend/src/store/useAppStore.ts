import { create } from 'zustand';

interface AppState {
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  moduleData: any;
  setModuleData: (data: any) => void;
  updateInfoModulo: (key: string, value: any) => void;
  updateDataFrame: (key: string, data: any[]) => void;
  activeCursoId: string;
  setActiveCursoId: (id: string) => void;
  cursoData: any;
  setCursoData: (data: any) => void;
  updateCursoData: (key: string, data: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModuleId: '0237-ictve-pd', // ID por defecto para pruebas
  setActiveModuleId: (id) => set({ activeModuleId: id }),
  activeCursoId: '',
  setActiveCursoId: (id) => set({ activeCursoId: id }),
  moduleData: null,
  setModuleData: (data) => set({ moduleData: data }),
  updateInfoModulo: (key, value) => set((state) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      info_modulo: {
        ...state.moduleData.info_modulo,
        [key]: value
      }
    } : null
  })),
  updateDataFrame: (key, data) => set((state) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      [key]: data
    } : null
  })),
  cursoData: null,
  setCursoData: (data) => set({ cursoData: data }),
  updateCursoData: (key, data) => set((state) => ({
    cursoData: state.cursoData ? {
      ...state.cursoData,
      [key]: data
    } : null
  }))
}));
