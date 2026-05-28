// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";

export default function CalificacionFEOEPage() {
  const { activeModuleId, moduleData, setModuleData, activeCursoId, cursoData, setCursoData, updateCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

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
  }, [activeModuleId, moduleData, activeCursoId, cursoData, setModuleData, setCursoData]);

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
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No hay Curso o Módulo seleccionado</h2>
              <p className="text-muted">Por favor, ve a la sección de Datos y asegúrate de cargar ambos.</p>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !cursoData || !moduleData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center content-area">
            <div className="text-xl text-blue-400 animate-pulse">Cargando datos de FEOE...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_al = cursoData?.df_al || [];
  const df_ra = moduleData?.df_ra || [];
  const df_feoe = cursoData?.df_feoe || [];

  const ras_dualizados = df_ra.filter((ra: any) => ra.is_dual === true || ra.is_dual === "true").map((ra: any) => ra.id_ra);
  const df_evaluable = df_al.filter((al: any) => al.Estado !== "Baja");
  df_evaluable.sort((a: any, b: any) => String(a.Apellidos || "").localeCompare(String(b.Apellidos || "")));

  const handleUpdateFEOE = (al_id: string, ra_id: string, val: number) => {
    const newFEOE = [...df_feoe];
    let rowIdx = newFEOE.findIndex((f: any) => f.ID === al_id);
    if (rowIdx === -1) {
      newFEOE.push({ ID: al_id });
      rowIdx = newFEOE.length - 1;
    }
    newFEOE[rowIdx][ra_id] = val;
    updateCursoData("df_feoe", newFEOE);
  };

  const handleUpdateFEOEColumn = (ra_id: string, val: number) => {
    const newFEOE = [...df_feoe];
    df_evaluable.forEach((al: any) => {
      let rowIdx = newFEOE.findIndex((f: any) => f.ID === al.ID);
      if (rowIdx === -1) {
        newFEOE.push({ ID: al.ID });
        rowIdx = newFEOE.length - 1;
      }
      newFEOE[rowIdx][ra_id] = val;
    });
    updateCursoData("df_feoe", newFEOE);
  };

  const handleUpdateFEOERow = (al_id: string, val: number) => {
    const newFEOE = [...df_feoe];
    let rowIdx = newFEOE.findIndex((f: any) => f.ID === al_id);
    if (rowIdx === -1) {
      newFEOE.push({ ID: al_id });
      rowIdx = newFEOE.length - 1;
    }
    ras_dualizados.forEach((ra: string) => {
      newFEOE[rowIdx][ra] = val;
    });
    updateCursoData("df_feoe", newFEOE);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <main className="flex-1 p-8 content-area space-y-8">
          <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              🏢 Calificación FEOE
            </h1>
            <p className="text-muted mt-2 text-lg">Seguimiento y evaluación del periodo de Formación en Empresa u Organismo Equiparado (FEOE).</p>
          </div>

          {ras_dualizados.length === 0 ? (
            <Card className="p-6 border-l-4 border-l-yellow-500">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">No hay RAs Dualizados</h3>
              <p className="text-foreground/80">Ve a la pestaña Módulo didáctico y marca al menos un RA como 'Dualizado' (FEOE).</p>
            </Card>
          ) : df_evaluable.length === 0 ? (
            <Card className="p-6 border-l-4 border-l-yellow-500">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">No hay alumnado</h3>
              <p className="text-foreground/80">Asegúrate de añadir alumnos en la Gestión de Matrícula.</p>
            </Card>
          ) : (
            <Card className="p-6 border-t-4 border-t-purple-500">


              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)] text-muted bg-[#0b1120]">
                      <th className="p-3 sticky left-0 z-50 border-r border-[var(--glass-border)] !bg-[#0b1120] w-16 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">ID</th>
                      <th className="p-3 sticky left-[64px] z-50 border-r border-[var(--glass-border)] !bg-[#0b1120] min-w-[250px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Alumnado</th>
                      {ras_dualizados.map((ra: string) => (
                        <th key={ra} className="p-3 text-center border-r border-[var(--glass-border)] min-w-[120px] align-top">
                          <div className="font-bold text-purple-400">{ra}</div>
                          <div className="text-[10px] text-muted mb-2">(1-4)</div>
                          <select
                            onChange={(e) => {
                              if (e.target.value !== "") {
                                handleUpdateFEOEColumn(ra, Number(e.target.value));
                                e.target.value = "";
                              }
                            }}
                            className="w-[110px] mx-auto block bg-foreground/15 text-muted font-bold border border-[var(--glass-border)] rounded px-2 py-1 text-xs focus:border-purple-500 focus:outline-none cursor-pointer transition-colors hover:bg-foreground/20"
                            defaultValue=""
                            title={`Valorar todos los alumnos para ${ra}`}
                          >
                            <option value="" disabled className="bg-background text-muted font-bold">Todos ↓</option>
                            <option value="0" className="bg-background text-muted">0 - Sin evaluar</option>
                            <option value="1" className="bg-background text-red-500">1 - No Superado</option>
                            <option value="2" className="bg-background text-orange-500">2 - Superado</option>
                            <option value="3" className="bg-background text-yellow-500">3 - Bien</option>
                            <option value="4" className="bg-background text-green-500">4 - Excelente</option>
                          </select>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {df_evaluable.map((al: any) => {
                      const al_id = al.ID;
                      const fRow = df_feoe.find((f: any) => f.ID === al_id) || {};

                      return (
                        <tr key={al_id} className="group border-b border-white/5 hover:bg-foreground/5 relative z-0">
                          <td className="p-3 font-mono text-xs sticky left-0 z-40 border-r border-[var(--glass-border)] !bg-[#0b1120] group-hover:!bg-[#111827] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                            {al_id}
                          </td>
                          <td className="p-3 font-semibold sticky left-[64px] z-40 border-r border-[var(--glass-border)] !bg-[#0b1120] group-hover:!bg-[#111827] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                            <div className="flex items-center justify-between gap-4">
                              <span>{al.Apellidos}, {al.Nombre}</span>
                              <select
                                onChange={(e) => {
                                  if (e.target.value !== "") {
                                    handleUpdateFEOERow(al_id, Number(e.target.value));
                                    e.target.value = "";
                                  }
                                }}
                                className="w-[100px] bg-foreground/15 text-muted font-bold border border-[var(--glass-border)] rounded px-2 py-1 text-xs focus:border-purple-500 focus:outline-none cursor-pointer transition-colors hover:bg-foreground/20"
                                defaultValue=""
                                title="Valorar todos los RA de este alumno"
                              >
                                <option value="" disabled className="bg-background text-muted font-bold">Todos →</option>
                                <option value="0" className="bg-background text-muted">0 - Sin</option>
                                <option value="1" className="bg-background text-red-500">1 - No Sup.</option>
                                <option value="2" className="bg-background text-orange-500">2 - Sup.</option>
                                <option value="3" className="bg-background text-yellow-500">3 - Bien</option>
                                <option value="4" className="bg-background text-green-500">4 - Exc.</option>
                              </select>
                            </div>
                          </td>
                          {ras_dualizados.map((ra: string) => {
                            const val = Number(fRow[ra]) || 0;
                            return (
                              <td key={ra} className="p-3 border-r border-[var(--glass-border)] text-center">
                                <select
                                  value={val}
                                  onChange={(e) => handleUpdateFEOE(al_id, ra, Number(e.target.value) || 0)}
                                  className={`w-[160px] border border-[var(--glass-border)] rounded px-2 py-1 text-sm font-bold focus:border-purple-500 focus:outline-none cursor-pointer transition-colors ${
                                    val === 1 ? 'bg-red-500/10 text-red-500' :
                                    val === 2 ? 'bg-orange-500/10 text-orange-500' :
                                    val === 3 ? 'bg-yellow-500/10 text-yellow-500' :
                                    val === 4 ? 'bg-green-500/10 text-green-500' :
                                    'bg-foreground/15 text-muted'
                                  }`}
                                >
                                  <option value="0" className="bg-background text-muted">0 - Sin evaluar</option>
                                  <option value="1" className="bg-background text-red-500">1 - No Superado</option>
                                  <option value="2" className="bg-background text-orange-500">2 - Superado</option>
                                  <option value="3" className="bg-background text-yellow-500">3 - Bien</option>
                                  <option value="4" className="bg-background text-green-500">4 - Excelente</option>
                                </select>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

        </main>
      </div>
    </div>
  );
}
