# -*- coding: utf-8 -*-
import streamlit as st
import pandas as pd
from datetime import datetime, date, timedelta
from schemas import df_ra_empty, df_ud_empty, df_ce_empty, df_act_empty
import calendar
import json
import os

# ==========================================
# 1. CONFIGURACIÓN DE PÁGINA
# ==========================================

# ==========================================
from pdf_calendario_academico import generar_pdf_calendario
from pdf_seguimiento_diario import generar_pdf_seguimiento


from pdf_boletin_grupal import generar_pdf_boletin_grupal, generar_pdf_boletin_grupal_final
from pdf_boletin_individual import generar_pdf_boletin_individual
from pdf_planificacion import generar_pdf_planificacion
from storage_manager import serialize_date, unserialize_date, guardar_global, cargar_global, guardar_pd, cargar_pd, guardar_curso, cargar_curso, guardar_datos, cargar_datos




# ==========================================
# 3. FUNCIONES DE LÓGICA Y CÁLCULO
# ==========================================
from utils_logic import generar_siguiente_id, calcular_horas_reales, procesar_lista_alumnado, repartir_horas_previstas

from state_manager import inicializar_estado

# ==========================================
# 4. INICIALIZACIÓN DE DATOS (ESTADO DE SESIÓN)
# ==========================================
inicializar_estado()


# --- CARGAR FICHEROS POR DEFECTO ---
if 'app_init_done' not in st.session_state:
    st.session_state.app_init_done = True
    # Buscar primero archivos -pd.json (nuevo formato)
    pd_files = [f for f in os.listdir(".") if f.endswith("-pd.json")]
    curso_files = [f for f in os.listdir(".") if f.endswith(".json")
                   and not f.endswith("-pd.json") and f != "ciclos-fp.json"]
    if pd_files:
        _pd_file = pd_files[0]
        st.session_state.active_pd = _pd_file.replace(".json", "")
        cargar_pd(_pd_file)
        # Intentar cargar el Curso asociado
        _curso_guess = _pd_file.replace("-pd.json", "-curso-2025-26.json")
        if os.path.exists(_curso_guess):
            st.session_state.active_curso = _curso_guess.replace(".json", "")
            cargar_curso(_curso_guess)
        else:
            st.session_state.active_curso = _pd_file.replace("-pd.json", "-curso-2025-26")
        st.session_state.active_module = st.session_state.active_pd.replace("-pd", "")
    elif curso_files:
        # Formato legacy: un solo JSON
        _leg_file = "0237-ictve.json" if "0237-ictve.json" in curso_files else curso_files[0]
        _base = _leg_file.replace(".json", "")
        st.session_state.active_module = _base
        st.session_state.active_pd = _base + "-pd"
        st.session_state.active_curso = _base + "-curso-2025-26"
        cargar_datos(_leg_file)
    else:
        st.session_state.active_module = "nuevo-modulo"
        st.session_state.active_pd = "nuevo-modulo-pd"
        st.session_state.active_curso = "nuevo-modulo-curso-2025-26"

if 'active_pd' not in st.session_state:
    st.session_state.active_pd = st.session_state.get("active_module", "nuevo-modulo") + "-pd"
if 'active_curso' not in st.session_state:
    st.session_state.active_curso = st.session_state.get("active_module", "nuevo-modulo") + "-curso-2025-26"


