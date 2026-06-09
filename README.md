# 📓 Cuaderno FP — Ciclos

![License](https://img.shields.io/github/license/rafaelsanzprades/CuadernoFP?color=blue&style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)
![Open Source](https://img.shields.io/badge/Open_Source-❤️-ff69b4?style=flat-square)

Aplicación web interactiva desarrollada con **Next.js (React) + FastAPI + SQLite** para la gestión integral del trabajo docente en Formación Profesional: programación didáctica, seguimiento de aula y evaluación del alumnado.

---

## 🏛️ Arquitectura del Sistema

La aplicación ha sido modernizada completamente, abandonando el antiguo sistema basado en ficheros JSON y Streamlit, en favor de una arquitectura robusta y escalable:

- **Frontend (UI/UX):** Next.js, React, Tailwind CSS, Zustand (para gestión de estado global). Interfaz moderna con *glassmorphism* y menú superior desplegable por categorías.
- **Backend (API REST):** Python con FastAPI, proporcionando endpoints rápidos y seguros.
- **Base de Datos:** SQLite gestionado a través de SQLAlchemy, asegurando integridad relacional y centralización de los datos académicos. Toda la arquitectura se ha migrado a un esquema 100% relacional (SQL puro) organizado por bloques funcionales.

---

## 🏛️ Resumen de la Estructura de la Base de Datos

La aplicación y su modelo de datos se dividen lógicamente en 4 grandes bloques:

### 🏢 Bloque CENTRO
*(Configuración global del centro educativo)*
- **Tablas maestras**: `centers`, `academic_years`, `professional_families`, `degrees`, `modules` (Currículo oficial y catálogo de centros).
- **Tablas de configuración de contexto**: `config_dates` (fechas globales) y `module_infos` (texto descriptivo o presentación del centro).

### ⚙️ Bloque MÓDULO (Programación Didáctica - PD)
*(Planificación teórica anual de la materia)*
- **Tablas de temporalización**: `config_dates`, `calendar_note_items` (Festivos y eventos), `schedule_items` (Horario semanal), `module_infos` (Introducción, metodología).
- **Tablas de currículo**: `learning_outcome_items` (RA), `evaluation_criterion_items` (CE), `didactic_units` (UD), `sessions` (Sesiones teóricas).
- **Planificación diaria**: `planning_ledger_items` (El mapeo temporal: Día X -> Sesión/UD Y).
- **Recursos y atención**: `task_items`, `activity_items`, `instrument_items`, `dua_items`, `contingency_items`, `ace_items`.

### 📅 Bloque CURSO
*(Aplicación real del módulo en un año académico con alumnado)*
- **Tablas de alumnado**: `course_students` (Matrícula), `student_evaluations` (Notas de evaluación continua).
- **Seguimiento**: `sgmt_items` (Seguimiento real de UDs impartidas vs planificadas), `feoe_items` (Seguimiento FEOE).

### 🛠️ Bloque GESTIÓN
*(Roles, carga lectiva y administración)*
- **Usuarios y roles**: `users`, `center_staff`, `head_of_studies`, `department_heads`, `group_tutors`, `teaching_assignments`.
- **Estructura organizativa**: `course_groups` (Ej. 1º DAW, 2º SMR).

---

## 🚀 Funcionalidades Principales

### 🎯 Bloques de Navegación

La aplicación se estructura en un menú principal agrupado por áreas de trabajo:

- **📁 General:** Gestión de archivos y Descargas PDF.
- **🏢 CENTRO:** Introducción y planes, Calendario académico.
- **🧠 APRENDIZAJE:** Módulo didáctico, Matrices RA → CE → UD, Matrícula alumnado, Instrumentos de evaluación.
- **📝 CLASES:** Programación de aula, Seguimiento diario.
- **📊 EVALUACIÓN:** Calificación académica, Calificación FEOE, Evaluación continua, Análisis de grupo, Portal alumnado.

### 📋 Gestión Docente
- Autoguardado e interacción en tiempo real gracias a la API y el estado global.
- Verificadores y validadores de coherencia en el reparto de horas de las Unidades Didácticas.
- Completa integración de cálculos automáticos para la evaluación de resultados de aprendizaje.
- Generación de informes PDF avanzados para evaluación y seguimiento utilizando `ReportLab`.

---

## ⚙️ Instalación y Entorno de Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/rafaelsanzprades/CuadernoDigitalDocenteCiclos.git
cd CuadernoDigitalDocenteCiclos

# 2. Iniciar el entorno completo (Windows)
# Esto arrancará tanto el backend (FastAPI) como el frontend (Next.js) simultáneamente
.\start_dev.bat
```

### Alternativa: Arranque manual

**Backend (FastAPI):**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate     # En Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend (Next.js):**
```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 🛠️ Stack Tecnológico Actual

- **Frontend:** Next.js, React, Tailwind CSS, Zustand.
- **Backend:** Python 3.x, FastAPI, Uvicorn, SQLAlchemy.
- **Base de Datos:** SQLite (`backend/cdd_pro.db`).
- **Generación PDF:** ReportLab.

---

## 📝 Historial de Cambios Recientes

### Versión Actual (2026-05) - Migración a Next.js/FastAPI
- **Refactorización Completa:** Migración del antiguo sistema Streamlit/JSON a un ecosistema React/FastAPI.
- **Rediseño UI/UX:** Interfaz moderna (*glassmorphism*), menús superiores desplegables y modo oscuro nativo refinado.
- **Base de datos relacional:** Transición de ficheros locales `.json` aislados a SQLite con modelos relacionales definidos.
- **Limpieza de repositorio:** Todos los ficheros obsoletos (Streamlit legacy, antiguos JSON) centralizados en `RF BASURA` o eliminados para un mayor orden y mantenimiento de código.

---

## 🤝 Contribuciones y Licencia

Este proyecto es de **código abierto** y se distribuye bajo la licencia **GNU GPLv3** (el contenido bajo CC BY-NC-SA 4.0).
- Consulta el archivo [LICENSE.md](./LICENSE.md) para más detalles legales.
- Si deseas colaborar o reportar un error, lee nuestra [Guía de Contribución](./CONTRIBUTING.md). ¡Toda ayuda es bienvenida!
