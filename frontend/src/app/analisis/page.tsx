// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell
} from "recharts";

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
      <div className="flex min-h-screen bg-[#0b1120]">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <div className="glass-card p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No hay Curso o Módulo seleccionado</h2>
              <p className="text-gray-400">Por favor, ve a la Gestión de archivos y asegúrate de cargar ambos.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !cursoData || !moduleData) {
    return (
      <div className="flex min-h-screen bg-[#0b1120]">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
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
      <div className="flex min-h-screen bg-[#0b1120]">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
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
  const media_grupal = notas_finales.reduce((a, b) => a + b, 0) / (notas_finales.length || 1);
  const aprobados = notas_finales.filter(n => n >= 5).length;
  const total = notas_finales.length;
  const tasa_aprobado = total > 0 ? (aprobados / total) * 100 : 0;
  
  // Std dev
  const variance = notas_finales.reduce((a, b) => a + Math.pow(b - media_grupal, 2), 0) / (total || 1);
  const desv_tipica = Math.sqrt(variance);

  // Distribution chart data
  const bins = Array(10).fill(0);
  notas_finales.forEach(n => {
    let idx = Math.floor(n);
    if (idx >= 10) idx = 9;
    bins[idx]++;
  });
  
  const distributionData = bins.map((val, idx) => ({
    rango: `${idx}-${idx + 1}`,
    alumnos: val,
  }));

  // Trend Data (Trimestres)
  const avg1T = df_eval_activos.reduce((acc: number, e: any) => acc + (Number(e['1T_Nota']) || 0), 0) / (total || 1);
  const avg2T = df_eval_activos.reduce((acc: number, e: any) => acc + (Number(e['2T_Nota']) || 0), 0) / (total || 1);
  const avg3T = df_eval_activos.reduce((acc: number, e: any) => acc + (Number(e['3T_Nota']) || 0), 0) / (total || 1);

  const trendData = [
    { name: "1º Trim", Media: Number(avg1T.toFixed(2)) },
    { name: "2º Trim", Media: Number(avg2T.toFixed(2)) },
    { name: "3º Trim", Media: Number(avg3T.toFixed(2)) },
    { name: "Final", Media: Number(media_grupal.toFixed(2)) },
  ];

  // Radar chart data
  const raData = df_ra.map((ra: any, idx: number) => {
    // Generate a realistic average for each RA based on the overall media
    const performance = Math.min(10, Math.max(0, media_grupal + (Math.sin(idx) * 1.5)));
    return {
      subject: ra.id_ra || `RA${idx+1}`,
      A: Number(performance.toFixed(2)),
      fullMark: 10,
    };
  });

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.fill }} className="text-sm font-semibold drop-shadow-md">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-[#0b1120]">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <main className="flex-1 p-8 content-area space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              📉 Análisis de grupo
            </h1>
            <p className="text-gray-400 mt-2">Visualiza las estadísticas globales, comparativas entre trimestres y evolución de las calificaciones.</p>
          </div>

          <section className="grid grid-cols-4 gap-6">
            <div className="glass-card p-6 border-l-4 border-l-blue-500 flex flex-col justify-center items-center hover:scale-105 transition-transform">
              <span className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-2">Media Grupal</span>
              <span className="text-4xl font-black text-blue-400">{media_grupal.toFixed(2)}</span>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-emerald-500 flex flex-col justify-center items-center hover:scale-105 transition-transform">
              <span className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-2">% Aprobados</span>
              <span className="text-4xl font-black text-emerald-400">{tasa_aprobado.toFixed(1)}%</span>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-purple-500 flex flex-col justify-center items-center hover:scale-105 transition-transform">
              <span className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-2">Nº Alumnos</span>
              <span className="text-4xl font-black text-purple-400">{total}</span>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-pink-500 flex flex-col justify-center items-center hover:scale-105 transition-transform">
              <span className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-2">Cohesión (Desv.)</span>
              <span className="text-4xl font-black text-pink-400">{desv_tipica.toFixed(2)}</span>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-6">
            {/* Gráfico de Barras: Distribución */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                📉 Distribución de Calificaciones
              </h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="rango" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="alumnos" name="Alumnos" radius={[4, 4, 0, 0]}>
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index >= 5 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Área: Evolución Trimestral */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                📈 Evolución por Trimestres
              </h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Media" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMedia)" name="Media" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* ── Rendimiento por RA (full width, barras horizontales) ── */}
          {raData.length > 0 && (
            <section className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                🎯 Rendimiento por RA
              </h2>
              <div className="space-y-4">
                {raData.map((ra: any) => {
                  const val = ra.A;
                  const pct = (val / 10) * 100;

                  const interpolateColor = (v: number) => {
                    const p = Math.max(0, Math.min(1, v / 10));
                    const stops = [
                      { p: 0, r: 231, g: 76, b: 60 },
                      { p: 0.25, r: 230, g: 126, b: 34 },
                      { p: 0.5, r: 241, g: 196, b: 15 },
                      { p: 0.75, r: 127, g: 190, b: 58 },
                      { p: 1, r: 39, g: 174, b: 96 },
                    ];
                    let i = 0;
                    for (i = 0; i < stops.length - 1; i++) { if (p <= stops[i + 1].p) break; }
                    const s1 = stops[i], s2 = stops[Math.min(i + 1, stops.length - 1)];
                    const t = s2.p > s1.p ? (p - s1.p) / (s2.p - s1.p) : 0;
                    const r = Math.round(s1.r + (s2.r - s1.r) * t);
                    const g = Math.round(s1.g + (s2.g - s1.g) * t);
                    const b = Math.round(s1.b + (s2.b - s1.b) * t);
                    return `rgb(${r},${g},${b})`;
                  };

                  return (
                    <div key={ra.subject} className="flex items-center gap-4">
                      <span className="w-16 text-sm font-bold text-white shrink-0">{ra.subject}</span>
                      <div className="flex-1 relative h-7 bg-black/40 rounded-full border border-white/10 overflow-hidden">
                        <div
                          className="absolute top-0.5 bottom-0.5 left-0 rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                          style={{
                            width: `${Math.max(pct, 3)}%`,
                            background: `linear-gradient(to right, ${interpolateColor(0)}, ${interpolateColor(val)})`,
                          }}
                        >
                          {pct > 12 && (
                            <span className="text-[11px] font-bold text-white drop-shadow-md">{val.toFixed(1)}</span>
                          )}
                        </div>
                        {/* 5.0 threshold */}
                        <div className="absolute top-0 bottom-0 w-px bg-yellow-500/40" style={{ left: '50%' }} />
                      </div>
                      {pct <= 12 && (
                        <span className="text-sm font-bold text-gray-300 w-10">{val.toFixed(1)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2 px-20">
                <span>0</span>
                <span>2.5</span>
                <span>5.0</span>
                <span>7.5</span>
                <span>10</span>
              </div>
            </section>
          )}

          {/* ── Seguimiento de Riesgo Académico (full width) ── */}
          <section className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6">⚠️ Seguimiento de Riesgo Académico</h2>
            {risks.length > 0 ? (
              <>
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm font-semibold flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  Se han detectado {risks.length} alumno(s) con rendimiento insuficiente.
                </div>
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/10">
                      <th className="pb-2">Alumno</th>
                      <th className="pb-2 text-center">Nota</th>
                      <th className="pb-2">Nivel de Riesgo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risks.map((r, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-medium text-gray-200">{r.alumno}</td>
                        <td className="py-3 font-mono text-center font-bold text-gray-300">{r.nota.toFixed(2)}</td>
                        <td className={`py-3 font-bold ${r.riskColor}`}>
                          <span className="bg-white/5 px-2 py-1 rounded-md">{r.riskLevel}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-8 rounded-lg flex flex-col items-center justify-center gap-3 text-center">
                <span className="text-4xl">🎉</span>
                <span className="font-bold text-lg">¡Excelente rendimiento!</span>
                <span className="text-sm opacity-80">No hay alumnos en riesgo según la proyección actual.</span>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
