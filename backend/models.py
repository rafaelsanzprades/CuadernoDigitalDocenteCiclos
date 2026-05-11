from sqlalchemy import Column, String, JSON, DateTime
from sqlalchemy.sql import func
from database import Base

class ModuleDocument(Base):
    __tablename__ = "module_documents"

    id = Column(String, primary_key=True, index=True)
    # the entire dictionary will be stored here
    data = Column(JSON, nullable=False)
    
    # Optional metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
