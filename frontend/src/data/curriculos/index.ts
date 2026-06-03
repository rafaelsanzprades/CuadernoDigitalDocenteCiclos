export interface CurriculumTitulo {
  codigo: string;
  familia: string;
  denominacion: string;
  nivel: string;
  duracion: number;
  referente_europeo: string;

  identificacion: {
    familia_profesional: string;
    denominacion: string;
    nivel: string;
    duracion: string;
    referente_europeo: string;
    clasificacion_internacional: string;
    norma: string;
    boe: string;
    currículo_autonómico: string;
    boa: string;
  };

  perfil_profesional: string;
  competencia_general: string;
  competencias_cpps: CompetenciaCPP[];
  cualificaciones: Cualificacion[];
  entorno_profesional: {
    sectores: string[];
    ocupaciones: string[];
  };
  prospectiva: string[];
  objetivos_generales: { id: string; descripcion: string }[];
  modulos: CurriculumModulo[];
}

export interface CompetenciaCPP {
  id: string;
  descripcion: string;
}

export interface Cualificacion {
  codigo: string;
  nombre: string;
  real_decreto: string;
  unidades_competencia: { codigo: string; descripcion: string }[];
}

export interface CurriculumModulo {
  codigo: string;
  nombre: string;
  horas: number;
  curso: string;
  unidades_formativas?: { codigo: string; nombre: string; horas: number }[];
  resultados_aprendizaje: CurriculumRA[];
}

export interface CurriculumRA {
  id: string;
  descripcion: string;
  criterios_evaluacion: CurriculumCE[];
}

export interface CurriculumCE {
  id: string;
  descripcion: string;
}

import { ELE203 } from "./ele203";

export const curriculos: Record<string, CurriculumTitulo> = {
  "ELE203": ELE203,
};

export function getTitulo(codigo: string): CurriculumTitulo | undefined {
  return curriculos[codigo];
}

export function getTitulosPorFamilia(familia: string): CurriculumTitulo[] {
  return Object.values(curriculos).filter((t) => t.familia === familia);
}

export function getModulo(tituloCodigo: string, moduloCodigo: string): CurriculumModulo | undefined {
  const titulo = curriculos[tituloCodigo];
  if (!titulo) return undefined;
  return titulo.modulos.find((m) => m.codigo === moduloCodigo);
}
