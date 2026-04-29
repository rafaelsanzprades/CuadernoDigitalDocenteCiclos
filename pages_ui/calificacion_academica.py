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

def render_calificacion_academica(ro_pd, ro_curso, ro_global):
    st.subheader("📊 Evaluación Competencial Jerárquica")
    st.caption("Introduce las notas de las actividades; el sistema calculará la nota de los CE, RA y la Nota Final automáticamente.")
    
    if st.session_state.df_act.empty or st.session_state.df_ce.empty:
        st.warning("⚠️ Primero define Criterios de Evaluación y Actividades/Instrumentos.")
    elif st.session_state.df_al.empty:
        st.info("No hay alumnos activos registrados. Por favor, a\u00f1ade alumnos con estado 'Alta' en la pesta\u00f1a 'Alumnado'.")
    else:
        # Botón de guardado manual rápido
        c_sav1, c_sav2 = st.columns([4, 1])
        with c_sav2:
            if st.button("💾 Guardar Cambios", use_container_width=True, type="primary"):
                from storage_manager import guardar_curso
                guardar_curso(st.session_state.active_curso)
                st.toast("✅ Cambios guardados correctamente", icon="💾")
        st.write("")
        # 1. Sincronizar df_eval con df_al
        ids_alumnado = st.session_state.df_al["ID"].tolist()
        st.session_state.df_eval = st.session_state.df_eval[st.session_state.df_eval["ID"].isin(ids_alumnado)]
        ids_eval = st.session_state.df_eval["ID"].tolist()
        nuevos_alumnos = []
        for _, row in st.session_state.df_al.iterrows():
            if row["ID"] not in ids_eval:
                nuevo = {"ID": row["ID"], "Nota_Final": 0.0}
                nuevos_alumnos.append(nuevo)
        if nuevos_alumnos:
            st.session_state.df_eval = pd.concat([st.session_state.df_eval, pd.DataFrame(nuevos_alumnos)], ignore_index=True)
    
        # 2. Asegurar que las actividades existen como columnas
        act_ids = st.session_state.df_act["id_act"].dropna().tolist()
        for act in act_ids:
            if act not in st.session_state.df_eval.columns:
                st.session_state.df_eval[act] = 0.0
    
    
        # Organizar Actividades por Trimestre
        acts_by_tri = {"1T": [], "2T": [], "3T": []}
        for _, row in st.session_state.df_act.iterrows():
            # Saltar filas sin id_act válido (filas vacías del editor)
            if not row.get("id_act") or pd.isna(row.get("id_act")):
                continue
            tri = row.get("Trimestre", "1T")
            if tri not in acts_by_tri: tri = "1T"
            acts_by_tri[tri].append(row)
    
        df_evaluable = st.session_state.df_al[st.session_state.df_al.get("Estado", "") != "Baja"]
        df_al_sorted = df_evaluable.sort_values("Apellidos").reset_index(drop=True)
    
        # Mapeo CE -> Actividades
        df_ce_clean = st.session_state.df_ce.dropna(subset=["id_ce"])
        df_ce_clean = df_ce_clean[df_ce_clean["id_ce"].str.strip() != ""]
        
        peso_ra = {}
        for _, ra_row in st.session_state.df_ra.iterrows():
            if pd.notna(ra_row["id_ra"]):
                peso_ra[ra_row["id_ra"]] = pd.to_numeric(ra_row["peso_ra"], errors="coerce") if pd.notna(ra_row["peso_ra"]) else 0.0
                
        peso_ce = {}
        ra_of_ce = {}
        for _, ce_row in df_ce_clean.iterrows():
            ce_id = ce_row["id_ce"]
            ra_id = ce_row.get("id_ra", "")
            if pd.notna(ce_id) and pd.notna(ra_id):
                peso_ce[ce_id] = pd.to_numeric(ce_row["peso_ce"], errors="coerce") if pd.notna(ce_row["peso_ce"]) else 0.0
                ra_of_ce[ce_id] = ra_id
    
        for _, al in df_al_sorted.iterrows():
            al_id = al["ID"]
            apellidos = str(al.get("Apellidos", ""))
            nombre = str(al.get("Nombre", ""))
    
            mask = st.session_state.df_eval["ID"] == al_id
            if not mask.any(): continue
            idx = st.session_state.df_eval[mask].index[0]
    
            nota_prev = float(st.session_state.df_eval.at[idx, "Nota_Final"]) if pd.notna(st.session_state.df_eval.at[idx, "Nota_Final"]) else 0.0
            n_int, sigad_cod, sigad_txt, sigad_col = get_sigad_info(nota_prev)
            header_label = f"\U0001f464  {apellidos}, {nombre}   \u2014   {n_int} \u00b7 {sigad_cod} ({sigad_txt})"
    
            with st.expander(header_label):
                co_left, co_right = st.columns([2, 1.5])
                
                new_vals = {}
                with co_left:
                    st.markdown("**Evaluación por Instrumentos**")
                    t1, t2, t3 = st.tabs(["1º Tri", "2º Tri", "3º Tri"])
                    
                    for tb, tri_key in zip([t1, t2, t3], ["1T", "2T", "3T"]):
                        with tb:
                            if not acts_by_tri[tri_key]:
                                st.info("No hay actividades evaluables definidas para este trimestre.")
                            for act in acts_by_tri[tri_key]:
                                act_id = act["id_act"]
                                if not act_id or pd.isna(act_id) or act_id not in st.session_state.df_eval.columns:
                                    continue
                                val_prev = float(st.session_state.df_eval.at[idx, act_id]) if pd.notna(st.session_state.df_eval.at[idx, act_id]) else 0.0
                                val_new = st.number_input(
                                    f"[{act['Tipo']}] {act.get('Actividad', act_id)}", 
                                    0.0, 10.0, val_prev, 0.1, 
                                    key=f"ev_{al_id}_{act_id}", format="%.1f"
                                )
                                new_vals[act_id] = val_new
    
                with co_right:
                    st.markdown("**Cálculo Jerárquico**")
                    
                    # Usar la función centralizada de cálculo con los valores actuales del formulario
                    res_cal = calcular_notas_alumno(
                        al_id, 
                        st.session_state.df_eval, 
                        st.session_state.df_act, 
                        st.session_state.df_ce, 
                        st.session_state.df_ra,
                        st.session_state.get("df_feoe", pd.DataFrame()),
                        overrides=new_vals
                    )
                    
                    nota_final_calc = res_cal["nota_final"]
                    
                    # --- MEJORA REACTIVIDAD: Sincronizar estado de sesión ---
                    final_key = f"ev_{al_id}_notaf"
                    last_calc_key = f"last_calc_{al_id}"
                    
                    # Si el cálculo ha cambiado, forzamos la actualización del widget
                    if st.session_state.get(last_calc_key) != nota_final_calc:
                        st.session_state[final_key] = float(max(1.0, round(nota_final_calc, 2)))
                        st.session_state[last_calc_key] = nota_final_calc
    
                    nota_final = st.number_input(
                        "\U0001f31f Nota Final", min_value=1.0, max_value=10.0,
                        step=0.1, format="%.2f", key=final_key
                    )
                    
                    new_vals["Nota_Final"] = nota_final
                    n_int_new, sigad_cod_new, sigad_txt_new, sigad_col_new = get_sigad_info(nota_final)
    
                    st.markdown(
                        f'<div style="background:{sigad_col_new}22;border:2px solid {sigad_col_new};border-radius:14px;padding:18px 8px;text-align:center;margin-top:6px;">'
                        f'<div style="font-size:2.8rem;font-weight:900;color:{sigad_col_new};line-height:1;">{n_int_new}</div>'
                        f'<div style="font-size:1.05rem;font-weight:700;color:{sigad_col_new};margin-top:6px;">{sigad_cod_new}</div>'
                        f'<div style="font-size:0.75rem;color:#aaa;margin-top:4px;">{sigad_txt_new}</div>'
                        f'</div>',
                        unsafe_allow_html=True
                    )
    
                for key, val in new_vals.items():
                    st.session_state.df_eval.at[idx, key] = val
    
    # --- PESTAÑA: RESULTADOS ---
