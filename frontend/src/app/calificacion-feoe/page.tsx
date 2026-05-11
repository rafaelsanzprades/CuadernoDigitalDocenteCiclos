// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function CalificacionFEOEPage() {
  const { activeModuleId, moduleData, activeCursoId, cursoData, updateCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if ((activeModuleId && !moduleData) || (activeCursoId && !cursoData)) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData, activeCursoId, cursoData]);

  const handleSave = async () => {
    if (!activeCursoId || !cursoData) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch(`/api/module/${activeCursoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cursoData),
      });
      const result = await res.json();
      if (result.status === "success") {
        setSaveMessage("Guardado correctamente");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Error al guardar");
      }
    } catch (err) {
      console.error(err);
      setSaveMessage("Error al guardar");
    }
    setSaving(false);
  };

  if (!activeModuleId || !activeCursoId) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 content-area">
            <div className="glass-card p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No hay Curso o Módulo seleccionado</h2>
              <p className="text-gray-400">Por favor, ve a la Gestión de Archivos y asegúrate de cargar ambos.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !cursoData || !moduleData) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 flex items-center justify-center content-area">
            <div className="text-xl text-blue-400 animate-pulse">Cargando datos de FEOE...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_al = cursoData?.df_al || [];
  const df_ra = moduleData?.df_ra || [];
  const df_feoe = cursoData?.df_feoe || [];

  const ras_dualizados = df_ra.filter((ra: any) => ra.is_dual === true || ra.is_dual === "true").map((ra: any) => ra.id_ra);
  const df_evaluable = df_al.filter((al: any) => al.Estado !== "Baja");
  df_evaluable.sort((a: any, b: any) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  const handleUpdateFEOE = (al_id: string, ra_id: string, val: number) => {
    const newFEOE = [...df_feoe];
    let rowIdx = newFEOE.findIndex((f: any) => f.ID === al_id);
    if (rowIdx === -1) {
      newFEOE.push({ ID: al_id });
      rowIdx = newFEOE.length - 1;
    }
    newFEOE[rowIdx][ra_id] = val;
    updateCursoData("df_feoe", newFEOE);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 content-area space-y-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                🏢 Evaluación en Empresa (FEOE)
              </h1>
              <p className="text-gray-400 mt-2">Introduce la calificación del tutor de empresa (1-4) para cada RA Dualizado.</p>
            </div>
            <div className="flex items-center gap-4">
              {saveMessage && (
                <span className={`text-sm ${saveMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {saveMessage}
                </span>
              )}
              <button 
                onClick={handleSave}
                disabled={saving}
                className="glass-button text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                {saving ? "Guardando..." : "💾 Guardar Cambios"}
              </button>
            </div>
          </div>

          {ras_dualizados.length === 0 ? (
            <div className="glass-card p-6 border-l-4 border-l-yellow-500">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">No hay RAs Dualizados</h3>
              <p className="text-gray-300">Ve a la pestaña Módulo Didáctico y marca al menos un RA como 'Dualizado' (FEOE).</p>
            </div>
          ) : df_evaluable.length === 0 ? (
            <div className="glass-card p-6 border-l-4 border-l-yellow-500">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">No hay alumnado</h3>
              <p className="text-gray-300">Asegúrate de añadir alumnos en la Gestión de Matrícula.</p>
            </div>
          ) : (
            <section className="glass-card p-6 border-t-4 border-t-purple-500">
              <div className="mb-6 flex gap-6">
                <div className="text-sm text-gray-300 bg-black/20 p-4 rounded-lg flex-1 border border-white/5">
                  <h4 className="font-bold text-purple-400 mb-2">Leyenda de Calificaciones</h4>
                  <ul className="space-y-1">
                    <li><span className="font-mono text-gray-500 w-6 inline-block">0</span> Sin evaluar</li>
                    <li><span className="font-mono text-red-400 w-6 inline-block">1</span> No Superado</li>
                    <li><span className="font-mono text-yellow-500 w-6 inline-block">2</span> Superado (Suficiente)</li>
                    <li><span className="font-mono text-blue-400 w-6 inline-block">3</span> Bien / Notable</li>
                    <li><span className="font-mono text-green-400 w-6 inline-block">4</span> Excelente</li>
                  </ul>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 bg-[#0b1120]">
                      <th className="p-3 sticky left-0 z-10 border-r border-white/10 bg-[#0b1120] w-16">ID</th>
                      <th className="p-3 sticky left-[64px] z-10 border-r border-white/10 bg-[#0b1120] min-w-[250px]">Alumno</th>
                      {ras_dualizados.map((ra: string) => (
                        <th key={ra} className="p-3 text-center border-r border-white/10 w-24">
                          <div className="font-bold text-purple-400">{ra}</div>
                          <div className="text-xs text-gray-500">(1-4)</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {df_evaluable.map((al: any) => {
                      const al_id = al.ID;
                      const fRow = df_feoe.find((f: any) => f.ID === al_id) || {};

                      return (
                        <tr key={al_id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-3 font-mono text-xs sticky left-0 z-10 border-r border-white/10 bg-[#0b1120] group-hover:bg-[#111827]">
                            {al_id}
                          </td>
                          <td className="p-3 font-semibold sticky left-[64px] z-10 border-r border-white/10 bg-[#0b1120] group-hover:bg-[#111827]">
                            {al.Apellidos}, {al.Nombre}
                          </td>
                          {ras_dualizados.map((ra: string) => {
                            const val = Number(fRow[ra]) || 0;
                            return (
                              <td key={ra} className="p-3 border-r border-white/10 text-center">
                                <input 
                                  type="number"
                                  min="0" max="4" step="1"
                                  value={val}
                                  onChange={(e) => handleUpdateFEOE(al_id, ra, Number(e.target.value) || 0)}
                                  className="w-16 bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-purple-500 focus:outline-none text-center font-bold"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
