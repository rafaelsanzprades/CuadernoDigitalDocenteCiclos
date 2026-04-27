import streamlit as st
import pandas as pd
from datetime import datetime, date
import json
import os
import shutil
from schemas import df_ra_empty, df_ud_empty, df_ce_empty, df_act_empty

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

def _hacer_backup(nombre_archivo):
    """Crea backup con timestamp antes de sobreescribir."""
    _BAK_DIR = "backups"
    _BAK_MAX = 5
    if os.path.exists(nombre_archivo):
        os.makedirs(_BAK_DIR, exist_ok=True)
        _ts = datetime.now().strftime("%Y%m%d_%H%M")
        _base = nombre_archivo.replace(".json", "")
        _bak_name = os.path.join(_BAK_DIR, f"{_base}_{_ts}.bak.json")
        try:
            shutil.copy2(nombre_archivo, _bak_name)
        except Exception as e:
            st.error(f"Error al crear backup: {e}")
        _baks = sorted([f for f in os.listdir(_BAK_DIR)
                        if f.startswith(_base) and f.endswith(".bak.json")])
        while len(_baks) > _BAK_MAX:
            try:
                os.remove(os.path.join(_BAK_DIR, _baks.pop(0)))
            except Exception:
                pass

# ─── GLOBALES ───────────────────────────────────────────────
def guardar_global():
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
    try:
        with open("ciclos-fp.json", "w", encoding="utf-8") as f:
            json.dump(global_data, f, ensure_ascii=False, indent=4)
    except Exception as e:
        st.error(f"Fallo al guardar datos globales: {e}")

def cargar_global():
    if os.path.exists("ciclos-fp.json"):
        try:
            with open("ciclos-fp.json", "r", encoding="utf-8-sig") as fg:
                global_data = json.load(fg)
        except json.JSONDecodeError:
            st.error("Error crítico: el archivo ciclos-fp.json está corrupto. Revisar la carpeta backups.")
            return

        st.session_state.info_fechas = {k: unserialize_date(v) for k, v in global_data.get("info_fechas", {}).items()}
        st.session_state.calendar_notes = global_data.get("calendar_notes", {})
        st.session_state.config_contexto = global_data.get("config_contexto", {"entorno": "", "perfil": "", "metodologia": ""})
        info_docente = global_data.get("info_docente", {})
        st.session_state.info_modulo["centro"] = info_docente.get("centro", "")
        st.session_state.info_modulo["profesorado"] = info_docente.get("profesorado", "")

