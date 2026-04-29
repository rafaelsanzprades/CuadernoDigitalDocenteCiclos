import streamlit as st
import pandas as pd
import numpy as np

def render_analiticas(ro_pd, ro_curso, ro_global):
    st.markdown('<div class="pestaña-header"><h2>Análisis de Rendimiento Grupal</h2></div>', unsafe_allow_html=True)
    st.markdown("Estadísticas detalladas del progreso del curso.")

    if st.session_state.df_eval.empty:
        st.warning("No hay datos de evaluación cargados.")
        return

    # 1. Preparar datos
    df = st.session_state.df_eval.copy()
    df["Nota_Final"] = pd.to_numeric(df["Nota_Final"], errors="coerce").fillna(0.0)
    ids_activos = st.session_state.df_al[st.session_state.df_al.get("Estado", "") != "Baja"]["ID"].tolist()
    df = df[df["ID"].isin(ids_activos)]

    if df.empty:
        st.info("No hay alumnos activos para analizar.")
        return

    # 2. Métricas de Resumen en Grid
    media_grupal = df["Nota_Final"].mean()
    aprobados = df[df["Nota_Final"] >= 5].shape[0]
    total = df.shape[0]
    tasa_aprobado = (aprobados / total * 100) if total > 0 else 0
    desv_tipica = df["Nota_Final"].std()

    m_col1, m_col2, m_col3, m_col4 = st.columns(4)
    m_col1.metric("Media Grupal", f"{media_grupal:.2f}")
    m_col2.metric("% Aprobados", f"{tasa_aprobado:.1f}%")
    m_col3.metric("Nº Alumnos", total)
    m_col4.metric("Cohesión (Desv.)", f"{desv_tipica:.2f}")

    st.divider()

    # 3. Gráficos Principales en Glass Cards
    col_g1, col_g2 = st.columns(2)

    with col_g1:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        st.markdown("#### Distribución de Calificaciones")
        bins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.1]
        labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", "9-10"]
        df["rango"] = pd.cut(df["Nota_Final"], bins=bins, labels=labels, right=False)
        dist = df["rango"].value_counts().sort_index()
        st.bar_chart(dist, color="#14a085")
        st.markdown('</div>', unsafe_allow_html=True)

    with col_g2:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        st.markdown("#### Rendimiento por Competencia (RA)")
        ra_cols = [c for c in df.columns if c.startswith("RA") and c != "RA_CE"]
        if ra_cols:
            ra_means = {c: pd.to_numeric(df[c], errors="coerce").mean() for c in ra_cols}
            df_ra_means = pd.DataFrame({
                "RA": list(ra_means.keys()),
                "Media": list(ra_means.values())
            })
            st.bar_chart(df_ra_means.set_index("RA"), horizontal=True, color="#0d7377")
        else:
            st.info("No se han detectado RAs.")
        st.markdown('</div>', unsafe_allow_html=True)

    st.divider()

    # 4. Alertas y Seguimiento con Badges
    st.subheader("⚠️ Seguimiento de Riesgo Académico")
    risks = df[df["Nota_Final"] < 5].copy()
    
    if not risks.empty:
        risks = risks.merge(st.session_state.df_al[["ID", "Nombre", "Apellidos"]], on="ID")
        risks["Alumno"] = risks["Apellidos"] + ", " + risks["Nombre"]
        
        # Categorizar riesgo
        def get_risk_level(n):
            if n < 3: return "🔴 Muy Alto"
            if n < 4: return "🟠 Alto"
            return "🟡 Moderado"
        
        risks["Nivel de Riesgo"] = risks["Nota_Final"].apply(get_risk_level)
        
        st.error(f"Se han detectado {len(risks)} alumnos con rendimiento insuficiente.")
        st.dataframe(
            risks[["Alumno", "Nota_Final", "Nivel de Riesgo"]].sort_values("Nota_Final"),
            column_config={
                "Nota_Final": st.column_config.NumberColumn("Nota Proyectada", format="%.2f"),
                "Nivel de Riesgo": st.column_config.TextColumn("Riesgo")
            },
            hide_index=True,
            use_container_width=True
        )
    else:
        st.success("¡Excelente! No hay alumnos en riesgo según la proyección actual.")

