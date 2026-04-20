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

def render_introduccion_planes(ro_pd, ro_curso, ro_global):
    st.subheader("🏫 Centro Educativo. Equipo docente. Entorno socioeconómico")
    st.session_state.config_contexto["instalaciones"] = st.text_area("Instalaciones", st.session_state.config_contexto.get("instalaciones", ""), height=120)
    st.session_state.config_contexto["horario_lectivo"] = st.text_area("Horario lectivo", st.session_state.config_contexto.get("horario_lectivo", ""), height=120)
    st.session_state.config_contexto["equipo_docente"] = st.text_area("Equipo docente", st.session_state.config_contexto.get("equipo_docente", ""), height=120)
    st.session_state.config_contexto["entorno_socioeconomico"] = st.text_area("Entorno socioeconómico", st.session_state.config_contexto.get("entorno_socioeconomico", ""), height=120)
    
    st.divider()
    
    st.subheader("👦🏻 Alumnado. Refuerzo y atención especial en ACNEAE")
    st.session_state.config_contexto["inclusion"] = st.text_area("Inclusión", st.session_state.config_contexto.get("inclusion", ""), height=120)
    st.session_state.config_contexto["elenco_situaciones"] = st.text_area("Elenco de situaciones", st.session_state.config_contexto.get("elenco_situaciones", ""), height=120)
    st.session_state.config_contexto["circunstancias_ocultas"] = st.text_area("Circunstancias ocultas", st.session_state.config_contexto.get("circunstancias_ocultas", ""), height=120)
    
    # ── Configuración del módulo (datos de pd.json + ciclos-fp.json) ─────
    st.divider()
    st.markdown("### ⚙️ Configuración del módulo")
    st.session_state.config_contexto["metodologia"] = st.text_area(
        "Estrategias metodológicas, recursos, espacios y desdobles",
        value=st.session_state.config_contexto.get("metodologia", ""), height=150)
    _new_met = st.text_area(
        "Metodología (ej. activa, participativa, ABP)",
        value=st.session_state.config_aula.get("Metodología", ""), height=100)
    _new_div = st.text_area(
        "Atención a la diversidad (adaptaciones no significativas)",
        value=st.session_state.config_aula.get("Atención a la diversidad", ""), height=100)
    if _new_met != st.session_state.config_aula.get("Metodología") or \
       _new_div != st.session_state.config_aula.get("Atención a la diversidad"):
        st.session_state.config_aula["Metodología"] = _new_met
        st.session_state.config_aula["Atención a la diversidad"] = _new_div
    
    
    
    
    # --- PLANES E INCLUSIÓN ---
    st.subheader("🧩 Plan de Atención a la diversidad")
    st.markdown("Adaptación curricular no significativas o medidas aplicadas en el aula")
    
    with st.expander("➕ Añadir Nueva Atención a la diversidad", expanded=False):
        st.markdown("*💡 Utiliza este formulario si prefieres una introducción de datos más visual para el Plan de Atención a la diversidad.*")
        with st.form("registro_dua"):
            c1, c2 = st.columns(2)
            with c1:
                dua_alumnado = st.text_input("Alumnado o Aula")
            with c2:
                dua_barrera = st.text_input("Barrera Detectada")
            
            dua_met = st.text_area("Medida Metodológica / Org.")
            
            c3, c4 = st.columns(2)
            with c3:
                dua_acc = st.text_area("Medida de Acceso")
            with c4:
                dua_eva = st.text_area("Medida de Evaluación")
            
            if st.form_submit_button("Añadir Medida", type="primary"):
                new_id = generar_siguiente_id(st.session_state.df_dua, "DUA")
                new_row = {
                    "ID": new_id, 
                    "Alumnado_Aula": dua_alumnado, 
                    "Barrera": dua_barrera, 
                    "Medida_Metodologica": dua_met, 
                    "Medida_Acceso": dua_acc, 
                    "Medida_Evaluacion": dua_eva
                }
                st.session_state.df_dua = pd.concat([st.session_state.df_dua, pd.DataFrame([new_row])], ignore_index=True)
                st.success("Añadida correctamente.")
                st.rerun()
    
    ed_dua = st.data_editor(
        st.session_state.df_dua,
        column_config={
            "id_act": st.column_config.TextColumn("ID", disabled=True, width="small"),
            "Alumnado_Aula": st.column_config.TextColumn("Alumnado o Aula", width="medium"),
            "Barrera": st.column_config.TextColumn("Barrera Detectada", width="medium"),
            "Medida_Metodologica": st.column_config.TextColumn("Medida Metodológica / Org.", width="large"),
            "Medida_Acceso": st.column_config.TextColumn("Medida de Acceso", width="medium"),
            "Medida_Evaluacion": st.column_config.TextColumn("Medida de Evaluación", width="medium"),
        },
        num_rows="dynamic", hide_index=True, use_container_width=True, key="tabla_dua"
    )
    if len(ed_dua) > len(st.session_state.df_dua):
        ed_dua.iloc[-1, 0] = generar_siguiente_id(st.session_state.df_dua, "DUA")
    st.session_state.df_dua = ed_dua
    
    
    st.divider()
    
    st.subheader("🛡️ Plan de contingencia")
    st.markdown("Definición de actividades ante situaciones excepcionales de la clase")
    
    with st.expander("➕ Añadir Nueva Medida de Contingencia", expanded=False):
        st.markdown("*💡 Utiliza este formulario si prefieres una introducción de datos más visual para el Plan de contingencia.*")
        with st.form("registro_contingencia"):
            cont_esc = st.selectbox("Escenario", options=["Ausencia de Profesorado", "Ausencia de Alumnado", "Interrupción Generalizada", "Otros"])
            cont_org = st.text_area("Organización y Acceso")
            cont_act = st.text_area("Actividades Alternativas")
            cont_seg = st.text_input("Seguimiento y Ajustes")
            
            if st.form_submit_button("Añadir Medida", type="primary"):
                new_id = generar_siguiente_id(st.session_state.df_contingencia, "PC")
                new_row = {"ID": new_id, "Escenario": cont_esc, "Organizacion": cont_org, "Actividades": cont_act, "Seguimiento": cont_seg}
                st.session_state.df_contingencia = pd.concat([st.session_state.df_contingencia, pd.DataFrame([new_row])], ignore_index=True)
                st.success("Añadida correctamente.")
                st.rerun()
    
    ed_cont = st.data_editor(
        st.session_state.df_contingencia,
        column_config={
            "id_act": st.column_config.TextColumn("ID", disabled=True, width="small"),
            "Escenario": st.column_config.SelectboxColumn("Escenario", options=["Ausencia de Profesorado", "Ausencia de Alumnado", "Interrupción Generalizada", "Otros"], width="medium"),
            "Organizacion": st.column_config.TextColumn("Organización y Acceso", width="large"),
            "Actividades": st.column_config.TextColumn("Actividades Alternativas", width="large"),
            "Seguimiento": st.column_config.TextColumn("Seguimiento y Ajustes", width="medium"),
        },
        num_rows="dynamic", hide_index=True, use_container_width=True, key="tabla_contingencia"
    )
    if len(ed_cont) > len(st.session_state.df_contingencia):
        ed_cont.iloc[-1, 0] = generar_siguiente_id(st.session_state.df_contingencia, "PC")
    st.session_state.df_contingencia = ed_cont
    
    st.divider()
    
    st.subheader("🚌 Plan de Actividadesy Extraescolares")
    st.markdown("Programación de actividades complementarias y salidas extraescolares")
    
    lista_ra_ids = st.session_state.df_ra["id_ra"].tolist() if not st.session_state.df_ra.empty else []
    
    with st.expander("➕ Añadir Nueva Actividad (ACE)", expanded=False):
        st.markdown("*💡 Utiliza este formulario para programar la actividad escolar.*")
        with st.form("registro_ace"):
            c1, c2, c3 = st.columns([1,1,1])
            with c1:
                ace_tipo = st.selectbox("Tipo", options=["Complementaria", "Extraescolar"])
            with c2:
                ace_ra = st.selectbox("RA Vinculados", options=st.session_state.df_ra["id_ra"].tolist() if not st.session_state.df_ra.empty else [""])
            with c3:
                ace_tri = st.selectbox("Trimestre", options=["1T", "2T", "3T"])
            
            ace_act = st.text_area("Descripción de la Actividad")
            
            c4, c5 = st.columns(2)
            with c4:
                ace_ent = st.text_input("Entidad colaboradora")
            with c5:
                ace_eva = st.text_input("Actividad de Evaluación")
            
            if st.form_submit_button("Añadir Actividad", type="primary"):
                new_id = generar_siguiente_id(st.session_state.df_ace, "ACE")
                new_row = {"ID": new_id, "Tipo": ace_tipo, "RA_Vinculados": ace_ra, "Actividad": ace_act, "Trimestre": ace_tri, "Entidad": ace_ent, "Evaluacion": ace_eva}
                st.session_state.df_ace = pd.concat([st.session_state.df_ace, pd.DataFrame([new_row])], ignore_index=True)
                st.success("Añadida correctamente.")
                st.rerun()
    
    ed_ace = st.data_editor(
        st.session_state.df_ace,
        column_config={
            "id_act": st.column_config.TextColumn("ID", disabled=True, width="small"),
            "Tipo": st.column_config.SelectboxColumn("Tipo", options=["Complementaria", "Extraescolar"], width="medium"),
            "RA_Vinculados": st.column_config.SelectboxColumn("RA Vinculados", options=lista_ra_ids, width="medium"),
            "Actividad": st.column_config.TextColumn("Descripción de la Actividad", width="large"),
            "tri_act": st.column_config.SelectboxColumn("Trimestre", options=["1T", "2T", "3T"], width="small"),
            "Entidad": st.column_config.TextColumn("Entidad Colaboradora", width="medium"),
            "Evaluacion": st.column_config.TextColumn("Actividad de Evaluación", width="medium"),
        },
        num_rows="dynamic", hide_index=True, use_container_width=True, key="tabla_ace"
    )
    if len(ed_ace) > len(st.session_state.df_ace):
        ed_ace.iloc[-1, 0] = generar_siguiente_id(st.session_state.df_ace, "ACE")
    st.session_state.df_ace = ed_ace
    
    
    
    
