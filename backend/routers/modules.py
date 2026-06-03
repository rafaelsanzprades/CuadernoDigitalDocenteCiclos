from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from services.module_service import get_module_data, update_module_data

router = APIRouter(prefix="/api/module", tags=["Modules"])

from schemas import ModuleUpdateBody


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
