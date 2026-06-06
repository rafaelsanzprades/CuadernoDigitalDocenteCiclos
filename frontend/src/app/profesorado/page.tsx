"use client";
import { ClipboardList, School, Shield, UserCircle, Users } from "lucide-react";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { AccesoUsuariosTab } from "@/components/features/profesorado/AccesoUsuariosTab";
import { GestionUsuariosTab } from "@/components/features/profesorado/GestionUsuariosTab";
import { AsignacionDocentesTab } from "@/components/features/profesorado/AsignacionDocentesTab";
import { AsignacionModulosTab } from "@/components/features/profesorado/AsignacionModulosTab";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default function ProfesoradoPage() {
  const [activeTab, setActiveTab] = useState("acceso");

  const TABS = [
    { id: "acceso", label:  <span className="flex items-center gap-2"><Shield className="w-4 h-4 shrink-0" /> Acceso usuarios</span>, cleanLabel: "Acceso usuarios" },
    { id: "gestion", label:  <span className="flex items-center gap-2"><Users className="w-4 h-4 shrink-0" /> Gestión de usuarios</span>, cleanLabel: "Gestión de usuarios" },
    { id: "asignacion_docentes", label:  <span className="flex items-center gap-2"><School className="w-4 h-4 shrink-0"/> ‍ Asignación de docentes</span>, cleanLabel:"Asignación de docentes" },
    { id: "asignacion_modulos", label:  <span className="flex items-center gap-2"><ClipboardList className="w-4 h-4 shrink-0" /> Asignación de módulos</span>, cleanLabel: "Asignación de módulos" }
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

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
                ‍<span className="inline-flex"><School className="w-[1.2em] h-[1.2em] mr-1" /></span> Profesorado
              </h1>
              <p className="text-muted mt-2 text-lg">Administración del profesorado, perfiles y asignaciones docentes.</p>
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

            {activeTab === "acceso" && <AccesoUsuariosTab />}
            {activeTab === "gestion" && <GestionUsuariosTab />}
            {activeTab === "asignacion_docentes" && <AsignacionDocentesTab />}
            {activeTab === "asignacion_modulos" && <AsignacionModulosTab />}

          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
