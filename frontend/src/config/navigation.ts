import { Activity, BookOpen, Building2, Calendar, Compass, FileText, FolderOpen, GraduationCap, Grid, MapPin, Settings, TrendingUp, Users, Wrench } from "lucide-react";

export const navGroups = [
  {
    title: "Programación",
    sectionDescription: "Área de diseño y configuración didáctica. Configura el módulo, enlaza las matrices de evaluación, define los instrumentos y secuencia las tareas de aula.",
    items: [
      { href: "/modulo", label: "Módulo didáctico", icon: Settings, description: "Configuración básica del módulo didáctico." },
      { href: "/matrices", label: "Matrices OG→RA→CE→UD", icon: Grid, description: "Relación y ponderación entre los RA, CE y las diferentes UD del módulo." },
      { href: "/instrumentos", label: "Instrumentos de evaluación", icon: Wrench, description: "Definición y ponderación de las herramientas y métodos de evaluación." },
      { href: "/programacion", label: "Programación de aula", icon: BookOpen, description: "Secuenciación temporal de las unidades didácticas y diseño de tareas competenciales." }
    ]
  },
  {
    title: "Curso",
    sectionDescription: "Herramientas de seguimiento para el aula viva. Establece el calendario, administra el listado de alumnado, anota el progreso diario y evalúa.",
    items: [
      { href: "/calendario", label: "Calendario académico", icon: Calendar, description: "Fechas generales, trimestres, horario semanal, festivos y eventos relevantes del curso." },
      { href: "/alumnado", label: "Alumnado y tutoría", icon: Users, description: "Gestión oficial de estudiantes, ficha individual de orientación, asignación FEOE y matriz de tutoría." },
      { href: "/seguimiento", label: "Seguimiento diario", icon: MapPin, description: "Registro detallado del desarrollo diario de las clases y contingencias." },
      { href: "/progreso", label: "Progreso académico", icon: TrendingUp, description: "Panel integrado de calificaciones numéricas, evaluación por resultados de aprendizaje (RA) y analíticas." }
    ]
  },
  {
    title: "General",
    sectionDescription: "Espacio para la administración global. Gestiona tus entornos activos, visualiza la agenda de clase, accede a la documentación legal y reportes.",
    items: [
      { href: "/entorno", label: "Entorno de trabajo", icon: FolderOpen, description: "Gestión de las programaciones didácticas, cursos y base de datos activa." },
      { href: "/documentacion", label: "Documentación", icon: FolderOpen, description: "Explorador de archivos oficiales, legislación y otros documentos." },
      { href: "/descargas", label: "Descargas .PDF", icon: FileText, description: "Generación de reportes y boletines en PDF." },
      { href: "/ciclos", label: "Ciclos formativos", icon: GraduationCap, description: "Catálogo oficial de Ciclos Formativos. Grados Básico, Medio y Superior." },
      { href: "/feoe", label: "Empresas FEOE", icon: Building2, description: "Catálogo de empresas colaboradoras para formación dual y FCT." },
      { href: "/ayuda", label: "Centro de ayuda", icon: Activity, description: "Panel de salud: verifica la coherencia y completitud de todos los datos del cuaderno." }
    ]
  }
];
