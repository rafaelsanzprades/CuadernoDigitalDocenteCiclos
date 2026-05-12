# 📓 Cuaderno Digital Docente — Ciclos

Aplicación web interactiva desarrollada con **Next.js (React) + FastAPI + SQLite** para la gestión integral del trabajo docente en Formación Profesional: programación didáctica, seguimiento de aula y evaluación del alumnado.

---

## 🏛️ Arquitectura del Sistema

La aplicación ha sido modernizada completamente, abandonando el antiguo sistema basado en ficheros JSON y Streamlit, en favor de una arquitectura robusta y escalable:

- **Frontend (UI/UX):** Next.js, React, Tailwind CSS, Zustand (para gestión de estado global). Interfaz moderna con *glassmorphism* y menú superior desplegable por categorías.
- **Backend (API REST):** Python con FastAPI, proporcionando endpoints rápidos y seguros.
- **Base de Datos:** SQLite gestionado a través de SQLAlchemy, asegurando integridad relacional y centralización de los datos académicos.

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
