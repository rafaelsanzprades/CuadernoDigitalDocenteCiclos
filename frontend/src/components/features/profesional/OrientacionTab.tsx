"use client";
import { BarChart, BookOpen, Brain, Briefcase, Building2, CheckCircle2, ChevronDown, ChevronUp, ClipboardList, Coins, Diamond, Factory, Folder, Globe, Globe2, GraduationCap, Handshake, Heart, HelpCircle, Hospital, Lock, Map, MapPin, MessageSquare, Monitor, NotebookPen, Palette, RefreshCw, Rocket, Search, Server, Store, Target, TrendingUp, UserCog, Users, Wrench, XCircle, Zap } from "lucide-react";
import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Alumnado } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const renderSectionHeader = (
  id: string,
  title: string,
  icon: React.ReactNode,
  isOpen: boolean,
  onToggle: (id: string) => void
) => (
  <button
    onClick={() => onToggle(id)}
    className="w-full flex items-center justify-between p-4 bg-foreground/5 hover:bg-foreground/10 rounded-xl border border-white/5 transition-all text-left font-bold text-base"
  >
    <div className="flex items-center gap-3 text-foreground">
      {icon}
      <span>{title}</span>
    </div>
    {isOpen ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
  </button>
);

// ─── Main OrientacionTab ──────────────────────────────────────────────────────

export const OrientacionTab = () => {
  const { cursoData, updateCursoData } = useAppStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    motivacion: true,
    experiencia: false,
    aptitudes: false,
    aspiraciones: false,
    insercion: false,
    notas: false,
  });

  const df_al = cursoData?.df_al || [];
  const activeStudents = [...df_al.filter((al: Alumnado) => al.Estado !== "Baja")].sort(
    (a, b) => (a.Apellidos || "").localeCompare(b.Apellidos || "")
  );

  const profesionalLedger = cursoData?.profesional_ledger || {};
  const currentStudent = activeStudents.find((s) => s.ID === selectedStudentId);
  const studentData = selectedStudentId ? (profesionalLedger[selectedStudentId] || {}) : {};

  React.useEffect(() => {
    if (activeStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(activeStudents[0].ID || "");
    }
  }, [activeStudents.length]);

  const toggleSection = (section: string) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const updateField = (field: string, value: any) => {
    if (!selectedStudentId) return;
    const newLedger = { ...profesionalLedger };
    if (!newLedger[selectedStudentId]) newLedger[selectedStudentId] = {};
    newLedger[selectedStudentId][field] = value;
    updateCursoData("profesional_ledger", newLedger);
  };

  // Field renderers
  const renderInput = (field: string, label: string, type = "text", placeholder = "") => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted tracking-wider">{label}</label>
      <input
        type={type}
        value={studentData[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground text-sm focus:border-accent focus:outline-none focus:bg-background/40 transition-all"
      />
    </div>
  );

  const renderTextarea = (field: string, label: string, placeholder = "") => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted tracking-wider">{label}</label>
      <textarea
        value={studentData[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground text-sm focus:border-accent focus:outline-none focus:bg-background/40 transition-all resize-none"
      />
    </div>
  );

  const renderSelect = (field: string, label: string, options: { value: string; label: string }[]) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted tracking-wider">{label}</label>
      <select
        value={studentData[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground text-sm focus:border-accent focus:outline-none focus:bg-background/40 transition-all cursor-pointer"
      >
        <option value="" className="bg-[#0f172a] text-muted">-- Seleccionar --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0f172a] text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderCheckbox = (field: string, label: string) => {
    const isChecked = studentData[field] === true || studentData[field] === "X";
    return (
      <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer hover:text-foreground transition-colors py-1.5 select-none">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => updateField(field, e.target.checked ? "X" : "")}
          className="w-4 h-4 rounded bg-foreground/15 border-[var(--glass-border)] accent-accent focus:ring-0 focus:outline-none cursor-pointer"
        />
        <span>{label}</span>
      </label>
    );
  };

  if (activeStudents.length === 0) {
    return (
      <Card className="p-8 text-center border-l-4 border-l-yellow-500 mt-6">
        <h2 className="text-xl font-bold text-warning mb-2">Sin alumnado</h2>
        <p className="text-foreground/80">
          Primero registra alumnado en la pestaña <span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> Alumnado y tutoría.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
      {/* ── Student list sidebar ─────────────────────────────────── */}
      <div className="w-80 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/5 bg-foreground/10">
          <div className="text-xs font-medium text-muted tracking-wider">
            Alumnado activos ({activeStudents.length})
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          {activeStudents.map((al) => {
            const isSelected = al.ID === selectedStudentId;
            const hasData = !!(profesionalLedger[al.ID!] && Object.keys(profesionalLedger[al.ID!]).length > 0);
            return (
              <button
                key={al.ID}
                onClick={() => setSelectedStudentId(al.ID || "")}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-accent text-background font-bold shadow-md shadow-accent/15"
                    : "text-foreground/80 hover:bg-foreground/5"
                }`}
              >
                <div className="truncate pr-2">
                  <div className="text-sm truncate">
                    {al.Apellidos}, {al.Nombre}
                  </div>
                  <div className={`text-[10px] font-mono ${isSelected ? "text-background/70" : "text-muted"}`}>
                    {al.ID}
                  </div>
                </div>
                {hasData && (
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isSelected ? "bg-background/60" : "bg-accent/70"
                    }`}
                    title="Tiene datos de orientación"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Accordion panel ──────────────────────────────────────── */}
      <div className="flex-1 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
        {currentStudent ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-foreground/10 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-black text-foreground">
                  {currentStudent.Nombre} {currentStudent.Apellidos}
                </h3>
                <div className="text-xs text-muted font-mono mt-1">
                  ID: {currentStudent.ID} · {currentStudent.Edad ? `${currentStudent.Edad} años` : "Edad no registrada"}
                </div>
              </div>
              {/* Quick summary badge */}
              {studentData["intencion_al_terminar"] && (
                <div className="text-xs font-semibold bg-accent/10 border border-accent/30 text-accent px-3 py-1.5 rounded-full">
                  {studentData["intencion_al_terminar"]}
                </div>
              )}
            </div>

            {/* Scrollable sections */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">

              {/* ── SECCIÓN 1: Motivación y elección ─────────────── */}
              <div className="space-y-3">
                {renderSectionHeader("motivacion", "Sección 1: Motivación y elección del ciclo", <Target className="w-5 h-5 text-info" />, openSections.motivacion, toggleSection)}
                {openSections.motivacion && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    {renderSelect("motivo_eleccion", "Motivo de elección del ciclo", [
                      { value: "Vocación", label: "Vocación / pasión por el sector" },
                      { value: "Salida laboral", label: "Salida laboral clara" },
                      { value: "Reorientación", label: "Reorientación profesional" },
                      { value: "Por descarte", label: "Por descarte (no otra opción)" },
                      { value: "Familia", label: "Influencia familiar o entorno" },
                      { value: "Coste económico", label: "Coste económico vs universidad" },
                    ])}
                    {renderSelect("via_acceso", "Vía de acceso al ciclo", [
                      { value: "ESO", label: "ESO (título graduado)" },
                      { value: "FPGB", label: "FP Grado Básico" },
                      { value: "FPGM", label: "FP Grado Medio (a GS)" },
                      { value: "Bachillerato", label: "Bachillerato" },
                      { value: "Prueba acceso", label: "Prueba de acceso" },
                      { value: "Convalidación parcial", label: "Convalidación parcial" },
                      { value: "Otra", label: "Otra vía" },
                    ])}
                    {renderInput("ciclo_previo", "Ciclo o estudios previos cursados", "text", "Ej. ASIR, DAW, SMR, Bachillerato Científico...")}
                    <div className="flex flex-col gap-3 pt-1">
                      {renderCheckbox("primera_opcion", "Este ciclo era su primera opción")}
                      {renderCheckbox("estudia_y_trabaja", "Estudia a la vez que trabaja")}
                      {renderCheckbox("cambio_de_ciclo", "Cambio de ciclo / segunda matrícula")}
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECCIÓN 2: Experiencia laboral previa ─────────── */}
              <div className="space-y-3">
                {renderSectionHeader("experiencia", "Sección 2: Experiencia y situación laboral", <Briefcase className="w-5 h-5 text-warning" />, openSections.experiencia, toggleSection)}
                {openSections.experiencia && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    {renderSelect("experiencia_previa", "Experiencia laboral previa", [
                      { value: "Sin experiencia", label: "Sin experiencia laboral" },
                      { value: "Esporádica", label: "Trabajos esporádicos / eventuales" },
                      { value: "Relacionada", label: "Relacionada con el ciclo" },
                      { value: "No relacionada", label: "No relacionada con el ciclo" },
                      { value: "Autónomo", label: "Actividad por cuenta propia" },
                    ])}
                    {renderInput("sector_experiencia", "Sector de experiencia previa", "text", "Ej. Hostelería, Comercio, Tecnología, Sanidad...")}
                    {renderInput("meses_experiencia", "Meses de experiencia estimados", "number", "0")}
                    {renderSelect("jornada_actual", "Situación laboral actual", [
                      { value: "No trabaja", label: "No trabaja actualmente" },
                      { value: "Parcial", label: "Trabaja a tiempo parcial" },
                      { value: "Completa", label: "Trabaja a jornada completa" },
                      { value: "Autónomo", label: "Autónomo / por cuenta propia" },
                    ])}
                    {renderInput("empresa_actual", "Empresa actual (si aplica)", "text", "Nombre de la empresa...")}
                    {renderCheckbox("cotiza_seguridad_social", "Cotiza en Seguridad Social actualmente")}
                  </div>
                )}
              </div>

              {/* ── SECCIÓN 3: Intereses y aptitudes ──────────────── */}
              <div className="space-y-3">
                {renderSectionHeader("aptitudes", "Sección 3: Intereses y aptitudes detectadas", <Brain className="w-5 h-5 text-info" />, openSections.aptitudes, toggleSection)}
                {openSections.aptitudes && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderSelect("aptitud_principal", "Aptitud principal detectada", [
                        { value: "Técnica", label: "Técnica / práctica" },
                        { value: "Analítica", label: "Analítica / investigadora" },
                        { value: "Creativa", label: "Creativa / innovadora" },
                        { value: "Comercial", label: "Comercial / negociadora" },
                        { value: "Comunicativa", label: "Comunicativa / docente" },
                        { value: "Relacional", label: "Relacional / social" },
                        { value: "Emprendedora", label: "Emprendedora / autónoma" },
                        { value: "Organizativa", label: "Organizativa / gestora" },
                      ])}
                      {renderSelect("area_interes", "Área de interés dominante", [
                        { value: "Desarrollo software", label: "Desarrollo software / programación" },
                        { value: "Sistemas / infraestructura", label: "Sistemas / infraestructura" },
                        { value: "Ciberseguridad", label: "Ciberseguridad" },
                        { value: "Datos / IA", label: "Datos / IA / Machine Learning" },
                        { value: "Diseño / UX", label: "Diseño / UX / multimedia" },
                        { value: "Electrónica / hardware", label: "Electrónica / hardware" },
                        { value: "Atención al cliente", label: "Atención al cliente / soporte" },
                        { value: "Gestión / administración", label: "Gestión / administración" },
                        { value: "Sanidad / cuidados", label: "Sanidad / cuidados" },
                        { value: "Industria / producción", label: "Industria / producción" },
                        { value: "Otro", label: "Otro / no definido aún" },
                      ])}
                      {renderSelect("entorno_laboral_preferido", "Entorno laboral preferido", [
                        { value: "Empresa grande", label: "Empresa grande / corporación" },
                        { value: "PYME", label: "PYME / empresa mediana" },
                        { value: "Startup", label: "Startup / empresa emergente" },
                        { value: "Administración pública", label: "️ Administración pública" },
                        { value: "ONG / sector social", label: "ONG / sector social" },
                        { value: "Autónomo / freelance", label: "Autónomo / freelance" },
                        { value: "Indiferente", label: "Indiferente" },
                      ])}
                      {renderSelect("preferencia_geografica", "Preferencia geográfica de trabajo", [
                        { value: "Local / ciudad actual", label: "Local / ciudad actual" },
                        { value: "Nacional", label: "Nacional (movilidad España)" },
                        { value: "Internacional", label: "Internacional" },
                        { value: "Indiferente", label: "Indiferente" },
                      ])}
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <div className="text-xs font-medium text-muted tracking-wider mb-3">Idiomas de trabajo</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {renderCheckbox("idioma_espanol", "Español (nativo / fluido)")}
                        {renderCheckbox("idioma_ingles", "Inglés")}
                        {renderCheckbox("idioma_frances", "Francés")}
                        {renderCheckbox("idioma_aleman", "Alemán")}
                        {renderCheckbox("idioma_portugues", "Portugués")}
                        {renderCheckbox("idioma_otro", "Otro idioma")}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      {renderTextarea("obs_aptitudes", "Observaciones del tutor sobre aptitudes e intereses", "Describe las fortalezas observadas, áreas de mejora, actitud ante el trabajo en equipo, iniciativa, etc.")}
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECCIÓN 4: Aspiraciones al terminar ───────────── */}
              <div className="space-y-3">
                {renderSectionHeader("aspiraciones", "Sección 4: Aspiraciones al finalizar el ciclo", <Rocket className="w-5 h-5 text-success" />, openSections.aspiraciones, toggleSection)}
                {openSections.aspiraciones && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderSelect("intencion_al_terminar", "Intención principal al terminar", [
                        { value: "Empleo inmediato", label: "Buscar empleo inmediatamente" },
                        { value: "FEOE / prácticas empresa", label: "FEOE / prácticas en empresa colaboradora" },
                        { value: "Ciclo superior", label: "Continuar con otro ciclo (GM→GS)" },
                        { value: "Universidad", label: "Continuar en universidad" },
                        { value: "Emprender", label: "Emprender / autoempleo" },
                        { value: "Sin decidir", label: "Aún sin decidir" },
                      ])}
                      {renderInput("empresa_objetivo", "Empresa o sector objetivo (si lo tiene)", "text", "Ej. INDITEX, empresa local TIC, clínica propia...")}
                      {renderInput("ciclo_superior_interes", "Ciclo superior / grado de interés", "text", "Ej. DAM, ASIR, Ingeniería Informática, ADE...")}
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <div className="text-xs font-medium text-muted tracking-wider mb-3">Intereses específicos</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {renderCheckbox("interes_erasmus", "Interesado en FEOE internacional (Erasmus+)")}
                        {renderCheckbox("interes_bolsa_empleo", "Interesado en bolsa de empleo del centro")}
                        {renderCheckbox("interes_mentoria", "Quiere mentoría con exalumnado/profesional")}
                        {renderCheckbox("interes_emprender", "Tiene idea de negocio / proyecto propio")}
                        {renderCheckbox("interes_universidad", "Valora acceder a universidad tras FP")}
                        {renderCheckbox("empresa_identificada", "Ya tiene empresa de interés identificada")}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECCIÓN 5: Seguimiento de inserción ───────────── */}
              <div className="space-y-3">
                {renderSectionHeader("insercion", "Sección 5: Inserción laboral (post-ciclo)", <TrendingUp className="w-5 h-5 text-info" />, openSections.insercion, toggleSection)}
                {openSections.insercion && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-info border border-info/30 bg-info/10 rounded-lg px-3 py-2">
                      ℹ️ Esta sección se rellena al finalizar el ciclo o como seguimiento de egresados.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderSelect("estado_insercion", "Estado de inserción laboral", [
                        { value: "En formación", label: "Todavía en formación / ciclo en curso" },
                        { value: "En búsqueda", label: "Egresado — en búsqueda activa" },
                        { value: "Empleado empresa", label: "Empleado en empresa" },
                        { value: "FEOE", label: "Realizando FEOE / prácticas" },
                        { value: "Autoempleo", label: "Autoempleo / autónomo" },
                        { value: "Sigue estudiando", label: "Sigue estudiando (ciclo / universidad)" },
                        { value: "Sin datos", label: "Sin datos de seguimiento" },
                      ])}
                      {renderSelect("relacion_ciclo", "Relación del empleo con el ciclo", [
                        { value: "Sí, directamente", label: "Sí, directamente relacionado" },
                        { value: "Parcialmente", label: "Parcialmente relacionado" },
                        { value: "No relacionado", label: "No relacionado con el ciclo" },
                        { value: "N/A", label: "No aplica (sigue estudiando)" },
                      ])}
                      {renderInput("empresa_insercion", "Empresa de inserción", "text", "Nombre de la empresa...")}
                      {renderInput("puesto_obtenido", "Puesto o rol obtenido", "text", "Ej. Técnico de redes, Desarrollador Jr, Soporte TI...")}
                      {renderInput("fecha_insercion", "Fecha de incorporación", "date")}
                      {renderSelect("modalidad_contrato", "Modalidad de contrato", [
                        { value: "Indefinido", label: "Indefinido" },
                        { value: "Temporal", label: "Temporal / obra y servicio" },
                        { value: "Autónomo", label: "Autónomo" },
                        { value: "Prácticas", label: "Prácticas / becario" },
                        { value: "Beca", label: "Beca" },
                        { value: "FEOE", label: "Contrato FEOE (FCT)" },
                      ])}
                      {renderSelect("valoracion_egresado", "Valoración global del egresado (1-5)", [
                        { value: "1", label: " — Muy baja" },
                        { value: "2", label: " — Baja" },
                        { value: "3", label: " — Media" },
                        { value: "4", label: " — Alta" },
                        { value: "5", label: " — Excelente" },
                      ])}
                    </div>
                    <div className="border-t border-white/5 pt-4">
                      {renderTextarea("obs_insercion", "Observaciones de seguimiento de inserción", "Notas sobre el proceso de inserción, dificultades, contacto post-ciclo...")}
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECCIÓN 6: Notas del tutor ────────────────────── */}
              <div className="space-y-3">
                {renderSectionHeader("notas", "Sección 6: Notas y seguimiento del tutor", <NotebookPen className="w-5 h-5 text-danger" />, openSections.notas, toggleSection)}
                {openSections.notas && (
                  <div className="bg-background/20 border border-white/5 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    {renderInput("reuniones_celebradas", "Nº de reuniones de orientación celebradas", "number", "0")}
                    {renderInput("fecha_ultima_reunion", "Fecha de última reunión / entrevista", "date")}
                    <div className="flex flex-col gap-2 pt-1">
                      {renderCheckbox("familia_informada", "Familia / tutores legales informados")}
                      {renderCheckbox("derivado_orientador", "Derivado al orientador/a del centro")}
                      {renderCheckbox("informe_emitido", "Informe de orientación emitido")}
                    </div>
                    {renderInput("fecha_derivacion", "Fecha de derivación al orientador/a", "date")}
                    <div className="md:col-span-2">
                      {renderTextarea("resumen_orientacion", "Resumen de orientación (campo libre)", "Escribe aquí el resumen de la orientación: decisiones tomadas, acuerdos con el alumnado/a y la familia, próximos pasos...")}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-muted">
            <HelpCircle className="w-12 h-12 text-muted/50 mb-3" />
            <p className="font-semibold text-lg">Ningún alumnado seleccionado</p>
            <p className="text-sm opacity-80">Selecciona un alumnado de la lista de la izquierda.</p>
          </div>
        )}
      </div>
    </div>
  );
};
