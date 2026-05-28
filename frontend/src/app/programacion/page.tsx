"use client";
import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { useModule } from "@/hooks/useApi";
import { SessionTable } from "@/components/features/programacion/SessionTable";
import { TaskTable } from "@/components/features/programacion/TaskTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";


export default function ProgramacionPage() {
  const { activeModuleId, moduleData, updateDataFrame } = useAppStore();
  const { isLoading } = useModule(activeModuleId);
  const [allUdsOpen, setAllUdsOpen] = useState(true);

  const TABS = [
    { id: "secuenciacion", label: "📋 Secuenciación de UD", cleanLabel: "Secuenciación de UD" },
    { id: "tareas", label: "🎯 Tareas competenciales", cleanLabel: "Tareas competenciales" }
  ];

  const [activeTab, setActiveTab] = useState("secuenciacion");
  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;



  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId) return;

    const udId = source.droppableId;
    const newSesiones = [...(moduleData?.df_sesiones || [])];
    
    const udSesiones = newSesiones.filter(s => s.id_ud === udId).sort((a, b) => (Number(a.Num_Orden) || 0) - (Number(b.Num_Orden) || 0));
    
    const [moved] = udSesiones.splice(source.index, 1);
    udSesiones.splice(destination.index, 0, moved);
    
    udSesiones.forEach((ses, idx) => {
      ses.Num_Orden = idx + 1;
    });
    
    updateDataFrame("df_sesiones", newSesiones);
  };

  if (!activeModuleId) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 p-8">
            <Card className="p-12 text-center text-muted flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold mb-4">No hay módulo seleccionado</h2>
              <p className="text-muted">Por favor, ve a la sección de Datos y selecciona un módulo PD.</p>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (isLoading || !moduleData) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-xl text-accent animate-pulse">Cargando programación de aula...</div>
          </main>
        </div>
      </div>
    );
  }

  const df_ud = moduleData?.df_ud || [];
  const df_sesiones = moduleData?.df_sesiones || [];
  const df_tareas = moduleData?.df_tareas || [];

  const handleAddSesion = (ud_id: string) => {
    const newSesiones = [...df_sesiones];
    const newId = `SES${(newSesiones.length + 1).toString().padStart(3, '0')}`;
    const udSesiones = newSesiones.filter(s => s.id_ud === ud_id);
    const numOrden = udSesiones.length > 0 ? Math.max(...udSesiones.map(s => Number(s.Num_Orden) || 0)) + 1 : 1;
    
    newSesiones.push({
      ID: newId,
      id_ud: ud_id,
      Num_Orden: numOrden,
      Horas: 1,
      Tipo_Actividad: "Tª (Teoria)",
      RA_CE: "",
      Contenidos: "",
      Aspectos_Clave: "",
      Recursos: ""
    });
    updateDataFrame("df_sesiones", newSesiones);
  };

  const handleUpdateSesion = (globalIdx: number, field: string, value: any) => {
    const newSesiones = [...df_sesiones];
    (newSesiones[globalIdx] as any)[field] = value;
    updateDataFrame("df_sesiones", newSesiones);
  };

  const handleDeleteSesion = (globalIdx: number) => {
    const newSesiones = [...df_sesiones];
    newSesiones.splice(globalIdx, 1);
    updateDataFrame("df_sesiones", newSesiones);
  };

  const handleAddTarea = () => {
    const newTareas = [...df_tareas];
    const newId = `TC${(newTareas.length + 1).toString().padStart(2, '0')}`;
    newTareas.push({
      ID: newId,
      Nombre_Tarea: "",
      Reto: "",
      RA_Asociados: "",
      Instrumento: ""
    });
    updateDataFrame("df_tareas", newTareas);
  };

  const handleUpdateTarea = (globalIdx: number, field: string, value: any) => {
    const newTareas = [...df_tareas];
    (newTareas[globalIdx] as any)[field] = value;
    updateDataFrame("df_tareas", newTareas);
  };

  const handleDeleteTarea = (globalIdx: number) => {
    const newTareas = [...df_tareas];
    newTareas.splice(globalIdx, 1);
    updateDataFrame("df_tareas", newTareas);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        
        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          <div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              📚 Programación de aula
            </h1>
            <p className="text-muted mt-2 text-lg">Secuenciación temporal de las unidades didácticas y diseño de tareas competenciales.</p>
          </div>

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

          {activeTab === "secuenciacion" && (
            <Card className="p-6 border-t-4 border-t-accent">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
<span>📋</span> Secuenciación por Unidades didácticas
</h2>
                <Button
                  variant="ghost"
                  onClick={() => setAllUdsOpen(prev => !prev)}
                  className="text-sm border border-[var(--glass-border)]"
                >
                  <span>{allUdsOpen ? '▲' : '▼'}</span>
                  {allUdsOpen ? 'Colapsar todas' : 'Expandir todas'}
                </Button>
              </div>

              <SessionTable 
                df_ud={df_ud}
                df_sesiones={df_sesiones}
                onDragEnd={onDragEnd}
                handleUpdateSesion={handleUpdateSesion}
                handleAddSesion={handleAddSesion}
                handleDeleteSesion={handleDeleteSesion}
                allUdsOpen={allUdsOpen}
              />
            </Card>
          )}

          {activeTab === "tareas" && (
            <Card className="p-6 border-t-4 border-t-blue-500">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-6">
<span>🎯</span> Diseño de tareas competenciales (TC)
</h2>
              <TaskTable 
                df_tareas={df_tareas}
                handleUpdateTarea={handleUpdateTarea}
                handleAddTarea={handleAddTarea}
                handleDeleteTarea={handleDeleteTarea}
              />
            </Card>
          )}

        </main>
      </div>
    </div>
  );
}
