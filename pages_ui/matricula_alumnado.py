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

def render_matricula_alumnado(ro_pd, ro_curso, ro_global):
    st.subheader("👥 Listado de Alumnado")
    
    df_al_work = st.session_state.df_al.copy()
    
    # ── Normalizar Edad como numérico ──────────────────────────
    if "Edad" in df_al_work.columns:
        df_al_work["Edad"] = pd.to_numeric(df_al_work["Edad"], errors="coerce")
    
    # ── Columna calculada 🌸 para menores de 18 ────────────────
    df_al_work["🌸"] = False
    if "Edad" in df_al_work.columns:
        df_al_work["🌸"] = df_al_work["Edad"].fillna(99) < 18
    _n_menores = int(df_al_work["🌸"].sum())
    if _n_menores:
        st.caption(f"🌸 {_n_menores} alumno(s) menor(es) de 18 años")
    
    # ── Orden de columnas: ID, 🌸, Estado, Apellidos, Nombre, Edad, Nacimiento, resto ──
    _col_priority = ["ID", "🌸", "Estado", "Apellidos", "Nombre", "Edad", "Nacimiento"]
    _col_rest = [c for c in df_al_work.columns if c not in _col_priority]
    _col_order = [c for c in _col_priority if c in df_al_work.columns] + _col_rest
    df_al_work = df_al_work[_col_order]
    
    # ── Configuración de columnas ──────────────────────────────
    config_al = {
        "ID":     st.column_config.TextColumn("ID-AL", width="small", disabled=True, pinned=True),
        "🌸":     st.column_config.CheckboxColumn("🌸", disabled=True, width="small"),
        "Estado": st.column_config.SelectboxColumn("Estado", options=["Alta", "Baja"], default="Alta"),
        "Apellidos":   st.column_config.TextColumn("Apellidos"),
        "Nombre":      st.column_config.TextColumn("Nombre"),
        "Edad":        st.column_config.NumberColumn("Edad", min_value=0, max_value=99, step=1),
        "Nacimiento":  st.column_config.TextColumn("Fecha nacimiento"),
        "Repite":      st.column_config.CheckboxColumn("Repite"),
        "Matrícula":   st.column_config.TextColumn("Matrícula"),
        "Comentarios": st.column_config.TextColumn("Comentarios"),
        "email":       st.column_config.TextColumn("email"),
        "Móvil":       st.column_config.TextColumn("Móvil"),
    }
    
    ed_al = st.data_editor(
        df_al_work,
        column_config=config_al,
        num_rows="dynamic",
        hide_index=True,
        use_container_width=True,
        key="tabla_alumnado",
        disabled=ro_curso
    )
    
    # ── Al modificar: quitar 🌸 (calculada) y guardar ──────────
    _ed_sin_flor = ed_al.drop(columns=["🌸"], errors="ignore")
    _work_sin_flor = df_al_work.drop(columns=["🌸"], errors="ignore")
    if not _ed_sin_flor.equals(_work_sin_flor):
        st.session_state.df_al = procesar_lista_alumnado(_ed_sin_flor)
        st.rerun()
    
    
    # --- PESTAÑA: SEGUIMIENTO ---
