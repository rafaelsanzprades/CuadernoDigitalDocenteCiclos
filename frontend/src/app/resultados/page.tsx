"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { RaOgMatrix } from "@/components/features/resultados/RaOgMatrix";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { useAppStore } from "@/store/useAppStore";

export default function ResultadosPage() {
  const { activeModuleId, setModuleData } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeModuleId) {
      setLoading(false);
      return;
    }
    
    fetch(`/api/module/${activeModuleId}`)
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") {
          setModuleData(json.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeModuleId, setModuleData]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background relative">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen items-center justify-center text-foreground">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
          <p>Sincronizando datos...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background relative">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix="Contribución RA->OG" />
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-8 pb-12">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                🎯 Contribución RA-&gt;OG
              </h1>
              <p className="text-muted mt-2 text-lg">Definición de los Resultados de Aprendizaje y su contribución a los Objetivos Generales del Título.</p>
            </div>
            
            <RaOgMatrix />
            
          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
