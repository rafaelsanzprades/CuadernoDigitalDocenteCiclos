from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import (
    Module, ProfessionalFamily, Degree, Center, LearningOutcome,
    User, TeachingAssignment, ModuleDocument
)
from auth.dependencies import get_optional_user

router = APIRouter(prefix="/api", tags=["Catalogs"])


@router.get("/admin/modules")
def list_admin_modules(db: Session = Depends(get_db)):
    try:
        modules = db.query(Module).all()
        return {
            "status": "success",
            "data": [{"id": m.id, "code": m.code, "name": m.name} for m in modules]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class FamilyResponse(BaseModel):
    id: int
    code: str
    name: str
    icon_url: str | None = None
    color_hex: str | None = None
    degrees: list[dict]

    model_config = {"from_attributes": True}


@router.get("/families")
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


@router.get("/modules")
def list_modules(user_id: int = Query(None), current_user: User | None = Depends(get_optional_user), db: Session = Depends(get_db)):
    try:
        allowed_codes = None
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user and not getattr(user, 'is_superadmin', False):
                assignments = db.query(TeachingAssignment).filter(TeachingAssignment.user_id == user_id).all()
                allowed_module_ids = [a.module_id for a in assignments]
                modules = db.query(Module).filter(Module.id.in_(allowed_module_ids)).all()
                allowed_codes = [m.code for m in modules if m.code]

        docs = db.query(ModuleDocument.id).all()
        ids = [doc.id for doc in docs]

        if allowed_codes is not None:
            ids = [i for i in ids if any(i.startswith(code) for code in allowed_codes) or i == "ciclos-fp" or i.endswith("-centro")]

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


@router.get("/centers")
def list_centers(db: Session = Depends(get_db)):
    try:
        centers = db.query(Center).order_by(Center.name).all()
        return {
            "status": "success",
            "data": [{"id": c.id, "name": c.name, "titularity": c.titularity.value if hasattr(c.titularity, 'value') else c.titularity, "code": c.code} for c in centers]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/learning_outcomes")
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
