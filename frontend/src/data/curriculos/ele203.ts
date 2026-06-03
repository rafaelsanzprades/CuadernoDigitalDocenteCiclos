import type { CurriculumTitulo } from "./index";

export const ELE203: CurriculumTitulo = {
  codigo: "ELE203",
  familia: "Electricidad y Electrónica",
  denominacion: "Instalaciones de Telecomunicaciones",
  nivel: "Grado Medio",
  duracion: 2000,
  referente_europeo: "CINE-3",

  identificacion: {
    familia_profesional: "Electricidad y Electrónica",
    denominacion: "Instalaciones de Telecomunicaciones",
    nivel: "Grado Medio",
    duracion: "2000 horas",
    referente_europeo: "CINE-3",
    clasificacion_internacional: "",
    norma: "Real Decreto 1632/2009, de 30 de octubre",
    boe: "BOE núm. 278, de 18 de noviembre de 2009",
    currículo_autonómico: "ORDEN de 14 de julio de 2010, del Departamento de Educación, Cultura y Deporte",
    boa: "BOA núm. 147, de 12 de agosto de 2010"
  },

  perfil_profesional: "El profesional ejerce su actividad en microempresas y en empresas pequeñas y medianas, mayoritariamente privadas, en las áreas de montaje y mantenimiento de infraestructuras de telecomunicación, instalaciones de circuito cerrado de televisión y seguridad electrónica, centralitas telefónicas e infraestructuras de redes de voz y datos, sonorización y megafonía, instalaciones de radiocomunicaciones, sistemas domóticos y equipos informáticos, bien por cuenta propia o ajena.",

  competencia_general: "Montar y mantener instalaciones de telecomunicación, redes de voz y datos, sistemas de seguridad electrónica, instalaciones de sonorización y megafonía, sistemas de radiocomunicaciones, instalaciones domóticas y equipos microinformáticos, aplicando la normativa y reglamentación vigente, así como los protocolos de calidad, seguridad y protección ambiental, y respondiendo ante posibles contingencias.",

  competencias_cpps: [
    { id: "a", descripcion: "Montar y mantener infraestructuras comunes de telecomunicaciones (ICT) en edificios y viviendas, aplicando técnicas de montaje y procedimientos de verificación." },
    { id: "b", descripcion: "Montar y mantener sistemas domóticos, aplicando técnicas de configuración, programación y mantenimiento." },
    { id: "c", descripcion: "Montar y mantener instalaciones de megafonía y sonorización, aplicando técnicas de montaje y mantenimiento." },
    { id: "d", descripcion: "Montar y mantener instalaciones de circuito cerrado de televisión y seguridad electrónica, aplicando técnicas de montaje y mantenimiento." },
    { id: "e", descripcion: "Montar y mantener sistemas de telefonía e infraestructuras de redes locales de datos, aplicando técnicas de montaje y mantenimiento." },
    { id: "f", descripcion: "Montar y mantener instalaciones de radiocomunicaciones, aplicando técnicas de montaje y mantenimiento." },
    { id: "g", descripcion: "Realizar la administración, gestión y comercialización en una pequeña empresa o taller." },
    { id: "h", descripcion: "Mantener relaciones fluidas con los miembros del grupo funcional en el que está integrado, responsabilizándose de la consecución de los objetivos asignados al grupo, respetando el trabajo de los demás." },
    { id: "i", descripcion: "Adaptarse a diferentes puestos de trabajo y nuevas situaciones laborales originados por cambios tecnológicos y organizativos." },
    { id: "j", descripcion: "Resolver problemas y tomar decisiones individuales siguiendo las normas y procedimientos establecidos, definidos dentro del ámbito de su competencia." },
    { id: "k", descripcion: "Ejercer sus derechos y cumplir con las obligaciones derivadas de las relaciones laborales, de acuerdo con lo establecido en la legislación vigente." },
    { id: "l", descripcion: "Gestionar su carrera profesional, analizando las oportunidades de empleo, autoempleo y de aprendizaje." },
    { id: "m", descripcion: "Crear y gestionar una pequeña empresa, realizando un estudio de viabilidad de productos, de planificación de la producción y de comercialización." },
    { id: "n", descripcion: "Participar de forma activa en la vida económica, social y cultural, con una actitud crítica y responsable." },
    { id: "o", descripcion: "Montar y mantener equipos microinformáticos y periféricos, aplicando técnicas de montaje y mantenimiento." },
    { id: "p", descripcion: "Montar y mantener instalaciones eléctricas básicas, aplicando técnicas de montaje y mantenimiento." },
    { id: "q", descripcion: "Analizar y describir los procedimientos de calidad, prevención de riesgos laborales y medioambientales, señalando las acciones que es preciso realizar en los casos definidos para actuar de acuerdo con las normas estandarizadas." },
    { id: "r", descripcion: "Aplicar los protocolos y normas de seguridad, de calidad y respeto al medio ambiente en las intervenciones realizadas en los procesos de montaje y mantenimiento de las instalaciones." },
    { id: "s", descripcion: "Elaborar la documentación técnica y administrativa de la instalación o equipo, de acuerdo con la reglamentación y normativa vigente y con los requerimientos del cliente." },
    { id: "t", descripcion: "Integrarse en la organización de la empresa colaborando en la consecución de los objetivos y participando activamente en el grupo de trabajo con actitud respetuosa y tolerante." },
    { id: "u", descripcion: "Cumplir con los objetivos de la producción, colaborando con el equipo de trabajo y actuando conforme a los principios de responsabilidad y tolerancia." }
  ],

  cualificaciones: [
    {
      codigo: "ELE043_2",
      nombre: "Montaje y mantenimiento de infraestructuras de telecomunicaciones en edificios",
      real_decreto: "RD 295/2004, de 20 de febrero",
      unidades_competencia: [
        { codigo: "UC0120_2", descripcion: "Montar y mantener instalaciones de captación de señales de radiodifusión sonora y TV en edificios o conjuntos de edificaciones (antenas y vía cable)." },
        { codigo: "UC0121_2", descripcion: "Montar y mantener instalaciones de acceso al servicio de telefonía disponible al público e instalaciones de control de acceso (telefonía interior y videoportería)." }
      ]
    },
    {
      codigo: "ELE188_2",
      nombre: "Montaje y mantenimiento de instalaciones de megafonía, sonorización de locales y circuito cerrado de televisión",
      real_decreto: "RD 1228/2006, de 27 de octubre",
      unidades_competencia: [
        { codigo: "UC0597_2", descripcion: "Montar y mantener instalaciones de megafonía y sonorización de locales." },
        { codigo: "UC0598_2", descripcion: "Montar y mantener instalaciones de circuito cerrado de televisión." }
      ]
    },
    {
      codigo: "ELE189_2",
      nombre: "Montaje y mantenimiento de sistemas de telefonía e infraestructuras de redes locales de datos",
      real_decreto: "RD 1228/2006, de 27 de octubre",
      unidades_competencia: [
        { codigo: "UC0599_2", descripcion: "Montar y mantener sistemas de telefonía con centralitas de baja capacidad." },
        { codigo: "UC0600_2", descripcion: "Montar y mantener infraestructuras de redes locales de datos." }
      ]
    }
  ],

  entorno_profesional: {
    sectores: ["Telecomunicaciones", "Seguridad electrónica", "Instalaciones eléctricas y electrónicas", "Servicios informáticos"],
    ocupaciones: [
      "Instalador de telecomunicaciones en edificios de viviendas",
      "Instalador de antenas",
      "Instalador de sistemas de seguridad",
      "Técnico en redes locales y telemática",
      "Técnico en instalación y mantenimiento de redes locales",
      "Instalador de telefonía",
      "Instalador-montador de equipos telefónicos y telemáticos",
      "Técnico en instalaciones de sonido",
      "Instalador de megafonía",
      "Instalador-mantenedor de sistemas domóticos",
      "Técnico instalador-mantenedor de equipos informáticos",
      "Técnico en montaje y mantenimiento de sistemas de radiodifusión"
    ]
  },

  prospectiva: [
    "El perfil profesional evoluciona hacia un técnico con gran especialización en la instalación y mantenimiento de infraestructuras de telecomunicaciones, sistemas de seguridad, redes, domótica, telefonía, sonido y equipos informáticos.",
    "Incremento en el desempeño de funciones de planificación, calidad y prevención de riesgos laborales.",
    "La evolución tecnológica se consolida sobre las redes de telecomunicación de banda ancha, basadas principalmente en fibra óptica.",
    "Será necesaria la utilización de técnicas y procedimientos concretos para la manipulación de fibra óptica así como del uso de equipamiento de comprobación y medida específico.",
    "Las estructuras organizativas tienden a configurarse sobre la base de decisiones descentralizadas y equipos participativos de gestión.",
    "Se requieren profesionales polivalentes capaces de adaptarse a nuevas situaciones socioeconómicas, laborales y organizativas.",
    "La adaptación a directivas europeas y nacionales sobre gestión de residuos implicará nuevos procedimientos de aprovechamiento de recursos."
  ],

  objetivos_generales: [
    { id: "a", descripcion: "Identificar los elementos de las infraestructuras, instalaciones y equipos, analizando planos y esquemas y reconociendo los materiales y procedimientos previstos, para establecer la logística asociada al montaje y mantenimiento." },
    { id: "b", descripcion: "Elaborar croquis y esquemas, empleando medios y técnicas de dibujo y representación simbólica normalizada, para configurar y calcular la instalación." },
    { id: "c", descripcion: "Obtener los parámetros típicos de las instalaciones y equipos, aplicando procedimientos de cálculo y atendiendo a las especificaciones y prescripciones reglamentarias, para configurar y calcular la instalación." },
    { id: "d", descripcion: "Valorar el coste de los materiales y mano de obra, consultando catálogos y unidades de obra, para elaborar el presupuesto del montaje o mantenimiento." },
    { id: "e", descripcion: "Seleccionar el utillaje, herramientas, equipos y medios de montaje y de seguridad, analizando las condiciones de obra y considerando las operaciones a realizar, para acopiar los recursos y medios." },
    { id: "f", descripcion: "Identificar y marcar la posición de los elementos de la instalación o equipo y el trazado de los circuitos, relacionando los planos de la documentación técnica con su ubicación real, para replantear la instalación." },
    { id: "g", descripcion: "Identificar, ensamblar e interconectar periféricos y componentes, atendiendo a las especificaciones técnicas, para montar o ampliar equipos informáticos y periféricos." },
    { id: "h", descripcion: "Reconocer y ejecutar los procedimientos de instalación y carga de programas, siguiendo las especificaciones del fabricante y aplicando criterios de calidad, para instalar y configurar software base, sistemas operativos y aplicaciones." },
    { id: "i", descripcion: "Aplicar técnicas de mecanizado, conexión, medición y montaje, manejando los equipos, herramientas e instrumentos, según procedimientos establecidos y en condiciones de calidad y seguridad, para efectuar el montaje o mantenimiento de los elementos componentes de infraestructuras." },
    { id: "j", descripcion: "Ubicar y fijar los equipos y elementos soporte y auxiliares, interpretando los planos y especificaciones de montaje, en condiciones de seguridad y calidad, para montar equipos, instalaciones e infraestructuras." },
    { id: "k", descripcion: "Conectar los equipos y elementos auxiliares mediante técnicas de conexión y empalme, de acuerdo con los esquemas de la documentación técnica, para montar las infraestructuras y para instalar los equipos." },
    { id: "l", descripcion: "Cargar o volcar programas siguiendo las instrucciones del fabricante y aplicando criterios de calidad para instalar equipos." },
    { id: "m", descripcion: "Analizar y localizar los efectos y causas de disfunción o avería en las instalaciones y equipos, utilizando equipos de medida e interpretando los resultados, para mantener y reparar instalaciones y equipos." },
    { id: "n", descripcion: "Comprobar la configuración y el software de control de los equipos siguiendo las instrucciones del fabricante, para mantener y reparar instalaciones y equipos." },
    { id: "o", descripcion: "Sustituir los elementos defectuosos desmontando y montando los equipos y realizando los ajustes necesarios, analizando planes de mantenimiento y protocolos de calidad y seguridad, para mantener y reparar instalaciones y equipos." },
    { id: "p", descripcion: "Comprobar el conexionado, software, señales y parámetros característicos, utilizando la instrumentación y protocolos establecidos, en condiciones de calidad y seguridad, para verificar el funcionamiento de la instalación o equipo." },
    { id: "q", descripcion: "Cumplimentar fichas de mantenimiento, informes de montaje y reparación y manuales de instrucciones, siguiendo los procedimientos y formatos establecidos, para elaborar la documentación de la instalación o equipo." },
    { id: "r", descripcion: "Analizar y describir los procedimientos de calidad, prevención de riesgos laborales y medioambientales, señalando las acciones que es preciso realizar en los casos definidos para actuar de acuerdo con las normas estandarizadas." },
    { id: "s", descripcion: "Mantener comunicaciones efectivas con su grupo de trabajo, interpretando y generando instrucciones, proponiendo soluciones ante contingencias y coordinando las actividades de los miembros del grupo con actitud abierta y responsable, para integrarse en la organización de la empresa." },
    { id: "t", descripcion: "Valorar las actividades de trabajo en un proceso productivo, identificando su aportación al proceso global, para participar activamente en los grupos de trabajo y conseguir los objetivos de la producción." },
    { id: "u", descripcion: "Reconocer sus derechos y deberes como agente activo en la sociedad, analizando el marco legal que regula las condiciones sociales y laborales, para participar como ciudadano democrático." },
    { id: "v", descripcion: "Identificar y valorar las oportunidades de aprendizaje y su relación con el mundo laboral, analizando las ofertas y demandas del mercado para adaptarse a diferentes puestos de trabajo." },
    { id: "w", descripcion: "Reconocer las oportunidades de negocio, identificando y analizando demandas del mercado para crear y gestionar una pequeña empresa." }
  ],

  modulos: [
    {
      codigo: "0237",
      nombre: "Infraestructuras comunes de telecomunicación en viviendas y edificios",
      horas: 128,
      curso: "1º",
      unidades_formativas: [
        { codigo: "UF0237_12", nombre: "Infraestructura común de telecomunicaciones (ICT) para la captación y distribución de señales de televisión en los edificios", horas: 80 },
        { codigo: "UF0237_22", nombre: "Infraestructura común de telecomunicaciones (ICT) para el acceso a los servicios de telefonía disponibles al público y a los servicios de banda ancha", horas: 48 }
      ],
      resultados_aprendizaje: [
        {
          id: "RA01",
          descripcion: "Identifica los elementos de las infraestructuras comunes de telecomunicaciones en viviendas y edificios, analizando los sistemas que las integran.",
          criterios_evaluacion: [
            { id: "CE01", descripcion: "Se ha analizado la normativa sobre infraestructuras comunes de telecomunicaciones en edificios." },
            { id: "CE02", descripcion: "Se han identificado los elementos de las zonas comunes y privadas." },
            { id: "CE03", descripcion: "Se han descrito los tipos de instalaciones que componen una ICT (infraestructura común de telecomunicaciones)." },
            { id: "CE04", descripcion: "Se han descrito los tipos y la función de recintos (superior, inferior) y registros (enlace, secundario, entre otros) de una ICT." },
            { id: "CE05", descripcion: "Se han identificado los tipos de canalizaciones (externa, de enlace, principal, entre otras)." },
            { id: "CE06", descripcion: "Se han descrito los tipos de redes que componen la ICT (alimentación, distribución, dispersión e interior)." },
            { id: "CE07", descripcion: "Se han identificado los elementos de conexión." },
            { id: "CE08", descripcion: "Se ha determinado la función y características de los elementos y equipos de cada sistema (televisión, telefonía, seguridad, entre otros)." }
          ]
        },
        {
          id: "RA02",
          descripcion: "Configura pequeñas instalaciones de infraestructuras comunes de telecomunicaciones para viviendas y edificios, determinando los elementos que la conforman y seleccionando componentes y equipos.",
          criterios_evaluacion: [
            { id: "CE09", descripcion: "Se han identificado las especificaciones técnicas de la instalación." },
            { id: "CE10", descripcion: "Se ha aplicado la normativa de ICT y el REBT en la configuración de la instalación." },
            { id: "CE11", descripcion: "Se han utilizado herramientas informáticas de aplicación." },
            { id: "CE12", descripcion: "Se han calculado los parámetros de los elementos y equipos de la instalación." },
            { id: "CE13", descripcion: "Se han realizado los croquis y esquemas de la instalación con la calidad requerida." },
            { id: "CE14", descripcion: "Se ha utilizado la simbología normalizada." },
            { id: "CE15", descripcion: "Se han seleccionado los equipos y materiales que cumplen las especificaciones funcionales, técnicas y normativas." },
            { id: "CE16", descripcion: "Se ha elaborado el presupuesto correspondiente a la solución adoptada." }
          ]
        },
        {
          id: "RA03",
          descripcion: "Monta instalaciones de infraestructuras comunes de telecomunicaciones para viviendas y edificios interpretando documentación técnica y aplicando técnicas de montaje.",
          criterios_evaluacion: [
            { id: "CE17", descripcion: "Se ha interpretado la documentación técnica de la instalación (planos, esquemas, reglamentación, entre otros)." },
            { id: "CE18", descripcion: "Se ha realizado el replanteo de la instalación." },
            { id: "CE19", descripcion: "Se han ubicado y fijado canalizaciones." },
            { id: "CE20", descripcion: "Se han realizado operaciones de montaje de mástiles y torretas, entre otros." },
            { id: "CE21", descripcion: "Se han ubicado y fijado los elementos de captación de señales y del equipo de cabecera." },
            { id: "CE22", descripcion: "Se ha tendido el cableado de los sistemas de la instalación (televisión, telefonía y comunicación interior, seguridad, entre otros)." },
            { id: "CE23", descripcion: "Se han conexionado los equipos y elementos de la instalación." },
            { id: "CE24", descripcion: "Se han aplicado los criterios de calidad en las operaciones de montaje." }
          ]
        },
        {
          id: "RA04",
          descripcion: "Verifica y ajusta los elementos de las instalaciones de infraestructuras comunes de telecomunicaciones midiendo los parámetros significativos e interpretando sus resultados.",
          criterios_evaluacion: [
            { id: "CE25", descripcion: "Se han descrito las unidades y los parámetros de los sistemas de la instalación (ganancia de la antena, de amplificadores, directividad, anchos de banda, atenuaciones, interferencias, entre otros)." },
            { id: "CE26", descripcion: "Se han utilizado herramientas informáticas para la obtención de información: situación de repetidores, posicionamiento de satélites, entre otros." },
            { id: "CE27", descripcion: "Se han orientado los elementos de captación de señales." },
            { id: "CE28", descripcion: "Se han realizado las medidas de los parámetros significativos de las señales en los sistemas de la instalación." },
            { id: "CE29", descripcion: "Se han relacionado los parámetros medidos con los características de la instalación." },
            { id: "CE30", descripcion: "Se han realizado pruebas funcionales y ajustes." }
          ]
        },
        {
          id: "RA05",
          descripcion: "Localiza averías y disfunciones en equipos e instalaciones de infraestructuras comunes de telecomunicaciones, aplicando técnicas de detección y relacionando la disfunción con la causa que la produce.",
          criterios_evaluacion: [
            { id: "CE31", descripcion: "Se han realizado las medidas de los parámetros de funcionamiento, utilizando los medios, equipos e instrumentos específicos." },
            { id: "CE32", descripcion: "Se ha operado con las herramientas e instrumentos adecuados para la diagnosis de averías." },
            { id: "CE33", descripcion: "Se han identificado los síntomas de averías o disfunciones." },
            { id: "CE34", descripcion: "Se han planteado hipótesis de las posibles causas de la avería y su repercusión en la instalación." },
            { id: "CE35", descripcion: "Se ha localizado el subsistema, equipo o elemento responsable de la disfunción." },
            { id: "CE36", descripcion: "Se ha operado con autonomía en las actividades propuestas." }
          ]
        },
        {
          id: "RA06",
          descripcion: "Repara instalaciones de infraestructuras de telecomunicaciones aplicando técnicas de corrección de disfunciones y en su caso de sustitución de componentes teniendo en cuenta las recomendaciones de los fabricantes.",
          criterios_evaluacion: [
            { id: "CE37", descripcion: "Se ha elaborado la secuencia de intervención para la reparación de la avería." },
            { id: "CE38", descripcion: "Se han reparado o en su caso sustituido los componentes causantes de la avería." },
            { id: "CE39", descripcion: "Se ha verificado la compatibilidad del nuevo elemento instalado." },
            { id: "CE40", descripcion: "Se han restablecido las condiciones de normal funcionamiento del equipo o de la instalación." },
            { id: "CE41", descripcion: "Se han realizado las intervenciones de mantenimiento con la calidad requerida." },
            { id: "CE42", descripcion: "Se ha operado con autonomía en las actividades propuestas." },
            { id: "CE43", descripcion: "Se ha elaborado un informe-memoria de las actividades desarrolladas, los procedimientos utilizados y resultados obtenidos." }
          ]
        },
        {
          id: "RA07",
          descripcion: "Cumple las normas de prevención de riesgos laborales y de protección ambiental, identificando los riesgos asociados y las medidas y equipos para prevenirlos.",
          criterios_evaluacion: [
            { id: "CE44", descripcion: "Se han identificado los riesgos y el nivel de peligrosidad que suponen la manipulación de los materiales, herramientas, útiles, máquinas y medios de transporte." },
            { id: "CE45", descripcion: "Se han operado las máquinas respetando las normas de seguridad." },
            { id: "CE46", descripcion: "Se han identificado las causas más frecuentes de accidentes en la manipulación de materiales, herramientas, máquinas de corte y conformado, entre otras." },
            { id: "CE47", descripcion: "Se han descrito los elementos de seguridad (protecciones, alarmas, pasos de emergencia, entre otros) de las máquinas y de los equipos de protección individual (calzado, protección ocular, indumentaria, entre otros) que se deben emplear." },
            { id: "CE48", descripcion: "Se ha relacionado la manipulación de materiales, herramientas y máquinas con las medidas de seguridad y protección personal requeridos." },
            { id: "CE49", descripcion: "Se han determinado las medidas de seguridad y de protección personal que se deben adoptar en la preparación y ejecución de las operaciones de montaje y mantenimiento." },
            { id: "CE50", descripcion: "Se han identificado las posibles fuentes de contaminación acústica, visual, entre otras del entorno ambiental." },
            { id: "CE51", descripcion: "Se han clasificado los residuos generados para su retirada selectiva." },
            { id: "CE52", descripcion: "Se ha valorado el orden y la limpieza de instalaciones y equipos como primer factor de prevención de riesgos." }
          ]
        }
      ]
    },
    {
      codigo: "0238",
      nombre: "Instalaciones domóticas",
      horas: 126,
      curso: "1º",
      unidades_formativas: [
        { codigo: "UF0238_13", nombre: "Instalaciones domóticas con autómata programable para vivienda", horas: 48 },
        { codigo: "UF0238_23", nombre: "Instalaciones domóticas por sistema de bus de campo", horas: 42 },
        { codigo: "UF0238_33", nombre: "Instalaciones domóticas por corrientes portadoras y sistemas inalámbricos", horas: 36 }
      ],
      resultados_aprendizaje: [
        {
          id: "RA01",
          descripcion: "Identifica áreas y sistemas automáticos que configuran las instalaciones automatizadas en viviendas, analizando el funcionamiento, características y normas de aplicación.",
          criterios_evaluacion: [
            { id: "CE01", descripcion: "Se han reconocido las distintas tipologías de automatizaciones domésticas." },
            { id: "CE02", descripcion: "Se han reconocido los principios de funcionamiento de las redes automáticas en viviendas." },
            { id: "CE03", descripcion: "Se han reconocido aplicaciones automáticas en las áreas de control, confort, seguridad, energía y telecomunicaciones." },
            { id: "CE04", descripcion: "Se han descrito las distintas tecnologías aplicadas a la automatización de viviendas." },
            { id: "CE05", descripcion: "Se han descrito las características especiales de los conductores en este tipo de instalación." },
            { id: "CE06", descripcion: "Se han identificado los equipos y elementos que configuran la instalación automatizada, interpretando la documentación técnica." },
            { id: "CE07", descripcion: "Se ha consultado la normativa vigente relativa a las instalaciones automatizadas en viviendas." },
            { id: "CE08", descripcion: "Se han relacionado los elementos de la instalación con los símbolos que aparecen en los esquemas." }
          ]
        },
        {
          id: "RA02",
          descripcion: "Configura sistemas técnicos, justificando su elección y reconociendo su funcionamiento.",
          criterios_evaluacion: [
            { id: "CE09", descripcion: "Se han descrito los tipos de instalaciones automatizadas en viviendas y edificios en función del sistema de control." },
            { id: "CE10", descripcion: "Se han reconocido las distintas técnicas de transmisión." },
            { id: "CE11", descripcion: "Se han identificado los distintos tipos de sensores y actuadores." },
            { id: "CE12", descripcion: "Se han descrito los diferentes protocolos de las instalaciones automatizadas." },
            { id: "CE13", descripcion: "Se ha descrito el sistema de bus de campo." },
            { id: "CE14", descripcion: "Se han descrito los sistemas controlados por autómata programable." },
            { id: "CE15", descripcion: "Se han descrito los sistemas por corrientes portadoras." },
            { id: "CE16", descripcion: "Se han descrito los sistemas inalámbricos." },
            { id: "CE17", descripcion: "Se ha utilizado el software de configuración apropiado a cada sistema." },
            { id: "CE18", descripcion: "Se ha utilizado documentación técnica." }
          ]
        },
        {
          id: "RA03",
          descripcion: "Monta pequeñas instalaciones automatizadas de viviendas, describiendo los elementos que las conforman.",
          criterios_evaluacion: [
            { id: "CE19", descripcion: "Se han realizado los croquis y esquemas necesarios para configurar las instalaciones." },
            { id: "CE20", descripcion: "Se han determinado los parámetros de los elementos y equipos de la instalación." },
            { id: "CE21", descripcion: "Se han conectado los sensores y actuadores para un sistema domótico con autómata programable." },
            { id: "CE22", descripcion: "Se ha realizado el cableado de un sistema por bus de campo." },
            { id: "CE23", descripcion: "Se han montado sensores y actuadores, elementos de control y supervisión de un sistema domótico por bus de campo, corrientes portadoras y red inalámbrica." },
            { id: "CE24", descripcion: "Se ha verificado su correcto funcionamiento." },
            { id: "CE25", descripcion: "Se han respetado los criterios de calidad." },
            { id: "CE26", descripcion: "Se ha aplicado la normativa vigente." }
          ]
        },
        {
          id: "RA04",
          descripcion: "Monta las áreas de control de una instalación domótica siguiendo los procedimientos establecidos.",
          criterios_evaluacion: [
            { id: "CE27", descripcion: "Se han consultado catálogos comerciales para seleccionar los materiales que se tiene previsto instalar." },
            { id: "CE28", descripcion: "Se han utilizado las herramientas y equipos adecuados para cada uno de los sistemas." },
            { id: "CE29", descripcion: "Se ha elegido la opción que mejor cumple las especificaciones funcionales, técnicas y normativas así como de obra de la instalación." },
            { id: "CE30", descripcion: "Se han realizado los croquis y esquemas para configurar la solución propuesta." },
            { id: "CE31", descripcion: "Se ha tendido el cableado de acuerdo con las características del sistema." },
            { id: "CE32", descripcion: "Se han programado los elementos de control de acuerdo a las especificaciones dadas y al manual del fabricante." },
            { id: "CE33", descripcion: "Se ha realizado la puesta en servicio de la instalación." },
            { id: "CE34", descripcion: "Se ha realizado el presupuesto correspondiente a la solución adoptada." },
            { id: "CE35", descripcion: "Se han respetado los criterios de calidad." }
          ]
        },
        {
          id: "RA05",
          descripcion: "Mantiene instalaciones domóticas, atendiendo a las especificaciones del sistema.",
          criterios_evaluacion: [
            { id: "CE36", descripcion: "Se han ajustado las distintas áreas de gestión para que funcionen coordinadamente." },
            { id: "CE37", descripcion: "Se han medido los parámetros eléctricos de distorsión en la red." },
            { id: "CE38", descripcion: "Se han identificado los elementos susceptibles de mantenimiento." },
            { id: "CE39", descripcion: "Se ha comprobado la compatibilidad del elemento sustituido." },
            { id: "CE40", descripcion: "Se ha comprobado, en el caso de mantenimiento correctivo, que la avería coincide con la indicada en el parte de averías." },
            { id: "CE41", descripcion: "Se han realizado las pruebas, comprobaciones y ajustes con la precisión necesaria para la puesta en servicio de la instalación." },
            { id: "CE42", descripcion: "Se ha elaborado, en su caso, un informe de disconformidades relativas al plan de calidad." }
          ]
        },
        {
          id: "RA06",
          descripcion: "Diagnostica averías y disfunciones en equipos e instalaciones domóticas, aplicando técnicas de medición y relacionando éstas con la causa que la producen.",
          criterios_evaluacion: [
            { id: "CE43", descripcion: "Se han ajustado las distintas áreas de gestión para que funcionen coordinadamente." },
            { id: "CE44", descripcion: "Se han medido los parámetros eléctricos de distorsión en la red." },
            { id: "CE45", descripcion: "Se han identificado los elementos susceptibles de mantenimiento." },
            { id: "CE46", descripcion: "Se han propuesto hipótesis razonadas de las posibles causas de la disfunción y su repercusión en la instalación." },
            { id: "CE47", descripcion: "Se han realizado las medidas de los parámetros de funcionamiento utilizando los instrumentos o el software adecuados." },
            { id: "CE48", descripcion: "Se ha localizado la avería utilizando un procedimiento técnico de intervención." },
            { id: "CE49", descripcion: "Se ha reparado la avería." },
            { id: "CE50", descripcion: "Se ha confeccionado un informe de incidencias." },
            { id: "CE51", descripcion: "Se ha elaborado un informe, en el formato adecuado, de las actividades desarrolladas y de los resultados obtenidos, que permitirá actualizar el histórico de averías." },
            { id: "CE52", descripcion: "Se han respetado los criterios de calidad." }
          ]
        },
        {
          id: "RA07",
          descripcion: "Cumple las normas de prevención de riesgos laborales y de protección ambiental, identificando los riesgos asociados, las medidas y equipos para prevenirlos.",
          criterios_evaluacion: [
            { id: "CE53", descripcion: "Se han identificado los riesgos y el nivel de peligrosidad que suponen la manipulación de los materiales, herramientas, útiles, máquinas y medios de transporte." },
            { id: "CE54", descripcion: "Se han operado las máquinas respetando las normas de seguridad." },
            { id: "CE55", descripcion: "Se han identificado las causas más frecuentes de accidentes en la manipulación de materiales, herramientas, máquinas de corte y conformado, entre otras." },
            { id: "CE56", descripcion: "Se han descrito los elementos de seguridad (protecciones, alarmas, pasos de emergencia, entre otros) de las máquinas y los equipos de protección individual (calzado, protección ocular, indumentaria, entre otros) que se deben emplear." },
            { id: "CE57", descripcion: "Se ha relacionado la manipulación de materiales, herramientas y máquinas con las medidas de seguridad y protección personal requeridos." },
            { id: "CE58", descripcion: "Se han determinado las medidas de seguridad y de protección personal que se deben adoptar en la preparación y ejecución de las operaciones de montaje y mantenimiento de las instalaciones domóticas." },
            { id: "CE59", descripcion: "Se han identificado las posibles fuentes de contaminación del entorno ambiental." },
            { id: "CE60", descripcion: "Se han clasificado los residuos generados para su retirada selectiva." },
            { id: "CE61", descripcion: "Se ha valorado el orden y la limpieza de instalaciones y equipos como primer factor de prevención de riesgos." }
          ]
        }
      ]
    },
    {
      codigo: "0359",
      nombre: "Electrónica aplicada",
      horas: 192,
      curso: "1º",
      unidades_formativas: [
        { codigo: "UF0359_13", nombre: "Circuitos eléctricos y principios de electromagnetismo", horas: 64 },
        { codigo: "UF0359_23", nombre: "Circuitos de electrónica analógica", horas: 64 },
        { codigo: "UF0359_33", nombre: "Circuitos de electrónica digital y microprogramable", horas: 64 }
      ],
      resultados_aprendizaje: [
        {
          id: "RA01",
          descripcion: "Identifica los componentes electrónicos y las magnitudes eléctricas características, interpretando documentación técnica y reconociendo los principios de funcionamiento.",
          criterios_evaluacion: [
            { id: "CE01", descripcion: "Se han identificado los componentes electrónicos pasivos y activos." },
            { id: "CE02", descripcion: "Se han reconocido las magnitudes eléctricas y su unidad de medida." },
            { id: "CE03", descripcion: "Se ha interpretado documentación técnica de componentes electrónicos." },
            { id: "CE04", descripcion: "Se ha identificado la simbología normalizada de los componentes electrónicos." },
            { id: "CE05", descripcion: "Se han utilizado instrumentos de medida para la verificación de magnitudes." }
          ]
        },
        {
          id: "RA02",
          descripcion: "Analiza circuitos electrónicos analógicos, identificando sus características y aplicaciones.",
          criterios_evaluacion: [
            { id: "CE06", descripcion: "Se han identificado los diferentes tipos de circuitos analógicos." },
            { id: "CE07", descripcion: "Se han analizado circuitos rectificadores, filtros y estabilizadores." },
            { id: "CE08", descripcion: "Se han reconocido las configuraciones básicas de amplificadores operacionales." },
            { id: "CE09", descripcion: "Se han realizado medidas en circuitos analógicos." },
            { id: "CE10", descripcion: "Se han localizado averías en circuitos analógicos mediante instrumentos de medida." }
          ]
        },
        {
          id: "RA03",
          descripcion: "Analiza circuitos electrónicos digitales, identificando sus características y aplicaciones.",
          criterios_evaluacion: [
            { id: "CE11", descripcion: "Se han identificado los sistemas de numeración y códigos digitales." },
            { id: "CE12", descripcion: "Se han analizado las puertas lógicas básicas y sus tablas de verdad." },
            { id: "CE13", descripcion: "Se han implementado circuitos combinacionales." },
            { id: "CE14", descripcion: "Se han analizado circuitos secuenciales básicos (biestables, contadores, registros)." },
            { id: "CE15", descripcion: "Se han realizado medidas en circuitos digitales." }
          ]
        },
        {
          id: "RA04",
          descripcion: "Monta circuitos electrónicos analógicos y digitales, interpretando esquemas y aplicando técnicas de montaje.",
          criterios_evaluacion: [
            { id: "CE16", descripcion: "Se han interpretado esquemas de circuitos electrónicos." },
            { id: "CE17", descripcion: "Se han seleccionado los componentes según especificaciones." },
            { id: "CE18", descripcion: "Se han aplicado técnicas de soldadura y desoldadura." },
            { id: "CE19", descripcion: "Se ha verificado el funcionamiento del circuito montado." }
          ]
        },
        {
          id: "RA05",
          descripcion: "Verifica y ajusta circuitos electrónicos, midiendo parámetros e interpretando resultados.",
          criterios_evaluacion: [
            { id: "CE20", descripcion: "Se han utilizado los instrumentos de medida adecuados." },
            { id: "CE21", descripcion: "Se han realizado medidas de tensión, corriente y resistencia." },
            { id: "CE22", descripcion: "Se han ajustado los circuitos según especificaciones." },
            { id: "CE23", descripcion: "Se han identificado y corregido disfunciones." }
          ]
        },
        {
          id: "RA06",
          descripcion: "Cumple las normas de prevención de riesgos laborales y de protección ambiental en el montaje y mantenimiento de circuitos electrónicos.",
          criterios_evaluacion: [
            { id: "CE24", descripcion: "Se han identificado los riesgos asociados a la manipulación de componentes electrónicos." },
            { id: "CE25", descripcion: "Se han aplicado las medidas de seguridad en el trabajo con componentes electrónicos." },
            { id: "CE26", descripcion: "Se han clasificado los residuos generados para su retirada selectiva." }
          ]
        }
      ]
    },
    {
      codigo: "0360",
      nombre: "Equipos microinformáticos",
      horas: 128,
      curso: "1º",
      unidades_formativas: [
        { codigo: "UF0360_13", nombre: "Montaje y Configuración de Equipos Microinformáticos. Prevención de Riesgos Laborales", horas: 48 },
        { codigo: "UF0360_23", nombre: "Instalación y configuración de Sistemas Operativos", horas: 40 },
        { codigo: "UF0360_33", nombre: "Instalación de Periféricos. Mantenimiento y Manejo de Herramientas en Sistemas Microinformáticos", horas: 40 }
      ],
      resultados_aprendizaje: [
        {
          id: "RA01",
          descripcion: "Monta equipos microinformáticos, interpretando documentación técnica y aplicando técnicas de montaje.",
          criterios_evaluacion: [
            { id: "CE01", descripcion: "Se han identificado los componentes internos de un equipo microinformático." },
            { id: "CE02", descripcion: "Se ha seleccionado los componentes necesarios según las especificaciones." },
            { id: "CE03", descripcion: "Se ha realizado el montaje de los componentes siguiendo procedimientos establecidos." },
            { id: "CE04", descripcion: "Se ha verificado el funcionamiento del equipo montado." }
          ]
        },
        {
          id: "RA02",
          descripcion: "Instala y configura software base y sistemas operativos, siguiendo las especificaciones del fabricante.",
          criterios_evaluacion: [
            { id: "CE05", descripcion: "Se han identificado los requisitos del sistema operativo." },
            { id: "CE06", descripcion: "Se ha realizado la instalación del sistema operativo." },
            { id: "CE07", descripcion: "Se ha configurado el sistema operativo según necesidades." },
            { id: "CE08", descripcion: "Se han instalado controladores de dispositivos." }
          ]
        },
        {
          id: "RA03",
          descripcion: "Instala periféricos, reconociendo sus características y aplicaciones.",
          criterios_evaluacion: [
            { id: "CE09", descripcion: "Se han identificado los diferentes tipos de periféricos." },
            { id: "CE10", descripcion: "Se ha realizado la instalación y configuración de periféricos." },
            { id: "CE11", descripcion: "Se ha verificado el funcionamiento de los periféricos instalados." }
          ]
        },
        {
          id: "RA04",
          descripcion: "Mantiene equipos microinformáticos, diagnosticando averías y aplicando técnicas de mantenimiento.",
          criterios_evaluacion: [
            { id: "CE12", descripcion: "Se han identificado los síntomas de averías en equipos microinformáticos." },
            { id: "CE13", descripcion: "Se han utilizado herramientas de diagnóstico." },
            { id: "CE14", descripcion: "Se han reparado o sustituido componentes defectuosos." },
            { id: "CE15", descripcion: "Se ha verificado el correcto funcionamiento tras el mantenimiento." }
          ]
        },
        {
          id: "RA05",
          descripcion: "Aplica las normas de prevención de riesgos laborales y protección ambiental en el montaje y mantenimiento de equipos microinformáticos.",
          criterios_evaluacion: [
            { id: "CE16", descripcion: "Se han identificado los riesgos asociados al trabajo con equipos microinformáticos." },
            { id: "CE17", descripcion: "Se han aplicado las medidas de seguridad en el montaje y mantenimiento." },
            { id: "CE18", descripcion: "Se han clasificado los residuos generados para su retirada selectiva." }
          ]
        }
      ]
    },
    {
      codigo: "0361",
      nombre: "Infraestructuras de redes de datos y sistemas de telefonía",
      horas: 224,
      curso: "1º",
      unidades_formativas: [
        { codigo: "UF0361_14", nombre: "Instalación de cableados estructurados para voz y datos", horas: 56 },
        { codigo: "UF0361_24", nombre: "Instalación de redes de área local", horas: 56 },
        { codigo: "UF0361_34", nombre: "Instalación de centralitas privadas telefónicas", horas: 56 },
        { codigo: "UF0361_44", nombre: "Mantenimiento y reparación de sistemas de telefonía y redes de datos", horas: 56 }
      ],
      resultados_aprendizaje: [
        {
          id: "RA01",
          descripcion: "Identifica los elementos de las infraestructuras de redes de datos y sistemas de telefonía, analizando los sistemas que las integran.",
          criterios_evaluacion: [
            { id: "CE01", descripcion: "Se han descrito los tipos de redes de datos y telefonía." },
            { id: "CE02", descripcion: "Se han identificado los elementos de una red de área local." },
            { id: "CE03", descripcion: "Se han reconocido los medios de transmisión utilizados en redes de datos." },
            { id: "CE04", descripcion: "Se ha descrito el modelo de referencia OSI y la arquitectura TCP/IP." },
            { id: "CE05", descripcion: "Se han identificado los elementos de una centralita telefónica." },
            { id: "CE06", descripcion: "Se han descrito los sistemas de telefonía analógica y digital." }
          ]
        },
        {
          id: "RA02",
          descripcion: "Configura redes de datos y sistemas de telefonía, seleccionando los elementos y equipos adecuados.",
          criterios_evaluacion: [
            { id: "CE07", descripcion: "Se han identificado las especificaciones técnicas de la red." },
            { id: "CE08", descripcion: "Se ha seleccionado el cableado estructurado adecuado." },
            { id: "CE09", descripcion: "Se han configurado los equipos de red (switches, routers)." },
            { id: "CE10", descripcion: "Se ha configurado la centralita telefónica." },
            { id: "CE11", descripcion: "Se han realizado los esquemas de la instalación." }
          ]
        },
        {
          id: "RA03",
          descripcion: "Monta infraestructuras de redes de datos y sistemas de telefonía, interpretando documentación técnica.",
          criterios_evaluacion: [
            { id: "CE12", descripcion: "Se ha interpretado la documentación técnica." },
            { id: "CE13", descripcion: "Se ha realizado el cableado estructurado según normativa." },
            { id: "CE14", descripcion: "Se han instalado y configurado los equipos de red." },
            { id: "CE15", descripcion: "Se ha instalado la centralita telefónica." },
            { id: "CE16", descripcion: "Se han realizado las conexiones y comprobaciones." }
          ]
        },
        {
          id: "RA04",
          descripcion: "Mantiene y repara sistemas de telefonía y redes de datos, diagnosticando averías.",
          criterios_evaluacion: [
            { id: "CE17", descripcion: "Se han identificado los síntomas de averías en redes y telefonía." },
            { id: "CE18", descripcion: "Se han utilizado herramientas de diagnóstico de red." },
            { id: "CE19", descripcion: "Se han reparado o sustituido los elementos defectuosos." },
            { id: "CE20", descripcion: "Se ha verificado el funcionamiento tras la reparación." }
          ]
        },
        {
          id: "RA05",
          descripcion: "Cumple las normas de prevención de riesgos laborales y protección ambiental en el montaje y mantenimiento de redes de datos y telefonía.",
          criterios_evaluacion: [
            { id: "CE21", descripcion: "Se han identificado los riesgos asociados al trabajo en redes y telefonía." },
            { id: "CE22", descripcion: "Se han aplicado las medidas de seguridad en el montaje y mantenimiento." },
            { id: "CE23", descripcion: "Se han clasificado los residuos generados para su retirada selectiva." }
          ]
        }
      ]
    },
    {
      codigo: "0362",
      nombre: "Instalaciones eléctricas básicas",
      horas: 192,
      curso: "1º",
      unidades_formativas: [
        { codigo: "UF0362_13", nombre: "Montaje de Instalaciones Eléctricas Básicas en viviendas", horas: 64 },
        { codigo: "UF0362_23", nombre: "Montaje de Instalaciones Eléctricas en Locales", horas: 64 },
        { codigo: "UF0362_33", nombre: "Instalaciones Eléctricas de Pequeñas Máquinas", horas: 64 }
      ],
      resultados_aprendizaje: [
        {
          id: "RA01",
          descripcion: "Identifica los elementos de las instalaciones eléctricas básicas, analizando su funcionamiento y características.",
          criterios_evaluacion: [
            { id: "CE01", descripcion: "Se han identificado los componentes de una instalación eléctrica básica." },
            { id: "CE02", descripcion: "Se ha interpretado la normativa electrotécnica (REBT)." },
            { id: "CE03", descripcion: "Se han reconocido los símbolos eléctricos normalizados." },
            { id: "CE04", descripcion: "Se han descrito los tipos de circuitos eléctricos básicos." }
          ]
        },
        {
          id: "RA02",
          descripcion: "Configura instalaciones eléctricas básicas, calculando y seleccionando los elementos necesarios.",
          criterios_evaluacion: [
            { id: "CE05", descripcion: "Se han realizado los cálculos de secciones de conductores." },
            { id: "CE06", descripcion: "Se han seleccionado los elementos de protección." },
            { id: "CE07", descripcion: "Se han elaborado esquemas eléctricos." },
            { id: "CE08", descripcion: "Se ha aplicado el REBT en la configuración de la instalación." }
          ]
        },
        {
          id: "RA03",
          descripcion: "Monta instalaciones eléctricas básicas en viviendas y locales, interpretando documentación técnica.",
          criterios_evaluacion: [
            { id: "CE09", descripcion: "Se ha interpretado la documentación técnica." },
            { id: "CE10", descripcion: "Se ha realizado el replanteo de la instalación." },
            { id: "CE11", descripcion: "Se han montado los circuitos según el esquema." },
            { id: "CE12", descripcion: "Se han instalado los mecanismos y receptores." },
            { id: "CE13", descripcion: "Se ha verificado el funcionamiento de la instalación." }
          ]
        },
        {
          id: "RA04",
          descripcion: "Mantiene y repara instalaciones eléctricas básicas, diagnosticando averías.",
          criterios_evaluacion: [
            { id: "CE14", descripcion: "Se han identificado los síntomas de averías en instalaciones eléctricas." },
            { id: "CE15", descripcion: "Se han utilizado instrumentos de medida eléctrica." },
            { id: "CE16", descripcion: "Se han reparado las averías detectadas." },
            { id: "CE17", descripcion: "Se ha verificado la seguridad de la instalación tras la reparación." }
          ]
        },
        {
          id: "RA05",
          descripcion: "Cumple las normas de prevención de riesgos laborales y protección ambiental en el montaje y mantenimiento de instalaciones eléctricas.",
          criterios_evaluacion: [
            { id: "CE18", descripcion: "Se han identificado los riesgos asociados a las instalaciones eléctricas." },
            { id: "CE19", descripcion: "Se han aplicado las medidas de seguridad en el trabajo eléctrico." },
            { id: "CE20", descripcion: "Se han clasificado los residuos generados para su retirada selectiva." }
          ]
        }
      ]
    },
    {
      codigo: "0363",
      nombre: "Instalaciones de megafonía y sonorización",
      horas: 147,
      curso: "2º",
      unidades_formativas: [
        { codigo: "UF0363_13", nombre: "Medios y Elementos de Instalaciones de Megafonía y Sonorización", horas: 49 },
        { codigo: "UF0363_23", nombre: "Montaje de Instalaciones de Megafonía y Sonorización", horas: 49 },
        { codigo: "UF0363_33", nombre: "Reparación y Mantenimiento de Instalaciones de Megafonía y Sonorización", horas: 49 }
      ],
      resultados_aprendizaje: [
        {
          id: "RA01",
          descripcion: "Identifica los elementos de las instalaciones de megafonía y sonorización, analizando su funcionamiento y características.",
          criterios_evaluacion: [
            { id: "CE01", descripcion: "Se han identificado los componentes de un sistema de megafonía." },
            { id: "CE02", descripcion: "Se han descrito los tipos de altavoces y sus características." },
            { id: "CE03", descripcion: "Se han reconocido los equipos de procesamiento de audio." },
            { id: "CE04", descripcion: "Se han identificado las configuraciones típicas de sistemas de sonorización." },
            { id: "CE05", descripcion: "Se ha interpretado documentación técnica de equipos de audio." }
          ]
        },
        {
          id: "RA02",
          descripcion: "Configura instalaciones de megafonía y sonorización, seleccionando los equipos y elementos adecuados.",
          criterios_evaluacion: [
            { id: "CE06", descripcion: "Se han identificado las especificaciones técnicas de la instalación." },
            { id: "CE07", descripcion: "Se han calculado los parámetros acústicos básicos." },
            { id: "CE08", descripcion: "Se han seleccionado los equipos según las necesidades." },
            { id: "CE09", descripcion: "Se han elaborado esquemas de la instalación." }
          ]
        },
        {
          id: "RA03",
          descripcion: "Monta instalaciones de megafonía y sonorización, interpretando documentación técnica.",
          criterios_evaluacion: [
            { id: "CE10", descripcion: "Se ha interpretado la documentación técnica." },
            { id: "CE11", descripcion: "Se han ubicado y fijado los altavoces." },
            { id: "CE12", descripcion: "Se han instalado los equipos de procesamiento y amplificación." },
            { id: "CE13", descripcion: "Se ha realizado el cableado y conexionado." },
            { id: "CE14", descripcion: "Se ha verificado el funcionamiento del sistema." }
          ]
        },
        {
          id: "RA04",
          descripcion: "Mantiene y repara instalaciones de megafonía y sonorización, diagnosticando averías.",
          criterios_evaluacion: [
            { id: "CE15", descripcion: "Se han identificado los síntomas de averías en sistemas de audio." },
            { id: "CE16", descripcion: "Se han utilizado instrumentos de medida de audio." },
            { id: "CE17", descripcion: "Se han reparado o sustituido los elementos defectuosos." },
            { id: "CE18", descripcion: "Se ha verificado la calidad del sonido tras la reparación." }
          ]
        },
        {
          id: "RA05",
          descripcion: "Cumple las normas de prevención de riesgos laborales y protección ambiental en el montaje y mantenimiento de instalaciones de megafonía.",
          criterios_evaluacion: [
            { id: "CE19", descripcion: "Se han identificado los riesgos asociados al trabajo en instalaciones de audio." },
            { id: "CE20", descripcion: "Se han aplicado las medidas de seguridad en el montaje y mantenimiento." },
            { id: "CE21", descripcion: "Se han clasificado los residuos generados para su retirada selectiva." }
          ]
        }
      ]
    },
    {
      codigo: "0364",
      nombre: "Circuito cerrado de televisión y seguridad electrónica",
      horas: 147,
      curso: "2º",
      unidades_formativas: [
        { codigo: "UF0364_12", nombre: "Configuración, Montaje y Mantenimiento de sistemas de Seguridad Electrónica", horas: 73 },
        { codigo: "UF0364_22", nombre: "Configuración, Montaje y Mantenimiento de Instalaciones de CCTV", horas: 74 }
      ],
      resultados_aprendizaje: [
        {
          id: "RA01",
          descripcion: "Identifica los elementos de los sistemas de circuito cerrado de televisión y seguridad electrónica, analizando su funcionamiento.",
          criterios_evaluacion: [
            { id: "CE01", descripcion: "Se han identificado los componentes de un sistema de CCTV." },
            { id: "CE02", descripcion: "Se han descrito los tipos de cámaras y sus características." },
            { id: "CE03", descripcion: "Se han reconocido los sistemas de seguridad electrónica (alarmas, detectores)." },
            { id: "CE04", descripcion: "Se ha interpretado la normativa de seguridad aplicable." },
            { id: "CE05", descripcion: "Se han identificado los equipos de grabación y visualización." }
          ]
        },
        {
          id: "RA02",
          descripcion: "Configura sistemas de CCTV y seguridad electrónica, seleccionando los equipos adecuados.",
          criterios_evaluacion: [
            { id: "CE06", descripcion: "Se han identificado las necesidades de seguridad." },
            { id: "CE07", descripcion: "Se han seleccionado las cámaras y equipos adecuados." },
            { id: "CE08", descripcion: "Se han configurado los sistemas de grabación." },
            { id: "CE09", descripcion: "Se han elaborado esquemas de la instalación." }
          ]
        },
        {
          id: "RA03",
          descripcion: "Monta instalaciones de CCTV y seguridad electrónica, interpretando documentación técnica.",
          criterios_evaluacion: [
            { id: "CE10", descripcion: "Se ha interpretado la documentación técnica." },
            { id: "CE11", descripcion: "Se han ubicado y fijado las cámaras y detectores." },
            { id: "CE12", descripcion: "Se ha realizado el cableado y conexionado." },
            { id: "CE13", descripcion: "Se han instalado y configurado los equipos de grabación." },
            { id: "CE14", descripcion: "Se ha verificado el funcionamiento del sistema." }
          ]
        },
        {
          id: "RA04",
          descripcion: "Mantiene y repara instalaciones de CCTV y seguridad electrónica, diagnosticando averías.",
          criterios_evaluacion: [
            { id: "CE15", descripcion: "Se han identificado los síntomas de averías en sistemas de seguridad." },
            { id: "CE16", descripcion: "Se han utilizado herramientas de diagnóstico." },
            { id: "CE17", descripcion: "Se han reparado o sustituido los elementos defectuosos." },
            { id: "CE18", descripcion: "Se ha verificado el funcionamiento tras la reparación." }
          ]
        },
        {
          id: "RA05",
          descripcion: "Cumple las normas de prevención de riesgos laborales y protección ambiental en el montaje y mantenimiento de sistemas de seguridad.",
          criterios_evaluacion: [
            { id: "CE19", descripcion: "Se han identificado los riesgos asociados al trabajo en sistemas de seguridad." },
            { id: "CE20", descripcion: "Se han aplicado las medidas de seguridad en el montaje y mantenimiento." },
            { id: "CE21", descripcion: "Se han clasificado los residuos generados para su retirada selectiva." }
          ]
        }
      ]
    },
    {
      codigo: "0365",
      nombre: "Instalaciones de radiocomunicaciones",
      horas: 147,
      curso: "2º",
      unidades_formativas: [
        { codigo: "UF0365_12", nombre: "Equipos de emisión, recepción y transmisión en sistemas de radiocomunicaciones", horas: 73 },
        { codigo: "UF0365_22", nombre: "Montaje y mantenimiento de instalaciones de radiocomunicaciones", horas: 74 }
      ],
      resultados_aprendizaje: [
        {
          id: "RA01",
          descripcion: "Identifica los elementos de los sistemas de radiocomunicaciones, analizando su funcionamiento y características.",
          criterios_evaluacion: [
            { id: "CE01", descripcion: "Se han identificado los componentes de un sistema de radiocomunicaciones." },
            { id: "CE02", descripcion: "Se han descrito los principios de propagación de ondas radioeléctricas." },
            { id: "CE03", descripcion: "Se han reconocido los tipos de antenas y sus características." },
            { id: "CE04", descripcion: "Se ha interpretado la normativa de telecomunicaciones aplicable." },
            { id: "CE05", descripcion: "Se han identificado los equipos de transmisión y recepción." }
          ]
        },
        {
          id: "RA02",
          descripcion: "Configura sistemas de radiocomunicaciones, seleccionando los equipos y elementos adecuados.",
          criterios_evaluacion: [
            { id: "CE06", descripcion: "Se han identificado las especificaciones técnicas del sistema." },
            { id: "CE07", descripcion: "Se han calculado los parámetros de radiofrecuencia." },
            { id: "CE08", descripcion: "Se han seleccionado las antenas y equipos adecuados." },
            { id: "CE09", descripcion: "Se han elaborado esquemas de la instalación." }
          ]
        },
        {
          id: "RA03",
          descripcion: "Monta instalaciones de radiocomunicaciones, interpretando documentación técnica.",
          criterios_evaluacion: [
            { id: "CE10", descripcion: "Se ha interpretado la documentación técnica." },
            { id: "CE11", descripcion: "Se han ubicado y fijado las antenas y equipos." },
            { id: "CE12", descripcion: "Se ha realizado el cableado y conexionado." },
            { id: "CE13", descripcion: "Se han instalado y configurado los equipos." },
            { id: "CE14", descripcion: "Se ha verificado el funcionamiento del sistema." }
          ]
        },
        {
          id: "RA04",
          descripcion: "Mantiene y repara instalaciones de radiocomunicaciones, diagnosticando averías.",
          criterios_evaluacion: [
            { id: "CE15", descripcion: "Se han identificado los síntomas de averías en sistemas de radiocomunicaciones." },
            { id: "CE16", descripcion: "Se han utilizado instrumentos de medida de RF." },
            { id: "CE17", descripcion: "Se han reparado o sustituido los elementos defectuosos." },
            { id: "CE18", descripcion: "Se ha verificado el funcionamiento tras la reparación." }
          ]
        },
        {
          id: "RA05",
          descripcion: "Cumple las normas de prevención de riesgos laborales y protección ambiental en el montaje y mantenimiento de instalaciones de radiocomunicaciones.",
          criterios_evaluacion: [
            { id: "CE19", descripcion: "Se han identificado los riesgos asociados al trabajo en radiocomunicaciones." },
            { id: "CE20", descripcion: "Se han aplicado las medidas de seguridad en el montaje y mantenimiento." },
            { id: "CE21", descripcion: "Se han clasificado los residuos generados para su retirada selectiva." }
          ]
        }
      ]
    },
    {
      codigo: "0366",
      nombre: "Formación y orientación laboral",
      horas: 96,
      curso: "2º",
      resultados_aprendizaje: [
        {
          id: "RA01",
          descripcion: "Selecciona oportunidades de empleo, identificando las diferentes posibilidades de inserción laboral y las alternativas de aprendizaje a lo largo de la vida.",
          criterios_evaluacion: [
            { id: "CE01", descripcion: "Se han identificado los principales itinerarios formativos y profesionales." },
            { id: "CE02", descripcion: "Se ha valorado la importancia de la formación permanente." },
            { id: "CE03", descripcion: "Se han determinado las técnicas de búsqueda de empleo." }
          ]
        },
        {
          id: "RA02",
          descripcion: "Aplica las estrategias del trabajo en equipo, valorando su eficacia y eficiencia en la consecución de los objetivos de la empresa.",
          criterios_evaluacion: [
            { id: "CE04", descripcion: "Se han valorado las ventajas del trabajo en equipo." },
            { id: "CE05", descripcion: "Se han identificado los tipos de equipos de trabajo." },
            { id: "CE06", descripcion: "Se han determinado las características del equipo de trabajo eficaz." }
          ]
        },
        {
          id: "RA03",
          descripcion: "Ejerce los derechos y cumple las obligaciones derivadas de la relación laboral, reconociéndolas en los diferentes contratos de trabajo.",
          criterios_evaluacion: [
            { id: "CE07", descripcion: "Se han identificado los conceptos básicos del derecho laboral." },
            { id: "CE08", descripcion: "Se han distinguido los tipos de contrato de trabajo." },
            { id: "CE09", descripcion: "Se han identificado las causas y efectos de la modificación, suspensión y extinción de la relación laboral." }
          ]
        },
        {
          id: "RA04",
          descripcion: "Determina la acción protectora del sistema de Seguridad Social, identificando las distintas prestaciones.",
          criterios_evaluacion: [
            { id: "CE10", descripcion: "Se ha valorado el papel de la Seguridad Social como pilar esencial para la mejora de la calidad de vida." },
            { id: "CE11", descripcion: "Se han identificado las distintas prestaciones de la Seguridad Social." }
          ]
        },
        {
          id: "RA05",
          descripcion: "Evalúa los riesgos derivados de su actividad, analizando las condiciones de trabajo y los factores de riesgo.",
          criterios_evaluacion: [
            { id: "CE12", descripcion: "Se ha valorado la importancia de la cultura preventiva en el ámbito laboral." },
            { id: "CE13", descripcion: "Se han identificado los riesgos laborales en el sector." },
            { id: "CE14", descripcion: "Se han determinado las medidas de prevención y protección." }
          ]
        },
        {
          id: "RA06",
          descripcion: "Participa en la elaboración de un plan de emergencia, identificando las situaciones de emergencia y aplicando las medidas de primeros auxilios.",
          criterios_evaluacion: [
            { id: "CE15", descripcion: "Se han identificado las situaciones de emergencia." },
            { id: "CE16", descripcion: "Se han aplicado las técnicas de primeros auxilios." }
          ]
        }
      ]
    },
    {
      codigo: "0367",
      nombre: "Empresa e iniciativa emprendedora",
      horas: 63,
      curso: "2º",
      resultados_aprendizaje: [
        {
          id: "RA01",
          descripcion: "Reconoce las capacidades asociadas a la iniciativa emprendedora, analizando los requerimientos derivados de los puestos de trabajo y de las actividades empresariales.",
          criterios_evaluacion: [
            { id: "CE01", descripcion: "Se ha identificado el concepto de innovación y su relación con el progreso." },
            { id: "CE02", descripcion: "Se han analizado las características de la iniciativa emprendedora." },
            { id: "CE03", descripcion: "Se ha valorado la figura del emprendedor." }
          ]
        },
        {
          id: "RA02",
          descripcion: "Define la oportunidad de creación de una pequeña empresa, seleccionando la idea de negocio y realizando el estudio de viabilidad.",
          criterios_evaluacion: [
            { id: "CE04", descripcion: "Se ha analizado el entorno empresarial del sector." },
            { id: "CE05", descripcion: "Se ha realizado un estudio de mercado." },
            { id: "CE06", descripcion: "Se ha elaborado el plan de empresa." }
          ]
        },
        {
          id: "RA03",
          descripcion: "Realiza actividades de gestión administrativa y comercial básica de una pequeña empresa, identificando las obligaciones contables, fiscales y laborales.",
          criterios_evaluacion: [
            { id: "CE07", descripcion: "Se han identificado los trámites necesarios para la constitución de la empresa." },
            { id: "CE08", descripcion: "Se han identificado las obligaciones fiscales de la empresa." },
            { id: "CE09", descripcion: "Se han cumplimentado documentos de compra-venta." }
          ]
        }
      ]
    },
    {
      codigo: "0368",
      nombre: "Formación en centros de trabajo",
      horas: 410,
      curso: "2º",
      resultados_aprendizaje: [
        {
          id: "RA01",
          descripcion: "Identifica la estructura y organización de la empresa, relacionándolas con la producción y comercialización de los productos y servicios.",
          criterios_evaluacion: [
            { id: "CE01", descripcion: "Se ha identificado la estructura organizativa de la empresa." },
            { id: "CE02", descripcion: "Se han identificado los flujos de comunicación en la empresa." }
          ]
        },
        {
          id: "RA02",
          descripcion: "Aplica hábitos éticos y laborales en el desarrollo de su actividad profesional, de acuerdo con las características del puesto de trabajo.",
          criterios_evaluacion: [
            { id: "CE03", descripcion: "Se han reconocido y justificado los hábitos de puntualidad y presencia." },
            { id: "CE04", descripcion: "Se han reconocido los principios de las normas de la empresa." }
          ]
        },
        {
          id: "RA03",
          descripcion: "Realiza operaciones de montaje y mantenimiento de instalaciones de telecomunicaciones, aplicando técnicas y procedimientos establecidos.",
          criterios_evaluacion: [
            { id: "CE05", descripcion: "Se han aplicado los procedimientos de montaje y mantenimiento." },
            { id: "CE06", descripcion: "Se han utilizado las herramientas y equipos adecuados." },
            { id: "CE07", descripcion: "Se ha verificado el funcionamiento de las instalaciones." }
          ]
        }
      ]
    }
  ]
};
