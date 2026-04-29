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

def render_evaluacion_continua(ro_pd, ro_curso, ro_global):
    c_e1, c_e2 = st.columns([4, 1])
    with c_e1:
        st.subheader("🎓 Evaluación continua por Alumnado")
    with c_e2:
        if st.button("💾 Guardar Cambios", use_container_width=True, type="primary"):
            from storage_manager import guardar_curso
            guardar_curso(st.session_state.active_curso)
            st.toast("✅ Evaluación continua guardada", icon="💾")
    st.write("")
    
    if not st.session_state.df_al.empty and not st.session_state.df_ra.empty:
        # Calcular proyección de Trimestres para cada RA
        uds_por_tri = {"1T": set(), "2T": set(), "3T": set()}
        for tri, m_key in [("1t", "1T"), ("2t", "2T"), ("3t", "3T")]:
            ini_t = st.session_state.info_fechas.get(f"ini_{tri}")
            fin_t = st.session_state.info_fechas.get(f"fin_{tri}")
            if ini_t and fin_t:
                curr = ini_t
                while curr <= fin_t:
                    d_str = curr.strftime("%d/%m/%Y")
                    for ud in st.session_state.planning_ledger.get(d_str, []):
                        uds_por_tri[m_key].add(ud)
                    curr += timedelta(days=1)
                    
        ra_to_tri = {}
        ra_info = {}
        for _, ra_row in st.session_state.df_ra.iterrows():
            ra_id = str(ra_row["id_ra"])
            ra_info[ra_id] = {
                "pond": float(pd.to_numeric(ra_row["peso_ra"], errors="coerce")) if not pd.isna(ra_row["peso_ra"]) else 0.0,
                "desc": str(ra_row.get("Descripción", ""))
            }
            tris_found = []
            uds_found = []
            prs_found = []
            if ra_id in st.session_state.df_ud.columns:
                for _, ud_row in st.session_state.df_ud.iterrows():
                    if ud_row.get(ra_id, False):
                        uid = str(ud_row["id_ud"])
                        uds_found.append(uid)
                        for t_key in ["1T", "2T", "3T"]:
                            if uid in uds_por_tri[t_key] and t_key not in tris_found:
                                tris_found.append(t_key)
            if ra_id in st.session_state.df_pr.columns:
                for _, pr_row in st.session_state.df_pr.iterrows():
                    if pr_row.get(ra_id, False):
                        prs_found.append(str(pr_row["ID"]))
                        
            # Si no tiene UD de referencia, asimilamos evaluado en final de curso
            ra_to_tri[ra_id] = {
                "tris": tris_found if tris_found else ["1T", "2T", "3T"],
                "uds": uds_found,
                "prs": prs_found
            }
    
        # Filtrar solo 'Alta'
        df_evaluable = st.session_state.df_al[st.session_state.df_al.get("Estado", "") != "Baja"]
        df_al_sorted = df_evaluable.sort_values("Apellidos").reset_index(drop=True)
        
        for _, al in df_al_sorted.iterrows():
            al_id     = al["ID"]
            apellidos = str(al.get("Apellidos", ""))
            nombre    = str(al.get("Nombre", ""))
    
            mask = st.session_state.df_eval["ID"] == al_id
            if not mask.any(): continue
            idx = st.session_state.df_eval[mask].index[0]
            
            # Obtener notas (si es NaN, se asume 0)
            n1 = float(st.session_state.df_eval.at[idx, "1T_Nota"]) if not pd.isna(st.session_state.df_eval.at[idx, "1T_Nota"]) else 0.0
            n2 = float(st.session_state.df_eval.at[idx, "2T_Nota"]) if not pd.isna(st.session_state.df_eval.at[idx, "2T_Nota"]) else 0.0
            n3 = float(st.session_state.df_eval.at[idx, "3T_Nota"]) if not pd.isna(st.session_state.df_eval.at[idx, "3T_Nota"]) else 0.0
            notas_student = {"1T": n1, "2T": n2, "3T": n3}
            nota_final = float(st.session_state.df_eval.at[idx, "Nota_Final"]) if not pd.isna(st.session_state.df_eval.at[idx, "Nota_Final"]) else 0.0
            
            # Calcular % cumplido global
            pct_global_cumplido = 0.0
            suma_pond_ra = 0.0
            resultados_ra = []
            
            for ra_id, info in ra_info.items():
                tris = ra_to_tri[ra_id]["tris"]
                uds = ra_to_tri[ra_id]["uds"]
                prs = ra_to_tri[ra_id]["prs"]
                
                # Promedio de las notas de los trimestres en los que cae el RA
                avg_nota_ra = sum(notas_student[t] for t in tris) / len(tris) if tris else nota_final
                
                # Exigir un mínimo de 5.0 para considerar "Conseguido"? El usuario dice "cumplido con el 100% de los RAs".
                # Usaremos la relación proporcional: un 5 = 100%, pero proporcionalmente si tiene un 8, se cuenta el 100% (hasta max 100%).
                prop = min(100.0, max(0.0, (avg_nota_ra / 5.0) * 100.0) if avg_nota_ra >= 5.0 else (avg_nota_ra/5.0)*100.0)
                obtenido_peso = info["pond"] * (prop / 100.0)
                
                pct_global_cumplido += obtenido_peso
                suma_pond_ra += info["pond"]
                
                resultados_ra.append((ra_id, info["desc"], info["pond"], prop, avg_nota_ra, tris, uds, prs))
    
            # Header info
            pct_global_lbl = f"{pct_global_cumplido:.1f}%"
            # Ajuste de color global
            color_glob = "#2ecc71" if pct_global_cumplido >= 50 else "#e74c3c" if pct_global_cumplido < 40 else "#f1c40f"
            header_label = f"👤 {apellidos}, {nombre} — Resultado: {pct_global_lbl} / {suma_pond_ra:.1f}%"
            
            with st.expander(header_label):
                for ra_val in resultados_ra:
                    r_id, r_desc, r_pond, r_prop, r_nota, r_tris, r_uds, r_prs = ra_val
                    # Color de la barra
                    if r_prop >= 100:
                        bar_color = "#198754" # Verde
                    elif r_prop >= 80:
                        bar_color = "#0d6efd" # Azul
                    elif r_prop >= 50:
                        bar_color = "#ffc107" # Amarillo
                    else:
                        bar_color = "#dc3545" # Rojo
                        
                    tris_lbl = ", ".join(r_tris)
                    uds_lbl = ", ".join(r_uds) if r_uds else "-"
                    prs_lbl = ", ".join(r_prs) if r_prs else "-"
                    
                    c_izq, c_der = st.columns([2.5, 1.5])
                    with c_izq:
                        st.markdown(f"<div style='margin-bottom: 2px; margin-top: 15px;'><strong style='color:#ccc;'>{r_id} ({r_pond:.1f}%)</strong></div>", unsafe_allow_html=True)
                        st.markdown(f"<div style='font-size: 0.9rem; color:#aaa; margin-bottom: 8px;'>{r_desc}</div>", unsafe_allow_html=True)
                        # Dibujar barritas en HTML para estilos custom
                        bar_html = f"""
                        <div style="background-color: #333; border-radius: 5px; width: 100%; height: 18px; margin-bottom: 20px;">
                            <div style="background-color: {bar_color}; width: {r_prop}%; height: 100%; border-radius: 5px; text-align: right; padding-right: 5px; color: white; font-size: 11px; line-height: 18px;">
                                {r_prop:.0f}%
                            </div>
                        </div>
                        """
                        st.markdown(bar_html, unsafe_allow_html=True)
                        
                    with c_der:
                        st.markdown(f"""
                        <div style='background:#262730; border:1px solid #444; border-radius:10px; padding:15px; margin-top: 10px; margin-bottom: 5px; font-size: 0.95rem; color:#ccc; line-height: 1.6;'>
                            <strong style='color:#add8e6;'>Evaluado en:</strong> {tris_lbl}<br>
                            <strong style='color:#ffe599;'>UDs:</strong> {uds_lbl}<br>
                            <strong style='color:#ffc107;'>Prácticas:</strong> {prs_lbl}
                        </div>
                        """, unsafe_allow_html=True)
    
    else:
        st.info("Falta información. Asegúrate de tener alumnado matriculado y Resultados de Aprendizaje definidos en su correspondiente pestaña.")
    
    # --- PESTAÑA: PROGRAMACIÓN DE AULA ---
