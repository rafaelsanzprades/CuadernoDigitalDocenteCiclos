"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { AttendanceGrid } from "@/components/features/seguimiento/AttendanceGrid";
import { AttendanceAccumulated } from "@/components/features/seguimiento/AttendanceAccumulated";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

export default function AsistenciaPage() {
  const { activeModuleId, cursoData } = useAppStore();
  const [activeTab, setActiveTab] = useState("hoy");

  const TABS = [
    { id: "hoy", label: "📝 Hoy", cleanLabel: "Hoy" },
    { id: "acumulado", label: "📊 Acumulado trimestral", cleanLabel: "Acumulado trimestral" }
  ];
  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen min-w-0">
        <Header breadcrumbSuffix={`Control de asistencia - ${activeTabCleanLabel}`} />
        
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="w-full space-y-8 pb-12">
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Users className="w-10 h-10 text-accent" /> Control de asistencia
              </h1>
              <p className="text-muted mt-2 text-lg">
                Pasa lista diaria o revisa el estado acumulado de las faltas y las alertas PdEvC.
              </p>
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

            {(!activeModuleId || !cursoData) ? (
              <EmptyState
                icon={Users}
                title="Ningún curso activo"
                description={
                  <>
                    Para pasar lista necesitas tener un Curso activo con alumnos matriculados.
                  </>
                }
                action={
                  <Link href="/gestion/entorno" className="glass-button bg-accent/10 text-accent hover:bg-accent/20 px-6 py-3 rounded-lg font-bold flex items-center gap-2">
                    Ir al Entorno de Trabajo <span className="text-xl">⚙️</span>
                  </Link>
                }
              />
            ) : (
              <>
                {activeTab === "hoy" && <AttendanceGrid />}
                {activeTab === "acumulado" && <AttendanceAccumulated />}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
