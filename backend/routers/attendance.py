from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

class AttendanceCreate(BaseModel):
    module_document_id: str
    student_id: str
    date_str: str
    status: str

class AttendanceResponse(AttendanceCreate):
    id: int

    model_config = {"from_attributes": True}

@router.get("/{module_document_id}", response_model=list[AttendanceResponse])
def get_attendance(module_document_id: str, date_str: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.module_document_id == module_document_id)
    if date_str:
        query = query.filter(models.AttendanceRecord.date_str == date_str)
    return query.all()

@router.post("/")
def save_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    existing = db.query(models.AttendanceRecord).filter(
        models.AttendanceRecord.module_document_id == attendance.module_document_id,
        models.AttendanceRecord.student_id == attendance.student_id,
        models.AttendanceRecord.date_str == attendance.date_str
    ).first()

    if existing:
        existing.status = attendance.status
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_record = models.AttendanceRecord(
            module_document_id=attendance.module_document_id,
            student_id=attendance.student_id,
            date_str=attendance.date_str,
            status=attendance.status
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return new_record
