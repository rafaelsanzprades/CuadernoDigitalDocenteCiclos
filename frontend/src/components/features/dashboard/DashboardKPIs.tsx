import { BarChart, BarChart3, CheckCircle, Clock, Users } from "lucide-react";
import React, { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";

function AnimatedCounter({ value, suffix = "", decimals = 0 }: { value: number, suffix?: string, decimals?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return Number(latest).toFixed(decimals);
  });
  const display = useTransform(rounded, (v) => `${v}${suffix}`);

  useEffect(() => {
    const animation = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{display}</motion.span>;
}

import { useAppStore } from "@/store/useAppStore";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";

interface DashboardKPIsProps {
  cursoData: any;
  moduleData: any;
}

export function DashboardKPIs({ cursoData, moduleData }: DashboardKPIsProps) {
  const { df_sgmt } = useDynamicPlanning();
  
  const total_impartido = df_sgmt.reduce((sum: number, row: any) => {
    let row_imp = 0;
    Object.keys(row).forEach(k => {
      if (k.endsWith('_Imp') && k !== 'Total_Imp') {
        row_imp += (Number(row[k]) || 0);
      }
    });
    return sum + row_imp;
  }, 0);

  const total_previsto = moduleData?.df_ud?.reduce((sum: number, ud: any) => sum + (ud.horas_ud || 0), 0) || 0;
  const porcentaje_progreso = total_previsto > 0 ? (total_impartido / total_previsto) * 100 : 0;

  // Calculo de horas sin docencia desde el calendario (para h_real_total) y el daily_ledger
  let h_real_total = 0;
  let h_sin_docencia = 0;
  const dias_semana_list = ["Lun", "Mar", "Mié", "Jue", "Vie"];
  
  const daily_ledger = cursoData?.daily_ledger || {};
  const info_fechas = cursoData?.info_fechas || {};
  const horario = cursoData?.horario || {};
  const calendar_notes = cursoData?.calendar_notes || {};
  const festivos: string[] = cursoData?.festivos || [];

  const esFestivo = (dateStr: string): boolean => {
    if (calendar_notes[`f_${dateStr}`]) return true;
    return festivos.includes(dateStr);
  };

  const processTrimestre = (ini_str: string, fin_str: string) => {
    if (!ini_str || !fin_str) return;
    const ini = new Date(ini_str);
    const fin = new Date(fin_str);
    let curr = new Date(ini);

    while (curr <= fin) {
      const diaSemana = dias_semana_list[curr.getDay() - 1];
      const dateStr = curr.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      // Verificar si es día laborable (lunes a viernes) y no es festivo
      const esDiaLaborable = curr.getDay() >= 1 && curr.getDay() <= 5;
      const esFestivoDia = esFestivo(dateStr);
      
      if (esDiaLaborable && !esFestivoDia) {
        const h_dia = Number(horario[diaSemana]) || 0;
        h_real_total += h_dia;
        
        // Verificar si es día sin docencia (dual)
        if (daily_ledger[dateStr]?.sin_docencia) {
          h_sin_docencia += h_dia;
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  };

  processTrimestre(info_fechas.ini_1t, info_fechas.fin_1t);
  processTrimestre(info_fechas.ini_2t, info_fechas.fin_2t);
  processTrimestre(info_fechas.ini_3t, info_fechas.fin_3t);

  const perc_sin_docencia = h_real_total > 0 ? (h_sin_docencia / h_real_total) * 100 : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground">
        <span><span className="inline-flex"><BarChart className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Resumen planificación y seguimiento global
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <Card glow accent="top" className="p-6 flex flex-col items-center justify-center border-t-blue-500 hover:scale-[1.02] transition-transform">
          <span className="text-sm text-muted mb-1 text-center">Horas Previstas</span>
          <span className="text-3xl font-bold text-foreground">
            <AnimatedCounter value={total_previsto} /> h
          </span>
        </Card>
        
        <Card glow accent="top" className="p-6 flex flex-col items-center justify-center border-t-[#14a085] hover:scale-[1.02] transition-transform">
          <span className="text-sm text-muted mb-1 text-center">Horas Impartidas</span>
          <span className="text-3xl font-bold text-foreground">
            <AnimatedCounter value={total_impartido} /> h
          </span>
        </Card>
        
        <Card glow accent="top" className="p-6 flex flex-col items-center justify-center border-t-purple-500 hover:scale-[1.02] transition-transform">
          <span className="text-sm text-muted mb-1 text-center">% Progreso</span>
          <span className="text-3xl font-bold text-foreground">
            <AnimatedCounter value={porcentaje_progreso} suffix="%" decimals={1} />
          </span>
        </Card>
        
        <Card glow accent="top" className="p-6 flex flex-col items-center justify-center border-t-orange-500 hover:scale-[1.02] transition-transform">
          <span className="text-sm text-muted mb-1 text-center">Horas sin docencia</span>
          <span className="text-3xl font-bold text-foreground">
            <AnimatedCounter value={h_sin_docencia} /> h
          </span>
        </Card>
        
        <Card glow accent="top" className="p-6 flex flex-col items-center justify-center border-t-yellow-500 hover:scale-[1.02] transition-transform">
          <span className="text-sm text-muted mb-1 text-center">% Sin docencia</span>
          <span className="text-3xl font-bold text-foreground">
            <AnimatedCounter value={perc_sin_docencia} suffix="%" decimals={1} />
          </span>
        </Card>
      </div>
    </div>
  );
}
