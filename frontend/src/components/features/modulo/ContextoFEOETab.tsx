"use client";
import { Map } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function ContextoFEOETab() {
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: string) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-t-4 border-t-blue-500">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Map className="w-[1.2em] h-[1.2em] mr-1" /></span> Contexto y FEOE
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">A1. Justificación de la programación</label>
            <p className="text-xs text-muted mb-2">Base legislativa que fundamenta esta programación.</p>
            <textarea
              value={config_contexto["A1_justificacion"] || ""}
              onChange={e => handleChange("A1_justificacion", e.target.value)}
              placeholder="Indicar base normativa, Leyes de Educación y Reales Decretos aplicables al título..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">A2. Contextualización</label>
            <p className="text-xs text-muted mb-2">Análisis del contexto donde se imparte la formación.</p>
            <textarea
              value={config_contexto["A2_contextualizacion"] || ""}
              onChange={e => handleChange("A2_contextualizacion", e.target.value)}
              placeholder="Perfil profesional del título, entorno socioeconómico y características generales del centro..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">B3. Vinculación con la Empresa Colaboradora</label>
            <p className="text-xs text-muted mb-2">Relación entre el módulo y la formación en la empresa.</p>
            <textarea
              value={config_contexto["B3_vinculacion_empresa"] || ""}
              onChange={e => handleChange("B3_vinculacion_empresa", e.target.value)}
              placeholder="Orientaciones sobre las actividades a realizar en la empresa (FEOE)..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
