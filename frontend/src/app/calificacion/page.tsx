// @ts-nocheck
"use client";
import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function CalificacionPage() {
  const { activeModuleId, moduleData, activeCursoId, cursoData, updateCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTabByStudent, setActiveTabByStudent] = useState<Record<string, string>>({});

  useEffect(() => {
    // If we have both IDs and no data, the layout should technically handle fetching, 
    // but we can ensure local loading state is false if data is present.
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
            <div className="text-xl text-blue-400 animate-pulse">Cargando datos de calificación...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_al = cursoData?.df_al || [];
  const df_eval = cursoData?.df_eval || [];
  const df_act = moduleData?.df_act || [];
  const df_ce = moduleData?.df_ce || [];
  const df_ra = moduleData?.df_ra || [];
  const df_feoe = cursoData?.df_feoe || [];

  const df_evaluable = df_al.filter((al: any) => al.Estado !== "Baja");
  df_evaluable.sort((a: any, b: any) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  const acts_by_tri: Record<string, any[]> = { "1T": [], "2T": [], "3T": [] };
  df_act.forEach((act: any) => {
    if (act.id_act && String(act.id_act).trim() !== "") {
      const tri = act.tri_act || "1T";
      if (acts_by_tri[tri]) acts_by_tri[tri].push(act);
    }
  });

  const getSigadInfo = (nota: number) => {
    let n = nota < 5 ? Math.floor(nota) : Math.floor(nota + 0.5);
    n = Math.max(1, Math.min(10, n));
    if (nota < 5) return { n, cod: "IN", txt: "Insuficiente", col: "#e74c3c" };
    if (nota < 6) return { n, cod: "SU", txt: "Suficiente", col: "#e67e22" };
    if (nota < 7) return { n, cod: "BI", txt: "Bien", col: "#3498db" };
    if (nota < 9) return { n, cod: "NT", txt: "Notable", col: "#2ecc71" };
    return { n, cod: "SB", txt: "Sobresaliente", col: "#1abc9c" };
  };

  const calcularNotas = (al_id: string, evRow: any) => {
    const peso_ra: Record<string, number> = {};
    df_ra.forEach((ra: any) => {
      if (ra.id_ra) peso_ra[ra.id_ra] = Number(ra.peso_ra) || 0;
    });

    const peso_ce: Record<string, number> = {};
    const ra_of_ce: Record<string, string> = {};
    df_ce.forEach((ce: any) => {
      if (ce.id_ce && ce.id_ra) {
        peso_ce[ce.id_ce] = Number(ce.peso_ce) || 0;
        ra_of_ce[ce.id_ce] = ce.id_ra;
      }
    });

    const notas_ce: Record<string, number> = {};
    Object.keys(peso_ce).forEach(ce_id => {
      const act_vals: number[] = [];
      df_act.forEach((act: any) => {
        if (act[ce_id] === true || act[ce_id] === "true") {
          const act_id = act.id_act;
          const val = Number(evRow[act_id]);
          if (!isNaN(val)) act_vals.push(val);
        }
      });
      notas_ce[ce_id] = act_vals.length > 0 ? act_vals.reduce((a, b) => a + b, 0) / act_vals.length : 0;
    });

    const notas_ra: Record<string, number> = {};
    Object.entries(notas_ce).forEach(([ce_id, n_ce]) => {
      const r_id = ra_of_ce[ce_id];
      if (r_id) {
        if (!notas_ra[r_id]) notas_ra[r_id] = 0;
        notas_ra[r_id] += n_ce * (peso_ce[ce_id] / 100);
      }
    });

    // FEOE integration
    df_ra.forEach((ra: any) => {
      if (ra.is_dual && df_feoe.length > 0) {
        const fe_row = df_feoe.find((fe: any) => fe.ID === al_id);
        if (fe_row && Number(fe_row[ra.id_ra]) >= 1) {
          const val_feoe = Number(fe_row[ra.id_ra]);
          const conv: any = { 1: 3.0, 2: 5.0, 3: 7.5, 4: 10.0 };
          const nota_emp = conv[val_feoe] || 0;
          if (notas_ra[ra.id_ra] !== undefined) {
            notas_ra[ra.id_ra] = (notas_ra[ra.id_ra] + nota_emp) / 2.0;
          }
        }
      }
    });

    let nota_final = 0;
    Object.entries(notas_ra).forEach(([r_id, n_ra]) => {
      nota_final += n_ra * ((peso_ra[r_id] || 0) / 100);
    });

    return { notas_ra, nota_final, notas_ce };
  };

  const handleUpdateActNota = (al_id: string, act_id: string, val: number) => {
    const newEval = [...df_eval];
    let evRowIdx = newEval.findIndex(e => e.ID === al_id);
    
    if (evRowIdx === -1) {
      newEval.push({ ID: al_id, Nota_Final: 0 });
      evRowIdx = newEval.length - 1;
    }
    
    newEval[evRowIdx][act_id] = val;
    
    // Recalculate Note Final
    const { nota_final } = calcularNotas(al_id, newEval[evRowIdx]);
    newEval[evRowIdx]["Nota_Final"] = Number(nota_final.toFixed(2));
    
    updateCursoData("df_eval", newEval);
  };

  const handleOverrideNotaFinal = (al_id: string, val: number) => {
    const newEval = [...df_eval];
    let evRowIdx = newEval.findIndex(e => e.ID === al_id);
    if (evRowIdx === -1) {
      newEval.push({ ID: al_id, Nota_Final: 0 });
      evRowIdx = newEval.length - 1;
    }
    newEval[evRowIdx]["Nota_Final"] = val;
    updateCursoData("df_eval", newEval);
  };

  if (df_evaluable.length === 0 || df_act.length === 0 || df_ce.length === 0) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 content-area">
            <div className="glass-card p-8 text-center border-l-4 border-l-yellow-500">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">Falta información</h2>
              <p className="text-gray-400">Asegúrate de tener Criterios de Evaluación y Actividades definidos, y alumnado activo en la Matrícula.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 content-area space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                📊 Evaluación Competencial
              </h1>
              <p className="text-gray-400 mt-2">Introduce las notas de las actividades; el sistema calculará la nota final automáticamente.</p>
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

          <div className="space-y-4">
            {df_evaluable.map((al: any) => {
              const al_id = al.ID;
              const evRow = df_eval.find((e: any) => e.ID === al_id) || { ID: al_id, Nota_Final: 0 };
              
              const nota_prev = Number(evRow.Nota_Final) || 0;
              const sigad = getSigadInfo(nota_prev);
              const activeTab = activeTabByStudent[al_id] || "1T";

              return (
                <details key={al_id} className="group bg-white/5 rounded-lg border border-white/10 overflow-hidden open:bg-white/10 transition-colors">
                  <summary className="p-4 cursor-pointer flex items-center justify-between font-semibold text-lg select-none hover:bg-white/5">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">👤</span>
                      <span>{al.Apellidos}, {al.Nombre}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="font-bold text-lg" style={{ color: sigad.col }}>
                        {sigad.n} · {sigad.cod} <span className="text-sm font-normal text-gray-400">({sigad.txt})</span>
                      </span>
                      <span className="ml-4 group-open:rotate-180 inline-block transition-transform text-gray-500">▼</span>
                    </div>
                  </summary>
                  
                  <div className="p-6 border-t border-white/10 bg-black/20 flex gap-8">
                    {/* Left: Tabs and Inputs */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-300 mb-4">Evaluación por Instrumentos</h3>
                      <div className="flex border-b border-white/10 mb-4">
                        {["1T", "2T", "3T"].map(tab => (
                          <button 
                            key={tab}
                            onClick={() => setActiveTabByStudent(prev => ({ ...prev, [al_id]: tab }))}
                            className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                          >
                            {tab === "1T" ? "1º Tri" : tab === "2T" ? "2º Tri" : "3º Tri"}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-4">
                        {acts_by_tri[activeTab].length === 0 ? (
                          <div className="text-gray-500 text-sm italic">No hay actividades evaluables definidas para este trimestre.</div>
                        ) : (
                          acts_by_tri[activeTab].map(act => {
                            const act_id = act.id_act;
                            const val = Number(evRow[act_id]) || 0;
                            return (
                              <div key={act_id} className="flex items-center justify-between gap-4">
                                <label className="text-sm text-gray-300 flex-1 truncate" title={act.desc_act}>
                                  <span className="text-gray-500 font-mono mr-2">[{act.Tipo || "Act"}]</span>
                                  {act.desc_act || act_id}
                                </label>
                                <input 
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={val || ""}
                                  onChange={(e) => handleUpdateActNota(al_id, act_id, Number(e.target.value) || 0)}
                                  className="w-20 bg-black/30 border border-white/10 rounded px-3 py-1 text-white focus:border-blue-500 focus:outline-none font-mono text-center"
                                />
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Right: Summary SIGAD */}
                    <div className="w-64 flex flex-col">
                      <h3 className="font-bold text-gray-300 mb-4">Cálculo Jerárquico</h3>
                      <div className="mb-4">
                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Nota Final (Manual / Calc)</label>
                        <input 
                          type="number"
                          min="1" max="10" step="0.1"
                          value={nota_prev || ""}
                          onChange={(e) => handleOverrideNotaFinal(al_id, Number(e.target.value) || 0)}
                          className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-xl font-bold text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      
                      <div className="flex-1 rounded-xl flex flex-col items-center justify-center p-4 border-2" style={{ borderColor: sigad.col, backgroundColor: `${sigad.col}11` }}>
                        <div className="text-6xl font-black mb-2" style={{ color: sigad.col, lineHeight: 1 }}>{sigad.n}</div>
                        <div className="text-xl font-bold" style={{ color: sigad.col }}>{sigad.cod}</div>
                        <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{sigad.txt}</div>
                      </div>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>

        </main>
      </div>
    </div>
  );
}
