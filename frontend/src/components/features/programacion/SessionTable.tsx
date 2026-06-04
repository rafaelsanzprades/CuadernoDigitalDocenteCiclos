import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { UnidadDidactica, Sesion } from "@/types";

interface SessionTableProps {
  df_ud: UnidadDidactica[];
  df_sesiones: Sesion[];
  onDragEnd: (result: any) => void;
  handleUpdateSesion: (globalIdx: number, field: string, value: any) => void;
  handleAddSesion: (ud_id: string) => void;
  handleDeleteSesion: (globalIdx: number) => void;
  allUdsOpen: boolean;
}

export function SessionTable({
  df_ud,
  df_sesiones,
  onDragEnd,
  handleUpdateSesion,
  handleAddSesion,
  handleDeleteSesion,
  allUdsOpen
}: SessionTableProps) {

  // Workaround for hydration mismatches with DragDropContext
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={onDragEnd}>
      {df_ud.map((ud: UnidadDidactica) => {
        const udSesiones = df_sesiones.filter((s: Sesion) => s.id_ud === ud.id_ud);
        udSesiones.sort((a: Sesion, b: Sesion) => (Number(a.Num_Orden) || 0) - (Number(b.Num_Orden) || 0));
        const totalHoras = udSesiones.reduce((sum: number, s: Sesion) => sum + (Number(s.Horas) || 0), 0);

        return (
          <details 
            key={ud.id_ud} 
            open={allUdsOpen} 
            className="ud-details group bg-foreground/5 rounded-lg border border-[var(--glass-border)] overflow-hidden open:bg-foreground/10 transition-colors"
          >
            <summary className="p-4 cursor-pointer flex items-center justify-between font-semibold text-lg select-none hover:bg-foreground/5">
              <div className="flex items-center gap-4">
                <span className="text-accent">{ud.id_ud}</span>
                <span className="text-sm text-muted truncate max-w-xl">{ud.desc_ud}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-muted">{udSesiones.length} sesiones</span>
                <span className="text-accent bg-accent/10 px-2 py-1 rounded">{totalHoras} h</span>
                <span className="ml-4 group-open:rotate-180 inline-block transition-transform text-muted">▼</span>
              </div>
            </summary>
            <div className="p-4 border-t border-[var(--glass-border)] bg-foreground/10 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-muted border-b border-[var(--glass-border)]">
                    <th className="pb-2 w-10"></th>
                    <th className="pb-2 w-16">Nº</th>
                    <th className="pb-2 w-16">Horas</th>
                    <th className="pb-2 w-48">Tipo</th>
                    <th className="pb-2 w-32">Ra/CE</th>
                    <th className="pb-2 min-w-[200px]">Contenidos</th>
                    <th className="pb-2 w-48">Aspectos Clave</th>
                    <th className="pb-2 w-48">Recursos</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <Droppable droppableId={ud.id_ud}>
                  {(provided) => (
                    <tbody ref={provided.innerRef} {...provided.droppableProps}>
                      {udSesiones.map((ses: Sesion, idx: number) => {
                        const globalIdx = df_sesiones.findIndex((gSes: Sesion) => gSes === ses);
                        const dragId = ses.ID || `ses-${globalIdx}`;
                        return (
                          <Draggable key={dragId} draggableId={dragId} index={idx}>
                            {(provided, snapshot) => (
                              <tr 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`border-b border-white/5 hover:bg-foreground/5 ${snapshot.isDragging ? 'bg-background shadow-2xl z-50' : ''}`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <td className="py-2 pr-2" {...provided.dragHandleProps}>
                                  <div className="p-1 hover:bg-gray-500/20 rounded cursor-grab active:cursor-grabbing inline-flex items-center justify-center">
                                    <GripVertical className="text-muted w-4 h-4" />
                                  </div>
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="number" 
                                    value={ses.Num_Orden || 0}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "Num_Orden", Number(e.target.value) || 0)}
                                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-accent focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="number" 
                                    value={ses.Horas || 0}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "Horas", Number(e.target.value) || 0)}
                                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-accent focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <select 
                                    value={ses.Tipo_Actividad || "Tª (Teoria)"}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "Tipo_Actividad", e.target.value)}
                                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-accent focus:outline-none appearance-none"
                                  >
                                    <option value="Tª (Teoria)">Tª (Teoria)</option>
                                    <option value="Pª (Practica)">Pª (Practica)</option>
                                    <option value="IE (Instrumento de Evaluacion)">IE (Inst. Eval.)</option>
                                    <option value="Pª+ (Ampliacion/Refuerzo)">Pª+ (Amp/Ref)</option>
                                  </select>
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="text" 
                                    value={ses.RA_CE || ""}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "RA_CE", e.target.value)}
                                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-accent focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="text" 
                                    value={ses.Contenidos || ""}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "Contenidos", e.target.value)}
                                    className="w-full min-w-[200px] bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-accent focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="text" 
                                    value={ses.Aspectos_Clave || ""}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "Aspectos_Clave", e.target.value)}
                                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-accent focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="text" 
                                    value={ses.Recursos || ""}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "Recursos", e.target.value)}
                                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-accent focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 text-center">
                                  <button
                                    onClick={() => handleDeleteSesion(globalIdx)}
                                    className="text-red-400 hover:text-red-300 font-bold"
                                    title="Eliminar Sesión"
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              </table>
              <div className="mt-4">
                <button 
                  onClick={() => handleAddSesion(ud.id_ud)}
                  className="text-sm text-accent hover:text-accent/80 font-semibold flex items-center gap-1"
                >
                  <span>+</span> Añadir Sesión a {ud.id_ud}
                </button>
              </div>
            </div>
          </details>
        );
      })}
      </DragDropContext>
    </div>
  );
}
