# Histórico de Cambios (UX/UI y Optimizaciones)

## [Unreleased]
- **Mejoras UX (Tareas 4, 5 y 6):** 
  - **Matrices:** Implementada selección por arrastre y edición masiva tipo Excel para asignar ponderaciones a múltiples UDs simultáneamente.
  - **Recuperaciones:** Añadido un Workflow completo y automatizado que clona instrumentos originales, hereda Criterios de Evaluación y cuenta automáticamente en el resumen trimestral.
  - **FP Dual:** Reemplazado el soporte genérico "FEOE" por la terminología oficial de la nueva FP Dual, separando y renderizando con colores distintos la "Dual General" y "Dual Intensiva" en el calendario interactivo.
- **Migración a SQL (Fase 3):** Finalizada la migración absoluta al modelo relacional. Se eliminó la dependencia del campo JSON para guardar `info_fechas`, `horario`, `info_modulo` y `planning_ledger`. Creadas tablas `ConfigDates`, `ScheduleItem`, `ModuleInfo` y `PlanningLedgerItem`.
- **UI:** Fusión de las pestañas de Inicio y Datos de Módulos. Modificados los subtítulos de las pestañas a "Resumen" y "Gestión de ficheros".
- **Navegación y Arquitectura:** Reestructuración de la barra lateral, eliminando el bloque "Centro", agrupando opciones en "Programación", y moviendo "Entorno de trabajo" a la primera posición de "Gestión".
- **Nueva Vista 'Hoy':** Se estableció `/hoy` como página principal redirigida desde `/`, ofreciendo un resumen de tareas diarias, panel de bienvenida y acceso rápido mediante el botón "Tu día y semana".
- **Chatbot Asistente:** Integración mejorada con Gemini 1.5 Flash. Añadido soporte nativo para adjuntar archivos (PDF e Imágenes) mediante conversión Base64 en el frontend y envío como `inline_data` al backend (FastAPI).
- **Entorno de Desarrollo:** Sustitución de consolas múltiples por PM2 para gestionar el arranque dual (FastAPI/Next.js) en segundo plano (`start.bat` y `stop.bat`), solucionando bloqueos por sobrecarga de procesos huérfanos. Se eliminaron también los scripts VBScript del inicio automático de Windows que causaban fallos en cadena.
- **Mantenimiento:** Limpieza profunda de directorios, eliminación de 18 scripts obsoletos de Python, bases de datos residuales en raíz y archivos temporales del frontend.
- **Renombrado:** Actualización de la ruta `/introduccion` a `/contexto` en el código y navegación.
- **Refactorización Visual:** Reemplazo integral de emojis clásicos (299 ocurrencias) por iconos vectoriales modernos de `lucide-react` a lo largo de toda la aplicación, logrando un diseño visual mucho más consistente y corporativo.
- **Robustez y PWA (Fases 2 y 3):** Verificación e implementación de `GlobalErrorBoundary`, sistema de autoguardado pasivo, y backups rotativos diarios en el backend (SQLite). Completada configuración de PWA con `next-pwa` e iconos generados (192x192 y 512x512) en la carpeta public.

## Fecha: 27 de Mayo de 2026

### 1. Mejoras en Dashboards y Menús (`/`, Menú Lateral/Superior)
- **DashboardKPIs**: Se sustituyeron los números estáticos por contadores animados (`AnimatedCounter`) utilizando `framer-motion` para darle más vida a los KPI principales.
- **Navegación**: Se simplificaron los textos del menú lateral y superior a su forma más concisa ("Centro", "Módulo", "Curso", "Gestión") mejorando la legibilidad.

### 2. Calificaciones y Visualización de Alumnos (`/calificacion`)
- **Sparklines (Gráficos de Tendencia)**: Se integró `recharts` para añadir pequeños gráficos de línea (*sparklines*) en la tarjeta de cada alumno. Esto permite visualizar rápidamente la tendencia de sus notas sin abrir el detalle.
- **Interactividad**: Se añadió `framer-motion` (`AnimatePresence`) para que el panel de detalles de cada alumno se despliegue con un acordeón suave en lugar de aparecer bruscamente.
- **Diseño Premium**: Hover effects mejorados y uso de estilos de panel de cristal (glassmorphism) en fondos oscuros.

### 3. Seguimiento (Diario de Clases) (`/seguimiento`)
- **Iteración 1 (Timeline)**: Se propuso un diseño de Línea de Tiempo (Timeline) vertical para el diario de seguimiento.
- **Iteración 2 (Tabla Clásica)**: Se volvió a un diseño estricto de tabla (preferencia del sector), pero con un rediseño completo (hover states, fondos teñidos para días "Sin docencia", inputs personalizados).
- **Iteración 3 (Restauración de Timeline)**: Tras revisión, se recuperó la Línea de Tiempo vertical ya que resulta visualmente más atractiva y fomenta el uso diario, combinando los badges de UD y checkboxes interactivos.

### 4. Configuración del Currículo (`/modulo`)
- **Tabs (Pestañas)**: Se refactorizó la extensa página de configuración del módulo para usar Pestañas ("Datos Generales", "Horarios y Fechas", "Evaluación").
- **Impacto**: Se elimina el "scroll infinito", reduciendo la carga cognitiva y organizando la información.

### 5. Matrices e Instrumentos (`/matrices`, `/instrumentos`)
- **Framer Motion en Tablas Cruzadas**: Se reemplazaron los `<details>` HTML estándar por componentes `<motion.div>` en las agrupaciones de Criterios de Evaluación y en el desglose trimestral de Instrumentos.
- **Controles Globales**: Se enlazó el botón "Expandir todas / Colapsar todas" con el estado interno (`Set` de IDs abiertos) para mantener la sincronización y animar la apertura y cierre en lote.
- **Estética**: Se integraron badges de colores y fondos diferenciadores para cada tipo de instrumento (Teoría, Práctica, Informes, Tareas).

### 6. Sistema de "Añadir Profesor" (`/usuarios`)
- Se implementó un "Slide-over" (panel lateral derecho) suave para añadir docentes, evitando pop-ups molestos e interrupciones en el flujo de trabajo.

---
*Fin del registro de sesión.*
