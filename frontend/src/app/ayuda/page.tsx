"use client";

import { useAppStore } from "@/store/useAppStore";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  CheckCircle, AlertTriangle, XCircle, ArrowRight,
  BookOpen, Users, BarChart2, CalendarDays, Wrench,
  ClipboardList, FileText, Building2, Briefcase, HeartHandshake,
  GraduationCap, Layers
} from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────────────
type CheckStatus = "ok" | "warning" | "empty";

interface CheckItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  href: string;
  hrefLabel: string;
  status: CheckStatus;
  lines: string[];
  actionHref?: string;
  actionLabel?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function pct(n: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

function sumPesos(arr: { peso_ra?: string | number; peso_ce?: string | number }[], field: "peso_ra" | "peso_ce") {
  return arr.reduce((acc, item) => acc + (parseFloat(String(item[field] ?? 0)) || 0), 0);
}

function StatusBadge({ status }: { status: CheckStatus }) {
  if (status === "ok")
    return <Badge variant="success" className="bg-green-500/10 text-green-400 border-green-500/30 shrink-0">Correcto</Badge>;
  if (status === "warning")
    return <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-amber-500/30 shrink-0">Advertencia</Badge>;
  return <Badge variant="default" className="bg-red-500/10 text-red-400 border-red-500/30 shrink-0">Sin datos</Badge>;
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "ok") return <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />;
  if (status === "warning") return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
  return <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
}

