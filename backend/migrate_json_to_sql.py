import os
import sys

_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from database import SessionLocal, engine, Base
from models import ModuleDocument, DidacticUnit, SessionModel, CourseStudent, StudentEvaluation
import pandas as pd

def safe_int(val, default=0):
    try:
        if pd.isna(val) or val == "": return default
        return int(float(val))
    except:
        return default

def safe_str(val):
    if pd.isna(val) or val is None:
        return ""
    return str(val)

def main():
    print("Creating new tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    docs = db.query(ModuleDocument).all()
    print(f"Found {len(docs)} documents to process.")

    # Clear existing normalized data to allow re-running migration
    db.query(DidacticUnit).delete()
    db.query(SessionModel).delete()
    db.query(CourseStudent).delete()
    db.query(StudentEvaluation).delete()
    db.commit()

    total_uds = 0
    total_sessions = 0
    total_students = 0
    total_evals = 0

    for doc in docs:
        print(f"Processing doc {doc.id}...")
        data = doc.data
        if not isinstance(data, dict):
            continue

        # Migrate UDs
        df_ud = data.get("df_ud", [])
        if isinstance(df_ud, list):
            for ud in df_ud:
                ra_mappings = {k: v for k, v in ud.items() if k not in ['id_ud', 'desc_ud', 'horas_ud']}
                new_ud = DidacticUnit(
                    module_document_id=doc.id,
                    id_ud=safe_str(ud.get("id_ud")),
                    desc_ud=safe_str(ud.get("desc_ud")),
                    horas_ud=safe_int(ud.get("horas_ud", 0)),
                    ra_mappings=ra_mappings
                )
                db.add(new_ud)
                total_uds += 1

        # Migrate Sessions
        df_sesiones = data.get("df_sesiones", [])
        if isinstance(df_sesiones, list):
            for ses in df_sesiones:
                new_ses = SessionModel(
                    module_document_id=doc.id,
                    session_id=safe_str(ses.get("ID")),
                    id_ud=safe_str(ses.get("id_ud")),
                    num_orden=safe_int(ses.get("Num_Orden", 0)),
                    horas=safe_int(ses.get("Horas", 0)),
                    tipo_actividad=safe_str(ses.get("Tipo_Actividad")),
                    ra_ce=safe_str(ses.get("RA_CE")),
                    contenidos=safe_str(ses.get("Contenidos")),
                    aspectos_clave=safe_str(ses.get("Aspectos_Clave")),
                    recursos=safe_str(ses.get("Recursos"))
                )
                db.add(new_ses)
                total_sessions += 1

        # Migrate Students
        df_al = data.get("df_al", [])
        if isinstance(df_al, list):
            for al in df_al:
                new_al = CourseStudent(
                    module_document_id=doc.id,
                    student_id=safe_str(al.get("ID")),
                    estado=safe_str(al.get("Estado")),
                    apellidos=safe_str(al.get("Apellidos")),
                    nombre=safe_str(al.get("Nombre")),
                    edad=safe_str(al.get("Edad")),
                    nacimiento=safe_str(al.get("Nacimiento")),
                    repite=safe_str(al.get("Repite")),
                    matricula=safe_str(al.get("Matricula")),
                    comentarios=safe_str(al.get("Comentarios")),
                    email=safe_str(al.get("email")),
                    movil=safe_str(al.get("Movil"))
                )
                db.add(new_al)
                total_students += 1

        # Migrate Evaluations
        df_eval = data.get("df_eval", [])
        if isinstance(df_eval, list):
            for ev in df_eval:
                student_id = safe_str(ev.get("ID"))
                eval_data = {k: v for k, v in ev.items() if k != "ID"}
                new_ev = StudentEvaluation(
                    module_document_id=doc.id,
                    student_id=student_id,
                    eval_data=eval_data
                )
                db.add(new_ev)
                total_evals += 1

    try:
        db.commit()
        print("\nMigration completed successfully!")
        print(f"Total UDs: {total_uds}")
        print(f"Total Sessions: {total_sessions}")
        print(f"Total Students: {total_students}")
        print(f"Total Evaluations: {total_evals}")
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    main()
