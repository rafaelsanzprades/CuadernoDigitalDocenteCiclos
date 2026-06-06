"use client";
import { School, Settings, User } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function ContextoTab() {
  const { moduleData, updateModuleData } = useAppStore();

  const config_contexto = moduleData?.config_contexto || {};
  const config_aula = moduleData?.config_aula || {};

  const handleContextoChange = (field: string, value: string) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const handleAulaChange = (field: string, value: string) => {
    updateModuleData("config_aula", { ...config_aula, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-t-4 border-t-indigo-500">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><School className="w-[1.2em] h-[1.2em] mr-1" /></span> Contexto escolar
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted mb-1 block">Instalaciones</label>
            <textarea
              value={config_contexto.instalaciones || ""}
              onChange={e => handleContextoChange("instalaciones", e.target.value)}
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Horario lectivo</label>
            <textarea
              value={config_contexto.horario_lectivo || ""}
              onChange={e => handleContextoChange("horario_lectivo", e.target.value)}
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Equipo docente</label>
            <textarea
              value={config_contexto.equipo_docente || ""}
              onChange={e => handleContextoChange("equipo_docente", e.target.value)}
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Entorno socioeconómico</label>
            <textarea
              value={config_contexto.entorno_socioeconomico || ""}
              onChange={e => handleContextoChange("entorno_socioeconomico", e.target.value)}
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-t-4 border-t-purple-500">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><User className="w-[1.2em] h-[1.2em] mr-1" /></span> Alumnado (ACNEAE)
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted mb-1 block">Inclusión</label>
            <textarea
              value={config_contexto.inclusion || ""}
              onChange={e => handleContextoChange("inclusion", e.target.value)}
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Elenco de situaciones</label>
            <textarea
              value={config_contexto.elenco_situaciones || ""}
              onChange={e => handleContextoChange("elenco_situaciones", e.target.value)}
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Circunstancias ocultas</label>
            <textarea
              value={config_contexto.circunstancias_ocultas || ""}
              onChange={e => handleContextoChange("circunstancias_ocultas", e.target.value)}
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border-t-4 border-t-pink-500">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><Settings className="w-[1.2em] h-[1.2em] mr-1" /></span> Configuración del aula
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted mb-1 block">Estrategias metodológicas. Espacios</label>
            <textarea
              value={config_contexto.metodologia || ""}
              onChange={e => handleContextoChange("metodologia", e.target.value)}
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-danger focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Metodología general (ej. ABR / ABP)</label>
            <textarea
              value={config_aula.Metodología || ""}
              onChange={e => handleAulaChange("Metodología", e.target.value)}
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-danger focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Atención a la diversidad (A. no significativas)</label>
            <textarea
              value={config_aula["Atención a la diversidad"] || ""}
              onChange={e => handleAulaChange("Atención a la diversidad", e.target.value)}
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-danger focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
