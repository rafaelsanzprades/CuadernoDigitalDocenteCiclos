# 📋 Changelog — Cuaderno FP

## [1.0.1] - 2026-06-15

### ✨ Nuevas Funcionalidades

#### Modo DEMO vs Datos Reales
- **Datos DEMO**: Inmutables, sin opción de "Guardar" ni "Sincronizar"
- **Datos Reales**: Opción "Abrir" (.cddp/.cddc), "Guardar" local y "Sincronizar" con Google Drive
- **Tab "Nube" oculto en modo DEMO**: Solo visible en modo datos reales

## [1.0.0] - 2026-06-14

### ✨ Nuevas Funcionalidades

#### Tests E2E con Playwright
- **18 tests** en 4 archivos de test
- **3 navegadores:** Chromium, Firefox, WebKit
- **54 tests totales** (18 × 3 navegadores)
- Scripts de ejecución: `test:e2e`, `test:e2e:ui`, `test:e2e:report`
- Documentación completa en `frontend/TESTS.md`

#### Accesibilidad
- ARIA labels en componentes Header (sidebar toggle, search, undo/redo)
- Navegación por teclado con tabIndex en controles principales
- Tests de accesibilidad en E2E (títulos, imágenes, ARIA, teclado)

#### Gestión de Base de Datos
- Migración Alembic para normalizar `is_dual` de VARCHAR a Boolean
- Pool de conexiones SQLAlchemy configurado (StaticPool para SQLite, QueuePool para PostgreSQL)
- Utilidades de transacciones (`with_transaction`, `safe_query`)

### 🐛 Correcciones
- Normalización de campo `is_dual` en modelo `LearningOutcomeItem`
- Corrección de tipos en esquemas Pydantic

### 📚 Documentación
- Documentación de scripts de seed (12 scripts documentados)
- Documentación de endpoints API
- Tests unitarios backend (9 tests, todos pasando)
- Guía de tests E2E en `frontend/TESTS.md`

### 🔧 Mejoras Técnicas
- Build Next.js sin errores TypeScript
- 24 rutas frontend funcionales
- 9 tests backend pasando
- Configuración Playwright optimizada

---

## [0.9.0] - 2026-06-13

### ✨ Nuevas Funcionalidades
- Navegación estructurada en General, Programación y Curso
- Generador de PDFs avanzado (seguimiento, planificación, boletines)
- Seeder inteligente con datos demo coherentes
- Persistencia local en IndexedDB con sincronización en la nube

### 📚 Documentación
- README.md actualizado con arquitectura y stack tecnológico
- Guía de instalación y desarrollo local

---

## [0.8.0] - 2026-06-12

### ✨ Nuevas Funcionalidades
- API REST con FastAPI
- Base de datos SQLite con SQLAlchemy
- Frontend Next.js con Tailwind CSS
- PWA con funcionalidad offline-first

---

**Formato:** [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)
**Versionado:** [Semantic Versioning](https://semver.org/lang/es/)
