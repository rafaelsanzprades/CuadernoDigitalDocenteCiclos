"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function InstrumentosPage() {
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
            <div className="text-xl text-[#14a085] animate-pulse">Cargando instrumentos de evaluación...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_ce = moduleData?.df_ce || [];
  const df_act = moduleData?.df_act || [];
  
  const ce_clean = df_ce.filter((ce: any) => ce.id_ce && ce.id_ce.trim() !== "");
  const lista_ce_ids = ce_clean.map((ce: any) => ce.id_ce);

  const trimestres = [
    { key: "1T", nombre: "1er Trimestre" },
    { key: "2T", nombre: "2º Trimestre" },
    { key: "3T", nombre: "3er Trimestre" }
  ];

  const handleUpdateAct = (globalIdx: number, field: string, value: any) => {
    const newAct = [...df_act];
    newAct[globalIdx][field] = value;
    updateDataFrame("df_act", newAct);
  };

  const handleAddAct = (tri: string) => {
    const newAct = [...df_act];
    const newId = `ACT${(newAct.length + 1).toString().padStart(2, '0')}`;
    const newEntry: any = {
      id_act: newId,
      tri_act: tri,
      Tipo: "Teoria",
      desc_act: "",
      ce_vinc: "",
      peso_act: 0,
      crit_calif: "",
      is_active: true
    };
    lista_ce_ids.forEach((ce: string) => newEntry[ce] = false);
    newAct.push(newEntry);
    updateDataFrame("df_act", newAct);
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
                🛠️ Instrumentos de Evaluación
              </h1>
              <p className="text-gray-400 mt-2">Define las tareas, exámenes y vincula qué Criterios de Evaluación califican.</p>
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

          {lista_ce_ids.length === 0 ? (
            <div className="glass-card p-6 border-l-4 border-l-yellow-500">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Faltan Criterios de Evaluación</h3>
              <p className="text-gray-300">Primero añade Criterios de evaluación en la pestaña 'Matrices'.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {trimestres.map((tri) => {
                const actTri = df_act.filter((act: any) => String(act.tri_act).toUpperCase() === tri.key);
                const sumaPeso = actTri.reduce((sum: number, act: any) => sum + (Number(act.peso_act) || 0), 0);

                return (
                  <details key={tri.key} className="group bg-white/5 rounded-lg border border-white/10 overflow-hidden open:bg-white/10 transition-colors">
                    <summary className="p-4 cursor-pointer flex items-center justify-between font-semibold text-lg select-none hover:bg-white/5">
                      <div className="flex items-center gap-4">
                        <span className="text-indigo-400">📋</span>
                        <span>{tri.nombre}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-400">{actTri.length} actividades</span>
                        <span className="text-indigo-300 font-mono bg-indigo-500/10 px-2 py-1 rounded">Σ {sumaPeso.toFixed(0)}%</span>
                        <span className="ml-4 group-open:rotate-180 inline-block transition-transform text-gray-500">▼</span>
                      </div>
                    </summary>
                    
                    <div className="p-4 border-t border-white/10 bg-black/20 overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="text-gray-400 border-b border-white/10 bg-[#0b1120]">
                            <th className="p-2 sticky left-0 z-10 border-r border-white/10 bg-[#0b1120]">ID</th>
                            <th className="p-2 sticky left-[60px] z-10 border-r border-white/10 bg-[#0b1120]">Tipo</th>
                            <th className="p-2 sticky left-[160px] z-10 border-r border-white/10 bg-[#0b1120] w-64">Instrumento / Actividad</th>
                            <th className="p-2 sticky left-[416px] z-10 border-r border-white/10 bg-[#0b1120]">% Pond.</th>
                            <th className="p-2 sticky left-[486px] z-10 border-r border-white/10 bg-[#0b1120]">✓</th>
                            {lista_ce_ids.map((ce: string) => (
                              <th key={ce} className="p-2 text-center text-xs font-mono border-r border-white/10 text-indigo-300">
                                {ce}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {actTri.map((act: any) => {
                            const globalIdx = df_act.findIndex((gAct: any) => gAct === act);
                            return (
                              <tr key={globalIdx} className="border-b border-white/5 hover:bg-white/5">
                                <td className="p-2 font-mono sticky left-0 z-10 border-r border-white/10 bg-[#0b1120] group-hover:bg-[#111827]">{act.id_act}</td>
                                <td className="p-2 sticky left-[60px] z-10 border-r border-white/10 bg-[#0b1120] group-hover:bg-[#111827]">
                                  <select 
                                    value={act.Tipo || "Teoria"}
                                    onChange={(e) => handleUpdateAct(globalIdx, "Tipo", e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-indigo-500 focus:outline-none appearance-none"
                                  >
                                    <option value="Teoria">Teoria</option>
                                    <option value="Practica">Practica</option>
                                    <option value="Informes">Informes</option>
                                    <option value="Tareas">Tareas</option>
                                  </select>
                                </td>
                                <td className="p-2 sticky left-[160px] z-10 border-r border-white/10 bg-[#0b1120] group-hover:bg-[#111827]">
                                  <input 
                                    type="text"
                                    value={act.desc_act || ""}
                                    onChange={(e) => handleUpdateAct(globalIdx, "desc_act", e.target.value)}
                                    className="w-full min-w-[200px] bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-indigo-500 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2 sticky left-[416px] z-10 border-r border-white/10 bg-[#0b1120] group-hover:bg-[#111827]">
                                  <input 
                                    type="number"
                                    value={act.peso_act || 0}
                                    onChange={(e) => handleUpdateAct(globalIdx, "peso_act", Number(e.target.value) || 0)}
                                    className="w-16 bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-indigo-500 focus:outline-none"
                                  />
                                </td>
                                <td className="p-2 text-center sticky left-[486px] z-10 border-r border-white/10 bg-[#0b1120] group-hover:bg-[#111827]">
                                  <input 
                                    type="checkbox"
                                    checked={act.is_active !== false}
                                    onChange={(e) => handleUpdateAct(globalIdx, "is_active", e.target.checked)}
                                    className="accent-indigo-500"
                                  />
                                </td>
                                {lista_ce_ids.map((ce: string) => (
                                  <td key={ce} className="p-2 text-center border-r border-white/10 bg-black/10">
                                    <input 
                                      type="checkbox"
                                      checked={act[ce] === true}
                                      onChange={(e) => handleUpdateAct(globalIdx, ce, e.target.checked)}
                                      className="accent-indigo-500"
                                    />
                                  </td>
                                ))}
                                <td className="p-2 text-center">
                                  <button
                                    onClick={() => {
                                      const newAct = [...df_act];
                                      newAct.splice(globalIdx, 1);
                                      updateDataFrame("df_act", newAct);
                                    }}
                                    className="text-red-400 hover:text-red-300 font-bold px-2"
                                    title="Eliminar Actividad"
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
                          onClick={() => handleAddAct(tri.key)}
                          className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                        >
                          <span>+</span> Añadir Instrumento/Actividad en {tri.nombre}
                        </button>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
