"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProsCons {
  pros: string[];
  cons: string[];
}

interface Comparativa {
  optionA: { label: string; emoji: string; description: string } & ProsCons;
  optionB: { label: string; emoji: string; description: string } & ProsCons;
  tip?: string;
}

interface Empresa {
  nombre: string;
  nota?: string;
}

interface SubSector {
  titulo: string;
  quéHace: string;
  empresas: Empresa[];
  badge?: string;
}

interface Sector {
  id: string;
  emoji: string;
  nombre: string;
  subtitulo: string;
  color: string;
  colorBg: string;
  colorBorder: string;
  intro: string;
  advertencia?: string;
  subsectores: SubSector[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPARATIVAS: { id: string; titulo: string; emoji: string; comparativa: Comparativa }[] = [
  {
    id: "instalaciones-mantenimiento",
    titulo: "Instalaciones vs. Mantenimiento",
    emoji: "🔧",
    comparativa: {
      optionA: {
        label: "Instalaciones",
        emoji: "🏗️",
        description: "Montaje de obra nueva. Ves el resultado desde cero.",
        pros: [
          "Ves el resultado final desde cero; satisfacción de \"estrenar\" equipos",
          "Horario más predecible (se trabaja por fases de obra)",
          "No sueles tener guardias",
          "Aprendes el oficio desde la base, ideal para empezar",
        ],
        cons: [
          "Mayor esfuerzo físico (tirar cable, rozas, condiciones de obra)",
          "Entornos a menudo sucios o a la intemperie",
          "Presión por fechas de entrega de la obra",
        ],
      },
      optionB: {
        label: "Mantenimiento",
        emoji: "🛠️",
        description: "Correctivo y preventivo. Diagnóstico de averías.",
        pros: [
          "Trabajo más intelectual (diagnóstico, polímetro, esquemas)",
          "Se trabaja en entornos ya terminados y limpios",
          "Suele estar mejor pagado por la especialización",
          "Valora la veteranía: a más experiencia, más sueldo",
        ],
        cons: [
          "Las temidas guardias (localizable fines de semana)",
          "Estrés cuando una máquina parada cuesta miles €/hora",
          "A veces rutinario si solo es mantenimiento preventivo",
        ],
      },
      tip: "Si estás empezando → Instalaciones te da el oficio. Con experiencia y menos esfuerzo físico → el salto natural es el Mantenimiento especializado, donde se paga el conocimiento.",
    },
  },
  {
    id: "insitu-taller",
    titulo: "In-situ en cliente vs. Sede / Taller",
    emoji: "🚐",
    comparativa: {
      optionA: {
        label: "In-situ (en el cliente)",
        emoji: "🗺️",
        description: "Cada día es una aventura. Tú y tu furgoneta.",
        pros: [
          "Cada día es distinto; no hay monotonía",
          "Conoces a mucha gente y entornos muy diversos",
          "Mucha autonomía en tu jornada laboral",
          "El cliente suele valorar y agradecer tu trabajo",
        ],
        cons: [
          "Gastas mucho tiempo en desplazamientos",
          "Lidiar con el carácter de cada cliente",
          "Herramientas limitadas (lo que lleves es lo que tienes)",
        ],
      },
      optionB: {
        label: "Sede / Taller",
        emoji: "🏭",
        description: "Entorno controlado. Cuadristas o reparación.",
        pros: [
          "Entorno controlado y ordenado",
          "Todas las herramientas a mano",
          "Compañeros cerca para consultar dudas",
          "Sin desplazamientos; llegas y te pones a trabajar",
        ],
        cons: [
          "Puede ser monótono (8 horas en el mismo banco de trabajo)",
          "Mayor sensación de vigilancia por parte del jefe",
          "Menos contacto con la realidad del cliente final",
        ],
      },
    },
  },
  {
    id: "publico-privado",
    titulo: "Sector Público vs. Sector Privado",
    emoji: "⚖️",
    comparativa: {
      optionA: {
        label: "Sector Público",
        emoji: "🏛️",
        description: "Ayuntamientos, SALUD, DGA. Máxima estabilidad.",
        pros: [
          "Máxima estabilidad laboral (una vez dentro, es para siempre)",
          "Horarios muy definidos y conciliadores (familia, ocio)",
          "Menos presión por la \"rentabilidad\" inmediata",
          "Vacaciones y derechos laborales garantizados",
        ],
        cons: [
          "Sueldos topados (cuesta mucho subir más allá de los tramos)",
          "Entrada lenta: oposiciones o bolsas de empleo",
          "A veces falta de presupuesto para herramientas modernas",
          "Menos dinámica; los cambios van muy despacio",
        ],
      },
      optionB: {
        label: "Sector Privado",
        emoji: "🏢",
        description: "PYMEs o Grandes Multinacionales. Dinamismo y oportunidad.",
        pros: [
          "Posibilidad de subir de sueldo rápido si eres bueno",
          "Acceso a tecnología de última generación",
          "Mayor dinamismo y variedad de proyectos",
          "Oportunidad de crecer a jefe de equipo, encargado, jefe de obra…",
        ],
        cons: [
          "Mayor inestabilidad (especialmente en PYMEs pequeñas)",
          "Mayor presión por resultados y tiempos",
          "A veces exceso de horas extra no remuneradas",
        ],
      },
    },
  },
];

const RESUMEN_TABLA = [
  { criterio: "Esfuerzo", a: "💪 Instalación: Más físico", b: "🧠 Mantenimiento: Más mental" },
  { criterio: "Ubicación", a: "🌤️ Campo: Aire libre, movilidad", b: "🏭 Taller: Comodidad, rutina" },
  { criterio: "Sueldo", a: "🏛️ Público: Estable, medio", b: "🚀 Privado: Variable, potencial alto" },
  { criterio: "Horario", a: "🔨 Obra: Fijo (7:00–15:00)", b: "📱 Mantenimiento: Guardias y avisos" },
];

const SECTORES: Sector[] = [
  {
    id: "primario",
    emoji: "🌾",
    nombre: "Sector Primario",
    subtitulo: "Extracción y Materias Primas",
    color: "text-green-400",
    colorBg: "bg-green-500/5",
    colorBorder: "border-green-500/30",
    intro:
      "Digitalizar y automatizar el campo. La modernización agrícola ha disparado la necesidad de técnicos eléctricos y de teleco. En Aragón, potencia agroalimentaria, somos tan necesarios como veterinarios o agrónomos.",
    advertencia:
      "Si vives en una zona rural de Aragón (Ejea, Binéfar, Calamocha, Alcañiz…) no hace falta irse a la ciudad. Las Comunidades de Regantes y las Integradoras Ganaderas buscan técnicos constantemente.",
    subsectores: [
      {
        titulo: "Ganadería Industrial (Porcino y Avícola)",
        quéHace:
          "Instalación de sistemas de alimentación automática, control de clima (sensores de temperatura y ventilación), sistemas de purines y cámaras de vigilancia IP.",
        badge: "🐖 Aragón = 1er productor de porcino de España",
        empresas: [
          { nombre: "Grupo Jorge", nota: "Sede en Zaragoza, centros en toda la región" },
          { nombre: "Vall Companys / Piensos Costa", nota: "Cientos de granjas integradas" },
          { nombre: "ADS (Agrupaciones de Defensa Sanitaria)", nota: "Servicios para ganaderos" },
        ],
      },
      {
        titulo: "Agricultura de Regadío y Comunidades de Regantes",
        quéHace:
          "Mantenimiento de estaciones de bombeo, instalación de bombeo solar (fotovoltaica para mover agua), automatización de válvulas por radiofrecuencia (Telecontrol).",
        empresas: [
          { nombre: "Riegos del Alto Aragón", nota: "El sistema de riego más grande de España, sede en Huesca" },
          { nombre: "Comunidad de Regantes de Monegros II" },
          { nombre: "SERS Consultores / Ingiopsa", nota: "Diseño y mantenimiento de infraestructuras" },
        ],
      },
      {
        titulo: "Renovables en Suelo Rústico",
        quéHace:
          "Montaje de seguidores solares, cableado de media tensión, sistemas de monitorización y comunicaciones de plantas fotovoltaicas y eólicas.",
        empresas: [
          { nombre: "Forestalia", nota: "Empresa aragonesa líder en parques eólicos y fotovoltaicos" },
          { nombre: "Endesa / Enel Green Power", nota: "Activos en cuencas mineras y valle del Ebro" },
        ],
      },
      {
        titulo: "Entidades Públicas e Investigación",
        quéHace: "Mantenimiento de instalaciones de ensayo, infraestructuras rurales y redes de comunicación forestal.",
        empresas: [
          { nombre: "CITA", nota: "Centro de Investigación y Tecnología Agroalimentaria de Aragón" },
          { nombre: "Sarga", nota: "Empresa pública del Gobierno de Aragón: regadíos, incendios forestales, redes de emisoras" },
        ],
      },
      {
        titulo: "Vitivinicultura (Denominaciones de Origen)",
        quéHace:
          "Electricidad y control de procesos de frío industrial en bodegas. Un fallo de temperatura puede arruinar una cosecha entera.",
        empresas: [
          { nombre: "Grandes Vinos y Viñedos", nota: "DO Cariñena" },
          { nombre: "Bodegas Enate", nota: "DO Somontano" },
        ],
      },
    ],
  },
  {
    id: "secundario",
    emoji: "⚙️",
    nombre: "Sector Secundario",
    subtitulo: "Industria y Energía — El motor del empleo técnico",
    color: "text-blue-400",
    colorBg: "bg-blue-500/5",
    colorBorder: "border-blue-500/30",
    intro:
      "Es el 'corazón' del empleo técnico. Aquí el trabajo es más estable y especializado. Ecosistema industrial muy potente concentrado en el eje del Ebro (Zaragoza), con nodos fuertes en Huesca y Teruel.",
    advertencia:
      "En este sector se valora el título en Riesgos Laborales (especialmente en altura o riesgo eléctrico).",
    subsectores: [
      {
        titulo: "Automoción y Auxiliares",
        quéHace:
          "Mantenimiento de robots, líneas de soldadura, autómatas programables (PLC), sensores de presencia y visión artificial.",
        badge: "🚗 El gigante de la región",
        empresas: [
          { nombre: "Stellantis (Figueruelas)", nota: "La antigua Opel. Miles de cuadros eléctricos y sistemas de teleco" },
          { nombre: "Lear, Magna, Mann+Hummel, Brembo", nota: "Cluster de Automoción de Aragón (CAAR). Requieren técnicos 24/7" },
        ],
      },
      {
        titulo: "Logística y Centros de Datos",
        quéHace:
          "Instalación de racks, tendido de fibra óptica de alta densidad, sistemas SAI y redes de datos masivas.",
        badge: "🏭 Aragón = hub logístico y de datos del sur de Europa",
        empresas: [
          { nombre: "Amazon Web Services (AWS)", nota: "Tres centros de datos: Huesca, El Burgo de Ebro, Villanueva de Gállego" },
          { nombre: "PLAZA Zaragoza", nota: "El centro logístico más grande de Europa. Inditex, Amazon, DHL…" },
        ],
      },
      {
        titulo: "Energías Renovables (Fabricación y Generación)",
        quéHace:
          "Montaje de aerogeneradores, mantenimiento de subestaciones eléctricas y parques solares. Aragón no solo consume energía verde, la fabrica.",
        empresas: [
          { nombre: "Forestalia", nota: "Sede en Zaragoza, líder en promoción de parques" },
          { nombre: "Siemens Gamesa", nota: "Plantas y centros de mantenimiento de aerogeneradores" },
          { nombre: "ERCROS / Oxaquim", nota: "Industria química pesada, alta potencia" },
        ],
      },
      {
        titulo: "Alimentación Industrial",
        quéHace:
          "Instalación de frío industrial, líneas de envasado automático y mantenimiento de cuadros de potencia.",
        empresas: [
          { nombre: "Grupo Guissona (bonÀrea)", nota: "Gigantesco centro en Épila, oportunidad masiva para nuevos técnicos" },
          { nombre: "BSH Electrodomésticos", nota: "Fábrica con procesos altamente automatizados" },
        ],
      },
      {
        titulo: "Parques Tecnológicos y Organismos Públicos",
        quéHace: "Investigación en robótica, nuevas tecnologías, infraestructuras de eventos.",
        empresas: [
          { nombre: "ITA Innova (Instituto Tecnológico de Aragón)", nota: "Robótica y nuevas tecnologías" },
          { nombre: "Walqa (Huesca)", nota: "Parque tecnológico TIC, ideal para técnicos de telecomunicaciones" },
          { nombre: "MotorLand (Alcañiz)", nota: "Infraestructuras de comunicaciones para MotoGP y eventos" },
        ],
      },
    ],
  },
  {
    id: "terciario",
    emoji: "🏙️",
    nombre: "Sector Terciario",
    subtitulo: "Servicios — Conectar personas, mantener ciudades",
    color: "text-purple-400",
    colorBg: "bg-purple-500/5",
    colorBorder: "border-purple-500/30",
    intro:
      "El bloque más amplio. Aquí se necesitan técnicos 'todoterreno'. El trabajo no es solo montar una instalación, sino asegurar que hospitales, redes digitales y ciudades sigan funcionando 24/7.",
    advertencia:
      "Se valoran certificaciones específicas: Instalador Autorizado BT, Técnico de Prevención de Incendios, Certificaciones en redes de datos.",
    subsectores: [
      {
        titulo: "Infraestructuras de Salud (Hospitales)",
        quéHace:
          "Mantenimiento de quirófanos (SAI), grupos electrógenos, sistemas de llamada de enfermería y redes de datos para diagnóstico por imagen. Un fallo aquí no es una molestia, es una emergencia.",
        badge: "🚨 Mayor criticidad: tolerancia 0 al fallo",
        empresas: [
          { nombre: "SALUD (Servicio Aragonés de Salud)", nota: "Hospital Miguel Servet, Clínico Lozano Blesa (a través de contratas)" },
          { nombre: "Ferrovial Servicios, Eulen, Veolia", nota: "Mantenimiento integral de grandes centros" },
        ],
      },
      {
        titulo: "Centros de Datos y Telecomunicaciones",
        quéHace:
          "Fusionado de fibra óptica, montaje de racks, cableado estructurado, certificación de redes y mantenimiento de refrigeración de precisión.",
        badge: "📡 Aragón = capital del dato en España",
        empresas: [
          { nombre: "Amazon Web Services (AWS)", nota: "Centros en El Burgo, Villanueva de Gállego y Huesca" },
          { nombre: "Embou", nota: "El operador aragonés por excelencia" },
          { nombre: "Contratas Telefónica/Movistar", nota: "Despliegue de 5G y FTTH" },
        ],
      },
      {
        titulo: "Grandes Superficies y Retail",
        quéHace:
          "Iluminación eficiente (LED y control DALI), megafonía, sistemas de intrusión (alarmas) y protección contra incendios.",
        empresas: [
          { nombre: "Puerto Venecia / Grancasa", nota: "Mantenimiento BT y comunicaciones constante" },
          { nombre: "Levitec", nota: "Una de las instaladoras aragonesas más potentes en proyectos terciarios y logísticos" },
        ],
      },
      {
        titulo: "Entidades Públicas y Ciudades Inteligentes",
        quéHace:
          "Alumbrado público inteligente, semaforización, puntos de recarga de vehículos eléctricos y redes Wi-Fi públicas.",
        empresas: [
          { nombre: "Ayuntamiento de Zaragoza, Huesca, Teruel", nota: "Directamente o a través de Endesa/Urbaser" },
          { nombre: "Consorcio de Transportes de Zaragoza", nota: "Pantallas informativas y comunicaciones del tranvía/bus" },
        ],
      },
      {
        titulo: "Turismo, Hostelería y Montaña",
        quéHace:
          "Domótica en hoteles, Wi-Fi de alta capacidad y mantenimiento de remontes eléctricos en estaciones de esquí.",
        empresas: [
          { nombre: "Aramón", nota: "Formigal, Panticosa, Cerler, Javalambre/Valdelinares. Empleo estacional y fijo en montaña" },
        ],
      },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProsConsCard({
  option,
  accentClass,
}: {
  option: { label: string; emoji: string; description: string; pros: string[]; cons: string[] };
  accentClass: string;
}) {
  return (
    <div className={`flex-1 rounded-2xl border border-white/5 bg-foreground/5 overflow-hidden`}>
      <div className={`px-5 py-4 border-b border-white/5 ${accentClass}`}>
        <div className="text-2xl mb-1">{option.emoji}</div>
        <h3 className="text-base font-bold text-foreground">{option.label}</h3>
        <p className="text-xs text-muted mt-0.5 leading-snug">{option.description}</p>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">✅ Pros</div>
          <ul className="space-y-1.5">
            {option.pros.map((p, i) => (
              <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                <span className="text-emerald-400 shrink-0 mt-0.5">+</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-white/5 pt-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2">⚠️ Contras</div>
          <ul className="space-y-1.5">
            {option.cons.map((c, i) => (
              <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                <span className="text-red-400 shrink-0 mt-0.5">−</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const PanoramaTab = () => {
  const [openSector, setOpenSector] = useState<string | null>("primario");
  const [openComparativa, setOpenComparativa] = useState<string | null>("instalaciones-mantenimiento");

  return (
    <div className="space-y-10 animate-in fade-in duration-300">

      {/* Intro */}
      <div className="border border-accent/20 bg-accent/5 rounded-2xl p-6">
        <p className="text-base text-foreground/90 leading-relaxed">
          <strong className="text-accent">Tu profesión no solo es "poner tomas o echar cable"</strong>, es la columna vertebral
          de la actividad productiva. Esta sección te ayuda a entender el <em>mapa real</em> de opciones
          profesionales: qué modalidad de trabajo te va mejor, y en qué sector podrías desarrollar tu carrera.
        </p>
      </div>

      {/* ── Comparativas ─────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
          ⚖️ <span>Las grandes decisiones de tu carrera</span>
        </h2>

        <div className="space-y-4">
          {COMPARATIVAS.map((comp) => {
            const isOpen = openComparativa === comp.id;
            return (
              <div key={comp.id} className="rounded-2xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setOpenComparativa(isOpen ? null : comp.id)}
                  className="w-full flex items-center justify-between p-5 bg-foreground/5 hover:bg-foreground/8 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{comp.emoji}</span>
                    <span className="text-base font-bold text-foreground">{comp.titulo}</span>
                  </div>
                  <span className="text-muted text-xl">{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <div className="p-5 space-y-5 animate-in slide-in-from-top-2 duration-200 bg-background/20">
                    <div className="flex flex-col md:flex-row gap-4">
                      <ProsConsCard option={comp.comparativa.optionA} accentClass="bg-emerald-500/10" />
                      <div className="flex items-center justify-center text-2xl font-black text-muted shrink-0">VS</div>
                      <ProsConsCard option={comp.comparativa.optionB} accentClass="bg-blue-500/10" />
                    </div>
                    {comp.comparativa.tip && (
                      <div className="border border-amber-500/30 bg-amber-500/8 rounded-xl px-5 py-4 flex items-start gap-3">
                        <span className="text-amber-400 text-xl shrink-0">💡</span>
                        <p className="text-sm text-amber-300/90 leading-relaxed">{comp.comparativa.tip}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resumen tabla */}
        <Card className="border border-white/5 bg-foreground/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-foreground/10">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">📊 Resumen comparativo rápido</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-muted">
                  <th className="text-left p-4 font-semibold w-32">Criterio</th>
                  <th className="text-left p-4 font-semibold">Opción A</th>
                  <th className="text-left p-4 font-semibold">Opción B</th>
                </tr>
              </thead>
              <tbody>
                {RESUMEN_TABLA.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-foreground/5 transition-colors">
                    <td className="p-4 font-bold text-foreground">{row.criterio}</td>
                    <td className="p-4 text-foreground/80">{row.a}</td>
                    <td className="p-4 text-foreground/80">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ── Sectores económicos ───────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
          🏭 <span>División por sectores económicos en Aragón</span>
        </h2>
        <p className="text-muted text-base">
          Cada sector tiene sus propias empresas, sus propias condiciones y su propia cultura de trabajo.
          Conocerlos te ayuda a orientar dónde quieres estar en 5 años.
        </p>

        <div className="space-y-4">
          {SECTORES.map((sector) => {
            const isOpen = openSector === sector.id;
            return (
              <div key={sector.id} className={`rounded-2xl border ${sector.colorBorder} overflow-hidden`}>
                {/* Sector header */}
                <button
                  onClick={() => setOpenSector(isOpen ? null : sector.id)}
                  className={`w-full flex items-center justify-between p-6 ${sector.colorBg} hover:brightness-110 transition-all text-left`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{sector.emoji}</span>
                    <div>
                      <div className={`text-xs font-bold uppercase tracking-widest ${sector.color} mb-0.5`}>
                        {sector.subtitulo}
                      </div>
                      <h3 className="text-xl font-extrabold text-foreground">{sector.nombre}</h3>
                      <p className="text-sm text-muted mt-1 max-w-2xl">{sector.intro}</p>
                    </div>
                  </div>
                  <span className="text-muted text-xl shrink-0 ml-4">{isOpen ? "▲" : "▼"}</span>
                </button>

                {/* Sector content */}
                {isOpen && (
                  <div className="p-6 space-y-5 animate-in slide-in-from-top-2 duration-200 bg-background/30">
                    {/* Warning / tip */}
                    {sector.advertencia && (
                      <div className={`border ${sector.colorBorder} ${sector.colorBg} rounded-xl px-5 py-4 flex items-start gap-3`}>
                        <span className="text-xl shrink-0">⚠️</span>
                        <p className={`text-sm ${sector.color} leading-relaxed`}>{sector.advertencia}</p>
                      </div>
                    )}

                    {/* Subsectors grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sector.subsectores.map((sub, idx) => (
                        <div key={idx} className="bg-foreground/5 border border-white/5 rounded-xl p-5 space-y-3">
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{sub.titulo}</h4>
                            {sub.badge && (
                              <span className={`inline-block text-[10px] font-bold ${sector.color} ${sector.colorBg} border ${sector.colorBorder} px-2 py-0.5 rounded-full mt-1 tracking-wide`}>
                                {sub.badge}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-muted leading-relaxed border-l-2 border-white/10 pl-3">
                            <strong className="text-foreground/70 text-[10px] uppercase tracking-wider">Qué hace el técnico:</strong>
                            <p className="mt-0.5">{sub.quéHace}</p>
                          </div>

                          <div>
                            <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
                              🏢 Empresas y entidades clave en Aragón
                            </div>
                            <ul className="space-y-1.5">
                              {sub.empresas.map((emp, ei) => (
                                <li key={ei} className="flex items-start gap-2">
                                  <span className={`text-xs font-bold ${sector.color} shrink-0 mt-0.5`}>›</span>
                                  <div>
                                    <span className="text-xs font-semibold text-foreground">{emp.nombre}</span>
                                    {emp.nota && (
                                      <span className="text-xs text-muted"> — {emp.nota}</span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer note */}
      <div className="border border-white/5 bg-foreground/5 rounded-2xl p-6 text-center text-muted text-sm">
        Información elaborada por el departamento de orientación. Actualizada a curso 2024–25.
        Las empresas mencionadas son ejemplos representativos del tejido industrial de Aragón.
      </div>

    </div>
  );
};
