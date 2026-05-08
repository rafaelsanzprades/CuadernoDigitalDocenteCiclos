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

def render_matricula_alumnado(ro_pd, ro_curso, ro_global):
    c_m1, c_m2 = st.columns([4, 1])
    with c_m1:
        st.subheader("👥 Gestión de Matrícula del Alumnado")
    with c_m2:
        if st.button("💾 Guardar Cambios", use_container_width=True, type="primary"):
            from storage_manager import guardar_curso
            guardar_curso(st.session_state.active_curso)
            st.toast("✅ Matrícula guardada", icon="💾")
    st.write("")
    
    # ── Importación desde Excel / CSV ──────────────────────────
    with st.expander("📂 Importar alumnado desde Excel o CSV", expanded=False):
        st.markdown("""
        Sube un archivo **Excel (.xlsx)** o **CSV (.csv)** con la lista oficial del alumnado.  
        El sistema detectará automáticamente las columnas de **Apellidos**, **Nombre**, **Email**, etc.
        """)
        
        uploaded_file = st.file_uploader(
            "Seleccionar archivo", 
            type=["xlsx", "xls", "csv"],
            key="import_alumnado_file"
        )
        
        if uploaded_file is not None:
            try:
                # Leer el archivo
                if uploaded_file.name.endswith(".csv"):
                    df_import = pd.read_csv(uploaded_file, dtype=str)
                else:
                    df_import = pd.read_excel(uploaded_file, dtype=str)
                
                df_import = df_import.fillna("")
                
                st.success(f"✅ Archivo leído: **{len(df_import)} filas** × **{len(df_import.columns)} columnas**")
                
                # Auto-detección de columnas con mapeo inteligente
                _MAPEO_COLUMNAS = {
                    "Apellidos": [
                        "apellidos", "apellido", "apellido1", "primer apellido",
                        "surname", "last_name", "lastname", "apellidos y nombre",
                        "alumno/a", "alumno", "apellidos del alumno"
                    ],
                    "Nombre": [
                        "nombre", "name", "first_name", "firstname",
                        "nombre del alumno", "nombre alumno", "nombre propio"
                    ],
                    "email": [
                        "email", "correo", "e-mail", "correo electrónico",
                        "correo institucional", "mail", "email institucional",
                        "correo educa", "email educa"
                    ],
                    "Nacimiento": [
                        "nacimiento", "fecha nacimiento", "fecha_nacimiento",
                        "f. nacimiento", "fech. nac.", "fecha nac",
                        "birth", "birthdate", "date_of_birth"
                    ],
                    "Móvil": [
                        "móvil", "movil", "teléfono", "telefono", "phone",
                        "tlf", "tel", "nº teléfono", "teléfono móvil"
                    ],
                    "Matrícula": [
                        "matrícula", "matricula", "nº matrícula", "expediente",
                        "nº expediente", "num_matricula", "código alumno"
                    ],
                }
                
                cols_importadas = df_import.columns.tolist()
                mapeo_detectado = {}
                
                for campo_interno, aliases in _MAPEO_COLUMNAS.items():
                    for col_orig in cols_importadas:
                        if col_orig.strip().lower() in aliases:
                            mapeo_detectado[campo_interno] = col_orig
                            break
                
                # Si hay una columna combinada "Apellidos y Nombre", intentar separarla
                _col_combinada = None
                for col in cols_importadas:
                    if col.strip().lower() in ["apellidos y nombre", "apellidos, nombre", "alumno/a", "alumno"]:
                        _col_combinada = col
                        break
                
                st.markdown("##### Mapeo de columnas detectado")
                st.caption("Ajusta las columnas si la detección automática no es correcta.")
                
                mc1, mc2 = st.columns(2)
                opciones_col = ["— No importar —"] + cols_importadas
                
                with mc1:
                    sel_apellidos = st.selectbox(
                        "Apellidos", opciones_col,
                        index=opciones_col.index(mapeo_detectado["Apellidos"]) if "Apellidos" in mapeo_detectado else 0,
                        key="map_apellidos"
                    )
                    sel_email = st.selectbox(
                        "Email", opciones_col,
                        index=opciones_col.index(mapeo_detectado["email"]) if "email" in mapeo_detectado else 0,
                        key="map_email"
                    )
                    sel_movil = st.selectbox(
                        "Móvil", opciones_col,
                        index=opciones_col.index(mapeo_detectado["Móvil"]) if "Móvil" in mapeo_detectado else 0,
                        key="map_movil"
                    )
                with mc2:
                    sel_nombre = st.selectbox(
                        "Nombre", opciones_col,
                        index=opciones_col.index(mapeo_detectado["Nombre"]) if "Nombre" in mapeo_detectado else 0,
                        key="map_nombre"
                    )
                    sel_nacimiento = st.selectbox(
                        "Fecha Nacimiento", opciones_col,
                        index=opciones_col.index(mapeo_detectado["Nacimiento"]) if "Nacimiento" in mapeo_detectado else 0,
                        key="map_nacimiento"
                    )
                    sel_matricula = st.selectbox(
                        "Matrícula", opciones_col,
                        index=opciones_col.index(mapeo_detectado["Matrícula"]) if "Matrícula" in mapeo_detectado else 0,
                        key="map_matricula"
                    )
                
                # Construir DataFrame de preview
                df_preview = pd.DataFrame()
                _no_imp = "— No importar —"
                
                # Caso especial: columna combinada "Apellidos, Nombre"
                if _col_combinada and sel_apellidos == _no_imp and sel_nombre == _no_imp:
                    # Intentar separar por coma
                    partes = df_import[_col_combinada].str.split(",", n=1, expand=True)
                    df_preview["Apellidos"] = partes[0].str.strip() if 0 in partes.columns else ""
                    df_preview["Nombre"] = partes[1].str.strip() if 1 in partes.columns else ""
                    st.info(f"📌 Separando columna combinada: **{_col_combinada}** → Apellidos + Nombre")
                else:
                    df_preview["Apellidos"] = df_import[sel_apellidos].str.strip() if sel_apellidos != _no_imp else ""
                    df_preview["Nombre"] = df_import[sel_nombre].str.strip() if sel_nombre != _no_imp else ""
                
                df_preview["email"] = df_import[sel_email].str.strip() if sel_email != _no_imp else ""
                df_preview["Nacimiento"] = df_import[sel_nacimiento].str.strip() if sel_nacimiento != _no_imp else ""
                df_preview["Móvil"] = df_import[sel_movil].str.strip() if sel_movil != _no_imp else ""
                df_preview["Matrícula"] = df_import[sel_matricula].str.strip() if sel_matricula != _no_imp else ""
                df_preview["Estado"] = "Alta"
                df_preview["Repite"] = ""
                df_preview["Comentarios"] = ""
                
                # Calcular edad desde Nacimiento si es posible
                df_preview["Edad"] = ""
                if sel_nacimiento != _no_imp:
                    for idx, row in df_preview.iterrows():
                        try:
                            for fmt in ["%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y"]:
                                try:
                                    fecha_nac = datetime.strptime(str(row["Nacimiento"]).strip(), fmt).date()
                                    hoy = date.today()
                                    edad = hoy.year - fecha_nac.year - ((hoy.month, hoy.day) < (fecha_nac.month, fecha_nac.day))
                                    df_preview.at[idx, "Edad"] = edad
                                    break
                                except ValueError:
                                    continue
                        except Exception:
                            pass
                
                # Generar IDs
                df_preview["ID"] = [f"AN{i+1:02d}" for i in range(len(df_preview))]
                
                # Filtrar filas vacías (sin apellidos ni nombre)
                df_preview = df_preview[
                    (df_preview["Apellidos"].str.strip() != "") | 
                    (df_preview["Nombre"].str.strip() != "")
                ].reset_index(drop=True)
                df_preview["ID"] = [f"AN{i+1:02d}" for i in range(len(df_preview))]
                
                st.markdown(f"##### Vista previa ({len(df_preview)} alumnos)")
                st.dataframe(df_preview[["ID", "Apellidos", "Nombre", "Edad", "email", "Nacimiento"]], 
                             hide_index=True, use_container_width=True)
                
                # Botones de acción
                modo = st.radio(
                    "Modo de importación",
                    ["🔄 Reemplazar lista actual", "➕ Añadir a la lista existente"],
                    key="import_modo",
                    horizontal=True
                )
                
                if st.button("✅ Confirmar Importación", type="primary", use_container_width=True, key="btn_confirmar_import"):
                    if modo.startswith("🔄"):
                        st.session_state.df_al = procesar_lista_alumnado(df_preview)
                    else:
                        df_merged = pd.concat([st.session_state.df_al, df_preview], ignore_index=True)
                        st.session_state.df_al = procesar_lista_alumnado(df_merged)
                    st.success(f"✅ {len(df_preview)} alumnos importados correctamente.")
                    st.rerun()
                    
            except Exception as e:
                st.error(f"❌ Error al leer el archivo: {e}")
    
    df_al_work = st.session_state.df_al.copy()
    
    # ── Normalizar Edad como numérico ──────────────────────────
    if "Edad" in df_al_work.columns:
        df_al_work["Edad"] = pd.to_numeric(df_al_work["Edad"], errors="coerce")
    
    # ── Columna calculada 🌸 para menores de 18 ────────────────
    df_al_work["🌸"] = False
    if "Edad" in df_al_work.columns:
        df_al_work["🌸"] = df_al_work["Edad"].fillna(99) < 18
    _n_menores = int(df_al_work["🌸"].sum())
    if _n_menores:
        st.caption(f"🌸 {_n_menores} alumno(s) menor(es) de 18 años")
    
    # ── Orden de columnas: ID, 🌸, Estado, Apellidos, Nombre, Edad, Nacimiento, resto ──
    _col_priority = ["ID", "🌸", "Estado", "Apellidos", "Nombre", "Edad", "Nacimiento"]
    _col_rest = [c for c in df_al_work.columns if c not in _col_priority]
    _col_order = [c for c in _col_priority if c in df_al_work.columns] + _col_rest
    df_al_work = df_al_work[_col_order]
    
    # ── Configuración de columnas ──────────────────────────────
    config_al = {
        "ID":     st.column_config.TextColumn("ID-AL", width="small", disabled=True, pinned=True),
        "🌸":     st.column_config.CheckboxColumn("🌸", disabled=True, width="small"),
        "Estado": st.column_config.SelectboxColumn("Estado", options=["Alta", "Baja"], default="Alta"),
        "Apellidos":   st.column_config.TextColumn("Apellidos"),
        "Nombre":      st.column_config.TextColumn("Nombre"),
        "Edad":        st.column_config.NumberColumn("Edad", min_value=0, max_value=99, step=1),
        "Nacimiento":  st.column_config.TextColumn("Fecha nacimiento"),
        "Repite":      st.column_config.CheckboxColumn("Repite"),
        "Matricula":   st.column_config.TextColumn("Matrícula"),
        "Comentarios": st.column_config.TextColumn("Comentarios"),
        "email":       st.column_config.TextColumn("email"),
        "Movil":       st.column_config.TextColumn("Móvil"),
    }
    
    ed_al = st.data_editor(
        df_al_work,
        column_config=config_al,
        num_rows="dynamic",
        hide_index=True,
        use_container_width=True,
        key="tabla_alumnado",
        disabled=ro_curso
    )
    
    # ── Al modificar: quitar 🌸 (calculada) y guardar ──────────
    _ed_sin_flor = ed_al.drop(columns=["🌸"], errors="ignore")
    _work_sin_flor = df_al_work.drop(columns=["🌸"], errors="ignore")
    if not _ed_sin_flor.equals(_work_sin_flor):
        st.session_state.df_al = procesar_lista_alumnado(_ed_sin_flor)
        st.rerun()
    
    
    # --- PESTAÑA: SEGUIMIENTO ---
