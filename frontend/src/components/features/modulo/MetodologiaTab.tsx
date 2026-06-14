"use client";
import { Target } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function MetodologiaTab() {
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: string) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-t-4 border-t-green-500">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span> Metodología
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">D2. Actividades de enseñanza-aprendizaje</label>
            <p className="text-xs text-muted mb-2">Estrategias metodológicas a emplear en el aula y taller.</p>
            <textarea
              value={config_contexto["D2_actividades_ea"] || ""}
              onChange={e => handleChange("D2_actividades_ea", e.target.value)}
              placeholder="Relación de metodologías tipo como teoría, taller, prácticas simuladas, ABP..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">D3. Agrupamientos y Plan de Desdobles</label>
            <p className="text-xs text-muted mb-2">Criterios para la organización espacial y agrupamiento del alumnado.</p>
            <textarea
              value={config_contexto["D3_agrupamientos"] || ""}
              onChange={e => handleChange("D3_agrupamientos", e.target.value)}
              placeholder="Organización del grupo, desdobles por prevención de riesgos o ratios..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">F1. Atención a la diversidad</label>
            <p className="text-xs text-muted mb-2">Estrategias para adaptar la enseñanza a las características del alumnado.</p>
            <textarea
              value={config_contexto["F1_diversidad"] || ""}
              onChange={e => handleChange("F1_diversidad", e.target.value)}
              placeholder="Medidas de inclusión y atención a las diferencias individuales..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
