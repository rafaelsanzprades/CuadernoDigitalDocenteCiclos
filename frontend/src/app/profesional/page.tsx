"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrientacionTab } from "@/components/features/profesional/OrientacionTab";
import { ResumenTab } from "@/components/features/profesional/ResumenTab";
import { TendenciasTab } from "@/components/features/profesional/TendenciasTab";
import { PanoramaTab } from "@/components/features/profesional/PanoramaTab";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const TABS = [
  { id: "perfil",     label: "🧭 Perfil individual",    cleanLabel: "Perfil individual" },
  { id: "resumen",    label: "📋 Resumen del alumnado",  cleanLabel: "Resumen del alumnado" },
  { id: "tendencias", label: "📊 Mapa de tendencias",    cleanLabel: "Mapa de tendencias" },
  { id: "panorama",   label: "🗺️ Panorama profesional", cleanLabel: "Panorama profesional" },
];

export default function ProfesionalPage() {
  const { activeCursoId, cursoData, setCursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("perfil");

  const activeTabCleanLabel = TABS.find((t) => t.id === activeTab)?.cleanLabel;

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
        console.error("Error fetching curso data:", err);
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

  // ── No curso selected ─────────────────────────────────────────────────────
  if (!activeCursoId) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8">
            <Card className="p-12 text-center flex flex-col items-center gap-4">
              <span className="text-5xl">🎓</span>
              <h2 className="text-2xl font-bold text-foreground">No hay Curso activo seleccionado</h2>
              <p className="text-muted max-w-md">
                Ve a <strong>📂 Entorno de trabajo</strong> y selecciona un Curso activo para acceder a las fichas de orientación profesional.
              </p>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading || !cursoData) {
    return <LoadingSpinner text="Cargando datos de orientación..." />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <main className="flex-1 p-8 overflow-y-auto scrollbar-hide space-y-6">

          {/* Page header */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                🧭 Orientación profesional
              </h1>
              <p className="text-muted mt-2 text-lg">
                Ficha individual de orientación, intereses, aspiraciones e inserción laboral por alumno.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {saveMessage && (
                <span
                  className={`text-sm font-semibold ${
                    saveMessage.includes("Error") ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {saveMessage}
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-accent text-background hover:bg-accent/80 font-bold px-6 py-2 rounded-xl flex items-center gap-2"
              >
                {saving ? "Guardando..." : "Guardar cambios 💾"}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--glass-border)] overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "perfil"     && <OrientacionTab />}
          {activeTab === "resumen"    && <ResumenTab />}
          {activeTab === "tendencias" && <TendenciasTab />}
          {activeTab === "panorama"   && <PanoramaTab />}

        </main>
      </div>
    </div>
  );
}
