"use client";
import { CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function EvaluacionRecursosTab() {
  const { moduleData, updateModuleData } = useAppStore();
  const config_contexto = moduleData?.config_contexto || {};

  const handleChange = (field: string, value: string) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-t-4 border-t-amber-500">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-4">
          <span className="inline-flex"><CheckCircle2 className="w-[1.2em] h-[1.2em] mr-1" /></span> Eval. y Recursos
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">E5. Actividades de Recuperación y Refuerzo</label>
            <p className="text-xs text-muted mb-2">Criterios y procedimientos para el alumnado que no supera la evaluación.</p>
            <textarea
              value={config_contexto["E5_recuperacion"] || ""}
              onChange={e => handleChange("E5_recuperacion", e.target.value)}
              placeholder="Sistema de recuperación para evaluaciones y convocatorias extraordinarias..."
              className="w-full h-32 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">G1. Infraestructuras y Equipamientos</label>
            <textarea
              value={config_contexto["G1_infraestructuras"] || ""}
              onChange={e => handleChange("G1_infraestructuras", e.target.value)}
              placeholder="Taller, aula, laboratorio, equipamiento específico del ciclo..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">G2. Herramientas TIC y plataformas</label>
            <textarea
              value={config_contexto["G2_herramientas_tic"] || ""}
              onChange={e => handleChange("G2_herramientas_tic", e.target.value)}
              placeholder="Moodle, Classroom, software simulador, aplicaciones específicas..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1 block">G3. Bibliografía y recursos para el alumnado</label>
            <textarea
              value={config_contexto["G3_bibliografia"] || ""}
              onChange={e => handleChange("G3_bibliografia", e.target.value)}
              placeholder="Libros de texto, manuales de fabricantes, recursos online..."
              className="w-full h-24 bg-foreground/15 border border-[var(--glass-border)] rounded-lg p-3 text-foreground focus:border-info focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
