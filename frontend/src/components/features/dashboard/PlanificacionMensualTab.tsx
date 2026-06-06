"use client";
import { Calendar } from "lucide-react";
import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";

export function PlanificacionMensualTab() {
  const { cursoData, moduleData } = useAppStore();

  const df_sgmt = cursoData?.df_sgmt || [];
  
  const df_sgmt_calculated = df_sgmt.map((row: any) => {
    let total_imp = 0;
    Object.keys(row).forEach(k => {
      if (k.endsWith('_Imp') && k !== 'Total_Imp') {
        total_imp += (Number(row[k]) || 0);
      }
    });
    return { ...row, Total_Imp: total_imp };
  });

  const meses_display = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"];

  if (!cursoData || !moduleData) {
    return (
      <Card className="p-8 text-center text-muted">
        Carga una programación y curso para ver la planificación mensual.
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground">
        <span><span className="inline-flex"><Calendar className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Planificación y seguimiento mensual
      </h2>

      <section className="glass-card p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-[var(--glass-border)] text-muted bg-foreground/5">
              <th className="p-3 sticky left-0 bg-[#111827] z-10 border-r border-[var(--glass-border)]"></th>
              <th className="p-3 sticky left-[60px] bg-[#111827] z-10 text-center"></th>
              <th className="p-3 sticky left-[130px] bg-[#111827] z-10 text-center border-r border-[var(--glass-border)]"></th>
              {meses_display.map((m) => (
                <th key={m} colSpan={2} className="p-2 text-center border-r border-[var(--glass-border)]">{m}</th>
              ))}
            </tr>
            <tr className="border-b border-[var(--glass-border)] text-xs text-muted bg-foreground/5">
              <th className="p-2 sticky left-0 bg-[#111827] z-10 border-r border-[var(--glass-border)] text-center font-bold text-foreground">UD</th>
              <th className="p-2 sticky left-[60px] bg-[#111827] z-10 text-center text-info">Prv</th>
              <th className="p-2 sticky left-[130px] bg-[#111827] z-10 text-center text-[#14a085]/70 border-r border-[var(--glass-border)]">Imp</th>
              {meses_display.map((m) => (
                <React.Fragment key={m}>
                  <th className="p-2 text-center text-info">Prv</th>
                  <th className="p-2 text-center text-[#14a085]/70 border-r border-[var(--glass-border)]">Imp</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {df_sgmt_calculated.map((row: any, idx: number) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                <td className="p-3 font-mono sticky left-0 bg-background group-hover:bg-[#111827] border-r border-[var(--glass-border)] font-bold">{row.id_ud}</td>
                <td className="p-3 text-center sticky left-[60px] bg-background group-hover:bg-[#111827] text-info">{row.horas_ud || ''}</td>
                <td className="p-3 text-center sticky left-[130px] bg-background group-hover:bg-[#111827] border-r border-[var(--glass-border)] text-[#14a085] font-bold">{row.Total_Imp || ''}</td>
                {meses_display.map((m) => (
                  <React.Fragment key={m}>
                    <td className="p-3 text-center text-foreground/60">{Number(row[`${m}_Prv`]) || ''}</td>
                    <td className="p-3 text-center text-[#14a085] font-semibold border-r border-[var(--glass-border)] bg-[#14a085]/5">{Number(row[`${m}_Imp`]) || ''}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
