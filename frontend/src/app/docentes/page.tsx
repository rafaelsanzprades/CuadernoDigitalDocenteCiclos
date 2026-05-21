"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { Search, Users, ShieldAlert, CheckCircle2, Clock, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

interface Teacher {
  id: number;
  name: string;
  surname: string;
  email: string;
}

export default function DocentesPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#0b1120] flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>}>
      <DocentesContent />
    </React.Suspense>
  );
}

function DocentesContent() {
  const { groups } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [expandedTeacherId, setExpandedTeacherId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(json => {
        if (json.status === "success") {
          // Filter to teachers / general staff (or all users for tests)
          setTeachers(json.data.map((u: any) => ({
            id: u.id,
            name: u.name,
            surname: u.surname,
            email: u.email
          })));
        }
      });
  }, []);

  const calculateHours = (teacherId: number) => {
    let total = 0;
    groups.forEach(g => {
      g.modules.forEach(m => {
        if (m.assignedTeacherId === teacherId) {
          total += m.hours;
        }
      });
    });
    return total;
  };

  const getTeacherModules = (teacherId: number) => {
    const assigned: { groupName: string; moduleName: string; hours: number; code: string }[] = [];
    groups.forEach(g => {
      g.modules.forEach(m => {
        if (m.assignedTeacherId === teacherId) {
          assigned.push({
            groupName: g.name,
            moduleName: m.name,
            hours: m.hours,
            code: m.code
          });
        }
      });
    });
    return assigned;
  };

  const filteredTeachers = teachers.filter(t => {
    const fullName = `${t.name} ${t.surname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || t.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleExpand = (teacherId: number) => {
    setExpandedTeacherId(expandedTeacherId === teacherId ? null : teacherId);
  };

  return (
    <div className="flex min-h-screen bg-[#0b1120]">
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <div className="flex-1 p-8 pt-4 overflow-y-auto scrollbar-hide">
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 mb-2">
                  <span className="text-3xl">👨‍🏫</span> Asignación de docentes
                </h1>
                <p className="text-gray-400">Jefatura de Estudios: Control de carga horaria lectiva del profesorado y módulos asignados.</p>
              </div>
            </div>

            {/* Buscador de profesores */}
            <div className="glass-card p-4 mb-2 flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar docente por nombre o correo electrónico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm focus:ring-0"
              />
            </div>

            {/* Listado de Docentes en Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map(teacher => {
                const hours = calculateHours(teacher.id);
                const assignedModules = getTeacherModules(teacher.id);
                const isOverloaded = hours > 500;
                const progressPercentage = Math.min(100, (hours / 600) * 100);
                const isExpanded = expandedTeacherId === teacher.id;

                return (
                  <div 
                    key={teacher.id} 
                    className={`glass-card overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                      isOverloaded ? "border-red-500/20" : "border-white/5"
                    }`}
                  >
                    <div className="p-6 space-y-4">
                      {/* Cabecera de la Tarjeta */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white leading-tight">
                            {teacher.name} {teacher.surname}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">{teacher.email}</p>
                        </div>
                        {isOverloaded ? (
                          <span className="px-2 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] uppercase font-bold tracking-wide flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Sobrecarga
                          </span>
                        ) : hours > 0 ? (
                          <span className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold tracking-wide flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Correcto
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-500 text-[10px] uppercase font-bold tracking-wide">
                            Sin Carga
                          </span>
                        )}
                      </div>

                      {/* Barra de progreso de horas */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-400">Horas Asignadas</span>
                          <span className={isOverloaded ? "text-red-400 font-bold" : "text-white font-bold"}>
                            {hours}h <span className="text-gray-500 font-normal">/ 500h máx.</span>
                          </span>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              isOverloaded ? "bg-gradient-to-r from-red-500 to-rose-600 animate-pulse" : "bg-gradient-to-r from-emerald-500 to-teal-500"
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Módulos Asignados (Desplegable) */}
                    <div className="border-t border-white/5 bg-black/20">
                      <button 
                        onClick={() => toggleExpand(teacher.id)}
                        className="w-full px-6 py-3 flex items-center justify-between text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        <span className="font-semibold flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-accent" />
                          Ver módulos asignados ({assignedModules.length})
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
                          {assignedModules.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-2">Este docente no tiene ningún módulo asignado actualmente.</p>
                          ) : (
                            assignedModules.map((m, idx) => (
                              <div key={idx} className="bg-black/40 rounded-lg p-2 border border-white/5 space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-mono text-accent font-bold">{m.code}</span>
                                  <span className="text-gray-400 font-semibold">{m.hours}h</span>
                                </div>
                                <div className="text-xs font-medium text-white">{m.moduleName}</div>
                                <div className="text-[10px] text-gray-500 font-semibold">{m.groupName}</div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTeachers.length === 0 && (
              <div className="glass-card p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                <Users className="w-12 h-12 mb-4 text-white/20" />
                <p className="text-lg">No se han encontrado docentes que coincidan con la búsqueda.</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
