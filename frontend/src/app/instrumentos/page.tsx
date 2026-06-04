"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function InstrumentosPage() {
  const { activeModuleId, moduleData, setModuleData, updateDataFrame, saveModuleData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const TABS = [
    { id: "resumen", label: "📊 Resumen", cleanLabel: "Resumen" },
    { id: "tri1", label: "📝 IE. 1er Tri.", cleanLabel: "IE. 1er Tri." },
    { id: "tri2", label: "📝 IE. 2º Tri.", cleanLabel: "IE. 2º Tri." },
    { id: "tri3", label: "📝 IE. 3er Tri.", cleanLabel: "IE. 3er Tri." }
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
        } else if (moduleData && (!moduleData.df_act || moduleData.df_act.length < 21)) {
          // Force demo seed injection for hot reload updates
          import('@/services/fileManager').then(({ fileManager }) => {
            const db = fileManager.getDb();
            if (db['0237-ictve-pd']) {
              setModuleData(db['0237-ictve-pd']);
            }
          });
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
  }, [activeModuleId, moduleData, setModuleData]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    const ok = await saveModuleData();
    if (ok) {
      setSaveMessage("Guardado correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
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
    return <LoadingSpinner text="Cargando..." />;
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

  const renderTrimestreTab = (triKey: string, triNombre: string) => {
    if (lista_ce_ids.length === 0) {
      return (
        <Card className="p-6 border-l-4 border-l-yellow-500">
          <h3 className="text-xl font-bold text-yellow-400 mb-2">Faltan Criterios de evaluación</h3>
          <p className="text-foreground/80">Primero añade Criterios de evaluación en la pestaña 'Matrices'.</p>
        </Card>
      );
    }

    const actTri = df_act.filter((act: any) => String(act.tri_act).toUpperCase() === triKey);
    const sumaPeso = actTri.reduce((sum: number, act: any) => sum + (Number(act.peso_act) || 0), 0);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              📝 Instrumentos de Evaluación - {triNombre}
            </h2>
            <p className="text-muted mt-1">Detalle de los instrumentos de evaluación organizados para este trimestre.</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted">{actTri.length} actividades</span>
            <span className="text-indigo-300 font-mono bg-indigo-500/10 px-4 py-2 rounded-lg text-lg">Σ {sumaPeso.toFixed(0)}%</span>
          </div>
        </div>

        <div className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] overflow-hidden">
          <div className="p-4 bg-foreground/10 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
              <thead>
                <tr className="text-muted border-b border-[var(--glass-border)] bg-background">
                  <th className="p-2 sticky left-0 z-10 border-r border-[var(--glass-border)] bg-background">Id</th>
                  <th className="p-2 sticky left-[60px] z-10 border-r border-[var(--glass-border)] bg-background">Tipo</th>
                  <th className="p-2 sticky left-[160px] z-10 border-r border-[var(--glass-border)] bg-background w-64">Instrumento / Actividad</th>
                  <th className="p-2 sticky left-[416px] z-10 border-r border-[var(--glass-border)] bg-background">% Pond.</th>
                  <th className="p-2 sticky left-[486px] z-10 border-r border-[var(--glass-border)] bg-background">✓</th>
                  {lista_ce_ids.map((ce: string) => (
                    <th key={ce} className="p-2 text-center text-xs font-mono border-r border-[var(--glass-border)] text-indigo-300">
                      {ce}
                    </th>
                  ))}
                  <th className="p-2 text-center"></th>
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
                onClick={() => handleAddAct(triKey)}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>+</span> Añadir Instrumento/Actividad en {triNombre}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        
        <main className="flex-1 p-8 content-area space-y-8">
          <div>
            <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
              🛠️ Instrumentos de evaluación
            </h1>
            <p className="text-muted mt-2 text-lg">Definición y ponderación de las herramientas y métodos de evaluación.</p>
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

          {activeTab === "resumen" && (
            <Card className="p-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-5">
                <span>📊</span> Resumen de instrumentos de evaluación por trimestres
              </h2>
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
                    {trimestres.map(tri => {
                      const actTri = df_act.filter((a: any) => String(a.tri_act).toUpperCase() === tri.key);
                      const nTeo = actTri.filter((a: any) => a.Tipo === "Teoria").length;
                      const nPra = actTri.filter((a: any) => a.Tipo === "Practica").length;
                      const nInf = actTri.filter((a: any) => a.Tipo === "Informes").length;
                      const nTar = actTri.filter((a: any) => a.Tipo === "Tareas").length;
                      return (
                        <tr key={tri.key} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                          <td className="p-3 font-semibold text-foreground">{tri.nombre}</td>
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

          {activeTab === "tri1" && renderTrimestreTab("1T", "1er trimestre")}
          {activeTab === "tri2" && renderTrimestreTab("2T", "2º trimestre")}
          {activeTab === "tri3" && renderTrimestreTab("3T", "3er trimestre")}

        </main>
      </div>
    </div>
  );
}
