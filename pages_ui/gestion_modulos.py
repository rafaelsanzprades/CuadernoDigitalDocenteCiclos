import streamlit as st
import os
import pandas as pd
from datetime import datetime, timedelta
from storage_manager import cargar_pd, cargar_curso, cargar_datos, guardar_pd, guardar_curso

def render_gestion_modulos():
    st.title("📚 Gestión de Módulos y Archivos")
    st.markdown("Carga, guarda y administra los archivos de programación y curso.")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("🗒️ Programación Didáctica (PD)")
        st.info("La PD contiene la estructura del módulo: RAs, CEs, UDs e instrumentos.")
        
        _pd_files = sorted([f for f in os.listdir(".") if f.endswith("-pd.json")])
        _pd_disp = _pd_files or [f for f in os.listdir(".") if f.endswith(".json") and f != "ciclos-fp.json"]
        _pd_def = next((i for i, f in enumerate(_pd_disp) if st.session_state.get("active_pd", "") + ".json" == f), 0)
        
        sel_pd = st.selectbox("Seleccionar archivo PD", _pd_disp, index=min(_pd_def, max(0, len(_pd_disp)-1)),
                              key="page_sel_pd")
        
        c1, c2 = st.columns(2)
        with c1:
            if st.button("📂 Cargar PD", use_container_width=True, type="primary"):
                st.session_state.confirm_load_pd = sel_pd
        
        if st.session_state.get("confirm_load_pd"):
            st.warning(f"⚠️ ¿Cargar `{st.session_state.confirm_load_pd}`? Se perderán los cambios no guardados en la PD actual.")
            cp1, cp2 = st.columns(2)
            if cp1.button("✅ Confirmar Carga", type="primary", use_container_width=True):
                _f = st.session_state.confirm_load_pd
                if _f.endswith("-pd.json"):
                    cargar_pd(_f)
                    st.session_state.active_pd = _f.replace(".json", "")
                else:
                    cargar_datos(_f)
                    st.session_state.active_pd = _f.replace(".json", "") + "-pd"
                st.session_state.active_module = st.session_state.active_pd.replace("-pd", "")
                st.session_state.confirm_load_pd = None
                st.rerun()
            if cp2.button("❌ Cancelar", use_container_width=True):
                st.session_state.confirm_load_pd = None
                st.rerun()
        
        st.divider()
        st.markdown("**Guardar PD actual**")
        _n_pd = st.text_input("Nombre del archivo PD", value=st.session_state.get("active_pd", "nuevo-modulo-pd"),
                              key="page_save_name_pd")
        if st.button("💾 Guardar PD", use_container_width=True):
            _n_pd_clean = _n_pd.replace(".json", "")
            while _n_pd_clean.endswith("-pd"): _n_pd_clean = _n_pd_clean[:-3]
            guardar_pd(_n_pd_clean)
            st.session_state.active_pd = _n_pd_clean + "-pd"
            st.session_state.active_module = _n_pd_clean
            st.success(f"✅ PD guardada como: {_n_pd_clean}-pd.json")

    with col2:
        st.subheader("📅 Datos del Curso")
        st.info("El archivo de curso contiene el alumnado, notas, seguimiento diario y faltas.")
        
        _cur_files = sorted([f for f in os.listdir(".") if f.endswith(".json")
                             and not f.endswith("-pd.json") and f != "ciclos-fp.json"])
        _cur_def = next((i for i, f in enumerate(_cur_files) if st.session_state.get("active_curso", "") + ".json" == f), 0)
        
        sel_cur = st.selectbox("Seleccionar archivo de Curso", _cur_files, index=min(_cur_def, max(0, len(_cur_files)-1)),
                               key="page_sel_cur")
        
        c3, c4 = st.columns(2)
        with c3:
            if st.button("📂 Cargar Curso", use_container_width=True, type="primary"):
                st.session_state.confirm_load_cur = sel_cur
                
        if st.session_state.get("confirm_load_cur"):
            st.warning(f"⚠️ ¿Cargar `{st.session_state.confirm_load_cur}`? Se perderán los cambios en el curso actual.")
            cc1, cc2 = st.columns(2)
            if cc1.button("✅ Confirmar Carga Curso", type="primary", use_container_width=True):
                _fc = st.session_state.confirm_load_cur
                cargar_curso(_fc)
                st.session_state.active_curso = _fc.replace(".json", "")
                st.session_state.confirm_load_cur = None
                st.rerun()
            if cc2.button("❌ Cancelar Carga", use_container_width=True):
                st.session_state.confirm_load_cur = None
                st.rerun()
                
        st.divider()
        st.markdown("**Guardar Curso actual**")
        _n_cur = st.text_input("Nombre del archivo de Curso", value=st.session_state.get("active_curso", "nuevo-modulo-curso"),
                               key="page_save_name_cur")
        if st.button("💾 Guardar Curso", use_container_width=True):
            guardar_curso(_n_cur)
            st.session_state.active_curso = _n_cur
            st.success(f"✅ Curso guardado como: {_n_cur}.json")

    st.divider()
    
    # Validador de coherencia (movido de la barra lateral para mayor visibilidad)
    st.subheader("🛡️ Validador de Coherencia")
    _val_avisos = []
    _h_ud = int(st.session_state.df_ud["horas_ud"].sum()) if (
        "df_ud" in st.session_state and not st.session_state.df_ud.empty
        and "horas_ud" in st.session_state.df_ud.columns
    ) else 0
    _dias_semana = ["Lun", "Mar", "Mié", "Jue", "Vie"]
    _h_reales = 0
    for _tri in ["1t", "2t", "3t"]:
        _ini_tri = st.session_state.info_fechas.get(f"ini_{_tri}")
        _fin_tri = st.session_state.info_fechas.get(f"fin_{_tri}")
        if not _ini_tri or not _fin_tri: continue
        _cur = _ini_tri
        while _cur <= _fin_tri:
            if _cur.weekday() < 5:
                _f_str = _cur.strftime("%d/%m/%Y")
                if not st.session_state.calendar_notes.get(f"f_{_f_str}"):
                    _h_reales += st.session_state.horario.get(_dias_semana[_cur.weekday()], 0)
            _cur += timedelta(days=1)
            
    if _h_ud > 0 and _h_reales > 0 and _h_ud != _h_reales:
        _diff_h = _h_ud - _h_reales
        _val_avisos.append(f"{'🔴' if _diff_h > 0 else '🟡'} Horas: UDs={_h_ud}h vs lectivas={_h_reales}h ({'exceden' if _diff_h > 0 else 'sobran'} {abs(_diff_h)}h)")
    
    _trimestres = [("1t","1T"), ("2t","2T"), ("3t","3T")]
    for _key, _label in _trimestres:
        _ini = st.session_state.info_fechas.get(f"ini_{_key}")
        _fin = st.session_state.info_fechas.get(f"fin_{_key}")
        if not _ini or not _fin: _val_avisos.append(f"🔴 {_label}: fechas vacías")
        elif _fin < _ini: _val_avisos.append(f"🔴 {_label}: fin anterior al inicio")

    if _val_avisos:
        for _av in _val_avisos:
            st.error(_av) if "🔴" in _av else st.warning(_av)
    else:
        st.success("🟢 La programación es coherente con el calendario.")
