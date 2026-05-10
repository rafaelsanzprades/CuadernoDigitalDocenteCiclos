"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function Home() {
  const { activeModuleId, moduleData, setModuleData, updateInfoModulo } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/module/${activeModuleId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") {
          setModuleData(json.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch module data", err);
        setLoading(false);
      });
  }, [activeModuleId, setModuleData]);

  if (loading || !moduleData) {
    return (
      <div className="flex min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen items-center justify-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a085] mb-4"></div>
          <p>Conectando con el servidor local...</p>
        </main>
      </div>
    );
  }

  const data = moduleData.info_modulo || {};

  // Cálculos reactivos
  const sumaTrimestres = (data.pond_1t || 0) + (data.pond_2t || 0) + (data.pond_3t || 0);
  const sumaCriterios = (data.criterio_conocimiento || 0) + 
                        (data.criterio_procedimiento_practicas || 0) + 
                        (data.criterio_procedimiento_ejercicios || 0) + 
                        (data.criterio_tareas || 0);

  // Stats
  const numExamTeo = moduleData.df_act?.filter((a: any) => a.Tipo === "Teoria")?.length || 0;
  const numExamPrac = moduleData.df_act?.filter((a: any) => a.Tipo === "Practica")?.length || 0;
  const numInfEj = moduleData.df_act?.filter((a: any) => a.Tipo === "Informes")?.length || 0;
  const numTareas = moduleData.df_act?.filter((a: any) => a.Tipo === "Tareas")?.length || 0;

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="Módulo didáctico" />
        
        <div className="flex-1 overflow-y-auto p-8 pt-4">
          <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div>
              <h3 className="text-xl font-bold text-white mb-6">📋 Configuración del Módulo</h3>
            </div>
            
            {/* Tarjeta de Datos */}
            <div className="glass-card p-6">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span>📝</span> Datos
              </h4>
              
              <div className="grid grid-cols-5 gap-6 mb-6">
                <div className="col-span-4">
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Módulo didáctico</label>
                  <input type="text" 
                    value={data.modulo || ""} 
                    onChange={(e) => updateInfoModulo('modulo', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Curso</label>
                  <input type="text" 
                    value={data.curso || ""} 
                    onChange={(e) => updateInfoModulo('curso', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Centro educativo</label>
                  <input type="text" 
                    value={data.centro || ""} 
                    onChange={(e) => updateInfoModulo('centro', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Profesorado</label>
                  <input type="text" 
                    value={data.profesorado || data.profesor || ""} 
                    onChange={(e) => updateInfoModulo('profesorado', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Nº de trimestres</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed" disabled value="3" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Horas/semana clase</label>
                  <input type="number" 
                    value={data.h_sem || 0} 
                    onChange={(e) => updateInfoModulo('h_sem', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Horas BOA</label>
                  <input type="number" 
                    value={data.h_boa || 0} 
                    onChange={(e) => updateInfoModulo('h_boa', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">% P.Ev.Continua</label>
                  <input type="number" 
                    value={data.p_ev || 0} 
                    onChange={(e) => updateInfoModulo('p_ev', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Horas FEOE</label>
                  <input type="number" 
                    value={data.h_feoe || 0} 
                    onChange={(e) => updateInfoModulo('h_feoe', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
              </div>
            </div>

            {/* Tarjeta de % Trimestres */}
            <div className="glass-card p-6 border-l-4 border-l-[#14a085]">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2"><span>⚖️</span> % Trimestres</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${sumaTrimestres === 100 ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                  {sumaTrimestres}% {sumaTrimestres !== 100 && "(Debe sumar 100%)"}
                </span>
              </h4>
              <div className="grid grid-cols-3 gap-6">
                 <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">1er Trimestre (%)</label>
                  <input type="number" 
                    value={data.pond_1t || 0} 
                    onChange={(e) => updateInfoModulo('pond_1t', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">2º Trimestre (%)</label>
                  <input type="number" 
                    value={data.pond_2t || 0} 
                    onChange={(e) => updateInfoModulo('pond_2t', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">3er Trimestre (%)</label>
                  <input type="number" 
                    value={data.pond_3t || 0} 
                    onChange={(e) => updateInfoModulo('pond_3t', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
              </div>
            </div>

            {/* Tarjeta de % Instrumentos de evaluación */}
            <div className="glass-card p-6 border-l-4 border-l-purple-500">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2"><span>🧾</span> % Instrumentos de evaluación</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${sumaCriterios === 100 ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                  {sumaCriterios}% {sumaCriterios !== 100 && "(Debe sumar 100%)"}
                </span>
              </h4>
              <div className="grid grid-cols-4 gap-6">
                 <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Exámenes teóricos</label>
                  <input type="number" 
                    value={data.criterio_conocimiento || 0} 
                    onChange={(e) => updateInfoModulo('criterio_conocimiento', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Exámenes prácticos</label>
                  <input type="number" 
                    value={data.criterio_procedimiento_practicas || 0} 
                    onChange={(e) => updateInfoModulo('criterio_procedimiento_practicas', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Informes de ejercicios</label>
                  <input type="number" 
                    value={data.criterio_procedimiento_ejercicios || 0} 
                    onChange={(e) => updateInfoModulo('criterio_procedimiento_ejercicios', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Cuaderno de tareas</label>
                  <input type="number" 
                    value={data.criterio_tareas || 0} 
                    onChange={(e) => updateInfoModulo('criterio_tareas', Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#14a085] transition-colors" 
                  />
                </div>
              </div>
            </div>

            {/* Resumen e Instrumentos */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-white mb-6">📊 Nº Instrumentos de evaluación</h3>
              <div className="grid grid-cols-4 gap-6">
                <div className="glass-card p-6 text-center border-t-2 border-t-blue-400">
                  <div className="text-gray-400 text-sm font-semibold mb-2">Exámenes teóricos</div>
                  <div className="text-4xl font-extrabold text-white">{numExamTeo}</div>
                </div>
                <div className="glass-card p-6 text-center border-t-2 border-t-emerald-400">
                  <div className="text-gray-400 text-sm font-semibold mb-2">Exámenes prácticos</div>
                  <div className="text-4xl font-extrabold text-white">{numExamPrac}</div>
                </div>
                <div className="glass-card p-6 text-center border-t-2 border-t-orange-400">
                  <div className="text-gray-400 text-sm font-semibold mb-2">Informes de ejercicios</div>
                  <div className="text-4xl font-extrabold text-white">{numInfEj}</div>
                </div>
                <div className="glass-card p-6 text-center border-t-2 border-t-purple-400">
                  <div className="text-gray-400 text-sm font-semibold mb-2">Cuaderno de tareas</div>
                  <div className="text-4xl font-extrabold text-white">{numTareas}</div>
                </div>
              </div>
            </div>

            {/* Resultados de Aprendizaje */}
            <div className="mt-12 mb-8">
              <h3 className="text-xl font-bold text-white mb-6">🎯 Relación entre Resultados de Aprendizaje y Unidades Didácticas</h3>
              
              {moduleData.df_ra && moduleData.df_ra.length > 0 ? (
                <div className="glass-card p-6 space-y-6">
                  {moduleData.df_ra.map((ra: any, idx: number) => {
                    const uds = moduleData.df_ud?.filter((ud: any) => ud[ra.id_ra] > 0) || [];
                    return (
                      <div key={idx} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                        <div className="text-lg text-white mb-3">
                          <strong>{ra.id_ra} ({ra.peso_ra}%).</strong> <span className="text-gray-400 text-sm">{ra.desc_ra}</span>
                        </div>
                        {uds.length > 0 ? (
                          <div className="ml-6 pl-4 border-l-2 border-[#d4af37] text-[#ffe599]">
                            {uds.map((ud: any, uIdx: number) => (
                              <div key={uIdx} className="mb-1">
                                {ud.id_ud} ({ud.horas_ud || ud.Horas || 0}h) - {ud[ra.id_ra]}%
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="ml-6 pl-4 border-l-2 border-gray-600 text-gray-500 italic">
                            Sin UDs asignadas
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="glass-card p-6 text-center text-gray-400">
                  No hay Resultados de Aprendizaje definidos.
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
