import streamlit as st
import pandas as pd
from datetime import timedelta, datetime

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
    
    columnas_fijas = ["id_ud", "horas_ud"]
    todas_cols = columnas_fijas + col_meses_full + ["Total_Imp"]
    
    # Asegurar columnas correctas
    if st.session_state.df_sgmt.empty or not all(c in st.session_state.df_sgmt.columns for c in todas_cols):
        st.session_state.df_sgmt = pd.DataFrame(columns=todas_cols)
    
    # Sincronizar filas (IDs de UD)
    ud_ids = st.session_state.df_ud["id_ud"].tolist()
    st.session_state.df_sgmt = st.session_state.df_sgmt[st.session_state.df_sgmt["id_ud"].isin(ud_ids)]
    
    for _, ud_row in st.session_state.df_ud.iterrows():
        uid = ud_row["id_ud"]
        uhoras = ud_row["horas_ud"]
        if uid not in st.session_state.df_sgmt["id_ud"].values:
            new_row = {c: 0 for c in todas_cols}
            new_row["id_ud"] = uid
            new_row["horas_ud"] = uhoras
            st.session_state.df_sgmt = pd.concat([st.session_state.df_sgmt, pd.DataFrame([new_row])], ignore_index=True)
        else:
            idx = st.session_state.df_sgmt[st.session_state.df_sgmt["id_ud"] == uid].index[0]
            st.session_state.df_sgmt.at[idx, "horas_ud"] = uhoras

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
        ud_id = ud["id_ud"]
        ud_horas_rest = ud["horas_ud"]
        
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
                matches = st.session_state.df_sgmt[st.session_state.df_sgmt["id_ud"] == ud_id].index
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
            ud_id = ud["id_ud"]
            ud_h = ud["horas_ud"]
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

def calcular_notas_alumno(al_id, df_eval, df_act, df_ce, df_ra, df_feoe=None, overrides=None):
    """
    Calcula las notas de RA y la nota final para un alumno específico siguiendo la jerarquía oficial.
    Permite pasar un diccionario 'overrides' con valores temporales (útil en la vista docente).
    """
    if df_eval.empty or df_act.empty or df_ce.empty:
        return {"notas_ra": {}, "nota_final": 0.0, "notas_ce": {}}

    mask = df_eval["ID"] == al_id
    if not mask.any():
        return {"notas_ra": {}, "nota_final": 0.0, "notas_ce": {}}
    
    idx_eval = df_eval[mask].index[0]
    overrides = overrides or {}
    
    # 1. Preparar pesos
    peso_ra = {}
    for _, ra_row in df_ra.iterrows():
        if pd.notna(ra_row["id_ra"]):
            peso_ra[ra_row["id_ra"]] = pd.to_numeric(ra_row["peso_ra"], errors="coerce") if pd.notna(ra_row["peso_ra"]) else 0.0

    peso_ce = {}
    ra_of_ce = {}
    df_ce_clean = df_ce.dropna(subset=["id_ce"])
    for _, ce_row in df_ce_clean.iterrows():
        ce_id = ce_row["id_ce"]
        ra_id = ce_row.get("id_ra", "")
        if pd.notna(ce_id) and pd.notna(ra_id):
            peso_ce[ce_id] = pd.to_numeric(ce_row["peso_ce"], errors="coerce") if pd.notna(ce_row["peso_ce"]) else 0.0
            ra_of_ce[ce_id] = ra_id

    # 2. Calcular notas de CE (media aritmética de actividades)
    notas_ce = {}
    for ce_id in peso_ce.keys():
        act_vals = []
        for _, act in df_act.iterrows():
            if ce_id in act.index and act[ce_id] == True:
                act_id = act["id_act"]
                # Usar valor del override si existe, si no del dataframe
                if act_id in overrides:
                    val = float(overrides[act_id])
                    act_vals.append(val)
                elif act_id in df_eval.columns:
                    val = pd.to_numeric(df_eval.at[idx_eval, act_id], errors="coerce")
                    if pd.notna(val):
                        act_vals.append(val)
        
        if act_vals:
            notas_ce[ce_id] = sum(act_vals) / len(act_vals)
        else:
            notas_ce[ce_id] = 0.0

    # 3. Calcular notas de RA (suma ponderada de CE)
    notas_ra = {}
    for ce_id, n_ce in notas_ce.items():
        r_id = ra_of_ce.get(ce_id)
        if r_id:
            if r_id not in notas_ra: notas_ra[r_id] = 0.0
            notas_ra[r_id] += n_ce * (peso_ce[ce_id] / 100.0)

    # 4. Integrar Dualización (FEOE) si existe
    if df_feoe is not None and not df_ra.empty and "Dualizado" in df_ra.columns:
        for r_id in notas_ra.keys():
            ra_row = df_ra[df_ra["id_ra"] == r_id]
            if not ra_row.empty and ra_row.iloc[0].get("Dualizado", False):
                emp_grade = 0.0
                if r_id in df_feoe.columns:
                    fe_row = df_feoe[df_feoe["ID"] == al_id]
                    if not fe_row.empty:
                        val_feoe = pd.to_numeric(fe_row.iloc[0][r_id], errors="coerce")
                        if pd.notna(val_feoe) and val_feoe >= 1:
                            conv = {1: 3.0, 2: 5.0, 3: 7.5, 4: 10.0}
                            nota_empresa = conv.get(int(val_feoe), 0.0)
                            notas_ra[r_id] = (notas_ra[r_id] + nota_empresa) / 2.0

    # 5. Calcular Nota Final (suma ponderada de RA)
    nota_final = 0.0
    for r_id, n_ra in notas_ra.items():
        nota_final += n_ra * (peso_ra.get(r_id, 0.0) / 100.0)

    return {
        "notas_ra": notas_ra,
        "nota_final": round(nota_final, 2),
        "notas_ce": notas_ce
    }

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
