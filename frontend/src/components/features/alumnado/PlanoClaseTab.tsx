import React, { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Grid, Users, User, RefreshCw, HelpCircle } from 'lucide-react';
import { Alumnadodo } from '@/types';

export const PlanoClaseTab = () => {
  const { cursoData, updateCursoData } = useAppStore();

  // Load seating chart data, fallback to defaults
  const plano = cursoData?.plano_clase || { rows: 5, cols: 6, seats: {} };
  const rows = plano.rows ?? 5;
  const cols = plano.cols ?? 6;
  const seats = plano.seats ?? {};

  const df_al = cursoData?.df_al || [];

  // Filter active students and sort alphabetically
  const activeStudents = useMemo(() => {
    return df_al
      .filter((al: Alumnadodo) => al.Estado !== 'Baja')
      .sort((a: Alumnadodo, b: Alumnadodo) => {
        const nameA = `${a.Apellidos || ''}, ${a.Nombre || ''}`.toLowerCase();
        const nameB = `${b.Apellidos || ''}, ${b.Nombre || ''}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [df_al]);

  // Create a map for quick access
  const activeStudentMap = useMemo(() => {
    const map = new Map<string, Alumnadodo>();
    activeStudents.forEach((al) => {
      if (al.ID) map.set(al.ID, al);
    });
    return map;
  }, [activeStudents]);

  // Track assigned student IDs
  const assignedStudentIds = useMemo(() => {
    return new Set(Object.values(seats).filter(id => !!id) as string[]);
  }, [seats]);

  // Track unassigned students
  const unassignedStudents = useMemo(() => {
    return activeStudents.filter((al) => al.ID && !assignedStudentIds.has(al.ID));
  }, [activeStudents, assignedStudentIds]);

  // Handle setting/changing size
  const handleSizeChange = (key: 'rows' | 'cols', value: number) => {
    const newRows = key === 'rows' ? value : rows;
    const newCols = key === 'cols' ? value : cols;

    // Filter out seats that are outside the new dimensions
    const newSeats = { ...seats };
    Object.keys(newSeats).forEach((seatKey) => {
      const [rStr, cStr] = seatKey.split('_');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (r >= newRows || c >= newCols) {
        delete newSeats[seatKey];
      }
    });

    updateCursoData('plano_clase', {
      rows: newRows,
      cols: newCols,
      seats: newSeats,
    });
  };

  // Handle assigning a student to a seat
  const handleAssignSeat = (r: number, c: number, studentId: string) => {
    const key = `${r}_${c}`;
    const newSeats = { ...seats };

    if (!studentId) {
      delete newSeats[key];
    } else {
      // A student can only sit in one place. Clear their previous seat if any.
      Object.keys(newSeats).forEach((k) => {
        if (newSeats[k] === studentId) {
          delete newSeats[k];
        }
      });
      newSeats[key] = studentId;
    }

    updateCursoData('plano_clase', {
      rows,
      cols,
      seats: newSeats,
    });
  };

  // Reset all assignments
  const handleResetLayout = () => {
    if (window.confirm('¿Seguro que deseas vaciar todos los asientos del plano de clase?')) {
      updateCursoData('plano_clase', {
        rows,
        cols,
        seats: {},
      });
    }
  };

  // Auto fill alphabetically row-by-row
  const handleAutoFill = () => {
    if (
      window.confirm(
        '¿Deseas asignar automáticamente a todos los alumnadodo en orden alfabético? Esto sobrescribirá la distribución actual.'
      )
    ) {
      const newSeats: Record<string, string> = {};
      let studentIdx = 0;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (studentIdx < activeStudents.length) {
            const student = activeStudents[studentIdx];
            if (student.ID) {
              newSeats[`${r}_${c}`] = student.ID;
            }
            studentIdx++;
          }
        }
      }

      updateCursoData('plano_clase', {
        rows,
        cols,
        seats: newSeats,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Configuration & Actions Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-foreground/5 p-5 border border-white/5 rounded-2xl">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-accent" />
            <span className="text-sm font-bold text-foreground/90">Dimensiones del Aula:</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-24">
              <Select
                value={rows}
                onChange={(e) => handleSizeChange('rows', parseInt(e.target.value, 10))}
                label="Filas"
                className="py-1 text-xs"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num} className="bg-background text-foreground">
                    {num}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-24">
              <Select
                value={cols}
                onChange={(e) => handleSizeChange('cols', parseInt(e.target.value, 10))}
                label="Columnas"
                className="py-1 text-xs"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <option key={num} value={num} className="bg-background text-foreground">
                    {num}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Stats and helper info */}
        <div className="flex items-center gap-4 text-xs text-muted">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Alumnadodo activos: <strong>{activeStudents.length}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4 text-green-400" />
            <span>Sentados: <strong>{assignedStudentIds.size}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Sin asignar: <strong>{unassignedStudents.length}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleAutoFill}
            className="text-xs font-bold flex items-center gap-1.5 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-xl"
          >
            <RefreshCw className="w-4 h-4" /> Distribución Alfabética
          </Button>

          <Button
            variant="ghost"
            onClick={handleResetLayout}
            className="text-xs font-bold flex items-center gap-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-xl"
          >
            <Trash2 className="w-4 h-4" /> Vaciar Plano
          </Button>
        </div>
      </div>

      {/* Classroom layout representation */}
      <Card className="border border-white/5 rounded-2xl p-6 bg-foreground/5 shadow-2xl relative overflow-hidden">
        {/* Direction Indicator */}
        <div className="absolute top-2 left-6 text-[10px] text-muted tracking-wider uppercase font-semibold">
          Fondo de Clase ⬆️
        </div>
        <div className="absolute bottom-2 left-6 text-[10px] text-muted tracking-wider uppercase font-semibold">
          Frente de Clase / Pizarra ⬇️
        </div>

        {/* Interactive Classroom Grid */}
        <div className="overflow-x-auto pb-4 pt-6 scrollbar-custom">
          <div
            className="grid gap-4 mx-auto p-4 bg-background/40 border border-white/5 rounded-2xl shadow-inner min-w-[800px]"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {/* Generate cells from Row 0 (Fondo) to Row N-1 (Frente) */}
            {Array.from({ length: rows }).map((_, r) => {
              return Array.from({ length: cols }).map((_, c) => {
                const seatKey = `${r}_${c}`;
                const seatedId = seats[seatKey] || '';
                const student = seatedId ? activeStudentMap.get(seatedId) : null;

                return (
                  <div
                    key={seatKey}
                    className={`border rounded-xl p-3 flex flex-col justify-between aspect-video min-w-[130px] transition-all duration-300 ${
                      student
                        ? 'border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10'
                        : 'border-white/5 bg-foreground/5 hover:bg-foreground/10'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-mono text-muted uppercase">
                        F{r + 1} - C{c + 1}
                      </span>
                      {student ? (
                        <Badge variant="info" className="scale-90 origin-right">
                          Ocupado
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-muted/50 italic">Libre</span>
                      )}
                    </div>

                    {/* Student selector */}
                    <select
                      value={seatedId}
                      onChange={(e) => handleAssignSeat(r, c, e.target.value)}
                      className="w-full bg-foreground/15 border border-[var(--glass-border)] text-foreground text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent transition-colors font-medium cursor-pointer"
                    >
                      <option value="" className="bg-background text-foreground">-- Sin Asignar --</option>
                      {activeStudents.map((al) => {
                        const isAssignedElsewhere =
                          assignedStudentIds.has(al.ID || '') &&
                          seatedId !== al.ID;

                        return (
                          <option key={al.ID} value={al.ID} className="bg-background text-foreground">
                            {al.Apellidos}, {al.Nombre} {isAssignedElsewhere ? ' (Mover)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              });
            })}
          </div>
        </div>

        {/* Teacher Desk & Board (Mesa del Profesor) */}
        <div className="flex flex-col items-center mt-6 border-t border-[var(--glass-border)] pt-6">
          {/* Blackboard Representation */}
          <div className="w-1/2 min-w-[300px] h-2 bg-slate-800 rounded border border-slate-700 shadow-lg mb-4 flex items-center justify-center">
            <div className="w-full h-0.5 bg-slate-600"></div>
          </div>
          
          {/* Teacher Desk */}
          <div className="w-1/3 min-w-[200px] border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors duration-300 rounded-xl p-3.5 text-center text-accent font-extrabold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg">
            <span>👨‍🏫 Mesa del Profesor / Pizarra</span>
          </div>
        </div>
      </Card>

      {/* Unassigned Students Section */}
      <Card className="border border-white/5 rounded-2xl p-6 bg-foreground/5 shadow-lg">
        <div className="flex items-center justify-between mb-4 border-b border-[var(--glass-border)] pb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" /> Alumnadodo sin asignar en el plano ({unassignedStudents.length})
          </h3>
          {unassignedStudents.length > 0 && (
            <span className="text-[10px] text-muted italic">
              Aparecerán automáticamente en los desplegables de las mesas.
            </span>
          )}
        </div>

        {unassignedStudents.length === 0 ? (
          <div className="text-center py-6 text-sm text-green-400 font-semibold">
            🎉 ¡Todos los alumnadodo activos han sido colocados en el plano!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unassignedStudents.map((al) => (
              <div
                key={al.ID}
                className="bg-foreground/10 text-foreground/80 border border-[var(--glass-border)] hover:border-accent/40 hover:text-foreground px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300"
                title={`ID: ${al.ID}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                <span>
                  {al.Apellidos}, {al.Nombre}
                </span>
                <span className="text-[10px] text-muted font-mono bg-background/30 px-1.5 py-0.5 rounded">
                  {al.ID}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
