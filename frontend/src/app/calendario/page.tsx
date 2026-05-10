"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function CalendarioPage() {
  const { activeModuleId, moduleData, updateModuleData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setLoading(!moduleData && !!activeModuleId);
  }, [moduleData, activeModuleId]);

  const handleSave = async () => {
    if (!activeModuleId || !moduleData) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch(`/api/module/${activeModuleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleData),
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

  if (!activeModuleId) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 content-area">
            <div className="glass-card p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No hay Módulo PD seleccionado</h2>
              <p className="text-gray-400">Ve a Gestión de Archivos y selecciona un Módulo PD.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !moduleData) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className="flex-1 flex items-center justify-center content-area">
            <div className="text-xl text-blue-400 animate-pulse">Cargando calendario...</div>
          </main>
        </div>
      </div>
    );
  }

  const info_fechas = moduleData?.info_fechas || {};
  const horario = moduleData?.horario || { Lun: 0, Mar: 0, Mié: 0, Jue: 0, Vie: 0 };
  const calendar_notes = moduleData?.calendar_notes || {};
  const info_modulo = moduleData?.info_modulo || {};

  const handleUpdateFechas = (field: string, value: string | number) => {
    updateModuleData("info_fechas", { ...info_fechas, [field]: value });
  };

  const handleUpdateHorario = (day: string, val: number) => {
    updateModuleData("horario", { ...horario, [day]: val });
  };

  const handleUpdateNote = (field: string, val: string) => {
    updateModuleData("calendar_notes", { ...calendar_notes, [field]: val });
  };

  // Helper to calculate real hours considering holidays (weekends are excluded)
  const calculateRealHours = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    try {
      const [sy, sm, sd] = startStr.split("-").map(Number);
      const [ey, em, ed] = endStr.split("-").map(Number);
      if (!sy || !ey) return 0;
      
      const start = new Date(sy, sm - 1, sd);
      const end = new Date(ey, em - 1, ed);
      let total = 0;
      let curr = new Date(start);
      
      const dayMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      
      while (curr <= end) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) { // Not Sat or Sun
          const d = String(curr.getDate()).padStart(2, '0');
          const m = String(curr.getMonth() + 1).padStart(2, '0');
          const y = curr.getFullYear();
          const f_str = `f_${d}/${m}/${y}`;
          
          if (!calendar_notes[f_str]) {
            const h = Number(horario[dayMap[curr.getDay()]]) || 0;
            total += h;
          }
        }
        curr.setDate(curr.getDate() + 1);
      }
      return total;
    } catch {
      return 0;
    }
  };

  const h1 = calculateRealHours(info_fechas.ini_1t, info_fechas.fin_1t);
  const h2 = calculateRealHours(info_fechas.ini_2t, info_fechas.fin_2t);
  const h3 = calculateRealHours(info_fechas.ini_3t, info_fechas.fin_3t);
  const h_real = h1 + h2 + h3;
  
  const h_boa = Number(info_modulo.h_boa) || 0;
  const h_sem = Number(info_modulo.h_sem) || 0;
  const p_ev = Number(info_modulo.p_ev) || 15;
  const h_p_ev = Math.round((p_ev / 100) * h_real);

  const suma_horario = Object.values(horario).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 content-area space-y-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                🗓️ Calendario Académico
              </h1>
              <p className="text-gray-400 mt-2">Fechas, trimestres, horario semanal y eventos relevantes.</p>
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

          <section className="glass-card p-6 border-t-4 border-t-blue-500">
            <h2 className="text-xl font-bold mb-4">Fechas Generales</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Inicio de Curso</label>
                <input type="date" value={info_fechas.ini_curso || ""} onChange={e => handleUpdateFechas("ini_curso", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Inicio Clases (1T)</label>
                <input type="date" value={info_fechas.ini_1t || ""} onChange={e => handleUpdateFechas("ini_1t", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Fin Clases (3T)</label>
                <input type="date" value={info_fechas.fin_3t || ""} onChange={e => handleUpdateFechas("fin_3t", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Fin de Curso</label>
                <input type="date" value={info_fechas.fin_curso || ""} onChange={e => handleUpdateFechas("fin_curso", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
          </section>

          <section className="glass-card p-6 border-t-4 border-t-purple-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Horario Semanal</h2>
              <div className="bg-black/30 px-4 py-2 rounded-lg border border-white/10 text-sm">
                Desfase con H/Semanal: <span className={`font-bold ${suma_horario === h_sem ? 'text-green-400' : 'text-yellow-400'}`}>{suma_horario - h_sem} h</span>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {["Lun", "Mar", "Mié", "Jue", "Vie"].map(day => (
                <div key={day}>
                  <label className="text-sm text-gray-400 mb-1 block text-center font-bold">{day}</label>
                  <input 
                    type="number" min="0" max="8" 
                    value={Number(horario[day]) || 0} 
                    onChange={e => handleUpdateHorario(day, Number(e.target.value))} 
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:border-purple-500 focus:outline-none text-center text-xl font-mono" 
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card p-6 border-t-4 border-t-emerald-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Trimestres</h2>
              <div className="bg-black/30 px-4 py-2 rounded-lg border border-white/10 text-sm">
                Desfase BOA / Real: <span className={`font-bold ${h_real === h_boa ? 'text-green-400' : 'text-yellow-400'}`}>{h_real - h_boa} h</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { title: "1er Trimestre", ini: "ini_1t", fin: "fin_1t", h: h1 },
                { title: "2º Trimestre", ini: "ini_2t", fin: "fin_2t", h: h2 },
                { title: "3er Trimestre", ini: "ini_3t", fin: "fin_3t", h: h3 }
              ].map(t => (
                <div key={t.title} className="bg-black/20 border border-white/10 rounded-xl p-4">
                  <h3 className="text-center font-bold mb-4">{t.title}</h3>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-xs text-gray-400">Inicio</label>
                      <input type="date" value={info_fechas[t.ini] || ""} onChange={e => handleUpdateFechas(t.ini, e.target.value)} className="w-full bg-black/40 border border-white/5 rounded p-1 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Fin</label>
                      <input type="date" value={info_fechas[t.fin] || ""} onChange={e => handleUpdateFechas(t.fin, e.target.value)} className="w-full bg-black/40 border border-white/5 rounded p-1 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="text-center bg-black/40 p-2 rounded text-emerald-400 font-mono font-bold">
                    {t.h} h reales
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 mt-6">
              <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-400">Horas BOA</div>
                <div className="text-2xl font-bold">{h_boa} h</div>
              </div>
              <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-400">Horas clases real</div>
                <div className="text-2xl font-bold text-emerald-400">{h_real} h</div>
              </div>
              <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-400">Horas P.Ev.Continua ({p_ev}%)</div>
                <div className="text-2xl font-bold text-yellow-400">{h_p_ev} h</div>
              </div>
            </div>
          </section>

          <section className="glass-card p-6 border-t-4 border-t-pink-500">
            <h2 className="text-xl font-bold mb-4">🏢 Formación en Empresa (FEOE)</h2>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Inicio FEOE</label>
                <input type="date" value={info_fechas.ini_feoe || ""} onChange={e => handleUpdateFechas("ini_feoe", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:border-pink-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Fin FEOE</label>
                <input type="date" value={info_fechas.fin_feoe || ""} onChange={e => handleUpdateFechas("fin_feoe", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:border-pink-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Horas/día FEOE</label>
                <input type="number" value={Number(info_fechas.h_sem_feoe) || 8} onChange={e => handleUpdateFechas("h_sem_feoe", Number(e.target.value))} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:border-pink-500 focus:outline-none" />
              </div>
            </div>
          </section>

          {/* This is a simplified interface for Calendar Notes. Normally a calendar grid would go here, but a simplified list is sufficient for Next.js migration for now */}
          <section className="glass-card p-6 border-t-4 border-t-yellow-500">
            <h2 className="text-xl font-bold mb-4">📌 Días festivos y eventos relevantes</h2>
            <p className="text-gray-400 mb-4 text-sm">Anota fechas especiales en el formato DD/MM/YYYY. Esto excluirá la fecha del conteo de horas reales de clase.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="p-2 w-48">Fecha (DD/MM/YYYY)</th>
                    <th className="p-2 min-w-[200px]">Motivo Festivo (f_)</th>
                    <th className="p-2 min-w-[200px]">Evento Relevante (r_)</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(calendar_notes)
                    .filter(([k, v]) => v !== "")
                    .map(([k, v]: [string, any]) => {
                      const type = k.substring(0, 2); // 'f_' or 'r_'
                      const dateStr = k.substring(2);
                      return (
                        <tr key={k} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-2 font-mono">{dateStr}</td>
                          <td className="p-2 text-red-400">{type === "f_" ? v : ""}</td>
                          <td className="p-2 text-blue-400">{type === "r_" ? v : ""}</td>
                          <td className="p-2 text-center">
                            <button onClick={() => handleUpdateNote(k, "")} className="text-red-400 hover:text-red-300 font-bold">×</button>
                          </td>
                        </tr>
                      );
                    })}
                  
                  {/* Row for adding new */}
                  <tr className="border-t border-white/20">
                    <td className="p-2" colSpan={4}>
                      <p className="text-xs text-yellow-400 italic mb-2 mt-2">
                        *Nota: En la futura versión, la selección de festivos se hará mediante un calendario visual interactivo. De momento, las notas se guardan internamente.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
