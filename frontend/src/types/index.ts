import { z } from "zod";

export const SesionSchema = z.object({
  ID: z.string(),
  id_ud: z.string(),
  Num_Orden: z.number().or(z.string().transform(Number)),
  Horas: z.number().or(z.string().transform(Number)),
  Tipo_Actividad: z.string(),
  RA_CE: z.string().optional().nullable(),
  Contenidos: z.string().optional().nullable(),
  Aspectos_Clave: z.string().optional().nullable(),
  Recursos: z.string().optional().nullable(),
});
export type Sesion = z.infer<typeof SesionSchema>;

export const UnidadDidacticaSchema = z.object({
  id_ud: z.string(),
  desc_ud: z.string(),
  horas_ud: z.union([z.number(), z.string()]),
  ra_mappings: z.record(z.string(), z.any()).optional().nullable(),
}).passthrough();
export type UnidadDidactica = z.infer<typeof UnidadDidacticaSchema>;

export const TareaSchema = z.object({
  ID: z.string(),
  id_act: z.string().optional(),
  Nombre_Tarea: z.string().optional().nullable(),
  Reto: z.string().optional().nullable(),
  RA_Asociados: z.string().optional().nullable(),
  Instrumento: z.string().optional().nullable(),
  desc_act: z.string().optional().nullable(),
});
export type Tarea = z.infer<typeof TareaSchema>;

export const AlumnadoSchema = z.object({
  ID: z.string().optional(),
  student_id: z.string().optional(),
  Nombre: z.string().optional(),
  Apellidos: z.string().optional(),
  Estado: z.string().optional(),
  Edad: z.string().optional(),
  Nacimiento: z.string().optional(),
  Repite: z.string().optional(),
  Matricula: z.string().optional(),
  Comentarios: z.string().optional().nullable(),
  Email: z.string().optional().nullable(),
  Movil: z.string().optional().nullable(),
});
export type Alumnado = z.infer<typeof AlumnadoSchema>;

export const ResultadoAprendizajeSchema = z.object({
  id_ra: z.string(),
  desc_ra: z.string().optional().nullable(),
  peso_ra: z.union([z.string(), z.number()]).optional(),
  is_dual: z.string().optional().nullable(),
});
export type ResultadoAprendizaje = z.infer<typeof ResultadoAprendizajeSchema>;

export const CriterioEvaluacionSchema = z.object({
  id_ce: z.string(),
  id_ra: z.string(),
  id_ud: z.string().optional(),
  desc_ce: z.string().optional().nullable(),
  peso_ce: z.union([z.string(), z.number()]).optional(),
});
export type CriterioEvaluacion = z.infer<typeof CriterioEvaluacionSchema>;

export const SeguimientoUDSchema = z.record(z.string(), z.any()).and(
  z.object({
    id_ud: z.string(),
    horas_ud: z.union([z.number(), z.string()]).optional(),
    Total_Imp: z.union([z.number(), z.string()]).optional(),
  })
);
export type SeguimientoUD = z.infer<typeof SeguimientoUDSchema>;

export const ModuleDataSchema = z.object({
  df_ud: z.array(UnidadDidacticaSchema).optional(),
  df_sesiones: z.array(SesionSchema).optional(),
  df_ra: z.array(ResultadoAprendizajeSchema).optional(),
  df_ce: z.array(CriterioEvaluacionSchema).optional(),
  df_tareas: z.array(TareaSchema).optional(),
  df_act: z.array(z.any()).optional(),
  df_instr: z.array(z.any()).optional(),
  df_pr: z.array(z.any()).optional(),
  df_dua: z.array(z.any()).optional(),
  df_contingencia: z.array(z.any()).optional(),
  df_ace: z.array(z.any()).optional(),
  info_modulo: z.record(z.string(), z.any()).optional(),
  horario: z.record(z.string(), z.any()).optional(),
  info_fechas: z.record(z.string(), z.any()).optional(),
  calendar_notes: z.record(z.string(), z.any()).optional(),
  planning_ledger: z.record(z.string(), z.any()).optional(),
  config_contexto: z.record(z.string(), z.any()).optional(),
  config_aula: z.record(z.string(), z.any()).optional(),
  __version__: z.number().optional(),
});
export type ModuleData = z.infer<typeof ModuleDataSchema>;

