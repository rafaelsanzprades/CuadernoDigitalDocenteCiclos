import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
from utils_logic import calcular_notas_alumno, get_sigad_info

def render_portal_alumnado(al_id):
    st.markdown('<div class="pestaña-header"><h2>Mi Portal de Aprendizaje</h2></div>', unsafe_allow_html=True)
    
    al_data = st.session_state.df_al[st.session_state.df_al["ID"] == al_id].iloc[0]
    st.markdown(f"### Hola, {al_data['Nombre']} {al_data['Apellidos']}")
    
    # 1. Indicadores principales
    col1, col2, col3 = st.columns(3)
    
    # Encontrar notas en df_eval mediante el cálculo real
    res_cal = calcular_notas_alumno(
        al_id, 
        st.session_state.df_eval, 
        st.session_state.df_act, 
        st.session_state.df_ce, 
        st.session_state.df_ra,
        st.session_state.get("df_feoe", pd.DataFrame())
    )
    nota_final = res_cal["nota_final"]
    notas_ra_real = res_cal["notas_ra"]
    
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
        estado_txt = "En Proceso" if nota_final < 5 else "Apto"
        st.metric("Estado", estado_txt)

    st.divider()

    # 2. Desglose por Resultados de Aprendizaje (RA)
    st.subheader("🎯 Adquisición de Competencias (RA)")
    if not st.session_state.df_ra.empty:
        # Usar columnas para mostrar RAs en grid
        ra_cols = st.columns(2)
        for idx, (_, ra) in enumerate(st.session_state.df_ra.iterrows()):
            ra_id = ra["id_ra"]
            desc = ra["desc_ra"]
            n_ra = notas_ra_real.get(ra_id, 0.0)
            ra_progress = min(100, int((n_ra / 10) * 100))
            
            with ra_cols[idx % 2]:
                with st.container(border=True):
                    st.markdown(f"**{ra_id}**")
                    st.caption(f"{desc[:80]}...")
                    st.progress(ra_progress / 100, text=f"{n_ra:.2f} / 10")

    st.divider()

    # 3. Análisis Visual
    st.subheader("📊 Análisis de Rendimiento")
    
    col_chart1, col_chart2 = st.columns(2)
    
    with col_chart1:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        st.markdown("**Perfil Competencial (RA)**")
        if notas_ra_real:
            df_ra_chart = pd.DataFrame({
                "RA": list(notas_ra_real.keys()),
                "Nota": list(notas_ra_real.values())
            })
            df_ra_chart["Nota"] = df_ra_chart["Nota"].astype(float)
            st.bar_chart(df_ra_chart.set_index("RA"), horizontal=True, color="#14a085")
        else:
            st.info("Aún no hay datos de RA.")
        st.markdown('</div>', unsafe_allow_html=True)

    with col_chart2:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        st.markdown("**Evolución de Notas**")
        notas_hist = []
        if not st.session_state.df_act.empty:
            eval_row = st.session_state.df_eval[st.session_state.df_eval["ID"] == al_id]
            if not eval_row.empty:
                for _, act in st.session_state.df_act.iterrows():
                    a_id = act["id_act"]
                    if a_id in eval_row.columns:
                        nota = eval_row.iloc[0][a_id]
                        if pd.notna(nota) and nota > 0:
                            fecha = act.get("Fecha", date.today())
                            notas_hist.append({"Fecha": fecha, "Nota": float(nota)})
        
        if notas_hist:
            df_hist = pd.DataFrame(notas_hist).sort_values("Fecha")
            st.line_chart(df_hist.set_index("Fecha")["Nota"], color="#0d7377")
        else:
            st.info("Sin histórico disponible.")
        st.markdown('</div>', unsafe_allow_html=True)

    # 4. Diario de Seguimiento y Feedback (Timeline)
    st.divider()
    st.subheader("📢 Feedback y Novedades")
    
    public_notes = []
    for d_str, entry in st.session_state.daily_ledger.items():
        if entry.get("publico", False) and entry.get("seguimiento"):
            try:
                d_obj = datetime.strptime(d_str, "%d/%m/%Y")
                public_notes.append({"Fecha": d_obj, "FechaStr": d_str, "Nota": entry["seguimiento"]})
            except: continue
    
    if public_notes:
        public_notes.sort(key=lambda x: x["Fecha"], reverse=True)
        for item in public_notes:
            st.markdown(f"""
                <div class="timeline-item">
                    <div class="timeline-date">{item['FechaStr']}</div>
                    <div class="timeline-content">
                        {item['Nota']}
                    </div>
                </div>
            """, unsafe_allow_html=True)
    else:
        st.info("No hay feedback público por el momento.")

