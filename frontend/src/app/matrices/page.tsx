"use client";
import { Award, BookOpen, Calculator, Check, GraduationCap, Puzzle, Target } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { RaOgMatrix } from "@/components/features/resultados/RaOgMatrix";
import { curriculos, CompetenciaCPP } from "@/data/curriculos";
import { fetchWithTimeout } from "@/utils/fetchWithTimeout";
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default function MatricesPage() {
  const { activeModuleId, moduleData, setModuleData, updateDataFrame, saveModuleData, cursoData, updateCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [allCeOpen, setAllCeOpen] = useState(false);
  const [openCEs, setOpenCEs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("ra");

  const TABS = [
    { id: "ra", label: "RA y sus CE", icon: <><span className="inline-flex"><GraduationCap className="w-[1.2em] h-[1.2em] mr-1" /></span></> },
    { id: "ud", label: "UD Unidades didácticas", icon: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span></> },
    { id: "relacion", label: "Relación entre RA y UD", icon: <><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></> },
    { id: "contribucion", label: "Contribución de RA en OG", icon: <><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></> },
    { id: "cpps", label: "Competencias (CPPS)", icon: <><span className="inline-flex"><Award className="w-[1.2em] h-[1.2em] mr-1" /></span></> },
  ];

  useEffect(() => {
    if (activeModuleId && !moduleData) {
      fetchWithTimeout(`/api/module/${activeModuleId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setModuleData(data.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching module:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData, setModuleData]);

  const handleSave = async () => {
    setSaving(true);
    const ok = await saveModuleData();
    if (ok) {
      toast.success("Progrmación guardada correctamente");
    } else {
      toast.error("Error al guardar los datos");
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

  if (loading) {
    return <LoadingSpinner text="Cargando matrices..." />;
  }

  const df_ra = moduleData?.df_ra || [];
  const df_ud = moduleData?.df_ud || [];
  const df_ce = moduleData?.df_ce || [];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />

        <main className="flex-1 p-8 content-area space-y-8">
          <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <span className="inline-flex"><Calculator className="w-[1.2em] h-[1.2em] mr-1" /></span> Matrices OG→ RA→ CE→ UD
            </h1>
            <p className="text-muted mt-2 text-lg">Relación y ponderación entre los RA, CE y las diferentes UD del módulo.</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2 max-w-full">
              {TABS.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Resultados de aprendizaje y CE */}
          {activeTab === "ra" && (
            <div className="space-y-8 animate-in fade-in duration-500">
          <Card className="p-6 border-t-4 border-t-accent">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-4">
<span><span className="inline-flex"><GraduationCap className="w-[1.2em] h-[1.2em] mr-1" /></span></span> RA. Resultados de aprendizaje
</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-muted border-b border-[var(--glass-border)]">
                    <th className="pb-2 w-24">Ra</th>
                    <th className="pb-2 w-24">% RA</th>
                    <th className="pb-2 w-16 text-center">Feoe</th>
                    <th className="pb-2">Resultados de aprendizaje</th>
                  </tr>
                </thead>
                <tbody>
                  {df_ra.map((ra: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={ra.id_ra || ""}
                          onChange={(e) => {
                            const newRa = [...df_ra];
                            newRa[idx].id_ra = e.target.value;
                            updateDataFrame("df_ra", newRa);
                          }}
                          className="w-16 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-[#14a085] focus:outline-none font-mono text-sm"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          value={ra.peso_ra || 0}
                          onChange={(e) => {
                            const newRa = [...df_ra];
                            newRa[idx].peso_ra = parseFloat(e.target.value) || 0;
                            updateDataFrame("df_ra", newRa);
                          }}
                          className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-sm focus:border-[#14a085] focus:outline-none"
                        />
                      </td>
                      <td className="py-2 text-center">
                        <button
                          onClick={() => {
                            const newRa = [...df_ra];
                            const currentVal = newRa[idx].is_dual;
                            const isChecked = String(currentVal).toLowerCase() === 'true';
                            newRa[idx].is_dual = String(!isChecked);
                            updateDataFrame("df_ra", newRa);
                          }}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-all mx-auto ${
                            (ra.is_dual === true || String(ra.is_dual).toLowerCase() === 'true')
                              ? 'bg-[#14a085]/20 text-[#14a085] border border-[#14a085]/50 shadow-[0_0_10px_rgba(20,160,133,0.2)]'
                              : 'bg-background border border-[var(--glass-border)] text-transparent hover:border-[#14a085]/30 hover:bg-[#14a085]/10'
                          }`}
                        >
                          {(ra.is_dual === true || String(ra.is_dual).toLowerCase() === 'true') && <span className="text-xs font-medium"><span className="inline-flex"><Check className="w-[1.2em] h-[1.2em] mr-1" /></span></span>}
                        </button>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={ra.desc_ra || ""}
                          onChange={(e) => {
                            const newRa = [...df_ra];
                            newRa[idx].desc_ra = e.target.value;
                            updateDataFrame("df_ra", newRa);
                          }}
                          className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-3 py-1 text-foreground text-sm focus:border-[#14a085] focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <Button
                variant="ghost"
                onClick={() => {
                  const newRa = [...df_ra];
                  const newId = `RA${(newRa.length + 1).toString().padStart(2, '0')}`;
                  newRa.push({ id_ra: newId, peso_ra: 0, is_dual: "false", desc_ra: "" });
                  updateDataFrame("df_ra", newRa);
                }}
                className="text-accent hover:text-[#1abc9c]"
              >
                <span>+</span> Añadir nuevo RA
              </Button>

              <Card className="px-4 py-2 inline-flex items-center gap-2 border-l-4 border-l-blue-500">
                <span className="text-muted">Total suma % RA:</span>
                <span className={`font-bold ${df_ra.reduce((sum: number, ra: any) => sum + (Number(ra.peso_ra) || 0), 0) === 100 ? 'text-success' : 'text-danger'}`}>
                  {df_ra.reduce((sum: number, ra: any) => sum + (Number(ra.peso_ra) || 0), 0).toFixed(0)}%
                </span>
              </Card>
            </div>
          </Card>

          {/* Criterios de evaluación */}
          <Card className="p-6 border-t-4 border-t-yellow-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
<span><span className="inline-flex"><Puzzle className="w-[1.2em] h-[1.2em] mr-1" /></span></span> CE. Criterios de evaluación
</h2>
              <Button
                variant="secondary"
                onClick={() => {
                  if (allCeOpen) {
                    setOpenCEs(new Set());
                  } else {
                    setOpenCEs(new Set(df_ra.map((ra: any) => ra.id_ra)));
                  }
                  setAllCeOpen(!allCeOpen);
                }}
              >
                <span>{allCeOpen ? '▲' : '▼'}</span>
                {allCeOpen ? 'Colapsar todas' : 'Expandir todas'}
              </Button>
            </div>

            <div className="space-y-4">
              {df_ra.map((ra: any) => {
                const ceForRa = df_ce.filter((ce: any) => ce.id_ra === ra.id_ra);
                const totalPeso = ceForRa.reduce((sum: number, ce: any) => sum + (Number(ce.peso_ce) || 0), 0);

                return (
                  <div key={ra.id_ra} className="group bg-foreground/5 rounded-lg border border-[var(--glass-border)] overflow-hidden transition-colors">
                    <div 
                      onClick={() => {
                        const newSet = new Set(openCEs);
                        if (newSet.has(ra.id_ra)) newSet.delete(ra.id_ra);
                        else newSet.add(ra.id_ra);
                        setOpenCEs(newSet);
                      }}
                      className="p-4 cursor-pointer flex items-center justify-between font-semibold text-lg select-none hover:bg-foreground/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-warning">{ra.id_ra}</span>
                        <span className="text-sm text-muted font-normal truncate max-w-xl">{ra.desc_ra}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-muted">{ceForRa.length} CE</span>
                        <span className={`px-2 py-1 rounded ${totalPeso === 100 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          Σ {totalPeso.toFixed(0)}%
                        </span>
                        <span className={`transition-transform duration-300 text-muted ${openCEs.has(ra.id_ra) ? 'rotate-180' : ''}`}>▼</span>
                      </div>
                    </div>
                    
                    <AnimatePresence initial={false}>
                      {openCEs.has(ra.id_ra) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 border-t border-[var(--glass-border)] bg-foreground/10">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="text-muted border-b border-[var(--glass-border)]">
                                  <th className="pb-2 w-24">Ce</th>
                                  <th className="pb-2 w-24">% CE</th>
                                  <th className="pb-2">Criterio de Evaluación</th>
                                  <th className="pb-2 w-10"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {ceForRa.map((ce: any, ceIdx: number) => {
                                  const globalIdx = df_ce.findIndex((gCe: any) => gCe === ce);
                                  return (
                                    <tr key={ceIdx} className="border-b border-white/5 hover:bg-foreground/5">
                                      <td className="py-2 pr-2">
                                        <input
                                          type="text"
                                          value={ce.id_ce || ""}
                                          onChange={(e) => {
                                            const newCe = [...df_ce];
                                            newCe[globalIdx].id_ce = e.target.value;
                                            updateDataFrame("df_ce", newCe);
                                          }}
                                          className="w-16 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-warning focus:outline-none"
                                        />
                                      </td>
                                      <td className="py-2 pr-2">
                                        <input
                                          type="number"
                                          value={ce.peso_ce || 0}
                                          onChange={(e) => {
                                            const newCe = [...df_ce];
                                            const newVal = parseFloat(e.target.value) || 0;
                                            newCe[globalIdx].peso_ce = newVal;
                                            
                                            const raCeIndexes = df_ce.map((c: any, i: number) => c.id_ra === ra.id_ra ? i : -1).filter((i: number) => i !== -1);
                                            const currentLocalIdx = raCeIndexes.indexOf(globalIdx);
                                            
                                            if (currentLocalIdx < raCeIndexes.length - 1) {
                                              let sumSoFar = 0;
                                              for (let i = 0; i <= currentLocalIdx; i++) {
                                                sumSoFar += Number(newCe[raCeIndexes[i]].peso_ce) || 0;
                                              }
                                              
                                              const targetTotal = 100;
                                              let remaining = Math.max(0, targetTotal - sumSoFar);
                                              const remainingCount = raCeIndexes.length - 1 - currentLocalIdx;
                                              const share = Number((remaining / remainingCount).toFixed(1));
                                              
                                              for (let i = currentLocalIdx + 1; i < raCeIndexes.length; i++) {
                                                newCe[raCeIndexes[i]].peso_ce = share;
                                              }
                                            }
                                            updateDataFrame("df_ce", newCe);
                                          }}
                                          className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-warning focus:outline-none"
                                        />
                                      </td>
                                      <td className="py-2 pr-2">
                                        <input
                                          type="text"
                                          value={ce.desc_ce || ""}
                                          onChange={(e) => {
                                            const newCe = [...df_ce];
                                            newCe[globalIdx].desc_ce = e.target.value;
                                            updateDataFrame("df_ce", newCe);
                                          }}
                                          className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-3 py-1 text-foreground focus:border-warning focus:outline-none"
                                        />
                                      </td>
                                      <td className="py-2 text-center">
                                        <button
                                          onClick={() => {
                                            const newCe = [...df_ce];
                                            newCe.splice(globalIdx, 1);
                                            const raCeIndexes = newCe.map((c: any, i: number) => c.id_ra === ra.id_ra ? i : -1).filter((i: number) => i !== -1);
                                            const count = raCeIndexes.length;
                                            if (count > 0) {
                                              const share = Number((100 / count).toFixed(1));
                                              raCeIndexes.forEach(idx => {
                                                newCe[idx].peso_ce = share;
                                              });
                                            }
                                            updateDataFrame("df_ce", newCe);
                                          }}
                                          className="text-danger hover:text-danger font-bold"
                                          title="Eliminar CE"
                                        >
                                          ×
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                            <div className="mt-3">
                              <button
                                onClick={() => {
                                  const newCe = [...df_ce];
                                  newCe.push({
                                    id_ra: ra.id_ra,
                                    id_ce: `${ra.id_ra.replace('RA', 'CE')}.`,
                                    peso_ce: 0,
                                    desc_ce: ""
                                  });
                                  const raCeIndexes = newCe.map((c: any, i: number) => c.id_ra === ra.id_ra ? i : -1).filter((i: number) => i !== -1);
                                  const count = raCeIndexes.length;
                                  if (count > 0) {
                                    const share = Number((100 / count).toFixed(1));
                                    raCeIndexes.forEach(idx => {
                                      newCe[idx].peso_ce = share;
                                    });
                                  }
                                  updateDataFrame("df_ce", newCe);
                                }}
                                className="text-xs text-warning hover:text-warning font-semibold flex items-center gap-1"
                              >
                                <span>+</span> Añadir CE a {ra.id_ra}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Card>
            </div>
          )}

          {/* Unidades didácticas */}
          {activeTab === "ud" && (
            <div className="animate-in fade-in duration-500">
          <Card className="p-6 border-t-4 border-t-purple-500">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-4">
<span><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span></span> UD. Unidades didácticas
</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--glass-border)] text-sm text-muted">
                    <th className="p-3 sticky left-0 bg-background z-10">Id-UD</th>
                    <th className="p-3 sticky left-[80px] bg-background z-10">Horas</th>
                    <th className="p-3 sticky left-[160px] bg-background z-10 w-64">Unidad Didáctica</th>
                    {df_ra.map((ra: any, i: number) => (
                      <th key={i} className="p-3 text-center min-w-[80px]">
                        <div className="text-xs">{ra.id_ra}</div>
                        <div className="text-[10px] text-info">({ra.peso_ra || 0}%)</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {df_ud.map((ud: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                      <td className="p-3 font-mono text-sm sticky left-0 bg-background group-hover:bg-[#111827]">{ud.id_ud}</td>
                      <td className="p-3 sticky left-[80px] bg-background group-hover:bg-[#111827]">
                        <input
                          type="number"
                          value={ud.horas_ud || 0}
                          onChange={(e) => {
                            const newUd = [...df_ud];
                            newUd[idx].horas_ud = parseFloat(e.target.value) || 0;
                            updateDataFrame("df_ud", newUd);
                          }}
                          className="w-16 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-sm focus:border-info focus:outline-none"
                        />
                      </td>
                      <td className="p-3 sticky left-[160px] bg-background group-hover:bg-[#111827]">
                        <input
                          type="text"
                          value={ud.desc_ud || ""}
                          onChange={(e) => {
                            const newUd = [...df_ud];
                            newUd[idx].desc_ud = e.target.value;
                            updateDataFrame("df_ud", newUd);
                          }}
                          className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-3 py-1 text-foreground text-sm focus:border-info focus:outline-none"
                        />
                      </td>
                      {df_ra.map((ra: any, raIdx: number) => (
                        <td key={raIdx} className="p-3 text-center">
                          <input
                            type="number"
                            value={ud[ra.id_ra] || ""}
                            onChange={(e) => {
                              const newUd = [...df_ud];
                              (newUd[idx] as any)[ra.id_ra] = parseFloat(e.target.value) || 0;
                              updateDataFrame("df_ud", newUd);
                            }}
                            className="w-14 text-center bg-foreground/15 border border-[var(--glass-border)] rounded px-1 py-1 text-foreground text-sm focus:border-info focus:outline-none"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    const newUd = [...df_ud];
                    const newId = `UD${(newUd.length + 1).toString().padStart(2, '0')}`;
                    newUd.push({ id_ud: newId, horas_ud: 0, desc_ud: "" });
                    updateDataFrame("df_ud", newUd);
                  }}
                  className="text-info hover:text-info"
                >
                  <span>+</span> Añadir nueva UD
                </Button>
                
                {df_ud.length === 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const demoUds = [
                        { "id_ud": "UD01", "desc_ud": "ICT en viviendas y edificios: elementos, normativa y diseño", "horas_ud": 30, "ra_mappings": { "RA01": "RA01", "RA06": "RA06" }, "RA01": 50, "RA02": 0, "RA03": 0, "RA04": 0, "RA05": 0, "RA06": 10 },
                        { "id_ud": "UD02", "desc_ud": "Instalaciones de antenas y televisión satélite", "horas_ud": 30, "ra_mappings": { "RA01": "RA01", "RA02": "RA02" }, "RA01": 30, "RA02": 40, "RA03": 0, "RA04": 0, "RA05": 0, "RA06": 0 },
                        { "id_ud": "UD03", "desc_ud": "Infraestructuras de telecomunicaciones de banda ancha", "horas_ud": 28, "ra_mappings": { "RA02": "RA02", "RA03": "RA03" }, "RA01": 20, "RA02": 40, "RA03": 30, "RA04": 0, "RA05": 0, "RA06": 0 },
                        { "id_ud": "UD04", "desc_ud": "Instalaciones de telefonía y redes de datos", "horas_ud": 30, "ra_mappings": { "RA03": "RA03" }, "RA01": 0, "RA02": 20, "RA03": 40, "RA04": 0, "RA05": 0, "RA06": 0 },
                        { "id_ud": "UD05", "desc_ud": "Seguridad y verificación de instalaciones de telecomunicaciones", "horas_ud": 25, "ra_mappings": { "RA04": "RA04" }, "RA01": 0, "RA02": 0, "RA03": 10, "RA04": 60, "RA05": 0, "RA06": 0 },
                        { "id_ud": "UD06", "desc_ud": "Mantenimiento y reparación de instalaciones ICT", "horas_ud": 24, "ra_mappings": { "RA05": "RA05" }, "RA01": 0, "RA02": 0, "RA03": 20, "RA04": 40, "RA05": 10, "RA06": 0 }
                      ];
                      updateDataFrame("df_ud", demoUds);
                    }}
                    className="text-warning border-warning hover:bg-warning/10"
                  >
                    Restaurar UDs de ejemplo
                  </Button>
                )}
              </div>

              <Card className="px-4 py-2 inline-flex items-center gap-2 border-l-4 border-l-purple-500">
                <span className="text-muted">Total horas UD:</span>
                <span className="font-bold text-info">
                  {df_ud.reduce((sum: number, ud: any) => sum + (Number(ud.horas_ud) || 0), 0)} h
                </span>
              </Card>
            </div>
          </Card>
            </div>
          )}

          {/* ── RAs ↔ UDs ────────────────────────────────────── */}
          {activeTab === "relacion" && (
            <div className="animate-in fade-in duration-500">
          <Card className="p-6 border-t-4 border-t-amber-500">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-4">
<span><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Relación entre Resultados de aprendizaje y Unidades didácticas
</h2>
            {df_ra && df_ra.length > 0 ? (
              <div className="space-y-6">
                {df_ra.map((ra: any, idx: number) => {
                  const uds = df_ud?.filter((ud: any) => ud[ra.id_ra] > 0) || [];
                  return (
                    <div key={idx} className="border-b border-[var(--glass-border)] pb-6 last:border-0 last:pb-0">
                      <div className="text-lg text-foreground mb-3">
                        <strong>{ra.id_ra} ({ra.peso_ra}%).</strong>{" "}
                        <span className="text-muted text-sm">{ra.desc_ra}</span>
                      </div>
                      {uds.length > 0 ? (
                        <div className="ml-6 pl-4 border-l-2 border-[#d4af37] text-[#ffe599]">
                          {uds.map((ud: any, uIdx: number) => (
                            <div key={uIdx} className="mb-1">
                              {ud.id_ud} ({ud.horas_ud || ud.Horas || 0}h) - {ud[ra.id_ra]}%
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="ml-6 pl-4 border-l-2 border-gray-600 text-muted italic">Sin UDs asignadas</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted">No hay Resultados de aprendizaje definidos.</div>
            )}
          </Card>
            </div>
          )}

          {/* ── Contribución de RA en OG ────────────────────────────────────── */}
          {activeTab === "contribucion" && (
            <div className="animate-in fade-in duration-500">
              <RaOgMatrix />
            </div>
          )}

          {/* ── Competencias CPPS ──────────────────────────────────────────── */}
          {activeTab === "cpps" && (
            <div className="animate-in fade-in duration-500">
              <Card className="p-6 border-t-4 border-t-[#14a085]">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-2">
                  <span><span className="inline-flex"><Award className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Competencias profesionales, personales y sociales (CPPS)
                </h2>
                <p className="text-sm text-muted mb-6">
                  Del Catálogo Nacional de Cualificaciones Profesionales. Artículo 5 de la ORDEN de 14 de julio de 2010 (BOA).
                </p>

                {(() => {
                  const cpps = curriculos["ELE203"]?.competencias_cpps || [];
                  return (
                    <div className="space-y-2">
                      {cpps.map((cpp: CompetenciaCPP) => (
                        <div key={cpp.id} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--glass-border)] bg-foreground/5">
                          <span className="font-mono font-bold text-[#14a085] shrink-0 mt-0.5">CPPS {cpp.id}.</span>
                          <span className="text-sm text-foreground">{cpp.descripcion}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </Card>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
