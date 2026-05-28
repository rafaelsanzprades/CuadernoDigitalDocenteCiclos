// @ts-nocheck
"use client";
import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

export default function CalificacionPage() {
  const { activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData, updateCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("resumen");
  const [activeTabByStudent, setActiveTabByStudent] = useState<Record<string, string>>({});
  const [allStudentsOpen, setAllStudentsOpen] = useState(true);
  const [openStudents, setOpenStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
        }
        if (activeCursoId && !cursoData) {
          const res = await fetch(`/api/module/${activeCursoId}`);
          const data = await res.json();
          if (data.status === "success") setCursoData(data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };

    if (activeModuleId || activeCursoId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData, activeCursoId, cursoData, setModuleData, setCursoData]);

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
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No hay Curso o Módulo seleccionado</h2>
              <p className="text-muted">Por favor, ve a la sección de Datos y asegúrate de cargar ambos.</p>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !cursoData || !moduleData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
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
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <Card className="p-8 text-center border-l-4 border-l-yellow-500">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">Falta información</h2>
              <p className="text-muted">Asegúrate de tener Criterios de evaluación y Actividades definidos, y alumnado activo en la Matrícula.</p>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <main className="flex-1 p-8 content-area space-y-6">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              📊 Calificación académica
            </h1>
            <p className="text-muted mt-2 text-lg">Registro y cálculo automático de las calificaciones por trimestre y evaluación final.</p>
          </div>

          <div className="flex border-b border-[var(--glass-border)] mb-8 overflow-x-auto scrollbar-hide">
            {[
              { id: "resumen", label: "📊 Resumen estadístico" },
              { id: "detalle", label: "👥 Detalle por alumnado" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-muted hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "resumen" && (
          <Card className="p-6">
            <h4 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <span>📊</span> Resumen de calificaciones por trimestres
            </h4>
            <div className="overflow-x-auto">
              {(() => {
                const tipos = [
                  { key: "Teoria", label: "Exámenes teóricos", color: "blue" },
                  { key: "Practica", label: "Exámenes prácticos", color: "emerald" },
                  { key: "Informes", label: "Informes de ejercicios", color: "orange" },
                  { key: "Tareas", label: "Cuaderno de tareas", color: "purple" },
                ];
                const tris = [
                  { key: "1T", label: "1er trimestre" },
                  { key: "2T", label: "2º trimestre" },
                  { key: "3T", label: "3er trimestre" },
                ];

                const getStats = (triKey: string, tipoKey: string) => {
                  const acts = (acts_by_tri[triKey] || []).filter((a: any) => a.Tipo === tipoKey);
                  if (acts.length === 0) return null;
                  const allGrades: number[] = [];
                  df_evaluable.forEach((al: any) => {
                    const evRow = df_eval.find((e: any) => e.ID === al.ID);
                    if (!evRow) return;
                    acts.forEach((act: any) => {
                      const v = Number(evRow[act.id_act]);
                      if (!isNaN(v) && v > 0) allGrades.push(v);
                    });
                  });
                  if (allGrades.length === 0) return { min: 0, avg: 0, max: 0 };
                  return {
                    min: Math.min(...allGrades),
                    avg: allGrades.reduce((a, b) => a + b, 0) / allGrades.length,
                    max: Math.max(...allGrades),
                  };
                };

                return (
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--glass-border)]">
                        <th className="p-3 text-left text-muted font-semibold" rowSpan={2}>Trimestre</th>
                        {tipos.map(t => (
                          <th key={t.key} colSpan={3} className={`p-2 text-center text-${t.color}-400 font-semibold border-l border-[var(--glass-border)]`}>{t.label}</th>
                        ))}
                      </tr>
                      <tr className="border-b border-[var(--glass-border)] text-xs text-muted">
                        {tipos.map(t => (
                          <React.Fragment key={t.key}>
                            <th className="p-2 text-center border-l border-[var(--glass-border)]">Mín</th>
                            <th className="p-2 text-center">Media</th>
                            <th className="p-2 text-center">Máx</th>
                          </React.Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tris.map(tri => (
                        <tr key={tri.key} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                          <td className="p-3 font-semibold text-foreground">{tri.label}</td>
                          {tipos.map(t => {
                            const s = getStats(tri.key, t.key);
                            return (
                              <React.Fragment key={t.key}>
                                <td className="p-3 text-center border-l border-[var(--glass-border)]">
                                  <span className={`text-${t.color}-400/70 font-mono`}>{s ? s.min.toFixed(1) : '—'}</span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`bg-${t.color}-500/15 text-${t.color}-400 font-bold px-2 py-0.5 rounded-md`}>{s ? s.avg.toFixed(1) : '—'}</span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`text-${t.color}-400/70 font-mono`}>{s ? s.max.toFixed(1) : '—'}</span>
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="border-t-2 border-[var(--glass-border)] bg-foreground/5">
                        <td className="p-4 font-extrabold text-foreground text-lg">Total</td>
                        {tipos.map(t => {
                          const allGrades: number[] = [];
                          df_evaluable.forEach((al: any) => {
                            const evRow = df_eval.find((e: any) => e.ID === al.ID);
                            if (!evRow) return;
                            df_act.filter((a: any) => a.Tipo === t.key).forEach((act: any) => {
                              const v = Number(evRow[act.id_act]);
                              if (!isNaN(v) && v > 0) allGrades.push(v);
                            });
                          });
                          const s = allGrades.length > 0
                            ? { min: Math.min(...allGrades), avg: allGrades.reduce((a, b) => a + b, 0) / allGrades.length, max: Math.max(...allGrades) }
                            : null;
                          return (
                            <React.Fragment key={t.key}>
                              <td className="p-4 text-center border-l border-[var(--glass-border)]">
                                <span className={`text-${t.color}-400/80 font-mono font-bold`}>{s ? s.min.toFixed(1) : '—'}</span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`bg-${t.color}-500/20 text-${t.color}-400 font-extrabold text-lg px-3 py-1 rounded-lg`}>{s ? s.avg.toFixed(1) : '—'}</span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`text-${t.color}-400/80 font-mono font-bold`}>{s ? s.max.toFixed(1) : '—'}</span>
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </Card>
          )}

          {activeTab === "detalle" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                👥 Calificación por alumnado
              </h2>
              <p className="text-muted mt-1">Notas individuales por alumno, trimestre e instrumento de evaluación.</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                if (allStudentsOpen) {
                  setOpenStudents(new Set());
                } else {
                  setOpenStudents(new Set(df_evaluable.map((a: any) => a.ID)));
                }
                setAllStudentsOpen(!allStudentsOpen);
              }}
            >
              <span>{allStudentsOpen ? '▲' : '▼'}</span>
              {allStudentsOpen ? 'Colapsar todos' : 'Expandir todos'}
            </Button>
          </div>

          <div className="space-y-4">
            {df_evaluable.map((al: any) => {
              const al_id = al.ID;
              const evRow = df_eval.find((e: any) => e.ID === al_id) || { ID: al_id, Nota_Final: 0 };
              
              const nota_prev = Number(evRow.Nota_Final) || 0;
              const sigad = getSigadInfo(nota_prev);
              const activeTab = activeTabByStudent[al_id] || "1T";

              return (
                <div key={al_id} className="group bg-foreground/5 rounded-lg border border-[var(--glass-border)] overflow-hidden transition-colors">
                  <div 
                    onClick={() => {
                      const newSet = new Set(openStudents);
                      if (newSet.has(al_id)) newSet.delete(al_id);
                      else newSet.add(al_id);
                      setOpenStudents(newSet);
                    }}
                    className="p-4 cursor-pointer flex items-center justify-between font-semibold text-lg select-none hover:bg-foreground/10 transition-colors"
                  >
                    <div className="flex items-center gap-4 w-1/3">
                      <span className="text-2xl">👤</span>
                      <span>{al.Apellidos}, {al.Nombre}</span>
                    </div>

                    {/* Sparkline (Tendencia) */}
                    <div className="flex-1 h-10 flex items-center px-4 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {(() => {
                        const allVals: number[] = [];
                        df_act.forEach((act: any) => {
                          const v = Number(evRow[act.id_act]);
                          if (!isNaN(v) && v > 0) allVals.push(v);
                        });
                        const data = allVals.map((v, i) => ({ name: i, value: v }));
                        if (data.length < 2) return <span className="text-xs text-muted italic">Sin datos suficientes para tendencia</span>;
                        
                        return (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                              <YAxis domain={[0, 10]} hide />
                              <Line type="monotone" dataKey="value" stroke={sigad.col} strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-6 text-sm w-1/4 justify-end">
                      <span className="font-bold text-lg" style={{ color: sigad.col }}>
                        {sigad.n} · {sigad.cod} <span className="text-sm font-normal text-muted">({sigad.txt})</span>
                      </span>
                      <span className={`ml-4 inline-block transition-transform duration-300 text-muted ${openStudents.has(al_id) ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </div>
                  
                  <AnimatePresence initial={false}>
                    {openStudents.has(al_id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 border-t border-[var(--glass-border)] bg-foreground/10 flex gap-8">
                          {/* Left: Tabs and Inputs */}
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground/80 mb-4">Evaluación por Instrumentos</h3>
                            <div className="flex border-b border-[var(--glass-border)] mb-4">
                              {["1T", "2T", "3T"].map(tab => (
                                <button 
                                  key={tab}
                                  onClick={() => setActiveTabByStudent(prev => ({ ...prev, [al_id]: tab }))}
                                  className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-muted hover:text-foreground/80'}`}
                                >
                                  {tab === "1T" ? "1º Tri" : tab === "2T" ? "2º Tri" : "3º Tri"}
                                </button>
                              ))}
                            </div>
                            <div className="space-y-4">
                              {acts_by_tri[activeTab].length === 0 ? (
                                <div className="text-muted text-sm italic">No hay actividades evaluables definidas para este trimestre.</div>
                              ) : (
                                acts_by_tri[activeTab].map(act => {
                                  const act_id = act.id_act;
                                  const val = Number(evRow[act_id]) || 0;
                                  return (
                                    <div key={act_id} className="flex items-center justify-between gap-4">
                                      <label className="text-sm text-foreground/80 flex-1 truncate" title={act.desc_act}>
                                        <span className="text-muted font-mono mr-2">[{act.Tipo || "Act"}]</span>
                                        {act.desc_act || act_id}
                                      </label>
                                      <input 
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={val || ""}
                                        onChange={(e) => handleUpdateActNota(al_id, act_id, Number(e.target.value) || 0)}
                                        className="w-20 bg-foreground/15 border border-[var(--glass-border)] rounded px-3 py-1 text-foreground focus:border-blue-500 focus:outline-none font-mono text-center"
                                      />
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Right: Summary SIGAD */}
                          <div className="w-64 flex flex-col">
                            <h3 className="font-bold text-foreground/80 mb-4">Cálculo Jerárquico</h3>
                            <div className="mb-4">
                              <label className="text-xs text-muted uppercase tracking-wider mb-1 block">Nota Final (Manual / Calc)</label>
                              <input 
                                type="number"
                                min="1" max="10" step="0.1"
                                value={nota_prev || ""}
                                onChange={(e) => handleOverrideNotaFinal(al_id, Number(e.target.value) || 0)}
                                className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-3 py-2 text-xl font-bold text-foreground focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                            
                            <div className="flex-1 rounded-xl flex flex-col items-center justify-center p-4 border-2" style={{ borderColor: sigad.col, backgroundColor: `${sigad.col}11` }}>
                              <div className="text-6xl font-black mb-2" style={{ color: sigad.col, lineHeight: 1 }}>{sigad.n}</div>
                              <div className="text-xl font-bold" style={{ color: sigad.col }}>{sigad.cod}</div>
                              <div className="text-xs text-muted mt-1 uppercase tracking-wider">{sigad.txt}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
