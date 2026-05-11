// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function ProgramacionPage() {
  const { activeModuleId, moduleData, setModuleData, updateDataFrame } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };

    if (activeModuleId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData]);

  const handleSave = async () => {
    if (!activeModuleId || !moduleData) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch(`/api/module/${activeModuleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleData),
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

  if (!activeModuleId) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 content-area">
            <div className="glass-card p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No hay módulo seleccionado</h2>
              <p className="text-gray-400">Por favor, ve a la Gestión de Archivos y selecciona un módulo PD.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !moduleData) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 flex items-center justify-center content-area">
            <div className="text-xl text-[#14a085] animate-pulse">Cargando programación de aula...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_ud = moduleData?.df_ud || [];
  const df_sesiones = moduleData?.df_sesiones || [];
  const df_tareas = moduleData?.df_tareas || [];

  const handleAddSesion = (ud_id: string) => {
    const newSesiones = [...df_sesiones];
    const newId = `SES${(newSesiones.length + 1).toString().padStart(3, '0')}`;
    const udSesiones = newSesiones.filter(s => s.id_ud === ud_id);
    const numOrden = udSesiones.length > 0 ? Math.max(...udSesiones.map(s => Number(s.Num_Orden) || 0)) + 1 : 1;
    
    newSesiones.push({
      ID: newId,
      id_ud: ud_id,
      Num_Orden: numOrden,
      Horas: 1,
      Tipo_Actividad: "Tª (Teoria)",
      RA_CE: "",
      Contenidos: "",
      Aspectos_Clave: "",
      Recursos: ""
    });
    updateDataFrame("df_sesiones", newSesiones);
  };

  const handleUpdateSesion = (globalIdx: number, field: string, value: any) => {
    const newSesiones = [...df_sesiones];
    newSesiones[globalIdx][field] = value;
    updateDataFrame("df_sesiones", newSesiones);
  };

  const handleAddTarea = () => {
    const newTareas = [...df_tareas];
    const newId = `TC${(newTareas.length + 1).toString().padStart(2, '0')}`;
    newTareas.push({
      ID: newId,
      Nombre_Tarea: "",
      Reto: "",
      RA_Asociados: "",
      Instrumento: ""
    });
    updateDataFrame("df_tareas", newTareas);
  };

  const handleUpdateTarea = (globalIdx: number, field: string, value: any) => {
    const newTareas = [...df_tareas];
    newTareas[globalIdx][field] = value;
    updateDataFrame("df_tareas", newTareas);
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
                📚 Programación de Aula
              </h1>
              <p className="text-gray-400 mt-2">Diseña y estructura las sesiones y tareas competenciales.</p>
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

          <section className="glass-card p-6 border-t-4 border-t-[#14a085]">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>📋</span> Secuenciación por Unidades Didácticas
            </h2>

            <div className="space-y-4">
              {df_ud.map((ud: any) => {
                const udSesiones = df_sesiones.filter((s: any) => s.id_ud === ud.id_ud);
                udSesiones.sort((a: any, b: any) => (Number(a.Num_Orden) || 0) - (Number(b.Num_Orden) || 0));
                const totalHoras = udSesiones.reduce((sum: number, s: any) => sum + (Number(s.Horas) || 0), 0);

                return (
                  <details key={ud.id_ud} className="group bg-white/5 rounded-lg border border-white/10 overflow-hidden open:bg-white/10 transition-colors">
                    <summary className="p-4 cursor-pointer flex items-center justify-between font-semibold text-lg select-none hover:bg-white/5">
                      <div className="flex items-center gap-4">
                        <span className="text-[#14a085]">{ud.id_ud}</span>
                        <span className="text-sm text-gray-400 truncate max-w-xl">{ud.desc_ud}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-400">{udSesiones.length} sesiones</span>
                        <span className="text-[#14a085] bg-[#14a085]/10 px-2 py-1 rounded">{totalHoras} h</span>
                        <span className="ml-4 group-open:rotate-180 inline-block transition-transform text-gray-500">▼</span>
                      </div>
                    </summary>
                    <div className="p-4 border-t border-white/10 bg-black/20 overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                          <tr className="text-gray-400 border-b border-white/10">
                            <th className="pb-2 w-16">Nº</th>
                            <th className="pb-2 w-16">Horas</th>
                            <th className="pb-2 w-48">Tipo</th>
                            <th className="pb-2 w-32">RA/CE</th>
                            <th className="pb-2 min-w-[200px]">Contenidos</th>
                            <th className="pb-2 w-48">Aspectos Clave</th>
                            <th className="pb-2 w-48">Recursos</th>
                            <th className="pb-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {udSesiones.map((ses: any) => {
                            const globalIdx = df_sesiones.findIndex((gSes: any) => gSes === ses);
                            return (
                              <tr key={globalIdx} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-2 pr-2">
                                  <input 
                                    type="number" 
                                    value={ses.Num_Orden || 0}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "Num_Orden", Number(e.target.value) || 0)}
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-[#14a085] focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="number" 
                                    value={ses.Horas || 0}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "Horas", Number(e.target.value) || 0)}
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-[#14a085] focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <select 
                                    value={ses.Tipo_Actividad || "Tª (Teoria)"}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "Tipo_Actividad", e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-[#14a085] focus:outline-none appearance-none"
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
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-[#14a085] focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="text" 
                                    value={ses.Contenidos || ""}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "Contenidos", e.target.value)}
                                    className="w-full min-w-[200px] bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-[#14a085] focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="text" 
                                    value={ses.Aspectos_Clave || ""}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "Aspectos_Clave", e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-[#14a085] focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="text" 
                                    value={ses.Recursos || ""}
                                    onChange={(e) => handleUpdateSesion(globalIdx, "Recursos", e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-[#14a085] focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 text-center">
                                  <button
                                    onClick={() => {
                                      const newSesiones = [...df_sesiones];
                                      newSesiones.splice(globalIdx, 1);
                                      updateDataFrame("df_sesiones", newSesiones);
                                    }}
                                    className="text-red-400 hover:text-red-300 font-bold"
                                    title="Eliminar Sesión"
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="mt-4">
                        <button 
                          onClick={() => handleAddSesion(ud.id_ud)}
                          className="text-sm text-[#14a085] hover:text-[#1abc9c] font-semibold flex items-center gap-1"
                        >
                          <span>+</span> Añadir Sesión a {ud.id_ud}
                        </button>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>

          <section className="glass-card p-6 border-t-4 border-t-blue-500">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>🎯</span> Diseño de Tareas Competenciales (TC)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="pb-2 w-16">ID</th>
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
                      <tr key={globalIdx} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 pr-2 font-mono">{tc.ID || tc.id_act}</td>
                        <td className="py-2 pr-2">
                          <input 
                            type="text"
                            value={tc.Nombre_Tarea || ""}
                            onChange={(e) => handleUpdateTarea(globalIdx, "Nombre_Tarea", e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input 
                            type="text"
                            value={tc.Reto || ""}
                            onChange={(e) => handleUpdateTarea(globalIdx, "Reto", e.target.value)}
                            className="w-full min-w-[200px] bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input 
                            type="text"
                            value={tc.RA_Asociados || ""}
                            onChange={(e) => handleUpdateTarea(globalIdx, "RA_Asociados", e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input 
                            type="text"
                            value={tc.Instrumento || tc.desc_act || ""}
                            onChange={(e) => handleUpdateTarea(globalIdx, "Instrumento", e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 text-center">
                          <button
                            onClick={() => {
                              const newTareas = [...df_tareas];
                              newTareas.splice(globalIdx, 1);
                              updateDataFrame("df_tareas", newTareas);
                            }}
                            className="text-red-400 hover:text-red-300 font-bold"
                            title="Eliminar Tarea"
                          >
                            ×
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
                  className="text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <span>+</span> Añadir Nueva Tarea Competencial
                </button>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
