import os
import sys

_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from database import SessionLocal, engine, Base
from models import ModuleDocument, LearningOutcomeItem, EvaluationCriterionItem, ActivityItem, InstrumentItem, TaskItem, AceItem, DuaItem, ContingencyItem, FeoeItem, SgmtItem
import pandas as pd

def safe_str(val):
    if pd.isna(val) or val is None:
        return ""
    return str(val)

def main():
    print("Creating new tables for Phase 2 if they don't exist...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    docs = db.query(ModuleDocument).all()
    print(f"Found {len(docs)} documents to process.")

    db.query(LearningOutcomeItem).delete()
    db.query(EvaluationCriterionItem).delete()
    db.query(ActivityItem).delete()
    db.query(InstrumentItem).delete()
    db.query(TaskItem).delete()
    db.query(AceItem).delete()
    db.query(DuaItem).delete()
    db.query(ContingencyItem).delete()
    db.query(FeoeItem).delete()
    db.query(SgmtItem).delete()
    db.commit()

    stats = {
        "df_ra": 0, "df_ce": 0, "df_act": 0, "df_pr": 0, "df_tareas": 0,
        "df_ace": 0, "df_dua": 0, "df_contingencia": 0, "df_feoe": 0, "df_sgmt": 0
    }

    for doc in docs:
        print(f"Processing doc {doc.id}...")
        data = doc.data
        if not isinstance(data, dict):
            continue

        # df_ra
        for row in data.get("df_ra", []) if isinstance(data.get("df_ra"), list) else []:
            d = {k: v for k, v in row.items() if k not in ["id_ra", "desc_ra", "peso_ra", "is_dual"]}
            db.add(LearningOutcomeItem(module_document_id=doc.id, id_ra=safe_str(row.get("id_ra")), desc_ra=safe_str(row.get("desc_ra")), peso_ra=safe_str(row.get("peso_ra")), is_dual=safe_str(row.get("is_dual")), data=d))
            stats["df_ra"] += 1

        # df_ce
        for row in data.get("df_ce", []) if isinstance(data.get("df_ce"), list) else []:
            d = {k: v for k, v in row.items() if k not in ["id_ce", "id_ra", "id_ud", "desc_ce", "peso_ce"]}
            db.add(EvaluationCriterionItem(module_document_id=doc.id, id_ce=safe_str(row.get("id_ce")), id_ra=safe_str(row.get("id_ra")), id_ud=safe_str(row.get("id_ud")), desc_ce=safe_str(row.get("desc_ce")), peso_ce=safe_str(row.get("peso_ce")), data=d))
            stats["df_ce"] += 1

        # df_act
        for row in data.get("df_act", []) if isinstance(data.get("df_act"), list) else []:
            d = {k: v for k, v in row.items() if k not in ["id_act", "desc_act", "Tipo", "tri_act", "peso_act", "is_active"]}
            db.add(ActivityItem(module_document_id=doc.id, id_act=safe_str(row.get("id_act")), desc_act=safe_str(row.get("desc_act")), tipo=safe_str(row.get("Tipo")), tri_act=safe_str(row.get("tri_act")), peso_act=safe_str(row.get("peso_act")), is_active=safe_str(row.get("is_active")), data=d))
            stats["df_act"] += 1

        # df_pr
        for row in data.get("df_pr", []) if isinstance(data.get("df_pr"), list) else []:
            d = {k: v for k, v in row.items() if k not in ["ID", "Práctica"]}
            db.add(InstrumentItem(module_document_id=doc.id, item_id=safe_str(row.get("ID")), practica=safe_str(row.get("Práctica")), data=d))
            stats["df_pr"] += 1

        # df_tareas
        for row in data.get("df_tareas", []) if isinstance(data.get("df_tareas"), list) else []:
            d = {k: v for k, v in row.items() if k not in ["ID", "Nombre_Tarea", "Reto", "RA_Asociados", "Instrumento"]}
            db.add(TaskItem(module_document_id=doc.id, item_id=safe_str(row.get("ID")), nombre_tarea=safe_str(row.get("Nombre_Tarea")), reto=safe_str(row.get("Reto")), ra_asociados=safe_str(row.get("RA_Asociados")), instrumento=safe_str(row.get("Instrumento")), data=d))
            stats["df_tareas"] += 1

        # df_ace
        for row in data.get("df_ace", []) if isinstance(data.get("df_ace"), list) else []:
            d = {k: v for k, v in row.items() if k not in ["ID", "Tipo"]}
            db.add(AceItem(module_document_id=doc.id, item_id=safe_str(row.get("ID")), tipo=safe_str(row.get("Tipo")), data=d))
            stats["df_ace"] += 1

        # df_dua
        for row in data.get("df_dua", []) if isinstance(data.get("df_dua"), list) else []:
            d = {k: v for k, v in row.items() if k not in ["ID", "Barrera"]}
            db.add(DuaItem(module_document_id=doc.id, item_id=safe_str(row.get("ID")), barrera=safe_str(row.get("Barrera")), data=d))
            stats["df_dua"] += 1

        # df_contingencia
        for row in data.get("df_contingencia", []) if isinstance(data.get("df_contingencia"), list) else []:
            d = {k: v for k, v in row.items() if k not in ["ID", "Escenario"]}
            db.add(ContingencyItem(module_document_id=doc.id, item_id=safe_str(row.get("ID")), escenario=safe_str(row.get("Escenario")), data=d))
            stats["df_contingencia"] += 1

        # df_feoe
        for row in data.get("df_feoe", []) if isinstance(data.get("df_feoe"), list) else []:
            d = {k: v for k, v in row.items() if k not in ["ID"]}
            db.add(FeoeItem(module_document_id=doc.id, item_id=safe_str(row.get("ID")), data=d))
            stats["df_feoe"] += 1

        # df_sgmt
        for row in data.get("df_sgmt", []) if isinstance(data.get("df_sgmt"), list) else []:
            d = {k: v for k, v in row.items() if k not in ["id_ud"]}
            db.add(SgmtItem(module_document_id=doc.id, id_ud=safe_str(row.get("id_ud")), data=d))
            stats["df_sgmt"] += 1

    try:
        db.commit()
        print("\nMigration Phase 2 completed successfully!")
        for k, v in stats.items():
            print(f"{k}: {v} migrated")
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    main()
