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

def render_seguimiento_diario(ro_pd, ro_curso, ro_global):
    st.subheader("📍 Planificación. Horas previstas frente a impartidas")
    
    meses_display = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"]
    mapping_meses_full = {"Sep": "Septiembre", "Oct": "Octubre", "Nov": "Noviembre", "Dic": "Diciembre", "Ene": "Enero", "Feb": "Febrero", "Mar": "Marzo", "Abr": "Abril", "May": "Mayo", "Jun": "Junio"}
    
    # 1. Sincronización realizada en repartir_horas_previstas() (v5.2.1)
    # Recalcular Total_Imp dinámicamente antes de mostrar métricas
    imp_cols = [c for c in st.session_state.df_sgmt.columns if c.endswith("_Imp") and c != "Total_Imp"]
    st.session_state.df_sgmt["Total_Imp"] = st.session_state.df_sgmt[imp_cols].sum(axis=1)
    
    # Mostrar métricas de resumen arriba
    total_previsto = st.session_state.df_ud["horas_ud"].sum()
    total_impartido = st.session_state.df_sgmt["Total_Imp"].sum()
    porcentaje = (total_impartido / total_previsto * 100) if total_previsto > 0 else 0
    
    # Calcular horas reales y sin docencia (v5.1)
    h_real_total = 0
    h_sin_docencia = 0
    dias_semana_list = ["Lun", "Mar", "Mié", "Jue", "Vie"]
    for tri in ["1t", "2t", "3t"]:
        if f"ini_{tri}" in st.session_state.info_fechas and f"fin_{tri}" in st.session_state.info_fechas:
            ini = st.session_state.info_fechas[f"ini_{tri}"]
            fin = st.session_state.info_fechas[f"fin_{tri}"]
            curr = ini
            while curr <= fin:
                if curr.weekday() < 5:
                    f_str = curr.strftime("%d/%m/%Y")
                    if not st.session_state.calendar_notes.get(f"f_{f_str}"):
                        h_dia = st.session_state.horario.get(dias_semana_list[curr.weekday()], 0)
                        h_real_total += h_dia
                        if st.session_state.daily_ledger.get(f_str, {}).get("sin_docencia", False):
                            h_sin_docencia += h_dia
                curr += timedelta(days=1)
    perc_sin_docencia = (h_sin_docencia / h_real_total * 100) if h_real_total > 0 else 0
    
    # Métricas en una fila (Añadido % Sin docencia)
    calc_col1, calc_col2, calc_col3, calc_col4 = st.columns(4)
    calc_col1.metric("Horas Previstas", f"{total_previsto} h")
    calc_col2.metric("Horas Impartidas", f"{total_impartido} h")
    calc_col3.metric("% Progreso", f"{porcentaje:.1f}%")
    calc_col4.metric("% Sin docencia", f"{perc_sin_docencia:.1f}%")
    
    
    
    # PREPARAR DATOS PARA LA VISTA (Solo informativa, ocultar ceros)
    df_v = st.session_state.df_sgmt.copy()
    
    # Construir HTML de la tabla para control total de cabeceras
    html = '<div class="table-container"><table class="sgmt-table">'
    
    # Cabecera
    html += '<thead><tr>'
    html += '<th class="sticky-cell">Cod.<br>UD</th>'
    html += '<th class="sticky-cell-2" style="left:42px">Clase<br>Prv.</th>'
    html += '<th class="sticky-cell-3" style="left:92px">Clase<br>Imp.</th>'
    for m in meses_display:
        html += f'<th>{m}.<br>Prv.</th><th class="col-highlight">><br>Imp.</th>'
    html += '</tr></thead>'
    
    # Cuerpo
    html += '<tbody>'
    
    # --- NUEVA FILA: SIN DOCENCIA ---
    html += '<tr class="row-sin-docencia">'
    html += '<td class="sticky-cell" colspan="2" style="text-align:center; padding-right:10px;">Sin docencia</td>'
    
    # Definir fecha hoy para filtrar
    hoy_dt = datetime.now()
    
    # Total de "Sin docencia" acumulado (hasta hoy) - AHORA COMO 3ª COLUMNA
    total_incidencias = 0
    for d_str, entry in st.session_state.daily_ledger.items():
        try:
            d_obj = datetime.strptime(d_str, "%d/%m/%Y")
            if entry.get("sin_docencia") and d_obj.date() <= hoy_dt.date():
                total_incidencias += 1
        except: continue
    
    html += f'<td class="sticky-cell-3" style="left:92px; color:#ffd700; font-weight:bold;">{total_incidencias if total_incidencias > 0 else ""}</td>'
    
    # Calcular totales de "Sin docencia" por mes (hasta hoy)
    for m_short in meses_display:
        m_num = {"Sep":9, "Oct":10, "Nov":11, "Dic":12, "Ene":1, "Feb":2, "Mar":3, "Abr":4, "May":5, "Jun":6}[m_short]
        count_sin = 0
        for d_str, entry in st.session_state.daily_ledger.items():
            try:
                date_obj = datetime.strptime(d_str, "%d/%m/%Y")
                if date_obj.month == m_num and entry.get("sin_docencia") and date_obj.date() <= hoy_dt.date():
                    count_sin += 1
            except: continue
        
        # Mostrar solo en la columna de Imp. (debajo de mes.Imp.)
        html += f'<td></td><td class="col-highlight" style="color:#ffd700; font-weight:bold;">{count_sin if count_sin > 0 else ""}</td>'
    
    html += '</tr>'
    # -------------------------------
    
    for _, row in df_v.iterrows():
        tot_i = row["Total_Imp"]
        html += '<tr>'
        html += f'<td class="sticky-cell">{row["id_ud"]}</td>'
        html += f'<td class="sticky-cell-2" style="left:42px">{row["horas_ud"]}</td>'
        html += f'<td class="sticky-cell-3" style="left:92px">{int(tot_i) if tot_i != 0 else ""}</td>'
        for m in meses_display:
            val_prv = row[f"{m}_Prv"]
            val_imp = row[f"{m}_Imp"]
            # Ocultar ceros (mostrar vacío)
            txt_p = int(val_prv) if val_prv != 0 else ""
            txt_i = int(val_imp) if val_imp != 0 else ""
            html += f'<td>{txt_p}</td><td class="col-highlight">{txt_i}</td>'
        
        html += '</tr>'
    
    html += '</tbody></table></div>'
    
    st.markdown(html, unsafe_allow_html=True)
    
    st.write("")
    st.write("---")
    st.subheader("🗓️ Seguimiento diario de clases. Contingencias")
    
    # 1. Obtener todos los días lectivos (con horas > 0 y no festivos)
    dias_semana = ["Lun", "Mar", "Mié", "Jue", "Vie"]
    mapping_meses_full = {
        "Sep": "Septiembre", "Oct": "Octubre", "Nov": "Noviembre", "Dic": "Diciembre",
        "Ene": "Enero", "Feb": "Febrero", "Mar": "Marzo", "Abr": "Abril", "May": "Mayo", "Jun": "Junio"
    }
    
    # Consolidar todos los lectivos
    all_lectivos = []
    feoe_ini = st.session_state.info_fechas.get("ini_feoe")
    feoe_fin = st.session_state.info_fechas.get("fin_feoe")
    for tri in ["1t", "2t", "3t"]:
        if f"ini_{tri}" in st.session_state.info_fechas and f"fin_{tri}" in st.session_state.info_fechas:
            curr = st.session_state.info_fechas[f"ini_{tri}"]
            fin = st.session_state.info_fechas[f"fin_{tri}"]
            while curr <= fin:
                if feoe_ini and feoe_fin and feoe_ini <= curr <= feoe_fin:
                    curr += timedelta(days=1)
                    continue
                if curr.weekday() < 5:
                    f_str = curr.strftime("%d/%m/%Y")
                    # No festivo y con horas en el horario
                    if not st.session_state.calendar_notes.get(f"f_{f_str}"):
                        h = st.session_state.horario.get(dias_semana[curr.weekday()], 0)
                        if h > 0:
                            all_lectivos.append(curr)
                curr += timedelta(days=1)
    
    # 2. Agrupar por meses y mostrar expanders (FIX v5.3.2)
    for m_short in meses_display:
        m_long = mapping_meses_full.get(m_short, m_short)
        
        # Filtrar lectivos de este mes
        m_num = {"Sep":9, "Oct":10, "Nov":11, "Dic":12, "Ene":1, "Feb":2, "Mar":3, "Abr":4, "May":5, "Jun":6}[m_short]
        dias_mes = [d for d in all_lectivos if d.month == m_num]
        
        if not dias_mes:
            continue
            
        with st.expander(f"📅 {m_long} {dias_mes[0].year}"):
            # Crear datos para el editor
            data_mes = []
            for d in dias_mes:
                d_str = d.strftime("%d/%m/%Y")
                # Obtener planificación
                ud_prev = st.session_state.planning_ledger.get(d_str, [])
                ud_prev_str = ", ".join(ud_prev) if ud_prev else ""
                
                # Obtener datos guardados de daily_ledger
                ledger_entry = st.session_state.daily_ledger.get(d_str, {"sin_docencia": False, "seguimiento": ""})
                
                data_mes.append({
                    "Fecha": d_str,
                    "Día": dias_semana[d.weekday()],
                    "UD Prev.": ud_prev_str,
                    "Sin docencia": ledger_entry.get("sin_docencia", False),
                    "Seguimiento": ledger_entry.get("seguimiento", "")
                })
            
            df_mes = pd.DataFrame(data_mes)
            
            # Editor de datos
            ed_mes = st.data_editor(
                df_mes,
                column_config={
                    "Fecha": st.column_config.TextColumn("Fecha", disabled=True),
                    "Día": st.column_config.TextColumn("Día", disabled=True),
                    "UD Prev.": st.column_config.TextColumn("UD Prev.", disabled=True),
                    "Sin docencia": st.column_config.CheckboxColumn("Sin docencia"),
                    "Seguimiento": st.column_config.TextColumn("Seguimiento", width="large")
                },
                hide_index=True,
                width="stretch",
                key=f"editor_mes_{m_short}"
            )
            
            # Guardar cambios si hay diferencias
            if not ed_mes.equals(df_mes):
                for _, row in ed_mes.iterrows():
                    d_key = row["Fecha"]
                    st.session_state.daily_ledger[d_key] = {
                        "sin_docencia": row["Sin docencia"],
                        "seguimiento": row["Seguimiento"]
                    }
                # Recalcular inmediatamente para actualizar la fila "Sin Doc." y las columnas mes.Imp
                repartir_horas_previstas()
                st.rerun()
    
    # --- PESTAÑA: INSTRUMENTOS ---
