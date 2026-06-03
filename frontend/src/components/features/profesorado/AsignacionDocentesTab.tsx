"use client";

import React, { useState } from "react";
import { useAppStore, calculateTeacherHours, getTeacherAssignedModules } from "@/store/useAppStore";
import { useUsers } from "@/hooks/useApi";
import { Search, Users } from "lucide-react";
import { TeacherCard } from "@/components/features/docentes/TeacherCard";

export function AsignacionDocentesTab() {
  const { groups } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTeacherId, setExpandedTeacherId] = useState<number | null>(null);

  const { data: usersData } = useUsers();
  
  const teachers = usersData?.map((u: any) => ({
    id: u.id,
    name: u.name,
    surname: u.surname,
    email: u.email
  })) || [];

  const filteredTeachers = teachers.filter((t: any) => {
    const fullName = `${t.name} ${t.surname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || t.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleExpand = (teacherId: number) => {
    setExpandedTeacherId(expandedTeacherId === teacherId ? null : teacherId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[1.1rem] font-bold flex items-center gap-3">
            <span className="text-2xl">👨‍🏫</span> Asignación de docentes
          </h2>
          <p className="text-muted mt-2">Jefatura de Estudios: Control de carga horaria lectiva del profesorado y módulos asignados.</p>
        </div>
      </div>

      <div className="glass-card p-4 mb-2 flex items-center gap-3">
        <Search className="w-5 h-5 text-muted" />
        <input
          type="text"
          placeholder="Buscar docente por nombre o correo electrónico..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-foreground placeholder-gray-500 text-sm focus:ring-0"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher: any) => {
          const hours = calculateTeacherHours(groups, teacher.id);
          const assignedModules = getTeacherAssignedModules(groups, teacher.id);
          const isExpanded = expandedTeacherId === teacher.id;

          return (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              hours={hours}
              assignedModules={assignedModules}
              isExpanded={isExpanded}
              toggleExpand={() => toggleExpand(teacher.id)}
            />
          );
        })}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="glass-card p-12 text-center text-muted flex flex-col items-center justify-center">
          <Users className="w-12 h-12 mb-4 text-foreground/20" />
          <p className="text-lg">No se han encontrado docentes que coincidan con la búsqueda.</p>
        </div>
      )}

    </div>
  );
}
