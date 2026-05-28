"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";

export function RaOgMatrix() {
  const { moduleData, updateInfoModulo } = useAppStore();

  const ogs = moduleData?.info_modulo?.objetivos_generales || [];
  const ras = moduleData?.df_ra || [];
  const mapping = moduleData?.info_modulo?.ra_og_mapping || {};

  const toggleMapping = (ogIndex: number, raId: string) => {
    const current = mapping[ogIndex] || [];
    let updated;
    if (current.includes(raId)) {
      updated = current.filter((id: string) => id !== raId);
    } else {
      updated = [...current, raId];
    }
    
    updateInfoModulo("ra_og_mapping", {
      ...mapping,
      [ogIndex]: updated
    });
  };

  if (!ogs.length || !ras.length) {
    return (
      <Card className="p-8 text-center border-t-4 border-t-yellow-500">
        <p className="text-muted">
          No hay Objetivos Generales o Resultados de Aprendizaje configurados para este módulo.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-l-4 border-l-blue-500 overflow-hidden animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-6">
<span>🔗</span> Contribución de los RA a los OG del Título
</h2>
      
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-3 border-b border-[var(--glass-border)] text-muted font-bold min-w-[300px]">
                Objetivos Generales
              </th>
              {ras.map((ra: any) => (
                <th 
                  key={ra.id_ra} 
                  className="p-3 border-b border-[var(--glass-border)] text-center text-foreground font-bold whitespace-nowrap cursor-help"
                  title={ra.desc_ra}
                >
                  <div className="bg-foreground/5 px-2 py-1 rounded border border-[var(--glass-border)]">
                    {ra.id_ra}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ogs.map((og: string, idx: number) => (
              <tr key={idx} className="hover:bg-foreground/5 transition-colors border-b border-[var(--glass-border)]/50 group">
                <td className="p-3 align-top">
                  <div className="flex gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400 mt-0.5">OG{idx + 1}.</span>
                    <span className="text-foreground/90 leading-relaxed">{og}</span>
                  </div>
                </td>
                {ras.map((ra: any) => {
                  const isChecked = (mapping[idx] || []).includes(ra.id_ra);
                  return (
                    <td key={ra.id_ra} className="p-3 text-center align-middle">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => toggleMapping(idx, ra.id_ra)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            isChecked 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                              : 'bg-background border border-[var(--glass-border)] text-transparent hover:border-blue-500/30 hover:bg-blue-500/10'
                          }`}
                        >
                          {isChecked && <span className="text-lg font-bold">✓</span>}
                        </button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
