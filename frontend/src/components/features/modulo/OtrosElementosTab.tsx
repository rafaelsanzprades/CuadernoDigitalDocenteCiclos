"use client";
import { Layers } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function OtrosElementosTab() {
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: string) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-t-4 border-t-cyan-500">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Layers className="w-[1.2em] h-[1.2em] mr-1" /></span> Otros Elementos
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">H1. Propuestas del departamento</label>
            <p className="text-xs text-muted mb-2">Visitas técnicas, charlas de empresas, ferias del sector.</p>
            <textarea
              value={config_contexto["H1_complementarias"] || ""}
              onChange={e => handleChange("H1_complementarias", e.target.value)}
              placeholder="Actividades extraescolares y complementarias propuestas..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">I1. Elementos transversales</label>
            <textarea
              value={config_contexto["I1_transversales"] || ""}
              onChange={e => handleChange("I1_transversales", e.target.value)}
              placeholder="Prevención de riesgos laborales, igualdad, sostenibilidad medioambiental..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">J3. Plan de Contingencia</label>
            <p className="text-xs text-muted mb-2">Medidas organizativas para garantizar la continuidad formativa.</p>
            <textarea
              value={config_contexto["J3_contingencia"] || ""}
              onChange={e => handleChange("J3_contingencia", e.target.value)}
              placeholder="Procedimiento ante ausencias o clases a distancia..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
