import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
import json
import os
import calendar
from utils_logic import *
from utils_ui import badge
from schemas import *

def render_calificacion_feoe(ro_pd, ro_curso, ro_global):
    c_f1, c_f2 = st.columns([4, 1])
    with c_f1:
        st.subheader("🏢 Evaluación en Empresa (FEOE)")
    with c_f2:
        if st.button("💾 Guardar Cambios", use_container_width=True, type="primary"):
            from storage_manager import guardar_curso
            guardar_curso(st.session_state.active_curso)
            st.toast("✅ Calificaciones FEOE guardadas", icon="💾")
    st.write("")
    st.caption("Introduce la calificación del tutor de empresa (1-4) para cada Resultado de Aprendizaje Dualizado.")
    
    ras_dualizados = []
    if not st.session_state.df_ra.empty and "is_dual" in st.session_state.df_ra.columns:
        ras_dualizados = st.session_state.df_ra[st.session_state.df_ra["is_dual"] == True]["id_ra"].tolist()
        
    if not ras_dualizados:
        st.warning("⚠️ No hay ningún Resultado de Aprendizaje marcado como 'Dualizado' (FEOE) en la pestaña 'Módulo didáctico'.")
    elif st.session_state.df_al.empty:
        st.info("No hay alumnado registrado con estado 'Alta'.")
    else:
        ids_alumnos = st.session_state.df_al["ID"].tolist()
        if "ID" not in st.session_state.df_feoe.columns:
            st.session_state.df_feoe["ID"] = ids_alumnos
        st.session_state.df_feoe = st.session_state.df_feoe[st.session_state.df_feoe["ID"].isin(ids_alumnos)]
        
        exist_ids = st.session_state.df_feoe["ID"].tolist()
        nuevos = [{"ID": a_id} for a_id in ids_alumnos if a_id not in exist_ids]
        if nuevos:
            st.session_state.df_feoe = pd.concat([st.session_state.df_feoe, pd.DataFrame(nuevos)], ignore_index=True)
            
        for ra_id in ras_dualizados:
            if ra_id not in st.session_state.df_feoe.columns:
                st.session_state.df_feoe[ra_id] = 0.0
                
        cols_b = ["ID"]
        cols_drop = [c for c in st.session_state.df_feoe.columns if c not in ras_dualizados and c not in cols_b]
        if cols_drop:
            st.session_state.df_feoe = st.session_state.df_feoe.drop(columns=cols_drop)
    
        df_al_feoe = st.session_state.df_al[["ID", "Apellidos", "Nombre"]].copy()
        df_al_feoe["Alumno"] = df_al_feoe["Apellidos"] + ", " + df_al_feoe["Nombre"]
        df_feoe_disp = pd.merge(st.session_state.df_feoe, df_al_feoe[["ID", "Alumno"]], on="ID", how="left")
        
        cols_disp = ["ID", "Alumno"] + ras_dualizados
        df_feoe_disp = df_feoe_disp[cols_disp]
        
        col_cfg = {
            "ID": st.column_config.TextColumn(disabled=True, width="small"),
            "Alumno": st.column_config.TextColumn(disabled=True, width="large"),
        }
        for ra in ras_dualizados:
            col_cfg[ra] = st.column_config.NumberColumn(f"{ra} (1-4)", min_value=0.0, max_value=4.0, step=1.0, width="small")
            
        st.markdown("**Calificaciones de la empresa:**\n* `0`: Sin evaluar\n* `1`: No Superado\n* `2`: Superado (Suficiente)\n* `3`: Bien/Notable\n* `4`: Excelente")
        
        ed_feoe = st.data_editor(
            df_feoe_disp,
            column_config=col_cfg,
            hide_index=True,
            use_container_width=True,
            key="tabla_feoe"
        )
        
        for ra in ras_dualizados:
            st.session_state.df_feoe[ra] = ed_feoe[ra]
    
    # --- PESTAÑA: EVALUACIÓN ---
