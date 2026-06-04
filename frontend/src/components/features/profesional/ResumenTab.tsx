"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Alumnado } from "@/types";

// ─── Badge de intención ───────────────────────────────────────────────────────

const INTENCION_COLOR: Record<string, string> = {
  "Empleo inmediato":       "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "FEOE / prácticas empresa": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Ciclo superior":         "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Universidad":            "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  "Emprender":              "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Sin decidir":            "bg-muted/10 text-muted border-white/10",
};

const INSERCION_COLOR: Record<string, string> = {
  "En formación":    "text-muted/70",
  "Empleado empresa": "text-emerald-400 font-semibold",
  "Autoempleo":      "text-orange-400 font-semibold",
  "FEOE":            "text-blue-400 font-semibold",
  "Sigue estudiando": "text-purple-400",
  "En búsqueda":     "text-yellow-400",
  "Sin datos":       "text-muted/50 italic",
};

const APTITUD_COLOR: Record<string, string> = {
  "Técnica":       "text-sky-400",
  "Analítica":     "text-purple-400",
  "Creativa":      "text-pink-400",
  "Comercial":     "text-amber-400",
  "Comunicativa":  "text-teal-400",
  "Relacional":    "text-green-400",
  "Emprendedora":  "text-orange-400",
  "Organizativa":  "text-cyan-400",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ResumenTab = () => {
  const { cursoData } = useAppStore();

  const df_al = cursoData?.df_al || [];
  const allStudents = df_al; // include all (Alta + Baja for reference)
  const activeStudents = df_al.filter((al: Alumnado) => al.Estado !== "Baja");
  const profesionalLedger = cursoData?.profesional_ledger || {};

  // Filters
  const [filterEstado, setFilterEstado] = useState<"todos" | "Alta" | "Baja">("Alta");
  const [filterIntencion, setFilterIntencion] = useState<string>("");
  const [filterAptitud, setFilterAptitud] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [sortField, setSortField] = useState<string>("apellidos");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const students = filterEstado === "todos" ? allStudents
    : filterEstado === "Alta" ? activeStudents
    : allStudents.filter((al: Alumnado) => al.Estado === "Baja");

  const uniqueIntenciones = useMemo(() => {
    const set = new Set<string>();
    Object.values(profesionalLedger).forEach((d: any) => {
      if (d.intencion_al_terminar) set.add(d.intencion_al_terminar);
    });
    return Array.from(set).sort();
  }, [profesionalLedger]);

  const uniqueAptitudes = useMemo(() => {
    const set = new Set<string>();
    Object.values(profesionalLedger).forEach((d: any) => {
      if (d.aptitud_principal) set.add(d.aptitud_principal);
    });
    return Array.from(set).sort();
  }, [profesionalLedger]);

  const filtered = useMemo(() => {
    let list = [...students];

    if (filterIntencion) {
      list = list.filter((al: Alumnado) =>
        profesionalLedger[al.ID!]?.intencion_al_terminar === filterIntencion
      );
    }
    if (filterAptitud) {
      list = list.filter((al: Alumnado) =>
        profesionalLedger[al.ID!]?.aptitud_principal === filterAptitud
      );
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter((al: Alumnado) =>
        `${al.Apellidos} ${al.Nombre} ${al.ID}`.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let va = "", vb = "";
      if (sortField === "apellidos") { va = a.Apellidos || ""; vb = b.Apellidos || ""; }
      else if (sortField === "intencion") {
        va = profesionalLedger[a.ID!]?.intencion_al_terminar || "";
        vb = profesionalLedger[b.ID!]?.intencion_al_terminar || "";
      } else if (sortField === "aptitud") {
        va = profesionalLedger[a.ID!]?.aptitud_principal || "";
        vb = profesionalLedger[b.ID!]?.aptitud_principal || "";
      } else if (sortField === "area") {
        va = profesionalLedger[a.ID!]?.area_interes || "";
        vb = profesionalLedger[b.ID!]?.area_interes || "";
      }
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

    return list;
  }, [students, filterIntencion, filterAptitud, searchText, sortField, sortDir, profesionalLedger]);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span className="text-muted/30 ml-1">↕</span>;
    return <span className="text-accent ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const nConFicha = filtered.filter((al: Alumnado) =>
    profesionalLedger[al.ID!] && Object.keys(profesionalLedger[al.ID!]).length > 0
  ).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">

      {/* ── Filters bar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Buscar alumnado/a..."
            className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded-xl px-4 py-2 pl-9 text-sm text-foreground focus:border-accent focus:outline-none"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
        </div>

        {/* Estado filter */}
        <div className="flex rounded-xl border border-[var(--glass-border)] overflow-hidden text-xs font-bold">
          {(["todos", "Alta", "Baja"] as const).map(v => (
            <button
              key={v}
              onClick={() => setFilterEstado(v)}
              className={`px-4 py-2 transition-colors ${filterEstado === v ? "bg-accent text-background" : "bg-foreground/5 text-muted hover:text-foreground"}`}
            >
              {v === "todos" ? "Todos" : v === "Alta" ? "✅ Activos" : "❌ Baja"}
            </button>
          ))}
        </div>

        {/* Intención filter */}
        <select
          value={filterIntencion}
          onChange={e => setFilterIntencion(e.target.value)}
          className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none cursor-pointer"
        >
          <option value="">Toda intención</option>
          {uniqueIntenciones.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        {/* Aptitud filter */}
        <select
          value={filterAptitud}
          onChange={e => setFilterAptitud(e.target.value)}
          className="bg-foreground/10 border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none cursor-pointer"
        >
          <option value="">Toda aptitud</option>
          {uniqueAptitudes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        {/* Counter */}
        <div className="text-xs text-muted ml-auto shrink-0">
          <span className="font-bold text-foreground">{nConFicha}</span>/{filtered.length} con ficha
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <Card className="border border-white/5 overflow-hidden bg-foreground/3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-foreground/8 text-muted text-xs tracking-wider">
                <th
                  className="text-left p-4 font-semibold cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  onClick={() => toggleSort("apellidos")}
                >
                  Alumnado/a <SortIcon field="apellidos" />
                </th>
                <th className="p-4 text-left font-semibold whitespace-nowrap">Vía acceso</th>
                <th
                  className="text-left p-4 font-semibold cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  onClick={() => toggleSort("aptitud")}
                >
                  Aptitud <SortIcon field="aptitud" />
                </th>
                <th
                  className="text-left p-4 font-semibold cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  onClick={() => toggleSort("area")}
                >
                  Área interés <SortIcon field="area" />
                </th>
                <th
                  className="text-left p-4 font-semibold cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  onClick={() => toggleSort("intencion")}
                >
                  Intención al terminar <SortIcon field="intencion" />
                </th>
                <th className="text-left p-4 font-semibold whitespace-nowrap">Inserción</th>
                <th className="text-center p-4 font-semibold whitespace-nowrap">🌍</th>
                <th className="text-center p-4 font-semibold whitespace-nowrap">🚀</th>
                <th className="text-center p-4 font-semibold whitespace-nowrap">🎓</th>
                <th className="text-center p-4 font-semibold whitespace-nowrap">⚠️</th>
                <th className="text-left p-4 font-semibold whitespace-nowrap">Reuniones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-muted">
                    No hay alumnado que coincidan con los filtros.
                  </td>
                </tr>
              ) : filtered.map((al: Alumnado) => {
                const d = profesionalLedger[al.ID!] || {};
                const hasFicha = Object.keys(d).length > 0;
                const isExpanded = expandedId === al.ID;
                const isBaja = al.Estado === "Baja";

                return (
                  <React.Fragment key={al.ID}>
                    {/* Main row */}
                    <tr
                      className={`border-b border-white/5 transition-colors cursor-pointer ${isExpanded ? "bg-accent/5" : "hover:bg-foreground/5"} ${isBaja ? "opacity-50" : ""}`}
                      onClick={() => setExpandedId(isExpanded ? null : al.ID ?? null)}
                    >
                      {/* Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted">{isExpanded ? "▲" : "▶"}</span>
                          <div>
                            <div className="font-semibold text-foreground">
                              {al.Apellidos}, {al.Nombre}
                              {isBaja && <span className="ml-2 text-[10px] text-red-400 border border-red-400/30 px-1.5 py-0.5 rounded-full">Baja</span>}
                            </div>
                            <div className="text-[10px] text-muted font-mono">{al.ID}</div>
                          </div>
                          {!hasFicha && (
                            <span className="text-[10px] text-muted/50 border border-white/10 px-1.5 py-0.5 rounded-full ml-1">Sin ficha</span>
                          )}
                        </div>
                      </td>

                      {/* Vía acceso */}
                      <td className="p-4 text-foreground/70 text-xs">{d.via_acceso || <span className="text-muted/40">—</span>}</td>

                      {/* Aptitud */}
                      <td className="p-4">
                        {d.aptitud_principal
                          ? <span className={`font-semibold ${APTITUD_COLOR[d.aptitud_principal] || "text-foreground/70"}`}>{d.aptitud_principal}</span>
                          : <span className="text-muted/40">—</span>}
                      </td>

                      {/* Área */}
                      <td className="p-4 text-foreground/70 text-xs max-w-[160px] truncate">
                        {d.area_interes || <span className="text-muted/40">—</span>}
                      </td>

                      {/* Intención */}
                      <td className="p-4">
                        {d.intencion_al_terminar
                          ? <span className={`text-xs font-semibold border px-2 py-1 rounded-full ${INTENCION_COLOR[d.intencion_al_terminar] || "bg-foreground/10 text-muted border-white/10"}`}>
                              {d.intencion_al_terminar}
                            </span>
                          : <span className="text-muted/40 text-xs">—</span>}
                      </td>

                      {/* Inserción */}
                      <td className={`p-4 text-xs ${INSERCION_COLOR[d.estado_insercion] || "text-foreground/70"}`}>
                        {d.estado_insercion || <span className="text-muted/40">—</span>}
                      </td>

                      {/* Erasmus */}
                      <td className="p-4 text-center">
                        {d.interes_erasmus === "X" ? <span title="Interesado/a en Erasmus+">🌍</span> : <span className="text-muted/20">·</span>}
                      </td>

                      {/* Emprender */}
                      <td className="p-4 text-center">
                        {d.interes_emprender === "X" ? <span title="Tiene idea de negocio">🚀</span> : <span className="text-muted/20">·</span>}
                      </td>

                      {/* Universidad */}
                      <td className="p-4 text-center">
                        {d.interes_universidad === "X" ? <span title="Interesado/a en universidad">🎓</span> : <span className="text-muted/20">·</span>}
                      </td>

                      {/* Derivado orientador */}
                      <td className="p-4 text-center">
                        {d.derivado_orientador === "X"
                          ? <span className="text-amber-400 font-bold" title="Derivado al orientador">⚠️</span>
                          : <span className="text-muted/20">·</span>}
                      </td>

                      {/* Reuniones */}
                      <td className="p-4 text-center">
                        {d.reuniones_celebradas
                          ? <span className="text-xs font-bold text-foreground/80 bg-foreground/10 px-2 py-0.5 rounded-full">{d.reuniones_celebradas}</span>
                          : <span className="text-muted/40 text-xs">—</span>}
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr className="border-b border-white/5 bg-accent/3">
                        <td colSpan={11} className="px-8 py-5">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                            {/* Col 1: Perfil */}
                            <div className="space-y-3">
                              <div className="text-[10px] font-bold text-muted tracking-widest mb-2">🎯 Perfil</div>
                              {[
                                ["Motivo elección", d.motivo_eleccion],
                                ["Experiencia previa", d.experiencia_previa],
                                ["Sector experiencia", d.sector_experiencia],
                                ["Trabaja actualmente", d.jornada_actual],
                                ["Empresa actual", d.empresa_actual],
                              ].map(([label, val]) => val ? (
                                <div key={label} className="flex gap-2 text-xs">
                                  <span className="text-muted shrink-0">{label}:</span>
                                  <span className="text-foreground/80">{val}</span>
                                </div>
                              ) : null)}
                              {/* Intereses con iconos */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {d.interes_bolsa_empleo === "X" && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">📋 Bolsa empleo</span>}
                                {d.interes_erasmus === "X" && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">🌍 Erasmus+</span>}
                                {d.interes_emprender === "X" && <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">🚀 Emprender</span>}
                                {d.interes_mentoria === "X" && <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">🤝 Mentoría</span>}
                                {d.interes_universidad === "X" && <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">🎓 Universidad</span>}
                                {d.empresa_identificada === "X" && <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full">🏢 Empresa identificada</span>}
                              </div>
                            </div>

                            {/* Col 2: Aspiraciones */}
                            <div className="space-y-3">
                              <div className="text-[10px] font-bold text-muted tracking-widest mb-2">🧭 Aspiraciones</div>
                              {[
                                ["Preferencia laboral", d.entorno_laboral_preferido],
                                ["Movilidad geográfica", d.preferencia_geografica],
                                ["Empresa objetivo", d.empresa_objetivo],
                                ["Ciclo / grado de interés", d.ciclo_superior_interes],
                              ].map(([label, val]) => val ? (
                                <div key={label} className="flex gap-2 text-xs">
                                  <span className="text-muted shrink-0">{label}:</span>
                                  <span className="text-foreground/80">{val}</span>
                                </div>
                              ) : null)}
                              {d.obs_aptitudes && (
                                <div className="text-xs text-foreground/70 border-l-2 border-white/10 pl-3 italic leading-relaxed mt-2">
                                  "{d.obs_aptitudes}"
                                </div>
                              )}
                            </div>

                            {/* Col 3: Seguimiento */}
                            <div className="space-y-3">
                              <div className="text-[10px] font-bold text-muted tracking-widest mb-2">📋 Seguimiento tutor</div>
                              {[
                                ["Reuniones celebradas", d.reuniones_celebradas],
                                ["Última reunión", d.fecha_ultima_reunion],
                                ["Familia informada", d.familia_informada === "X" ? "Sí" : null],
                                ["Derivado a orientador", d.derivado_orientador === "X" ? "Sí" : null],
                                ["Informe emitido", d.informe_emitido === "X" ? "Sí" : null],
                              ].map(([label, val]) => val ? (
                                <div key={label} className="flex gap-2 text-xs">
                                  <span className="text-muted shrink-0">{label}:</span>
                                  <span className="text-foreground/80">{val}</span>
                                </div>
                              ) : null)}
                              {d.resumen_orientacion && (
                                <div className="text-xs text-foreground/80 bg-foreground/5 border border-white/5 rounded-lg px-3 py-2 leading-relaxed mt-2">
                                  {d.resumen_orientacion}
                                </div>
                              )}
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="px-4 py-3 border-t border-white/5 bg-foreground/3 flex items-center justify-between">
          <span className="text-xs text-muted">
            Mostrando <strong className="text-foreground">{filtered.length}</strong> alumnado/as
          </span>
          <div className="flex gap-4 text-xs text-muted">
            <span>🌍 Erasmus: <strong className="text-foreground">{filtered.filter((al: Alumnado) => profesionalLedger[al.ID!]?.interes_erasmus === "X").length}</strong></span>
            <span>🚀 Emprender: <strong className="text-foreground">{filtered.filter((al: Alumnado) => profesionalLedger[al.ID!]?.interes_emprender === "X").length}</strong></span>
            <span>🎓 Universidad: <strong className="text-foreground">{filtered.filter((al: Alumnado) => profesionalLedger[al.ID!]?.interes_universidad === "X").length}</strong></span>
            <span>⚠️ Derivados: <strong className="text-amber-400">{filtered.filter((al: Alumnado) => profesionalLedger[al.ID!]?.derivado_orientador === "X").length}</strong></span>
          </div>
        </div>
      </Card>
    </div>
  );
};
