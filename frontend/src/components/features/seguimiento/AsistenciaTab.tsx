"use client";
import { BarChart2, ClipboardEdit, Settings, Users } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { AttendanceGrid } from "@/components/features/seguimiento/AttendanceGrid";
import { AttendanceAccumulated } from "@/components/features/seguimiento/AttendanceAccumulated";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

export function AsistenciaTab() {
  const { activeModuleId, cursoData } = useAppStore();
  const [activeTab, setActiveTab] = useState("hoy");

  const TABS = [
    { id: "hoy", label: <span className="flex items-center gap-2"><ClipboardEdit className="w-4 h-4"/> Hoy</span>, cleanLabel: "Hoy" },
    { id: "acumulado", label: <span className="flex items-center gap-2"><BarChart2 className="w-4 h-4"/> Acumulado trimestral</span>, cleanLabel: "Acumulado trimestral" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-[1.1rem] font-bold flex items-center gap-3 text-foreground">
          <Users className="w-8 h-8 text-accent" /> Control de asistencia
        </h2>
        <p className="text-muted mt-2">
          Pasa lista diaria o revisa el estado acumulado de las faltas y las alertas PdEvC.
        </p>
      </div>

      <div className="flex border-b border-[var(--glass-border)] overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-foreground'}`}
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
              Para pasar lista necesitas tener un Curso activo con alumnado matriculados.
            </>
          }
          action={
            <Link href="/entorno" className="glass-button bg-accent/10 text-accent hover:bg-accent/20 px-6 py-3 rounded-lg font-bold flex items-center gap-2">
              Ir al Entorno de Trabajo <Settings className="w-5 h-5" />
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
  );
}
