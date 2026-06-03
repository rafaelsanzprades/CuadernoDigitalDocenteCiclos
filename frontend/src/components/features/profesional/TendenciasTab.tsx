"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Alumnadodo } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countField(ledger: Record<string, any>, field: string) {
  const counts: Record<string, number> = {};
  Object.values(ledger).forEach((data: any) => {
    const v = data[field];
    if (v) counts[v] = (counts[v] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function countBoolean(ledger: Record<string, any>, field: string) {
  return Object.values(ledger).filter((d: any) => d[field] === "X" || d[field] === true).length;
}

interface BarProps { label: string; count: number; total: number; color?: string }
function DistributionBar({ label, count, total, color = "bg-accent" }: BarProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-foreground/80 w-48 shrink-0 truncate" title={label}>{label}</div>
      <div className="flex-1 bg-foreground/10 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-sm font-bold text-foreground w-8 text-right">{count}</div>
      <div className="text-xs text-muted w-8 text-right">{pct}%</div>
    </div>
  );
}

// ─── TendenciasTab ────────────────────────────────────────────────────────────

export const TendenciasTab = () => {
  const { cursoData } = useAppStore();

  const df_al = cursoData?.df_al || [];
  const activeStudents = df_al.filter((al: Alumnadodo) => al.Estado !== "Baja");
  const profesionalLedger = cursoData?.profesional_ledger || {};

  // Only students with orientation data
  const withData = activeStudents.filter((al: Alumnadodo) => {
    const d = profesionalLedger[al.ID!];
    return d && Object.keys(d).length > 0;
  });

  const total = activeStudents.length;
  const withDataCount = withData.length;
  const coverage = total > 0 ? Math.round((withDataCount / total) * 100) : 0;

  // Aggregated stats
  const intenciones = countField(profesionalLedger, "intencion_al_terminar");
  const aptitudes = countField(profesionalLedger, "aptitud_principal");
  const areaInteres = countField(profesionalLedger, "area_interes");
  const entornos = countField(profesionalLedger, "entorno_laboral_preferido");
  const geoPrefs = countField(profesionalLedger, "preferencia_geografica");
  const experiencias = countField(profesionalLedger, "experiencia_previa");
  const motivaciones = countField(profesionalLedger, "motivo_eleccion");

  const nErasmus = countBoolean(profesionalLedger, "interes_erasmus");
  const nBolsa = countBoolean(profesionalLedger, "interes_bolsa_empleo");
  const nEmprender = countBoolean(profesionalLedger, "interes_emprender");
  const nConExperiencia = Object.values(profesionalLedger).filter(
    (d: any) => d.experiencia_previa && d.experiencia_previa !== "Sin experiencia"
  ).length;

  const aptColor: Record<string, string> = {
    "Técnica": "bg-blue-500",
    "Analítica": "bg-purple-500",
    "Creativa": "bg-pink-500",
    "Comercial": "bg-amber-500",
    "Comunicativa": "bg-teal-500",
    "Relacional": "bg-green-500",
    "Emprendedora": "bg-orange-500",
    "Organizativa": "bg-cyan-500",
  };

  if (total === 0) {
    return (
      <Card className="p-12 text-center text-muted flex flex-col items-center gap-4">
        <span className="text-5xl">👥</span>
        <p className="text-lg">No hay alumnadodo registrado en este curso.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Coverage banner */}
      <Card className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/5 bg-foreground/5">
        <div>
          <h2 className="text-lg font-bold text-foreground">Cobertura de fichas de orientación</h2>
          <p className="text-sm text-muted mt-0.5">
            {withDataCount} de {total} alumnadodo tienen ficha completada
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-extrabold text-accent">{coverage}%</div>
          <div className="w-32 bg-foreground/10 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
              style={{ width: `${coverage}%` }}
            />
          </div>
        </div>
      </Card>

      {withDataCount === 0 ? (
        <Card className="p-12 text-center text-muted flex flex-col items-center gap-4">
          <span className="text-5xl">🧭</span>
          <p className="text-lg font-semibold">Sin datos de orientación aún</p>
          <p className="text-sm">Completa las fichas individuales en la pestaña <strong>🧭 Perfil individual</strong>.</p>
        </Card>
      ) : (
        <>
          {/* KPI quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Con experiencia laboral", value: nConExperiencia, icon: "💼", color: "text-orange-400" },
              { label: "Interés en Erasmus+", value: nErasmus, icon: "🌍", color: "text-blue-400" },
              { label: "Interés en bolsa empleo", value: nBolsa, icon: "📋", color: "text-emerald-400" },
              { label: "Con idea de negocio", value: nEmprender, icon: "🚀", color: "text-purple-400" },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-4 text-center border border-white/5 bg-foreground/5">
                <div className="text-2xl mb-1">{kpi.icon}</div>
                <div className={`text-3xl font-extrabold ${kpi.color}`}>{kpi.value}</div>
                <div className="text-xs text-muted mt-1 leading-tight">{kpi.label}</div>
              </Card>
            ))}
          </div>

          {/* Two-column distribution grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Intención al terminar */}
            {intenciones.length > 0 && (
              <Card className="p-6 border border-white/5 bg-foreground/5 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  🎯 Intención al finalizar el ciclo
                </h3>
                <div className="space-y-3">
                  {intenciones.map(([label, count]) => (
                    <DistributionBar key={label} label={label} count={count} total={withDataCount} color="bg-accent" />
                  ))}
                </div>
              </Card>
            )}

            {/* Aptitudes */}
            {aptitudes.length > 0 && (
              <Card className="p-6 border border-white/5 bg-foreground/5 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  🧠 Aptitud principal detectada
                </h3>
                <div className="space-y-3">
                  {aptitudes.map(([label, count]) => (
                    <DistributionBar key={label} label={label} count={count} total={withDataCount} color={aptColor[label] || "bg-foreground/40"} />
                  ))}
                </div>
              </Card>
            )}

            {/* Área de interés */}
            {areaInteres.length > 0 && (
              <Card className="p-6 border border-white/5 bg-foreground/5 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  💻 Área de interés dominante
                </h3>
                <div className="space-y-3">
                  {areaInteres.map(([label, count]) => (
                    <DistributionBar key={label} label={label} count={count} total={withDataCount} color="bg-purple-500" />
                  ))}
                </div>
              </Card>
            )}

            {/* Entorno laboral */}
            {entornos.length > 0 && (
              <Card className="p-6 border border-white/5 bg-foreground/5 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  🏢 Entorno laboral preferido
                </h3>
                <div className="space-y-3">
                  {entornos.map(([label, count]) => (
                    <DistributionBar key={label} label={label} count={count} total={withDataCount} color="bg-emerald-500" />
                  ))}
                </div>
              </Card>
            )}

            {/* Preferencia geográfica */}
            {geoPrefs.length > 0 && (
              <Card className="p-6 border border-white/5 bg-foreground/5 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  🗺️ Preferencia geográfica de trabajo
                </h3>
                <div className="space-y-3">
                  {geoPrefs.map(([label, count]) => (
                    <DistributionBar key={label} label={label} count={count} total={withDataCount} color="bg-cyan-500" />
                  ))}
                </div>
              </Card>
            )}

            {/* Motivación de elección */}
            {motivaciones.length > 0 && (
              <Card className="p-6 border border-white/5 bg-foreground/5 space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  🎯 Motivación de elección del ciclo
                </h3>
                <div className="space-y-3">
                  {motivaciones.map(([label, count]) => (
                    <DistributionBar key={label} label={label} count={count} total={withDataCount} color="bg-amber-500" />
                  ))}
                </div>
              </Card>
            )}

          </div>

          {/* Experiencia previa breakdown */}
          {experiencias.length > 0 && (
            <Card className="p-6 border border-white/5 bg-foreground/5 space-y-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                💼 Distribución de experiencia laboral previa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {experiencias.map(([label, count]) => (
                  <DistributionBar key={label} label={label} count={count} total={withDataCount} color="bg-orange-500" />
                ))}
              </div>
            </Card>
          )}

          {/* Per-student summary table */}
          <Card className="border border-white/5 bg-foreground/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-base font-bold text-foreground">📋 Resumen por alumnadodo/a</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-muted bg-foreground/5">
                    <th className="text-left p-3 font-semibold">Alumnadodo/a</th>
                    <th className="text-left p-3 font-semibold">Aptitud</th>
                    <th className="text-left p-3 font-semibold">Área interés</th>
                    <th className="text-left p-3 font-semibold">Intención al terminar</th>
                    <th className="text-left p-3 font-semibold">Inserción</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStudents.map((al: any) => {
                    const d = profesionalLedger[al.ID] || {};
                    const hasAny = Object.keys(d).length > 0;
                    return (
                      <tr key={al.ID} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                        <td className="p-3 font-medium text-foreground">
                          {al.Apellidos}, {al.Nombre}
                          <div className="text-[10px] text-muted font-mono">{al.ID}</div>
                        </td>
                        <td className="p-3 text-foreground/70">{d.aptitud_principal || <span className="text-muted/50 italic text-xs">—</span>}</td>
                        <td className="p-3 text-foreground/70 max-w-[160px] truncate">{d.area_interes || <span className="text-muted/50 italic text-xs">—</span>}</td>
                        <td className="p-3">
                          {d.intencion_al_terminar ? (
                            <span className="text-xs font-semibold bg-accent/10 border border-accent/20 text-accent px-2 py-1 rounded-full">
                              {d.intencion_al_terminar}
                            </span>
                          ) : <span className="text-muted/50 italic text-xs">Sin datos</span>}
                        </td>
                        <td className="p-3 text-foreground/70 text-xs">{d.estado_insercion || <span className="text-muted/50 italic">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
