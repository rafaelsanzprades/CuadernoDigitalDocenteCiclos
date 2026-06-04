"use client";
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

export default function AlumnadoPage() {
  const { activeCursoId, cursoData, setCursoData, updateCursoData, saveCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const TABS = [
    { id: "alumnado", label: "👥 Alumnado", cleanLabel: "Alumnado" },
    { id: "plano", label: "🪑 Plano de clase", cleanLabel: "Plano de clase" },
    { id: "tutoria", label: "🎯 Ficha de Tutoría", cleanLabel: "Ficha de Tutoría" },
    { id: "matriz", label: "📊 Matriz de Tutoría", cleanLabel: "Matriz de Tutoría" }
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
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No hay Curso seleccionado</h2>
              <p className="text-muted">Por favor, ve a la sección de Datos y selecciona un Curso Activo.</p>
            </Card>
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
        
        <main className="flex-1 p-8 content-area space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                👥 Alumnado y tutoría
              </h1>
              <p className="text-muted mt-2 text-lg">Gestión oficial de estudiantes, ficha individual de orientación y matriz de tutoría.</p>
            </div>
            
            {/* Save Button */}
            <div className="flex items-center gap-4">
              {saveMessage && (
                <span className={`text-sm font-semibold ${saveMessage.includes("Error") ? "text-red-400" : "text-green-400"}`}>
                  {saveMessage}
                </span>
              )}
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-accent text-background hover:bg-accent/80 font-bold px-6 py-2 rounded-xl flex items-center gap-2"
              >
                {saving ? "Guardando..." : "Guardar Cambios 💾"}
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
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

          {/* Tab 1: Alumnado */}
          {activeTab === "alumnado" && (
            <Card className="p-6 border-t-4 border-t-blue-500">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <span>Lista oficial</span>
                  <span className="text-sm font-normal text-muted bg-foreground/5 px-3 py-1 rounded-full">{df_al.length} alumnado</span>
                </h2>
                {n_menores > 0 && (
                  <span className="text-pink-400 text-sm font-semibold">🌸 {n_menores} alumnado(s) menor(es) de 18 años</span>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)] text-muted bg-background">
                      <th className="p-2 sticky left-0 z-10 border-r border-[var(--glass-border)] bg-background w-16">Id</th>
                      <th className="p-2 sticky left-[60px] z-10 border-r border-[var(--glass-border)] bg-background w-12 text-center">🌸</th>
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
                    {df_al.map((al: any, idx: number) => {
                      const isMenor = Number(al.Edad) > 0 && Number(al.Edad) < 18;
                      return (
                        <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5">
                          <td className="p-2 font-mono text-xs sticky left-0 z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827]">
                            {al.ID}
                          </td>
                          <td className="p-2 text-center sticky left-[60px] z-10 border-r border-[var(--glass-border)] bg-background group-hover:bg-[#111827]">
                            {isMenor ? "🌸" : ""}
                          </td>
                          <td className="p-2 pr-2">
                            <select 
                              value={al.Estado || "Alta"}
                              onChange={(e) => handleUpdateAlumnado(idx, "Estado", e.target.value)}
                              className={`w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 focus:outline-none appearance-none font-semibold ${al.Estado === 'Baja' ? 'text-red-400' : 'text-green-400'}`}
                            >
                              <option value="Alta">Alta</option>
                              <option value="Baja">Baja</option>
                            </select>
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Apellidos || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Apellidos", e.target.value)}
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Nombre || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Nombre", e.target.value)}
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="number"
                              value={al.Edad || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Edad", e.target.value)}
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Nacimiento || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Nacimiento", e.target.value)}
                              placeholder="DD/MM/YYYY"
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-blue-500 focus:outline-none text-sm"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input 
                              type="checkbox"
                              checked={al.Repite === true || al.Repite === "true"}
                              onChange={(e) => handleUpdateAlumnado(idx, "Repite", e.target.checked)}
                              className="accent-blue-500"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="email"
                              value={al.email || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "email", e.target.value)}
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Movil || ""}
                              onChange={(e) => handleUpdateAlumnado(idx, "Movil", e.target.value)}
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleRemoveAlumnado(idx)}
                              className="text-red-400 hover:text-red-300 font-bold"
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
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
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

        </main>
      </div>
    </div>
  );
}
