"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useSearchParams } from "next/navigation";
import { Search, Save, Filter, BookOpen, Clock, Users, ShieldAlert, CheckCircle2, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

type Teacher = {
  id: number;
  name: string;
};

type Module = {
  id: number;
  code: string;
  name: string;
  hours: number;
  isDual: boolean;
  assignedTeacherId: number | null;
  ras?: { raNumber: number; description: string }[];
};

type CourseGroup = {
  id: number;
  name: string;
  degreeName: string;
  level: string;
  modules: Module[];
};

export default function AsignacionesPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#0b1120] flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>}>
      <AsignacionesContent />
    </React.Suspense>
  );
}

function AsignacionesContent() {
  const { groups, setGroups } = useAppStore();
  const searchParams = useSearchParams();
  const initialFamilyId = searchParams.get("familyId");
  const initialDegreeId = searchParams.get("degreeId");

  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
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
    fetch("/api/users")
      .then(res => res.json())
      .then(json => {
        if(json.status === "success") {
          const formattedTeachers = json.data.map((u: any) => ({
            id: u.id,
            name: u.name
          }));
          setTeachers(formattedTeachers);
        }
      });

    fetch("/api/families")
      .then(res => res.json())
      .then(json => {
        if(json.status === "success") {
          setFamilies(json.data);
        }
      });

    fetch("/api/learning_outcomes")
      .then(res => res.json())
      .then(json => {
        if(json.status === "success") {
          const rasMap = json.data;
          setGroups(prevGroups => prevGroups.map(g => ({
            ...g,
            modules: g.modules.map(m => ({
              ...m,
              ras: rasMap[m.code] || m.ras || []
            }))
          })));
        }
      });
  }, []);

  const handleAssignTeacher = (groupId: number, moduleId: number, teacherId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        modules: g.modules.map(m => {
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

  const calculateHours = (teacherId: number) => {
    let total = 0;
    groups.forEach(g => {
      g.modules.forEach(m => {
        if (m.assignedTeacherId === teacherId) total += m.hours;
      });
    });
    return total;
  };

  const handleAddGroup = () => {
    if (!newGroupName || !selectedDegreeId) return;
    const family = families.find(f => f.id.toString() === selectedFamilyId);
    const degree = family?.degrees.find((d: any) => d.id.toString() === selectedDegreeId);

    const newGroup: CourseGroup = {
      id: Date.now(),
      name: newGroupName,
      degreeName: degree ? degree.name : "Desconocido",
      level: degree ? degree.level : "Grado",
      modules: [] // Módulos vacíos por ahora
    };

    setGroups([...groups, newGroup]);
    setIsModalOpen(false);
    setNewGroupName("");
    setSelectedFamilyId("");
    setSelectedDegreeId("");
    setHasChanges(true);
  };

  const viewFamily = families.find(f => f.id.toString() === viewFamilyId);
  const viewDegree = viewFamily?.degrees.find((d: any) => d.id.toString() === viewDegreeId);

  const displayedGroups = viewDegree
    ? groups.filter(g => {
        const clean = (str: string) => 
          str.toLowerCase()
             .replace(/^[a-z0-9]+\s*-\s*/i, "")
             .normalize("NFD")
             .replace(/[\u0300-\u036f]/g, "")
             .trim();
        return clean(g.degreeName) === clean(viewDegree.name);
      })
    : [];

  return (
    <div className="flex min-h-screen bg-[#0b1120]">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <div className="flex-1 p-8 pt-4 overflow-y-auto scrollbar-hide">
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-2">
                  <span className="text-3xl">📋</span> Asignación de módulos
                </h1>
                <p className="text-gray-400">Jefatura de Estudios: Asigna el profesorado a los módulos de cada ciclo formativo.</p>
              </div>
              <button 
                onClick={handleSave}
                disabled={!hasChanges && saveStatus !== "saved"}
                className={`glass-button font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg ${
                  saveStatus === "saved" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  hasChanges ? "bg-accent/20 text-accent border-accent/50 hover:bg-accent/30" : 
                  "bg-white/5 text-gray-500 border-white/10 cursor-not-allowed"
                }`}
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
              </button>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="glass-button bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Añadir Grupo</span>
              </button>
            </div>

            {/* Filtros Superiores */}
            <div className="glass-card p-5 flex flex-col md:flex-row gap-4 mb-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Familia Profesional</label>
                <select 
                  className="w-full bg-[#0b1120] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent/50 transition-colors"
                  value={viewFamilyId}
                  onChange={(e) => {
                    setViewFamilyId(e.target.value);
                    setViewDegreeId("");
                  }}
                >
                  <option value="">-- Selecciona Familia --</option>
                  {families.map((f: any) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Grado y Título</label>
                <select 
                  className="w-full bg-[#0b1120] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent/50 transition-colors disabled:opacity-50"
                  value={viewDegreeId}
                  onChange={(e) => setViewDegreeId(e.target.value)}
                  disabled={!viewFamilyId}
                >
                  <option value="">-- Selecciona Título --</option>
                  {viewFamily?.degrees.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.level} - {d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full">
              
              {/* Lista de Grupos */}
              <div className="space-y-6">
                {!viewDegreeId ? (
                  <div className="glass-card p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                    <Filter className="w-12 h-12 mb-4 text-white/20" />
                    <p className="text-lg">Selecciona una Familia y un Título para ver sus módulos.</p>
                  </div>
                ) : displayedGroups.length === 0 ? (
                  <div className="glass-card p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                    <BookOpen className="w-12 h-12 mb-4 text-white/20" />
                    <p className="text-lg">No hay grupos registrados para este Título.</p>
                    <button onClick={() => setIsModalOpen(true)} className="mt-4 text-accent hover:text-accent/80 transition-colors">Añadir un nuevo grupo</button>
                  </div>
                ) : (
                  displayedGroups.map(group => {
                    const isCollapsed = collapsedGroups.has(group.id);
                    const unassigned = group.modules.filter(m => !m.assignedTeacherId).length;
                    return (
                    <div key={group.id} className="glass-card overflow-hidden">

                      {/* Cabecera del Grupo — clickable para colapsar */}
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="w-full bg-white/5 border-b border-white/10 p-5 flex items-center justify-between hover:bg-white/8 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          {isCollapsed
                            ? <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                            : <ChevronUp   className="w-5 h-5 text-accent shrink-0" />
                          }
                          <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-accent" />
                              {group.name}
                            </h2>
                            <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-white/10 text-xs">{group.level}</span>
                              <span>{group.degreeName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {unassigned > 0 && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                              {unassigned} sin asignar
                            </span>
                          )}
                          <div className="text-right text-sm">
                            <div className="text-gray-400 text-xs">Módulos</div>
                            <div className="text-xl font-bold text-white">{group.modules.length}</div>
                          </div>
                        </div>
                      </button>

                      {/* Lista de Módulos — oculta cuando colapsado */}
                      {!isCollapsed && (
                        <div className="p-4 space-y-3 animate-in slide-in-from-top-1 duration-200">
                          {group.modules.map(module => (
                            <div key={module.id} className="bg-black/20 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors flex flex-col gap-1.5">
                              {/* Primera línea: Código + Módulo y Horas */}
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2">
                                  <span className="text-accent font-mono text-sm font-bold">{module.code}</span>
                                  <h3 className="text-base font-medium text-white">{module.name}</h3>
                                  {module.isDual && (
                                    <span className="ml-2 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                      FEOE
                                    </span>
                                  )}
                                </div>
                                <div className="text-gray-400 text-sm font-semibold shrink-0">
                                  {module.hours}h
                                </div>
                              </div>

                              {/* Segunda línea: Profesor asignado */}
                              <div className="pl-10">
                                <div className={`relative rounded transition-colors w-full sm:w-2/3 md:w-1/2 max-w-xs ${!module.assignedTeacherId ? 'border border-red-500/50 bg-red-500/10' : 'border border-transparent hover:border-white/10 hover:bg-white/5'}`}>
                                  {!module.assignedTeacherId && (
                                    <div className="absolute -left-1.5 -top-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" title="Falta asignación" />
                                  )}
                                  <select
                                    value={module.assignedTeacherId || ""}
                                    onChange={(e) => handleAssignTeacher(group.id, module.id, e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-sm text-gray-300 focus:ring-0 p-1 appearance-none cursor-pointer"
                                  >
                                    <option value="" className="text-gray-500">Sin profesor/a asignado</option>
                                    {teachers.map(t => (
                                      <option key={t.id} value={t.id} className="bg-gray-900">{t.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Tercera línea: RA Collapsible */}
                              {module.ras && module.ras.length > 0 && (
                                <details className="group pl-10 mt-1">
                                  <summary className="cursor-pointer text-xs font-semibold text-gray-400 hover:text-white flex items-center justify-between list-none select-none transition-colors py-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="group-open:rotate-90 transition-transform text-[8px] bg-white/10 p-0.5 rounded flex items-center justify-center">▶</span>
                                      Resultados de aprendizaje
                                    </div>
                                    <span className="text-accent text-xs">{module.ras.length} RA</span>
                                  </summary>
                                  <div className="mt-1.5 space-y-1.5 bg-black/40 p-2.5 rounded border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                                    {module.ras.map((ra, idx) => (
                                      <div key={idx} className="text-xs text-gray-400 flex gap-2 w-full leading-tight">
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
                    </div>
                  );})
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Añadir Grupo */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-[#111827] border border-white/10 p-8 rounded-2xl w-full max-w-lg shadow-2xl relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                Nuevo Grupo Escolar
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Familia Profesional</label>
                  <select 
                    value={selectedFamilyId} 
                    onChange={e => {
                      setSelectedFamilyId(e.target.value);
                      setSelectedDegreeId("");
                    }} 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Selecciona Familia...</option>
                    {families.map(f => (
                      <option key={f.id} value={f.id} className="bg-gray-900">{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Grados / Ciclos</label>
                  <select 
                    value={selectedDegreeId} 
                    onChange={e => setSelectedDegreeId(e.target.value)} 
                    disabled={!selectedFamilyId}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="">Selecciona Ciclo Formativo...</option>
                    {selectedFamilyId && families.find(f => f.id.toString() === selectedFamilyId)?.degrees.map((d: any) => (
                      <option key={d.id} value={d.id} className="bg-gray-900">{d.name} ({d.level})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Nombre del Grupo</label>
                  <input 
                    type="text" 
                    placeholder="Ej: 1º DAW - Grupo A"
                    value={newGroupName} 
                    onChange={e => setNewGroupName(e.target.value)} 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddGroup}
                    disabled={!newGroupName || !selectedDegreeId}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Crear Grupo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
