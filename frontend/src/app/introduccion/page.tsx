"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function IntroduccionPage() {
  const { activeModuleId, moduleData, updateModuleData, updateDataFrame } = useAppStore();
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
            <div className="text-xl text-[#14a085] animate-pulse">Cargando datos...</div>
          </main>
        </div>
      </div>
    );
  }

  const config_contexto = moduleData?.config_contexto || {};
  const config_aula = moduleData?.config_aula || {};
  const df_dua = moduleData?.df_dua || [];
  const df_contingencia = moduleData?.df_contingencia || [];
  const df_ace = moduleData?.df_ace || [];
  const df_ra = moduleData?.df_ra || [];

  const handleContextoChange = (field: string, value: string) => {
    updateModuleData("config_contexto", { ...config_contexto, [field]: value });
  };

  const handleAulaChange = (field: string, value: string) => {
    updateModuleData("config_aula", { ...config_aula, [field]: value });
  };

  const addRow = (dataFrame: any[], dfName: string, prefix: string, template: any) => {
    const newDf = [...dataFrame];
    const newId = `${prefix}${(newDf.length + 1).toString().padStart(2, '0')}`;
    newDf.push({ ID: newId, ...template });
    updateDataFrame(dfName, newDf);
  };

  const updateRow = (dataFrame: any[], dfName: string, idx: number, field: string, value: any) => {
    const newDf = [...dataFrame];
    newDf[idx][field] = value;
    updateDataFrame(dfName, newDf);
  };

  const removeRow = (dataFrame: any[], dfName: string, idx: number) => {
    const newDf = [...dataFrame];
    newDf.splice(idx, 1);
    updateDataFrame(dfName, newDf);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 content-area space-y-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                📝 Introducción y Planes
              </h1>
              <p className="text-gray-400 mt-2">Configuración del contexto escolar, planes de inclusión y actividades complementarias.</p>
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

          <section className="grid grid-cols-2 gap-6">
            <div className="glass-card p-6 border-t-4 border-t-indigo-500">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🏫 Contexto Escolar</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Instalaciones</label>
                  <textarea 
                    value={config_contexto.instalaciones || ""} 
                    onChange={e => handleContextoChange("instalaciones", e.target.value)}
                    className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Horario lectivo</label>
                  <textarea 
                    value={config_contexto.horario_lectivo || ""} 
                    onChange={e => handleContextoChange("horario_lectivo", e.target.value)}
                    className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Equipo docente</label>
                  <textarea 
                    value={config_contexto.equipo_docente || ""} 
                    onChange={e => handleContextoChange("equipo_docente", e.target.value)}
                    className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Entorno socioeconómico</label>
                  <textarea 
                    value={config_contexto.entorno_socioeconomico || ""} 
                    onChange={e => handleContextoChange("entorno_socioeconomico", e.target.value)}
                    className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-6 border-t-4 border-t-purple-500">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">👦🏻 Alumnado (ACNEAE)</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Inclusión</label>
                    <textarea 
                      value={config_contexto.inclusion || ""} 
                      onChange={e => handleContextoChange("inclusion", e.target.value)}
                      className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Elenco de situaciones</label>
                    <textarea 
                      value={config_contexto.elenco_situaciones || ""} 
                      onChange={e => handleContextoChange("elenco_situaciones", e.target.value)}
                      className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Circunstancias ocultas</label>
                    <textarea 
                      value={config_contexto.circunstancias_ocultas || ""} 
                      onChange={e => handleContextoChange("circunstancias_ocultas", e.target.value)}
                      className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 border-t-4 border-t-pink-500">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">⚙️ Configuración del Aula</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Estrategias metodológicas / espacios</label>
                    <textarea 
                      value={config_contexto.metodologia || ""} 
                      onChange={e => handleContextoChange("metodologia", e.target.value)}
                      className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Metodología general (ej. ABP)</label>
                    <textarea 
                      value={config_aula.Metodología || ""} 
                      onChange={e => handleAulaChange("Metodología", e.target.value)}
                      className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Atención a la diversidad (A. no significativas)</label>
                    <textarea 
                      value={config_aula["Atención a la diversidad"] || ""} 
                      onChange={e => handleAulaChange("Atención a la diversidad", e.target.value)}
                      className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* DUA */}
          <section className="glass-card p-6 border-t-4 border-t-emerald-500">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">🧩 Plan de Atención a la Diversidad</h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="p-2 w-16">ID</th>
                    <th className="p-2 w-48">Alumnado / Aula</th>
                    <th className="p-2 w-48">Barrera Detectada</th>
                    <th className="p-2 min-w-[200px]">Medida Metodológica / Org.</th>
                    <th className="p-2 w-48">Medida de Acceso</th>
                    <th className="p-2 w-48">Medida de Evaluación</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {df_dua.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-2 font-mono text-xs">{row.ID}</td>
                      <td className="p-2 pr-2">
                        <input type="text" value={row.Alumnado_Aula || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Alumnado_Aula", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-emerald-500 focus:outline-none" />
                      </td>
                      <td className="p-2 pr-2">
                        <input type="text" value={row.Barrera || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Barrera", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-emerald-500 focus:outline-none" />
                      </td>
                      <td className="p-2 pr-2">
                        <input type="text" value={row.Medida_Metodologica || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Medida_Metodologica", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-emerald-500 focus:outline-none" />
                      </td>
                      <td className="p-2 pr-2">
                        <input type="text" value={row.Medida_Acceso || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Medida_Acceso", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-emerald-500 focus:outline-none" />
                      </td>
                      <td className="p-2 pr-2">
                        <input type="text" value={row.Medida_Evaluacion || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Medida_Evaluacion", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-emerald-500 focus:outline-none" />
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => removeRow(df_dua, "df_dua", idx)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => addRow(df_dua, "df_dua", "DUA", { Alumnado_Aula:"", Barrera:"", Medida_Metodologica:"", Medida_Acceso:"", Medida_Evaluacion:"" })} className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              <span>+</span> Añadir Medida de Diversidad
            </button>
          </section>

          {/* Contingencia */}
          <section className="glass-card p-6 border-t-4 border-t-orange-500">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">🛡️ Plan de Contingencia</h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="p-2 w-16">ID</th>
                    <th className="p-2 w-48">Escenario</th>
                    <th className="p-2 min-w-[200px]">Organización y Acceso</th>
                    <th className="p-2 min-w-[200px]">Actividades Alternativas</th>
                    <th className="p-2 w-48">Seguimiento y Ajustes</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {df_contingencia.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-2 font-mono text-xs">{row.ID}</td>
                      <td className="p-2 pr-2">
                        <select value={row.Escenario || "Otros"} onChange={e => updateRow(df_contingencia, "df_contingencia", idx, "Escenario", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-orange-500 focus:outline-none">
                          <option value="Ausencia de Profesorado">Ausencia de Profesorado</option>
                          <option value="Ausencia de Alumnado">Ausencia de Alumnado</option>
                          <option value="Interrupción Generalizada">Interrupción Generalizada</option>
                          <option value="Otros">Otros</option>
                        </select>
                      </td>
                      <td className="p-2 pr-2">
                        <input type="text" value={row.Organizacion || ""} onChange={e => updateRow(df_contingencia, "df_contingencia", idx, "Organizacion", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-orange-500 focus:outline-none" />
                      </td>
                      <td className="p-2 pr-2">
                        <input type="text" value={row.Actividades || ""} onChange={e => updateRow(df_contingencia, "df_contingencia", idx, "Actividades", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-orange-500 focus:outline-none" />
                      </td>
                      <td className="p-2 pr-2">
                        <input type="text" value={row.Seguimiento || ""} onChange={e => updateRow(df_contingencia, "df_contingencia", idx, "Seguimiento", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-orange-500 focus:outline-none" />
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => removeRow(df_contingencia, "df_contingencia", idx)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => addRow(df_contingencia, "df_contingencia", "PC", { Escenario:"Otros", Organizacion:"", Actividades:"", Seguimiento:"" })} className="text-sm text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1">
              <span>+</span> Añadir Medida de Contingencia
            </button>
          </section>

          {/* ACE */}
          <section className="glass-card p-6 border-t-4 border-t-[#14a085]">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">🚌 Plan de Actividades Complementarias (ACE)</h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="p-2 w-16">ID</th>
                    <th className="p-2 w-32">Tipo</th>
                    <th className="p-2 w-32">RA Vinculados</th>
                    <th className="p-2 min-w-[200px]">Descripción</th>
                    <th className="p-2 w-24">Trimestre</th>
                    <th className="p-2 w-48">Entidad</th>
                    <th className="p-2 w-48">Evaluación</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {df_ace.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-2 font-mono text-xs">{row.ID}</td>
                      <td className="p-2 pr-2">
                        <select value={row.Tipo || "Complementaria"} onChange={e => updateRow(df_ace, "df_ace", idx, "Tipo", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-[#14a085] focus:outline-none">
                          <option value="Complementaria">Complementaria</option>
                          <option value="Extraescolar">Extraescolar</option>
                        </select>
                      </td>
                      <td className="p-2 pr-2">
                        <select value={row.RA_Vinculados || ""} onChange={e => updateRow(df_ace, "df_ace", idx, "RA_Vinculados", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-[#14a085] focus:outline-none">
                          <option value="">-</option>
                          {df_ra.map((ra: any) => ra.id_ra && <option key={ra.id_ra} value={ra.id_ra}>{ra.id_ra}</option>)}
                        </select>
                      </td>
                      <td className="p-2 pr-2">
                        <input type="text" value={row.Actividad || ""} onChange={e => updateRow(df_ace, "df_ace", idx, "Actividad", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-[#14a085] focus:outline-none" />
                      </td>
                      <td className="p-2 pr-2">
                        <select value={row.Trimestre || "1T"} onChange={e => updateRow(df_ace, "df_ace", idx, "Trimestre", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-[#14a085] focus:outline-none">
                          <option value="1T">1T</option>
                          <option value="2T">2T</option>
                          <option value="3T">3T</option>
                        </select>
                      </td>
                      <td className="p-2 pr-2">
                        <input type="text" value={row.Entidad || ""} onChange={e => updateRow(df_ace, "df_ace", idx, "Entidad", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-[#14a085] focus:outline-none" />
                      </td>
                      <td className="p-2 pr-2">
                        <input type="text" value={row.Evaluacion || ""} onChange={e => updateRow(df_ace, "df_ace", idx, "Evaluacion", e.target.value)} className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 focus:border-[#14a085] focus:outline-none" />
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => removeRow(df_ace, "df_ace", idx)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => addRow(df_ace, "df_ace", "ACE", { Tipo:"Complementaria", RA_Vinculados:"", Actividad:"", Trimestre:"1T", Entidad:"", Evaluacion:"" })} className="text-sm text-[#14a085] hover:text-[#1abc9c] font-semibold flex items-center gap-1">
              <span>+</span> Añadir Actividad Complementaria
            </button>
          </section>

        </main>
      </div>
    </div>
  );
}
