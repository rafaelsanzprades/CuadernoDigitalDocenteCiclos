"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Search, Save, Filter, BookOpen, Clock, Users, ShieldAlert, CheckCircle2, Plus, X } from "lucide-react";

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
};

type CourseGroup = {
  id: number;
  name: string;
  degreeName: string;
  level: string;
  modules: Module[];
};

export default function AsignacionesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [selectedDegreeId, setSelectedDegreeId] = useState("");

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
  }, []);

  // Grupos y Módulos mockeados
  const [groups, setGroups] = useState<CourseGroup[]>([
    {
      id: 1,
      name: "1º DAW - Grupo A (Mañana)",
      degreeName: "Desarrollo de Aplicaciones Web",
      level: "Grado Superior",
      modules: [
        { id: 101, code: "0484", name: "Bases de Datos", hours: 192, isDual: true, assignedTeacherId: 3 },
        { id: 102, code: "0485", name: "Entornos de Desarrollo", hours: 96, isDual: true, assignedTeacherId: 1 },
        { id: 103, code: "0483", name: "Sistemas Informáticos", hours: 160, isDual: false, assignedTeacherId: null },
        { id: 104, code: "0487", name: "Lenguajes de Marcas", hours: 128, isDual: true, assignedTeacherId: 4 },
      ]
    },
    {
      id: 2,
      name: "2º DAW - Grupo Único (Tardes)",
      degreeName: "Desarrollo de Aplicaciones Web",
      level: "Grado Superior",
      modules: [
        { id: 201, code: "0488", name: "Desarrollo Web en Entorno Cliente", hours: 140, isDual: true, assignedTeacherId: null },
        { id: 202, code: "0489", name: "Desarrollo Web en Entorno Servidor", hours: 175, isDual: true, assignedTeacherId: null },
        { id: 203, code: "0490", name: "Despliegue de Aplicaciones Web", hours: 88, isDual: false, assignedTeacherId: 2 },
      ]
    }
  ]);

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

  return (
    <div className="flex min-h-screen bg-[#0b1120]">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <div className="flex-1 p-8 pt-4 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-2">
                  <span className="text-3xl">📋</span> Asignación de Módulos
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Panel Izquierdo: Lista de Grupos */}
              <div className="lg:col-span-3 space-y-6">
                {groups.map(group => (
                  <div key={group.id} className="glass-card overflow-hidden">
                    {/* Cabecera del Grupo */}
                    <div className="bg-white/5 border-b border-white/10 p-5 flex items-center justify-between">
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
                      <div className="text-right text-sm">
                        <div className="text-gray-400">Total Módulos</div>
                        <div className="text-xl font-bold text-white">{group.modules.length}</div>
                      </div>
                    </div>

                    {/* Tabla de Módulos */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black/20 text-xs text-gray-400 uppercase tracking-wider">
                            <th className="p-4 font-semibold w-24">Código</th>
                            <th className="p-4 font-semibold">Módulo Didáctico</th>
                            <th className="p-4 font-semibold text-center w-24">Horas</th>
                            <th className="p-4 font-semibold w-72">Profesor/a Asignado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {group.modules.map(module => (
                            <tr key={module.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-4 text-gray-400 font-mono text-sm">{module.code}</td>
                              <td className="p-4">
                                <div className="font-medium text-white">{module.name}</div>
                                {module.isDual && (
                                  <span className="inline-block mt-1 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Sujeto a FEOE
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                <div className="inline-flex items-center gap-1.5 text-gray-300 bg-white/5 px-2.5 py-1 rounded-md text-sm">
                                  <Clock className="w-3.5 h-3.5 opacity-70" />
                                  {module.hours}h
                                </div>
                              </td>
                              <td className="p-4">
                                <div className={`relative rounded-lg border transition-colors ${!module.assignedTeacherId ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-black/20'}`}>
                                  {!module.assignedTeacherId && (
                                    <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" title="Falta asignación" />
                                  )}
                                  <select 
                                    value={module.assignedTeacherId || ""}
                                    onChange={(e) => handleAssignTeacher(group.id, module.id, e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-sm text-white focus:ring-0 p-2.5 appearance-none cursor-pointer"
                                  >
                                    <option value="" className="text-gray-500">Sin asignar (Vacante)</option>
                                    {teachers.map(t => (
                                      <option key={t.id} value={t.id} className="bg-gray-900">{t.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              {/* Panel Derecho: Resumen de Carga Lectiva */}
              <div className="space-y-6">
                <div className="glass-card p-6 sticky top-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    Carga Horaria
                  </h3>
                  <p className="text-xs text-gray-400 mb-6">Monitor de reparto de horas por profesorado. Avisos en caso de excesos.</p>
                  
                  <div className="space-y-4">
                    {teachers.map(teacher => {
                      const hours = calculateHours(teacher.id);
                      // Simulación de alertas (por ejemplo, max 600h anuales)
                      const isOverloaded = hours > 500;
                      
                      return (
                        <div key={teacher.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">{teacher.name}</span>
                            <span className={`font-mono font-bold ${isOverloaded ? 'text-red-400' : 'text-emerald-400'}`}>
                              {hours}h
                            </span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                            <div 
                              className={`h-full transition-all duration-1000 ${isOverloaded ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, (hours / 600) * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
