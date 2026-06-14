# Documentación de API Endpoints

## Base URL
`http://localhost:8000` (desarrollo) o URL de producción

## Endpoints Públicos

### Health Check
- **GET** `/health`
  - Verifica si la API está funcionando
  - Response: `{"status": "healthy"}`

### Catálogos
- **GET** `/api/families`
  - Lista todas las familias profesionales con sus grados
  - Response: `{"status": "success", "data": [...]}`

- **GET** `/api/modules`
  - Lista los módulos disponibles (PD, curso, centro)
  - Parámetros: `user_id` (opcional)
  - Response: `{"status": "success", "data": {...}}`

- **GET** `/api/centers`
  - Lista todos los centros educativos
  - Response: `{"status": "success", "data": [...]}`

### Módulos
- **GET** `/api/module/{module_id}`
  - Obtiene los datos de un módulo específico
  - Response: `{"status": "success", "data": {...}}`

- **PUT** `/api/module/{module_id}`
  - **DESHABILITADO**: La base de datos es de solo lectura (arquitectura Local-First)
  - Los datos deben guardarse localmente o en Google Drive

### PDFs
- **GET** `/api/pdf/{type}`
  - Genera PDFs de diferentes tipos (calendario, planificación, matrices, etc.)
  - Parámetros: `module_id`, `curso_id`
  - Response: PDF binario o error

### Documentos
- **GET** `/api/documents`
  - Lista documentos disponibles
  - Response: `{"status": "success", "data": [...]}`

### Asistencia
- **GET** `/api/attendance`
  - Obtiene datos de asistencia
  - Response: `{"status": "success", "data": {...}}`

### Asistente IA
- **POST** `/api/ai/chat`
  - Envía mensaje al asistente IA
  - Body: `{"message": "texto"}`
  - Response: `{"status": "success", "data": {...}}`

## Endpoints de Administración

### Backup
- **POST** `/admin/backup`
  - Crea un backup de la base de datos
  - Response: `{"status": "ok", "message": "Backup created successfully"}`

### Módulos Admin
- **GET** `/api/admin/modules`
  - Lista todos los módulos (solo admin)
  - Response: `{"status": "success", "data": [...]}`

## Arquitectura Local-First

**Importante**: La base de datos del servidor es de solo lectura. Los datos del usuario deben guardarse:
1. Localmente en archivos `.cddp` / `.cddc`
2. En Google Drive (sincronización)
3. En OneDrive (sincronización)

El endpoint PUT `/api/module/{module_id}` siempre devuelve error 403.

## Formato de Respuesta

Todas las respuestas siguen este formato:
```json
{
  "status": "success" | "error",
  "data": {...} | null,
  "detail": "mensaje de error" (solo si status = "error")
}
```

## Errores Comunes

- **403 Forbidden**: Intento de modificar base de datos de solo lectura
- **404 Not Found**: Módulo o recurso no encontrado
- **500 Internal Server Error**: Error interno del servidor

## Ejemplo de Uso

```javascript
// Obtener datos de un módulo
const response = await fetch(`${API_URL}/api/module/ele203-0237ictve`);
const data = await response.json();

if (data.status === "success") {
  console.log(data.data);
}
```
