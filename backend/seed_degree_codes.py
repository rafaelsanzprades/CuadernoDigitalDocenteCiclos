import sys
sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Degree, ProfessionalFamily

DEGREE_CODE_MAP: dict[str, dict[str, str]] = {
    "Electricidad y Electrónica": {
        "Instalaciones de Telecomunicaciones": "ELE203",
    },
}

def seed_degree_codes():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    updated = 0

    for family_name, degrees in DEGREE_CODE_MAP.items():
        family = db.query(ProfessionalFamily).filter(
            ProfessionalFamily.name.ilike(f"%{family_name}%")
        ).first()
        if not family:
            print(f"  ⚠️ Familia no encontrada: {family_name}")
            continue
        for degree_name, code in degrees.items():
            degree = db.query(Degree).filter(
                Degree.family_id == family.id,
                Degree.name.ilike(f"%{degree_name}%"),
            ).first()
            if not degree:
                print(f"  ⚠️ Degree no encontrado: {degree_name} en {family_name}")
                continue
            if degree.code != code:
                degree.code = code
                updated += 1
                print(f"  ✔️ {degree_name} → {code}")

    db.commit()
    db.close()
    print(f"✅ {updated} degrees actualizados con código.")

if __name__ == "__main__":
    seed_degree_codes()
