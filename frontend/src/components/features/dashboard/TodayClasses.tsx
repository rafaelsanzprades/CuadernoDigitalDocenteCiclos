import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Calendar, Clock, BookOpen, Layers } from 'lucide-react';
import { MotionWrapper } from '@/components/ui/MotionWrapper';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { simulateSchedule } from '@/utils/scheduleSimulator';

export const TodayClasses = () => {
  const { moduleData, activeModuleId } = useAppStore();

  if (!moduleData) return null;

  const isDemo = activeModuleId === '0237-ictve-pd';
  const now = isDemo ? new Date('2025-10-06T10:00:00') : new Date();

  // Simulate schedule to get exact classroom programming for today
  const simulation = simulateSchedule(moduleData);
  const todayStr = format(now, 'dd/MM/yyyy');
  const todaySchedule = simulation[todayStr];

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const formattedToday = capitalize(format(now, "EEEE d 'de' MMMM", { locale: es }));

  if (!todaySchedule || todaySchedule.isFestivo || !todaySchedule.udId || todaySchedule.sessions.length === 0) {
    const reason = todaySchedule?.isFestivo 
      ? `Festivo: ${todaySchedule.festivoName || "Día no lectivo"}`
      : "No tienes sesiones planificadas para el día de hoy según el calendario del módulo.";

    return (
      <MotionWrapper className="glass-panel p-6 border-l-4 border-l-gray-400">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-2">
          <Calendar className="w-6 h-6" /> Tus Clases de Hoy ({formattedToday})
        </h2>
        <p className="text-muted">{reason}</p>
      </MotionWrapper>
    );
  }

  const { udId, udDesc, sessions } = todaySchedule;
  const udHoy = moduleData.df_ud?.find((u: any) => String(u.id_ud) === udId);

  return (
    <MotionWrapper className="glass-panel p-6 border-l-4 border-l-accent relative overflow-hidden">
      <div className="absolute -right-10 -top-10 text-accent opacity-10">
        <BookOpen className="w-48 h-48" />
      </div>
      
      <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-4 relative z-10">
        <Calendar className="w-6 h-6 text-accent" /> Tus Clases de Hoy ({formattedToday})
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* UD Info Card */}
        <div className="bg-background/40 p-5 rounded-xl border border-[var(--glass-border)] flex flex-col justify-between">
          <div>
            <div className="text-xs text-accent uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Unidad Didáctica
            </div>
            <div className="font-bold text-lg text-foreground">{udDesc || udId}</div>
          </div>
          <div className="text-sm text-muted mt-4 pt-3 border-t border-[var(--glass-border)]">
            Horas totales UD: <span className="font-semibold text-foreground">{udHoy?.horas_ud || 0}h</span>
          </div>
        </div>

        {/* Sessions list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs text-accent uppercase font-bold tracking-wider">
            Sesiones Planificadas ({sessions.length})
          </div>
          {sessions.map((ses, idx) => (
            <div key={ses.ID} className="bg-background/40 p-4 rounded-xl border border-[var(--glass-border)] space-y-3">
              <div className="flex justify-between items-start">
                <div className="font-bold text-foreground">
                  Sesión {ses.Num_Orden}: {ses.Tipo_Actividad}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold bg-accent/15 text-accent px-2 py-0.5 rounded-full border border-accent/25">
                  <Clock className="w-3.5 h-3.5" /> {ses.Horas}h
                </div>
              </div>
              
              {ses.Contenidos && (
                <div className="text-sm text-muted">
                  <span className="font-semibold text-foreground/80">Contenidos:</span> {ses.Contenidos}
                </div>
              )}
              
              {ses.Recursos && (
                <div className="text-xs text-muted/80 bg-foreground/5 p-2 rounded border border-[var(--glass-border)] italic">
                  <span className="font-semibold text-foreground/70 not-italic">Recursos:</span> {ses.Recursos}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MotionWrapper>
  );
};
