import sys
import os
sys.path.append(os.path.abspath(r"C:\GD-rsp\APP\backend"))
import json
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import ProfessionalFamily, Degree, NivelFP

db = SessionLocal()
families = db.query(ProfessionalFamily).all()

familias_completas = []
for f in families:
    degrees_db = db.query(Degree).filter(Degree.family_id == f.id).all()
    degrees = []
    for d in degrees_db:
        level_str = d.level.name if hasattr(d.level, 'name') else str(d.level)
        
        if "BASICA" in level_str:
            level_code = "BASICA"
        elif "MEDIO" in level_str:
            level_code = "MEDIO"
        elif "SUPERIOR" in level_str:
            level_code = "SUPERIOR"
        else:
            level_code = "ESPECIALIZACION"

        degrees.append({
            "id": d.id,
            "name": d.name,
            "code": d.code or f"{f.code}-{d.id}",
            "level": level_code
        })
    
    familias_completas.append({
        "code": f.code,
        "name": f.name,
        "color_hex": f.color_hex,
        "icon_url": f.icon_url,
        "degrees": degrees
    })

output_ts = "export const familias_completas = " + json.dumps(familias_completas, indent=2, ensure_ascii=False) + ";\n\nexport function getFamiliesForApi() {\n  return familias_completas.map((f, i) => ({\n    id: i + 1,\n    code: f.code,\n    name: f.name,\n    color_hex: f.color_hex,\n    icon_url: f.icon_url,\n    degrees: f.degrees\n  }));\n}\n"

with open(r"C:\GD-rsp\APP\frontend\src\data\familiesData.ts", "w", encoding="utf-8") as file:
    file.write(output_ts)

print(f"Extracted {sum(len(f['degrees']) for f in familias_completas)} degrees across {len(familias_completas)} families.")
