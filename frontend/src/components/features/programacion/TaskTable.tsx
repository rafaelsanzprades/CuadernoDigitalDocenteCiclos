import { Plus, X } from "lucide-react";
import React from "react";

export function TaskTable({ df_tareas, handleUpdateTarea, handleAddTarea, handleDeleteTarea }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
        <thead>
          <tr className="border-b border-[var(--glass-border)] text-muted">
            <th className="pb-2 w-16">Id</th>
            <th className="pb-2 w-48">Título de la Tarea</th>
            <th className="pb-2 min-w-[200px]">Contexto Productivo y Reto</th>
            <th className="pb-2 w-48">RA y CE Relacionados</th>
            <th className="pb-2 w-48">Inst. Calificación</th>
            <th className="pb-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {df_tareas.map((tc: any) => {
            const globalIdx = df_tareas.findIndex((gTc: any) => gTc === tc);
            return (
              <tr key={globalIdx} className="border-b border-white/5 hover:bg-foreground/5">
                <td className="py-2 pr-2 font-mono">{tc.ID || tc.id_act}</td>
                <td className="py-2 pr-2">
                  <input 
                    type="text"
                    value={tc.Nombre_Tarea || ""}
                    onChange={(e) => handleUpdateTarea(globalIdx, "Nombre_Tarea", e.target.value)}
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-info focus:outline-none"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input 
                    type="text"
                    value={tc.Reto || ""}
                    onChange={(e) => handleUpdateTarea(globalIdx, "Reto", e.target.value)}
                    className="w-full min-w-[200px] bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-info focus:outline-none"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input 
                    type="text"
                    value={tc.RA_Asociados || ""}
                    onChange={(e) => handleUpdateTarea(globalIdx, "RA_Asociados", e.target.value)}
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-info focus:outline-none"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input 
                    type="text"
                    value={tc.Instrumento || tc.desc_act || ""}
                    onChange={(e) => handleUpdateTarea(globalIdx, "Instrumento", e.target.value)}
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-info focus:outline-none"
                  />
                </td>
                <td className="py-2 text-center">
                  <button
                    onClick={() => handleDeleteTarea(globalIdx)}
                    className="text-danger hover:text-danger font-bold"
                    title="Eliminar Tarea"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4">
        <button 
          onClick={handleAddTarea}
          className="text-sm text-info hover:text-info font-semibold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Añadir Nueva Tarea Competencial
        </button>
      </div>
    </div>
  );
}
