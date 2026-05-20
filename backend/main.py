import sys
import os

# MUST be first: add backend/ to path before ANY other imports.
# Fixes "ModuleNotFoundError: No module named 'database'" when Render
# runs this as 'backend.main:app' from the repo root.
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import FastAPI, HTTPException, Request, Response, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import shutil
import pandas as pd

from database import SessionLocal, engine, Base, get_db
from models import ModuleDocument, Center, User, CenterStaff, HeadOfStudies, DepartmentHead, DualCoordinator, DualGeneralTutor, GroupTutor, ProfessionalFamily, Degree, Module, LearningOutcome

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

class UserCreate(BaseModel):
    name: str
    surname: str
    email: str
    centers: list[int]
    roles: list[str]

@app.get("/api/users")
def list_users(db: Session = Depends(get_db)):
    try:
        users = db.query(User).all()
        result = []
        for u in users:
            c_staff = db.query(CenterStaff).filter(CenterStaff.user_id == u.id).all()
            centers = []
            roles = []
            
            for cs in c_staff:
                center_db = db.query(Center).filter(Center.id == cs.center_id).first()
                if center_db:
                    centers.append(center_db.name)
                    if cs.is_center_admin:
                        roles.append({
                            "type": "COFOTAP", 
                            "context": center_db.name, 
                            "colorClass": "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        })
            
            # Check other roles
            if db.query(HeadOfStudies).filter_by(user_id=u.id).first():
                roles.append({"type": "Jefe/a de Estudios", "context": "Centro", "colorClass": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"})
            if db.query(DepartmentHead).filter_by(user_id=u.id).first():
                roles.append({"type": "Jefe/a de Dpto. Didáctico", "context": "Familia", "colorClass": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"})
            if db.query(DualCoordinator).filter_by(user_id=u.id).first():
                roles.append({"type": "Tutor/a Dual Coordinador", "context": "Centro", "colorClass": "bg-amber-500/20 text-amber-400 border-amber-500/30"})
            if db.query(DualGeneralTutor).filter_by(user_id=u.id).first():
                roles.append({"type": "Tutor/a Dual General", "context": "Prospector", "colorClass": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"})
            
            tutor = db.query(GroupTutor).filter_by(user_id=u.id).first()
            if tutor:
                if tutor.is_dual_tutor:
                    roles.append({"type": "Tutor/a Dual", "context": "Seguimiento", "colorClass": "bg-orange-500/20 text-orange-400 border-orange-500/30"})
                else:
                    roles.append({"type": "Tutor/a de Curso/Grupo", "context": "Grupo", "colorClass": "bg-pink-500/20 text-pink-400 border-pink-500/30"})

            if getattr(u, 'is_superadmin', False):
                roles.append({"type": "Superadmin", "context": "Global", "colorClass": "bg-purple-500/20 text-purple-400 border-purple-500/30"})
            
            if not roles or any(r == "Profesorado" for r in u.roles if hasattr(u, "roles")):
                roles.append({"type": "Profesorado", "context": "General", "colorClass": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"})

            result.append({
                "id": u.id,
                "name": f"{u.name} {u.surname}",
                "email": u.email,
                "centers": centers,
                "status": "active",
                "roles": roles
            })
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        new_user = User(name=user.name, surname=user.surname, email=user.email)
        if "Superadmin" in user.roles:
            new_user.is_superadmin = True
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        for center_id in user.centers:
            is_cofotap = "COFOTAP" in user.roles
            staff = CenterStaff(user_id=new_user.id, center_id=center_id, is_center_admin=is_cofotap)
            db.add(staff)
            
            # Map other roles
            if "Jefe Estudios" in user.roles:
                db.add(HeadOfStudies(user_id=new_user.id, center_id=center_id))
            if "Jefe Departamento" in user.roles:
                db.add(DepartmentHead(user_id=new_user.id, center_id=center_id))
            if "Tutor Dual Coordinador" in user.roles:
                db.add(DualCoordinator(user_id=new_user.id, center_id=center_id))
            if "Tutor Dual General" in user.roles:
                db.add(DualGeneralTutor(user_id=new_user.id, center_id=center_id))
            if "Tutor Grupo" in user.roles:
                db.add(GroupTutor(user_id=new_user.id, is_dual_tutor=False))
            if "Tutor Dual Seguimiento" in user.roles:
                db.add(GroupTutor(user_id=new_user.id, is_dual_tutor=True))

        db.commit()
        return {"status": "success", "message": "User created successfully", "id": new_user.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/families")
def list_families(db: Session = Depends(get_db)):
    try:
        families = db.query(ProfessionalFamily).all()
        result = []
        for f in families:
            degrees = db.query(Degree).filter(Degree.family_id == f.id).all()
            result.append({
                "id": f.id,
                "code": f.code,
                "name": f.name,
                "icon_url": f.icon_url,
                "color_hex": f.color_hex,
                "degrees": [{"id": d.id, "name": d.name, "level": d.level.value if hasattr(d.level, 'value') else d.level} for d in degrees]
            })
        return {"status": "success", "data": result}
    except Exception as e:
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

@app.get("/api/centers")
def list_centers(db: Session = Depends(get_db)):
    """
    Lists all real Aragon centers from the relational DB.
    """
    try:
        centers = db.query(Center).order_by(Center.name).all()
        return {
            "status": "success",
            "data": [{"id": c.id, "name": c.name, "titularity": c.titularity.value if hasattr(c.titularity, 'value') else c.titularity, "code": c.code} for c in centers]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/learning_outcomes")
def list_learning_outcomes(db: Session = Depends(get_db)):
    try:
        modules = db.query(Module).all()
        result = {}
        for m in modules:
            ras = db.query(LearningOutcome).filter(LearningOutcome.module_id == m.id).order_by(LearningOutcome.ra_number).all()
            if ras:
                result[m.code] = [{"raNumber": r.ra_number, "description": r.description} for r in ras]
        return {"status": "success", "data": result}
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
