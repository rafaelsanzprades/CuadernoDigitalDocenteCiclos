# Documentación de Scripts de Seed

## Visión General

Los scripts de seed se utilizan para poblar la base de datos con datos iniciales (catálogos oficiales, datos DEMO, usuarios, etc.).

## Scripts Principales

### 1. `seed_aragon_full.py`
**Propósito**: Poblar la base de datos con el catálogo completo de FP de Aragón.

**Contenido**:
- Familias profesionales (Informática, Administración, Comercio, etc.)
- Grados (Básico, Medio, Superior)
- Módulos profesionales
- Unidades didácticas (UD)
- Resultados de aprendizaje (RA)
- Competencias específicas (CE)

**Uso**:
```bash
python seed_aragon_full.py
```

### 2. `seed_fictitious_full.py`
**Propósito**: Crear datos DEMO para pruebas con un curso completo ficticio.

**Contenido**:
- Curso DEMO: "2º DAW - 2025/26"
- Alumnos ficticios (20-30 estudiantes)
- Seguimiento diario
- Calificaciones
- Actuaciones de tutoría

**Uso**:
```bash
python seed_fictitious_full.py
```

### 3. `seed_fictitious_full_data.py`
**Propósito**: Datos DEMO adicionales para el curso ficticio.

**Uso**:
```bash
python seed_fictitious_full_data.py
```

### 4. `seed_users.py`
**Propósito**: Crear usuarios de prueba.

**Contenido**:
- Usuario admin (admin@example.com / admin123)
- Usuario profesor (profesor@example.com / profesor123)
- Usuarios adicionales para pruebas

**Uso**:
```bash
python seed_users.py
```

### 5. `seed_fp.py`
**Propósito**: Poblar catálogo general de FP.

**Uso**:
```bash
python seed_fp.py
```

### 6. `seed_all_families.py`
**Propósito**: Poblar todas las familias profesionales.

**Uso**:
```bash
python seed_all_families.py
```

### 7. `seed_degrees.py` / `seed_degree_codes.py`
**Propósito**: Poblar grados y códigos de grado.

**Uso**:
```bash
python seed_degrees.py
python seed_degree_codes.py
```

### 8. `seed_ele203_ra.py` / `seed_ele304_ra.py`
**Propósito**: Poblar resultados de aprendizaje específicos para módulos de Electrónica.

**Uso**:
```bash
python seed_ele203_ra.py
python seed_ele304_ra.py
```

### 9. `seed_adg_ra.py`
**Propósito**: Poblar RA para módulos de Administración.

**Uso**:
```bash
python seed_adg_ra.py
```

### 10. `seed_tutoria.py`
**Propósito**: Poblar datos de tutoría.

**Uso**:
```bash
python seed_tutoria.py
```

### 11. `seed_missing_degrees.py`
**Propósito**: Completar grados que faltan en la base de datos.

**Uso**:
```bash
python seed_missing_degrees.py
```

### 12. `update_python_seed.py`
**Propósito**: Actualizar scripts de seed con nuevos datos.

**Uso**:
```bash
python update_python_seed.py
```

## Flujo de Trabajo Recomendado

### 1. Inicialización de BD (desarrollo)
```bash
cd backend
python seed_aragon_full.py
python seed_fictitious_full.py
python seed_users.py
```

### 2. Inicialización de BD (producción)
**Nota**: En producción, NO se ejecutan scripts de seed. La BD se inicializa automáticamente en el arranque de la API.

## Estructura de Datos

### Familias Profesionales
```json
{
  "id": 1,
  "code": "INF",
  "name": "Informática y Comunicaciones",
  "icon_url": "...",
  "color_hex": "#0066CC"
}
```

### Grados
```json
{
  "id": 1,
  "code": "DAW",
  "name": "Desarrollo Aplicaciones Web",
  "level": "superior",
  "family_id": 1,
  "boa_articles": ["Artículo 34", "Artículo 35"]
}
```

### Módulos
```json
{
  "id": 1,
  "code": "ele203",
  "name": "Sistemas Electrónicos",
  "hours": 100,
  "degree_id": 1
}
```

### Unidades Didácticas (UD)
```json
{
  "id": 1,
  "code": "UD01",
  "name": "Introducción a la electrónica",
  "hours_ud": 10,
  "module_id": 1
}
```

### Resultados de Aprendizaje (RA)
```json
{
  "id": 1,
  "code": "RA01",
  "description": "Analizar circuitos electrónicos básicos",
  "ra_number": 1,
  "module_id": 1
}
```

## Scripts de Inyección

### `inject_correct_demo.py`
**Propósito**: Corregir datos DEMO existentes.

**Uso**:
```bash
python inject_correct_demo.py
```

### `inject_demo_frontend.py`
**Propósito**: Inyectar datos DEMO desde el frontend.

**Uso**:
```bash
python inject_demo_frontend.py
```

### `inject_official_ces.py`
**Propósito**: Inyectar competencias específicas oficiales.

**Uso**:
```bash
python inject_official_ces.py
```

## Scripts de Verificación

### `check_demo_ce.py`
**Propósito**: Verificar competencias específicas en datos DEMO.

**Uso**:
```bash
python check_demo_ce.py
```

### `check_ele203.py`
**Propósito**: Verificar datos del módulo Ele203.

**Uso**:
```bash
python check_ele203.py
```

### `check_ra.py` / `check_ra_ids.py`
**Propósito**: Verificar IDs y datos de RA.

**Uso**:
```bash
python check_ra.py
python check_ra_ids.py
```

## Scripts de Recuperación

### `recover_db.py`
**Propósito**: Recuperar base de datos desde backup.

**Uso**:
```bash
python recover_db.py
```

### `restore_real_db.py`
**Propósito**: Restaurar base de datos real.

**Uso**:
```bash
python restore_real_db.py
```

### `restore_real_db_from_ts.py`
**Propósito**: Restaurar BD desde archivos TypeScript.

**Uso**:
```bash
python restore_real_db_from_ts.py
```

## Consideraciones de Seguridad

1. **NUNCA** ejecutar scripts de seed en producción
2. **SIEMPRE** hacer backup antes de ejecutar scripts de recuperación
3. Los scripts de seed solo deben usarse en entornos de desarrollo/pruebas

## Errores Comunes

### Error: "Database is locked"
**Solución**: Cerrar otras conexiones a la BD antes de ejecutar el script.

### Error: "Module not found"
**Solución**: Ejecutar scripts en el orden correcto (primero seed_aragon_full.py).

### Error: "Duplicate entry"
**Solución**: Limpiar la BD antes de ejecutar los scripts de seed.
