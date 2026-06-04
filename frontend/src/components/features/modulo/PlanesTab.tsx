"use client";

import { useAppStore } from "@/store/useAppStore";

export function PlanesTab() {
  const { moduleData, updateDataFrame } = useAppStore();

  const df_dua = moduleData?.df_dua || [];
  const df_contingencia = moduleData?.df_contingencia || [];
  const df_ace = moduleData?.df_ace || [];
  const df_ra = moduleData?.df_ra || [];

  const addRow = (dataFrame: any[], dfName: string, prefix: string, template: any) => {
    const newDf = [...dataFrame];
    const newId = `${prefix}${(newDf.length + 1).toString().padStart(2, '0')}`;
    newDf.push({ ID: newId, ...template });
    updateDataFrame(dfName as any, newDf);
  };

  const updateRow = (dataFrame: any[], dfName: string, idx: number, field: string, value: any) => {
    const newDf = [...dataFrame];
    newDf[idx][field] = value;
    updateDataFrame(dfName as any, newDf);
  };

  const removeRow = (dataFrame: any[], dfName: string, idx: number) => {
    const newDf = [...dataFrame];
    newDf.splice(idx, 1);
    updateDataFrame(dfName as any, newDf);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* DUA */}
      <section className="glass-card p-6 border-t-4 border-t-emerald-500">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-4">
          🧩 Plan de Atención a la diversidad
        </h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--glass-border)] text-muted">
                <th className="p-2 w-16">Id</th>
                <th className="p-2 w-48">Alumnado / Aula</th>
                <th className="p-2 w-48">Barrera detectada</th>
                <th className="p-2 min-w-[200px]">Medida metodológica</th>
                <th className="p-2 w-48">Medida de acceso</th>
                <th className="p-2 w-48">Medida de evaluación</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {df_dua.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5">
                  <td className="p-2 font-mono text-xs">{row.ID}</td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Alumnado_Aula || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Alumnado_Aula", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-emerald-500 focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Barrera || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Barrera", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-emerald-500 focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Medida_Metodologica || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Medida_Metodologica", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-emerald-500 focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Medida_Acceso || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Medida_Acceso", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-emerald-500 focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Medida_Evaluacion || ""} onChange={e => updateRow(df_dua, "df_dua", idx, "Medida_Evaluacion", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-emerald-500 focus:outline-none" />
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeRow(df_dua, "df_dua", idx)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => addRow(df_dua, "df_dua", "DUA", { Alumnado_Aula: "", Barrera: "", Medida_Metodologica: "", Medida_Acceso: "", Medida_Evaluacion: "" })} className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
          <span>+</span> Añadir Medida de Diversidad
        </button>
      </section>

      {/* Contingencia */}
      <section className="glass-card p-6 border-t-4 border-t-orange-500">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-4">
          🛡️ Plan de Contingencia
        </h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--glass-border)] text-muted">
                <th className="p-2 w-16">Id</th>
                <th className="p-2 w-48">Escenario</th>
                <th className="p-2 min-w-[200px]">Organización y acceso</th>
                <th className="p-2 min-w-[200px]">Actividades alternativas</th>
                <th className="p-2 w-48">Seguimiento y corrección</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {df_contingencia.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5">
                  <td className="p-2 font-mono text-xs">{row.ID}</td>
                  <td className="p-2 pr-2">
                    <select value={row.Escenario || "Otros"} onChange={e => updateRow(df_contingencia, "df_contingencia", idx, "Escenario", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-orange-500 focus:outline-none">
                      <option value="Ausencia de Profesorado">Ausencia de profesorado</option>
                      <option value="Ausencia de Alumnado">Ausencia de alumnado</option>
                      <option value="Interrupción Generalizada">Interrupción generalizada</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Organizacion || ""} onChange={e => updateRow(df_contingencia, "df_contingencia", idx, "Organizacion", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-orange-500 focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Actividades || ""} onChange={e => updateRow(df_contingencia, "df_contingencia", idx, "Actividades", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-orange-500 focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Seguimiento || ""} onChange={e => updateRow(df_contingencia, "df_contingencia", idx, "Seguimiento", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-orange-500 focus:outline-none" />
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeRow(df_contingencia, "df_contingencia", idx)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => addRow(df_contingencia, "df_contingencia", "PC", { Escenario: "Otros", Organizacion: "", Actividades: "", Seguimiento: "" })} className="text-sm text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1">
          <span>+</span> Añadir Medida de Contingencia
        </button>
      </section>

      {/* ace */}
      <section className="glass-card p-6 border-t-4 border-t-[#14a085]">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-4">
          🚌 Plan de Actividades complementarias
        </h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--glass-border)] text-muted">
                <th className="p-2 w-16">Id</th>
                <th className="p-2 w-32">Tipo</th>
                <th className="p-2 w-32">RA vinculados</th>
                <th className="p-2 min-w-[200px]">Descripción</th>
                <th className="p-2 w-24">Trimestre</th>
                <th className="p-2 w-48">Entidad</th>
                <th className="p-2 w-48">Evaluación</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {df_ace.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5">
                  <td className="p-2 font-mono text-xs">{row.ID}</td>
                  <td className="p-2 pr-2">
                    <select value={row.Tipo || "Complementaria"} onChange={e => updateRow(df_ace, "df_ace", idx, "Tipo", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none">
                      <option value="Complementaria">Complementaria</option>
                      <option value="Extraescolar">Extraescolar</option>
                    </select>
                  </td>
                  <td className="p-2 pr-2">
                    <select value={row.RA_Vinculados || ""} onChange={e => updateRow(df_ace, "df_ace", idx, "RA_Vinculados", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none">
                      <option value="">-</option>
                      {df_ra.map((ra: any) => ra.id_ra && <option key={ra.id_ra} value={ra.id_ra}>{ra.id_ra}</option>)}
                    </select>
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Actividad || ""} onChange={e => updateRow(df_ace, "df_ace", idx, "Actividad", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <select value={row.Trimestre || "1T"} onChange={e => updateRow(df_ace, "df_ace", idx, "Trimestre", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none">
                      <option value="1T">1t</option>
                      <option value="2T">2t</option>
                      <option value="3T">3t</option>
                    </select>
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Entidad || ""} onChange={e => updateRow(df_ace, "df_ace", idx, "Entidad", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none" />
                  </td>
                  <td className="p-2 pr-2">
                    <input type="text" value={row.Evaluacion || ""} onChange={e => updateRow(df_ace, "df_ace", idx, "Evaluacion", e.target.value)} className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:border-[#14a085] focus:outline-none" />
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeRow(df_ace, "df_ace", idx)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => addRow(df_ace, "df_ace", "ACE", { Tipo: "Complementaria", RA_Vinculados: "", Actividad: "", Trimestre: "1T", Entidad: "", Evaluacion: "" })} className="text-sm text-[#14a085] hover:text-[#1abc9c] font-semibold flex items-center gap-1">
          <span>+</span> Añadir Actividad Complementaria
        </button>
      </section>
    </div>
  );
}
