// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function EvaluacionPage() {
  const { activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);

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
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 content-area">
            <div className="glass-card p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Falta seleccionar módulo o curso</h2>
              <p className="text-gray-400">Por favor, ve a la Gestión de Archivos y carga tanto una PD como un Curso.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !moduleData || !cursoData) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 flex items-center justify-center content-area">
            <div className="text-xl text-blue-400 animate-pulse">Calculando evaluación continua...</div>
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
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 content-area">
            <div className="glass-card p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">Falta información</h2>
              <p className="text-gray-400">Asegúrate de tener alumnado matriculado y Resultados de Aprendizaje definidos en su correspondiente pestaña.</p>
            </div>
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 content-area space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              🎓 Evaluación Continua <span className="text-blue-400">por Alumnado</span>
            </h1>
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
                <details key={al_id} className="group bg-white/5 rounded-lg border border-white/10 overflow-hidden open:bg-white/10 transition-colors">
                  <summary className="p-4 cursor-pointer flex items-center justify-between font-semibold text-lg select-none hover:bg-white/5">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">👤</span>
                      <span>{al.Apellidos}, {al.Nombre}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex flex-col items-end">
                        <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Resultado Global</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${isPassed ? 'text-green-400' : isWarning ? 'text-yellow-400' : 'text-red-400'}`}>
                            {pct_global_cumplido.toFixed(1)}%
                          </span>
                          <span className="text-gray-500">/ {suma_pond_ra.toFixed(1)}%</span>
                        </div>
                      </div>
                      <span className="ml-4 group-open:rotate-180 inline-block transition-transform text-gray-500">▼</span>
                    </div>
                  </summary>
                  
                  <div className="p-6 border-t border-white/10 bg-black/20 space-y-6">
                    {resultados_ra.map((r, idx) => {
                      let bar_color = "#dc3545"; // Rojo
                      if (r.prop >= 100) bar_color = "#198754"; // Verde
                      else if (r.prop >= 80) bar_color = "#0d6efd"; // Azul
                      else if (r.prop >= 50) bar_color = "#ffc107"; // Amarillo

                      return (
                        <div key={idx} className="flex gap-6 items-start">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="font-bold text-gray-300">{r.id}</span>
                              <span className="text-xs text-gray-500">({r.pond.toFixed(1)}%)</span>
                            </div>
                            <div className="text-sm text-gray-400 mb-3">{r.desc}</div>
                            
                            <div className="w-full bg-black/40 rounded-full h-4 border border-white/5 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]" 
                                style={{ width: `${Math.max(r.prop, 5)}%`, backgroundColor: bar_color }}
                              >
                                {r.prop > 15 ? `${r.prop.toFixed(0)}%` : ''}
                              </div>
                            </div>
                          </div>
                          
                          <div className="w-64 bg-black/30 border border-white/5 rounded-lg p-3 text-xs text-gray-300 space-y-2 self-stretch flex flex-col justify-center">
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

        </main>
      </div>
    </div>
  );
}
