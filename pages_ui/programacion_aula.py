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

def render_programacion_aula(ro_pd, ro_curso, ro_global):
    st.subheader("📚 Programación de aula")
    st.markdown("Diseña y estructura las sesiones para cada Unidad Didáctica, definiendo la tipología, RA/CE asociados, contenidos y recursos.")
    
    # ── Asegurar columna id_ud en df_sesiones ─────────────────
    if "id_ud" not in st.session_state.df_sesiones.columns:
        st.session_state.df_sesiones["id_ud"] = ""
    # ── Migrar Num_Sesion → Num_Orden (compatibilidad) ─────────
    if "Num_Sesion" in st.session_state.df_sesiones.columns and "Num_Orden" not in st.session_state.df_sesiones.columns:
        st.session_state.df_sesiones = st.session_state.df_sesiones.rename(columns={"Num_Sesion": "Num_Orden"})
    if "Horas" not in st.session_state.df_sesiones.columns:
        st.session_state.df_sesiones["Horas"] = 1
    
    
    _uds_prog = st.session_state.df_ud[["id_ud", "desc_ud"]].copy() if not st.session_state.df_ud.empty else pd.DataFrame(columns=["id_ud","desc_ud"])
    _lista_uds_prog = _uds_prog["id_ud"].tolist()
    
    # ── Formulario añadir sesión (ahora con selector de UD) ───
    with st.expander("➕ Añadir Nueva Sesión", expanded=False):
        with st.form("registro_sesion"):
            fc1, fc2, fc3, fc4 = st.columns([2, 2, 1, 1])
            with fc1:
                ud_sel = st.selectbox("Unidad Didáctica", options=_lista_uds_prog if _lista_uds_prog else ["Sin UD"])
            with fc2:
                tipo_act = st.selectbox("Tipo de Actividad", options=["Tª (Teoría)", "Pª (Práctica)", "IE (Instrumento de Evaluación)", "Pª+ (Ampliación/Refuerzo)"])
            with fc3:
                num_orden = st.number_input("Νº Orden", min_value=1, step=1, value=len(st.session_state.df_sesiones)+1)
            with fc4:
                horas_ses = st.number_input("Horas", min_value=1, step=1, value=1)
            ra_ce_input = st.text_input("RA / CE vinculados", placeholder="Ej: RA1, CE1.a")
            c4, c5 = st.columns(2)
            with c4:
                contenidos_input = st.text_area("Contenidos / Descripción", placeholder="Ej: Preparación del taller, Examen teórico...", height=80)
            with c5:
                aspectos_input = st.text_area("Aspectos Clave", placeholder="Ej: Seguridad e higiene, Conceptos básicos...", height=80)
            recursos_input = st.text_input("Recursos", placeholder="Ej: Aula Taller, Proyector, Herramienta X...")
            if st.form_submit_button("➕ Añadir Sesión", type="primary", use_container_width=True):
                new_ses_id = generar_siguiente_id(st.session_state.df_sesiones, "SES")
                new_session = {
                    "ID": new_ses_id, "id_ud": ud_sel,
                    "Num_Orden": num_orden, "Horas": horas_ses, "Tipo_Actividad": tipo_act,
                    "RA_CE": ra_ce_input, "Contenidos": contenidos_input,
                    "Aspectos_Clave": aspectos_input, "Recursos": recursos_input
                }
                st.session_state.df_sesiones = pd.concat([st.session_state.df_sesiones, pd.DataFrame([new_session])], ignore_index=True)
                st.rerun()
    
    # ── Config columnas sesiones ───────────────────────────────
    _col_cfg_ses = {
        "ID":             st.column_config.TextColumn("ID", disabled=True, width="small"),
        "Num_Orden":      st.column_config.NumberColumn("Nº Orden", min_value=1, step=1, width="small"),
        "Horas":          st.column_config.NumberColumn("Horas", min_value=1, step=1, width="small"),
        "Tipo_Actividad": st.column_config.SelectboxColumn("Tipo", options=["Tª (Teoría)", "Pª (Práctica)", "IE (Instrumento de Evaluación)", "Pª+ (Ampliación/Refuerzo)"], width="medium"),
        "RA_CE":          st.column_config.TextColumn("RA/CE", width="small"),
        "Contenidos":     st.column_config.TextColumn("Contenidos", width="large"),
        "Aspectos_Clave": st.column_config.TextColumn("Aspectos Clave", width="medium"),
        "Recursos":       st.column_config.TextColumn("Recursos", width="medium"),
    }
    _cols_ses_disp = ["ID", "Num_Orden", "Horas", "Tipo_Actividad", "RA_CE", "Contenidos", "Aspectos_Clave", "Recursos"]
    
    # ── Expanders por UD ───────────────────────────────────────
    st.markdown("### 📋 Secuenciación de Unidades didácticas")
    _df_ses_changed = False
    _df_ses_nuevo = []
    
    # UDs con sesiones + UDs definidas (en orden de df_ud)
    _uds_con_sesiones = st.session_state.df_sesiones["id_ud"].dropna().unique().tolist()
    _uds_en_orden = _lista_uds_prog + [u for u in _uds_con_sesiones if u not in _lista_uds_prog and str(u).strip()]
    
    for _ud_id in _uds_en_orden:
        _ud_info = _uds_prog[_uds_prog["id_ud"] == _ud_id]
        _ud_desc = _ud_info["desc_ud"].values[0] if not _ud_info.empty else ""
        _mask_ud = st.session_state.df_sesiones["id_ud"].astype(str) == str(_ud_id)
        _df_ud_ses = st.session_state.df_sesiones[_mask_ud].sort_values("Num_Orden").reset_index(drop=True)
        _n_ses = len(_df_ud_ses)
        _h_ses = int(pd.to_numeric(_df_ud_ses["Horas"], errors="coerce").fillna(0).sum()) if not _df_ud_ses.empty and "Horas" in _df_ud_ses.columns else 0
        _label_ud = f"📋 {_ud_id} ({_n_ses} ses | {_h_ses}h)" + (f" {_ud_desc}" if _ud_desc else "")
    
        with st.expander(_label_ud, expanded=False):
            if _df_ud_ses.empty:
                st.caption("Sin sesiones. Usa el formulario de arriba para añadir.")
            else:
                _df_disp_ud = _df_ud_ses[[c for c in _cols_ses_disp if c in _df_ud_ses.columns]]
                _ed_ud = st.data_editor(
                    _df_disp_ud,
                    column_config=_col_cfg_ses,
                    num_rows="dynamic",
                    hide_index=True,
                    use_container_width=True,
                    key=f"tabla_ses_{_ud_id}",
                    disabled=ro_pd
                )
                if not _ed_ud.reset_index(drop=True).equals(_df_disp_ud.reset_index(drop=True)):
                    _df_ses_changed = True
                _ed_save = _ed_ud.copy()
                _ed_save["id_ud"] = _ud_id
                _df_ses_nuevo.append(_ed_save)
    
    # Sesiones sin UD asignada
    _sin_ud = st.session_state.df_sesiones[
        ~st.session_state.df_sesiones["id_ud"].astype(str).isin([str(u) for u in _uds_en_orden])
    ].copy()
    if not _sin_ud.empty:
        _h_sin = int(pd.to_numeric(_sin_ud["Horas"], errors="coerce").fillna(0).sum()) if "Horas" in _sin_ud.columns else 0
        with st.expander(f"📋 Sin UD asignada ({len(_sin_ud)} ses | {_h_sin}h)", expanded=False):
            _ed_sin = st.data_editor(_sin_ud[[c for c in _cols_ses_disp if c in _sin_ud.columns]], column_config=_col_cfg_ses, num_rows="dynamic", hide_index=True, use_container_width=True, key="tabla_ses_sin_ud", disabled=ro_pd)
            if not _ed_sin.reset_index(drop=True).equals(_sin_ud[[c for c in _cols_ses_disp if c in _sin_ud.columns]].reset_index(drop=True)):
                _df_ses_changed = True
            _ed_sin["id_ud"] = ""
            _df_ses_nuevo.append(_ed_sin)
    
    if _df_ses_changed and _df_ses_nuevo:
        st.session_state.df_sesiones = pd.concat(_df_ses_nuevo, ignore_index=True)
        # Limpiar el estado de los widgets para que se reordenen según el nuevo orden
        for k in list(st.session_state.keys()):
            if k.startswith("tabla_ses_"):
                del st.session_state[k]
        st.rerun()
    
    
    st.divider()
    
    st.subheader("🎯 Diseño de Tareas Competenciales (TC)")
    st.markdown("Define retos o productos integrados que evalúan varios Resultados de Aprendizaje de forma globalizada.")
    
    ed_tar = st.data_editor(
        st.session_state.df_tareas,
        column_config={
            "id_act": st.column_config.TextColumn("ID", disabled=True, width="small"),
            "Nombre_Tarea": st.column_config.TextColumn("Título de la Tarea", width="medium"),
            "Reto": st.column_config.TextColumn("Contexto Productivo y Reto", width="large"),
            "RA_Asociados": st.column_config.TextColumn("RA y CE Relacionados", width="medium"),
            "desc_act": st.column_config.TextColumn("Instrumento de Calificación", width="medium"),
        },
        num_rows="dynamic", hide_index=True, use_container_width=True, key="tabla_tareas"
    )
    if len(ed_tar) > len(st.session_state.df_tareas):
        ed_tar.iloc[-1, 0] = generar_siguiente_id(st.session_state.df_tareas, "TC")
    st.session_state.df_tareas = ed_tar
    
    with st.expander("➕ Añadir Nueva Tarea Competencial", expanded=False):
        st.markdown("*💡 Utiliza este formulario si prefieres una introducción de datos más visual y guiada en lugar de escribir directamente en la tabla.*")
        with st.form("registro_tc"):
            c1, c2 = st.columns(2)
            with c1:
                tc_nombre = st.text_input("Título de la Tarea")
            with c2:
                tc_ra = st.text_input("RA y CE Relacionados")
            tc_reto = st.text_area("Contexto Productivo y Reto")
            tc_inst = st.text_input("Instrumento de Calificación")
            
            if st.form_submit_button("Añadir Tarea", type="primary"):
                new_id = generar_siguiente_id(st.session_state.df_tareas, "TC")
                new_row = {"ID": new_id, "Nombre_Tarea": tc_nombre, "Reto": tc_reto, "RA_Asociados": tc_ra, "Instrumento": tc_inst}
                st.session_state.df_tareas = pd.concat([st.session_state.df_tareas, pd.DataFrame([new_row])], ignore_index=True)
                st.success("Añadida correctamente.")
                st.rerun()
    
