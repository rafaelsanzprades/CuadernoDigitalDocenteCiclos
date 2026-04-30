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

def render_matrices(ro_pd, ro_curso, ro_global):
    c_m1, c_m2 = st.columns([4, 1])
    with c_m1:
        st.subheader("🔗 Matrices de Relación (RA → CE → UD)")
    with c_m2:
        if st.button("💾 Guardar PD", use_container_width=True, type="primary"):
            from storage_manager import guardar_pd
            guardar_pd(st.session_state.active_pd)
            st.toast("✅ Matrices guardadas", icon="💾")
    st.write("")
    c_ra1, c_ra2 = st.columns([3, 1])
    with c_ra1:
        st.markdown("### 🎓 RA. Resultados de Aprendizaje")
    with c_ra2:
        badge_ra = st.empty()
    
    ed_ra = st.data_editor(st.session_state.df_ra, column_config={
        "id_ra": st.column_config.TextColumn("ID-RA", width="small", disabled=True),
        "peso_ra": st.column_config.NumberColumn("% RA", width="small", min_value=0.0, max_value=100.0, step=1, format="%d %%"),
        "is_dual": st.column_config.CheckboxColumn("FEOE", default=False, width="small"),
        "desc_ra": st.column_config.TextColumn("Resultados de aprendizaje"),
    }, num_rows="dynamic", hide_index=True, width="stretch", key="tabla_ra")
    
    # Manejo de nuevos RA
    if len(ed_ra) > len(st.session_state.df_ra):
        new_id = generar_siguiente_id(st.session_state.df_ra, "RA")
        ed_ra.iloc[-1, 0] = new_id
    
    st.session_state.df_ra = ed_ra
    
    suma_ra = round(pd.to_numeric(st.session_state.df_ra["peso_ra"], errors="coerce").fillna(0).sum(), 2)
    badge_ra.markdown(badge(suma_ra - 100, suma_ra, "%"), unsafe_allow_html=True)
    
    st.divider()
    
    from datetime import date, timedelta
    ini_1 = st.session_state.info_fechas.get("ini_1t", date(2025, 9, 15))
    fin_1 = st.session_state.info_fechas.get("fin_1t", date(2025, 12, 20))
    ini_2 = st.session_state.info_fechas.get("ini_2t", date(2026, 1, 8))
    fin_2 = st.session_state.info_fechas.get("fin_2t", date(2026, 3, 20))
    ini_3 = st.session_state.info_fechas.get("ini_3t", date(2026, 4, 1))
    fin_3 = st.session_state.info_fechas.get("fin_3t", date(2026, 6, 20))
    h1_ud = calcular_horas_reales(ini_1, fin_1, st.session_state.horario, st.session_state.calendar_notes)
    h2_ud = calcular_horas_reales(ini_2, fin_2, st.session_state.horario, st.session_state.calendar_notes)
    h3_ud = calcular_horas_reales(ini_3, fin_3, st.session_state.horario, st.session_state.calendar_notes)
    horas_reales = h1_ud + h2_ud + h3_ud
    
    ini_fo = st.session_state.info_fechas.get("ini_feoe", date(2026, 3, 20))
    fin_fo = st.session_state.info_fechas.get("fin_feoe", date(2026, 6, 20))
    dias_feoe_lv = sum(1 for i in range((fin_fo - ini_fo).days + 1) if (ini_fo + timedelta(days=i)).weekday() < 5)
    h_real_feoe = dias_feoe_lv * 8
    
    st.markdown("##### Horas: BOA → Clases real → Clases Unidades Didácticas")
    cf_a, cf_b, cf_c = st.columns(3)
    with cf_a:
        with st.container(border=True):
            st.metric("H. BOA", f"{st.session_state.info_modulo.get('h_boa', 0)} h")
    with cf_b:
        with st.container(border=True):
            st.metric("H. Clases real", f"{horas_reales} h")
    with cf_c:
        with st.container(border=True):
            _h_clases_ud = int(st.session_state.df_ud["horas_ud"].sum()) if not st.session_state.df_ud.empty and "horas_ud" in st.session_state.df_ud.columns else 0
            st.metric("H. Clases UD", f"{_h_clases_ud} h")
    
    st.divider()
    c_ud1, c_ud2 = st.columns([3, 1])
    with c_ud1:
        st.subheader("📚 UD. Unidades Didácticas")
    with c_ud2:
        badge_ud = st.empty()
    lista_ra_ids = st.session_state.df_ra["id_ra"].tolist()
    
    # Sincronizar columnas de UD con RA actuales
    # 1. Asegurar que las columnas básicas existan
    columnas_basicas = ["id_ud", "horas_ud", "desc_ud"]
    for col in columnas_basicas:
        if col not in st.session_state.df_ud.columns:
            st.session_state.df_ud[col] = "" if col != "horas_ud" else 0
    
    # 2. Añadir nuevas columnas de RA si no existen y forzar numérico ocultando ceros visualmente
    for ra in lista_ra_ids:
        if ra not in st.session_state.df_ud.columns:
            st.session_state.df_ud[ra] = 0.0
        else:
            # Convertir antiguos valores a float
            st.session_state.df_ud[ra] = pd.to_numeric(st.session_state.df_ud[ra], errors="coerce").fillna(0.0).astype(float)
            
    # 3. Eliminar columnas de RA que ya no existen
    cols_a_borrar = [c for c in st.session_state.df_ud.columns if c not in lista_ra_ids and c not in columnas_basicas]
    if cols_a_borrar:
        st.session_state.df_ud = st.session_state.df_ud.drop(columns=cols_a_borrar)
    
    config_ud = {
        "id_ud": st.column_config.TextColumn("ID-UD", width="small", disabled=True, pinned=True),
        "horas_ud": st.column_config.NumberColumn("Horas", width="small", min_value=0, pinned=True),
        "desc_ud": st.column_config.TextColumn("Unidades didácticas", pinned=True)
    }
    
    for ra in lista_ra_ids:
        ra_pond = 0.0
        if not st.session_state.df_ra.empty:
            match_ra = st.session_state.df_ra[st.session_state.df_ra["id_ra"] == ra]
            if not match_ra.empty:
                ra_pond = match_ra.iloc[0].get("peso_ra", 0.0)
                
        config_ud[ra] = st.column_config.NumberColumn(
            f"{ra[2:]} ({ra_pond}%)", 
            width="small",
            min_value=0.0,
            max_value=100.0,
            step=1,
            format="%d %%"
        )
    
    # Preparamos un DataFrame puramente visual para que los ceros sean celdas vacías nativas de NumberColumn
    df_visual = st.session_state.df_ud.copy()
    for ra in lista_ra_ids:
        df_visual[ra] = pd.to_numeric(df_visual[ra], errors="coerce").astype(float)
        # Sustituimos los ceros por None para que NumberColumn los dibuje vacíos
        df_visual[ra] = df_visual[ra].replace(0.0, None)
    
    ed_ud = st.data_editor(df_visual, column_config=config_ud, num_rows="dynamic", hide_index=True, width="stretch", height=(len(st.session_state.df_ud) + 1) * 35 + 39, key="tabla_ud")
    
    # Manejo de nuevas UD
    if len(ed_ud) > len(st.session_state.df_ud):
        new_id_ud = generar_siguiente_id(st.session_state.df_ud, "UD")
        ed_ud.iloc[-1, 0] = new_id_ud
        
    for ra in lista_ra_ids:
        # Al ser un NumberColumn siempre nos devolverá float o None
        ed_ud[ra] = pd.to_numeric(ed_ud[ra], errors="coerce").fillna(0.0).astype(float)
        
    st.session_state.df_ud = ed_ud
    
    suma_ud = float(st.session_state.df_ud["horas_ud"].sum()) if not st.session_state.df_ud.empty else 0.0
    badge_ud.markdown(badge(suma_ud - horas_reales, suma_ud, " h", invert=True), unsafe_allow_html=True)
    
    # ---- VALIDACIÓN DE PORCENTAJES DE LA MATRIZ UD-RA ----
    if not ed_ud.empty:
        for ra in lista_ra_ids:
            ra_pond_esperada = 0.0
            if not st.session_state.df_ra.empty:
                match_ra = st.session_state.df_ra[st.session_state.df_ra["id_ra"] == ra]
                if not match_ra.empty:
                    ra_pond_esperada = float(match_ra.iloc[0].get("peso_ra", 0.0))
            
            # Sumar lo que se ha asignado a este RA en las distintas UDs
            suma_asignada = float(ed_ud[ra].sum())
            
            # Comparamos si difiere en más de 0.01 por temas de redondeo flotante
            if abs(suma_asignada - ra_pond_esperada) > 0.01:
                st.warning(f"⚠️ **{ra}:** Has repartido un **{suma_asignada:.1f}%** entre las Unidades, pero el valor total del RA es **{ra_pond_esperada:.1f}%**. Revisalo para que cuadren.")
    
    st.divider()
    
    st.subheader("🧩 CE. Criterios de Evaluación")
    
    with st.expander("➕ Añadir nuevo Criterio de evaluación", expanded=False):
        st.caption("Las UDs vinculadas se calculan automáticamente desde la matriz RA→UD.")
        with st.form("form_nuevo_ce"):
            # Fila 1: RA | FEOE | ID-CE | % CE
            fc1, fc2, fc3, fc4 = st.columns([3, 1, 3, 1])
            with fc1:
                f_ra = st.selectbox("RA asociado", options=st.session_state.df_ra["id_ra"].tolist() if not st.session_state.df_ra.empty else [""])
            with fc2:
                f_feoe = st.checkbox("FEOE", value=False)
            with fc3:
                f_id_ce = st.text_input("ID-CE")
            with fc4:
                f_peso = st.number_input("% CE", min_value=0, max_value=100, step=1, value=0)
    
            # Fila 3: OG + CPE
            fc5, fc6 = st.columns(2)
            with fc5:
                f_og = st.text_input("OG vinculado")
            with fc6:
                f_cpe = st.text_input("CPE vinculada")
    
            # Descripción completa
            f_desc = st.text_area("Criterio de Evaluación", height=90, placeholder="Descripción completa del criterio…")
    
            submit_ce = st.form_submit_button("➕ Añadir Criterio", type="primary", use_container_width=True)
            if submit_ce:
                if f_id_ce.strip() == "":
                    st.error("El ID-CE es obligatorio.")
                else:
                    nuevo_ce = {
                        "id_ra": f_ra,
                        "id_ce": f_id_ce,
                        "peso_ce": f_peso,
                        "feoe": f_feoe,
                        "id_ud": _ud_por_ra.get(f_ra, ""),
                        "desc_ce": f_desc,
                        "og_vinc": f_og,
                        "cpe_vinc": f_cpe,
                    }
                    st.session_state.df_ce = pd.concat([st.session_state.df_ce, pd.DataFrame([nuevo_ce])], ignore_index=True)
                    st.rerun()
    
    
    # ── Asegurar que feoe exista en df_ce ────────────────────
    if "feoe" not in st.session_state.df_ce.columns:
        st.session_state.df_ce["feoe"] = False
    
    # ── Calcular UD por RA desde df_ud (columnas dinámicas) ────
    # df_ud tiene columnas: id_ud, horas_ud, desc_ud, RA1, RA2...
    _ra_ids = st.session_state.df_ra["id_ra"].tolist() if not st.session_state.df_ra.empty else []
    _ud_por_ra = {}  # {"RA1": "UD01, UD03", ...}
    for _ra in _ra_ids:
        if _ra in st.session_state.df_ud.columns:
            _uds = st.session_state.df_ud.loc[
                pd.to_numeric(st.session_state.df_ud[_ra], errors="coerce").fillna(0) > 0,
                "id_ud"
            ].tolist()
            _ud_por_ra[_ra] = ", ".join(str(u) for u in _uds) if _uds else ""
    
    columnas_config_ce = {
        "id_ra":   st.column_config.SelectboxColumn("RA", options=st.session_state.df_ra["id_ra"].tolist()),
        "id_ce":   st.column_config.TextColumn("ID-CE"),
        "peso_ce": st.column_config.NumberColumn("% CE", min_value=0, max_value=100, step=1),
        "feoe":    st.column_config.CheckboxColumn("FEOE", width="small"),
        "_ud_calc": st.column_config.TextColumn("UD", disabled=True, width="medium"),
        "desc_ce": st.column_config.TextColumn("Criterios de evaluación"),
        "og_vinc": st.column_config.TextColumn("OG"),
        "cpe_vinc": st.column_config.TextColumn("CPE"),
    }
    
    columnas_ordenadas_base = ["id_ra", "id_ce", "peso_ce", "feoe", "id_ud", "desc_ce", "cpe_vinc", "og_vinc"]
    
    # Asegurar columnas base en df_ce
    for c in columnas_ordenadas_base:
        if c not in st.session_state.df_ce.columns:
            st.session_state.df_ce[c] = False if c == "feoe" else (0.0 if c == "peso_ce" else "")
    
    st.session_state.df_ce = st.session_state.df_ce[columnas_ordenadas_base]
    
    # ── Config de columnas (sin id_ra — es el encabezado del expander) ──
    columnas_config_ce_ra = {
        "id_ce":    st.column_config.TextColumn("ID-CE", width="small"),
        "peso_ce":  st.column_config.NumberColumn("% CE", min_value=0, max_value=100, step=1, width="small"),
        "feoe":     st.column_config.CheckboxColumn("FEOE", width="small"),
        "_ud_calc": st.column_config.TextColumn("UDs vinculadas", disabled=True),
        "desc_ce":  st.column_config.TextColumn("Criterio de Evaluación"),
        "og_vinc":  st.column_config.TextColumn("OG", width="small"),
        "cpe_vinc": st.column_config.TextColumn("CPE", width="small"),
    }
    cols_sub = ["id_ce", "peso_ce", "feoe", "_ud_calc", "desc_ce", "og_vinc", "cpe_vinc"]
    
    # ── Expander por RA ────────────────────────────────────────
    df_ce_nuevo = []
    _changed_ce = False
    
    for _ra_row in st.session_state.df_ra.itertuples():
        _ra_id   = _ra_row.id_ra
        _ra_desc = getattr(_ra_row, "desc_ra", "")
        _mask = st.session_state.df_ce["id_ra"].astype(str) == str(_ra_id)
        _df_ra_ce = st.session_state.df_ce[_mask].copy().reset_index(drop=True)
    
        # Calcular UD y % suma para el encabezado
        _suma_ra = pd.to_numeric(_df_ra_ce["peso_ce"], errors="coerce").fillna(0).sum()
        _ud_str  = _ud_por_ra.get(_ra_id, "—")
        _n_ce    = len(_df_ra_ce)
        _label   = f"🧩 {_ra_id}  ·  {_n_ce} CE  ·  Σ {_suma_ra:.0f}%  ·  UDs: {_ud_str}"
        _warn    = "  ⚠️" if abs(_suma_ra - 100) > 0.5 and _n_ce > 0 else ""
    
        with st.expander(f"{_label}{_warn}", expanded=False):
            if abs(_suma_ra - 100) > 0.5 and _n_ce > 0:
                st.warning(f"La suma de % CE para {_ra_id} es {_suma_ra:.0f}% — debería ser 100%")
    
            # Preparar display
            _df_disp = _df_ra_ce.copy()
            _df_disp["_ud_calc"] = _ud_por_ra.get(_ra_id, "")
            _df_disp = _df_disp[cols_sub]
    
            _ed = st.data_editor(
                _df_disp,
                column_config=columnas_config_ce_ra,
                num_rows="dynamic",
                hide_index=True,
                use_container_width=True,
                key=f"tabla_ce_{_ra_id}",
                disabled=ro_pd
            )
    
            # Detectar cambios
            _ed_base = _ed.drop(columns=["_ud_calc"], errors="ignore")
            _orig_base = _df_ra_ce[["id_ce","peso_ce","feoe","desc_ce","og_vinc","cpe_vinc"]]
            if not _ed_base.reset_index(drop=True).equals(_orig_base.reset_index(drop=True)):
                _changed_ce = True
    
            # Reconstruir filas con id_ra
            _ed_save = _ed.drop(columns=["_ud_calc"], errors="ignore").copy()
            _ed_save["id_ra"] = _ra_id
            _ed_save["id_ud"] = _ud_por_ra.get(_ra_id, "")
            _ed_save = _ed_save[columnas_ordenadas_base]
            df_ce_nuevo.append(_ed_save)
    
    # Filas sin RA asignado (si las hay)
    _sin_ra = st.session_state.df_ce[~st.session_state.df_ce["id_ra"].isin(_ra_ids)].copy()
    if not _sin_ra.empty:
        df_ce_nuevo.append(_sin_ra[columnas_ordenadas_base])
    
    if _changed_ce:
        st.session_state.df_ce = pd.concat(df_ce_nuevo, ignore_index=True) if df_ce_nuevo else st.session_state.df_ce.iloc[0:0]
    
    
    
    
    # --- PESTAÑA: FECHAS ---
