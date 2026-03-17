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
st.toast("✅ Aplicación v8.2 - Afinación visual del PDF")

# ==========================================
# 2. FUNCIONES DE GUARDADO Y CARGA (JSON) / PDF
# ==========================================
from pdf_generator import generar_pdf_calendario
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
    data = {
        "info_modulo": st.session_state.info_modulo,
        "info_fechas": {k: serialize_date(v) for k, v in st.session_state.info_fechas.items()},
        "horario": st.session_state.horario,
        "calendar_notes": st.session_state.calendar_notes,
        "df_ra": st.session_state.df_ra.to_dict(orient="records"),
        "df_ud": st.session_state.df_ud.to_dict(orient="records"),
        "df_pr": st.session_state.df_pr.to_dict(orient="records"),
        "df_al": st.session_state.df_al.to_dict(orient="records"),
        "df_eval": st.session_state.df_eval.to_dict(orient="records") if 'df_eval' in st.session_state else [],
        "df_sgmt": st.session_state.df_sgmt.to_dict(orient="records") if 'df_sgmt' in st.session_state else [],
        "daily_ledger": st.session_state.daily_ledger if 'daily_ledger' in st.session_state else {},
        "planning_ledger": st.session_state.planning_ledger if 'planning_ledger' in st.session_state else {},
    }
    with open(nombre_archivo, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    return nombre_archivo

def cargar_datos(nombre_archivo):
    with open(nombre_archivo, "r", encoding="utf-8") as f:
        data = json.load(f)
    st.session_state.info_modulo = data.get("info_modulo", {})
    st.session_state.info_fechas = {k: unserialize_date(v) for k, v in data.get("info_fechas", {}).items()}
    st.session_state.horario = data.get("horario", {})
    st.session_state.calendar_notes = data.get("calendar_notes", {})
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
        # Filtrar solo las que existen
        new_order = [c for c in desired_order if c in cols]
        new_order += [c for c in cols if c not in desired_order]
        st.session_state.df_pr = st.session_state.df_pr[new_order]

    st.session_state.df_al = pd.DataFrame(data.get("df_al", []))
    
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
    # No rellenar valores implícitos: mantener en blanco si se deja vacío
    df_editado = df_editado.fillna("")

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
    for tri in ["1t", "2t", "3t"]:
        if f"ini_{tri}" not in st.session_state.info_fechas or f"fin_{tri}" not in st.session_state.info_fechas:
            continue
        ini = st.session_state.info_fechas[f"ini_{tri}"]
        fin = st.session_state.info_fechas[f"fin_{tri}"]
        curr = ini
        while curr <= fin:
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
    st.session_state.menu = "Datos"

if 'info_modulo' not in st.session_state:
    st.session_state.info_modulo = {"modulo": "FPM-it-1-0237 ICTVE", "centro": "IES Ándalan", "profesorado": "Rafa Sanz", "h_boa": 149, "h_sem": 5, "p_ev": 15, "pond_1t": 30, "pond_2t": 30, "pond_3t": 40}
# Aseguramos valores por defecto para la distribución de evaluación por trimestres
for k, v in {
    "t1_ev2": 40, "t1_ev3": 25, "t1_tri": 35,
    "t2_ev2": 60, "t2_ev3": 35, "t2_tri": 35,
    "t3_ev2": 0, "t3_ev3": 40, "t3_tri": 40
}.items():
    st.session_state.info_modulo.setdefault(k, v)

if 'info_fechas' not in st.session_state:
    st.session_state.info_fechas = {"ini_1t": date(2025, 9, 15), "fin_1t": date(2025, 11, 28), "ini_2t": date(2025, 12, 1), "fin_2t": date(2026, 3, 13), "ini_3t": date(2026, 3, 16), "fin_3t": date(2026, 5, 29)}
if 'horario' not in st.session_state:
    st.session_state.horario = {"Lun": 2, "Mar": 0, "Mié": 0, "Jue": 4, "Vie": 2}
if 'calendar_notes' not in st.session_state: 
    st.session_state.calendar_notes = {}
if 'df_ra' not in st.session_state: 
    st.session_state.df_ra = pd.DataFrame([{"ID": "RA01", "% Pond": 15.0, "Descripción": "Configuración inicial"}])
if 'df_ud' not in st.session_state: 
    st.session_state.df_ud = pd.DataFrame([{"ID": "UD01", "Horas": 12, "Título": "Introducción"}])
if 'df_pr' not in st.session_state: 
    st.session_state.df_pr = pd.DataFrame([{"ID": "Pr01", "UD": "UD01", "Práctica": "Práctica 1", "H": 4}])
if 'df_al' not in st.session_state: 
    # Mantenemos las columnas exactas que se veían en tu imagen original
    st.session_state.df_al = pd.DataFrame(columns=["ID", "Estado", "Apellidos", "Nombre", "Nacimiento", "Repite", "Matrícula", "Edad", "Comentarios", "email", "Móvil"])

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

# ==========================================
# 5. INTERFAZ: MENÚ LATERAL Y ESTILOS
# ==========================================
st.markdown(
    """
    <style>
    /* Ajustes de texto header */
    .user-subtitle {
        font-size: 1.1rem;
        font-weight: 500;
        color: #ddd;
        margin-top: -20px;
        margin-bottom: 25px;
        text-align: left !important;
    }
    
    /* Forzar alineación a la IZQUIERDA en la barra lateral para TODOS los botones */
    div[data-testid="stSidebar"] [data-testid="baseButton-primary"],
    div[data-testid="stSidebar"] [data-testid="baseButton-secondary"],
    div[data-testid="stSidebar"] button {
        justify-content: flex-start !important;
        text-align: left !important;
        padding-left: 15px !important;
        width: 100% !important;
        display: flex !important;
    }
    
    /* Asegurar que el texto dentro del botón también esté a la izquierda */
    div[data-testid="stSidebar"] button div[data-testid="stMarkdownContainer"] p {
        text-align: left !important;
        width: 100% !important;
        margin: 0 !important;
    }

    /* Estilo para el botón ACTIVO (VERDE tipo validación) */
    div[data-testid="stSidebar"] [data-testid="baseButton-primary"] {
        background-color: #d4edda !important;  /* fondo verde claro */
        color: #155724 !important;            /* texto verde oscuro */
        border: 1px solid #c3e6cb !important;
        font-weight: bold !important;
    }
    
    div[data-testid="stSidebar"] [data-testid="baseButton-primary"]:hover {
        background-color: #c3e6cb !important;
        color: #155724 !important;
    }

    /* Estilo para botones inactivos (FONDO OSCURO / TRANSPARENTE) */
    div[data-testid="stSidebar"] [data-testid="baseButton-secondary"] {
        color: white !important;
        background-color: transparent !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
    div[data-testid="stSidebar"] [data-testid="baseButton-secondary"]:hover {
        border-color: #28a745 !important;
        color: #28a745 !important;
        background-color: rgba(40, 167, 69, 0.1) !important;
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
        border: 2px solid #28a745;
        border-radius: 10px;
        padding: 10px;
        text-align: center;
        background-color: rgba(40, 167, 69, 0.05);
        margin-bottom: 20px;
    }
    .pestaña-header h2 {
        color: #28a745;
        margin: 0;
        font-size: 2.2rem;
        font-weight: 700;
        text-transform: uppercase;
    }
    </style>
    """,
    unsafe_allow_html=True
)

with st.sidebar:
    st.title("📓 Cuaderno Digital")
    st.markdown('<p class="user-subtitle">Rafael Sanz Prades</p>', unsafe_allow_html=True)
    
    # 5.1 Menú de Navegación (Real Buttons)
    opciones_menu = ["Resumen", "Datos", "UD y RA", "Fechas", "Seguimiento", "Alumnado", "Evaluación", "Información"]
    for opcion in opciones_menu:
        if st.button(
            opcion, 
            width="stretch", 
            type="primary" if st.session_state.menu == opcion else "secondary",
            key=f"btn_{opcion}"
        ):
            st.session_state.menu = opcion
            st.rerun()
    
    # Variable de control para el resto de la app
    menu = st.session_state.menu
    
    # --- AUTOMATIZACIÓN (v5.0) ---
    # Recalcular reparto de horas automáticamente en cada interacción
    repartir_horas_previstas()

    st.markdown("<br><br>", unsafe_allow_html=True)
    
    # 5.2 Gestión de Archivos (al final)
    with st.expander("💾 Gestión de sesiones"):
        n_file = st.text_input("Sesión actual:", value="cuaderno_2025")
        if st.button("💾 Guardar"):
            guardar_datos(n_file)
            st.success("¡Guardado correctamente!")
        f_list = [f for f in os.listdir(".") if f.endswith(".json")]
        if f_list:
            sel = st.selectbox("Cargar nueva:", ["--"] + f_list)
            if sel != "--" and st.button("📂 Cargar"):
                cargar_datos(sel)
                st.rerun()
    st.info("Carga nueva .json para cambiar de módulo")
    
# ==========================================
# Cabecera de página estilizada
st.markdown(f'<div class="pestaña-header"><h2>{menu}</h2></div>', unsafe_allow_html=True)

# ==========================================
# 7. INTERFAZ: LÓGICA DE LAS PESTAÑAS
# ==========================================

# --- PESTAÑA: DATOS ---
if menu == "Datos":
    st.subheader("📝 Entrada. Datos generales")

    # Fila 1: Módulo didáctico y Nº Trimestres
    c1_1, c1_2 = st.columns([3, 1])
    with c1_1:
        st.session_state.info_modulo["modulo"] = st.text_input("Módulo didáctico", st.session_state.info_modulo.get("modulo", ""))
    with c1_2:
        st.text_input("Nº de Trimestres", value="3", disabled=True)

    # Fila 2: Centro educativo y Profesorado
    c2_1, c2_2 = st.columns(2)
    with c2_1:
        st.session_state.info_modulo["centro"] = st.text_input("Centro educativo", st.session_state.info_modulo.get("centro", ""))
    with c2_2:
        st.session_state.info_modulo["profesorado"] = st.text_input("Profesorado", st.session_state.info_modulo.get("profesorado", st.session_state.info_modulo.get("profesor", "")))
        
    # Fila 3: H.Sem, H.BOA y %P. EvC
    c3_1, c3_2, c3_3 = st.columns(3)
    with c3_1:
        st.session_state.info_modulo["h_sem"] = st.number_input("H. Sem.", 0, 40, st.session_state.info_modulo.get("h_sem", 5))
    with c3_2:
        st.session_state.info_modulo["h_boa"] = st.number_input("H. BOA", 0, 500, st.session_state.info_modulo.get("h_boa", 149))
    with c3_3:
        st.session_state.info_modulo["p_ev"] = st.number_input("% P.Ev", 0, 100, st.session_state.info_modulo.get("p_ev", 15))

    if "criterio_conocimiento" not in st.session_state.info_modulo:
        st.session_state.info_modulo.update({
            "criterio_conocimiento": 30, # Examen Teórico
            "criterio_procedimiento_ejercicios": 20, # Informes
            "criterio_procedimiento_practicas": 20, # Examen Práctico
            "criterio_actitud_participacion": 30, # Cuaderno
        })

    st.divider()
    suma_t = st.session_state.info_modulo["pond_1t"] + st.session_state.info_modulo["pond_2t"] + st.session_state.info_modulo["pond_3t"]
    cs1, cs2 = st.columns([3, 1])
    with cs1:
        st.markdown("### ⚖️ Entrada. Ponderación por Trimestres")
    with cs2:
        st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
        if suma_t == 100:
            st.success(f"¡Ok!, {suma_t}%")
        else:
            st.error(f"¡Error!, {suma_t}%")
            
    cp1, cp2, cp3 = st.columns(3)
    with cp1:
        st.session_state.info_modulo["pond_1t"] = st.number_input("1er Trimestre (%)", 0, 100, st.session_state.info_modulo.get("pond_1t", 30))
    with cp2:
        st.session_state.info_modulo["pond_2t"] = st.number_input("2º Trimestre (%)", 0, 100, st.session_state.info_modulo.get("pond_2t", 30))
    with cp3:
        st.session_state.info_modulo["pond_3t"] = st.number_input("3er Trimestre (%)", 0, 100, st.session_state.info_modulo.get("pond_3t", 40))

    st.divider()
    suma_criterios = st.session_state.info_modulo["criterio_conocimiento"] + st.session_state.info_modulo["criterio_procedimiento_ejercicios"] + st.session_state.info_modulo["criterio_procedimiento_practicas"] + st.session_state.info_modulo["criterio_actitud_participacion"]
    cc1, cc2 = st.columns([3, 1])
    with cc1:
        st.markdown("### 🧾 Entrada. Criterios de calificación")
    with cc2:
        st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
        if suma_criterios == 100:
            st.success(f"¡Ok!, {suma_criterios}%")
        else:
            st.error(f"¡Error!, {suma_criterios}%")

    col_a, col_b, col_c, col_d = st.columns(4)
    with col_a:
        st.session_state.info_modulo["criterio_conocimiento"] = st.number_input("Examen Teórico", 0, 100, st.session_state.info_modulo["criterio_conocimiento"], key="crit_conocimiento")
    with col_b:
        st.session_state.info_modulo["criterio_procedimiento_practicas"] = st.number_input("Examen Práctico", 0, 100, st.session_state.info_modulo["criterio_procedimiento_practicas"], key="crit_procedimiento_practicas")
    with col_c:
        st.session_state.info_modulo["criterio_procedimiento_ejercicios"] = st.number_input("Informes", 0, 100, st.session_state.info_modulo["criterio_procedimiento_ejercicios"], key="crit_procedimiento_ejercicios")
    with col_d:
        st.session_state.info_modulo["criterio_actitud_participacion"] = st.number_input("Cuaderno", 0, 100, st.session_state.info_modulo["criterio_actitud_participacion"], key="crit_actitud_participacion")

    st.divider()
    # Calcular horas reales totales para el resumen
    h1 = calcular_horas_reales(st.session_state.info_fechas["ini_1t"], st.session_state.info_fechas["fin_1t"], st.session_state.horario, st.session_state.calendar_notes)
    h2 = calcular_horas_reales(st.session_state.info_fechas["ini_2t"], st.session_state.info_fechas["fin_2t"], st.session_state.horario, st.session_state.calendar_notes)
    h3 = calcular_horas_reales(st.session_state.info_fechas["ini_3t"], st.session_state.info_fechas["fin_3t"], st.session_state.horario, st.session_state.calendar_notes)
    h_real_total = h1 + h2 + h3
    diff_boa = h_real_total - st.session_state.info_modulo.get('h_boa', 0)
    cr1, cr2 = st.columns([3, 1])
    with cr1:
        st.markdown("### 📊 Salida. Resumen UD's, Prácticas, Horas reales y H. PdEvC.")
    with cr2:
        if diff_boa == 0:
            st.success(f"¡Ok!, {h_real_total} h")
        elif diff_boa > 0:
            st.error(f"¡Error!, +{diff_boa} h")
        else:
            st.error(f"¡Error!, {diff_boa} h")
            
    # % P.Ev. (Valor editable indicado por el usuario)
    p_ev_val = st.session_state.info_modulo.get("p_ev", 15)
    h_p_ev = (p_ev_val / 100) * h_real_total
    
    c_met1, c_met2, c_met3, c_met4 = st.columns(4)
    with c_met1:
        st.number_input("N.UD.", value=len(st.session_state.df_ud), disabled=True)
    with c_met2:
        st.number_input("N.Práct.", value=len(st.session_state.df_pr), disabled=True)
    with c_met3:
        st.number_input("H.Real", value=h_real_total, disabled=True)
    with c_met4:
        st.number_input("H.P.Ev", value=float(f"{h_p_ev:.1f}"), disabled=True)


# --- PESTAÑA: UD y RA ---
elif menu == "UD y RA":
    st.divider()
    ed_ra = st.data_editor(st.session_state.df_ra, column_config={"ID": st.column_config.TextColumn(width="small", disabled=True)}, num_rows="dynamic", hide_index=True, width="stretch", key="tabla_ra")
    
    # Manejo de nuevos RA
    if len(ed_ra) > len(st.session_state.df_ra):
        new_id = generar_siguiente_id(st.session_state.df_ra, "RA")
        ed_ra.iloc[-1, 0] = new_id
    
    st.session_state.df_ra = ed_ra
    
    st.divider()
    st.subheader("📚 Entrada. Matriz UD-RA. Unidades didácticas y su relación con los Resultados de Aprendizaje")
    lista_ra_ids = st.session_state.df_ra["ID"].tolist()
    
    # Sincronizar columnas de UD con RA actuales
    # 1. Asegurar que las columnas básicas existan
    columnas_basicas = ["ID", "Horas", "Título"]
    for col in columnas_basicas:
        if col not in st.session_state.df_ud.columns:
            st.session_state.df_ud[col] = "" if col != "Horas" else 0

    # 2. Añadir nuevas columnas de RA si no existen
    for ra in lista_ra_ids:
        if ra not in st.session_state.df_ud.columns:
            st.session_state.df_ud[ra] = False
            
    # 3. Eliminar columnas de RA que ya no existen
    cols_a_borrar = [c for c in st.session_state.df_ud.columns if c not in lista_ra_ids and c not in columnas_basicas]
    if cols_a_borrar:
        st.session_state.df_ud = st.session_state.df_ud.drop(columns=cols_a_borrar)

    config_ud = {
        "ID": st.column_config.TextColumn(width="small", disabled=True, pinned=True),
        "Horas": st.column_config.NumberColumn("Horas", width="small", min_value=0, pinned=True),
        "Título": st.column_config.TextColumn("Título", pinned=True)
    }
    for ra in lista_ra_ids:
        config_ud[ra] = st.column_config.CheckboxColumn(ra, default=False)
    
    ed_ud = st.data_editor(st.session_state.df_ud, column_config=config_ud, num_rows="dynamic", hide_index=True, width="stretch", key="tabla_ud")
    
    # Manejo de nuevas UD
    if len(ed_ud) > len(st.session_state.df_ud):
        new_id_ud = generar_siguiente_id(st.session_state.df_ud, "UD")
        ed_ud.iloc[-1, 0] = new_id_ud
        
    st.session_state.df_ud = ed_ud

    st.divider()
    st.subheader("🛠️ Entrada. Planificación de Prácticas y su relación con las Unidades didácticas")
    # Forzar el orden ["ID", "UD", "H", "Práctica"] antes de renderizar (v7.2.1)
    cols_actuales = list(st.session_state.df_pr.columns)
    orden_deseado = ["ID", "UD", "H", "Práctica"]
    # Mantener el orden estricto de las que existan
    nuevo_orden_ui = [c for c in orden_deseado if c in cols_actuales]
    nuevo_orden_ui += [c for c in cols_actuales if c not in orden_deseado]
    
    if cols_actuales != nuevo_orden_ui:
        st.session_state.df_pr = st.session_state.df_pr[nuevo_orden_ui]
    ed_pr = st.data_editor(st.session_state.df_pr, column_config={"ID": st.column_config.TextColumn(width="small", disabled=True), "UD": st.column_config.SelectboxColumn("UD", width="small", options=st.session_state.df_ud["ID"].tolist()), "H": st.column_config.NumberColumn("H", width="small")}, num_rows="dynamic", hide_index=True, width="stretch", key="tabla_pr")
    if len(ed_pr) > len(st.session_state.df_pr): ed_pr.iloc[-1, 0] = generar_siguiente_id(st.session_state.df_pr, "Pr")
    st.session_state.df_pr = ed_pr

# --- PESTAÑA: FECHAS ---
elif menu == "Fechas":
    # CSS para centrar métricas y entradas en esta pestaña
    st.markdown(
        """
        <style>
        [data-testid="stMetricValue"], [data-testid="stMetricLabel"] {
            text-align: center;
            display: flex;
            justify-content: center;
        }
        [data-testid="stDateInput"] label {
            display: flex;
            justify-content: center;
            width: 100%;
        }
        /* Centrar el texto dentro de los inputs de fecha */
        [data-testid="stDateInput"] input {
            text-align: center !important;
        }
        </style>
        """,
        unsafe_allow_html=True
    )
    suma_horario = sum(st.session_state.horario.values())
    c_sub1, c_sub2 = st.columns([3, 1])
    with c_sub1:
        st.subheader("🕒 Entrada. Horario semanal")
    with c_sub2:
        st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
        if suma_horario == st.session_state.info_modulo["h_sem"]:
            st.success(f"¡Ok!, {suma_horario} h")
        else:
            st.error(f"¡Error!, {suma_horario} h")

    # Usamos exactamente 5 columnas para asegurar que aparezcan los botones + y -
    c_h1, c_h2, c_h3, c_h4, c_h5 = st.columns(5)
    
    with c_h1: st.session_state.horario["Lun"] = st.number_input("Lun", 0, 8, st.session_state.horario["Lun"], key="h_in_Lun", step=1)
    with c_h2: st.session_state.horario["Mar"] = st.number_input("Mar", 0, 8, st.session_state.horario["Mar"], key="h_in_Mar", step=1)
    with c_h3: st.session_state.horario["Mié"] = st.number_input("Mié", 0, 8, st.session_state.horario["Mié"], key="h_in_Mié", step=1)
    with c_h4: st.session_state.horario["Jue"] = st.number_input("Jue", 0, 8, st.session_state.horario["Jue"], key="h_in_Jue", step=1)
    with c_h5: st.session_state.horario["Vie"] = st.number_input("Vie", 0, 8, st.session_state.horario["Vie"], key="h_in_Vie", step=1)
    
    st.divider()
    st.subheader("🗓️ Entrada. Fechas trimestres")
    c1, c2, c3 = st.columns(3)
    
    with c1: 
        with st.container(border=True):
            st.markdown("<div style='text-align: center;'><strong>1º Trimestre</strong></div>", unsafe_allow_html=True)
            st.session_state.info_fechas["ini_1t"] = st.date_input("Inicio 1T", st.session_state.info_fechas["ini_1t"], key="d_ini_1t", format="DD/MM/YYYY")
            st.session_state.info_fechas["fin_1t"] = st.date_input("Fin 1T", st.session_state.info_fechas["fin_1t"], key="d_fin_1t", format="DD/MM/YYYY")
            h1 = calcular_horas_reales(st.session_state.info_fechas["ini_1t"], st.session_state.info_fechas["fin_1t"], st.session_state.horario, st.session_state.calendar_notes)
            st.metric("Horas Reales 1T", f"{h1} h")
        
    with c2:
        with st.container(border=True):
            st.markdown("<div style='text-align: center;'><strong>2º Trimestre</strong></div>", unsafe_allow_html=True)
            st.session_state.info_fechas["ini_2t"] = st.date_input("Inicio 2T", st.session_state.info_fechas["ini_2t"], key="d_ini_2t", format="DD/MM/YYYY")
            st.session_state.info_fechas["fin_2t"] = st.date_input("Fin 2T", st.session_state.info_fechas["fin_2t"], key="d_fin_2t", format="DD/MM/YYYY")
            h2 = calcular_horas_reales(st.session_state.info_fechas["ini_2t"], st.session_state.info_fechas["fin_2t"], st.session_state.horario, st.session_state.calendar_notes)
            st.metric("Horas Reales 2T", f"{h2} h")
        
    with c3:
        with st.container(border=True):
            st.markdown("<div style='text-align: center;'><strong>3º Trimestre</strong></div>", unsafe_allow_html=True)
            st.session_state.info_fechas["ini_3t"] = st.date_input("Inicio 3T", st.session_state.info_fechas["ini_3t"], key="d_ini_3t", format="DD/MM/YYYY")
            st.session_state.info_fechas["fin_3t"] = st.date_input("Fin 3T", st.session_state.info_fechas["fin_3t"], key="d_fin_3t", format="DD/MM/YYYY")
            h3 = calcular_horas_reales(st.session_state.info_fechas["ini_3t"], st.session_state.info_fechas["fin_3t"], st.session_state.horario, st.session_state.calendar_notes)
            st.metric("Horas Reales 3T", f"{h3} h")

    st.divider()

    st.markdown('### 🖊️ Entrada. Porcentaje por trimestres')

    mat_eval = pd.DataFrame([
        {"Tri.": "1º Tri.", "Intervalo": f"{st.session_state.info_fechas['ini_1t'].strftime('%d/%m/%Y')} - {st.session_state.info_fechas['fin_1t'].strftime('%d/%m/%Y')}", "% Ev.2": int(st.session_state.info_modulo["t1_ev2"]), "% Ev.3": int(st.session_state.info_modulo["t1_ev3"])},
        {"Tri.": "2º Tri.", "Intervalo": f"{st.session_state.info_fechas['ini_2t'].strftime('%d/%m/%Y')} - {st.session_state.info_fechas['fin_2t'].strftime('%d/%m/%Y')}", "% Ev.2": int(st.session_state.info_modulo["t2_ev2"]), "% Ev.3": int(st.session_state.info_modulo["t2_ev3"])},
        {"Tri.": "3º Tri.", "Intervalo": f"{st.session_state.info_fechas['ini_3t'].strftime('%d/%m/%Y')} - {st.session_state.info_fechas['fin_3t'].strftime('%d/%m/%Y')}", "% Ev.2": int(st.session_state.info_modulo["t3_ev2"]), "% Ev.3": int(st.session_state.info_modulo["t3_ev3"])},
    ])

    total_ev2 = int(st.session_state.info_modulo["t1_ev2"] + st.session_state.info_modulo["t2_ev2"] + st.session_state.info_modulo["t3_ev2"])
    total_ev3 = int(st.session_state.info_modulo["t1_ev3"] + st.session_state.info_modulo["t2_ev3"] + st.session_state.info_modulo["t3_ev3"])
    total_row = pd.DataFrame([{"Tri.": "Total", "Intervalo": "", "% Ev.2": total_ev2, "% Ev.3": total_ev3}])

    ed_eval = st.data_editor(
        pd.concat([mat_eval, total_row], ignore_index=True),
        column_config={
            "Tri.": st.column_config.TextColumn(disabled=True),
            "Intervalo": st.column_config.TextColumn(disabled=True),
            "% Ev.2": st.column_config.NumberColumn(min_value=0, max_value=100),
            "% Ev.3": st.column_config.NumberColumn(min_value=0, max_value=100),
        },
        hide_index=True,
        width="stretch",
        key="eval_trimestres"
    )

    # Botón PDF export
    st.divider()
    st.subheader("📄 Salida. Exportar Calendario PDF")
    st.markdown("Genera un documento PDF con todos los días lectivos y unidades didácticas del curso organizados en cuadrículas bimensuales (estilo Cuaderno de Séneca).")
    
    # Generate the PDF in memory
    with st.spinner('Generando documento PDF...'):
        pdf_buffer = generar_pdf_calendario(
            st.session_state.info_modulo, 
            st.session_state.info_fechas, 
            st.session_state.planning_ledger, 
            st.session_state.calendar_notes
        )
        
    st.download_button(
        label="⬇️ Descargar Calendario Académico (.pdf)",
        data=pdf_buffer,
        file_name=f"calendario_{st.session_state.info_modulo.get('modulo', 'lectivo').replace(' ', '_')}.pdf",
        mime="application/pdf",
        type="primary"
    )

    for _, row in ed_eval.head(3).iterrows():
        if row["Tri."] == "1º Tri.":
            st.session_state.info_modulo["t1_ev2"] = int(row["% Ev.2"])
            st.session_state.info_modulo["t1_ev3"] = int(row["% Ev.3"])
        elif row["Tri."] == "2º Tri.":
            st.session_state.info_modulo["t2_ev2"] = int(row["% Ev.2"])
            st.session_state.info_modulo["t2_ev3"] = int(row["% Ev.3"])
        elif row["Tri."] == "3º Tri.":
            st.session_state.info_modulo["t3_ev2"] = int(row["% Ev.2"])
            st.session_state.info_modulo["t3_ev3"] = int(row["% Ev.3"])





    st.divider()
    st.subheader("Fechas de trimestres")

    st.markdown('### 📌 Salida. Resumen de festivos y relevantes')

    # Recopilar datos
    ls = []
    count_f = 0
    count_r = 0
    fechas_f = {k[2:] for k in st.session_state.calendar_notes if k.startswith('f_')}
    fechas_r = {k[2:] for k in st.session_state.calendar_notes if k.startswith('r_')}
    fechas = sorted(fechas_f.union(fechas_r), key=lambda d: datetime.strptime(d, '%d/%m/%Y'))
    dias_semana = {0: 'Lun', 1: 'Mar', 2: 'Mié', 3: 'Jue', 4: 'Vie', 5: 'Sáb', 6: 'Dom'}
    
    for fecha in fechas:
        dia_semana = dias_semana[datetime.strptime(fecha, '%d/%m/%Y').weekday()]
        festivo = st.session_state.calendar_notes.get(f'f_{fecha}', '').strip()
        relevante = st.session_state.calendar_notes.get(f'r_{fecha}', '').strip()
        if festivo or relevante:
            ls.append({'Fecha': fecha, 'Día': dia_semana, 'Festivos': festivo, 'Relevantes': relevante})
            if festivo: count_f += 1
            if relevante: count_r += 1

    if ls:
        c1, c2 = st.columns(2)
        with c1: st.metric("Total Festivos", count_f)
        with c2: st.metric("Total Relevantes", count_r)
        
        df_festivos = pd.DataFrame(ls)
        st.dataframe(
            df_festivos,
            column_config={
                "Fecha": st.column_config.TextColumn("📅 Fecha"),
                "Día": st.column_config.TextColumn("🗓️ Día"),
                "Festivos": st.column_config.TextColumn("🎉 Festivos"),
                "Relevantes": st.column_config.TextColumn("🔔 Relevantes"),
            },
            hide_index=True,
            width="stretch"
        )
    else:
        st.info('No hay anotaciones de festivos o eventos relevantes.')

    st.divider()
    st.subheader("🗓️ Entrada. Festivos y relevantes")
    meses_curso = [("Septiembre", 9, 2025), ("Octubre", 10, 2025), ("Noviembre", 11, 2025), ("Diciembre", 12, 2025), ("Enero", 1, 2026), ("Febrero", 2, 2026), ("Marzo", 3, 2026), ("Abril", 4, 2026), ("Mayo", 5, 2026), ("Junio", 6, 2026)]
    
    for n, m, a in meses_curso:
        with st.expander(f"📅 {n} {a}"):
            cal = calendar.monthcalendar(a, m)
            filas_cal = []
            for week in cal:
                for day in week:
                    if day != 0:
                        fecha_str = f"{day:02d}/{m:02d}/{a}"
                        num_dia_semana = date(a, m, day).weekday()
                        nombre_dia = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][num_dia_semana]
                        
                        festivo = st.session_state.calendar_notes.get(f"f_{fecha_str}", "")
                        relevante = st.session_state.calendar_notes.get(f"r_{fecha_str}", "")
                        
                        filas_cal.append({"Fecha": fecha_str, "Día": nombre_dia, "Festivos": festivo, "Relevantes": relevante})
            
            ed_cal = st.data_editor(pd.DataFrame(filas_cal), hide_index=True, width="stretch", key=f"calendario_{n}_{a}")
            
            for _, row in ed_cal.iterrows():
                st.session_state.calendar_notes[f"f_{row['Fecha']}"] = row['Festivos']
                st.session_state.calendar_notes[f"r_{row['Fecha']}"] = row['Relevantes']