# ==========================================
# 4.5 LÓGICA DE AUTENTICACIÓN
# ==========================================
def render_login():
    st.markdown("""
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0d7377;">Cuaderno Digital Docente</h1>
            <p style="color: #666;">Acceso al sistema</p>
        </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        with st.container(border=True):
            role = st.selectbox("Perfil de acceso", ["Docente", "Alumnado"], key="login_role")
            
            if role == "Docente":
                pwd = st.text_input("Contraseña", type="password", key="login_pwd")
                if st.button("Entrar como Docente", use_container_width=True, type="primary"):
                    if pwd == "docente2025": # Contraseña base configurada
                        st.session_state.auth["logged_in"] = True
                        st.session_state.auth["role"] = "docente"
                        st.success("Acceso concedido")
                        st.rerun()
                    else:
                        st.error("Contraseña incorrecta")
            else:
                email = st.text_input("Correo electrónico institucional", key="login_email")
                if st.button("Entrar como Alumno/a", use_container_width=True, type="primary"):
                    if not st.session_state.df_al.empty and "email" in st.session_state.df_al.columns:
                        # Buscar por email
                        match = st.session_state.df_al[st.session_state.df_al["email"].str.lower() == email.lower()]
                        if not match.empty:
                            user_data = match.iloc[0]
                            st.session_state.auth["logged_in"] = True
                            st.session_state.auth["role"] = "alumno"
                            st.session_state.auth["user_id"] = user_data["ID"]
                            st.session_state.auth["user_email"] = user_data["email"]
                            st.success(f"Bienvenido/a, {user_data['Nombre']}")
                            st.rerun()
                        else:
                            st.error("Correo no encontrado en la lista de matriculados")
                    else:
                        st.error("No hay lista de alumnado cargada. Contacte con el docente.")

if not st.session_state.auth["logged_in"]:
    render_login()
    st.stop()

# ==========================================
# 5. INTERFAZ: MENÚ LATERAL Y ESTILOS
# ==========================================
import os
if os.path.exists("assets/style.css"):
    with open("assets/style.css", "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

with st.sidebar:
    st.title("Cuaderno Digital Docente Ciclos")





    # 5.1 Menú de Navegación (3 bloques)
    opciones_globales = ["Introducción y planes", "Calendario académico"]
    opciones_pd = [
        "Módulo didáctico", "Matrices RA → CE → UD",
        "Instrumentos de evaluación",
        "Programación de aula"
    ]
    opciones_curso = [
        "Seguimiento diario", "Matrícula alumnado", "Calificación académica",
        "Calificación FEOE", "Evaluación continua"
    ]
    
    if st.session_state.auth["role"] == "alumno":
        opciones_totales = ["Mi Progreso", "Simulador de Notas"]
        st.session_state.menu = st.session_state.menu if st.session_state.menu in opciones_totales else "Mi Progreso"
    else:
        opciones_totales = opciones_globales + opciones_pd + opciones_curso

    # Redirecciones de nombres obsoletos
    if st.session_state.menu in ["Contextualización", "Planes e inclusión"]: st.session_state.menu = "Introducción y planes"
    if st.session_state.menu == "Perfil y Contexto": st.session_state.menu = "Resumen docente"
    if st.session_state.menu == "Calendario lectivo": st.session_state.menu = "Calendario Escolar"
    if st.session_state.menu == "Evaluación FEOE": st.session_state.menu = "Calificación FEOE"
    if st.session_state.menu == "Calificación numérica": st.session_state.menu = "Calificación académica"
    if st.session_state.menu == "Progreso porcentual": st.session_state.menu = "Evaluación continua"
    if st.session_state.menu not in opciones_totales:
        st.session_state.menu = "Módulo didáctico"
    st.markdown("<br>", unsafe_allow_html=True)
    
    if st.session_state.auth["role"] == "alumno":
        st.markdown("<br>", unsafe_allow_html=True)
        for opcion in ["Mi Progreso", "Simulador de Notas"]:
            if st.button(opcion, use_container_width=True,
                         type="primary" if st.session_state.menu == opcion else "secondary",
                         key=f"btn_alu_{opcion}"):
                st.session_state.menu = opcion
                st.rerun()
        
        st.divider()
        if st.button("🚪 Cerrar sesión", use_container_width=True, type="secondary"):
            st.session_state.auth = {"logged_in": False, "role": None, "user_id": None, "user_email": None}
            st.session_state.menu = "Módulo didáctico"
            st.rerun()
            
        # Saltarse el resto del renderizado del sidebar para alumnos
        menu = st.session_state.menu
    else:
        for opcion in opciones_globales:
            if st.button(opcion, use_container_width=True,
                         type="primary" if st.session_state.menu == opcion else "secondary",
                         key=f"btn_glb_{opcion}"):
                st.session_state.menu = opcion
                st.rerun()

        with st.expander("🗂️ Programación didáctica", expanded=(st.session_state.menu in opciones_pd)):
            for opcion in opciones_pd:
                if st.button(opcion, use_container_width=True,
                             type="primary" if st.session_state.menu == opcion else "secondary",
                             key=f"btn_pd_{opcion}"):
                    st.session_state.menu = opcion
                    st.rerun()

        with st.expander("📅 Curso actual", expanded=(st.session_state.menu in opciones_curso)):
            for opcion in opciones_curso:
                if st.button(opcion, use_container_width=True,
                             type="primary" if st.session_state.menu == opcion else "secondary",
                             key=f"btn_cur_{opcion}"):
                    st.session_state.menu = opcion
                    st.rerun()
        
        if st.button("🚪 Cerrar sesión", use_container_width=True, type="secondary", key="btn_logout_doc"):
            st.session_state.auth = {"logged_in": False, "role": None, "user_id": None, "user_email": None}
            st.session_state.menu = "Módulo didáctico"
            st.rerun()
        
        # Variable de control para el resto de la app
        menu = st.session_state.menu
        
    if st.session_state.auth["role"] != "alumno":
        # --- AUTOMATIZACIÓN (v5.0) ---
        # Recalcular reparto de horas automáticamente en cada interacción
        # Solo para docentes y una sola vez
        repartir_horas_previstas()
    
    ro_pd = st.session_state.lock_pd
    ro_curso = st.session_state.lock_curso
    ro_global = st.session_state.lock_global

    
    with st.expander("📥 Descargas .pdf"):
        if st.button("Generar PDF Calendario", use_container_width=True):
            pdf_buffer_cal = generar_pdf_calendario(
                st.session_state.info_modulo,
                st.session_state.info_fechas,
                st.session_state.planning_ledger,
                st.session_state.calendar_notes
            )
            st.download_button(
                label="Confirmar descarga Calendario",
                data=pdf_buffer_cal,
                file_name=f"Calendario_{st.session_state.info_modulo.get('modulo', 'Gestor')}.pdf",
                mime="application/pdf",
                type="primary",
                use_container_width=True
            )

        if st.button("Generar Seguimiento Diario", use_container_width=True):
            pdf_buffer_seg = generar_pdf_seguimiento(
                st.session_state.info_modulo,
                st.session_state.info_fechas,
                st.session_state.horario,
                st.session_state.planning_ledger,
                st.session_state.calendar_notes,
                st.session_state.df_sesiones if "df_sesiones" in st.session_state else None
            )
            st.download_button(
                label="Confirmar descarga Seguimiento",
                data=pdf_buffer_seg,
                file_name=f"Seguimiento_diario_{st.session_state.info_modulo.get('modulo', 'Gestor')}.pdf",
                mime="application/pdf",
                type="primary",
                use_container_width=True
            )

        pdf_buffer_plan = generar_pdf_planificacion(
            st.session_state.info_modulo,
            st.session_state.df_ud,
            st.session_state.df_sgmt,
            st.session_state.daily_ledger,
            st.session_state.horario,
            st.session_state.info_fechas,
            st.session_state.calendar_notes
        )
        st.download_button(
            label="Planificación mensual",
            data=pdf_buffer_plan,
            file_name=f"Planificacion_{st.session_state.info_modulo.get('modulo', 'Gestor')}.pdf",
            mime="application/pdf",
            type="secondary",
            use_container_width=True
        )


        # ── Boletines ──────────────────────────────────────────
        st.markdown("<b>Boletines grupales</b>", unsafe_allow_html=True)
        _mod_name = st.session_state.info_modulo.get('modulo', 'Grupo')

        if st.button("Generar Boletines Grupales", use_container_width=True):
            pdf_buffer_grupal_1t = generar_pdf_boletin_grupal("1T", st.session_state.info_modulo, st.session_state.df_al, st.session_state.df_eval, st.session_state.df_act)
            pdf_buffer_grupal_2t = generar_pdf_boletin_grupal("2T", st.session_state.info_modulo, st.session_state.df_al, st.session_state.df_eval, st.session_state.df_act)
            pdf_buffer_grupal_3t = generar_pdf_boletin_grupal("3T", st.session_state.info_modulo, st.session_state.df_al, st.session_state.df_eval, st.session_state.df_act)
            pdf_buffer_grupal_fin = generar_pdf_boletin_grupal_final(st.session_state.info_modulo, st.session_state.df_al, st.session_state.df_eval, st.session_state.df_act)
            
            st.download_button("Descargar 1T", pdf_buffer_grupal_1t, f"Boletin_Grupal_1T_{_mod_name}.pdf", "application/pdf", use_container_width=True)
            st.download_button("Descargar 2T", pdf_buffer_grupal_2t, f"Boletin_Grupal_2T_{_mod_name}.pdf", "application/pdf", use_container_width=True)
            st.download_button("Descargar 3T", pdf_buffer_grupal_3t, f"Boletin_Grubit_3T_{_mod_name}.pdf", "application/pdf", use_container_width=True)
            st.download_button("Descargar FINAL", pdf_buffer_grupal_fin, f"Boletin_Grupal_FINAL_{_mod_name}.pdf", "application/pdf", type="primary", use_container_width=True)

        st.markdown("<b>Boletines individuales</b>", unsafe_allow_html=True)
        if "df_al" in st.session_state and not st.session_state.df_al.empty:
            df_al_act = st.session_state.df_al[st.session_state.df_al.get("Estado", "") != "Baja"].copy() if "Estado" in st.session_state.df_al.columns else st.session_state.df_al.copy()
            df_al_sorted = df_al_act.sort_values("Apellidos").reset_index(drop=True)
            
            alum_list = df_al_sorted.apply(lambda row: f"{row.get('Apellidos', '')}, {row.get('Nombre', '')} ({row.get('ID', '')})", axis=1).tolist()
            
            alum_sel = st.selectbox("Seleccionar Alumnado", alum_list, label_visibility="collapsed")
            if alum_sel:
                # Extract ID safely
                import re
                match = re.search(r'\(([^)]+)\)$', alum_sel)
                if match:
                    al_id = match.group(1)
                    if st.button("Generar Informe Individual", use_container_width=True):
                        pdf_buffer_indiv = generar_pdf_boletin_individual(
                            info_modulo=st.session_state.info_modulo,
                            al_id=al_id,
                            df_al=st.session_state.df_al,
                            df_eval=st.session_state.df_eval,
                            df_act=st.session_state.df_act,
                            df_ce=st.session_state.df_ce,
                            df_ra=st.session_state.df_ra,
                            df_feoe=st.session_state.get("df_feoe", pd.DataFrame()),
                            info_fechas=st.session_state.get("info_fechas", {}),
                            planning_ledger=st.session_state.get("planning_ledger", {}),
                            df_ud=st.session_state.get("df_ud", pd.DataFrame()),
                            df_pr=st.session_state.get("df_pr", pd.DataFrame())
                        )
                        st.download_button(
                            label="Confirmar descarga Informe",
                            data=pdf_buffer_indiv,
                            file_name=f"Informe_Individual_{al_id}_{_mod_name}.pdf",
                            mime="application/pdf",
                            type="primary",
                            use_container_width=True
                        )
        else:
            st.info("Sin estudiantes activos para generar informes individuales.")
            

    # --- MEJORA #8 + MEJORA #1: Indicador visual de módulo activo + autoguardado ---
    _modulo_nombre = st.session_state.info_modulo.get("modulo", "") or "—"
    _modulo_archivo = st.session_state.get("active_module", "—")

    # Lógica autoguardado
    _autosave_label = ""
    _now = datetime.now()
    _elapsed = (_now - st.session_state.autosave_last).total_seconds() / 60
    _can_autosave = (_modulo_archivo not in ("", "nuevo-modulo", "—"))
    if _can_autosave and _elapsed >= st.session_state.autosave_interval_min:
        guardar_datos(_modulo_archivo)
        st.session_state.autosave_last = _now
        st.session_state.autosave_msg = f"✅ Autoguardado a las {_now.strftime('%H:%M')}"
    if st.session_state.autosave_msg:
        _autosave_label = st.session_state.autosave_msg

    st.markdown(
        f"""
        <div style="
            background: linear-gradient(135deg, #0d7377 0%, #0a5c60 100%);
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 12px;
            margin-top: 10px;
            border: 1px solid #14a085;
        ">
            <div style="font-size:0.68rem; color:#9ee8e0; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:2px;">
                💾 Módulo activo
            </div>
            <div style="font-size:0.92rem; color:#ffffff; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="{_modulo_nombre}">
                {_modulo_nombre}
            </div>
            <div style="font-size:0.72rem; color:#9ee8e0; margin-top:2px;">
                📄 {_modulo_archivo}.json
            </div>
            {f'<div style="font-size:0.7rem; color:#b2f0e8; margin-top:4px;">{_autosave_label}</div>' if _autosave_label else ''}
        </div>
        """,
        unsafe_allow_html=True
    )
    # --- FIN MEJORAS #8 / #1 ---

    # 5.2 Gestión de Archivos
    with st.expander("📚 Gestión de módulos"):
        _pd_files = sorted([f for f in os.listdir(".") if f.endswith("-pd.json")])
        _cur_files = sorted([f for f in os.listdir(".") if f.endswith(".json")
                             and not f.endswith("-pd.json") and f != "ciclos-fp.json"])
        st.markdown("**🗒️ Programación Didáctica**")
        _pd_disp = _pd_files or [f for f in os.listdir(".") if f.endswith(".json") and f != "ciclos-fp.json"]
        _pd_def = next((i for i, f in enumerate(_pd_disp) if st.session_state.get("active_pd", "") + ".json" == f), 0)
        sel_pd = st.selectbox("PD archivo", _pd_disp, index=min(_pd_def, max(0, len(_pd_disp)-1)),
                              label_visibility="collapsed", key="load_sel_pd") if _pd_disp else None
        if sel_pd and st.button("📂 Cargar PD", use_container_width=True):
            st.session_state.confirm_load_pd = sel_pd
        if st.session_state.get("confirm_load_pd"):
            st.warning(f"⚠️ Cargar `{st.session_state.confirm_load_pd}` (se perderán cambios PD). ¿Seguro?")
            cp1, cp2 = st.columns(2)
            if cp1.button("✅ Sí", type="primary", use_container_width=True, key="conf_load_pd_btn"):
                _f = st.session_state.confirm_load_pd
                if _f.endswith("-pd.json"):
                    cargar_pd(_f); st.session_state.active_pd = _f.replace(".json", "")
                else:
                    cargar_datos(_f); st.session_state.active_pd = _f.replace(".json", "") + "-pd"
                st.session_state.active_module = st.session_state.active_pd.replace("-pd", "")
                st.session_state.confirm_load_pd = None; st.rerun()
            if cp2.button("❌ No", use_container_width=True, key="canc_load_pd"):
                st.session_state.confirm_load_pd = None; st.rerun()
        _n_pd = st.text_input("Nombre PD", value=st.session_state.get("active_pd", "0237-ictve-pd"),
                              label_visibility="collapsed", key="save_name_pd")
        if st.button("💾 Guardar PD", use_container_width=True):
            _n_pd_clean = _n_pd.replace(".json", "")
            while _n_pd_clean.endswith("-pd"): _n_pd_clean = _n_pd_clean[:-3]
            guardar_pd(_n_pd_clean)
            st.session_state.active_pd = _n_pd_clean + "-pd"
            st.session_state.active_module = _n_pd_clean
            st.success(f"✅ PD guardada: {_n_pd_clean}-pd.json")
        st.markdown('<hr style="border:none;border-top:1px solid #444;margin:10px 0">', unsafe_allow_html=True)
        st.markdown("**📅 Curso actual**")
        _cur_def = next((i for i, f in enumerate(_cur_files) if st.session_state.get("active_curso", "") + ".json" == f), 0)
        sel_cur = st.selectbox("Curso archivo", _cur_files, index=min(_cur_def, max(0, len(_cur_files)-1)),
                               label_visibility="collapsed", key="load_sel_cur") if _cur_files else None
        if sel_cur and st.button("📂 Cargar Curso", use_container_width=True):
            st.session_state.confirm_load_cur = sel_cur
        if st.session_state.get("confirm_load_cur"):
            st.warning(f"⚠️ Cargar `{st.session_state.confirm_load_cur}`. ¿Seguro?")
            cc1, cc2 = st.columns(2)
            if cc1.button("✅ Sí", type="primary", use_container_width=True, key="conf_load_cur_btn"):
                _fc = st.session_state.confirm_load_cur
                cargar_curso(_fc); st.session_state.active_curso = _fc.replace(".json", "")
                st.session_state.confirm_load_cur = None; st.rerun()
            if cc2.button("❌ No", use_container_width=True, key="canc_load_cur"):
                st.session_state.confirm_load_cur = None; st.rerun()
        _n_cur = st.text_input("Nombre Curso", value=st.session_state.get("active_curso", "0237-ictve-curso-2025-26"),
                               label_visibility="collapsed", key="save_name_cur")
        if st.button("💾 Guardar Curso", use_container_width=True):
            guardar_curso(_n_cur); st.session_state.active_curso = _n_cur
            st.success(f"✅ Curso guardado: {_n_cur}.json")

    # --- MEJORA #7: Validador de coherencia ---
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
        if not _ini_tri or not _fin_tri:
            continue
        _cur = _ini_tri
        while _cur <= _fin_tri:
            if _cur.weekday() < 5:
                _f_str = _cur.strftime("%d/%m/%Y")
                if not st.session_state.calendar_notes.get(f"f_{_f_str}"):
                    _h_reales += st.session_state.horario.get(_dias_semana[_cur.weekday()], 0)
            _cur += timedelta(days=1)
    if _h_ud > 0 and _h_reales > 0 and _h_ud != _h_reales:
        _diff_h = _h_ud - _h_reales
        if _diff_h > 0:
            _icono = "🔴"
            _txt = f"exceden {_diff_h}h — no caben en el calendario"
        else:
            _icono = "🟡"
            _txt = f"sobran {abs(_diff_h)}h lectivas"
        _val_avisos.append(f"{_icono} Horas: UDs={_h_ud}h vs lectivas={_h_reales}h ({_txt})")
    _trimestres = [("1t","1T"), ("2t","2T"), ("3t","3T")]
    _fechas_ok = True
    for _key, _label in _trimestres:
        _ini = st.session_state.info_fechas.get(f"ini_{_key}")
        _fin = st.session_state.info_fechas.get(f"fin_{_key}")
        if not _ini or not _fin:
            _val_avisos.append(f"🔴 {_label}: fechas vacías"); _fechas_ok = False
        elif _fin < _ini:
            _val_avisos.append(f"🔴 {_label}: fin anterior al inicio"); _fechas_ok = False
    if _fechas_ok:
        for (_k1, _l1), (_k2, _l2) in [(("1t","1T"),("2t","2T")), (("2t","2T"),("3t","3T"))]:
            _fin1 = st.session_state.info_fechas.get(f"fin_{_k1}")
            _ini2 = st.session_state.info_fechas.get(f"ini_{_k2}")
            if _fin1 and _ini2 and _ini2 <= _fin1:
                _val_avisos.append(f"🟡 {_l1} y {_l2} se solapan")
    if _val_avisos:
        _val_icon = "🔴" if any(a.startswith("🔴") for a in _val_avisos) else "🟡"
        with st.expander(f"{_val_icon} Validador · {len(_val_avisos)} aviso(s)"):
            for _av in _val_avisos:
                st.markdown(f"<small>{_av}</small>", unsafe_allow_html=True)
    else:
        st.markdown('<div style="font-size:0.75rem;color:#6ee06e;margin-bottom:4px;">🟢 Programación coherente</div>',
                    unsafe_allow_html=True)

    st.markdown('<p class="user-subtitle">(c) Rafael Sanz Prades</p>', unsafe_allow_html=True)

    
# ==========================================
# Cabecera de página estilizada
st.markdown(f'<div class="pestaña-header"><h2>{menu}</h2></div>', unsafe_allow_html=True)

# --- MEJORA #9: Banner + CSS overlay de solo lectura ---
_es_seccion_global = menu in ["Introducción y planes", "Calendario académico"]
_es_seccion_pd = menu in ["Módulo didáctico", "Matrices RA → CE → UD",
                           "Instrumentos de evaluación",
                           "Resumen docente", "Programación de aula"]
_es_seccion_curso = menu in ["Seguimiento diario", "Matrícula alumnado",
                              "Calificación académica", "Calificación FEOE", "Evaluación continua"]

_, col_tit_der = st.columns([4, 1])
with col_tit_der:
    if _es_seccion_global:
        _lock_label_glb = "🔒 Bloqueado" if st.session_state.lock_global else "🔓 Activado"
        if st.button(_lock_label_glb, use_container_width=True, key="btn_lock_glb_main", type="primary" if st.session_state.lock_global else "secondary"):
            st.session_state.lock_global = not st.session_state.lock_global
            st.rerun()
    elif _es_seccion_pd:
        _lock_label_pd = "🔒 Bloqueado" if st.session_state.lock_pd else "🔓 Activado"
        if st.button(_lock_label_pd, use_container_width=True, key="btn_lock_pd_main", type="primary" if st.session_state.lock_pd else "secondary"):
            st.session_state.lock_pd = not st.session_state.lock_pd
            st.rerun()
    elif _es_seccion_curso:
        _lock_label_cur = "🔒 Bloqueado" if st.session_state.lock_curso else "🔓 Activado"
        if st.button(_lock_label_cur, use_container_width=True, key="btn_lock_cur_main", type="primary" if st.session_state.lock_curso else "secondary"):
            st.session_state.lock_curso = not st.session_state.lock_curso
            st.rerun()

if ro_global and _es_seccion_global:
    st.markdown(
        """<div style="background:#2e004f;border-left:4px solid #cc88ff;border-radius:6px;
        padding:8px 14px;margin-bottom:16px;font-size:0.9rem;color:#ddb8ff;">
        <strong>En modo solo lectura. </strong> Conmuta de "🔒 Bloqueado" a "🔓 Activado" en la parte superior derecha para editar</div>""",
        unsafe_allow_html=True
    )
    st.markdown("""<style>
    section[data-testid="stMain"] input, section[data-testid="stMain"] textarea,
    section[data-testid="stMain"] select,
    section[data-testid="stMain"] [data-testid="stDataFrameResizable"],
    section[data-testid="stMain"] [data-baseweb="select"] {
        pointer-events: none !important; opacity: 0.65 !important;
    }</style>""", unsafe_allow_html=True)

if ro_pd and _es_seccion_pd:
    st.markdown(
        """<div style="background:#2e004f;border-left:4px solid #cc88ff;border-radius:6px;
        padding:8px 14px;margin-bottom:16px;font-size:0.9rem;color:#ddb8ff;">
        <strong>En modo solo lectura. </strong> Conmuta de "🔒 Bloqueado" a "🔓 Activado" en la parte superior derecha para editar</div>""",
        unsafe_allow_html=True
    )
    st.markdown("""<style>
    section[data-testid="stMain"] input, section[data-testid="stMain"] textarea,
    section[data-testid="stMain"] select,
    section[data-testid="stMain"] [data-testid="stDataFrameResizable"],
    section[data-testid="stMain"] [data-baseweb="select"] {
        pointer-events: none !important; opacity: 0.65 !important;
    }</style>""", unsafe_allow_html=True)

if ro_curso and _es_seccion_curso:
    st.markdown(
        """<div style="background:#2e004f;border-left:4px solid #cc88ff;border-radius:6px;
        padding:8px 14px;margin-bottom:16px;font-size:0.9rem;color:#ddb8ff;">
        <strong>En modo solo lectura. </strong> Conmuta de "🔒 Bloqueado" a "🔓 Activado" en la parte superior derecha para editar</div>""",
        unsafe_allow_html=True
    )
    st.markdown("""<style>
    section[data-testid="stMain"] input, section[data-testid="stMain"] textarea,
    section[data-testid="stMain"] select,
    section[data-testid="stMain"] [data-testid="stDataFrameResizable"],
    section[data-testid="stMain"] [data-baseweb="select"] {
        pointer-events: none !important; opacity: 0.65 !important;
    }</style>""", unsafe_allow_html=True)
# --- FIN MEJORA #9 ---

from utils_ui import badge

# ==========================================
# 7. INTERFAZ: LÓGICA DE LAS PESTAÑAS
# ==========================================

# --- PESTAÑA: DATOS ---
# ==========================================
# DISPATCHER DE PÁGINAS
# ==========================================
from pages_ui import modulo_didactico, matrices, calendario_academico, matricula_alumnado, seguimiento_diario, instrumentos, calificacion_feoe, calificacion_academica, evaluacion_continua, programacion_aula, introduccion_planes, portal_alumnado

if st.session_state.auth["role"] == "alumno":
    if menu == "Mi Progreso":
        portal_alumnado.render_portal_alumnado(st.session_state.auth["user_id"])
    elif menu == "Simulador de Notas":
        portal_alumnado.render_simulador_notas(st.session_state.auth["user_id"])
    st.stop()

if menu == 'Módulo didáctico':
    modulo_didactico.render_modulo_didactico(ro_pd, ro_curso, ro_global)
elif menu == 'Matrices RA → CE → UD':
    matrices.render_matrices(ro_pd, ro_curso, ro_global)
elif menu == 'Calendario académico':
    calendario_academico.render_calendario_academico(ro_pd, ro_curso, ro_global)
elif menu == 'Matrícula alumnado':
    matricula_alumnado.render_matricula_alumnado(ro_pd, ro_curso, ro_global)
elif menu == 'Seguimiento diario':
    seguimiento_diario.render_seguimiento_diario(ro_pd, ro_curso, ro_global)
elif menu == 'Instrumentos de evaluación':
    instrumentos.render_instrumentos(ro_pd, ro_curso, ro_global)
elif menu == 'Calificación FEOE':
    calificacion_feoe.render_calificacion_feoe(ro_pd, ro_curso, ro_global)
elif menu == 'Calificación académica':
    calificacion_academica.render_calificacion_academica(ro_pd, ro_curso, ro_global)
elif menu == 'Evaluación continua':
    evaluacion_continua.render_evaluacion_continua(ro_pd, ro_curso, ro_global)
elif menu == 'Programación de aula':
    programacion_aula.render_programacion_aula(ro_pd, ro_curso, ro_global)
elif menu == 'Introducción y planes':
    introduccion_planes.render_introduccion_planes(ro_pd, ro_curso, ro_global)
