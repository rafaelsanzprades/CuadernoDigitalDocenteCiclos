"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { GeneralTab } from "@/components/features/modulo/GeneralTab";
import { HorariosTab } from "@/components/features/modulo/HorariosTab";
import { EvaluacionTab } from "@/components/features/modulo/EvaluacionTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export default function ModuloConfigPage() {
  const { activeModuleId, moduleData, setModuleData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetch(`/api/module/${activeModuleId}`)
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") setModuleData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeModuleId, setModuleData]);

  const TABS = [
    { id: "general", label: "📄 Datos generales", cleanLabel: "Datos generales" },
    { id: "horarios", label: "🕒 Horarios y fechas", cleanLabel: "Horarios y fechas" },
    { id: "evaluacion", label: "⚖️ Evaluación", cleanLabel: "Evaluación" }
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  if (loading || !moduleData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen items-center justify-center text-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
          <p>Conectando con el servidor local...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <div className="flex-1 p-8 pt-4 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-8 pb-12">

            {/* ── Título ─────────────────────────────────────────── */}
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3 mb-1">
                ⚙️ Módulo
              </h1>
              <p className="text-muted mt-1">Configuración básica del módulo didáctico.</p>
            </div>

            <div className="flex border-b border-[var(--glass-border)] mt-6 mb-8 overflow-x-auto scrollbar-hide">
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

            {activeTab === "general" && <GeneralTab />}
            {activeTab === "horarios" && <HorariosTab />}
            {activeTab === "evaluacion" && <EvaluacionTab />}

          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
