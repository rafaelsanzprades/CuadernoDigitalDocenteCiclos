"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { DatosTab } from "@/components/features/modulo/DatosTab";
import { FeoeTab } from "@/components/features/modulo/FeoeTab";
import { ContextoTab } from "@/components/features/modulo/ContextoTab";
import { PlanesTab } from "@/components/features/modulo/PlanesTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default function ModuloConfigPage() {
  const { activeModuleId, moduleData, setModuleData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("datos");

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
    { id: "datos", label: "📄 Datos", cleanLabel: "Datos del módulo" },
    { id: "feoe", label: "🏢 Formación en Empresa (FEOE)", cleanLabel: "Formación en Empresa (FEOE)" },
    { id: "contexto", label: "📝 Contexto", cleanLabel: "Contexto" },
    { id: "planes", label: "📄 Planes", cleanLabel: "Planes" }
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

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-8 pb-12">

            {/* ── Título ─────────────────────────────────────────── */}
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                ⚙️ Módulo didáctico
              </h1>
              <p className="text-muted mt-2 text-lg">Configuración básica del módulo didáctico.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-2 max-w-full">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {activeTab === "datos" && <DatosTab />}
            {activeTab === "feoe" && <FeoeTab />}
            {activeTab === "contexto" && <ContextoTab />}
            {activeTab === "planes" && <PlanesTab />}

          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
