"use client";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { AttendanceGrid } from "@/components/features/seguimiento/AttendanceGrid";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

export default function AsistenciaPage() {
  const { activeModuleId, cursoData } = useAppStore();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen min-w-0">
        <Header breadcrumbSuffix="Control de asistencia" />
        
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3 mb-2 animate-in slide-in-from-left-4 duration-500">
                <Users className="w-10 h-10 text-accent" /> Control de asistencia
              </h1>
              <p className="text-muted text-lg">
                Pasa lista rápidamente con un solo clic. Los cambios se guardan automáticamente.
              </p>
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
                  <Link href="/" className="glass-button bg-accent/10 text-accent hover:bg-accent/20 px-6 py-3 rounded-lg font-bold flex items-center gap-2">
                    Ir al panel de control <span className="text-xl">⚙️</span>
                  </Link>
                }
              />
            ) : (
              <AttendanceGrid />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