# ─── PROGRAMACIÓN DIDÁCTICA ──────────────────────────────────
def guardar_pd(nombre_base):
    nombre_base = nombre_base.replace(".json", "")
    while nombre_base.endswith("-pd"):
        nombre_base = nombre_base[:-3]
    nombre_archivo = nombre_base + "-pd.json"
    _hacer_backup(nombre_archivo)
    guardar_global()
    info_modulo_to_save = st.session_state.info_modulo.copy()
    info_modulo_to_save.pop("centro", None)
    info_modulo_to_save.pop("profesorado", None)
    data = {
        "tipo": "pd",
        "info_modulo": info_modulo_to_save,
        "horario": st.session_state.horario,
        "df_ra": st.session_state.df_ra.to_dict(orient="records"),
        "df_ud": st.session_state.df_ud.to_dict(orient="records"),
        "df_pr": st.session_state.df_pr.to_dict(orient="records"),
        "df_ce": st.session_state.df_ce.to_dict(orient="records") if 'df_ce' in st.session_state else [],
        "df_act": st.session_state.df_act.to_dict(orient="records") if 'df_act' in st.session_state else [],
        "df_dua": st.session_state.df_dua.to_dict(orient="records") if 'df_dua' in st.session_state else [],
        "df_contingencia": st.session_state.df_contingencia.to_dict(orient="records") if 'df_contingencia' in st.session_state else [],
        "df_ace": st.session_state.df_ace.to_dict(orient="records") if 'df_ace' in st.session_state else [],
        "df_tareas": st.session_state.df_tareas.to_dict(orient="records") if 'df_tareas' in st.session_state else [],
        "df_sesiones": st.session_state.df_sesiones.to_dict(orient="records") if 'df_sesiones' in st.session_state else [],
        "config_aula": st.session_state.config_aula if 'config_aula' in st.session_state else {},
        "planning_ledger": st.session_state.planning_ledger if 'planning_ledger' in st.session_state else {},
    }
    try:
        with open(nombre_archivo, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
    except Exception as e:
        st.error(f"Error al guardar Programación Didáctica: {e}")
    return nombre_archivo

def cargar_pd(nombre_archivo):
    try:
        with open(nombre_archivo, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
    except Exception as e:
        st.error(f"Error al cargar Programación Didáctica '{nombre_archivo}': {e}. El archivo podría estar corrupto.")
        return

    st.session_state.info_modulo = data.get("info_modulo", {})
    cargar_global()
    st.session_state.horario = {"Lun": 0, "Mar": 0, "Mié": 0, "Jue": 0, "Vie": 0}
    st.session_state.horario.update(data.get("horario", {}))
    st.session_state.df_ra = pd.DataFrame(data.get("df_ra", [])) if data.get("df_ra") else df_ra_empty()
    st.session_state.df_ud = pd.DataFrame(data.get("df_ud", [])) if data.get("df_ud") else df_ud_empty()
    st.session_state.df_pr = pd.DataFrame(data.get("df_pr", []))
    if not st.session_state.df_pr.empty:
        st.session_state.df_pr.rename(columns={"Nombre": "Practica", "Práctica": "Practica"}, inplace=True)
        cols = st.session_state.df_pr.columns.tolist()
        desired_order = ["ID", "UD", "H", "Practica"]
        new_order = [c for c in desired_order if c in cols] + [c for c in cols if c not in desired_order]
        st.session_state.df_pr = st.session_state.df_pr[new_order]
    st.session_state.df_ce = pd.DataFrame(data.get("df_ce", [])) if data.get("df_ce") else df_ce_empty()
    st.session_state.df_act = pd.DataFrame(data.get("df_act", [])) if data.get("df_act") else df_act_empty()
    if not st.session_state.df_act.empty and "Tipo" in st.session_state.df_act.columns:
        st.session_state.df_act["Tipo"] = st.session_state.df_act["Tipo"].replace({"Teoría": "Teoria", "Práctica": "Practica"})
    st.session_state.df_dua = pd.DataFrame(data.get("df_dua", []))
    st.session_state.df_contingencia = pd.DataFrame(data.get("df_contingencia", []))
    st.session_state.df_ace = pd.DataFrame(data.get("df_ace", []))
    st.session_state.df_tareas = pd.DataFrame(data.get("df_tareas", []))
    st.session_state.df_sesiones = pd.DataFrame(data.get("df_sesiones", []))
    st.session_state.config_aula = data.get("config_aula", {"Metodología": "", "Atención a la diversidad": ""})
    st.session_state.planning_ledger = data.get("planning_ledger", {})

# ─── CURSO ACTUAL ─────────────────────────────────────────────
def guardar_curso(nombre_base):
    nombre_base = nombre_base.replace(".json", "")
    nombre_archivo = nombre_base + ".json"
    _hacer_backup(nombre_archivo)
    data_curso = {
        "tipo": "curso",
        "df_al": st.session_state.df_al.to_dict(orient="records"),
        "df_eval": st.session_state.df_eval.to_dict(orient="records") if 'df_eval' in st.session_state else [],
        "df_feoe": st.session_state.df_feoe.to_dict(orient="records") if 'df_feoe' in st.session_state else [],
        "df_sgmt": st.session_state.df_sgmt.to_dict(orient="records") if 'df_sgmt' in st.session_state else [],
        "daily_ledger": st.session_state.daily_ledger if 'daily_ledger' in st.session_state else {},
    }
    try:
        with open(nombre_archivo, "w", encoding="utf-8") as f:
            json.dump(data_curso, f, ensure_ascii=False, indent=4)
    except Exception as e:
        st.error(f"Error al guardar datos de curso: {e}")
    return nombre_archivo

def cargar_curso(nombre_archivo):
    try:
        with open(nombre_archivo, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
    except Exception as e:
        st.error(f"Error al cargar Curso '{nombre_archivo}': {e}. Revisar backups.")
        return

    st.session_state.df_al = pd.DataFrame(data.get("df_al", []))
    if not st.session_state.df_al.empty:
        st.session_state.df_al.rename(columns={"Matrícula": "Matricula", "Móvil": "Movil"}, inplace=True)
    st.session_state.df_feoe = pd.DataFrame(data.get("df_feoe", []))
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

# ─── COMPATIBILIDAD: JSON UNIFICADO ANTERIOR ─────────────────
def guardar_datos(nombre_base):
    guardar_pd(st.session_state.get("active_pd", nombre_base))
    guardar_curso(st.session_state.get("active_curso", nombre_base + "-curso-2025-26"))
    return nombre_base

def cargar_datos(nombre_archivo):
    try:
        with open(nombre_archivo, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
    except Exception as e:
        st.error(f"Error crítico cargando datos antiguos '{nombre_archivo}': {e}")
        return

    tipo = data.get("tipo", "legacy")

    if tipo == "pd":
        cargar_pd(nombre_archivo)
    elif tipo == "curso":
        cargar_curso(nombre_archivo)
    else:
        st.session_state.info_modulo = data.get("info_modulo", {})
        cargar_global()
        if not os.path.exists("ciclos-fp.json"):
            st.session_state.info_fechas = {k: unserialize_date(v) for k, v in data.get("info_fechas", {}).items()}
            st.session_state.calendar_notes = data.get("calendar_notes", {})
            st.session_state.config_contexto = data.get("config_contexto", {"entorno": "", "perfil": "", "metodologia": ""})
        st.session_state.horario = {"Lun": 0, "Mar": 0, "Mié": 0, "Jue": 0, "Vie": 0}
        st.session_state.horario.update(data.get("horario", {}))
        st.session_state.df_ra = pd.DataFrame(data.get("df_ra", [])) if data.get("df_ra") else df_ra_empty()
        st.session_state.df_ud = pd.DataFrame(data.get("df_ud", [])) if data.get("df_ud") else df_ud_empty()
        st.session_state.df_pr = pd.DataFrame(data.get("df_pr", []))
        if not st.session_state.df_pr.empty:
            st.session_state.df_pr.rename(columns={"Nombre": "Practica", "Práctica": "Practica"}, inplace=True)
            cols = st.session_state.df_pr.columns.tolist()
            desired_order = ["ID", "UD", "H", "Practica"]
            new_order = [c for c in desired_order if c in cols] + [c for c in cols if c not in desired_order]
            st.session_state.df_pr = st.session_state.df_pr[new_order]
        st.session_state.df_al = pd.DataFrame(data.get("df_al", []))
        if not st.session_state.df_al.empty:
            st.session_state.df_al.rename(columns={"Matrícula": "Matricula", "Móvil": "Movil"}, inplace=True)
        st.session_state.df_ce = pd.DataFrame(data.get("df_ce", [])) if data.get("df_ce") else df_ce_empty()
        st.session_state.df_act = pd.DataFrame(data.get("df_act", [])) if data.get("df_act") else df_act_empty()
        if not st.session_state.df_act.empty and "Tipo" in st.session_state.df_act.columns:
            st.session_state.df_act["Tipo"] = st.session_state.df_act["Tipo"].replace({"Teoría": "Teoria", "Práctica": "Practica"})
        st.session_state.df_feoe = pd.DataFrame(data.get("df_feoe", []))
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
