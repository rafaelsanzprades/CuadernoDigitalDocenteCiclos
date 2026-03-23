# -*- coding: utf-8 -*-
import streamlit as st
import pandas as pd
from datetime import datetime, date, timedelta
import calendar
import json
import os

# ==========================================
# 1. CONFIGURACIÓN DE PÁGINA
# ==========================================

# ==========================================
from pdf_calendario_academico import generar_pdf_calendario
from pdf_seguimiento_diario import generar_pdf_seguimiento
from pdf_boletin_competencial import generar_pdf_boletin
from pdf_programacion_aula import generar_pdf_programacion_aula
def serialize_date(obj):
    if isinstance(obj, (date, datetime)): return obj.strftime("%d/%m/%Y")
    return obj

def unserialize_date(d_str):
    for fmt in ["%d/%m/%Y", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%S"]:
        try:
            return datetime.strptime(d_str, fmt).date()
        except Exception:
            continue
    return d_str

def guardar_datos(nombre_archivo):
    if not nombre_archivo.endswith(".json"): nombre_archivo += ".json"
    
    # --- Datos Globales ---
    info_docente = {
        "centro": st.session_state.info_modulo.get("centro", ""),
        "profesorado": st.session_state.info_modulo.get("profesorado", "")
    }
    global_data = {
        "info_docente": info_docente,
        "info_fechas": {k: serialize_date(v) for k, v in st.session_state.info_fechas.items()},
        "calendar_notes": st.session_state.calendar_notes,
        "config_contexto": st.session_state.config_contexto if 'config_contexto' in st.session_state else {}
    }
    with open("ciclos-fp.json", "w", encoding="utf-8") as f:
        json.dump(global_data, f, ensure_ascii=False, indent=4)
        
    # --- Datos del Módulo ---
    info_modulo_to_save = st.session_state.info_modulo.copy()
    info_modulo_to_save.pop("centro", None)
    info_modulo_to_save.pop("profesorado", None)

    data = {
        "info_modulo": info_modulo_to_save,
        "horario": st.session_state.horario,
        "df_ra": st.session_state.df_ra.to_dict(orient="records"),
        "df_ud": st.session_state.df_ud.to_dict(orient="records"),
        "df_pr": st.session_state.df_pr.to_dict(orient="records"),
        "df_al": st.session_state.df_al.to_dict(orient="records"),
        "df_ce": st.session_state.df_ce.to_dict(orient="records") if 'df_ce' in st.session_state else [],
        "df_act": st.session_state.df_act.to_dict(orient="records") if 'df_act' in st.session_state else [],
        "df_feoe": st.session_state.df_feoe.to_dict(orient="records") if 'df_feoe' in st.session_state else [],
        "df_eval": st.session_state.df_eval.to_dict(orient="records") if 'df_eval' in st.session_state else [],
        "df_sgmt": st.session_state.df_sgmt.to_dict(orient="records") if 'df_sgmt' in st.session_state else [],
        "daily_ledger": st.session_state.daily_ledger if 'daily_ledger' in st.session_state else {},
        "planning_ledger": st.session_state.planning_ledger if 'planning_ledger' in st.session_state else {},
        "config_aula": st.session_state.config_aula if 'config_aula' in st.session_state else {},
        "df_sesiones": st.session_state.df_sesiones.to_dict(orient="records") if 'df_sesiones' in st.session_state else [],
        "df_dua": st.session_state.df_dua.to_dict(orient="records") if 'df_dua' in st.session_state else [],
        "df_contingencia": st.session_state.df_contingencia.to_dict(orient="records") if 'df_contingencia' in st.session_state else [],
        "df_ace": st.session_state.df_ace.to_dict(orient="records") if 'df_ace' in st.session_state else [],
        "df_tareas": st.session_state.df_tareas.to_dict(orient="records") if 'df_tareas' in st.session_state else [],
    }
    with open(nombre_archivo, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    return nombre_archivo

def cargar_datos(nombre_archivo):
    with open(nombre_archivo, "r", encoding="utf-8") as f:
        data = json.load(f)
    st.session_state.info_modulo = data.get("info_modulo", {})
    
    # Retrocompatibilidad de Globales vs Carga de ciclos-fp
    if os.path.exists("ciclos-fp.json"):
        with open("ciclos-fp.json", "r", encoding="utf-8") as fg:
            global_data = json.load(fg)
        st.session_state.info_fechas = {k: unserialize_date(v) for k, v in global_data.get("info_fechas", {}).items()}
        st.session_state.calendar_notes = global_data.get("calendar_notes", {})
        st.session_state.config_contexto = global_data.get("config_contexto", {"entorno": "", "perfil": "", "metodologia": ""})
        
        info_docente = global_data.get("info_docente", {})
        st.session_state.info_modulo["centro"] = info_docente.get("centro", "")
        st.session_state.info_modulo["profesorado"] = info_docente.get("profesorado", "")
    else:
        st.session_state.info_fechas = {k: unserialize_date(v) for k, v in data.get("info_fechas", {}).items()}
        st.session_state.calendar_notes = data.get("calendar_notes", {})
        st.session_state.config_contexto = data.get("config_contexto", {"entorno": "", "perfil": "", "metodologia": ""})
        # Si todavía no había ciclos-fp.json, los datos de info_modulo originales (centro, profesorado) siguen ahí

    st.session_state.horario = data.get("horario", {})
    
    st.session_state.df_ra = pd.DataFrame(data.get("df_ra", []))
    st.session_state.df_ud = pd.DataFrame(data.get("df_ud", []))
    st.session_state.df_pr = pd.DataFrame(data.get("df_pr", []))
    # Migración v6.5: Renombrar 'Nombre' a 'Práctica' y reordenar
    if not st.session_state.df_pr.empty:
        if "Nombre" in st.session_state.df_pr.columns and "Práctica" not in st.session_state.df_pr.columns:
            st.session_state.df_pr = st.session_state.df_pr.rename(columns={"Nombre": "Práctica"})
        
        # Asegurar orden: ID, UD, H, Práctica (v7.2.1)
        cols = st.session_state.df_pr.columns.tolist()
        desired_order = ["ID", "UD", "H", "Práctica"]
        new_order = [c for c in desired_order if c in cols]
        new_order += [c for c in cols if c not in desired_order]
        st.session_state.df_pr = st.session_state.df_pr[new_order]

    st.session_state.df_al = pd.DataFrame(data.get("df_al", []))
    st.session_state.df_ce = pd.DataFrame(data.get("df_ce", []))
    st.session_state.df_act = pd.DataFrame(data.get("df_act", []))
    st.session_state.df_feoe = pd.DataFrame(data.get("df_feoe", []))
    
    # Asegurar la estructura correcta para df_eval aunque venga vacío del JSON (v7.2.3)
    loaded_eval = data.get("df_eval", [])
    if not loaded_eval:
        st.session_state.df_eval = pd.DataFrame(columns=[
            "ID", 
            "1T_Teoria", "1T_Practica", "1T_Informes", "1T_Cuaderno", "1T_Nota",
            "2T_Teoria", "2T_Practica", "2T_Informes", "2T_Cuaderno", "2T_Nota",
            "3T_Teoria", "3T_Practica", "3T_Informes", "3T_Cuaderno", "3T_Nota",
            "Nota_Final"
        ])
    else:
        st.session_state.df_eval = pd.DataFrame(loaded_eval)
        if "ID" not in st.session_state.df_eval.columns:
            st.session_state.df_eval["ID"] = ""
            
    st.session_state.df_sgmt = pd.DataFrame(data.get("df_sgmt", []))
    st.session_state.daily_ledger = data.get("daily_ledger", {})
    st.session_state.planning_ledger = data.get("planning_ledger", {})
    st.session_state.config_aula = data.get("config_aula", {"Metodología": "", "Atención a la diversidad": ""})
    st.session_state.df_sesiones = pd.DataFrame(data.get("df_sesiones", []))
    st.session_state.df_dua = pd.DataFrame(data.get("df_dua", []))
    st.session_state.df_contingencia = pd.DataFrame(data.get("df_contingencia", []))
    st.session_state.df_ace = pd.DataFrame(data.get("df_ace", []))
    st.session_state.df_tareas = pd.DataFrame(data.get("df_tareas", []))

# ==========================================
# 3. FUNCIONES DE LÓGICA Y CÁLCULO
# ==========================================
def generar_siguiente_id(df, prefijo):
    if df.empty or "ID" not in df.columns: return f"{prefijo}01"
    nums = df["ID"].str.extract(f"{prefijo}(\\d+)").fillna(0).astype(int)
    if nums.empty or nums.isna().all().all(): return f"{prefijo}01"
    return f"{prefijo}{nums.max().item() + 1:02d}"

def calcular_horas_reales(inicio, fin, horario, calendar_notes=None):
    total = 0
    curr = inicio
    dias_semana = ["Lun", "Mar", "Mié", "Jue", "Vie"]
    calendar_notes = calendar_notes or {}
    while curr <= fin:
        if curr.weekday() < 5:
            fecha_str = curr.strftime("%d/%m/%Y")
            # Si el día está marcado como festivo (f_), no se cuentan las horas
            if not calendar_notes.get(f"f_{fecha_str}"):
                total += horario.get(dias_semana[curr.weekday()], 0)
        curr += timedelta(days=1)
    return total

def procesar_lista_alumnado(df_editado):
    if df_editado.empty: return df_editado
    # No rellenar valores implícitos: mantener en blanco, pero forzar "Alta" por defecto en Estado
    df_editado = df_editado.fillna("")
    if "Estado" in df_editado.columns:
        df_editado["Estado"] = df_editado["Estado"].replace("", "Alta")

    # Ordenar alfabéticamente por apellidos
    df_editado = df_editado.sort_values(by="Apellidos", key=lambda x: x.str.lower()).reset_index(drop=True)
    # Regenerar IDs automáticos
    df_editado["ID"] = [f"AN{i+1:02d}" for i in range(len(df_editado))]
    return df_editado

def repartir_horas_previstas():
    # 1. Obtener todos los días lectivos
    lectivos = []
    dias_semana = ["Lun", "Mar", "Mié", "Jue", "Vie"]
    
    # Consolidar todos los días lectivos de los 3 trimestres
    feoe_ini = st.session_state.info_fechas.get("ini_feoe")
    feoe_fin = st.session_state.info_fechas.get("fin_feoe")
    for tri in ["1t", "2t", "3t"]:
        if f"ini_{tri}" not in st.session_state.info_fechas or f"fin_{tri}" not in st.session_state.info_fechas:
            continue
        ini = st.session_state.info_fechas[f"ini_{tri}"]
        fin = st.session_state.info_fechas[f"fin_{tri}"]
        curr = ini
        while curr <= fin:
            if feoe_ini and feoe_fin and feoe_ini <= curr <= feoe_fin:
                curr += timedelta(days=1)
                continue
            if curr.weekday() < 5:
                fecha_str = curr.strftime("%d/%m/%Y")
                # Solo si NO es festivo
                if not st.session_state.calendar_notes.get(f"f_{fecha_str}"):
                    h = st.session_state.horario.get(dias_semana[curr.weekday()], 0)
                    if h > 0:
                        lectivos.append({"fecha": curr, "horas": h})
            curr += timedelta(days=1)
            
    # 2. Sincronizar df_sgmt con df_ud (MIGRADO EN v5.2.1)
    meses_lista = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"]
    col_meses_full = []
    for m in meses_lista: col_meses_full.extend([f"{m}_Prv", f"{m}_Imp"])
    
    columnas_fijas = ["ID", "Horas"]
    todas_cols = columnas_fijas + col_meses_full + ["Total_Imp"]
    
    # Asegurar columnas correctas
    if st.session_state.df_sgmt.empty or not all(c in st.session_state.df_sgmt.columns for c in todas_cols):
        st.session_state.df_sgmt = pd.DataFrame(columns=todas_cols)
    
    # Sincronizar filas (IDs de UD)
    ud_ids = st.session_state.df_ud["ID"].tolist()
    st.session_state.df_sgmt = st.session_state.df_sgmt[st.session_state.df_sgmt["ID"].isin(ud_ids)]
    
    for _, ud_row in st.session_state.df_ud.iterrows():
        uid = ud_row["ID"]
        uhoras = ud_row["Horas"]
        if uid not in st.session_state.df_sgmt["ID"].values:
            new_row = {c: 0 for c in todas_cols}
            new_row["ID"] = uid
            new_row["Horas"] = uhoras
            st.session_state.df_sgmt = pd.concat([st.session_state.df_sgmt, pd.DataFrame([new_row])], ignore_index=True)
        else:
            idx = st.session_state.df_sgmt[st.session_state.df_sgmt["ID"] == uid].index[0]
            st.session_state.df_sgmt.at[idx, "Horas"] = uhoras

    # 3. Limpiar previos "Prv" e "Imp" en df_sgmt
    for col in st.session_state.df_sgmt.columns:
        if col.endswith("_Prv") or col.endswith("_Imp"):
            st.session_state.df_sgmt[col] = 0
            
    # 4. Repartir
    day_idx = 0
    mapping_meses = {9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic", 1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun"}
    if not lectivos or st.session_state.df_ud.empty:
        return
    
    current_day_rem = lectivos[0]["horas"]
    
    for _, ud in st.session_state.df_ud.iterrows():
        ud_id = ud["ID"]
        ud_horas_rest = ud["Horas"]
        
        while ud_horas_rest > 0 and day_idx < len(lectivos):
            allocated = min(ud_horas_rest, current_day_rem)
            
            # Fecha y mes
            fecha = lectivos[day_idx]["fecha"]
            f_str = fecha.strftime("%d/%m/%Y")
            m_key = mapping_meses.get(fecha.month)
            
            # ¿Es día con docencia real?
            ledger_entry = st.session_state.daily_ledger.get(f_str, {})
            is_sin_docencia = ledger_entry.get("sin_docencia", False)
            hoy = datetime.now().date()
            
            # Asegurar que comparamos fechas (date)
            f_date = fecha.date() if hasattr(fecha, "date") else fecha

            if m_key:
                matches = st.session_state.df_sgmt[st.session_state.df_sgmt["ID"] == ud_id].index
                if not matches.empty:
                    idx_sgmt = matches[0]
                    # Siempre sumamos a PREVISTO
                    st.session_state.df_sgmt.at[idx_sgmt, f"{m_key}_Prv"] += allocated
                    # Sumamos a IMPARTIDO solo si NO es "Sin docencia" Y la fecha es HOY o ANTERIOR
                    if not is_sin_docencia and f_date <= hoy:
                        st.session_state.df_sgmt.at[idx_sgmt, f"{m_key}_Imp"] += allocated
                
            ud_horas_rest -= allocated
            current_day_rem -= allocated
            
            if current_day_rem == 0:
                day_idx += 1
                if day_idx < len(lectivos):
                    current_day_rem = lectivos[day_idx]["horas"]
                    
    # 5. Guardar el mapa de planificación diaria para el ledger
    planning_ledger = {}
    remaining_lectivos = lectivos.copy()
    temp_day_idx = 0
    if remaining_lectivos and not st.session_state.df_ud.empty:
        temp_day_rem = remaining_lectivos[0]["horas"]
        for _, ud in st.session_state.df_ud.iterrows():
            ud_id = ud["ID"]
            ud_h = ud["Horas"]
            while ud_h > 0 and temp_day_idx < len(remaining_lectivos):
                alloc = min(ud_h, temp_day_rem)
                d_str = remaining_lectivos[temp_day_idx]["fecha"].strftime("%d/%m/%Y")
                if d_str not in planning_ledger: planning_ledger[d_str] = []
                if ud_id not in planning_ledger[d_str]: planning_ledger[d_str].append(ud_id)
                ud_h -= alloc
                temp_day_rem -= alloc
                if temp_day_rem <= 0:
                    temp_day_idx += 1
                    if temp_day_idx < len(remaining_lectivos):
                        temp_day_rem = remaining_lectivos[temp_day_idx]["horas"]
    
    st.session_state.planning_ledger = planning_ledger

# ==========================================
# 4. INICIALIZACIÓN DE DATOS (ESTADO DE SESIÓN)
# ==========================================
if 'menu' not in st.session_state:
    st.session_state.menu = "Módulo didáctico"

if 'info_modulo' not in st.session_state:
    st.session_state.info_modulo = {
        "modulo": "", 
        "curso": "1º",
        "centro": "", 
        "profesorado": "", 
        "h_boa": 0, 
        "h_sem": 0, 
        "p_ev": 15, 
        "pond_1t": 33, 
        "pond_2t": 33, 
        "pond_3t": 34
    }

if 'info_fechas' not in st.session_state:
    st.session_state.info_fechas = {
        "ini_curso": date(datetime.now().year, 9, 1),
        "fin_curso": date(datetime.now().year + 1, 6, 30),
        "ini_1t": date(datetime.now().year, 9, 15), 
        "fin_1t": date(datetime.now().year, 11, 30), 
        "ini_2t": date(datetime.now().year, 12, 1), 
        "fin_2t": date(datetime.now().year + 1, 3, 15), 
        "ini_3t": date(datetime.now().year + 1, 3, 16), 
        "fin_3t": date(datetime.now().year + 1, 6, 15),
        "ini_feoe": date(datetime.now().year + 1, 3, 16), 
        "fin_feoe": date(datetime.now().year + 1, 6, 15), 
        "h_sem_feoe": 8
    }

if 'horario' not in st.session_state:
    st.session_state.horario = {"Lun": 0, "Mar": 0, "Mié": 0, "Jue": 0, "Vie": 0}
if 'calendar_notes' not in st.session_state: 
    st.session_state.calendar_notes = {}
if 'df_ra' not in st.session_state: 
    st.session_state.df_ra = pd.DataFrame(columns=["ID", "% Pond", "Dualizado", "Descripción"])
else:
    if "Dualizado" not in st.session_state.df_ra.columns:
        st.session_state.df_ra["Dualizado"] = False
if 'df_ud' not in st.session_state: 
    st.session_state.df_ud = pd.DataFrame(columns=["ID", "Horas", "Título"])
if 'df_pr' not in st.session_state: 
    st.session_state.df_pr = pd.DataFrame(columns=["ID", "Práctica"])
if 'df_al' not in st.session_state: 
    st.session_state.df_al = pd.DataFrame(columns=["ID", "Estado", "Apellidos", "Nombre", "Nacimiento", "Repite", "Matrícula", "Edad", "Comentarios", "email", "Móvil"])

if 'df_ce' not in st.session_state:
    st.session_state.df_ce = pd.DataFrame(columns=[
        "RA", "OG Vinculados", "CPE Vinculadas", "Criterio Evaluación (CE)", 
        "Descripción CE", "Ponderación en RA (%)", "Unidad Didáctica (UD)"
    ])

if 'df_act' not in st.session_state:
    st.session_state.df_act = pd.DataFrame(columns=["ID", "Trimestre", "Tipo", "Actividad"])

if 'df_feoe' not in st.session_state:
    st.session_state.df_feoe = pd.DataFrame(columns=["ID"])

if 'df_eval' not in st.session_state:
    st.session_state.df_eval = pd.DataFrame(columns=[
        "ID", 
        "1T_Teoria", "1T_Practica", "1T_Informes", "1T_Cuaderno", "1T_Nota",
        "2T_Teoria", "2T_Practica", "2T_Informes", "2T_Cuaderno", "2T_Nota",
        "3T_Teoria", "3T_Practica", "3T_Informes", "3T_Cuaderno", "3T_Nota",
        "Nota_Final"
    ])

if 'df_sgmt' not in st.session_state:
    st.session_state.df_sgmt = pd.DataFrame()

if 'daily_ledger' not in st.session_state:
    st.session_state.daily_ledger = {}

if 'planning_ledger' not in st.session_state:
    st.session_state.planning_ledger = {}

if 'config_aula' not in st.session_state:
    st.session_state.config_aula = {"Metodología": "", "Atención a la diversidad": ""}

if 'df_sesiones' not in st.session_state:
    st.session_state.df_sesiones = pd.DataFrame(columns=[
        "ID", "Num_Sesion", "Tipo_Actividad", "RA_CE", "Contenidos", "Aspectos_Clave", "Recursos"
    ])

if 'config_contexto' not in st.session_state:
    st.session_state.config_contexto = {"entorno": "", "perfil": "", "metodologia": ""}
if 'df_dua' not in st.session_state:
    st.session_state.df_dua = pd.DataFrame(columns=["ID", "Barrera", "Medida_Metodologica", "Medida_Acceso", "Medida_Evaluacion", "Alumnado_Aula"])
if 'df_contingencia' not in st.session_state:
    st.session_state.df_contingencia = pd.DataFrame(columns=["ID", "Escenario", "Organizacion", "Actividades", "Seguimiento"])
if 'df_ace' not in st.session_state:
    st.session_state.df_ace = pd.DataFrame(columns=["ID", "Tipo", "RA_Vinculados", "Actividad", "Trimestre", "Entidad", "Evaluacion"])
if 'df_tareas' not in st.session_state:
    st.session_state.df_tareas = pd.DataFrame(columns=["ID", "Nombre_Tarea", "Reto", "RA_Asociados", "Instrumento"])

# --- CARGAR FICHERO POR DEFECTO ---
if 'app_init_done' not in st.session_state:
    st.session_state.app_init_done = True
    f_list = [f for f in os.listdir(".") if f.endswith(".json")]
    if f_list:
        # Cargar el primer archivo encontrado genéricamente
        st.session_state.active_module = f_list[0].replace(".json", "")
        cargar_datos(f_list[0])
    else:
        st.session_state.active_module = "nuevo-modulo"

# ==========================================
# 5. INTERFAZ: MENÚ LATERAL Y ESTILOS
# ==========================================
st.markdown(
    """
    <style>
    /* Centrar TODAS las métricas de la app (st.metric) */
    [data-testid="stMetricValue"], [data-testid="stMetricLabel"] {
        text-align: center !important;
        display: flex !important;
        justify-content: center !important;
    }

    /* Centrar el texto dentro de los inputs de fecha */
    [data-testid="stDateInput"] label {
        display: flex;
        justify-content: center;
        width: 100%;
    }
    [data-testid="stDateInput"] input {
        text-align: center !important;
    }

    /* Ajustes de texto header */
    .user-subtitle {
        font-size: 1.1rem;
        font-weight: 500;
        color: #ddd;
        margin-top: -20px;
        margin-bottom: 25px;
        text-align: left !important;
    }
    
    /* Alineación IZQUIERDA botones menú lateral — selectores amplios para todas las versiones */
    section[data-testid="stSidebar"] button,
    div[data-testid="stSidebar"] button {
        justify-content: flex-start !important;
        text-align: left !important;
        padding-left: 14px !important;
        width: 100% !important;
        display: flex !important;
        align-items: center !important;
    }

    /* Texto interno del botón alineado izquierda */
    section[data-testid="stSidebar"] button p,
    section[data-testid="stSidebar"] button span,
    div[data-testid="stSidebar"] button p,
    div[data-testid="stSidebar"] button span {
        text-align: left !important;
        width: 100% !important;
        margin: 0 !important;
        display: block !important;
    }

    /* Asegurar que el texto dentro del botón también esté a la izquierda */
    div[data-testid="stSidebar"] button div[data-testid="stMarkdownContainer"] p {
        text-align: left !important;
        width: 100% !important;
        margin: 0 !important;
    }


    /* Estilo para el botón ACTIVO (AZUL TEAL sólido) */
    section[data-testid="stSidebar"] [data-testid="baseButton-primary"],
    div[data-testid="stSidebar"] [data-testid="baseButton-primary"] {
        background-color: #0d7377 !important;
        color: #ffffff !important;
        border: 1px solid #0a5c60 !important;
        font-weight: bold !important;
    }

    section[data-testid="stSidebar"] [data-testid="baseButton-primary"]:hover,
    div[data-testid="stSidebar"] [data-testid="baseButton-primary"]:hover {
        background-color: #14a085 !important;
        color: #ffffff !important;
    }

    /* Estilo para botones inactivos */
    section[data-testid="stSidebar"] [data-testid="baseButton-secondary"],
    div[data-testid="stSidebar"] [data-testid="baseButton-secondary"] {
        color: #cce8ea !important;
        background-color: rgba(13, 115, 119, 0.1) !important;
        border: 1px solid rgba(13, 115, 119, 0.35) !important;
    }
    section[data-testid="stSidebar"] [data-testid="baseButton-secondary"]:hover,
    div[data-testid="stSidebar"] [data-testid="baseButton-secondary"]:hover {
        border-color: #14a085 !important;
        color: #ffffff !important;
        background-color: rgba(20, 160, 133, 0.25) !important;
    }



    /* FORZAR SALTO DE LÍNEA EN CABECERAS DE TABLA */
    div[data-testid="stDataFrame"] div[role="columnheader"] div,
    div[data-testid="stDataFrame"] thead tr th {
        white-space: pre-wrap !important;
        line-height: 1.1 !important;
        height: auto !important;
        min-height: 50px !important;
        display: flex !important;
        align-items: center !important;
    }

    /* ESTILOS TABLA HTML PERSONALIZADA */
    .table-container {
        overflow-x: auto;
        width: 100%;
        max-width: 100%;
        border: 1px solid #444;
        border-radius: 8px;
        margin-top: 10px;
    }
    .sgmt-table {
        width: 100%;
        border-collapse: collapse;
        font-family: inherit;
        font-size: 1rem; /* Tamaño reducido */
    }
    .sgmt-table th, .sgmt-table td {
        border: 1px solid #444;
        padding: 2px 4px; /* Padding reducido */
        text-align: center;
        min-width: 30px; /* Ancho mínimo reducido */
    }
    .sgmt-table th {
        background-color: #262730;
        color: #fff;
        font-weight: 600;
        line-height: 1.1;
    }
    .sgmt-table td {
        background-color: #0e1117;
        color: #eee;
    }
    .row-sin-docencia {
        background-color: #3e3e23 !important;
        font-style: italic;
    }
    .row-sin-docencia td {
        background-color: #3e3e23 !important;
    }
    .col-highlight {
        background-color: #3e3e23 !important;
    }
    /* Sticky columnas iniciales compactas */
    .sticky-cell {
        position: sticky;
        left: 0;
        z-index: 5;
        background-color: #262730 !important;
        border-right: 1px solid #444 !important;
    }
    .sticky-cell-2 {
        position: sticky;
        left: 42px; /* Reducido de 60px */
        z-index: 5;
        background-color: #262730 !important;
        border-right: 1px solid #444 !important;
    }
    .sticky-cell-3 {
        position: sticky;
        left: 92px; /* Reducido de 115px */
        z-index: 5;
        background-color: #3e3e23 !important;
        border-right: 2px solid #555 !important;
    }

    /* ESTILO PARA CABECERA DE PÁGINA (Pestaña) */
    .pestaña-header {
        border: 2px solid #ffffff;
        border-radius: 10px;
        padding: 5px;
        text-align: center;
        margin-bottom: 50px;
    }
    .pestaña-header h2 {
        color: #ffffff;
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
    }
    </style>
    """,
    unsafe_allow_html=True
)

with st.sidebar:
    st.title("Cuaderno Digital Docente Ciclos FP")
    st.markdown("<br>", unsafe_allow_html=True)    
    # 5.2 Gestión de Archivos (Movido arriba)
    with st.expander("📚 Gestión de módulos"):
        f_list = [f for f in os.listdir(".") if f.endswith(".json")]
        
        st.markdown("**📂 Cargar módulo**")
        default_idx = f_list.index("0237-ictve.json") if "0237-ictve.json" in f_list else 0
        sel = st.selectbox("Selecciona archivo", f_list, index=default_idx, label_visibility="collapsed", key="load_sel")
        
        if st.button("📂 Iniciar Carga", use_container_width=True):
            st.session_state.confirm_load = sel

        if st.session_state.get("confirm_load"):
            st.warning(f"⚠️ Al cargar `{st.session_state.confirm_load}` perderá los cambios. ¿Seguro?")
            c1, c2 = st.columns(2)
            if c1.button("✅ Sí", type="primary", use_container_width=True, key="conf_load_btn"):
                cargar_datos(st.session_state.confirm_load)
                st.session_state.active_module = st.session_state.confirm_load.replace(".json", "")
                st.session_state.confirm_load = None
                st.rerun()
            if c2.button("❌ No", use_container_width=True, key="canc_load"):
                st.session_state.confirm_load = None
                st.rerun()
                
        st.markdown('<hr style="border: none; border-top: 1px solid #444; margin: 15px 0;">', unsafe_allow_html=True)
        st.markdown("**💾 Guardar módulo**")
        n_file = st.text_input("Nombre del módulo", value=st.session_state.get("active_module", "0237-ictve"), label_visibility="collapsed")
        
        if st.button("💾 Iniciar Guardado", use_container_width=True):
            st.session_state.confirm_save = n_file
            
        if st.session_state.get("confirm_save"):
            file_to_save = st.session_state.confirm_save
            filename_full = file_to_save if file_to_save.endswith(".json") else f"{file_to_save}.json"
            if os.path.exists(filename_full):
                st.warning(f"⚠️ `{filename_full}` ya existe. ¿Sobreescribir?")
            else:
                st.info(f"✅ Se creará un nuevo: `{filename_full}`. ¿Continuar?")
                
            c3, c4 = st.columns(2)
            if c3.button("✅ Sí", type="primary", use_container_width=True, key="conf_save_btn"):
                guardar_datos(file_to_save)
                st.session_state.active_module = file_to_save.replace(".json", "")
                st.session_state.confirm_save = None
                st.success("¡Guardado!")
            if c4.button("❌ No", use_container_width=True, key="canc_save"):
                st.session_state.confirm_save = None
                st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    # 5.1 Menú de Navegación (Real Buttons)
    opciones_globales = [
        "Contextualización", "Calendario académico"
    ]
    opciones_modulo = [
        "Módulo didáctico", "Matriz curricular", 
        "Instrumentos de evaluación", "Planes e inclusión", 
        "Matrícula alumnado", "Resumen docente", 
        "Programación de aula", "Seguimiento diario", 
        "Calificación académica", "Calificación FEOE", "Evaluación continua"
    ]
    
    opciones_totales = opciones_globales + opciones_modulo
    
    # Redirigir si el menú activo era uno de los eliminados o le cambiamos el nombre
    if st.session_state.menu == "Perfil y Contexto": st.session_state.menu = "Resumen docente"
    if st.session_state.menu == "Calendario lectivo": st.session_state.menu = "Calendario Escolar"
    if st.session_state.menu == "Evaluación FEOE": st.session_state.menu = "Calificación FEOE"
    if st.session_state.menu == "Calificación numérica": st.session_state.menu = "Calificación académica"
    if st.session_state.menu == "Progreso porcentual": st.session_state.menu = "Evaluación continua"
        
    if st.session_state.menu not in opciones_totales:
        st.session_state.menu = "Módulo didáctico"
        
    with st.expander("🌍 Configuración global", expanded=False):
        for opcion in opciones_globales:
            if st.button(
                opcion, 
                use_container_width=True, 
                type="primary" if st.session_state.menu == opcion else "secondary",
                key=f"btn_glb_{opcion}"
            ):
                st.session_state.menu = opcion
                st.rerun()
                
    with st.expander("🗂️ Programación didáctica", expanded=True):
        for opcion in opciones_modulo:
            if opcion in ["Programación de aula", "Calificación académica", "Evaluación continua"]:
                st.markdown("<hr style='margin: 5px 0 15px 0; border: none; border-top: 1px solid #444;'>", unsafe_allow_html=True)
                
            if st.button(
                opcion, 
                use_container_width=True, 
                type="primary" if st.session_state.menu == opcion else "secondary",
                key=f"btn_mod_{opcion}"
            ):
                st.session_state.menu = opcion
                st.rerun()
    
    # Variable de control para el resto de la app
    menu = st.session_state.menu
    
    # --- AUTOMATIZACIÓN (v5.0) ---
    # Recalcular reparto de horas automáticamente en cada interacción
    repartir_horas_previstas()

    st.markdown("<br>", unsafe_allow_html=True)
    
    with st.expander("📥 Descargas .pdf"):
        pdf_buffer_cal = generar_pdf_calendario(
            st.session_state.info_modulo,
            st.session_state.info_fechas,
            st.session_state.planning_ledger,
            st.session_state.calendar_notes
        )
        st.download_button(
            label="Calendario académico",
            data=pdf_buffer_cal,
            file_name=f"Calendario_{st.session_state.info_modulo.get('modulo', 'Gestor')}.pdf",
            mime="application/pdf",
            type="secondary",
            use_container_width=True
        )

        pdf_buffer_seg = generar_pdf_seguimiento(
            st.session_state.info_modulo,
            st.session_state.info_fechas,
            st.session_state.horario,
            st.session_state.planning_ledger,
            st.session_state.calendar_notes
        )
        st.download_button(
            label="Seguimiento diario",
            data=pdf_buffer_seg,
            file_name=f"Seguimiento_diario_{st.session_state.info_modulo.get('modulo', 'Gestor')}.pdf",
            mime="application/pdf",
            type="secondary",
            use_container_width=True
        )

        pdf_buffer_bol = generar_pdf_boletin(
            st.session_state.info_modulo,
            st.session_state.info_fechas,
            st.session_state.df_al,
            st.session_state.df_eval,
            st.session_state.df_ra,
            st.session_state.df_ud,
            st.session_state.df_pr,
            st.session_state.planning_ledger,
            st.session_state.df_ce,
            st.session_state.df_act,
            st.session_state.df_feoe
        )
        st.download_button(
            label="Boletín competencial",
            data=pdf_buffer_bol,
            file_name=f"Boletin_Competencial_{st.session_state.info_modulo.get('modulo', 'Gestor')}.pdf",
            mime="application/pdf",
            type="secondary",
            use_container_width=True
        )

        pdf_buffer_prog = generar_pdf_programacion_aula(
            st.session_state.info_modulo,
            st.session_state.config_aula,
            st.session_state.df_sesiones
        )
        st.download_button(
            label="Programación de aula",
            data=pdf_buffer_prog,
            file_name=f"Programacion_Aula_{st.session_state.info_modulo.get('modulo', 'Gestor')}.pdf",
            mime="application/pdf",
            type="secondary",
            use_container_width=True
        )
    st.markdown("<br><hr>", unsafe_allow_html=True)
    st.markdown('<p class="user-subtitle">(c) Rafael Sanz Prades</p>', unsafe_allow_html=True)
    
# ==========================================
# Cabecera de página estilizada
st.markdown(f'<div class="pestaña-header"><h2>{menu}</h2></div>', unsafe_allow_html=True)

# ============================================================
# Helper: badge compacto para validadores (verde/amarillo/rojo)
# diff  = valor_real - valor_esperado
# unidad= '%', 'h', etc.
# ============================================================
def badge(diff, valor_real, unidad=""):
    if diff == 0:
        col, bg, ico = "#000000", "#00ff00", "✓"
        txt = f"{ico} ¡Ok! {valor_real}{unidad}"
    elif diff > 0:  # exceso → amarillo
        col, bg, ico = "#000000", "#ffff00", "▲"
        txt = f"{ico} +{diff}{unidad}"
    else:           # falta → rojo
        col, bg, ico = "#ffffff", "#ff0000", "▼"
        txt = f"{ico} {diff}{unidad}"
    return (
        f'<div style="background:{bg};color:{col};border:1px solid {col}55;'
        f'border-radius:5px;padding:2px 8px;font-size:1rem;font-weight:700;'
        f'text-align:center;line-height:2.0;margin-top:6px;white-space:nowrap;">'
        f'{txt}</div>'
    )

# ==========================================
# 7. INTERFAZ: LÓGICA DE LAS PESTAÑAS
# ==========================================

# --- PESTAÑA: DATOS ---
if menu == "Módulo didáctico":
    st.subheader("📝 Datos generales")

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
        st.text_input("Nº de Trimestres", value="3", disabled=True)
    with c3_2:
        st.session_state.info_modulo["h_sem"] = st.number_input("H. Sem.", 0, 40, st.session_state.info_modulo.get("h_sem", 5))
    with c3_3:
        st.session_state.info_modulo["h_boa"] = st.number_input("H. BOA", 0, 500, st.session_state.info_modulo.get("h_boa", 149))
    with c3_4:
        st.session_state.info_modulo["p_ev"] = st.number_input("% P.Ev", 0, 100, st.session_state.info_modulo.get("p_ev", 15))
    with c3_5:
        st.session_state.info_modulo["h_feoe"] = st.number_input("H. FEOE", 0, 500, st.session_state.info_modulo.get("h_feoe", 400))


    if "criterio_conocimiento" not in st.session_state.info_modulo:
        st.session_state.info_modulo.update({
            "criterio_conocimiento": 30, # Examen Teórico
            "criterio_procedimiento_ejercicios": 20, # Informes de ejercicios
            "criterio_procedimiento_practicas": 20, # Examen Práctico
            "criterio_tareas": 30, # Cuaderno de tareas
        })

    st.divider()
    suma_t = st.session_state.info_modulo["pond_1t"] + st.session_state.info_modulo["pond_2t"] + st.session_state.info_modulo["pond_3t"]
    cs1, cs2 = st.columns([3, 1])
    with cs1:
        st.markdown("### ⚖️ Ponderación por Trimestres")
    with cs2:
        st.markdown(badge(suma_t - 100, suma_t, "%"), unsafe_allow_html=True)
            
    cp1, cp2, cp3 = st.columns(3)
    with cp1:
        st.session_state.info_modulo["pond_1t"] = st.number_input("1er Trimestre (%)", 0, 100, st.session_state.info_modulo.get("pond_1t", 30))
    with cp2:
        st.session_state.info_modulo["pond_2t"] = st.number_input("2º Trimestre (%)", 0, 100, st.session_state.info_modulo.get("pond_2t", 30))
    with cp3:
        st.session_state.info_modulo["pond_3t"] = st.number_input("3er Trimestre (%)", 0, 100, st.session_state.info_modulo.get("pond_3t", 40))

    st.divider()
    suma_criterios = st.session_state.info_modulo["criterio_conocimiento"] + st.session_state.info_modulo["criterio_procedimiento_ejercicios"] + st.session_state.info_modulo["criterio_procedimiento_practicas"] + st.session_state.info_modulo.get("criterio_tareas", st.session_state.info_modulo.get("criterio_actitud_participacion", 30))
    cc1, cc2 = st.columns([3, 1])
    with cc1:
        st.markdown("### 🧾 Instrumentos de evaluación. Criterios")
    with cc2:
        st.markdown(badge(suma_criterios - 100, suma_criterios, "%"), unsafe_allow_html=True)

    col_a, col_b, col_c, col_d = st.columns(4)
    with col_a:
        st.session_state.info_modulo["criterio_conocimiento"] = st.number_input("Examen teórico", 0, 100, st.session_state.info_modulo["criterio_conocimiento"], key="crit_conocimiento")
    with col_b:
        st.session_state.info_modulo["criterio_procedimiento_practicas"] = st.number_input("Examen práctico", 0, 100, st.session_state.info_modulo["criterio_procedimiento_practicas"], key="crit_procedimiento_practicas")
    with col_c:
        st.session_state.info_modulo["criterio_procedimiento_ejercicios"] = st.number_input("Informes de ejercicios", 0, 100, st.session_state.info_modulo["criterio_procedimiento_ejercicios"], key="crit_procedimiento_ejercicios")
    with col_d:
        st.session_state.info_modulo["criterio_tareas"] = st.number_input("Cuaderno de tareas", 0, 100, st.session_state.info_modulo.get("criterio_tareas", st.session_state.info_modulo.get("criterio_actitud_participacion", 30)), key="crit_tareas")

 
    st.divider()
    st.markdown("### ⚙️ Configuración del Módulo")
    st.session_state.config_contexto["metodologia"] = st.text_area("Estrategias metodológicas, recursos, espacios y desdobles", value=st.session_state.config_contexto.get("metodologia", ""), height=150)
    new_met = st.text_area("Metodología (ej. activa, participativa, ABP)", value=st.session_state.config_aula.get("Metodología", ""), height=100)
    new_div = st.text_area("Atención a la diversidad (adaptaciones no significativas)", value=st.session_state.config_aula.get("Atención a la diversidad", ""), height=100)
        
    if new_met != st.session_state.config_aula.get("Metodología") or new_div != st.session_state.config_aula.get("Atención a la diversidad"):
        st.session_state.config_aula["Metodología"] = new_met
        st.session_state.config_aula["Atención a la diversidad"] = new_div

# --- PESTAÑA: Planificación ---
elif menu == "Matriz curricular":
    suma_ra = round(pd.to_numeric(st.session_state.df_ra["% Pond"], errors="coerce").fillna(0).sum(), 2)
    c_ra1, c_ra2 = st.columns([3, 1])
    with c_ra1:
        st.markdown("### 🎓 Resultados de Aprendizaje")
    with c_ra2:
        st.markdown(badge(suma_ra - 100, suma_ra, "%"), unsafe_allow_html=True)

    ed_ra = st.data_editor(st.session_state.df_ra, column_config={
        "ID": st.column_config.TextColumn("ID-RA", width="small", disabled=True),
        "% Pond": st.column_config.NumberColumn("% RA", width="small", min_value=0.0, max_value=100.0, format="%.1f"),
        "Dualizado": st.column_config.CheckboxColumn("FEOE", default=False, width="small"),
        "Descripción": st.column_config.TextColumn("Resultados de Aprendizaje"),
    }, num_rows="dynamic", hide_index=True, width="stretch", key="tabla_ra")
    
    # Manejo de nuevos RA
    if len(ed_ra) > len(st.session_state.df_ra):
        new_id = generar_siguiente_id(st.session_state.df_ra, "RA")
        ed_ra.iloc[-1, 0] = new_id
    
    st.session_state.df_ra = ed_ra

    st.divider()
    st.subheader("📚 Unidades Didácticas. Resultados de Aprendizaje")
    lista_ra_ids = st.session_state.df_ra["ID"].tolist()
    
    # Sincronizar columnas de UD con RA actuales
    # 1. Asegurar que las columnas básicas existan
    columnas_basicas = ["ID", "Horas", "Título"]
    for col in columnas_basicas:
        if col not in st.session_state.df_ud.columns:
            st.session_state.df_ud[col] = "" if col != "Horas" else 0

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
        "ID": st.column_config.TextColumn("ID-UD", width="small", disabled=True, pinned=True),
        "Horas": st.column_config.NumberColumn("Horas", width="small", min_value=0, pinned=True),
        "Título": st.column_config.TextColumn("Unidades didácticas", pinned=True)
    }
    
    for ra in lista_ra_ids:
        ra_pond = 0.0
        if not st.session_state.df_ra.empty:
            match_ra = st.session_state.df_ra[st.session_state.df_ra["ID"] == ra]
            if not match_ra.empty:
                ra_pond = match_ra.iloc[0].get("% Pond", 0.0)
                
        config_ud[ra] = st.column_config.TextColumn(
            f"{ra[2:]} ({ra_pond}%)", 
            width="small"
        )
    
    # Preparamos un DataFrame puramente visual para que los ceros sean strings vacíos
    df_visual = st.session_state.df_ud.copy()
    for ra in lista_ra_ids:
        df_visual[ra] = pd.to_numeric(df_visual[ra], errors="coerce").fillna(0.0)
        df_visual[ra] = df_visual[ra].apply(lambda x: f"{int(x)}%" if x > 0.0 else "")

    def align_right(val):
        return 'text-align: right;'
        
    df_visual_styled = df_visual.style.map(align_right, subset=lista_ra_ids)

    ed_ud = st.data_editor(df_visual_styled, column_config=config_ud, num_rows="dynamic", hide_index=True, width="stretch", height=(len(st.session_state.df_ud) + 1) * 35 + 39, key="tabla_ud")
    
    # Manejo de nuevas UD
    if len(ed_ud) > len(st.session_state.df_ud):
        new_id_ud = generar_siguiente_id(st.session_state.df_ud, "UD")
        ed_ud.iloc[-1, 0] = new_id_ud
        
    for ra in lista_ra_ids:
        # Convertimos lo que el usuario haya escrito (ej. '15', '15%', '') de vuelta a un float real
        s_str = ed_ud[ra].astype(str).str.replace("%", "").str.strip()
        ed_ud[ra] = pd.to_numeric(s_str, errors="coerce").fillna(0.0).astype(float)
        
    st.session_state.df_ud = ed_ud
    
    # ---- VALIDACIÓN DE PORCENTAJES DE LA MATRIZ UD-RA ----
    if not ed_ud.empty:
        for ra in lista_ra_ids:
            ra_pond_esperada = 0.0
            if not st.session_state.df_ra.empty:
                match_ra = st.session_state.df_ra[st.session_state.df_ra["ID"] == ra]
                if not match_ra.empty:
                    ra_pond_esperada = float(match_ra.iloc[0].get("% Pond", 0.0))
            
            # Sumar lo que se ha asignado a este RA en las distintas UDs
            suma_asignada = float(ed_ud[ra].sum())
            
            # Comparamos si difiere en más de 0.01 por temas de redondeo flotante
            if abs(suma_asignada - ra_pond_esperada) > 0.01:
                st.warning(f"⚠️ **{ra}:** Has repartido un **{suma_asignada:.1f}%** entre las Unidades, pero el valor total del RA es **{ra_pond_esperada:.1f}%**. Revisalo para que cuadren.")

    st.divider()

    st.subheader("🧩 Criterios de Evaluación. Resultados de aprendizaje")
    st.markdown("**Relación jerárquica: RA -> CE -> UD**")
    st.caption("Añade Criterios de Evaluación, establece su peso en el RA y asígnalos a una Unidad Didáctica. También puedes vincular OG y CPE.")

    columnas_config_ce = {
        "RA": st.column_config.SelectboxColumn("RA", options=st.session_state.df_ra["ID"].tolist()),
        "OG Vinculados": st.column_config.TextColumn("OG Vinculados"),
        "CPE Vinculadas": st.column_config.TextColumn("CPE Vinculadas"),
        "Criterio Evaluación (CE)": st.column_config.TextColumn("ID CE (Ej. CE1.a)"),
        "Descripción CE": st.column_config.TextColumn("Descripción CE"),
        "Ponderación en RA (%)": st.column_config.NumberColumn(
            "Peso %", min_value=0, max_value=100, step=1
        ),
        "Unidad Didáctica (UD)": st.column_config.SelectboxColumn(
            "Asignar a UD",
            options=st.session_state.df_ud["ID"].tolist() + ["Sin asignar"]
        )
    }

    ed_ce = st.data_editor(
        st.session_state.df_ce,
        column_config=columnas_config_ce,
        num_rows="dynamic",
        hide_index=True,
        use_container_width=True,
        key="tabla_ce"
    )

    # Validar ponderaciones
    if not ed_ce.empty:
        # Rellenar RA vacíos temporalmente para agrupar
        ed_ce_val = ed_ce.copy()
        ed_ce_val["RA"] = ed_ce_val["RA"].fillna("")
        ed_ce_val["Ponderación en RA (%)"] = pd.to_numeric(ed_ce_val["Ponderación en RA (%)"], errors="coerce").fillna(0)
        errores_ponderacion = ed_ce_val.groupby('RA')['Ponderación en RA (%)'].sum()
        for ra, total in errores_ponderacion.items():
            if ra != "" and total != 100:
                st.warning(f"⚠️ ¡Atención! La suma de ponderaciones de los CE del **{ra}** es {total}%. Debería ser 100%.")

    st.session_state.df_ce = ed_ce




# --- PESTAÑA: FECHAS ---
elif menu == "Calendario académico":
    st.subheader("📚 Fechas curso académico")
    c_fc1, c_fc2, c_fc3, c_fc4 = st.columns(4)
    with c_fc1:
        st.session_state.info_fechas["ini_curso"] = st.date_input("Inicio curso", st.session_state.info_fechas.get("ini_curso", date(2025, 9, 1)), format="DD/MM/YYYY", key="d_ini_curso_v")
    with c_fc2:
        ini_cls = st.date_input("Inicio clases (1T)", st.session_state.info_fechas.get("ini_1t", date(2025, 9, 15)), format="DD/MM/YYYY", key="d_ini_clases_v")
        st.session_state.info_fechas["ini_1t"] = ini_cls
    with c_fc3:
        fin_cls = st.date_input("Fin clases (3T)", st.session_state.info_fechas.get("fin_3t", date(2026, 6, 20)), format="DD/MM/YYYY", key="d_fin_clases_v")
        st.session_state.info_fechas["fin_3t"] = fin_cls
    with c_fc4:
        st.session_state.info_fechas["fin_curso"] = st.date_input("Fin curso", st.session_state.info_fechas.get("fin_curso", date(2026, 6, 30)), format="DD/MM/YYYY", key="d_fin_curso_v")
        
    st.divider()

    suma_horario = sum(st.session_state.horario.values())
    c_sub1, c_sub2 = st.columns([3, 1])
    with c_sub1:
        st.subheader("🕒 Horario semanal")
    with c_sub2:
        st.markdown(badge(suma_horario - st.session_state.info_modulo["h_sem"], suma_horario, " h"), unsafe_allow_html=True)

    # Usamos exactamente 5 columnas para asegurar que aparezcan los botones + y -
    c_h1, c_h2, c_h3, c_h4, c_h5 = st.columns(5)
    
    with c_h1: st.session_state.horario["Lun"] = st.number_input("Lun", 0, 8, st.session_state.horario["Lun"], key="h_in_Lun", step=1)
    with c_h2: st.session_state.horario["Mar"] = st.number_input("Mar", 0, 8, st.session_state.horario["Mar"], key="h_in_Mar", step=1)
    with c_h3: st.session_state.horario["Mié"] = st.number_input("Mié", 0, 8, st.session_state.horario["Mié"], key="h_in_Mié", step=1)
    with c_h4: st.session_state.horario["Jue"] = st.number_input("Jue", 0, 8, st.session_state.horario["Jue"], key="h_in_Jue", step=1)
    with c_h5: st.session_state.horario["Vie"] = st.number_input("Vie", 0, 8, st.session_state.horario["Vie"], key="h_in_Vie", step=1)
    
    st.divider()
    h1_f = calcular_horas_reales(st.session_state.info_fechas["ini_1t"], st.session_state.info_fechas["fin_1t"], st.session_state.horario, st.session_state.calendar_notes)
    h2_f = calcular_horas_reales(st.session_state.info_fechas["ini_2t"], st.session_state.info_fechas["fin_2t"], st.session_state.horario, st.session_state.calendar_notes)
    h3_f = calcular_horas_reales(st.session_state.info_fechas["ini_3t"], st.session_state.info_fechas["fin_3t"], st.session_state.horario, st.session_state.calendar_notes)
    h_real_f = h1_f + h2_f + h3_f
    diff_boa_f = h_real_f - st.session_state.info_modulo.get('h_boa', 0)
    cf1, cf2 = st.columns([3, 1])
    with cf1:
        st.subheader("🗓️ Fechas por Trimestres")
    with cf2:
        st.markdown(badge(diff_boa_f, h_real_f, " h"), unsafe_allow_html=True)
    c1, c2, c3 = st.columns(3)

    with c1:
        st.markdown("<div style='text-align: center;'><strong>1er Trimestre</strong></div>", unsafe_allow_html=True)
        with st.container(border=True):
            st.session_state.info_fechas["ini_1t"] = st.date_input("Inicio 1T", st.session_state.info_fechas["ini_1t"], key="d_ini_1t", format="DD/MM/YYYY")
            st.session_state.info_fechas["fin_1t"] = st.date_input("Fin 1T", st.session_state.info_fechas["fin_1t"], key="d_fin_1t", format="DD/MM/YYYY")
            h1 = calcular_horas_reales(st.session_state.info_fechas["ini_1t"], st.session_state.info_fechas["fin_1t"], st.session_state.horario, st.session_state.calendar_notes)
            st.metric("Horas Reales 1T", f"{h1} h")

    with c2:
        st.markdown("<div style='text-align: center;'><strong>2º Trimestre</strong></div>", unsafe_allow_html=True)
        with st.container(border=True):
            st.session_state.info_fechas["ini_2t"] = st.date_input("Inicio 2T", st.session_state.info_fechas["ini_2t"], key="d_ini_2t", format="DD/MM/YYYY")
            st.session_state.info_fechas["fin_2t"] = st.date_input("Fin 2T", st.session_state.info_fechas["fin_2t"], key="d_fin_2t", format="DD/MM/YYYY")
            h2 = calcular_horas_reales(st.session_state.info_fechas["ini_2t"], st.session_state.info_fechas["fin_2t"], st.session_state.horario, st.session_state.calendar_notes)
            st.metric("Horas Reales 2T", f"{h2} h")

    with c3:
        st.markdown("<div style='text-align: center;'><strong>3er Trimestre</strong></div>", unsafe_allow_html=True)
        with st.container(border=True):

            st.session_state.info_fechas["ini_3t"] = st.date_input("Inicio 3T", st.session_state.info_fechas["ini_3t"], key="d_ini_3t", format="DD/MM/YYYY")
            st.session_state.info_fechas["fin_3t"] = st.date_input("Fin 3T", st.session_state.info_fechas["fin_3t"], key="d_fin_3t", format="DD/MM/YYYY")
            h3 = calcular_horas_reales(st.session_state.info_fechas["ini_3t"], st.session_state.info_fechas["fin_3t"], st.session_state.horario, st.session_state.calendar_notes)
            st.metric("Horas Reales 3T", f"{h3} h")

    # H.Real y H.PdEvC. debajo de las cajas de trimestres
    h_real_fechas = h1 + h2 + h3
    p_ev_val_f = st.session_state.info_modulo.get("p_ev", 15)
    h_p_ev_f = (p_ev_val_f / 100) * h_real_fechas
    
    st.markdown("##### Resumen Fechas por Trimestres")
    cf_a, cf_b, cf_c = st.columns(3)
    with cf_a:
        with st.container(border=True):
            st.metric("H. Reales totales", f"{h_real_fechas} h")
    with cf_b:
        with st.container(border=True):
            st.metric("H. P.Ev.C.", f"{h_p_ev_f:.1f} h".replace(".", ","))
    with cf_c:
        with st.container(border=True):
            st.metric("H. BOA", f"{st.session_state.info_modulo.get('h_boa', 0)} h")

    # --- Caja FEOE ---
    st.divider()
    cfeoe1, cfeoe2 = st.columns([3, 1])
    with cfeoe1:
        st.subheader("🏢 Fechas Formación en empresa (FEOE)")

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
                "H.Sem FEOE", 0, 40,
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
                st.metric("H. Reales FEOE", f"{h_real_feoe} h")
        with cf_feoe_b:
            with st.container(border=True):
                st.metric("H. BOA FEOE", f"{h_feoe_boa} h")

    # Verificador (se calcula con los valores frescos del container)
    diff_feoe = h_real_feoe - h_feoe_boa
    with cfeoe2:
        st.markdown(badge(diff_feoe, h_real_feoe, " h"), unsafe_allow_html=True)




    st.divider()
    st.markdown('### 📌 Resumen Festivos y fechas relevantes')

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
                st.metric("Total Festivos", count_f)
        with c2: 
            with st.container(border=True):
                st.metric("Total Relevantes", count_r)
    else:
        st.info('No hay anotaciones de festivos o eventos relevantes.')

    st.divider()
    st.subheader("🗓️ Modificación de Festivos y Relevantes")
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
elif menu == "Matrícula alumnado":
    st.subheader("👥 Listado de Alumnado")
    
    # Hemos vuelto a la versión con todas las columnas confirmadas
    # Configuración de columnas con fijación lateral (v5.4)
    config_al = {
        "ID": st.column_config.TextColumn("ID", width="small", disabled=True, pinned=True),
        "Estado": st.column_config.SelectboxColumn("Estado", options=["Alta", "Baja"], default="Alta", pinned=True),
        "Apellidos": st.column_config.TextColumn(pinned=True),
        "Nombre": st.column_config.TextColumn(pinned=True)
    }
    
    ed_al = st.data_editor(
        st.session_state.df_al, 
        column_config=config_al, 
        num_rows="dynamic", 
        hide_index=True, 
        width="stretch", 
        key="tabla_alumnado"
    )
    
    # Autoguardado, ordenación automática y generación de IDs
    if not ed_al.equals(st.session_state.df_al):
        st.session_state.df_al = procesar_lista_alumnado(ed_al)
        st.rerun()

# --- PESTAÑA: SEGUIMIENTO ---
elif menu == "Seguimiento diario":
    st.subheader("📍 Seguimiento de las planificación")
    
    meses_display = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun"]
    mapping_meses_full = {"Sep": "Septiembre", "Oct": "Octubre", "Nov": "Noviembre", "Dic": "Diciembre", "Ene": "Enero", "Feb": "Febrero", "Mar": "Marzo", "Abr": "Abril", "May": "Mayo", "Jun": "Junio"}
    
    # 1. Sincronización realizada en repartir_horas_previstas() (v5.2.1)
    # Recalcular Total_Imp dinámicamente antes de mostrar métricas
    imp_cols = [c for c in st.session_state.df_sgmt.columns if c.endswith("_Imp") and c != "Total_Imp"]
    st.session_state.df_sgmt["Total_Imp"] = st.session_state.df_sgmt[imp_cols].sum(axis=1)

    # Mostrar métricas de resumen arriba
    total_previsto = st.session_state.df_ud["Horas"].sum()
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
        html += f'<td class="sticky-cell">{row["ID"]}</td>'
        html += f'<td class="sticky-cell-2" style="left:42px">{row["Horas"]}</td>'
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
    st.subheader("🗓️ Seguimiento diario de clases (contingencias)")
    
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
elif menu == "Instrumentos de evaluación":
    st.subheader("🛠️ Instrumentos y Actividades de Evaluación")
    st.markdown("Define las tareas, exámenes y registros de observación, y vincula qué Criterios de Evaluación califican.")

    if st.session_state.df_ce.empty:
        st.warning("⚠️ Primero añade Criterios de Evaluación en la pestaña 'Matriz curricular'.")
    else:
        df_ce_clean = st.session_state.df_ce.dropna(subset=["Criterio Evaluación (CE)"])
        df_ce_clean = df_ce_clean[df_ce_clean["Criterio Evaluación (CE)"].str.strip() != ""]
        lista_ce_ids = df_ce_clean["Criterio Evaluación (CE)"].tolist()

        columnas_config_act = {
            "ID": st.column_config.TextColumn("ID", disabled=True, width="small"),
            "Trimestre": st.column_config.SelectboxColumn("Trimestre", options=["1T", "2T", "3T"], width="small"),
            "Tipo": st.column_config.SelectboxColumn("Tipo", options=["Teoría", "Práctica", "Informes", "Tareas"], width="medium"),
            "Actividad": st.column_config.TextColumn("Descripción Actividad", width="large"),
        }
        
        cols_basicas = ["ID", "Trimestre", "Tipo", "Actividad"]
        for col in cols_basicas:
            if col not in st.session_state.df_act.columns:
                st.session_state.df_act[col] = ""

        for ce in lista_ce_ids:
            if ce not in st.session_state.df_act.columns:
                st.session_state.df_act[ce] = False
            columnas_config_act[ce] = st.column_config.CheckboxColumn(ce, default=False, width="small")

        cols_a_borrar = [c for c in st.session_state.df_act.columns if c not in lista_ce_ids and c not in cols_basicas]
        if cols_a_borrar:
            st.session_state.df_act = st.session_state.df_act.drop(columns=cols_a_borrar)
        
        st.session_state.df_act = st.session_state.df_act[cols_basicas + lista_ce_ids]

        ed_act = st.data_editor(
            st.session_state.df_act,
            column_config=columnas_config_act,
            num_rows="dynamic",
            hide_index=True,
            use_container_width=True,
            key="tabla_act",
            height=max(400, (len(st.session_state.df_act) + 1) * 35 + 39)
        )
        
        if len(ed_act) > len(st.session_state.df_act):
            new_id = generar_siguiente_id(st.session_state.df_act, "ACT")
            ed_act.iloc[-1, 0] = new_id

        st.session_state.df_act = ed_act


# --- PESTAÑA: FEOE ---
elif menu == "Calificación FEOE":
    st.subheader("🏢 Evaluación en Empresa (FEOE)")
    st.caption("Introduce la calificación del tutor de empresa (1-4) para cada Resultado de Aprendizaje Dualizado.")
    
    ras_dualizados = []
    if not st.session_state.df_ra.empty and "Dualizado" in st.session_state.df_ra.columns:
        ras_dualizados = st.session_state.df_ra[st.session_state.df_ra["Dualizado"] == True]["ID"].tolist()
        
    if not ras_dualizados:
        st.warning("⚠️ No hay ningún Resultado de Aprendizaje marcado como 'Dualizado' (FEOE) en la pestaña 'Módulo didáctico'.")
    elif st.session_state.df_al.empty:
        st.info("No hay alumnado registrado con estado 'Alta'.")
    else:
        ids_alumnos = st.session_state.df_al["ID"].tolist()
        if "ID" not in st.session_state.df_feoe.columns:
            st.session_state.df_feoe["ID"] = ids_alumnos
        st.session_state.df_feoe = st.session_state.df_feoe[st.session_state.df_feoe["ID"].isin(ids_alumnos)]
        
        exist_ids = st.session_state.df_feoe["ID"].tolist()
        nuevos = [{"ID": a_id} for a_id in ids_alumnos if a_id not in exist_ids]
        if nuevos:
            st.session_state.df_feoe = pd.concat([st.session_state.df_feoe, pd.DataFrame(nuevos)], ignore_index=True)
            
        for ra_id in ras_dualizados:
            if ra_id not in st.session_state.df_feoe.columns:
                st.session_state.df_feoe[ra_id] = 0.0
                
        cols_b = ["ID"]
        cols_drop = [c for c in st.session_state.df_feoe.columns if c not in ras_dualizados and c not in cols_b]
        if cols_drop:
            st.session_state.df_feoe = st.session_state.df_feoe.drop(columns=cols_drop)

        df_al_feoe = st.session_state.df_al[["ID", "Apellidos", "Nombre"]].copy()
        df_al_feoe["Alumno"] = df_al_feoe["Apellidos"] + ", " + df_al_feoe["Nombre"]
        df_feoe_disp = pd.merge(st.session_state.df_feoe, df_al_feoe[["ID", "Alumno"]], on="ID", how="left")
        
        cols_disp = ["ID", "Alumno"] + ras_dualizados
        df_feoe_disp = df_feoe_disp[cols_disp]
        
        col_cfg = {
            "ID": st.column_config.TextColumn(disabled=True, width="small"),
            "Alumno": st.column_config.TextColumn(disabled=True, width="large"),
        }
        for ra in ras_dualizados:
            col_cfg[ra] = st.column_config.NumberColumn(f"{ra} (1-4)", min_value=0.0, max_value=4.0, step=1.0, width="small")
            
        st.markdown("**Calificaciones de la empresa:**\n* `0`: Sin evaluar\n* `1`: No Superado\n* `2`: Superado (Suficiente)\n* `3`: Bien/Notable\n* `4`: Excelente")
        
        ed_feoe = st.data_editor(
            df_feoe_disp,
            column_config=col_cfg,
            hide_index=True,
            use_container_width=True,
            key="tabla_feoe"
        )
        
        for ra in ras_dualizados:
            st.session_state.df_feoe[ra] = ed_feoe[ra]

# --- PESTAÑA: EVALUACIÓN ---
elif menu == "Calificación académica":
    st.subheader("📊 Evaluación Competencial Jerárquica")
    st.caption("Introduce las notas de las actividades; el sistema calculará la nota de los CE, RA y la Nota Final automáticamente.")
    
    if st.session_state.df_act.empty or st.session_state.df_ce.empty:
        st.warning("⚠️ Primero define Criterios de Evaluación y Actividades/Instrumentos.")
    elif st.session_state.df_al.empty:
        st.info("No hay alumnos activos registrados. Por favor, a\u00f1ade alumnos con estado 'Alta' en la pesta\u00f1a 'Alumnado'.")
    else:
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
        act_ids = st.session_state.df_act["ID"].dropna().tolist()
        for act in act_ids:
            if act not in st.session_state.df_eval.columns:
                st.session_state.df_eval[act] = 0.0

        def get_sigad_info(nota):
            import math
            if nota < 5: n = math.floor(nota)
            else: n = math.floor(nota + 0.5)
            n = max(1, min(10, int(n)))
            if nota < 5:   return n, "IN", "Insuficiente",  "#e74c3c"
            elif nota < 6: return n, "SU", "Suficiente",    "#e67e22"
            elif nota < 7: return n, "BI", "Bien",          "#3498db"
            elif nota < 9: return n, "NT", "Notable",       "#2ecc71"
            else:          return n, "SB", "Sobresaliente", "#1abc9c"

        # Organizar Actividades por Trimestre
        acts_by_tri = {"1T": [], "2T": [], "3T": []}
        for _, row in st.session_state.df_act.iterrows():
            tri = row.get("Trimestre", "1T")
            if tri not in acts_by_tri: tri = "1T"
            acts_by_tri[tri].append(row)

        df_evaluable = st.session_state.df_al[st.session_state.df_al.get("Estado", "") != "Baja"]
        df_al_sorted = df_evaluable.sort_values("Apellidos").reset_index(drop=True)

        # Mapeo CE -> Actividades
        df_ce_clean = st.session_state.df_ce.dropna(subset=["Criterio Evaluación (CE)"])
        df_ce_clean = df_ce_clean[df_ce_clean["Criterio Evaluación (CE)"].str.strip() != ""]
        
        peso_ra = {}
        for _, ra_row in st.session_state.df_ra.iterrows():
            if pd.notna(ra_row["ID"]):
                peso_ra[ra_row["ID"]] = pd.to_numeric(ra_row["% Pond"], errors="coerce") if pd.notna(ra_row["% Pond"]) else 0.0
                
        peso_ce = {}
        ra_of_ce = {}
        for _, ce_row in df_ce_clean.iterrows():
            ce_id = ce_row["Criterio Evaluación (CE)"]
            ra_id = ce_row.get("RA", "")
            if pd.notna(ce_id) and pd.notna(ra_id):
                peso_ce[ce_id] = pd.to_numeric(ce_row["Ponderación en RA (%)"], errors="coerce") if pd.notna(ce_row["Ponderación en RA (%)"]) else 0.0
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
                                act_id = act["ID"]
                                val_prev = float(st.session_state.df_eval.at[idx, act_id]) if pd.notna(st.session_state.df_eval.at[idx, act_id]) else 0.0
                                val_new = st.number_input(
                                    f"[{act['Tipo']}] {act.get('Actividad', act_id)}", 
                                    0.0, 10.0, val_prev, 0.1, 
                                    key=f"ev_{al_id}_{act_id}", format="%.1f"
                                )
                                new_vals[act_id] = val_new

                with co_right:
                    st.markdown("**Cálculo Jerárquico**")
                    notas_ce = {}
                    for ce_id in peso_ce.keys():
                        act_vals = []
                        for _, act in st.session_state.df_act.iterrows():
                            if ce_id in act.index and act[ce_id] == True:
                                act_id = act["ID"]
                                if act_id in new_vals:
                                    act_vals.append(new_vals[act_id])
                        if act_vals:
                            notas_ce[ce_id] = sum(act_vals) / len(act_vals)
                        else:
                            notas_ce[ce_id] = 0.0
                    
                    notas_ra = {}
                    for ce_id, n_ce in notas_ce.items():
                        r = ra_of_ce.get(ce_id)
                        if r:
                            if r not in notas_ra: notas_ra[r] = 0.0
                            notas_ra[r] += n_ce * (peso_ce[ce_id] / 100.0)
                            
                    # === FEOE SCORE INTEGRATION ===
                    if not st.session_state.df_ra.empty and "Dualizado" in st.session_state.df_ra.columns:
                        for r_id in notas_ra.keys():
                            ra_row = st.session_state.df_ra[st.session_state.df_ra["ID"] == r_id]
                            if not ra_row.empty and ra_row.iloc[0].get("Dualizado", False):
                                emp_grade = 0.0
                                if not st.session_state.df_feoe.empty and r_id in st.session_state.df_feoe.columns:
                                    fe_row = st.session_state.df_feoe[st.session_state.df_feoe["ID"] == al_id]
                                    if not fe_row.empty:
                                        emp_grade = float(fe_row.iloc[0][r_id])
                                        
                                if emp_grade >= 1:
                                    conv = {1: 3.0, 2: 5.0, 3: 7.5, 4: 10.0}
                                    nota_empresa = conv.get(int(emp_grade), 0.0)
                                    notas_ra[r_id] = (notas_ra[r_id] + nota_empresa) / 2.0

                    nota_final_calc = 0.0
                    for r_id, n_ra in notas_ra.items():
                        nota_final_calc += n_ra * (peso_ra.get(r_id, 0.0) / 100.0)

                    nota_final = st.number_input(
                        "\U0001f31f Nota Final", min_value=1.0, max_value=10.0,
                        value=float(max(1.0, round(nota_final_calc, 2))),
                        step=0.1, format="%.2f", key=f"ev_{al_id}_notaf"
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
elif menu == "Evaluación continua":
    st.subheader("🎓 Evaluación continua por Alumnado")
    
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
            ra_id = str(ra_row["ID"])
            ra_info[ra_id] = {
                "pond": float(pd.to_numeric(ra_row["% Pond"], errors="coerce")) if not pd.isna(ra_row["% Pond"]) else 0.0,
                "desc": str(ra_row.get("Descripción", ""))
            }
            tris_found = []
            uds_found = []
            prs_found = []
            if ra_id in st.session_state.df_ud.columns:
                for _, ud_row in st.session_state.df_ud.iterrows():
                    if ud_row.get(ra_id, False):
                        uid = str(ud_row["ID"])
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
elif menu == "Programación de aula":
    st.subheader("📚 Programación de Aula (Secuenciación de Sesiones)")
    st.markdown("Diseña y estructura las sesiones para cada Unidad Didáctica, definiendo la tipología, RA/CE asociados, contenidos y recursos.")
    
    # 3. Tabla de Secuenciación (Visualización y edición)
    st.markdown("### 📋 Secuenciación de Sesiones Registradas")
    if not st.session_state.df_sesiones.empty:
        # Ordenamos por número de sesión por si acaso
        st.session_state.df_sesiones = st.session_state.df_sesiones.sort_values(by="Num_Sesion").reset_index(drop=True)
        
        ed_ses = st.data_editor(
            st.session_state.df_sesiones,
            column_config={
                "ID": st.column_config.TextColumn("ID", disabled=True, width="small"),
                "Num_Sesion": st.column_config.NumberColumn("Nº", min_value=1, step=1, width="small"),
                "Tipo_Actividad": st.column_config.SelectboxColumn("Tipo", options=["Tª (Teoría)", "Pª (Práctica)", "IE (Instrumento de Evaluación)", "Pª+ (Ampliación/Refuerzo)"], width="medium"),
                "RA_CE": st.column_config.TextColumn("RA/CE", width="medium"),
                "Contenidos": st.column_config.TextColumn("Contenidos", width="large"),
                "Aspectos_Clave": st.column_config.TextColumn("Aspectos Clave", width="medium"),
                "Recursos": st.column_config.TextColumn("Recursos", width="medium")
            },
            num_rows="dynamic",
            hide_index=True,
            use_container_width=True,
            key="tabla_sesiones"
        )
        st.session_state.df_sesiones = ed_ses
    else:
        st.info("No hay sesiones registradas. Utiliza la tabla o el formulario de abajo para empezar a añadir sesiones.")
    
    # 4. Formulario oculto bajo la tabla
    with st.expander("➕ Añadir Nueva Sesión", expanded=False):
        st.markdown("*💡 Utiliza este formulario si prefieres una introducción de datos más visual y guiada en lugar de escribir directamente en la tabla.*")
        with st.form("registro_sesion"):
            c1, c2, c3 = st.columns([1, 2, 2])
            with c1:
                num_ses = st.number_input("Nº Sesión", min_value=1, step=1, value=len(st.session_state.df_sesiones)+1)
            with c2:
                tipo_act = st.selectbox("Tipo de Actividad", options=["Tª (Teoría)", "Pª (Práctica)", "IE (Instrumento de Evaluación)", "Pª+ (Ampliación/Refuerzo)"])
            with c3:
                ra_ce_input = st.text_input("RA / CE vinculados", placeholder="Ej: RA1, CE1.a")
                
            c4, c5 = st.columns(2)
            with c4:
                contenidos_input = st.text_area("Contenidos / Descripción de la actividad", placeholder="Ej: Preparación del taller, Examen teórico...", height=80)
            with c5:
                aspectos_input = st.text_area("Aspectos Clave", placeholder="Ej: Seguridad e higiene, Conceptos básicos...", height=80)
            
            recursos_input = st.text_input("Recursos", placeholder="Ej: Aula Taller, Proyector, Herramienta X...")
            
            submit_btn = st.form_submit_button("Añadir Sesión", type="primary")
            
            if submit_btn:
                new_ses_id = generar_siguiente_id(st.session_state.df_sesiones, "SES")
                new_session = {
                    "ID": new_ses_id,
                    "Num_Sesion": num_ses,
                    "Tipo_Actividad": tipo_act,
                    "RA_CE": ra_ce_input,
                    "Contenidos": contenidos_input,
                    "Aspectos_Clave": aspectos_input,
                    "Recursos": recursos_input
                }
                st.session_state.df_sesiones = pd.concat([st.session_state.df_sesiones, pd.DataFrame([new_session])], ignore_index=True)
                st.success("Sesión añadida correctamente.")
                st.rerun()



    st.divider()

    st.subheader("🎯 Diseño de Tareas Competenciales (TC)")
    st.markdown("Define retos o productos integrados que evalúan varios Resultados de Aprendizaje de forma globalizada.")
    
    ed_tar = st.data_editor(
        st.session_state.df_tareas,
        column_config={
            "ID": st.column_config.TextColumn("ID", disabled=True, width="small"),
            "Nombre_Tarea": st.column_config.TextColumn("Título de la Tarea", width="medium"),
            "Reto": st.column_config.TextColumn("Contexto Productivo y Reto", width="large"),
            "RA_Asociados": st.column_config.TextColumn("RA y CE Relacionados", width="medium"),
            "Instrumento": st.column_config.TextColumn("Instrumento de Calificación", width="medium"),
        },
        num_rows="dynamic", hide_index=True, use_container_width=True, key="tabla_tareas"
    )
    if len(ed_tar) > len(st.session_state.df_tareas):
        ed_tar.iloc[-1, 0] = generar_siguiente_id(st.session_state.df_tareas, "TC")
    st.session_state.df_tareas = ed_tar
    
    with st.expander("➕ Añadir Nueva Tarea Competencial", expanded=False):
        st.markdown("*💡 Utiliza este formulario si prefieres una introducción de datos más visual y guiada en lugar de escribir directamente en la tabla.*")
        with st.form("registro_tc"):
            c1, c2 = st.columns(2)
            with c1:
                tc_nombre = st.text_input("Título de la Tarea")
            with c2:
                tc_ra = st.text_input("RA y CE Relacionados")
            tc_reto = st.text_area("Contexto Productivo y Reto")
            tc_inst = st.text_input("Instrumento de Calificación")
            
            if st.form_submit_button("Añadir Tarea", type="primary"):
                new_id = generar_siguiente_id(st.session_state.df_tareas, "TC")
                new_row = {"ID": new_id, "Nombre_Tarea": tc_nombre, "Reto": tc_reto, "RA_Asociados": tc_ra, "Instrumento": tc_inst}
                st.session_state.df_tareas = pd.concat([st.session_state.df_tareas, pd.DataFrame([new_row])], ignore_index=True)
                st.success("Añadida correctamente.")
                st.rerun()

elif menu == "Contextualización":
    st.subheader("🏫 Centro Educativo. Equipo docente. Entorno socioeconómico")
    st.session_state.config_contexto["instalaciones"] = st.text_area("Instalaciones", st.session_state.config_contexto.get("instalaciones", ""), height=120)
    st.session_state.config_contexto["horario_lectivo"] = st.text_area("Horario lectivo", st.session_state.config_contexto.get("horario_lectivo", ""), height=120)
    st.session_state.config_contexto["equipo_docente"] = st.text_area("Equipo docente", st.session_state.config_contexto.get("equipo_docente", ""), height=120)
    st.session_state.config_contexto["entorno_socioeconomico"] = st.text_area("Entorno socioeconómico", st.session_state.config_contexto.get("entorno_socioeconomico", ""), height=120)

    st.divider()
    
    st.subheader("👦🏻 Alumnado. Refuerzo y atención especial en ACNEAE")
    st.session_state.config_contexto["inclusion"] = st.text_area("Inclusión", st.session_state.config_contexto.get("inclusion", ""), height=120)
    st.session_state.config_contexto["elenco_situaciones"] = st.text_area("Elenco de situaciones", st.session_state.config_contexto.get("elenco_situaciones", ""), height=120)
    st.session_state.config_contexto["circunstancias_ocultas"] = st.text_area("Circunstancias ocultas", st.session_state.config_contexto.get("circunstancias_ocultas", ""), height=120)

# --- PESTAÑA: RESUMEN ---
elif menu == "Resumen docente":
    # --- Resumen N.UD. y N.Práct. ---
    st.subheader("📊 Módulo. Unidades Didácticas y Prácticas")
    rd1, rd2 = st.columns(2)
    with rd1:
        with st.container(border=True):
            st.metric("N. Unidades Didácticas", len(st.session_state.df_ud))
    with rd2:
        with st.container(border=True):
            st.metric("N. Prácticas", len(st.session_state.df_pr))


    # --- Resumen UDs por Trimestre ---
    st.divider()    
    st.markdown("### 📊 Unidades didácticas por Trimestre")
    
    uds_por_tri = {"1t": set(), "2t": set(), "3t": set()}
    for tri in ["1t", "2t", "3t"]:
        ini_t = st.session_state.info_fechas.get(f"ini_{tri}")
        fin_t = st.session_state.info_fechas.get(f"fin_{tri}")
        if ini_t and fin_t:
            curr = ini_t
            while curr <= fin_t:
                d_str = curr.strftime("%d/%m/%Y")
                for ud in st.session_state.planning_ledger.get(d_str, []):
                    uds_por_tri[tri].add(ud)
                curr += timedelta(days=1)

    c_tri1, c_tri2, c_tri3 = st.columns(3)
    def render_caja_tri(caja, titulo, uds_set):
        with caja:
            st.markdown(f"<div style='text-align: center; font-size: 1.1rem; color: #fff;'><strong>{titulo}</strong></div>", unsafe_allow_html=True)
            with st.container(border=True):
                if uds_set:
                    # Mostrar todas concatenadas en un único div sin márgenes agresivos
                    html_content = "<div>" + "".join([f"<div style='text-align: center; color: #ddd; font-weight: 500; line-height: 1.5;'>{ud}</div>" for ud in sorted(uds_set)]) + "</div>"
                    st.markdown(html_content, unsafe_allow_html=True)
                else:
                    st.markdown("<div style='text-align: center; color: #888;'>-</div>", unsafe_allow_html=True)

    render_caja_tri(c_tri1, "1er Tri.", uds_por_tri["1t"])
    render_caja_tri(c_tri2, "2º Tri.", uds_por_tri["2t"])
    render_caja_tri(c_tri3, "3er Tri.", uds_por_tri["3t"])

    st.divider()   
    st.markdown("### 📊 Relación entre Resultados de Aprendizaje y Unidades Didácticas", unsafe_allow_html=True)
    
    lista_ra_ids = st.session_state.df_ra["ID"].tolist() if not st.session_state.df_ra.empty else []
    
    if lista_ra_ids:
        with st.container(border=True):
            # Mapeo de RAs
            ra_info = {}
            if not st.session_state.df_ra.empty:
                for _, row in st.session_state.df_ra.iterrows():
                    try:
                        pct_val = float(pd.to_numeric(row.get("% Pond", 0.0), errors="coerce"))
                        if pd.isna(pct_val): pct_val = 0.0
                    except Exception:
                        pct_val = 0.0
                    ra_info[row["ID"]] = {
                        "desc": row.get("Descripción", ""),
                        "pct": pct_val
                    }
                
            for ra_id in lista_ra_ids:
                # Fila de RA (padre)
                info = ra_info.get(ra_id, {"desc": "", "pct": 0.0})
                desc_ra_completa = info.get("desc", "")
                pct = info.get("pct", 0.0)
                str_pct = f"{int(pct)}%" if pct.is_integer() else f"{pct:.1f}%"
                
                st.markdown(f"<div style='color: #fff; font-size: 1.05rem; margin-top: 5px;'><strong>{ra_id} ({str_pct}).</strong> <span style='color: #ccc; font-size: 0.95rem;'>{desc_ra_completa}</span></div>", unsafe_allow_html=True)
                
                # Recopilar UDs que están asociadas a este RA (tienen % > 0)
                uds_list = []
                if not st.session_state.df_ud.empty and ra_id in st.session_state.df_ud.columns:
                    for _, ud_row in st.session_state.df_ud.iterrows():
                        try:
                            val_ra = float(ud_row.get(ra_id, 0.0))
                            val_h = int(ud_row.get("Horas", 0))
                        except Exception:
                            val_ra = 0.0
                            val_h = 0
                        
                        if val_ra > 0.0:
                            str_pct = f"{int(val_ra)}%" if val_ra.is_integer() else f"{val_ra:.1f}%"
                            uds_list.append(f"{str(ud_row['ID'])} ({val_h}h) - {str_pct}")

                # Recopilar Prácticas que tienen check en este RA
                prs_list = []
                if not st.session_state.df_pr.empty and ra_id in st.session_state.df_pr.columns:
                    for _, pr_row in st.session_state.df_pr.iterrows():
                        if pr_row.get(ra_id, False) == True:
                            prs_list.append(str(pr_row["ID"]))
                            
                # Filas identadas (hijas)
                html_hijas = ""
                if uds_list:
                    html_hijas += f"<div style='margin-left: 25px; margin-bottom: 2px; color: #ffe599; border-left: 2px solid #d4af37; padding-left: 10px;'>{', '.join(uds_list)}</div>"
                else:
                    html_hijas += "<div style='margin-left: 25px; margin-bottom: 2px; color: #666; font-style: italic; border-left: 2px solid #444; padding-left: 10px;'>Sin UDs asignadas</div>"

                st.markdown(html_hijas, unsafe_allow_html=True)
    else:
        st.info("No hay Resultados de Aprendizaje definidos.")

# --- PESTAÑA: PLANES E INCLUSIÓN ---
elif menu == "Planes e inclusión":
    st.subheader("🧩 Plan de Atención a la diversidad")
    st.markdown("Adaptación curricular no significativas o medidas aplicadas en el aula")
    
    ed_dua = st.data_editor(
        st.session_state.df_dua,
        column_config={
            "ID": st.column_config.TextColumn("ID", disabled=True, width="small"),
            "Alumnado_Aula": st.column_config.TextColumn("Alumnado o Aula", width="medium"),
            "Barrera": st.column_config.TextColumn("Barrera Detectada", width="medium"),
            "Medida_Metodologica": st.column_config.TextColumn("Medida Metodológica / Org.", width="large"),
            "Medida_Acceso": st.column_config.TextColumn("Medida de Acceso", width="medium"),
            "Medida_Evaluacion": st.column_config.TextColumn("Medida de Evaluación", width="medium"),
        },
        num_rows="dynamic", hide_index=True, use_container_width=True, key="tabla_dua"
    )
    if len(ed_dua) > len(st.session_state.df_dua):
        ed_dua.iloc[-1, 0] = generar_siguiente_id(st.session_state.df_dua, "DUA")
    st.session_state.df_dua = ed_dua

    with st.expander("➕ Añadir Nueva Atención a la diversidad", expanded=False):
        st.markdown("*💡 Utiliza este formulario si prefieres una introducción de datos más visual para el Plan de Atención a la diversidad.*")
        with st.form("registro_dua"):
            c1, c2 = st.columns(2)
            with c1:
                dua_alumnado = st.text_input("Alumnado o Aula")
            with c2:
                dua_barrera = st.text_input("Barrera Detectada")
            
            dua_met = st.text_area("Medida Metodológica / Org.")
            
            c3, c4 = st.columns(2)
            with c3:
                dua_acc = st.text_area("Medida de Acceso")
            with c4:
                dua_eva = st.text_area("Medida de Evaluación")
            
            if st.form_submit_button("Añadir Medida", type="primary"):
                new_id = generar_siguiente_id(st.session_state.df_dua, "DUA")
                new_row = {
                    "ID": new_id, 
                    "Alumnado_Aula": dua_alumnado, 
                    "Barrera": dua_barrera, 
                    "Medida_Metodologica": dua_met, 
                    "Medida_Acceso": dua_acc, 
                    "Medida_Evaluacion": dua_eva
                }
                st.session_state.df_dua = pd.concat([st.session_state.df_dua, pd.DataFrame([new_row])], ignore_index=True)
                st.success("Añadida correctamente.")
                st.rerun()

    st.divider()

    st.subheader("🛡️ Plan de contingencia")
    st.markdown("Definición de actividades ante situaciones excepcionales de la clase")
    
    ed_cont = st.data_editor(
        st.session_state.df_contingencia,
        column_config={
            "ID": st.column_config.TextColumn("ID", disabled=True, width="small"),
            "Escenario": st.column_config.SelectboxColumn("Escenario", options=["Ausencia de Profesorado", "Ausencia de Alumnado", "Interrupción Generalizada", "Otros"], width="medium"),
            "Organizacion": st.column_config.TextColumn("Organización y Acceso", width="large"),
            "Actividades": st.column_config.TextColumn("Actividades Alternativas", width="large"),
            "Seguimiento": st.column_config.TextColumn("Seguimiento y Ajustes", width="medium"),
        },
        num_rows="dynamic", hide_index=True, use_container_width=True, key="tabla_contingencia"
    )
    if len(ed_cont) > len(st.session_state.df_contingencia):
        ed_cont.iloc[-1, 0] = generar_siguiente_id(st.session_state.df_contingencia, "PC")
    st.session_state.df_contingencia = ed_cont

    with st.expander("➕ Añadir Nueva Medida de Contingencia", expanded=False):
        st.markdown("*💡 Utiliza este formulario si prefieres una introducción de datos más visual para el Plan de contingencia.*")
        with st.form("registro_contingencia"):
            cont_esc = st.selectbox("Escenario", options=["Ausencia de Profesorado", "Ausencia de Alumnado", "Interrupción Generalizada", "Otros"])
            cont_org = st.text_area("Organización y Acceso")
            cont_act = st.text_area("Actividades Alternativas")
            cont_seg = st.text_input("Seguimiento y Ajustes")
            
            if st.form_submit_button("Añadir Medida", type="primary"):
                new_id = generar_siguiente_id(st.session_state.df_contingencia, "PC")
                new_row = {"ID": new_id, "Escenario": cont_esc, "Organizacion": cont_org, "Actividades": cont_act, "Seguimiento": cont_seg}
                st.session_state.df_contingencia = pd.concat([st.session_state.df_contingencia, pd.DataFrame([new_row])], ignore_index=True)
                st.success("Añadida correctamente.")
                st.rerun()

    st.divider()

    st.subheader("🚌 Plan de Actividadesy Extraescolares")
    st.markdown("Programación de actividades complementarias y salidas extraescolares")
    
    lista_ra_ids = st.session_state.df_ra["ID"].tolist() if not st.session_state.df_ra.empty else []
    
    ed_ace = st.data_editor(
        st.session_state.df_ace,
        column_config={
            "ID": st.column_config.TextColumn("ID", disabled=True, width="small"),
            "Tipo": st.column_config.SelectboxColumn("Tipo", options=["Complementaria", "Extraescolar"], width="medium"),
            "RA_Vinculados": st.column_config.SelectboxColumn("RA Vinculados", options=lista_ra_ids, width="medium"),
            "Actividad": st.column_config.TextColumn("Descripción de la Actividad", width="large"),
            "Trimestre": st.column_config.SelectboxColumn("Trimestre", options=["1T", "2T", "3T"], width="small"),
            "Entidad": st.column_config.TextColumn("Entidad Colaboradora", width="medium"),
            "Evaluacion": st.column_config.TextColumn("Actividad de Evaluación", width="medium"),
        },
        num_rows="dynamic", hide_index=True, use_container_width=True, key="tabla_ace"
    )
    if len(ed_ace) > len(st.session_state.df_ace):
        ed_ace.iloc[-1, 0] = generar_siguiente_id(st.session_state.df_ace, "ACE")
    st.session_state.df_ace = ed_ace
    
    with st.expander("➕ Añadir Nueva Actividad (ACE)", expanded=False):
        st.markdown("*💡 Utiliza este formulario para programar la actividad escolar.*")
        with st.form("registro_ace"):
            c1, c2, c3 = st.columns([1,1,1])
            with c1:
                ace_tipo = st.selectbox("Tipo", options=["Complementaria", "Extraescolar"])
            with c2:
                ace_ra = st.selectbox("RA Vinculados", options=st.session_state.df_ra["ID"].tolist() if not st.session_state.df_ra.empty else [""])
            with c3:
                ace_tri = st.selectbox("Trimestre", options=["1T", "2T", "3T"])
            
            ace_act = st.text_area("Descripción de la Actividad")
            
            c4, c5 = st.columns(2)
            with c4:
                ace_ent = st.text_input("Entidad Colaboradora")
            with c5:
                ace_eva = st.text_input("Actividad de Evaluación")
            
            if st.form_submit_button("Añadir Actividad", type="primary"):
                new_id = generar_siguiente_id(st.session_state.df_ace, "ACE")
                new_row = {"ID": new_id, "Tipo": ace_tipo, "RA_Vinculados": ace_ra, "Actividad": ace_act, "Trimestre": ace_tri, "Entidad": ace_ent, "Evaluacion": ace_eva}
                st.session_state.df_ace = pd.concat([st.session_state.df_ace, pd.DataFrame([new_row])], ignore_index=True)
                st.success("Añadida correctamente.")
                st.rerun()



