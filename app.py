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
    st.markdown(f"""
        <div style="text-align: center; margin-bottom: 40px; margin-top: 50px;">
            <h1 style="color: white; font-weight: 800; font-size: 3.5rem; letter-spacing: -1px;">CDD <span style="color: #14a085;">PRO</span></h1>
            <p style="color: #9ca3af; font-size: 1.2rem;">Cuaderno Digital Docente para Ciclos Formativos</p>
        </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        role = st.selectbox("Perfil de acceso", ["Docente", "Alumnado"], key="login_role")
        
        if role == "Docente":
            pwd = st.text_input("Contraseña de acceso", type="password", key="login_pwd")
            if st.button("Entrar al Sistema", use_container_width=True, type="primary"):
                if pwd == "docente2025":
                    st.session_state.auth["logged_in"] = True
                    st.session_state.auth["role"] = "docente"
                    st.success("Acceso concedido")
                    st.rerun()
                else:
                    st.error("Contraseña incorrecta")
        else:
            email = st.text_input("Correo Institucional", key="login_email", placeholder="ejemplo@educa.jcyl.es")
            if st.button("Acceder como Alumno/a", use_container_width=True, type="primary"):
                if not st.session_state.df_al.empty and "email" in st.session_state.df_al.columns:
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
                        st.error("Correo no encontrado en la lista oficial.")
                else:
                    st.error("Lista de alumnado no disponible.")
        st.markdown('</div>', unsafe_allow_html=True)

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
    opciones_globales = ["Gestión de archivos", "Introducción y planes", "Calendario académico", "Descargas PDF"]
    opciones_pd = [
        "Módulo didáctico", "Matrices RA → CE → UD",
        "Instrumentos de evaluación",
        "Programación de aula"
    ]
    opciones_curso = [
        "Seguimiento diario", "Matrícula alumnado", "Calificación académica",
        "Calificación FEOE", "Evaluación continua", "Análisis de grupo"
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

    
    if st.session_state.auth["role"] != "alumno":
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
                background: rgba(20, 160, 133, 0.1);
                backdrop-filter: blur(5px);
                border-radius: 12px;
                padding: 12px;
                margin-bottom: 15px;
                margin-top: 10px;
                border: 1px solid rgba(20, 160, 133, 0.3);
            ">
                <div style="font-size:0.65rem; color:#14a085; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:4px;">
                    💎 Módulo Activo
                </div>
                <div style="font-size:0.9rem; color:#ffffff; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="{_modulo_nombre}">
                    {_modulo_nombre}
                </div>
                <div style="font-size:0.75rem; color:#9ca3af; margin-top:2px; font-family: monospace;">
                    {_modulo_archivo}.json
                </div>
                {f'<div style="font-size:0.7rem; color:#14a085; margin-top:8px; font-weight:500;">{_autosave_label}</div>' if _autosave_label else ''}
            </div>
            """,
            unsafe_allow_html=True
        )
        # --- FIN MEJORAS #8 / #1 ---

        st.markdown('<p class="user-subtitle">(c) Rafael Sanz Prades</p>', unsafe_allow_html=True)

        
# ==========================================
# Cabecera de página estilizada
st.markdown(f'<div class="pestaña-header"><h2>{menu}</h2></div>', unsafe_allow_html=True)

# --- MEJORA #9: Banner + CSS overlay de solo lectura ---
if st.session_state.auth["role"] != "alumno":
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
# DISPATCHER DE PÁGINAS (ACTUALIZADO)
# ==========================================
from pages_ui import (
    modulo_didactico, matrices, calendario_academico, 
    matricula_alumnado, seguimiento_diario, instrumentos, 
    calificacion_feoe, calificacion_academica, evaluacion_continua, 
    programacion_aula, introduccion_planes, portal_alumnado, 
    descargas_pdf, gestion_modulos, analisis_grupal
)

if st.session_state.auth["role"] == "alumno":
    if menu == "Mi Progreso":
        portal_alumnado.render_portal_alumnado(st.session_state.auth["user_id"])
    elif menu == "Simulador de Notas":
        portal_alumnado.render_simulador_notas(st.session_state.auth["user_id"])
    st.stop()

if menu == 'Gestión de archivos':
    gestion_modulos.render_gestion_modulos()
elif menu == 'Módulo didáctico':
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
elif menu == 'Análisis de grupo':
    analisis_grupal.render_analiticas(ro_pd, ro_curso, ro_global)
elif menu == 'Programación de aula':
    programacion_aula.render_programacion_aula(ro_pd, ro_curso, ro_global)
elif menu == 'Introducción y planes':
    introduccion_planes.render_introduccion_planes(ro_pd, ro_curso, ro_global)
elif menu == 'Descargas PDF':
    descargas_pdf.render_descargas_pdf(ro_pd, ro_curso, ro_global)
