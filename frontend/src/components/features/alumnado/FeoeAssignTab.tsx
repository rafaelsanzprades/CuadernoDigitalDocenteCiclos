"use client";
import { Building2, Check, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import type { CrmEmpresa } from "@/types";

export function FeoeAssignTab() {
  const { cursoData, globalData, updateGlobalData } = useAppStore();
  const [asignEmpresa, setAsignEmpresa] = useState<string | null>(null);

  const empresas = (globalData?.crm_empresas || []) as CrmEmpresa[];
  const alumnado = (cursoData?.df_al || []).filter((a: any) => a.Estado !== "Baja");

  function setEmpresas(list: CrmEmpresa[]) {
    updateGlobalData("crm_empresas", list);
  }

  function toggleStudent(empId: string, studentId: string) {
    setEmpresas(empresas.map((e: CrmEmpresa) => {
      if (e.id !== empId) return e;
      const has = e.alumnado_asignados.includes(studentId);
      return { ...e, alumnado_asignados: has ? e.alumnado_asignados.filter((s: string) => s !== studentId) : [...e.alumnado_asignados, studentId] };
    }));
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-t-4 border-t-indigo-500">
        <h2 className="text-2xl font-bold text-foreground mb-4">Asignación de alumnado a empresas</h2>
        {empresas.length === 0 ? (
          <div className="p-12 text-center text-muted border border-[var(--glass-border)] rounded-xl bg-foreground/5">
            <p>No hay empresas registradas. Añade empresas en la pestaña "Empresas FEOE".</p>
          </div>
        ) : (
          <div className="space-y-4">
            {empresas.map((emp: CrmEmpresa) => (
              <Card key={emp.id} className="p-5 border border-[var(--glass-border)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground">{emp.nombre}</h3>
                  <button
                    onClick={() => setAsignEmpresa(asignEmpresa === emp.id ? null : emp.id)}
                    className="text-xs flex items-center gap-1.5 bg-foreground/10 hover:bg-foreground/20 px-3 py-1.5 rounded transition-colors"
                  >
                    {asignEmpresa === emp.id ? "Cerrar asignación" : <><UserPlus className="w-3.5 h-3.5" /> Gestionar asignación</>}
                  </button>
                </div>
                
                {asignEmpresa === emp.id && (
                  <div className="bg-foreground/5 rounded-xl p-4 border border-[var(--glass-border)] mb-3 space-y-2 max-h-48 overflow-y-auto">
                    {alumnado.length === 0 && <p className="text-muted text-sm italic">No hay alumnado activos.</p>}
                    {alumnado.map((al: any) => {
                      const selected = emp.alumnado_asignados.includes(al.ID);
                      const assignedTo = empresas.filter((e: CrmEmpresa) => e.id !== emp.id && e.alumnado_asignados.includes(al.ID));
                      return (
                        <div key={al.ID} className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${selected ? "bg-info/10 border-info/30" : "bg-transparent border-[var(--glass-border)] hover:bg-foreground/10"}`} onClick={() => toggleStudent(emp.id, al.ID)}>
                          <span className="text-sm text-foreground">{al.Apellidos}, {al.Nombre}{assignedTo.length > 0 ? <span className="text-[10px] text-warning ml-2">(también en {assignedTo.map((e: CrmEmpresa) => e.nombre).join(", ")})</span> : ""}</span>
                          <span className={`text-lg ${selected ? "text-info" : "text-muted"}`}>{selected ? <><span className="inline-flex"><Check className="w-[1.2em] h-[1.2em] mr-1" /></span></> : "+"}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {emp.alumnado_asignados.length === 0 && asignEmpresa !== emp.id && (
                    <span className="text-sm text-muted italic">Sin alumnado asignado.</span>
                  )}
                  {emp.alumnado_asignados.map((sid: string) => {
                    const al = alumnado.find((a: any) => a.ID === sid);
                    return (
                      <span key={sid} className="text-sm bg-info/10 text-info border border-info/30 px-3 py-1 rounded-full">
                        {al ? `${al.Apellidos}, ${al.Nombre}` : sid}
                      </span>
                    );
                  })}
                </div>
              </Card>
            ))}
            {alumnado.length > 0 && (
              <Card className="p-5 border border-[var(--glass-border)] mt-6 bg-foreground/5">
                <h3 className="text-lg font-bold text-foreground mb-3">Alumnado sin asignar a ninguna empresa</h3>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const asignados = new Set(empresas.flatMap((e: CrmEmpresa) => e.alumnado_asignados));
                    const sinAsignar = alumnado.filter((a: any) => !asignados.has(a.ID));
                    if (sinAsignar.length === 0) return <span className="text-sm text-success italic">Todo el alumnado está asignado.</span>;
                    return sinAsignar.map((al: any) => (
                      <span key={al.ID} className="text-sm bg-warning/10 text-warning border border-warning/30 px-3 py-1 rounded-full">
                        {al.Apellidos}, {al.Nombre}
                      </span>
                    ));
                  })()}
                </div>
              </Card>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
