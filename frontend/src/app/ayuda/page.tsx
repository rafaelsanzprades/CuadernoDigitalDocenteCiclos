"use client";
import { Activity, AlertTriangle, ArrowRight, BarChart2, BookOpen, Briefcase, Building2, CalendarDays, Check, CheckCircle, ClipboardList, FileText, GraduationCap, HeartHandshake, Layers, Users, Wrench, XCircle, ChevronDown, ListChecks, Info } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

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
    return <Badge variant="success" className="bg-success/10 text-success border-success/30 shrink-0">Correcto</Badge>;
  if (status === "warning")
    return <Badge variant="warning" className="bg-warning/10 text-warning border-warning/30 shrink-0">Advertencia</Badge>;
  return <Badge variant="default" className="bg-danger/10 text-danger border-danger/30 shrink-0">Sin datos</Badge>;
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "ok") return <CheckCircle className="w-5 h-5 text-success shrink-0" />;
  if (status === "warning") return <AlertTriangle className="w-5 h-5 text-warning shrink-0" />;
  return <XCircle className="w-5 h-5 text-danger shrink-0" />;
}

function CheckCard({ item }: { item: CheckItem }) {
  return (
    <Card className="p-5 border border-white/5 rounded-2xl bg-foreground/5 shadow space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted">{item.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground text-sm leading-tight">{item.title}</h3>
            <StatusBadge status={item.status} />
          </div>
          {/* Detail lines */}
          <ul className="space-y-0.5">
            {item.lines.map((line, i) => (
              <li key={i} className="text-sm text-muted flex items-start gap-1.5">
                <span className="text-foreground/40 font-bold px-1 mt-0.5">•</span>
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

// ── Componentes de Ayuda ──────────────────────────────────────────────────
function AccordionItem({ question, answer }: { question: string, answer: React.ReactNode }) {
  return (
    <details className="group glass-card rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden mb-3 border border-white/5">
      <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-foreground hover:bg-foreground/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50">
        <span>{question}</span>
        <span className="transition duration-300 group-open:-rotate-180 text-muted">
          <ChevronDown className="w-5 h-5" />
        </span>
      </summary>
      <div className="p-4 pt-0 text-muted leading-relaxed border-t border-white/5 mt-1 bg-foreground/5">
        {answer}
      </div>
    </details>
  );
}

const STEPS = [
  { 
    title: "Paso 1: Configurar el Entorno", 
    desc: "Ve a la pantalla 'Entorno' y crea una nueva Programación Didáctica. Luego, crea un Curso y vincúlalo a esa programación para poder empezar a trabajar.",
    links: [{ href: "/entorno", label: "Entorno de trabajo" }]
  },
  { 
    title: "Paso 2: Detalles del Módulo", 
    desc: "Entra en 'Módulo' y rellena los datos básicos: nombre, código, horas totales y contexto del aula. Asegúrate de guardar los cambios.",
    links: [{ href: "/modulo", label: "Módulo didáctico" }]
  },
  { 
    title: "Paso 3: Unidades y Resultados (Matrices)", 
    desc: "En la sección 'Matrices', define tus Unidades Didácticas (UD) y Resultados de Aprendizaje (RA). No olvides configurar los porcentajes de cada RA para que sumen 100%.",
    links: [{ href: "/matrices", label: "Matrices OG→RA→CE→UD" }]
  },
  { 
    title: "Paso 4: Criterios de Evaluación", 
    desc: "También en 'Matrices', vincula cada Criterio de Evaluación (CE) a sus respectivos RA y UD.",
    links: [{ href: "/matrices", label: "Matrices OG→RA→CE→UD" }]
  },
  { 
    title: "Paso 5: Instrumentos y Ponderaciones", 
    desc: "En 'Instrumentos', configura qué herramientas usarás para evaluar (ej. Exámenes, Trabajos, Observación) y asígnales el peso que tendrán dentro de cada RA.",
    links: [{ href: "/instrumentos", label: "Instrumentos de evaluación" }]
  },
  { 
    title: "Paso 6: Añadir Alumnado", 
    desc: "Ve a 'Alumnado' y añade tu lista de estudiantes usando la tabla interactiva.",
    links: [{ href: "/alumnado", label: "Alumnado y tutoría" }]
  },
  { 
    title: "Paso 7: Tareas y Seguimiento", 
    desc: "Por último, utiliza 'Programación' para planificar y 'Seguimiento' para llevar el día a día de tu aula. ¡Ya estás listo para arrancar el curso!",
    links: [
      { href: "/programacion", label: "Programación de aula" },
      { href: "/seguimiento", label: "Seguimiento diario" }
    ]
  },
];

const FAQS = [
  {
    group: "Seguridad y Gestión de Datos",
    items: [
      { q: "¿Qué es la arquitectura Híbrida (Local-First + Cloud)?", a: "Utilizamos una arquitectura moderna. Tus datos de trabajo (alumnos, notas) se procesan localmente en tu navegador garantizando privacidad, mientras que las operaciones pesadas (generación de informes PDF, Inteligencia Artificial y bases de datos centralizadas) se apoyan en un servidor seguro (Backend en Cloud Run)." },
      { q: "¿Dónde se guardan mis datos?", a: "Los datos de tu Programación y progreso se procesan en tu navegador (IndexedDB) para darte fluidez, pero se respaldan y conectan de forma segura con el servidor central para tareas como la exportación documental. Sigues teniendo control total sobre la exportación (BYOC)." },
      { q: "¿Cómo hago una copia de seguridad (backup)?", a: "Puedes exportar todos tus datos desde la sección 'Entorno' o utilizar la API central para copias de seguridad en servidor." },
      { q: "¿Qué pasa si borro los datos o caché de mi navegador?", a: "Si usas múltiples dispositivos, la arquitectura centralizada permite a Firebase Hosting y al servidor backend almacenar configuraciones, pero siempre te recomendamos exportar tu trabajo a un archivo .json periódicamente para evitar pérdidas de trabajo no sincronizado." },
      { q: "¿Puedo trabajar desde varios ordenadores?", a: "Sí. Para transferir el estado exacto del entorno entre navegadores que no comparten la sesión, puedes 'Exportar' tu progreso en el ordenador A y darle a 'Importar' en el ordenador B." }
    ]
  },
  {
    group: "Inicio de Curso y Configuración Básica",
    items: [
      { q: "¿Qué diferencia hay entre 'Programación' y 'Curso'?", a: "La 'Programación' contiene las reglas del juego estáticas (Resultados de Aprendizaje, Criterios de Evaluación, Unidades Didácticas e Instrumentos) y se puede reusar en diferentes años. El 'Curso' representa a un grupo concreto de alumnos reales en un año escolar específico." },
      { q: "¿Puedo importar alumnos desde Seneca, Rayuela o Excel?", a: "En la sección de 'Alumnado' puedes utilizar el formato CSV estándar para importar. Si no está disponible temporalmente, la tabla inteligente te permite copiar y pegar datos directamente como si fuera una hoja de cálculo." },
      { q: "¿Tengo que meter a mano todos los RA y CE de mi módulo?", a: "Actualmente sí, debes introducirlos según la normativa vigente de tu ciclo (BOE/BOCAA). Estamos trabajando en una base de datos centralizada de Ciclos Formativos para poder autocompletar esto en el futuro." },
      { q: "¿Qué significa que los RA no suman 100% en las verificaciones?", a: "Cada Resultado de Aprendizaje (RA) debe tener un 'peso' o importancia relativa en la nota final. La suma de todos los pesos de los RA de un módulo debe sumar exactamente 100%. Revisa esto en la pestaña 'Matrices'." }
    ]
  },
  {
    group: "Desarrollo de las Clases y Seguimiento",
    items: [
      { q: "¿Qué es el 'Diario de seguimiento'?", a: "Es tu cuaderno de bitácora en la pestaña 'Seguimiento'. Te permite anotar lo que ocurre en cada sesión real de clase: qué contenido se ha impartido, si ha habido incidencias generales y añadir notas privadas para el profesor." },
      { q: "¿Cómo registro las horas sin docencia (claustros, huelgas, excursiones)?", a: "En el Diario de Seguimiento puedes marcar una sesión con el botón/flag de 'Sin docencia'. Automáticamente se descontarán estas horas en las gráficas de progreso real del módulo." },
      { q: "¿Cómo paso lista o registro faltas de asistencia?", a: "Dentro de 'Seguimiento' encontrarás la pestaña 'Asistencia'. Allí verás la lista de alumnos y podrás marcar rápidamente con un clic si un alumno ha faltado, tiene un retraso o falta justificada para la sesión actual." }
    ]
  },
  {
    group: "Evaluación y Calificaciones",
    items: [
      { q: "¿Cómo evalúo una tarea o examen concreto?", a: "Ve a la sección 'Progreso' para introducir notas numéricas de las distintas tareas evaluables. También puedes hacerlo desde dentro de 'Alumnado', entrando en la Ficha Individual del estudiante." },
      { q: "¿Cómo se calcula exactamente la nota final?", a: "El sistema cruza las calificaciones obtenidas en las tareas con el 'peso' de los Instrumentos de Evaluación que estés usando y el 'peso' global de cada Resultado de Aprendizaje (RA). Es un sistema de evaluación continua totalmente automatizado." },
      { q: "¿Puedo generar informes o boletines para los alumnos?", a: "Sí. En 'Progreso' y en la Ficha Individual del Alumnado puedes visualizar y generar informes completos en PDF que justifican matemáticamente la nota final en base a los Criterios de Evaluación y los RA." },
      { q: "¿Qué es la evaluación por Rúbricas?", a: "Dentro de 'Instrumentos' puedes configurar rúbricas detalladas para calificar tareas complejas (ej. Proyectos). Al usarlas, la nota se calculará sola según el nivel de logro seleccionado en la rúbrica." }
    ]
  },
  {
    group: "FCT, Dual y Entorno Profesional",
    items: [
      { q: "¿Qué es la sección FEOE?", a: "FEOE (Formación en Empresa u Organismo Equiparado) te permite gestionar la relación con empresas, convenios, tutores laborales y la asignación de alumnos para sus prácticas o FP Dual." },
      { q: "¿Para qué sirve el módulo de Orientación Profesional?", a: "Te ayuda a hacer un seguimiento del perfil laboral de cada alumno, registrar sus preferencias, ayudarles en la elaboración del CV y registrar oportunidades laborales o contacto con empresas." }
    ]
  },
  {
    group: "Solución de Problemas y Aspectos Técnicos",
    items: [
      { q: "¿Qué pasa si las gráficas de la pantalla 'Hoy' no cargan?", a: "Comprueba en 'Entorno' que tienes seleccionada una Programación activa y un Curso activo. Las gráficas necesitan saber a qué módulo y a qué alumnos apuntan para poder dibujar la información." },
      { q: "¿Se puede usar Cuaderno FP en móviles o tablets?", a: "Sí, el diseño es 100% responsivo. Sin embargo, para tareas densas como rellenar las grandes tablas de Matrices o planificar la Programación, te recomendamos usar pantallas de ordenador." },
      { q: "La app va muy lenta o he detectado un error extraño", a: "Intenta recargar la página completamente (F5 o Ctrl+R). Si el error sigue apareciendo, exporta tus datos (.json) para ponerlos a salvo y ponte en contacto con el soporte o abre un 'Issue' en GitHub detallando tu problema." }
    ]
  }
];

// ── Página Principal ──────────────────────────────────────────────────────
export default function AyudaPage() {
  const { moduleData, cursoData, globalData, activeModuleId, activeCursoId } = useAppStore();
  const [activeTab, setActiveTab] = useState("verificacion");

  // ── Comprobaciones Programación didáctica ────────────────────────────
  const m = moduleData;

  const udCount = m?.df_ud?.length ?? 0;
  const udHoras = (m?.df_ud ?? []).reduce((a: number, u: any) => a + (parseFloat(String(u.horas_ud ?? 0)) || 0), 0);
  const moduloHoras = parseFloat(String(m?.info_modulo?.horas_totales ?? 0)) || 0;
  const horasDiff = Math.abs(udHoras - moduloHoras);

  const raCount = m?.df_ra?.length ?? 0;
  const raPesoSum = sumPesos(m?.df_ra ?? [], "peso_ra");

  const ceList = m?.df_ce ?? [];
  const ceCount = ceList.length;
  const ceHuerfanos = ceList.filter((ce: any) => {
    if (!ce.id_ra) return true;
    return !(m?.df_ra ?? []).some((ra: any) => ra.id_ra === ce.id_ra);
  }).length;
  const ceSinUD = ceList.filter((ce: any) => {
    if (!ce.id_ud) return true;
    return !(m?.df_ud ?? []).some((ud: any) => ud.id_ud === ce.id_ud);
  }).length;

  const actCount = m?.df_act?.length ?? 0;
  const actsSinCE = (m?.df_act ?? []).filter((act: any) => {
    return !ceList.some((ce: any) => act[ce.id_ce] === true);
  }).length;

  const tareasCount = m?.df_tareas?.length ?? 0;
  const tareasSinRA = (m?.df_tareas ?? []).filter((t: any) => {
    if (!t.RA_Asociados) return true;
    if ((m?.df_ra ?? []).length === 0) return true;
    return false;
  }).length;

  const sesionesCount = m?.df_sesiones?.length ?? 0;
  const sesionesSinUD = (m?.df_sesiones ?? []).filter((s: any) => {
    if (!s.id_ud) return true;
    return !(m?.df_ud ?? []).some((ud: any) => ud.id_ud === s.id_ud);
  }).length;

  const tieneHorario = !!(cursoData?.horario && Object.keys(cursoData.horario).length > 0);
  const tieneFechas = !!(cursoData?.info_fechas && Object.keys(cursoData.info_fechas).length > 0);
  const tieneContexto = !!(m?.config_contexto && Object.keys(m.config_contexto).length > 0);

  const moduleChecks: CheckItem[] = [
    {
      id: "modulo",
      icon: <BookOpen className="w-5 h-5" />,
      title: "Módulo didáctico",
      href: "/modulo",
      hrefLabel: "Módulo didáctico",
      status: !m ? "empty" : "ok",
      lines: !m
        ? ["Sin datos de programación cargados"]
        : [
          `Módulo activo: ${activeModuleId}`,
          `Horas semanales: ${m.info_modulo?.h_sem || "—"} h`,
          `Horas BOA: ${m.info_modulo?.h_boa || "—"} h`,
        ],
      actionHref: !m ? "/modulo" : undefined,
      actionLabel: !m ? "Configurar módulo" : undefined,
    },
    {
      id: "ud",
      icon: <Layers className="w-5 h-5" />,
      title: "Unidades didácticas (UD)",
      href: "/matrices",
      hrefLabel: "Matrices OG→RA→CE→UD",
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
      hrefLabel: "Matrices OG→RA→CE→UD",
      status: raCount === 0 ? "empty" : Math.abs(raPesoSum - 100) > 1 ? "warning" : "ok",
      lines: raCount === 0
        ? ["No hay RA definidos"]
        : [
          `${raCount} RA definidos`,
          `Suma de pesos: ${raPesoSum.toFixed(1)}% ${Math.abs(raPesoSum - 100) > 1 ? <><span className="inline-flex"><AlertTriangle className="w-[1.2em] h-[1.2em] mr-1" /></span> no suman 100%</> : <><span className="inline-flex"><Check className="w-[1.2em] h-[1.2em] mr-1" /></span></>}`,
        ],
      actionHref: raCount === 0 ? "/matrices" : undefined,
      actionLabel: raCount === 0 ? "Añadir primer RA" : undefined,
    },
    {
      id: "ce",
      icon: <ClipboardList className="w-5 h-5" />,
      title: "Criterios de evaluación (CE)",
      href: "/matrices",
      hrefLabel: "Matrices OG→RA→CE→UD",
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
      hrefLabel: "Instrumentos de evaluación",
      status: actCount === 0 ? "empty" : actsSinCE > 0 ? "warning" : "ok",
      lines: actCount === 0
        ? ["No hay instrumentos definidos"]
        : [
          `${actCount} instrumentos/actividades definidos`,
          actsSinCE > 0 ? `${actsSinCE} instrumentos sin CE asociado` : "Todos los instrumentos evalúan algún CE",
        ],
      actionHref: actCount === 0 ? "/instrumentos" : undefined,
      actionLabel: actCount === 0 ? "Añadir instrumento" : undefined,
    },
    {
      id: "tareas",
      icon: <FileText className="w-5 h-5" />,
      title: "Tareas y actividades",
      href: "/programacion",
      hrefLabel: "Programación de aula",
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
      hrefLabel: "Programación de aula",
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
      hrefLabel: "Calendario académico",
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
      hrefLabel: "Módulo didáctico",
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
  const alumnosIncompletos = (c?.df_al ?? []).filter((a: any) => !a.Nombre || !a.Apellidos).length;
  const sgmtCount = Object.keys(c?.daily_ledger ?? {}).length;
  const tieneFeoe = (globalData?.crm_empresas?.length ?? 0) > 0;
  const empresasCount = globalData?.crm_empresas?.length ?? 0;
  const alumnosAsignados = (globalData?.crm_empresas ?? []).reduce((a: number, e: any) => a + (e.alumnado_asignados?.length ?? 0), 0);
  const tieneProfesional = !!(c?.profesional_ledger && Object.keys(c.profesional_ledger).length > 0);
  const tutoriaEntradas = Object.keys(c?.tutoria_ledger ?? {}).length;

  const evalCount = c?.df_eval?.length ?? 0;
  const evalTotal = alumnosCount;

  const courseChecks: CheckItem[] = [
    {
      id: "alumnado",
      icon: <Users className="w-5 h-5" />,
      title: "Alumnado y tutoría",
      href: "/alumnado",
      hrefLabel: "Alumnado y tutoría",
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
      hrefLabel: "Seguimiento diario",
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
      hrefLabel: "Progreso académico",
      status: evalCount === 0 ? "empty" : evalTotal > 0 && evalCount < evalTotal ? "warning" : "ok",
      lines: evalCount === 0
        ? ["Sin calificaciones introducidas"]
        : [
          `${evalCount} alumnos con registro de ${evalTotal > 0 ? evalTotal : "?"} posibles (${pct(evalCount, evalTotal)})`,
          evalTotal > 0 && evalCount < evalTotal
            ? `Faltan ${evalTotal - evalCount} alumnos por evaluar`
            : "Todos los alumnos tienen registros de calificación",
        ],
      actionHref: evalCount === 0 ? "/progreso" : undefined,
      actionLabel: evalCount === 0 ? "Ir a calificaciones" : undefined,
    },
    {
      id: "feoe",
      icon: <Building2 className="w-5 h-5" />,
      title: "Prácticas FEOE",
      href: "/feoe",
      hrefLabel: "Prácticas FEOE",
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
      hrefLabel: "Orientación profesional",
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
      hrefLabel: "Alumnado y tutoría",
      status: tutoriaEntradas === 0 ? "empty" : "ok",
      lines: tutoriaEntradas === 0
        ? ["Sin entradas de tutoría registradas"]
        : [`${tutoriaEntradas} entradas de tutoría registradas`],
      actionHref: tutoriaEntradas === 0 ? "/alumnado" : undefined,
      actionLabel: tutoriaEntradas === 0 ? "Registrar tutoría" : undefined,
    },
  ];

  const allChecks = [...moduleChecks, ...courseChecks];
  const okCount = allChecks.filter(c => c.status === "ok").length;
  const warnCount = allChecks.filter(c => c.status === "warning").length;
  const emptyCount = allChecks.filter(c => c.status === "empty").length;

  const TABS = [
    { id: "verificacion", label: <><span className="inline-flex"><ListChecks className="w-[1.2em] h-[1.2em] mr-1" /></span> Verificación de datos</> },
    { id: "guia", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> Guía paso a paso</> },
    { id: "faq", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> Preguntas frecuentes (FAQ)</> },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-8 pb-12">
            
            {/* Título de la página */}
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Activity className="w-6 h-6 text-accent" /> Centro de Ayuda
              </h1>
              <p className="text-muted mt-2 text-base">
                Verifica la coherencia de tus datos, consulta la guía de inicio o encuentra respuestas a dudas comunes.
              </p>
            </div>

            {/* Pestañas de Navegación */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-2 max-w-full">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* ── CONTENIDO: VERIFICACIÓN ──────────────────────────────── */}
            {activeTab === "verificacion" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-wrap gap-2 text-sm text-muted">
                  <span className="bg-foreground/5 border border-white/5 rounded-lg px-3 py-1">
                    Programación Activa: <span className="font-semibold text-foreground">{activeModuleId || "—"}</span>
                  </span>
                  <span className="bg-foreground/5 border border-white/5 rounded-lg px-3 py-1">
                    Curso Activo: <span className="font-semibold text-foreground">{activeCursoId || "—"}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 border border-success/30 bg-success/10 rounded-2xl text-center">
                    <CheckCircle className="w-7 h-7 text-success mx-auto mb-1" />
                    <div className="text-2xl font-extrabold text-success">{okCount}</div>
                    <div className="text-xs text-muted mt-0.5">Correctos</div>
                  </Card>
                  <Card className="p-4 border border-warning/30 bg-warning/10 rounded-2xl text-center">
                    <AlertTriangle className="w-7 h-7 text-warning mx-auto mb-1" />
                    <div className="text-2xl font-extrabold text-warning">{warnCount}</div>
                    <div className="text-xs text-muted mt-0.5">Advertencias</div>
                  </Card>
                  <Card className="p-4 border border-danger/30 bg-danger/10 rounded-2xl text-center">
                    <XCircle className="w-7 h-7 text-danger mx-auto mb-1" />
                    <div className="text-2xl font-extrabold text-danger">{emptyCount}</div>
                    <div className="text-xs text-muted mt-0.5">Sin datos</div>
                  </Card>
                </div>

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
              </div>
            )}

            {/* ── CONTENIDO: GUÍA PASO A PASO ───────────────────────────── */}
            {activeTab === "guia" && (
              <div className="space-y-6 animate-in fade-in duration-500 w-full">
                <Card glow className="p-6">
                  <h2 className="text-xl font-bold mb-6 text-accent">Cómo empezar a usar la aplicación desde cero</h2>
                  <div className="relative border-l-2 border-[var(--glass-border)] ml-3 space-y-8 pl-8 py-2">
                    {STEPS.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[41px] top-0 w-8 h-8 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-sm font-bold text-accent">
                          {idx + 1}
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                        <p className="text-muted leading-relaxed mb-3">{step.desc}</p>
                        {step.links && step.links.length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {step.links.map((link, i) => (
                              <Link 
                                key={i} 
                                href={link.href}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-all"
                              >
                                {link.label} <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── CONTENIDO: FAQ ────────────────────────────────────────── */}
            {activeTab === "faq" && (
              <div className="space-y-10 animate-in fade-in duration-500 w-full">
                {FAQS.map((faqGroup, idx) => (
                  <div key={idx}>
                    <h2 className="text-xl font-bold mb-4 text-accent border-b border-white/5 pb-2">
                      {faqGroup.group}
                    </h2>
                    <div className="space-y-1">
                      {faqGroup.items.map((item, i) => (
                        <AccordionItem key={i} question={item.q} answer={item.a} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
