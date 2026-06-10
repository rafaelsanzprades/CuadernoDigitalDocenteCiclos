import { Activity, BookOpen, Building2, Calendar, CalendarDays, Compass, FileText, FolderOpen, GraduationCap, Grid, MapPin, Settings, TrendingUp, Users, Wrench } from "lucide-react";

export const navGroups = [
  {
    title: "Programación",
    sectionDescription: "Área de diseño y configuración didáctica. Establece el calendario académico, configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.",
    items: [
      { href: "/modulo", label: "Módulo didáctico", icon: Settings, description: "Configuración básica del módulo didáctico." },
      { href: "/calendario", label: "Calendario académico", icon: Calendar, description: "Fechas generales, trimestres, horario semanal, festivos y eventos relevantes del curso." },
      { href: "/matrices", label: "Matrices OG→RA→CE→UD", icon: Grid, description: "Relación y ponderación entre los RA, CE y las diferentes UD del módulo." },
      { href: "/instrumentos", label: "Instrumentos de evaluación", icon: Wrench, description: "Definición y ponderación de las herramientas y métodos de evaluación." },
      { href: "/programacion", label: "Programación de aula", icon: BookOpen, description: "Secuenciación temporal de las unidades didácticas y diseño de tareas competenciales." }
    ]
  },
  {
    title: "Curso",
    sectionDescription: "Herramientas de seguimiento para el aula viva. Administra el listado de alumnado, coordina la orientación profesional y FEOE, anota el progreso diario y evalúa mediante calificaciones analíticas.",
    items: [
      { href: "/alumnado", label: "Alumnado y tutoría", icon: Users, description: "Gestión oficial de estudiantes, ficha individual de orientación y matriz de tutoría." },
      { href: "/seguimiento", label: "Seguimiento diario", icon: MapPin, description: "Registro detallado del desarrollo diario de las clases y contingencias." },
      { href: "/profesional", label: "Orientación profesional", icon: Compass, description: "Diseño del Plan de Orientación Profesional del módulo o ciclo." },
      { href: "/feoe", label: "Prácticas FEOE", icon: Building2, description: "Gestión de empresas colaboradoras, asignación de alumnado y seguimiento de prácticas duales y FCT." },
      { href: "/progreso", label: "Progreso académico", icon: TrendingUp, description: "Panel integrado de calificaciones numéricas, evaluación por resultados de aprendizaje (RA) y analíticas." }
    ]
  },
  {
    title: "General",
    sectionDescription: "Espacio para la administración global. Gestiona tus entornos activos, explora el catálogo de ciclos, visualiza la agenda de clase, accede a la documentación legal y genera los reportes en PDF.",
    items: [
      { href: "/entorno", label: "Entorno de trabajo", icon: FolderOpen, description: "Gestión de las programaciones didácticas, cursos y base de datos activa." },
      { href: "/ciclos", label: "Ciclos formativos", icon: GraduationCap, description: "Catálogo oficial de Ciclos Formativos. Grados Básico, Medio y Superior." },
      { href: "/documentacion", label: "Documentación", icon: FolderOpen, description: "Explorador de archivos oficiales, legislación y otros documentos." },
      { href: "/descargas", label: "Descargas .PDF", icon: FileText, description: "Generación de reportes y boletines en PDF." },
      { href: "/ayuda", label: "Centro de ayuda", icon: Activity, description: "Panel de salud: verifica la coherencia y completitud de todos los datos del cuaderno." }
    ]
  }
];
