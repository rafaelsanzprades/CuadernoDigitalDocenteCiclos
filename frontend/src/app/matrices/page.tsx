// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function MatricesPage() {
  const { activeModuleId, moduleData, setModuleData, updateDataFrame } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (activeModuleId && !moduleData) {
      fetch(`/api/module/${activeModuleId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setModuleData(data.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching module:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData, setModuleData]);

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

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 flex items-center justify-center content-area">
            <div className="text-xl text-[#14a085] animate-pulse">Cargando matrices...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_ra = moduleData?.df_ra || [];
  const df_ud = moduleData?.df_ud || [];
  const df_ce = moduleData?.df_ce || [];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 content-area space-y-8">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              🧮 Matrices RA → CE → UD
            </h1>
          </div>


          {/* Resultados de Aprendizaje */}
          <section className="glass-card p-6 border-t-4 border-t-[#14a085]">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🎓</span> RA. Resultados de Aprendizaje
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-sm text-gray-400">
                    <th className="p-3">ID-RA</th>
                    <th className="p-3 w-24">% RA</th>
                    <th className="p-3 w-20 text-center">FEOE</th>
                    <th className="p-3">Resultados de aprendizaje</th>
                  </tr>
                </thead>
                <tbody>
                  {df_ra.map((ra: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-sm">{ra.id_ra}</td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          value={ra.peso_ra || 0}
                          onChange={(e) => {
                            const newRa = [...df_ra];
                            newRa[idx].peso_ra = parseFloat(e.target.value) || 0;
                            updateDataFrame("df_ra", newRa);
                          }}
                          className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-[#14a085] focus:outline-none" 
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={ra.is_dual || false}
                          onChange={(e) => {
                            const newRa = [...df_ra];
                            newRa[idx].is_dual = e.target.checked;
                            updateDataFrame("df_ra", newRa);
                          }}
                          className="accent-[#14a085]" 
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          value={ra.desc_ra || ""}
                          onChange={(e) => {
                            const newRa = [...df_ra];
                            newRa[idx].desc_ra = e.target.value;
                            updateDataFrame("df_ra", newRa);
                          }}
                          className="w-full bg-black/30 border border-white/10 rounded px-3 py-1 text-white text-sm focus:border-[#14a085] focus:outline-none" 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <button 
                onClick={() => {
                  const newRa = [...df_ra];
                  const newId = `RA${(newRa.length + 1).toString().padStart(2, '0')}`;
                  newRa.push({ id_ra: newId, peso_ra: 0, is_dual: false, desc_ra: "" });
                  updateDataFrame("df_ra", newRa);
                }}
                className="text-[#14a085] hover:text-[#1abc9c] font-semibold flex items-center gap-1 transition-colors"
              >
                <span>+</span> Añadir nuevo RA
              </button>
              
              <div className="glass-card px-4 py-2 inline-flex items-center gap-2 border-l-4 border-l-blue-500">
                <span className="text-gray-400">Total suma % RA:</span>
                <span className={`font-bold ${df_ra.reduce((sum: number, ra: any) => sum + (Number(ra.peso_ra) || 0), 0) === 100 ? 'text-green-400' : 'text-red-400'}`}>
                  {df_ra.reduce((sum: number, ra: any) => sum + (Number(ra.peso_ra) || 0), 0).toFixed(0)}%
                </span>
              </div>
            </div>
          </section>

          {/* Unidades Didácticas */}
          <section className="glass-card p-6 border-t-4 border-t-purple-500">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>📚</span> UD. Unidades Didácticas
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-sm text-gray-400">
                    <th className="p-3 sticky left-0 bg-[#0b1120] z-10">ID-UD</th>
                    <th className="p-3 sticky left-[80px] bg-[#0b1120] z-10">Horas</th>
                    <th className="p-3 sticky left-[160px] bg-[#0b1120] z-10 w-64">Unidad Didáctica</th>
                    {df_ra.map((ra: any, i: number) => (
                      <th key={i} className="p-3 text-center min-w-[80px]">
                        <div className="text-xs">{ra.id_ra}</div>
                        <div className="text-[10px] text-purple-400">({ra.peso_ra || 0}%)</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {df_ud.map((ud: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-sm sticky left-0 bg-[#0b1120] group-hover:bg-[#111827]">{ud.id_ud}</td>
                      <td className="p-3 sticky left-[80px] bg-[#0b1120] group-hover:bg-[#111827]">
                        <input 
                          type="number" 
                          value={ud.horas_ud || 0}
                          onChange={(e) => {
                            const newUd = [...df_ud];
                            newUd[idx].horas_ud = parseFloat(e.target.value) || 0;
                            updateDataFrame("df_ud", newUd);
                          }}
                          className="w-16 bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-purple-500 focus:outline-none" 
                        />
                      </td>
                      <td className="p-3 sticky left-[160px] bg-[#0b1120] group-hover:bg-[#111827]">
                        <input 
                          type="text" 
                          value={ud.desc_ud || ""}
                          onChange={(e) => {
                            const newUd = [...df_ud];
                            newUd[idx].desc_ud = e.target.value;
                            updateDataFrame("df_ud", newUd);
                          }}
                          className="w-full bg-black/30 border border-white/10 rounded px-3 py-1 text-white text-sm focus:border-purple-500 focus:outline-none" 
                        />
                      </td>
                      {df_ra.map((ra: any, raIdx: number) => (
                        <td key={raIdx} className="p-3 text-center">
                          <input 
                            type="number" 
                            value={ud[ra.id_ra] || ""}
                            onChange={(e) => {
                              const newUd = [...df_ud];
                              newUd[idx][ra.id_ra] = parseFloat(e.target.value) || 0;
                              updateDataFrame("df_ud", newUd);
                            }}
                            className="w-14 text-center bg-black/30 border border-white/10 rounded px-1 py-1 text-white text-sm focus:border-purple-500 focus:outline-none" 
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <button 
                onClick={() => {
                  const newUd = [...df_ud];
                  const newId = `UD${(newUd.length + 1).toString().padStart(2, '0')}`;
                  newUd.push({ id_ud: newId, horas_ud: 0, desc_ud: "" });
                  updateDataFrame("df_ud", newUd);
                }}
                className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>+</span> Añadir nueva UD
              </button>
              
              <div className="glass-card px-4 py-2 inline-flex items-center gap-2 border-l-4 border-l-purple-500">
                <span className="text-gray-400">Total horas UD:</span>
                <span className="font-bold text-purple-400">
                  {df_ud.reduce((sum: number, ud: any) => sum + (Number(ud.horas_ud) || 0), 0)} h
                </span>
              </div>
            </div>
          </section>

          {/* Criterios de Evaluación */}
          <section className="glass-card p-6 border-t-4 border-t-yellow-500">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>🧩</span> CE. Criterios de Evaluación
            </h2>
            
            <div className="space-y-4">
              {df_ra.map((ra: any) => {
                const ceForRa = df_ce.filter((ce: any) => ce.id_ra === ra.id_ra);
                const totalPeso = ceForRa.reduce((sum: number, ce: any) => sum + (Number(ce.peso_ce) || 0), 0);
                
                return (
                  <details key={ra.id_ra} className="group bg-white/5 rounded-lg border border-white/10 overflow-hidden open:bg-white/10 transition-colors">
                    <summary className="p-4 cursor-pointer flex items-center justify-between font-semibold text-lg select-none hover:bg-white/5">
                      <div className="flex items-center gap-4">
                        <span className="text-yellow-400">{ra.id_ra}</span>
                        <span className="text-sm text-gray-400 font-normal truncate max-w-xl">{ra.desc_ra}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-400">{ceForRa.length} CE</span>
                        <span className={`px-2 py-1 rounded ${totalPeso === 100 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          Σ {totalPeso.toFixed(0)}%
                        </span>
                        <span className="group-open:rotate-180 transition-transform text-gray-500">▼</span>
                      </div>
                    </summary>
                    <div className="p-4 border-t border-white/10 bg-black/20">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-gray-400 border-b border-white/10">
                            <th className="pb-2">ID-CE</th>
                            <th className="pb-2 w-20">% CE</th>
                            <th className="pb-2 w-16 text-center">FEOE</th>
                            <th className="pb-2">Criterio de Evaluación</th>
                            <th className="pb-2 w-32">OG</th>
                            <th className="pb-2 w-32">CPE</th>
                            <th className="pb-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {ceForRa.map((ce: any, ceIdx: number) => {
                            const globalIdx = df_ce.findIndex((gCe: any) => gCe === ce);
                            return (
                              <tr key={ceIdx} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-2 pr-2">
                                  <input 
                                    type="text" 
                                    value={ce.id_ce || ""}
                                    onChange={(e) => {
                                      const newCe = [...df_ce];
                                      newCe[globalIdx].id_ce = e.target.value;
                                      updateDataFrame("df_ce", newCe);
                                    }}
                                    className="w-16 bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-yellow-500 focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="number" 
                                    value={ce.peso_ce || 0}
                                    onChange={(e) => {
                                      const newCe = [...df_ce];
                                      newCe[globalIdx].peso_ce = parseFloat(e.target.value) || 0;
                                      updateDataFrame("df_ce", newCe);
                                    }}
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-yellow-500 focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={ce.feoe || false}
                                    onChange={(e) => {
                                      const newCe = [...df_ce];
                                      newCe[globalIdx].feoe = e.target.checked;
                                      updateDataFrame("df_ce", newCe);
                                    }}
                                    className="accent-yellow-500" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="text" 
                                    value={ce.desc_ce || ""}
                                    onChange={(e) => {
                                      const newCe = [...df_ce];
                                      newCe[globalIdx].desc_ce = e.target.value;
                                      updateDataFrame("df_ce", newCe);
                                    }}
                                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-1 text-white focus:border-yellow-500 focus:outline-none" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="text" 
                                    value={ce.og_vinc || ""}
                                    onChange={(e) => {
                                      const newCe = [...df_ce];
                                      newCe[globalIdx].og_vinc = e.target.value;
                                      updateDataFrame("df_ce", newCe);
                                    }}
                                    placeholder="Ej. OG1"
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-yellow-500 focus:outline-none text-xs" 
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input 
                                    type="text" 
                                    value={ce.cpe_vinc || ""}
                                    onChange={(e) => {
                                      const newCe = [...df_ce];
                                      newCe[globalIdx].cpe_vinc = e.target.value;
                                      updateDataFrame("df_ce", newCe);
                                    }}
                                    placeholder="Ej. CPE1"
                                    className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:border-yellow-500 focus:outline-none text-xs" 
                                  />
                                </td>
                                <td className="py-2 text-center">
                                  <button
                                    onClick={() => {
                                      const newCe = [...df_ce];
                                      newCe.splice(globalIdx, 1);
                                      updateDataFrame("df_ce", newCe);
                                    }}
                                    className="text-red-400 hover:text-red-300 font-bold"
                                    title="Eliminar CE"
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="mt-3">
                        <button 
                          onClick={() => {
                            const newCe = [...df_ce];
                            newCe.push({ 
                              id_ra: ra.id_ra, 
                              id_ce: `${ra.id_ra.replace('RA', 'CE')}.`, 
                              peso_ce: 0, 
                              feoe: false, 
                              desc_ce: "", 
                              og_vinc: "", 
                              cpe_vinc: "" 
                            });
                            updateDataFrame("df_ce", newCe);
                          }}
                          className="text-xs text-yellow-500 hover:text-yellow-400 font-semibold flex items-center gap-1"
                        >
                          <span>+</span> Añadir CE a {ra.id_ra}
                        </button>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
