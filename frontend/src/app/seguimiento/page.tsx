// @ts-nocheck
"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function SeguimientoPage() {
  const { activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData, updateCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [allDiarioOpen, setAllDiarioOpen] = useState(true);

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
      <div className="flex min-h-screen bg-[#0b1120]">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <div className="glass-card p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Falta seleccionar módulo o curso</h2>
              <p className="text-gray-400">Por favor, ve a la Gestión de archivos y carga tanto una PD como un Curso.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !moduleData || !cursoData) {
    return (
      <div className="flex min-h-screen bg-[#0b1120]">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center content-area">
            <div className="text-xl text-[#14a085] animate-pulse">Cargando datos de seguimiento...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_sgmt = cursoData?.df_sgmt || [];
  const daily_ledger = cursoData?.daily_ledger || {};
  const planning_ledger = moduleData?.planning_ledger || {};
  const info_fechas = moduleData?.info_fechas || {};
  const horario = moduleData?.horario || {};
  const calendar_notes = moduleData?.calendar_notes || {};

  // Calcular Total Impartido por UD
  const df_sgmt_calculated = df_sgmt.map((row: any) => {
    let total_imp = 0;
    Object.keys(row).forEach(k => {
      if (k.endsWith('_Imp') && k !== 'Total_Imp') {
        total_imp += (Number(row[k]) || 0);
      }
    });
    return { ...row, Total_Imp: total_imp };
  });

  const total_previsto = moduleData?.df_ud?.reduce((sum: number, ud: any) => sum + (Number(ud.horas_ud) || 0), 0) || 0;
  const total_impartido = df_sgmt_calculated.reduce((sum: number, row: any) => sum + (row.Total_Imp || 0), 0);
  const porcentaje_progreso = total_previsto > 0 ? (total_impartido / total_previsto) * 100 : 0;

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
  
  const perc_sin_docencia = h_real_total > 0 ? (h_sin_docencia / h_real_total) * 100 : 0;

  const meses_display = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const meses_nombres = {"Sep": "Septiembre", "Oct": "Octubre", "Nov": "Noviembre", "Dic": "Diciembre", "Ene": "Enero", "Feb": "Febrero", "Mar": "Marzo", "Abr": "Abril", "May": "Mayo", "Jun": "Junio"};
  const meses_num: any = {"Sep":9, "Oct":10, "Nov":11, "Dic":12, "Ene":1, "Feb":2, "Mar":3, "Abr":4, "May":5, "Jun":6};

  const getLectivosMes = (mes_num: number) => {
    const lectivos = [];
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
    <div className="flex min-h-screen bg-[#0b1120]">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <main className="flex-1 p-8 content-area space-y-8">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              📍 Seguimiento diario
            </h1>
            <p className="text-gray-400 mt-2">Registro detallado del desarrollo diario de las clases y contingencias.</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-5 gap-6">
            <div className="glass-card p-6 flex flex-col items-center justify-center border-t-4 border-t-blue-500">
              <span className="text-sm text-gray-400 mb-1">Horas Previstas</span>
              <span className="text-3xl font-bold text-white">{total_previsto} h</span>
            </div>
            <div className="glass-card p-6 flex flex-col items-center justify-center border-t-4 border-t-[#14a085]">
              <span className="text-sm text-gray-400 mb-1">Horas Impartidas</span>
              <span className="text-3xl font-bold text-white">{total_impartido} h</span>
            </div>
            <div className="glass-card p-6 flex flex-col items-center justify-center border-t-4 border-t-purple-500">
              <span className="text-sm text-gray-400 mb-1">% Progreso</span>
              <span className="text-3xl font-bold text-white">{porcentaje_progreso.toFixed(1)}%</span>
            </div>
            <div className="glass-card p-6 flex flex-col items-center justify-center border-t-4 border-t-orange-500">
              <span className="text-sm text-gray-400 mb-1">Horas sin docencia</span>
              <span className="text-3xl font-bold text-white">{h_sin_docencia} h</span>
            </div>
            <div className="glass-card p-6 flex flex-col items-center justify-center border-t-4 border-t-yellow-500">
              <span className="text-sm text-gray-400 mb-1">% Sin docencia</span>
              <span className="text-3xl font-bold text-white">{perc_sin_docencia.toFixed(1)}%</span>
            </div>
          </div>

          {/* Data Table */}
          <section className="glass-card p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 bg-white/5">
                  <th className="p-3 sticky left-0 bg-[#111827] z-10 border-r border-white/10">UD</th>
                  <th className="p-3 sticky left-[60px] bg-[#111827] z-10 text-center">Cls. Prv</th>
                  <th className="p-3 sticky left-[130px] bg-[#111827] z-10 text-center border-r border-white/10">Cls. Imp</th>
                  {meses_display.map((m) => (
                    <th key={m} colSpan={2} className="p-2 text-center border-r border-white/10">{m}</th>
                  ))}
                </tr>
                <tr className="border-b border-white/20 text-xs text-gray-500 bg-white/5">
                  <th className="p-2 sticky left-0 bg-[#111827] z-10 border-r border-white/10"></th>
                  <th className="p-2 sticky left-[60px] bg-[#111827] z-10"></th>
                  <th className="p-2 sticky left-[130px] bg-[#111827] z-10 border-r border-white/10"></th>
                  {meses_display.map((m) => (
                    <React.Fragment key={m}>
                      <th className="p-2 text-center text-blue-400/70">Prv</th>
                      <th className="p-2 text-center text-[#14a085]/70 border-r border-white/10">Imp</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {df_sgmt_calculated.map((row: any, idx: number) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono sticky left-0 bg-[#0b1120] group-hover:bg-[#111827] border-r border-white/10 font-bold">{row.id_ud}</td>
                    <td className="p-3 text-center sticky left-[60px] bg-[#0b1120] group-hover:bg-[#111827] text-blue-400">{row.horas_ud || ''}</td>
                    <td className="p-3 text-center sticky left-[130px] bg-[#0b1120] group-hover:bg-[#111827] border-r border-white/10 text-[#14a085] font-bold">{row.Total_Imp || ''}</td>
                    {meses_display.map((m) => (
                      <React.Fragment key={m}>
                        <td className="p-3 text-center text-white/60">{Number(row[`${m}_Prv`]) || ''}</td>
                        <td className="p-3 text-center text-[#14a085] font-semibold border-r border-white/10 bg-[#14a085]/5">{Number(row[`${m}_Imp`]) || ''}</td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Seguimiento diario */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>🗓️</span> Diario de clases. Contingencias
              </h2>
              <button
                onClick={() => {
                  setAllDiarioOpen(prev => !prev);
                  document.querySelectorAll('.diario-details').forEach((el) => {
                    (el as HTMLDetailsElement).open = !allDiarioOpen ? true : false;
                  });
                }}
                className="text-sm font-semibold px-4 py-2 rounded-lg border border-white/10 bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
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
                  <details key={m_short} open className="diario-details group bg-white/5 rounded-lg border border-white/10 overflow-hidden open:bg-white/10 transition-colors">
                    <summary className="p-4 cursor-pointer flex items-center justify-between font-semibold text-lg select-none hover:bg-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-blue-400">📅</span>
                        <span>{meses_nombres[m_short as keyof typeof meses_nombres]} {lectivos[0].getFullYear()}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {lectivos.length} días lectivos <span className="ml-4 group-open:rotate-180 inline-block transition-transform">▼</span>
                      </div>
                    </summary>
                    <div className="p-4 border-t border-white/10 bg-black/20">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-gray-400 border-b border-white/10">
                            <th className="pb-2 w-24">Fecha</th>
                            <th className="pb-2 w-16">Día</th>
                            <th className="pb-2 w-32">UD Prev.</th>
                            <th className="pb-2 w-24 text-center">Sin docencia</th>
                            <th className="pb-2">Seguimiento</th>
                            <th className="pb-2 w-16 text-center">👁️ Pub.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lectivos.map((d: Date, i: number) => {
                            const dateStr = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                            const diaSemana = dias_semana_list[d.getDay() - 1];
                            const udPrev = planning_ledger[dateStr] ? planning_ledger[dateStr].join(', ') : '';
                            const ledgerEntry = daily_ledger[dateStr] || { sin_docencia: false, seguimiento: "", publico: false };

                            return (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-3 font-mono text-xs">{dateStr}</td>
                                <td className="py-3 text-gray-400">{diaSemana}</td>
                                <td className="py-3 text-blue-400">{udPrev}</td>
                                <td className="py-3 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={ledgerEntry.sin_docencia}
                                    onChange={(e) => handleLedgerChange(dateStr, 'sin_docencia', e.target.checked)}
                                    className="accent-yellow-500" 
                                  />
                                </td>
                                <td className="py-3 pr-4">
                                  <input 
                                    type="text" 
                                    value={ledgerEntry.seguimiento}
                                    onChange={(e) => handleLedgerChange(dateStr, 'seguimiento', e.target.value)}
                                    placeholder="Anotaciones de la clase..."
                                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                                  />
                                </td>
                                <td className="py-3 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={ledgerEntry.publico}
                                    onChange={(e) => handleLedgerChange(dateStr, 'publico', e.target.checked)}
                                    className="accent-green-500" 
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
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
