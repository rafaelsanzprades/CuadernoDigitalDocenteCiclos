export const navGroups = [
  {
    title: "General",
    sectionDescription: "Espacio para la administración global. Gestiona tus entornos activos, explora el catálogo de ciclos, visualiza el resumen de tu día, accede a la documentación legal y genera los reportes en PDF.",
    items: [
      { href: "/entorno", label: "Entorno de trabajo", icon: "📂", description: "Gestión de las programaciones didácticas, cursos y base de datos activa." },
      { href: "/ciclos", label: "Ciclos formativos", icon: "🏫", description: "Catálogo oficial de Ciclos Formativos. Grados Básico, Medio y Superior." },
      { href: "/hoy", label: "Tu día, semana y mes", icon: "📅", description: "Revisa lo que toca impartir hoy y el estado general de tu clase." },
      { href: "/documentos", label: "Documentos", icon: "📄", description: "Explorador de archivos oficiales, legislación y otros documentos." },
      { href: "/descargas", label: "Descargas PDF", icon: "⬇️", description: "Generación de reportes PDF para el curso y módulo seleccionado." }
    ]
  },
  {
    title: "Programación",
    sectionDescription: "Área de diseño y configuración didáctica. Establece el calendario académico, configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.",
    items: [
      { href: "/modulo", label: "Módulo didáctico", icon: "⚙️", description: "Configuración básica del módulo didáctico." },
      { href: "/calendario", label: "Calendario académico", icon: "🗓️", description: "Fechas generales, trimestres, horario semanal, festivos y eventos relevantes del curso." },
      { href: "/matrices", label: "Matrices OG→RA→CE→UD", icon: "🧮", description: "Relación y ponderación entre los RA, CE y las diferentes UD del módulo." },
      { href: "/instrumentos", label: "Instrumentos de evaluación", icon: "🛠️", description: "Definición y ponderación de las herramientas y métodos de evaluación." },
      { href: "/programacion", label: "Programación de aula", icon: "📚", description: "Secuenciación temporal de las unidades didácticas y diseño de tareas competenciales." }
    ]
  },
  {
    title: "Curso",
    sectionDescription: "Herramientas de seguimiento para el aula viva. Administra el listado de alumnadodo, coordina la orientación profesional y FEOE, anota el progreso diario y evalúa mediante calificaciones analíticas.",
    items: [
      { href: "/alumnadodo", label: "Alumnadodo y tutoría", icon: "👥", description: "Gestión oficial de estudiantes, ficha individual de orientación y matriz de tutoría." },
      { href: "/profesional", label: "Orientación profesional", icon: "🧭", description: "Diseño del Plan de Orientación Profesional del módulo o ciclo." },
      { href: "/feoe", label: "Prácticas FEOE", icon: "🏢", description: "Gestión de empresas colaboradoras, asignación de alumnadodo y seguimiento de prácticas duales y FCT." },
      { href: "/seguimiento", label: "Seguimiento diario", icon: "📍", description: "Registro detallado del desarrollo diario de las clases y contingencias." },
      { href: "/progreso", label: "Progreso académico", icon: "📈", description: "Panel integrado de calificaciones numéricas, evaluación por resultados de aprendizaje (RA) y analíticas." }
    ]
  }
];
