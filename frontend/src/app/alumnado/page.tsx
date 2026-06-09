"use client";
import { BarChart, Save, Target, Users, LayoutGrid, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TutoriaTab } from "@/components/features/alumnado/TutoriaTab";
import { TutoriaMatrixTab } from "@/components/features/alumnado/TutoriaMatrixTab";
import { PlanoClaseTab } from "@/components/features/alumnado/PlanoClaseTab";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export default function AlumnadoPage() {
  const { activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const TABS = [
    { id: "alumnado", label:  <span className="flex items-center gap-2"><Users className="w-4 h-4 shrink-0" /> Alumnado</span>, cleanLabel: "Alumnado" },
    { id: "plano", label: <span className="flex items-center gap-2"><LayoutGrid className="w-4 h-4 shrink-0" /> Plano de clase <span className="flex items-center gap-1 bg-warning/20 text-warning px-1.5 py-0.5 ml-2 rounded text-[10px] font-bold uppercase border border-warning/30"><AlertTriangle className="w-3 h-3" /> En obra</span></span>, cleanLabel: "Plano de clase" },
    { id: "tutoria", label:  <span className="flex items-center gap-2"><Target className="w-4 h-4 shrink-0" /> Ficha de Tutoría</span>, cleanLabel: "Ficha de Tutoría" },
    { id: "matriz", label:  <span className="flex items-center gap-2"><BarChart className="w-4 h-4 shrink-0" /> Matriz de Tutoría</span>, cleanLabel: "Matriz de Tutoría" }
  ];

  const [activeTab, setActiveTab] = useState("alumnado");
  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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

    if (activeCursoId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [activeCursoId, cursoData]);

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

  if (!activeCursoId) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8 content-area">
            <MotionWrapper>
              <Card className="p-12 text-center flex flex-col items-center justify-center gap-4">
                <Users className="w-16 h-16 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold mb-4">No hay Curso seleccionado</h2>
                <p className="text-muted">Por favor, ve a la sección de Datos y selecciona un Curso Activo.</p>
              </Card>
            </MotionWrapper>
          </main>
        </div>
      </div>
    );
  }

  if (loading || !cursoData) {
    return <LoadingSpinner text="Cargando datos de alumnado..." />;
  }

  const df_al = cursoData?.df_al || [];

  const handleAddAlumnado = () => {
    const newAl = [...df_al];
    const newId = `AN${(newAl.length + 1).toString().padStart(2, '0')}`;
    (newAl as any[]).push({
      ID: newId,
      Estado: "Alta",
      Apellidos: "",
      Nombre: "",
      Edad: "",
      Nacimiento: "",
      Repite: "false",
      Matricula: "",
      Comentarios: "",
      email: "",
      Movil: ""
    });
    updateCursoData("df_al", newAl);
  };

  const handleUpdateAlumnado = (idx: number, field: string, value: any) => {
    const newAl = [...df_al];
    (newAl[idx] as any)[field] = value;
    updateCursoData("df_al", newAl);
  };

  const handleRemoveAlumnado = (idx: number) => {
    const newAl = [...df_al];
    // Also clean up their tutoring data from the ledger if it exists
    const studentId = newAl[idx].ID;
    if (studentId && cursoData.tutoria_ledger && cursoData.tutoria_ledger[studentId]) {
      const newLedger = { ...cursoData.tutoria_ledger };
      delete newLedger[studentId];
      updateCursoData("tutoria_ledger", newLedger);
    }
    newAl.splice(idx, 1);
    updateCursoData("df_al", newAl);
  };

  const n_menores = df_al.filter((al: any) => Number(al.Edad) > 0 && Number(al.Edad) < 18).length;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        
        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-8 pb-12">
            <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> Alumnado y tutoría
              </h1>
              <p className="text-muted mt-2 text-lg">Gestión oficial de estudiantes, ficha individual de orientación y matriz de tutoría.</p>
            </div>
            
            {/* Save Button */}
            <div className="flex items-center gap-4">
              {saveMessage && (
                <span className={`text-sm font-semibold ${saveMessage.includes("Error") ? "text-danger" : "text-success"}`}>
                  {saveMessage}
                </span>
              )}
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-accent text-background hover:bg-accent/80 font-bold px-6 py-2 rounded-xl flex items-center gap-2"
              >
                {saving ? "Guardando..." : <>Guardar Cambios <span className="inline-flex"><Save className="w-[1.2em] h-[1.2em] mr-1" /></span></>}
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2 max-w-full">
              {TABS.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Tab 1: Alumnado */}
          {activeTab === "alumnado" && (
            <Card className="p-6 border-t-4 border-t-blue-500">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <span>Lista oficial</span>
                  <span className="text-sm font-normal text-muted bg-foreground/5 px-3 py-1 rounded-full">{df_al.length} alumnado</span>
                </h2>
                {n_menores > 0 && (
                  <span className="text-danger text-sm font-semibold"> {n_menores} alumnado(s) menor(es) de 18 años</span>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)] text-muted bg-background">
                      <th className="p-2 sticky left-0 z-10 border-r border-[var(--glass-border)] bg-background w-16">Id</th>
                      <th className="p-2 sticky left-[60px] z-10 border-r border-[var(--glass-border)] bg-background w-12 text-center"></th>
                      <th className="p-2 w-32">Estado</th>
                      <th className="p-2 w-48">Apellidos</th>
                      <th className="p-2 w-48">Nombre</th>
                      <th className="p-2 w-20">Edad</th>
                      <th className="p-2 w-32">Nacimiento</th>
                      <th className="p-2 w-16 text-center">Repite</th>
                      <th className="p-2 w-64">Email</th>
                      <th className="p-2 w-32">Móvil</th>
                      <th className="p-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {df_al.length === 0 && (
                      <tr>
                        <td colSpan={10} className="p-0">
                          <div className="flex flex-col items-center justify-center py-12 text-muted">
                            <Users className="w-12 h-12 mb-3 opacity-20" />
                            <p>No hay alumnado registrado aún.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {df_al.map((al: any, idx: number) => {
                      const isMenor = Number(al.Edad) > 0 && Number(al.Edad) < 18;
                      const inputClass = "w-full bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 text-foreground focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder:text-muted/40";
                      
                      return (
                        <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5 transition-colors group">
                          <td className="p-2 font-mono text-xs sticky left-0 z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827] transition-colors">
                            {al.ID}
                          </td>
                          <td className="p-2 text-center sticky left-[60px] z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827] transition-colors">
                            {isMenor ? <span className="text-danger font-bold text-lg" title="Menor de edad">!</span> : ""}
                          </td>
                          <td className="p-2 pr-2">
                            <select 
                              value={al.Estado || "Alta"}
                              onChange={(e) => handleUpdateAlumnado(idx, "Estado", e.target.value)}
                              className={`w-full bg-transparent border border-transparent hover:border-[var(--glass-border)] focus:bg-foreground/5 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent transition-all appearance-none font-semibold cursor-pointer ${al.Estado === 'Baja' ? 'text-danger' : 'text-success'}`}
                            >
                              <option value="Alta" className="text-success">Alta</option>
                              <option value="Baja" className="text-danger">Baja</option>
                            </select>
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Apellidos || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Apellidos", e.target.value)}
                              className={inputClass}
                              placeholder="Apellidos..."
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Nombre || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Nombre", e.target.value)}
                              className={inputClass}
                              placeholder="Nombre..."
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="number"
                              value={al.Edad || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Edad", e.target.value)}
                              className={inputClass}
                              placeholder="Edad"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Nacimiento || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Nacimiento", e.target.value)}
                              placeholder="DD/MM/YYYY"
                              className={`${inputClass} text-sm`}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input 
                              type="checkbox"
                              checked={al.Repite === true || al.Repite === "true"}
                              onChange={(e) => handleUpdateAlumnado(idx, "Repite", e.target.checked)}
                              className="w-4 h-4 accent-accent rounded cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="email"
                              value={al.email || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "email", e.target.value)}
                              className={inputClass}
                              placeholder="correo@ejemplo.com"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Movil || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Movil", e.target.value)}
                              className={inputClass}
                              placeholder="Teléfono"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleRemoveAlumnado(idx)}
                              className="text-danger/50 hover:text-danger font-bold text-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                              title="Eliminar Alumnado"
                            >
                              &times;
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
                    onClick={handleAddAlumnado}
                    className="text-info hover:text-info font-semibold flex items-center gap-1"
                  >
                    <span>+</span> Añadir Alumnado
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 2: Ficha de Tutoría */}
          {activeTab === "tutoria" && (
            <TutoriaTab />
          )}

          {/* Tab 3: Matriz de Tutoría */}
          {activeTab === "matriz" && (
            <TutoriaMatrixTab />
          )}


          {/* Tab 5: Plano de clase */}
          {activeTab === "plano" && (
            <PlanoClaseTab />
          )}

          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
