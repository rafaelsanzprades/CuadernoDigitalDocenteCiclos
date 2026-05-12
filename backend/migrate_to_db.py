"""
One-time migration script: reads JSON files and inserts them into the DB.
Usage:
  Local SQLite:    python migrate_to_db.py
  Remote Postgres: $env:DATABASE_URL="postgresql://..." ; python migrate_to_db.py
"""
import os
import json
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base
from models import ModuleDocument

# JSON files must be in the repo root (parent of backend/)
DATA_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def migrate_data():
    print(f"DB target: {os.environ.get('DATABASE_URL', 'sqlite (local)')}")
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    files = [f for f in os.listdir(DATA_DIR) if f.endswith(".json") and f != "ciclos-fp.json"]

    if not files:
        print("No JSON files found in", DATA_DIR)
        db.close()
        return

    for filename in files:
        file_path = os.path.join(DATA_DIR, filename)
        module_id = filename.replace(".json", "")

        try:
            with open(file_path, "r", encoding="utf-8-sig") as f:
                content = f.read().replace("NaN", "null")
                data = json.loads(content)

            existing = db.query(ModuleDocument).filter(ModuleDocument.id == module_id).first()
            if existing:
                print(f"  Updating {module_id}...")
                existing.data = data
            else:
                print(f"  Inserting {module_id}...")
                db.add(ModuleDocument(id=module_id, data=data))

        except Exception as e:
            print(f"  ERROR processing {filename}: {e}")

    db.commit()
    db.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate_data()
