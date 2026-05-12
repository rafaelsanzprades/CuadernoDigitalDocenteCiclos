import sys
import os

# MUST be first: add backend/ to path before ANY other imports.
# Fixes "ModuleNotFoundError: No module named 'database'" when Render
# runs this as 'backend.main:app' from the repo root.
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import shutil
import pandas as pd

from database import SessionLocal, engine, Base, get_db
from models import ModuleDocument

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CDD Pro API", version="1.0.0")

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@app.get("/")
def read_root():
    return {"status": "ok", "message": "CDD Pro API is running"}

@app.get("/api/module/{module_id}")
def get_module(module_id: str, db: Session = Depends(get_db)):
    """
    Loads data from the SQLite database corresponding to the module.
    """
    try:
        doc = db.query(ModuleDocument).filter(ModuleDocument.id == module_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Module not found")
        return {"status": "success", "data": doc.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/module/{module_id}")
async def update_module(module_id: str, request: Request, db: Session = Depends(get_db)):
    """
    Saves data to the SQLite database corresponding to the module.
    """
    try:
        body = await request.json()
        doc = db.query(ModuleDocument).filter(ModuleDocument.id == module_id).first()
        if doc:
            doc.data = body
        else:
            new_doc = ModuleDocument(id=module_id, data=body)
            db.add(new_doc)
        
        db.commit()
        return {"status": "success", "message": "Module updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/modules")
def list_modules(db: Session = Depends(get_db)):
    """
    Lists all available PD and Curso modules in the database.
    """
    try:
        docs = db.query(ModuleDocument.id).all()
        ids = [doc.id for doc in docs]
        
        pd_modules = [i for i in ids if i.endswith("-pd") or ("curso" not in i and i != "ciclos-fp")]
        curso_modules = [i for i in ids if "curso" in i]
        centro_modules = [i for i in ids if i == "ciclos-fp" or i.endswith("-centro")]
        
        return {
            "status": "success",
            "data": {
                "centro_modules": sorted(list(set(centro_modules))),
                "pd_modules": sorted(list(set(pd_modules))),
                "curso_modules": sorted(list(set(curso_modules)))
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pdf")
def generate_pdf(type: str, pd_id: str, curso_id: str, al_id: str = None, db: Session = Depends(get_db)):

    try:
        # Import PDF modules
        from pdf_calendario_academico import generar_pdf_calendario
        from pdf_seguimiento_diario import generar_pdf_seguimiento
        from pdf_boletin_grupal import generar_pdf_boletin_grupal, generar_pdf_boletin_grupal_final
        from pdf_boletin_individual import generar_pdf_boletin_individual
        
        # Load Data from DB
        def load_db(m_id):
            doc = db.query(ModuleDocument).filter(ModuleDocument.id == m_id).first()
            return doc.data if doc else {}
                
        module_data = load_db(pd_id)
        curso_data = load_db(curso_id)
        
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
        horario = module_data.get("horario", {})
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