# --- PESTAÑA: ALUMNADO ---
elif menu == "Alumnado":
    st.divider()
    st.subheader("👥 Listado de Alumnado")
    
    # Hemos vuelto a la versión con todas las columnas confirmadas
    # Configuración de columnas con fijación lateral (v5.4)
    config_al = {
        "ID": st.column_config.TextColumn("ID", width="small", disabled=True, pinned=True),
        "Estado": st.column_config.SelectboxColumn(pinned=True),
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
elif menu == "Seguimiento":
    st.divider()
    st.subheader("📍 Salida. Seguimiento de Unidades didácticas")
    
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
    st.subheader("🗓️ Entrada. Seguimiento diario de clases. Contingencias")
    
    # 1. Obtener todos los días lectivos (con horas > 0 y no festivos)
    dias_semana = ["Lun", "Mar", "Mié", "Jue", "Vie"]
    mapping_meses_full = {
        "Sep": "Septiembre", "Oct": "Octubre", "Nov": "Noviembre", "Dic": "Diciembre",
        "Ene": "Enero", "Feb": "Febrero", "Mar": "Marzo", "Abr": "Abril", "May": "Mayo", "Jun": "Junio"
    }
    
    # Consolidar todos los lectivos
    all_lectivos = []
    for tri in ["1t", "2t", "3t"]:
        if f"ini_{tri}" in st.session_state.info_fechas and f"fin_{tri}" in st.session_state.info_fechas:
            curr = st.session_state.info_fechas[f"ini_{tri}"]
            fin = st.session_state.info_fechas[f"fin_{tri}"]
            while curr <= fin:
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

# --- PESTAÑA: EVALUACIÓN ---
elif menu == "Evaluación":
    st.divider()
    st.subheader("📊 Salida. Evaluación del Alumnado")
    
    # 1. Sincronizar df_eval con df_al (Asegurar que existan todos los alumnos)
    if not st.session_state.df_al.empty:
        ids_alumnado = st.session_state.df_al["ID"].tolist()
        
        # Filtrar df_eval para mantener solo IDs que aún existen en df_al
        st.session_state.df_eval = st.session_state.df_eval[st.session_state.df_eval["ID"].isin(ids_alumnado)]
        
        # Añadir nuevos alumnos a df_eval
        ids_eval = st.session_state.df_eval["ID"].tolist()
        nuevos_alumnos = []
        for index, row in st.session_state.df_al.iterrows():
            if row["ID"] not in ids_eval:
                nuevo = {
                    "ID": row["ID"],
                    "1T_Teoria": 0, "1T_Practica": 0, "1T_Informes": 0, "1T_Cuaderno": 0, "1T_Nota": 0,
                    "2T_Teoria": 0, "2T_Practica": 0, "2T_Informes": 0, "2T_Cuaderno": 0, "2T_Nota": 0,
                    "3T_Teoria": 0, "3T_Practica": 0, "3T_Informes": 0, "3T_Cuaderno": 0, "3T_Nota": 0,
                    "Nota_Final": 0
                }
                nuevos_alumnos.append(nuevo)
                
        if nuevos_alumnos:
            st.session_state.df_eval = pd.concat([st.session_state.df_eval, pd.DataFrame(nuevos_alumnos)], ignore_index=True)

        # 2. Selector de Trimestre
        trimestre_sel = st.radio("Selecciona qué evaluar:", ["1º Trimestre", "2º Trimestre", "3º Trimestre", "Final"], horizontal=True)
        
        st.write("---")

        if trimestre_sel != "Final":
            t_pref = "1T" if trimestre_sel == "1º Trimestre" else "2T" if trimestre_sel == "2º Trimestre" else "3T"
            
            # 3. Preparar Vista del DataFrame (Trimestres)
            vista_df = pd.merge(
                st.session_state.df_al[["ID", "Apellidos", "Nombre"]], 
                st.session_state.df_eval[["ID", f"{t_pref}_Teoria", f"{t_pref}_Practica", f"{t_pref}_Informes", f"{t_pref}_Cuaderno"]], 
                on="ID", 
                how="left"
            )
            vista_df = vista_df.fillna(0)

            # Recalcular Nota del Trimestre siempre antes de mostrar
            pto_teo = st.session_state.info_modulo.get("criterio_conocimiento", 30) / 100
            pto_pra = st.session_state.info_modulo.get("criterio_procedimiento_practicas", 20) / 100
            pto_inf = st.session_state.info_modulo.get("criterio_procedimiento_ejercicios", 20) / 100
            pto_cua = st.session_state.info_modulo.get("criterio_actitud_participacion", 30) / 100

            vista_df[f"{t_pref}_Nota"] = (
                vista_df[f"{t_pref}_Teoria"] * pto_teo + 
                vista_df[f"{t_pref}_Practica"] * pto_pra + 
                vista_df[f"{t_pref}_Informes"] * pto_inf + 
                vista_df[f"{t_pref}_Cuaderno"] * pto_cua
            ).round(2)

            # 4. Configuración del editor de datos
            col_cfg = {
                "ID": st.column_config.TextColumn("ID", width="small", disabled=True, pinned=True),
                "Apellidos": st.column_config.TextColumn("Apellidos", disabled=True, pinned=True),
                "Nombre": st.column_config.TextColumn("Nombre", disabled=True, pinned=True),
                f"{t_pref}_Teoria": st.column_config.NumberColumn(f"Examen Teórico ({pto_teo*100:.0f}%)", min_value=0.0, max_value=10.0, step=0.1, format="%.2f"),
                f"{t_pref}_Practica": st.column_config.NumberColumn(f"Examen Prác. ({pto_pra*100:.0f}%)", min_value=0.0, max_value=10.0, step=0.1, format="%.2f"),
                f"{t_pref}_Informes": st.column_config.NumberColumn(f"Informes ({pto_inf*100:.0f}%)", min_value=0.0, max_value=10.0, step=0.1, format="%.2f"),
                f"{t_pref}_Cuaderno": st.column_config.NumberColumn(f"Cuaderno ({pto_cua*100:.0f}%)", min_value=0.0, max_value=10.0, step=0.1, format="%.2f"),
                f"{t_pref}_Nota": st.column_config.NumberColumn("Nota Trimestre", disabled=True, format="%.2f"),
            }

            ed_eval = st.data_editor(
                vista_df,
                column_config=col_cfg,
                hide_index=True,
                width="stretch",
                key=f"editor_eval_{t_pref}"
            )

            # 5. Guardar cambios en el origen
            if not ed_eval.equals(vista_df):
                for index, row in ed_eval.iterrows():
                    id_al = row["ID"]
                    idx_orig = st.session_state.df_eval[st.session_state.df_eval["ID"] == id_al].index[0]
                    st.session_state.df_eval.at[idx_orig, f"{t_pref}_Teoria"] = row[f"{t_pref}_Teoria"]
                    st.session_state.df_eval.at[idx_orig, f"{t_pref}_Practica"] = row[f"{t_pref}_Practica"]
                    st.session_state.df_eval.at[idx_orig, f"{t_pref}_Informes"] = row[f"{t_pref}_Informes"]
                    st.session_state.df_eval.at[idx_orig, f"{t_pref}_Cuaderno"] = row[f"{t_pref}_Cuaderno"]
                    st.session_state.df_eval.at[idx_orig, f"{t_pref}_Nota"] = row[f"{t_pref}_Nota"]
                st.rerun()

        else:
            # VISTA FINAL
            st.markdown("### Resumen Final")
            
            # Recalcular todas las notas de trimestres internamente por si acaso
            pto_teo = st.session_state.info_modulo.get("criterio_conocimiento", 30) / 100
            pto_pra = st.session_state.info_modulo.get("criterio_procedimiento_practicas", 20) / 100
            pto_inf = st.session_state.info_modulo.get("criterio_procedimiento_ejercicios", 20) / 100
            pto_cua = st.session_state.info_modulo.get("criterio_actitud_participacion", 30) / 100
            
            for t in ["1T", "2T", "3T"]:
                st.session_state.df_eval[f"{t}_Nota"] = (
                    st.session_state.df_eval[f"{t}_Teoria"] * pto_teo + 
                    st.session_state.df_eval[f"{t}_Practica"] * pto_pra + 
                    st.session_state.df_eval[f"{t}_Informes"] * pto_inf + 
                    st.session_state.df_eval[f"{t}_Cuaderno"] * pto_cua
                ).round(2)

            # Preparar vista Final
            vista_final = pd.merge(
                st.session_state.df_al[["ID", "Apellidos", "Nombre"]], 
                st.session_state.df_eval[["ID", "1T_Nota", "2T_Nota", "3T_Nota"]], 
                on="ID", 
                how="left"
            )
            
            # Ponderaciones Trimestrales
            pond_1t = st.session_state.info_modulo.get("pond_1t", 30) / 100
            pond_2t = st.session_state.info_modulo.get("pond_2t", 30) / 100
            pond_3t = st.session_state.info_modulo.get("pond_3t", 40) / 100
            
            vista_final["Nota_Final"] = (
                vista_final["1T_Nota"] * pond_1t + 
                vista_final["2T_Nota"] * pond_2t + 
                vista_final["3T_Nota"] * pond_3t
            ).round(2)
            
            # Guardamos la nota final calculada en el state
            for index, row in vista_final.iterrows():
                id_al = row["ID"]
                idx_orig = st.session_state.df_eval[st.session_state.df_eval["ID"] == id_al].index[0]
                st.session_state.df_eval.at[idx_orig, "Nota_Final"] = row["Nota_Final"]
                
            col_cfg_f = {
                "ID": st.column_config.TextColumn("ID", width="small", disabled=True, pinned=True),
                "Apellidos": st.column_config.TextColumn("Apellidos", disabled=True, pinned=True),
                "Nombre": st.column_config.TextColumn("Nombre", disabled=True, pinned=True),
                "1T_Nota": st.column_config.NumberColumn(f"1º Trimestre ({pond_1t*100:.0f}%)", disabled=True, format="%.2f"),
                "2T_Nota": st.column_config.NumberColumn(f"2º Trimestre ({pond_2t*100:.0f}%)", disabled=True, format="%.2f"),
                "3T_Nota": st.column_config.NumberColumn(f"3º Trimestre ({pond_3t*100:.0f}%)", disabled=True, format="%.2f"),
                "Nota_Final": st.column_config.NumberColumn("🌟 Nota Final", disabled=True, format="%.2f"),
            }
            
            st.data_editor(
                vista_final,
                column_config=col_cfg_f,
                hide_index=True,
                width="stretch",
                key="editor_eval_final"
            )


    else:
        st.info("No hay alumnos registrados. Por favor, añade alumnos en la pestaña 'Alumnado' primero.")

# --- PESTAÑA: INFORMACIÓN ---
elif menu == "Información":
    st.divider()
    st.subheader("📊 Información")    
    st.info("Esta pestaña está actualmente vacía.")