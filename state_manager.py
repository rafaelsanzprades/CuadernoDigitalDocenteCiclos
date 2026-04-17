import streamlit as st
import pandas as pd
from datetime import datetime, date
from schemas import df_ra_empty, df_ud_empty, df_ce_empty, df_act_empty

def inicializar_estado():
    if 'menu' not in st.session_state:
        st.session_state.menu = "Módulo didáctico"

    if 'info_modulo' not in st.session_state:
        st.session_state.info_modulo = {
            "modulo": "", 
            "curso": "1º",
            "centro": "", 
            "profesorado": "", 
            "h_boa": 0, 
            "h_sem": 0, 
            "p_ev": 15, 
            "pond_1t": 33, 
            "pond_2t": 33, 
            "pond_3t": 34
        }

    if 'info_fechas' not in st.session_state:
        st.session_state.info_fechas = {
            "ini_curso": date(datetime.now().year, 9, 1),
            "fin_curso": date(datetime.now().year + 1, 6, 30),
            "ini_1t": date(datetime.now().year, 9, 15), 
            "fin_1t": date(datetime.now().year, 11, 30), 
            "ini_2t": date(datetime.now().year, 12, 1), 
            "fin_2t": date(datetime.now().year + 1, 3, 15), 
            "ini_3t": date(datetime.now().year + 1, 3, 16), 
            "fin_3t": date(datetime.now().year + 1, 6, 15),
            "ini_feoe": date(datetime.now().year + 1, 3, 16), 
            "fin_feoe": date(datetime.now().year + 1, 6, 15), 
            "h_sem_feoe": 8
        }

    if 'horario' not in st.session_state:
        st.session_state.horario = {"Lun": 0, "Mar": 0, "Mié": 0, "Jue": 0, "Vie": 0}
    if 'calendar_notes' not in st.session_state:
        st.session_state.calendar_notes = {}
    if 'df_ra' not in st.session_state:
        st.session_state.df_ra = df_ra_empty()
    else:
        if "Dualizado" not in st.session_state.df_ra.columns:
            st.session_state.df_ra["is_dual"] = False
    if 'df_ud' not in st.session_state:
        st.session_state.df_ud = df_ud_empty()
    if 'df_pr' not in st.session_state:
        st.session_state.df_pr = pd.DataFrame(columns=["ID", "Práctica"])
    if 'df_al' not in st.session_state:
        st.session_state.df_al = pd.DataFrame(columns=["ID", "Estado", "Apellidos", "Nombre", "Nacimiento", "Repite", "Matrícula", "Edad", "Comentarios", "email", "Móvil"])

    if 'df_ce' not in st.session_state:
        st.session_state.df_ce = df_ce_empty()

    if 'df_act' not in st.session_state:
        st.session_state.df_act = df_act_empty()

    if 'df_feoe' not in st.session_state:
        st.session_state.df_feoe = pd.DataFrame(columns=["ID"])

    if 'df_eval' not in st.session_state:
        st.session_state.df_eval = pd.DataFrame(columns=[
            "ID", 
            "1T_Teoria", "1T_Practica", "1T_Informes", "1T_Cuaderno", "1T_Nota",
            "2T_Teoria", "2T_Practica", "2T_Informes", "2T_Cuaderno", "2T_Nota",
            "3T_Teoria", "3T_Practica", "3T_Informes", "3T_Cuaderno", "3T_Nota",
            "Nota_Final"
        ])

    if 'df_sgmt' not in st.session_state:
        st.session_state.df_sgmt = pd.DataFrame()

    if 'daily_ledger' not in st.session_state:
        st.session_state.daily_ledger = {}

    if 'planning_ledger' not in st.session_state:
        st.session_state.planning_ledger = {}

    if 'config_aula' not in st.session_state:
        st.session_state.config_aula = {"Metodología": "", "Atención a la diversidad": ""}

    if 'df_sesiones' not in st.session_state:
        st.session_state.df_sesiones = pd.DataFrame(columns=[
            "ID", "Num_Orden", "Horas", "Tipo_Actividad", "RA_CE", "Contenidos", "Aspectos_Clave", "Recursos"
        ])

    if 'config_contexto' not in st.session_state:
        st.session_state.config_contexto = {"entorno": "", "perfil": "", "metodologia": ""}
    if 'df_dua' not in st.session_state:
        st.session_state.df_dua = pd.DataFrame(columns=["ID", "Barrera", "Medida_Metodologica", "Medida_Acceso", "Medida_Evaluacion", "Alumnado_Aula"])
    if 'df_contingencia' not in st.session_state:
        st.session_state.df_contingencia = pd.DataFrame(columns=["ID", "Escenario", "Organizacion", "Actividades", "Seguimiento"])
    if 'df_ace' not in st.session_state:
        st.session_state.df_ace = pd.DataFrame(columns=["ID", "Tipo", "RA_Vinculados", "Actividad", "Trimestre", "Entidad", "Evaluacion"])
    if 'df_tareas' not in st.session_state:
        st.session_state.df_tareas = pd.DataFrame(columns=["ID", "Nombre_Tarea", "Reto", "RA_Asociados", "Instrumento"])

    # --- MEJORA #9: Modo solo lectura por bloque ---
    if 'lock_pd' not in st.session_state:
        st.session_state.lock_pd = False
    if 'lock_curso' not in st.session_state:
        st.session_state.lock_curso = False
    if 'lock_global' not in st.session_state:
        st.session_state.lock_global = False

    # --- MEJORA #1: Estado de autoguardado ---
    if 'autosave_last' not in st.session_state:
        st.session_state.autosave_last = datetime.now()
    if 'autosave_interval_min' not in st.session_state:
        st.session_state.autosave_interval_min = 5  # minutos
    if 'autosave_msg' not in st.session_state:
        st.session_state.autosave_msg = None
