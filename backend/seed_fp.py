import sys
sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Titularidad, NivelFP, ProfessionalFamily, Degree, Center, Region, Province, City

def seed():
    # Asegurar que las tablas existen
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Iniciando seeder de Formación Profesional...")

    # 1. Región y Provincias
    region = db.query(Region).filter_by(name="Aragón").first()
    if not region:
        region = Region(name="Aragón")
        db.add(region)
        db.commit()
    
    # 2. Familias Profesionales (Muestra con iconos)
    familias_data = [
        {"code": "IFC", "name": "Informática y Comunicaciones", "icon_url": "https://eligetuprofesion.aragon.es/wp-content/uploads/2021/05/INFORMATICA.svg", "color_hex": "#1abc9c"},
        {"code": "SAN", "name": "Sanidad", "icon_url": "https://eligetuprofesion.aragon.es/wp-content/uploads/2021/05/SANIDAD.svg", "color_hex": "#e74c3c"},
        {"code": "COM", "name": "Comercio y Marketing", "icon_url": "https://eligetuprofesion.aragon.es/wp-content/uploads/2021/05/COMERCIO.svg", "color_hex": "#f1c40f"},
        {"code": "HOT", "name": "Hostelería y Turismo", "icon_url": "https://eligetuprofesion.aragon.es/wp-content/uploads/2021/05/HOSTELERIA.svg", "color_hex": "#e67e22"},
        {"code": "ELE", "name": "Electricidad y Electrónica", "icon_url": "https://eligetuprofesion.aragon.es/wp-content/uploads/2021/05/ELECTRICIDAD.svg", "color_hex": "#f39c12"},
        {"code": "ADG", "name": "Administración y Gestión", "icon_url": "https://eligetuprofesion.aragon.es/wp-content/uploads/2021/05/ADMINISTRACION.svg", "color_hex": "#3498db"}
    ]

    for f in familias_data:
        if not db.query(ProfessionalFamily).filter_by(code=f["code"]).first():
            db.add(ProfessionalFamily(**f))
            print(f"✔️ Añadida Familia Profesional: {f['name']}")
    db.commit()

    # 3. Ejemplo de Títulos (Grado Superior en Aragón)
    ifc = db.query(ProfessionalFamily).filter_by(code="IFC").first()
    if ifc and not db.query(Degree).filter_by(name="Desarrollo de Aplicaciones Web").first():
        daw = Degree(family_id=ifc.id, level=NivelFP.SUPERIOR, name="Desarrollo de Aplicaciones Web", hours=2000, code="IFC302")
        dam = Degree(family_id=ifc.id, level=NivelFP.SUPERIOR, name="Desarrollo de Aplicaciones Multiplataforma", hours=2000, code="IFC301")
        db.add_all([daw, dam])
        print("✔️ Añadidos Títulos de Informática (DAW y DAM)")
    db.commit()

    ele = db.query(ProfessionalFamily).filter_by(code="ELE").first()
    if ele and not db.query(Degree).filter_by(name="Instalaciones de Telecomunicaciones").first():
        it = Degree(family_id=ele.id, level=NivelFP.MEDIO, name="Instalaciones de Telecomunicaciones", hours=2000, code="ELE203")
        db.add(it)
        print("✔️ Añadido Título de Electricidad: Instalaciones de Telecomunicaciones")
    db.commit()

    # 4. Centros Educativos (Con Titularidad)
    if not db.query(Center).filter_by(code="50011500").first():
        c1 = Center(code="50011500", name="IES Fray Luis de León", titularity=Titularidad.PUBLICA)
        c2 = Center(code="50000001", name="Colegio San Valero", titularity=Titularidad.CONCERTADA)
        c3 = Center(code="50000002", name="Academia Técnica Privada", titularity=Titularidad.PRIVADA)
        db.add_all([c1, c2, c3])
        print("✔️ Añadidos Centros Educativos de ejemplo (Público, Concertado y Privado)")
    db.commit()

    print("\n✅ Base de datos inicializada correctamente. ¡Estructura relacional lista!")
    db.close()

if __name__ == "__main__":
    seed()
