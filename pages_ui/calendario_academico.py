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

def render_calendario_academico(ro_pd, ro_curso, ro_global):
    st.subheader("📚 Fechas de inicio y fin; de curso y de clases")
    c_fc1, c_fc2, c_fc3, c_fc4 = st.columns(4)
    with c_fc1:
        st.session_state.info_fechas["ini_curso"] = st.date_input("Inicio de curso", st.session_state.info_fechas.get("ini_curso", date(2025, 9, 1)), format="DD/MM/YYYY", key="d_ini_curso_v")
    with c_fc2:
        ini_cls = st.date_input("Inicio clases. 1er Tri.", st.session_state.info_fechas.get("ini_1t", date(2025, 9, 15)), format="DD/MM/YYYY", key="d_ini_clases_v")
        st.session_state.info_fechas["ini_1t"] = ini_cls
    with c_fc3:
        fin_cls = st.date_input("Fin clases. 3er Tri.", st.session_state.info_fechas.get("fin_3t", date(2026, 6, 20)), format="DD/MM/YYYY", key="d_fin_clases_v")
        st.session_state.info_fechas["fin_3t"] = fin_cls
    with c_fc4:
        st.session_state.info_fechas["fin_curso"] = st.date_input("Fin de curso", st.session_state.info_fechas.get("fin_curso", date(2026, 6, 30)), format="DD/MM/YYYY", key="d_fin_curso_v")
        
    st.divider()
    
    suma_horario = sum(st.session_state.horario.values())
    c_sub1, c_sub2 = st.columns([3, 1])
    with c_sub1:
        st.subheader("🕒 Horario semanal")
    with c_sub2:
        st.markdown(badge(suma_horario - st.session_state.info_modulo["h_sem"], suma_horario, " h"), unsafe_allow_html=True)
    
    # Usamos exactamente 5 columnas para asegurar que aparezcan los botones + y -
    c_h1, c_h2, c_h3, c_h4, c_h5 = st.columns(5)
    
    with c_h1: st.session_state.horario["Lun"] = st.number_input("Lunes", 0, 8, st.session_state.horario.get("Lun", 0), key="h_in_Lun", step=1)
    with c_h2: st.session_state.horario["Mar"] = st.number_input("Martes", 0, 8, st.session_state.horario.get("Mar", 0), key="h_in_Mar", step=1)
    with c_h3: st.session_state.horario["Mié"] = st.number_input("Miércoles", 0, 8, st.session_state.horario.get("Mié", 0), key="h_in_Mié", step=1)
    with c_h4: st.session_state.horario["Jue"] = st.number_input("Jueves", 0, 8, st.session_state.horario.get("Jue", 0), key="h_in_Jue", step=1)
    with c_h5: st.session_state.horario["Vie"] = st.number_input("Viernes", 0, 8, st.session_state.horario.get("Vie", 0), key="h_in_Vie", step=1)
    
    st.divider()
    h1_f = calcular_horas_reales(st.session_state.info_fechas["ini_1t"], st.session_state.info_fechas["fin_1t"], st.session_state.horario, st.session_state.calendar_notes)
    h2_f = calcular_horas_reales(st.session_state.info_fechas["ini_2t"], st.session_state.info_fechas["fin_2t"], st.session_state.horario, st.session_state.calendar_notes)
    h3_f = calcular_horas_reales(st.session_state.info_fechas["ini_3t"], st.session_state.info_fechas["fin_3t"], st.session_state.horario, st.session_state.calendar_notes)
    h_real_f = h1_f + h2_f + h3_f
    diff_boa_f = h_real_f - st.session_state.info_modulo.get('h_boa', 0)
    cf1, cf2 = st.columns([3, 1])
    with cf1:
        st.subheader("🗓️ Trimestres")
    with cf2:
        st.markdown(badge(diff_boa_f, h_real_f, " h"), unsafe_allow_html=True)
    c1, c2, c3 = st.columns(3)
    
    with c1:
        st.markdown("<div style='text-align: center;'><strong>1er Trimestre</strong></div>", unsafe_allow_html=True)
        with st.container(border=True):
            st.session_state.info_fechas["ini_1t"] = st.date_input("Inicio 1er Tri.", st.session_state.info_fechas["ini_1t"], key="d_ini_1t", format="DD/MM/YYYY")
            st.session_state.info_fechas["fin_1t"] = st.date_input("Fin 1er Tri.", st.session_state.info_fechas["fin_1t"], key="d_fin_1t", format="DD/MM/YYYY")
            h1 = calcular_horas_reales(st.session_state.info_fechas["ini_1t"], st.session_state.info_fechas["fin_1t"], st.session_state.horario, st.session_state.calendar_notes)
            st.metric("Horas real 1er Tri.", f"{h1} h")
    
    with c2:
        st.markdown("<div style='text-align: center;'><strong>2º Trimestre</strong></div>", unsafe_allow_html=True)
        with st.container(border=True):
            st.session_state.info_fechas["ini_2t"] = st.date_input("Inicio 2º Tri.", st.session_state.info_fechas["ini_2t"], key="d_ini_2t", format="DD/MM/YYYY")
            st.session_state.info_fechas["fin_2t"] = st.date_input("Fin 2º Tri.", st.session_state.info_fechas["fin_2t"], key="d_fin_2t", format="DD/MM/YYYY")
            h2 = calcular_horas_reales(st.session_state.info_fechas["ini_2t"], st.session_state.info_fechas["fin_2t"], st.session_state.horario, st.session_state.calendar_notes)
            st.metric("Horas real 2º Tri.", f"{h2} h")
    
    with c3:
        st.markdown("<div style='text-align: center;'><strong>3er Trimestre</strong></div>", unsafe_allow_html=True)
        with st.container(border=True):
    
            st.session_state.info_fechas["ini_3t"] = st.date_input("Inicio 3er Tri.", st.session_state.info_fechas["ini_3t"], key="d_ini_3t", format="DD/MM/YYYY")
            st.session_state.info_fechas["fin_3t"] = st.date_input("Fin 3er Tri.", st.session_state.info_fechas["fin_3t"], key="d_fin_3t", format="DD/MM/YYYY")
            h3 = calcular_horas_reales(st.session_state.info_fechas["ini_3t"], st.session_state.info_fechas["fin_3t"], st.session_state.horario, st.session_state.calendar_notes)
            st.metric("Horas real 3er Tri.", f"{h3} h")
    
    # H.Real y H.PdEvC. debajo de las cajas de trimestres
    h_real_fechas = h1 + h2 + h3
    p_ev_val_f = st.session_state.info_modulo.get("p_ev", 15)
    h_p_ev_f = (p_ev_val_f / 100) * h_real_fechas
    
    st.markdown("##### Relación horas BOA y clases reales; incluyendo límite P.Ev.Continua")
    cf_a, cf_b, cf_c = st.columns(3)
    with cf_a:
        with st.container(border=True):
            st.metric("Horas BOA", f"{st.session_state.info_modulo.get('h_boa', 0)} h")
    with cf_b:
        with st.container(border=True):
            st.metric("Horas clases real", f"{h_real_fechas} h")
    with cf_c:
        with st.container(border=True):
            st.metric("Horas P.Ev.Continua", f"{int(round(h_p_ev_f))} h")
    
    # --- Caja FEOE ---
    st.divider()
    cfeoe1, cfeoe2 = st.columns([3, 1])
    with cfeoe1:
        st.subheader("🏢 Formación en empresa (FEOE)")
    
    with st.container():
        feo1, feo2, feo3 = st.columns(3)
        with feo1:
            ini_fo = st.date_input(
                "Inicio FEOE",
                st.session_state.info_fechas.get("ini_feoe", date(2026, 3, 16)),
                key="d_ini_feoe_f", format="DD/MM/YYYY"
            )
            st.session_state.info_fechas["ini_feoe"] = ini_fo
        with feo2:
            fin_fo = st.date_input(
                "Fin FEOE",
                st.session_state.info_fechas.get("fin_feoe", date(2026, 5, 29)),
                key="d_fin_feoe_f", format="DD/MM/YYYY"
            )
            st.session_state.info_fechas["fin_feoe"] = fin_fo
        with feo3:
            h_sem_feoe_val = st.number_input(
                "Horas/día en FEOE", 0, 40,
                int(st.session_state.info_fechas.get("h_sem_feoe", 8)),
                key="h_sem_feoe_f"
            )
            st.session_state.info_fechas["h_sem_feoe"] = h_sem_feoe_val
    
        # Calcular horas FEOE: días L-V × 8 h/día
        dias_feoe_lv = sum(
            1 for i in range((fin_fo - ini_fo).days + 1)
            if (ini_fo + timedelta(days=i)).weekday() < 5
        )
        h_real_feoe = dias_feoe_lv * 8
        h_feoe_boa = st.session_state.info_modulo.get("h_feoe", 400)
    
        # Fila 2: métricas informativas grandes
        cf_feoe_a, cf_feoe_b = st.columns(2)
        with cf_feoe_a:
            with st.container(border=True):
                st.metric("Horas FEOE real", f"{h_real_feoe} h")
        with cf_feoe_b:
            with st.container(border=True):
                st.metric("Horas BOA FEOE", f"{h_feoe_boa} h")
    
    # Verificador (se calcula con los valores frescos del container)
    diff_feoe = h_real_feoe - h_feoe_boa
    with cfeoe2:
        st.markdown(badge(diff_feoe, h_real_feoe, " h"), unsafe_allow_html=True)
    
    st.divider()
    st.markdown('### 📌 Resumen de días festivos y eventos relevantes')
    
    # 1. Recopilar datos
    ls = []
    count_f = 0
    count_r = 0
    fechas_f    = {k[2:] for k in st.session_state.calendar_notes if k.startswith('f_')}
    fechas_r    = {k[2:] for k in st.session_state.calendar_notes if k.startswith('r_')}
    
    # Todas las fechas candidatas
    fechas_all  = sorted(
        fechas_f.union(fechas_r),
        key=lambda d: datetime.strptime(d, '%d/%m/%Y')
    )
    dias_semana_dict = {0: 'Lun', 1: 'Mar', 2: 'Mié', 3: 'Jue', 4: 'Vie', 5: 'Sáb', 6: 'Dom'}
    
    for fecha in fechas_all:
        try:
            fecha_obj = datetime.strptime(fecha, '%d/%m/%Y').date()
        except:
            continue
        dia_semana = dias_semana_dict[fecha_obj.weekday()]
        festivo  = st.session_state.calendar_notes.get(f'f_{fecha}', '').strip()
        relevan  = st.session_state.calendar_notes.get(f'r_{fecha}', '').strip()
        
        if festivo or relevan:
            ls.append({'Fecha': fecha, 'Día': dia_semana, 'Festivos': festivo, 'Relevantes': relevan})
            if festivo:  count_f += 1
            if relevan:  count_r += 1
    
    if ls:
        df_festivos = pd.DataFrame(ls)
        st.dataframe(
            df_festivos,
            column_config={
                "Fecha":     st.column_config.TextColumn("📅 Fecha"),
                "Día":       st.column_config.TextColumn("🗓️ Día"),
                "Festivos":  st.column_config.TextColumn("🎉 Festivos"),
                "Relevantes":st.column_config.TextColumn("🔔 Relevantes"),
            },
            hide_index=True,
            width="stretch"
        )
        
        st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
        c1, c2 = st.columns(2)
        with c1: 
            with st.container(border=True):
                st.metric("Total días festivos", count_f)
        with c2: 
            with st.container(border=True):
                st.metric("Total eventos relevantes", count_r)
    else:
        st.info('No hay anotaciones de días festivos o eventos relevantes.')
    
    st.divider()
    st.subheader("🗓️ Modificación de días festivos y eventos relevantes")
    meses_curso = [("Septiembre", 9, 2025), ("Octubre", 10, 2025), ("Noviembre", 11, 2025), ("Diciembre", 12, 2025), ("Enero", 1, 2026), ("Febrero", 2, 2026), ("Marzo", 3, 2026), ("Abril", 4, 2026), ("Mayo", 5, 2026), ("Junio", 6, 2026)]
    
    for n, m, a in meses_curso:
        with st.expander(f"📅 {n} {a}"):
            cal = calendar.monthcalendar(a, m)
    
            filas_cal = []
            for week in cal:
                for day in week:
                    if day != 0:
                        fecha_str = f"{day:02d}/{m:02d}/{a}"
                        fecha_obj = date(a, m, day)
                        num_dia_semana = fecha_obj.weekday()
                        nombre_dia = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][num_dia_semana]
    
                        festivo   = st.session_state.calendar_notes.get(f"f_{fecha_str}", "")
                        relevante = st.session_state.calendar_notes.get(f"r_{fecha_str}", "")
    
                        filas_cal.append({"Fecha": fecha_str, "Día": nombre_dia, "Festivos": festivo, "Relevantes": relevante})
    
            ed_cal = st.data_editor(pd.DataFrame(filas_cal), hide_index=True, width="stretch", key=f"calendario_{n}_{a}")
    
            for _, row in ed_cal.iterrows():
                st.session_state.calendar_notes[f"f_{row['Fecha']}"]    = row['Festivos']
                st.session_state.calendar_notes[f"r_{row['Fecha']}"]    = row['Relevantes']
    
    
    # --- PESTAÑA: ALUMNADO ---
