// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function EvaluacionPage() {
  const { activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [allEvalOpen, setAllEvalOpen] = useState(true);

  const TABS = [
    { id: "resumen", label: "📊 Resumen global", cleanLabel: "Resumen global" },
    { id: "progreso", label: "🎯 Progreso por alumnado", cleanLabel: "Progreso por alumnado" }
  ];

  const [activeTab, setActiveTab] = useState("resumen");
  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

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
  }, [activeModuleId, moduleData, activeCursoId, cursoData]);

  if (!activeModuleId || !activeCursoId) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Falta seleccionar módulo o curso</h2>
              <p className="text-muted">Por favor, ve a la sección de Datos y carga tanto una PD como un Curso.</p>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !moduleData || !cursoData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center content-area">
            <div className="text-xl text-blue-400 animate-pulse">Calculando evaluación por RA...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_al = cursoData?.df_al || [];
  const df_eval = cursoData?.df_eval || [];
  const df_ra = moduleData?.df_ra || [];
  const df_ud = moduleData?.df_ud || [];
  const df_pr = moduleData?.df_pr || [];
  const info_fechas = moduleData?.info_fechas || {};
  const planning_ledger = moduleData?.planning_ledger || {};

  if (df_al.length === 0 || df_ra.length === 0) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">Falta información</h2>
              <p className="text-muted">Asegúrate de tener alumnado matriculado y Resultados de aprendizaje definidos en su correspondiente pestaña.</p>
            </Card>
          </main>
        </div>
      </div>
    );
  }

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

  const df_evaluable = df_al.filter((al: any) => al.Estado !== "Baja");
  df_evaluable.sort((a: any, b: any) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <main className="flex-1 p-8 content-area space-y-6">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              📈 Evaluación por RA
            </h1>
            <p className="text-muted mt-2 text-lg">Control de faltas de asistencia, incidencias y notas de clase diarias.</p>
          </div>

          <div className="flex border-b border-[var(--glass-border)] mb-8 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-foreground'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "resumen" && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-5">
<span>📊</span> Resumen de Resultados de aprendizaje por trimestres
</h2>
              <div className="space-y-5">
                {Object.keys(ra_info).map(ra_id => {
                  const info = ra_info[ra_id];
                  const r_data = ra_to_tri[ra_id];
                  const tris = r_data.tris;

                  // Compute nota per student for this RA
                  const notasAlumnos: number[] = [];
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
                    notasAlumnos.push(avg);
                  });

                  const minN = notasAlumnos.length > 0 ? Math.min(...notasAlumnos) : 0;
                  const maxN = notasAlumnos.length > 0 ? Math.max(...notasAlumnos) : 0;
                  const avgN = notasAlumnos.length > 0 ? notasAlumnos.reduce((a, b) => a + b, 0) / notasAlumnos.length : 0;

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
                        {/* Range bar (min to max) with color matching scale position */}
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
                        {/* 5.0 threshold line */}
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
          )}

          {activeTab === "progreso" && (
            <>
              {/* ── Subtítulo Resultados de aprendizaje por alumnado ─ */}
              <div className="flex items-center justify-between mt-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                    🎯 Grado de consecución de los Resultados de aprendizaje por alumnado
                  </h2>
                  <p className="text-muted mt-1">Progreso individual de cada alumnado en los Resultados de aprendizaje del módulo.</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAllEvalOpen(prev => !prev);
                    document.querySelectorAll('.eval-details').forEach((el) => {
                      (el as HTMLDetailsElement).open = !allEvalOpen ? true : false;
                    });
                  }}
                >
                  <span>{allEvalOpen ? '▲' : '▼'}</span>
                  {allEvalOpen ? 'Colapsar todos' : 'Expandir todos'}
                </Button>
              </div>

              <div className="space-y-4">
                {df_evaluable.map((al: any) => {
                  const al_id = al.ID;
                  const evalData = df_eval.find((e: any) => e.ID === al_id);
                  if (!evalData) return null;

                  const notas_student: Record<string, number> = {
                    "1T": Number(evalData["1T_Nota"]) || 0.0,
                    "2T": Number(evalData["2T_Nota"]) || 0.0,
                    "3T": Number(evalData["3T_Nota"]) || 0.0,
                  };
                  const nota_final = Number(evalData["Nota_Final"]) || 0.0;

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

                    // prop calculation like python logic
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

                  const isPassed = pct_global_cumplido >= 50;
                  const isWarning = pct_global_cumplido >= 40 && pct_global_cumplido < 50;

                  return (
                    <details key={al_id} open className="eval-details group bg-foreground/5 rounded-lg border border-[var(--glass-border)] overflow-hidden open:bg-foreground/10 transition-colors">
                      <summary className="p-4 cursor-pointer flex items-center justify-between font-semibold text-lg select-none hover:bg-foreground/5">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">👤</span>
                          <span>{al.Apellidos}, {al.Nombre}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex flex-col items-end">
                            <span className="text-muted text-xs tracking-wider mb-1">Porcentaje medio en RA's</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-lg ${isPassed ? 'text-green-400' : isWarning ? 'text-yellow-400' : 'text-red-400'}`}>
                                {pct_global_cumplido.toFixed(1)}%
                              </span>
                              <span className="text-muted">/ {suma_pond_ra.toFixed(1)}%</span>
                            </div>
                          </div>
                          <span className="ml-4 group-open:rotate-180 inline-block transition-transform text-muted">▼</span>
                        </div>
                      </summary>

                      <div className="p-6 border-t border-[var(--glass-border)] bg-foreground/10 space-y-6">
                        {resultados_ra.map((r, idx) => {
                          let bar_color = "#dc3545"; // Rojo
                          if (r.prop >= 100) bar_color = "#198754"; // Verde
                          else if (r.prop >= 80) bar_color = "#0d6efd"; // Azul
                          else if (r.prop >= 50) bar_color = "#ffc107"; // Amarillo

                          return (
                            <div key={idx} className="flex gap-6 items-start">
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <span className="font-bold text-foreground/80">{r.id}</span>
                                  <span className="text-xs text-muted">({r.pond.toFixed(1)}%)</span>
                                </div>
                                <div className="text-sm text-muted mb-3">{r.desc}</div>

                                <div className="w-full bg-foreground/20 rounded-full h-4 border border-white/5 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-foreground shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                                    style={{ width: `${Math.max(r.prop, 5)}%`, backgroundColor: bar_color }}
                                  >
                                    {r.prop > 15 ? `${r.prop.toFixed(0)}%` : ''}
                                  </div>
                                </div>
                              </div>

                              <div className="w-64 bg-foreground/15 border border-white/5 rounded-lg p-3 text-xs text-foreground/80 space-y-2 self-stretch flex flex-col justify-center">
                                <div className="flex justify-between">
                                  <span className="text-blue-300 font-semibold">Evaluado en:</span>
                                  <span>{r.tris.join(", ")}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-yellow-200 font-semibold">UDs:</span>
                                  <span className="truncate ml-2" title={r.uds.join(", ")}>{r.uds.length > 0 ? r.uds.join(", ") : "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-yellow-500 font-semibold">Prácticas:</span>
                                  <span className="truncate ml-2" title={r.prs.join(", ")}>{r.prs.length > 0 ? r.prs.join(", ") : "-"}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
