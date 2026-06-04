"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CalificacionFEOETab } from "@/components/features/calificacion/CalificacionFEOETab";
import { AnalisisGrupalTab } from "@/components/features/analisis/AnalisisGrupalTab";
import { AnalisisIndividualTab } from "@/components/features/analisis/AnalisisIndividualTab";

export default function ProgresoPage() {
  const { 
    activeModuleId, 
    moduleData, 
    setModuleData, 
    activeCursoId, 
    cursoData, 
    setCursoData, 
    updateCursoData,
    saveCursoData 
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("resumen");
  const [activeTabByStudent, setActiveTabByStudent] = useState<Record<string, string>>({});
  const [allStudentsOpen, setAllStudentsOpen] = useState(false);
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
    setSaving(true);
    setSaveMessage("");
    const ok = await saveCursoData();
    if (ok) {
      setSaveMessage("Guardado correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
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
    return <LoadingSpinner text="Cargando datos de progreso académico..." />;
  }

  const df_al = cursoData?.df_al || [];
  const df_eval = cursoData?.df_eval || [];
  const df_act = moduleData?.df_act || [];
  const df_ce = moduleData?.df_ce || [];
  const df_ra = moduleData?.df_ra || [];
  const df_feoe = cursoData?.df_feoe || [];
  const df_ud = moduleData?.df_ud || [];
  const df_pr = moduleData?.df_pr || [];
  const info_fechas = moduleData?.info_fechas || {};
  const planning_ledger = moduleData?.planning_ledger || {};

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

  // LÓGICA DE PROYECCIÓN DE TRIMESTRES PARA CADA RA
  const uds_por_tri: Record<string, Set<string>> = { "1T": new Set(), "2T": new Set(), "3T": new Set() };

  const mapTrimestre = (ini_key: string, fin_key: string, t_key: string) => {
    const ini_str = info_fechas[ini_key];
    const fin_str = info_fechas[fin_key];
    if (!ini_str || !fin_str) return;

    const ini = new Date(ini_str);
    const fin = new Date(fin_str);
    let curr = new Date(ini);

    while (curr <= fin) {
      const dateStr = curr.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const uds = planning_ledger[dateStr] || [];
      uds.forEach((ud: string) => uds_por_tri[t_key].add(ud));
      curr.setDate(curr.getDate() + 1);
    }
  };

  mapTrimestre("ini_1t", "fin_1t", "1T");
  mapTrimestre("ini_2t", "fin_2t", "2T");
  mapTrimestre("ini_3t", "fin_3t", "3T");

  const ra_to_tri: Record<string, any> = {};
  const ra_info: Record<string, any> = {};

  df_ra.forEach((ra: any) => {
    const ra_id = String(ra.id_ra);
    ra_info[ra_id] = {
      pond: Number(ra.peso_ra) || 0.0,
      desc: String(ra.desc_ra || "")
    };

    const tris_found = new Set<string>();
    const uds_found: string[] = [];
    const prs_found: string[] = [];

    // Buscar en UDs
    df_ud.forEach((ud: any) => {
      if (Number(ud[ra_id]) > 0) {
        const uid = String(ud.id_ud);
        uds_found.push(uid);
        ["1T", "2T", "3T"].forEach(t => {
          if (uds_por_tri[t].has(uid)) tris_found.add(t);
        });
      }
    });

    // Buscar en Prácticas
    df_pr.forEach((pr: any) => {
      if (Number(pr[ra_id]) > 0) {
        prs_found.push(String(pr.ID));
      }
    });

    ra_to_tri[ra_id] = {
      tris: tris_found.size > 0 ? Array.from(tris_found) : ["1T", "2T", "3T"],
      uds: uds_found,
      prs: prs_found
    };
  });

  const TABS = [
    { id: "resumen", label: "📊 Resumen" },
    { id: "detalle", label: "👥 Detalle por alumnado" },
    { id: "grupal", label: "📋 Grupal" },
    { id: "individual", label: "👤 Individual" },
    { id: "feoe", label: "🏢 Calificación FEOE" }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={TABS.find(t => t.id === activeTab)?.label} />

        <main className="flex-1 p-8 content-area space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                📈 Progreso académico
              </h1>
              <p className="text-muted mt-2 text-lg">Panel integrado de calificaciones numéricas, evaluación por resultados de aprendizaje (RA) y analíticas.</p>
            </div>
            {/* Save Button */}
            <div className="flex items-center gap-4">
              {saveMessage && (
                <span className={`text-sm font-semibold ${saveMessage.includes("Error") ? "text-red-400" : "text-green-400"}`}>
                  {saveMessage}
                </span>
              )}
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-accent text-background hover:bg-accent/80 font-bold px-6 py-2 rounded-xl flex items-center gap-2"
              >
                {saving ? "Guardando..." : "Guardar Cambios 💾"}
              </Button>
            </div>
          </div>

          <div className="flex border-b border-[var(--glass-border)] overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
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

          {/* TAB 1: RESUMEN (Dos bloques uno detrás de otro) */}
          {activeTab === "resumen" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* Bloque 1: Resumen de calificaciones por trimestres */}
              <Card className="p-6 border-t-4 border-t-blue-500">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-5">
                  <span>📊</span> Resumen de calificaciones por trimestres
                </h2>
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

              {/* Bloque 2: Resumen de Resultados de aprendizaje por trimestres */}
              <Card className="p-6 border-t-4 border-t-emerald-500">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-5">
                  <span>🎯</span> Resumen de Resultados de aprendizaje por trimestres
                </h2>
                <div className="space-y-5">
                  {Object.keys(ra_info).map(ra_id => {
                    const info = ra_info[ra_id];
                    const r_data = ra_to_tri[ra_id];
                    const tris = r_data.tris;

                    // Compute nota per student for this RA
                    const notasAlumnado: number[] = [];
                    df_evaluable.forEach((al: any) => {
                      const evalData = df_eval.find((e: any) => e.ID === al.ID);
                      if (!evalData) return;
                      const notas_student: Record<string, number> = {
                        "1T": Number(evalData["1T_Nota"]) || 0,
                        "2T": Number(evalData["2T_Nota"]) || 0,
                        "3T": Number(evalData["3T_Nota"]) || 0,
                      };
                      let avg = 0;
                      if (tris.length > 0) {
                        avg = tris.reduce((sum: number, t: string) => sum + notas_student[t], 0) / tris.length;
                      } else {
                        avg = Number(evalData["Nota_Final"]) || 0;
                      }
                      notasAlumnado.push(avg);
                    });

                    const minN = notasAlumnado.length > 0 ? Math.min(...notasAlumnado) : 0;
                    const maxN = notasAlumnado.length > 0 ? Math.max(...notasAlumnado) : 0;
                    const avgN = notasAlumnado.length > 0 ? notasAlumnado.reduce((a, b) => a + b, 0) / notasAlumnado.length : 0;

                    const getColor = (v: number) => v >= 9 ? '#1abc9c' : v >= 7 ? '#2ecc71' : v >= 5 ? '#f39c12' : '#e74c3c';

                    return (
                      <div key={ra_id} className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-foreground">{ra_id}</span>
                            <span className="text-xs text-muted">({info.pond.toFixed(1)}%)</span>
                            <span className="text-sm text-muted truncate max-w-md">{info.desc}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-muted">Trimestres: {tris.join(', ')}</span>
                          </div>
                        </div>

                        {/* Bar visualization 0-10 */}
                        <div className="relative h-8 bg-foreground/20 rounded-full border border-[var(--glass-border)] overflow-hidden">
                          {(() => {
                            const interpolateColor = (val: number) => {
                              const pct = Math.max(0, Math.min(1, val / 10));
                              const stops = [
                                { p: 0, r: 231, g: 76, b: 60 },
                                { p: 0.25, r: 230, g: 126, b: 34 },
                                { p: 0.5, r: 241, g: 196, b: 15 },
                                { p: 0.75, r: 127, g: 190, b: 58 },
                                { p: 1, r: 39, g: 174, b: 96 },
                              ];
                              let i = 0;
                              for (i = 0; i < stops.length - 1; i++) { if (pct <= stops[i + 1].p) break; }
                              const s1 = stops[i], s2 = stops[Math.min(i + 1, stops.length - 1)];
                              const t = s2.p > s1.p ? (pct - s1.p) / (s2.p - s1.p) : 0;
                              const r = Math.round(s1.r + (s2.r - s1.r) * t);
                              const g = Math.round(s1.g + (s2.g - s1.g) * t);
                              const b = Math.round(s1.b + (s2.b - s1.b) * t);
                              return `rgb(${r},${g},${b})`;
                            };
                            return (
                              <div
                                className="absolute top-1 bottom-1 rounded-full"
                                style={{
                                  left: `${(minN / 10) * 100}%`,
                                  width: `${Math.max(((maxN - minN) / 10) * 100, 0.5)}%`,
                                  background: `linear-gradient(to right, ${interpolateColor(minN)}, ${interpolateColor((minN + maxN) / 2)}, ${interpolateColor(maxN)})`,
                                  opacity: 0.85,
                                }}
                              />
                            );
                          })()}
                          <div className="absolute top-0 bottom-0 w-px bg-yellow-500/40" style={{ left: '50%' }} />

                          {/* Min marker */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-red-400 bg-red-400/30"
                            style={{ left: `calc(${(minN / 10) * 100}% - 6px)` }}
                            title={`Mín: ${minN.toFixed(1)}`}
                          />
                          {/* Mean marker */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 shadow-lg"
                            style={{
                              left: `calc(${(avgN / 10) * 100}% - 10px)`,
                              borderColor: getColor(avgN),
                              backgroundColor: getColor(avgN),
                            }}
                            title={`Media: ${avgN.toFixed(1)}`}
                          />
                          {/* Max marker */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-green-400 bg-green-400/30"
                            style={{ left: `calc(${(maxN / 10) * 100}% - 6px)` }}
                            title={`Máx: ${maxN.toFixed(1)}`}
                          />
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="text-muted/80">0</span>
                          <div className="flex items-center gap-6">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-400/50 border border-red-400 inline-block" />
                              <span className="text-red-400 font-mono">{minN.toFixed(1)}</span>
                              <span className="text-muted">Mín</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: getColor(avgN) }} />
                              <span className="font-bold font-mono" style={{ color: getColor(avgN) }}>{avgN.toFixed(1)}</span>
                              <span className="text-muted">Media</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-green-400/50 border border-green-400 inline-block" />
                              <span className="text-green-400 font-mono">{maxN.toFixed(1)}</span>
                              <span className="text-muted">Máx</span>
                            </span>
                          </div>
                          <span className="text-muted/80">10</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

            </div>
          )}

          {/* TAB 2: DETALLE POR ALUMNADODO (Con ambos bloques desplegables uno detrás de otro) */}
          {activeTab === "detalle" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                    👥 Detalle por alumnado
                  </h2>
                  <p className="text-muted mt-1">Notas individuales por alumnado, instrumento de evaluación y nivel de adquisición de RA.</p>
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
                  const activeStudentTab = activeTabByStudent[al_id] || "1T";

                  // Calcular RAs para el alumnado individual
                  const notas_student: Record<string, number> = {
                    "1T": Number(evRow["1T_Nota"]) || 0.0,
                    "2T": Number(evRow["2T_Nota"]) || 0.0,
                    "3T": Number(evRow["3T_Nota"]) || 0.0,
                  };
                  const nota_final = Number(evRow["Nota_Final"]) || 0.0;

                  let pct_global_cumplido = 0.0;
                  let suma_pond_ra = 0.0;
                  const resultados_ra: any[] = [];

                  Object.keys(ra_info).forEach(ra_id => {
                    const info = ra_info[ra_id];
                    const r_data = ra_to_tri[ra_id];
                    const tris = r_data.tris;

                    let avg_nota_ra = 0.0;
                    if (tris.length > 0) {
                      avg_nota_ra = tris.reduce((sum: number, t: string) => sum + notas_student[t], 0) / tris.length;
                    } else {
                      avg_nota_ra = nota_final;
                    }

                    let prop = avg_nota_ra >= 5.0 ? (avg_nota_ra / 5.0) * 100.0 : (avg_nota_ra / 5.0) * 100.0;
                    prop = Math.min(100.0, Math.max(0.0, prop));

                    const obtenido_peso = info.pond * (prop / 100.0);
                    pct_global_cumplido += obtenido_peso;
                    suma_pond_ra += info.pond;

                    resultados_ra.push({
                      id: ra_id, desc: info.desc, pond: info.pond, prop, nota: avg_nota_ra,
                      tris: r_data.tris, uds: r_data.uds, prs: r_data.prs
                    });
                  });

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
                            className="overflow-hidden bg-foreground/10 border-t border-[var(--glass-border)]"
                          >
                            <div className="p-6 space-y-8">
                              
                              {/* BLOQUE 1: Detalle de calificaciones por instrumento */}
                              <div className="flex flex-col lg:flex-row gap-8">
                                {/* Left: Instrument Inputs */}
                                <div className="flex-1">
                                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                    <span>📊</span> Detalle de Calificaciones por Instrumento
                                  </h3>
                                  <div className="flex border-b border-[var(--glass-border)] mb-4">
                                    {["1T", "2T", "3T"].map(t => (
                                      <button
                                        key={t}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveTabByStudent(prev => ({ ...prev, [al_id]: t }));
                                        }}
                                        className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${
                                          activeStudentTab === t
                                            ? 'border-blue-500 text-blue-400'
                                            : 'border-transparent text-muted hover:text-foreground/80'
                                        }`}
                                      >
                                        {t === "1T" ? "1º Trimestre" : t === "2T" ? "2º Trimestre" : "3º Trimestre"}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="space-y-4">
                                    {acts_by_tri[activeStudentTab].length === 0 ? (
                                      <div className="text-muted text-sm italic">No hay actividades evaluables definidas para este trimestre.</div>
                                    ) : (
                                      acts_by_tri[activeStudentTab].map(act => {
                                        const act_id = act.id_act;
                                        const val = Number(evRow[act_id]) || 0;
                                        return (
                                          <div key={act_id} className="flex items-center justify-between gap-4">
                                            <label className="text-sm text-foreground/85 flex-1 truncate" title={act.desc_act}>
                                              <span className="text-muted font-bold text-xs tracking-wider bg-foreground/5 border border-white/5 px-2 py-0.5 rounded-md mr-2">
                                                {act.Tipo || "Act"}
                                              </span>
                                              {act.desc_act || act_id}
                                            </label>
                                            <input
                                              type="number"
                                              min="0"
                                              max="10"
                                              step="0.1"
                                              value={val || ""}
                                              onChange={(e) => handleUpdateActNota(al_id, act_id, Number(e.target.value) || 0)}
                                              onClick={(e) => e.stopPropagation()}
                                              className="w-20 bg-background/50 border border-[var(--glass-border)] rounded px-3 py-1.5 text-foreground focus:border-blue-500 focus:outline-none font-mono text-center text-sm font-semibold"
                                            />
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>

                                {/* Right: Overrides & Official Badge */}
                                <div className="w-full lg:w-72 flex flex-col justify-between">
                                  <div>
                                    <h4 className="font-bold text-foreground mb-4">Calificación de Acta</h4>
                                    <div className="mb-4">
                                      <label className="text-xs text-muted tracking-wider mb-1.5 block font-bold">Nota Final (Manual / Calc)</label>
                                      <input
                                        type="number"
                                        min="1" max="10" step="0.1"
                                        value={nota_prev || ""}
                                        onChange={(e) => handleOverrideNotaFinal(al_id, Number(e.target.value) || 0)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-background/50 border border-[var(--glass-border)] rounded px-3 py-2 text-xl font-bold text-foreground focus:border-blue-500 focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="rounded-xl flex flex-col items-center justify-center p-5 border-2 text-center" style={{ borderColor: sigad.col, backgroundColor: `${sigad.col}11` }}>
                                    <div className="text-5xl font-black mb-2" style={{ color: sigad.col, lineHeight: 1 }}>{sigad.n}</div>
                                    <div className="text-lg font-bold" style={{ color: sigad.col }}>{sigad.cod}</div>
                                    <div className="text-xs text-muted mt-1 tracking-wider font-semibold">{sigad.txt}</div>
                                  </div>
                                </div>
                              </div>

                              {/* BLOQUE 2: Grado de consecución de los RA por alumnado */}
                              <div className="pt-6 border-t border-[var(--glass-border)] space-y-4">
                                <h3 className="font-bold text-foreground flex items-center gap-2">
                                  <span>🎯</span> Consecución de Resultados de Aprendizaje (RA)
                                </h3>
                                <div className="space-y-5">
                                  {resultados_ra.map((r, idx) => {
                                    let bar_color = "#dc3545"; // Rojo
                                    if (r.prop >= 100) bar_color = "#198754"; // Verde
                                    else if (r.prop >= 80) bar_color = "#0d6efd"; // Azul
                                    else if (r.prop >= 50) bar_color = "#ffc107"; // Amarillo

                                    return (
                                      <div key={idx} className="flex flex-col md:flex-row gap-4 items-start bg-background/30 p-4 rounded-xl border border-white/5">
                                        <div className="flex-1 w-full">
                                          <div className="mb-1.5 flex items-center gap-2">
                                            <span className="font-extrabold text-foreground">{r.id}</span>
                                            <span className="text-xs text-muted font-semibold">({r.pond.toFixed(1)}%)</span>
                                          </div>
                                          <div className="text-xs text-muted mb-3 line-clamp-1">{r.desc}</div>

                                          <div className="w-full bg-background/50 rounded-full h-4.5 border border-white/5 overflow-hidden">
                                            <div
                                              className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-black text-foreground shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                                              style={{ width: `${Math.max(r.prop, 5)}%`, backgroundColor: bar_color }}
                                            >
                                              {r.prop > 15 ? `${r.prop.toFixed(0)}%` : ''}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="w-full md:w-60 bg-foreground/5 border border-white/5 rounded-lg p-2.5 text-[10px] text-foreground/80 space-y-1 self-stretch flex flex-col justify-center">
                                          <div className="flex justify-between">
                                            <span className="text-blue-300 font-semibold">Evaluado en:</span>
                                            <span>{r.tris.join(", ") || "-"}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-yellow-200 font-semibold">UDs:</span>
                                            <span className="truncate max-w-[120px]" title={r.uds.join(", ")}>{r.uds.join(", ") || "-"}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-yellow-500 font-semibold">Prácticas:</span>
                                            <span className="truncate max-w-[120px]" title={r.prs.join(", ")}>{r.prs.join(", ") || "-"}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
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

          {/* TAB 3: GRUPAL (Componente del análisis) */}
          {activeTab === "grupal" && (
            <div className="animate-in fade-in duration-500">
              <AnalisisGrupalTab />
            </div>
          )}

          {/* TAB 4: INDIVIDUAL (Componente del análisis con simulador) */}
          {activeTab === "individual" && (
            <div className="animate-in fade-in duration-500">
              <AnalisisIndividualTab />
            </div>
          )}

          {/* TAB 5: CALIFICACIÓN FEOE (Módulo Dual) */}
          {activeTab === "feoe" && (
            <div className="animate-in fade-in duration-500">
              <CalificacionFEOETab />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
