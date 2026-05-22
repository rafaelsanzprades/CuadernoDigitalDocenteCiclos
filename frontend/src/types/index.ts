export interface Sesion {
  ID: string;
  id_ud: string;
  Num_Orden: number;
  Horas: number;
  Tipo_Actividad: string;
  RA_CE?: string;
  Contenidos?: string;
  Aspectos_Clave?: string;
  Recursos?: string;
}

export interface UnidadDidactica {
  id_ud: string;
  desc_ud: string;
  horas_ud: number | string;
  ra_mappings?: Record<string, any>;
}

export interface Tarea {
  ID: string;
  id_act?: string;
  Nombre_Tarea?: string;
  Reto?: string;
  RA_Asociados?: string;
  Instrumento?: string;
  desc_act?: string;
}

export interface Alumno {
  ID?: string;
  student_id?: string;
  Nombre?: string;
  Apellidos?: string;
  Estado?: string;
  Edad?: string;
  Nacimiento?: string;
  Repite?: string;
  Matricula?: string;
  Comentarios?: string;
  Email?: string;
  Movil?: string;
}

export interface ResultadoAprendizaje {
  id_ra: string;
  desc_ra?: string;
  peso_ra?: string | number;
  is_dual?: string;
}

export interface CriterioEvaluacion {
  id_ce: string;
  id_ra: string;
  id_ud?: string;
  desc_ce?: string;
  peso_ce?: string | number;
}

export interface SeguimientoUD {
  id_ud: string;
  horas_ud?: number | string;
  Total_Imp?: number | string;
  [key: string]: any; // Allow dynamic month columns (Sep_Prv, Oct_Imp, etc.)
}

export interface ModuleData {
  df_ud?: UnidadDidactica[];
  df_sesiones?: Sesion[];
  df_ra?: ResultadoAprendizaje[];
  df_ce?: CriterioEvaluacion[];
  df_tareas?: Tarea[];
  df_act?: any[];
  df_instr?: any[];
  df_dua?: any[];
  df_contingencia?: any[];
  info_modulo?: Record<string, any>;
}

export interface CursoData {
  df_al?: Alumno[];
  df_sgmt?: SeguimientoUD[];
  df_feoe?: any[];
  info_fechas?: Record<string, any>;
  horario?: Record<string, any>;
}

export interface AppState {
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  activeCursoId: string;
  setActiveCursoId: (id: string) => void;
  
  moduleData: ModuleData | null;
  setModuleData: (data: ModuleData | null) => void;
  updateDataFrame: (key: string, data: any[]) => void;
  updateModuleData: (key: string, data: any) => void;
  updateInfoModulo: (key: string, value: any) => void;
  
  cursoData: CursoData | null;
  setCursoData: (data: CursoData | null) => void;
  updateCursoData: (key: string, data: any) => void;
  
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  
  groups: any[];
  setGroups: (groups: any[] | ((prev: any[]) => any[])) => void;
}
