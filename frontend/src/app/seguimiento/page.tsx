"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { AsistenciaTab } from "@/components/features/seguimiento/AsistenciaTab";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function SeguimientoPage() {
  const { activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [allDiarioOpen, setAllDiarioOpen] = useState(false);

  const TABS = [
    { id: "diario", label: "📝 Diario de aula", cleanLabel: "Diario de aula" },
    { id: "asistencia", label: "🙋‍♂️ Control de asistencia", cleanLabel: "Control de asistencia" }
  ];

  const [activeTab, setActiveTab] = useState("diario");
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
            <div className="glass-card p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Falta seleccionar módulo o curso</h2>
              <p className="text-muted">Por favor, ve a la sección de Datos y carga tanto una PD como un Curso.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !moduleData || !cursoData) {
    return <LoadingSpinner text="Cargando datos de seguimiento..." />;
  }

  const df_sgmt = cursoData?.df_sgmt || [];
  const daily_ledger = cursoData?.daily_ledger || {};
  const planning_ledger = moduleData?.planning_ledger || {};
  const info_fechas = moduleData?.info_fechas || {};
  const horario = moduleData?.horario || {};
  const calendar_notes = moduleData?.calendar_notes || {};

  // Calculo de horas sin docencia
  let h_real_total = 0;
  let h_sin_docencia = 0;
  const dias_semana_list = ["Lun", "Mar", "Mié", "Jue", "Vie"];

  const processTrimestre = (ini_str: string, fin_str: string) => {
    if (!ini_str || !fin_str) return;
    const ini = new Date(ini_str);
    const fin = new Date(fin_str);
    let curr = new Date(ini);

    while (curr <= fin) {
      if (curr.getDay() >= 1 && curr.getDay() <= 5) {
        const diaSemana = dias_semana_list[curr.getDay() - 1];
        const dateStr = curr.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

        if (!calendar_notes[`f_${dateStr}`]) {
          const h_dia = Number(horario[diaSemana]) || 0;
          h_real_total += h_dia;
          if (daily_ledger[dateStr]?.sin_docencia) {
            h_sin_docencia += h_dia;
          }
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  };

  processTrimestre(info_fechas.ini_1t, info_fechas.fin_1t);
  processTrimestre(info_fechas.ini_2t, info_fechas.fin_2t);
  processTrimestre(info_fechas.ini_3t, info_fechas.fin_3t);

  const meses_display = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const meses_nombres = { "Sep": "Septiembre", "Oct": "Octubre", "Nov": "Noviembre", "Dic": "Diciembre", "Ene": "Enero", "Feb": "Febrero", "Mar": "Marzo", "Abr": "Abril", "May": "Mayo", "Jun": "Junio" };
  const meses_num: any = { "Sep": 9, "Oct": 10, "Nov": 11, "Dic": 12, "Ene": 1, "Feb": 2, "Mar": 3, "Abr": 4, "May": 5, "Jun": 6 };

  const getLectivosMes = (mes_num: number) => {
    const lectivos: Date[] = [];
    const checkFechas = (ini_str: string, fin_str: string) => {
      if (!ini_str || !fin_str) return;
      const ini = new Date(ini_str);
      const fin = new Date(fin_str);
      let curr = new Date(ini);
      while (curr <= fin) {
        if (curr.getMonth() + 1 === mes_num && curr.getDay() >= 1 && curr.getDay() <= 5) {
          const diaSemana = dias_semana_list[curr.getDay() - 1];
          const dateStr = curr.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
          if (!calendar_notes[`f_${dateStr}`] && (Number(horario[diaSemana]) || 0) > 0) {
            lectivos.push(new Date(curr));
          }
        }
        curr.setDate(curr.getDate() + 1);
      }
    };
    checkFechas(info_fechas.ini_1t, info_fechas.fin_1t);
    checkFechas(info_fechas.ini_2t, info_fechas.fin_2t);
    checkFechas(info_fechas.ini_3t, info_fechas.fin_3t);
    return lectivos;
  };

  const handleLedgerChange = (dateStr: string, field: string, value: any) => {
    const newLedger = { ...daily_ledger };
    if (!newLedger[dateStr]) {
      newLedger[dateStr] = { sin_docencia: false, seguimiento: "", publico: false };
    }
    newLedger[dateStr][field] = value;
    updateCursoData("daily_ledger", newLedger);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <main className="flex-1 p-8 content-area space-y-8">
          <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
              📍 Seguimiento diario
            </h1>
            <p className="text-muted mt-2 text-lg">Registro detallado del desarrollo diario de las clases y contingencias.</p>
          </div>

          <div className="flex border-b border-[var(--glass-border)] overflow-x-auto scrollbar-hide">
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

          {activeTab === "diario" && (
            <section>
              {/* Seguimiento diario */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
<span>🗓️</span> Diario de clases. Contingencias
</h2>
                <button
                  onClick={() => {
                    setAllDiarioOpen(prev => !prev);
                    document.querySelectorAll('.diario-details').forEach((el) => {
                      (el as HTMLDetailsElement).open = !allDiarioOpen ? true : false;
                    });
                  }}
                  className="text-sm font-semibold px-4 py-2 rounded-lg border border-[var(--glass-border)] bg-foreground/15 text-foreground/80 hover:bg-foreground/10 hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <span>{allDiarioOpen ? '▲' : '▼'}</span>
                  {allDiarioOpen ? 'Colapsar todos' : 'Expandir todos'}
                </button>
              </div>
              <div className="space-y-4">
                {meses_display.map((m_short) => {
                  const lectivos = getLectivosMes(meses_num[m_short]);
                  if (lectivos.length === 0) return null;

                  return (
                    <details key={m_short} open className="diario-details group bg-foreground/5 rounded-lg border border-[var(--glass-border)] overflow-hidden open:bg-foreground/10 transition-colors">
                      <summary className="p-4 cursor-pointer flex items-center justify-between font-semibold text-lg select-none hover:bg-foreground/5">
                        <div className="flex items-center gap-3">
                          <span className="text-blue-400">📅</span>
                          <span>{meses_nombres[m_short as keyof typeof meses_nombres]} {lectivos[0].getFullYear()}</span>
                        </div>
                        <div className="text-sm text-muted">
                          {lectivos.length} días lectivos <span className="ml-4 group-open:rotate-180 inline-block transition-transform">▼</span>
                        </div>
                      </summary>
                      <div className="p-6 border-t border-[var(--glass-border)] bg-foreground/10">
                        <div className="relative border-l-2 border-[var(--glass-border)] ml-4 space-y-8 pb-4">
                          {lectivos.map((d: Date, i: number) => {
                            const dateStr = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                            const diaSemana = dias_semana_list[d.getDay() - 1];
                            const udPrev = planning_ledger[dateStr] ? planning_ledger[dateStr].join(', ') : '';
                            const ledgerEntry = daily_ledger[dateStr] || { sin_docencia: false, seguimiento: "", publico: false };
                            
                            const nodeColor = ledgerEntry.sin_docencia ? 'bg-orange-500' : (ledgerEntry.seguimiento ? 'bg-blue-500' : 'bg-gray-600');

                            return (
                              <div key={i} className="relative pl-8 group">
                                {/* Timeline Node */}
                                <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-4 border-black ${nodeColor} shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors duration-300 group-hover:scale-125 z-10`} />
                                
                                <div className="bg-foreground/5 border border-[var(--glass-border)] rounded-xl p-4 hover:bg-foreground/10 transition-all duration-300 shadow-sm">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono text-lg font-bold text-foreground tracking-widest">{dateStr.substring(0,5)}</span>
                                      <span className="text-xs font-bold text-muted uppercase tracking-wider bg-foreground/5 px-2 py-1 rounded">{diaSemana}</span>
                                      {udPrev && <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-xs font-bold shadow-sm">UD: {udPrev}</span>}
                                    </div>
                                    <div className="flex items-center gap-5">
                                      <label className="flex items-center gap-2 text-xs font-bold text-muted cursor-pointer hover:text-orange-400 transition-colors uppercase tracking-wider">
                                        <input
                                          type="checkbox"
                                          checked={ledgerEntry.sin_docencia}
                                          onChange={(e) => handleLedgerChange(dateStr, 'sin_docencia', e.target.checked)}
                                          className="w-4 h-4 accent-orange-500 rounded bg-foreground/25 border-[var(--glass-border)] cursor-pointer"
                                        />
                                        Sin Docencia
                                      </label>
                                      <label className="flex items-center gap-2 text-xs font-bold text-muted cursor-pointer hover:text-green-400 transition-colors uppercase tracking-wider">
                                        <input
                                          type="checkbox"
                                          checked={ledgerEntry.publico}
                                          onChange={(e) => handleLedgerChange(dateStr, 'publico', e.target.checked)}
                                          className="w-4 h-4 accent-green-500 rounded bg-foreground/25 border-[var(--glass-border)] cursor-pointer"
                                        />
                                        Público
                                      </label>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <span className="text-xl mt-2 opacity-50 select-none">📝</span>
                                    <textarea
                                      value={ledgerEntry.seguimiento}
                                      onChange={(e) => handleLedgerChange(dateStr, 'seguimiento', e.target.value)}
                                      placeholder="Escribe aquí el seguimiento de la clase, incidencias o progreso real..."
                                      className="w-full bg-foreground/20 border border-white/5 hover:border-[var(--glass-border)] rounded-lg px-4 py-3 text-foreground focus:border-blue-500 focus:bg-black/60 focus:outline-none transition-all resize-none overflow-hidden min-h-[60px] text-sm"
                                      rows={1}
                                      onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = target.scrollHeight + 'px';
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === "asistencia" && (
            <AsistenciaTab />
          )}

        </main>
      </div>
    </div>
  );
}
