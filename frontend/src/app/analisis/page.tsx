// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { AnalisisGrupalTab } from "@/components/features/analisis/AnalisisGrupalTab";
import { AnalisisIndividualTab } from "@/components/features/analisis/AnalisisIndividualTab";

export default function AnalisisPage() {
  const { activeModuleId, moduleData, activeCursoId, cursoData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("grupal");

  useEffect(() => {
    if ((activeModuleId && !moduleData) || (activeCursoId && !cursoData)) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [activeModuleId, moduleData, activeCursoId, cursoData]);

  if (!activeCursoId || !activeModuleId) {
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
            <div className="text-xl text-blue-400 animate-pulse">Cargando analíticas...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <main className="flex-1 p-8 content-area space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              📉 Análisis
            </h1>
            <p className="text-muted mt-2 text-lg">Visualiza estadísticas globales o analiza el progreso individual de cada alumno.</p>
          </div>

          <div className="flex border-b border-[var(--glass-border)] overflow-x-auto scrollbar-hide">
            {[
              { id: "grupal", label: "👥 Grupal" },
              { id: "individual", label: "👤 Individual" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-muted hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "grupal" && <AnalisisGrupalTab />}
          {activeTab === "individual" && <AnalisisIndividualTab />}

        </main>
      </div>
    </div>
  );
}
