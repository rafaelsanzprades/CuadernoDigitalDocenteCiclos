import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Clock, XCircle } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MotionWrapper } from '@/components/ui/MotionWrapper';
import { format, subDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useVirtualizer } from '@tanstack/react-virtual';

type AttendanceStatus = 'presente' | 'falta' | 'retraso' | null;

export const AttendanceGrid = () => {
  const { cursoData, activeModuleId } = useAppStore();
  const isDemo = activeModuleId === '0237-ictve-pd';
  const [currentDate, setCurrentDate] = useState(isDemo ? new Date('2026-05-02T10:00:00') : new Date());
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const alumnado = cursoData?.df_al || [];
  const menores = alumnado.filter(a => parseInt(a.Edad || '18') < 18).length;

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  useEffect(() => {
    if (activeModuleId) {
      fetchAttendance();
    }
  }, [activeModuleId, dateStr]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/${activeModuleId}?date_str=${dateStr}`);
      const data = await res.json();
      const newAtt: Record<string, AttendanceStatus> = {};
      data.forEach((record: any) => {
        newAtt[record.student_id] = record.status as AttendanceStatus;
      });
      setAttendanceData(newAtt);
    } catch (err) {
      console.error("Error fetching attendance", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (studentId: string, currentStatus: AttendanceStatus) => {
    if (!activeModuleId) return;

    // Cycle: null -> presente -> falta -> retraso -> null
    let nextStatus: AttendanceStatus = null;
    if (currentStatus === null) nextStatus = 'presente';
    else if (currentStatus === 'presente') nextStatus = 'falta';
    else if (currentStatus === 'falta') nextStatus = 'retraso';
    else nextStatus = null; // back to null

    // Optimistic update
    setAttendanceData(prev => ({ ...prev, [studentId]: nextStatus }));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_document_id: activeModuleId,
          student_id: studentId,
          date_str: dateStr,
          status: nextStatus || '' 
        })
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch (err) {
      toast.error("Error guardando asistencia");
      // Rollback
      setAttendanceData(prev => ({ ...prev, [studentId]: currentStatus }));
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'presente': return 'bg-success/10 text-success border-success/30';
      case 'falta': return 'bg-danger/10 text-danger border-danger/30';
      case 'retraso': return 'bg-warning/10 text-warning border-warning/30';
      default: return 'bg-background/40 text-muted border-[var(--glass-border)] hover:bg-foreground/5';
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'presente': return <CheckCircle className="w-4 h-4" />;
      case 'falta': return <XCircle className="w-4 h-4" />;
      case 'retraso': return <Clock className="w-4 h-4" />;
      default: return '-';
    }
  };

  const rowVirtualizer = useVirtualizer({
    count: alumnado.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 73,
    overscan: 5,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-4">
        <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="glass-button px-4 py-2 flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Día anterior
        </button>
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">
            Asistencia: {format(currentDate, "EEEE d 'de' MMMM", { locale: es })}
          </h2>
          {menores > 0 && (
            <span className="text-danger font-semibold text-sm flex items-center gap-1.5 bg-danger/10 px-3 py-1 rounded-full border border-danger/30">
              <AlertCircle className="w-4 h-4" /> {menores} alumnado(s) menor(es) de 18 años
            </span>
          )}
        </div>
        <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="glass-button px-4 py-2 flex items-center gap-2">
          Día siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <MotionWrapper className="glass-panel overflow-hidden">
        <div 
          ref={parentRef}
          className="overflow-x-auto overflow-y-auto"
          style={{ maxHeight: '600px' }}
        >
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10 bg-[#0d1726]">
              <tr className="bg-foreground/5 text-muted border-b border-[var(--glass-border)]">
                <th className="p-4 font-semibold w-16 text-center">Nº</th>
                <th className="p-4 font-semibold w-12 text-center" title="Menor de edad"><AlertCircle className="w-4 h-4 mx-auto" /></th>
                <th className="p-4 font-semibold">Alumnado</th>
                <th className="p-4 font-semibold text-center w-48">Estado</th>
              </tr>
            </thead>
            <tbody 
              className={loading ? 'opacity-50' : ''}
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const index = virtualRow.index;
                const al = alumnado[index];
                const studentId = al.student_id || al.ID || String(index);
                const status = attendanceData[studentId] || null;
                
                return (
                  <tr 
                    key={virtualRow.key} 
                    data-index={index}
                    ref={rowVirtualizer.measureElement}
                    className="border-b border-[var(--glass-border)]/50 hover:bg-foreground/5 transition-colors absolute top-0 left-0 w-full flex"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <td className="p-4 text-center text-muted font-mono w-16 flex items-center justify-center shrink-0">{index + 1}</td>
                    <td className="p-4 text-center text-sm w-12 flex items-center justify-center shrink-0">{parseInt(al.Edad || '18') < 18 ? <AlertCircle className="w-4 h-4 text-danger" /> : ''}</td>
                    <td className="p-4 font-medium flex-1 flex items-center">
                      {al.Apellidos}, {al.Nombre}
                    </td>
                    <td className="p-4 text-center w-48 flex items-center justify-center shrink-0">
                      <button 
                        id={`attendance-btn-${index}`}
                        data-row-index={index}
                        onClick={() => toggleAttendance(studentId, status)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            document.getElementById(`attendance-btn-${index + 1}`)?.focus();
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            document.getElementById(`attendance-btn-${index - 1}`)?.focus();
                          }
                        }}
                        className={`w-full py-2 px-4 rounded-md border font-bold flex items-center justify-center gap-2 transition-all ${getStatusColor(status)} focus:ring-2 focus:ring-offset-2 focus:ring-info`}
                      >
                        <span>{getStatusIcon(status)}</span>
                        <span className="">{status || 'Sin registrar'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {alumnado.length === 0 && (
                <tr className="w-full flex">
                  <td className="p-8 text-center text-muted w-full">
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
