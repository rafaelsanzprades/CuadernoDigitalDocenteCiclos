from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from services.module_service import get_module_data, update_module_data

router = APIRouter(prefix="/api/module", tags=["Modules"])

class ModuleUpdateBody(BaseModel):
    df_ra: list | None = None
    df_ce: list | None = None
    df_ud: list | None = None
    df_sesiones: list | None = None
    df_al: list | None = None
    df_act: list | None = None
    df_eval: list | None = None
    df_feoe: list | None = None
    df_tareas: list | None = None
    df_sgmt: list | None = None
    df_pr: list | None = None
    info_modulo: dict | None = None
    info_fechas: dict | None = None
    horario: dict | None = None
    planning_ledger: dict | None = None
    calendar_notes: dict | None = None
    tutoria_ledger: dict | None = None
    plano_clase: dict | None = None
    daily_ledger: dict | None = None
    attendance_records: list | None = None

    model_config = {"extra": "allow"}


@router.get("/{module_id}")
def get_module(module_id: str, db: Session = Depends(get_db)):
    try:
        data = get_module_data(module_id, db)
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{module_id}")
def update_module(module_id: str, body: ModuleUpdateBody, db: Session = Depends(get_db)):
    try:
        update_module_data(module_id, body.model_dump(exclude_none=True), db)
        return {"status": "success", "message": "Module updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
