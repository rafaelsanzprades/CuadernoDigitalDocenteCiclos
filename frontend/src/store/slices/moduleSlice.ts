import { StateCreator } from 'zustand';
import { AppState, ModuleData, CursoData } from '@/types';

type ModuleSlice = Pick<AppState,
  | 'activeModuleId' | 'setActiveModuleId'
  | 'activeCursoId' | 'setActiveCursoId'
  | 'moduleData' | 'setModuleData'
  | 'updateInfoModulo' | 'updateDataFrame' | 'updateModuleData'
  | 'cursoData' | 'setCursoData' | 'updateCursoData'
  | 'saveModuleData' | 'saveCursoData'
>;

async function saveToApi(id: string, data: ModuleData | CursoData): Promise<boolean | "conflict"> {
  try {
    // Increment version before sending
    const currentVersion = data.__version__ || 0;
    const payload = { ...data, __version__: currentVersion };
    
    const res = await fetch(`/api/module/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (res.status === 409) {
      return "conflict";
    }
    
    const result = await res.json();
    return result.status === "success";
  } catch {
    return false;
  }
}

export const createModuleSlice: StateCreator<AppState, [], [], ModuleSlice> = (set, get) => ({
  activeModuleId: '0237-ictve-pd',
  setActiveModuleId: (id: string) => set({ activeModuleId: id }),

  activeCursoId: '0237-ictve-curso-2025-26',
  setActiveCursoId: (id: string) => set({ activeCursoId: id }),

  moduleData: null,
  setModuleData: (data: ModuleData | null) => set({ moduleData: data }),

  updateInfoModulo: (key: string, value: unknown) => set((state) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      info_modulo: {
        ...state.moduleData.info_modulo,
        [key]: value
      }
    } : null
  })),

  updateDataFrame: (key: keyof ModuleData, data: unknown[]) => set((state) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      [key]: data
    } : null
  })),

  updateModuleData: (key: keyof ModuleData, data: unknown) => set((state) => ({
    moduleData: state.moduleData ? {
      ...state.moduleData,
      [key]: data
    } : null
  })),

  cursoData: null,
  setCursoData: (data: CursoData | null) => set({ cursoData: data }),

  updateCursoData: (key: keyof CursoData, data: unknown) => set((state) => ({
    cursoData: state.cursoData ? {
      ...state.cursoData,
      [key]: data
    } : null
  })),

  saveModuleData: async () => {
    const { activeModuleId, moduleData } = get();
    if (!activeModuleId || !moduleData) return false;
    const ok = await saveToApi(activeModuleId, moduleData);
    if (ok === true) {
      set({ moduleData: { ...moduleData, __version__: (moduleData.__version__ || 0) + 1 } });
    }
    return ok;
  },

  saveCursoData: async () => {
    const { activeCursoId, cursoData } = get();
    if (!activeCursoId || !cursoData) return false;
    const ok = await saveToApi(activeCursoId, cursoData);
    if (ok === true) {
      set({ cursoData: { ...cursoData, __version__: (cursoData.__version__ || 0) + 1 } });
    }
    return ok;
  },
});