function CheckCard({ item }: { item: CheckItem }) {
  return (
    <Card className="p-5 border border-white/5 rounded-2xl bg-foreground/5 shadow space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted">{item.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground text-base leading-tight">{item.title}</h3>
            <StatusBadge status={item.status} />
          </div>
          {/* Detail lines */}
          <ul className="space-y-0.5">
            {item.lines.map((line, i) => (
              <li key={i} className="text-sm text-muted flex items-center gap-1.5">
                <StatusIcon status={item.status} />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
        <Link
          href={item.href}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
        >
          Ir a {item.hrefLabel} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        {item.actionHref && item.actionLabel && (
          <Link
            href={item.actionHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-all"
          >
            {item.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </Card>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────
export default function AyudaPage() {
  const { moduleData, cursoData, activeModuleId, activeCursoId } = useAppStore();

  // ── Comprobaciones Programación didáctica ────────────────────────────
  const m = moduleData;

  const udCount = m?.df_ud?.length ?? 0;
  const udHoras = (m?.df_ud ?? []).reduce((a, u) => a + (parseFloat(String(u.horas_ud ?? 0)) || 0), 0);
  const moduloHoras = parseFloat(String(m?.info_modulo?.horas_totales ?? 0)) || 0;
  const horasDiff = Math.abs(udHoras - moduloHoras);

  const raCount = m?.df_ra?.length ?? 0;
  const raPesoSum = sumPesos(m?.df_ra ?? [], "peso_ra");

  const ceCount = m?.df_ce?.length ?? 0;
  const ceHuerfanos = (m?.df_ce ?? []).filter(ce => {
    if (!ce.id_ra) return true;
    return !(m?.df_ra ?? []).some(ra => ra.id_ra === ce.id_ra);
  }).length;
  const ceSinUD = (m?.df_ce ?? []).filter(ce => {
    if (!ce.id_ud) return true;
    return !(m?.df_ud ?? []).some(ud => ud.id_ud === ce.id_ud);
  }).length;

  const instrCount = m?.df_instr?.length ?? 0;
  const instrPesoSum = sumPesos(m?.df_instr ?? [], "peso_ra");

  const tareasCount = m?.df_tareas?.length ?? 0;
  const tareasSinRA = (m?.df_tareas ?? []).filter(t => {
    if (!t.RA_Asociados) return true;
    if ((m?.df_ra ?? []).length === 0) return true;
    return false;
  }).length;

  const sesionesCount = m?.df_sesiones?.length ?? 0;
  const sesionesSinUD = (m?.df_sesiones ?? []).filter(s => {
    if (!s.id_ud) return true;
    return !(m?.df_ud ?? []).some(ud => ud.id_ud === s.id_ud);
  }).length;

  const tieneHorario = !!(m?.horario && Object.keys(m.horario).length > 0);
  const tieneFechas = !!(m?.info_fechas && Object.keys(m.info_fechas).length > 0);
  const tieneContexto = !!(m?.config_contexto && Object.keys(m.config_contexto).length > 0);

  const moduleChecks: CheckItem[] = [
    {
      id: "modulo",
      icon: <BookOpen className="w-5 h-5" />,
      title: "Módulo didáctico",
      href: "/modulo",
      hrefLabel: "Módulo",
      status: !m ? "empty" : (m.info_modulo?.nombre_modulo ? "ok" : "warning"),
      lines: !m
        ? ["Sin datos de programación cargados"]
        : [
          `Nombre: ${m.info_modulo?.nombre_modulo || "—"}`,
          `Código: ${m.info_modulo?.codigo_modulo || "—"}`,
          `Horas totales: ${moduloHoras || "—"}`,
        ],
      actionHref: !m ? "/modulo" : undefined,
      actionLabel: !m ? "Configurar módulo" : undefined,
    },
    {
      id: "ud",
      icon: <Layers className="w-5 h-5" />,
      title: "Unidades didácticas (UD)",
      href: "/matrices",
      hrefLabel: "Matrices",
      status: udCount === 0 ? "empty" : horasDiff > 2 ? "warning" : "ok",
      lines: udCount === 0
        ? ["No hay UD definidas"]
        : [
          `${udCount} UD definidas`,
          `Horas declaradas: ${udHoras} / ${moduloHoras || "—"} h del módulo`,
          horasDiff > 2 ? `Diferencia de ${horasDiff} h` : "Horas cuadran correctamente",
        ],
      actionHref: udCount === 0 ? "/matrices" : undefined,
      actionLabel: udCount === 0 ? "Añadir primera UD" : undefined,
    },
    {
      id: "ra",
      icon: <GraduationCap className="w-5 h-5" />,
      title: "Resultados de aprendizaje (RA)",
      href: "/matrices",
      hrefLabel: "Matrices",
      status: raCount === 0 ? "empty" : Math.abs(raPesoSum - 100) > 1 ? "warning" : "ok",
      lines: raCount === 0
        ? ["No hay RA definidos"]
        : [
          `${raCount} RA definidos`,
          `Suma de pesos: ${raPesoSum.toFixed(1)}% ${Math.abs(raPesoSum - 100) > 1 ? "⚠️ no suman 100%" : "✓"}`,
        ],
      actionHref: raCount === 0 ? "/matrices" : undefined,
      actionLabel: raCount === 0 ? "Añadir primer RA" : undefined,
    },
    {
      id: "ce",
      icon: <ClipboardList className="w-5 h-5" />,
      title: "Criterios de evaluación (CE)",
      href: "/matrices",
      hrefLabel: "Matrices",
      status: ceCount === 0 ? "empty" : (ceHuerfanos > 0 || ceSinUD > 0) ? "warning" : "ok",
      lines: ceCount === 0
        ? ["No hay CE definidos"]
        : [
          `${ceCount} CE definidos`,
          ceHuerfanos > 0 ? `${ceHuerfanos} CE sin RA asignado` : "Todos los CE tienen RA",
          ceSinUD > 0 ? `${ceSinUD} CE sin UD asignada` : "Todos los CE tienen UD",
        ],
      actionHref: (ceHuerfanos > 0 || ceSinUD > 0) ? "/matrices" : undefined,
      actionLabel: (ceHuerfanos > 0 || ceSinUD > 0) ? "Revisar asignaciones" : undefined,
    },
    {
      id: "instr",
      icon: <Wrench className="w-5 h-5" />,
      title: "Instrumentos de evaluación",
      href: "/instrumentos",
      hrefLabel: "Instrumentos",
      status: instrCount === 0 ? "empty" : Math.abs(instrPesoSum - 100) > 1 ? "warning" : "ok",
      lines: instrCount === 0
        ? ["No hay instrumentos definidos"]
        : [
          `${instrCount} instrumentos definidos`,
          `Suma de pesos: ${instrPesoSum.toFixed(1)}% ${Math.abs(instrPesoSum - 100) > 1 ? "⚠️ no suman 100%" : "✓"}`,
        ],
      actionHref: instrCount === 0 ? "/instrumentos" : undefined,
      actionLabel: instrCount === 0 ? "Añadir instrumento" : undefined,
    },
    {
      id: "tareas",
      icon: <FileText className="w-5 h-5" />,
      title: "Tareas y actividades",
      href: "/programacion",
      hrefLabel: "Programación",
      status: tareasCount === 0 ? "empty" : tareasSinRA > 0 ? "warning" : "ok",
      lines: tareasCount === 0
        ? ["No hay tareas definidas"]
        : [
          `${tareasCount} tareas definidas`,
          tareasSinRA > 0 ? `${tareasSinRA} tareas sin RA asociado` : "Todas las tareas tienen RA",
        ],
      actionHref: tareasCount === 0 ? "/programacion" : undefined,
      actionLabel: tareasCount === 0 ? "Crear primera tarea" : undefined,
    },
    {
      id: "sesiones",
      icon: <CalendarDays className="w-5 h-5" />,
      title: "Sesiones de clase",
      href: "/programacion",
      hrefLabel: "Programación",
      status: sesionesCount === 0 ? "empty" : sesionesSinUD > 0 ? "warning" : "ok",
      lines: sesionesCount === 0
        ? ["No hay sesiones planificadas"]
        : [
          `${sesionesCount} sesiones planificadas`,
          sesionesSinUD > 0 ? `${sesionesSinUD} sesiones sin UD asignada` : "Todas las sesiones tienen UD",
        ],
      actionHref: sesionesCount === 0 ? "/programacion" : undefined,
      actionLabel: sesionesCount === 0 ? "Planificar sesiones" : undefined,
    },
    {
      id: "calendario",
      icon: <CalendarDays className="w-5 h-5" />,
      title: "Calendario académico",
      href: "/calendario",
      hrefLabel: "Calendario",
      status: !tieneHorario && !tieneFechas ? "empty" : (!tieneHorario || !tieneFechas) ? "warning" : "ok",
      lines: [
        tieneHorario ? "Horario semanal definido" : "Sin horario semanal",
        tieneFechas ? "Fechas de evaluación configuradas" : "Sin fechas de evaluación",
      ],
      actionHref: !tieneHorario ? "/calendario" : undefined,
      actionLabel: !tieneHorario ? "Configurar calendario" : undefined,
    },
    {
      id: "contexto",
      icon: <BookOpen className="w-5 h-5" />,
      title: "Contexto del módulo",
      href: "/modulo",
      hrefLabel: "Módulo (tab Contexto)",
      status: tieneContexto ? "ok" : "empty",
      lines: tieneContexto
        ? ["Contexto del aula configurado"]
        : ["Sin descripción de contexto ni configuración de aula"],
      actionHref: !tieneContexto ? "/modulo" : undefined,
      actionLabel: !tieneContexto ? "Añadir contexto" : undefined,
    },
  ];

  // ── Comprobaciones Curso activo ──────────────────────────────────────
  const c = cursoData;

  const alumnosCount = c?.df_al?.length ?? 0;
  const alumnosIncompletos = (c?.df_al ?? []).filter(a => !a.Nombre || !a.Apellidos).length;
  const sgmtCount = Object.keys(c?.daily_ledger ?? {}).length;
  const tieneFeoe = (c?.crm_empresas?.length ?? 0) > 0;
  const empresasCount = c?.crm_empresas?.length ?? 0;
  const alumnosAsignados = (c?.crm_empresas ?? []).reduce((a, e) => a + (e.alumnado_asignados?.length ?? 0), 0);
  const tieneProfesional = !!(c?.profesional_ledger && Object.keys(c.profesional_ledger).length > 0);
  const tutoriaEntradas = Object.keys(c?.tutoria_ledger ?? {}).length;

  // Evaluaciones: df_eval rows
  const evalCount = c?.df_eval?.length ?? 0;
  const evalTotal = raCount * alumnosCount;

  const courseChecks: CheckItem[] = [
    {
      id: "alumnado",
      icon: <Users className="w-5 h-5" />,
      title: "Alumnado y tutoría",
      href: "/alumnado",
      hrefLabel: "Alumnado",
      status: alumnosCount === 0 ? "empty" : alumnosIncompletos > 0 ? "warning" : "ok",
      lines: alumnosCount === 0
        ? ["No hay alumnado registrado"]
        : [
          `${alumnosCount} alumnos registrados`,
          alumnosIncompletos > 0 ? `${alumnosIncompletos} registros incompletos (sin nombre/apellidos)` : "Todos los registros completos",
        ],
      actionHref: alumnosCount === 0 ? "/alumnado" : undefined,
      actionLabel: alumnosCount === 0 ? "Añadir alumnado" : undefined,
    },
    {
      id: "seguimiento",
      icon: <ClipboardList className="w-5 h-5" />,
      title: "Seguimiento diario",
      href: "/seguimiento",
      hrefLabel: "Seguimiento",
      status: sgmtCount === 0 ? "empty" : "ok",
      lines: sgmtCount === 0
        ? ["Sin entradas de seguimiento diario"]
        : [`${sgmtCount} sesiones registradas en el diario`],
      actionHref: sgmtCount === 0 ? "/seguimiento" : undefined,
      actionLabel: sgmtCount === 0 ? "Registrar primera sesión" : undefined,
    },
    {
      id: "evaluaciones",
      icon: <BarChart2 className="w-5 h-5" />,
      title: "Progreso académico",
      href: "/progreso",
      hrefLabel: "Progreso",
      status: evalCount === 0 ? "empty" : evalTotal > 0 && evalCount < evalTotal ? "warning" : "ok",
      lines: evalCount === 0
        ? ["Sin calificaciones introducidas"]
        : [
          `${evalCount} calificaciones de ${evalTotal > 0 ? evalTotal : "?"} posibles (${pct(evalCount, evalTotal)})`,
          evalTotal > 0 && evalCount < evalTotal
            ? `Faltan ${evalTotal - evalCount} calificaciones`
            : "Todas las calificaciones introducidas",
        ],
      actionHref: evalCount === 0 ? "/progreso" : undefined,
      actionLabel: evalCount === 0 ? "Ir a calificaciones" : undefined,
    },
    {
      id: "feoe",
      icon: <Building2 className="w-5 h-5" />,
      title: "Prácticas FEOE",
      href: "/feoe",
      hrefLabel: "FEOE",
      status: !tieneFeoe ? "empty" : "ok",
      lines: !tieneFeoe
        ? ["Sin empresas colaboradoras registradas"]
        : [
          `${empresasCount} empresas colaboradoras`,
          `${alumnosAsignados} alumnos asignados a empresa`,
        ],
      actionHref: !tieneFeoe ? "/feoe" : undefined,
      actionLabel: !tieneFeoe ? "Añadir empresa" : undefined,
    },
    {
      id: "profesional",
      icon: <Briefcase className="w-5 h-5" />,
      title: "Orientación profesional",
      href: "/profesional",
      hrefLabel: "Profesional",
      status: tieneProfesional ? "ok" : "empty",
      lines: tieneProfesional
        ? ["Plan de orientación profesional configurado"]
        : ["Sin plan de orientación profesional"],
      actionHref: !tieneProfesional ? "/profesional" : undefined,
      actionLabel: !tieneProfesional ? "Crear plan de orientación" : undefined,
    },
    {
      id: "tutoria",
      icon: <HeartHandshake className="w-5 h-5" />,
      title: "Tutoría",
      href: "/alumnado",
      hrefLabel: "Alumnado (tab Tutoría)",
      status: tutoriaEntradas === 0 ? "empty" : "ok",
      lines: tutoriaEntradas === 0
        ? ["Sin entradas de tutoría registradas"]
        : [`${tutoriaEntradas} entradas de tutoría registradas`],
      actionHref: tutoriaEntradas === 0 ? "/alumnado" : undefined,
      actionLabel: tutoriaEntradas === 0 ? "Registrar tutoría" : undefined,
    },
  ];

  // ── Resumen global ────────────────────────────────────────────────────
  const allChecks = [...moduleChecks, ...courseChecks];
  const okCount = allChecks.filter(c => c.status === "ok").length;
  const warnCount = allChecks.filter(c => c.status === "warning").length;
  const emptyCount = allChecks.filter(c => c.status === "empty").length;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-8 pb-12">

            {/* ── Título ─────────────────────────────────────────── */}
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                🩺 Ayuda y verificación
              </h1>
              <p className="text-muted mt-2 text-base">
                Estado de los datos del cuaderno. Comprueba la coherencia de la programación activa y el curso.
              </p>
              <div className="flex flex-wrap gap-2 mt-3 text-sm text-muted">
                <span className="bg-foreground/5 border border-white/5 rounded-lg px-3 py-1">
                  Programación: <span className="font-semibold text-foreground">{activeModuleId || "—"}</span>
                </span>
                <span className="bg-foreground/5 border border-white/5 rounded-lg px-3 py-1">
                  Curso: <span className="font-semibold text-foreground">{activeCursoId || "—"}</span>
                </span>
              </div>
            </div>

            {/* ── Resumen ────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 border border-green-500/20 bg-green-500/5 rounded-2xl text-center">
                <CheckCircle className="w-7 h-7 text-green-400 mx-auto mb-1" />
                <div className="text-2xl font-extrabold text-green-400">{okCount}</div>
                <div className="text-xs text-muted mt-0.5">Correctos</div>
              </Card>
              <Card className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-2xl text-center">
                <AlertTriangle className="w-7 h-7 text-amber-400 mx-auto mb-1" />
                <div className="text-2xl font-extrabold text-amber-400">{warnCount}</div>
                <div className="text-xs text-muted mt-0.5">Advertencias</div>
              </Card>
              <Card className="p-4 border border-red-500/20 bg-red-500/5 rounded-2xl text-center">
                <XCircle className="w-7 h-7 text-red-400 mx-auto mb-1" />
                <div className="text-2xl font-extrabold text-red-400">{emptyCount}</div>
                <div className="text-xs text-muted mt-0.5">Sin datos</div>
              </Card>
            </div>

            {/* ── Sección A: Programación didáctica ─────────────── */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-white/5 pb-2">
                <BookOpen className="w-4 h-4 text-accent" />
                Programación didáctica
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {moduleChecks.map(item => (
                  <CheckCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* ── Sección B: Curso activo ────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-white/5 pb-2">
                <Users className="w-4 h-4 text-accent" />
                Curso activo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {courseChecks.map(item => (
                  <CheckCard key={item.id} item={item} />
                ))}
              </div>
            </div>

          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
