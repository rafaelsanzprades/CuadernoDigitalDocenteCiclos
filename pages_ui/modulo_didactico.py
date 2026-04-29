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

def render_modulo_didactico(ro_pd, ro_curso, ro_global):
    c_m1, c_m2 = st.columns([4, 1])
    with c_m1:
        st.subheader("📋 Configuración del Módulo")
    with c_m2:
        if st.button("💾 Guardar PD", use_container_width=True, type="primary"):
            from storage_manager import guardar_pd
            guardar_pd(st.session_state.active_pd)
            st.toast("✅ PD guardada", icon="💾")
    st.write("")
    
    st.subheader("📝 Datos")
    
    # Fila 1: Módulo didáctico y Curso
    c1_1, c1_2 = st.columns([4, 1])
    with c1_1:
        st.session_state.info_modulo["modulo"] = st.text_input("Módulo didáctico", st.session_state.info_modulo.get("modulo", ""))
    with c1_2:
        st.session_state.info_modulo["curso"] = st.text_input("Curso", st.session_state.info_modulo.get("curso", "1º"))
    
    # Fila 2: Centro educativo y Profesorado
    c2_1, c2_2 = st.columns(2)
    with c2_1:
        st.session_state.info_modulo["centro"] = st.text_input("Centro educativo", st.session_state.info_modulo.get("centro", ""))
    with c2_2:
        st.session_state.info_modulo["profesorado"] = st.text_input("Profesorado", st.session_state.info_modulo.get("profesorado", st.session_state.info_modulo.get("profesor", "")))
        
    # Fila 3: Nº Trimestres, H.Sem, H.BOA, %P. EvC y H.FEOE
    c3_1, c3_2, c3_3, c3_4, c3_5 = st.columns([1, 1, 1, 1, 1])
    with c3_1:
        st.text_input("Nº de trimestres", value="3", disabled=True)
    with c3_2:
        st.session_state.info_modulo["h_sem"] = st.number_input("Horas/semana clase", 0, 40, st.session_state.info_modulo.get("h_sem", 5))
    with c3_3:
        st.session_state.info_modulo["h_boa"] = st.number_input("Horas BOA", 0, 500, st.session_state.info_modulo.get("h_boa", 149))
    with c3_4:
        st.session_state.info_modulo["p_ev"] = st.number_input("% P.Ev.Continua", 0, 100, st.session_state.info_modulo.get("p_ev", 15))
    with c3_5:
        st.session_state.info_modulo["h_feoe"] = st.number_input("Horas FEOE", 0, 500, st.session_state.info_modulo.get("h_feoe", 400))
    
    
    if "criterio_conocimiento" not in st.session_state.info_modulo:
        st.session_state.info_modulo.update({
            "criterio_conocimiento": 30, # Examenes teóricos
            "criterio_procedimiento_ejercicios": 20, # Informes de ejercicios
            "criterio_procedimiento_practicas": 20, # Examenes prácticos
            "criterio_tareas": 30, # Cuaderno de tareas
        })
    
    st.divider()
    cs1, cs2 = st.columns([3, 1])
    with cs1:
        st.markdown("### ⚖️ % Trimestres")
    with cs2:
        badge_trimestres = st.empty()
            
    cp1, cp2, cp3 = st.columns(3)
    with cp1:
        st.session_state.info_modulo["pond_1t"] = st.number_input("1er Trimestre (%)", 0, 100, st.session_state.info_modulo.get("pond_1t", 30))
    with cp2:
        st.session_state.info_modulo["pond_2t"] = st.number_input("2º Trimestre (%)", 0, 100, st.session_state.info_modulo.get("pond_2t", 30))
    with cp3:
        st.session_state.info_modulo["pond_3t"] = st.number_input("3er Trimestre (%)", 0, 100, st.session_state.info_modulo.get("pond_3t", 40))
        
    suma_t = st.session_state.info_modulo["pond_1t"] + st.session_state.info_modulo["pond_2t"] + st.session_state.info_modulo["pond_3t"]
    badge_trimestres.markdown(badge(suma_t - 100, suma_t, "%"), unsafe_allow_html=True)
    
    st.divider()
    cc1, cc2 = st.columns([3, 1])
    with cc1:
        st.markdown("### 🧾 % Instrumentos de evaluación")
    with cc2:
        badge_criterios = st.empty()
    
    col_a, col_b, col_c, col_d = st.columns(4)
    with col_a:
        st.session_state.info_modulo["criterio_conocimiento"] = st.number_input("Exámenes teóricos", 0, 100, st.session_state.info_modulo["criterio_conocimiento"], key="crit_conocimiento")
    with col_b:
        st.session_state.info_modulo["criterio_procedimiento_practicas"] = st.number_input("Exámenes prácticos", 0, 100, st.session_state.info_modulo["criterio_procedimiento_practicas"], key="crit_procedimiento_practicas")
    with col_c:
        st.session_state.info_modulo["criterio_procedimiento_ejercicios"] = st.number_input("Informes de ejercicios", 0, 100, st.session_state.info_modulo["criterio_procedimiento_ejercicios"], key="crit_procedimiento_ejercicios")
    with col_d:
        st.session_state.info_modulo["criterio_tareas"] = st.number_input("Cuaderno de tareas", 0, 100, st.session_state.info_modulo.get("criterio_tareas", st.session_state.info_modulo.get("criterio_actitud_participacion", 30)), key="crit_tareas")
        
    suma_criterios = st.session_state.info_modulo["criterio_conocimiento"] + st.session_state.info_modulo["criterio_procedimiento_ejercicios"] + st.session_state.info_modulo["criterio_procedimiento_practicas"] + st.session_state.info_modulo.get("criterio_tareas", st.session_state.info_modulo.get("criterio_actitud_participacion", 30))
    badge_criterios.markdown(badge(suma_criterios - 100, suma_criterios, "%"), unsafe_allow_html=True)
    
    # ── Resumen ──────────────────────────────────────────────────
    st.divider()
    st.subheader("📊 Nº Instrumentos de evaluación")
    rd1, rd2, rd3, rd4 = st.columns(4)
    with rd1:
        with st.container(border=True):
            _n_exam_teo = len(st.session_state.df_act[st.session_state.df_act["Tipo"] == "Teoria"]) if not st.session_state.df_act.empty and "Tipo" in st.session_state.df_act.columns else 0
            st.metric("Exámenes teóricos", _n_exam_teo)
    with rd2:
        with st.container(border=True):
            _n_exam_prac = len(st.session_state.df_act[st.session_state.df_act["Tipo"] == "Practica"]) if not st.session_state.df_act.empty and "Tipo" in st.session_state.df_act.columns else 0
            st.metric("Exámenes prácticos", _n_exam_prac)
    with rd3:
        with st.container(border=True):
            _n_inf_ej = len(st.session_state.df_act[st.session_state.df_act["Tipo"] == "Informes"]) if not st.session_state.df_act.empty and "Tipo" in st.session_state.df_act.columns else 0
            st.metric("Informes de ejercicios", _n_inf_ej)
    with rd4:
        with st.container(border=True):
            _n_tareas = len(st.session_state.df_act[st.session_state.df_act["Tipo"] == "Tareas"]) if not st.session_state.df_act.empty and "Tipo" in st.session_state.df_act.columns else 0
            st.metric("Cuaderno de tareas", _n_tareas)
    
    st.divider()
    st.markdown("### 📊 Nº Unidades didácticas por trimestres")
    
    # Calcular fecha de inicio y fin de cada UD desde el planning_ledger
    _ud_fechas = {}  # {ud_id: {"ini": date, "fin": date}}
    for d_str, ud_list in st.session_state.planning_ledger.items():
        try:
            d_obj = datetime.strptime(d_str, "%d/%m/%Y").date()
        except Exception:
            continue
        for ud in ud_list:
            if ud not in _ud_fechas:
                _ud_fechas[ud] = {"ini": d_obj, "fin": d_obj}
            else:
                if d_obj < _ud_fechas[ud]["ini"]:
                    _ud_fechas[ud]["ini"] = d_obj
                if d_obj > _ud_fechas[ud]["fin"]:
                    _ud_fechas[ud]["fin"] = d_obj
    
    # Asignar UD a trimestre si su inicio O su fin cae en ese trimestre
    uds_por_tri = {"1t": set(), "2t": set(), "3t": set()}
    for tri in ["1t", "2t", "3t"]:
        ini_t = st.session_state.info_fechas.get(f"ini_{tri}")
        fin_t = st.session_state.info_fechas.get(f"fin_{tri}")
        if not ini_t or not fin_t:
            continue
        for ud_id, fechas in _ud_fechas.items():
            ud_ini = fechas["ini"]
            ud_fin = fechas["fin"]
            if (ini_t <= ud_ini <= fin_t) or (ini_t <= ud_fin <= fin_t):
                uds_por_tri[tri].add(ud_id)
    
    # UDs sin días en planning_ledger (p.ej. la última UD si se agotaron días lectivos)
    # → se añaden al último trimestre disponible
    _all_ud_ids = st.session_state.df_ud["id_ud"].tolist() if not st.session_state.df_ud.empty else []
    _uds_sin_ledger = [u for u in _all_ud_ids if u not in _ud_fechas]
    if _uds_sin_ledger:
        _ultimo_tri = next(
            (t for t in ["3t", "2t", "1t"] if st.session_state.info_fechas.get(f"ini_{t}")),
            "3t"
        )
        for u in _uds_sin_ledger:
            uds_por_tri[_ultimo_tri].add(u)
    
    c_tri1, c_tri2, c_tri3 = st.columns(3)
    def render_caja_tri(caja, titulo, uds_set):
        with caja:
            st.markdown(f"<div style='text-align:center;font-size:1.1rem;color:#fff;'><strong>{titulo}</strong></div>", unsafe_allow_html=True)
            with st.container(border=True):
                if uds_set:
                    html_content = "<div>" + "".join([f"<div style='text-align:center;color:#ddd;font-weight:500;line-height:1.5;'>{ud}</div>" for ud in sorted(uds_set)]) + "</div>"
                    st.markdown(html_content, unsafe_allow_html=True)
                else:
                    st.markdown("<div style='text-align:center;color:#888;'>-</div>", unsafe_allow_html=True)
    render_caja_tri(c_tri1, "1er Tri.", uds_por_tri["1t"])
    render_caja_tri(c_tri2, "2º Tri.", uds_por_tri["2t"])
    render_caja_tri(c_tri3, "3er Tri.", uds_por_tri["3t"])
    
    st.divider()
    st.markdown("### 📊 Relación entre Resultados de Aprendizaje y Unidades Didácticas", unsafe_allow_html=True)
    lista_ra_ids_res = st.session_state.df_ra["id_ra"].tolist() if not st.session_state.df_ra.empty else []
    if lista_ra_ids_res:
        with st.container(border=True):
            ra_info_res = {}
            for _, row in st.session_state.df_ra.iterrows():
                try:
                    pct_val = float(pd.to_numeric(row.get("peso_ra", 0.0), errors="coerce"))
                    if pd.isna(pct_val): pct_val = 0.0
                except Exception:
                    pct_val = 0.0
                ra_info_res[row["id_ra"]] = {"desc": row.get("desc_ra", ""), "pct": pct_val}
            for ra_id in lista_ra_ids_res:
                info = ra_info_res.get(ra_id, {"desc": "", "pct": 0.0})
                pct  = info.get("pct", 0.0)
                sp   = f"{int(pct)}%" if pct == int(pct) else f"{pct:.1f}%"
                st.markdown(f"<div style='color:#fff;font-size:1.05rem;margin-top:5px;'><strong>{ra_id} ({sp}).</strong> <span style='color:#ccc;font-size:0.95rem;'>{info.get('desc','')}</span></div>", unsafe_allow_html=True)
                uds_list_res = []
                if not st.session_state.df_ud.empty and ra_id in st.session_state.df_ud.columns:
                    for _, ud_row in st.session_state.df_ud.iterrows():
                        try:
                            val_ra = float(ud_row.get(ra_id, 0.0))
                            val_h  = int(ud_row.get("horas_ud", ud_row.get("Horas", 0)))
                        except Exception:
                            val_ra = 0.0; val_h = 0
                        if val_ra > 0.0:
                            s = f"{int(val_ra)}%" if val_ra == int(val_ra) else f"{val_ra:.1f}%"
                            uds_list_res.append(f"{str(ud_row['id_ud'])} ({val_h}h) - {s}")
                html_h = f"<div style='margin-left:25px;color:#ffe599;border-left:2px solid #d4af37;padding-left:10px;'>{', '.join(uds_list_res)}</div>" if uds_list_res else "<div style='margin-left:25px;color:#666;font-style:italic;border-left:2px solid #444;padding-left:10px;'>Sin UDs asignadas</div>"
                st.markdown(html_h, unsafe_allow_html=True)
    else:
        st.info("No hay Resultados de Aprendizaje definidos.")
    
    
    
    
    # --- PESTAÑA: Planificación ---
