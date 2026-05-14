import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Degree, ProfessionalFamily, NivelFP

def seed_degrees():
    # Asegurar que las tablas existen
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ciclos_superiores_todofp.json')
    
    with open(json_path, 'r', encoding='utf-8') as f:
        ciclos = json.load(f)

    inserted_count = 0
    missing_families = set()

    for ciclo in ciclos:
        family_name = ciclo.get('familia')
        degree_name = ciclo.get('ciclo')

        # Buscar la familia profesional en la BBDD
        family = db.query(ProfessionalFamily).filter(ProfessionalFamily.name.ilike(f"%{family_name}%")).first()
        
        if not family:
            missing_families.add(family_name)
            continue

        # Evitar duplicados
        existing_degree = db.query(Degree).filter_by(name=degree_name, family_id=family.id).first()
        if not existing_degree:
            new_degree = Degree(
                family_id=family.id,
                level=NivelFP.SUPERIOR,
                name=degree_name,
                hours=2000 # Por defecto para Grado Superior suele ser 2000
            )
            db.add(new_degree)
            inserted_count += 1

    db.commit()
    db.close()
    
    print(f"✅ Se han guardado {inserted_count} Ciclos Formativos de Grado Superior en la BBDD.")
    if missing_families:
        print(f"⚠️ Atención: No se encontraron las siguientes familias en la BBDD (revisa los nombres): {missing_families}")

if __name__ == "__main__":
    seed_degrees()
