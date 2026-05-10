"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function AnalisisPage() {
  const { activeModuleId, moduleData, activeCursoId, cursoData } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ((activeModuleId && !moduleData) || (activeCursoId && !cursoData)) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData, activeCursoId, cursoData]);

  if (!activeCursoId || !activeModuleId) {
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
            <div className="text-xl text-blue-400 animate-pulse">Cargando analíticas...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_al = cursoData?.df_al || [];
  const df_eval = cursoData?.df_eval || [];
  const df_ra = moduleData?.df_ra || [];
  
  // Filter active students
  const activeAlumnos = df_al.filter((al: any) => al.Estado !== "Baja");
  const activeIds = activeAlumnos.map((al: any) => al.ID);
  const df_eval_activos = df_eval.filter((e: any) => activeIds.includes(e.ID));

  if (df_eval_activos.length === 0) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 content-area">
            <div className="glass-card p-8 text-center border-l-4 border-l-yellow-500">
              <h2 className="text-xl font-bold text-yellow-400 mb-2">Faltan Datos</h2>
              <p className="text-gray-300">No hay datos de evaluación para alumnos activos. Ve a Evaluación Competencial primero.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Calculate stats
  const notas_finales = df_eval_activos.map((e: any) => Number(e.Nota_Final) || 0);
  const media_grupal = notas_finales.reduce((a, b) => a + b, 0) / notas_finales.length;
  const aprobados = notas_finales.filter(n => n >= 5).length;
  const total = notas_finales.length;
  const tasa_aprobado = total > 0 ? (aprobados / total) * 100 : 0;
  
  // Std dev
  const variance = notas_finales.reduce((a, b) => a + Math.pow(b - media_grupal, 2), 0) / total;
  const desv_tipica = Math.sqrt(variance);

  // Distribution chart
  const bins = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  notas_finales.forEach(n => {
    let idx = Math.floor(n);
    if (idx >= 10) idx = 9;
    bins[idx]++;
  });
  const maxBin = Math.max(...bins, 1);

  // Risks
  const risks = df_eval_activos
    .filter((e: any) => (Number(e.Nota_Final) || 0) < 5)
    .map((e: any) => {
      const al = activeAlumnos.find((a: any) => a.ID === e.ID);
      const nota = Number(e.Nota_Final) || 0;
      let riskLevel = "🟡 Moderado";
      let riskColor = "text-yellow-400";
      if (nota < 3) { riskLevel = "🔴 Muy Alto"; riskColor = "text-red-500"; }
      else if (nota < 4) { riskLevel = "🟠 Alto"; riskColor = "text-orange-400"; }
      
      return {
        id: e.ID,
        alumno: `${al?.Apellidos || ""}, ${al?.Nombre || ""}`,
        nota,
        riskLevel,
        riskColor
      };
    })
    .sort((a, b) => a.nota - b.nota);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 content-area space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              📈 Análisis de Rendimiento Grupal
            </h1>
            <p className="text-gray-400 mt-2">Estadísticas detalladas del progreso del curso.</p>
          </div>

          <section className="grid grid-cols-4 gap-6">
            <div className="glass-card p-6 border-l-4 border-l-blue-500 flex flex-col justify-center items-center">
              <span className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-2">Media Grupal</span>
              <span className="text-4xl font-black text-blue-400">{media_grupal.toFixed(2)}</span>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-emerald-500 flex flex-col justify-center items-center">
              <span className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-2">% Aprobados</span>
              <span className="text-4xl font-black text-emerald-400">{tasa_aprobado.toFixed(1)}%</span>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-purple-500 flex flex-col justify-center items-center">
              <span className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-2">Nº Alumnos</span>
              <span className="text-4xl font-black text-purple-400">{total}</span>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-pink-500 flex flex-col justify-center items-center">
              <span className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-2">Cohesión (Desv.)</span>
              <span className="text-4xl font-black text-pink-400">{desv_tipica.toFixed(2)}</span>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6">📊 Distribución de Calificaciones</h2>
              <div className="flex h-64 items-end gap-2 pb-6 border-b border-white/10 relative">
                {bins.map((val, idx) => {
                  const height = (val / maxBin) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group">
                      <span className="text-xs text-blue-300 font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{val} al.</span>
                      <div 
                        className="w-full bg-[#14a085] rounded-t-sm transition-all duration-500 hover:bg-[#1abc9c]"
                        style={{ height: `${height}%`, minHeight: val > 0 ? '4px' : '0' }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2 absolute -bottom-6">{idx}-{idx+1}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6">⚠️ Seguimiento de Riesgo Académico</h2>
              {risks.length > 0 ? (
                <>
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm font-semibold">
                    Se han detectado {risks.length} alumno(s) con rendimiento insuficiente.
                  </div>
                  <div className="overflow-y-auto max-h-56 pr-2">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="text-gray-400 border-b border-white/10">
                          <th className="pb-2">Alumno</th>
                          <th className="pb-2 text-center">Nota Proyectada</th>
                          <th className="pb-2">Riesgo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {risks.map((r, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 font-semibold">{r.alumno}</td>
                            <td className="py-3 font-mono text-center text-red-400 font-bold">{r.nota.toFixed(2)}</td>
                            <td className={`py-3 font-bold ${r.riskColor}`}>{r.riskLevel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-6 rounded-lg text-center font-bold text-lg">
                  ¡Excelente! No hay alumnos en riesgo según la proyección actual. 🎉
                </div>
              )}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
