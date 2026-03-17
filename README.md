# 📓 Cuaderno de Profesorado - Gestión Docente y Evaluación Interactiva

Una aplicación web interactiva desarrollada en **Python** con **Streamlit** diseñada para facilitar la labor del profesorado de Formación Profesional (o cualquier otra etapa educativa) en la gestión diaria de sus clases. Automatiza la planificación, el seguimiento en vivo, y el cálculo de evaluaciones en sintonía con los Resultados de Aprendizaje (RA).

## 🚀 Características Principales

La herramienta se divide en **6 pilares fundamentales** accesibles mediante un menú de navegación rápido y oscuro:

1. **Datos Generales:** 
   * Parametrización del módulo (Nombre, horas BOA, horas semanales).
   * Asignación de ponderaciones a cada una de los criterios de calificación (Exámenes Teóricos, Prácticos, Trabajos, Cuaderno).
   * Control sobre la distribución de porcentajes entre evaluaciones a lo largo del curso.

2. **Fechas y Horarios:** 
   * Calendario lectivo con los periodos de los 3 trimestres.
   * Gestión visual del horario escolar indicando las horas semanales impartidas.
   * Calendario interactivo con opción para marcar jornadas festivas, evaluación y contingencias personalizadas.

3. **Planificación (RA, UD y PR):**
   * Desglose de Resultados de Aprendizaje (RA) y Unidades Didácticas (UD).
   * Asignación en tiempo real de qué RA tributan a qué UD o qué Prácticas impartidas.
   * Resumen dinámico que calcula en qué trimestre recae cada unidad formativa en base al número de horas programadas por UD y a los días lectivos reales.

4. **Seguimiento Diario:**
   * Tabla dinámica que compara las horas "Previstas" (estimadas al organizar las UDs) vs las horas "Impartidas" reales.
   * Visualización del avance por mes.
   * Editor de seguimiento diario (log) que permite indicar al profesorado qué se ha impartido cada día, añadir comentarios o marcar faltas de docencia (ausencias, excursiones, etc.) recalculando el progreso vivo anual.

5. **Alumnado:**
   * Ficha de seguimiento completa.
   * Ingreso y edición de datos socio-demográficos (Fecha de nacimiento, Edad autocalculada, estado, correos electrónicos, etc.).

6. **Evaluación:**
   * Cuaderno de notas tabular desglosado por estudiante con expanders individuales.
   * Puntuación manual para Tª, Pª, Informes y Tareas en cada uno de los trimestres (1T, 2T, 3T).
   * **Cálculo automático de nota Media Final**.
   * Integración de cálculos automáticos adaptados a insignias del sistema institucional **SIGAD** (con traducciones a texto como _Sobresaliente, Bien, Insuficiente..._ y códigos colores).
   * Sobrescritura final permitida para redondeos y decisiones de evaluación extraordinarias.

7. **Resultados (Consecución de RA):**
   * Gráficos dinámicos integrados en el código que muestran visualmente el grado de consecución de cada RA basado en las notas medias obtenidas de los trimestres implicados.
   * Presentación clara del % Total alcanzado respecto a la ponderación del curso.
   * Evidencias: Justificación en pantalla de aquellas UDs y PRs sobre las que el alumno fue evaluado con relación a ese RA.

## 🛠️ Tecnologías Empleadas

- **[Python 3](https://www.python.org/):** Lenguaje base.
- **[Streamlit](https://streamlit.io/):** Framework para la generación de la Interfaz de Usuario.
- **[Pandas](https://pandas.pydata.org/):** Tratamiento y estructuración de los Dataframes (tablas de alumnos, notas, fechas).
- Archivos locales **JSON** como motor de base de datos persistente.

## ⚙️ Instalación y Uso

1. Mueve todo tu código a tu directorio deseado.
2. Es recomendable crear un entorno virtual para correr la aplicación de manera asilada:
   ```bash
   python -m venv env
   source env/bin/activate  # en Linux/Mac
   env\Scripts\activate     # en Windows
   ```
3. Instala las dependencias necesarias:
   ```bash
   pip install streamlit pandas
   ```
4. Arranca el servidor local:
   ```bash
   streamlit run app.py
   ```
5. Tras unos segundos, se abrirá automáticamente la aplicación en tu navegador web por defecto `http://localhost:8501`.

## 📁 Archivos de Configuración

La aplicación guarda el progreso y toda la información metida en la interfaz directamente en archivos planos con extensión `.json` según se guardan los cambios de estado (`0237-ictve.json`). Si la hoja JSON no existe, la aplicación levanta en modo seguro una plantilla en blanco.

## 🎨 Personalización Visual
Todo el diseño se ha creado inyectando reglas CSS y HTML a medida para acercar la sensación a una auténtica aplicación web oscura (Dark Mode nativo). Las barras de carga, insignias SIGAD y celdas congeladas interactúan suavizando el trabajo habitual de las densas hojas de Excel.
