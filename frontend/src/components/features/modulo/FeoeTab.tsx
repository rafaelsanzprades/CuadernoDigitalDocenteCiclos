"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";

export function FeoeTab() {
  const { moduleData, updateModuleData } = useAppStore();

  const info_fechas = moduleData?.info_fechas || {};

  const handleUpdateFechas = (field: string, value: string | number) =>
    updateModuleData("info_fechas", { ...info_fechas, [field]: value });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <Card className="p-6 border-l-4 border-l-pink-500 hover:shadow-lg hover:shadow-pink-500/10 transition-shadow">
        <h2 className="text-[1.1rem] font-bold flex items-center gap-2 text-foreground mb-6">
<span>🏢</span> Formación en Empresa (FEOE)
</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-muted mb-2 block font-semibold text-center">Inicio FEOE</label>
            <DatePicker 
              value={info_fechas.ini_feoe || ""} 
              onChange={v => handleUpdateFechas("ini_feoe", v)} 
              className="text-center" 
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-2 block font-semibold text-center">Fin FEOE</label>
            <DatePicker 
              value={info_fechas.fin_feoe || ""} 
              onChange={v => handleUpdateFechas("fin_feoe", v)} 
              className="text-center" 
            />
          </div>
          <Input 
            label="Horas/día FEOE"
            type="number" 
            value={Number(info_fechas.h_sem_feoe) || 8}
            onChange={e => handleUpdateFechas("h_sem_feoe", Number(e.target.value))}
            className="text-center" 
          />
        </div>
      </Card>
    </div>
  );
}
