from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import pandas as pd
from database import get_db
from models import ModuleDocument

router = APIRouter(prefix="/api/pdf", tags=["PDF Generation"])

@router.get("")
def generate_pdf(type: str, pd_id: str, curso_id: str, al_id: str = None, db: Session = Depends(get_db)):
    try:
        # Import PDF modules
        from pdf_calendario_academico import generar_pdf_calendario
        from pdf_seguimiento_diario import generar_pdf_seguimiento
        from pdf_planificacion import generar_pdf_planificacion
        from pdf_matrices import generar_pdf_matrices
        from pdf_boletin_grupal import generar_pdf_boletin_grupal, generar_pdf_boletin_grupal_final
        from pdf_boletin_individual import generar_pdf_boletin_individual
        from pdf_clases_ud import generar_pdf_clases_ud
        
        # Load Data from DB
        from services.module_service import get_module_data
        
        module_data = get_module_data(pd_id, db) if pd_id else {}
        curso_data = get_module_data(curso_id, db) if curso_id else {}
        
        # Helper to get df
        def get_df(data_dict, key):
            d = data_dict.get(key, [])
            return pd.DataFrame(d) if isinstance(d, list) else pd.DataFrame()
            
        info_modulo = module_data.get("info_modulo", {})
        from datetime import datetime
        info_fechas_raw = module_data.get("info_fechas", {})
        info_fechas = {}
        for k, v in info_fechas_raw.items():
            if isinstance(v, str) and v.strip():
                try:
                    # Strip time parts if needed, fromisoformat handles standard ISO strings
                    info_fechas[k] = datetime.fromisoformat(v.replace("Z", "+00:00")[:10]).date()
                except Exception:
                    info_fechas[k] = v
            else:
                info_fechas[k] = v
        horario_raw = module_data.get("horario", {})
        horario = {k: int(v) if str(v).isdigit() else 0 for k, v in horario_raw.items()}
        planning_ledger = module_data.get("planning_ledger", {})
        calendar_notes = module_data.get("calendar_notes", {})
        df_sesiones = get_df(module_data, "df_sesiones")
        
        df_al = get_df(curso_data, "df_al")
        df_eval = get_df(curso_data, "df_eval")
        df_act = get_df(module_data, "df_act")
        df_ce = get_df(module_data, "df_ce")
        df_ra = get_df(module_data, "df_ra")
        df_feoe = get_df(curso_data, "df_feoe")
        df_ud = get_df(module_data, "df_ud")
        df_pr = get_df(module_data, "df_pr")
        
        buffer = None
        
        if type == "calendario":
            buffer = generar_pdf_calendario(info_modulo, info_fechas, planning_ledger, calendar_notes)
        elif type == "seguimiento":
            buffer = generar_pdf_seguimiento(info_modulo, info_fechas, horario, planning_ledger, calendar_notes, df_sesiones)
        elif type == "clases_ud":
            buffer = generar_pdf_clases_ud(info_modulo, df_ud, df_sesiones)
        elif type == "planificacion":
            df_sgmt = get_df(curso_data, "df_sgmt")
            daily_ledger = curso_data.get("daily_ledger", {})
            buffer = generar_pdf_planificacion(info_modulo, df_ud, df_sgmt, daily_ledger, horario, info_fechas, calendar_notes)
        elif type == "matrices":
            buffer = generar_pdf_matrices(info_modulo, df_ra, df_ud)
        elif type == "grupal_1t":
            buffer = generar_pdf_boletin_grupal("1T", info_modulo, df_al, df_eval, df_act)
        elif type == "grupal_2t":
            buffer = generar_pdf_boletin_grupal("2T", info_modulo, df_al, df_eval, df_act)
        elif type == "grupal_3t":
            buffer = generar_pdf_boletin_grupal("3T", info_modulo, df_al, df_eval, df_act)
        elif type == "grupal_final":
            buffer = generar_pdf_boletin_grupal_final(info_modulo, df_al, df_eval, df_act)
        elif type == "individual":
            if not al_id: raise HTTPException(status_code=400, detail="al_id is required for individual PDF")
            buffer = generar_pdf_boletin_individual(
                info_modulo=info_modulo, al_id=al_id, df_al=df_al, df_eval=df_eval,
                df_act=df_act, df_ce=df_ce, df_ra=df_ra, df_feoe=df_feoe,
                info_fechas=info_fechas, planning_ledger=planning_ledger,
                df_ud=df_ud, df_pr=df_pr
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unknown PDF type: {type}")
            
        if not buffer:
            raise HTTPException(status_code=500, detail="Failed to generate PDF buffer")
            
        return Response(content=buffer.getvalue(), media_type="application/pdf")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
