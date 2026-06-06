import { BookOpen, ChevronDown, ChevronUp, Filter } from "lucide-react";
import React from 'react';
import { CourseGroup, ModuleAssignment } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface Teacher {
  id: number;
  name: string;
}

interface GroupListProps {
  viewDegreeId: string;
  displayedGroups: CourseGroup[];
  collapsedGroups: Set<number>;
  toggleGroup: (groupId: number) => void;
  teachers: Teacher[];
  handleAssignTeacher: (groupId: number, moduleId: number, teacherId: string) => void;
  onOpenModal: () => void;
}

export function GroupList({
  viewDegreeId,
  displayedGroups,
  collapsedGroups,
  toggleGroup,
  teachers,
  handleAssignTeacher,
  onOpenModal
}: GroupListProps) {

  if (!viewDegreeId) {
    return (
      <Card className="p-12 text-center text-muted flex flex-col items-center justify-center">
        <Filter className="w-12 h-12 mb-4 text-foreground/20" />
        <p className="text-lg">Selecciona una Familia y un Título para ver sus módulos.</p>
      </Card>
    );
  }

  if (displayedGroups.length === 0) {
    return (
      <Card className="p-12 text-center text-muted flex flex-col items-center justify-center">
        <BookOpen className="w-12 h-12 mb-4 text-foreground/20" />
        <p className="text-lg">No hay grupos registrados para este Título.</p>
        <button onClick={onOpenModal} className="mt-4 text-accent hover:text-accent/80 transition-colors">Añadir un nuevo grupo</button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {displayedGroups.map(group => {
        const isCollapsed = collapsedGroups.has(group.id);
        const unassigned = group.modules.filter((m: ModuleAssignment) => !m.assignedTeacherId).length;
        
        return (
          <Card key={group.id}>
            {/* Cabecera del Grupo */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full bg-foreground/5 border-b border-[var(--glass-border)] p-5 flex items-center justify-between hover:bg-white/8 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {isCollapsed ? <ChevronDown className="w-5 h-5 text-muted shrink-0" /> : <ChevronUp className="w-5 h-5 text-accent shrink-0" />}
                <div>
                  <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground">
<BookOpen className="w-5 h-5 text-accent" />
                    {group.name}
</h2>
                  <div className="text-sm text-muted mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-foreground/10 text-xs">{group.level}</span>
                    <span>{group.degreeName}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {unassigned > 0 && (
                  <Badge variant="danger">{unassigned} sin asignar</Badge>
                )}
                <div className="text-right text-sm">
                  <div className="text-muted text-xs">Módulos</div>
                  <div className="text-xl font-bold text-foreground">{group.modules.length}</div>
                </div>
              </div>
            </button>

            {/* Lista de Módulos */}
            {!isCollapsed && (
              <div className="p-4 space-y-3 animate-in slide-in-from-top-1 duration-200">
                {group.modules.map((module: ModuleAssignment) => (
                  <div key={module.id} className="bg-foreground/10 rounded-lg p-3 border border-white/5 hover:border-[var(--glass-border)] transition-colors flex flex-col gap-1.5">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-accent font-mono text-sm font-semibold">{module.code}</span>
                        <h3 className="text-base font-medium text-foreground">{module.name}</h3>
                        {module.isDual && <Badge variant="info">Feoe</Badge>}
                      </div>
                      <div className="text-muted text-sm font-semibold shrink-0">
                        {module.hours}h
                      </div>
                    </div>

                    <div className="pl-10">
                      <div className={`relative rounded transition-colors w-full sm:w-2/3 md:w-1/2 max-w-xs ${!module.assignedTeacherId ? 'border border-danger/30 bg-danger/10' : 'border border-transparent hover:border-[var(--glass-border)] hover:bg-foreground/5'}`}>
                        {!module.assignedTeacherId && (
                          <div className="absolute -left-1.5 -top-1.5 w-2.5 h-2.5 bg-danger rounded-full animate-pulse" title="Falta asignación" />
                        )}
                        <select
                          value={module.assignedTeacherId || ""}
                          onChange={(e) => handleAssignTeacher(group.id, module.id, e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-sm text-foreground/80 focus:ring-0 p-1 appearance-none cursor-pointer"
                        >
                          <option value="" className="text-muted">Sin profesor/a asignado</option>
                          {teachers.map(t => (
                            <option key={t.id} value={t.id} className="bg-gray-900">{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {module.ras && module.ras.length > 0 && (
                      <details className="group pl-10 mt-1">
                        <summary className="cursor-pointer text-xs font-semibold text-muted hover:text-foreground flex items-center justify-between list-none select-none transition-colors py-1">
                          <div className="flex items-center gap-1.5">
                            <span className="group-open:rotate-90 transition-transform text-[8px] bg-foreground/10 p-0.5 rounded flex items-center justify-center">▶</span>
                            Resultados de aprendizaje
                          </div>
                          <span className="text-accent text-xs">{module.ras.length} RA</span>
                        </summary>
                        <div className="mt-1.5 space-y-1.5 bg-foreground/20 p-2.5 rounded border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                          {module.ras.map((ra: any, idx: number) => (
                            <div key={idx} className="text-xs text-muted flex gap-2 w-full leading-tight">
                              <span className="font-bold text-accent shrink-0">RA{ra.raNumber}.</span>
                              <span>{ra.description}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