export const CrmInteraccionSchema = z.object({
  id: z.string(),
  fecha: z.string(),
  tipo: z.enum(["llamada", "email", "visita", "otro"]),
  descripcion: z.string(),
  contacto: z.string(),
});
export type CrmInteraccion = z.infer<typeof CrmInteraccionSchema>;

export const CrmEmpresaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  contacto_nombre: z.string(),
  contacto_cargo: z.string(),
  telefono: z.string(),
  email: z.string(),
  direccion: z.string(),
  ciudad: z.string(),
  codigo_postal: z.string(),
  provincia: z.string(),
  sector: z.string(),
  notas: z.string(),
  estado: z.enum(["activo", "inactivo", "pendiente"]),
  interacciones: z.array(CrmInteraccionSchema),
  alumnado_asignados: z.array(z.string()),
});
export type CrmEmpresa = z.infer<typeof CrmEmpresaSchema>;

export const CursoDataSchema = z.object({
  df_al: z.array(AlumnadoSchema).optional(),
  df_sgmt: z.array(SeguimientoUDSchema).optional(),
  df_feoe: z.array(z.any()).optional(),
  df_eval: z.array(z.any()).optional(),
  daily_ledger: z.record(z.string(), z.any()).optional(),
  tutoria_ledger: z.record(z.string(), z.any()).optional(),
  profesional_ledger: z.record(z.string(), z.any()).optional(),
  info_fechas: z.record(z.string(), z.any()).optional(),
  horario: z.record(z.string(), z.any()).optional(),
  calendar_notes: z.record(z.string(), z.any()).optional(),
  info_modulo: z.record(z.string(), z.any()).optional(),
  plano_clase: z.any().optional(),
  crm_empresas: z.array(CrmEmpresaSchema).optional(),
  competencias_cpps: z.array(z.string()).optional(),
  __version__: z.number().optional(),
});
export type CursoData = z.infer<typeof CursoDataSchema>;

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

export interface Degree {
  id: number;
  name: string;
  level: string;
}

export interface Family {
  id: number;
  name: string;
  degrees: Degree[];
}

export interface AppState {
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  activeCursoId: string;
  setActiveCursoId: (id: string) => void;
  
  moduleData: ModuleData | null;
  setModuleData: (data: ModuleData | null) => void;
  updateDataFrame: (key: keyof ModuleData, data: any[]) => void;
  updateModuleData: (key: keyof ModuleData, data: any) => void;
  updateInfoModulo: (key: string, value: any) => void;
  
  cursoData: CursoData | null;
  setCursoData: (data: CursoData | null) => void;
  updateCursoData: (key: keyof CursoData, data: any) => void;
  
  saveModuleData: () => Promise<boolean | 'conflict'>;
  saveCursoData: () => Promise<boolean | 'conflict'>;
  
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isWizardOpen: boolean;
  setWizardOpen: (open: boolean) => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  
  groups: CourseGroup[];
  setGroups: (groups: CourseGroup[] | ((prev: CourseGroup[]) => CourseGroup[])) => void;
  
  dataSource: 'demo' | 'local';
  setDataSource: (source: 'demo' | 'local') => void;
  
  isDriveConnected: boolean;
  setDriveConnected: (connected: boolean) => void;
  driveUserEmail: string | null;
  setDriveUserEmail: (email: string | null) => void;
  autoSyncDrive: boolean;
  setAutoSyncDrive: (sync: boolean) => void;
  googleClientId: string;
  setGoogleClientId: (id: string) => void;
}
