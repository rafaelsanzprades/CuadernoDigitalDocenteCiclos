import type { CurriculumTitulo } from "./index";

export const SIRL: CurriculumTitulo = {
  codigo: "SIRL",
  familia: "Informática y Comunicaciones",
  denominacion: "Sistemas Informáticos y Redes Locales",
  nivel: "Grado Superior",
  duracion: 2000,
  referente_europeo: "CINE-4",

  identificacion: {
    familia_profesional: "Informática y Comunicaciones",
    denominacion: "Sistemas Informáticos y Redes Locales",
    nivel: "Grado Superior",
    duracion: "2000 horas",
    referente_europeo: "CINE-4",
    clasificacion_internacional: "",
    norma: "Real Decreto 883/2011, de 24 de junio",
    boe: "BOE núm. 150, de 23 de junio de 2011",
    currículo_autonómico: "ORDEN de 23 de mayo de 2013, de la Consejera de Educación, Universidad, Cultura y Deporte",
    boa: "BOA núm. 76, de 25 de junio de 2013"
  },

  perfil_profesional: "El profesional ejerce su actividad en empresas de servicios informáticos, departamentos de sistemas de información de empresas de otros sectores y como profesional autónomo, en el diseño, instalación, mantenimiento y gestión de sistemas informáticos y redes locales, aplicando la normativa y reglamentación vigente, así como los protocolos de calidad, seguridad y protección ambiental.",

  competencia_general: "Gestionar, administrar y mantener sistemas informáticos y redes locales, aplicando la normativa y reglamentación vigente, así como los protocolos de calidad, seguridad y protección ambiental, y respondiendo ante posibles contingencias.",

  competencias_cpps: [
    { id: "a", descripcion: "Gestionar y administrar sistemas informáticos y redes locales, aplicando técnicas de gestión de sistemas y redes." },
    { id: "b", descripcion: "Instalar y configurar sistemas informáticos y redes locales, aplicando técnicas de montaje y configuración." },
    { id: "c", descripcion: "Mantener sistemas informáticos y redes locales, aplicando técnicas de mantenimiento preventivo y correctivo." },
    { id: "d", descripcion: "Diagnosticar y resolver problemas en sistemas informáticos y redes locales, aplicando técnicas de diagnóstico y solución de problemas." },
    { id: "e", descripcion: "Gestionar la seguridad de sistemas informáticos y redes locales, aplicando técnicas de seguridad informática." },
    { id: "f", descripcion: "Realizar la administración, gestión y comercialización en una pequeña empresa o taller." },
    { id: "g", descripcion: "Mantener relaciones fluidas con los miembros del grupo funcional en el que está integrado, responsabilizándose de la consecución de los objetivos asignados al grupo, respetando el trabajo de los demás." },
    { id: "h", descripcion: "Adaptarse a diferentes puestos de trabajo y nuevas situaciones laborales originados por cambios tecnológicos y organizativos." },
    { id: "i", descripcion: "Resolver problemas y tomar decisiones individuales siguiendo las normas y procedimientos establecidos." },
    { id: "j", descripcion: "Ejercer sus derechos y cumplir con las obligaciones derivadas de las relaciones laborales." },
    { id: "k", descripcion: "Gestionar su carrera profesional, analizando las oportunidades de empleo, autoempleo y de aprendizaje." },
    { id: "l", descripcion: "Crear y gestionar una pequeña empresa, realizando un estudio de viabilidad de productos." },
    { id: "m", descripcion: "Participar de forma activa en la vida económica, social y cultural, con una actitud crítica y responsable." }
  ],

  cualificaciones: [
    {
      codigo: "IFC110_2",
      nombre: "Administración de sistemas informáticos",
      real_decreto: "Real Decreto 883/2011, de 24 de junio",
      unidades_competencia: [
        { codigo: "UC0847_3", descripcion: "Configurar y administrar sistemas operativos en red y sus servicios." },
        { codigo: "UC0848_3", descripcion: "Gestionar servidores de aplicaciones." },
        { codigo: "UC0849_3", descripcion: "Gestionar bases de datos." },
        { codigo: "UC0850_3", descripcion: "Implantar y gestionar la seguridad en sistemas informáticos." }
      ]
    },
    {
      codigo: "IFC111_2",
      nombre: "Administración de redes locales",
      real_decreto: "Real Decreto 883/2011, de 24 de junio",
      unidades_competencia: [
        { codigo: "UC0851_3", descripcion: "Configurar y administrar infraestructuras de red." },
        { codigo: "UC0852_3", descripcion: "Gestionar redes de área local." },
        { codigo: "UC0853_3", descripcion: "Gestionar redes inalámbricas." }
      ]
    }
  ],

  entorno_profesional: {
    sectores: [
      "Servicios informáticos",
      "Telecomunicaciones",
      "Consultoría tecnológica",
      "Administración pública"
    ],
    ocupaciones: [
      "Técnico en sistemas informáticos",
      "Administrador de redes",
      "Técnico de soporte informático",
      "Administrador de sistemas",
      "Técnico de infraestructuras de red"
    ]
  },

  prospectiva: [
    "Cloud computing y servicios en la nube",
    "Virtualización de infraestructuras",
    "Ciberseguridad y protección de datos",
    "Automatización de infraestructuras (DevOps)",
    "Internet de las cosas (IoT)"
  ],

  objetivos_generales: [
    { id: "OG1", descripcion: "Analizar las necesidades de los sistemas de telecomunicaciones, identificando sus componentes, características y funcionalidades." },
    { id: "OG2", descripcion: "Determinar los equipos, materiales y herramientas necesarios para el montaje de sistemas de telecomunicaciones." },
    { id: "OG3", descripcion: "Configurar sistemas informáticos y de comunicaciones, realizando su puesta en servicio." },
    { id: "OG4", descripcion: "Mantener sistemas de telecomunicaciones, realizando el seguimiento de los protocolos de calidad y seguridad." },
    { id: "OG5", descripcion: "Elaborar la documentación técnica de los sistemas de telecomunicaciones, aplicando la normativa vigente." }
  ],

  modulos: [
    {
      codigo: "0552",
      nombre: "Sistemas informáticos y redes locales",
      horas: 160,
      curso: "1º",
      resultados_aprendizaje: [
        {
          id: "RA1",
          descripcion: "Selecciona equipos informáticos evaluando los requerimientos del sistema de telecomunicaciones y definiendo la composición y características de sus elementos.",
          criterios_evaluacion: [
            { id: "CE1.1", descripcion: "Se han determinado las necesidades informáticas de los sistemas de telecomunicación." },
            { id: "CE1.2", descripcion: "Se han identificado los equipos en función de las aplicaciones del sistema de telecomunicaciones." },
            { id: "CE1.3", descripcion: "Se han caracterizado los componentes del equipo informático." },
            { id: "CE1.4", descripcion: "Se han caracterizado diferentes tipos de periféricos." },
            { id: "CE1.5", descripcion: "Se han determinado las necesidades de software de los sistemas de telecomunicaciones." },
            { id: "CE1.6", descripcion: "Se ha determinado el equipamiento." }
          ]
        },
        {
          id: "RA2",
          descripcion: "Configura equipos informáticos examinando las características requeridas por el sistema de telecomunicaciones e instalando el hardware y el software.",
          criterios_evaluacion: [
            { id: "CE2.1", descripcion: "Se ha verificado que el hardware y software responden a las necesidades del sistema." },
            { id: "CE2.2", descripcion: "Se ha interpretado la documentación técnica de los elementos del equipo." },
            { id: "CE2.3", descripcion: "Se han montado los elementos físicos del equipo informático." },
            { id: "CE2.4", descripcion: "Se han instalado los periféricos específicos." },
            { id: "CE2.5", descripcion: "Se han cargado los sistemas operativos." },
            { id: "CE2.6", descripcion: "Se ha configurado el software del equipo." },
            { id: "CE2.7", descripcion: "Se ha documentado el proceso de montaje." }
          ]
        },
        {
          id: "RA3",
          descripcion: "Configura servicios y funciones específicas en el sistema informático planificando su implantación y teniendo en cuenta las especificaciones del sistema de telecomunicaciones.",
          criterios_evaluacion: [
            { id: "CE3.1", descripcion: "Se han interpretado los requerimientos software del sistema." },
            { id: "CE3.2", descripcion: "Se ha planificado la asignación de servicios y funciones." },
            { id: "CE3.3", descripcion: "Se han configurado cuentas de usuarios, perfiles y políticas de contraseñas." },
            { id: "CE3.4", descripcion: "Se han configurado aplicaciones y servicios requeridos." },
            { id: "CE3.5", descripcion: "Se han utilizado herramientas de virtualización y simulación del sistema informático." },
            { id: "CE3.6", descripcion: "Se ha verificado el funcionamiento del sistema." }
          ]
        },
        {
          id: "RA4",
          descripcion: "Integra redes de área local (LAN) en sistemas de telecomunicaciones interpretando las especificaciones del sistema y configurando las partes física y lógica.",
          criterios_evaluacion: [
            { id: "CE4.1", descripcion: "Se han caracterizado los componentes de las redes de datos." },
            { id: "CE4.2", descripcion: "Se han identificado las topologías y estructuras de redes." },
            { id: "CE4.3", descripcion: "Se ha distinguido el funcionamiento y las características de los elementos de trabajo en red (networking)." },
            { id: "CE4.4", descripcion: "Se han reconocido los protocolos de comunicación." },
            { id: "CE4.5", descripcion: "Se ha planificado una red LAN y su direccionamiento." },
            { id: "CE4.6", descripcion: "Se ha montado la electrónica de red y elementos asociados." },
            { id: "CE4.7", descripcion: "Se han conexionado los equipos y elementos de la red." },
            { id: "CE4.8", descripcion: "Se ha configurado una red LAN." }
          ]
        },
        {
          id: "RA5",
          descripcion: "Integra redes locales inalámbricas (WLAN) en sistemas de telecomunicaciones interpretando las especificaciones del sistema y configurando las partes física y lógica.",
          criterios_evaluacion: [
            { id: "CE5.1", descripcion: "Se han definido las redes inalámbricas de acceso local (WLAN)." },
            { id: "CE5.2", descripcion: "Se han determinado los componentes y características de las redes WLAN." },
            { id: "CE5.3", descripcion: "Se ha diseñado una red WLAN." },
            { id: "CE5.4", descripcion: "Se han ubicado los dispositivos y equipos." },
            { id: "CE5.5", descripcion: "Se han configurado los servicios y dispositivos de la red WLAN." },
            { id: "CE5.6", descripcion: "Se han configurado los elementos de seguridad de la red." },
            { id: "CE5.7", descripcion: "Se ha verificado el funcionamiento de la WLAN." }
          ]
        },
        {
          id: "RA6",
          descripcion: "Realiza pruebas de puesta en servicio de sistemas informáticos o redes de datos aplicando técnicas de análisis de rendimiento y verificando su integración en el sistema de telecomunicaciones.",
          criterios_evaluacion: [
            { id: "CE6.1", descripcion: "Se han identificado los puntos de control." },
            { id: "CE6.2", descripcion: "Se ha aplicado el plan de puesta en servicio." },
            { id: "CE6.3", descripcion: "Se ha testeado el funcionamiento del hardware del sistema." },
            { id: "CE6.4", descripcion: "Se ha comprobado el funcionamiento del software del sistema." },
            { id: "CE6.5", descripcion: "Se ha verificado el funcionamiento de las redes." },
            { id: "CE6.6", descripcion: "Se ha realizado la integración de los equipos informáticos en el sistema de telecomunicaciones." },
            { id: "CE6.7", descripcion: "Se han realizado pruebas de rendimiento del sistema informático." },
            { id: "CE6.8", descripcion: "Se ha documentado la puesta en servicio." }
          ]
        },
        {
          id: "RA7",
          descripcion: "Mantiene sistemas informáticos y redes aplicando técnicas de diagnóstico o monitorización y efectuando la corrección de las disfunciones.",
          criterios_evaluacion: [
            { id: "CE7.1", descripcion: "Se han relacionado las averías típicas de los sistemas informáticos y redes locales, con los elementos del sistema." },
            { id: "CE7.2", descripcion: "Se ha aplicado el plan de mantenimiento." },
            { id: "CE7.3", descripcion: "Se han utilizado herramientas hardware/software de diagnóstico y monitorización." },
            { id: "CE7.4", descripcion: "Se han ejecutado las tareas de mantenimiento preventivo y predictivo." },
            { id: "CE7.5", descripcion: "Se ha localizado el equipo o elemento responsable de la disfunción." },
            { id: "CE7.6", descripcion: "Se ha reparado la avería." },
            { id: "CE7.7", descripcion: "Se ha restituido el funcionamiento." },
            { id: "CE7.8", descripcion: "Se han documentado las intervenciones de mantenimiento." }
          ]
        }
      ]
    }
  ]
};
