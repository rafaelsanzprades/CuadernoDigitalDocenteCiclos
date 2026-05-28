// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export default function InstrumentosPage() {
  const { activeModuleId, moduleData, setModuleData, updateDataFrame } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [allTriOpen, setAllTriOpen] = useState(true);
  const [openTris, setOpenTris] = useState<Set<string>>(new Set(["1T", "2T", "3T"]));

  const TABS = [
    { id: "resumen", label: "📊 Resumen", cleanLabel: "Resumen" },
    { id: "desglose", label: "📝 Desglose trimestral", cleanLabel: "Desglose trimestral" }
  ];

  const [activeTab, setActiveTab] = useState("resumen");
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
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };

    if (activeModuleId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData]);

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
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No hay módulo seleccionado</h2>
              <p className="text-muted">Por favor, ve a la sección de Datos y selecciona un módulo PD.</p>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !moduleData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center content-area">
            <div className="text-xl text-[#14a085] animate-pulse">Cargando instrumentos de evaluación...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_ce = moduleData?.df_ce || [];
  const df_act = moduleData?.df_act || [];
  
  const ce_clean = df_ce.filter((ce: any) => ce.id_ce && ce.id_ce.trim() !== "");
  const lista_ce_ids = ce_clean.map((ce: any) => ce.id_ce);

  const trimestres = [
    { key: "1T", nombre: "1er trimestre" },
    { key: "2T", nombre: "2º trimestre" },
    { key: "3T", nombre: "3er trimestre" }
  ];

  const handleUpdateAct = (globalIdx: number, field: string, value: any) => {
    const newAct = [...df_act];
    newAct[globalIdx][field] = value;
    updateDataFrame("df_act", newAct);
  };

  const handleAddAct = (tri: string) => {
    const newAct = [...df_act];
    const newId = `ACT${(newAct.length + 1).toString().padStart(2, '0')}`;
    const newEntry: any = {
      id_act: newId,
      tri_act: tri,
      Tipo: "Teoria",
      desc_act: "",
      ce_vinc: "",
      peso_act: 0,
      crit_calif: "",
      is_active: true
    };
    lista_ce_ids.forEach((ce: string) => newEntry[ce] = false);
    newAct.push(newEntry);
    updateDataFrame("df_act", newAct);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        
        <main className="flex-1 p-8 content-area space-y-8">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              🛠️ Instrumentos de evaluación
            </h1>
            <p className="text-muted mt-2 text-lg">Definición y ponderación de las herramientas y métodos de evaluación.</p>
          </div>

          <div className="flex border-b border-[var(--glass-border)] mb-8 overflow-x-auto scrollbar-hide">
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

          {activeTab === "resumen" && (
            <Card className="p-6">
              {/* ── Resumen por trimestres ────────────────────────── */}
              <h4 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <span>📊</span> Resumen de instrumentos de evaluación por trimestres
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)]">
                      <th className="p-3 text-left text-muted font-semibold">Trimestre</th>
                      <th className="p-3 text-center text-muted font-semibold border-l border-[var(--glass-border)]">Exámenes teóricos</th>
                      <th className="p-3 text-center text-muted font-semibold border-l border-[var(--glass-border)]">Exámenes prácticos</th>
                      <th className="p-3 text-center text-muted font-semibold border-l border-[var(--glass-border)]">Informes de ejercicios</th>
                      <th className="p-3 text-center text-muted font-semibold border-l border-[var(--glass-border)]">Cuaderno de tareas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: "1T", label: "1er trimestre" },
                      { key: "2T", label: "2º trimestre" },
                      { key: "3T", label: "3er trimestre" },
                    ].map(tri => {
                      const actTri = df_act.filter((a: any) => String(a.tri_act).toUpperCase() === tri.key);
                      const nTeo = actTri.filter((a: any) => a.Tipo === "Teoria").length;
                      const nPra = actTri.filter((a: any) => a.Tipo === "Practica").length;
                      const nInf = actTri.filter((a: any) => a.Tipo === "Informes").length;
                      const nTar = actTri.filter((a: any) => a.Tipo === "Tareas").length;
                      return (
                        <tr key={tri.key} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                          <td className="p-3 font-semibold text-foreground">{tri.label}</td>
                          <td className="p-3 text-center border-l border-[var(--glass-border)]">
                            <span className="bg-blue-500/15 text-blue-400 font-bold text-lg px-3 py-1 rounded-lg inline-block min-w-[40px]">{nTeo}</span>
                          </td>
                          <td className="p-3 text-center border-l border-[var(--glass-border)]">
                            <span className="bg-emerald-500/15 text-emerald-400 font-bold text-lg px-3 py-1 rounded-lg inline-block min-w-[40px]">{nPra}</span>
                          </td>
                          <td className="p-3 text-center border-l border-[var(--glass-border)]">
                            <span className="bg-orange-500/15 text-orange-400 font-bold text-lg px-3 py-1 rounded-lg inline-block min-w-[40px]">{nInf}</span>
                          </td>
                          <td className="p-3 text-center border-l border-[var(--glass-border)]">
                            <span className="bg-purple-500/15 text-purple-400 font-bold text-lg px-3 py-1 rounded-lg inline-block min-w-[40px]">{nTar}</span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-[var(--glass-border)] bg-foreground/5">
                      <td className="p-4 font-extrabold text-foreground text-lg">Total</td>
                      <td className="p-4 text-center border-l border-[var(--glass-border)]">
                        <span className="bg-blue-500/20 text-blue-400 font-extrabold text-2xl px-4 py-1.5 rounded-lg inline-block min-w-[50px]">{df_act.filter((a: any) => a.Tipo === "Teoria").length}</span>
                      </td>
                      <td className="p-4 text-center border-l border-[var(--glass-border)]">
                        <span className="bg-emerald-500/20 text-emerald-400 font-extrabold text-2xl px-4 py-1.5 rounded-lg inline-block min-w-[50px]">{df_act.filter((a: any) => a.Tipo === "Practica").length}</span>
                      </td>
                      <td className="p-4 text-center border-l border-[var(--glass-border)]">
                        <span className="bg-orange-500/20 text-orange-400 font-extrabold text-2xl px-4 py-1.5 rounded-lg inline-block min-w-[50px]">{df_act.filter((a: any) => a.Tipo === "Informes").length}</span>
                      </td>
                      <td className="p-4 text-center border-l border-[var(--glass-border)]">
                        <span className="bg-purple-500/20 text-purple-400 font-extrabold text-2xl px-4 py-1.5 rounded-lg inline-block min-w-[50px]">{df_act.filter((a: any) => a.Tipo === "Tareas").length}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === "desglose" && (
            <>
              {/* ── Subtítulo Desglose ───────────────────────────── */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                    📝 Desglose trimestral
                  </h2>
                  <p className="text-muted mt-1">Detalle de los instrumentos de evaluación organizados por trimestre.</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (allTriOpen) {
                      setOpenTris(new Set());
                    } else {
                      setOpenTris(new Set(["1T", "2T", "3T"]));
                    }
                    setAllTriOpen(!allTriOpen);
                  }}
                >
                  <span>{allTriOpen ? '▲' : '▼'}</span>
                  {allTriOpen ? 'Colapsar todos' : 'Expandir todos'}
                </Button>
              </div>

              {lista_ce_ids.length === 0 ? (
                <Card className="p-6 border-l-4 border-l-yellow-500">
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Faltan Criterios de evaluación</h3>
                  <p className="text-foreground/80">Primero añade Criterios de evaluación en la pestaña 'Matrices'.</p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {trimestres.map((tri) => {
                    const actTri = df_act.filter((act: any) => String(act.tri_act).toUpperCase() === tri.key);
                    const sumaPeso = actTri.reduce((sum: number, act: any) => sum + (Number(act.peso_act) || 0), 0);

                    return (
                      <div key={tri.key} className="group bg-foreground/5 rounded-lg border border-[var(--glass-border)] overflow-hidden transition-colors">
                        <div 
                          onClick={() => {
                            const newSet = new Set(openTris);
                            if (newSet.has(tri.key)) newSet.delete(tri.key);
                            else newSet.add(tri.key);
                            setOpenTris(newSet);
                          }}
                          className="p-4 cursor-pointer flex items-center justify-between font-semibold text-lg select-none hover:bg-foreground/10 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-indigo-400">📋</span>
                            <span>{tri.nombre}</span>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="text-muted">{actTri.length} actividades</span>
                            <span className="text-indigo-300 font-mono bg-indigo-500/10 px-2 py-1 rounded">Σ {sumaPeso.toFixed(0)}%</span>
                            <span className={`transition-transform duration-300 text-muted ${openTris.has(tri.key) ? 'rotate-180' : ''}`}>▼</span>
                          </div>
                        </div>
                        
                        <AnimatePresence initial={false}>
                          {openTris.has(tri.key) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 border-t border-[var(--glass-border)] bg-foreground/10 overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                                  <thead>
                                    <tr className="text-muted border-b border-[var(--glass-border)] bg-background">
                                      <th className="p-2 sticky left-0 z-10 border-r border-[var(--glass-border)] bg-background">ID</th>
                                      <th className="p-2 sticky left-[60px] z-10 border-r border-[var(--glass-border)] bg-background">Tipo</th>
                                      <th className="p-2 sticky left-[160px] z-10 border-r border-[var(--glass-border)] bg-background w-64">Instrumento / Actividad</th>
                                      <th className="p-2 sticky left-[416px] z-10 border-r border-[var(--glass-border)] bg-background">% Pond.</th>
                                      <th className="p-2 sticky left-[486px] z-10 border-r border-[var(--glass-border)] bg-background">✓</th>
                                      {lista_ce_ids.map((ce: string) => (
                                        <th key={ce} className="p-2 text-center text-xs font-mono border-r border-[var(--glass-border)] text-indigo-300">
                                          {ce}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {actTri.map((act: any) => {
                                      const globalIdx = df_act.findIndex((gAct: any) => gAct === act);
                                      return (
                                        <tr key={globalIdx} className="border-b border-white/5 hover:bg-foreground/5">
                                          <td className="p-2 font-mono sticky left-0 z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827]">{act.id_act}</td>
                                          <td className="p-2 sticky left-[60px] z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827]">
                                            <select 
                                              value={act.Tipo || "Teoria"}
                                              onChange={(e) => handleUpdateAct(globalIdx, "Tipo", e.target.value)}
                                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-indigo-500 focus:outline-none appearance-none"
                                            >
                                              <option value="Teoria">Teoria</option>
                                              <option value="Practica">Practica</option>
                                              <option value="Informes">Informes</option>
                                              <option value="Tareas">Tareas</option>
                                            </select>
                                          </td>
                                          <td className="p-2 sticky left-[160px] z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827]">
                                            <input 
                                              type="text"
                                              value={act.desc_act || ""}
                                              onChange={(e) => handleUpdateAct(globalIdx, "desc_act", e.target.value)}
                                              className="w-full min-w-[200px] bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-indigo-500 focus:outline-none"
                                            />
                                          </td>
                                          <td className="p-2 sticky left-[416px] z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827]">
                                            <input 
                                              type="number"
                                              value={act.peso_act || 0}
                                              onChange={(e) => handleUpdateAct(globalIdx, "peso_act", Number(e.target.value) || 0)}
                                              className="w-16 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-indigo-500 focus:outline-none"
                                            />
                                          </td>
                                          <td className="p-2 text-center sticky left-[486px] z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827]">
                                            <input 
                                              type="checkbox"
                                              checked={act.is_active !== false}
                                              onChange={(e) => handleUpdateAct(globalIdx, "is_active", e.target.checked)}
                                              className="accent-indigo-500"
                                            />
                                          </td>
                                          {lista_ce_ids.map((ce: string) => (
                                            <td key={ce} className="p-2 text-center border-r border-[var(--glass-border)] bg-foreground/5">
                                              <input 
                                                type="checkbox"
                                                checked={act[ce] === true}
                                                onChange={(e) => handleUpdateAct(globalIdx, ce, e.target.checked)}
                                                className="accent-indigo-500"
                                              />
                                            </td>
                                          ))}
                                          <td className="p-2 text-center">
                                            <button
                                              onClick={() => {
                                                const newAct = [...df_act];
                                                newAct.splice(globalIdx, 1);
                                                updateDataFrame("df_act", newAct);
                                              }}
                                              className="text-red-400 hover:text-red-300 font-bold px-2"
                                              title="Eliminar Actividad"
                                            >
                                              ×
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                                <div className="mt-4">
                                  <Button 
                                    variant="ghost"
                                    onClick={() => handleAddAct(tri.key)}
                                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                                  >
                                    <span>+</span> Añadir Instrumento/Actividad en {tri.nombre}
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}
