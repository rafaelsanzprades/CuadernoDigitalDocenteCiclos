// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function MatriculaPage() {
  const { activeCursoId, cursoData, setCursoData, updateCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const TABS = [
    { id: "alumnado", label: "👥 Alumnado", cleanLabel: "Alumnado" },
    { id: "empresas", label: "🏢 Empresas FEOE", cleanLabel: "Empresas FEOE" }
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
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center content-area">
            <div className="text-xl text-blue-400 animate-pulse">Cargando matrícula...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_al = cursoData?.df_al || [];

  const handleAddAlumno = () => {
    const newAl = [...df_al];
    const newId = `AN${(newAl.length + 1).toString().padStart(2, '0')}`;
    newAl.push({
      ID: newId,
      Estado: "Alta",
      Apellidos: "",
      Nombre: "",
      Edad: "",
      Nacimiento: "",
      Repite: false,
      Matricula: "",
      Comentarios: "",
      email: "",
      Movil: ""
    });
    updateCursoData("df_al", newAl);
  };

  const handleUpdateAlumno = (idx: number, field: string, value: any) => {
    const newAl = [...df_al];
    newAl[idx][field] = value;
    updateCursoData("df_al", newAl);
  };

  const handleRemoveAlumno = (idx: number) => {
    const newAl = [...df_al];
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
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              👥 Matrícula
            </h1>
            <p className="text-muted mt-2 text-lg">Listado oficial de estudiantes matriculados y empresas de formación.</p>
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

          {activeTab === "alumnado" && (
            <Card className="p-6 border-t-4 border-t-blue-500">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
<span>Lista oficial</span>
                  <span className="text-sm font-normal text-muted bg-foreground/5 px-3 py-1 rounded-full">{df_al.length} alumnos</span>
</h2>
                {n_menores > 0 && (
                  <span className="text-pink-400 text-sm font-semibold">🌸 {n_menores} alumno(s) menor(es) de 18 años</span>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)] text-muted bg-background">
                      <th className="p-2 sticky left-0 z-10 border-r border-[var(--glass-border)] bg-background w-16">ID</th>
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
                              onChange={(e) => handleUpdateAlumno(idx, "Estado", e.target.value)}
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
                              onChange={(e) => handleUpdateAlumno(idx, "Apellidos", e.target.value)}
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Nombre || ""}
                              onChange={(e) => handleUpdateAlumno(idx, "Nombre", e.target.value)}
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="number"
                              value={al.Edad || ""}
                              onChange={(e) => handleUpdateAlumno(idx, "Edad", e.target.value)}
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Nacimiento || ""}
                              onChange={(e) => handleUpdateAlumno(idx, "Nacimiento", e.target.value)}
                              placeholder="DD/MM/YYYY"
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-blue-500 focus:outline-none text-sm"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input 
                              type="checkbox"
                              checked={al.Repite === true || al.Repite === "true"}
                              onChange={(e) => handleUpdateAlumno(idx, "Repite", e.target.checked)}
                              className="accent-blue-500"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="email"
                              value={al.email || ""}
                              onChange={(e) => handleUpdateAlumno(idx, "email", e.target.value)}
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 pr-2">
                            <input 
                              type="text"
                              value={al.Movil || ""}
                              onChange={(e) => handleUpdateAlumno(idx, "Movil", e.target.value)}
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleRemoveAlumno(idx)}
                              className="text-red-400 hover:text-red-300 font-bold"
                              title="Eliminar Alumno"
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
                    onClick={handleAddAlumno}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <span>+</span> Añadir Alumno
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "empresas" && (
            <div className="p-12 text-center text-muted border border-[var(--glass-border)] rounded-xl bg-foreground/5">
              <h2 className="text-2xl font-bold mb-4">Empresas FEOE</h2>
              <p>Esta sección estará disponible próximamente para gestionar la asignación de empresas y tutores duales.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
