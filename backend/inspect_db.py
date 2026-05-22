import os
import sys

_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from database import SessionLocal
from models import ModuleDocument

db = SessionLocal()
docs = db.query(ModuleDocument).all()

for doc in docs:
    data = doc.data
    if doc.id.endswith("-pd"):
        print("--- PD DATA ---")
        for key in ["df_ra", "df_ce", "df_act", "df_pr", "df_tareas", "df_ace", "df_dua", "df_contingencia"]:
            if key in data and data[key] and isinstance(data[key], list):
                print(f"{key} keys: {data[key][0].keys()}")
        for key in ["info_modulo", "info_fechas", "horario", "planning_ledger"]:
            if key in data and isinstance(data[key], dict):
                print(f"{key} keys: {list(data[key].keys())}")
        break

for doc in docs:
    data = doc.data
    if "-curso" in doc.id:
        print("--- CURSO DATA ---")
        for key in ["df_feoe", "df_sgmt"]:
            if key in data and data[key] and isinstance(data[key], list):
                print(f"{key} keys: {data[key][0].keys()}")
        for key in ["daily_ledger"]:
            if key in data and isinstance(data[key], dict):
                print(f"{key} sample keys: {list(data[key].keys())[:5]}")
        break
