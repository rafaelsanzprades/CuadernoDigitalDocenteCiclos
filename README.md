# 📓 Cuaderno Digital Docente — Ciclos

Aplicación web interactiva desarrollada en **Python + Streamlit** para la gestión integral del trabajo docente en Formación Profesional: programación didáctica, seguimiento de aula y evaluación del alumnado.

---

## 🗂️ Estructura de la aplicación

La app se organiza en **3 bloques independientes**, cada uno con su propio fichero JSON:

| Bloque | Secciones | Fichero |
|---|---|---|
| 🌍 **Configuración global** | Contextualización, Calendario académico | `ciclos-fp.json` |
| 🗂️ **Programación didáctica** | Módulo didáctico, Matrices RA→CE→UD, Instrumentos de evaluación, Planes e inclusión, Resumen docente, Programación de aula | `0237-ictve-pd.json` |
| 📅 **Curso actual** | Seguimiento diario, Matrícula alumnado, Calificación académica, Calificación FEOE, Evaluación continua | `0237-ictve-curso-2025-26.json` |

Esta separación permite **reutilizar la Programación Didáctica** en cursos futuros sin perder los datos del alumnado, y viceversa.

---

## 🚀 Funcionalidades implementadas

### 📐 Programación Didáctica
- **Módulo didáctico:** Parametrización del módulo (nombre, código BOA, horas, centro, profesorado, horario semanal)
- **Matrices RA → CE → UD:** Gestión de Resultados de Aprendizaje, Criterios de Evaluación, Unidades Didácticas e Instrumentos de evaluación
- **Planes e inclusión:** DUA, Plan de Contingencia y Actividades Complementarias/Extraescolares
- **Resumen docente:** Visión del reparto de horas por UD a lo largo de los trimestres
- **Programación de aula:** Registro de sesiones con tipo de actividad, RA/CE vinculados y recursos

### 📅 Curso actual
- **Seguimiento diario:** Verificador mensual de horas previstas vs. impartidas con indicador de `Sin docencia`
- **Matrícula alumnado:** Listado editable con fijación de columnas, detección automática de menores de 18 años y ordenación por apellidos
- **Calificación académica:** Cuaderno de notas por instrumento y trimestre con cálculo automático de nota final y equivalencia SIGAD
- **Calificación FEOE:** Integración de notas del tutor de empresa para módulos dualizados
- **Evaluación continua:** Progreso porcentual por RA para cada alumno

### 📥 Informes PDF (ReportLab)
- Calendario académico mensual con festivos
- Seguimiento diario para firmas de asistencia
- Boletín competencial por alumno (progresión trimestral completa)
- Programación de aula

---

## 🛡️ Características del sistema

| Función | Descripción |
|---|---|
| 💾 Autoguardado | Cada 5 min, guarda PD y Curso en sus ficheros separados |
| 🔒 Modo solo lectura | Por bloque (Global / PD / Curso) — protege de ediciones accidentales |
| 🗄️ Backups automáticos | Copia con timestamp antes de cada guardado (máx. 5 por fichero) |
| 🟢 Validador de coherencia | Comprueba horas lectivas reales vs. suma de horas UD y fechas de trimestres |
| 🌍 Configuración global | Centro, profesorado, fechas lectivas y calendario compartidos entre módulos |

---

## ⚙️ Instalación y uso

```bash
# 1. Clonar el repositorio
git clone https://github.com/rafaelsanzprades/CuadernoDigitalDocenteCiclos.git

# 2. Crear entorno virtual (recomendado)
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux / Mac

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Arrancar la aplicación
streamlit run app.py
```

> También puedes usar el script `run.bat` en Windows.

---

## 📁 Ficheros de datos

La app crea y gestiona automáticamente tres tipos de JSON en el directorio de trabajo:

```
ciclos-fp.json                    ← Configuración global (fechas, horario, contexto)
{modulo}-pd.json                  ← Programación Didáctica
{modulo}-curso-{año}.json         ← Datos del curso (alumnado, notas, seguimiento)
backups/                          ← Copias automáticas con timestamp
```

Los ficheros son portables: comparte la PD con compañeros sin exponer datos de alumnado.

---

## 🛠️ Tecnologías

- **Python 3** · **Streamlit** · **Pandas** · **ReportLab**
- Persistencia en **JSON** local (sin base de datos externa)
- Dark Mode nativo con CSS/HTML inyectado

---

## 📋 Hoja de ruta

| # | Mejora | Estado |
|---|---|---|
| 1 | Autoguardado automático | ✅ |
| 2 | Backup automático con timestamp | ✅ |
| 3 | Separación de JSONs por bloque | ✅ |
| 7 | Validador de coherencia | ✅ |
| 8 | Indicador de módulo activo en sidebar | ✅ |
| 9 | Modo solo lectura por bloque | ✅ |
| 4 | PDF unificado de Programación Didáctica | ⬜ |
| 5 | Exportación de calificaciones a Excel (.xlsx) | ⬜ |
| 6 | Vista resumen por RA con barras de progreso | ⬜ |
| 10 | Buscador de alumnado | ⬜ |

---

## 📝 Cambios recientes (2026-03-31)

### Módulo didáctico — Resumen visual
- **Nuevo bloque "Nº Instrumentos de evaluación"** (4 columnas): Exámenes teóricos, Exámenes prácticos, Informes de ejercicios, Cuaderno de tareas — contados automáticamente desde la tabla de Instrumentos.
- **Distribución de UDs por trimestre mejorada:** una UD se asigna a un trimestre si su fecha de inicio **o** su fecha de fin cae en ese trimestre (permite duplicados en trimestres limítrofes). Las UDs sin días lectivos asignados (cuando se agotan horas lectivas) se añaden automáticamente al último trimestre disponible.
- **Métrica "H. Clases UD"** en el resumen de horas de Matrices RA→CE→UD: muestra la suma de la columna Horas de todas las UDs definidas.

### Validador de coherencia (sidebar)
- **Lógica corregida:** UDs > horas lectivas → 🔴 crítico ("exceden Xh — no caben en el calendario"); UDs < horas lectivas → 🟡 aviso ("sobran Xh lectivas").
- La misma lógica se aplica al badge junto al título "UD. Unidades Didácticas" mediante el nuevo parámetro `invert=True` de la función `badge()`.

### Nombre de la aplicación
- Renombrado a **"Cuaderno Digital Docente Ciclos"** (eliminado "FP") en README y sidebar.
