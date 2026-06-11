import { AlertCircle, BookOpen, Calendar, CalendarDays, ChevronRight, Circle, Clock, Layers } from "lucide-react";
import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MotionWrapper } from '@/components/ui/MotionWrapper';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { simulateSchedule, DaySchedule } from '@/utils/scheduleSimulator';

export const WeeklyClasses = () => {
  const { moduleData, activeModuleId, cursoData } = useAppStore();
  const [activeWeekTab, setActiveWeekTab] = useState<'current' | 'next'>('current');

  if (!moduleData) return null;

  // 1. Simulate the entire schedule
  const simulation = simulateSchedule(moduleData, cursoData);

  // 2. Compute current and next week dates
  const isDemo = activeModuleId === '0237-ictve-pd';
  const now = isDemo ? new Date('2026-05-02T10:00:00') : new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const isThursdayOrLater = dayOfWeek === 0 || dayOfWeek >= 4;

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const mondayCurrent = getMonday(now);

  const currentWeekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mondayCurrent);
    d.setDate(mondayCurrent.getDate() + i);
    return d;
  });

  const nextWeekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mondayCurrent);
    d.setDate(mondayCurrent.getDate() + 7 + i);
    return d;
  });

  const pad = (n: number) => String(n).padStart(2, "0");
  const getDaySchedule = (d: Date): DaySchedule => {
    const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    return simulation[dateStr] || {
      dateStr,
      date: d,
      dayOfWeekName: ["Lun", "Mar", "Mié", "Jue", "Vie"][d.getDay() - 1] || "Lun",
      hours: 0,
      isFestivo: false,
      sessions: []
    };
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const renderWeekDays = (days: Date[]) => {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {days.map((day) => {
          const schedule = getDaySchedule(day);
          const isToday = isSameDay(day, now);
          const formattedDayName = (format(day, "EEEE", { locale: es }));
          const formattedDateNum = format(day, "d 'de' MMM", { locale: es });

          let cardStyle = "bg-background/20 border-white/5";
          let badge = null;

          if (isToday) {
            cardStyle = "bg-accent/10 border-accent/40 ring-1 ring-accent/30 shadow-[0_0_15px_rgba(20,160,133,0.15)]";
            badge = (
              <span className="bg-accent text-background text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wider ">
                Hoy
              </span>
            );
          } else if (schedule.isFestivo) {
            cardStyle = "bg-danger/10 border-danger/30 opacity-90";
          } else if (schedule.hours === 0 || !schedule.udId || schedule.sessions.length === 0) {
            cardStyle = "bg-background/10 border-white/3 opacity-70";
          }

          return (
            <div
              key={schedule.dateStr}
              className={`rounded-xl border p-4 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md ${cardStyle}`}
            >
              {/* Day Header */}
              <div className="border-b border-[var(--glass-border)] pb-3 mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-semibold text-sm ${isToday ? "text-accent" : "text-foreground/90"}`}>
                    {formattedDayName}
                  </span>
                  {badge}
                </div>
                <div className="text-xs text-muted font-medium">{formattedDateNum}</div>
              </div>

              {/* Class Info */}
              <div className="flex-1 flex flex-col justify-start">
                {schedule.isFestivo ? (
                  <div className="bg-danger/10 border border-danger/30 p-2.5 rounded-lg text-center my-auto">
                    <span className="text-danger font-medium text-xs block mb-1"><span className="inline-flex"><Circle className="w-[1.2em] h-[1.2em] mr-1" /></span> Festivo</span>
                    <span className="text-danger text-[11px] font-medium line-clamp-2">
                      {schedule.festivoName || "Día festivo"}
                    </span>
                  </div>
                ) : schedule.hours === 0 ? (
                  <div className="text-center text-muted/60 text-xs py-4 my-auto italic">
                    Sin horario lectivo
                  </div>
                ) : !schedule.udId || schedule.sessions.length === 0 ? (
                  <div className="text-center text-muted/60 text-xs py-4 my-auto italic flex flex-col items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-muted/50" />
                    Sin clases planificadas
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* UD Indicator */}
                    <div className="flex items-center gap-1.5 text-xs text-accent font-bold">
                      <Layers className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate" title={schedule.udDesc}>
                        {schedule.udId}: {schedule.udDesc}
                      </span>
                    </div>

                    {/* Sessions inside day */}
                    <div className="space-y-1.5">
                      {schedule.sessions.map((ses) => (
                        <div
                          key={ses.ID}
                          className="bg-background/30 p-2 rounded-lg border border-white/5 text-[11px] text-muted hover:text-foreground hover:bg-background/40 transition-colors"
                        >
                          <div className="font-bold flex justify-between gap-1 mb-0.5">
                            <span className="truncate">S{ses.Num_Orden}: {ses.Tipo_Actividad}</span>
                            <span className="text-accent/80 font-mono flex-shrink-0">{ses.Horas}h</span>
                          </div>
                          {ses.Contenidos && (
                            <div className="line-clamp-2 font-medium leading-relaxed">
                              {ses.Contenidos}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Day Footer Info */}
              {!schedule.isFestivo && schedule.hours > 0 && (
                <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-muted/80">
                  <span className="font-semibold">{schedule.hours} horas lectivas</span>
                  {schedule.isEvent && (
                    <span
                      className="bg-info/10 text-info border border-info/30 px-1.5 py-0.5 rounded font-bold tracking-wider"
                      title={schedule.eventName}
                    >
                      Evento
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <MotionWrapper className="glass-panel p-6 border-l-4 border-l-blue-400">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground">
            <CalendarDays className="w-6 h-6 text-info" /> Previsión Semanal
          </h2>
          <p className="text-sm text-muted mt-1">
            Distribución temporal de los módulos y las sesiones planificadas en el aula.
          </p>
        </div>

        {/* Tab Switcher */}
        {isThursdayOrLater ? (
          <div className="flex bg-background/50 p-1 rounded-xl border border-[var(--glass-border)] self-start md:self-auto">
            <button
              onClick={() => setActiveWeekTab('current')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeWeekTab === 'current'
                  ? 'bg-info text-white shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Semana Actual
            </button>
            <button
              onClick={() => setActiveWeekTab('next')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeWeekTab === 'next'
                  ? 'bg-info text-white shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Semana Siguiente
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="bg-info/10 border border-info/30 text-info text-xs px-3 py-1.5 rounded-lg font-bold">
            Semana Actual
          </div>
        )}
      </div>

      {/* Week Contents */}
      {activeWeekTab === 'current' ? (
        <div className="animate-in fade-in duration-300">
          <div className="text-xs font-medium text-muted tracking-wider mb-3">
            Semana del {format(currentWeekDays[0], "d 'de' MMMM", { locale: es })} al {format(currentWeekDays[4], "d 'de' MMMM", { locale: es })}
          </div>
          {renderWeekDays(currentWeekDays)}
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <div className="text-xs font-medium text-muted tracking-wider mb-3">
            Semana del {format(nextWeekDays[0], "d 'de' MMMM", { locale: es })} al {format(nextWeekDays[4], "d 'de' MMMM", { locale: es })}
          </div>
          {renderWeekDays(nextWeekDays)}
        </div>
      )}
    </MotionWrapper>
  );
};
