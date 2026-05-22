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
from models import ModuleDocument, Center, User, CenterStaff, HeadOfStudies, DepartmentHead, DualCoordinator, DualGeneralTutor, GroupTutor, ProfessionalFamily, Degree, Module, LearningOutcome, DidacticUnit, SessionModel, CourseStudent, StudentEvaluation, LearningOutcomeItem, EvaluationCriterionItem, ActivityItem, InstrumentItem, TaskItem, AceItem, DuaItem, ContingencyItem, FeoeItem, SgmtItem

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
            
        base_data = dict(doc.data)
        
        # Merge DidacticUnits
        uds = db.query(DidacticUnit).filter_by(module_document_id=module_id).all()
        if uds:
            ud_list = []
            for ud in uds:
                d = {"id_ud": ud.id_ud, "desc_ud": ud.desc_ud, "horas_ud": ud.horas_ud}
                if ud.ra_mappings:
                    d.update(ud.ra_mappings)
                ud_list.append(d)
            base_data["df_ud"] = ud_list
            
        # Merge Sessions
        sessions = db.query(SessionModel).filter_by(module_document_id=module_id).all()
        if sessions:
            ses_list = []
            for ses in sessions:
                ses_list.append({
                    "ID": ses.session_id,
                    "id_ud": ses.id_ud,
                    "Num_Orden": ses.num_orden,
                    "Horas": ses.horas,
                    "Tipo_Actividad": ses.tipo_actividad,
                    "RA_CE": ses.ra_ce,
                    "Contenidos": ses.contenidos,
                    "Aspectos_Clave": ses.aspectos_clave,
                    "Recursos": ses.recursos
                })
            base_data["df_sesiones"] = ses_list
            
        # Merge Students
        students = db.query(CourseStudent).filter_by(module_document_id=module_id).all()
        if students:
            al_list = []
            for al in students:
                al_list.append({
                    "ID": al.student_id,
                    "Estado": al.estado,
                    "Apellidos": al.apellidos,
                    "Nombre": al.nombre,
                    "Edad": al.edad,
                    "Nacimiento": al.nacimiento,
                    "Repite": al.repite,
                    "Matricula": al.matricula,
                    "Comentarios": al.comentarios,
                    "email": al.email,
                    "Movil": al.movil
                })
            base_data["df_al"] = al_list
            
        # Merge Evaluations
        evals = db.query(StudentEvaluation).filter_by(module_document_id=module_id).all()
        if evals:
            ev_list = []
            for ev in evals:
                d = {"ID": ev.student_id}
                if ev.eval_data:
                    d.update(ev.eval_data)
                ev_list.append(d)
            base_data["df_eval"] = ev_list
            
        # Merge Phase 2 Models
        models_map = [
            (LearningOutcomeItem, "df_ra", ["id_ra", "desc_ra", "peso_ra", "is_dual"]),
            (EvaluationCriterionItem, "df_ce", ["id_ce", "id_ra", "id_ud", "desc_ce", "peso_ce"]),
            (ActivityItem, "df_act", ["id_act", "desc_act", "tipo", "tri_act", "peso_act", "is_active"]),
            (InstrumentItem, "df_pr", ["item_id", "practica"]),
            (TaskItem, "df_tareas", ["item_id", "nombre_tarea", "reto", "ra_asociados", "instrumento"]),
            (AceItem, "df_ace", ["item_id", "tipo"]),
            (DuaItem, "df_dua", ["item_id", "barrera"]),
            (ContingencyItem, "df_contingencia", ["item_id", "escenario"]),
            (FeoeItem, "df_feoe", ["item_id"]),
            (SgmtItem, "df_sgmt", ["id_ud"])
        ]
        
        for ModelClass, df_key, field_names in models_map:
            items = db.query(ModelClass).filter_by(module_document_id=module_id).all()
            if items:
                item_list = []
                for item in items:
                    d = {}
                    # map fields back to JSON keys
                    if df_key == "df_pr": d["ID"] = item.item_id; d["Práctica"] = item.practica
                    elif df_key == "df_tareas": d["ID"] = item.item_id; d["Nombre_Tarea"] = item.nombre_tarea; d["Reto"] = item.reto; d["RA_Asociados"] = item.ra_asociados; d["Instrumento"] = item.instrumento
                    elif df_key == "df_ace": d["ID"] = item.item_id; d["Tipo"] = item.tipo
                    elif df_key == "df_dua": d["ID"] = item.item_id; d["Barrera"] = item.barrera
                    elif df_key == "df_contingencia": d["ID"] = item.item_id; d["Escenario"] = item.escenario
                    elif df_key == "df_feoe": d["ID"] = item.item_id
                    elif df_key == "df_act": d["id_act"] = item.id_act; d["desc_act"] = item.desc_act; d["Tipo"] = item.tipo; d["tri_act"] = item.tri_act; d["peso_act"] = item.peso_act; d["is_active"] = item.is_active
                    else:
                        for f in field_names:
                            d[f] = getattr(item, f)
                            
                    if item.data:
                        d.update(item.data)
                    item_list.append(d)
                base_data[df_key] = item_list
            
        return {"status": "success", "data": base_data}
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
        
        # 1. Extract and delete normalized lists from JSON body to save space
        df_ud = body.pop("df_ud", [])
        df_sesiones = body.pop("df_sesiones", [])
        df_al = body.pop("df_al", [])
        df_eval = body.pop("df_eval", [])
        
        # Phase 2 lists
        df_ra = body.pop("df_ra", [])
        df_ce = body.pop("df_ce", [])
        df_act = body.pop("df_act", [])
        df_pr = body.pop("df_pr", [])
        df_tareas = body.pop("df_tareas", [])
        df_ace = body.pop("df_ace", [])
        df_dua = body.pop("df_dua", [])
        df_contingencia = body.pop("df_contingencia", [])
        df_feoe = body.pop("df_feoe", [])
        df_sgmt = body.pop("df_sgmt", [])
        
        # 2. Update JSON Blob
        doc = db.query(ModuleDocument).filter(ModuleDocument.id == module_id).first()
        if doc:
            doc.data = body
        else:
            new_doc = ModuleDocument(id=module_id, data=body)
            db.add(new_doc)
            
        # 3. Upsert DidacticUnits
        db.query(DidacticUnit).filter_by(module_document_id=module_id).delete()
        if isinstance(df_ud, list):
            for ud in df_ud:
                ra_mappings = {k: v for k, v in ud.items() if k not in ['id_ud', 'desc_ud', 'horas_ud']}
                new_ud = DidacticUnit(
                    module_document_id=module_id,
                    id_ud=str(ud.get("id_ud", "")),
                    desc_ud=str(ud.get("desc_ud", "")),
                    horas_ud=int(ud.get("horas_ud", 0) or 0),
                    ra_mappings=ra_mappings
                )
                db.add(new_ud)
                
        # 4. Upsert Sessions
        db.query(SessionModel).filter_by(module_document_id=module_id).delete()
        if isinstance(df_sesiones, list):
            for ses in df_sesiones:
                new_ses = SessionModel(
                    module_document_id=module_id,
                    session_id=str(ses.get("ID", "")),
                    id_ud=str(ses.get("id_ud", "")),
                    num_orden=int(ses.get("Num_Orden", 0) or 0),
                    horas=int(ses.get("Horas", 0) or 0),
                    tipo_actividad=str(ses.get("Tipo_Actividad", "")),
                    ra_ce=str(ses.get("RA_CE", "")),
                    contenidos=str(ses.get("Contenidos", "")),
                    aspectos_clave=str(ses.get("Aspectos_Clave", "")),
                    recursos=str(ses.get("Recursos", ""))
                )
                db.add(new_ses)
                
        # 5. Upsert Students
        db.query(CourseStudent).filter_by(module_document_id=module_id).delete()
        if isinstance(df_al, list):
            for al in df_al:
                new_al = CourseStudent(
                    module_document_id=module_id,
                    student_id=str(al.get("ID", "")),
                    estado=str(al.get("Estado", "")),
                    apellidos=str(al.get("Apellidos", "")),
                    nombre=str(al.get("Nombre", "")),
                    edad=str(al.get("Edad", "")),
                    nacimiento=str(al.get("Nacimiento", "")),
                    repite=str(al.get("Repite", "")),
                    matricula=str(al.get("Matricula", "")),
                    comentarios=str(al.get("Comentarios", "")),
                    email=str(al.get("email", "")),
                    movil=str(al.get("Movil", ""))
                )
                db.add(new_al)
                
        # 6. Upsert Evaluations
        db.query(StudentEvaluation).filter_by(module_document_id=module_id).delete()
        if isinstance(df_eval, list):
            for ev in df_eval:
                student_id = str(ev.get("ID", ""))
                eval_data = {k: v for k, v in ev.items() if k != "ID"}
                new_ev = StudentEvaluation(
                    module_document_id=module_id,
                    student_id=student_id,
                    eval_data=eval_data
                )
                db.add(new_ev)
                
        # 7. Upsert Phase 2 Lists
        def safe_str(val):
            return str(val) if val is not None else ""
            
        db.query(LearningOutcomeItem).filter_by(module_document_id=module_id).delete()
        if isinstance(df_ra, list):
            for row in df_ra:
                d = {k: v for k, v in row.items() if k not in ["id_ra", "desc_ra", "peso_ra", "is_dual"]}
                db.add(LearningOutcomeItem(module_document_id=module_id, id_ra=safe_str(row.get("id_ra")), desc_ra=safe_str(row.get("desc_ra")), peso_ra=safe_str(row.get("peso_ra")), is_dual=safe_str(row.get("is_dual")), data=d))

        db.query(EvaluationCriterionItem).filter_by(module_document_id=module_id).delete()
        if isinstance(df_ce, list):
            for row in df_ce:
                d = {k: v for k, v in row.items() if k not in ["id_ce", "id_ra", "id_ud", "desc_ce", "peso_ce"]}
                db.add(EvaluationCriterionItem(module_document_id=module_id, id_ce=safe_str(row.get("id_ce")), id_ra=safe_str(row.get("id_ra")), id_ud=safe_str(row.get("id_ud")), desc_ce=safe_str(row.get("desc_ce")), peso_ce=safe_str(row.get("peso_ce")), data=d))

        db.query(ActivityItem).filter_by(module_document_id=module_id).delete()
        if isinstance(df_act, list):
            for row in df_act:
                d = {k: v for k, v in row.items() if k not in ["id_act", "desc_act", "Tipo", "tri_act", "peso_act", "is_active"]}
                db.add(ActivityItem(module_document_id=module_id, id_act=safe_str(row.get("id_act")), desc_act=safe_str(row.get("desc_act")), tipo=safe_str(row.get("Tipo")), tri_act=safe_str(row.get("tri_act")), peso_act=safe_str(row.get("peso_act")), is_active=safe_str(row.get("is_active")), data=d))

        db.query(InstrumentItem).filter_by(module_document_id=module_id).delete()
        if isinstance(df_pr, list):
            for row in df_pr:
                d = {k: v for k, v in row.items() if k not in ["ID", "Práctica"]}
                db.add(InstrumentItem(module_document_id=module_id, item_id=safe_str(row.get("ID")), practica=safe_str(row.get("Práctica")), data=d))

        db.query(TaskItem).filter_by(module_document_id=module_id).delete()
        if isinstance(df_tareas, list):
            for row in df_tareas:
                d = {k: v for k, v in row.items() if k not in ["ID", "Nombre_Tarea", "Reto", "RA_Asociados", "Instrumento"]}
                db.add(TaskItem(module_document_id=module_id, item_id=safe_str(row.get("ID")), nombre_tarea=safe_str(row.get("Nombre_Tarea")), reto=safe_str(row.get("Reto")), ra_asociados=safe_str(row.get("RA_Asociados")), instrumento=safe_str(row.get("Instrumento")), data=d))

        db.query(AceItem).filter_by(module_document_id=module_id).delete()
        if isinstance(df_ace, list):
            for row in df_ace:
                d = {k: v for k, v in row.items() if k not in ["ID", "Tipo"]}
                db.add(AceItem(module_document_id=module_id, item_id=safe_str(row.get("ID")), tipo=safe_str(row.get("Tipo")), data=d))

        db.query(DuaItem).filter_by(module_document_id=module_id).delete()
        if isinstance(df_dua, list):
            for row in df_dua:
                d = {k: v for k, v in row.items() if k not in ["ID", "Barrera"]}
                db.add(DuaItem(module_document_id=module_id, item_id=safe_str(row.get("ID")), barrera=safe_str(row.get("Barrera")), data=d))

        db.query(ContingencyItem).filter_by(module_document_id=module_id).delete()
        if isinstance(df_contingencia, list):
            for row in df_contingencia:
                d = {k: v for k, v in row.items() if k not in ["ID", "Escenario"]}
                db.add(ContingencyItem(module_document_id=module_id, item_id=safe_str(row.get("ID")), escenario=safe_str(row.get("Escenario")), data=d))

        db.query(FeoeItem).filter_by(module_document_id=module_id).delete()
        if isinstance(df_feoe, list):
            for row in df_feoe:
                d = {k: v for k, v in row.items() if k not in ["ID"]}
                db.add(FeoeItem(module_document_id=module_id, item_id=safe_str(row.get("ID")), data=d))

        db.query(SgmtItem).filter_by(module_document_id=module_id).delete()
        if isinstance(df_sgmt, list):
            for row in df_sgmt:
                d = {k: v for k, v in row.items() if k not in ["id_ud"]}
                db.add(SgmtItem(module_document_id=module_id, id_ud=safe_str(row.get("id_ud")), data=d))
        
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
        from pdf_planificacion import generar_pdf_planificacion
        from pdf_matrices import generar_pdf_matrices
        from pdf_boletin_grupal import generar_pdf_boletin_grupal, generar_pdf_boletin_grupal_final
        from pdf_boletin_individual import generar_pdf_boletin_individual
        from pdf_clases_ud import generar_pdf_clases_ud
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
