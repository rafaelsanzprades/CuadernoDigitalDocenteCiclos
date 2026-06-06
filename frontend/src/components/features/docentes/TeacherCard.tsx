import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, Clock, ShieldAlert } from "lucide-react";
import React from 'react';
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface TeacherCardProps {
  teacher: { id: number; name: string; surname: string; email: string };
  hours: number;
  assignedModules: { groupName: string; moduleName: string; hours: number; code: string }[];
  isExpanded: boolean;
  toggleExpand: () => void;
}

export function TeacherCard({ teacher, hours, assignedModules, isExpanded, toggleExpand }: TeacherCardProps) {
  const isOverloaded = hours > 500;
  const progressPercentage = Math.min(100, (hours / 600) * 100);

  return (
    <Card className={`transition-all duration-300 flex flex-col justify-between ${isOverloaded ? "border-danger/30" : "border-white/5"}`}>
      <div className="p-6 space-y-4">
        {/* Cabecera de la Tarjeta */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-foreground leading-tight">
              {teacher.name} {teacher.surname}
            </h3>
            <p className="text-xs text-muted mt-1">{teacher.email}</p>
          </div>
          {isOverloaded ? (
            <Badge variant="danger" className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Sobrecarga
            </Badge>
          ) : hours > 0 ? (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correcto
            </Badge>
          ) : (
            <Badge variant="default" className="text-muted border-gray-600 bg-gray-800/50">
              Sin asignar
            </Badge>
          )}
        </div>

        {/* Resumen de carga horaria */}
        <div className="bg-foreground/10 rounded-lg p-4 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground/80 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent" />
              Carga Lectiva
            </span>
            <span className={`text-xl font-black ${isOverloaded ? 'text-danger' : 'text-foreground'}`}>
              {hours} <span className="text-sm font-normal text-muted">/ 600h</span>
            </span>
          </div>
          
          <div className="w-full bg-foreground/5 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                isOverloaded ? 'bg-danger shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                hours > 0 ? 'bg-success shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-transparent'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Módulos asignados (Collapsible) */}
        {assignedModules.length > 0 && (
          <div className="pt-2 border-t border-white/5">
            <button 
              onClick={toggleExpand}
              className="w-full flex items-center justify-between text-sm font-medium text-muted hover:text-foreground transition-colors py-1"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{assignedModules.length} módulos asignados</span>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isExpanded && (
              <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {assignedModules.map((m, idx) => (
                  <div key={idx} className="bg-foreground/5 rounded px-3 py-2 border border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-accent font-mono text-[10px] font-bold">{m.code}</span>
                      <span className="text-xs font-semibold text-foreground/80">{m.hours}h</span>
                    </div>
                    <p className="text-sm text-foreground font-medium leading-tight mb-1">{m.moduleName}</p>
                    <p className="text-[10px] text-muted tracking-wide">{m.groupName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
