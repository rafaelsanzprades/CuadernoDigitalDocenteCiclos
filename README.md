# 📓 Cuaderno FP — Ciclos Formativos

![License](https://img.shields.io/github/license/rafaelsanzprades/CuadernoFP?color=blue&style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)
![Open Source](https://img.shields.io/badge/Open_Source-❤️-ff69b4?style=flat-square)

**Cuaderno FP** es una aplicación web interactiva, moderna y completamente offline-first desarrollada con **Next.js (React) + FastAPI + SQLite** orientada a la gestión integral del trabajo docente en Formación Profesional: programación didáctica, seguimiento de aula, prácticas en empresas (FEOE) y evaluación competencial del alumnado.

---

## 🚀 Funcionalidades Principales

La aplicación se estructura en un menú principal con tres grandes bloques de trabajo, diseñados para abarcar todo el ciclo de vida de la docencia en FP:

### 📁 1. General
Espacio para la administración global. Gestiona tus entornos activos, explora el catálogo de ciclos, visualiza la agenda y genera informes en PDF.
- **Entorno de trabajo:** Gestión de las programaciones didácticas, cursos y base de datos activa. Integración con Google Drive y OneDrive para sincronización en la nube.
- **Ciclos formativos:** Catálogo oficial de Ciclos Formativos (Grados Básico, Medio y Superior).
- **Agenda de clase:** Revisa lo que toca impartir hoy y el estado general de tu clase.
- **Documentos y descargas:** Generador de reportes PDF (seguimiento, boletines, planificación) listos para descargar o imprimir.
- **Centro de ayuda:** Panel de salud, verificación de coherencia de datos y asistencia técnica.

### ⚙️ 2. Programación
Área de diseño y configuración didáctica. Establece el calendario académico, configura el módulo y secuencia las tareas de aula.
- **Módulo didáctico:** Configuración básica del módulo y presentación del centro.
- **Calendario académico:** Fechas generales, trimestres, horario semanal, festivos y eventos relevantes.
- **Matrices OG→RA→CE→UD:** Definición, relación y ponderación entre Resultados de Aprendizaje (RA), Criterios de Evaluación (CE) y Unidades Didácticas (UD).
- **Instrumentos de evaluación:** Definición y ponderación de las herramientas y métodos de evaluación que usarás en clase.
- **Programación de aula:** Secuenciación temporal de las unidades didácticas y diseño de tareas competenciales (Atención a la diversidad, DUA, actividades).

### 📅 3. Curso
Herramientas de seguimiento para el aula viva. Administra el alumnado, coordina prácticas, anota el progreso diario y evalúa.
- **Alumnado y tutoría:** Gestión oficial de estudiantes, ficha individual de orientación y matriz de tutoría.
- **Orientación profesional:** Diseño del Plan de Orientación Profesional del módulo o ciclo.
- **Prácticas FEOE:** Gestión de empresas colaboradoras, asignación de alumnado y seguimiento de prácticas (Dual / Formación en Empresa).
- **Seguimiento diario:** Registro detallado del desarrollo de las clases y desviaciones o contingencias respecto a la programación inicial.
- **Progreso académico:** Panel integrado de calificaciones numéricas, evaluación continua por Resultados de Aprendizaje (RA) y analíticas grupales e individuales.

---

## 🏛️ Arquitectura del Sistema

La aplicación está construida sobre una arquitectura robusta, híbrida y escalable:

- **Frontend (UI/UX):** Aplicación PWA construida con **Next.js**, React y Tailwind CSS. Utiliza Zustand para la gestión de estado global y almacenamiento local (IndexedDB) para fluidez instantánea. Alojado en **Firebase Hosting**.
- **Backend (API REST):** Desarrollado en Python con **FastAPI**, proporcionando endpoints rápidos para generación documental y lógica de IA. Desplegado en **Google Cloud Run**.
- **Base de Datos:** Motor **SQLite** gestionado a través de SQLAlchemy. Estructura de base de datos 100% relacional que mantiene la coherencia total de los datos académicos.
- **Arquitectura Híbrida:** Funcionamiento "Local-First" en el navegador del usuario para una experiencia sin latencia, sincronizado de manera segura con el servidor en la nube para procesos pesados (PDFs, Bases de datos globales).

---

## ⚙️ Instalación y Entorno de Desarrollo Local

### Requisitos previos
- Node.js 18+ y npm/yarn
- Python 3.10+

### Pasos de instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/rafaelsanzprades/CuadernoFP.git
cd CuadernoFP

# 2. Iniciar el entorno completo (Windows)
# Esto arrancará tanto el backend (FastAPI) como el frontend (Next.js) simultáneamente
.\start.bat
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

## 📝 Historial de Cambios Recientes

### Versión Actual (2026) - Cuaderno FP NextGen
- **Sincronización y Entorno:** Implementación de persistencia local en caché (indexedDB) con guardado automático al backend y sincronización en la nube opcional.
- **Módulo de Pruebas Ficticias:** Integración de un seeder inteligente que inyecta datos de muestra (`demo`) coherentes al arrancar una base de datos vacía.
- **Generador de PDFs Avanzado:** Reparado y ampliado el subsistema de ReportLab para exportar Seguimiento Diario, Planificación y Boletines Grupales/Individuales con el calendario lectivo real del centro.
- **Nueva Interfaz UI/UX:** Nueva navegación estructurada en *General*, *Programación* y *Curso*.

---

## 🤝 Contribuciones y Licencia

Este proyecto es de **código abierto** y se distribuye bajo la licencia **GNU GPLv3** (el contenido bajo CC BY-NC-SA 4.0).
- Consulta el archivo [LICENSE.md](./LICENSE.md) para más detalles legales.
- Si deseas colaborar o reportar un error, lee nuestra [Guía de Contribución](./CONTRIBUTING.md). ¡Toda ayuda es bienvenida!
