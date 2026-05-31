"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { DashboardKPIs } from "@/components/features/dashboard/DashboardKPIs";
import { DashboardCharts } from "@/components/features/dashboard/DashboardCharts";
import { TodayClasses } from "@/components/features/dashboard/TodayClasses";
import { EmptyState } from "@/components/ui/EmptyState";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Calendar } from "lucide-react";
import { WelcomeWizard } from "@/components/features/dashboard/WelcomeWizard";
import { useModulesList } from "@/hooks/useApi";
import { useEffect } from "react";
import { PlanificacionMensualTab } from "@/components/features/dashboard/PlanificacionMensualTab";
import { WeeklyClasses } from "@/components/features/dashboard/WeeklyClasses";

export default function HoyPage() {
  const { moduleData, cursoData, isWizardOpen, setWizardOpen, activeModuleId, setActiveModuleId, setActiveCursoId } = useAppStore();
  const [activeTab, setActiveTab] = useState("actual");
  const { data: modulesList, mutate: fetchModules } = useModulesList();

  useEffect(() => {
    if (modulesList) {
      if ((!modulesList.pd_modules || modulesList.pd_modules.length === 0) && !activeModuleId) {
        setWizardOpen(true);
      } else {
        setWizardOpen(false);
      }
    }
  }, [modulesList, activeModuleId, setWizardOpen]);

  const TABS = [
    { id: "actual", label: "📅 Actual", cleanLabel: "Actual" },
    { id: "resumen", label: "📊 Resumen", cleanLabel: "Resumen" }
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  return (
    <div className="flex min-h-screen bg-background relative">
      {isWizardOpen && (
        <WelcomeWizard
          onComplete={() => setWizardOpen(false)}
          fetchModules={fetchModules}
          setActiveModuleId={setActiveModuleId}
          setActiveCursoId={setActiveCursoId}
        />
      )}
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <div className="w-full space-y-8 pb-12">

            {/* Título */}
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                📅 Tu día y semana
              </h1>
              <p className="text-muted mt-2 text-lg">Revisa lo que toca impartir hoy y el estado general de tu clase.</p>
            </div>

            {/* Pestañas */}
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

            {/* Contenido Pestaña Actual */}
            {activeTab === "actual" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                {/* 1. Hoy */}
                <TodayClasses />

                {/* 2. Semana */}
                <WeeklyClasses />

                {/* 3. Curso */}
                <div className="pt-4 border-t border-[var(--glass-border)]">
                  <PlanificacionMensualTab />
                </div>
              </div>
            )}

            {/* Contenido Pestaña Resumen */}
            {activeTab === "resumen" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {moduleData || cursoData ? (
                  <MotionWrapper className="space-y-6">
                    <DashboardKPIs cursoData={cursoData} moduleData={moduleData} />
                    <DashboardCharts cursoData={cursoData} />
                  </MotionWrapper>
                ) : (
                  <EmptyState
                    title="No hay datos de resumen"
                    description="Selecciona o crea una Programación y Curso en Gestión > Entorno de trabajo para ver las analíticas."
                    icon={Calendar}
                  />
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
