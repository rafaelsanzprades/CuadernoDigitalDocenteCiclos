"use client";
import { BarChart, Calendar } from "lucide-react";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { DashboardKPIs } from "@/components/features/dashboard/DashboardKPIs";
import { DashboardCharts } from "@/components/features/dashboard/DashboardCharts";
import { TodayClasses } from "@/components/features/dashboard/TodayClasses";
import { EmptyState } from "@/components/ui/EmptyState";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { WelcomeWizard } from "@/components/features/dashboard/WelcomeWizard";
import { useModulesList } from "@/hooks/useApi";
import { useEffect } from "react";
import { PlanificacionMensualTab } from "@/components/features/dashboard/PlanificacionMensualTab";
import { WeeklyClasses } from "@/components/features/dashboard/WeeklyClasses";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default function HoyPage() {
  const { moduleData, cursoData, setModuleData, setCursoData, isWizardOpen, setWizardOpen, activeModuleId, setActiveModuleId, activeCursoId, setActiveCursoId } = useAppStore();
  const [activeTab, setActiveTab] = useState("actual");
  const { data: modulesList, mutate: fetchModules } = useModulesList();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeModuleId && !moduleData) {
          const res = await fetch(`/api/module/${activeModuleId}`);
          const data = await res.json();
          if (data.status === "success") setModuleData(data.data);
        }
        if (activeCursoId && !cursoData) {
          const res = await fetch(`/api/module/${activeCursoId}`);
          const data = await res.json();
          if (data.status === "success") setCursoData(data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if ((activeModuleId && !moduleData) || (activeCursoId && !cursoData)) {
      fetchData();
    }
  }, [activeModuleId, moduleData, activeCursoId, cursoData, setModuleData, setCursoData]);

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
    { id: "actual", label: <><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span> Actual</>, cleanLabel: "Actual" },
    { id: "resumen", label: <><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span> Resumen</>, cleanLabel: "Resumen" }
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
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span> Tu día y semana
              </h1>
              <p className="text-muted mt-2 text-lg">Revisa lo que toca impartir hoy y el estado general de tu clase.</p>
            </div>

            {/* Pestañas */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-2 max-w-full">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

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
                    description="Selecciona o crea una Programación y Curso en Entorno de trabajo para ver las analíticas."
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