@st.fragment
def render_simulador_notas(al_id):
    st.markdown('<div class="pestaña-header"><h2>Simulador de Calificaciones</h2></div>', unsafe_allow_html=True)
    st.markdown("Experimenta con tus notas para proyectar tu resultado final.")

    if st.session_state.df_act.empty:
        st.warning("No hay actividades para simular.")
        return

    eval_row = st.session_state.df_eval[st.session_state.df_eval["ID"] == al_id]
    if eval_row.empty:
        st.error("Datos no encontrados.")
        return

    sim_vals = {}
    
    # Tabs para trimestres con diseño limpio
    t1, t2, t3 = st.tabs(["📌 1º Trimestre", "📌 2º Trimestre", "📌 3º Trimestre"])
    
    with t1: render_sim_tab(al_id, eval_row, "1T", sim_vals)
    with t2: render_sim_tab(al_id, eval_row, "2T", sim_vals)
    with t3: render_sim_tab(al_id, eval_row, "3T", sim_vals)

    # Calcular resultado proyectado
    res_sim = calcular_notas_alumno(
        al_id, 
        st.session_state.df_eval, 
        st.session_state.df_act, 
        st.session_state.df_ce, 
        st.session_state.df_ra,
        st.session_state.df_feoe,
        overrides=sim_vals
    )
    nota_f = res_sim["nota_final"]
    n_int, sigad_cod, sigad_txt, sigad_col = get_sigad_info(nota_f)

    st.divider()
    
    # Resultado con estilo premium
    res_col1, res_col2 = st.columns([1, 2])
    
    with res_col1:
        st.markdown(f"""
            <div style="background: var(--primary-gradient); padding: 40px; border-radius: 20px; text-align: center; color: white; box-shadow: 0 10px 30px rgba(20,160,133,0.3);">
                <div style="font-size: 0.9rem; opacity: 0.9; text-transform: uppercase; letter-spacing: 2px;">Nota Proyectada</div>
                <div style="font-size: 5rem; font-weight: 800; margin: 10px 0;">{nota_f:.2f}</div>
                <div style="font-size: 1.6rem; font-weight: 600;">{sigad_txt}</div>
                <div style="font-size: 1rem; opacity: 0.7;">({sigad_cod})</div>
            </div>
        """, unsafe_allow_html=True)

    with res_col2:
        st.markdown('<div class="glass-card" style="height: 100%;">', unsafe_allow_html=True)
        st.markdown("#### Impacto en Competencias")
        if res_sim["notas_ra"]:
            df_ra_sim = pd.DataFrame({
                "RA": list(res_sim["notas_ra"].keys()),
                "Nota": [float(v) for v in res_sim["notas_ra"].values()]
            })
            st.bar_chart(df_ra_sim.set_index("RA"), horizontal=True, color="#14a085")
        st.markdown('</div>', unsafe_allow_html=True)

def render_sim_tab(al_id, eval_row, tri_key, sim_vals):
    col_tri = "tri_act" if "tri_act" in st.session_state.df_act.columns else "Trimestre"
    df_act_tri = st.session_state.df_act[st.session_state.df_act[col_tri] == tri_key]
    
    if df_act_tri.empty:
        st.write("No hay actividades registradas.")
        return

    cols = st.columns(2)
    for i, (_, act) in enumerate(df_act_tri.iterrows()):
        a_id = act["id_act"]
        a_nombre = act.get("desc_act", act.get("Actividad", a_id))
        val_actual = float(eval_row.iloc[0].get(a_id, 0.0))
        
        with cols[i % 2]:
            clean_id = str(a_id) if pd.notna(a_id) else f"nan_{i}"
            sim_vals[a_id] = st.slider(
                f"{a_nombre}", 0.0, 10.0, val_actual, 0.1, 
                key=f"sim_{tri_key}_{clean_id}_{i}"
            )


    st.divider()
    st.subheader("Preguntas frecuentes")
    with st.expander("¿Cómo se calcula mi nota?"):
        st.write("Tu nota es una media ponderada de cuatro bloques: Teoría, Práctica, Informes y Tareas/Actitud. Cada bloque tiene un porcentaje asignado por el docente al inicio del curso.")
    with st.expander("¿Esta nota es oficial?"):
        st.warning("No. Esta herramienta es solo para fines informativos y de simulación. Las notas oficiales son las que figuran en el boletín de evaluación entregado por el centro.")
