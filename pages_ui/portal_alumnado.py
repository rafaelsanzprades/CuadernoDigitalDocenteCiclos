import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta

def render_portal_alumnado(al_id):
    st.title("🎓 Mi Portal de Aprendizaje")
    
    al_data = st.session_state.df_al[st.session_state.df_al["ID"] == al_id].iloc[0]
    st.subheader(f"Hola, {al_data['Nombre']} {al_data['Apellidos']}")
    
    # 1. Indicadores principales
    col1, col2, col3 = st.columns(3)
    
    # Encontrar notas en df_eval
    eval_row = st.session_state.df_eval[st.session_state.df_eval["ID"] == al_id]
    nota_final = 0.0
    if not eval_row.empty:
        nota_final = eval_row.iloc[0].get("Nota_Final", 0.0)
    
    with col1:
        st.metric("Nota Media Actual", f"{nota_final:.2f}")
    with col2:
        # Calcular progreso en días del curso
        ini_c = st.session_state.info_fechas.get("ini_1t", date(2025, 9, 15))
        fin_c = st.session_state.info_fechas.get("fin_3t", date(2026, 6, 15))
        hoy = date.today()
        total_dias = (fin_c - ini_c).days
        dias_pasados = (hoy - ini_c).days
        progreso = max(0, min(100, int((dias_pasados / total_dias) * 100))) if total_dias > 0 else 0
        st.metric("Progreso del Curso", f"{progreso}%")
    with col3:
        # Contar RAs superados (asumiendo nota >= 5)
        # Esto es una simplificación para el dashboard
        st.metric("Estado", "En Proceso" if nota_final < 5 else "Apto")

    st.divider()

    # 2. Desglose por Resultados de Aprendizaje (RA)
    st.subheader("🎯 Progreso por Resultados de Aprendizaje")
    if not st.session_state.df_ra.empty:
        for _, ra in st.session_state.df_ra.iterrows():
            ra_id = ra["id_ra"]
            desc = ra["desc_ra"]
            # Aquí podríamos calcular la nota específica por RA si tuviéramos la matriz completa
            # Por ahora mostramos el peso y un indicador visual
            with st.expander(f"{ra_id}: {desc[:100]}..."):
                st.write(f"**Peso en el módulo:** {ra['peso_ra']}%")
                # Simulamos un progreso basado en la nota final por ahora
                ra_progress = min(100, int((nota_final / 10) * 100))
                st.progress(ra_progress / 100, text=f"Adquisición: {ra_progress}%")

    st.divider()

    # 3. Diario de Seguimiento y Feedback
    st.subheader("📝 Feedback Reciente")
    feedbacks = []
    for fecha, entry in st.session_state.daily_ledger.items():
        if entry.get("observaciones"):
            # En un sistema real, filtraríamos observaciones específicas para este alumno
            # Por ahora mostramos las generales del grupo que le afectan
            feedbacks.append({"Fecha": fecha, "Comentario": entry["observaciones"]})
    
    if feedbacks:
        df_feed = pd.DataFrame(feedbacks).sort_values("Fecha", ascending=False)
        st.table(df_feed.head(5))
    else:
        st.info("No hay comentarios recientes del docente.")

@st.fragment
def render_simulador_notas(al_id):
    st.title("📊 Simulador de Calificaciones")
    st.info("Usa este simulador para ver cómo afectarían diferentes notas a tu promedio final.")

    # Obtener pesos del módulo
    info = st.session_state.info_modulo
    p_teoria = info.get("criterio_conocimiento", 30)
    p_practica = info.get("criterio_procedimiento_practicas", 20)
    p_informes = info.get("criterio_procedimiento_ejercicios", 20)
    p_tareas = info.get("criterio_tareas", 30)

    # Obtener notas actuales
    eval_row = st.session_state.df_eval[st.session_state.df_eval["ID"] == al_id]
    
    c1, c2 = st.columns([2, 1])
    
    with c1:
        st.subheader("Configura tus notas estimadas")
        
        # Simulamos los 4 bloques principales
        val_teoria = st.slider("Exámenes Teóricos (%)", 0.0, 10.0, float(eval_row.iloc[0].get("1T_Teoria", 0.0)) if not eval_row.empty else 5.0)
        val_practica = st.slider("Exámenes Prácticos (%)", 0.0, 10.0, float(eval_row.iloc[0].get("1T_Practica", 0.0)) if not eval_row.empty else 5.0)
        val_informes = st.slider("Informes y Proyectos (%)", 0.0, 10.0, float(eval_row.iloc[0].get("1T_Informes", 0.0)) if not eval_row.empty else 5.0)
        val_tareas = st.slider("Tareas y Actitud (%)", 0.0, 10.0, float(eval_row.iloc[0].get("1T_Cuaderno", 0.0)) if not eval_row.empty else 5.0)

    with c2:
        st.subheader("Resultado proyectado")
        
        # Cálculo de la nota
        nota_proyectada = (
            (val_teoria * p_teoria / 100) +
            (val_practica * p_practica / 100) +
            (val_informes * p_informes / 100) +
            (val_tareas * p_tareas / 100)
        )
        
        # Mostrar resultado con un diseño llamativo
        color = "green" if nota_proyectada >= 5 else "red"
        st.markdown(f"""
            <div style="
                background-color: #f0f2f6;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                border: 2px solid {color};
            ">
                <h1 style="color: {color}; margin: 0;">{nota_proyectada:.2f}</h1>
                <p style="color: #666;">Nota Final Estimada</p>
            </div>
        """, unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Comparativa con pesos
        st.write("**Pesos aplicados:**")
        st.write(f"- Teoría: {p_teoria}%")
        st.write(f"- Práctica: {p_practica}%")
        st.write(f"- Informes: {p_informes}%")
        st.write(f"- Tareas: {p_tareas}%")

    st.divider()
    st.subheader("Preguntas frecuentes")
    with st.expander("¿Cómo se calcula mi nota?"):
        st.write("Tu nota es una media ponderada de cuatro bloques: Teoría, Práctica, Informes y Tareas/Actitud. Cada bloque tiene un porcentaje asignado por el docente al inicio del curso.")
    with st.expander("¿Esta nota es oficial?"):
        st.warning("No. Esta herramienta es solo para fines informativos y de simulación. Las notas oficiales son las que figuran en el boletín de evaluación entregado por el centro.")
