import { AlertCircle, Clock, OctagonAlert } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MotionWrapper } from '@/components/ui/MotionWrapper';
import { Card } from '@/components/ui/Card';

type AttendanceStatus = 'presente' | 'falta' | 'retraso' | null;

interface AttendanceRecord {
  student_id: string;
  date_str: string;
  status: AttendanceStatus;
}

export const AttendanceAccumulated = () => {
  const { cursoData, moduleData, activeModuleId } = useAppStore();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const alumnado = cursoData?.df_al || [];
  const menores = alumnado.filter((a: any) => parseInt(a.Edad || '18') < 18).length;
  const info_fechas = cursoData?.info_fechas || {};
  const info_modulo = moduleData?.info_modulo || {};

  useEffect(() => {
    if (activeModuleId) {
      fetchAttendance();
    }
  }, [activeModuleId]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/${activeModuleId}`);
      const data = await res.json();
      setAttendanceData(data);
    } catch (err) {
      console.error("Error fetching attendance", err);
    } finally {
      setLoading(false);
    }
  };

  const isDateInPeriod = (dateStr: string, startStr: string, endStr: string) => {
    if (!startStr || !endStr || !dateStr) return false;
    const date = new Date(dateStr);
    const start = new Date(startStr);
    const end = new Date(endStr);
    return date >= start && date <= end;
  };

  // Helper to calculate total real hours if h_boa is 0
  const calculateRealHours = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    try {
      const [sy, sm, sd] = startStr.split("-").map(Number);
      const [ey, em, ed] = endStr.split("-").map(Number);
      if (!sy || !ey) return 0;
      const start = new Date(sy, sm - 1, sd);
      const end = new Date(ey, em - 1, ed);
      const dayMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const horario = cursoData?.horario || { Lun: 0, Mar: 0, "Mié": 0, Jue: 0, Vie: 0 };
      const calendar_notes = cursoData?.calendar_notes || {};
      
      let total = 0, curr = new Date(start);
      const pad = (n: number) => String(n).padStart(2, "0");
      while (curr <= end) {
        if (curr.getDay() !== 0 && curr.getDay() !== 6) {
          const key = `f_${pad(curr.getDate())}/${pad(curr.getMonth() + 1)}/${curr.getFullYear()}`;
          if (!calendar_notes[key]) total += Number(horario[dayMap[curr.getDay()]]) || 0;
        }
        curr.setDate(curr.getDate() + 1);
      }
      return total;
    } catch { return 0; }
  };

  const h_boa = Number(info_modulo.h_boa) || 0;
  const h1 = calculateRealHours(info_fechas.ini_1t, info_fechas.fin_1t);
  const h2 = calculateRealHours(info_fechas.ini_2t, info_fechas.fin_2t);
  const h3 = calculateRealHours(info_fechas.ini_3t, info_fechas.fin_3t);
  const h_real = h1 + h2 + h3;

  const totalHours = h_boa > 0 ? h_boa : h_real;
  const p_ev_pct = Number(info_modulo.p_ev) || 15; // Porcentaje legal de PdEvC (generalmente 15%)
  
  // Tramos de aviso (1/3 y 2/3 del porcentaje de PdEvC)
  const warning1 = p_ev_pct / 3; // ej: 5%
  const warning2 = (p_ev_pct / 3) * 2; // ej: 10%

  // PdEvC Thresholds
  const getTrafficLight = (faltas: number) => {
    if (totalHours === 0) return { color: "bg-foreground/20 text-muted", text: "N/A", pct: 0 };
    const pct = (faltas / totalHours) * 100;
    
    if (pct >= p_ev_pct) return { color: "bg-danger/10 text-danger border border-danger/30", text: `PdEvC (+${p_ev_pct}%)`, pct };
    if (pct >= warning2) return { color: "bg-warning/10 text-warning border border-warning/30", text: `Alerta 2 (+${warning2.toFixed(1)}%)`, pct };
    if (pct >= warning1) return { color: "bg-warning/10 text-warning border border-warning/30", text: `Alerta 1 (+${warning1.toFixed(1)}%)`, pct };
    return { color: "bg-success/10 text-success border border-success/30", text: "Normal", pct };
  };

  return (
    <div className="space-y-6">
      {menores > 0 && (
        <div className="flex justify-end">
          <span className="text-danger font-semibold text-sm flex items-center gap-1.5 bg-danger/10 px-3 py-1 rounded-full border border-danger/30">
            <AlertCircle className="w-4 h-4" /> {menores} alumnado(s) menor(es) de 18 años
          </span>
        </div>
      )}
      <div className="grid grid-cols-3 gap-6 animate-in slide-in-from-left-4 duration-500">
        <Card className="p-6 border-l-4 border-l-accent flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-muted ">Horas totales del módulo</p>
            <p className="text-3xl font-extrabold text-foreground">{totalHours} h</p>
          </div>
          <Clock className="w-10 h-10 text-accent/80" />
        </Card>
        <Card className="p-6 border-l-4 border-l-yellow-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-muted ">Límite PdEvC ({p_ev_pct}%)</p>
            <p className="text-3xl font-extrabold text-foreground">{Math.round(totalHours * (p_ev_pct / 100))} faltas</p>
          </div>
          <OctagonAlert className="w-10 h-10 text-warning" />
        </Card>
      </div>

      <MotionWrapper className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 text-muted border-b border-[var(--glass-border)]">
                <th className="p-4 font-semibold w-16 text-center">Nº</th>
                <th className="p-4 font-semibold w-12 text-center" title="Menor de edad"><AlertCircle className="w-4 h-4 mx-auto" /></th>
                <th className="p-4 font-semibold">Alumnado</th>
                <th className="p-4 font-semibold text-center w-24">1t</th>
                <th className="p-4 font-semibold text-center w-24">2t</th>
                <th className="p-4 font-semibold text-center w-24">3t</th>
                <th className="p-4 font-semibold text-center w-24">Total</th>
                <th className="p-4 font-semibold text-center w-48">Estado PdEvC</th>
                <th className="p-4 font-semibold w-32">Progreso</th>
              </tr>
            </thead>
            <tbody className={loading ? 'opacity-50' : ''}>
              {alumnado.map((alumnado, index) => {
                const studentId = alumnado.student_id || alumnado.ID || String(index);
                const studentRecords = attendanceData.filter(r => r.student_id === studentId && r.status === 'falta');
                
                const faltas1T = studentRecords.filter(r => isDateInPeriod(r.date_str, info_fechas.ini_1t, info_fechas.fin_1t)).length;
                const faltas2T = studentRecords.filter(r => isDateInPeriod(r.date_str, info_fechas.ini_2t, info_fechas.fin_2t)).length;
                const faltas3T = studentRecords.filter(r => isDateInPeriod(r.date_str, info_fechas.ini_3t, info_fechas.fin_3t)).length;
                const faltasTotal = studentRecords.length; // Could be larger than sum if dates fall outside configured trimesters, but that's fine

                const status = getTrafficLight(faltasTotal);
                
                // Limit progress bar to p_ev_pct to visually max out at PdEvC
                const progressPct = Math.min((status.pct / p_ev_pct) * 100, 100);

                return (
                  <tr key={studentId} className="border-b border-[var(--glass-border)]/50 hover:bg-foreground/5 transition-colors">
                    <td className="p-4 text-center text-muted font-mono">{index + 1}</td>
                    <td className="p-4 text-center text-sm">{parseInt(alumnado.Edad || '18') < 18 ? <AlertCircle className="w-4 h-4 text-danger mx-auto" /> : ''}</td>
                    <td className="p-4 font-medium">
                      {alumnado.Apellidos}, {alumnado.Nombre}
                    </td>
                    <td className="p-4 text-center font-mono text-muted">{faltas1T > 0 ? faltas1T : '-'}</td>
                    <td className="p-4 text-center font-mono text-muted">{faltas2T > 0 ? faltas2T : '-'}</td>
                    <td className="p-4 text-center font-mono text-muted">{faltas3T > 0 ? faltas3T : '-'}</td>
                    <td className="p-4 text-center font-bold text-foreground">{faltasTotal}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-md text-sm font-semibold block ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="h-2 w-full bg-foreground/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${status.color.split(' ')[0].replace('/20', '')}`}
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xs text-muted mt-1">{status.pct.toFixed(1)}%</div>
                    </td>
                  </tr>
                );
              })}
              {alumnado.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted">
                    No hay alumnado matriculados en este curso.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </MotionWrapper>
    </div>
  );
};
