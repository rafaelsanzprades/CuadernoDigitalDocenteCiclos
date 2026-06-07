"use client";
import { CheckCircle2, ClipboardList, Plus, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useUsers, useFamilies, useLearningOutcomes } from "@/hooks/useApi";
import { CourseGroup, ModuleAssignment } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { GroupList } from "@/components/features/asignaciones/GroupList";
import { AddGroupModal } from "@/components/features/asignaciones/AddGroupModal";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export default function AsignacionesPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>}>
      <AsignacionesContent />
    </React.Suspense>
  );
}

function AsignacionesContent() {
  const { groups, setGroups } = useAppStore();
  const searchParams = useSearchParams();
  const initialFamilyId = searchParams.get("familyId");
  const initialDegreeId = searchParams.get("degreeId");

  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const { data: usersData } = useUsers();
  const { data: familiesData } = useFamilies();
  const { data: rasData } = useLearningOutcomes();

  const teachers = usersData?.map((u: any) => ({ id: u.id, name: u.name })) || [];
  const families = familiesData || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [selectedDegreeId, setSelectedDegreeId] = useState("");

  const [viewFamilyId, setViewFamilyId] = useState("");
  const [viewDegreeId, setViewDegreeId] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());

  const toggleGroup = (groupId: number) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  useEffect(() => {
    if (initialFamilyId) setViewFamilyId(initialFamilyId);
    if (initialDegreeId) setViewDegreeId(initialDegreeId);
  }, [initialFamilyId, initialDegreeId]);

  useEffect(() => {
    if (rasData) {
      setGroups((prevGroups: CourseGroup[]) => prevGroups.map((g: CourseGroup) => ({
        ...g,
        modules: g.modules.map((m: ModuleAssignment) => ({
          ...m,
          ras: rasData[m.code] || m.ras || []
        }))
      })));
    }
  }, [rasData, setGroups]);

  const handleAssignTeacher = (groupId: number, moduleId: number, teacherId: string) => {
    setGroups((prev: CourseGroup[]) => prev.map((g: CourseGroup) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        modules: g.modules.map((m: ModuleAssignment) => {
          if (m.id !== moduleId) return m;
          return { ...m, assignedTeacherId: teacherId ? Number(teacherId) : null };
        })
      };
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setHasChanges(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }, 1000);
  };

  const handleAddGroup = () => {
    if (!newGroupName || !selectedDegreeId) return;
    const family = families.find((f: any) => f.id.toString() === selectedFamilyId);
    const degree = family?.degrees.find((d: any) => d.id.toString() === selectedDegreeId);

    const newGroup: CourseGroup = {
      id: Date.now(),
      name: newGroupName,
      degreeName: degree ? degree.name : "Desconocido",
      level: degree ? degree.level : "Grado",
      modules: []
    };

    setGroups([...groups, newGroup]);
    setIsModalOpen(false);
    setNewGroupName("");
    setSelectedFamilyId("");
    setSelectedDegreeId("");
    setHasChanges(true);
  };

  const viewFamily = families.find((f: any) => f.id.toString() === viewFamilyId);
  const viewDegree = viewFamily?.degrees.find((d: any) => d.id.toString() === viewDegreeId);

  const displayedGroups = viewDegree
    ? groups.filter((g: CourseGroup) => {
        const clean = (str: string) => 
          str.toLowerCase().replace(/^[a-z0-9]+\s*-\s*/i, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        return clean(g.degreeName) === clean(viewDegree.name);
      })
    : [];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <div className="flex-1 p-8 pt-4 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="w-full space-y-6 pb-12">
            
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3 mb-2">
                  <span className="text-3xl"><span className="inline-flex"><ClipboardList className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Asignación de módulos
                </h1>
                <p className="text-muted mt-2 text-lg">Jefatura de Estudios: Asigna el profesorado a los módulos de cada ciclo formativo.</p>
              </div>
              <Button 
                onClick={handleSave}
                disabled={!hasChanges && saveStatus !== "saved"}
                variant={saveStatus === "saved" ? "success" : hasChanges ? "primary" : "ghost"}
                className={saveStatus === "saved" ? "bg-success/10 text-success border-success/30" : ""}
              >
                {saveStatus === "saving" ? (
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                ) : saveStatus === "saved" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>
                  {saveStatus === "saving" ? "Guardando..." : 
                   saveStatus === "saved" ? "¡Guardado!" : 
                   "Guardar Cambios"}
                </span>
              </Button>
              
              <Button onClick={() => setIsModalOpen(true)} variant="secondary">
                <Plus className="w-5 h-5" />
                <span>Añadir Grupo</span>
              </Button>
            </div>

            {/* Filtros Superiores */}
            <Card className="p-5 flex flex-col md:flex-row gap-4 mb-2">
              <Select 
                label="Familia Profesional"
                value={viewFamilyId}
                onChange={(e) => { setViewFamilyId(e.target.value); setViewDegreeId(""); }}
              >
                <option value="">-- Selecciona Familia --</option>
                {families.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </Select>

              <Select 
                label="Grado y Título"
                value={viewDegreeId}
                onChange={(e) => setViewDegreeId(e.target.value)}
                disabled={!viewFamilyId}
              >
                <option value="">-- Selecciona Título --</option>
                {viewFamily?.degrees.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.level} - {d.name}</option>
                ))}
              </Select>
            </Card>

            <GroupList 
              viewDegreeId={viewDegreeId}
              displayedGroups={displayedGroups}
              collapsedGroups={collapsedGroups}
              toggleGroup={toggleGroup}
              teachers={teachers}
              handleAssignTeacher={handleAssignTeacher}
              onOpenModal={() => setIsModalOpen(true)}
            />

          </MotionWrapper>
        </div>

        <AddGroupModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          families={families}
          selectedFamilyId={selectedFamilyId}
          setSelectedFamilyId={setSelectedFamilyId}
          selectedDegreeId={selectedDegreeId}
          setSelectedDegreeId={setSelectedDegreeId}
          newGroupName={newGroupName}
          setNewGroupName={setNewGroupName}
          handleAddGroup={handleAddGroup}
        />

      </main>
    </div>
  );
}
