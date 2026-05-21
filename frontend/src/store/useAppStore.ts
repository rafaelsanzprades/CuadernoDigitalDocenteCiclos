import { create } from 'zustand';

export interface ModuleAssignment {
  id: number;
  code: string;
  name: string;
  hours: number;
  isDual: boolean;
  assignedTeacherId: number | null;
  ras?: { raNumber: number; description: string }[];
}

export interface CourseGroup {
  id: number;
  name: string;
  degreeName: string;
  level: string;
  modules: ModuleAssignment[];
}

interface AppState {
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  moduleData: any;
  setModuleData: (data: any) => void;
  updateInfoModulo: (key: string, value: any) => void;
  updateDataFrame: (key: string, data: any[]) => void;
  updateModuleData: (key: string, data: any) => void;
  activeCursoId: string;
  setActiveCursoId: (id: string) => void;
  cursoData: any;
  setCursoData: (data: any) => void;
  updateCursoData: (key: string, data: any) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  
  // Shared state for assignments and teachers
  groups: CourseGroup[];
  setGroups: (groups: CourseGroup[] | ((prev: CourseGroup[]) => CourseGroup[])) => void;
}

const initialGroups: CourseGroup[] = [
  {
    id: 1,
    name: "1º Instalaciones de Telecomunicaciones",
    degreeName: "Técnico en Instalaciones de Telecomunicaciones",
    level: "Grado Medio",
    modules: [
      { id: 101, code: "0237", name: "Infra. comunes de teleco en viviendas y edificios", hours: 167, isDual: false, assignedTeacherId: 2, ras: [
        { raNumber: 1, description: "Identifica los elementos de las infraestructuras..." },
        { raNumber: 2, description: "Configura pequeñas instalaciones de infraestructuras..." },
        { raNumber: 3, description: "Monta instalaciones de infraestructuras comunes..." }
      ]},
      { id: 102, code: "0359", name: "Electrónica aplicada", hours: 167, isDual: false, assignedTeacherId: 3, ras: [
        { raNumber: 1, description: "Reconoce los principios básicos de la electrónica..." },
        { raNumber: 2, description: "Monta circuitos electrónicos básicos..." }
      ]},
      { id: 103, code: "0360", name: "Equipos microinformáticos", hours: 100, isDual: false, assignedTeacherId: 4 },
      { id: 104, code: "0361", name: "Infra. de redes de datos y sistemas de telefonía", hours: 133, isDual: true, assignedTeacherId: 5 },
      { id: 105, code: "0362", name: "Instalaciones eléctricas básicas", hours: 200, isDual: true, assignedTeacherId: 6 },
      { id: 106, code: "1664", name: "Digitalización aplicada a los sectores productivos (GM)", hours: 33, isDual: false, assignedTeacherId: 4 },
      { id: 107, code: "A997", name: "Tutoría I", hours: 33, isDual: false, assignedTeacherId: 2 },
      { id: 108, code: "0156", name: "Inglés Profesional (GM)", hours: 67, isDual: false, assignedTeacherId: 7 },
      { id: 109, code: "1709", name: "Itinerario personal para la empleabilidad I", hours: 100, isDual: false, assignedTeacherId: 8 }
    ]
  },
  {
    id: 2,
    name: "2º Instalaciones de Telecomunicaciones",
    degreeName: "Técnico en Instalaciones de Telecomunicaciones",
    level: "Grado Medio",
    modules: [
      { id: 201, code: "0238", name: "Instalaciones domóticas", hours: 133, isDual: true, assignedTeacherId: 2 },
      { id: 202, code: "0363", name: "Instalaciones de megafonía y sonorización", hours: 200, isDual: true, assignedTeacherId: 6 },
      { id: 203, code: "0364", name: "Circuito cerrado de televisión y seguridad electrónica", hours: 200, isDual: true, assignedTeacherId: 9 },
      { id: 204, code: "0365", name: "Instalaciones de radiocomunicaciones", hours: 167, isDual: true, assignedTeacherId: 3 },
      { id: 205, code: "1708", name: "Sostenibilidad aplicada al sistema productivo", hours: 33, isDual: false, assignedTeacherId: 5 },
      { id: 206, code: "A172", name: "Ofimática avanzada", hours: 100, isDual: true, assignedTeacherId: 4 },
      { id: 207, code: "1713", name: "Proyecto intermodular", hours: 67, isDual: false, assignedTeacherId: 7 },
      { id: 208, code: "A996", name: "Tutoría II", hours: 33, isDual: false, assignedTeacherId: 3 },
      { id: 209, code: "1710", name: "Itinerario personal para la empleabilidad II", hours: 67, isDual: false, assignedTeacherId: 8 }
    ]
  },
  {
    id: 3,
    name: "1º Sistemas de Telecomunicaciones e Informáticos",
    degreeName: "Técnico Superior en Sistemas de Telecomunicaciones e Informáticos",
    level: "Grado Superior",
    modules: [
      { id: 301, code: "0525", name: "Configuración de infraestructuras de sistemas de tele", hours: 133, isDual: false, assignedTeacherId: 9 },
      { id: 302, code: "0551", name: "Elementos de sistemas de telecomunicaciones", hours: 133, isDual: false, assignedTeacherId: 3 },
      { id: 303, code: "0552", name: "Sistemas informáticos y redes locales", hours: 133, isDual: true, assignedTeacherId: 2 },
      { id: 304, code: "0554", name: "Sistemas de producción audiovisual", hours: 200, isDual: true, assignedTeacherId: 4 },
      { id: 305, code: "0601", name: "Gestión de proyectos de instalaciones de teleco", hours: 67, isDual: false, assignedTeacherId: 9 },
      { id: 306, code: "0713", name: "Sistemas de telefonía fija y móvil", hours: 133, isDual: false, assignedTeacherId: 6 },
      { id: 307, code: "1665", name: "Digitalización aplicada a los sectores productivos (GS)", hours: 33, isDual: false, assignedTeacherId: 6 },
      { id: 308, code: "0179", name: "Inglés Profesional", hours: 67, isDual: false, assignedTeacherId: 7 },
      { id: 309, code: "1709", name: "Itinerario personal para la empleabilidad I", hours: 100, isDual: false, assignedTeacherId: 8 }
    ]
  },
  {
    id: 4,
    name: "2º Sistemas de Telecomunicaciones e Informáticos",
    degreeName: "Técnico Superior en Sistemas de Telecomunicaciones e Informáticos",
    level: "Grado Superior",
    modules: [
      { id: 401, code: "0553", name: "Técnicas y procesos en infraestructuras de teleco", hours: 133, isDual: true, assignedTeacherId: 4 },
      { id: 402, code: "0555", name: "Redes telemáticas", hours: 233, isDual: true, assignedTeacherId: 5 },
      { id: 403, code: "0556", name: "Sistemas de radiocomunicaciones", hours: 200, isDual: true, assignedTeacherId: 5 },
      { id: 404, code: "0557", name: "Sistemas integrados y hogar digital", hours: 167, isDual: true, assignedTeacherId: 9 },
      { id: 405, code: "1708", name: "Sostenibilidad aplicada al sistema productivo", hours: 33, isDual: false, assignedTeacherId: 3 },
      { id: 406, code: "1713", name: "Proyecto intermodular", hours: 67, isDual: false, assignedTeacherId: 2 }
    ]
  },
  {
    id: 5,
    name: "1º Gestión Administrativa",
    degreeName: "ADG201 - Técnico en Gestión Administrativa",
    level: "Grado Medio",
    modules: [
      { id: 501, code: "0437", name: "Comunicación empresarial y atención al cliente", hours: 160, isDual: false, assignedTeacherId: null },
      { id: 502, code: "0438", name: "Operaciones administrativas de compra-venta", hours: 160, isDual: false, assignedTeacherId: null },
      { id: 503, code: "0439", name: "Empresa y administración", hours: 96, isDual: false, assignedTeacherId: null },
      { id: 504, code: "0440", name: "Tratamiento informático de la información", hours: 224, isDual: false, assignedTeacherId: null },
      { id: 505, code: "0441", name: "Técnica contable", hours: 96, isDual: false, assignedTeacherId: null },
      { id: 506, code: "0156", name: "Inglés Profesional (GM)", hours: 64, isDual: false, assignedTeacherId: null },
      { id: 507, code: "1664", name: "Digitalización aplicada a los sectores productivos (GM)", hours: 32, isDual: false, assignedTeacherId: null },
      { id: 508, code: "1709", name: "Itinerario personal para la empleabilidad I", hours: 96, isDual: false, assignedTeacherId: null }
    ]
  },
  {
    id: 6,
    name: "2º Gestión Administrativa",
    degreeName: "ADG201 - Técnico en Gestión Administrativa",
    level: "Grado Medio",
    modules: [
      { id: 601, code: "0446", name: "Empresa en el aula", hours: 147, isDual: true, assignedTeacherId: null },
      { id: 602, code: "0448", name: "Operaciones auxiliares de gestión de tesorería", hours: 147, isDual: true, assignedTeacherId: null },
      { id: 603, code: "0442", name: "Operaciones administrativas de recursos humanos", hours: 105, isDual: true, assignedTeacherId: null },
      { id: 604, code: "0443", name: "Tratamiento de la documentación contable", hours: 105, isDual: true, assignedTeacherId: null },
      { id: 605, code: "1710", name: "Itinerario personal para la empleabilidad II", hours: 96, isDual: false, assignedTeacherId: null },
      { id: 606, code: "1708", name: "Sostenibilidad aplicada al sistema productivo", hours: 32, isDual: false, assignedTeacherId: null }
    ]
  },
  {
    id: 7,
    name: "1º Administración y Finanzas",
    degreeName: "ADG301 - Técnico Superior en Administración y Finanzas",
    level: "Grado Superior",
    modules: [
      { id: 701, code: "0647", name: "Gestión de la documentación jurídica y empresarial", hours: 96, isDual: false, assignedTeacherId: null },
      { id: 702, code: "0648", name: "Recursos humanos y responsabilidad social corporativa", hours: 64, isDual: false, assignedTeacherId: null },
      { id: 703, code: "0649", name: "Ofimática y proceso de la información", hours: 192, isDual: false, assignedTeacherId: null },
      { id: 704, code: "0650", name: "Proceso integral de la actividad comercial", hours: 192, isDual: false, assignedTeacherId: null },
      { id: 705, code: "0651", name: "Comunicación y atención al cliente", hours: 160, isDual: false, assignedTeacherId: null },
      { id: 706, code: "0179", name: "Inglés Profesional (GS)", hours: 64, isDual: false, assignedTeacherId: null },
      { id: 707, code: "1665", name: "Digitalización aplicada a los sectores productivos (GS)", hours: 32, isDual: false, assignedTeacherId: null },
      { id: 708, code: "1709", name: "Itinerario personal para la empleabilidad I", hours: 96, isDual: false, assignedTeacherId: null }
    ]
  },
  {
    id: 8,
    name: "2º Administración y Finanzas",
    degreeName: "ADG301 - Técnico Superior en Administración y Finanzas",
    level: "Grado Superior",
    modules: [
      { id: 801, code: "0652", name: "Gestión de recursos humanos", hours: 84, isDual: true, assignedTeacherId: null },
      { id: 802, code: "0653", name: "Gestión financiera", hours: 126, isDual: true, assignedTeacherId: null },
      { id: 803, code: "0654", name: "Contabilidad y fiscalidad", hours: 126, isDual: true, assignedTeacherId: null },
      { id: 804, code: "0655", name: "Gestión logística y comercial", hours: 105, isDual: true, assignedTeacherId: null },
      { id: 805, code: "0656", name: "Simulación empresarial", hours: 126, isDual: true, assignedTeacherId: null },
      { id: 806, code: "0657", name: "Proyecto de administración y finanzas", hours: 30, isDual: false, assignedTeacherId: null },
      { id: 807, code: "1710", name: "Itinerario personal para la empleabilidad II", hours: 96, isDual: false, assignedTeacherId: null },
      { id: 808, code: "1708", name: "Sostenibilidad aplicada al sistema productivo", hours: 32, isDual: false, assignedTeacherId: null }
    ]
  }
];

export const useAppStore = create<AppState>((set) => ({
  isLoggedIn: false,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  activeModuleId: '0237-ictve-pd', // ID por defecto para pruebas
  setActiveModuleId: (id) => set({ activeModuleId: id }),
  activeCursoId: '0237-ictve-curso-2025-26',
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
  updateModuleData: (key, data) => set((state) => ({
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
  })),
  
  // Shared groups state
  groups: initialGroups,
  setGroups: (newGroups) => set((state) => ({
    groups: typeof newGroups === 'function' ? newGroups(state.groups) : newGroups
  }))
}));
