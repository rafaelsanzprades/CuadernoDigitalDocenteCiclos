# 🚧 FASE DE PRUEBAS 🚧
# 📓 Cuaderno Digital Docente Ciclos FP

Una aplicación web interactiva desarrollada en **Python** con **Streamlit** diseñada para facilitar la labor del profesorado de Formación Profesional (o cualquier otra etapa educativa) en la gestión diaria de sus clases. Automatiza la planificación, el seguimiento en vivo, y el cálculo de evaluaciones en sintonía con los Resultados de Aprendizaje (RA).

## 🚀 Características Principales

La herramienta se divide en **7 pilares fundamentales** accesibles mediante un menú de navegación rápido y oscuro:

1. **Datos Generales:** 
   * Parametrización del módulo (Nombre, curso, horas BOA, horas semanales).
   * Asignación de ponderaciones a cada una de los criterios de calificación.
   * Seleccionador universal y ágil de archivos en formato JSON para alternar fácilmente múltiples Módulos o Aulas.

2. **Fechas:** 
   * Calendario lectivo global con inicio y fin de curso e intervalos de los 3 trimestres.
   * Gestión visual del horario escolar indicando las horas semanales impartidas por día.
   * Segmentación del intervalo **FEOE** (Formación en la Empresa) para excluirlo del seguimiento si así se estima.

3. **Planificación:**
   * Desglose de Unidades Didácticas (UD) y Prácticas.
   * Asignación en tiempo real de qué RA tributan a qué UD o qué Prácticas impartidas.
   
4. **Resumen:**
   * Visualización organizada de qué UD pertenece a qué trimestre.
   * Justificación transparente sobre cómo se evalúa cada Resultado de Aprendizaje a través y gracias a sus relativas Unidades y Prácticas.

5. **Seguimiento:**
   * Tabla dinámica que compara las horas "Previstas" (estimadas al organizar las UDs) vs las horas "Impartidas" reales adaptando automáticamente las horas al curso o parando los cálculos al empezar prácticas de empresa.
   * Verificador mensual calendario en mano de tu ritmo docencial.

6. **Alumnado:**
   * Ficha completa editable. Control de estados y comunicaciones (Alta, Baja).

7. **Evaluación y Resultados:**
   * Cuaderno de notas tabular individual trimestral. Media final matemática con interfaz optimizada a toques color de insignia institucional (**SIGAD**).
   * Gráficos dinámicos integrales de consecución de capacidades puramente por RA.

## 🛠️ Tecnologías Empleadas

- **[Python 3](https://www.python.org/):** Lenguaje base.
- **[Streamlit](https://streamlit.io/):** Framework para la generación de la Interfaz de Usuario.
- **[Pandas](https://pandas.pydata.org/):** Tratamiento y estructuración de los Dataframes (tablas de alumnos, notas, fechas).
- Archivos locales **JSON** como motor de base de datos persistente dinámica.

## ⚙️ Instalación y Uso

1. Es recomendable crear un entorno virtual:
   ```bash
   python -m venv env
   source env/bin/activate  # en Linux/Mac
   env\Scripts\activate     # en Windows
   ```
2. Instala las dependencias necesarias:
   ```bash
   pip install streamlit pandas
   ```
3. Arranca el servidor local:
   ```bash
   streamlit run app.py
   ```

## 📁 Archivos de Configuración

El guardado de progreso es modular. La aplicación rastrea dinámicamente tu directorio local buscando archivos JSON (ejemplo: `0238-id.json`, `0555-rt.json`). Si no hay nada, arranca un contenedor nuevo llamado `nuevo-modulo.json` protegiendo que jamás se rompa. Puedes exportar o importar asignaturas completas (alumnos incluidos) tan solo compartiendo ese único archivo JSON.

## 🎨 Personalización Visual
Todo el diseño se ha creado inyectando reglas CSS y HTML a medida para acercar la sensación a una auténtica aplicación web oscura (Dark Mode nativo). Las barras de carga, insignias SIGAD y celdas congeladas interactúan suavizando el trabajo habitual de las densas hojas de Excel.
