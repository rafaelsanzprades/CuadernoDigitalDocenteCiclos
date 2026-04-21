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

def render_instrumentos(ro_pd, ro_curso, ro_global):
    st.subheader("🛠️ Instrumentos de evaluación y/o Actividades")
    st.markdown("Define las tareas, exámenes y registros de observación, y vincula qué Criterios de Evaluación califican.")
    
    if st.session_state.df_ce.empty:
        st.warning("⚠️ Primero añade Criterios de evaluación en la pestaña 'Matrices RA → CE → UD'.")
    else:
        df_ce_clean = st.session_state.df_ce.dropna(subset=["id_ce"])
        df_ce_clean = df_ce_clean[df_ce_clean["id_ce"].str.strip() != ""]
        lista_ce_ids = df_ce_clean["id_ce"].tolist()
    
        with st.expander("➕ Añadir nuevo Instrumento y/o Actividad", expanded=False):
            st.markdown("*💡 Utiliza este formulario si prefieres una introducción de datos más visual para añadir Actividades en lugar de escribir directamente en la tabla inferior.*")
            with st.form("form_nuevo_act"):
                c_a1, c_a2, c_a3 = st.columns([1, 2, 3])
                with c_a1:
                    f_tri = st.selectbox("Trimestre", options=["1T", "2T", "3T"])
                with c_a2:
                    f_tipo = st.selectbox("Tipo", options=["Teoria", "Practica", "Informes", "Tareas"])
                with c_a3:
                    f_id_act = st.text_input("ID-IA", value=f"ACT{(len(st.session_state.df_act)+1):02d}" if not st.session_state.df_act.empty else "ACT01")
                    
                f_desc_act = st.text_area("Instrumentos y/o Actividades", height=80)
                
                submit_act = st.form_submit_button("Añadir Instrumento y/o Actividad", type="primary")
                if submit_act:
                    if f_desc_act.strip() == "":
                        st.error("La descripción es obligatoria.")
                    else:
                        nueva_act = {
                            "id_act": f_id_act,
                            "tri_act": f_tri,
                            "Tipo": f_tipo,
                            "desc_act": f_desc_act,
                            "ce_vinc": "",
                            "peso_act": 0.0,
                            "crit_calif": "",
                            "is_active": True
                        }
                        st.session_state.df_act = pd.concat([st.session_state.df_act, pd.DataFrame([nueva_act])], ignore_index=True)
                        st.rerun()
    
        columnas_config_act_base = {
            "id_act":    st.column_config.TextColumn("ID-IA", disabled=True, width="small", pinned=True),
            "Tipo":      st.column_config.SelectboxColumn("Tipo", options=["Teoria", "Practica", "Informes", "Tareas"], width="medium"),
            "desc_act":  st.column_config.TextColumn("Instrumento / Actividad"),
            "peso_act":  st.column_config.NumberColumn("% Pond.", min_value=0, max_value=100, step=1, width="small"),
            "is_active": st.column_config.CheckboxColumn("✓", width="small"),
        }
        for ce in lista_ce_ids:
            columnas_config_act_base[ce] = st.column_config.CheckboxColumn(ce, default=False, width="small")
    
        # Asegurar columnas en df_act
        cols_base = ["id_act", "tri_act", "Tipo", "desc_act", "peso_act", "is_active", "crit_calif"]
        for col in cols_base:
            if col not in st.session_state.df_act.columns:
                st.session_state.df_act[col] = "" if col not in ("peso_act", "is_active") else (0.0 if col == "peso_act" else True)
        for ce in lista_ce_ids:
            if ce not in st.session_state.df_act.columns:
                st.session_state.df_act[ce] = False
    
        cols_finales = ["id_act", "tri_act", "Tipo", "desc_act", "peso_act", "is_active", "crit_calif"] + lista_ce_ids
        st.session_state.df_act = st.session_state.df_act.reindex(columns=cols_finales, fill_value=False)
    
        # ── Expanders por trimestre ────────────────────────────────
        cols_display = ["id_act", "Tipo", "desc_act", "peso_act", "is_active"] + lista_ce_ids
        trimestres = [("1T", "1er Trimestre"), ("2T", "2º Trimestre"), ("3T", "3er Trimestre")]
        df_act_nuevo = []
        _changed_act = False
    
        for tri_key, tri_nombre in trimestres:
            _mask_tri = st.session_state.df_act["tri_act"].astype(str).str.upper() == tri_key
            _df_tri = st.session_state.df_act[_mask_tri].copy().reset_index(drop=True)
            _n_act  = len(_df_tri)
            _suma_p = pd.to_numeric(_df_tri["peso_act"], errors="coerce").fillna(0).sum()
            _label  = f"📋 {tri_nombre}  ·  {_n_act} actividades  ·  Σ {_suma_p:.0f}%"
    
            with st.expander(_label, expanded=False):
                _df_disp = _df_tri[cols_display]
                _ed = st.data_editor(
                    _df_disp,
                    column_config=columnas_config_act_base,
                    num_rows="dynamic",
                    hide_index=True,
                    use_container_width=True,
                    key=f"tabla_act_{tri_key}",
                    disabled=ro_pd
                )
                # Detectar cambios
                if not _ed.reset_index(drop=True).equals(_df_tri[cols_display].reset_index(drop=True)):
                    _changed_act = True
    
                # Auto-asignar nuevas filas: generar ID y tri_act
                _ed_save = _ed.copy()
                _ed_save["tri_act"] = tri_key
                # Generar IDs para filas nuevas (vacías)
                _ids_existentes = [r for r in st.session_state.df_act["id_act"].tolist() if r]
                for idx in _ed_save.index:
                    if not str(_ed_save.at[idx, "id_act"]).strip():
                        _next_n = len(_ids_existentes) + 1
                        _new_id = f"ACT{_next_n:02d}"
                        while _new_id in _ids_existentes:
                            _next_n += 1
                            _new_id = f"ACT{_next_n:02d}"
                        _ed_save.at[idx, "id_act"] = _new_id
                        _ids_existentes.append(_new_id)
    
                _ed_save["crit_calif"] = _df_tri["crit_calif"].values[:len(_ed_save)] if len(_ed_save) <= len(_df_tri) else ""
                _ed_save = _ed_save.reindex(columns=cols_finales, fill_value=False)
                df_act_nuevo.append(_ed_save)
    
        # Filas sin trimestre asignado
        _sin_tri = st.session_state.df_act[~st.session_state.df_act["tri_act"].astype(str).str.upper().isin(["1T","2T","3T"])].copy()
        if not _sin_tri.empty:
            df_act_nuevo.append(_sin_tri.reindex(columns=cols_finales, fill_value=False))
    
        if _changed_act:
            st.session_state.df_act = pd.concat(df_act_nuevo, ignore_index=True) if df_act_nuevo else st.session_state.df_act.iloc[0:0]
    
    
    # --- PESTAÑA: FEOE ---
