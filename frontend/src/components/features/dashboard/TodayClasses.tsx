import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { MotionWrapper } from '@/components/ui/MotionWrapper';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const TodayClasses = () => {
  const { moduleData, cursoData } = useAppStore();

  if (!moduleData) return null;

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  // Buscar en el planning_ledger
  const ledgerForToday = moduleData.planning_ledger?.[todayStr];
  const idUdToday = ledgerForToday?.id_ud;

  // Filtrar sesiones de la UD que toca hoy (si la hay)
  // Nota: Esto es una aproximación. Idealmente el ledger guardaría la sesión exacta,
  // pero si guarda la UD, mostramos la info de la UD o la primera sesión disponible.
  const sesionHoy = moduleData.df_sesiones?.find(s => s.id_ud === idUdToday);
  const udHoy = moduleData.df_ud?.find(u => u.id_ud === idUdToday);

  if (!idUdToday) {
    return (
      <MotionWrapper className="glass-panel p-6 border-l-4 border-l-gray-400">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-2">
<Calendar className="w-6 h-6" /> Tus Clases de Hoy ({format(new Date(), "EEEE d 'de' MMMM", { locale: es })})
</h2>
        <p className="text-muted">No tienes sesiones planificadas para el día de hoy según el calendario del módulo.</p>
      </MotionWrapper>
    );
  }

  return (
    <MotionWrapper className="glass-panel p-6 border-l-4 border-l-accent relative overflow-hidden">
      <div className="absolute -right-10 -top-10 text-accent opacity-10">
        <BookOpen className="w-48 h-48" />
      </div>
      <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-4">
<Calendar className="w-6 h-6 text-accent" /> Tus Clases de Hoy ({format(new Date(), "EEEE d 'de' MMMM", { locale: es })})
</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div className="bg-background/40 p-4 rounded-xl border border-[var(--glass-border)]">
          <div className="text-xs text-accent uppercase font-bold tracking-wider mb-1">Unidad Didáctica</div>
          <div className="font-bold text-lg">{udHoy?.desc_ud || idUdToday}</div>
          <div className="text-sm text-muted mt-2">
            Horas totales UD: {udHoy?.horas_ud || 0}h
          </div>
        </div>

        {sesionHoy && (
          <div className="bg-background/40 p-4 rounded-xl border border-[var(--glass-border)]">
            <div className="text-xs text-accent uppercase font-bold tracking-wider mb-1">Sesión Sugerida</div>
            <div className="font-bold">Sesión {sesionHoy.Num_Orden}: {sesionHoy.Tipo_Actividad}</div>
            {sesionHoy.Contenidos && (
              <div className="text-sm text-muted mt-2 line-clamp-2">
                <span className="font-semibold text-foreground">Contenidos:</span> {sesionHoy.Contenidos}
              </div>
            )}
            <div className="flex items-center gap-2 mt-3 text-sm font-semibold">
              <Clock className="w-4 h-4 text-accent" /> {sesionHoy.Horas} horas lectivas
            </div>
          </div>
        )}
      </div>
    </MotionWrapper>
  );
};
